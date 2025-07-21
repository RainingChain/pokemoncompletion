

//TODO
/*
{"version":1,"battledTmons":["Baltoy","Vulpix","Gible","Cyndaquil","Larvitar","Shieldon","","","","","","","","","","","","","","","","","","","","","",""],"winStreak":"0","battleRoom":"double","mode":"find_team","sameDaySeed":"0xABCDEF12"}
*/
import "../../common/css/common.css";
import "../../common/css/globalStyle.css";
import "../../pokemonArticles/home/pokemonGlobal.css";

import "../../pokemonCompletion/icons/pokemonCompletionIconSheet.css";

import "../../pokemonCompletion/pokemonCompletion.css"; //after pokemonCompletionIconSheet.css to overwrite img url

import "./pkPtRngAbuse.css";

import { Vue_nav } from "../../common/views/nav";
Vue_nav.createAndMount();

import { Vue_analytics } from "../../common/views/analytics";
Vue_analytics.createAndMount();

import { GameData, getData,Trainer,JsonTrainerPokemon } from "../data/getData";


import {getShedinjaDmgInfo} from "../pkRngMonRating/pkRngMonRating_shedinja";

import {Executor,WasmResult,WasmResponse,MyTests} from "./wasm_pkg/main";
import withRender from "./pkPtRngAbuse.vue";
import {PokemonName,TrainerInputName} from "../pkRngAbuse/Vue_input";
import {getNationalDexFromSpecies} from "./const";
import Vue from "vue";

const STORAGE_VERSION = 1;

type THIS = Vue_pkPtRngAbuse_data & Vue_pkPtRngAbuse_methods;

enum Mode {
  find_seed = "find_seed",
  search_easy = "search_easy",
  find_team = "find_team",
  generate_one = "generate_one",
  seed_formula = "seed_formula",
}

enum BattleRoom {
  single = 'single',
  double = 'double',
}

class Result {
  constructor(extra:Partial<Result>){
    Object.assign(this, extra);
  }

  sameDaySeed = 0;
  diffDaySeed:number | null = null;
  tmons:{species:string,ability:string,nationalDex:number,shortDesc:string,desc:string, rating:number | null}[][] = [];
  clockDateChanges:string[] = []
  sameDayAdv:number | null = null;
  diffDayAdv: number | null = null;
  rating:number | null = null;
  pmonDesc:string[] = [];
  pmonTitle = '';
  pmonNationalDex = 0;
  facility = 0;
  wins = 0;
  search_prevSameDayResult:{species:string,nationalDex:number}[] = [];
}

class Vue_pkPtRngAbuse_data {
  constructor(public gameData:GameData){
    for(let i = 0 ; i < 7; i++){
      this.battledTrainers.push(TrainerInputName.create(gameData));
      this.battledTmons.push([]);
      for(let j = 0 ; j < 4; j++){
        this.battledTmons[i].push(PokemonName.create(gameData, `Trainer #${i+1} Pokemon #${j+1}`, true));
      }
    }
  }
  Mode = JSON.parse(JSON.stringify(Mode));
  BattleRoom = JSON.parse(JSON.stringify(BattleRoom));

  mode = Mode.find_seed;
  resultsMode:Mode | null = null;
  battleRoom = BattleRoom.double;
  battleRoom_search_easy = BattleRoom.single;
  winStreak = '0';
  winStreak_search_easy = '0';
  at_least_one_same_day_adv = true;
  sameDaySeed = '0xAAAABBBB';
  diffDaySeed = '0xCCCCDDDD';
  battledTmons:PokemonName[][] = [];
  battledTrainers:TrainerInputName[] = [];
  diffDayAdv = '0';
  sameDayAdv = '0';
  maxClockChange = '10';
  maxSameDayAdvCount = '10';
  errors:string[] = [];
  pmons = [
    {idx:[0], items:['Focus Sash'], owned:true, name:'Shedinja',nationalDex:292, nature:'Adamant', evIv:'EV: 252 Atk, 252 Spe. IV: 31 Atk, 31 Spe.', moves:'Sword Dance, Shadow Sneak, X-Scissor, Dig'},
    {idx:[1,2,3], items:['Choice Band','Choice Scarf','Life Orb'], owned:true, name:'Infernape',nationalDex:392, nature:'Adamant', evIv:'EV: 252 Atk, 252 Spe. IV: 31 Atk, 31 Spe.', moves:'Close Combat, Flare Blitz, Earthquake, Thunder Punch'},
    {idx:[4,5,6], items:['Choice Band','Choice Scarf','Life Orb'], owned:true, name:'Infernape',nationalDex:392,nature:'Jolly', evIv:'EV: 252 Atk, 252 Spe. IV: 31 Atk, 31 Spe.', moves:'Close Combat, Flare Blitz, Earthquake, Thunder Punch'},
    {idx:[7,8,9], items:['Choice Specs','Choice Scarf','Life Orb'], owned:true, name:'Latios',nationalDex:381,nature:'Modest',evIv:'EV: 252 Spa, 252 Spe. IV: 31 Spa, 31 Spe.', moves:'Psychic, Grass Knot, Ice Beam, Thunderbolt'},
    {idx:[10,11,12], items:['Choice Specs','Choice Scarf','Life Orb'], owned:true, name:'Latios',nationalDex:381,nature:'Timid', evIv:'EV: 252 Spa, 252 Spe. IV: 31 Spa, 31 Spe.', moves:'Psychic, Grass Knot, Ice Beam, Thunderbolt'},
    {idx:[13,14,15], items:['Choice Band','Choice Scarf','Life Orb'], owned:true, name:'Garchomp',nationalDex:445,nature:'Adamant', evIv:'EV: 252 Atk, 252 Spe. IV: 31 Atk, 31 Spe.', moves:'Dragon Claw, Earthquake, Crunch, Poison Jab'},
    {idx:[16,17,18], items:['Choice Band','Choice Scarf','Life Orb'], owned:true, name:'Garchomp',nationalDex:445,nature:'Jolly', evIv:'EV: 252 Atk, 252 Spe. IV: 31 Atk, 31 Spe. ', moves:'Dragon Claw, Earthquake, Crunch, Poison Jab'},

// Infernape Jolly/Adamant  Close Combat,Flare Blitz,Earthquake,Thunder Punch
// Latios Modest/Timid
// Garchomp x2              Dragon Claw,Earthquake,Crunch,Poison Jab
  ];

  displayCredits = false;
  displaySummary = true;
  displayHowToUse = true;

  displayImportExport = false;
  importExportDataTxt = '';
  importExportDataTxtErr = '';

  isActiveSaveToLocalStorage = false;
  currentExecutorId:number | null = null;
  nextExecutorId = 0;
  progressCurrent = 0;
  progressTodo = 0;
  results:Result[] | null = null;
}



class Vue_pkPtRngAbuse_methods {
  log = function(...args:any[]){
    console['log'](...args);
  }
  init = async function(this:THIS){
    if(this.importExportDataTxt)
      this.importData(this.importExportDataTxt);
    else
      this.loadFromLocalStorage();

    this.isActiveSaveToLocalStorage = true;
  }
  getBattleRoom = function(this:THIS){
    return this.mode === Mode.search_easy ? this.battleRoom_search_easy : this.battleRoom;
  }
  getWinStreak = function(this:THIS){
    return this.mode === Mode.search_easy ? this.winStreak_search_easy : this.winStreak;
  }
  get_mon_by_battle = function(this:THIS){
    return this.getBattleRoom() === BattleRoom.single ? 3 : 4;
  }
  get_battled_pokemons_names = function(this:THIS){
    let names:string[] = [];
    for(const grp of this.battledTmons){
      for(let j = 0 ; j < this.get_mon_by_battle(); j++){
        let tmon = grp[j];
        if(!tmon.computedValue){
          if(tmon.input)
            return null; //invalid
          return names; //nothing written
        }
        names.push(tmon.computedValue.species.replace(/\W/g,''));
      }
    }
    return names;
  }
  get_battled_trainer_names = function(this:THIS){
    let names:string[] = [];
    for(const t of this.battledTrainers){
        if(!t.computedValue){
          if(t.input)
            return null; //invalid
          return names; //nothing written
        }
      names.push(t.computedValue.givenName.replace(/\W/g,''));
    }
    return names;
  }
  validateInput_hex = function(this:THIS, hex:string){
    if(!hex.toLowerCase().startsWith('0x'))
      return false;
    const invalidChar = hex.toLowerCase().slice(2).match(/[^0-9a-f]/);
    return !invalidChar;
  }
  validateInput_dec = function(this:THIS, dec:string){
    if(!dec)
      return false;
    const invalidChar = dec.match(/[^0-9]/);
    return !invalidChar;
  }
  validateInput = function(this:THIS){
    const errors:string[] = [];

    if (this.mode !== Mode.seed_formula){
      if(!this.validateInput_dec(this.getWinStreak()))
        errors.push(`Invalid Win count (${this.getWinStreak()}). Expected number in decimal format. Ex: 0`);
    }
    if (this.mode === Mode.generate_one || this.mode === Mode.search_easy){
      if(!this.validateInput_hex(this.sameDaySeed))
        errors.push(`Invalid Same day seed (${this.sameDaySeed}). Expected number in hex format starting with 0x. Ex: 0x1234ABCD`);
    }
    if (this.mode === Mode.search_easy){
      if(this.battleRoom_search_easy === BattleRoom.double)
        errors.push(`Battle room Double isn't supported yet.`);

      if(!this.validateInput_hex(this.diffDaySeed))
        errors.push(`Invalid Different day seed (${this.diffDaySeed}). Expected number in hex format starting with 0x. Ex: 0x1234ABCD`);

      if(!this.validateInput_dec(this.maxClockChange))
        errors.push(`Invalid Max DS clock date change (${this.maxClockChange}). Expected number in decimal format. Ex: 10`);

      if(!this.validateInput_dec(this.maxSameDayAdvCount))
        errors.push(`Invalid Max same day advance count (${this.maxSameDayAdvCount}). Expected number in decimal format. Ex: 10`);

      if(this.pmons.every(p => !p.owned))
        errors.push(`At least one Player Pokemon must be selected.`);
    }

    if (this.mode === Mode.find_seed || this.mode === Mode.find_team){
      //pnames and tnames are already sure to be valid.
      let pnames = this.get_battled_pokemons_names();
      if(!pnames)
        errors.push(` One of the Pokemon name is invalid.`);
      else if(pnames.length < this.get_mon_by_battle())
        errors.push(` ${pnames.length} valid Pokemon names were provided but at least ${this.get_mon_by_battle()} are needed.`);

      let tnames = this.get_battled_trainer_names();
      if(!tnames)
        errors.push(` One of the trainer name is invalid.`);
      else if (tnames.length === 0)
        errors.push(` No trainer names were provided. At least 1 is needed.`);
    }

    if (this.mode === Mode.seed_formula){
      if(!this.validateInput_dec(this.sameDayAdv))
        errors.push(`Invalid Same day advance count (${this.sameDayAdv}). Expected number in decimal format. Ex: 0`);

      if(!this.validateInput_dec(this.diffDayAdv))
        errors.push(`Invalid Different day advance count (${this.diffDayAdv}). Expected number in decimal format. Ex: 0`);

      if (+this.diffDayAdv > 0){
        if(!this.validateInput_hex(this.diffDaySeed))
          errors.push(`Invalid Different day seed (${this.diffDaySeed}). Expected number in hex format starting with 0x. Ex: 0x1234ABCD`);
      } else {
        if(!this.validateInput_hex(this.sameDaySeed))
          errors.push(`Invalid Same day seed (${this.sameDaySeed}). Expected number in hex format starting with 0x. Ex: 0x1234ABCD`);
      }
      return errors;
    }

    return errors;
  }
  calculate = async function(this:THIS){
    if(this.currentExecutorId !== null)
      return;
    this.errors = this.validateInput();
    if (this.errors.length)
      return;

    this.results = null;
    this.resultsMode = null;
    const mode = this.mode;

    let start = `--facility ${this.getBattleRoom()} --wins ${this.getWinStreak()}`;
    Executor.onprogress = (c,t) => {
      this.progressCurrent = c * (Executor.activeWorkers.length || 1);
      this.progressTodo = t * (Executor.activeWorkers.length || 1);
      if(this.progressCurrent > this.progressTodo)
        this.progressCurrent = this.progressTodo;
    };
    const execId = this.nextExecutorId;
    this.nextExecutorId++;
    this.currentExecutorId = execId;
    this.progressCurrent = 0;
    this.progressTodo = 0;
    let res:WasmResponse | null = null;
    //console.time('calculate');
    if (this.mode === Mode.generate_one){
      const cmd = `generate_one ${start} --same_day_seed ${this.sameDaySeed}`;
      res = await Executor.exec_wasm(cmd);
    } else if(this.mode === Mode.find_seed || this.mode === Mode.find_team){
      let pnames = this.get_battled_pokemons_names()?.join(',') || '';
      let tnames = this.get_battled_trainer_names()?.join(',') || '';
      const cmd = `find_seeds ${start} --battled_pokemons ${pnames} --battled_trainers ${tnames}`;
      res = await Executor.exec_wasm(cmd);
    } else if(this.mode === Mode.search_easy){
      let pmonFilter = this.pmons.filter(p => p.owned).map(p => p.idx).flat().join(',');
      let at_least_one_same_day_adv = this.at_least_one_same_day_adv && (+this.maxSameDayAdvCount > 0);
      const cmd = [
        `search_easy ${start}`,
        `--same_day_seed ${this.sameDaySeed}`,
        `--diff_day_seed ${this.diffDaySeed}`,
        `--filter_min_rating 1`,
        `--max_diff_day_change ${this.maxClockChange}`,
        `--max_same_day_adv ${this.maxSameDayAdvCount}`,
        `--player_pokemons_idx_filter ${pmonFilter}`,
        `--at_least_one_same_day_adv ${at_least_one_same_day_adv}`
      ].join(' ');
      res = await Executor.exec_wasm(cmd);
      res.results = res.results.slice(0,3); //avoid too many results
    } else if(this.mode === Mode.seed_formula){
      this.results = this.calculateSeed();
      this.resultsMode = mode;
      this.currentExecutorId = null;
      //console.timeEnd('calculate');
      return;
    }
    //console.timeEnd('calculate');

    if (res === null)
      return;

    if (this.currentExecutorId !== execId) // aka execution was stopped
      return;

    const results = res.results.map(r => this.wasmResultToResult(r));
    const errors = res.errors;
    if (mode === Mode.search_easy){
      for(let r of results){
        let newErrs = await this.calculateSearchPrevSameDayResult(r);
        if(newErrs)
          errors.push(...newErrs);
      }
    }

    if (this.currentExecutorId !== execId) // aka execution was stopped
      return;

    this.errors = errors;
    this.results = results;
    this.resultsMode = mode;
    this.currentExecutorId = null;
  }
  debug = function(this:THIS){
    this.resultsMode = Mode.find_seed;
    this.results = <any>[{"sameDaySeed":1829313114,"diffDaySeed":2614015461,"tmons":[[{"species":"Baltoy","ability":"Levitate","nationalDex":343,"desc":"Baltoy 1, Twisted Spoon, Levitate, Modest, Psybeam, Mud-Slap, Ancient Power, Light Screen","shortDesc":"Baltoy 1","rating":null,"pmonMove":null},{"species":"Vulpix","ability":"Flash Fire","nationalDex":37,"desc":"Vulpix 1, BrightPowder, Flash Fire, Calm, Ember, Swift, Will-O-Wisp, Confuse Ray","shortDesc":"Vulpix 1","rating":null,"pmonMove":null},{"species":"Gible","ability":"Sand Veil","nationalDex":443,"desc":"Gible 1, Soft Sand, Sand Veil, Adamant, Dragon Rage, Sand Tomb, Metal Claw, Sandstorm","shortDesc":"Gible 1","rating":null,"pmonMove":null},{"species":"Cyndaquil","ability":"Blaze","nationalDex":155,"desc":"Cyndaquil 1, Quick Claw, Blaze, Adamant, Flame Wheel, Double Kick, Swift, Smokescreen","shortDesc":"Cyndaquil 1","rating":null,"pmonMove":null}],[{"species":"Castform","ability":"Forecast","nationalDex":351,"desc":"Castform 1, Persim Berry, Forecast, Timid, Weather Ball, Sunny Day, Rain Dance, Hail","shortDesc":"Castform 1","rating":null,"pmonMove":null},{"species":"Remoraid","ability":"Hustle","nationalDex":223,"desc":"Remoraid 1, Petaya Berry, Hustle, Modest, Bubble Beam, Aurora Beam, Mud-Slap, Supersonic","shortDesc":"Remoraid 1","rating":null,"pmonMove":null},{"species":"Mudkip","ability":"Torrent","nationalDex":258,"desc":"Mudkip 1, Mystic Water, Torrent, Modest, Water Pulse, Icy Wind, Mud-Slap, Growl","shortDesc":"Mudkip 1","rating":null,"pmonMove":null},{"species":"Lombre","ability":"Rain Dish","nationalDex":271,"desc":"Lombre 1, Damp Rock, Rain Dish, Quiet, Water Pulse, Mega Drain, Fake Out, Rain Dance","shortDesc":"Lombre 1","rating":null,"pmonMove":null}],[{"species":"Larvitar","ability":"Guts","nationalDex":246,"desc":"Larvitar 1, Liechi Berry, Guts, Adamant, Rock Slide, Dig, Bite, Scary Face","shortDesc":"Larvitar 1","rating":null,"pmonMove":null},{"species":"Shieldon","ability":"Sturdy","nationalDex":410,"desc":"Shieldon 1, Focus Band, Sturdy, Sassy, Iron Head, Rock Tomb, Swagger, Iron Defense","shortDesc":"Shieldon 1","rating":null,"pmonMove":null},{"species":"Croagunk","ability":"Anticipation","nationalDex":453,"desc":"Croagunk 1, Black Sludge, Anticipation, Adamant, Poison Jab, Wake-Up Slap, Taunt, Swagger","shortDesc":"Croagunk 1","rating":null,"pmonMove":null},{"species":"Onix","ability":"Rock Head","nationalDex":95,"desc":"Onix 1, Hard Stone, Rock Head, Adamant, Rock Slide, Dig, Screech, Sandstorm","shortDesc":"Onix 1","rating":null,"pmonMove":null}],[{"species":"Loudred","ability":"Soundproof","nationalDex":294,"desc":"Loudred 1, Persim Berry, Soundproof, Adamant, Stomp, Bite, Howl, Supersonic","shortDesc":"Loudred 1","rating":null,"pmonMove":null},{"species":"Clefairy","ability":"Magic Guard","nationalDex":35,"desc":"Clefairy 1, BrightPowder, Magic Guard, Adamant, Wake-Up Slap, Follow Me, Encore, Sing","shortDesc":"Clefairy 1","rating":null,"pmonMove":null},{"species":"Pidgeotto","ability":"Tangled Feet","nationalDex":17,"desc":"Pidgeotto 1, Rawst Berry, Tangled Feet, Adamant, Wing Attack, Quick Attack, Feather Dance, Mirror Move","shortDesc":"Pidgeotto 1","rating":null,"pmonMove":null},{"species":"Turtwig","ability":"Overgrow","nationalDex":387,"desc":"Turtwig 1, Occa Berry, Overgrow, Adamant, Razor Leaf, Bite, Tickle, Withdraw","shortDesc":"Turtwig 1","rating":null,"pmonMove":null}],[{"species":"Munchlax","ability":"Pickup","nationalDex":446,"desc":"Munchlax 1, Sitrus Berry, Pickup, Relaxed, Metronome, Recycle, Stockpile, Swallow","shortDesc":"Munchlax 1","rating":null,"pmonMove":null},{"species":"Yanma","ability":"Compoundeyes","nationalDex":193,"desc":"Yanma 1, Lax Incense, Compoundeyes, Timid, Silver Wind, Air Cutter, Double Team, Detect","shortDesc":"Yanma 1","rating":null,"pmonMove":null},{"species":"Ledian","ability":"Early Bird","nationalDex":166,"desc":"Ledian 1, Razor Claw, Early Bird, Timid, Silver Wind, Air Cutter, Agility, Baton Pass","shortDesc":"Ledian 1","rating":null,"pmonMove":null},{"species":"Wailmer","ability":"Oblivious","nationalDex":320,"desc":"Wailmer 1, Sea Incense, Oblivious, Modest, Water Pulse, Icy Wind, Roar, Mist","shortDesc":"Wailmer 1","rating":null,"pmonMove":null}],[{"species":"Illumise","ability":"Oblivious","nationalDex":314,"desc":"Illumise 1, Petaya Berry, Oblivious, Timid, Silver Wind, Swift, Wish, Helping Hand","shortDesc":"Illumise 1","rating":null,"pmonMove":null},{"species":"Murkrow","ability":"Insomnia","nationalDex":198,"desc":"Murkrow 1, BlackGlasses, Insomnia, Jolly, Feint Attack, Wing Attack, Torment, Taunt","shortDesc":"Murkrow 1","rating":null,"pmonMove":null},{"species":"Aipom","ability":"Pickup","nationalDex":190,"desc":"Aipom 1, Silk Scarf, Pickup, Adamant, Double Hit, U-turn, Thunder Wave, Fake Out","shortDesc":"Aipom 1","rating":null,"pmonMove":null},{"species":"Chatot","ability":"Keen Eye","nationalDex":441,"desc":"Chatot 1, Persim Berry, Keen Eye, Calm, Chatter, Swift, Sing, Mirror Move","shortDesc":"Chatot 1","rating":null,"pmonMove":null}],[{"species":"Cherrim","ability":"Flower Gift","nationalDex":421,"desc":"Cherrim 1, Persim Berry, Flower Gift, Bold, Magical Leaf, Leech Seed, Grass Whistle, Synthesis","shortDesc":"Cherrim 1","rating":null,"pmonMove":null},{"species":"Kadabra","ability":"Inner Focus","nationalDex":64,"desc":"Kadabra 1, Twisted Spoon, Inner Focus, Timid, Confusion, Role Play, Disable, Future Sight","shortDesc":"Kadabra 1","rating":null,"pmonMove":null},{"species":"Marshtomp","ability":"Torrent","nationalDex":259,"desc":"Marshtomp 1, Focus Band, Torrent, Modest, Mud Shot, Water Pulse, Ancient Power, Growl","shortDesc":"Marshtomp 1","rating":null,"pmonMove":null},{"species":"Wormadam","ability":"Anticipation","nationalDex":413,"desc":"Wormadam 1, Coba Berry, Anticipation, Adamant, Razor Leaf, Bug Bite, Protect, Captivate","shortDesc":"Wormadam 1","rating":null,"pmonMove":null}]],"clockDateChanges":[],"sameDayAdv":null,"diffDayAdv":null,"rating":0,"pmonDesc":[],"pmonTitle":"","pmonNationalDex":0}];
  }
  clickFindEasyTrainer = function(this:THIS,r:Result){
    this.mode = Mode.search_easy;
    this.battleRoom_search_easy = this.battleRoom === BattleRoom.single ? BattleRoom.double : BattleRoom.single;
    this.sameDaySeed = '0x' + r.sameDaySeed.toString(16);
    this.diffDaySeed = '0x' + (r.diffDaySeed || 0).toString(16);
  }
  calculateSeed = function(this:THIS){
    const SameDayRNG = (seed:bigint) => {
      return (seed * BigInt(1566083941) + BigInt(1)) % BigInt(4294967296);
    };
    const DiffDayRNG = (seed:bigint) => {
      return (seed * BigInt(1812433253) + BigInt(1)) % BigInt(4294967296);
    };

    let diffDayAdv = +this.diffDayAdv;
    let sameDayAdv = +this.sameDayAdv;
    if (diffDayAdv > 0){
      let s = BigInt(+this.diffDaySeed);
      for (let i = 0 ; i < diffDayAdv; i++)
        s = DiffDayRNG(s);
      let newDiffDaySeed = Number(s);
      for (let i = 0 ; i < 1 + sameDayAdv; i++)
        s = SameDayRNG(s);
      return [new Result({sameDaySeed:Number(s), diffDaySeed:newDiffDaySeed})];
    } else {
      let s = BigInt(+this.sameDaySeed);
      for (let i = 0 ; i < sameDayAdv; i++)
        s = SameDayRNG(s);
      return [new Result({sameDaySeed:Number(s)})];
    }
  }
  wasmResultToResult = function(this:THIS, wr:WasmResult){
    let tmons:Result['tmons'] = wr.jtrainers.map(jt => {
      return jt.rtmons.map(tmon => {
        let jtmon = this.gameData.trainerPokemons[tmon.id];
        let abName = jtmon.abilities[tmon.ability] || jtmon.abilities[0];
        let desc = `${jtmon.displayName}, ${jtmon.item}, ${abName}, ${jtmon.nature}, ${jtmon.moves.join(', ')}`;
        let shortDesc = jtmon.displayName;
        if(wr.pmon_idx !== null && tmon.rating !== 1){ //shedinja
          let pmon = this.pmons[wr.pmon_idx];
          if (pmon.name === "Shedinja"){
            const dmgInfo = getShedinjaDmgInfo(this.gameData, pmon.nature, tmon.id, tmon.ability);
            shortDesc += ' | ' + dmgInfo;
          }
        }
        return {
          species:jtmon.species,
          ability:abName,
          nationalDex:getNationalDexFromSpecies(jtmon.species) || 0,
          desc,
          shortDesc,
          rating:tmon.rating,
          pmonMove:jt.move_name,
        };
      });
    });

    return new Result({
      sameDaySeed:wr.same_day_seed,
      diffDaySeed:wr.diff_day_seed,
      tmons,
      diffDayAdv:wr.diff_day_seed_adv,
      sameDayAdv:wr.same_day_seed_adv,
      clockDateChanges:wr.clock_date_changes,
      rating:wr.rating,
      ...this.getPmonDesc(wr.pmon_idx),
      facility:wr.facility,
      wins:wr.wins,
    });
  }
  calculateSearchPrevSameDayResult = async function(this:THIS,r:Result){
    if(r.sameDayAdv === 0)
      return [];
    let prevSame = (y:bigint) => ((y - BigInt(1)) * BigInt(1786162797)) % BigInt(4294967296);
    const prevSeed = '0x' + prevSame(BigInt(r.sameDaySeed)).toString(16);
    const cmd = `generate_one --facility double --wins 0 --same_day_seed ${prevSeed}`;
    let res = await Executor.exec_wasm(cmd);
    if (res.errors.length)
      return res.errors;
    else if(!res.results.length)
      return [];

    let ids = [res.results[0].jtrainers[0].rtmons[0].id, res.results[0].jtrainers[0].rtmons[1].id];

    r.search_prevSameDayResult = ids.map(id => {
      let jtmon = this.gameData.trainerPokemons[id];
      return {species:jtmon.species, nationalDex:getNationalDexFromSpecies(jtmon.species) || 0};
    });
    return [];
  }
  setSeedsAsInput = function(this:THIS, r:Result){
    this.sameDaySeed = '0x' + r.sameDaySeed.toString(16);
    this.diffDaySeed = '0x' + (r.diffDaySeed || 0).toString(16);
    this.winStreak_search_easy = '' + ((+r.wins) + 7);
  }
  areInputSeedsSameAsResult = function(this:THIS,r:Result){
    return this.sameDaySeed === '0x' + r.sameDaySeed.toString(16) &&
            this.diffDaySeed === '0x' + (r.diffDaySeed || 0).toString(16) &&
            this.winStreak_search_easy === '' + ((+r.wins) + 7);
  }

  getPmonDesc = function(this:THIS, pmon_idx:number | null){
    if(pmon_idx === null)
      return {};
    let pmon = this.pmons.find(p => p.idx.includes(pmon_idx!)) || null;
    if(pmon === null)
      return {};
    let item = pmon.items[pmon.idx.indexOf(pmon_idx)];
    let pmonTitle = `${pmon.name} ${pmon.nature} ${item} ${pmon.evIv} ${pmon.moves}`;
    return {pmonDesc:[pmon.name, pmon.nature, item], pmonTitle,pmonNationalDex:pmon.nationalDex};
  }
  ratingToCssClass = function(this:THIS, rating:number | null){
    if(rating === null)
      return '';
    if(rating >= 1)
      return 'cs-green';
    if(rating === 0)
      return 'cs-red';
    return '';
  }
  numberWithCommas = function(this:THIS, x:number) {
    return x.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  isCalculating = function(this:THIS){
    return this.currentExecutorId !== null;
  }
  stop = async function(this:THIS){
    if(this.currentExecutorId === null)
      return;
    Executor.terminateAll();
    this.currentExecutorId = null;
    this.progressCurrent = 0;
    this.progressTodo = 0;
  }
  toHex = function(this:THIS, n:number){
    return '0x' + n.toString(16).padStart(8, '0').toUpperCase();
  }
  updateBattledTrainer = function(this:THIS, t:TrainerInputName){
    TrainerInputName.update(t, null);
  }
  updateBattledTmon = function(this:THIS, tmon:PokemonName){
    PokemonName.update(tmon);
  }
  exportData = function(this:THIS){
    this.importExportDataTxt = JSON.stringify(this.getDataToExport());
  }
  saveToLocalStorage = function(this:THIS){
    if(!this.isActiveSaveToLocalStorage)
      return;
    try {
      const jsonStr = JSON.stringify(this.getDataToExport());
      localStorage.setItem('pkPtRngAbuse_input',jsonStr);
    } catch(err){
      console.error('saveToLocalStorage', err);
    }
  }
  loadFromLocalStorage = function(this:THIS){
    try {
      const jsonStr = localStorage.getItem('pkPtRngAbuse_input');
      if(!jsonStr)
        return;
      this.importData(jsonStr);
    } catch(err){
      console.error(err);
    }
  }
  getDataToExport = function(this:THIS){
    return {
      version:STORAGE_VERSION,
      battledTmons:this.battledTmons.flat().map(a => a.input),
      battledTrainers:this.battledTrainers.map(a => a.input),
      winStreak:this.winStreak,
      winStreak_search_easy:this.winStreak_search_easy,
      at_least_one_same_day_adv:this.at_least_one_same_day_adv,
      battleRoom:this.battleRoom,
      battleRoom_search_easy:this.battleRoom_search_easy,
      mode:this.mode,
      sameDaySeed:this.sameDaySeed,
      diffDayAdv:this.diffDayAdv,
      sameDayAdv:this.sameDayAdv,
      diffDaySeed:this.diffDaySeed,
      maxClockChange:this.maxClockChange,
      maxSameDayAdvCount:this.maxSameDayAdvCount,
      pmons:this.pmons.map(p => p.owned),
    };
  }
  importData = function(this:THIS,str:string){
    this.importExportDataTxtErr = '';
    try {
      const json:Partial<ReturnType<Vue_pkPtRngAbuse_methods['getDataToExport']>> = JSON.parse(str);
      if (json.version !== STORAGE_VERSION){
        this.importExportDataTxtErr = 'Error: The data format provided is no longer supported.';
        return;
      }
      if(Array.isArray(json.battledTmons)){
        json.battledTmons.forEach((tmonName,i) => {
          let tidx = Math.floor(i / 4);
          let midx = i % 4;
          if(typeof tmonName !== 'string' || tidx >= this.battledTmons.length)
            return;
          let tmon = this.battledTmons[tidx][midx];
          if(tmon.input === tmonName)
            return;
          tmon.input = tmonName;
          PokemonName.update(tmon);
        });
      }
      if(Array.isArray(json.pmons)){
        json.pmons.forEach((val,tidx) => {
          if (tidx >= this.pmons.length)
            return;
          this.pmons[tidx].owned = !!val;
        });
      }
      if(Array.isArray(json.battledTrainers)){
        json.battledTrainers.forEach((tname,tidx) => {
          if(typeof tname !== 'string' || tidx >= this.battledTrainers.length)
            return;
          let t = this.battledTrainers[tidx];
          if(t.input === tname)
            return;
          t.input = tname;
          TrainerInputName.update(t, null);
        });
      }
      let setStrs = <T extends keyof typeof json>(what:T[]) => {
        what.forEach(w => {
          if (typeof json[w] === 'string')
            (<any>this)[w] = json[w];
        });

      };
      setStrs(['winStreak','winStreak_search_easy','diffDayAdv','sameDayAdv','maxClockChange','maxSameDayAdvCount','diffDaySeed','battleRoom','battleRoom_search_easy','mode','sameDaySeed',]);

      this.at_least_one_same_day_adv = !!json.at_least_one_same_day_adv;
    } catch(err){
      this.importExportDataTxtErr = 'Error: Invalid format. ' + err.message;
    }
  }
  clearAllBattledTmons = function(this:THIS){
    this.battledTmons.forEach(t => {
      t.forEach(t2 => {
        t2.clear();
      });
    });
    this.battledTrainers.forEach(t => {
      t.clear();
    });
  }
}

document.addEventListener("DOMContentLoaded",async function(){
  const gameData = await getData(window.location.pathname);
  if(!gameData)
    return console['error']('invalid pathname',window.location.pathname);

  (<any>window).gameData = gameData;

  const vue = {
    data:new Vue_pkPtRngAbuse_data(gameData),
    methods: new Vue_pkPtRngAbuse_methods(),
  };

  const v = new Vue(withRender(vue));

  (<any>window).v = v;

  v.$mount('#main-slot');
  Vue.nextTick(async () => {
    await (<THIS><any>v).init();
  });
});