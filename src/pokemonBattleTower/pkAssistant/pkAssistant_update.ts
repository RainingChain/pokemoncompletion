
import { DmgHKOCalculator, DmgHKOResult } from "./DmgHKOCalculator";
import { PkAbilityChecker } from "./PkAbilityChecker";
import { PROTECT } from "./PkAbilityChecker_data";
import { StatusAnalyzer } from "./StatusAnalyzer";

import* as CONST from "../pkRngAbuse/const";
import {NodeLaunchOptions,SmonWithRmon,Vue_ramBattleState,Vue_playerPokemon_data,MsgFromMgba,MoveResultInfo,MGBA_VERSION} from "./pkAssistant_data";
import { MonStatus, RamPokemon } from "./RamPokemon";
import {Vue_pkTmon_props} from "./Vue_pkTmon";

import { GameData, JsonTrainerPokemon, Trainer, getData } from "../data/getData";
import {SPECIES_NAME_TO_NATIONAL_DEX} from "./RamPokemon_data";
import {PkRngGen} from "../pkAssistant/PkRngGen";

import * as Smogon from '@smogon/calc';
(<any>window).Smogon = Smogon;

const GEN = <any>3;

export class PkAssitant_update {
  getWeather = function(weather:number) : Smogon.Field['weather'] {
    if(weather & 0b111)
      return 'Rain';
    else if(weather & 0b11000)
      return 'Sand';
    else if(weather & 0b1100000)
      return 'Sun';
    else if(weather & 0b10000000)
      return 'Hail';
    return undefined;
  }
  getStatusStr = function(rmon:RamPokemon){
    return (rmon.getStatus1().toUpperCase() + ' ' + (rmon.isConfused() ? 'CON' : '')).trim();
  }
  getEffectiveSpeed = function(rmon:RamPokemon,field:Smogon.Field,fallbackSpe=0){
    let mult = 1;

    //not sure if player has access to all that data
    //Limitation: ((!ABILITY_ON_FIELD(ABILITY_CLOUD_NINE) && !ABILITY_ON_FIELD(ABILITY_AIR_LOCK)))
    if (rmon.getAbilityName() === 'Swift Swim' && field.hasWeather('Rain','Heavy Rain'))
      mult *= 2;
    if (rmon.getAbilityName() === 'Chlorophyll' && field.hasWeather('Sun','Harsh Sunshine'))
      mult *= 2;

    let spe = (rmon.getCurrentStats()?.spe || fallbackSpe) * mult;
    const stageMult = [2/8, 2/7 ,2/6, 2/5, 2/4, 2/3, 2/2, 3/2, 4/2, 5/2, 6/2, 7/2, 8/2][rmon.getStatStages().spe + 6];
    if(stageMult)
      spe = Math.floor(spe * stageMult);

    if(rmon.getHeldItemName() === 'Macho Brace')
      spe = Math.floor(spe / 2);
    if(rmon.getStatus1() === MonStatus.paralyze)
      spe = Math.floor(spe / 4);
    return spe;
  }
  getStatStagesDesc = function(boosts:Partial<Smogon.Pokemon['boosts']>){
    const s:string[] = [];
    for (let i in boosts){
      const val:number = (<any>boosts)[i];
      if (val !== 0)
        s.push(`${val > 0 ? '+' : ''}${val} ${i.toUpperCase()}`);
    }
    return s.join(' ');
  }
  getStatValsDesc = function(s:Smogon.Pokemon['stats'] | null){
    if(!s)
      return '';
    return `HP: ${s.hp}, ATK: ${s.atk}, DEF: ${s.def}, SPA: ${s.spa}, SPD: ${s.spd}, SPE: ${s.spe}`
  }
  updateBattleState = function(this:PkAssitant_update,bs:Vue_ramBattleState,msg:MsgFromMgba){
    bs.playerMonName = msg.playerMon.getSpeciesName();
    bs.playerMonSpeciesId = msg.playerMon.getSpeciesNationalDexId();
    bs.playerCurrentHp = msg.playerMon.getCurrentHp();
    bs.playerMaxHp = msg.playerMon.getMaxHp();
    bs.playerCurrentHpPct = Math.round(bs.playerCurrentHp / bs.playerMaxHp * 100) + '%';
    bs.playerStatus = this.getStatusStr(msg.playerMon);
    bs.playerEffectiveSpeed = this.getEffectiveSpeed(msg.playerMon, this.createField(msg));
    bs.playerStatStagesDesc = this.getStatStagesDesc(msg.playerMon.getStatStages());
    bs.playerStatValsDesc = this.getStatValsDesc(msg.playerMon.getCurrentStats());

    bs.trainerName = msg.trainer.name;
    bs.trainerId = msg.trainer.id;
    bs.trainerMonName = msg.trainerMon.getSpeciesName();
    bs.trainerMonSpeciesId = msg.trainerMon.getSpeciesNationalDexId();
    bs.trainerStatus = this.getStatusStr(msg.trainerMon);
    bs.trainerMaxHpApprox = '~' + msg.trainerMon.getCurrentHpPctBasedOnPxCount_active() + '%';
    bs.trainerStatStagesDesc = this.getStatStagesDesc(msg.trainerMon.getStatStages());
    bs.trainerMaxHpApproxDesc = `HP bar has ${msg.trainerMon.getCurrentHpPxCount_active()}/${RamPokemon.HP_BAR_PX} pixel`;

    bs.trainerUsedMoves = msg.trainerMon.getUsedMoves().sort((a,b) => a.name < b.name ? -1 : 1);

    bs.facilityName = ['Battle Tower','Battle Dome','Battle Palace','Battle Arena','Battle Factory','Battle Pike','Battle Pyramid'][msg.facilityNum];
    bs.winStreak = msg.winStreak;
    bs.isLvl50 = msg.lvlMode === 0;
  }
  createField = function(this:PkAssitant_update,msg:MsgFromMgba){
    return new Smogon.Field({gameType:"Singles",weather:this.getWeather(msg.weather)});
  }
  createSpmon = function(this:PkAssitant_update,rp:RamPokemon){
    const smon = new SmonWithRmon(GEN, rp.getSpeciesName(), {
      ivs:rp.getIvs(),
      nature:rp.getNatureName(),
      evs:rp.getEvs(),
      level:rp.getLevel(),
      item: rp.getHeldItemName(),
      ability:rp.getAbilityName(),
      moves:rp.getMoves().map(m => m.name),
      curHP:rp.getCurrentHp(),
      status:rp.getStatus1(),
      boosts:rp.getStatStages(),
    });
    smon.rmon = rp;
    return smon;
  }
  createVpmon = function(this:PkAssitant_update,rp:RamPokemon, partyIdx:number,field:Smogon.Field){
    const p = new Vue_playerPokemon_data();
    p.smon = this.createSpmon(rp);
    p.name = rp.getSpeciesName();
    p.speciesId = rp.getSpeciesNationalDexId();
    p.currentHpPct = Math.round(rp.getCurrentHp() / rp.getMaxHp() * 100) + '%';
    p.statValsDesc = this.getStatValsDesc(p.smon.stats);
    p.statStagesDesc = this.getStatStagesDesc(p.smon.boosts);
    p.isActiveMon = rp.isActive();
    if(partyIdx < 0)
      partyIdx = 0;
    p.borderColor = ['rgba(255,255,255,1)','rgba(0, 255, 0,1)','rgba(0,0,255,1)','rgba(0,255,255,1)'][partyIdx];
    p.effectiveSpeed = this.getEffectiveSpeed(rp, field, p.smon.stats.spe);
    p.partyIdx = partyIdx;
    return p;
  }
  /** main function */
  getTrainerMons = function(this:PkAssitant_update,msg:MsgFromMgba, vpmons:Vue_playerPokemon_data[], gameData: GameData, additionalJtmons:JsonTrainerPokemon[]){
    let jtmonsFromMsg = this.getPossibleBfTrainerJsonPokemons(msg.trainerMon, gameData);
    let jtmons = jtmonsFromMsg.slice(0);
    jtmons.push(...additionalJtmons);
    jtmons = Array.from(new Set(jtmons));

    const possVmons = jtmons.map((jtmon,i) => {
      const rmon = msg.trainerMon.getSpeciesNationalDexId() === SPECIES_NAME_TO_NATIONAL_DEX(jtmon.species) ? msg.trainerMon : null;
      const vtmons = this.convertJtmonToVtmon(jtmon, rmon, msg, vpmons, gameData);
      vtmons.forEach(vtmon => {
        vtmon.displayIdx = i + 1;
        vtmon.displayedBecauseOfRng = !jtmonsFromMsg.includes(jtmon);
        if (vtmon.displayedBecauseOfRng)
          vtmon.partyIdxInRngParty = additionalJtmons.findIndex(jmon => jmon.id === vtmon.battleTowerId);
      });
      return vtmons;
    }).flat();

    return possVmons;
  }
  convertJtmonToVtmon = function(this:PkAssitant_update,jtmon:JsonTrainerPokemon,rmon:RamPokemon | null,msg:MsgFromMgba,vpmons:Vue_playerPokemon_data[], gameData: GameData){
    const abChecker = new PkAbilityChecker(GEN, jtmon, rmon, vpmons.map(v => v.smon));
    const res = abChecker.calculatePossibleAbilities();

    const activeRamMon = msg.trainerMon; //can only be used for stuff where all trainer mons have the same value

    let createOne = (abs:string[]) => {
      //kinda bad to create a mon only for maxHp, but w/e
      const smonTmpForMaxHp = new SmonWithRmon(GEN, jtmon.species, {
        ivs:activeRamMon.getIvs(),
        nature:jtmon.nature,
        evs:(<any>jtmon).evs,
        level:activeRamMon.getLevel(),
      });

      const smon = new SmonWithRmon(GEN, jtmon.species, {
        ivs:activeRamMon.getIvs(),
        nature:jtmon.nature,
        evs:(<any>jtmon).evs,
        level:activeRamMon.getLevel(),
        item: jtmon.item,
        ability:abs[0] || '',
        moves:jtmon.moves,
        ...(rmon ? { //BAD we assume that if benched, has 100% hp
          curHP:rmon.getCurrentHpBasedOnPxCount_active(smonTmpForMaxHp.maxHP()),
          status:rmon.getStatus1(),
          boosts:rmon.getStatStages(),
        } : {}),
      });
      smon.rmon = rmon;
      const abs2 = abs.map(ab => ({name:ab, useful:res.important.includes(ab)}));

      return vpmons.map(vpmon => this.createVtmon(smon, jtmon, vpmon, abs2,msg, gameData))
    };

    if (res.known)
      return createOne([res.known]);

    //abilities with identical hko will be fused
    return createOne([...res.important, ...res.notImportant]);
  }
  createVtmon = function(this:PkAssitant_update,smon:SmonWithRmon,jsonMon:JsonTrainerPokemon,vpmon:Vue_playerPokemon_data,abilitiesUsefulness:{name:string,useful:boolean}[],msg:MsgFromMgba,gameData:GameData){
    const d = new Vue_pkTmon_props();
    d.stmon = smon;
    d.vpmon = vpmon;
    d.effectiveSpeed = smon.rmon ? this.getEffectiveSpeed(smon.rmon, this.createField(msg)) : smon.stats.spe;
    d.statValsDesc = this.getStatValsDesc(smon.stats);
    d.statStagesDesc = this.getStatStagesDesc(smon.boosts);
    d.battleTowerId = jsonMon.id;
    d.name = jsonMon.displayName;
    d.speciesId = SPECIES_NAME_TO_NATIONAL_DEX(jsonMon.species);
    d.nature = smon.nature;
    d.ability = smon.ability || '';
    d.uidForDisplay = smon.species.id + smon.ability + jsonMon.id;

    d.itemName = smon.item || '';
    d.itemDangerousColor = (() => {
      if(gameData.meta.dangerousItems.includes(smon.item!))
        return 'red';
      return '';
    })();
    d.abilitiesUsefulness = abilitiesUsefulness;
    d.isActiveBattle = vpmon.isActiveMon && msg.trainerMon.getInternalSpeciesId() === smon.rmon?.getInternalSpeciesId();

    const approxHp = smon.rmon ? smon.rmon.getCurrentHpPctBasedOnPxCount_active() : 100; //BAD, we assume if bench, 100% hp
    d.trainerMaxHpApprox =  '~' + approxHp + '%';

    d.trainerMovesAgainstPlayer = [];
    d.playerMovesAgainstTrainer = [];

    return d;
  }
  getPossibleBfTrainerJsonPokemons = function(this:PkAssitant_update,trmon:RamPokemon,gameData:GameData) : JsonTrainerPokemon[]{
    const usedMoves = trmon.getUsedMoves();
    const speciesName = trmon.getSpeciesName();
    const jtmons = trmon.getLevel() <= 50
                    ? gameData.trainerPokemons.filter(jtmon => jtmon.id <= CONST.FRONTIER_MONS_HIGH_TIER)
                    : gameData.trainerPokemons;

    return jtmons.filter(tmon => {
      if(tmon.species !== speciesName)
        return false;
      if (usedMoves.some(usedMove => !tmon.moves.includes(usedMove.name!)))
        return false;
      return true;
    });
  }

  fuseIdenticalVtmons = function(this:PkAssitant_update,trainerMons:Vue_pkTmon_props[]){
    const isSame = (t1:Vue_pkTmon_props, t2:Vue_pkTmon_props) => {
      if(t1.battleTowerId !== t2.battleTowerId)
        return false;
      if(t1.vpmon.smon.name !== t2.vpmon.smon.name)
        return false;

      return t1.playerMovesAgainstTrainer.map(m => m.dmgText).join() === t2.playerMovesAgainstTrainer.map(m => m.dmgText).join(',');
    };

    let res:Vue_pkTmon_props[] = [];
    for (let i = 0 ; i < trainerMons.length; i++){
      let t1 = trainerMons[i];
      let hasSame = false;
      for (let j = 0 ; j < i; j++){
        let t2 = trainerMons[j];
        if(!isSame(t1, t2))
          continue;

        t1.abilitiesUsefulness.push(...t2.abilitiesUsefulness);
        hasSame = true;
        break;
      }
      if(!hasSame)
        res.push(t1);
    }
    return res;
  }
  updateMovesDmgText = function(this:PkAssitant_update,trainerMons:Vue_pkTmon_props[],gameData:GameData,field:Smogon.Field){
    const NO_DMG_TXT = 'No Dmg';
    const rng = new PkRngGen(0);
    trainerMons.forEach(vtmon => {

      const formatTrainerAgainstPlayerUsingRes = (vueMv:MoveResultInfo, res:DmgHKOResult | null) => {
        const ohkoChance = res === null ? 0 : res.getHkoOrLessChance(1);
        if(res === null){
          vueMv.dmgText = NO_DMG_TXT;
        } else {
          vueMv.dmgText = `${res.getLowDmgNoCritPctStr()}-${res.getHighDmgNoCritPctStr()}`;
          vueMv.hkoText = res.chanceByHKO.slice(0,3).map(v => {
            let color = '';
            if (v.hko === 1)
              color = v.chance > 0.99 ? 'red' : (v.chance > 1/12 ? 'orange' : 'yellow');
            else if(v.hko === 2 && v.chance > 1/12)
              color = 'yellow';
            return res.chanceByHKOToStr(v, color);
          }).join(', ');
          vueMv.hkoTitle = res.chanceByHKO.slice(3).map(v => res.chanceByHKOToStr(v,'')).join(', ');
        }

        if (ohkoChance > 0.99 || gameData.meta.dangerousMoves.includes(vueMv.name))
          vueMv.color = 'red';
        else if (ohkoChance > 1/12  || gameData.meta.semiDangerousMoves.includes(vueMv.name))
          vueMv.color = 'orange';
        else if (ohkoChance > 0)
          vueMv.color = 'yellow';
      };

      // update trainerAgainstPlayer
      vtmon.trainerMovesAgainstPlayer = vtmon.stmon.moves.map(mname => {
        const mv = new Smogon.Move(GEN, mname);

        const vueMv = new MoveResultInfo();
        vueMv.name = mname;
        if(!PROTECT.includes(mname))
          vueMv.priority = mv.priority;

        vueMv.statusStr = new StatusAnalyzer().getStatusStr(mv);

        const calc = new DmgHKOCalculator(GEN, vtmon.stmon, vtmon.vpmon.smon, field, vueMv.name, rng);
        const res = calc.calculate();
        formatTrainerAgainstPlayerUsingRes(vueMv, res);
        return vueMv;
      });

      const formatPlayerAgainstTrainerUsingRes = (vueMv:MoveResultInfo, res:DmgHKOResult | null) => {
        if(res === null){
          vueMv.dmgText = NO_DMG_TXT;
          return vueMv;
        }

        vueMv.dmgText = res.dealDmg() ? `${res.getLowDmgNoCritPctStr()}-${res.getHighDmgNoCritPctStr()}` : NO_DMG_TXT;
        vueMv.hkoText = res.chanceByHKO.slice(0,3).map(v => {
          let color = '';
          if (v.hko === 1)
            color = v.chance > 0.99 ? 'lime' : (v.chance > 1/12 ? 'lightgreen' : '');
          return res.chanceByHKOToStr(v, color);
        }).join(', ');
        vueMv.hkoTitle = res.chanceByHKO.slice(3).map(v => res.chanceByHKOToStr(v,'')).join(', ');
        vueMv.hkoRes = res;
      };

      vtmon.playerMovesAgainstTrainer = vtmon.vpmon.smon.moves.map(mname => {
        const vueMv = new MoveResultInfo();
        if(!mname)
          return vueMv;

        vueMv.name = mname;

        const calc = new DmgHKOCalculator(GEN, vtmon.vpmon.smon, vtmon.stmon, field, vueMv.name, rng);
        const res = calc.calculate();
        formatPlayerAgainstTrainerUsingRes(vueMv, res);
        return vueMv;
      });

      //player using counter
      ['Mirror Coat','Counter'].forEach(counter => {
        if (!vtmon.vpmon.smon.moves.includes(<any>counter))
          return;
        vtmon.trainerMovesAgainstPlayer.forEach(tmove => {
          const calc = new DmgHKOCalculator(GEN, vtmon.stmon, vtmon.vpmon.smon, field, tmove.name, rng);
          const res = calc.calculateCounter(counter);
          if (!res)
            return;

          const vueMv = new MoveResultInfo();
          vueMv.name = counter + ' ' ;
          vueMv.displayName = counter + ' ' + tmove.name;
          formatPlayerAgainstTrainerUsingRes(vueMv, res);
          vtmon.playerMovesAgainstTrainer.push(vueMv);

          vtmon.playerMovesAgainstTrainer = vtmon.playerMovesAgainstTrainer.filter(m => {
            if(m.name === counter && m.dmgText === NO_DMG_TXT)
              return false;
            return true;
          });
        });
      });

      //trainer using counter
      ['Mirror Coat','Counter'].forEach(counter => {
        if (!vtmon.stmon.moves.includes(<any>counter))
          return;
        vtmon.playerMovesAgainstTrainer.forEach(pmove => {
          const calc = new DmgHKOCalculator(GEN, vtmon.vpmon.smon, vtmon.stmon, field, pmove.name, rng);
          const res = calc.calculateCounter(counter);
          if (!res)
            return;

          const vueMv = new MoveResultInfo();
          vueMv.name = counter;
          vueMv.displayName = counter + ' ' + pmove.name;
          formatPlayerAgainstTrainerUsingRes(vueMv, res);
          vtmon.trainerMovesAgainstPlayer.push(vueMv);

          vtmon.trainerMovesAgainstPlayer = vtmon.trainerMovesAgainstPlayer.filter(m => {
            if(m.name === counter && m.dmgText === NO_DMG_TXT)
              return false;
            return true;
          });
        });
      });

      const bestIdx = PkAssitant_update.findMaxIndex(vtmon.playerMovesAgainstTrainer, el => {
        if(!el.hkoRes)
          return 0;
        if(['Explosion','SelfDestruct'].includes(el.name))
          return 0;
        return el.hkoRes ? el.hkoRes.highDmgCrit : 0;
      });

      if (bestIdx !== -1){
        const best = vtmon.playerMovesAgainstTrainer[bestIdx];
        if(best.hkoRes){
          if (best.hkoRes.getHkoOrLessChance(1) > 0.99)
            best.color = 'lime';
          else if (best.hkoRes.getHkoOrLessChance(1) > 1/16)
            best.color = 'lightgreen';
          else if (best.hkoRes.getHkoOrLessChance(2) < 0)
            best.color = '#84fa84';
        }
      }
    });
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
}