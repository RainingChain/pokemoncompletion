

//Credits: Shao on Discord
export const calcModuloCycle_u = (dividend_i:bigint | number, divisor_i:bigint | number) => {
  let dividend = typeof dividend_i === 'number' ? BigInt(dividend_i) : dividend_i;
  const divisor = typeof divisor_i === 'number' ? BigInt(divisor_i) : divisor_i;

  if (divisor <= BigInt(0))
    return 0; // error

  if (dividend < BigInt(0))
    dividend = signedToUnsigned(<number>dividend_i);

  if (dividend < divisor) {
    return 18; // 2*5 + 8 fo branch on 6th instruction
  }
  let cycles = 24;  // Time to get into first loop and between first/second loops
  let r0 = dividend;
  let r1 = divisor;
  let r3 = BigInt(1);
  let r2, r12;
  let r4 = BigInt(0x10000000);
  // Enter into first loop at offest 0x12
  while (true) {
    if (r1 >= r4) {
      cycles += 10;
      break;
    }
    if (r1 >= r0) {
      cycles += 14;
      break;
    }
    r1 <<= BigInt(4);
    r3 <<= BigInt(4);
    cycles += 20;
  }
  r4 <<= BigInt(3);
  while (true) {
    if (r1 >= r4) {
      cycles += 10;
      break;
    }
    if (r1 >= r0) {
      cycles += 14;
      break;
    }
    r1 <<= BigInt(1);
    r3 <<= BigInt(1);
    cycles += 20;
  }
  while (true) {  // Entering loop at 0x30
    r2 = BigInt(0);
    cycles += 48;
    if (r0 >= r1) {
      r0 -= r1;
      cycles -= 4;
    }
    r4 = r1 >> BigInt(1); // Now at 0x38
    if (r0 >= r4) {
      r0 -= r4;
      r12 = r3;
      r3 = (r3 << (BigInt(32) - BigInt(1))) | (r3 >> BigInt(1));
      r2 |= r3;
      r3 = r12;
      cycles += 7;
    }
    r4 = r1 >> BigInt(2); // Now at 0x4A
    if (r0 >= r4) {
      r0 -= r4;
      r12 = r3;
      r3 = (r3 << (BigInt(32) - BigInt(2))) | (r3 >> BigInt(2));
      r2 |= r3;
      r3 = r12;
      cycles += 7;
    }
    r4 = r1 >> BigInt(3); // Now at 0x5C
    if (r0 >= r4) {
      r0 -= r4;
      r12 = r3;
      r3 = (r3 << (BigInt(32) - BigInt(3))) | (r3 >> BigInt(3));
      r2 |= r3;
      r3 = r12;
      cycles += 7;
    }
    r12 = r3; // Now at 0x6E
    if (r0 == BigInt(0)) {
      cycles += 12;
      break;
    }
    r3 >>= BigInt(4);
    if (r3 == BigInt(0)) {
      cycles += 16;
      break;
    }
    r1 >>= BigInt(4);
    cycles += 20;
  }
  //printf("%u\n", cycles);
  r2 &= BigInt(0xE0000000); // Now at 0x7C
  if (r2 == BigInt(0)) {
    return cycles + 18;
  }


  r3 = r12; // Now at 0x88
  r3 = (r3 << (BigInt(32) - BigInt(3))) | (r3 >> BigInt(3));
  if ((r2 & r3) != BigInt(0)) {
    r0 += r1 >> BigInt(3);
    cycles -= 2;
  }
  r3 = r12;
  r3 = (r3 << (BigInt(32) - BigInt(2))) | (r3 >> BigInt(2));
  if ((r2 & r3) != BigInt(0)) {
    r0 += r1 >> BigInt(2);
    cycles -= 2;
  }
  r3 = r12;
  r3 = (r3 << (BigInt(32) - BigInt(1))) | (r3 >> BigInt(1));
  if ((r2 & r3) != BigInt(0)) {
    r0 += r1 >> BigInt(1);
    cycles -= 2;
  }
  return cycles + 75;
}

export const calcModuloCycle_s = (dividend_i:bigint | number, divisor_i:bigint | number) => {
  const dividend = typeof dividend_i === 'number' ? BigInt(dividend_i) : dividend_i;
  const divisor = typeof divisor_i === 'number' ? BigInt(divisor_i) : divisor_i;

  let r0:bigint, r1:bigint, r2:bigint, r3:bigint, r4:bigint, r12:bigint;
  let cycles = 10;
  r1 = divisor < BigInt(0) ? divisor * BigInt(-1) : divisor;
  r0 = dividend < BigInt(0) ? dividend * BigInt(-1) : dividend;
  r3 = BigInt(1);
  if (divisor > BigInt(0)) {
    cycles += 4;
  }
  //printf("0xA %u\n", cycles);


  cycles += 10;
  if (dividend > BigInt(0)) {
    cycles += 4;
  }
  //printf("0x14 %u\n", cycles);
  // Short circuit check at  0x14
  if (r0 < r1) {
    if (dividend > BigInt(0)) {
      return cycles + 32;
    }
    return cycles + 28;
  }
  r4 = BigInt(0x10000000);

  cycles += 8;
  //printf("0x1C %u\n", cycles);
  while (true) {
    if (r1 >= r4) {
      cycles += 10;
      break;

    }
    if (r1 >= r0) {
      cycles += 14;
      break;
    }
    r1 <<= BigInt(4);
    r3 <<= BigInt(4);
    cycles += 20;
  }
  //printf("0x2A %u\n", cycles);
  r4 <<= BigInt(3);
  cycles += 2;

  while (true) {
    if (r1 >= r4) {
      cycles += 10;
      break;
    }
    if (r1 >= r0) {
      cycles += 14;
      break;
    }
    r1 <<= BigInt(1);
    r3 <<= BigInt(1);
    cycles += 20;
  }
  //printf("0x3A %u\n", cycles);
  while (true) {
    r2 = BigInt(0);
    cycles += 48;
    if (r0 >= r1) {
      r0 -= r1;
      cycles -= 4;
    }

    //printf("0x42 %u: %0x, %0x\n", cycles, r0, r1);
    //cycles += 12;
    r4 = r1 >> BigInt(1);
    if (r0 >= r4) {
      r0 -= r4;
      r12 = r3;
      r3 = (r3 << BigInt(32 - 1)) | (r3 >> BigInt(1));
      r2 |= r3;
      r3 = r12;
      cycles += 7;
    }

    //printf("0x54 %u: %0x, %0x\n", cycles, r0, r1);
    r4 = r1 >> BigInt(2);
    //cycles += 12;

    if (r0 >= r4) {
      r0 -= r4;
      r12 = r3;
      r3 = (r3 << BigInt(32 - 2)) | (r3 >> BigInt(2));
      r2 |= r3;
      r3 = r12;
      cycles += 7;
    }
    //printf("0x66 %u\n", cycles);
    //cycles += 12;
    r4 = r1 >> BigInt(3);
    if (r0 >= r4) {
      r0 -= r4;
      r12 = r3;
      r3 = (r3 << BigInt(32 - 3)) | (r3 >> BigInt(3));
      r2 |= r3;
      r3 = r12;
      cycles += 7;
    }
    //printf("0x78 %u\n", cycles);
    r12 = r3;
    if (r0 == BigInt(0)) {
      cycles += 12;
      break;
    }
    r3 >>= BigInt(4);
    if (r3 == BigInt(0)) {
      cycles += 16;
      break;
    }
    r1 >>= BigInt(4);
    cycles += 20;
  }
  //printf("0x86 %u\n", cycles);
  r2 &= BigInt(0xE0000000);
  if (r2 == BigInt(0)) {
    if (dividend >= BigInt(0)) {
      return cycles + 36;
    }
    return cycles + 32;
  }
  cycles += 8;
  //printf("0x8E %u\n", cycles);



  r3 = r12;
  //cycles += 77;
  cycles += 17;
  r3 = (r3 << BigInt(32 - 3)) | (r3 >> BigInt(3));
  if ((r2 & r3) != BigInt(0)) {
    //printf("Reduced on 3 shift\n");
    r0 += r1 >> BigInt(3);
    cycles -= 2;
  }
  r3 = r12;

  //printf("0x9C %u\n", cycles);
  cycles += 17;
  r3 = (r3 << BigInt(32 - 2)) | (r3 >> BigInt(2));
  if ((r2 & r3) != BigInt(0)) {
    //printf("Reduced on 2 shift\n");
    r0 += r1 >> BigInt(2);
    cycles -= 2;
  }
  r3 = r12;

  //printf("0xAA %u\n", cycles);
  cycles += 17;
  r3 = (r3 << BigInt(32 - 1)) | (r3 >> BigInt(1));
  if ((r2 & r3) != BigInt(0)) {
    //printf("Reduced on 1 shift\n");
    r0 += r1 >> BigInt(1);
    cycles -= 2;
  }
  //printf("0xB8 %u\n", cycles);

  cycles += 18;
  if (dividend >= BigInt(0)) {
    cycles += 4;
  }
  return cycles;
}


export const signedToUnsigned = function(n:number){
  return BigInt(new Uint32Array(new Int32Array([n]).buffer)[0]);
}