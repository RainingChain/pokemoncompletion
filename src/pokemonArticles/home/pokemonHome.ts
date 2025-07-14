
import Vue from "vue";

import "../../common/css/common.css";
import "../../common/css/globalStyle.css";

import "./pokemonGlobal.css";
import "../../pokemonCompletion/icons/pokemonCompletionIconSheet.css";

import "./pokemonHome.css"; //after pokemonCompletionIconSheet.css to overwrite img url

import withRender from "./pokemonHome.vue";
import withRenderLink from "./link.vue";

import { Vue_nav } from "../../common/views/nav";
Vue_nav.createAndMount();

import { Vue_analytics } from "../../common/views/analytics";
Vue_analytics.createAndMount();

document.addEventListener("DOMContentLoaded",async function(){
  Vue.component('pokemon-link',withRenderLink({
    props:['klass','href','name','desc'],
  }));

  const loc = (window.location.pathname.split('/')[1] || 'home').toLowerCase();
  const v = new Vue(withRender({data:{
    loc,

    completionMain:[
      {klass:'pokemon-p25',href:'/completion/Yellow',name:'Pokémon Yellow'},
      {klass:'pokemon-p245',href:'/completion/Crystal',name:'Pokémon Crystal'},
      {klass:'pokemon-p384',href:'/completion/Emerald',name:'Pokémon Emerald'},
      {klass:'pokemon-p487',href:'/completion/Platinum',name:'Pokémon Platinum'},
      {klass:'pokemon-p644',href:'/completion/Black2',name:'Pokémon Black 2',desc:'(WIP)'},
      {klass:'pokemon-p716',href:'/completion/X',name:'Pokémon X',desc:'(WIP)'},
      {klass:'pokemon-p192',href:'/completion/UltraSun',name:'Pokémon Ultra Sun',desc:'(WIP)'},
    ],
    completionSide:[
      {klass:'pokemon-p25',href:'/completion/Pinball',name:'Pokémon Pinball'},
      {klass:'pokemon-p6',href:'/completion/Stadium',name:'Pokémon Stadium'},
      {klass:'pokemon-p255',href:'/completion/PinballRubySapphire',name:'Pokémon Pinball Ruby & Sapphire'},
      {klass:'pokemon-p4',href:'/completion/MysteryDungeonRescueTeam',name:'Pokémon Mystery Dungeon: Red/Blue Rescue Team'},
      {klass:'pokemon-p441',href:'/completion/MysteryDungeonExplorersOfSky',name:'Pokémon Mystery Dungeon: Explorers of Sky',desc:'(WIP)'},
      {klass:'pokemon-p311',href:'/completion/Ranger',name:'Pokémon Ranger'},
      {klass:'pokemon-p25',href:'/completion/Shuffle',name:'Pokémon Shuffle'},

    ],

    versionCompatibility:[
      {klass:'pokemon-p25',href:'/VersionCompatibility/GenI',name:'Generation I'},
      {klass:'pokemon-p245',href:'/VersionCompatibility/GenII',name:'Generation II'},
      {klass:'pokemon-p384',href:'/VersionCompatibility/GenIII',name:'Generation III'},
      {klass:'pokemon-p487',href:'/VersionCompatibility/GenIV',name:'Generation IV',desc:'(WIP)'},
    ],

    articles:[
      {klass:'pokemon-p137',href:'/articles/StateOfEmulation',name:'State of Emulation'},
      {klass:'pokemon-p138',href:'/articles/GamePreservation',name:'Game Preservation'},
      {klass:'pokemon-p72',href:'/articles/Crystal_Unobtainable_Decorations',name:'Crystal: Unobtainable Decorations'},
      {klass:'pokemon-p384',href:'/completion/Emerald/Guide',name:'Emerald: 100% Completion Guide'},
      {klass:'pokemon-p260',href:'/completion/Emerald/Guide/RNG',name:'Emerald: Catch Pokémon RNG Manipulation for 100% Completion'},
      {klass:'pokemon-p381',href:'/articles/Emerald_Battle_Tower_RNG_Manipulation',name:'Emerald: Battle Tower RNG Manipulation Technical'},
      {klass:'pokemon-p212',href:'/articles/Emerald_BattlePyramid_Exploit',name:'Emerald: Battle Pyramid Exploit for Unlimited Sacred Ashes'},
      {klass:'pokemon-p158',href:'/articles/PinballRS_Complete_Pokedex',name:'Pinball R&S: Complete Pokédex'},

      {klass:'pokemon-p392',href:'/articles/Platinum_Battle_Tower_RNG_Manipulation',name:'Platinum: Battle Tower RNG Manipulation Technical'},
      {klass:'pokemon-p637',href:'/articles/Black2_Subway_Rng_Manipulation',name:'Black 2: Subway RNG Manipulation'},
      {klass:'pokemon-p357',href:'/articles/Black2_Battle_Institute_9999_Points',name:'Black 2: Battle Institute 9999 Points'},
    ],

    battleFacilities:[
      {klass:'pokemon-p381',href:'/BattleFacilities/Emerald/Assistant',name:'Emerald Battle Facilities Assistant'},
      {klass:'pokemon-p384',href:'/BattleFacilities/Emerald/RngManipulation',name:'Emerald Battle Facilities RNG Manipulation'},
      {klass:'pokemon-p392',href:'/BattleFacilities/Platinum/RngManipulation',name:'Platinum Battle Facilities RNG Manipulation'},
    ],

    projects:{
      completion:{klass:'pokemon-p213',href:'/completion',name:'Pokémon 100% Checklist:',desc:'Collect everything possible in a specific Pokémon game'},
      battleFacilities:{klass:'pokemon-p381',href:'/BattleFacilities',name:'Pokémon Battle Facilities:',desc:'Guides and RNG manipulation tools for Battle Facilities'},
      versionCompatibility:{klass:'pokemon-p251',href:'/VersionCompatibility',name:'Pokémon Version Compatibility:',desc:'Compatibility between Pokémon game versions, accessories, and consoles'},
      articles:{klass:'pokemon-p235',href:'/articles',name:'Pokémon Articles:',desc:'Various exploits, RNG manipulation, world records, trivia'},
    }
  }}));
  v.$mount('#slot');
});