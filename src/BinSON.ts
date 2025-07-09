
// Original BiSON Copyright (c) 2009-2012 Ivo Wetzel.

let START_INDEX = 0;

const maskTable:number[] = [];
const powTable:number[] = [];
const reversePowTable:number[] = [];

for(let f = 0; f < 9; f++) {
  powTable.push(Math.pow(2, f) - 1);
  maskTable.push(~(powTable[f] ^ 0xFF));
  reversePowTable.push(Math.pow(10, f));
}

let bitStream:Buffer | Uint8Array;
let decodeBitstream:Buffer | Uint8Array;
let bitValue = 0;
let bitsLeft = 8;
let streamIndex = START_INDEX;
let POS = START_INDEX;
let errorHandler = function(msg:string,data:any){
  logHandler('Error: ' + msg);
}
let logHandler = function(...args:any[]){
  (<any>globalThis)['cons' + 'ole'].log(...args);
}

const write = function(val:number, count:number) {
  const overflow = count - bitsLeft,
    use = bitsLeft < count ? bitsLeft : count,
    shift = bitsLeft - use;
  if (overflow > 0) {
    bitValue += val >> overflow << shift;
  } else {
    bitValue += val << shift;
  }
  bitsLeft -= use;
  if (bitsLeft === 0) {
    bitStream[POS++] = bitValue;
    bitsLeft = 8;
    bitValue = 0;
    if (overflow > 0) {
      bitValue += (val & powTable[overflow]) << (8 - overflow);
      bitsLeft -= overflow;
    }
  }
}

const read = function(count:number) {
  const overflow = count - bitsLeft;
  const use = bitsLeft < count ? bitsLeft : count;
  const shift = bitsLeft - use;
  // Wrap bits over to next byte
  let val = (bitValue & maskTable[bitsLeft]) >> shift;
  bitsLeft -= use;
  if (bitsLeft === 0) {
    bitValue = decodeBitstream[++streamIndex];
    bitsLeft = 8;
    if (overflow > 0) {
      val = val << overflow | ((bitValue & maskTable[bitsLeft]) >> 8 - overflow);
      bitsLeft -= overflow;
    }
  }
  if (streamIndex > decodeBitstream.length) {
    return 7;
  }
  return val;
}

const _encode = function(value:any, top:boolean) {
  // Numbers
  if (typeof value === 'number') {
    if (isNaN(value)) {
      errorHandler('Numberic value is isNaN.', value);
      value = 0;
    }
    // divided by 10, because thats the step. we do value * step then | 0, which fails if > int_MAX
    const type = value % 1 === 0 || value > 2147483648 / 10 || value < -2147483648 / 10 ? 0 : 1;
    let sign = 0;
    if (value < 0) {
      value = -value;
      sign = 1;
    }
    write(1 + type, 3);
    // Float
    let shift = 0;
    if (type) {
      let step = 10, m = value, tmp = 0;
      shift = 0;
      // Figure out the exponent
      do {
        m = value * step;
        step *= 10;
        shift++;
        tmp = m | 0;
      } while (m - tmp > 1 / step && shift < 8 && m < 214748364);
      // Correct if we overshoot
      step = tmp / 10;
      if (step === (step | 0)) {
        tmp = step;
        shift--;
      }
      value = tmp;
    }
    // 2 size 0-3: 0 = < 16 1 = < 256 2 = < 65536 3 >=
    if (value < 2) {
      write(value, 4);
    }
    else if (value < 16) {
      write(1, 3);
      write(value, 4);
    }
    else if (value < 256) {
      write(2, 3);
      write(value, 8);
    }
    else if (value < 4096) {
      write(3, 3);
      write(value >> 8 & 0xff, 4);
      write(value & 0xff, 8);
    }
    else if (value < 65536) {
      write(4, 3);
      write(value >> 8 & 0xff, 8);
      write(value & 0xff, 8);
    }
    else if (value < 1048576) {
      write(5, 3);
      write(value >> 16 & 0xff, 4);
      write(value >> 8 & 0xff, 8);
      write(value & 0xff, 8);
    }
    else if (value < 2147483648) {
      write(6, 3);
      write(value >> 24 & 0xff, 8);
      write(value >> 16 & 0xff, 8);
      write(value >> 8 & 0xff, 8);
      write(value & 0xff, 8);
    }
    else {
      write(7, 3);
      const high = (value / 2147483648) | 0;
      const low = (value % 2147483648) | 0;
      write(high >> 24 & 0xff, 8);
      write(high >> 16 & 0xff, 8);
      write(high >> 8 & 0xff, 8);
      write(high >> 0 & 0xff, 8);
      write(low >> 24 & 0xff, 8);
      write(low >> 16 & 0xff, 8);
      write(low >> 8 & 0xff, 8);
      write(low >> 0 & 0xff, 8);
    }
    write(sign, 1);
    if (type) {
      write(shift, 4);
    }
  }
  else if (typeof value === 'string') {
    const len = value.length;
    write(3, 3);
    if (len > 65535) {
      write(31, 5);
      write(len >> 24 & 0xff, 8);
      write(len >> 16 & 0xff, 8);
      write(len >> 8 & 0xff, 8);
      write(len & 0xff, 8);
    }
    else if (len > 255) {
      write(30, 5);
      write(len >> 8 & 0xff, 8);
      write(len & 0xff, 8);
    }
    else if (len > 28) {
      write(29, 5);
      write(len, 8);
    }
    else {
      write(len, 5);
    }
    // Write a raw string to the stream
    if (bitsLeft !== 8) {
      bitStream[POS++] = bitValue;
      bitValue = 0;
      bitsLeft = 8;
    }
    for (let i = 0; i < len; i++)
      bitStream[POS++] = value.charCodeAt(i);
  }
  else if (typeof value === 'boolean') {
    write(+value, 4);
  }
  else if (value === null || value === undefined || typeof value === 'function') {
    write(7, 3);
    write(0, 1);
  }
  else if (value instanceof Array) {
    write(4, 3);
    write(0, 1);
    for (let i = 0, l = value.length; i < l; i++) {
      _encode(value[i], false);
    }
    if (!top) {
      write(6, 3);
    }
  }
  else if (value instanceof Set) {
    write(4, 3);
    write(1, 1);
    value.forEach((v:any) => {
      _encode(v, false);
    });
    if (!top) {
      write(6, 3);
    }
  }
  else if (value instanceof Map) {
    write(5, 3);
    write(1, 1);
    value.forEach((v:any,i:any) => {
      _encode(i, false);
      _encode(v, false);
    });
    if (!top) {
      write(6, 3);
    }
  } else {
    write(5, 3);
    write(0, 1);
    for (const e in value) {
      if(typeof value[e] === 'function')
        continue;
      _encode(e, false);
      _encode(value[e], false);
    }
    if (!top) {
      write(6, 3);
    }
  }
}

export interface BinSONOptions {
  bufferSize?:number;
  startOffset?:number;
  Buffer?:any;
  errorHandler?:(msg:string,data:any) => void;
  logHandler?:(...args:any[]) => void;
}

export class BinSON {
  static isInit = false;
  static init(param?:BinSONOptions){
    if(BinSON.isInit)
      return;
    BinSON.isInit = true;
    param = param || {};
    const bufferSize = param.bufferSize || 100000;
    const startOffset = param.startOffset || 0;
    errorHandler = param.errorHandler || errorHandler;
    logHandler = param.logHandler || logHandler;

    START_INDEX = startOffset;

    if(param.Buffer) //aka server
      bitStream = param.Buffer.alloc(bufferSize);
    else if(typeof Uint8Array !== 'undefined'){
      bitStream = new Uint8Array(bufferSize);
    } else
      bitStream = <any>new Array(bufferSize);
    //unitTest();
    return BinSON;
  }

  static encode(value:any) {
    try {
      bitsLeft = 8;
      bitValue = 0;

      POS = START_INDEX;

      _encode(value, true);
      write(7, 3);
      write(1, 1);
      if (bitValue > 0) {
        bitStream[POS++] = bitValue;
      }
      if(POS > bitStream.length)
        errorHandler('Trying to send package larger than the buffer size. Increase via bufferSize parameter. Package size= ' + POS,null);
      return bitStream.slice(0,POS);
    } catch(err){
      errorHandler('Unknown error',value);
      return bitStream.slice(0,1);
    }
  }
  private static _encode(data:any){
    return _encode(data, true); //debug
  }
  static decode(data:Uint8Array) {
    const d = BinSON._decode(data);
    return d;
  }
  static _decode(data:Uint8Array) {
    const stack:any[] = [];
    let i = -1;
    let decoded:any;
    let type:number;
    let top:any;
    let value:any;
    let getKey = false;
    let key:any;
    let isObj = false;
    bitsLeft = 8;
    streamIndex = START_INDEX;
    decodeBitstream = data;
    bitValue = decodeBitstream[streamIndex];
    while (true) {
      // Grab type
      type = read(3);
      switch (type) {
        // Bool
        case 0:
          value = read(1) ? true : false;
          break;
        // EOS / Stream Overrun / Null
        case 7:
          switch (read(1)) {
            case 1:
              return decoded;
            case 7:
              return undefined;
            default:
              value = null;
          }
          break;
        // Integer / Float
        case 1:
        case 2:
          switch (read(3)) {
            case 0:
              value = read(1);
              break;
            case 1:
              value = read(4);
              break;
            case 2:
              value = read(8);
              break;
            case 3:
              value = (read(4) << 8)
                + read(8);
              break;
            case 4:
              value = (read(8) << 8)
                + read(8);
              break;
            case 5:
              value = (read(4) << 16)
                + (read(8) << 8)
                + read(8);
              break;
            case 6:
              value = (read(8) << 24)
                + (read(8) << 16)
                + (read(8) << 8)
                + read(8);
              break;
            case 7: {
              const high = (read(8) << 24)
              + (read(8) << 16)
              + (read(8) << 8)
              + read(8);
              const low = (read(8) << 24)
              + (read(8) << 16)
              + (read(8) << 8)
              + read(8);
              value = high * 2147483648 + low;
              break;
            }
          }
          if (read(1)) {
            value = -value;
          }
          if (type === 2) {
            value /= reversePowTable[read(4)];
          }
          if (getKey) {
            key = value;
            getKey = false;
            continue;
          }
          break;
        // String
        case 3: {
          let size = read(5);
          switch (size) {
            case 31:
              size = (read(8) << 24)
                + (read(8) << 16)
                + (read(8) << 8)
                + read(8);
              break;
            case 30:
              size = (read(8) << 8)
                + read(8);
              break;
            case 29:
              size = read(8);
              break;
          }
          // Read a raw string from the stream
          if (bitsLeft !== 8) {
            streamIndex++;
            bitValue = 0;
            bitsLeft = 8;
          }
          const stringArr = new Uint8Array(decodeBitstream.buffer, streamIndex, size);
          value = String.fromCharCode.apply(null, <number[]><any>stringArr); //BAD but faster
          streamIndex += size;
          bitValue = decodeBitstream[streamIndex];
          if (getKey) {
            key = value;
            getKey = false;
            continue;
          }
          break;
        }
        // Open Array / Objects
        case 4:
        case 5:
          getKey = type === 5;
          value = read(1)
            ? (getKey ? new Map() : new Set())
            : (getKey ? {} : []);
          if (decoded === undefined) {
            decoded = value;
          }
          else {
            if (isObj) {
              if(top instanceof Map){
                top.set(key,value);
              } else
                top[key] = value;
            }
            else {
              if(top instanceof Set)
                top.add(value);
              else
                top.push(value);
            }
          }
          top = stack[++i] = value;
          isObj = getKey;
          continue;
        // Close Array / Object
        case 6:
          top = stack[--i];
          getKey = isObj = !(top instanceof Array || top instanceof Set);
          continue;
      }
      // Assign value to top of stack or return value
      if (isObj) {
        if(top instanceof Map)
          top.set(key,value);
        else
          top[key] = value;
        getKey = true;
      }
      else if (top !== undefined) {
        if(top instanceof Set)
          top.add(value);
        else
          top.push(value);
      }
      else {
        return value;
      }
    }
  }

  //note: JSON.stringify doesnt support map or set.
  static compareSize(obj:any){
    return (1 - BinSON.encode(obj).length/JSON.stringify(obj).length)*100 + '% smaller';
  }

  static compareSpeed(obj:any,count=100){
    let start = Date.now();
    for(let i = 0; i < count; i++){
      JSON.stringify(obj);
    }
    const json = Date.now()-start;

    start = Date.now();
    for(let i = 0; i < count; i++){
      BinSON.encode(obj);
    }

    return 'x' + (Date.now()-start)/json + ' slower';
  }

  static dencode(obj:any){
    return BinSON.decode(BinSON.encode(obj));
  }
  static stringify(obj:any){
    const a = BinSON.encode(obj);
    let str = '';
    for(let i = 0; i < a.length; i += 10000) //cant do full array because stack overflow
      str += String.fromCharCode.apply(this, <number[]><any>a.slice(i,i + 10000)); //bad but faster
    return str;
  }
  static parse(str:string){
    const d = new Uint8Array(str.length);
    for(let i = 0; i < str.length; i++)
      d[i] = str.charCodeAt(i);
    return BinSON.decode(d);
  }
  static isEncodable(str:string){
    return this.dencode(str) === str; //ex: special space 12288
  }
}

const unitTest = function(){
  const assert = (id:number,t:boolean) => {
    if(!t)
      throw new Error(''+id);
  }

  const map = new Map();
  map.set(10,'aaa');
  map.set(64363,{b:123});

  const set = new Set();
  set.add(1232);
  set.add(43);

  const obj = {
    x:1000,
    y:1000,
    map:map,
    set:set,
    b:{
      c:[
        'asdasd',
        1,
        null,
        [
          10
        ]
      ],
      d:{
        h:'asdasdas'
      },
      e:<any>null
    }
  }
  const res = BinSON.dencode(obj);
  assert(0,res.x === 1000);
  assert(0.1,res.b.c[0] === 'asdasd');
  assert(0.2,res.b.e === null);
  assert(0.3,res.b.c[3][0] === 10);
  assert(0.4,res.map.has(10));
  assert(0.5,res.map.get(64363).b === 123);
  assert(0.6,res.set.has(43));
}