

import "../../common/css/common.css";
import "../../common/css/globalStyle.css";
import "../../pokemonArticles/home/pokemonGlobal.css";

import "../../pokemonCompletion/icons/pokemonCompletionIconSheet.css";

import "../../pokemonCompletion/pokemonCompletion.css"; //after pokemonCompletionIconSheet.css to overwrite img url

import "./pkAssistant.css";

import { Vue_nav } from "../../common/views/nav";
Vue_nav.createAndMount();

import { Vue_analytics } from "../../common/views/analytics";
Vue_analytics.createAndMount();

import * as Smogon from '@smogon/calc';
(<any>window).Smogon = Smogon;

import { GameData, JsonTrainerPokemon, Trainer, getData } from "../data/getData";
import withRender from "./pkAssistant.vue";
import "./../pkRngAbuse/Vue_pkRngAbuseResult";
import {Vue_pkRngAbuseResult_full} from "./../pkRngAbuse/Vue_pkRngAbuseResult";

import Vue from "vue";
import { io_Socket } from "../../wsBinary";
import { BinSON } from "../../BinSON";

import { MonStatus, RamPokemon } from "./RamPokemon";

import {VueRangeResult,VueResult} from "../pkRngAbuse/VueResult";
import guide1_img from "./img/guide1.png";
import guide2_img from "./img/guide2.png";
import guide3_img from "./img/guide3.png";

import mgba_battleTower_lua from "./mgba_battleTower.lua";
import CycleCountPerSection_lua from "../pkRngAbuse/lua/CycleCountPerSection.lua";
import {Gender,Facility,FacilityNum} from "../pkRngAbuse/Structs";
import "../pkRngAbuse/BattleTower/Vue_pkRngFrameInput";
import {Vue_pkRngFrameInput_full} from "../pkRngAbuse/BattleTower/Vue_pkRngFrameInput";
import {Vue_ramBattleState,Vue_playerPokemon_data,MsgFromMgba} from "./pkAssistant_data";
import {Vue_pkTmon_props} from "./Vue_pkTmon";
import {createMsgFromMgba} from "./pkAssistant_msgHandler";
import {PkAssitant_update} from "./pkAssistant_update";
import {PkAssistant_rng} from "./pkAssistant_rng";
import {Rng} from "../pkRngAbuse/Rng";
(<any>window).Rng = Rng;

/*
TODO:
  old message selection doesnt work

  factory must have a hook to know rental before swap

--------

  testing
    C:\Users\Samuel\Downloads\corsola_Issue.txt

    rng manip found teams but none is always displayed

    when mon name changes, reset gender/ability/moves etc.



retrurn/frustration
  check if double kick works

*/
const SETTINGS_VERSION = 2;

class Vue_pkAssistant_data {
  constructor(public gameData:GameData){
    this.GEN = <Smogon.GenerationNum>gameData.meta.gen;
  }
  $refs:{
    rngCalib_tower:Vue_pkRngFrameInput_full,
    rngCalib_arena:Vue_pkRngFrameInput_full,
    rngCalib_palace:Vue_pkRngFrameInput_full,
    rngCalib_factory:Vue_pkRngFrameInput_full,
    pkRngAbuseResult:Vue_pkRngAbuseResult_full
  };

  //input
  displayCredits = false;
  displayVisibleData = false;
  displayTrainerPokemons = true;
  displayRngManip = false;
  permitRngManip = false;
  hideRngManip = window.location.href.includes('hideRngManip=true');
  permitRngCheat = false;
  rngCheatDisplayOpponentTeam = false;
  displayGuide = true;
  displayBenchedPokemon = true;
  onlyDisplayRngPokemon = false;
  displayReportBug = false;
  previousTrainers = '';
  manuallyAddedPokemonInput = '';

  //
  GEN = <Smogon.GenerationNum>3;
  gameName = 'Emerald';
  mgbaId = new URLSearchParams(window.location.search).get('mgbaId') || ('' + RANDOM_NUM);
  lastServerMsg = '';

  field:Smogon.Field = null!;

  connected = false;
  playerMons:Vue_playerPokemon_data[] = [];
  playerMon:Vue_playerPokemon_data | null = null;
  trainerMons:Vue_pkTmon_props[] = [];
  trainerMonsByTmon:Vue_pkTmon_props[][] = [];
  playerHasLumBerry = false;

  lastMsg:MsgFromMgba | null = null;
  lastMsgHistory:{msgId:number,data:string}[] = [];
  importMsgId = 0;

  battleState = new Vue_ramBattleState();

  importExportDataTxt = '';
  importExportDataTxtErr = '';
  importExportSettingsDataTxt = '';
  importExportSettingsDataTxtErr = '';
  displayImportExport = false;
  luaHref = '';
  debug_breakOnMoveDmgCalc = ''; //movename
  hiddenUidsForDisplay:string[] = [];
  imgs = {
    guide1_img,
    guide2_img,
    guide3_img,
  };
  jtmonsFromRng:JsonTrainerPokemon[] = [];

  //rng
  rngAbuseRangeResult:VueRangeResult | null = null;
  rngAbuseRangeFilter = '';
  rngGenerationCount = 0;
  rngProgressMsg = '';
  rngCheatMsg = '';
  Facility = JSON.parse(JSON.stringify(Facility));
  FacilityNum = JSON.parse(JSON.stringify(FacilityNum));
  opponentTeamStr = '';
  rngRetryIfFail = false;
  onlyDisplayProbableRngPokemon = true;
}

const RANDOM_NUM = Math.floor(Math.random() * 1000000);

const enum MSG {
  fromMgba,
  fromServer,
}

type THIS = Vue_pkAssistant_data & Vue_pkAssistant_methods;

class Vue_pkAssistant_methods extends PkAssitant_update {
  onMessage = function(this:THIS, what:number, data:any, addToHistory=true){
    if(!this.connected){
      this.connected = true;
      this.displayGuide = false;
    }

    this.log('onMessage', what, data);

    if(what == MSG.fromServer){
      this.lastServerMsg = '' + data;
      return;
    } else if(what === MSG.fromMgba){
      const [err,msg] = createMsgFromMgba(this.gameData, data);
      if(err)
        this.lastServerMsg = err;
      if(msg){
        if(addToHistory){
          if(!this.lastMsgHistory.length)
            this.importMsgId = msg.msgId;
          if(!this.lastMsgHistory.find(m => m.msgId === msg.msgId))
            this.lastMsgHistory.push({msgId:msg.msgId,data:data});
        }
        this.onMsg_updateUi(msg);
      }
    } else
      this.log('invalid msg type',what);
  }
  log = function(...args:any[]){
    console['log'](...args);
  }
  init = async function(this:THIS){
    await this.updateLuaDownload();
    await this.loadSettingsFromLocalStorage();
  }
  updateLuaDownload = async function(this:THIS){
    const lua = await fetch(mgba_battleTower_lua);
    const lua2 = await fetch(CycleCountPerSection_lua);
    let text = (await lua.text()) + '\n\n' + (await lua2.text());
    text = text.replace('local SESSION_ID = tostring(math.random(10000000))', `local SESSION_ID = "${RANDOM_NUM}"`);
    text = text.replace('local IS_DEV = true', `local IS_DEV = false`);

    const blob = new Blob([text], {type: 'text/plain'});
    this.luaHref = URL.createObjectURL(blob);
  }
  connect = function(this:THIS){
    BinSON.init({
      bufferSize:10000,
      startOffset:1,
      logHandler:(...args:any[]) => {
        this.log(...args);
      },
    });


    let connectCount = 0;
    const connect_one = () => {
      const socket = new io_Socket(false, {
        errorHandler(err:Error){
          console.error(err);
        },
      },{
        encoder:BinSON,
        onConnection:() => {},
      });
      const base = window.location.origin.replace('http','ws');
      socket.setUrlOnClient(`${base}?handler=pkAssistant&mgbaId=${this.mgbaId}`);
      socket.setOnData((a,b) => this.onMessage(a,b));
      socket.setOnConnectionLost(() => { //overwritten when game starts
        connectCount++;
        if (connectCount > 5)
          return this.onMessage(MSG.fromServer, "Error: The connection with the server was lost.");

        this.onMessage(MSG.fromServer, "Error: The connection with the server was lost. Attempting to reconnect...");
        setTimeout(() => {
          connect_one(); //reconnect
        }, 1000);
      });
      (<any>window).debug_socket = socket;
    };
    connect_one();
  }
  onMsg_updateUi = async function(this:THIS,msg:MsgFromMgba){
    console['log']('onMsg_updateUi', msg);
    this.lastMsg = msg;
    this.log(msg);
    this.updateBattleState(this.battleState, msg);

    const field = this.createField(msg);
    const partyIdx = msg.playerMonPidsInOrder.indexOf(msg.playerMon.getPID());
    this.playerMon = this.createVpmon(msg.playerMon, partyIdx, field);
    const benchVpmons = msg.benchPlayerMons
                        .filter(m => !m.isDead())
                        .map((b,i) => {
                          const partyIdx = msg.playerMonPidsInOrder.indexOf(b.getPID());
                          return this.createVpmon(b, partyIdx, field);
                        });

    this.playerMons = [this.playerMon, ...benchVpmons];
    this.playerMons.sort((a,b) => a.partyIdx - b.partyIdx);
    this.trainerMons = this.getTrainerMons(msg, this.playerMons, this.gameData, this.jtmonsFromRng);

    this.trainerMons.forEach(tmon => {
      tmon.visible = !this.hiddenUidsForDisplay.includes(tmon.uidForDisplay);
    });

    this.playerHasLumBerry = this.playerMon.smon.hasItem('Lum Berry');
    this.field = this.createField(msg);

    this.updateMovesDmgText(this.trainerMons, this.gameData, this.field);
    this.trainerMons = this.fuseIdenticalVtmons(this.trainerMons);
    this.sortVtmons();

    this.previousTrainers = msg.trainersBattled.map(a => this.gameData.trainers[a]?.name).filter(a => a).join(', ');
    await this.updateRngAbuseRangeResult();
    if(this.permitRngManip)
      this.sortVtmons();
  }

  sortVtmons = function(this:THIS){
    let getScore = (vtmon:Vue_pkTmon_props) => {
      let s = 0;
      s += 1e7 * vtmon.vpmon.partyIdx;

      const prob = this.getVtmonProbNum(vtmon);
      if(prob){
        s += prob;
        s += -vtmon.partyIdxInRngParty;
      } else {
        if(!vtmon.displayedBecauseOfRng)
          s += 1e6;

        if(vtmon.itemDangerousColor)
          s += 1e5;
      }

      //not consistent for bench pokemon
      /*const [redCount,orangeCount,yellowCount] = ['red','orange','yellow'].map(color => {
        return vtmon.trainerMovesAgainstPlayer.filter(m => m.color === color).length;
      });
      s += 1e4 * redCount;
      s += 1e3 * orangeCount;
      s += 1e2 * yellowCount;*/
      return s;
    };
    this.trainerMons.sort((a,b) => {
      const diff = getScore(b) - getScore(a);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });

    this.trainerMonsByTmon = this.playerMons.map(pm => {
      return this.trainerMons.filter(tmon => tmon.vpmon.speciesId === pm.speciesId);
    });
    //transpose
    this.trainerMonsByTmon = this.trainerMonsByTmon[0].map((_, colIndex) => this.trainerMonsByTmon.map(row => row[colIndex]));

  }
  clearJtmonsFromRng = function(this:THIS){
    this.jtmonsFromRng = [];
    this.refresh();
  }
  getRefsRngCalib = function(this:THIS){
    if(!this.lastMsg)
      return null;
    if(this.lastMsg.facilityNum === FacilityNum.arena)
      return this.$refs.rngCalib_arena;
    if(this.lastMsg.facilityNum === FacilityNum.factory)
      return this.$refs.rngCalib_factory;
    if(this.lastMsg.facilityNum === FacilityNum.palace)
      return this.$refs.rngCalib_palace;
    if(this.lastMsg.facilityNum === FacilityNum.tower)
      return this.$refs.rngCalib_tower;
    return null;
  }
  updateRngAbuseRangeResult = async function(this:THIS,forceUpdate=false){
    if(!this.lastMsg)
      return;

    if(this.hideRngManip)
      return;

    if(!this.permitRngManip)
      return;

    const refsRngCalib = this.getRefsRngCalib();
    if(!refsRngCalib)
      return;

    const rng = new PkAssistant_rng(this.lastMsg, this.battleState, this.gameData, refsRngCalib, s => this.rngProgressMsg = s);
    const filterStr = rng.getFilter().toStr() + refsRngCalib.stateToStr();

    this.rngGenerationCount++;

    const rngGenerationCount = this.rngGenerationCount;
    if(!forceUpdate && this.rngAbuseRangeFilter === filterStr)
      return; // the result will be the same

    const printAll = !this.rngRetryIfFail;
    const rngAbuseRangeResult = await rng.generate(this.rngRetryIfFail, {
      printAll,
      mustCancel:() => {
        return this.rngGenerationCount !== rngGenerationCount;
      },
      calculateVblanksStr:this.$refs.pkRngAbuseResult.displayResultRngFrames,
    });
    if(rng.error)
      this.rngProgressMsg = rng.error;

    if (!rngAbuseRangeResult || rngGenerationCount !== this.rngGenerationCount)
      return; // another more recent execution was launched

    this.rngAbuseRangeResult = rngAbuseRangeResult;
    this.rngAbuseRangeFilter = filterStr;

    const teamFromLastMsg = this.lastMsg.allTrainerMons.map((trmon,i) => {
      const gender = trmon.getGender() === Gender.genderless ? '' : ' ' + (trmon.getGender() === Gender.male ? 'M' : 'F');
      const ab = trmon.getPossibleAbilityCount() === 1 ? '' : ' (' + trmon.getAbilityName() + ')';
      return trmon.getSpeciesName() + gender + ab + ' ' + trmon.getMoves().map(m => m.name).join(',');
    }).join('<br>');

    if(!rngAbuseRangeResult.teamResults.length){
      this.rngCheatMsg = '';
      this.opponentTeamStr = teamFromLastMsg;
    } else {
      const team = rng.getResultContainingIngameTeam(rngAbuseRangeResult);
      if(team && this.permitRngCheat && this.rngCheatDisplayOpponentTeam)
        team.highlight = true;
      this.rngCheatMsg = team ? '' : 'Error: The RNG manip tool found teams, but none of them match the actual team in-game.';
      this.opponentTeamStr = team ? team.allMonsDesc.replace(/\n/g,'<br>') : teamFromLastMsg;
    }
  }

  importData = function(this:THIS,data:string){
    try {
      if(!data.startsWith('data=')){
        this.importExportDataTxtErr = 'Error: The data format is invalid. It must start with data=';
        return;
      }
      this.onMessage(MSG.fromMgba, data.slice('data='.length), false);
    } catch(err){
      this.importExportDataTxtErr = 'Error: The data format is invalid.';
      console.error(err);
      return;
    }
  }
  importState = function(this:THIS, msgId:string){
    const msg = this.lastMsgHistory.find(m => m.msgId === +msgId);
    if(!msg){
      this.importExportDataTxtErr = 'Error: No message has the ID ' + msgId + '.';
      return;
    }
    this.onMessage(MSG.fromMgba, msg.data);
  }
  exportData = function(this:THIS){
    if(!this.lastMsg){
      this.importExportDataTxt = 'Error: No battle state to export.';
      return;
    }

    this.importExportDataTxt = 'data=' + this.lastMsg.rawMsgData;
  }
  //v.debug()
  debug = function(this:THIS){
    this.importData(`data=04SEP00000004SEP24A686DE550CE009BDC9CCCDC9C6BBFF00000202CCBDFFFFFFFFFF00C53C0000DBAACCD7710066D771AA66D7AFAAE8D7D12C67D7715566D74CAA95D7A4AA90D765BE69D27190D4F6122657D171AA66D70000000032FF890089003D007B0029003F007000SEP67F77EDB550CE009BDC2C3C8BDC2C9CFFF3E0202CCBDFFFFFFFFFF00CBF1000032C12CF35177AF5432FB9ED232049ED2CDFB9ED232FB9ED2E3FBBDD35FFBBAD226F194C698FB43D268999CD232049ED20000000032FF880088004C002C0049005E003E00SEP5A0CA018550CE009CEC9CEC9BEC3C6BFFF000202CCBDFFFFFFFFFF0083E10000AC002010680084111B14681E0F3AF2306C8C71170F004011910086117FCA41110FFF4011F0004011F00040110F0040110000000032FF8F008F0047004600310052003600SEP9277C062302D8510C6BBCEC3C9CDFF0330140202CCBDFFFFFFFFFF00D6C50000A213F77B1FE4BB5DA2DA44F23A5BC87205DB4772A2A54572F35B1072F95B1B72AD555178BE5A45965E5A4572A25A45720000000032FF9E009E005E005C009E00C8007E00SEPBDB2235583C0B586CDD1BBC7CABFCCCEFF000202CCBDFFFFFFFFFF0011C5000058F68ABFB27296D33E7296D323735ED3D9BD97D33E8D96D33E6213F2CF8D0DFE3EF297D30472AFD36772D2D3347D9CC70000000032FFB500B500A1007200510078006A00SEP966BA47F302D8510C7BFCEBBC1CCC9CDCDFF0202CCBDFFFFFFFFFF009F3600008AB821BBA646216FA646216F5146146EFF46B86FA94C2B6A36479B6FD634236FA6B9216FA64BA44E9DB19E57A6C6206F0000000032FF9F009F00CA00950075005E006D00SEP98015E005C009E00C8007E00510155005B015E00BDBEFE2F06060606060606061A100E000F0F140A9E0032FF9E008D00C6BBCEC3C9CDFF030B000000CCBDFFFFFFFFFFFFA78102009277C0620000000000000000302D8510SEPDE003D007B0029003F0070003D00F300D500F600638C31060606060606060606370B050014140F05890032FF89008E00BDC9CCCDC9C6BBFF0B000000CCBDFFFFFFFFFFFFA086010024A686DE0000000000000000550CE009SEP0020SEP02SEP02SEP00SEP0000SEP00SEP0000SEP0004SEP00160057000000340020FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFSEP`);
    this.rngRetryIfFail = false;
    this.updateRngAbuseRangeResult(true);
  }
  hideVtmon = function(this:THIS,vtmonClicked:Vue_pkTmon_props){
    if(vtmonClicked.displayedBecauseOfRng){
      this.jtmonsFromRng = this.jtmonsFromRng.filter(el => el.id !== vtmonClicked.battleTowerId);
      this.refresh();
      return;
    }
    this.trainerMons.forEach(vtmon => {
      if(vtmon.uidForDisplay === vtmonClicked.uidForDisplay)
        vtmon.visible = false;
    });
    this.hiddenUidsForDisplay.push(vtmonClicked.uidForDisplay);
  }
  isVtmonVisible = function(this:THIS, vtmon:Vue_pkTmon_props){
    if(!vtmon.visible)
      return false;
    if (!this.displayBenchedPokemon && !vtmon.vpmon.isActiveMon)
      return false;
    if (this.onlyDisplayRngPokemon && !this.jtmonsFromRng.find(jtmon => jtmon.id === vtmon.battleTowerId))
      return false;
    if(this.permitRngManip && this.rngAbuseRangeResult && this.onlyDisplayProbableRngPokemon &&
       this.rngAbuseRangeResult.teamResults.length && !this.rngAbuseRangeResult.probByMons.find(m => m.mon.id === vtmon.battleTowerId))
      return false;
    return true;
  }
  getVisibleVtmonCount = function(this:THIS){
    return this.trainerMons.filter(m => m.visible).length;
  }
  showAllVtmon = function(this:THIS){
    this.trainerMons.forEach(vtmon => { vtmon.visible = true; });
    this.hiddenUidsForDisplay = [];
  }
  onJmonClicked = function(this:THIS, jmons:JsonTrainerPokemon[]){
    const toAdd = jmons.filter(j => !this.jtmonsFromRng.includes(j));
    if(!toAdd.length)
      return;
    this.jtmonsFromRng.push(...toAdd);
    this.refresh();
  }
  refresh = function(this:THIS){
    if(this.lastMsg)
      this.onMsg_updateUi(this.lastMsg);
  }
  getVtmonProbStr = function(this:THIS, vtmon:Vue_pkTmon_props){
    if(!this.rngAbuseRangeResult)
      return '';
    if(!this.permitRngManip)
      return '';
    if(this.rngAbuseRangeResult.teamResults.length === 0)
      return '???%';
    const a = this.rngAbuseRangeResult.probByMons.find(p => p.mon.id === vtmon.battleTowerId);
    if(!a)
      return '';
    return a.pctStr;
  }
  getVtmonProbNum = function(this:THIS, vtmon:Vue_pkTmon_props){
    if(!this.rngAbuseRangeResult)
      return 0;
    if(!this.permitRngManip)
      return 0;
    const a = this.rngAbuseRangeResult.probByMons.find(p => p.mon.id === vtmon.battleTowerId);
    if(!a)
      return 0;
    return a.prob;
  }
  manuallyAddPokemon = function(this:THIS){
    const jmons = this.manuallyAddedPokemonInput.split(',').map(a => {
      const b = a.trim();
      return this.gameData.trainerPokemons.find(t => t.displayName === b)!;
    }).filter(a => a);
    if (jmons.length){
      this.onJmonClicked(jmons);
      this.manuallyAddedPokemonInput = '';
    }
  }

  exportSettingsData = function(this:THIS){
    this.importExportSettingsDataTxt = JSON.stringify(this.getSettingsDataToExport());
    return this.importExportSettingsDataTxt;
  }
  saveSettingsToLocalStorage = function(this:THIS){
    try {
      const jsonStr = this.exportSettingsData();
      localStorage.setItem('pkAssistant_input',jsonStr);
    } catch(err){}
  }
  loadSettingsFromLocalStorage = function(this:THIS){
    try {
      const jsonStr = localStorage.getItem('pkAssistant_input');
      if(!jsonStr)
        return;
      this.importSettingsData(jsonStr);
    } catch(err){}
  }
  getSettingsDataToExport = function(this:THIS){
    return {
      version:SETTINGS_VERSION,
      rngCalib_tower:this.$refs.rngCalib_tower.getDataToExport(),
      rngCalib_arena:this.$refs.rngCalib_arena.getDataToExport(),
      rngCalib_factory:this.$refs.rngCalib_factory.getDataToExport(),
      rngCalib_palace:this.$refs.rngCalib_palace.getDataToExport(),
      displayCredits:this.displayCredits,
      displayVisibleData:this.displayVisibleData,
      displayTrainerPokemons:this.displayTrainerPokemons,
      displayRngManip:this.displayRngManip,
      permitRngManip:this.permitRngManip,
      permitRngCheat:this.permitRngCheat,
      rngCheatDisplayOpponentTeam:this.rngCheatDisplayOpponentTeam,
      displayGuide:this.displayGuide,
      displayBenchedPokemon:this.displayBenchedPokemon,
      displayReportBug:this.displayReportBug,
      onlyDisplayProbableRngPokemon:this.onlyDisplayProbableRngPokemon,
    };
  }
  importSettingsData = function(this:THIS,str:string){
    this.importExportSettingsDataTxtErr = '';
    try {
      const json:Partial<ReturnType<Vue_pkAssistant_methods['getSettingsDataToExport']>> = JSON.parse(str);
      if (json.version !== SETTINGS_VERSION){
        this.importExportSettingsDataTxtErr = 'Error: The data format provided is no longer supported.';
        return;
      }
      if (typeof json.displayCredits === 'boolean')
        this.displayCredits = json.displayCredits;
      if (typeof json.displayVisibleData === 'boolean')
        this.displayVisibleData = json.displayVisibleData;
      if (typeof json.displayTrainerPokemons === 'boolean')
        this.displayTrainerPokemons = json.displayTrainerPokemons;
      if (typeof json.displayRngManip === 'boolean')
        this.displayRngManip = json.displayRngManip;
      if (typeof json.permitRngCheat === 'boolean')
        this.permitRngCheat = json.permitRngCheat;
      if (typeof json.permitRngManip === 'boolean')
        this.permitRngManip = json.permitRngManip;
      if (typeof json.rngCheatDisplayOpponentTeam === 'boolean')
        this.rngCheatDisplayOpponentTeam = json.rngCheatDisplayOpponentTeam;
      if (typeof json.displayGuide === 'boolean')
        this.displayGuide = json.displayGuide;
      if (typeof json.displayBenchedPokemon === 'boolean')
        this.displayBenchedPokemon = json.displayBenchedPokemon;
      if (typeof json.displayReportBug === 'boolean')
        this.displayReportBug = json.displayReportBug;
      if (typeof json.onlyDisplayProbableRngPokemon === 'boolean')
        this.onlyDisplayProbableRngPokemon = json.onlyDisplayProbableRngPokemon;

      if (json.rngCalib_tower)
        this.$refs.rngCalib_tower.importData(json.rngCalib_tower);
      if (json.rngCalib_arena)
        this.$refs.rngCalib_tower.importData(json.rngCalib_arena);
      if (json.rngCalib_palace)
        this.$refs.rngCalib_tower.importData(json.rngCalib_palace);
      if (json.rngCalib_factory)
        this.$refs.rngCalib_factory.importData(json.rngCalib_factory);
      this.updateRngAbuseRangeResult(true);
    } catch(err){
      this.importExportSettingsDataTxtErr = 'Error: Invalid format. ' + err.message;
    }
  }
}


document.addEventListener("DOMContentLoaded",async function(){
  const gameData = await getData(window.location.pathname);
  if(!gameData)
    return console.error('invalid pathname',window.location.pathname);

  const vue = {
    data:new Vue_pkAssistant_data(gameData),
    methods: new Vue_pkAssistant_methods(),
    watch:{
      displayCredits:function(this:THIS){ this.saveSettingsToLocalStorage()},
      displayVisibleData:function(this:THIS){ this.saveSettingsToLocalStorage()},
      displayTrainerPokemons:function(this:THIS){ this.saveSettingsToLocalStorage()},
      displayRngManip:function(this:THIS){ this.saveSettingsToLocalStorage()},
      permitRngManip:function(this:THIS){ this.saveSettingsToLocalStorage()},
      permitRngCheat:function(this:THIS){ this.saveSettingsToLocalStorage()},
      rngCheatDisplayOpponentTeam:function(this:THIS){ this.saveSettingsToLocalStorage()},
      displayGuide:function(this:THIS){ this.saveSettingsToLocalStorage()},
      displayBenchedPokemon:function(this:THIS){ this.saveSettingsToLocalStorage()},
      displayReportBug:function(this:THIS){ this.saveSettingsToLocalStorage()},
    }
  };

  const v = new Vue(withRender(vue));
  v.$mount('#pkAssistant-slot');

  (<any>window).RamPokemon = RamPokemon;
  (<any>window).BinSON = BinSON;
  (<any>window).v = v;

  Vue.nextTick(() => {
    v.init();
  });
});