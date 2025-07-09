/** This modules doesnt have dependency with RC. */
/** RC depend code goes in Socket.ts or App_private */

import type http from "http";
import type wsLib from "ws";

export interface Encoder {
  decode:(data:any) => any;
  encode:(data:any) => Uint8Array;
}

export interface IWsDosProtectByIp {
  onConnection:(ip:string) => boolean;
  onDisconnect:(ip:string, connectionDur:number, downloadBytes:number, uploadBytes:number) => void;
}

export interface wsServer_Options {
  errorHandler:(err:Error) => void,
  wsDosProtectByIp?:IWsDosProtectByIp;
}

export interface io_SocketOptions {
  encoder:Encoder,
  uploadBytesLimit?:{ total:number,perMinute:number};
  downloadBytesLimit?:{ total:number,perMinute:number};
  onConnection:(socket:io_Socket) => void;
  maxMessageByteSize?:number
}

/** cant alter this. comes from ws library */
export interface ws_connection {
  on:(what:'message' | 'close',cb:(d:any) => void) => void;
  send:(data:Uint8Array) => void;
  /** will trigger eventOnConnectionLost, except if dontCallDisconnectEventFor is set */
  close:() => void;
  onclose:() => void;
  _socket:{remoteAddress:string}; //onvalid on connection
  readyState:number;
  OPEN:number;
  upgradeReq:{connection:{remoteAddress:string},headers:DictObj<string>};
}

let hasMsgError = false;

export class io_Socket {
  connectionServer:ws_connection | null = null;
  connectionClient:WebSocket | null = null;
  private connectionBoth:ws_connection | WebSocket | null = null;
  private isReadyPromise:Promise<void> = undefined!
  private isReadyPromiseResolve:() => void = undefined!;

  eventOnData:Nullable<(what:number,data:any,rawDataByteSize:number) => void> = null;
  /** event called when the connection drops */
  private eventOnConnectionLost:Nullable<() => void> = null;

  /** in bytes */
  bandwidthDownload = 0;
  /** in bytes */
  bandwidthUpload = 0;

  /** server only */
  userAgent = '';
  /** server only */
  private ip = '';
  connectionTimestamp = 0;
  urlBeingSet:string | null = null;

  dontCallDisconnectEventFor:ws_connection | WebSocket | null = null;

  constructor(public onServer:boolean,public serverOptions:wsServer_Options, public socketOptions:io_SocketOptions){
    this.initNewReadyPromise();
  }
  setConnection(connection:ws_connection | WebSocket, ip=''){
    if(this.onServer){
      this.connectionServer = <ws_connection>connection;
      this.ip = ip;
      this.userAgent = this.connectionServer.upgradeReq
                        ? this.connectionServer.upgradeReq.headers['user-agent'] || '' : '';
    } else
      this.connectionClient = <WebSocket>connection;
    this.connectionBoth = connection;

    this.connectionTimestamp = Date.now();
    this.initializeOnMessage();
    this.initializeDisconnectListeners();
    this.socketOptions.onConnection(this);
  }
  myTry(f:() => void){
    try {
      f();
    } catch(err){
      this.disconnectLikeConnectionLost();  // prevent DoS
      if (!hasMsgError){ //only log the first error
        hasMsgError = true;
        this.serverOptions.errorHandler(err);
      }
    }
  }
  hasReachedBandwidthLimit(minuteOnline?:number){
    if(minuteOnline === undefined){
      minuteOnline = (Date.now() - this.connectionTimestamp) / 60000;
      if (minuteOnline < 60000)
        minuteOnline = 60000; /// at least 1 min
    }

    if(!this.socketOptions.downloadBytesLimit || !this.socketOptions.uploadBytesLimit)
      return false;
    return this.bandwidthDownload > this.socketOptions.downloadBytesLimit.total
        || this.bandwidthDownload / minuteOnline > this.socketOptions.downloadBytesLimit.perMinute
        || this.bandwidthUpload > this.socketOptions.uploadBytesLimit.total
        || this.bandwidthUpload / minuteOnline > this.socketOptions.uploadBytesLimit.perMinute;
  }
  private initializeOnMessage(){
    const onMessage = (msgBin:Uint8Array) => {
      const what = msgBin[0];
      if(this.socketOptions.maxMessageByteSize && msgBin.length > this.socketOptions.maxMessageByteSize)
        throw new Error(`msgBin.length ${msgBin.length} > this.params.maxMessageByteSize`);

      const data = this.socketOptions.encoder.decode(msgBin);
      if(data === undefined)
        throw new Error('invalid message');
      if(this.eventOnData)
        this.eventOnData(what, data, msgBin.length);
    };

    if(this.connectionServer){
      this.connectionServer.on('message', (data) => {
        this.myTry(() => {
          const byteLength = (<ArrayBuffer>data).byteLength;
          this.bandwidthDownload += byteLength;

          if (this.socketOptions.downloadBytesLimit && this.bandwidthDownload > this.socketOptions.downloadBytesLimit.total){
            if (this.bandwidthDownload > this.socketOptions.downloadBytesLimit.total * 2)
              this.disconnectLikeConnectionLost(); //prevent DoS. will trigger onConnectionLost which will cleanly log of player
            return;
          }

          onMessage(new Uint8Array(<ArrayBuffer>data)); //doesnt create a copy, so performant
        });
      });
    } else if(this.connectionClient) {
      this.connectionClient.onmessage = (ev) => {
        this.myTry(() => {
          const d = new Uint8Array(ev.data);
          this.bandwidthDownload += d.byteLength;
          onMessage(d);
        });
      };
    }
  }
  private initializeDisconnectListeners(){
    const ondisconnect = () => {
      if(this.connectionBoth === null)
        return;
      this.myTry(() => {
        const isConnectionLost = this.connectionBoth !== this.dontCallDisconnectEventFor;
        if(isConnectionLost && this.eventOnConnectionLost)
          this.eventOnConnectionLost();
      });
      this.connectionServer = null;
      this.connectionClient = null;
      this.connectionBoth = null;
      this.dontCallDisconnectEventFor = null;
      if(this.serverOptions.wsDosProtectByIp)
        this.serverOptions.wsDosProtectByIp.onDisconnect(this.ip, Date.now() - this.connectionTimestamp, this.bandwidthDownload, this.bandwidthUpload);
    };

    if(this.connectionServer)
      this.connectionServer.on('close', ondisconnect);
    else if(this.connectionClient)
      this.connectionClient.onclose = ondisconnect;
  }


  isReady(){
    return !!this.connectionBoth && this.connectionBoth.readyState === this.connectionBoth.OPEN;
  }
  emit(id:number,data:any){
    if(!this.isReady())
      return false;
    const msgBin = this.socketOptions.encoder.encode(data);
    msgBin[0] = id;
    this.bandwidthUpload += msgBin.length;

    if(this.connectionServer)
      this.connectionServer.send(msgBin);
    else if (this.connectionClient)
      this.connectionClient.send(msgBin);
    else
      return false;

    return true;
  }
  getIp(){
    return this.ip;
  }
  /** only triggered on connection lost. not called if disconnect was intentional */
  setOnConnectionLost(f:() => void){
    this.eventOnConnectionLost = f;
  }
  setOnData(f:(what:number,data:any,rawDataByteSize:number) => void){
    this.eventOnData = f;
  }
  /* disconnect the websocket, without triggered onConnectionLost event (which would cause an infinite loop */
  disconnectWithoutConnectionLostEvent(){
    if(!this.connectionBoth)
      return;
    this.dontCallDisconnectEventFor = this.connectionBoth;
    this.connectionBoth.close();
  }
  disconnectLikeConnectionLost(){
    if(!this.connectionBoth)
      return;
    this.connectionBoth.close();
  }
  async awaitSocketReady(){
    await this.isReadyPromise;
    await this.isReadyPromise; //in case changed url inbetween
  }

  private initNewReadyPromise(){
    this.isReadyPromise = new Promise<void>(resolve => {
      this.isReadyPromiseResolve = resolve;
    });
  }
  /**client*/
  static myWebSocket:typeof WebSocket | null = null;
  async setUrlOnClient(url:string){
    this.urlBeingSet = url;
    this.disconnectWithoutConnectionLostEvent();

    this.initNewReadyPromise();

    if(!io_Socket.myWebSocket)
      io_Socket.myWebSocket = WebSocket; // new WebSocket()

    return new Promise<boolean>(resolve => {
      try {
        const connection = new io_Socket.myWebSocket!(url,"echo-protocol");
        connection.binaryType = "arraybuffer";
        connection.onopen = () => {
          connection.onerror = null;
          this.urlBeingSet = null;
          resolve(true);
          this.setConnection(connection);
          this.isReadyPromiseResolve();
        }
        connection.onerror = () => {
          connection.onopen = null;
          this.urlBeingSet = null;
          resolve(false);
        }
      } catch (err){
        this.urlBeingSet = null;
        resolve(false);
      }
    });
  }
}

export class wsBinary { //used by server to handle multiple connections to client
  static getIp(req:http.IncomingMessage){
    let ip = req.headers['x-forwarded-for'];
    if(!ip){
      if(req.connection)
        return req.connection.remoteAddress || '';
      return '';
    }
    if (Array.isArray(ip))
      ip = ip[0];
    return ip.split(',')[0];
  }

  static getSocketOptions:((req:http.IncomingMessage) => io_SocketOptions | null)[] = [];

  static async initServer(ws:typeof wsLib, httpServer:http.Server,serverOptions:wsServer_Options){
    const wsServer = new ws.Server({
      server: httpServer,
    });

    wsServer.on('connection', (connection, req) => {
      //connection.upgradeReq has many properties
      try {
        const ip = wsBinary.getIp(req);
        if (serverOptions.wsDosProtectByIp){
          if (!serverOptions.wsDosProtectByIp.onConnection(ip)){
            connection.close();
            return;
          }
        }

        let socketOptions:io_SocketOptions | null = null;
        for (const func of wsBinary.getSocketOptions){
          socketOptions = func(req);
          if (socketOptions)
            break;
        }
        if (!socketOptions){
          serverOptions.errorHandler(new Error('none of getSocketOptions matches'));
          return;
        }

        const socket = new io_Socket(true, serverOptions, socketOptions);
        socket.setConnection(<any>connection, ip);
      } catch(err){
        serverOptions.errorHandler(err);
      }
    });
  }
}


