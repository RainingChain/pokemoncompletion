
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
import {DexMoves} from "../pkAssistant/DexMoves";
(<any>window).Smogon = Smogon;

const GEN = 4;

const DEBUG = window.location.href.includes('localhost');

const nonDmgStatusMoves = new Set(["Glare","Stun Spore","Thunder Wave","Yawn","Spore","Attract","Hypnosis","Lovely Kiss","Sing","Sleep Powder","Sweet Kiss","Trick","Memento","Sand-Attack","GrassWhistle"]);

const dmgStatusMoves = new Set(["Hail","Sandstorm","Leech Seed","Confuse Ray","Flatter","Supersonic","Swagger","Teeter Dance","Will-O-Wisp","Toxic"]);

const priorityMoves = new Set(["Shadow Sneak","Sucker Punch"]);
//https://bulbapedia.bulbagarden.net/wiki/Fire_(type)
const canBurn = new Set(["Ember","Fire Blast","Fire Punch","Flamethrower","Flame Wheel","Sacred Fire","Blaze Kick","Heat Wave","Fire Fang","Flare Blitz","Lava Plume"]);

const multiHit = new Set(["Rock Blast"]);

class Rating {
  constructor(p:Partial<Rating>){
    Object.assign(this,p);
  }
  tmonBattleTowerId = 0;
  tmonAbilityIdx = 0;
  tmonDesc = '';

  killedBy2SS = false;
  killedBy4SS = false;
  killedBy2XS2SS = false;
  hitShedinja = false;
  killShedinja = false;
  hasNonDmgStatus = false;
  alwaysBad = false;

  toRating(){
    if (!this.hitShedinja){
      if (this.hasNonDmgStatus)
        return 0.1;  //only way to win if its all other mon are badStatus or !hitShedinja
      return 1;
    }

    if(this.alwaysBad)
      return 0;

    if(this.killedBy2SS)  //guarateed win without hit, if setup already done. cant be used for setup
      return 0.95;

    if(this.killShedinja)
      return 0;

    if (this.hasNonDmgStatus)
      return 0.1;

    //at this point, hitShedinja == true, killShedinja == false

    if(this.killedBy4SS) //SD the SS. both 2nd and 3d tmon must be killed by 4SS
      return 0.9;

    if(this.killedBy2XS2SS) //get hit once then kill. 3rd tmon must be killed by 2SS
      return 0.8;

    return 0; //shedinja cant win fight even with setup done
  }
  compress(){
    let r = [
      this.killedBy2SS,
      this.killedBy4SS,
      this.killedBy2XS2SS,
      this.hitShedinja,
      this.killShedinja,
      this.alwaysBad,
    ];
    let v = 0;
    r.forEach((val,i) => {
      if(val)
        v += 2 ** i;
    });
    return v;
  }

}

class Ratings {
  constructor(p:Partial<Ratings>){
    Object.assign(this,p);
  }
  selfPk:Vue_pokemon_data;
  ratings:Rating[] = [];

  toJsonString(){
    let sum = 0;
    let ratingsByMove = [this.ratings].map(ratings => {
      let rs2 = ratings.filter(r => r.toRating() !== 0).map(r => ([r.tmonBattleTowerId, r.tmonAbilityIdx, r.toRating()]));
      rs2.forEach(r => { sum += r[2]; });

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
    let moves:string[] = this.selfPk.pkMoves.map(a => a.name);
    while(moves.length < 4)
      moves.push('');

    return `{"name":"${this.selfPk.name}","ratingSum":${sum.toFixed(0)},"item":"${this.selfPk.smon.item}", "description":"${this.selfPk.getDesc()}", "moves":${JSON.stringify(moves)}, "speed":${this.selfPk.getSpd()},\n`
      + `  "ratingsByMove":${JSON.stringify(ratingsByMove)}\n}`;
  }
}

class DmgInfo {
  dmgPct = 0;
  move = '';
  getDesc(){
    return `${Math.floor(this.dmgPct * 100)}% Dmg : ${this.move}`
  }
}

class PokemonHelper extends PokemonHelper_data {
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
  hasMoveFromSet(trainerPk:Vue_pokemon_data, set:Set<string>){
    return trainerPk.pkMoves.some(m => {
      return set.has(m.name);
    });
  }

  evalRating(selfPk:Vue_pokemon_data, trainerPk:Vue_pokemon_data) : Rating {
    const r = new Rating({
      tmonBattleTowerId:trainerPk.tmonBattleTowerId!,
      tmonAbilityIdx:trainerPk.tmonAbilityIdx!,
      tmonDesc:trainerPk.getDesc(),
    });
    const canDmg = this.getHighestDmgMove(trainerPk, selfPk, true).dmgPct > 0;
    const hasDmgStatus = this.hasMoveFromSet(trainerPk, dmgStatusMoves);
    const hasNonDmgStatus = this.hasMoveFromSet(trainerPk, nonDmgStatusMoves);

    //["Shadow Sneak","X-Scissor", "Dig","Sword Dance"]
    let outspd = selfPk.getSpd() > trainerPk.getSpd();
    let [ss2, xs2, _dig2] = [0,1,2].map(i => this.getHighestDmgMove(selfPk, trainerPk, false, i).dmgPct);
    xs2 = Math.max(xs2, _dig2);

    let bestDmg = Math.max(ss2, xs2);
    let outspdBestDmg = Math.max(ss2, outspd ? xs2 : 0);

    r.killedBy2SS = outspdBestDmg > 0.5; //aka kill without getting hit, if setup done
    r.killedBy4SS = outspdBestDmg > 0.34;
    r.killedBy2XS2SS = bestDmg + outspdBestDmg > 0.5; // best atk, get hit, atk again

    r.killShedinja = hasDmgStatus || this.hasMoveFromSet(trainerPk, canBurn) || this.hasMoveFromSet(trainerPk, multiHit);
    r.hitShedinja = canDmg || r.killShedinja;
    r.hasNonDmgStatus = hasNonDmgStatus;

    r.alwaysBad = this.hasMoveFromSet(trainerPk, priorityMoves) || trainerPk.smon.hasItem('Bright Powder','BrightPowder', 'Lax Incense')

    return r;
  }
  evalRatings(selfPk:Vue_pokemon_data){
    const ratings = this.trainerPks.map(tpk => this.evalRating(selfPk, tpk));

    return new Ratings({
      selfPk,
      ratings,
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
  getDexMove(moveName:string){
    const mid = moveName.toLowerCase().replace(/\W/g,'');
    const m = DexMoves[mid];
    if(!m)
      console.error('Invalid move:' + mid + ' ||| ' + moveName);
    return m;
  }

  //evaluation end
}
//for validation
  // https://turskain.github.io/

(<any>window).PokemonHelper = PokemonHelper;
(<any>window).ph = new PokemonHelper(GEN);
(<any>window).ph.initShedinja();

//ph.getAllOhkoInfos()
//ph.getBattleSubwaySelfPokemon(0)

//npm run c-d -- --content=pokemon --deleteDist=false

document.addEventListener("DOMContentLoaded",async function(){
  const v = new Vue(withRender({}));
  (<any>window).v = v;
  v.$mount('#pkRngMonRating-slot');
});