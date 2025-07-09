/*
node C:\Users\Samuel\source\repos\pokemoncompletion\deploy_heroku.js
cd ../pokemoncompletion-heroku
git add .
git commit -m "."
git push heroku master
*/

import fs from "fs/promises";

const DONT_COPY = ['.git','node_modules'];

(async () => {c
    const files = await fs.readdir('./');

    await Promise.all(files.map(async file => {
        if (DONT_COPY.includes(file))
            return;
        await fs.cp('./' + file, '../pokemoncompletion-heroku/' + file, {recursive: true});
    }));

    await fs.cp('./deploy_heroku.gitignore', '../pokemoncompletion-heroku/.gitignore');
})();

