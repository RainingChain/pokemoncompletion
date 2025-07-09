import { io_Socket, wsBinary } from "../wsBinary";
import { BinSON } from "../BinSON";
import type {App} from "../App";

export class MgbaMsg {
  constructor(public mgbaId:number, public data:string){}

  static create(params:{mgbaId:string}, data:string){
    if (typeof data !== 'string')
      return null;
    if (data.length > MAX_MSG_LENGTH)
      return null;
    if(typeof params !== 'object' || !params)
      return null;

    const mgbaId = +params.mgbaId;
    if (isNaN(mgbaId))
      return null;
    return new MgbaMsg(mgbaId, data);
  }
}

const enum MSG {
  fromMgba,
  fromServer,
}

const MAX_MSG_LENGTH = 20000;

export class PkBattleTowerServer {
  constructor(public app:App){}

  static instance:PkBattleTowerServer = null!;
  static init(app:App){
    PkBattleTowerServer.instance = new PkBattleTowerServer(app);

    const MB = 1000000;
    wsBinary.getSocketOptions.unshift((req) => {
      const mgbaId = (() => {
        if (typeof req.url !== 'string' || !req.url.includes('handler=pkAssistant'))
          return null;
        const mgbaIdStr = req.url.match(/mgbaId=(\d+)/);
        if(!mgbaIdStr)
          return null;
        const mgbaId = +mgbaIdStr[1];
        if(isNaN(mgbaId))
          return null;
        return mgbaId;
      })();
      if(mgbaId === null){
        PkBattleTowerServer.instance.log('failed to extract mgbaId');
        return null;
      }

      return {
        encoder:BinSON,
        uploadBytesLimit:{ total:20 * MB,perMinute:2 * MB},
        downloadBytesLimit:{ total:50 * MB,perMinute:3 * MB},
        onConnection(socket){
          const pkSocket = new PkSocket(socket, mgbaId);
          PkBattleTowerServer.instance.onBrowserConnection(pkSocket);
        },
        maxMessageByteSize:0.1 * MB,
      }
    });


    app.get("/BattleFacilities/Emerald/Assistant/mGBA_debug/:mgbaId", (req,res) => {
      const buffer = PkBattleTowerServer.instance.bufferByMgbaId.get(+req.params.mgbaId);
      res.send(JSON.stringify(buffer || 'No data'));
    });

    app.post("/BattleFacilities/Emerald/Assistant/mGBA/:mgbaId", (req,res) => {
      try {
        PkBattleTowerServer.instance.onDataReceivedFromMgba(req.params, req.body);
      } catch(err){
        PkBattleTowerServer.instance.log(err);
      }
      res.end();
    });

  }
  log(...args:any[]){
    if(!this.app.appConfig.ON_PRODUCTION_SERVER)
      console['log'](...args);
  }
  onBrowserConnection(socket:PkSocket){
    socket.ioSocket.eventOnData = (what, data) => {
      this.onDataReceivedFromBrowser(what, data);
    };
    socket.ioSocket.connectionServer?.on('close', () => {
      this.onSocketClosed(socket);
    });
    this.log('onConnection',socket.mgbaId);

    const oldSocket = this.socketByMgbaId.get(socket.mgbaId);
    if(oldSocket)
      oldSocket.ioSocket.emit(MSG.fromServer,`Another connection with the session id ${socket.mgbaId} was made.`);
    this.socketByMgbaId.set(socket.mgbaId, socket);

    const bufferMsg = this.bufferByMgbaId.get(socket.mgbaId);
    if(bufferMsg)
      socket.ioSocket.emit(MSG.fromMgba, bufferMsg);

    socket.ioSocket.emit(MSG.fromServer,`Connected to session id ${socket.mgbaId}.`);
  }

  onDataReceivedFromBrowser(what:number,data:any){
    //shouldn't occur.
    this.log('onDataReceivedFromBrowser', what, data);
  }
  onDataReceivedFromMgba(params:{mgbaId:string}, body:any){
    const mgbaMsg = MgbaMsg.create(params, body.data);
    if(!mgbaMsg)
      return;

    const socket = this.socketByMgbaId.get(mgbaMsg.mgbaId);

    if (this.bufferByMgbaId.size < 100) // prevent DDOS
      this.bufferByMgbaId.set(mgbaMsg.mgbaId, mgbaMsg.data);

    if(socket){
      if(socket.ioSocket.hasReachedBandwidthLimit()){
        socket.ioSocket.emit(MSG.fromServer, `Error: Too many messages were sent to the server. The connection has been ended.`);
        socket.ioSocket.disconnectLikeConnectionLost();
      } else
        socket.ioSocket.emit(MSG.fromMgba, mgbaMsg.data); //forward the data to the browser
      return;
    }

  }
  onSocketClosed(socket:PkSocket){
    this.socketByMgbaId.delete(socket.mgbaId);

    if(!this.app.appConfig.ON_PRODUCTION_SERVER)
      setTimeout(() => {
        this.bufferByMgbaId.delete(socket.mgbaId);
      }, 5*60*1000);
  }

  socketByMgbaId = new Map<number,PkSocket>();
  bufferByMgbaId = new Map<number,string>();
}

export class PkSocket {
  constructor(public ioSocket:io_Socket, public mgbaId:number){}
}



