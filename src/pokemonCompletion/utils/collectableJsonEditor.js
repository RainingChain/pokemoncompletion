import * as fs from "fs/promises";
import {readJson, func} from "./editJsonBase.js";

/* REQUIREMENTS for the .json file:
- must contain a line with "categories":[
- each category must contains a line ending with "list":[
- each collectable must be in a single line
*/
/*
setTimeout(async () => {
  await func(`C:\\Users\\Samuel\\source\\repos\\pokemoncompletion\\src\\pokemonCompletion\\data\\Shuffle.json`, (col, cat) => {
    if(cat === 'pokemon'){
      if(col.id !== "-1")
        return;

      const n = col.name.replace(/\W/g,'').toLowerCase();
      let idx = list.findIndex(el => el[1] === n);
      let id = idx === -1 ? -1 : list[idx][0];
      console.log(n, id, idx, list[idx]);
      delete col.id;
      return {id:"" + id, ...col};
    }
  });
}, 1);
*/

if(true){
setTimeout(async () => {
  const f = `C:\\Users\\Samuel\\source\\repos\\pokemoncompletion\\src\\pokemonCompletion\\data\\Emerald.json`;
  const json = await readJson(f);
  
  const convertPixelToWH = ( px, offset) => {
    const br = [-512,1024]
    const dim = json.interactiveMap.dim;
    const a = (px[0] - (offset ? 6 : 0)) / dim.h * br[0];
    const b = (px[1] - (offset ? 1 : 0)) / dim.w * br[1];
    return [
      +a.toFixed(2),
      +b.toFixed(2),
    ]
  }

  await func(f, (col, cat) => {
    if(!col.pos)
      return;

    if (typeof col.pos[0] === 'number')
      col.pos = [col.pos];;
    
    col.pos = col.pos.map(pos => convertPixelToWH(pos, true)); //.map(p => +p.toFixed(2)));
    return col;
  });

  json.interactiveMap.mapLinks.forEach(m => {
    console.log(JSON.stringify(m.map(m2 => convertPixelToWH(m2))) + ',');
  });

  json.locations.forEach(m => {
    if(m.pos)
      m.pos = convertPixelToWH(m.pos)
    console.log(JSON.stringify(m) + ',');
  });
}, 1);
}

if(false){
setTimeout(async () => {
  await func(`C:\\Users\\Samuel\\source\\repos\\pokemoncompletion\\src\\pokemonCompletion\\data\\Black2.json`, (col, cat) => {
    if(cat === 'item'){
      if(!col.id)
        col.iconUrl = `pokemon/p${col.id}.png`;
      return col;
    }

    /*const em = plat.categories.find(c => c.id === cat);
    if(!em)
      return null;

    const emel = em.list.find(a => a.name === col.name);
    if(emel && emel.iconUrl)
      col.iconUrl = emel.iconUrl;
    return col;*/
  });
}, 1);
}

if(false){
setTimeout(async () => {
  const json = JSON.parse(await fs.readFile(`C:\\rc\\rainingchain\\src\\hollowknight\\ssMap\\ssData.json`, 'utf8'));
  const nextUid = Math.max(...json.categories.map(cat => {
    return cat.list.map(col => col.uid);
  }).flat()) + 1;


  await func(`C:\\rc\\rainingchain\\src\\hollowknight\\ssMap\\ssData.json`, (col, cat) => {
    if(col.uid === undefined)
      col.uid = nextUid++;
    return col;
  });
}, 1);
}
const convertPos = (pos) => {
    return [
      +(pos[0] * 0.999817 - 257.881).toFixed(2),
      +(pos[1] * 0.999933 + 2.02076).toFixed(2),
    ];
};

if(false){
setTimeout(async () => {
  const json = JSON.parse(await fs.readFile(`C:\\rc\\rainingchain\\src\\hollowknight\\ssMap\\ssMap_data.json`, 'utf8'));
  json.interactiveMap.mapLinks.smallGaps = json.interactiveMap.mapLinks.smallGaps.map(pos => ([convertPos(pos[0]), convertPos(pos[1])]));
  json.interactiveMap.mapLinks.largeGapsConnectingOverVoid = json.interactiveMap.mapLinks.largeGapsConnectingOverVoid.map(pos => ([convertPos(pos[0]), convertPos(pos[1])]));
  json.interactiveMap.mapLinks.largeGapsConnectingOverMaps = json.interactiveMap.mapLinks.largeGapsConnectingOverMaps.map(pos => ([convertPos(pos[0]), convertPos(pos[1])]));

  json.locations.forEach(a => {
    a.pos = convertPos(a.pos);
  });

  await fs.writeFile(`C:\\rc\\rainingchain\\src\\hollowknight\\ssMap\\ssMap_data.json`, JSON.stringify(json));
}, 1);
}


if(false){
setTimeout(async () => {
  const json = JSON.parse(await fs.readFile(`C:\\rc\\rainingchain\\src\\hollowknight\\ssMap\\ssData.json`, 'utf8'));
  const permFlags = json.categories.find(cat => {
    return cat.id === 'permFlags';
  }).list;

  await func(`C:\\rc\\rainingchain\\src\\hollowknight\\ssMap\\ssData.json`, (col, cat) => {
    if (cat === 'permFlags'){
      const other = json.categories.some(cat => {
        if(cat.id === 'permFlags')
            return false;
        return cat.list.some(col2 => col2.pos.toString() == col.pos.toString());
      });
      if (other)
        return {};
      return null;
    }
    const perm = permFlags.find(p => p.pos.toString() === col.pos.toString());
    if (perm)
        col.flag = perm.flag;

    return col;
  });
}, 1);
}



if(false){
setTimeout(async () => {
  const pmdSky = await readJson(`C:\\Users\\Samuel\\source\\repos\\pokemoncompletion\\src\\pokemonCompletion\\data\\tmp\\skyItemFromDungeon.json`);
  await func(`C:\\Users\\Samuel\\source\\repos\\pokemoncompletion\\src\\pokemonCompletion\\data\\PmdSky.json`, (col, cat) => {
    if(cat === 'item'){
      const ov = pmdSky.find(a => a.name === col.name);
      if (ov){
        col.location = ov.location;
        return col;
      }
    }
    /*const em = eme.categories.find(c => c.id === cat);
    if(!em)
      return null;

    const emel = em.list.find(a => a.name === col.name);
    if(emel && emel.iconUrl)
      col.iconUrl = emel.iconUrl;
    return col;*/
  });
}, 1);
}


//add "pos" to .json
if(false){
setTimeout(async () => {
  const overwrite = JSON.parse(await fs.readFile(`C:\\Users\\Samuel\\source\\repos\\pokemoncompletion\\src\\pokemonCompletion\\data\\tmp\\Platinum_pos.json`,'utf8'));

  await func(`C:\\Users\\Samuel\\source\\repos\\pokemoncompletion\\src\\pokemonCompletion\\data\\Platinum.json`, (col, cat) => {

    const ovs = overwrite.filter(a => {
      return a.c === cat && a.pos && a.n === col.name;
    });
    if(!ovs.length)
      return null;

    ovs.forEach(ov => {
      col.pos = col.pos || [];
      if (!col.pos.some(a => a[0] === ov.pos[0] && a[1] === ov.pos[1]))
        col.pos.push(ov.pos);
    });
    return col;
  });
}, 1);
}
