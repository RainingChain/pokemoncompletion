import {CycleWithVblanks,CYCLE_PER_VBLANK,RangeCycleWithVblanks,Range} from "./Structs";

// data collected from CycleCountPerSection.lua (vblank2 section)
const VBLANK_DATASET = [
  [56424,55376,56505,56498,55626,52878,52029,57678,53559,54914,53665,53525,52522,53733,61176,53107,45177,44267,45356,44955,44939,],
  [55626,52878,52101,57676,53559,55055,53524,53525,52522,53520,61178,53107,45177,44267,45356,44955,44939,45168,43987,43028,40355,40089],
  [40634,40501,39580,40489,40488,62323,56404,55491,56495,56194,55622,53019,51888,57678,53559,55055,53528,53521,52522,53520,61417,53105,45292,44279,],
  [55010,56001,56011,63451,56651,47454,48645,48587,54272,53224,52088,54465,53075,54609,53101,53082,52067,53091,62183,54091,45747,44830,45999,45507,],
  [53781,52393,53819,52534,52397,51461,52525,61916,53741,45407,44480,45581,45165,45164,45310,44198,43253,40432,40455,40305,40537],
  [56772,55482,54622,55504,55515,61009,55280,46511,47676,47592,55087,53989,53850,52852,53863,64103,53586,53552,52664,53675,53380,53398,53522,53385,50476,48856,48533,48530,48684,47559,58889],
  [53519,52522,53661,61178,53107,45177,44271,45352,44955,44939,45096,43989,43028,40218,40298,40103,40230,39165,50142,45130,45122,45217,44279,44939,44955,45093],
  [48410,64300,55430,56873,56854,56849,57870,56577,55133,56786,56577,64247,56069,54969,55948,55943,58280,56405,55568,56410,56407,63485,55716,55699,55087,55518,57238,56128,],
  [36372,36245,46602,42503,38451,38317,38150,38012,37939,35338,37967,37951,37897,37985,38101,35284,37930,58973,52893,53044,51282,52867,52870,45393,55380,48350,50079,],
  [53469,53054,53061,51451,56445,52987,47396,45851,45588,44441,45414,58984,53007,53403,51366,53377,54757,53583,55843,52346,52472,41435,41356,41245,41493,39285,62518,55545,55518,55651,],
  [53469,53054,53061,51451,56445,52987,47396,45851,45588,44441,45414,58984,53007,53403,51366,53377,54757,53583,55843,],
  [43279,45736,44609,44973,44870,55571,51036,52657,53127,53075,54442,51265,53312,55189,53836,45427,45978,43207,45526,45356,59713,53258,51618,53882,53469,],
  [51282,52867,52870,45393,55380,48350,50079,49913,49907,49983,41928,40162,55363,46667,43714,43582,42637,43582,36106,46140,44238,43279,45736,44609,44973,],
];


export const CYCLES_BY_VBLANK_COUNT = Array.from(new Array(17)).map((undef,vbCount) => {
  let summedVals:number[] = [];
  VBLANK_DATASET.forEach(ds => {
    for(let i = 0; i < ds.length - vbCount; i++){
      let summedVal = 0;
      for(let j = 0 ; j < vbCount; j++)
        summedVal += ds[j + i];
      summedVals.push(summedVal);
    }
  });
  if(summedVals.length === 0 || vbCount === 0)
    return {min:0,max:0,sortedValues:[],avg:0,med:0};

  const min = summedVals.reduce((prev, cur) => Math.min(prev, cur), Infinity);
  const max = summedVals.reduce((prev, cur) => Math.max(prev, cur), 0);
  const sortedValues = summedVals.sort((a,b) => a - b);
  const med = Math.round(sortedValues[Math.floor(sortedValues.length / 2)] / vbCount);
  const avg = Math.round(summedVals.reduce((prev, cur) => prev + cur, 0) / summedVals.length / vbCount);
  return {min,max,avg,med,sortedValues};
});

export class VblankRangeCalc {
  constructor(public debug_fixedCount:number | null = null,
              public fixedVblankCycleByRngCount:{rngAdvCount:number, vblank:number}[] | null = null){}

  getMinMaxCycle(vbCount:number,isMax:boolean,currentRngAdvCount:number){
    if (this.debug_fixedCount !== null)
      return this.debug_fixedCount * vbCount;

    const c = this.getCycleCountAtRngAdvCount(vbCount, currentRngAdvCount);
    if(c !== null)
      return c;

    return isMax ? this.getMaxCycle(vbCount) : this.getMinCycle(vbCount);
  }
  logError(...msg:any[]){
    console['log'](...msg);
  }

  getCycleCountAtRngAdvCount(vbCount:number, currentRngAdvCount:number){
    if(!this.fixedVblankCycleByRngCount)
      return null;

    const idx = this.fixedVblankCycleByRngCount.findIndex(c => c.rngAdvCount === currentRngAdvCount);
    if (idx === -1){
      this.logError('this.fixedVblankCycleByRngCount doesnt contain currentRngAdvCount=' + currentRngAdvCount);
      return null;
    }

    if (idx + vbCount >= this.fixedVblankCycleByRngCount.length){
      this.logError('Error: this.fixedVblankCycleByRngCount.length too small for vbCount',idx + vbCount, this.fixedVblankCycleByRngCount.length );
      return null;
    }

    let sum = 0;
    for(let i = 0; i < vbCount; i++){
      const info = this.fixedVblankCycleByRngCount[idx + i];
      if (info.rngAdvCount !== currentRngAdvCount + i){
        const ingameAdv = this.fixedVblankCycleByRngCount.slice(idx, idx + vbCount).map(a => a.rngAdvCount).join(',');
        this.logError(`NodeGen asks for consecutive vblanks, but ingame, the vblanks were separated by batle tower logic. currentRngAdvCount=${currentRngAdvCount}, vbCount=${vbCount}, ingameAdv=${ingameAdv}`);
        return null;
      }
      sum += info.vblank;
    }
    return sum;
  }

  getMinCycle(vbCount:number){
    const info = CYCLES_BY_VBLANK_COUNT[vbCount];
    if(!info)
      throw new Error('vbCount not supported ' + vbCount);
    return info.min;
  }

  private getMaxCycle(vbCount:number){
    const info = CYCLES_BY_VBLANK_COUNT[vbCount];
    if(!info)
      throw new Error('vbCount not supported ' + vbCount);
    return info.max;
  }
  /**
   * @param reapplyAllOnRetry In random mode, x5 vblanks can return less than x4 vblanks, which cause issues. so reapplyAllOnRetry = false is needed.
   */
  addCyclesAndHandleVblanks_minMax(cyclesWithOverflow:number, getCycle:(vblankCount:number) => number, reapplyAllOnRetry:boolean){
    const cvb = new CycleWithVblanks();
    cvb.appliedVblankCount = Math.floor(cyclesWithOverflow / CYCLE_PER_VBLANK);
    if(cvb.appliedVblankCount === 0){
      cvb.cycles = cyclesWithOverflow; //no overflow
      return cvb;
    }

    const vblankCycles = getCycle(cvb.appliedVblankCount);
    cvb.cycles = cyclesWithOverflow % CYCLE_PER_VBLANK + vblankCycles;

    if(cvb.cycles >= CYCLE_PER_VBLANK){ //there were so many vblanks, that an additional vblank is needed
      const additionalVblanks = Math.floor(cvb.cycles / CYCLE_PER_VBLANK);
      cvb.appliedVblankCount += additionalVblanks;
      cvb.cycles -= additionalVblanks * CYCLE_PER_VBLANK; //convert vblanks to lessen cycles

      cvb.cycles += getCycle(additionalVblanks);

      if(cvb.cycles >= CYCLE_PER_VBLANK){
        const additionalVblanks2 = Math.floor(cvb.cycles / CYCLE_PER_VBLANK);
        cvb.appliedVblankCount += additionalVblanks2;
        cvb.cycles -= additionalVblanks2 * CYCLE_PER_VBLANK; //convert vblanks to lessen cycles

        cvb.cycles += getCycle(additionalVblanks2);

        if(cvb.cycles >= CYCLE_PER_VBLANK)
          throw new Error(`not supported that the additional vblanks triggered another additional twice. cyclesWithOverflow=${cyclesWithOverflow}, appliedVblankCount=${cvb.appliedVblankCount}, vblankCycles=${vblankCycles}, additionalVblanks2=${additionalVblanks2}, additionalVblanks=${additionalVblanks}`);
      }
    }
    return cvb;
  }
  addCyclesAndHandleVblanks_range(range:Range, minMaxCyclesToAdd:Range, currentRngAdvCount:number){
    const min = this.addCyclesAndHandleVblanks_minMax(range.min + minMaxCyclesToAdd.min, vbCount => {
      return this.getMinMaxCycle(vbCount, false, currentRngAdvCount);
    },true);
    const max = this.addCyclesAndHandleVblanks_minMax(range.max + minMaxCyclesToAdd.max, vbCount => {
      return this.getMinMaxCycle(vbCount, true, currentRngAdvCount);
    },true);
    return new RangeCycleWithVblanks(min, max);
  }

  getRandomCycle(vbCount:number, currentRngAdvCount:number, rand0to1:number){
    if (this.debug_fixedCount !== null)
      return this.debug_fixedCount * vbCount;

    const c = this.getCycleCountAtRngAdvCount(vbCount, currentRngAdvCount);
    if(c !== null)
      return c;

    const info = CYCLES_BY_VBLANK_COUNT[vbCount];
    if(!info)
      throw new Error('vbCount not supported ' + vbCount);
    return info.sortedValues[Math.floor(info.sortedValues.length * rand0to1)];
  }
  addCyclesAndHandleVblanks_random(currentCycle:number, cycleToAdd:number, currentRngAdvCount:number, rand:() => number){
    //const randoms:number[] = [];
    //let nextRandomId = 0;
    const cvb = this.addCyclesAndHandleVblanks_minMax(currentCycle + cycleToAdd, vbCount => {
      const r = rand();
      //randoms.push(r);
      return this.getRandomCycle(vbCount, currentRngAdvCount, r);
    },true);

    //if (cvb.cycles < 0) //comment for perf
    //  throw new Error('cvb.cycles < 0');

    return cvb;
    /*return this.addCyclesAndHandleVblanks_minMax(currentCycle + cycleToAdd, vbCount => {
      return this.getRandomCycle(vbCount, currentRngAdvCount, randoms[nextRandomId++]);
    },false);*/
  }
}
