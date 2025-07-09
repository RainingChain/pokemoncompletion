

import * as Smogon from '@smogon/calc';
import { Move, Pokemon } from '@smogon/calc';
import pokemons from "../data/Platinum/trainer_pokemons.json";
(<any>window).Smogon = Smogon;
type RawPokemon = Omit<typeof pokemons[0],'evs' | 'speed'> //for typescript perf

export const deepCloneify = function<T>(f:T){
  //(<any>f).clone = function(){ return Vue_pokemonBattleTower_methods.deepClone(this); };
  return f;
};


export const deepClone = function<T> (objRaw:T, recursionLvl=0):T {
  if(objRaw === null || typeof objRaw !== 'object')
    return objRaw;
  if(recursionLvl > 50)
    return undefined!;

  const obj:any = objRaw;

  if(Array.isArray(obj)){
    const temp:any = [];
    for(let i = 0; i < obj.length; i++){
      if(obj[i] === null || typeof obj[i] !== 'object')  //reduce function call
        temp[i] = obj[i];
      else
        temp[i] = deepClone(obj[i], recursionLvl + 1);
    }
    return temp;
  } else if(obj instanceof Map){
    return <any>new Map(obj);
  } else if(obj instanceof Set){
    return <any>new Set(obj);
  }
  const temp = Object.create(Object.getPrototypeOf(obj));

  for(const key in obj){
    if(obj[key] === null || typeof obj[key] !== 'object')  //reduce function call
      temp[key] = obj[key];
    else
      temp[key] = deepClone(obj[key], recursionLvl + 1);
  }
  return temp;
};


export class Vue_pokemon_data {
  static createTrainerPk(gen:Smogon.GenerationNum,raw:RawPokemon,ability:string,abilityIdx:number){
    const vuePk = new Vue_pokemon_data();
    vuePk.smon = deepCloneify(new Pokemon(gen, raw.species,{
      ivs:{hp:31,atk:31,def:31,spa:31,spd:31,spe:31}, //BAD, not always 31 in battle institute
      nature:raw.nature,
      level:50,
      evs:(<any>raw).evs,
      item: raw.item,
      moves: raw.moves,
      ability,
    }));

    vuePk.pkMoves = raw.moves.map(m => deepCloneify(new Move(gen, m, {isCrit:true})));

    vuePk.name = vuePk.smon.name;
    vuePk.tmonBattleTowerId = raw.id;
    vuePk.tmonAbilityIdx = abilityIdx;
    vuePk.tmonAbility = vuePk.smon.ability || '';
    vuePk.nature = vuePk.smon.nature;
    return vuePk;
  }
  static createSelfPk(pk:Pokemon){
    const vuePk = new Vue_pokemon_data();
    vuePk.smon = pk;
    vuePk.nature = pk.nature;
    vuePk.pkMoves = pk.moves.map(m => deepCloneify(new Move(pk.gen, m, {isCrit:false})));
    vuePk.tmonBattleTowerId = null;
    vuePk.name = vuePk.smon.name;
    return vuePk;

  }
  name = '';
  nature = '';
  pkMoves:Move[] = [];

  tmonBattleTowerId:null | number = null;
  tmonAbilityIdx = 0;
  tmonAbility = '';
  smon:Pokemon;
  pmonIdx = 0;
  getDesc(){
    return `${this.name}, ${this.nature}, ${this.smon.item}, ${this.pkMoves.map(m => m.name)}`
  }
  getSpd(){
    const mult = this.smon.item === 'Choice Scarf' ? 1.5 : 1;
    return Math.floor(Math.floor(this.smon.stats.spe) * mult);
  }
}


export class PokemonHelper_data {
  constructor(public gen:Smogon.GenerationNum){
    pokemons.forEach(rpk => {
      rpk.abilities.forEach((ab,i) => {
        let stmon = Vue_pokemon_data.createTrainerPk(gen, rpk, ab ? ab : rpk.abilities[0], i);
        this.trainerPks.push(stmon);
      });
    })
  }
  selfPks:Vue_pokemon_data[] = [];
  trainerPks:Vue_pokemon_data[] = [];
  initShedinja(){
    let pks = ["Adamant"].map(nature => {
      return Vue_pokemon_data.createSelfPk(new Pokemon(this.gen, "Shedinja",{
        ivs:{hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
        nature,
        level:50,
        evs:{atk:252, spe:252},
        item:"Focus Sash",
        moves: ["Shadow Sneak","X-Scissor", "Dig","Sword Dance"],
      }));
    });

    pks.forEach((pmon,i) => {
      pmon.pmonIdx = i;
    });
    this.selfPks = pks;
  }
  initSelfPks(){
    const MORE_SPD_LESS_ATK = 'Timid';
    const MORE_SPD_LESS_SPA = 'Jolly';
    const MORE_ATK_LESS_SPA = 'Adamant';
    const MORE_SPA_LESS_ATK = 'Modest';

    const getMoveCombinations = function(movesAlways:string[],movesMaybe:string[]){
      if(!movesMaybe.length)
        return [movesAlways];
      const getBit = function(num:number,index:number){
        return (num & (1 << index)) !== 0;
      };
      const get1BitCount = function(v:number){
        v = v - ((v >> 1) & 0x55555555);
        v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
        return ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
      }
      const maybeCountWanted = 4 - movesAlways.length;
      const moveCombinations:string[][] = [];
      for(let i = 0; i < 2 ** movesMaybe.length; i++){
        if(get1BitCount(i) !== maybeCountWanted)
          continue;
        const curr:string[] = [...movesAlways];
        for(let j = 0; j < movesMaybe.length; j++){
          if(getBit(i, j))
            curr.push(movesMaybe[j]);
        }
        moveCombinations.push(curr);
      }
      return moveCombinations;
    }
    const newPks = (name:string, isAtk:boolean,item:string,movesAlways:string[],movesMaybe:string[]=[], extra:any={}) => {
      const movesCombi = getMoveCombinations(movesAlways,movesMaybe);
      const pks:Vue_pokemon_data[] = [];
      movesCombi.forEach(moves2 => {
        const addPk = (nature:string, evsAtk:number, evsSpa:number, evsHp:number) => {
          let items = [item, 'Choice Scarf',isAtk ? 'Choice Band' : 'Choice Specs'];
          items.forEach(item => {
            let smon = new Pokemon(this.gen, name,{
              ivs:{hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
              nature,
              level:50,
              evs:{atk:evsAtk, spa:evsSpa, spe:252, hp:evsHp},
              item,
              moves: moves2,
              ...extra,
            });
            const pk = Vue_pokemon_data.createSelfPk(smon);
            pks.push(pk);
          });
        };
        if(isAtk){
          addPk(MORE_SPD_LESS_SPA, 252, 0, 4);
          addPk(MORE_ATK_LESS_SPA, 252, 0, 4);
        } else {
          addPk(MORE_SPD_LESS_ATK, 0, 252, 4);
          addPk(MORE_SPA_LESS_ATK, 0, 252, 4);
        }
      });
      return pks;
    };


    const pks = [

      Vue_pokemon_data.createSelfPk(new Pokemon(this.gen, "Shedinja",{
        ivs:{hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
        nature:"Hasty",
        level:50,
        evs:{atk:252, spe:252},
        item:"Focus Sash",
        moves: ["X-Scissor", "Shadow Sneak", "Shadow Claw"],
      }))
      /*
      //...newPks('Azelf', false, 'Life Orb', ['Psychic', "Flamethrower"],["Shadow Ball", "Grass Knot","Thunderbolt", "Signal Beam","Ice Punch", "Energy Ball"]),

      //...newPks('Garchomp', true, 'Life Orb', ['Dragon Claw','Earthquake'],['Brick Break','Flamethrower', "Crunch", "Iron Head", "Poison Jab", "Shadow Claw", "Surf"]),
      //...newPks('Latios', false, 'Life Orb', ["Psychic"],["Dragon Pulse", "Energy Ball", "Hidden Power", "Grass Knot", "Ice Beam", "Shadow Ball", "Surf","Thunderbolt"],{ivs:{hp:31,atk:31,def:31,spa:30,spd:30,spe:31},}),

      ...newPks('Lucario', true, 'Life Orb', ["Close Combat", "Earthquake", "Ice Punch", "Crunch"]),
      */
      /*...newPks('Azelf', false, 'Life Orb', ['Psychic', "Flamethrower", "Energy Ball" ,"Thunderbolt"]), //376
      ...newPks('Latios', false, 'Life Orb', ["Psychic", "Grass Knot", "Ice Beam", "Thunderbolt"]),
      ...newPks('Garchomp', true, 'Life Orb', ['Dragon Claw','Earthquake', 'Crunch', "Poison Jab"]), // 332
      ...newPks('Infernape', true, 'Life Orb', ["Close Combat","Flare Blitz","Earthquake"], ["Shadow Claw", "Thunder Punch"]),
      ...newPks('Starmie', false, 'Life Orb', ["Surf","Psychic", "Ice Beam"], ["Thunderbolt","Signal Beam","Grass Knot","Power Gem"]),*/
      //--------------------
      //bad
      //...newPks('Lucario', true, 'Life Orb', ["Close Combat", "Earthquake"], ["Crunch", "Aura Sphere", "Dark Pulse","Dragon Pulse", "Flash Cannon", "Ice Punch", "Low Kick", "Poison Jab", "Shadow Claw", "Thunder Punch"]),

      //...newPks('Salamence', true, 'Life Orb', ['Dragon Claw',"Earthquake", "Aerial Ace", "Flamethrower"]), //279
      //...newPks('Salamence', true, 'Life Orb', ['Dragon Claw',"Earthquake",], ["Brick Break", "Shadow Claw", "Aerial Ace", "Flamethrower","Crunch"]),



      //--------------------
      // GEN 5
      //...newPks('Garchomp', true, 'Choice Band', ['Earthquake'],[]),
      //...newPks('Garchomp', true, 'Lum Berry', ['Outrage','Earthquake'],['Brick Break','Flamethrower', "Crunch", "Iron Head", "Poison Jab", "Shadow Claw", "Surf"]),
      //--------------

      //...newPks('Haxorus', true, 'Life Orb', ['Dragon Claw', "Earthquake", "Low Kick", "X-Scissor"],[],{ability:"Mold Breaker"}), //296
      //...newPks('Haxorus', true, 'Life Orb', ['Dragon Claw', "Earthquake"],["Low Kick", "X-Scissor", "Surf", "Shadow Claw", "Poison Jab", "Brick Break"],{},true),
      //...newPks('Haxorus', true, 'Life Orb', ['Dragon Claw', "Earthquake"],["Low Kick", "X-Scissor", "Surf", "Shadow Claw", "Poison Jab", "Brick Break"],{ability:"Mold Breaker"}),

      //...newPks('Archeops', true, 'Life Orb', ['Acrobatics', "Earthquake", "Crunch","Ancient Power"]), //313
      //...newPks('Archeops', true, '', ['Acrobatics', "Earthquake"],["Earth Power","Dragon Claw", "Shadow Claw","Crunch", "Ancient Power"]),
      //...newPks('Archeops', true, 'Life Orb', ['Acrobatics', "Earthquake"],["Earth Power","Dragon Claw", "Shadow Claw","Crunch", "Ancient Power"]),
      //...newPks('Archeops', true, 'Flying Gem', ['Acrobatics', "Earthquake"],["Earth Power","Dragon Claw", "Shadow Claw","Crunch", "Ancient Power"], undefined, true),

      //...newPks('Chandelure', false, 'Life Orb', ["Shadow Ball", "Flamethrower", "Energy Ball", "Dark Pulse"]),  //314

      //...newPks('Chandelure', false, 'Life Orb', ["Shadow Ball", "Flamethrower"],["Energy Ball", "Dark Pulse", "Hidden Power"],{ivs:{hp:31,atk:31,def:31,spa:30,spd:30,spe:31},}), // 151, HP ground

      /*...newPks('Volcarona', false, 'Life Orb', ["Bug Buzz", "Flamethrower", "Giga Drain", "Psychic"],[],{
        ivs:{hp:0,atk:0,def:0,spa:27,spd:0,spe:31}
      }), //401*/
      /*...newPks('Volcarona', false, 'Focus Sash', ["Bug Buzz", "Flamethrower", "Giga Drain", "Psychic"],[],{
        ivs:{hp:0,atk:0,def:0,spa:27,spd:0,spe:31} //IV i got ingame from breeding
      }), //401*/
      //...newPks('Volcarona', false, 'Life Orb', ["Bug Buzz", "Flamethrower", "Giga Drain", "Psychic"]), //401
      //...newPks('Volcarona', false, 'Life Orb', ["Bug Buzz", "Flamethrower"],["Giga Drain", "Psychic", "Hidden Power"],{ivs:{hp:31,atk:31,def:31,spa:30,spd:30,spe:31},}),

    ];

    pks.forEach((pmon,i) => {
      pmon.pmonIdx = i;
    });
    this.selfPks = pks;
  }
  debug_print_jtmons_speed(){
    pokemons.forEach(jtmon => {
      let stmon = Vue_pokemon_data.createTrainerPk(this.gen, jtmon, jtmon.abilities[0], 0);
      jtmon.speed = stmon.getSpd();
    });
    return pokemons.map(jtmon => JSON.stringify(jtmon)).join(',\n');
  }
}