
import * as DATA from "./RamPokemon_data";

const BlockPosition = [
    0,1,2,3,0,1,3,2,0,2,1,3,0,3,1,2,0,2,3,1,0,3,2,1,1,0,2,3,1,0,3,2,2,0,1,3,3,0,1,2,2,0,3,1,3,0,2,1,1,2,0,3,1,3,0,2,2,1,0,3,3,1,0,2,2,3,0,1,3,2,0,1,1,2,3,0,1,3,2,0,2,1,3,0,3,1,2,0,2,3,1,0,3,2,1,0,0,1,2,3,0,1,3,2,0,2,1,3,0,3,1,2,0,2,3,1,0,3,2,1,1,0,2,3,1,0,3,2,
];

export enum Gender {
  male,
  female,
  genderless,
}

export enum MonStatus {
  healthy = '',
  sleep = 'slp',
  poison = 'psn',
  burn = 'brn',
  freeze = 'frz',
  paralyze = 'par',
  badPoison ='tox',
};

export class RamPokemon {
  data:Uint8Array;
  dataView:DataView;

  battleDataView:DataView | null = null;

  static getPID(encryptedData:Uint8Array){
    return new DataView(encryptedData.buffer).getUint32(0, true);
  }
  static hasSamePID(encryptedData:Uint8Array, battleData:Uint8Array){
    const pid = RamPokemon.getPID(encryptedData);
    return pid === new DataView(battleData.buffer).getUint32(0x48, true);
  }
  /** battleData is null if it's not the active pokemon  */
  constructor(public encryptedData:Uint8Array, public battleData:Uint8Array | null){
    if (encryptedData.length !== 100)
      throw new Error(`encryptedData.length ${encryptedData.length} !== 100`);
    if (battleData && battleData.length !== 88)
      throw new Error(`battleData.length ${battleData.length} !== 88`);

    if(battleData)
      this.battleDataView = new DataView(battleData.buffer);

    this.data = new Uint8Array(this.encryptedData);
    this.dataView = new DataView(this.data.buffer);

    // C:\Users\samue\source\repos\PkCompletionist\PKHeX.Core\PKM\Util\PokeCrypto.cs

    const PID = this.dataView.getUint32(0, true);
    const OID = this.dataView.getUint32(4, true);

    const seed = (PID ^ OID) >>> 0;

    for (let i = 32; i < 80; i += 4){
      let uint = this.dataView.getUint32(i, true);
      this.dataView.setUint32(i, (uint ^ seed) >>> 0, true);
    }

    const dataCopy = new Uint8Array(this.data.length);

    dataCopy.set(this.data.slice(0, 32), 0);
    dataCopy.set(this.data.slice(80), 80);

    const sv = PID % 24;
    const index = sv * 4;
    for (let block = 3; block >= 0; block--){
      const ofs = BlockPosition[index + block];
      var destOfs = 32 + (12 * block);
      var srcOfs = 32 + (12 * ofs);

      dataCopy.set(this.data.slice(srcOfs, srcOfs + 12), destOfs);
    }

    this.data.set(dataCopy);
  }
  isEmpty(){
    return (this.data[19] & 0x02) === 0;
  }
  getSpeciesName(){
    return DATA.SPECIES_INTERNAL_ID_TO_NAME[this.getInternalSpeciesId()];
  }
  getSpeciesNationalDexId(){
    return DATA.SPECIES_INTERNAL_ID_TO_NATIONAL_DEX[this.getInternalSpeciesId()];
  }
  getInternalSpeciesId(){
    return this.dataView.getUint16(32, true);
  }
  getHeldItem(){
    return this.dataView.getUint16(34, true);
  }
  getHeldItemName(){
    return DATA.ITEM_NAMES[this.getHeldItem()];
  }
  getStatusCondition(){
    return this.dataView.getUint8(80);
  }
  /** this is private info, because we don't know HP EV */
  getMaxHp(){
    return this.dataView.getUint16(0x58, true);
    //return this.battleDataView.getUint16(0x2C, true);
  }
  static HP_BAR_PX = 48;
  /**return pixel count (between 0 and 48) */
  getCurrentHpPxCount_active(){
    const stats = this.getCurrentStats();
    if(!stats) // aka not active
      return 0;

    // based on GetHPBarLevel
    const result = Math.floor(stats.hp * RamPokemon.HP_BAR_PX / this.getMaxHp());
    if (result === 0 && stats.hp > 0)
      return 1;
    return result;
  }
  /**return hp pct (between 0 and 100) */
  getCurrentHpPctBasedOnPxCount_active(){
    const hpPx = this.getCurrentHpPxCount_active();
    return Math.ceil(hpPx / RamPokemon.HP_BAR_PX * 100);  // ceil for worse-case scenario
  }
  /** this is private info, because we don't know HP EV */
  getCurrentHp(){
    return this.dataView.getUint16(0x56, true);
  }
  isDead(){
    return this.getCurrentHp() <= 0;
  }
  isAtMaxHp(){
    return this.getCurrentHpPctBasedOnPxCount_active() < 100;
  }

  getCurrentHpBasedOnPxCount_active(maxHp:number){
    const hpPx = this.getCurrentHpPxCount_active();
    return Math.ceil(hpPx / RamPokemon.HP_BAR_PX * maxHp);
  }
  getStatus1(){
    const statusByte = this.dataView.getUint8(80);
    if (statusByte & 0b1000_0000)
      return MonStatus.badPoison;
    if (statusByte & 0b0100_0000)
      return MonStatus.paralyze;
    if (statusByte & 0b0010_0000)
      return MonStatus.freeze;
    if (statusByte & 0b0001_0000)
      return MonStatus.burn;
    if (statusByte & 0b0000_1000)
      return MonStatus.poison;
    if (statusByte & 0b0000_0111)
      return MonStatus.sleep;
    return MonStatus.healthy;
  }
  isConfused(){
    if(!this.battleDataView)
      return false;
    return (this.battleDataView.getUint32(0x50, true) & 7) !== 0;
  }
  getAbilityNum(){
    const pack = this.dataView.getUint32(72, true);
    return (pack >> 31) & 1;
  }
  getCurrentStats(){
    if(!this.battleDataView)
      return null;

    return {
      hp:this.battleDataView.getUint16(0x28, true),
      atk:this.battleDataView.getUint16(2, true),
      def:this.battleDataView.getUint16(4, true),
      spe:this.battleDataView.getUint16(6, true),
      spa:this.battleDataView.getUint16(8, true),
      spd:this.battleDataView.getUint16(10, true),
    }
  }
  getStatStages(){
    if(!this.battleDataView)
      return {atk:0,def:0,spe:0,spa:0,spd:0,acc:0,eva:0,};

    return {
      atk:this.battleDataView.getUint8(0x18 + 1) - 6,
      def:this.battleDataView.getUint8(0x18 + 2) - 6,
      spe:this.battleDataView.getUint8(0x18 + 3) - 6,
      spa:this.battleDataView.getUint8(0x18 + 4) - 6,
      spd:this.battleDataView.getUint8(0x18 + 5) - 6,
      acc:this.battleDataView.getUint8(0x18 + 6) - 6,
      eva:this.battleDataView.getUint8(0x18 + 7) - 6,
    }
  }
  getMoves(){
      return [0,1,2,3].map(index => {
          const offset = 44 + index * 2;
          const moveId = this.dataView.getUint16(offset, true);
          const pp = this.dataView.getUint8(52 + index);
          const move:{name:string,pp:number,priority:number} | null = DATA.MOVES[moveId] || null;
          return {
            name:move ? move.name : '',
            moveId,
            move,
            pp,
            maxpp:move ? move.pp : 0,
            priority:move ? move.priority : 0
          };
      });
  }
  getUsedMoves(){
    return this.getMoves().filter(a => a.move && a.name && a.pp < a.move.pp);
  }
  getPID(){
    return this.dataView.getUint32(0, true);
  }
  getNature(){
    return this.getPID() % 25;
  }
  getNatureName(){
    return DATA.NATURE_NAMES[this.getNature()];
  }
  getEvs(){
    return {
      hp:this.dataView.getUint8(56),
      atk:this.dataView.getUint8(57),
      def:this.dataView.getUint8(58),
      spe:this.dataView.getUint8(59),
      spa:this.dataView.getUint8(60),
      spd:this.dataView.getUint8(61),
    };
  }
  getIvs(){
    const pack = this.dataView.getUint32(72, true);
    return {
      hp:(pack >> 0) & 0b11111,
      atk:(pack >> 5) & 0b11111,
      def:(pack >> 10) & 0b11111,
      spe:(pack >> 15) & 0b11111,
      spa:(pack >> 20) & 0b11111,
      spd:(pack >> 25) & 0b11111,
    };
  }
  getLevel(){
    return this.dataView.getUint8(84);
  }
  getPossibleAbilityCount(){
    const abs = DATA.ABILITIES_BY_MON_INTERNAL_ID[this.getInternalSpeciesId()];
    if(!abs)
      return 0;
    return abs.split(',').length;
  }
  getAbilityName(){
    const abs = DATA.ABILITIES_BY_MON_INTERNAL_ID[this.getInternalSpeciesId()];
    if(!abs)
      return '';
    return abs.split(',')[this.getAbilityNum()] || '';
  }
  getGender(){
    const ratio = this.getGenderRatio();
    if (ratio === null)
      return Gender.genderless;

    if (ratio === 0)
      return Gender.male;

    if (ratio === 100)
      return Gender.female;

    const ratioIngame = Math.floor((ratio * 255) / 100);
    const pid = this.getPID();
    const pidGender = pid & 0xFF;
    return ratioIngame > pidGender ? Gender.female : Gender.male;
  }
  getGenderRatio(){
    const n = this.getSpeciesName();
    return DATA.getGenderRatio(n);
  }
  isActive(){
    return this.battleData !== null;
  }
  toJson(){
    return {
      getSpeciesName: this.getSpeciesName(),
      geSpeciesNationalDexId: this.getSpeciesNationalDexId(),
      getInternalSpeciesId: this.getInternalSpeciesId(),
      getHeldItem: this.getHeldItem(),
      getHeldItemName: this.getHeldItemName(),
      getStatusCondition: this.getStatusCondition(),
      getMaxHp: this.getMaxHp(),
      getCurrentHpPctBasedOnPixel: this.getCurrentHpPctBasedOnPxCount_active(),
      getStatus1: this.getStatus1(),
      isConfused: this.isConfused(),
      getAbilityNum: this.getAbilityNum(),
      getCurrentStats: this.getCurrentStats(),
      getStatStages: this.getStatStages(),
      getMoves: this.getMoves(),
      getUsedMoves: this.getUsedMoves(),
      getGender:this.getGender(),
      getPID: this.getPID(),
      getNature: this.getNature(),
      getNatureName: this.getNatureName(),
      getEvs: this.getEvs(),
      getIvs: this.getIvs(),
      getLevel: this.getLevel(),
      getAbilityName: this.getAbilityName(),
    };
  }
}


