
import * as Smogon from '@smogon/calc';
import { Pokemon } from '@smogon/calc';
(<any>window).Smogon = Smogon;

import { Trainer} from "../data/getData";
import { DmgHKOResult } from "./DmgHKOCalculator";
import { RamPokemon } from "./RamPokemon";
import { FacilityNum, Range,PalaceOldManMsg } from "../pkRngAbuse/Structs";

export const MGBA_VERSION = 6; //v6

export class NodeLaunchOptions {
  fixedVblankCycleByRngCount?:{rngAdvCount:number, vblank:number}[] | null;
  beforeTrainer?:Range;
  beforeMon1?:Range;
  mon1IdCycleRange?:Range;
  printAll?:boolean;
  mustCancel?:() => boolean;
  calculateVblanksStr?:boolean;
}

export class SmonWithRmon extends Pokemon {
  rmon:RamPokemon | null;
}


export class Vue_ramBattleState {
  playerMonName = '';
  playerMonSpeciesId = 0;
  playerCurrentHp = 0;
  playerCurrentHpPct = '';
  playerMaxHp = 0;
  playerStatus = '';
  playerEffectiveSpeed = 0;
  playerStatStagesDesc = '';
  playerStatValsDesc = '';

  trainerName = '';
  trainerId = 0;
  trainerMonName = '';
  trainerMonSpeciesId = 0;
  trainerStatus = '';
  trainerMaxHpApprox = '';
  trainerMaxHpApproxDesc = '';
  trainerStatStagesDesc = '';
  trainerUsedMoves:{name:string,pp:number,maxpp:number}[] = [];

  weatherName = '';
  facilityName = '';
  winStreak = 0;
  isLvl50 = true;
}

export class Vue_playerPokemon_data {
  name = '';
  statValsDesc = '';
  statStagesDesc = '';
  smon:SmonWithRmon;
  uid = '' + Math.random();
  currentHpPct = '';
  speciesId = 0;
  isActiveMon = false;
  borderColor = '';
  partyIdx = 0;
  effectiveSpeed = 0;
}


export class MsgFromMgba {
  rawMsgData = '';
  trainerMon:RamPokemon;
  playerMon:RamPokemon;
  playerMonPidsInOrder:number[];
  /** includes active and bench, including dead */
  allTrainerMons:RamPokemon[];
  /** only if not dead */
  benchPlayerMons:RamPokemon[];
  trainer:Trainer;
  trainerId:number;
  weather:number;
  lvlMode:number;
  facilityNum:FacilityNum;
  palaceOldManMsg:PalaceOldManMsg | null;
  battleMode:number;
  winStreak:number;
  msgId:number;
  trainersBattled:number[];
  rngVblanks:{vblankP1:number,vblankP2:number}[] | null;
  factoryPastRentalCount:number;
  factoryPlayerJmons:number[];
}

export class MoveResultInfo {
  name = '';
  displayName = '';
  priority = 0;
  color = '';
  dmgText = '';
  hkoText = '';
  statusStr = '';
  hkoTitle = '';
  hkoRes:DmgHKOResult | null = null;
  uid = '' + Math.random();
}
