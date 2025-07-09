
// let [exec, res] = Executor.debug_exec_wasm('search_easy --facility single --same_day_seed 0x4CB8E31 --diff_day_seed 0xcf835d7 --wins 49 --filter_min_rating 15 --max_diff_day_change 20 --max_same_day_adv 5')

// let [exec, res] = Executor.debug_exec_wasm('generate_one --same_day_seed 0x15BC6A14 --facility single --wins 0 --print_rng_frames_info false')
//let [exec,res] = Executor.debug_exec_wasm('find_seeds --facility double --wins 0 --diff_day_seed 0 --battled_pokemons Baltoy,Vulpix,Gible,Cyndaquil,Castform,Remoraid,Mudkip,Lombre,Larvitar,Shieldon,Croagunk,Onix,Loudred,Clefairy,Pidgeotto,Turtwig,Munchlax,Yanma,Ledian,Wailmer,Illumise,Murkrow,Aipom,Chatot,Cherrim,Kadabra,Marshtomp,Wormadam');

import wasm_path from "file-loader!./pk_platinum_battle_facilities_rng_manip_bg.wasm";
import worker_path from "file-loader!./worker.js";
import pk_platinum_battle_facilities_rng_manip_js_path from "file-loader!./pk_platinum_battle_facilities_rng_manip.js";


export interface WasmResult {
  team_seed:number,
  same_day_seed:number,
  same_day_seed_adv:number | null,
  diff_day_seed:number | null,
  diff_day_seed_adv:number | null,
  jtrainers:{
    trainerId:number,
    move_name:string|null,
    rtmons:{id:number,ability:number,rating:number|null}[]
  }[],
  rating:number,
  pmon_idx:number | null,
  pmon_desc:string,
  clock_date_changes:string[],
  facility:number,
  wins:number,
};

export interface WasmResponse {
  results:WasmResult[],
  errors:string[],
};

const combineResponse = function(raw:WasmResponse[]){
  const results = raw.map(r => r.results).flat();
  const errors = Array.from(new Set(raw.map(r => r.errors).flat()));
  return {results,errors};
}

export class Executor {
  constructor(){}
  static onprogress:Nullable<(cur:number,todo:number) => void> = null;

  // its very important to terminate Worker once they are completed, because if too many exists, its out of memory (~100 workers)
  static activeWorkers:ReturnType<Executor['execute_singlethread']>[] = [];
  static idleWorkers:Worker[] = [];

  static debug_exec_wasm(cmd:string){
    Executor.onprogress = function(cur, todo){
      let pct = (cur/todo*100).toFixed(0);
      console.log(`${cur}/${todo} (${pct}%)`);
    };

    return Executor.exec_wasm(cmd);
  };

  /** entry point */
  static async exec_wasm (cmd:string) : Promise<WasmResponse>{
    if (window.location.href.includes('localhost'))
      console.log(cmd);
    if (Executor.activeWorkers.length){
      Executor.terminateAll();
    }
    let exec = new Executor();
    const {verb,map} = exec.cmdToMap(cmd);
    if (verb === 'generate_one')
      return await exec.exec_generate_one_wasm(map);

    if (verb === 'search_easy')
      return exec.exec_search_nearby_wasm(map);

    if (verb === 'find_seeds')
      return exec.exec_find_day_seed_wasm(map);

    throw new Error('invalid verb: ' + verb);
  }
  static terminateAll(){
    this.activeWorkers.forEach(w => {
      w.clear();
      w.worker.terminate();
    });
    Executor.activeWorkers = [];
  }
  static cleanAllAfterCompletion(){
    this.activeWorkers.forEach(w => {
      w.clear();
      Executor.idleWorkers.push(w.worker);
    });
    Executor.activeWorkers = [];
  }
  async exec_generate_one_wasm(map:Map<string,string>) : Promise<WasmResponse>{
    const {worker,promise} = this.execute_singlethread('generate_one', [this.mapToOptsArgs(map)]);
    return <WasmResponse>await promise;
  }
  async exec_search_nearby_wasm(map:Map<string,string>){
    let max_diff_day_adv = this.get_max_diff_day_adv(map);

    const execInfos = this.split_for_multi_thread(map, 0, max_diff_day_adv);
    const packs = execInfos.map(execInfo => {
      return this.execute_singlethread('search_easy', execInfo);
    });
    Executor.activeWorkers = packs;
    const promises = packs.map(p => p.promise);
    const resultsRaw = <WasmResponse[]>await Promise.all(promises);
    const results = combineResponse(resultsRaw);
    results.results.sort((a,b) => {
      const rDiff =  b.rating - a.rating;
      if(rDiff !== 0)
        return rDiff;
      //want the least manip. 1 clock change == 3 same day adv
      let manipA = Math.ceil(a.diff_day_seed_adv! / 36524) * 3 + a.same_day_seed_adv!;
      let manipB = Math.ceil(b.diff_day_seed_adv! / 36524) * 3 + b.same_day_seed_adv!;
      return manipA - manipB;
    });
    Executor.cleanAllAfterCompletion();
    return results;
  }
  async exec_find_day_seed_wasm(map:Map<string,string>){
    const execInfos = this.split_for_multi_thread(map, 0, 2**32-1);
    const packs = execInfos.map(execInfo => {
      return this.execute_singlethread('find_seeds', execInfo);
    });
    Executor.activeWorkers = packs
    const promises = packs.map(p => p.promise);
    const resultsRaw = <WasmResponse[]>await Promise.all(promises);
    Executor.cleanAllAfterCompletion();
    return combineResponse(resultsRaw);
  }

  get_max_diff_day_adv(map:Map<string,string>){
    let max_diff_day_adv = map.get('--max_diff_day_adv');
    if (max_diff_day_adv !== undefined)
      return +max_diff_day_adv;

    let max_diff_day_change = map.get('--max_diff_day_change');
    if (max_diff_day_change !== undefined){
      const days_2000_to_2099 = 36524;
      const max_diff_day_change_max_value = 117593;
      return +max_diff_day_change > max_diff_day_change_max_value
        ? 4294967295 : +max_diff_day_change * days_2000_to_2099;
    }

    return 365240;
  }

  getOrCreateWorker = function(){
    if (Executor.idleWorkers.length)
      return Executor.idleWorkers.pop()!;

    const worker = new Worker(worker_path, { type: "module" });
    worker.onerror = function(err){
      console.log(err);
    };
    worker.postMessage({wasm_path,pk_platinum_battle_facilities_rng_manip_js_path});
    return worker;
  }
  execute_singlethread(verb:string, args:any[]){
    const worker = this.getOrCreateWorker();

    let abort:any = null;
    const promise = new Promise(resolve => {
      let oncomplete = (event:{data:any}) => {
        if (event.data.type === 'result')
          resolve(event.data.data);
        else if (event.data.type === 'progress' && Executor.onprogress)
          Executor.onprogress(event.data.data[0], event.data.data[1]);
      };
      worker.addEventListener("message", oncomplete);
      abort = function(){
        worker.removeEventListener('message', oncomplete);
      }
      worker.postMessage({verb,args});
      return worker;
    });
    return {worker, promise, clear: abort} as const;
  }

  split_for_multi_thread(map:Map<string,string>, start:number, end:number){
    let count = (end - start) + 1;

    let threads_to_use = Math.min(window.navigator.hardwareConcurrency, count);

    if (threads_to_use <= 1) {
      return [[
        this.mapToOptsArgs(map),
        start,
        end,
        threads_to_use,
        true,
      ]];
    }

    let res = [];
    for (let i = 0; i < threads_to_use; i++){
      res.push([
        this.mapToOptsArgs(map),
        start + i,
        end,
        threads_to_use,
        i === 0,
      ]);
    }
    return res;
  }
  mapToOptsArgs(map:Map<string,string>){
    let str:string[] = [];
    map.forEach((val,key) => {
      str.push(key,val)
    });
    return str.join(' ');
  }
  cmdToMap(cmd:string){
    const [verb, ...args] = cmd.split(' ').filter(a => a);
    let map = new Map();
    for(let i = 0 ; i < args.length - 1; i += 2){
      map.set(args[i], args[i + 1]);
    }
    return {verb, map};
  }

}

export class MyTests {
  async runAll(){
    await this.generate_one();
  }
  onprogress = function(cur:number,todo:number){
    let pct = (cur/todo*100).toFixed(0);
    console.log(`${cur}/${todo} (${pct}%)`);
  };
  async generate_one(){
    Executor.onprogress = this.onprogress;
    const res = await Executor.exec_wasm('generate_one --same_day_seed 0x15BC6A14 --facility single --wins 0 --print_rng_frames_info false');
    console.log(res);
    if(!res.results[0] || res.results[0].same_day_seed !== 364669460)
      throw new Error('MyTests::generate_one failed');
    console.log('MyTests::generate_one success!');
    return true;
  }
  async search_easy(){
    Executor.onprogress = this.onprogress;
    console.time('search_easy');
    const res = await Executor.exec_wasm('search_easy --facility single --same_day_seed 0x4CB8E31 --diff_day_seed 0xcf835d7 --wins 49 --filter_min_rating 10 --max_diff_day_change 1 --max_same_day_adv 1');
    console.timeEnd('search_easy');
    console.log(res);
    if(!res.results[0] || res.results[0].rating !== 16)
      throw new Error('MyTests::search_easy failed');
    console.log('MyTests::search_easy success!');
    return true;
  }
  async find_seeds(){ // 94s
    Executor.onprogress = this.onprogress;
    console.time('find_seeds');
    const res = await Executor.exec_wasm('find_seeds --facility double --wins 0 --battled_pokemons Baltoy,Vulpix,Gible,Cyndaquil,Castform,Remoraid,Mudkip,Lombre,Larvitar,Shieldon,Croagunk,Onix,Loudred,Clefairy,Pidgeotto,Turtwig,Munchlax,Yanma,Ledian,Wailmer,Illumise,Murkrow,Aipom,Chatot,Cherrim,Kadabra,Marshtomp,Wormadam');
    console.timeEnd('find_seeds');
    console.log(res);
    if(!res.results[0] || res.results[0].same_day_seed !== 1829313114)
      throw new Error('MyTests::find_seeds failed');
    console.log('MyTests::find_seeds success!');
    return true;
  }

}
(<any>window).my_tests = new MyTests();
//await window.my_tests.runAll();