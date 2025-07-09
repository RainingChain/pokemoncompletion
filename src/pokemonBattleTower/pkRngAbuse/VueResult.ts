
import * as CONST from "./const";
import { GameData, getData,Trainer,JsonTrainerPokemon } from "../data/getData";
import {  Filter,Gender } from "./Structs";

export class Result_i {
  trainer:Trainer;
  pokemons:{jmon:JsonTrainerPokemon,abilityNum:number,gender:Gender}[];
  frameCountInfoStr:string;
  frameCountInfoDetails:string[];
  probWeight:number;
}

export class VueResult {
  constructor(res:Result_i){
    this.frameCountInfoStr = res.frameCountInfoStr;
    this.trainer = res.trainer!;
    this.probWeight = res.probWeight;
    this.pokemons = res.pokemons.map(jmonAndAb => {
      const j = jmonAndAb.jmon;
      return {
        jmon:j,
        abilityNum:jmonAndAb.abilityNum,
        speciesNum:CONST.SPECIES_BY_NAME.get(j.species) || 0,
        desc:'',
        genders:[jmonAndAb.gender],
      }; //desc init after
    });
    if(res.frameCountInfoDetails)
      this.frameCountInfoDetails = res.frameCountInfoDetails;
  }
  trainer:Trainer;
  pokemons:{jmon:JsonTrainerPokemon,abilityNum:number,speciesNum:number,genders:Gender[],desc:string}[] = [];
  allMonsDesc = '';
  probPctStr = '';
  frameCountInfoStr = '';
  frameCountInfoDetails:string[] = [];
  showFrameCountInfoDetails = false;
  probWeight = 0;
  highlight = false;

  add(res:Result_i){
    this.frameCountInfoDetails.push(...res.frameCountInfoDetails);
    this.probWeight += res.probWeight;
    this.pokemons.forEach((m,i) => {
      if (!m.genders.includes(res.pokemons[i].gender))
        m.genders.push(res.pokemons[i].gender);
    });
  }
}


export interface Colorizer {
  colorizeMove(m:string) : string;
  colorizeItem(m:string) : string;
}

export class VueRangeResult {
  /** team view */
  teamResults:VueResult[] = [];
  teamResultsFiltered:VueResult[] = [];

  /** mon probability view */
  probByMons:{mon:JsonTrainerPokemon,desc:string,speciesNum:number, prob:number, pctStr:string, speciesProb:number, speciesProbPctStr:string}[] = [];

  filter:Filter;

  static createVueResults(results:Result_i[],colorizer:Colorizer){
    const vueResults:VueResult[] = [];
    results.forEach(res => {
      const alreadyExist = vueResults.find(r => {
        return r.trainer === res.trainer && r.pokemons.every((m,i) => m.jmon === res.pokemons[i].jmon && m.abilityNum === res.pokemons[i].abilityNum);
      });
      if (alreadyExist){
        alreadyExist.add(res);
        return;
      }
      const vres = new VueResult(res);

      vueResults.push(vres);
    });


    vueResults.forEach(vres => {
      const getDesc = (vrmon:typeof vres.pokemons[0], colorize:boolean) => {
        const j = vrmon.jmon;
        const gender = (() => {
          if (vrmon.genders.includes(Gender.genderless))
            return '';
          if (vrmon.genders.length === 2)
            return ' M/F';
          return vrmon.genders[0] === Gender.male ? ' M' : ' F';
        })();
        const abStr = j.abilities.length > 1 ? '(' + j.abilities[vrmon.abilityNum] + ') ' : '';
        const item = colorize ? colorizer.colorizeItem(j.item) : j.item;
        const moves = j.moves.map(m => colorize ? colorizer.colorizeMove(m) : m).join(', ');
        return `${j.displayName}${gender}@${item} ${abStr}: ${moves}`;
      };
      vres.pokemons.forEach(vrmon => {
        vrmon.desc = getDesc(vrmon, true);
      });

      vres.allMonsDesc = vres.pokemons.map(p => getDesc(p, false)).join('\n');
    });

    const teamProbSum = vueResults.reduce((prev, a) => prev + a.probWeight, 0) || 1;
    vueResults.forEach(vr => {
      vr.probWeight = vr.probWeight / teamProbSum;
    })


    vueResults.sort((a,b) => {
      return b.probWeight - a.probWeight;
    });
    vueResults.forEach(vr => {
      const w = vr.probWeight * 100;
      vr.probPctStr = w.toFixed(w < 10 ? 1 : 0) + '%'
    });
    return vueResults;
  }
  static create(results:Result_i[],filter:Filter,colorizer:Colorizer, monsToIgnore:string[]=[]){

    const rangeRes = new VueRangeResult();

    rangeRes.teamResults = VueRangeResult.createVueResults(results, colorizer);
    rangeRes.teamResultsFiltered = rangeRes.teamResults.slice(0,10); //to avoid too many

    const probByJmon = new Map<JsonTrainerPokemon, number>();
    rangeRes.teamResults.forEach(vr => {
      vr.pokemons.forEach((mon, idx) => {
        if (monsToIgnore.includes(mon.jmon.species))
          return;

        const prob = probByJmon.get(mon.jmon) || 0;
        probByJmon.set(mon.jmon, prob + vr.probWeight);
      });
    });

    const jmonAndProbs = Array.from(probByJmon.entries()).sort((a,b) => {
      return b[1] - a[1];
    });
    const probSum = jmonAndProbs.reduce((prev, a) => prev + a[1], 0) || 1;

    const probByMons = jmonAndProbs.map(a => {
      const [mon,prob] = a;
      const prob2 = prob * (3 - monsToIgnore.length);
      const probPct = prob2 / probSum * 100;
      const moves = mon.moves.map(m => colorizer.colorizeMove(m)).join(', ');
      return {
        mon,
        desc:`${mon.displayName}@${colorizer.colorizeItem(mon.item)}: ${moves}`,
        speciesNum: CONST.SPECIES_BY_NAME.get(mon.species) || 0,
        prob:probPct,
        pctStr: probPct.toFixed(probPct < 10 ? 1 : 0) + '%',
        speciesProb:0,
        speciesProbPctStr:'',
        rowspan:<number|null>null,
      };
    });

    probByMons.forEach(mon => {
      const sameSpecies = probByMons.filter(m => m.speciesNum === mon.speciesNum);
      const speciesProb = sameSpecies.reduce((p,c) => p + c.prob, 0);
      mon.speciesProb = speciesProb;
      mon.speciesProbPctStr = speciesProb.toFixed(speciesProb < 10 ? 1 : 0) + '%';
    });

    probByMons.sort((a,b) => {
      if(a.speciesNum === b.speciesNum)
        return b.prob - a.prob;
      return b.speciesProb - a.speciesProb;
    });

    probByMons.forEach(mon => {
      const sameSpecies = probByMons.filter(m => m.speciesNum === mon.speciesNum);
      sameSpecies[0].rowspan = sameSpecies.length;
    });

    rangeRes.probByMons = probByMons;

    rangeRes.filter = filter;
    return rangeRes;
  }
}