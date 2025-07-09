
import {MGBA_VERSION, MsgFromMgba} from "./pkAssistant_data";
import { MonStatus, RamPokemon } from "./RamPokemon";
import { GameData} from "../data/getData";

export const createMsgFromMgba = function(gameData:GameData,data:string){
    const msg = new MsgFromMgba();
    msg.rawMsgData = data;

    const els = data.split('SEP!');
    const rngInfoBase64 = els[els.length - 1];
    const [version, msgId, t1, t2, t3, p1, p2, p3, pbNum, tbNum, tid, activeB, bCount, weather, facility, lvlMode, battleMode, winStreak, trainersBattled, palaceOldManRngCall,factoryPastRentalCount,factoryPlayerJmons] = els.slice(0,-1).map(str => {
      let list:number[] = [];
      for(let i = 0; i < str.length; i += 2)
        list.push(+('0x' + str.slice(i, i + 2)));
      return list;
    });

    console['log']({version,msgId, t1, t2, t3, p1, p2, p3, pbNum, tbNum, tid, activeB, bCount, weather, facility, lvlMode, battleMode, winStreak, trainersBattled,palaceOldManRngCall,factoryPastRentalCount,factoryPlayerJmons,rngInfoBase64});

    console['log'](atob(rngInfoBase64));

    if (version[0] !== MGBA_VERSION){
      return [
        `Error: The .lua script running on the mGBA emulator is incompatible with this browser interface. Current .lua version: v${version[0]}. .lua version supported by the browser interface: v${MGBA_VERSION}. `,
        null
      ] as const;
    }

    const trainersParty = [t1, t2, t3].map(p => new Uint8Array(p));
    const playersParty = [p1, p2, p3].map(p => new Uint8Array(p));
    const [playerBattle,trainerBattle] = [pbNum, tbNum].map(p => new Uint8Array(p));

    let activePlayerParty = playersParty.find(p => {
      return RamPokemon.hasSamePID(p, playerBattle);
    });
    let benchPlayerParty = playersParty.filter(p => {
      return !RamPokemon.hasSamePID(p, playerBattle);
    });

    if (!activePlayerParty)
      return ['', null] as const;

    let activeTrainerParty = trainersParty.find(p => {
      return RamPokemon.hasSamePID(p, trainerBattle);
    });
    if (!activeTrainerParty)
      return ['Error: No party pokemon matches the active trainer battle pokemon.', null] as const;

    msg.playerMon = new RamPokemon(activePlayerParty, playerBattle);
    msg.trainerMon = new RamPokemon(activeTrainerParty, trainerBattle);
    if (msg.playerMon.isEmpty() || msg.trainerMon.isEmpty())
      return ['', null]  as const; //ignore msg

    msg.msgId = new Uint32Array(new Uint8Array(msgId.reverse()).buffer)[0];
    msg.trainerId = new Uint16Array(new Uint8Array(tid.reverse()).buffer)[0];
    msg.trainer = gameData.trainers[msg.trainerId] || gameData.trainers[0];
    msg.weather = weather[0];
    msg.lvlMode = lvlMode[0];
    msg.battleMode = battleMode[0];
    msg.facilityNum = facility[0];
    msg.winStreak = new Uint16Array(new Uint8Array(winStreak.reverse()).buffer)[0];

    msg.palaceOldManMsg = null;
    if (palaceOldManRngCall[0] !== 255)
      msg.palaceOldManMsg = palaceOldManRngCall[0];

    msg.trainersBattled = [];
    const chalNum = msg.winStreak % 7;
    for (let i = 0; i < chalNum; i++){
      const tid = new Uint8Array(trainersBattled.slice(i * 2, i * 2 + 2).reverse());
      msg.trainersBattled.push(new Uint16Array(tid.buffer)[0]);
    }

    msg.benchPlayerMons = benchPlayerParty.map(bytes => new RamPokemon(bytes, null));
    msg.allTrainerMons = trainersParty.map(bytes => new RamPokemon(bytes, null));
    msg.playerMonPidsInOrder = playersParty.map(p => RamPokemon.getPID(p));
    msg.rngVblanks = null;


    msg.factoryPastRentalCount = new Uint16Array(new Uint8Array(factoryPastRentalCount.reverse()).buffer)[0];
    msg.factoryPlayerJmons = [];
    for (let i = 0; i < 6; i++){
      const monId = new Uint8Array(factoryPlayerJmons.slice(i * 2, i * 2 + 2).reverse());
      msg.factoryPlayerJmons.push(new Uint16Array(monId.buffer)[0]);
      if (msg.factoryPlayerJmons.every(m => m === 0))
        msg.factoryPlayerJmons = [];
    }


    if(msg.allTrainerMons.every(m => m.isDead()))
      return ['', null] as const; //ignore msg

    return [null, msg]  as const;
  }