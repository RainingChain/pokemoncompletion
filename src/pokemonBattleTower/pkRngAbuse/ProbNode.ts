import {Node, AlgoSection,Arc,SubNode,AlgoSection_SHORT_NAMES,formatNum,Range} from "./Structs";

export class SubRange {
  constructor(public range:Range, public prob:number){}
}

export  class ProbArc {
  constructor(public uid:number,
              public arc:Arc,
              public parentProbNode:ProbNode,
              public childProbNode:ProbNode){}
  prob = 0;
}

export  class ProbNode {
  constructor(node_w:SubNode){
    this.uid = node_w.uid;
    this.subNode = node_w;
  }
  uid = 0;
  subNode:SubNode;
  childArcs:ProbArc[] = [];
  parentArcs:ProbArc[] = [];

  totalProb = 0;
  probByCycleMap = new Map<number,number>();
  /** subRanges are created from probByFrame when extending the node */
  subRangesFromProb:SubRange[] = [];


  addProb(cycle:number, prob:number){
    //it's a leaf node, probByCycleMap isn't important
    if(this.subNode.node.sectionBeforeAction !== AlgoSection.END){
      const curProb = this.probByCycleMap.get(cycle) || 0;
      this.probByCycleMap.set(cycle, curProb + prob);

      if (!this.subNode.cycleRange.isInRange(cycle))
        console['log']('error: cycle is not in subNode.cycleRange',cycle,this.subNode.cycleRange.toStr(), 'pn#' + this.uid, 'sn#' + this.subNode.uid);
    }
    this.totalProb += prob;
  }
  validateSubRangeProbIntegrity(){
    const sumSubRangeProb = this.subRangesFromProb.reduce((prev,cur) => prev + cur.prob, 0);
    const diff = Math.abs(this.totalProb - sumSubRangeProb);
    if (diff > 0.01)
      console['log']('diff > 0.01. uid=' + this.subNode.uid, 'diff=' + diff);
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

  /** arcs order: from trainer to Mon3NAT */
  getAllPaths(){
    const MAX_PATHS = 10000;

    const res:ProbArc[][] = [];
    const addNextPath = function(pas:ProbArc[], paToAdd:ProbArc){
      if(res.length > MAX_PATHS)
        return;

      pas = pas.slice(0); // copy
      pas.push(paToAdd);
      if (!paToAdd.parentProbNode.parentArcs.length)
        res.push(pas.reverse()); //end
      else {
        for(let pa of paToAdd.parentProbNode.parentArcs)
          addNextPath(pas, pa);
      }
    };
    for(let pa of this.parentArcs)
      addNextPath([], pa);
    return res;

  }
  /** from trainer to Mon3NAT */
  getMostProbablePath() : ProbArc[] {
    const res:ProbArc[] = [];
    const getMostProbableParentArc = function(pn:ProbNode){
      if(pn.parentArcs.length === 0)
        return null;
      if (pn.parentArcs.length === 1)
        return pn.parentArcs[0];
      return pn.parentArcs[ProbNode.findMaxIndex(pn.parentArcs, pa => pa.prob)];
    };

    let pn:ProbNode = this;
    while(true){
      const pa = getMostProbableParentArc(pn);
      if(!pa) //end
        return res.reverse();
      res.push(pa);
      pn = pa.parentProbNode;
    }
  }

  static getArcsBySection(pas:Arc[]){
    const arr:Arc[][] = Array.from(new Array(AlgoSection.END + 1)).map(() => ([]));
    pas.forEach(pa => {
      arr[pa.childNode.sectionBeforeAction].push(pa);
    });
    return arr;
  }
  selfAndChildrenToStr(indent:string, alreadyPrinted:Set<ProbNode>){
    const parentsProb = this.parentArcs.reduce((prev,cur) => prev + cur.parentProbNode.totalProb, 0);
    const probPct = parentsProb === 0 ? '100%' : (this.totalProb / parentsProb * 100).toFixed(0) + '%';

    const s = `${indent}${probPct} pn#${this.uid} sn#${this.subNode.uid} N#${this.subNode.node.uid}`;
    if(alreadyPrinted.has(this))
      return `${s}: already printed\n`;

    alreadyPrinted.add(this);

    const ranges = this.subNode.cycleRange.toStr();
    const toAdd = this.subNode.node.minMaxCyclesToAddCausedByAction?.toStr() ?? '';
    let prob1M = Math.floor(this.totalProb * 1000000);
    const probStr = prob1M < 0 ? (this.totalProb * 1000000).toFixed(2) : formatNum(prob1M);

    let str = `${s} ${AlgoSection_SHORT_NAMES[this.subNode.node.sectionBeforeAction]} Prob=${probStr} RNG=${this.subNode.node.rngBeforeAction.advancedCount} CCBefore=${ranges}, CCToAdd=${toAdd}`;

    if (this.childArcs.length === 0){
      str += '\n';
      if(this.subNode.node.sectionBeforeAction === AlgoSection.END){
        str += indent + ' => SUCCESS: Prob=' + probStr + ' ' + this.subNode.node.resultBeforeNodeAction.getShortDesc() + '\n';
      } else
        str += indent + ' => NO CHILD\n';
      return str;

    }
    str += '\n';

    const childArcs = this.childArcs.slice(0).sort((a,b) => {
      if(!a.childProbNode)
        return -1;
      if(!b.childProbNode)
        return 1;
      const diff = a.childProbNode.subNode.node.rngBeforeAction.advancedCount - b.childProbNode.subNode.node.rngBeforeAction.advancedCount;
      if(diff !== 0)
        return diff;
      return a.childProbNode.subNode.cycleRange.max - b.childProbNode.subNode.cycleRange.max;
    });
    childArcs.forEach(pa => {
      if(pa.childProbNode)
        str += pa.childProbNode.selfAndChildrenToStr(indent + ' ', alreadyPrinted);
    });
    return str;
  }
}