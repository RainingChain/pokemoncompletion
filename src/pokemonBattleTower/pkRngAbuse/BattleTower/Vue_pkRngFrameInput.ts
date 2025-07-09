import Vue from "vue";
import withRender from "./Vue_pkRngFrameInput.vue"

import {Facility,AlgoSection,Range,RangeAndProbInput,RangeAndProb,RngCalib} from "../Structs";

const INPUT_VERSION = 2;

export enum NodeInputType {
  x5 = 'x5',
  x60 = 'x60',
  advancedMode = 'advancedMode',
}

export class NodeLaunchOptions {
  fixedVblankCycleByRngCount?:{rngAdvCount:number, vblank:number}[] | null;
  beforeTrainer?:Range;
  beforeMon1?:Range;
  mon1IdCycleRange?:Range;
  pikeIsHardBattle?:boolean;
}

export class Vue_pkRngFrameInput_data {
  beforeTrainer_1stBattle = new RangeAndProbInput();
  beforeTrainer_2ndBattle = new RangeAndProbInput();
  beforeMon1 = new RangeAndProbInput();
  pike_beforeMon1_hardBattle = new RangeAndProbInput();
  cycleMon1Id = new RangeAndProbInput();

  includesFramesStartSpeech = false;
  includesFramesInElevator = false;

  nodeInputType = NodeInputType.x5;
  usingDeadBattery = false;
  hasClickedRngCalibAdvancedMode = false;
  inputError = '';

  AlgoSection = JSON.parse(JSON.stringify(AlgoSection));
  NodeInputType = JSON.parse(JSON.stringify(NodeInputType));
  Facility = JSON.parse(JSON.stringify(Facility));
}


class Vue_pkRngFrameInput_props {
  saveToLocalStorage:() => void = null!;
  facility:Facility = null!;
}

class Vue_pkRngFrameInput_methods {
  updateFrameRangeInputs = function(this:Vue_pkRngFrameInput_full){
    if(this.nodeInputType === NodeInputType.advancedMode)
      return;

    if(this.facility === Facility.tower)
      this.updateFrameRangeInputs_tower();
    else if(this.facility === Facility.arena)
      this.updateFrameRangeInputs_arena();
    else if(this.facility === Facility.palace)
      this.updateFrameRangeInputs_palace();
    else if(this.facility === Facility.pike)
      this.updateFrameRangeInputs_pike();
    else if(this.facility === Facility.pyramid)
      this.updateFrameRangeInputs_pyramid();
    else if(this.facility === Facility.factory)
      this.updateFrameRangeInputs_factory();

    this.updateFrameRangeInputs_incrementBecauseOfDeadBattery();
  }
  /** must only be called from updateFrameRangeInputs */
  updateFrameRangeInputs_incrementBecauseOfDeadBattery = function(this:Vue_pkRngFrameInput_full){
    if(this.nodeInputType === NodeInputType.advancedMode)
      return;

    if(!this.usingDeadBattery)
      return;

    if(this.nodeInputType === NodeInputType.x5){
      this.beforeTrainer_1stBattle.min = '' + ((+(this.beforeTrainer_1stBattle.min)) + 220);
      this.beforeTrainer_1stBattle.max = '' + ((+(this.beforeTrainer_1stBattle.max)) + 220);
    }
    if(this.nodeInputType === NodeInputType.x60){
      this.beforeTrainer_1stBattle.min = '' + ((+(this.beforeTrainer_1stBattle.min)) + 208);
      this.beforeTrainer_1stBattle.max = '' + ((+(this.beforeTrainer_1stBattle.max)) + 208);
    }
  }
  updateFrameRangeInputs_tower = function(this:Vue_pkRngFrameInput_full){
    this.includesFramesInElevator = false;
    this.includesFramesStartSpeech = false;

    this.cycleMon1Id.init('175000', '250000', '1,1,1,1.5,1,4,3,1,2');

    if(this.nodeInputType === NodeInputType.x5){
      this.beforeTrainer_1stBattle.init2(2458, 128, 222, '1,2,4,3,2,1,1');
      this.beforeTrainer_2ndBattle.init2(1743, 123, 117,'1,1,2,4,4,2,1,1');
      this.beforeMon1.init2(92, 29, 29,'1,1,2,4,4,2,1,1');
    }
    else if(this.nodeInputType === NodeInputType.x60){
      this.beforeTrainer_1stBattle.init2(2245, 65, 185,'1,1.5,3,3,1.5,1,1,1,1,1');
      this.beforeTrainer_2ndBattle.init2(1645, 15, 5, '1,1,1.5,2,2,1.5,1');
      this.beforeMon1.init2(66, 3, 3, '1,2,4,4,2,1'); // real value
    }
  }
  updateFrameRangeInputs_arena = function(this:Vue_pkRngFrameInput_full){
    this.includesFramesInElevator = false;  //doesnt matter
    this.includesFramesStartSpeech = false;

    this.cycleMon1Id.init('175000', '250000', '1,1,1,1.5,1,4,3,1,2'); //230k ish a lot more common

    if(this.nodeInputType === NodeInputType.x5){
      this.beforeTrainer_1stBattle.init2(2612, 112, 238,'1,2,4,3,2,1,1');
      this.beforeTrainer_2ndBattle.init2(1850, 125, 100,'1,1,2,4,4,2,1,1');
      this.beforeMon1.init2(400, 65, 50,'1,1,2,4,4,2,1,1');
    }
    else if(this.nodeInputType === NodeInputType.x60){
      //name doesnt seem to have an impact
      this.beforeTrainer_1stBattle.init2(2515, 60, 200,'1,1.5,3,3,1.5,1,1,1,1,1');
      this.beforeTrainer_2ndBattle.init2(1791, 26, 9,'1,1,1.5,2,2,1.5,1'); // sometimes, a lot smaller. happened in bt too
      this.beforeMon1.init2(343, 8, 8,'1,2,4,4,2,1');
    }
  }
  updateFrameRangeInputs_palace = function(this:Vue_pkRngFrameInput_full){
    this.includesFramesInElevator = false;
    this.includesFramesStartSpeech = false;

    this.cycleMon1Id.init('175000', '250000', '1,1,1,1.5,1,4,3,1,2'); //230k ish a lot more common

    if(this.nodeInputType === NodeInputType.x5){
      this.beforeTrainer_1stBattle.init2(2403 - 71,138, 232,'1,2,4,3,2,1,1'); // 2403 real value, with A pokemon nature text (71 frame)
      this.beforeTrainer_2ndBattle.init2(1564 - 71, 123, 117,'1,1,2,4,4,2,1,1');
      this.beforeMon1.init2(73,29, 29,'1,1,2,4,4,2,1,1');
    }
    else if(this.nodeInputType === NodeInputType.x60){
      this.beforeTrainer_1stBattle.init2(2277 - 71, 60, 200,'1,1.5,3,3,1.5,1,1,1,1,1'); // 2277 real value, with A pokemon nature text (71 frame)
      this.beforeTrainer_2ndBattle.init2(1458,26,9,'1,1,1.5,2,2,1.5,1');
      this.beforeMon1.init2(68, 3,3,'1,2,4,4,2,1');
    }
  }
  updateFrameRangeInputs_pike = function(this:Vue_pkRngFrameInput_full){
    this.includesFramesInElevator = false;

    this.cycleMon1Id.init('175000', '250000', '1,1,1,1.5,1,4,3,1,2'); //not tested. 230k ish a lot more common

    if(this.nodeInputType === NodeInputType.x5){
      this.beforeTrainer_1stBattle.init2(2522,138, 232,'1,2,4,3,2,1,1'); // GetRandomScaledFrontierTrainerId

      this.beforeTrainer_2ndBattle.init2(1125, 123, 117,'1,1,2,4,4,2,1,1');
      this.beforeMon1.init2(1255 - 1125 - 37,29, 29,'1,1,2,4,4,2,1,1'); // FillTrainerParty - GetRandomScaledFrontierTrainerId - Delilah text (37 frame)
      this.pike_beforeMon1_hardBattle.init2(1338 - 1125 - 37,29, 29,'1,1,2,4,4,2,1,1');
    }
    else if(this.nodeInputType === NodeInputType.x60){
      //about 91 frames faster
      this.beforeTrainer_1stBattle.init2(2522 - 91, 60, 200,'1,1.5,3,3,1.5,1,1,1,1,1');

      //about 24f faster
      this.beforeTrainer_2ndBattle.init2(1125 - 24, 123, 117,'1,1,2,4,4,2,1,1');
      this.beforeMon1.init2(1255 - 1125 - 37 - 5,29, 29,'1,1,2,4,4,2,1,1'); // easy battle, Delilah text (37 frame)
      this.pike_beforeMon1_hardBattle.init2(1338 - 1125 - 37 - 5,29, 29,'1,1,2,4,4,2,1,1');
    }
    /*
    x5, room 1
    RNG advance count at start of SetHintedRoom(): 2263  x5
    RNG advance count at start of GetNextRoomType(): 2379 x5
    RNG advance count at start of GetRandomScaledFrontierTrainerId(): 2522
    RNG advance count at start of FillTrainerParty(): 2733

    x60, room1
    RNG advance count at start of SetHintedRoom(): 2172
    RNG advance count at start of GetNextRoomType(): 2288
    */
  }
  updateFrameRangeInputs_pyramid = function(this:Vue_pkRngFrameInput_full){
    this.includesFramesInElevator = false;
    this.includesFramesStartSpeech = false;

    if(this.nodeInputType === NodeInputType.x5){
      this.beforeTrainer_1stBattle.init2(1210, 150, 230,'1,2,4,3,2,1,1');
      this.beforeTrainer_2ndBattle.init2(628,  70, 70,'1,1,2,4,4,2,1,1');
    }
    else if(this.nodeInputType === NodeInputType.x60){
      this.beforeTrainer_1stBattle.init2(1114, 60, 200,'1,1.5,3,3,1.5,1,1,1,1,1');
      this.beforeTrainer_2ndBattle.init2(590,30,15,'1,1,1.5,2,2,1.5,1');
    }
  }
  updateFrameRangeInputs_factory = function(this:Vue_pkRngFrameInput_full){
    this.includesFramesInElevator = false;
    this.includesFramesStartSpeech = false;

    if(this.nodeInputType === NodeInputType.x5){
      this.beforeTrainer_1stBattle.init2(1581, 125, 10000,'1'); //10000 for rng manip
      this.beforeTrainer_2ndBattle.init2(1111,  70, 70,'1,1,2,4,4,2,1,1');
    }
    else if(this.nodeInputType === NodeInputType.x60){
      this.beforeTrainer_1stBattle.init2(1516,30,10000,'1');  //10000 for rng manip
      this.beforeTrainer_2ndBattle.init2(1082,30,30,'1,1.5,2,2,1.5,1');
    }
  }
  stateToStr = function(this:Vue_pkRngFrameInput_full){
    return JSON.stringify({
      beforeTrainer_1stBattle:this.beforeTrainer_1stBattle,
      beforeTrainer_2ndBattle:this.beforeTrainer_2ndBattle,
      beforeMon1:this.beforeMon1,
      pike_beforeMon1_hardBattle:this.facility === Facility.pike ? this.pike_beforeMon1_hardBattle : null,
      cycleMon1Id:this.cycleMon1Id,
      includesFramesStartSpeech:this.includesFramesStartSpeech,
      includesFramesInElevator:this.includesFramesInElevator,
    });
  }

  getRngCalib = function(this:Vue_pkRngFrameInput_full, battleIdx:number,opts:NodeLaunchOptions){
    this.inputError = '';

    let beforeTrainerInp = battleIdx === 0 ? this.beforeTrainer_1stBattle : this.beforeTrainer_2ndBattle;

    const beforeTrainer = new RangeAndProb(beforeTrainerInp, opts.beforeTrainer);
    if(battleIdx === 0)
      this.beforeTrainer_1stBattle.distr = beforeTrainer.distr.join(',');
    else
      this.beforeTrainer_2ndBattle.distr = beforeTrainer.distr.join(',');

    const beforeMon1Inp = this.facility === Facility.pike && opts.pikeIsHardBattle ? this.pike_beforeMon1_hardBattle : this.beforeMon1;
    const beforeMon1 = new RangeAndProb(beforeMon1Inp, opts.beforeMon1);
    this.beforeMon1.distr = beforeMon1.distr.join(',');

    const cycleMon1Id = new RangeAndProb(this.cycleMon1Id, opts.mon1IdCycleRange);
    this.cycleMon1Id.distr = cycleMon1Id.distr.join(',');

    return new RngCalib({
      beforeTrainer,
      beforeMon1,
      cycleMon1Id,
      includesFramesStartSpeech:this.includesFramesStartSpeech,
      includesFramesInElevator:this.includesFramesInElevator,
    });
  }
  getDataToExport = function(this:Vue_pkRngFrameInput_full){
    if(this.nodeInputType === NodeInputType.x5 || this.nodeInputType === NodeInputType.x60)
      return {
        version:INPUT_VERSION,
        nodeInputType:this.nodeInputType,
        usingDeadBattery:this.usingDeadBattery,
      };

    return {
      version:INPUT_VERSION,
      nodeInputType:this.nodeInputType,
      beforeTrainer_1stBattle:this.beforeTrainer_1stBattle.toStr(),
      beforeTrainer_2ndBattle:this.beforeTrainer_2ndBattle.toStr(),
      beforeMon1:this.beforeMon1.toStr(),
      pike_beforeMon1_hardBattle:this.pike_beforeMon1_hardBattle.toStr(),
      cycleMon1Id:this.cycleMon1Id.toStr(),
      includesFramesStartSpeech:this.includesFramesStartSpeech,
      includesFramesInElevator:this.includesFramesInElevator,
    };
  }
  importData = function(this:Vue_pkRngFrameInput_full, json:Partial<ReturnType<Vue_pkRngFrameInput_full['getDataToExport']>>){
    if(json.version !== INPUT_VERSION)
      return;

    if (typeof json.beforeTrainer_1stBattle === 'string')
      this.beforeTrainer_1stBattle.initFromStr(json.beforeTrainer_1stBattle);

    if (typeof json.beforeTrainer_2ndBattle === 'string')
      this.beforeTrainer_2ndBattle.initFromStr(json.beforeTrainer_2ndBattle);

    if (typeof json.beforeMon1 === 'string')
      this.beforeMon1.initFromStr(json.beforeMon1);

    if (typeof json.cycleMon1Id === 'string')
      this.cycleMon1Id.initFromStr(json.cycleMon1Id);

    if (typeof json.pike_beforeMon1_hardBattle === 'string')
      this.pike_beforeMon1_hardBattle.initFromStr(json.pike_beforeMon1_hardBattle);

    if(typeof json.includesFramesStartSpeech === 'boolean')
      this.includesFramesStartSpeech = json.includesFramesStartSpeech;

    if(typeof json.includesFramesInElevator === 'boolean')
      this.includesFramesInElevator = json.includesFramesInElevator;

    if(typeof json.usingDeadBattery === 'boolean')
      this.usingDeadBattery = json.usingDeadBattery;

    if([NodeInputType.x5,NodeInputType.x60,NodeInputType.advancedMode].includes(json.nodeInputType!))
      this.nodeInputType = json.nodeInputType!;

    if(this.nodeInputType === NodeInputType.advancedMode)
      this.hasClickedRngCalibAdvancedMode = true;

    this.updateFrameRangeInputs();
  }
}

export type Vue_pkRngFrameInput_full = Vue_pkRngFrameInput_props & Vue_pkRngFrameInput_data & Vue_pkRngFrameInput_methods;

export class Vue_pkRngFrameInput {
  static Component = Vue.component('Vue_pkRngFrameInput', withRender(new Vue_pkRngFrameInput()));

  props = Object.keys(new Vue_pkRngFrameInput_props());
  methods = new Vue_pkRngFrameInput_methods();
  data = function(){
    return new Vue_pkRngFrameInput_data();
  }
  watch = <any>{
    beforeTrainer_1stBattle:function(this:Vue_pkRngFrameInput_full){ this.saveToLocalStorage()},
    beforeTrainer_2ndBattle:function(this:Vue_pkRngFrameInput_full){ this.saveToLocalStorage()},
    beforeMon1:function(this:Vue_pkRngFrameInput_full){ this.saveToLocalStorage()},
    pike_beforeMon1_hardBattle:function(this:Vue_pkRngFrameInput_full){ this.saveToLocalStorage()},
    cycleMon1Id:function(this:Vue_pkRngFrameInput_full){ this.saveToLocalStorage()},
    includesFramesStartSpeech:function(this:Vue_pkRngFrameInput_full){ this.saveToLocalStorage()},
    includesFramesInElevator:function(this:Vue_pkRngFrameInput_full){ this.saveToLocalStorage()},
    nodeInputType:function(this:Vue_pkRngFrameInput_full){ this.saveToLocalStorage()},
    usingDeadBattery:function(this:Vue_pkRngFrameInput_full){ this.saveToLocalStorage()},
  }
  mounted = <any>function(this:Vue_pkRngFrameInput_full){
    this.updateFrameRangeInputs();
  }
}


