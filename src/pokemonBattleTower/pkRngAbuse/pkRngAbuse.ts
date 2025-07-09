

import "../../common/css/common.css";
import "../../common/css/globalStyle.css";
import "../../pokemonArticles/home/pokemonGlobal.css";

import "../../pokemonCompletion/icons/pokemonCompletionIconSheet.css";

import "../../pokemonCompletion/pokemonCompletion.css"; //after pokemonCompletionIconSheet.css to overwrite img url

import "./pkRngAbuse.css";

import { Vue_nav } from "../../common/views/nav";
Vue_nav.createAndMount();

import { Vue_analytics } from "../../common/views/analytics";
Vue_analytics.createAndMount();

import { GameData, getData,Trainer,JsonTrainerPokemon } from "../data/getData";
import withRender from "./pkRngAbuse.vue";
import "./Vue_pkRngAbuseResult";
import {  AlgoSection, Facility,Options,PalaceOldManMsg,Filter, FilterMon,Gender,Range, getGender,FactoryPikeMode,forEachAbilityAndGender } from "./Structs";
import {VueRangeResult,Result_i, VueResult} from "./VueResult";
import * as CONST from "./const";
import {FACTORY_STYLE_TO_NAME,TYPE_TO_NAME} from "./const";
import Vue from "vue";
import {VblankRangeCalc} from "./CycleCountPerVblank";
import howToImgUrl from "./pkRngAbuse_img.png";
import {Rng} from "../pkRngAbuse/Rng";
(<any>window).Rng = Rng;

import {TrainerInputName, JtmonInputName,InputName,PokemonName} from "./Vue_input";

import {BtGenerator} from "./BattleTower/BtGenerator";
import {BtProbabilityGraph} from "./BattleTower/BtProbabilityGraph";
import {BfGenerator} from "./BattleFactory/BfGenerator";
import {Vue_pkRngFrameInput_data,Vue_pkRngFrameInput_full,NodeLaunchOptions,NodeInputType} from "./BattleTower/Vue_pkRngFrameInput";

import "./BattlePyramid/Vue_bpyVisualizer";
import {Vue_bpyVisualizer_full} from "./BattlePyramid/Vue_bpyVisualizer";

import "./BattlePike/Vue_bpiClusterFinder";
import {Vue_bpiClusterFinder_full} from "./BattlePike/Vue_bpiClusterFinder";

import "./BattleFactory/Vue_bfRentalFinder";
import {Vue_bfRentalFinder_full,Vue_bfRentalFinder} from "./BattleFactory/Vue_bfRentalFinder";

/*

--------------------





battletower: bt, done
arena: same as bt, done
palace: same as bt,  done
pyramid: done

factory: GenerateOpponentMons, no vblank.  once GenerateOpponentMons is done, FillFactoryFrontierTrainerParty
  for player mon: GenerateInitialRentalMons

pike: TODO


-----
dome: not need. too easy



*/

type THIS = Vue_pkRngAbuse_data & Vue_pkRngAbuse_methods & {$refs:{
  rngCalib_tower:Vue_pkRngFrameInput_full,
  rngCalib_arena:Vue_pkRngFrameInput_full,
  rngCalib_palace:Vue_pkRngFrameInput_full,
  rngCalib_pike:Vue_pkRngFrameInput_full,
  rngCalib_factory:Vue_pkRngFrameInput_full,
  bpyVisualizer:Vue_bpyVisualizer_full,
  bfRentalFinder:Vue_bfRentalFinder_full,
  bpiClusterFinder:Vue_bpiClusterFinder_full,
}};

const STORAGE_VERSION = 3;



class Vue_pkRngAbuse_data {
  constructor(public gameData:GameData){
    this.gameData.trainers.forEach(t => {
      this.trainerByFormattedName.push({formattedName:Vue_pkRngAbuse_methods.formatName(t.name), trainer:t});
    });
    this.gameData.trainerPokemons.forEach(t => {
      this.jtmonByFormattedName.push({
        formattedName:Vue_pkRngAbuse_methods.formatName(t.species),
        jtmon:t,
        speciesNum:CONST.SPECIES_BY_NAME.get(t.species) || 0
      });
    });
    this.factoryPokemonNames = PokemonName.createForFactory(gameData);
    this.trainerNameFilter = TrainerInputName.create(gameData);

    this.trainersBattled = ['','','','','',''].map(a => TrainerInputName.create(gameData));
  }

  AlgoSection = JSON.parse(JSON.stringify(AlgoSection));
  PalaceOldManMsg = JSON.parse(JSON.stringify(PalaceOldManMsg));
  FactoryPikeMode = JSON.parse(JSON.stringify(FactoryPikeMode));

  howToImgUrl = howToImgUrl;

  pikeMode = FactoryPikeMode.cluster;
  factoryMode = FactoryPikeMode.cluster;

  minTeamProbabilityToBeDisplayed = 1/2000;

  displayResultRngFrames = window.location.href.includes('localhost');
  rangeResult:VueRangeResult | null = null;
  trainerNameFilter:TrainerInputName;
  pokemonsFilter = [new JtmonInputName(), new JtmonInputName(), new JtmonInputName()];

  facility = Facility.tower;
  Facility = JSON.parse(JSON.stringify(Facility));
  FACTORY_STYLE_TO_NAME = JSON.parse(JSON.stringify(FACTORY_STYLE_TO_NAME));
  TYPE_TO_NAME = JSON.parse(JSON.stringify(TYPE_TO_NAME));

  isLvl50 = true;
  winStreak = '0';
  palaceOldManMessage = '0';
  pikeDifficultTrainer = false;
  factoryBattleStyle = 'null';
  factoryCommonType = 'null';
  factoryPastRentalCount = '0';
  factoryPokemonNames:PokemonName[] = [];
  trainersBattled:TrainerInputName[] = [];
  displayCredits = false;
  displaySummary = true;
  displayHowToUse = true;

  trainerByFormattedName:{trainer:Trainer, formattedName:string}[] = [];
  jtmonByFormattedName:{jtmon:JsonTrainerPokemon, formattedName:string,speciesNum:number}[] = [];
  genderRatioByNationalDex = new Map<number, {M:number,F:number} | 'N'>();
  rngProgressMsg = '';

  displayImportExport = false;
  importExportDataTxtErr = '';
  inputError = '';
  importExportDataTxt = window.location.href.includes('localhost') ? `

`.trim() : '';

  debug_print = window.location.href.includes('localhost');
  debug_printGraph = false;

  displayBattleFrontierIdInputs = window.location.href.includes('localhost');
  isActiveSaveToLocalStorage = false;
}



class Vue_pkRngAbuse_methods {
  log = function(...args:any[]){
    console['log'](...args);
  }
  init = async function(this:THIS){
    if(this.importExportDataTxt)
      this.importData(this.importExportDataTxt);
    else
      this.loadFromLocalStorage();

    this.updateAllInputNames();

    if(window.location.href.includes('?facility=')){
      const term = window.location.href.match(/\?facility=(\w+)/);
      if(term)
        this.facility = <Facility>term[1]; //even if invalid, doesnt really matter
    }
    this.isActiveSaveToLocalStorage = true;
  }
  updateAllInputNames = function(this:THIS){
    this.updateCurrentTrainerInputName();
    this.trainersBattled.forEach((tb,i) => {
      this.updateTrainerInputName(tb);
    });
  }
  updateCurrentTrainerInputName = function(this:THIS){
    this.updateTrainerInputName(this.trainerNameFilter);
    this.pokemonsFilter.forEach((pack,i) => {
      this.updatePokemonInputName(pack);
    });
  }
  static formatName = function(name:string){
    return InputName.formatName(name);
  }
  update = async function(this:THIS){
    const filter = this.getFilter();
    const canHaveGender = this.pokemonsFilter[0].canBeMaleAndFemale;
    if(filter.trainerId === null || !filter.pokemons[0].hasSpeciesDefined() || (canHaveGender && filter.pokemons[0].gender === null)){
      if(canHaveGender)
        this.inputError = 'Error: You must provide Current Trainer, Trainer Pokemon #1 and its gender in the Input section.';
      else
        this.inputError = 'Error: You must provide Current Trainer and Trainer Pokemon #1 in the Input section.';
      return;
    }

    this.inputError = '';
    this.rangeResult = this.facility === Facility.factory
                        ? await this.generateBfRes()
                        : await this.generateBtRes({});

    if(this.debug_print)
      this.log(this.rangeResult);
  }
  updateFactoryPokemonInputName = function(this:THIS,t:PokemonName){
    PokemonName.update(t);
  }
  updatePokemonInputName = function(this:THIS,t:JtmonInputName){
    t.clearComputed();

    let possMons = this.jtmonByFormattedName;
    const trainer = this.trainerNameFilter.computedValue;
    if (trainer && this.facility !== Facility.factory)
      possMons = possMons.filter(m => trainer.pokemons.includes(m.jtmon.id));

    t.possibleValues = Array.from(new Set(possMons.map(t => t.jtmon.species))).sort();

    const formattedInput = Vue_pkRngAbuse_methods.formatName(t.input);
    if (!formattedInput)
      return;

    const list = this.jtmonByFormattedName.filter(t => t.formattedName === formattedInput);

    const species = Array.from(new Set(list.map(a => a.jtmon.species)));

    if (species.length !== 1)
      return;

    const jtmon = list[0].jtmon;
    t.computedValue = jtmon.species;

    t.speciesName = jtmon.species;
    t.speciesNum = CONST.SPECIES_BY_NAME.get(t.speciesName) || 0;
    t.canBeMaleAndFemale = false;

    const rate = CONST.getGenderRatio(t.speciesName)
    if (rate !== null && rate !== 0 && rate !== 100)
      t.canBeMaleAndFemale = true;

    const movesWithDupes = list.map(p => p.jtmon.moves).flat().filter(m => m);
    const moves = Array.from(new Set(movesWithDupes));

    const possibleMovesByFormattedName = moves.map(mv => ({formattedName:Vue_pkRngAbuse_methods.formatName(mv), move:mv}));
    t.moveInputs.forEach((mi,j) => {
      mi.possibleValues = moves;

      const formattedInput = Vue_pkRngAbuse_methods.formatName(mi.input);
      if (!formattedInput)
        return;

      const mv = possibleMovesByFormattedName.find(t => t.formattedName === formattedInput);
      if (mv)
        mi.computedValue = mv.move;
    });

    t.possibleAbilities = jtmon.abilities.slice();

    if (t.possibleAbilities.length !== 2)
      t.abilityInput = '0';
    else if (t.possibleAbilities[0] === t.possibleAbilities[1]){
      t.abilityInput = 'unknown'; //possible for Flygon
      t.possibleAbilities = [];
    }

    const itemsWithDupes = list.map(p => p.jtmon.item).filter(m => m);
    const items = Array.from(new Set(itemsWithDupes));
    const possibleItemsByFormattedName = items.map(mv => ({formattedName:Vue_pkRngAbuse_methods.formatName(mv), item:mv}));
    t.itemInput.possibleValues = items;

    const formattedItemInput = Vue_pkRngAbuse_methods.formatName(t.itemInput.input);
    if (formattedItemInput){
      const item = possibleItemsByFormattedName.find(t => t.formattedName === formattedItemInput);
      if (item)
        t.itemInput.computedValue = item.item;
    }

    const filterMon = this.getFilterForMon(t);
    const possible = list.filter(el => Filter.doesMonRespectFilter(filterMon, el.jtmon))
    t.possibleJmonsStr = possible.map(el => el.jtmon.displayName).join(', ');
  }
  updateTrainerInputName = function(this:THIS,t:TrainerInputName){
    const possibleRange = isNaN(+this.winStreak) ? null : CONST.GetTrainerIdRange(+this.winStreak);
    TrainerInputName.update(t, possibleRange);
  }

  updateTrainersBattled = function(this:THIS){ //idk why important to update them all when only 1 changes...
    this.trainersBattled.forEach(t => this.updateTrainerInputName(t));
  }
  getFilterForMon = function(this:THIS,f:JtmonInputName){
    const filterMon = new FilterMon();
    filterMon.item = f.itemInput.computedValue;
    filterMon.speciesNum = f.speciesNum;
    filterMon.moves = [];
    for (const mi of f.moveInputs){
      if (!mi.computedValue)
        break;
      filterMon.moves.push(mi.computedValue);
    }

    if (f.abilityInput !== 'unknown'){
      filterMon.abilityNum = +f.abilityInput;
      if (filterMon.abilityNum! >= f.possibleAbilities.length)
        filterMon.abilityNum = 0;
    }

    if (f.genderInput !== 'unknown'){
      filterMon.gender = f.genderInput === 'male' ? Gender.male : Gender.female;
      if (!f.canBeMaleAndFemale)
        filterMon.gender = null;
    }
    if(f.battleFrontierIdInput)
      filterMon.battleFrontierId = +f.battleFrontierIdInput;
    return filterMon;
  }
  getFilter = function(this:THIS){
    const filter = new Filter({});
    if (this.trainerNameFilter.computedValue)
      filter.trainerId = this.trainerNameFilter.computedValue.id;

    this.pokemonsFilter.forEach((f,i) => {
      if(!f.battleFrontierIdInput && !f.speciesNum)
        return;
      filter.pokemons[i] = this.getFilterForMon(f);
    });

    if(this.facility === Facility.factory){
      if(this.factoryBattleStyle !== 'null'){
        filter.factory_battleStyle = +this.factoryBattleStyle;
        if(isNaN(filter.factory_battleStyle))
          filter.factory_battleStyle = null;
      }

      if(this.factoryCommonType !== 'null'){
        filter.factory_commonType = +this.factoryCommonType;
        if(isNaN(filter.factory_commonType))
          filter.factory_commonType = null;
      }
    }
    return filter;
  }
  generateNodeRes_fixedVblanks = function(vblankFromLua:string){
    const fixedVblankCycleByRngCount:{rngAdvCount:number, vblank:number}[] = [];
    const numbers = vblankFromLua.split(',').map(a => +a).filter(a => a);
    for(let i = 0 ; i < numbers.length; i += 2)
      fixedVblankCycleByRngCount.push({rngAdvCount:numbers[i], vblank:numbers[i + 1]});
    return fixedVblankCycleByRngCount;
  }
  getRefsRngCalib = function(this:THIS){
    if(this.facility === Facility.arena)
      return this.$refs.rngCalib_arena;
    if(this.facility === Facility.palace)
      return this.$refs.rngCalib_palace;
    if(this.facility === Facility.pike)
      return this.$refs.rngCalib_pike;
    if(this.facility === Facility.factory)
      return this.$refs.rngCalib_factory;
    return this.$refs.rngCalib_tower;
  }
  getOptions = function(this:THIS, opts:NodeLaunchOptions){
    const filter = this.getFilter();
    const battleIdx = (+this.winStreak) % 7;
    const trainersBattleForWinStreak = this.trainersBattled.slice(0, battleIdx);
    const trainersBattledAlready = trainersBattleForWinStreak.map(t => t.computedValue ? t.computedValue.id : null!).filter(a => a !== null);
    if(this.facility === Facility.pike && this.pikeDifficultTrainer)
      opts.pikeIsHardBattle = true;
    const rngCalib = this.getRefsRngCalib().getRngCalib(battleIdx,opts);

    const winStreak = (() => {
      const w = +this.winStreak;
      if (this.facility !== Facility.pike)
        return w;
      const battleIdx = this.pikeDifficultTrainer ? 6 : 1;
      return Math.floor(w / 14) * 7 + battleIdx;
    })();

    const genOptions = new Options( this.gameData, {
      trainersBattledAlready:trainersBattledAlready,
      winStreak:winStreak,
      isLvl50:this.isLvl50,
      filter,
      printRngFramesInfo:!!(opts.fixedVblankCycleByRngCount && rngCalib.cycleMon1Id.count() === 1),
      vblankCalc:new VblankRangeCalc(null, opts.fixedVblankCycleByRngCount),
      rngCalib,
      calculateVblanksStr:this.displayResultRngFrames,
      facility:this.facility,
      palaceOldManMsg:+this.palaceOldManMessage,
      factoryPastRentalCount:+this.factoryPastRentalCount,
      factoryPlayerJmons:this.factoryPokemonNames.map(n => n.computedValue!).filter(a => a),
    });
    if(this.debug_print)
      this.log(genOptions);

    return genOptions;
  }
  generateBtRes_withoutProb = async function(this:THIS, opts:NodeLaunchOptions){
    const genOptions = this.getOptions(opts);
    const gen = new BtGenerator(genOptions);
    const results = await gen.generate((a,b) => {
      const newMsg = 'Progress: Step 1/2. Node ' + a + '/ ' + b;
      if(newMsg !== this.rngProgressMsg)
        this.rngProgressMsg = newMsg;
    });
    this.rngProgressMsg = '';
    return {results,gen};
  }
  generateBtRes = async function(this:THIS, opts:NodeLaunchOptions){
    let helper = async () => {
      let {results,gen} = await this.generateBtRes_withoutProb(opts);
      if(this.debug_printGraph)
        this.log(gen.graph.toStr());
      if(this.debug_print)
        this.log(results);
      return {results,gen};
    };

    let res2 = await helper();
    if(!res2.results)
      return null;

    if(!res2.results.length && this.getRefsRngCalib().nodeInputType !== NodeInputType.advancedMode){
      const gen = res2.gen;
      opts.beforeTrainer = new Range(gen.opts.rngCalib.beforeTrainer.min - 200, gen.opts.rngCalib.beforeTrainer.max + 300);
      opts.beforeMon1 = new Range(Math.max(0, gen.opts.rngCalib.beforeMon1.min - 100), gen.opts.rngCalib.beforeMon1.max + 150);
      opts.mon1IdCycleRange = new Range(0, 280895);
      this.inputError = 'Error: No results found with the given RNG Frames Calibration. Attempting a new generation with looser ranges.';

      res2 = await helper();
    }
    const {results,gen} = res2;

    if(!results)
      return null;

    if(results.length === 0)
      return VueRangeResult.create([], gen.opts.filter, this);

    const probGraph = new BtProbabilityGraph(gen.graph, gen.opts);
    let resWithProb = await probGraph.generate((pct) => {
      const newMsg = 'Progress: Step 2/2. ' + Math.floor(pct * 100) + '%';
      if(newMsg !== this.rngProgressMsg)
        this.rngProgressMsg = newMsg;
    });
    if(!resWithProb)
      return null;

    if(this.debug_printGraph)
      this.log(probGraph.printGraph());

    this.rngProgressMsg = '';

    const sumProbWeight = resWithProb.reduce((prev,cur) => prev + cur.probWeight, 0);
    resWithProb = resWithProb.filter(r => r.probWeight / sumProbWeight > this.minTeamProbabilityToBeDisplayed);
      resWithProb = resWithProb.slice(0,20);

    //return [gen, results, probGraph, resWithProb];
    const results_i:Result_i[] = resWithProb.map(r => {
      return {
        trainer:r.result.trainer!,
        pokemons:r.result.getJmons(),
        frameCountInfoStr:r.firstPathVblanks,
        frameCountInfoDetails:r.allPossibleVblanks,
        probWeight:r.probWeight,
      };
    });
    return VueRangeResult.create(results_i, gen.opts.filter, this);
  }
  generateBfRes = async function(this:THIS){
    const opts = this.getOptions({});
    const gen = new BfGenerator(opts);

    const results_i:Result_i[] = [];

    const rng = new Rng();
    rng.RandomX(opts.rngCalib.beforeTrainer.min);
    const count = opts.rngCalib.beforeTrainer.count();
    for(let i = 0; i < count; i++){
      const rng2 = rng.clone();

      const [reason, res] = opts.winStreak % 7 === 0 ? gen.generate_room1(rng2) : gen.generate_room2(rng);
      if(!res)
        continue;

      const rngFrame = i + opts.rngCalib.beforeTrainer.min;
      const prob = opts.rngCalib.beforeTrainer.getProbForVal(rngFrame) ?? 0.0001;
      const results2:Result_i[] = [];
      forEachAbilityAndGender(res.jmons[0], (ab0, g0) => {
        forEachAbilityAndGender(res.jmons[1], (ab1, g1) => {
          forEachAbilityAndGender(res.jmons[2], (ab2, g2) => {
            const pokemons = [
              {jmon:res.jmons[0], abilityNum:ab0, gender:g0},
              {jmon:res.jmons[1], abilityNum:ab1, gender:g1},
              {jmon:res.jmons[2], abilityNum:ab2, gender:g2},
            ];
            results2.push({
              trainer:res.trainer!,
              pokemons,
              frameCountInfoStr:'' + rngFrame,
              frameCountInfoDetails:[],
              probWeight:prob,
            });
          });
        });
      });
      results2.forEach(r => {
        r.probWeight /= results2.length;
      });
      results_i.push(...results2);

      rng.Random();
    }

    if (results_i.length){
      const sum = results_i.reduce((prev,cur) => prev + cur.probWeight, 0);
      results_i.forEach(r => {
        r.probWeight /= sum;
      });
    }

    return VueRangeResult.create(results_i, gen.opts.filter, this);
  }
  colorizeItem = function(this:THIS,item:string){
    let color = '';
    if (this.gameData.meta.dangerousItems.includes(item))
      color = 'red';
    if(!color)
      return item;
    return `<span style="color:${color}">${item}</span>`;
  }
  colorizeMove = function(this:THIS,move:string){
    let color = '';
    if (this.gameData.meta.dangerousMoves.includes(move))
      color = 'red';
    else if (this.gameData.meta.semiDangerousMoves.includes(move))
      color = 'orange';
    if(!color)
      return move;
    return `<span style="color:${color}">${move}</span>`;
  }
  clear = function(this:THIS, updateWinstreak:boolean){
    if (updateWinstreak){
      this.winStreak = '' + ((+this.winStreak) + 1);
      if ((+this.winStreak) % 7 === 0){
        this.trainersBattled.forEach(t => t.clear());
      } else if (this.trainerNameFilter.computedValue){
        const lastUnset = this.trainersBattled.find(t => !t.input);
        if(lastUnset){
          lastUnset.input = this.trainerNameFilter.input;
          this.updateTrainerInputName(lastUnset);
        }
      }
    } else {
      this.trainersBattled.forEach(t => {
        t.clear();
      });
    }

    this.pokemonsFilter.forEach(p => p.clear());
    this.trainerNameFilter.clear();
    this.updateAllInputNames();
  }
  exportData = function(this:THIS){
    this.importExportDataTxt = JSON.stringify(this.getDataToExport());
  }
  saveToLocalStorage = function(this:THIS){
    if(!this.isActiveSaveToLocalStorage)
      return;
    try {
      const jsonStr = JSON.stringify(this.getDataToExport());
      localStorage.setItem('pkRngAbuse_input',jsonStr);
    } catch(err){
      console.error('saveToLocalStorage', err);
    }
  }
  loadFromLocalStorage = function(this:THIS){
    try {
      const jsonStr = localStorage.getItem('pkRngAbuse_input');
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
      facility:this.facility,
      isLvl50:this.isLvl50,
      winStreak:this.winStreak,
      trainerNameFilter:this.trainerNameFilter.input,
      trainersBattled:this.trainersBattled.map(t => t.input),
      displayCredits:this.displayCredits,
      displayImportExport:this.displayImportExport,
      displaySummary:this.displaySummary,
      displayHowToUse:this.displayHowToUse,
      palaceOldManMessage:'' + this.palaceOldManMessage,
      pikeDifficultTrainer:this.pikeDifficultTrainer,
      pikeMode:+this.pikeMode,
      factoryMode:+this.factoryMode,
      factoryCommonType:+this.factoryCommonType,
      factoryPastRentalCount:+this.factoryPastRentalCount,
      factoryBattleStyle:+this.factoryBattleStyle,
      factoryPokemonNames:this.factoryPokemonNames.map(n => n.input),
      pokemonsFilter:this.pokemonsFilter.map(p => {
        return {
          input:p.input,
          item:p.itemInput.input,
          moves:p.moveInputs.map(m => m.input),
          ability:p.abilityInput,
          gender:p.genderInput,
          battleFrontierId:p.battleFrontierIdInput,
          pid:'',
        }
      }),
      rngCalib_tower:this.$refs.rngCalib_tower.getDataToExport(),
      rngCalib_arena:this.$refs.rngCalib_arena.getDataToExport(),
      rngCalib_palace:this.$refs.rngCalib_palace.getDataToExport(),
      rngCalib_pike:this.$refs.rngCalib_pike.getDataToExport(),
      rngCalib_factory:this.$refs.rngCalib_factory.getDataToExport(),
      pyramid:this.$refs.bpyVisualizer.getDataToExport(),
      factoryCluster:this.$refs.bfRentalFinder.getDataToExport(),
      pikeCluster:this.$refs.bpiClusterFinder.getDataToExport(),
    };
  }
  importData = function(this:THIS,str:string){
    this.importExportDataTxtErr = '';
    try {
      const json:Partial<ReturnType<Vue_pkRngAbuse_methods['getDataToExport']>> = JSON.parse(str);
      if (json.version !== STORAGE_VERSION){
        this.importExportDataTxtErr = 'Error: The data format provided is no longer supported.';
        return;
      }

      if(typeof json.isLvl50 === 'boolean')
        this.isLvl50 = json.isLvl50;

      if(typeof json.pikeMode === 'number')
        this.pikeMode = json.pikeMode;

      if(typeof json.factoryMode === 'number')
        this.factoryMode = json.factoryMode;

      if(typeof json.factoryCommonType === 'number')
        this.factoryCommonType = '' + json.factoryCommonType;
      if(typeof json.factoryPastRentalCount === 'number')
        this.factoryPastRentalCount = '' + json.factoryPastRentalCount;
      if(typeof json.factoryBattleStyle === 'number')
        this.factoryBattleStyle = '' + json.factoryBattleStyle;
      if(Array.isArray(json.factoryPokemonNames)){
        json.factoryPokemonNames.forEach((c,i) => {
          if (typeof c === 'string' && this.factoryPokemonNames[i]){
            this.factoryPokemonNames[i].input = c;
            this.updateFactoryPokemonInputName(this.factoryPokemonNames[i]);
          }
        });
      }

      if(typeof json.winStreak === 'string')
        this.winStreak = json.winStreak;

      if(typeof json.facility === 'string')
        this.facility = json.facility;

      if(typeof json.palaceOldManMessage === 'string')
        this.palaceOldManMessage = json.palaceOldManMessage;

      if(typeof json.pikeDifficultTrainer === 'boolean')
        this.pikeDifficultTrainer = json.pikeDifficultTrainer;

      if(typeof json.trainerNameFilter === 'string'){
        this.trainerNameFilter.input = json.trainerNameFilter;
        this.updateTrainerInputName(this.trainerNameFilter);
      }

      if (Array.isArray(json.trainersBattled)){
        json.trainersBattled.forEach((inp,i) => {
          this.trainersBattled[i].input = inp;
          this.updateTrainerInputName(this.trainersBattled[i]);
        });
      }

      if (Array.isArray(json.pokemonsFilter)){
        json.pokemonsFilter.forEach((pack,i) => {
          const pi = this.pokemonsFilter[i];
          if(!pi || !pack || typeof pack !== 'object')
            return;
          pi.input = pack.input ?? '';
          pi.itemInput.input = pack.item ?? '';
          pi.abilityInput = pack.ability ?? 'unknown';
          pi.genderInput = pack.gender ?? 'unknown';

          if(pack.moves)
            pack.moves.forEach((mv,j) => {
              pi.moveInputs[j].input = mv ?? '';
            });
          else
            pi.moveInputs.forEach(m => m.input = '');

          pi.battleFrontierIdInput = pack.battleFrontierId;

          //pid is used when importing json generated by .lua
          if(pack.pid && pi.battleFrontierIdInput){
            const jtmon = this.jtmonByFormattedName.find(j => j.jtmon.id === +pi.battleFrontierIdInput);
            if(jtmon){
              const pid = BigInt(new Uint32Array(new Int32Array([+pack.pid]).buffer)[0]);
              pi.input = jtmon.jtmon.species;
              const gender = getGender(pid, jtmon.jtmon.species);
              if(gender === Gender.male)
                pi.genderInput = 'male';
              if(gender === Gender.female)
                pi.genderInput = 'female';

              const abNum = (pid & BigInt(1)) ? 1 : 0;
              pi.abilityInput = '' + abNum;
            }
          }
          this.updatePokemonInputName(pi);
        });
      }

      if (typeof json.displayImportExport === 'boolean')
        this.displayImportExport = json.displayImportExport;

      if (typeof json.displayCredits === 'boolean')
        this.displayCredits = json.displayCredits;

      if (typeof json.displaySummary === 'boolean')
        this.displaySummary = json.displaySummary;
      if (typeof json.displayHowToUse === 'boolean')
        this.displayHowToUse = json.displayHowToUse;

      if (json.rngCalib_tower && typeof json.rngCalib_tower === 'object')
        this.$refs.rngCalib_tower.importData(json.rngCalib_tower);

      if (json.rngCalib_arena && typeof json.rngCalib_arena === 'object')
        this.$refs.rngCalib_arena.importData(json.rngCalib_arena);

      if (json.rngCalib_palace && typeof json.rngCalib_palace === 'object')
        this.$refs.rngCalib_palace.importData(json.rngCalib_palace);

      if (json.rngCalib_pike && typeof json.rngCalib_pike === 'object')
        this.$refs.rngCalib_pike.importData(json.rngCalib_pike);

      if (json.rngCalib_factory && typeof json.rngCalib_factory === 'object')
        this.$refs.rngCalib_factory.importData(json.rngCalib_factory);

      if (json.pyramid && typeof json.pyramid === 'object')
        this.$refs.bpyVisualizer.importData(json.pyramid);

      if (json.factoryCluster && typeof json.factoryCluster === 'object')
        this.$refs.bfRentalFinder.importData(json.factoryCluster);

      if (json.pikeCluster && typeof json.pikeCluster === 'object')
        this.$refs.bpiClusterFinder.importData(json.pikeCluster);
    } catch(err){
      this.importExportDataTxtErr = 'Error: Invalid format. ' + err.message;
    }
  }
  debug_calculateProbabilityDistribution = function(vals:number[], subCount:number){
    vals.sort((a,b) => a - b);
    const range = vals[vals.length - 1] - vals[0];
    const prob:number[] = [];
    for(let i = 0; i < (subCount - 1); i++){
      const minForSubset = vals[0] + i * range / subCount;
      const maxForSubset = vals[0] + (i + 1) * range / subCount;
      prob.push(vals.filter(v => v >= minForSubset && v <= maxForSubset).length || 0.09);
    }
    return prob.join(',');
  }
}

document.addEventListener("DOMContentLoaded",async function(){
  const gameData = await getData(window.location.pathname);
  if(!gameData)
    return console['error']('invalid pathname',window.location.pathname);

  (<any>window).gameData = gameData;

  Vue_bfRentalFinder.init(gameData); //BAD

  const vue = {
    data:new Vue_pkRngAbuse_data(gameData),
    methods: new Vue_pkRngAbuse_methods(),
  };

  const v = new Vue(withRender(vue));

  (<any>window).v = v;

  v.$mount('#main-slot');
  Vue.nextTick(async () => {
    await (<THIS><any>v).init();
  });
});