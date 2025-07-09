

import Vue from "vue";
import withRender from "../pkRngAbuse/Vue_pkRngAbuseResult.vue"

import {VueRangeResult} from "../pkRngAbuse/VueResult";
import { JsonTrainerPokemon } from "../data/getData";

enum ResultView {
  team = 'team',
  mon = 'mon',
  auto = 'auto',
}

export class Vue_pkRngAbuseResult_data {
  ResultView = ResultView;
  resultView = ResultView.mon;
  resultViewInput = ResultView.auto;
  displayResultRngFrames = false;
}

class Vue_pkRngAbuseResult_props {
  result:VueRangeResult | null = null;
  onJmonClicked:((jmons:JsonTrainerPokemon[]) => void) | null = null;
  displayCalibMsg = false;
  additionalJtmons:JsonTrainerPokemon[] | undefined = undefined;
}

class Vue_pkRngAbuseResult_methods {
  updateResultViewInput = function(this:Vue_pkRngAbuseResult_full){
    this.resultView = this.getUpdatedResultView();
  }
  getUpdatedResultView = function(this:Vue_pkRngAbuseResult_full){
    if (!this.result)
      return this.resultView;

    if (this.resultViewInput !== ResultView.auto)
      return this.resultViewInput;

    if(this.result.teamResults.length < 5)
      return ResultView.team;

    const sumFirst3 = this.result.teamResults.slice(0,3).reduce((p,c) => p + c.probWeight, 0);
    if (sumFirst3 > 0.5)
      return ResultView.team;

    return ResultView.mon;
  }
  onMonClicked = function(this:Vue_pkRngAbuseResult_full,pack:VueRangeResult['probByMons'][0]){
    if(this.onJmonClicked)
        this.onJmonClicked([pack.mon]);
  }
  onTeamClicked = function(this:Vue_pkRngAbuseResult_full,team:VueRangeResult['teamResultsFiltered'][0]){
    if(!this.onJmonClicked)
      return;
    const mons = team.pokemons.map(m => m.jmon);
    this.onJmonClicked!(mons);
  }
  showClickMon = function(this:Vue_pkRngAbuseResult_full,pack:VueRangeResult['probByMons'][0]){
    return this.additionalJtmons && !this.additionalJtmons.includes(pack.mon);
  };
  showClickTeam = function(this:Vue_pkRngAbuseResult_full,res:VueRangeResult['teamResultsFiltered'][0]){
    return this.additionalJtmons && res.pokemons.some(m => !this.additionalJtmons!.includes(m.jmon))
  };
}

function createComponent(propsData:Partial<Vue_pkRngAbuseResult_props>) {
  const comp = new Vue_pkRngAbuseResult.Component({
    propsData:{
      ...new Vue_pkRngAbuseResult_props(),
      ...propsData
    }
  });
  return <{$props:Vue_pkRngAbuseResult_props} & typeof comp>comp;
}

export type Vue_pkRngAbuseResult_full = Vue_pkRngAbuseResult_props & Vue_pkRngAbuseResult_data & Vue_pkRngAbuseResult_methods;

export class Vue_pkRngAbuseResult {
  static Component = Vue.component('Vue_pkRngAbuseResult', withRender(new Vue_pkRngAbuseResult()));

  props = Object.keys(new Vue_pkRngAbuseResult_props());
  methods = new Vue_pkRngAbuseResult_methods();
  data = function(){
    return new Vue_pkRngAbuseResult_data();
  }
  watch = <any>{
    resultViewInput:function(this:Vue_pkRngAbuseResult_full){
      this.resultView = this.getUpdatedResultView();
    },
    result:function(this:Vue_pkRngAbuseResult_full){
      this.resultView = this.getUpdatedResultView();
    },
  }
}

