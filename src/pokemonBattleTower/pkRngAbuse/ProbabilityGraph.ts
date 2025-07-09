import {Options,Graph,SubNode,Arc,AlgoSection, AlgoSection_SHORT_NAMES, Result,CYCLE_PER_VBLANK,Range, Node} from "./Structs";
import {uheprng} from "./uheprng";
import {SubRange, ProbArc,ProbNode} from "./ProbNode";

export const ROOT_PROB = 1000;
export const SUBRANGE_COUNT = 50;

export abstract class ProbabilityGraph {
  constructor(public graph:Graph,
              public opts:Options){}

  subNodeToProbNode = new Map<SubNode, ProbNode>();
  probNodesBySectionBeforeAction:ProbNode[][] = Array.from(new Array(AlgoSection.END + 1)).map(() => ([]));
  /** using a normal prng formula (not related with pokemon rng) */
  stdRng:{random:() => number} = new uheprng('0');
  nextArcUid = 0;

  abstract expandNode(pn:ProbNode) : void;

  getRootProbNode() : ProbNode | null {
    return this.probNodesBySectionBeforeAction[AlgoSection.START][0];
  }
  printGraph(){
    const root = this.getRootProbNode();
    if(!root)
      return 'Error: No root';
    const alreadyPrinted = new Set<ProbNode>();
    return root.selfAndChildrenToStr('', alreadyPrinted);
  }
  async generate(postProgress:(pct:number) => void){
    this.createProbGraph();

    this.initRootNodesProbability();

    const probNodes = Array.from(this.subNodeToProbNode.values());
    probNodes.sort((a,b) => {
      return a.subNode.node.rngBeforeAction.advancedCount - b.subNode.node.rngBeforeAction.advancedCount;
    });

    let count = 0;
    for(const pn of probNodes){
      this.expandNode(pn);
      count++;
      if(count % 100 === 0)
        await this.sleep(1);

      if(this.opts.mustCancel && this.opts.mustCancel())
        return null;

      postProgress(count / probNodes.length);
    };

    return this.getResultsWithProb();
  }
  createProbGraph(){
    const addToMapRecursive = (subNode:SubNode) => {
      let probNode2 = this.subNodeToProbNode.get(subNode);
      if(probNode2)
        return probNode2;

      const probNode = new ProbNode(subNode);

      this.probNodesBySectionBeforeAction[subNode.node.sectionBeforeAction].push(probNode);
      this.subNodeToProbNode.set(subNode, probNode);

      subNode.parentArcs.forEach(pa => {
        if(!pa.parentSubNode)
          return;

        const pnParent = addToMapRecursive(pa.parentSubNode);

        const arc = new ProbArc(this.nextArcUid++, pa, pnParent, probNode);
        pnParent.childArcs.push(arc);
        probNode.parentArcs.push(arc);
      });
      return probNode;
    };

    //create the ProbGraph from the leaf (result) to root node
    const res = this.graph.getResultNodes();
    res.forEach(n => {
      n.subNodes.forEach(sn => addToMapRecursive(sn));
    });
  }
  initRootNodesProbability(){
    const probNode = this.getRootProbNode();
    if(!probNode)
      return;

    probNode.addProb(0, ROOT_PROB);
  }

  /** must be called from generate() */
  private getResultsWithProb(){
    const probNodes = this.probNodesBySectionBeforeAction[AlgoSection.END];

    const map = new Map<string, {result:Result, firstPathVblanks:string, allPossibleVblanks:string[], probWeight:number}>();
    probNodes.forEach(probNode => {
      const str = probNode.subNode.node.resultBeforeNodeAction.hashResult();
      const info = map.get(str);
      const vblanks = this.opts.calculateVblanksStr ? this.getVblankStr(probNode) : {mostProbable:'',allPaths:[]};
      if(info){
        info.probWeight += probNode.totalProb;
        info.allPossibleVblanks = info.allPossibleVblanks.concat(vblanks.allPaths);
       } else {
        map.set(str, {
          result: probNode.subNode.node.resultBeforeNodeAction,
          firstPathVblanks:vblanks.mostProbable,
          probWeight:probNode.totalProb,
          allPossibleVblanks:vblanks.allPaths,
        });
       }
    });
    const arr = Array.from(map.values());
    arr.sort((a,b) => {
      return b.probWeight - a.probWeight;
    });
    arr.forEach(a => {
      a.allPossibleVblanks = Array.from(new Set(a.allPossibleVblanks)).sort();
    });
    return arr;
  }
  sleep(dur:number){
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, dur);
    });
  }
  /** call a function for each subRange of range, by dividing the range in equal count */
  forEachEqualCountSubRange(range:Range, subRangeCount:number, f:(subRange:Range, probFactor:number) => void){
    const rc = range.count();
    //uniform distribution
    if (rc < subRangeCount){
      const repeatCount = Math.round(subRangeCount / rc); //ex: if want 50 iterations, and range count is 2, we repeat x25 times
      for (let j = 0; j < repeatCount; j++){
        for(let i = range.min; i <= range.max; i++)
          f(new Range(i, i), 1 / repeatCount);
      }
    } else {
      for(let i = 0 ; i < subRangeCount; i++){
        const percStart = i / subRangeCount;
        const percEnd = (i + 1) / subRangeCount;
        const rmin = Math.floor(range.min + percStart * rc);
        const rmax = Math.floor(range.min + percEnd * rc) - 1;
        f(new Range(rmin, rmax), 1);
      }
    }

  }
  logError(...what:any[]){
    console['log'](...what);
  }
  createSubRanges(pn:ProbNode){
    if(pn.subRangesFromProb.length)
      return; //already created manually

    const idealProbPerSubRange = pn.totalProb / SUBRANGE_COUNT;
    if(idealProbPerSubRange === 0)
      return;

    const vals = Array.from(pn.probByCycleMap.entries());
    vals.sort((a,b) => a[0] - b[0]);


    //TODO: not ideal if cycleRange is {0,1000} and probability is [[0,1], [1000,1]] to create
    // the subranges {0,0}, then {1,1000}. ideally, the probability wouldnt be constant on the range {1,1000}.
    const alwaysCreateSubRange = vals.length < SUBRANGE_COUNT;

    let currentProbSum = 0;
    let currentRangeMin:number | null = null;
    vals.forEach((val,i) => {
      const [cycle,probAtCycle] = val;
      if (currentRangeMin === null)
        currentRangeMin = cycle;

      currentProbSum += probAtCycle;

      const isLastCycle = i >= vals.length - 1;

      if (alwaysCreateSubRange || currentProbSum >= idealProbPerSubRange || isLastCycle){
        const isFirstOfPai = i === 0;
        const minCycle = isFirstOfPai ? pn.subNode.cycleRange.min : currentRangeMin;
        const maxCycle = isLastCycle ? pn.subNode.cycleRange.max : cycle;
        pn.subRangesFromProb.push(new SubRange(new Range(minCycle, maxCycle), currentProbSum));
        currentProbSum = 0;
        if(!isLastCycle)
          currentRangeMin = cycle + 1;
        else
          currentRangeMin = null; //use next value
      }
    });
    pn.validateSubRangeProbIntegrity();

    pn.probByCycleMap = null!; //free memory
  }

  pathVblanksToStr(path:Arc[]){
    const vblanks = this.getVblankP1_P2(path);
    const p2 = vblanks.vblanksP2.map(a => a[0] + '=' + a[1]).join(', ');
    const p1 = vblanks.vblanksP1.map(a => a[0] + '=' + a[1]).join(', ');
    let str = p2;
    if (p1)
      str += ' ||| ' + p1;
    //str += ' ||| CC=' + vblanks.ccRangeAtMon1Id;
    return str;
  }
  getVblankStr(pn:ProbNode){
    const probablePath = pn.getMostProbablePath();
    if(!probablePath)
      return {mostProbable:'Error', allPaths:[]};

    const allPaths = pn.getAllPaths();
    const mostProbable = this.pathVblanksToStr(probablePath.map(pa => pa.arc));
    const allPathsStr = allPaths.slice(0,100).map(p => this.pathVblanksToStr(p.map(pa => pa.arc)));
    return {mostProbable, allPaths:allPathsStr};
  }
  abstract getVblankP1_P2(path:Arc[]) : {
    vblanksP1: (string | number)[][];
    vblanksP2: string[][];
    vblanksAll: Arc[];
    vblankInputTrainer: null;
    vblankInputStart: null;
    ccRangeAtMon1Id: string;
  };
}
