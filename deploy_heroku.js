/*
To deply on production server:
    cd C:\Users\Samuel\source\repos\pokemoncompletion
    bun run compil-prod
    bun ./deploy_heroku.js
    cd ../pokemoncompletion-heroku
    git add .
    git commit -m "."
    git push heroku master
    cd ../pokemoncompletion
    
*/

import fs from "fs/promises";

const DONT_COPY = ['.git','node_modules'];

(async () => {
    await fs.rm('../pokemoncompletion-heroku/dist', {recursive:true, force:true});
    const files = await fs.readdir('./');

    await Promise.all(files.map(async file => {
        if (DONT_COPY.includes(file))
            return;
        await fs.cp('./' + file, '../pokemoncompletion-heroku/' + file, {recursive: true});
    }));

    // Remove npm lockfiles left over from previous deployments.
    await Promise.all(['package-lock.json', 'src/package-lock.json'].map(file =>
        fs.rm('../pokemoncompletion-heroku/' + file, {force: true})
    ));

    await fs.cp('./deploy_heroku.gitignore', '../pokemoncompletion-heroku/.gitignore');
})();

