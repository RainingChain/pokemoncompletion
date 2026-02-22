import * as fs from "fs/promises";

export const readJson = async function(file){
  return JSON.parse(await fs.readFile(file,'utf8'));
};

export const func = async function(file, edit, save){
  let str = await fs.readFile(file,'utf8');
  str = str.split('\n').filter(a => a.trim()).join('\n');
  str = str.replace(/\n\n/,'\n');
  const json = JSON.parse(str);
  const lines = str.split('\n');
  const catStartId = lines.findIndex(line => line.trim().includes(`"categories":[`));
  if (catStartId === -1)
    return "catStartId === -1";

  const collCountByCat = json.categories.map((cat) => cat.list.length);

  let idxInCategory = 0;
  let currentCatIdx = -1;
  let catIsActive = false;
  for (let i = catStartId; i < lines.length; i++){
    let line = lines[i].trim();
    if (line.endsWith(`"list":[`)){
      currentCatIdx++;
      idxInCategory = 0;
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
    const newCollJson = edit(col, json.categories[currentCatIdx].id, idxInCategory);
    idxInCategory++;
    if(!newCollJson)
      continue;

    let newCollStr = JSON.stringify(newCollJson);
    if (endsWithComma)
      newCollStr += ',';
    lines[i] = '  ' + newCollStr;
  }

  if(save !== false)
    await fs.writeFile(file, lines.join('\n'));
};
