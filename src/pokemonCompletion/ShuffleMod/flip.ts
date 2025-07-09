//author: https://www.smwcentral.net/?p=profile&id=1686
//smc support by randomdude999 (https://smwc.me/u/32552)
//Credits: https://media.smwcentral.net/Alcaro/bps/

// create patch: https://www.marcrobledo.com/RomPatcher.js/

export function crc32(bytes:Uint8Array) {
  let c;
  let crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  let crc = 0 ^ -1;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

export function applyBps(rom:Uint8Array, patch:Uint8Array) : [string, null] | [null, Uint8Array] {
  let patchpos = 0;
  function u8() {
    return patch[patchpos++];
  }
  function u32at(pos:number) {
    return (
      ((patch[pos + 0] << 0) |
        (patch[pos + 1] << 8) |
        (patch[pos + 2] << 16) |
        (patch[pos + 3] << 24)) >>>
      0
    );
  }

  function decode() {
    let ret = 0;
    let sh = 0;
    while (true) {
      let next = u8();
      ret += (next ^ 0x80) << sh;
      if (next & 0x80) return ret;
      sh += 7;
    }
  }

  function decodes() {
    let enc = decode();
    let ret = enc >> 1;
    if (enc & 1) ret = -ret;
    return ret;
  }

  if (u8() != 0x42 || u8() != 0x50 || u8() != 0x53 || u8() != 0x31)
    return ["Internal error: not a BPS patch", null];

  if (decode() != rom.length)
    return ["Error: Wrong game file.", null];

  if (crc32(rom) != u32at(patch.length - 12))
    return ["Error: Wrong game file.", null];

  let out = new Uint8Array(decode());
  let outpos = 0;

  let metalen = decode();
  patchpos += metalen; // can't join these two, JS reads patchpos before calling decode

  let SourceRead = 0;
  let TargetRead = 1;
  let SourceCopy = 2;
  let TargetCopy = 3;

  let inreadpos = 0;
  let outreadpos = 0;

  while (patchpos < patch.length - 12) {
    let thisinstr = decode();
    let len = (thisinstr >> 2) + 1;
    let action = thisinstr & 3;

    switch (action) {
      case SourceRead:
        {
          for (let i = 0; i < len; i++) {
            out[outpos] = rom[outpos];
            outpos++;
          }
        }
        break;
      case TargetRead:
        {
          for (let i = 0; i < len; i++) {
            out[outpos++] = u8();
          }
        }
        break;
      case SourceCopy:
        {
          inreadpos += decodes();
          for (let i = 0; i < len; i++) out[outpos++] = rom[inreadpos++];
        }
        break;
      case TargetCopy:
        {
          outreadpos += decodes();
          for (let i = 0; i < len; i++) out[outpos++] = out[outreadpos++];
        }
        break;
    }
  }

  return [null, out];
}
