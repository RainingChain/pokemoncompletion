import * as fs from "fs/promises";

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

if(true){
setTimeout(async () => {
  await func(`C:\\rc\\rainingchain\\src\\hollowknight\\ssMap\\ssData.json`, (col, cat) => {
    col.pos = col.pos.map(a => a * 2);
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

//------------------------
/*dont touch below*/

const readJson = async function(file){
  return JSON.parse(await fs.readFile(file,'utf8'));
};

const func = async function(file, edit){
  let str = await fs.readFile(file,'utf8');
  str = str.replace(/\n\n/,'\n');
  const json = JSON.parse(str);
  const lines = str.split('\n');
  const catStartId = lines.findIndex(line => line.trim().includes(`"categories":[`));
  if (catStartId === -1)
    return "catStartId === -1";

  const collCountByCat = json.categories.map((cat) => cat.list.length);

  let currentCatIdx = -1;
  let catIsActive = false;
  for (let i = catStartId; i < lines.length; i++){
    let line = lines[i].trim();
    if (line.endsWith(`"list":[`)){
      currentCatIdx++;
      catIsActive = true;
      continue;
    }
    if(currentCatIdx === -1 || !catIsActive)
      continue;

    if (collCountByCat[currentCatIdx] === 0){
      catIsActive = false;
      continue;
    }
    collCountByCat[currentCatIdx]--;

    const endsWithComma = line.endsWith(',');
    if(endsWithComma)
      line = line.slice(0,-1);

    if(!line)
      continue;

    let col;
    try {
      col = JSON.parse(line);
    } catch(err){
      throw new Error('error at line:' + i + ' ; ' + line);
    }
    const newCollJson = edit(col, json.categories[currentCatIdx].id);
    if(!newCollJson)
      continue;

    let newCollStr = JSON.stringify(newCollJson);
    if (endsWithComma)
      newCollStr += ',';
    lines[i] = '  ' + newCollStr;
  }

  await fs.writeFile(file + '2', lines.join('\n'));
};
