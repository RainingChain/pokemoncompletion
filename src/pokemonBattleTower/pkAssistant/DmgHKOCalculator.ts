
import * as Smogon from '@smogon/calc';
import { PkRngGen } from "./PkRngGen";

import { DexMoves } from "./DexMoves";

const MAX_HKO = 9;

export class DmgHKOResult {
  constructor(public defMaxHp:number,
              public lowDmgNoCrit:number,
              public highDmgNoCrit:number,
              public highDmgCrit:number,
              public chanceByHKO:{hko:number,chance:number}[],
              public avgDmg:number,){
    if(!this.highDmgCrit)
      this.chanceByHKO = [];
  }

  getLowDmgNoCritPctStr(){
    return Math.floor(this.lowDmgNoCrit / this.defMaxHp * 100) + '%';
  }
  getHighDmgNoCritPctStr(){
    return this.getHighDmgNoCritPct() + '%';
  }
  getHighDmgNoCritPct(){
    return Math.ceil(this.highDmgNoCrit / this.defMaxHp * 100);
  }
  getHkoOrLessChance(hko:number){
    return this.chanceByHKO.filter(c => c.hko <= hko).reduce((p,c) => p + c.chance, 0);
  }
  dealDmg(){
    return this.highDmgCrit !== 0;
  }
  chanceByHKOToStr(v:{hko:number,chance:number},color:string){
    const toFixedCnt = v.chance < 0.1 ? 1 : 0;
    const text = `${v.hko}${v.hko >= MAX_HKO ? '+' : ''}HKO: ${(v.chance * 100).toFixed(toFixedCnt)}%`;
    if(!color)
      return text;
    return `<span style="color:${color}">${text}</span>`;
  }
}

export class DmgHKOCalculator {
  constructor(public gen:any,
              public attacker:Smogon.Pokemon,
              public defender:Smogon.Pokemon,
              public field:Smogon.Field,
              public moveName:string,
              rng?:PkRngGen){
    this.rng = rng ?? new PkRngGen(attacker.species.name + defender.species.name);
  }
  rng:PkRngGen;

  hkoSimulCount = 10000;
  hkoMaxCount = 9;
  avgDmgSimulCount = 0;
  getDmgInfo(res:Smogon.Result,highestDmg:boolean,defender:Smogon.Pokemon) {
    const dmg = (function(){
      const d = res.damage;
      if(typeof d === 'number')
        return d;
      if(d.length === 2){
        const d2 = <number[]>d[highestDmg ? 1 : 0];
        return d2[highestDmg ? d2.length - 1 : 0];
      }
      return <number>d[highestDmg ? d.length - 1 : 0];
    })();
    const pct = dmg / defender.maxHP(true) * 100;
    if(highestDmg)
      return {dmg, dmgPct:Math.ceil(pct)};
    return {dmg, dmgPct:Math.floor(pct)};
  }
  extractDmgValues(d:Smogon.Result['damage']) {
    if(typeof d === 'number')
      return [d];

    if(d.length === 2){
      const d2 = <number[][]>d;
      return [...d2[0], ...d2[1]];
    }
    return <number[]>d;
  }
  getHitInfo(m:any){
    let hits:number | undefined = undefined;
    let getHitCount = () => 1;
    if(m && Array.isArray(m.multihit)){
      if (this.attacker.hasAbility('Skill Link')){
        hits = m.multihit[1];
      } else {
        hits = 1;
        if(m.multihit[0] !== 2 || m.multihit[1] !== 5)
          console.error('only multihit [2,5] is supported');
        getHitCount = () => {
          let r = this.rng.random();
          if(r < 0.375)
            return 2;
          r -= 0.375;
          if (r < 0.375)
            return 3;
          r -= 0.375;
          if (r < 0.125)
            return 4;
          return 5;
        };
      }
    }
    return {hits,getHitCount};
  }
  handleHiddenPower(m:Smogon.Move){
    if(m.name !== 'Hidden Power')
      return m;
    const ivs = this.attacker.ivs;
    let bit1 = (n:number) => (n & 0b1) ? 1 : 0;
    const typeIdx = Math.floor((bit1(ivs.hp) + 2 * bit1(ivs.atk) + 4 * bit1(ivs.def) + 8 * bit1(ivs.spe) + 16 * bit1(ivs.spa) + 32 * bit1(ivs.spd)) * 15 / 63);
    const type = `Fighting,Flying,Poison,Ground,Rock,Bug,Ghost,Steel,Fire,Water,Grass,Electric,Psychic,Ice,Dragon,Dark`.split(',')[typeIdx];
    m.type = <any>type;

    let bit2 = (n:number) => (n & 0b10) ? 1 : 0;
    m.bp = Math.floor((bit2(ivs.hp) + 2 * bit2(ivs.atk) + 4 * bit2(ivs.def) + 8 * bit2(ivs.spe) + 16 * bit2(ivs.spa) + 32 * bit2(ivs.spd)) * 40 / 63) + 30;

    const oldClone = m.clone;
    m.clone = () => { // BAD
      const copy = oldClone.apply(m);
      copy.bp = m.bp;
      copy.type = m.type;
      return copy;
    };
    return m;
  }
  calculateDmgValues(hits:number | undefined){
    const m = this.getDexMove();

    const ohkoHasEffect = (() => {
      // limitation: gravity
      if(this.moveName === 'Fissure' && (this.defender.hasAbility('Levitate') || this.defender.hasType('Flying')))
        return false;
      if(['Horn Drill','Guillotine'].includes(this.moveName) && this.defender.hasType('Ghost'))
        return false;
      return true;
    })();
    if(!ohkoHasEffect)
      return {valuesNoCrit:null, valuesCrit:null};

    if (this.moveName === 'Psywave'){
      const d = this.getPsywaveDmg();
      return {valuesNoCrit:d, valuesCrit:d};
    }

    const valuesNoCrit = (() => {
      if(m.ohko)
        return [this.defender.maxHP()];

      const dmgNoCrit = (() => {
        if (this.moveName === 'Magnitude')
          return this.handleMagnitude(false);
        const smoveNoCrit = this.handleHiddenPower(new Smogon.Move(this.gen, this.moveName, {isCrit:false,hits}));
        return Smogon.calculate(<any>this.gen, this.attacker, this.defender, smoveNoCrit, this.field).damage;
      })();
      return this.extractDmgValues(dmgNoCrit);
    })();

    if(!valuesNoCrit.length || !valuesNoCrit[0])
      return {valuesNoCrit:null, valuesCrit:null};

    const valuesCrit = (() => {
      if(m.ohko)
        return [this.defender.maxHP()];

      const dmgCrit = (() => {
        if (this.moveName === 'Magnitude')
          return this.handleMagnitude(true);
        const smoveCrit = this.handleHiddenPower(new Smogon.Move(this.gen, this.moveName, {isCrit:true,hits}));
        return Smogon.calculate(<any>this.gen, this.attacker, this.defender, smoveCrit, this.field).damage;
      })();

      return this.extractDmgValues(dmgCrit);
    })();
    return {valuesNoCrit, valuesCrit};
  }
  getPsywaveDmg(){
    let dmgs:number[] = [];
    for(let i = 0; i <= 10; i++)
      dmgs.push(Math.floor(this.attacker.level * (10 * i + 50) / 100));
    return dmgs;
  }
  handleMagnitude(isCrit:boolean){
    const move = new Smogon.Move(this.gen, 'Earthquake', {isCrit})
    const dmg = <number[] | 0>Smogon.calculate(<any>this.gen, this.attacker, this.defender, move, this.field).damage;
    if (dmg === 0)
      return [0];

    let dmgs:number[] = [];
    let res = [[10,5],[30,10],[50,20],[70,30],[90,20],[110,10],[150,5]];
    res.forEach(([bp, chance]) => {
      for(let i = 0 ; i < chance / 5; i++)
        dmgs.push(...dmg.map(d => Math.floor(d / 100 * bp)));
    });
    return dmgs;
  }

  calculate(){
    try {
      const m = this.getDexMove();
      const {hits,getHitCount} = this.getHitInfo(m);
      const {valuesNoCrit, valuesCrit} = this.calculateDmgValues(hits);
      if (!valuesNoCrit || !valuesCrit)
        return null;

      const chanceByHKO = this.calculateHkoChance(valuesNoCrit, valuesCrit, getHitCount);
      const avgDmg = this.calculateAverageDmg(valuesNoCrit, valuesCrit, getHitCount);
      return new DmgHKOResult(this.defender.maxHP(),
                              valuesNoCrit[0], valuesNoCrit[valuesNoCrit.length - 1], valuesCrit[valuesCrit.length - 1],
                              chanceByHKO, avgDmg);
    } catch(err){
      console.error(err, this);
      return null;
    }
  }
  calculateCounter(counterMoveName:string){
    const counterIsPhysical = counterMoveName === 'Counter';
    try {
      const m = this.getDexMove();
      const mIsPhysical = !['Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Psychic', 'Dragon', 'Dark'].includes(m.type); //GEN3
      if (counterIsPhysical !== mIsPhysical)
        return null;

      let {valuesNoCrit, valuesCrit} = this.calculateDmgValues(1);
      if (!valuesNoCrit || !valuesCrit)
        return null;
      if(valuesNoCrit[0] >= this.defender.curHP())
        return null;

      valuesNoCrit = valuesNoCrit.map(n => n * 2);
      valuesCrit = valuesCrit.map(n => n * 2);

      const calc2 = new DmgHKOCalculator(this.gen, this.defender, this.attacker, this.field, counterMoveName, this.rng);

      const chanceByHKO = calc2.calculateHkoChance(valuesNoCrit, valuesCrit, () => 1);
      const avgDmg = calc2.calculateAverageDmg(valuesNoCrit, valuesCrit, () => 1);

      return new DmgHKOResult(calc2.defender.maxHP(),
                              valuesNoCrit[0], valuesNoCrit[valuesNoCrit.length - 1], valuesCrit[valuesCrit.length - 1],
                              chanceByHKO, avgDmg);
    } catch(err){
      console.error(err, this);
      return null;
    }
  }
  getCritStage(){
    let val = this.attacker.hasItem('Razor Claw') || this.attacker.hasItem('Scope Lens') ? 1 : 0;
    if (this.attacker.ability === 'Super Luck')
      val += 1;
    if (this.attacker.species.name === 'Chansey' && this.attacker.hasItem('Lucky Punch'))
      val += 2;
    if (["10,000,000 Volt Thunderbolt","Aeroblast","Air Cutter","Aqua Cutter","Attack Order","Blaze Kick","Crabhammer","Cross Chop","Cross Poison","Dire Claw","Drill Run","Esper Wing","Ivy Cudgel","Karate Chop","Leaf Blade","Night Slash","Poison Tail","Psycho Cut","Razor Leaf","Razor Wind","Shadow Blast","Shadow Claw","Sky Attack","Slash","Snipe Shot","Spacial Rend","Stone Edge","Triple Arrows"].includes(this.moveName))
      val += 2;
    //TODO: Lansat Berry etc, Focus Energy, Dire Hit
    return val;
  }
  getCritChance(){
    const stage = Math.min(4, this.getCritStage());
    return [1/16, 1/8, 1/4, 1/3, 1/2][stage]; //GEN3
  }
  getEffectiveAccuracyStage(){
    const acc = (<any>this.attacker.boosts)['acc'] || 0;
    const eva = (<any>this.defender.boosts)['eva'] || 0;
    const diff = acc - eva;
    if(diff < -6)
      return -6;
    if (diff > 6)
      return 6;
    return diff;
  }
  getDexMove(){
    const mid = this.moveName.toLowerCase().replace(/\W/g,'');
    const m = DexMoves[mid];
    if(!m)
      console.error('Invalid move:' + mid + ' ||| ' + this.moveName);
    return m;
  }
  /** number between 0-1, where 1 = 100% accuracy */
  getAccuracy(){
    const m = this.getDexMove();
    let acc = 100;

    if(m){
      if(m.accuracy == true) //ex: Swift
        return 1;
      if (typeof m.accuracy === 'number')
        acc = m.accuracy;
    }

    const accStage = this.getEffectiveAccuracyStage();
    let mult = [33/100,36/100,43/100,50/100,60/100,75/100,100/100,133/100,166/100,200/100,250/100,266/100,300/100][accStage + 6];
    if(typeof mult !== 'number'){
      mult = 1;
      console.error('Invalid accStage ' + accStage);
    }

    let otherMult = 1;
    if (this.attacker.hasAbility('Compound Eyes'))
      otherMult *= 1.3;
    //TODO: Hustle
    if(this.defender.hasItem('Bright Powder','BrightPowder'))
      otherMult *= 0.9;
    if(this.defender.hasItem('Lax Incense'))
      otherMult *= 0.95;

    return Math.floor(acc * mult * otherMult) / 100;
  }
  calculateAverageDmg(valuesNoCrit:number[], valuesCrit:number[],getHitCount = () => 1){
    if(this.avgDmgSimulCount === 0)
      return 0;

    if(valuesCrit[0] === 0)
      return 0;

    const acc = this.getAccuracy();
    const critChance = this.getCritChance();

    let dmgSum = 0;
    const doOne = () => {
      if(this.rng.random() >= acc)
        return;

      for(let hit = 0; hit < getHitCount(); hit++){
        const isCrit = this.rng.random() < critChance;
        const range = isCrit ? valuesCrit : valuesNoCrit;
        const randIdx = Math.floor(this.rng.random() * range.length);
        dmgSum += range[randIdx];
      }
    };
    for (let i = 0 ; i < this.avgDmgSimulCount; i++)
      doOne();

    return dmgSum / this.avgDmgSimulCount;
  }
  calculateHkoChance(valuesNoCrit:number[], valuesCrit:number[],getHitCount = () => 1){
    if(this.hkoSimulCount === 0)
      return [];
    if(valuesCrit[0] === 0)
      return [];

    let hp = this.defender.curHP();
    let maxHp = this.defender.maxHP();

    let usedBerry = false;

    const acc = this.getAccuracy();
    const critChance = this.getCritChance();
    const doOne = () => {
      let hpOne = hp;
      for(let hko = 1; hko < this.hkoMaxCount; hko++){
        if(this.rng.random() >= acc)
          continue;

        for(let hit = 0; hit < getHitCount(); hit++){
          const isCrit = this.rng.random() < critChance;
          const range = isCrit ? valuesCrit : valuesNoCrit;
          const randIdx = Math.floor(this.rng.random() * range.length);
          const dmg = range[randIdx];
          hpOne -= dmg;

          if (this.defender.hasItem('Focus Band') && this.rng.random() < 0.10)
            hpOne = 1;

          if (hpOne <= 0)
            return hko;

          if (!usedBerry && this.defender.hasItem('Sitrus Berry') && hpOne < maxHp / 50){ //GEN3
            usedBerry = true;
            hpOne += 30;
          }
        }

        if (this.defender.hasItem('Leftovers')){
          hpOne += Math.floor(maxHp / 16);
          if (hpOne > maxHp)
            hpOne = maxHp;
        }
      }
      return this.hkoMaxCount;
    };

    const distrib = [];
    for (let i = 0 ; i < this.hkoMaxCount + 1; i++)
      distrib[i] = 0;
    for (let i = 0 ; i < this.hkoSimulCount; i++)
      distrib[doOne()]++;

    return distrib.map((count,hko) => {
      return {chance:count / this.hkoSimulCount, hko};
    }).filter(c => c.chance);
  }
}

