
import { Rng } from "../Rng";

export class PikeClusterOptions {
  atLeastTwoAliveMons = true;
  atLeastOneHealthyMon = true;
  pikeHealingRoomsDisabled = false;
}

export enum PikeRoomType {
  SINGLE_BATTLE,
  HEAL_FULL,
  NPC,
  STATUS,
  HEAL_PART,
  WILD_MONS,
  HARD_BATTLE,
  DOUBLE_BATTLE,
  BRAIN,
}

export const PikeRoomType_ToName = [
  'Easy Single Battle',
  'Full Heal',
  'Npc',
  'Status',
  'Partial Heal',
  'Wild Pokemon',
  'Hard Single Battle',
  'Double Battle',
  'Queen Lucy',
];

export enum RoomPos {
  LEFT=0,
  CENTER=1,
  RIGHT=2,
}
export const RoomPos_ToStr = [
  'Left',
  'Center',
  'Right',
];

export enum Hint {
  Status_HealPart="Status_HealPart",
  Single_HealFull="Single_HealFull",
  Wild_Hard="Wild_Hard",
  Npc_Double="Npc_Double",
}

export const Hint_ToText = {
  [Hint.Status_HealPart]:"For some odd reason, I felt a wave of nostalgia coming from it...",
  [Hint.Single_HealFull]:"Is it...A Trainer? I sense the presence of people...",
  [Hint.Wild_Hard]:"It seems to have the distinct aroma of Pokémon wafting around it...",
  [Hint.Npc_Double]:"I seem to have heard something... It may have been whispering...",
};

export class BpiGenerator {
  constructor(public opts:PikeClusterOptions){}

  static getHintMsg(hintedRoomType:PikeRoomType){
    if(hintedRoomType === PikeRoomType.STATUS || hintedRoomType === PikeRoomType.HEAL_PART)
      return Hint.Status_HealPart;
    if(hintedRoomType === PikeRoomType.SINGLE_BATTLE || hintedRoomType === PikeRoomType.HEAL_FULL)
      return Hint.Single_HealFull;
    if(hintedRoomType === PikeRoomType.WILD_MONS || hintedRoomType === PikeRoomType.HARD_BATTLE)
      return Hint.Wild_Hard;
    if(hintedRoomType === PikeRoomType.NPC || hintedRoomType === PikeRoomType.DOUBLE_BATTLE)
      return Hint.Npc_Double;
    return Hint.Npc_Double;
  }
  /** the number of frames between SetHintedRoom() and GetNextRoomType() when walking straight up */
  static ROOM1_RNG_ADV_COUNT_FROM_HINT_TO_NEXT_ROOM = 114;
  generate_1stRoom(rng:Rng){
    const hintedRoomPos = <RoomPos>Number(rng.Random()) % 3;
    const hintedRoomType = this.getHintedRoomType(rng);

    if (hintedRoomPos === RoomPos.CENTER)
      return [hintedRoomPos, hintedRoomType, hintedRoomType] as const;

    rng.RandomX(BpiGenerator.ROOM1_RNG_ADV_COUNT_FROM_HINT_TO_NEXT_ROOM);

    return [hintedRoomPos, hintedRoomType, this.getNextRoomType(rng, BpiGenerator.getHintMsg(hintedRoomType))]  as const;
  }
  generate_2ndRoom(rng:Rng, hint:Hint){
    return this.getNextRoomType(rng, hint);
  }

  getHintedRoomType(rng:Rng){
    let count = this.opts.pikeHealingRoomsDisabled ? 6 : 8;

    const roomCandidates:PikeRoomType[] = [0,0,0,0,0,0,0,0,0,0];
    for (let i = 0, id = 0; i < count; i++)
    {
        if (this.opts.pikeHealingRoomsDisabled)
        {
            if (i != PikeRoomType.HEAL_FULL && i != PikeRoomType.HEAL_PART)
                roomCandidates[id++] = i;
        }
        else
        {
            roomCandidates[i] = i;
        }
    }

    let hintedRoomType = roomCandidates[Number(rng.Random()) % count];
    if (hintedRoomType == PikeRoomType.STATUS && !this.opts.atLeastOneHealthyMon)
        hintedRoomType = PikeRoomType.NPC;
    if (hintedRoomType == PikeRoomType.DOUBLE_BATTLE && !this.opts.atLeastTwoAliveMons)
        hintedRoomType = PikeRoomType.NPC;
    return hintedRoomType;
  }
  getNextRoomType(rng:Rng,hint:Hint){
    const roomTypes:PikeRoomType[] = [];

    if (hint !== Hint.Single_HealFull)
      roomTypes.push(PikeRoomType.SINGLE_BATTLE);

    if (hint !== Hint.Single_HealFull && !this.opts.pikeHealingRoomsDisabled)
      roomTypes.push(PikeRoomType.HEAL_FULL);

    if (hint !== Hint.Npc_Double)
      roomTypes.push(PikeRoomType.NPC);

    if (hint !== Hint.Status_HealPart && this.opts.atLeastOneHealthyMon)
      roomTypes.push(PikeRoomType.STATUS);

    if (hint !== Hint.Status_HealPart && !this.opts.pikeHealingRoomsDisabled)
      roomTypes.push(PikeRoomType.HEAL_PART);

    if (hint !== Hint.Wild_Hard)
      roomTypes.push(PikeRoomType.WILD_MONS);

    if (hint !== Hint.Wild_Hard)
      roomTypes.push(PikeRoomType.HARD_BATTLE);

    if (hint !== Hint.Npc_Double && this.opts.atLeastTwoAliveMons)
      roomTypes.push(PikeRoomType.DOUBLE_BATTLE);

    return roomTypes[Number(rng.Random()) % roomTypes.length];
  }
}