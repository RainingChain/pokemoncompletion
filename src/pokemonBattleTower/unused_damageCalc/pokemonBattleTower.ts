
import Vue from "vue";

import "../common/css/common.css";
import "../common/css/globalStyle.css";
import "./pokemonBattleTower.css";

import withRenderPokemon from "./pokemon.vue";
import withRender from "./pokemonBattleTower.vue";
import withRenderSelfPokemon from "./selfPokemon.vue";

import { Vue_nav } from "../../common/views/nav";
Vue_nav.createAndMount();

import { Vue_analytics } from "../../common/views/analytics";
Vue_analytics.createAndMount();

import * as Smogon from '@smogon/calc';
import { Move, Pokemon, Result, calculate } from '@smogon/calc';
(<any>window).Smogon = Smogon;

import { JsonTrainerPokemon, Trainer, getData } from "../data/getData";

const DEBUG = window.location.href.includes('localhost');
const RED = '#FFAAAA';
const GREEN = '#AAFFAA'

const deepCloneify = function<T>(f:T){
  //(<any>f).clone = function(){ return Vue_pokemonBattleTower_methods.deepClone(this); };
  return f;
};

// from typescript\lib\lib.es5.d.ts
type Awaited<T> =
    T extends null | undefined ? T : // special case for `null | undefined` when not in `--strictNullChecks` mode
        T extends object & { then(onfulfilled: infer F, ...args: infer _): any } ? // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
            F extends ((value: infer V, ...args: infer _) => any) ? // if the argument to `then` is callable, extracts the first argument
                Awaited<V> : // recursively unwrap the value
                never : // the argument to `then` was not callable
        T; // non-object or non-thenable

const gameDataPromise = getData(window.location.pathname);
let gameData:Awaited<typeof gameDataPromise> = null!;
let GEN:Smogon.GenerationNum;

class Vue_selfPokemon_data {
  constructor(pk:Pokemon){
    this.name = pk.name;
    this.itemName = pk.item || '';
    this.moves = pk.moves;
    const s = pk.stats;
    this.statDesc = `SPE:${s.spe}, HP: ${s.hp}, ATK: ${s.atk}, DEF: ${s.def}, SPA: ${s.spa}, SPD: ${s.spd}`;
    this.nature = pk.nature;
  }
  name = '';
  itemName = '';
  moves:string[] = [];
  statDesc = '';
  nature = '';
}

class Vue_pokemon_data {
  constructor(raw:JsonTrainerPokemon){
    this.pk = deepCloneify(new Pokemon(GEN, raw.species,{
      ivs:{hp:31,atk:31,def:31,spa:31,spd:31,spe:31},
      nature:raw.nature,
      level:50,
      evs:(<any>raw).evs,
      item: raw.item,
      moves: raw.moves,
    }));

    this.pkMoves = raw.moves.map(m => deepCloneify(new Move(GEN, m, {isCrit:true})));
    this.nameLowerCase = this.pk.name.toLowerCase();
    this.trainers = gameData.trainers.filter(t => {
      return t.pokemons.includes(raw.id);
    });
    this.trainersSet = Array.from(new Set(this.trainers.map(t => t.set))).sort();
    const s = this.pk.stats;
    this.statDesc = `SPE:${s.spe}, HP: ${s.hp}, ATK: ${s.atk}, DEF: ${s.def}, SPA: ${s.spa}, SPD: ${s.spd}`;
    this.battleTowerId = raw.id;
    this.name = this.pk.name;
    this.nature = this.pk.nature;
    this.itemName = raw.item;
    this.itemDangerous = gameData.meta.dangerousItems.includes(raw.item);
    const rawMoves = [...raw.moves,'','','',''].slice(0,4); //ensure size 4...
    this.moves = rawMoves.map((mId,i) => {
      const pkMove = this.pkMoves[i];
      let color = '';
      if (gameData.meta.ohkoMoves.includes(mId))
        color = 'rgba(255, 69, 69, 0.3)';
      else if (gameData.meta.semiDangerousMoves.includes(mId))
        color = 'rgba(255, 69, 30, 0.3)';
      else if (pkMove && pkMove.priority > 0 && pkMove.bp > 60)
        color = 'rgba(255, 69, 0, 0.3)';
      return {name:mId, color};
    });
    const selkfPkCount = gameData.playerPokemons!.pokemons.length;
    for(let i = 0; i < selkfPkCount; i++)
      this.dmgsToYou.push({value:'',rawDmg:0,color:'',tooltip:''});
    for(let i = 0; i < selkfPkCount; i++)
      this.dmgsFromYou.push({value:'',rawDmg:0,color:'',tooltip:''});
    for(let i = 0; i < selkfPkCount; i++)
      this.outSpds.push({value:false});
  }
  name = '';
  flags = [{color:'#FFFFFF',value:''},{color:'#DDDDFF',value:''},{color:'#FFDDDD',value:''}];
  dmgsToYou:{value:string,rawDmg:number,color:string,tooltip:string}[] = []; //must be size 3 otherwise table is screwed
  dmgsFromYou:{value:string,rawDmg:number,color:string,tooltip:string}[] = []; //must be size 1 otherwise table is screwed
  itemName = '';
  itemDangerous = false;
  moves:{name:string,color:string}[] = [];  //must be size 4 otherwise table is screwed
  comment = '';
  outSpds:{value:boolean}[] = [];
  statDesc = '';
  battleTowerId = 0;

  nature = '';
  nameLowerCase = '';
  pk:Pokemon;
  pkMoves:Move[] = [];
  trainers:Trainer[];
  trainersSet:number[] = [];
  isVisible = true;
}

class Vue_pokemonBattleTower_data {
  constructor(){
    this.gameName = gameData.meta.gameName;
    this.trainerPks = gameData.trainerPokemons.map(p => new Vue_pokemon_data(<any>p)); //BAD
    this.trainerPks.sort((a,b) => {
      return a.pk.name < b.pk.name ? -1 : 1;
    });

    this.initSelfPks();
  }
  gameName = '';
  trainerPks:Vue_pokemon_data[] = [];
  trainerFilter = '';
  pokemonFilter = '';
  only29WinsTrainers = false;

  selfPksUseTrickRoom = false;

  selfPks:Pokemon[] = [];
  selfPksMoves:Move[][] = [];


  vue_selfPks:Vue_selfPokemon_data[] = [];

  initSelfPks(){
    const pks = gameData.playerPokemons!.pokemons.map(p => {
      return deepCloneify(new Pokemon(GEN, p.name, p.options));
    });

    this.selfPks = pks;
    this.selfPksMoves = pks.map(pk => {
      return pk.moves.map(mId => deepCloneify(new Move(GEN, mId)));
    });

    this.selfPksUseTrickRoom = this.selfPksMoves.some(moves => moves.some(move => move.name === 'Trick Room'));

    this.vue_selfPks = this.selfPks.map(pk => new Vue_selfPokemon_data(pk));
  }
}

type THIS = Vue_pokemonBattleTower_data & Vue_pokemonBattleTower_methods;
class Vue_pokemonBattleTower_methods {
  onFilterChanged(this:THIS,isTrainer:boolean,event:KeyboardEvent){
    if(event.key !== 'Enter' || !event.target)
      return;
    const input = (<any>event.target).value.toLowerCase() || '';
    if(isTrainer)
      this.trainerFilter = input;
    else
      this.pokemonFilter = input;
    this.updateVisibility();
  }
  updateVisibility(this: THIS){
    this.trainerPks.forEach(pk => {
      pk.isVisible = this.shouldPokemonBeVisible(pk);
    });
  }
  shouldPokemonBeVisible(this:THIS,pk:Vue_pokemon_data){
    if(this.pokemonFilter){
      if(!pk.nameLowerCase.startsWith(this.pokemonFilter.toLowerCase()))
        return false;
    }
    if (this.trainerFilter){
      if(!pk.trainers.some(t => {
        if(!t.nameLowerCase.includes(this.trainerFilter.toLowerCase()))
          return false;
        if(!this.only29WinsTrainers)
          return true;
        return t.set >= 5;
      }))
        return false;
    }
    return true;
  }
  updateData(this: THIS){
    this.trainerPks.forEach(pk => {
      if(DEBUG && !pk.isVisible)
        return
      this.updateData_one(pk);
    });
  }
  updateOutspd(this: THIS){
    const getSpd = function(pk:Pokemon){
      const mult = pk.item === 'Choice Scarf' ? 1.5 : 1;
      return Math.floor(pk.stats.spe) * mult;
    }
    this.trainerPks.forEach(pk => {
      pk.outSpds.forEach((v,i) => {
        if(this.selfPksUseTrickRoom)
          v.value = getSpd(this.selfPks[i]) >= getSpd(pk.pk);
        else
          v.value = getSpd(this.selfPks[i]) <= getSpd(pk.pk);
      });
    });
  }
  updateData_one(this: THIS, trainerPk:Vue_pokemon_data){
    const getDmgInfo = function(res:Result,highestDmg:boolean,pk:Pokemon) : [number,number] {
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
      const pct = dmg / pk.maxHP(true) * 100;
      if(highestDmg)
        return [dmg,Math.ceil(pct)];
      return [dmg,Math.floor(pct)];
    };

    const field = new Smogon.Field({gameType:<any>gameData.playerPokemons!.gameType});

    this.selfPks.forEach((selfPk,i) => {
      //find the move that deals most dmg to trainerPk
      const dmgByMove = trainerPk.pkMoves.map(m => {
        if(m.bp === 0)
          return null!;
        const res = calculate(GEN, trainerPk.pk, selfPk, m, field);
        const [dmg,dmgPct] = getDmgInfo(res, true, selfPk);
        return {name:m.name, dmg, dmgPct};
      }).filter(info => info && info.dmg);

      dmgByMove.sort((a,b) => b.dmg - a.dmg);

      const dmgsToYou = trainerPk.dmgsToYou[i];

      dmgsToYou.tooltip = dmgByMove.map(info => `${info.name}: ${info.dmg} (${info.dmgPct}%)`).join(', ');

      const maxDmgPct = dmgByMove.length ? Math.max(...dmgByMove.map(info => info.dmgPct)) : 0;
      dmgsToYou.value = '' + maxDmgPct;

      dmgsToYou.rawDmg = dmgByMove.length ? Math.max(...dmgByMove.map(info => info.dmg)) : 0;

      let c = '';
      if(maxDmgPct >= 100)
        c = RED;
      else if(maxDmgPct < 50) //aka cant break sub without crit
        c = GREEN;
      dmgsToYou.color = c;
    });

    //find the move that deals most dmg to selfPk
    this.selfPksMoves.forEach((moves,i) => {
      const selfPk = this.selfPks[i];
      const dmgByMove = moves.map(m => {
        if(m.bp === 0)
          return null!;
        const res = calculate(GEN, selfPk, trainerPk.pk, m);
        const [dmg, dmgPct] = getDmgInfo(res, false, trainerPk.pk);
        return {name:m.name, dmg, dmgPct};
      }).filter(info => info && info.dmg);
      dmgByMove.sort((a,b) => b.dmg - a.dmg);

      const dmgsFromYou = trainerPk.dmgsFromYou[i];
      dmgsFromYou.tooltip = dmgByMove.map(info => `${info.name}: ${info.dmg} (${info.dmgPct}%)`).join(', ');

      const dmgPct = dmgByMove.length ? Math.max(...dmgByMove.map(info => info.dmgPct)) : 0;

      dmgsFromYou.value = '' + dmgPct;
      dmgsFromYou.rawDmg = dmgByMove.length ? Math.max(...dmgByMove.map(info => info.dmgPct)) : 0;

      let c = '';
      if(dmgPct < 25) //cant kill ohko even at +6 atk
        c = RED;
      dmgsFromYou.color = c;
    });
  }
  debug_isDangerous(this: THIS,pk:Vue_pokemon_data){
    if(pk.dmgsToYou[0].color === RED)
      return true;
    if(pk.dmgsFromYou[0].color === RED)
      return true;
    if(pk.moves.some(m => m.color))
      return true;
    if(pk.outSpds[0].value)
      return true;
    return false;
  }
  debug_hideNonDangerous(this: THIS){
    this.trainerPks.forEach(pk => {
      if(!this.debug_isDangerous(pk))
        pk.isVisible = false;
    });
  }
  getCountTrainerPkCanThatOhko(this: THIS){
    return this.trainerPks.filter(pk => {
      return pk.dmgsToYou[0].color === RED;
    }).length;
  }
  getCountTrainerPkCanThatOhkoAndFaster(this: THIS){
    return this.trainerPks.filter(pk => {
      return pk.dmgsToYou[0].color === RED && pk.outSpds[0].value;
    }).length;
  }
  getDangerousCount(this:THIS){
    return this.trainerPks.filter(pk => {
      return this.debug_isDangerous(pk);
    }).length;
  }
  debug_info(this: THIS){
    return [
      this.getDangerousCount(),
      this.getCountTrainerPkCanThatOhko(),
      this.getCountTrainerPkCanThatOhkoAndFaster(),
    ];
  }
  /*
  v.hideExcept(pk => pk.outSpds[2].value)
  v.hideExcept(pk => +pk.dmgToYou[0].value >= 100)
  */
  hideExcept(this:THIS, func:any){
    let c = 0;
    this.trainerPks.forEach(pk => {
      pk.isVisible = func(pk);
      if(pk.isVisible)
        c++;
    });
    return c;
  }
  static deepClone<T> (objRaw:T, recursionLvl=0):T {
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
          temp[i] = Vue_pokemonBattleTower_methods.deepClone(obj[i], recursionLvl + 1);
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
        temp[key] = Vue_pokemonBattleTower_methods.deepClone(obj[key], recursionLvl + 1);
    }
    return temp;
  }
}

document.addEventListener("DOMContentLoaded",async function(){
  gameData = await gameDataPromise;
  if(!gameData)
    return;
  GEN = <any>gameData.meta.gen;

  Vue.component('pokemon-one', withRenderPokemon({
    data:function(this:any) {
      if(this.self && this.self.self)  //BAD
        delete this.self.self;
      return this.self;
    },
    props:['self'],
  }));

  Vue.component('selfPokemon-one', withRenderSelfPokemon({
    data:function(this:any) {
      if(this.self && this.self.self)  //BAD
        delete this.self.self;
      return this.self;
    },
    props:['self'],
  }));

  const vue = {
    data:new Vue_pokemonBattleTower_data(),
    methods: new Vue_pokemonBattleTower_methods(),
  }

  const v = new Vue(withRender(vue));
  v.updateOutspd();
  v.updateVisibility();
  v.updateData();
  if(DEBUG)
    v.debug_hideNonDangerous();
  (<any>window).v = v;
  v.$mount('#pokemonBattleTower-slot');
});