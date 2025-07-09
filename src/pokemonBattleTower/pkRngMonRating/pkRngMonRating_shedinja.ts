
import { Move, Pokemon, calculate } from '@smogon/calc';
import {PokemonHelper_data,Vue_pokemon_data} from "./pkRngMonRating_data";
import { GameData, getData,Trainer,JsonTrainerPokemon } from "../data/getData";

export const getShedinjaDmgInfo = function(gameData:GameData, nature:string, tmonBattleTowerId:number, abilityIdx:number){
  let selfPk = Vue_pokemon_data.createSelfPk(new Pokemon(<any>gameData.meta.gen, "Shedinja",{
    ivs:{hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
    nature,
    level:50,
    evs:{atk:252, spe:252},
    item:"Focus Sash",
    moves: ["Shadow Sneak","X-Scissor", "Dig","Sword Dance"],
  }));
  let jtmon = gameData.trainerPokemons[tmonBattleTowerId];
  let stmon = Vue_pokemon_data.createTrainerPk(<any>gameData.meta.gen, jtmon, jtmon.abilities[abilityIdx] || jtmon.abilities[0], abilityIdx);

  let dmgPcts = selfPk.pkMoves.map(move => {
    move.isCrit = false;

    const res = calculate(<any>gameData.meta.gen, selfPk.smon, stmon.smon, move);
    const dmg = (function(){
      const d = res.damage;
      if(typeof d === 'number')
        return d;
      if(d.length === 2){
        const d2 = <number[]>d[0];
        return d2[0];
      }
      return <number>d[0];
    })();
    return dmg / stmon.smon.maxHP(true);
  });

  let str:string[] = [];
  if (selfPk.getSpd() <= stmon.getSpd())
    str.push('Outsped');

  if (dmgPcts[0] >= 0.5)
    str.push('+2 SS');
  else if (dmgPcts[0] > 0.333)
    str.push('+4 SS');
  else if (dmgPcts[0] > 0.25)
    str.push('+6 SS');
  else
    str.push('Bad SS');

  if (dmgPcts[1] >= 0.5)
    str.push('+2 XS');
  else if(dmgPcts[0] <= 0.333){
    if (dmgPcts[1] > 0.333)
      str.push('+4 XS');
    else if (dmgPcts[0] < 0.25){
      if (dmgPcts[1] > 0.25)
        str.push('+6 XS');
      else
        str.push('Bad XS');
    }
  }


  if (dmgPcts[2] >= 0.5)
    str.push('+2 Dig');
  else if(dmgPcts[0] <= 0.333){
    if (dmgPcts[2] > 0.333)
      str.push('+4 Dig');
    else if (dmgPcts[0] < 0.25){
      if (dmgPcts[2] > 0.25)
        str.push('+6 Dig');
      else
        str.push('Bad Dig');
    }
  }

  return str.join(',');
}