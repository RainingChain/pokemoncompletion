
import {Rng} from "../Rng";
import * as CONST from "../const";
import {GraphGenerator_base, getGender, Facility, AlgoSection,FilteredReason, Arc,SubNode, Result,Range, Node, Options,PalaceOldManMsg} from "../Structs";
import * as CycleCountPerSection from "./CycleCountPerSection";

export class BtGenerator extends GraphGenerator_base {
  createRootNode(){
    const n = this.graph.getOrCreateNode(AlgoSection.START, new Rng(BigInt(0)), new Result());
    const sn = new SubNode(this.nextSubNodeUid++, n, null);
    sn.cycleRange = new Range(0,1); // range doesnt matter
    n.subNodes.push(sn);
    this.graph.rootSubNode = sn;
    return n;
  }

  getFrameFromElevator(){
    if (this.opts.facility === Facility.tower){
      const elevatorFloor = Math.min(this.opts.getChallengeNum(), CONST.ELEVATOR_FRAME_BY_STREAK.length - 1);
      return CONST.ELEVATOR_FRAME_BY_STREAK[elevatorFloor];
    }
    if (this.opts.facility === Facility.palace){
      const BASE = 1458;
      if (this.opts.winStreak < 50){
        if(this.opts.palaceOldManMsg === PalaceOldManMsg.APokemon)
          return 1529 - BASE;
        if(this.opts.palaceOldManMsg === PalaceOldManMsg.People)
          return 1546 - BASE;
        if(this.opts.palaceOldManMsg === PalaceOldManMsg.Rather)
          return 1584 - BASE;
        console['log']('error getFrameFromElevator', this.opts.palaceOldManMsg);
      } else if (this.opts.winStreak < 99)
        return 1466 - BASE;
      else
        return 1458 - BASE;
    }
    return 0;
  }
  expandNode_start(n:Node){
    if (n.subNodes.length !== 1)
      throw new Error('n.subNodes.length !== 1, it should have been created that way in createRootNodes');

    const rng = n.rngBeforeAction.clone();
    const frameFromElevator = this.getFrameFromElevator();

    const beforeTrainer = this.opts.rngCalib.beforeTrainer.clone(this.opts.rngCalib.includesFramesInElevator ? -frameFromElevator : 0);
    this.RandomX(rng, frameFromElevator, "Elevator");
    this.RandomX(rng, beforeTrainer.min, "Start offset");

    const subNode = n.subNodes[0];

    for(let vblank = beforeTrainer.min; vblank <= beforeTrainer.max; vblank++){
      const res = n.resultBeforeNodeAction.clone();
      const childN = this.graph.getOrCreateNode(AlgoSection.TRAINER, rng.clone(), res);
      const range = new Range(0,1); // range doesnt matter
      const pa = new Arc(this.nextArcUid++, subNode, childN, res, range, vblank, frameFromElevator);
      childN.addParent(pa);
      rng.Random();
    }
  }

  expandNode(n:Node){
    if(n.sectionBeforeAction === AlgoSection.START){
      this.expandNode_start(n);
      return null;
    }
    if(n.sectionBeforeAction === AlgoSection.END){
      this.forEachSubNode(n, () => {}); // nothing to do, but must create the sub nodes
      return null;
    }
    const idIdx = [AlgoSection.MON1ID,AlgoSection.MON2ID,AlgoSection.MON3ID].indexOf(n.sectionBeforeAction!);
    if(idIdx !== -1)
      return this.expandNode_monId(n, idIdx);

    const natIdx = [AlgoSection.MON1NAT,AlgoSection.MON2NAT,AlgoSection.MON3NAT].indexOf(n.sectionBeforeAction!);
    if(natIdx !== -1)
      return this.expandNode_monNat(n, natIdx);

    if(n.sectionBeforeAction === AlgoSection.TRAINER)
      return this.expandNode_trainer(n);

    throw new Error('invalid section ' + n.sectionBeforeAction);
  }




  expandNode_trainer(n:Node){
    const rng = n.rngBeforeAction.clone();
    //TODO: handle fixed trainerId (brain)
    const trainer = this.GetRandomScaledFrontierTrainer(rng);

    //retry
    if(this.opts.trainersBattledAlready.includes(trainer.id)){
      const cycles = new Range(0,0);  //doesnt really matter
      this.forEachSubNode(n, p => {
        return this.createChildNodes(n, p, cycles, n.sectionBeforeAction, rng, n.resultBeforeNodeAction);
      });
      return null;
    }

    //success
    if(this.opts.filter.trainerId !== null && this.opts.filter.trainerId !== trainer.id)
      return FilteredReason.wrongTrainer;

    const res = n.resultBeforeNodeAction.clone();
    res.trainer = trainer;

    rng.Random32(); // OT
    const advFromStartMsg = CONST.STARTMSG_FRAME_BY_TRAINER[res.trainer.id];
    rng.RandomX(advFromStartMsg); // STARTMSG

    const trainerToMon1VblankRange = this.opts.rngCalib.beforeMon1.clone(this.opts.rngCalib.includesFramesStartSpeech ? -advFromStartMsg : 0);
    this.forEachSubNode(n, subNode => {
      for(let i = trainerToMon1VblankRange.min ; i <= trainerToMon1VblankRange.max; i++){
        const rng2 = rng.clone();
        this.RandomX(rng2, i, 'trainerToMon1VblankRange');

        const n2 = this.graph.getOrCreateNode(AlgoSection.MON1ID, rng2, res);
        n2.addParent(new Arc(this.nextArcUid++, subNode, n2, res, this.opts.rngCalib.cycleMon1Id.clone(), i, advFromStartMsg));
      }
    });
    return null;
  }

  expandNode_monId(n:Node, monIdx:number){
    const secNameId = ['MON1ID','MON2ID','MON3ID'][monIdx];

    const trainerId = n.resultBeforeNodeAction.trainer!.id;
    const monSet = this.opts.gameData.trainers[trainerId].pokemons;
    const bfMonCount = BigInt(monSet.length);

    const rng = n.rngBeforeAction.clone();

    const rand = this.Random(rng, `${secNameId} FillTrainerParty-ChoseMon`);
    const rIdx = rand % bfMonCount;
    const monId = monSet[Number(rIdx)];
    const jmon = this.opts.gameData.trainerPokemons[monId];

    const retryReason = (() => {
      if (this.opts.isLvl50 && monId > CONST.FRONTIER_MONS_HIGH_TIER)
        return CycleCountPerSection.MonIdRetryReason.tooHighMonId;

      for(let i = 0 ; i < n.resultBeforeNodeAction.jmons.length; i++){
        if (n.resultBeforeNodeAction.jmons[i].species === jmon.species){
          if (i === 0)
            return CycleCountPerSection.MonIdRetryReason.sameSpeciesAs1;
          return CycleCountPerSection.MonIdRetryReason.sameSpeciesAs2;
        }
      }

      for(let i = 0 ; i < n.resultBeforeNodeAction.jmons.length; i++){
        if (n.resultBeforeNodeAction.jmons[i].item === jmon.item){
          if (i === 0)
            return CycleCountPerSection.MonIdRetryReason.sameItemAs1;
          return CycleCountPerSection.MonIdRetryReason.sameItemAs2;
        }
      }

      return null;
    })();

    //retry
    if(retryReason !== null){
      const cycles = (() => {
        const d = {
            randForMon: rand,
            monCount: bfMonCount,
        };
        if (monIdx === 0)
          return CycleCountPerSection.MON1ID_CC_RETRY(d);
        if (monIdx === 1)
          return CycleCountPerSection.MON2ID_CC_RETRY({
            ...d,
            mon1Pid:n.resultBeforeNodeAction.monPids[0],
            retryReason});
        return CycleCountPerSection.MON3ID_CC_RETRY({
          ...d,
          mon1Pid:n.resultBeforeNodeAction.monPids[0],
          mon2Pid:n.resultBeforeNodeAction.monPids[1],
          retryReason});
      })();

      this.forEachSubNode(n, p => {
        return this.createChildNodes(n, p, cycles, n.sectionBeforeAction, rng, n.resultBeforeNodeAction);
      });
      return null;
    }

    //success
    if (monIdx === 0){
      if (!this.opts.filter.doesMonRespectFilter0(jmon))
        return FilteredReason.wrongPokemon0;
    } else {
      if (!this.opts.filter.doesMonRespectFilter12(n.resultBeforeNodeAction.getJmonsForFilter12()))
        return FilteredReason.wrongPokemon12;
    }

    const res = n.resultBeforeNodeAction.clone();
    res.jmons[monIdx] = jmon;

    const nextSection = [AlgoSection.MON1NAT,AlgoSection.MON2NAT,AlgoSection.MON3NAT][monIdx];

    const cycles = (() => {
      if (monIdx === 0)
        return CycleCountPerSection.MON1ID_CC_SUCCESS({
          randForMon: rand,
          monCount: bfMonCount});
      if (monIdx === 1)
        return CycleCountPerSection.MON2ID_CC_SUCCESS({
          randForMon: rand,
          monCount: bfMonCount,
          mon1Pid:n.resultBeforeNodeAction.monPids[0]});
      return CycleCountPerSection.MON3ID_CC_SUCCESS({
        randForMon: rand,
        monCount: bfMonCount,
        mon1Pid:n.resultBeforeNodeAction.monPids[0],
        mon2Pid:n.resultBeforeNodeAction.monPids[1]});
    })();

    this.forEachSubNode(n, p => {
      return this.createChildNodes(n, p, cycles, nextSection, rng, res);
    });
    return null;
  }

  expandNode_monNat(n:Node, monIdx:number){
    const secNameId = ['MON1NAT','MON2NAT','MON3NAT'][monIdx];

    const jmon = n.resultBeforeNodeAction.jmons[monIdx];
    const rng = n.rngBeforeAction.clone();

    const pid = this.Random32(rng, `${secNameId} NaturePid`);

    const natFromPid = pid % BigInt(CONST.NATURES.length);
    const wantedNat = BigInt(CONST.NATURES.indexOf(jmon.nature));


    //retry
    if (wantedNat !== natFromPid){
      const cycles = CycleCountPerSection.MONXNAT_CC_RETRY({pid});
      this.forEachSubNode(n, p => {
        return this.createChildNodes(n, p, cycles, n.sectionBeforeAction, rng, n.resultBeforeNodeAction);
      });
      return null;
    }

    const abilityNum = jmon.abilities.length <= 1 ? 0 : (pid & BigInt(1) ? 1 : 0);
    const gender = getGender(pid, jmon.species);

    const res = n.resultBeforeNodeAction.clone();
    res.monNats[monIdx] = {abilityNum, gender};

    //success
    if (monIdx === 0){
      if(!this.opts.filter.doesMonRespectFilter0(jmon, abilityNum, gender))
        return FilteredReason.wrongPokemon0;
    } else {
      if (!this.opts.filter.doesMonRespectFilter12(res.getJmonsForFilter12()))
        return FilteredReason.wrongPokemon12;
    }

    const nextSection = [AlgoSection.MON2ID,AlgoSection.MON3ID,AlgoSection.END][monIdx];

    const cycles = CycleCountPerSection.MONXNAT_CC_SUCCESS({pid,jmonId:jmon.id,isLvl50:this.opts.isLvl50});

    this.forEachSubNode(n, p => {
      return this.createChildNodes(n, p, cycles, nextSection, rng, res);
    });
    return null;
  }
}




