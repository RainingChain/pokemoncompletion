
import { renameAllIfNeeded } from "../data/renameList";

export type JsonTrainerPokemon = {abilities:string[],id: number;species: string;displayName: string;nature: string;item: string;moves: string[];}
export type Trainer = {id:number,set:number,name:string,givenName:string,pokemons:number[],startMsg:string,nameLowerCase:string};

export type Meta = {
    gen: number;
    gameName: string;
    dangerousMoves:string[],
    semiDangerousMoves: string[];
    ohkoMoves: string[];
    dangerousItems: string[];
};

export type PlayerPokemons = {
    gameType: string;
    pokemons: PlayerPokemon[];
};

export type PlayerPokemon = {
  name: string;
  options: {
    ivs: {
      hp: number;
      atk: number;
      def: number;
      spa: number;
      spd: number;
      spe: number;
    };
    nature: string;
    evs: {
      hp: number;
      atk: number;
      def: number;
      spa: number;
      spd: number;
      spe: number;
    };
    level: number;
    item: string;
    ability: string;
    moves: string[];
  };
};

export type GameData = {
  meta:Meta,
  trainerPokemons:JsonTrainerPokemon[],
  trainers:Trainer[],
  playerPokemons:PlayerPokemons | null,
};

const getGivenName = function(n:string){
  let s = n.split(' ');
  return s[s.length - 1];
}

export const getData = async function(pathname:string) : Promise<GameData> {
  const game = pathname.toLowerCase();

  if(game === "/battletower/emerald" || game.includes("/battlefacilities/emerald")){
    const meta = (await import("./emerald_meta.json")).default;
    const pokemons = (await import("./emerald_trainerPokemons.json")).default;
    renameAllIfNeeded(pokemons);
    const rawTrainers = (await import("./emerald_trainers.json")).default;
    const trainers = rawTrainers.map(t => ({
      ...t,
      nameLowerCase:t.name.toLowerCase(),
      givenName:getGivenName(t.name)
    }));
    return {meta,trainerPokemons: pokemons,trainers,playerPokemons:null!};
  }
  if(game.includes("/battlefacilities/platinum")){
    const meta = (await import("./Platinum/meta.json")).default; //unused

    const trainerPokemons = (await import("./Platinum/trainer_pokemons.json")).default;
    renameAllIfNeeded(trainerPokemons);

    const rawTrainers = (await import("./Platinum/trainers.json")).default;
    const trainers = rawTrainers.map(t => ({
      ...t,
      nameLowerCase:t.name.toLowerCase(),
      set:0,
      startMsg:'',
      givenName:getGivenName(t.name)
    }));
    return {meta,trainerPokemons,trainers,playerPokemons:null!};
  }
  if(game === "/battletower/black2"){
    const meta = (await import("./black2_meta.json")).default;
    const pokemons = (await import("./black2_pokemons.json")).default;
    renameAllIfNeeded(pokemons);
    const rawTrainers = (await import("./black2_trainers.json")).default;
    const playerPokemons = (await import("./black2_playerPokemons.json")).default;
    const trainers = rawTrainers.map(t => ({
      ...t,
      nameLowerCase:t.name.toLowerCase(),
      givenName:getGivenName(t.name),
    }));
    return {meta,trainerPokemons: <any>pokemons,trainers,playerPokemons};
  }
  if(game === "/battletower/x"){
    const meta = (await import("./x_meta.json")).default;
    const pokemons = (await import("./x_pokemons.json")).default;
    renameAllIfNeeded(pokemons);
    const rawTrainers = <Trainer[]>(await import("./x_trainers.json")).default;
    const trainers = rawTrainers.map(t => ({
      ...t,
      nameLowerCase:t.name.toLowerCase(),
      givenName:getGivenName(t.name),
    }));
    const playerPokemons = (await import("./x_playerPokemons.json")).default;
    return {meta,trainerPokemons: <any>pokemons,trainers,playerPokemons};
  }
  return null!;
};