import VersionCompatibility_Gen1_source from "./pokemonCompletion/research/VersionCompatibility_Gen1.md";
import VersionCompatibility_Gen2_source from "./pokemonCompletion/research/VersionCompatibility_Gen2.md";
import VersionCompatibility_Gen3_source from "./pokemonCompletion/research/VersionCompatibility_Gen3.md";
import VersionCompatibility_Gen4_source from "./pokemonCompletion/research/VersionCompatibility_Gen4.md";
import Platinum_ForeignEntries_source from "./pokemonCompletion/research/Platinum_ForeignEntries.md";
import Black2_ForeignEntries_source from "./pokemonCompletion/research/Black2_ForeignEntries.md";
import Black2_Shiny_source from "./pokemonCompletion/research/Black2_Shiny.md";
import pkStateEmulator_source from "./pokemonCompletion/research/pkStateEmulator.md";
import pokemonGlobalCss from "./pokemonArticles/home/pokemonGlobal.css?url";
import pkStateEmulatorCss from "./pokemonCompletion/research/pkStateEmulator.css?url";
import shuffle_intro_source from "./pokemonCompletion/ShuffleMod/shuffleMod-intro.md";
import shuffle_saveInstructions_source from "./pokemonCompletion/ShuffleMod/shuffleMod-save-instructions.md";
import shuffle_outro_source from "./pokemonCompletion/ShuffleMod/shuffleMod-outro.md";

import { App } from "./App";
import { renderMarkdown } from "./SimplePage/renderMarkdown";

import Battle_Institute_9999_Points_source from "./pokemonArticles/black2_battle_institute_9999_points.md";
import Battle_Institute_9999_Points_png from "./pokemonArticles/black2_battle_institute_9999_points.png";
import crystal_unobtainable_decorations_source from "./pokemonArticles/crystal_unobtainable_decorations.md";
import crystal_unobtainable_decorations_png from "./pokemonArticles/crystal_unobtainable_decorations.png";
import pinballRs_CompletePokedex_source from "./pokemonArticles/pinballRs_CompletePokedex.md";
import pinballRs_CompletePokedex_png from "./pokemonArticles/pinballRs_CompletePokedex.png";
import Black2_Subway_Rng_Manipulation_source from "./pokemonArticles/Black2_Subway_Rng_Manipulation.md";
import Platinum_Battle_Tower_RNG_Manipulation_source from "./pokemonArticles/Platinum_Battle_Tower_RNG_Manipulation.md";
import Emerald_Completion_Guide_source from "./pokemonArticles/Emerald_Completion_Guide.md";
import Emerald_BattlePyramid_Exploit_source from "./pokemonArticles/Emerald_BattlePyramid_Exploit.md";
import Emerald_Battle_Tower_RNG_Manipulation_source from "./pokemonArticles/Emerald_Battle_Tower_RNG_Manipulation.md";
import Emerald_Battle_Tower_RNG_Manipulation_png from "./pokemonBattleTower/pkRngAbuse/pkRngAbuse_img.png";
import CycleCountPerJmon from "./pokemonBattleTower/pkRngAbuse/lua/CycleCountPerJmon.lua";
import FrameCountPerElevatorFloor from "./pokemonBattleTower/pkRngAbuse/lua/FrameCountPerElevatorFloor.lua";
import CycleCountPerSection from "./pokemonBattleTower/pkRngAbuse/lua/CycleCountPerSection.lua";
import FrameCountByTrainer from "./pokemonBattleTower/pkRngAbuse/lua/FrameCountByTrainer.lua";
import GamePreservation_source from "./pokemonArticles/GamePreservation.md";
import legal_source from "./legal/legal.md";

import { PkBattleTowerServer } from "./pokemonBattleTower/pokemonBattleTower_server";

// Compile repository-authored Markdown once at server startup. Asset URLs still
// come from the bundler so images and downloadable scripts retain hashed names.
const Battle_Institute_9999_Points_html = renderMarkdown(Battle_Institute_9999_Points_source, { IMG: Battle_Institute_9999_Points_png });
const crystal_unobtainable_decorations_html = renderMarkdown(crystal_unobtainable_decorations_source, { IMG: crystal_unobtainable_decorations_png });
const pinballRs_CompletePokedex_html = renderMarkdown(pinballRs_CompletePokedex_source, { IMG: pinballRs_CompletePokedex_png });
const Black2_Subway_Rng_Manipulation_html = renderMarkdown(Black2_Subway_Rng_Manipulation_source);
const Platinum_Battle_Tower_RNG_Manipulation = renderMarkdown(Platinum_Battle_Tower_RNG_Manipulation_source);
const Emerald_Completion_Guide = renderMarkdown(Emerald_Completion_Guide_source);
const Emerald_BattlePyramid_Exploit_html = renderMarkdown(Emerald_BattlePyramid_Exploit_source);
const Emerald_Battle_Tower_RNG_Manipulation_html = renderMarkdown(Emerald_Battle_Tower_RNG_Manipulation_source, {
  SCRIPT1: CycleCountPerSection,
  SCRIPT2: CycleCountPerJmon,
  SCRIPT3: FrameCountByTrainer,
  SCRIPT4: FrameCountPerElevatorFloor,
  IMG: Emerald_Battle_Tower_RNG_Manipulation_png,
});
const GamePreservation = renderMarkdown(GamePreservation_source);
const legal = renderMarkdown(legal_source);

const VersionCompatibility_Gen1_html = renderMarkdown(VersionCompatibility_Gen1_source);
const VersionCompatibility_Gen2_html = renderMarkdown(VersionCompatibility_Gen2_source);
const VersionCompatibility_Gen3_html = renderMarkdown(VersionCompatibility_Gen3_source);
const VersionCompatibility_Gen4_html = renderMarkdown(VersionCompatibility_Gen4_source);
const Platinum_ForeignEntries_html = renderMarkdown(Platinum_ForeignEntries_source);
const Black2_ForeignEntries_html = renderMarkdown(Black2_ForeignEntries_source);
const Black2_Shiny_html = renderMarkdown(Black2_Shiny_source);
const pkStateEmulator_html = renderMarkdown(pkStateEmulator_source);
const shuffleContent = {
  intro: renderMarkdown(shuffle_intro_source),
  saveInstructions: renderMarkdown(shuffle_saveInstructions_source),
  outro: renderMarkdown(shuffle_outro_source),
};

export class App_httpPages {
  static async initHttpPages(app:App){    
    [
      {url:"/", title: `Pokémon Projects`, description: `Pokémon Projects: 100% Checklist, RNG, Tools and more!`},
      {url:"/completion", title: `Pokémon 100% Checklist`, description: `Pokémon 100% Checklist Challenge`},
      {url:"/articles", title: `Pokémon Articles`,description:'Pokémon articles about exploits, RNG manipulation, world records, trivia'},
      {url:"/VersionCompatibility", title: `Pokémon Version Compatibility`, description: `Pokémon compatibility between game versions and accessories`},
      {url:"/BattleFacilities", title: `Pokémon Battle Facilities` , description: `Pokémon Battle Facilities tools`},
    ].forEach(url => {
      app.get(url.url, (req,res) => {
        const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonArticles/home/pokemonHome.html');
        app.render2(res, filePath, {
          location:'pokemonHome',
          title:url.title,
          description:url.description,
        });
      });
    });

    PkBattleTowerServer.init(app);

    app.get("/BattleFacilities/Emerald/Assistant", (req,res) => {
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonBattleTower/pkAssistant/pkAssistant.html');
      app.render2(res, filePath, {
        location:'pokemonBattleTower',
        title:`Pokémon Emerald Battle Facilities Assistant`,
        description:`Pokémon Emerald Battle Facilities Assistant`,
      });
    });

    app.get("/BattleFacilities/Emerald/Assistant", (req,res) => {
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonBattleTower/pkAssistant/pkAssistant.html');
      app.render2(res, filePath, {
        location:'pokemonBattleTower',
        title:`Pokémon Emerald Battle Facilities Assistant`,
        description:`Pokémon Emerald Battle Facilities Assistant`,
      });
    });
    app.get("/BattleFacilities/Platinum/RngManipulation", (req,res) => {
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonBattleTower/pkPtRngAbuse/pkPtRngAbuse.html');
      app.render2(res, filePath, {
        location:'pokemonBattleTower',
        title:`Pokémon Platinum Battle Facilities RNG Manipulation Tool`,
        description:`Pokémon Platinum Battle Facilities RNG Manipulation Tool`,
      });
    });


    app.get("/BattleFacilities/Emerald/RngManipulation", (req,res) => {
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonBattleTower/pkRngAbuse/pkRngAbuse.html');
      app.render2(res, filePath, {
        location:'pokemonBattleTower',
        title:`Pokémon Emerald Battle Facilities RNG Manipulation Tool`,
        description:`Pokémon Emerald Battle Facilities RNG Manipulation Tool`,
      });
    });


    app.get('/VersionCompatibility/GenIV',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/research/VersionCompatibility_Gen4.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `Pokémon Gen IV - Version Compability`,
        description:`Version Compatibility for Pokémon Diamond, Pearl, Platinum, HeartGold, SoulSilver, Battle Revolution, PokéWalker, Ranch and more`,
      }, { content: VersionCompatibility_Gen4_html });
    });
    app.get('/VersionCompatibility/GenIII',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/research/VersionCompatibility_Gen3.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `Pokémon Gen III - Version Compability`,
        description:`Version Compatibility for Pokémon Ruby, Sapphire, Emerald, FireRed, LeafGreen, Colosseum, XD, e-Reader`,
      }, { content: VersionCompatibility_Gen3_html });
    });
    app.get('/VersionCompatibility/GenII',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/research/VersionCompatibility_Gen2.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `Pokémon Gen II - Version Compability`,
        description:`Version Compatibility for Pokémon Gold, Silver, Crystal, Pokémon Stadium 2`,
      }, { content: VersionCompatibility_Gen2_html });
    });
    app.get('/VersionCompatibility/GenI',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/research/VersionCompatibility_Gen1.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `Pokémon Gen I - Version Compability`,
        description:`Version Compatibility for Pokémon Green, Red, Blue, Yellow, Pokémon Stadium`,
      }, { content: VersionCompatibility_Gen1_html });
    });

    app.get('/completion/Platinum/ForeignPokedexEntries',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/research/Platinum_ForeignEntries.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `Pokémon Platinum - Foreign Pokédex Entries advices`,
        description:`Advices for obtaining all Platinum Foreign Pokédex entries`,
      }, { content: Platinum_ForeignEntries_html });
    });

    app.get('/completion/Black2/ForeignPokedexEntries',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/research/Black2_ForeignEntries.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `Pokémon Black 2 - Foreign Pokédex Entries advices`,
        description:`Advices for obtaining all Black 2 Foreign Pokédex entries`,
      }, { content: Black2_ForeignEntries_html });
    });

    app.get('/completion/Black2/Shiny',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/research/Black2_Shiny.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `Pokémon Black 2 - Shiny advices`,
        description:`Advices for obtaining all Black 2 shiny Pokémon`,
      }, { content: Black2_Shiny_html });
    });

    app.get('/completion/Shuffle/dlc',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/ShuffleMod/shuffleMod.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `Pokémon Shuffle - Special Stages DLC`,
        description:`Pokémon Shuffle DLC granting access to the Special stages.`,
      }, shuffleContent);
    });

    const pokemonsGameToName = function(name:string){
      const n = name.toLowerCase();
      if (!n)
        return null;
      
      if(["yellow",
        "crystal",
        "emerald",
        "platinum",
        "x",
        "pinball",
        "stadium",
        "shuffle",
        "ranger"].includes(n))
       return n.charAt(0).toUpperCase() + n.slice(1); // capitalize

      if(n === 'black2')
        return 'Black 2';
      if(n === 'ultrasun')
        return 'Ultra Sun';
      if(n === 'pinballrubysapphire')
        return 'Pinball Ruby & Sapphire';
      if(n === 'MysteryDungeonRescueTeam'.toLowerCase())
        return 'Mystery Dungeon: Red/Blue Rescue Team';
      if(n === 'MysteryDungeonExplorersOfSky'.toLowerCase())
        return 'Mystery Dungeon: Explorers of Sky';
      
      return null;
    };
    const pokemonsGameToHasMap = function(name:string){
      const n = name.toLowerCase();
      return ['yellow','crystal','emerald','platinum'].includes(n);
    }

    app.get('/completion/:game',function(req,res){
      const game = typeof req.params.game === 'string' ? req.params.game.slice(0, 50) : '';
      const name = pokemonsGameToName(game);
      if(name === null)
        return res.redirect('/completion');
      
      const hasMap = pokemonsGameToHasMap(game);
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/pokemonCompletion.html');
      const desc = `Pokémon ${name} ${hasMap ? 'Interactive Map & ' : ''}100% Checklist Challenge`
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: desc,
        description: desc,
      });
    });

    app.get('/completion/Emerald/Guide',function(req,res){
      const txt = Emerald_Completion_Guide;
      renderArticle(app, res, txt,'/completion/Emerald');
    });

    app.get('/articles/StateOfEmulation',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/research/pkStateEmulator.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `State of Emulation of Pokémon Games`,
        description:`State of Emulation of Pokémon Games`,
        extraCss:[pokemonGlobalCss, pkStateEmulatorCss],
      }, { content: pkStateEmulator_html });
    });

    app.get('/BattleTowerOhko/Black2',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonBattleTower/pkRngMonRating/pkRngMonRating.html');
      app.render2(res, filePath, {
        location:'pkRngMonRating',
        title:`Pokémon Black 2 Battle Subway Calculator`,
        description:`Pokémon Black 2 Battle Subway Calculator`,
      });
    });

    let renderArticle = function(app:App, res:any, txt:string, back='/articles', cssClass=''){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/SimplePage/SimplePage.html');
      app.render2(res, filePath,{},{
        content:`<a href="${back}" class="article-back">← Back</a><div class="markdown-content ${cssClass}">${txt}</div>`
      });
    };

    app.get('/legal', async function(req, res, next){
      const txt = legal;
      renderArticle(app, res, txt, '/articles', 'root-container legal');
    });
    app.get('/articles/Platinum_Battle_Tower_RNG_Manipulation', async function(req, res, next){
      const txt = Platinum_Battle_Tower_RNG_Manipulation;
      renderArticle(app, res, txt);
    });
    app.get('/articles/Black2_Battle_Institute_9999_Points', async function(req, res, next){
      const txt = Battle_Institute_9999_Points_html;
      renderArticle(app, res, txt);
    });
    app.get('/articles/GamePreservation', async function(req, res, next){
      const txt = GamePreservation;
      renderArticle(app, res, txt);
    });
    app.get('/articles/Crystal_Unobtainable_Decorations', async function(req, res, next){
      const txt = crystal_unobtainable_decorations_html;
      renderArticle(app, res, txt);
    });

    app.get('/articles/PinballRS_Complete_Pokedex', async function(req, res, next){
      const txt = pinballRs_CompletePokedex_html;
      renderArticle(app, res, txt);
    });

    //TODO: initial seed for volcarona streak
    app.get('/articles/Black2_Subway_Rng_Manipulation', async function(req, res, next){
      const txt = Black2_Subway_Rng_Manipulation_html;
      renderArticle(app, res, txt);
    });
    app.get('/articles/Emerald_BattlePyramid_Exploit', async function(req, res, next){
      const txt = Emerald_BattlePyramid_Exploit_html;
      renderArticle(app, res, txt);
    });


    app.get('/articles/Emerald_Battle_Tower_RNG_Manipulation', async function(req, res, next){
      const txt = Emerald_Battle_Tower_RNG_Manipulation_html;
      renderArticle(app, res, txt);
    });
    
    const DEV_CROPPED_MAPS = `C:\\rc\\misc\\TOOLS_UNCOMMON\\genericMapCropper\\dontBackup`
    if(!app.appConfig.ON_PRODUCTION_SERVER){
      app.get('/genericMap-image/:url', function(req, res){
        const url = req.params.url;
        res.sendFile(`${DEV_CROPPED_MAPS}\\cropped\\${url}`);
      });
    }
  }
}
