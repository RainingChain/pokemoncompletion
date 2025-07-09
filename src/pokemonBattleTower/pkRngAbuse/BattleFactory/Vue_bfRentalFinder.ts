import Vue from "vue";
import withRender from "./Vue_bfRentalFinder.vue";
import "./Vue_bfRentalFinder.css";
import {Rng} from "../Rng";

import {Options} from "../Structs";
import {BfResult,BfGenerator} from "./BfGenerator";
import {GameData,JsonTrainerPokemon} from "../../data/getData";
import {FACTORY_STYLE_TO_NAME,FACTORY_STYLE,TYPE, TYPE_TO_NAME,GetTrainerIdRange} from "../const";
import { PokemonName,InputName,TrainerInputName } from "../Vue_input";
import {BfBattleEvaluator} from "./BfBattleEvaluator";

let gameData:GameData;

export class Vue_bfRentalFinder_data {
  winStreak = 0;
  isLvl50 = true;
  pastRentalCount = 0;
  pokemonToInclude = '';
  pokemonToInclude2 = '';
  hideFarFromWantedRental = true;
  rngFrame_min_1stRoom = 2000;
  rngFrame_max_1stRoom = 7000;
  rngFrame_min_2ndRoom = 1100;
  rngFrame_max_2ndRoom = 4100;
  displayHowToUse = true;
  displayStrategy = false;
  mustSimulateBattle = true;
  simulateBattleRange = 15;
  longestStreak_start = 0;
  longestStreak_end = 0;
  results:{
    rngAdvCount:number,
    hasPokemonToInclude:boolean|null,
    playerRental:{name:string, selected:number}[],
    searchTextNoNumberFormatted:string,
    searchTextNoNumberFormatted2:string,
    jtmonsText:string,
    battleStyle:FACTORY_STYLE,
    commonType:TYPE,
    visible:boolean,
    farFromWantedRental:boolean,
    battleSelfScore:number,
    battleScore:number,
    trainer:string,
    rawRes:() => BfResult,
  }[] = [];
  results_pokemonToInclude = '';
  results_pokemonToInclude2 = '';
  results_isFirstRoom = false;
  results_atLeastOneVisible = true;
  results_bestRngFrameForBattle = 0;

  lastError = '';
  jtmonByFormattedName:{jtmon:JsonTrainerPokemon, formattedName:string}[] = [];
  pokemonNames = PokemonName.createForFactory(gameData);
  trainersBattled = ['','','','','',''].map(a => TrainerInputName.create(gameData));
  rngCalib_active = false;
  rngCalib_pokemonName = '';
  rngCalib_style = 'null';
  rngCalib_type = 'null';
  FACTORY_STYLE_TO_NAME = JSON.parse(JSON.stringify(FACTORY_STYLE_TO_NAME));
  TYPE_TO_NAME = JSON.parse(JSON.stringify(TYPE_TO_NAME));
}

class Vue_bfRentalFinder_props {
  saveToLocalStorage:() => void = null!;
}

const RECOMMENDATIONS = [
[0, 2018, "Graveler", "Elekid", "Charmeleon"],
[0, 2019, "Graveler", "Houndour", "Grovyle"],
[0, 2020, "Graveler", "Houndour", "Grovyle"],
[0, 2021, "Graveler", "Houndour", "Grovyle"],
[0, 2022, "Graveler", "Houndour", "Grovyle"],
[0, 2023, "Graveler", "Houndour", "Bayleef"],
[1, 2041, "Hitmonlee", "Sharpedo", "Arbok"],
[1, 2042, "Hitmonlee", "Sharpedo", "Arbok"],
[1, 2043, "Hitmonlee", "Sharpedo", "Arbok"],
[1, 2044, "Hitmonlee", "Sharpedo", "Venomoth"],
[1, 2045, "Hitmonlee", "Croconaw", "Venomoth"],
[1, 2046, "Hitmonlee", "Croconaw", "Venomoth"],
[1, 2047, "Hitmonlee", "Croconaw", "Plusle"],
[1, 2048, "Hitmonlee", "Croconaw", "Plusle"],
[1, 2049, "Hitmonlee", "Croconaw", "Plusle"],
[1, 2050, "Hitmonlee", "Dunsparce", "Plusle"],
[1, 2051, "Hitmonlee", "Dunsparce", "Plusle"],
[1, 2052, "Hitmonlee", "Swellow", "Plusle"],
[1, 2053, "Hitmonlee", "Swellow", "Plusle"],
[2, 2063, "Zangoose", "Grumpig", "Seviper"],
[2, 2064, "Zangoose", "Grumpig", "Seviper"],
[2, 2065, "Zangoose", "Grumpig", "Seviper"],
[2, 2066, "Zangoose", "Grumpig", "Seviper"],
[2, 2067, "Zangoose", "Grumpig", "Seviper"],
[2, 2068, "Zangoose", "Grumpig", "Vigoroth"],
[3, 2204, "Umbreon", "Heracross", "Ludicolo"],
[3, 2205, "Umbreon", "Heracross", "Altaria"],
[3, 2206, "Espeon", "Heracross", "Altaria"],
[3, 2207, "Espeon", "Heracross", "Flareon"],
[3, 2208, "Espeon", "Heracross", "Flareon"],
[3, 2209, "Espeon", "Heracross", "Flareon"],
[3, 2210, "Espeon", "Heracross", "Salamence"],
[3, 2211, "Espeon", "Salamence", "Flareon"],
[3, 2212, "Espeon", "Salamence", "Flareon"],
[4, 1851, "Espeon", "Starmie", "Granbull"],
[4, 1852, "Espeon", "Milotic", "Granbull"],
[4, 1853, "Espeon", "Heracross", "Milotic"],
[4, 1854, "Espeon", "Heracross", "Milotic"],
[4, 1855, "Espeon", "Heracross", "Milotic"],
[4, 1856, "Espeon", "Heracross", "Milotic"],
[4, 1857, "Espeon", "Heracross", "Milotic"],
[4, 1858, "Espeon", "Heracross", "Milotic"],
[4, 1859, "Espeon", "Heracross", "Vaporeon"],
[5, 1839, "Starmie", "Flygon", "Forretress"],
[5, 1840, "Starmie", "Flygon", "Forretress"],
[5, 1841, "Starmie", "Flygon", "Forretress"],
[5, 1842, "Starmie", "Flygon", "Miltank"],
[5, 1843, "Starmie", "Flygon", "Scizor"],
[5, 1844, "Starmie", "Flygon", "Electrode"],
] as const;

class Vue_bfRentalFinder_methods {
  updatePokemonInputName = function(this:Vue_bfRentalFinder_full, pn:PokemonName){
    PokemonName.update(pn);
  }
  isRoom1 = function(this:Vue_bfRentalFinder_full){
    return (+this.winStreak) % 7 === 0;
  }
  generate = function(this:Vue_bfRentalFinder_full){
    this.rngCalib_active = false;
    this.lastError = '';
    this.results_pokemonToInclude = '';
    this.results_pokemonToInclude2 = '';
    this.results_isFirstRoom = false;
    this.results_atLeastOneVisible = true;
    this.results_bestRngFrameForBattle = 0;

    if(this.isRoom1())
      return this.generate_room1();
    return this.generate_room2();
  }
  generateRecommendation = function(this:Vue_bfRentalFinder_full){
    if(!this.isRoom1())
      return;
    const set = Math.floor((+this.winStreak) / 7);
    const list = RECOMMENDATIONS.filter(a => a[0] === set);
    this.generateSet(+this.winStreak, list[0][1], list[list.length - 1][1]);
    list.forEach(el => {
      const r = this.results.find(r => r.rngAdvCount === el[1]);
      if(!r)
        return console.error('!this.results');
      for(let i = 0 ; i < 3; i++){
        const rp = r.playerRental.find(p => p.name.startsWith(<string>el[i + 2]));
        if(!rp){
          console.error('!rp', r.playerRental, el, i);
          continue;
        }
        rp.selected = i;
      }
    });
  }

  generate_room2 = function(this:Vue_bfRentalFinder_full){
    this.results_isFirstRoom = false;
    this.results_bestRngFrameForBattle = 0;

    const min = +this.rngFrame_min_2ndRoom;
    const max = +this.rngFrame_max_2ndRoom;
    const count = max - min + 1;
    if(count <= 0 || isNaN(count)){
      this.lastError = 'Error: Invalid Min/Max RNG frame.';
      return;
    }
    const jmons = this.pokemonNames.map(pn => pn.computedValue!);
    if(jmons.some(jmon => jmon === null)){
      this.lastError = 'Error: All 3 Player Pokemon and 3 Previous Trainer Pokemon must be provided and valid.';
      return;
    }

    const opts = new Options(gameData, {
      winStreak:+this.winStreak,
      isLvl50:this.isLvl50,
    });
    opts.factoryPastRentalCount = +this.pastRentalCount;
    opts.factoryPlayerJmons = jmons;

    const gen = new BfGenerator(opts);

    const results:Vue_bfRentalFinder_data['results'] = [];

    const battleEval = new BfBattleEvaluator(jmons, this.isLvl50, +this.winStreak);

    const rng = new Rng();
    rng.RandomX(min);
    for(let i = 0; i < count; i++){
      const rng2 = rng.clone();
      rng.Random();

      const [f,res] = gen.generate_room2(rng2);
      if(!res)
        continue; //error, because no filter

      const battleSelfScore = this.mustSimulateBattle ? battleEval.evalScore(res.jmons) : 0;
      const jmonsTxt = res.jmons.map(m => m.species);
      results.push({
        rngAdvCount:i + min,
        hasPokemonToInclude:null,
        playerRental:[],
        searchTextNoNumberFormatted:InputName.formatName(jmonsTxt.join(', ')),
        searchTextNoNumberFormatted2:InputName.formatName([jmonsTxt[0], jmonsTxt[2], jmonsTxt[1]].join(', ')),
        trainer:res.trainer.name,
        jtmonsText:res.jmons.map(m => m.displayName).join(', '),
        battleStyle:res.battleStyle,
        commonType:res.commonType,
        visible:true,
        farFromWantedRental:false,
        battleSelfScore,
        battleScore:0,
        rawRes:() => res,
      });
    }

    this.results = results;

    if(this.mustSimulateBattle){
      const c2 = this.updateBattleScore();
      const maxIdx = Vue_bfRentalFinder_methods.findMaxIndex(this.results, el => el.battleScore);
      if (maxIdx >= 0){
        this.results_bestRngFrameForBattle = this.results[maxIdx].rngAdvCount;
        this.longestStreak_start = this.results_bestRngFrameForBattle - c2;
        this.longestStreak_end = this.results_bestRngFrameForBattle + c2;
      }
    }
  }
  static findMaxIndex<T>(arr:T[], f:(el:T,i:number,arr:T[]) => number | null){
    let best = -Infinity;
    let bestIdx = -1;
    arr.forEach((el,i,a) => {
      const v = f(el,i,a);
      if(v !== null && v > best){
        best = v;
        bestIdx = i;
      }
    });
    return bestIdx;
  }
  updateBattleScore = function(this:Vue_bfRentalFinder_full){
    let count = Math.floor(+this.simulateBattleRange);
    if (isNaN(count))
      count = 15;
    if (count > 1000)
      count = 15;
    if (count % 2 === 1)
      count--;

    let c2 = count / 2;

    for(let i = 0 ; i < this.results.length; i++){
      let sum = 0;
      let pond = 0;
      for(let j = i - c2; j <= i + c2; j++){
        if (j < 0 || j >= this.results.length)
          continue;
        const distFromI = Math.abs(j - i) / c2;
        const pond2 = (1 - distFromI) + 0.2; //linear pen
        const r = this.results[j];
        sum += r.battleSelfScore * pond2;
        pond += pond2;
      }
      if (pond)
        sum /= pond;
      this.results[i].battleScore = sum;
    }
    return c2;
  }
  generate_room1 = function(this:Vue_bfRentalFinder_full){
    const min = +this.rngFrame_min_1stRoom;
    const max = +this.rngFrame_max_1stRoom;
    const count = max - min + 1;
    if(count <= 0 || isNaN(count)){
      this.lastError = 'Error: Invalid Min/Max RNG frame.';
      return;
    }

    const opts = new Options(gameData, {
      winStreak:+this.winStreak,
      isLvl50:this.isLvl50,
    });
    opts.factoryPastRentalCount = +this.pastRentalCount;

    const gen = new BfGenerator(opts);

    const results:Vue_bfRentalFinder_data['results'] = [];

    const regex = this.pokemonToInclude ? new RegExp(this.pokemonToInclude, 'i') : null;
    const regex2 = this.pokemonToInclude && this.pokemonToInclude2 ? new RegExp(this.pokemonToInclude2, 'i') : null;

    const rng = new Rng();
    rng.RandomX(min);
    for(let i = 0; i < count; i++){
      const rng2 = rng.clone();
      rng.Random();

      const [reason, res] = gen.generate_room1(rng2);
      if(!res)
        continue; //error, because no filter

      const hasPokemonToInclude = (() => {
        if(!regex)
          return null;
        if (!res.playerRental.some(m => m.displayName.match(regex)))
          return false;
        if (regex2 && !res.playerRental.some(m => m.displayName.match(regex2)))
          return false;
        return true;
      })();

      results.push({
        rngAdvCount:i + min,
        hasPokemonToInclude,
        playerRental:res.playerRental.map(m => ({name:m.displayName,selected:-1})),
        searchTextNoNumberFormatted:InputName.formatName(res.playerRental.map(m => m.species).join(', '),),
        searchTextNoNumberFormatted2:'',
        jtmonsText:res.jmons.map(m => m.displayName).join(', '),
        battleStyle:res.battleStyle,
        commonType:res.commonType,
        visible:true,
        farFromWantedRental:!!regex,
        trainer:res.trainer.name,
        rawRes:() => res,
        battleScore:0, //unused
        battleSelfScore:0, //unused
      });
    }

    if(regex)
      this.updateFarFromWantedRental(results);

    this.results_pokemonToInclude = this.pokemonToInclude;
    if(this.pokemonToInclude)
      this.results_pokemonToInclude2 = this.pokemonToInclude2;
    this.results_isFirstRoom = true;
    if(this.pokemonToInclude){
      const [start, end] = this.getLongestStreak(results);
      if (start === -1 || end === -1){
        this.longestStreak_start = -1;
        this.longestStreak_end = -1;
      } else {
        this.longestStreak_start = start + min;
        this.longestStreak_end = end + min;
      }
      this.results = results;
    } else {
      this.longestStreak_start = -1;
      this.longestStreak_end = -1;
      this.results = results;
    }

    this.updateResultVisibility();
  }
  useAsInput = function(this:Vue_bfRentalFinder_full, res:Vue_bfRentalFinder_data['results'][0]){
    this.winStreak = (+this.winStreak) + 1;
    const bfRes = res.rawRes();

    if (this.winStreak % 7 === 0){ //clear all
      this.trainersBattled.forEach(t => {
        t.input = '';
        this.updateTrainerInputName(t);
      });
      return;
    }

    const t = this.trainersBattled[(this.winStreak % 7) - 1];
    t.input = bfRes.trainer.name;
    this.updateTrainerInputName(t);

    bfRes.jmons.forEach((jmon,i) => {
      this.pokemonNames[i + 3].input = jmon.species;
      this.updatePokemonInputName(this.pokemonNames[i + 3]);
    });

    if(this.winStreak % 7 === 1){ //room1
      for(let i = 0 ; i < 3; i++){
        let p = bfRes.playerRental.find((p,j) => {
          return res.playerRental[j].selected === i;
        });

        this.pokemonNames[i].input = p ? p.displayName : '';
        this.updatePokemonInputName(this.pokemonNames[i]);
      }
    }
  }

  clickSelectRental  = function(this:Vue_bfRentalFinder_full, rentals:Vue_bfRentalFinder_data['results'][0]['playerRental'],rental:Vue_bfRentalFinder_data['results'][0]['playerRental'][0]){
    if (rental.selected !== -1){
      const old = rental.selected;
      rental.selected = -1;
      rentals.forEach(r => {
        if (r.selected !== -1 && r.selected > old)
          r.selected--;
      });
      return;
    }

    const selectedRentals = rentals.filter(r => r.selected !== -1);
    if (selectedRentals.length < 3){
      rental.selected = selectedRentals.length;
      return;
    }
    //decrement all rentals by 1
    rentals.forEach(r => {
      if (r.selected !== -1)
        r.selected--;
    });
    rental.selected = 2;
  }
  updateFarFromWantedRental = function(results:Vue_bfRentalFinder_data['results']){
    const CLOSE_COUNT = 5;
    for(let i = 0; i < results.length; i++)
      results[i].farFromWantedRental = true;

    for(let i = 0; i < results.length; i++){
      if (!results[i].hasPokemonToInclude)
        continue;
      for(let j = i - CLOSE_COUNT; j < i + CLOSE_COUNT; j++){
        if (j < 0 || j >= results.length)
          continue;
        results[j].farFromWantedRental = false;
      }
    }
  }

  getLongestStreak = function(includePokemon:Vue_bfRentalFinder_data['results']){
    let longest = 0;
    let longest_start = -1;
    let longest_end = -1;

    let curMin:number | null = null;
    for(let i = 0; i <= includePokemon.length; i++){
      const isEasy = i === includePokemon.length ? 0 : includePokemon[i].hasPokemonToInclude;
      if (isEasy){
        if (curMin === null)
          curMin = i;
        continue;
      } else {
        if (curMin === null)
          continue;
        const streak = i - curMin;
        if (streak <= longest){
          curMin = null;
          continue;
        }
        longest = streak;
        longest_start = curMin;
        longest_end = i - 1;
        curMin = null;
      }
    }
    return [longest_start, longest_end];
  }
  updateTrainerInputName = function(this:Vue_bfRentalFinder_full,t:TrainerInputName){
    const possTrainerRange = isNaN(+this.winStreak) ? null : GetTrainerIdRange(+this.winStreak);
    return TrainerInputName.update(t, possTrainerRange);
  }
  updateResultVisibility = function(this:Vue_bfRentalFinder_full){
    this.results_atLeastOneVisible = true;

    if(!this.rngCalib_active){
      this.results.forEach(r => {
        r.visible = true;
      });
      return;
    }

    const filter = InputName.formatName(this.rngCalib_pokemonName);
    this.results_atLeastOneVisible = false;

    const style = this.rngCalib_style === 'null' ? null : +this.rngCalib_style;
    const commonType = this.rngCalib_type === 'null' ? null : +this.rngCalib_type;
    this.results.forEach(r => {
      r.visible = (() => {
        if(!r.searchTextNoNumberFormatted.startsWith(filter) &&
           !r.searchTextNoNumberFormatted2.startsWith(filter))
          return false;
        if (style !== null && r.battleStyle !== style)
          return false;
        if (commonType !== null && r.commonType !== commonType)
          return false;
        return true;
      })();
      if(r.visible)
        this.results_atLeastOneVisible = true;
    });

  }

  generateSet = function(this:Vue_bfRentalFinder_full,winStreak:number, min:number, max:number){
    this.pastRentalCount = 0;
    this.winStreak = winStreak;
    this.pokemonToInclude = '';
    this.pokemonToInclude2 = '';
    this.rngFrame_min_1stRoom = min - 100;
    this.rngFrame_max_1stRoom = max + 100;
    this.generate();
    this.longestStreak_start = min;
    this.longestStreak_end = max;
    this.results.forEach(r => {
      r.hasPokemonToInclude = r.rngAdvCount >= min && r.rngAdvCount <= max;
    });
    this.hideFarFromWantedRental = true;
    this.results_pokemonToInclude = ' '; //bad, to force hideFarFromWantedRental
    this.updateFarFromWantedRental(this.results);
  }
  getDataToExport = function(this:Vue_bfRentalFinder_full){
    return {
      winStreak:+this.winStreak,
      isLvl50:this.isLvl50,
      pastRentalCount:+this.pastRentalCount,
      pokemonToInclude:this.pokemonToInclude,
      pokemonToInclude2:this.pokemonToInclude2,
      hideFarFromWantedRental:this.hideFarFromWantedRental,
      rngFrame_min_1stRoom:+this.rngFrame_min_1stRoom,
      rngFrame_max_1stRoom:+this.rngFrame_max_1stRoom,
      rngFrame_min_2ndRoom:+this.rngFrame_min_2ndRoom,
      rngFrame_max_2ndRoom:+this.rngFrame_max_2ndRoom,
      rngCalib_pokemonName:this.rngCalib_pokemonName,
      rngCalib_style:this.rngCalib_style,
      rngCalib_type:this.rngCalib_type,
      displayHowToUse:this.displayHowToUse,
      displayStrategy:this.displayStrategy,
      mustSimulateBattle:this.mustSimulateBattle,
      simulateBattleRange:this.simulateBattleRange,
      pokemonNames:this.pokemonNames.map(a => a.input),
      trainersBattled:this.trainersBattled.map(a => a.input),
    };
  }
  importData = function(this:Vue_bfRentalFinder_full, json:Partial<ReturnType<Vue_bfRentalFinder_full['getDataToExport']>>){
    if(typeof json.winStreak === 'number')
      this.winStreak = json.winStreak;
    if(typeof json.isLvl50 === 'boolean')
      this.isLvl50 = json.isLvl50;
    if(typeof json.pastRentalCount === 'number')
      this.pastRentalCount = json.pastRentalCount;
    if(typeof json.pokemonToInclude === 'string')
      this.pokemonToInclude = json.pokemonToInclude;
    if(typeof json.pokemonToInclude2 === 'string')
      this.pokemonToInclude2 = json.pokemonToInclude2;
    if(typeof json.hideFarFromWantedRental === 'boolean')
      this.hideFarFromWantedRental = json.hideFarFromWantedRental;
    if(typeof json.rngCalib_pokemonName === 'string')
      this.rngCalib_pokemonName = json.rngCalib_pokemonName;
    if(typeof json.rngCalib_style === 'string')
      this.rngCalib_style = json.rngCalib_style;
    if(typeof json.rngCalib_type === 'string')
      this.rngCalib_type = json.rngCalib_type;
    if(typeof json.rngFrame_min_1stRoom === 'number')
      this.rngFrame_min_1stRoom = json.rngFrame_min_1stRoom;
    if(typeof json.rngFrame_max_1stRoom === 'number')
      this.rngFrame_max_1stRoom = json.rngFrame_max_1stRoom;
    if(typeof json.rngFrame_min_2ndRoom === 'number')
      this.rngFrame_min_2ndRoom = json.rngFrame_min_2ndRoom;
    if(typeof json.rngFrame_max_2ndRoom === 'number')
      this.rngFrame_max_2ndRoom = json.rngFrame_max_2ndRoom;
    if(typeof json.displayHowToUse === 'boolean')
      this.displayHowToUse = json.displayHowToUse;
    if(typeof json.displayStrategy === 'boolean')
      this.displayStrategy = json.displayStrategy;
    if(typeof json.mustSimulateBattle === 'boolean')
      this.mustSimulateBattle = json.mustSimulateBattle;
    if(typeof json.simulateBattleRange === 'number')
      this.simulateBattleRange = json.simulateBattleRange;
    if(Array.isArray(json.pokemonNames)){
      json.pokemonNames.forEach((c,i) => {
        if (typeof c === 'string' && this.pokemonNames[i]){
          this.pokemonNames[i].input = c;
          this.updatePokemonInputName(this.pokemonNames[i]);
        }
      });
    }
    if(Array.isArray(json.trainersBattled)){
      json.trainersBattled.forEach((c,i) => {
        if (typeof c === 'string' && this.trainersBattled[i]){
          this.trainersBattled[i].input = c;
          this.updateTrainerInputName(this.trainersBattled[i]);
        }
      });
    }
  }
}

export type Vue_bfRentalFinder_full = Vue_bfRentalFinder_props & Vue_bfRentalFinder_data & Vue_bfRentalFinder_methods;

export class Vue_bfRentalFinder {
  static Component = Vue.component('Vue_bfRentalFinder', withRender(new Vue_bfRentalFinder()));

  static init(gameData2:GameData){
    gameData = gameData2; //BAD
  }

  props = Object.keys(new Vue_bfRentalFinder_props());
  methods = new Vue_bfRentalFinder_methods();
  data = function(){
    return new Vue_bfRentalFinder_data();
  }
  computed = {
  }
  watch = <any>{
    winStreak:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    isLvl50:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    pastRentalCount:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    pokemonToInclude:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    pokemonToInclude2:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    hideFarFromWantedRental:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    rngFrame_min_1stRoom:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    rngFrame_max_1stRoom:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    rngFrame_min_2ndRoom:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    rngFrame_max_2ndRoom:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    rngCalib_pokemonName:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    rngCalib_style:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    rngCalib_type:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    displayHowToUse:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    displayStrategy:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    pokemonNames:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    mustSimulateBattle:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
    simulateBattleRange:<any>function(this:Vue_bfRentalFinder_full){ this.saveToLocalStorage(); },
  }
  mounted = <any>function(this:Vue_bfRentalFinder_full){
  }
}


