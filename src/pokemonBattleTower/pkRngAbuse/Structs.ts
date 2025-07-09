
import { GameData, JsonTrainerPokemon, Trainer } from "../data/getData";
import type {Rng} from "./Rng";
export type {Trainer,JsonTrainerPokemon};
import * as CONST from "./const";
import { FACTORY_STYLE, TYPE } from "./const";
import { PriorityQueue } from "./PriorityQueue";
import {VblankRangeCalc} from "./CycleCountPerVblank";

export const CYCLE_PER_VBLANK = 280_896;

const DEBUG_PRINT_ALL_GRAPH = false;


export enum Facility {
  tower = 'tower',
  dome = 'dome',
  palace = 'palace',
  arena = 'arena',
  factory = 'factory',
  pike = 'pike',
  pyramid = 'pyramid',
}

export enum FacilityNum {
  tower = 0,
  dome = 1,
  palace = 2,
  arena = 3,
  factory = 4,
  pike = 5,
  pyramid = 6,
}

export const facilityNumToId = function(num:FacilityNum){
  return [Facility.tower, Facility.dome, Facility.palace, Facility.arena, Facility.factory, Facility.pike, Facility.pyramid][num];
}

export enum FactoryPikeMode {
  cluster,
  team,
}

/*
Modelization:
  ParentNode => Arc1(CycleOnChild 10-100) => ChildNode
             => Arc2(CycleOnChild 90-150)
             => Arc3(CycleOnChild 200-250)

  When expanding ChildNode, we divide the ChildNode in SubNode for each continous CycleRange
    ChildNode
      SubNode(Cycle 10-150, Arc1, Arc2)
      SubNode(Cycle 200-250, Arc3)

*/


/*
approximations:
  -cycle per vblank
  -base cycle for pokemon generation (not sure why variable)
  -hblank etc. not considered

*/
export abstract class Generator_base {
  constructor(public opts:Options){}

  sleep(dur:number){
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, dur);
    });
  }
  logError(...what:any[]){
    window['console'].log(...what);
  }
  logIfNeeded(rng:Rng,frameCount:number, msg:string){
    if(!this.opts.printRngFramesInfo)
      return;
    window['console'].log(`${rng.advancedCount - frameCount}-${rng.advancedCount} (+${frameCount}) ${msg}`);
  }
  Random(rng:Rng,reason:string){
    const r = rng.Random();
    if(reason)
      this.logIfNeeded(rng, 1, reason);
    return r;
  }
  RandomX(rng:Rng, count:number, reason:string){
    if(count === 0)
      return;
    rng.RandomX(count);
    if(reason)
      this.logIfNeeded(rng, count, reason);
  }
  RandomNum(rng:Rng,reason:string){
    return Number(this.Random(rng,reason));
  }
  Random32(rng:Rng,reason:string){
    const r1 = this.Random(rng,"");
    const r2 = this.Random(rng,"");
    const res = (r1 | (r2 << BigInt(16))) & BigInt(0xFFFFFFFF);
    if(reason)
      this.logIfNeeded(rng, 2, reason);
    return res;
  }
  getRandomFromRange(range:number[], rng:Rng, reason:string){
    const rangeLen = BigInt(range[1] - range[0] + 1);
    const r = this.Random(rng, reason);
    return range[0] + Number(r % rangeLen);
  }

  GetRandomScaledFrontierTrainerId(rng:Rng) : [number, number, number] {
    const challengeNum = this.opts.getChallengeNum();
    const battleNum = this.opts.getBattleNum();

    const r = this.RandomNum(rng,'GetRandomScaledFrontierTrainerId');
    const trange = challengeNum <= 7 && battleNum == CONST.FRONTIER_STAGES_PER_CHALLENGE - 1
                    ? CONST.sFrontierTrainerIdRangesHard[challengeNum]
                    : CONST.sFrontierTrainerIdRanges[Math.min(challengeNum, 7)];
    const divisor = trange[1] - trange[0] + 1;
    const trainerId = trange[0] + (r % divisor);
    return [trainerId, r, divisor];
  }

  GetRandomScaledFrontierTrainer(rng:Rng){
    return this.opts.gameData.trainers[this.GetRandomScaledFrontierTrainerId(rng)[0]];
  }
}


export abstract class GraphGenerator_base extends Generator_base {
  graph = new Graph();
  nextSubNodeUid = 0;
  nextArcUid = 0;


  async generate(postProgress:(expandCount:number, totalCount:number) => void){
    console['log']('BtGenerator.generate: this.opts=', this.opts);
    this.createRootNode();

    let expandCount = 0;
    while(true){
      const n = this.graph.getNextNodeToExpand();
      if(!n)
        break;

      const filteredReason = this.expandNode(n);
      if (filteredReason !== null)
        this.forEachSubNode(n, (subNode) => {
          subNode.filteredReason = filteredReason;
        }); //must create sub nodes to appear in graph etc.

      expandCount++;
      if (expandCount % 100 === 0)
        await this.sleep(1);

      if(this.opts.mustCancel && this.opts.mustCancel())
        return null;

      postProgress(expandCount, this.graph.nextUid);
    }
    return this.graph.getResults();
  }

  abstract createRootNode() : Node;
  abstract expandNode(n:Node) : FilteredReason | null;

  forEachSubNode(n:Node,f:(pai:SubNode) => void){
    const groups = this.createSubNodes(n);
    groups.forEach(pai => {
      f(pai);
    });
  }
  createSubNodes(n:Node){
    const pas = n.parentArcs;

    if(pas.length === 0)
      return [];

    pas.sort((a,b) => {
      return a.cycleRangeOnChild.min - b.cycleRangeOnChild.min;
    });

    pas.forEach(pa => {
      const fstMatching = n.subNodes.find(sn => sn.addParentArcIfOverlap(pa));
      if(fstMatching)
        return;
      n.subNodes.push(new SubNode(this.nextSubNodeUid++, n, pa));
    });

    n.subNodes.sort((a,b) => { //probably redundant
      return a.cycleRange.min - b.cycleRange.min;
    });

    return n.subNodes;
  }

  createChildNodes(parentNode:Node, pai:SubNode, minMaxCyclesToAdd:Range, section:AlgoSection, rng:Rng, res:Result){
    if (parentNode.minMaxCyclesToAddCausedByAction === null)
      parentNode.minMaxCyclesToAddCausedByAction = minMaxCyclesToAdd;
    else if (!parentNode.minMaxCyclesToAddCausedByAction.isSame(minMaxCyclesToAdd))
      throw new Error('parentNode.minMaxCyclesToAddAfterAction !== minMaxCyclesToAdd');

    if (parentNode.sectionAfterAction === null)
      parentNode.sectionAfterAction = section;
    else if (parentNode.sectionAfterAction !== section)
      throw new Error('parentNode.sectionAfterAction !== section');

    const rcvb = this.opts.vblankCalc.addCyclesAndHandleVblanks_range(pai.cycleRange, minMaxCyclesToAdd, rng.advancedCount);

    if (rcvb.max.appliedVblankCount === 0){ //aka vblank impossible
      const childNode = this.graph.getOrCreateNode(section, rng, res);
      const rangeModulo = new Range(rcvb.min.cycles, rcvb.max.cycles);
      childNode.addParent(new Arc(this.nextArcUid++, pai, childNode, res, rangeModulo, 0));
      return;
    }

    // at least one vblank were applied
    // ex: min has 5 vblanks. max has 7 vblanks.  6 vblanks is also possible
    for(let i = rcvb.min.appliedVblankCount; i <= rcvb.max.appliedVblankCount; i++){
      const rng2 = rng.clone();
      this.RandomX(rng2, i, 'createChildNodes vblanks'); // vblanks

      let min = i === rcvb.min.appliedVblankCount ? rcvb.min.cycles : this.opts.vblankCalc.getMinCycle(1);
      let max = i === rcvb.max.appliedVblankCount ? rcvb.max.cycles : CYCLE_PER_VBLANK - 1;

      const childNode = this.graph.getOrCreateNode(section, rng2, res);

      const newRange = new Range(min,max);
      childNode.addParent(new Arc(this.nextArcUid++, pai, childNode, res, newRange, i));
    }
  }
}

export const formatNum = function(n:number){
  if(n < 10000)
    return '' + n;
  if(n < 1_000_000)
    return '' + Math.floor(n / 1000) + '_' + format1000(n % 1000);
  return '' + Math.floor(n / 1000000) + '_' + format1000(Math.floor((n % 1000000) / 1000)) + '_' + format1000(n % 1000);
}
export const format1000 = function(n:number){
  return ('' + n).padStart(3, '0');
}

export class Range {
  constructor(public min:number, public max:number){
    if(this.min > this.max)
      console['log']('this.min > this.max. ' + this.min + ' ' + this.max);
  }
  clone(toAdd=0){
    return new Range(this.min + toAdd, this.max + toAdd);
  }
  isInRange(p:number){
    return p >= this.min && p <= this.max;
  }
  overlaps(r:Range){
    return this.isInRange(r.min) || this.isInRange(r.max) || r.isInRange(this.min) || r.isInRange(this.max)
  }
  includesSubRange(subRange:Range){
    return this.isInRange(subRange.min) && this.isInRange(subRange.max);
  }
  count(){
    return this.max - this.min + 1;
  }
  isSame(r:Range){
    return this.min === r.min && this.max === r.max;
  }
  toStr(){
    return `[${formatNum(this.min)}, ${formatNum(this.max)}]`
  }
  getSubRangeIndex(val:number, subrangeCount:number){
    if (val < this.min || val > this.max || subrangeCount <= 0)
      return -1;

    //ex: [0,98] with 3 subrange => [0,32] is 0, [33,65] is 1, [66,98] is 2
    const v = val - this.min;
    const countBySubrange = this.count() / subrangeCount; //ex: 33
    return Math.floor(v / countBySubrange);
  }
}

export class RangeAndProbInput {
  min = '0';
  max = '0';
  distr = '1';

  init2(val:number, less:number, more:number,distr:string){
    this.init('' + (val - less), '' + (val + more), '' + distr);
  }
  init(min:string,max:string,distr:string){
    this.min = min;
    this.max = max;
    this.distr = distr;
  }
  toStr(){
    return this.min + '|' + this.max + '|' + this.distr;
  }
  initFromStr(str:string){
    const arr = str.split('|');
    this.min = arr[0] ?? '0';
    this.max = arr[1] ?? '0';
    if (arr[2])
      this.distr = arr[2];
  }
}

export class RangeAndProb extends Range {
  constructor(inp:RangeAndProbInput, overwriteRange?:Range){
    super(+inp.min, +inp.max);
    this.distr = inp.distr.trim().split(',').map(a => +(a.trim())).filter(a => a >= 0);
    if(!this.distr.length)
      this.distr = [1];
    if(overwriteRange)
      this.setMinMax(overwriteRange);
  }
  distr:number[] = [];
  setMinMax(r:Range){
    this.min = r.min;
    this.max = r.max;
  }
  getProbForVal(val:number){
    const idx = this.getSubRangeIndex(val, this.distr.length);
    if(idx === -1)
      return null;
    return this.distr[idx];
  }
}

export class CycleWithVblanks {
  constructor(public cycles = 0, public appliedVblankCount = 0){}
}

export class RangeCycleWithVblanks {
  constructor(public min:CycleWithVblanks, public max:CycleWithVblanks){}
}



export class Result {
  trainer:Trainer | null = null;
  monPids:bigint[] = [];
  jmons:JsonTrainerPokemon[] = [];
  monNats:{abilityNum:number,gender:Gender}[] = [];

  clone(){
    const res = new Result();
    res.trainer = this.trainer;
    res.monPids = this.monPids.slice(0);
    res.jmons = this.jmons.slice(0);
    res.monNats = this.monNats.slice(0);
    return res;
  }
  getJmons(){
    const c = Math.min(this.jmons.length, this.monNats.length);
    const jmonInfos:{jmon: JsonTrainerPokemon;abilityNum: number,gender:Gender}[] = [];
    for (let i = 0; i < c; i++)
      jmonInfos.push({jmon:this.jmons[i], abilityNum:this.monNats[i].abilityNum, gender:this.monNats[i].gender});
    return jmonInfos;
  }
  getJmonsForFilter12(){
    const jmonInfos:{jmon?: JsonTrainerPokemon;abilityNum?: number, gender?:Gender}[] = [{},{},{}];
    for(let i = 1 ; i < 3; i++){
      const jmonInfo = jmonInfos[i];

      const jmon = this.jmons[i];
      if(jmon)
        jmonInfo.jmon = jmon;

      const nat = this.monNats[i];
      if(nat){
        jmonInfo.gender = nat.gender;
        jmonInfo.abilityNum = nat.abilityNum;
      }
    }
    return jmonInfos;
  }
  getShortDesc(){
    return this.jmons.map((jmon, i) => {
      let s2 = jmon.displayName;
      const nat = this.monNats[i];
      if(!nat)
        return s2;
      if(nat.gender !== Gender.genderless)
        s2 += ' ' + (nat.gender === Gender.male ? 'M' : 'F');
      if(jmon.abilities.length > 1)
        s2 += ' ' + jmon.abilities[nat.abilityNum];
      return s2;
    }).join(', ')
  }
  isSame(r:Result){
    if(this.trainer !== r.trainer)
      return false;

    const isSameArray = function<T>(a:T[],b:T[], cmp:(a:T,b:T) => boolean){
      if(a.length !== b.length)
        return false;
      return a.every((v,i) => cmp(v, b[i]));
    };

    if(!isSameArray(this.monPids, r.monPids, (a,b) => a === b))
      return false;
    if(!isSameArray(this.jmons, r.jmons, (a,b) => a === b))
      return false;
    if(!isSameArray(this.monNats, r.monNats, (a,b) => a.abilityNum === b.abilityNum && a.gender === b.gender))
      return false;
    return true;
  }
  hashResultForGeneration(){
    let s = '';
    if(this.trainer)
      s += this.trainer.id + ',';
    for (const p of this.jmons)
      s += p.id + ',';
    for (const p of this.monPids)
      s += p + ',';
    for (const p of this.monNats)
      s += p.gender + p.abilityNum + ',';
    return s;
  }
  hashResult(){
    let s = '';
    if(this.trainer)
      s += this.trainer.id + ',';
    for (const p of this.jmons)
      s += p.id + ',';
    for (const p of this.monNats)
      s += p.abilityNum + ',' + p.gender + ',';
    return s;
  }

}

export enum Gender {
  male,
  female,
  genderless
}

export const forEachAbilityAndGender = function(jtmon:{abilities:string[], species:string}, f:(ab:number, gender:Gender) => void){
  for(let i = 0 ; i < jtmon.abilities.length; i++){
    const ratio = CONST.getGenderRatio(jtmon.species);
    if (ratio === null)
      f(i, Gender.genderless);
    else if (ratio === 100)
      f(i, Gender.female);
    else if (ratio === 0)
      f(i, Gender.male);
    else {
      f(i, Gender.female);
      f(i, Gender.male);
    }
  }
};


export class FilterMon {
  speciesNum:number | null = null;
  item:string | null = null;
  moves:string[] = [];
  abilityNum:number | null = null;
  gender:Gender | null = null;
  battleFrontierId:number | null = null;

  hasSpeciesDefined(){
    return this.speciesNum !== null || this.battleFrontierId !== null;
  }
  toStr(){
    return [this.speciesNum, this.item, ...this.moves, this.abilityNum, this.gender,this.battleFrontierId].join(',');
  }
}
export class Filter {
  constructor(extra:Partial<Filter>){
    Object.assign(this, extra);
  }
  toStr(){
    return [this.trainerId, ...this.pokemons.map(m => m.toStr())].join(',');
  }
  trainerId:number | null = null;
  pokemons:FilterMon[] = [new FilterMon(),new FilterMon(),new FilterMon()];
  factory_battleStyle:FACTORY_STYLE | null = null;
  factory_commonType:TYPE | null = null;

  static doesMonRespectFilter(fmon:FilterMon | null, jtmon?:JsonTrainerPokemon, abilityNum?:number, gender?:Gender){
    if(!fmon)
      return true;
    if(fmon.battleFrontierId !== null && jtmon !== undefined && jtmon.id !== fmon.battleFrontierId)
      return false;
    if (fmon.speciesNum !== null && jtmon !== undefined && fmon.speciesNum !== CONST.SPECIES_BY_NAME.get(jtmon.species))
      return false;
    if (fmon.abilityNum !== null && abilityNum !== undefined && fmon.abilityNum !== abilityNum)
      return false;
    if (fmon.item !== null && jtmon !== undefined && fmon.item !== jtmon.item)
      return false;
    if (jtmon !== undefined && fmon.moves.some(mv => mv && !jtmon.moves.includes(mv)))
      return false;
    if (fmon.gender !== null && gender !== undefined && fmon.gender !== gender)
      return false;
    return true;
  }

  doesMonRespectFilter0(jtmon?:JsonTrainerPokemon, abilityNum?:number, gender?:Gender){
    return Filter.doesMonRespectFilter(this.pokemons[0], jtmon, abilityNum, gender);
  }
  doesMonRespectFilter12(jtmons:{jmon?: JsonTrainerPokemon;abilityNum?: number, gender?:Gender}[]){
    //at least 1 pokemon in slot1 or slot2 must respect filterMon[1]
    if (!Filter.doesMonRespectFilter(this.pokemons[1], jtmons[1].jmon, jtmons[1].abilityNum, jtmons[1].gender) &&
        !Filter.doesMonRespectFilter(this.pokemons[1], jtmons[2].jmon, jtmons[2].abilityNum, jtmons[2].gender))
      return false;
    //at least 1 pokemon in slot1 or slot2 must respect filterMon[2]
    if (!Filter.doesMonRespectFilter(this.pokemons[2], jtmons[1].jmon, jtmons[1].abilityNum, jtmons[1].gender) &&
        !Filter.doesMonRespectFilter(this.pokemons[2], jtmons[2].jmon, jtmons[2].abilityNum, jtmons[2].gender))
      return false;
    return true;
  }
}

export class Options {
  constructor(public gameData:GameData, extra:Partial<Options>){
    Object.assign(this, extra);
  }
  printRngFramesInfo:boolean | null = null;
  trainersBattledAlready:number[] = [];
  filter = new Filter({});
  facility = Facility.tower;
  winStreak = 0;
  isLvl50 = false;
  vblankCalc = new VblankRangeCalc(null);
  mustCancel:Nullable<() => boolean> = null;
  rngCalib:RngCalib = null!;
  palaceOldManMsg:PalaceOldManMsg | null = null;
  factoryPastRentalCount = 0;
  factoryPlayerJmons:JsonTrainerPokemon[] = [];

  /** for performance */
  calculateVblanksStr = false;

  /** number of 7-battles series completed*/
  getChallengeNum(){
    return Math.floor(this.winStreak / 7);
  }
  /** between 0 and 6 */
  getBattleNum(){
    return this.winStreak % 7;
  }
}

export const getGender = function(pid:bigint, speciesName:string){
  const ratio = CONST.getGenderRatio(speciesName);
  if (ratio === null)
    return Gender.genderless;
  if (ratio === 100)
    return Gender.female;
  if (ratio === 0)
    return Gender.male;

  const ratioIngame = Math.floor((ratio * 255) / 100);
  const pidGender = pid & BigInt(0xFF);
  return BigInt(ratioIngame) > pidGender ? Gender.female : Gender.male;
}

/** the same rng frame/section can have multiple nodes, if there are multiple parentResult to reach it */
export class Node {
  constructor(
    public uid:number,
    public sectionBeforeAction:AlgoSection,
    public rngBeforeAction:Rng,
    public resultBeforeNodeAction:Result,
    public priority:number){
      this.sectionRngCount = this.getSectionRngCount();
    }
  sectionRngCount = 0;

  /** init when expanding */
  subNodes:SubNode[] = [];
  sectionAfterAction:AlgoSection | null = null;
  minMaxCyclesToAddCausedByAction:Range | null = null;

  /** all parentArcs share the same result */
  parentArcs:Arc[] = [];

  private getSectionRngCount(){
    switch (this.sectionBeforeAction){
      case AlgoSection.MON1NAT:
      case AlgoSection.MON2NAT:
      case AlgoSection.MON3NAT:
        return 2;
    }
    return 1;
  }
  getRangeWithMaybeHole(){
    if(this.subNodes.length === 0)
      return new Range(0,0);
    const min = this.subNodes.reduce((prev,cur) => Math.min(prev,cur.cycleRange.min), CYCLE_PER_VBLANK - 1) || 0;
    const max = this.subNodes.reduce((prev,cur) => Math.max(prev,cur.cycleRange.max), 0) || 0;
    return new Range(min, max);
  }
  addParent(pa:Arc){
    //multiple this.parentArcGroups can share the same pa.parentNode. happens when cycle interval is disjoint
    if(this.subNodes.length > 0)
      console['log']('cant add parent if groups already created');
    this.parentArcs.push(pa);
    if(pa.parentSubNode)
      pa.parentSubNode.childArcs.push(pa);
  }

}

export class Graph {
  /** nodes[section][frame][result] */
  nodes:Map<number,Map<string, Node>>[] = [];
  queue = new PriorityQueue<Node>();
  nextUid = 0;
  reexpandNodeCount = 0;
  rootSubNode:SubNode | null = null;

  getOrCreateNode(section:AlgoSection, rng:Rng, parentResult:Result,){
    if(!this.nodes[section])
      this.nodes[section] = new Map();

    const map = this.nodes[section];
    let map2 = map.get(rng.advancedCount);
    if (!map2){
      map2 = new Map();
      map.set(rng.advancedCount, map2);
    }
    const resStr = parentResult.hashResultForGeneration();
    let n = map2.get(resStr);
    if (!n){
      const priority = -rng.advancedCount;
      n = new Node(this.nextUid++, section, rng.clone(), parentResult, priority);

      map2.set(resStr, n);
      if (section !== null)
        this.queue.add(n);
    }
    return n;
  }

  getNextNodeToExpand(){
    const n = this.queue.remove();
    return n;
  }

  getResultNodes(){
    return this.getNodesBySection(AlgoSection.END);
  }
  getNodesBySection(sec:AlgoSection){
    const res:Node[] = [];
    const map = this.nodes[sec];
    if(!map)
      return res;

    map.forEach(v => {
      v.forEach(v2 => {
        res.push(v2);
      })
    });
    return res;
  }
  getResults(){
    return this.getResultNodes().map(n => n.resultBeforeNodeAction);
  }
  toStr(){
    if(!this.rootSubNode)
      return 'Error: !this.rootSubNode';

    const alreadyPrinted = new Set<SubNode>();
    return this.rootSubNode.selfAndChildrenToStr('', alreadyPrinted);
  }
}

export class Arc {
  constructor(
      public uid:number,
      /** the ArcGroup that caused the creation of Arc */
      public parentSubNode:SubNode,
      public childNode:Node,
      public parentResult:Result,
      public cycleRangeOnChild:Range,
      /** v-blank occuring during trainer startMsg are excluded. elevator is excluded */
      public vblankFromParentToChild:number,
      /** v-blanks from trainer startMsg or elevator */
      public vblankFromParentToChild2:number | null = null){}

  childSubNode:SubNode | null = null; //null until the SubNodes of childNode are created
  hasRetryVblank(){
    if(this.parentSubNode === null)
      return false;
    if(!this.isRetryArc())
      return false;
    return this.parentSubNode.node.rngBeforeAction.advancedCount !== this.childNode.rngBeforeAction.advancedCount;
  }
  isSuccessArc(){
    return this.parentSubNode === null || this.parentSubNode.node.sectionBeforeAction !== this.childNode.sectionBeforeAction;
  }
  isRetryArc(){
    return !this.isSuccessArc();
  }
}

export class SubNode {
  constructor(public uid:number,
              public node:Node,
              firstParentArc:Arc | null){
    if(firstParentArc){
      this.parentArcs.push(firstParentArc);
      firstParentArc.childSubNode = this;
      this.cycleRange = firstParentArc.cycleRangeOnChild.clone();
    }
  }
  parentArcs:Arc[] = [];
  cycleRange:Range;
  childArcs:Arc[] = [];
  filteredReason:FilteredReason | null = null;

  addParentArcIfOverlap(parentArc:Arc){
    if(!this.cycleRange.overlaps(parentArc.cycleRangeOnChild))
      return false;
    this.parentArcs.push(parentArc);
    parentArc.childSubNode = this;
    this.cycleRange.min = Math.min(this.cycleRange.min, parentArc.cycleRangeOnChild.min);
    this.cycleRange.max = Math.max(this.cycleRange.max, parentArc.cycleRangeOnChild.max);
    return true;
  }
  selfAndChildrenToStr(indent:string, alreadyPrinted:Set<SubNode>){
    if(alreadyPrinted.has(this))
      return `${indent}sn#${this.uid} N#${this.node.uid}: already printed\n`;

    alreadyPrinted.add(this);

    const ranges = this.cycleRange.toStr();
    const toAdd = this.node.minMaxCyclesToAddCausedByAction?.toStr() ?? '';
    let str = `${indent}sn#${this.uid} N#${this.node.uid} ${AlgoSection_SHORT_NAMES[this.node.sectionBeforeAction!]} RNG=${this.node.rngBeforeAction.advancedCount} CCBefore=${ranges}, CCToAdd=${toAdd}`;

    if (this.childArcs.length === 0){
      str += '\n';
      const term = this.filteredReason === null ? 'SUCCESS' : `INVALID (${FilteredReason[this.filteredReason]})`
      str += indent + ' => ' + term + ' ' + this.node.resultBeforeNodeAction.getShortDesc() + '\n';
      return str;

    }
    if (this.childArcs.length !== 1){
      str += '\n';
      this.childArcs.forEach(pa => {
        if(pa.childSubNode)
          str += pa.childSubNode.selfAndChildrenToStr(indent + ' ', alreadyPrinted);
      });
      return str;
    }

    let skippedNodes:SubNode[] = [];
    const getNextChildToPrint = (pn:SubNode | null) : SubNode | null => {
      if(DEBUG_PRINT_ALL_GRAPH)
        return pn;

      while(true){
        //prevent printing redundant nodes
        if(pn && pn.childArcs.length === 1 && pn.node.sectionBeforeAction === this.node.sectionBeforeAction){
          skippedNodes.push(pn);
          if(!pn.childArcs[0].childSubNode)
            return pn;
          pn = pn.childArcs[0].childSubNode;
          continue;
        }
        return pn;
      }
    };
    const childNodeToPrint = getNextChildToPrint(this.childArcs[0].childSubNode);
    if (skippedNodes.length)
      str += ' (' + skippedNodes.map(a => 'sn#' + a.uid).join(' ') + ')';
    str += '\n';

    if (childNodeToPrint)
      str += childNodeToPrint.selfAndChildrenToStr(indent + ' ', alreadyPrinted);
    return str;
  }
}

export enum FilteredReason {
  wrongTrainer,
  wrongPokemon0,
  wrongPokemon12,
  tooManyResults,
  factory_wrongStyle,
  factory_wrongCommonType,
  factory_wrongPlayerRental,
}

export enum AlgoSection {
  START,
  TRAINER,
  MON1ID,
  MON1NAT,
  MON2ID,
  MON2NAT,
  MON3ID,
  MON3NAT,
  END,
}
export const AlgoSection_SHORT_NAMES = [
  'S',
  'T',
  'I1',
  'N1',
  'I2',
  'N2',
  'I3',
  'N3',
  'End',
];

export class RngCalib {
  constructor(extra:RngCalib){
    Object.assign(this, extra);
  }
  beforeTrainer:RangeAndProb;
  beforeMon1:RangeAndProb;
  cycleMon1Id:RangeAndProb;

  includesFramesStartSpeech:boolean;
  includesFramesInElevator:boolean;
}

export enum PalaceOldManMsg {
  People,
  Rather,
  APokemon,
  //Areyoubeginning,
  //AhISee,
}