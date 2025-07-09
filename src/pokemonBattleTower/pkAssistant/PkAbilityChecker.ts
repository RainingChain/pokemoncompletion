import { JsonTrainerPokemon } from "../data/getData";
import { RamPokemon } from "./RamPokemon";

import * as Smogon from '@smogon/calc';

import * as DATA from "./PkAbilityChecker_data";

export class PkAbilityChecker {
  constructor(public GEN:any,
              public jtmon:JsonTrainerPokemon,
              public rtmon:RamPokemon | null,
              public spmons:Smogon.Pokemon[]){

    this.spmons.forEach(spmon => {
      spmon.moves.forEach(mv => {
        this.playerMoves.push(this.move(mv));
      });
    });
  }

  playerMoves:Smogon.Move[] = [];
  allMoves(jtmon:JsonTrainerPokemon){
    return this.playerMoves.concat(this.trainerMoves(jtmon));
  }
  trainerMoves(jtmon:JsonTrainerPokemon){
    return jtmon.moves.map(mv => this.move(mv));
  }

  move(n:string){
    return new Smogon.Move(<any>this.GEN, n);
  }
  calculatePossibleAbilities() : {known:string,important:string[],notImportant:string[]} {
    const important = this.jtmon.abilities.filter(ab => this.isAbilityImportant(ab, this.jtmon));
    const notImportant = this.jtmon.abilities.filter(ab => !important.includes(ab));

    const known = (() => {
      if(this.jtmon.abilities.length === 1)
        return this.jtmon.abilities[0];

      if(!this.rtmon)
        return '';

      const realAb = this.rtmon.getAbilityName();
      if (this.isAbilityVisible(realAb))
        return realAb;

      let visibleAbs = this.jtmon.abilities.filter(ab => this.isAbilityVisible(ab));
      if (visibleAbs.length >= this.jtmon.abilities.length - 1)
        return realAb; //we can deduct the right one

      return '';
    })();

    return {known, important, notImportant};
  }
  // species/move format is smogon
  isAbilityImportant(ab:string,jtmon:JsonTrainerPokemon){
    if (['Illuminate','Pickup','Run Away','Stench'].includes(ab))
      return false;

    if (ab === 'Chlorophyll')
      return this.allMoves(jtmon).some(mv => mv.name === 'Sunny Day')
            || this.spmons.some(mon => ['Drought'].includes(mon.ability!));

    if (ab === 'Clear Body')
      return this.playerMoves.some(mv => DATA.LOWER_ANY.includes(mv.name));

    if (ab === 'Cloud Nine'){
      return this.allMoves(jtmon).some(mv => ['Sunny Day', 'Rain Dance', 'Hail', 'Sandstorm'].includes(mv.name))
            || this.spmons.some(mon => ['Drought','Drizzle','Snow Warning','Sand Stream'].includes(mon.ability!));
    }

    if (ab === 'Compound Eyes')
      return this.playerMoves.some(mv => DATA.LOWER_ANY.includes(mv.name))
             || true; // would need to check all moves with not 100% acc

    if (ab === 'Damp')
      return this.allMoves(jtmon).some(mv => ['Explosion', 'Selfdestruct', 'Self-Destruct'].includes(mv.name));

    if (ab === 'Early Bird' || ab === 'Insomnia' || ab === 'Vital Spirit')
      return this.playerMoves.some(mv => DATA.SLEEP.includes(mv.name))
             || this.trainerMoves(jtmon).some(mv => DATA.SLEEP_SELF.includes(mv.name));

    if (ab === 'Flash Fire')
      return this.playerMoves.some(mv => mv.hasType('Fire') && mv.bp > 0);

    if (ab === 'Guts' || ab === 'Synchronize')
      return this.playerMoves.some(mv => DATA.STATUS_ANY_BUT_SLEEP.includes(mv.name));

    if (ab === 'Hyper Cutter')
      return this.playerMoves.some(mv => DATA.LOWER_ATK.includes(mv.name));

    if (ab === 'Immunity')
      return this.playerMoves.some(mv => DATA.PSN.includes(mv.name));

    if (ab === 'Inner Focus')
      return this.playerMoves.some(mv => DATA.FLINCH.includes(mv.name)) || this.spmons.some(p => p.hasItem("King's Rock","Razor Fang"));

    if (ab === 'Keen Eye')
      return this.playerMoves.some(mv => DATA.LOWER_ACC.includes(mv.name));

    if (ab === 'Lightning Rod' || ab === 'Volt Absorb')
      return this.playerMoves.some(mv => mv.hasType('Electric') && mv.bp > 0);

    if (ab === 'Liquid Ooze')
      return this.playerMoves.some(mv => DATA.LIQUID_OOZE.includes(mv.name));

    if (ab === 'Magma Armor')
      return this.playerMoves.some(mv => DATA.FRZ.includes(mv.name));

    if (ab === 'Magnet Pull')
      return this.spmons.some(p => p.hasType('Steel'));

    if (ab === 'Natural Cure')
      return this.playerMoves.some(mv => DATA.STATUS_ANY.includes(mv.name));

    if (ab === 'Oblivious')
      return this.playerMoves.some(mv => ['Captivate','Attract','G-Max Cuddle'].includes(mv.name));

    if (ab === 'Own Tempo')
      return this.playerMoves.some(mv => DATA.CONFUSE.includes(mv.name))
             || this.trainerMoves(jtmon).some(mv => ['Thrash', 'Petal Dance', 'Outrage','Raging Fury'].includes(mv.name));

    if (ab === 'Rain Dish' || ab === 'Swift Swim')
      return this.allMoves(jtmon).some(mv => ['Rain Dance'].includes(mv.name))
            || this.spmons.some(mon => ['Drizzle'].includes(mon.ability!));

    if (ab === 'Rock Head')
      return this.trainerMoves(jtmon).some(mv => DATA.RECOIL.includes(mv.name));

    if (ab === 'Sand Veil')
      return this.allMoves(jtmon).some(mv => ['Sandstorm'].includes(mv.name))
            || this.spmons.some(mon => ['Sand Stream'].includes(mon.ability!));

    if (ab === 'Shed Skin')
      return this.playerMoves.some(mv => DATA.STATUS_ANY.includes(mv.name));

    if (ab === 'Soundproof')
      return this.playerMoves.some(mv => DATA.SOUND.includes(mv.name));

    if (ab === 'Sticky Hold')
      return this.playerMoves.some(mv => DATA.STICKY_HOLD.includes(mv.name));

    if (ab === 'Sturdy')
      return this.playerMoves.some(mv => DATA.OHKO.includes(mv.name));

    if (ab === 'Swarm')
      return this.trainerMoves(jtmon).some(mv => mv.hasType('Bug') && mv.bp > 0);

    if (ab === 'Thick Fat')
      return this.playerMoves.some(mv => (mv.hasType('Fire') || mv.hasType('Ice')) && mv.bp > 0);

    if (ab === 'Water Absorb')
      return this.playerMoves.some(mv => mv.hasType('Water') && mv.bp > 0);

    if (ab === 'Water Veil')
      return this.playerMoves.some(mv => DATA.BURN.includes(mv.name));

    return true;
  }
  static visibleAbilities = [
    "Arena Trap",
    "Intimidate",
    "Synchronize",
  ];
  isAbilityVisible(ab:string){
    return PkAbilityChecker.visibleAbilities.includes(ab);
  }
}
