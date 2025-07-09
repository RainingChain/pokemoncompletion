
export class Rng {
  constructor(gRngValue = BigInt(0)){
    this.gRngValueBigInt = gRngValue;
  }

  gRngValueBigInt:bigint;
  advancedCount = 0;

  RandomX(x:number){
    for(let i = 0 ; i < x; i++)
      this.Random();
  }

  /** returns u16 */
  Random(){
    this.advancedCount++;

    this.gRngValueBigInt = (BigInt(1103515245) * this.gRngValueBigInt) + BigInt(24691);
    this.gRngValueBigInt = this.gRngValueBigInt & BigInt(0xFFFFFFFF); //convert to u32

    return (this.gRngValueBigInt / BigInt(65536)) & BigInt(0xFFFF);
  }
  RandomWithoutAdvanced(){
    let gRngValueBigInt = (BigInt(1103515245) * this.gRngValueBigInt) + BigInt(24691);
    gRngValueBigInt = gRngValueBigInt & BigInt(0xFFFFFFFF); //convert to u32

    return gRngValueBigInt / BigInt(65536);
  }
  Random32(){
    const r1 = this.Random();
    const r2 = this.Random();
    const res = (r1 | (r2 << BigInt(16))) & BigInt(0xFFFFFFFF);
    return res;
  }
  clone(){
    const rng = new Rng(BigInt(0));
    rng.advancedCount = this.advancedCount;
    rng.gRngValueBigInt = this.gRngValueBigInt;
    return rng;
  }

  static debug_printValues(min:number,max:number){
    const arr:string[] = [];
    const rng = new Rng(BigInt(0));
    rng.RandomX(min);
    for(let i = 0; i <= max - min; i++){
      arr.push(`0x${rng.gRngValueBigInt.toString(16)}`);
      rng.Random();
    }
    return arr.join(',');
  }
  static debug_printValue(adv:number){
    const rng = new Rng(BigInt(0));
    rng.RandomX(adv - 1);
    return '0x' + rng.Random().toString(16);
  }
  static debug_printValue32(adv:number){
    const rng = new Rng(BigInt(0));
    rng.RandomX(adv - 1);
    return '0x' + rng.Random32().toString(16);
  }


  static debug_printData(){
    const NATURES = [ "Hardy", "Lonely", "Brave", "Adamant", "Naughty", "Bold", "Docile", "Relaxed", "Impish", "Lax", "Timid", "Hasty", "Serious", "Jolly", "Naive", "Modest", "Mild", "Quiet", "Bashful", "Rash", "Calm", "Gentle", "Sassy", "Careful", "Quirky"];

    let str = 'Adv\tNature\tAbility\tr16\tr32\n';
    for(let i = 0; i < 4000; i++){
      const rng = new Rng(BigInt(0));
      rng.RandomX(i);
      const r16 = rng.Random();

      const rng2 = new Rng(BigInt(0));
      rng2.RandomX(i);
      const r32 = rng2.Random32();

      const ab = r32 & BigInt(1);
      const nat = NATURES[Number(r32 % BigInt(25))];
      str += `${i}\t${nat}\t${ab.toString()}\t0x${r16.toString(16)}\t0x${r32.toString(16)}\n`
    }
    return str;
  }
}

export class Rng2 {
  constructor(gRngValue = BigInt(0)){
    this.gRngValueBigInt = gRngValue;
  }

  gRngValueBigInt:bigint;
  advancedCount = 0;

  RandomX(x:number){
    for(let i = 0 ; i < x; i++)
      this.ISO_RANDOMIZE2();
  }

  /** returns u32 */
  ISO_RANDOMIZE2(){
    this.advancedCount++;

    this.gRngValueBigInt = (BigInt(1103515245) * this.gRngValueBigInt) + BigInt(12345);
    this.gRngValueBigInt = this.gRngValueBigInt & BigInt(0xFFFFFFFF); //convert to u32

    return this.gRngValueBigInt;
  }
}
/*
-- signed to unsigned register
-- a = new Uint32Array(new Int32Array([-1344533502]).buffer)[0]
*/
