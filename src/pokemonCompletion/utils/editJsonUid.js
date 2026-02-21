
import {func, readJson} from "./editJsonBase.js";
import fs from "fs";

const root = `C:\\Users\\Samuel\\source\\repos\\pokemoncompletion\\src\\pokemonCompletion\\data`;

const fixUidToFile = async (f) => {
  const json = await readJson(f);
  const uids = json.categories.map(cat => {
    return cat.list.map(col => col.uid);
  }).flat().filter(a => a >= 0);

  const uniqueUids = new Set();
  uids.forEach(uid => {
    if (uniqueUids.has(uid))
      throw new Error('duplicate id ' + uid);
    uniqueUids.add(uid);
  });

  let nextUid = Math.max(...uids) + 1;

  if (nextUid < 0)
    nextUid = 0;

  await func(f, (col, cat,idx) => {
    if(col.uid === undefined)
      col.uid = nextUid++;

    return col;
  });
};

fs.readdir(root, async (err,files) => {
  files.forEach(f => {
    fixUidToFile(root + f);
  });
});
