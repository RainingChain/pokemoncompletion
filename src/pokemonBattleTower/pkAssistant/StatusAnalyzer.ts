
import * as Smogon from "@smogon/calc";
import * as DATA from "./PkAbilityChecker_data";

export class StatusAnalyzer {
  getStatusStr(mv:Smogon.Move){
    if(mv.bp) //assumes it's only side-effect
      return '';
    if(DATA.SLEEP.includes(mv.name))
      return 'SLP';
    if(DATA.FRZ.includes(mv.name))
      return 'FRZ';
    if(DATA.PARALYZE.includes(mv.name))
      return 'PAR';
    if(DATA.CONFUSE.includes(mv.name))
      return 'CON';
    if(DATA.PSN.includes(mv.name))
      return 'PSN';
    if(DATA.BURN.includes(mv.name))
      return 'BURN';
    return '';
  }
}