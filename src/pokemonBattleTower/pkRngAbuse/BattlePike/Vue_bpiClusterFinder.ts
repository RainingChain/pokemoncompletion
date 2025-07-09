import Vue from "vue";
import withRender from "./Vue_bpiClusterFinder.vue";
import "./Vue_bpiClusterFinder.css";
import {Rng} from "../Rng";

import {BpiGenerator,PikeClusterOptions,PikeRoomType_ToName,Hint,PikeRoomType,RoomPos,RoomPos_ToStr} from "./BpiGenerator";
import PikeRngAdvCountLua from "../lua/PikeRngAdvCount.lua";

export class Vue_bpiClusterFinder_data {
  isFirstRoom = true;
  hint = Hint.Status_HealPart;
  rngFrame_min_1st_room = 2200;
  rngFrame_max_1st_room = 7200;
  rngFrame_min_2nd_room = 1000;
  rngFrame_max_2nd_room = 6000;
  atLeastOneHealthyMon = false;
  atLeastTwoAliveMons = false;
  pikeHealingRoomsDisabled = false;
  displayHowToUse = true;

  maxDisplayedCount = 0;
  longestEasyRoomStreak_start = 0;
  longestEasyRoomStreak_end = 0;
  results:{rngAdvCount:number, roomType:PikeRoomType, roomTypeName:string ,isEasy:boolean,hintText:string}[] = [];

  Hint = JSON.parse(JSON.stringify(Hint));
  PikeRngAdvCountLua = PikeRngAdvCountLua;
}


class Vue_bpiClusterFinder_props {
  saveToLocalStorage:() => void = null!;
}

class Vue_bpiClusterFinder_methods {
  generate = function(this:Vue_bpiClusterFinder_full){
    const min = this.isFirstRoom ? +this.rngFrame_min_1st_room : +this.rngFrame_min_2nd_room;
    const max = this.isFirstRoom ? +this.rngFrame_max_1st_room : +this.rngFrame_max_2nd_room;
    const count = max - min + 1;
    if(count <= 0 || isNaN(count))
      return;

    const opts = new PikeClusterOptions();
    if(this.isFirstRoom){
      opts.atLeastOneHealthyMon = true;
      opts.atLeastTwoAliveMons = true;
      opts.pikeHealingRoomsDisabled = true;
    } else {
      opts.atLeastOneHealthyMon = this.atLeastOneHealthyMon;
      opts.atLeastTwoAliveMons = this.atLeastTwoAliveMons;
      opts.pikeHealingRoomsDisabled = this.pikeHealingRoomsDisabled;
    }

    const gen = new BpiGenerator(opts);

    const resRoomTypes = new Uint8Array(count);
    const resEasy = new Uint8Array(count);
    const resHintPos = new Uint8Array(count);
    const resHintRoomType = new Uint8Array(count);

    const rng = new Rng();
    rng.RandomX(min);
    for(let i = 0; i < count; i++){
      const rng2 = rng.clone();
      let roomType:PikeRoomType;
      if(this.isFirstRoom){
        const arr = gen.generate_1stRoom(rng2);
        resHintPos[i] = arr[0];
        resHintRoomType[i] = arr[1];
        roomType = arr[2];
      } else {
        roomType = gen.generate_2ndRoom(rng2, this.hint);
      }

      const isEasy = roomType === PikeRoomType.HEAL_FULL || roomType === PikeRoomType.HEAL_PART || roomType === PikeRoomType.NPC || roomType === PikeRoomType.STATUS || roomType === PikeRoomType.WILD_MONS;

      resRoomTypes[i] = roomType;
      resEasy[i] = isEasy ? 1 : 0;

      rng.Random();
    }

    const [start, end] = this.getLongestEasyStreak(resEasy);
    this.longestEasyRoomStreak_start = start + min;
    this.longestEasyRoomStreak_end = end + min;

    this.maxDisplayedCount = +this.maxDisplayedCount;
    let idealDisplayedCount = Math.min(end - start + 1 + 20 * 2, count);
    if (this.maxDisplayedCount < idealDisplayedCount)
      this.maxDisplayedCount = idealDisplayedCount;

    let displayMin = 0;
    let displayMax = count - 1;
    if (count > this.maxDisplayedCount){
      displayMin = Math.max(0, start - 20);
      displayMax = Math.min(count, displayMin + this.maxDisplayedCount);
    }

    this.results = [];
    for(let i = displayMin; i <= displayMax; i++){
      const roomType = resRoomTypes[i];
      const hintPos = resHintPos[i];
      const hintRoomType = resHintRoomType[i];

      this.results.push({
        rngAdvCount:i + min,
        roomType,
        isEasy:resEasy[i] === 1,
        roomTypeName: PikeRoomType_ToName[roomType],
        hintText:this.isFirstRoom ? `Hint: ${RoomPos_ToStr[hintPos]} room contains ${PikeRoomType_ToName[hintRoomType]}` : '',
      });
    }
  }

  getLongestEasyStreak = function(easy:Uint8Array){
    let longestEasyRoomStreak = 0;
    let longestEasyRoomStreak_start = 0;
    let longestEasyRoomStreak_end = 0;

    let curMin:number | null = null;
    for(let i = 0; i <= easy.length; i++){
      const isEasy = i === easy.length ? 0 : easy[i];
      if (isEasy){
        if (curMin === null)
          curMin = i;
        continue;
      } else {
        if (curMin === null)
          continue;
        const streak = i - curMin;
        if (streak <= longestEasyRoomStreak){
          curMin = null;
          continue;
        }
        longestEasyRoomStreak = streak;
        longestEasyRoomStreak_start = curMin;
        longestEasyRoomStreak_end = i - 1;
        curMin = null;
      }
    }
    return [longestEasyRoomStreak_start, longestEasyRoomStreak_end];
  }
  getDataToExport = function(this:Vue_bpiClusterFinder_full){
    return {
      isFirstRoom:this.isFirstRoom,
      hint:this.hint,
      rngFrame_min_1st_room:+this.rngFrame_min_1st_room,
      rngFrame_max_1st_room:+this.rngFrame_max_1st_room,
      rngFrame_min_2nd_room:+this.rngFrame_min_2nd_room,
      rngFrame_max_2nd_room:+this.rngFrame_max_2nd_room,
      atLeastOneHealthyMon:this.atLeastOneHealthyMon,
      atLeastTwoAliveMons:this.atLeastTwoAliveMons,
      pikeHealingRoomsDisabled:this.pikeHealingRoomsDisabled,
      maxDisplayedCount:+this.maxDisplayedCount,
      longestEasyRoomStreak_start:+this.longestEasyRoomStreak_start,
      longestEasyRoomStreak_end:+this.longestEasyRoomStreak_end,
      displayHowToUse:this.displayHowToUse,
    };
  }
  importData = function(this:Vue_bpiClusterFinder_full, json:Partial<ReturnType<Vue_bpiClusterFinder_full['getDataToExport']>>){
    if (typeof json.isFirstRoom === 'boolean')
      this.isFirstRoom = json.isFirstRoom;
    if (typeof json.hint === 'string')
      this.hint = json.hint;
    if (typeof json.rngFrame_min_1st_room === 'number')
      this.rngFrame_min_1st_room = json.rngFrame_min_1st_room;
    if (typeof json.rngFrame_max_1st_room === 'number')
      this.rngFrame_max_1st_room = json.rngFrame_max_1st_room;
    if (typeof json.rngFrame_min_2nd_room === 'number')
      this.rngFrame_min_2nd_room = json.rngFrame_min_2nd_room;
    if (typeof json.rngFrame_max_2nd_room === 'number')
      this.rngFrame_max_2nd_room = json.rngFrame_max_2nd_room;
    if (typeof json.atLeastOneHealthyMon === 'boolean')
      this.atLeastOneHealthyMon = json.atLeastOneHealthyMon;
    if (typeof json.displayHowToUse === 'boolean')
      this.displayHowToUse = json.displayHowToUse;
    if (typeof json.atLeastTwoAliveMons === 'boolean')
      this.atLeastTwoAliveMons = json.atLeastTwoAliveMons;
    if (typeof json.pikeHealingRoomsDisabled === 'boolean')
      this.pikeHealingRoomsDisabled = json.pikeHealingRoomsDisabled;
    if (typeof json.maxDisplayedCount === 'number')
      this.maxDisplayedCount = json.maxDisplayedCount;
    if (typeof json.longestEasyRoomStreak_start === 'number')
      this.longestEasyRoomStreak_start = json.longestEasyRoomStreak_start;
    if (typeof json.longestEasyRoomStreak_end === 'number')
      this.longestEasyRoomStreak_end = json.longestEasyRoomStreak_end;
  }
}

export type Vue_bpiClusterFinder_full = Vue_bpiClusterFinder_props & Vue_bpiClusterFinder_data & Vue_bpiClusterFinder_methods;

export class Vue_bpiClusterFinder {
  static Component = Vue.component('Vue_bpiClusterFinder', withRender(new Vue_bpiClusterFinder()));

  props = Object.keys(new Vue_bpiClusterFinder_props());
  methods = new Vue_bpiClusterFinder_methods();
  data = function(){
    return new Vue_bpiClusterFinder_data();
  }
  computed = {
  }
  watch = <any>{
    isFirstRoom:<any>function(this:Vue_bpiClusterFinder_full){ this.saveToLocalStorage(); },
    hint:<any>function(this:Vue_bpiClusterFinder_full){ this.saveToLocalStorage(); },
    rngFrame_min_1st_room:<any>function(this:Vue_bpiClusterFinder_full){ this.saveToLocalStorage(); },
    rngFrame_max_1st_room:<any>function(this:Vue_bpiClusterFinder_full){ this.saveToLocalStorage(); },
    rngFrame_min_2nd_room:<any>function(this:Vue_bpiClusterFinder_full){ this.saveToLocalStorage(); },
    rngFrame_max_2nd_room:<any>function(this:Vue_bpiClusterFinder_full){ this.saveToLocalStorage(); },
    atLeastOneHealthyMon:<any>function(this:Vue_bpiClusterFinder_full){ this.saveToLocalStorage(); },
    atLeastTwoAliveMons:<any>function(this:Vue_bpiClusterFinder_full){ this.saveToLocalStorage(); },
    pikeHealingRoomsDisabled:<any>function(this:Vue_bpiClusterFinder_full){ this.saveToLocalStorage(); },
    maxDisplayedCount:<any>function(this:Vue_bpiClusterFinder_full){ this.saveToLocalStorage(); },
    longestEasyRoomStreak_start:<any>function(this:Vue_bpiClusterFinder_full){ this.saveToLocalStorage(); },
    longestEasyRoomStreak_end:<any>function(this:Vue_bpiClusterFinder_full){ this.saveToLocalStorage(); },
    displayHowToUse:<any>function(this:Vue_bpiClusterFinder_full){ this.saveToLocalStorage(); },
  }
  mounted = <any>function(this:Vue_bpiClusterFinder_full){
  }
}


