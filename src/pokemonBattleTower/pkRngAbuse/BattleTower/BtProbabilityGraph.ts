import {Graph,Arc,AlgoSection,Options, AlgoSection_SHORT_NAMES} from "../Structs";
import {ProbNode} from "../ProbNode";
import {ProbabilityGraph, ROOT_PROB, SUBRANGE_COUNT} from "../ProbabilityGraph";

// output:
// for each unique result => probability

/*
BUG: parentArcIntervals is incorrect for mon1ID


how it works:
  create new graph with only nodes/arcs that lead to valid results

  for each parent node, calculate where it ends up exactly
    when expanding a child node, aggregate its data to form 100 group of equal prob

  on root node, assign a chance on each sub cycleRange
    for each X value in a range, randomly select ending cycle on child. add the chance value on that child node
*/

const ATTEMPT_BY_SUBRANGE_COUNT = 50;
const MIN_PROB_WORTH_EXPANDING = ROOT_PROB * 0.0001 / 100; //aka 0.0001%

export class BtProbabilityGraph extends ProbabilityGraph {
  constructor(graph:Graph,
              opts:Options){
    super(graph, opts);
  }
  opts:Options;

  expandNode(pn:ProbNode){
    if(pn.totalProb < MIN_PROB_WORTH_EXPANDING) //if too small, abort for performance
      return;

    if(pn.subNode.node.sectionBeforeAction === AlgoSection.END)
      return; //leaf node

    if(!pn.childArcs.length){
      this.logError('all pn should have childArcs, except END nodes', 'pn#' + pn.uid, 'sn#' + pn.subNode.uid);
      return;
    }

    this.createSubRanges(pn);

    if (pn.subNode.node.sectionBeforeAction === AlgoSection.START)
      return this.expandNode_start(pn);

    if (pn.subNode.node.sectionBeforeAction === AlgoSection.TRAINER)
      return this.expandNode_trainer(pn);

    //else middle-node
    pn.subRangesFromProb.forEach(sr => {
      this.forEachEqualCountSubRange(sr.range, ATTEMPT_BY_SUBRANGE_COUNT, (subRange, probFactor) => {
        const probToAdd = sr.prob * subRange.count() / sr.range.count() * probFactor;

        if (pn.subNode.node.sectionBeforeAction === AlgoSection.TRAINER){
          pn.childArcs.forEach(pa => {
            const pn = pa.childProbNode;
            const r = pn.subNode.cycleRange;
            const cycle = Math.round(r.min + this.stdRng.random() * (r.max - r.min));
            pn.addProb(cycle, probToAdd);
          });
          return;
        }

        //determine the probNode where to add probToAdd
        const currentCycle = Math.floor((subRange.min + subRange.max) / 2);
        const minMaxCc = pn.subNode.node.minMaxCyclesToAddCausedByAction;
        if (!minMaxCc){
          this.logError('!minMaxpn.probByCycleCc');
          return;
        }

        const cycleToAdd = Math.round(minMaxCc.min + this.stdRng.random() * (minMaxCc.max - minMaxCc.min));

        const rngAtVblankStart = pn.subNode.node.rngBeforeAction.advancedCount + pn.subNode.node.sectionRngCount;
        const cvb = this.opts.vblankCalc.addCyclesAndHandleVblanks_random(currentCycle, cycleToAdd, rngAtVblankStart, () => this.stdRng.random());
        const endRng = rngAtVblankStart + cvb.appliedVblankCount;

        const pa = pn.childArcs.find(pa => {
          return pa.childProbNode.subNode.node.rngBeforeAction.advancedCount === endRng;
        });
        if(!pa){
          //if pa doesnt exist, a possible cause is that the branch leads to an invalid result

          const arc = pn.subNode.childArcs.find(a => {
            return a.childSubNode?.node.rngBeforeAction.advancedCount === endRng;
          });
          if(arc)
            return; //aka arc was found in the graph, but not in the ProbGraph only containing node leading to valid result
          return this.logError('!cn', pn, subRange, cvb, endRng, cycleToAdd);
        }

        pa.childProbNode.addProb(cvb.cycles, probToAdd);
      });
    });
  }

  expandNode_start(pn:ProbNode){
    if(pn.subRangesFromProb.length !== 1)
      return this.logError('start pn.subRangesFromProb.length !== 1');

    //note: it doesnt matter if we dont lose flow for childNodes leading to invalid results. the probability at the end
    // will be the same
    const probByProbArc = pn.childArcs.map(pa => {
      if(pa.arc.isRetryArc())
        return 1;
      let vblankInput = pa.arc.vblankFromParentToChild;
      if(this.opts.rngCalib.includesFramesInElevator && pa.arc.vblankFromParentToChild2 !== null)
         vblankInput += pa.arc.vblankFromParentToChild2;

      const prob = this.opts.rngCalib.beforeTrainer.getProbForVal(vblankInput);
      if (prob === null){
        this.logError('invalid vblankFromParentToChild', this.opts.rngCalib.beforeTrainer, vblankInput);
        return 1; //error
      }
      return prob;
    });
    const probByArcSum = probByProbArc.reduce((a,b) => a+b,0);

    pn.childArcs.forEach((pa,i) => {
      pa.childProbNode.addProb(0, pn.totalProb * probByProbArc[i] / probByArcSum);
    });
  }

  expandNode_trainer(pn:ProbNode){
    //calculate probability distribution from trainerToMon1VblankRange
    // ex: 10% goes to 90 vblanks, 50% goes to 91 vblanks and 40% to 92.
    const probByArc = pn.subNode.childArcs.map(a => {
      if(a.isRetryArc())
        return 1;

      let vblankInput = a.vblankFromParentToChild;
      if(this.opts.rngCalib.includesFramesStartSpeech && a.vblankFromParentToChild2 !== null)
         vblankInput += a.vblankFromParentToChild2;

      const prob = this.opts.rngCalib.beforeMon1.getProbForVal(vblankInput);
      if (prob === null){
        this.logError('invalid vblankFromParentToChild', this.opts.rngCalib.beforeMon1, vblankInput);
        return 1; //error
      }
      return prob;
    });
    const probSumByArc = probByArc.reduce((a,b) => a+b,0);

    pn.childArcs.forEach(pa => {
      const paIdx = pn.subNode.childArcs.indexOf(pa.arc);
      if(paIdx === -1)
        return this.logError('pn.subNode.childArcs.indexOf(pa.arc)');

      const probSumToApplyOnChildNode = pn.totalProb * probByArc[paIdx] / probSumByArc; //ex: 40% to 92

      if (pa.arc.isRetryArc()){
        pa.childProbNode.addProb(0, probSumToApplyOnChildNode);
        return;
      }

      //we then need to split that 40% to different mon1IdCycle
      //ex: 5% goes to cycle=1234, 25% goes to 1235 and 10% to 1236

      //step 1: calculate probSumForAllSubRange and probSumForAllSubRange
      const probBySubRange:number[][] = [];
      this.forEachEqualCountSubRange(this.opts.rngCalib.cycleMon1Id, SUBRANGE_COUNT, sr => {
        const cycle = Math.floor(sr.min + this.stdRng.random() * sr.count());

        const prob = this.opts.rngCalib.cycleMon1Id.getProbForVal(cycle);
        if (prob === null){
          this.logError('invalid mon1IdCycleRange', this.opts.rngCalib.cycleMon1Id, cycle);
          probBySubRange.push([cycle,1]);
        } else
          probBySubRange.push([cycle,prob]);
      });
      const probSumForAllSubRange = probBySubRange.reduce((a,b) => a + b[1],0);

      // step2: add prob
      let srIdx = 0;
      this.forEachEqualCountSubRange(this.opts.rngCalib.cycleMon1Id, SUBRANGE_COUNT, sr => {
        const [cycle, distr] = probBySubRange[srIdx];
        srIdx++;
        pa.childProbNode.addProb(cycle, probSumToApplyOnChildNode * distr / probSumForAllSubRange);
      });
    });
  }
  getVblankP1_P2(path:Arc[]){
    //goal: primary is increment between each section. its universally accepted, no matter the algo
    //in parenthese, display sub-increment S=2025 (1600+Elevator), T=130 (90+StartMsg)

    const arcsBySection = ProbNode.getArcsBySection(path);
    const arcsWithVblanks = path.filter(p => p.vblankFromParentToChild);

    let vblankInputStart:number | null = null;
    let vblankInputTrainer:number | null = null;
    let ccRangeAtMon1Id = ''
    const vblanksP1 = arcsWithVblanks.filter(p => p.isRetryArc()).map(a => {
      const sec = a.childNode.sectionBeforeAction;
      const idx = arcsBySection[sec].indexOf(a);
      const rngUpdatePerRetry = a.childNode.sectionRngCount;
      return [AlgoSection_SHORT_NAMES[sec], idx * rngUpdatePerRetry];
    });

    const vblanksP2 = arcsWithVblanks.filter(p => p.isSuccessArc()).map(pa => {
      if(!pa.parentSubNode.parentArcs.length){
        //aka from NULL to START, which includes the elevator
        const res = `${pa.childNode.rngBeforeAction.advancedCount} (${pa.vblankFromParentToChild}+E${pa.vblankFromParentToChild2})`;
        vblankInputStart = pa.vblankFromParentToChild;
        return [AlgoSection_SHORT_NAMES[AlgoSection.START], res];
      }
      if(pa.parentSubNode.node.sectionBeforeAction === AlgoSection.TRAINER){
        //aka from START to TRAINER, which includes the startMsg
        const res = `${pa.vblankFromParentToChild + pa.vblankFromParentToChild2!} (${pa.vblankFromParentToChild}+M${pa.vblankFromParentToChild2})`;
        vblankInputTrainer = pa.vblankFromParentToChild;
        ccRangeAtMon1Id = pa.cycleRangeOnChild.toStr();
        return [AlgoSection_SHORT_NAMES[AlgoSection.TRAINER], res];
      }

      const res = '' + pa.vblankFromParentToChild;
      return [AlgoSection_SHORT_NAMES[pa.parentSubNode.node.sectionBeforeAction], res];
    });

    return {vblanksP1, vblanksP2, vblanksAll: arcsWithVblanks, vblankInputTrainer, vblankInputStart, ccRangeAtMon1Id};
  }
}

