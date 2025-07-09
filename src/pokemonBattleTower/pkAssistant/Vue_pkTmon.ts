

import Vue from "vue";
import withRender from "./Vue_pkTmon.vue"

import {MoveResultInfo,SmonWithRmon,Vue_playerPokemon_data} from "./pkAssistant_data";

export class Vue_pkTmon_data {

}

export class Vue_pkTmon_props {
  name = '';
  speciesId = 0;
  itemName = '';
  itemDangerousColor = '';
  trainerMovesAgainstPlayer:MoveResultInfo[] = [];
  playerMovesAgainstTrainer:MoveResultInfo[] = [];
  statValsDesc = '';
  statStagesDesc = '';
  effectiveSpeed = 0;
  battleTowerId = 0;
  nature = '';
  ability = '';
  /** must be consistent even if its data updates */
  uidForDisplay = '';
  visible = true;
  abilitiesUsefulness:{name:string,useful:boolean}[] = [];
  stmon:SmonWithRmon = null!;
  vpmon:Vue_playerPokemon_data = null!;
  isActiveBattle = false;
  uid = '' + Math.random();
  displayIdx = 0;
  displayedBecauseOfRng = false;
  partyIdxInRngParty = -1; //only if displayedBecauseOfRng = true
  trainerMaxHpApprox = '';
  hideVtmon:() => void = null!;
}

class Vue_pkTmon_methods {
}

export type Vue_pkTmon_full = Vue_pkTmon_props & Vue_pkTmon_data & Vue_pkTmon_methods;

export class Vue_pkTmon {
  static Component = Vue.component('Vue_pkTmon', withRender(new Vue_pkTmon()));

  props = Object.keys(new Vue_pkTmon_props());
  methods = new Vue_pkTmon_methods();
  data = function(){
    return new Vue_pkTmon_data();
  }
  watch = <any>{
  }
}

