import {NodeLaunchOptions,SmonWithRmon,Vue_ramBattleState,Vue_playerPokemon_data,MsgFromMgba,MoveResultInfo,MGBA_VERSION} from "./pkAssistant_data";
import {Options,Filter, Range, facilityNumToId, FacilityNum, forEachAbilityAndGender} from "../pkRngAbuse/Structs";
import {Rng} from "../pkRngAbuse/Rng";
import {BfGenerator} from "../pkRngAbuse/BattleFactory/BfGenerator";
import { MonStatus, RamPokemon } from "./RamPokemon";
import { GameData, JsonTrainerPokemon, Trainer, getData } from "../data/getData";
import {VueRangeResult,Result_i} from "../pkRngAbuse/VueResult";
import {BtProbabilityGraph} from "../pkRngAbuse/BattleTower/BtProbabilityGraph";
import {BtGenerator} from "../pkRngAbuse/BattleTower/BtGenerator";
import {Vue_pkRngFrameInput_full} from "../pkRngAbuse/BattleTower/Vue_pkRngFrameInput";

export class PkAssistant_rng {
  constructor(
    public msg:MsgFromMgba,
    public battleState:Vue_ramBattleState,
    public gameData:GameData,
    public rngCalibInput:Vue_pkRngFrameInput_full,
    public postProgress:(s:string) => void){
  }
  error = '';

  isKnownRtmon = function(this:PkAssistant_rng, trmon:RamPokemon, partyIdx:number){
    if(partyIdx === 0)
      return true;

    if (trmon.getUsedMoves().length || !trmon.isAtMaxHp() || trmon.isDead() || trmon.getStatus1() !== MonStatus.healthy)
      return true;

    if (this.msg.trainerMon.getSpeciesName() === trmon.getSpeciesName())
      return true; // aka active mon

    return false;
  }
  getFilter = function(this:PkAssistant_rng,cheat=false){
    const filter = new Filter({});

    filter.trainerId = this.battleState.trainerId;

    this.msg.allTrainerMons.forEach((trmon,i) => {
      if(!cheat && !this.isKnownRtmon(trmon, i))
        return;

      filter.pokemons[i].speciesNum = trmon.getSpeciesNationalDexId();
      filter.pokemons[i].gender = trmon.getGender();

      //TODO can know item, ability even if no cheat
      if(cheat){
        filter.pokemons[i].moves = trmon.getMoves().map(m => m.name);
        filter.pokemons[i].item = trmon.getHeldItemName();
        filter.pokemons[i].abilityNum = trmon.getAbilityNum();
      } else
        filter.pokemons[i].moves = trmon.getUsedMoves().map(m => m.name);
    });

    if(this.msg.facilityNum === FacilityNum.factory){
      const moves = this.msg.allTrainerMons.map(m => ({moves:m.getMoves().map(m => m.name)}));
      filter.factory_battleStyle = BfGenerator.GetOpponentBattleStyle(moves);

      const species = this.msg.allTrainerMons.map(m => ({species:m.getSpeciesName()}));
      filter.factory_commonType = BfGenerator.GetOpponentMostCommonMonType(species);
    }
    return filter;
  }
  getOptions = function(this:PkAssistant_rng, launchOpts:NodeLaunchOptions){
    const filter = this.getFilter();
    if(!filter)
      return null;

    if (this.msg.facilityNum === FacilityNum.palace && this.msg.palaceOldManMsg === null && this.battleState.winStreak < 50){
      this.error = 'Error: The old man speech value is undefined. This can occur when starting the script mid-battle.';
      return null;
    }

    if(this.msg.facilityNum === FacilityNum.factory && !this.msg.factoryPlayerJmons.length){
      this.error = 'Error: The rental Pokemon are undefined. This can occur when starting the script mid-battle.';
      return null;
    }

    const opts:Partial<Options> = {
      trainersBattledAlready:this.msg.trainersBattled,
      winStreak:this.battleState.winStreak,
      isLvl50:this.battleState.isLvl50,
      filter,
      rngCalib:this.rngCalibInput.getRngCalib(this.msg.winStreak % 7, launchOpts),
      mustCancel:launchOpts.mustCancel,
      calculateVblanksStr:launchOpts.calculateVblanksStr,
      facility:facilityNumToId(this.msg.facilityNum),
      palaceOldManMsg:this.msg.palaceOldManMsg,
      factoryPastRentalCount:this.msg.factoryPastRentalCount,
      factoryPlayerJmons:this.msg.factoryPlayerJmons.map(n => this.gameData.trainerPokemons[n]).filter(a => a),
    };
    opts.printRngFramesInfo = false;

    const genOptions = new Options( this.gameData, opts);
    return genOptions;
  }
  generate = async function(this:PkAssistant_rng, retryIfFail=true, opts:NodeLaunchOptions){
    if(this.msg.facilityNum !== FacilityNum.factory)
      return this.generateBt(retryIfFail, opts);
    return this.generateBf(retryIfFail, opts);
  }
  generateBf = async function(this:PkAssistant_rng, retryIfFail=true, opts2:NodeLaunchOptions){
    this.error = '';

    const opts = this.getOptions(opts2);
    if(!opts)
      return null;

    const gen = new BfGenerator(opts);

    const results_i:Result_i[] = [];

    const rng = new Rng();
    rng.RandomX(opts.rngCalib.beforeTrainer.min);
    const count = opts.rngCalib.beforeTrainer.count();
    for(let i = 0; i < count; i++){
      const rng2 = rng.clone();
      rng.Random();

      const [reason, res] = opts.winStreak % 7 === 0 ? gen.generate_room1(rng2) : gen.generate_room2(rng2);
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
    }

    if (results_i.length){
      const sum = results_i.reduce((prev,cur) => prev + cur.probWeight, 0);
      results_i.forEach(r => {
        r.probWeight /= sum;
      });
    }

    return VueRangeResult.create(results_i, gen.opts.filter, this);
  }
  generateBt = async function(this:PkAssistant_rng, retryIfFail=true, opts:NodeLaunchOptions){
    this.error = '';
    let res2 = await this.generateRes_withoutProb(opts);
    if(!res2.results)
      return null; //canceled

    if(!res2.results.length && retryIfFail){
      const gen = res2.gen;
      opts.beforeTrainer = new Range(gen.opts.rngCalib.beforeTrainer.min - 200, gen.opts.rngCalib.beforeTrainer.max + 300);
      opts.beforeMon1 = new Range(gen.opts.rngCalib.beforeMon1.min - 100, gen.opts.rngCalib.beforeMon1.max + 150);
      opts.mon1IdCycleRange = new Range(0, 280895);
      this.error = 'Error: No results found with the given RNG Frames Calibration. Attempting a new generation with looser ranges.';
      res2 = await this.generateRes_withoutProb(opts);
    }
    const {results,gen} = res2;

    if(!results)
      return null;

    if(results.length === 0)
      return VueRangeResult.create([], gen.opts.filter, this);

    const probGraph = new BtProbabilityGraph(gen.graph, gen.opts);
    let resWithProb = await probGraph.generate((pct) => {
      const newMsg = 'Progress: Step 2/2. ' + Math.floor(pct * 100) + '%';
      this.postProgress(newMsg);
    });
    if(!resWithProb)
      return null;

    this.postProgress('');
    if(opts.printAll)
      console['log'](probGraph.printGraph());

    //return [gen, results, probGraph, resWithProb];
    const ressults_i:Result_i[] = resWithProb.map(r => {
      return {
        trainer:r.result.trainer!,
        pokemons:r.result.getJmons(),
        frameCountInfoStr:r.firstPathVblanks,
        frameCountInfoDetails:r.allPossibleVblanks,
        probWeight:r.probWeight,
      };
    });
    const deadMons = this.msg.allTrainerMons.filter(m => m.isDead()).map(a => a.getSpeciesName());
    return VueRangeResult.create(ressults_i, gen.opts.filter, this, deadMons);
  }
  generateRes_withoutProb = async function(this:PkAssistant_rng, launchOpts:NodeLaunchOptions){
    const genOptions = this.getOptions(launchOpts);
    if(!genOptions)
      return {results:null, gen:null} as const;

    const gen = new BtGenerator(genOptions);
    const results = await gen.generate((a,b) => {
      const newMsg = 'Progress: Step 1/2. Node ' + a + '/ ' + b;
      this.postProgress(newMsg);
    });
    this.postProgress('');
    if(launchOpts.printAll)
      console['log'](gen.graph.toStr());
    return {results,gen};
  }
  colorizeItem = function(this:PkAssistant_rng,item:string){
    let color = '';
    if (this.gameData.meta.dangerousItems.includes(item))
      color = 'red';
    if(!color)
      return item;
    return `<span style="color:${color}">${item}</span>`;
  }
  colorizeMove = function(this:PkAssistant_rng,move:string){
    let color = '';
    if (this.gameData.meta.dangerousMoves.includes(move))
      color = 'red';
    else if (this.gameData.meta.semiDangerousMoves.includes(move))
      color = 'orange';
    if(!color)
      return move;
    return `<span style="color:${color}">${move}</span>`;
  }
  getResultContainingIngameTeam = function(this:PkAssistant_rng, result:VueRangeResult){
    const filter = this.getFilter(true);
    return result.teamResults.find(r => {
      return filter.pokemons.every((fmon,i) => {
        return r.pokemons[i].genders.some(g => {
          return Filter.doesMonRespectFilter(fmon, r.pokemons[i].jmon, r.pokemons[i].abilityNum, g);
        });
      });
    }) || null;
  }
}
