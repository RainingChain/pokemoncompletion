import { App } from "./App";

import Battle_Institute_9999_Points_raw from "./pokemonArticles/black2_battle_institute_9999_points.raw";
import Battle_Institute_9999_Points_png from "./pokemonArticles/black2_battle_institute_9999_points.png";
import crystal_unobtainable_decorations_raw from "./pokemonArticles/crystal_unobtainable_decorations.raw";
import crystal_unobtainable_decorations_png from "./pokemonArticles/crystal_unobtainable_decorations.png";
import pinballRs_CompletePokedex_raw from "./pokemonArticles/pinballRs_CompletePokedex.raw";
import pinballRs_CompletePokedex_png from "./pokemonArticles/pinballRs_CompletePokedex.png";
import Black2_Subway_Rng_Manipulation_raw from "./pokemonArticles/Black2_Subway_Rng_Manipulation.raw";
import Platinum_Battle_Tower_RNG_Manipulation from "./pokemonArticles/Platinum_Battle_Tower_RNG_Manipulation.raw";
import Emerald_RNG_Guide from "./pokemonArticles/Emerald_RNG_Guide.raw";
import Emerald_Completion_Guide from "./pokemonArticles/Emerald_Completion_Guide.raw";
import Emerald_BattlePyramid_Exploit_raw from "./pokemonArticles/Emerald_BattlePyramid_Exploit.raw";
import Emerald_Battle_Tower_RNG_Manipulation_raw from "./pokemonArticles/Emerald_Battle_Tower_RNG_Manipulation.raw";
import Emerald_Battle_Tower_RNG_Manipulation_png from "./pokemonBattleTower/pkRngAbuse/pkRngAbuse_img.png";
import CycleCountPerJmon from "./pokemonBattleTower/pkRngAbuse/lua/CycleCountPerJmon.lua";
import FrameCountPerElevatorFloor from "./pokemonBattleTower/pkRngAbuse/lua/FrameCountPerElevatorFloor.lua";
import CycleCountPerSection from "./pokemonBattleTower/pkRngAbuse/lua/CycleCountPerSection.lua";
import FrameCountByTrainer from "./pokemonBattleTower/pkRngAbuse/lua/FrameCountByTrainer.lua";
import GamePreservation from "./pokemonArticles/GamePreservation.raw";
import legal from "./legal/legal.raw";

import { PkBattleTowerServer } from "./pokemonBattleTower/pokemonBattleTower_server";

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
      });
    });
    app.get('/VersionCompatibility/GenIII',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/research/VersionCompatibility_Gen3.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `Pokémon Gen III - Version Compability`,
        description:`Version Compatibility for Pokémon Ruby, Sapphire, Emerald, FireRed, LeafGreen, Colosseum, XD, e-Reader`,
      });
    });
    app.get('/VersionCompatibility/GenII',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/research/VersionCompatibility_Gen2.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `Pokémon Gen II - Version Compability`,
        description:`Version Compatibility for Pokémon Gold, Silver, Crystal, Pokémon Stadium 2`,
      });
    });
    app.get('/VersionCompatibility/GenI',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/research/VersionCompatibility_Gen1.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `Pokémon Gen I - Version Compability`,
        description:`Version Compatibility for Pokémon Green, Red, Blue, Yellow, Pokémon Stadium`,
      });
    });

    app.get('/completion/Platinum/ForeignPokédexEntries',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/research/Platinum_ForeignEntries.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `Pokémon Platinum - Foreign Pokédex Entries advices`,
        description:`Advices for obtaining all Platinum Foreign Pokédex entries`,
      });
    });

    app.get('/completion/Shuffle/dlc',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/ShuffleMod/shuffleMod.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `Pokémon Shuffle - Special Stages DLC`,
        description:`Pokémon Shuffle DLC granting access to the Special stages.`,
      });
    });

    const pokemonsGameToName = function(name:string){
      const n = name.toLowerCase();
      if (!n)
        return '';
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
      return n.charAt(0).toUpperCase() + n.slice(1);
    };
    const pokemonsGameToHasMap = function(name:string){
      const n = name.toLowerCase();
      return ['yellow','crystal','emerald','platinum'].includes(n);
    }

    app.get('/completion/:game',function(req,res){
      const game = typeof req.params.game === 'string' ? req.params.game.slice(0, 50) : '';
      const name = pokemonsGameToName(game);
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

    app.get('/completion/Emerald/Guide/RNG',function(req,res){
      const txt = Emerald_RNG_Guide;
      renderArticle(app, res, txt,'/completion/Emerald/Guide');
    });

    app.get('/articles/StateOfEmulation',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonCompletion/research/pkStateEmulator.html');
      app.render2(res, filePath, {
        location:'pokemonCompletion',
        title: `State of Emulation of Pokémon Games`,
        description:`State of Emulation of Pokémon Games`,
      });
    });

    app.get('/BattleTowerOhko/Black2',function(req,res){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/pokemonBattleTower/pkRngMonRating/pkRngMonRating.html');
      app.render2(res, filePath, {
        location:'pkRngMonRating',
        title:`Pokémon Black 2 Battle Subway Calculator`,
        description:`Pokémon Black 2 Battle Subway Calculator`,
      });
    });

    let renderArticle = function(app:App, res:any, txt:string, back='/articles'){
      const filePath = app.appConfig.absolutePathFromCwd('/compiled/SimplePage/SimplePage.html');
      app.render2(res, filePath,{},{
        content:`<a href="${back}" style="position:relative;top:-8px">← Back</a><div style="padding-top:10px">${txt}</div>`
      });
    };

    app.get('/legal', async function(req, res, next){
      const txt = legal;
      renderArticle(app, res, txt);
    });
    app.get('/articles/Platinum_Battle_Tower_RNG_Manipulation', async function(req, res, next){
      const txt = Platinum_Battle_Tower_RNG_Manipulation;
      renderArticle(app, res, txt);
    });
    app.get('/articles/Black2_Battle_Institute_9999_Points', async function(req, res, next){
      const txt = Battle_Institute_9999_Points_raw.replace('{{IMG}}',Battle_Institute_9999_Points_png);
      renderArticle(app, res, txt);
    });
    app.get('/articles/GamePreservation', async function(req, res, next){
      const txt = GamePreservation;
      renderArticle(app, res, txt);
    });
    app.get('/articles/Crystal_Unobtainable_Decorations', async function(req, res, next){
      const txt = crystal_unobtainable_decorations_raw.replace('{{IMG}}',crystal_unobtainable_decorations_png);
      renderArticle(app, res, txt);
    });

    app.get('/articles/PinballRS_Complete_Pokedex', async function(req, res, next){
      const txt = pinballRs_CompletePokedex_raw.replace('{{IMG}}', pinballRs_CompletePokedex_png);
      renderArticle(app, res, txt);
    });

    //TODO: initial seed for volcarona streak
    app.get('/articles/Black2_Subway_Rng_Manipulation', async function(req, res, next){
      const txt = Black2_Subway_Rng_Manipulation_raw;
      renderArticle(app, res, txt);
    });
    app.get('/articles/Emerald_BattlePyramid_Exploit', async function(req, res, next){
      const txt = Emerald_BattlePyramid_Exploit_raw;
      renderArticle(app, res, txt);
    });


    app.get('/articles/Emerald_Battle_Tower_RNG_Manipulation', async function(req, res, next){
      const txt = Emerald_Battle_Tower_RNG_Manipulation_raw
                  .replace('{{SCRIPT1}}', CycleCountPerSection)
                  .replace('{{SCRIPT2}}', CycleCountPerJmon)
                  .replace('{{SCRIPT3}}', FrameCountByTrainer)
                  .replace('{{SCRIPT4}}', FrameCountPerElevatorFloor)
                  .replace('{{IMG}}', Emerald_Battle_Tower_RNG_Manipulation_png);
      renderArticle(app, res, txt);
    });
  }
}
