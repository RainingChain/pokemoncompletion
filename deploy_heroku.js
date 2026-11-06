/*
To deply on production server:
    cd C:\Users\Samuel\source\repos\pokemoncompletion
    bun run compil-prod
    bun run test:e2e
    bun ./deploy_heroku.js
    cd ../pokemoncompletion-heroku
    bun i
    git add .
    git commit -m "."
    git push heroku master
    cd ../pokemoncompletion
    
*/

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DONT_COPY = ['.git','node_modules'];
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const deploymentRoot = path.resolve(projectRoot, '../pokemoncompletion-heroku');
const deploymentDist = path.join(deploymentRoot, 'dist');

(async () => {
    // Verify a build exists before removing the previous deployment output.
    await fs.access(path.join(projectRoot, 'dist', 'app.js'));
    if (path.dirname(deploymentDist) !== deploymentRoot || deploymentRoot === projectRoot)
        throw new Error('Invalid deployment output path');

    // Bun 1.4.4 on Windows rejects recursive removal through a relative ../ path.
    await fs.rm(deploymentDist, {recursive:true, force:true});
    const files = await fs.readdir(projectRoot);

    await Promise.all(files.map(async file => {
        if (DONT_COPY.includes(file))
            return;
        await fs.cp(path.join(projectRoot, file), path.join(deploymentRoot, file), {recursive: true});
    }));

    await fs.cp(path.join(projectRoot, 'deploy_heroku.gitignore'), path.join(deploymentRoot, '.gitignore'));
})();

