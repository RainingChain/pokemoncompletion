
import {JsonTrainerPokemon} from "../Structs";
import { DmgHKOCalculator } from "../../pkAssistant/DmgHKOCalculator";
import {PkRngGen} from "../../pkAssistant/PkRngGen";
import * as Smogon from "@smogon/calc";

const GEN = <any>3;

export class SmonAndBfId {
  constructor(public smon:Smogon.Pokemon, public btId:number){}
}

export class BfBattleEvaluator {
  constructor(public jpmons:JsonTrainerPokemon[], public isLvl50:boolean, public winStreak:number){
    this.playerIvValue = this.getPlayerIvValue();
    this.iniSpmons();
  }
  rng = new PkRngGen(0); // for perf
  playerIvValue = 0;
  private getPlayerIvValue(){
    if (this.winStreak < 7 * 1)
      return 3;
    if (this.winStreak < 7 * 2)
      return 6;
    if (this.winStreak < 7 * 3)
      return 9;
    if (this.winStreak < 7 * 4)
      return 12;
    if (this.winStreak < 7 * 5)
      return 15;
    if (this.winStreak < 7 * 6)
      return 21;
    return 31;
  }
  getIvs(ivs:number){
    return {
      hp:ivs,
      atk:ivs,
      def:ivs,
      spe:ivs,
      spa:ivs,
      spd:ivs,
    };
  }
  iniSpmons(){
    this.spmons = this.jpmons.map(jpmon => {
      return this.getOrCreateSmonAndBfId(jpmon, true);
    });
  }
  spmons:SmonAndBfId[] = [];

  getOrCreateSmonAndBfId(jpmon:JsonTrainerPokemon, forPlayer:boolean){
    const cache = forPlayer ? this.smonAndBfIdCache.player : this.smonAndBfIdCache.trainer;
    const el = cache.get(jpmon.id);
    if(el)
      return el;
    const smon = new Smogon.Pokemon(GEN, jpmon.species, {
      ivs:forPlayer ? this.getIvs(this.playerIvValue) : this.getIvs(3),
      nature:jpmon.nature,
      evs:(<any>jpmon).evs,
      level:this.isLvl50 ? 50 : 100,
      item: jpmon.item,
      ability:jpmon.abilities[0] || '',
      moves:jpmon.moves,
    });
    smon.clone = () => smon; //for performance
    const newEl = new SmonAndBfId(smon, jpmon.id);
    cache.set(jpmon.id, newEl);
    return newEl;
  }
  smonAndBfIdCache = {
    player:new Map<number, SmonAndBfId>(),
    trainer:new Map<number, SmonAndBfId>(),
  };


  evalScore(jtmons:JsonTrainerPokemon[]){
    const stmons = jtmons.map(jtmon => {
      return this.getOrCreateSmonAndBfId(jtmon, false);
    });

    const a = this.evalScore_internal(this.spmons.slice(0), stmons.slice(0));
    const b = this.evalScore_internal([this.spmons[0], this.spmons[2], this.spmons[1]], stmons.slice(0));

    const c = this.evalScore_internal(this.spmons.slice(0), [stmons[0], stmons[2], stmons[1]]);
    const d = this.evalScore_internal([this.spmons[0], this.spmons[2], this.spmons[1]], [stmons[0], stmons[2], stmons[1]]);
    return Math.min(Math.max(a, b), Math.max(c, d));
  }
  private static evalDmgDealt_cache = new Map<number, number>();

  private evalDmgDealt(atk:SmonAndBfId, def:SmonAndBfId) : number {
    //atk,def,iv,lvl50
    //aaadddiil
    const cacheKey = atk.btId * 1000000 + def.btId*1000 + this.playerIvValue * 10 + (this.isLvl50 ? 0 : 1);
    const cacheVal = BfBattleEvaluator.evalDmgDealt_cache.get(cacheKey);
    if(cacheVal !== undefined)
      return cacheVal;

    if (atk.smon.species.name === 'Wobbuffet' && def.smon.species.name !== 'Wobbuffet')
      return this.evalDmgDealt(def, atk) * 1.5;

    const dmg = atk.smon.moves.map(mv => {
      const hkoCalc = new DmgHKOCalculator(GEN, atk.smon, def.smon, new Smogon.Field(), mv, this.rng);
      hkoCalc.hkoSimulCount = 0;
      hkoCalc.avgDmgSimulCount = 100;
      return hkoCalc.calculate()?.avgDmg ?? 0;
    });
    const newVal = Math.max(...dmg) / def.smon.maxHP();
    BfBattleEvaluator.evalDmgDealt_cache.set(cacheKey, newVal);
    return newVal;
  }
  private evalScore_internal(spmons:SmonAndBfId[], stmons:SmonAndBfId[]){
    const [php, thp, dangerousPen] = this.simulateBattle(spmons, stmons);
    const pAlive = php.filter(p => p > 0).length;
    const tAlive = thp.filter(p => p > 0).length;

    const score = (() => {
      if (pAlive > 0 && tAlive > 0)
        return 0; //no winner after 1000 turns

      if (pAlive > 0)
        return [0, 1, 3, 9][pAlive];
      return [0, -1, -5, -9][tAlive];
    })();
    return score + dangerousPen;
  }

  private simulateBattle(spmons:SmonAndBfId[], stmons:SmonAndBfId[]){
    let php = [1,1,1];
    let thp = [1,1,1];
    let pCur = 0;
    let tCur = 0;

    const pToTdmgMatrix = spmons.map(p => {
      return stmons.map(t => this.evalDmgDealt(p, t));
    });
    const tToPdmgMatrix = stmons.map(p => {
      return spmons.map(t => this.evalDmgDealt(p, t));
    });


    //penality if a tmon can ohko and outspeed many pmon
    const dangerousTmonsPen = tToPdmgMatrix.reduce((prev2, dmgs, tidx) => {
      const okhoCount = dmgs.reduce((prev, dmg, pidx) => {
        const ohkoAndOutspeed = dmg >= 1 && stmons[tidx].smon.stats.spe >= spmons[pidx].smon.stats.spe;
        return prev + (ohkoAndOutspeed ? 1 : 0);
      }, 0);
      const pen = [0, -1, -9, -16][okhoCount];
      return prev2 + pen;
    }, 0);

    for(let i = 0 ; i < 1000; i++){
      const p = spmons[pCur];
      const t = stmons[tCur];

      if (p.smon.stats.spe > t.smon.stats.spe){
        thp[tCur] -= pToTdmgMatrix[pCur][tCur];
        if (thp[tCur] < 0){
          tCur++;
          if (tCur >= 3)
            break;
          continue;
        }

        php[pCur] -= tToPdmgMatrix[tCur][pCur];
        if (php[pCur] < 0){
          pCur++;
          if (pCur >= 3)
            break;
          continue;
        }
      } else {
        php[pCur] -= tToPdmgMatrix[tCur][pCur];
        if (php[pCur] < 0){
          pCur++;
          if (pCur >= 3)
            break;
          continue;
        }

        thp[tCur] -= pToTdmgMatrix[pCur][tCur];
        if (thp[tCur] < 0){
          tCur++;
          if (tCur >= 3)
            break;
          continue;
        }
      }
    }


    return [php, thp, dangerousTmonsPen] as const;
  }
}

