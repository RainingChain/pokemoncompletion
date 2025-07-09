
import Vue from "vue";

import "../../common/css/common.css";
import "../../common/css/globalStyle.css";

import withRender from "./pkRngMonRating.vue";

import { Vue_nav } from "../../common/views/nav";
Vue_nav.createAndMount();

import { Vue_analytics } from "../../common/views/analytics";
Vue_analytics.createAndMount();

import * as Smogon from '@smogon/calc';
import { Move, Pokemon, calculate } from '@smogon/calc';
import {PokemonHelper_data,Vue_pokemon_data} from "./pkRngMonRating_data";

(<any>window).Smogon = Smogon;

const GEN = 4;

const DEBUG = window.location.href.includes('localhost');

const MIN_DMG_PCT = 1; // ??? doesnt make sense to put less than 100%

//aka status effects/OHKO moves
const unpredictableMoves = new Set(["Glare","Stun Spore","Thunder Wave","Body Slam","Thunder","Thunderbolt","ThunderPunch","Bounce","Discharge","Force Palm","Spark","Thunder Fang","Tri Attack","Zap Cannon","Yawn","Spore","Attract","Autotomize","Hypnosis","Lovely Kiss","Sing","Sleep Powder","Blizzard","Ice Beam","Ice Fang","Ice Punch","Confuse Ray","Dizzy Punch","DynamicPunch","Flatter","Hurricane","Psybeam","Rock Climb","Signal Beam","Supersonic","Swagger","Sweet Kiss","Teeter Dance","Water Pulse","Trick","Trick Room","Toxic","Cotton Guard","Memento","Minimize","Sand-Attack","Struggle Bug","BubbleBeam","Bulldoze","Electroweb","Icy Wind","Mud Shot","Rock Tomb","Scary Face","String Shot","Low Sweep","Flash","Leaf Tornado","Mirror Shot","Mud Bomb","Muddy Water","Night Daze","Power Split","Sheer Cold","Fissure","GrassWhistle","Will-O-Wisp","Double Team","Horn Drill"]);

const unpredictableItems:string[] = [
  "Focus Sash", "Focus Band","BrightPowder", "Quick Claw", "Lax Incense"
];


enum CantOhkoReasonId {
  item = "item",
  spd = "spd",
  dmg = "dmg",
  ability = "ability",
  speedBoost = "speedBoost",
}

class Ratings {
  constructor(p:Partial<Ratings>){
    Object.assign(this,p);
  }
  selfPk:Vue_pokemon_data;
  ratingsByMove:Rating[][] = [];

  getCantReasonCountMap(){
    const cantReasonCountMap = new Map<CantOhkoReasonId | null, number>();
    this.ratingsByMove.forEach(ratings => {
      ratings.forEach(info => {
        info.cantOhkoReasons.forEach(r => {
          const val = cantReasonCountMap.get(r.reasonId) || 0;
          cantReasonCountMap.set(r.reasonId, val + 1 / this.ratingsByMove.length);
        });
      });
    });
    return cantReasonCountMap;
  }
  getRatingSum(){
    return Math.round(this.ratingsByMove.reduce((prev,v) => {
      let r2 = v.reduce((prev2,v2) => {
        return prev2 + v2.ratingValue;
      }, 0);
      return prev + r2;
    }, 0));
  }
  toJsonString(){
    let ratingsByMove = this.ratingsByMove.map(ratings => {
      let rs2 = ratings.filter(r => r.ratingValue !== 0).map(r => ([r.tmonBattleTowerId, r.tmonAbilityIdx, r.ratingValue]));

      //merge [x,0,r] and [x,1,r] into [x,2,r], by removing [x,1,r]
      rs2 = rs2.filter(r => {
        if (r[1] === 1){
          let ab0 = rs2.find(r2 => r2[1] === 0 && r2[0] === r[0] && r2[2] === r[2]);
          if (ab0){
            ab0[1] = 2;
            return false;
          }
        }
        return true;
      });
      return rs2;
    });
    return `{"name":"${this.selfPk.name}","ratingSum":${this.getRatingSum()},"item":"${this.selfPk.smon.item}", "description":"${this.selfPk.getDesc()}", "moves":${JSON.stringify(this.selfPk.pkMoves.map(a => a.name))}, "speed":${this.selfPk.getSpd()},\n`
      + `  "ratingsByMove":${JSON.stringify(ratingsByMove)}\n}`;
  }
}

class CantOhkoReason {
  constructor(public reasonId:CantOhkoReasonId,
              public info:string){}
};

class DmgInfo {
  dmgPct = 0;
  move = '';
  getDesc(){
    return `${Math.floor(this.dmgPct * 100)}% Dmg : ${this.move}`
  }
}

class Rating {
  constructor(p:Partial<Rating>){
    Object.assign(this,p);
  }
  tmonDesc = '';
  tmonBattleTowerId = 0;
  tmonAbilityIdx = 0;
  cantOhkoReasons:CantOhkoReason[] = [];
  dmgInfo_pmonToTmon:DmgInfo = null!;
  dmgInfo_tmonToPmon:DmgInfo | null = null;
  hasUnpredictableMove = false;
  isUnpredictable = false;
  ratingValue = 0;
}


class PokemonHelper extends PokemonHelper_data {
  //evaluation start
  getCantOutSpd(selfPk:Vue_pokemon_data, trainerPk:Vue_pokemon_data){
    const spd = selfPk.getSpd();
    const spd2 = trainerPk.getSpd();
    if(spd > spd2)
      return null;
    return {reasonId:CantOhkoReasonId.spd, info:`Spd: ${spd} vs ${spd2}`};
  }
  //onlyUseMoveIdx is to simulate Choice locking
  getHighestDmgMove(atker:Vue_pokemon_data, defender:Vue_pokemon_data, highestRoll:boolean, onlyUseMoveIdx:number | null = null){
    const best = new DmgInfo();
    atker.pkMoves.forEach((m,idx) => {
      if (onlyUseMoveIdx !== null && idx !== onlyUseMoveIdx)
        return;

      const dmgPct = this.getDmgPct(atker, defender, m, highestRoll);
      if(dmgPct > best.dmgPct){
        best.dmgPct = dmgPct;
        best.move = m.name;
      }
    });
    return best;
  }
  getDmgPct(atker:Vue_pokemon_data, defender:Vue_pokemon_data, move:Smogon.Move, highestRoll:boolean){
    move.isCrit = highestRoll; //BAD modifies move
    const res = calculate(GEN, atker.smon, defender.smon, move);
    const dmg = (function(){
      const d = res.damage;
      if(typeof d === 'number')
        return d;
      if(d.length === 2){
        const d2 = <number[]>d[highestRoll ? 1 : 0];
        return d2[highestRoll ? d2.length - 1 : 0];
      }
      return <number>d[highestRoll ? d.length - 1 : 0];
    })();
    return dmg / defender.smon.maxHP(true);
  }
  getHasUnpredictableMove(trainerPk:Vue_pokemon_data){
    return trainerPk.pkMoves.some(m => {
      return unpredictableMoves.has(m.name);
    });
  }

  evalRating(selfPk:Vue_pokemon_data, trainerPk:Vue_pokemon_data, onlyUseMoveIdx:number | null) : Rating {
    const r = new Rating({
      tmonBattleTowerId:trainerPk.tmonBattleTowerId!,
      tmonAbilityIdx:trainerPk.tmonAbilityIdx!,
      tmonDesc:trainerPk.getDesc(),
    });
    const add = (reasonId:CantOhkoReasonId,
                 info:string) => {
      r.cantOhkoReasons.push(new CantOhkoReason(reasonId, info));
    };

    const item = trainerPk.smon.item!;
    if(unpredictableItems.includes(item)){
      add(CantOhkoReasonId.item, item);
      r.isUnpredictable = true;
    }

    if(selfPk.smon.ability !== 'Mold Breaker' && trainerPk.smon.ability === "Sturdy")
      add(CantOhkoReasonId.ability, 'sturdy');

    if(selfPk.smon.evs.atk > 0 && trainerPk.smon.ability === "Intimidate")
      add(CantOhkoReasonId.ability, 'intimidate');

    if(trainerPk.smon.ability === 'Speed Boost' && trainerPk.smon.moves.some(m => ['Protect','Detect','Endure'].includes(m)))
      add(CantOhkoReasonId.speedBoost, 'speedBoost');

    const cantSpd = this.getCantOutSpd(selfPk, trainerPk);
    if(cantSpd)
      r.cantOhkoReasons.push(cantSpd);

    r.dmgInfo_pmonToTmon = this.getHighestDmgMove(selfPk, trainerPk, false, onlyUseMoveIdx);
    if (r.dmgInfo_pmonToTmon.dmgPct < 1)
      add(CantOhkoReasonId.dmg, r.dmgInfo_pmonToTmon.getDesc());

    //optimization, no point calculating dangerous if ohko
    if(r.cantOhkoReasons.length){
      r.hasUnpredictableMove = this.getHasUnpredictableMove(trainerPk);
      if(r.hasUnpredictableMove)
        r.isUnpredictable = true;
      r.dmgInfo_tmonToPmon =  this.getHighestDmgMove(trainerPk, selfPk, true);
    }
    r.ratingValue = this.evalRatingValue(selfPk, trainerPk,r);
    return r;
  }
  evalRatingValue(selfPk:Vue_pokemon_data, trainerPk:Vue_pokemon_data,r:Rating){
    if (!r.cantOhkoReasons.length)
      return 1;

    if (r.isUnpredictable)
      return 0;

    let max_safe_dmg_pct = selfPk.smon.item === 'Life Orb' ? 0.79 : 0.99;
    let tmon_dmgPct = r.dmgInfo_tmonToPmon?.dmgPct ?? 0;
    let alwaysWin1vs1 = tmon_dmgPct < max_safe_dmg_pct &&
                        r.dmgInfo_pmonToTmon.dmgPct >= 0.5;

    // if we are too slow but opponent cant OHKO, its still a 100% win chance, with some HP lost.
    // however, if we face that category of pokemon multiple times the same battle, we will die
    if (r.cantOhkoReasons.length === 1 &&
        r.cantOhkoReasons[0].reasonId === CantOhkoReasonId.spd &&
        alwaysWin1vs1){
      return 0.70;
    }

    // if we can't deal dmg to OHKO, but opponent cant OHKO, its still a 100% win chance, with some HP lost.
    // however, if we face that category of pokemon multiple times the same battle, we will die
    if (r.cantOhkoReasons.length === 1 &&
        r.cantOhkoReasons[0].reasonId === CantOhkoReasonId.dmg &&
        alwaysWin1vs1){
      return 0.70;
    }

    if (tmon_dmgPct < 0.2)
      return 0.5;
    if (tmon_dmgPct < 0.3)
      return 0.4;
    if (tmon_dmgPct < 0.4)
      return 0.3;
    if (tmon_dmgPct < 0.5)
      return 0.2;
    if (tmon_dmgPct < 0.6)
      return 0.1;
    if (tmon_dmgPct < 0.7)
      return 0.05;

    return 0;
  }

  evalRatings(selfPk:Vue_pokemon_data){
    const ratingsByMove = (() => {
      if (!selfPk.smon.item?.startsWith('Choice')){
        const rs = this.trainerPks.map(tpk => this.evalRating(selfPk, tpk, null));
        return [rs];
      } else {
        return selfPk.smon.moves.map((m,idx) => {
          return this.trainerPks.map(tpk => this.evalRating(selfPk, tpk, idx));
        });
      }
    })();

    return new Ratings({
      selfPk,
      ratingsByMove,
    });
  }
  async evalAllRatings(){
    const arr:Ratings[] = [];
    for (let i = 0 ; i < this.selfPks.length; i++){
      //if (i % 50 === 0)
        console['log'](`${i} / ${this.selfPks.length}`);
      arr.push(this.evalRatings(this.selfPks[i]));
      //await (new Promise<void>(resolve => setTimeout(() => resolve(), 10)));
    }
    arr.sort((a,b) => {
      return b.getRatingSum() - a.getRatingSum();
    });
    return arr;
  }

  allRatings_as_str(rs:Ratings[]){
    let str = '[\n';
    rs.forEach(el => {
      str += el.toJsonString() + ',\n';
    });
    str += '\n]\n';
    return str;
  }
  //evaluation end
}
//for validation
  // https://turskain.github.io/

(<any>window).PokemonHelper = PokemonHelper;
(<any>window).ph = new PokemonHelper(GEN);
(<any>window).ph.initSelfPks();

//ph.getAllOhkoInfos()
//ph.getBattleSubwaySelfPokemon(0)

//npm run c-d -- --content=pokemon --deleteDist=false

document.addEventListener("DOMContentLoaded",async function(){
  const v = new Vue(withRender({}));
  (<any>window).v = v;
  v.$mount('#pkRngMonRating-slot');
});