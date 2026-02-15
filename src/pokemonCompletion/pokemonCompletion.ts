
import Vue from "vue";

import "../common/css/common.css";
import "../common/css/globalStyle.css";
import "../pokemonArticles/home/pokemonGlobal.css";

import "./icons/pokemonCompletionIconSheet.css";

import "./pokemonCompletion.css"; //after pokemonCompletionIconSheet.css to overwrite img url

import withRender from "./pokemonCompletion.vue";

import { Vue_nav } from "../common/views/nav";
Vue_nav.createAndMount();

import { Vue_analytics } from "../common/views/analytics";
Vue_analytics.createAndMount();

import { Category, Collectable, Conflict, Formula, FormulaContext, GameData, Location, Missable, ObtainType, Ware, WareGroup, getGameDataInput } from "./pokemonCompletion_data";
//v.categories[2].list.sort((a,b) => a.name < b.name ? -1 : 1)

import { PkInteractiveMap } from "./map/pokemonMap";
import { Vue_pkCompletionist } from "./pkCompletionist";
import { Vue_pokemonCompletion_req_methods } from "./pokemonCompletion_req";

export type Vue_pokemonCompletion_full = GameData & Vue_pokemonCompletion_methods;

export const callableOncePerCycle = function(toCall:(this:Vue_pokemonCompletion_full, arg?:any) => void){
  let map:Map<any, any> = new Map();

  return function(this:Vue_pokemonCompletion_full, arg?:any){
    const timer = map.get(arg);
    if(timer)
      return;
    const tim = setTimeout(() => {
      toCall.call(this, arg);
      map.delete(arg);
    },1);
    map.set(arg, tim);
  };
}

class Vue_pokemonCompletion_methods extends Vue_pokemonCompletion_req_methods {
  onCreate = function(this:Vue_pokemonCompletion_full){
    this.loadSettingsFromLocalStorage();
    this.updateObtainedFromStorageForAll();
    this.refreshBackupsFromLocalStorage();

    this.onOwnedWaresChanged(); //update everything
    this.createBackup();
  }

  onOwnedWaresChanged = function(this:Vue_pokemonCompletion_full){
    this.updateReqsAndObtainableStatus();
    this.saveSettingsToLocalStorage();
    this.updatePkCompletionist();
    this.updateAllObtainedCounts(); //because of untrackable
  }

  updatePkCompletionist = function(this:Vue_pokemonCompletion_full){
    if(!Vue_pkCompletionist.instance)
      return;

    //kinda bad, update even if emulator not selected, but w/e
    const ctx = this.createFormulaContext();
    Vue_pkCompletionist.instance.permitEvents = this.evaluateFormula(new Formula([['$EventTool']]), ctx);
    Vue_pkCompletionist.instance.permitOptionalEvents = this.evaluateFormula(new Formula([['$EventTool_Optional']]), ctx);
    Vue_pkCompletionist.instance.permitJapanOnlyEvents = this.evaluateFormula(new Formula([['$EventTool_JP']]), ctx);
  }
  onOwnedWareGroupChanged = function(this:Vue_pokemonCompletion_full,grp:WareGroup, w2:Ware|null=null){
    if (w2 && w2.ownedCount === 0)
      w2.owned = false;

    grp.wares.forEach(w => {
      w.owned = grp.wares[0].owned;
      if(w.owned && w.ownedCount === 0)
        w.ownedCount = 1;
    });

    //sync with other ware of same id (ex: LinkCable)
    this.getWares().forEach(ware => {
      if(ware.id !== grp.wares[0].id)
        return;

      ware.owned = grp.wares[0].owned;
      ware.ownedCount = grp.wares[0].ownedCount;
    });
    this.onOwnedWaresChanged();
  }


  isObtainableOrFirstGroup = function(this:Vue_pokemonCompletion_full,c:Collectable){
    if(c.obtainable === ObtainType.obtainable)
      return true;
    if(c.obtainable === ObtainType.unresolvedConflict){
      const cat = this.categoriesMap.get(c.categoryId);
      if(cat)
        return cat.firstInConflictGroup.includes(this.name);
    }
    return false;
  }

  supportsWareAndRequirements  = function(this:Vue_pokemonCompletion_full){
    return this.requirements.length > 0;
  }

  getConflictPokemonStatus = function(this:Vue_pokemonCompletion_full, cflt:Conflict){
    //we assume cflt is active (caller responsibility)

    const cat = this.categoriesMap.get(cflt.categoryId);
    if(!cat)
      throw new Error('invalid cat: ' + cflt.categoryId);

    const cols = new Set<Collectable>();

    cflt.list.forEach(list => {
      list.forEach(el => {
        const col = cat.listByNameMap.get(el);
        if(!col)
          return;
        cols.add(col);
      });
    });

    //check if the player already has choosen how he wanted to solve conflict
    const obtainedCountByCflt = cflt.list.map(c2 => {
      const count = c2.reduce((v,name) => {
        const el = cat.listByNameMap.get(name);
        return v + ((el && el.obtained) ? 1 : 0);
      }, 0);
      return {list:c2, count};
    });

    const maxVal = Math.max(...obtainedCountByCflt.map(c => c.count));
    const stillPossible = obtainedCountByCflt.filter(c2 => {
      return c2.count >= maxVal;
    }).map(c => c.list);

    //ex: [[Bul,Char,Squirtle], [Bul,Char,Pikachu], [Raichu]].
    //if Char = 1, then stillPossible = {0,1}. Bul is in both, so Bul is obtainable for sure
    //Raichu is in none of the stillPossible. so Raichu is unobtainable.
    const statusMap = new Map<Collectable, boolean | null>();
    cols.forEach(col => {
      const pkIsInAllPossible = stillPossible.every(c2 => {
        return c2.includes(col.name);
      });
      if(pkIsInAllPossible)
        return statusMap.set(col, true);


      const pkIsInNone = stillPossible.every(c2 => {
        return !c2.includes(col.name);
      });
      if (pkIsInNone)
        return statusMap.set(col, false);

      statusMap.set(col, null); //status is still unknown. ex: not sure if Squirtle or Pikachu.
    });

    return statusMap;
  }
  getConflictsPokemonStatus = function(this:Vue_pokemonCompletion_full, cflts:Conflict[]){
    const maps = cflts.map(c => this.getConflictPokemonStatus(c));
    const allCollectables = new Set<Collectable>();
    maps.forEach(m => {
      m.forEach((s,c) => {
        allCollectables.add(c);
      });
    });

    const statusMap = new Map<Collectable, boolean | null>();
    allCollectables.forEach(col => {
      const status = (() => {
        const someHave = maps.some(map => map.get(col) === true);
        if(someHave)
          return true;

        const someMaybe = maps.some(map => map.get(col) === null);
        if(someMaybe)
          return null;

        // they all are false or undefined
        return false;
      })();
      statusMap.set(col, status);
    });

    return statusMap;
  }
  getVisibleUnobtainableCount = function(this:Vue_pokemonCompletion_full,cat:Category){
    let totalCount = cat.unobtainableCount;
    if(this.ignoreStrictlyUnobtainable)
      totalCount -= cat.strictlyUnobtainableCount;
    return totalCount;
  }

  selectMandatoryReqsForFullCompletion = function(this:Vue_pokemonCompletion_full,permitDiscontinued:boolean){
    this.updateWareOwnedStatus(w => {
      if(!permitDiscontinued && w.discontinued)
        return w.minCount;
      return w.mandatoryForFullCompletion;
    });
  }
  clearAllWares = function(this:Vue_pokemonCompletion_full){
    this.updateWareOwnedStatus(w => w.minCount);
  }
  selectAllWares = function(this:Vue_pokemonCompletion_full){
    this.updateWareOwnedStatus(w => w.maxCount);
  }
  selectAllWaresNotDiscontinued = function(this:Vue_pokemonCompletion_full){
    this.updateWareOwnedStatus(w => {
      if(w.discontinued)
        return w.minCount;
      return w.maxCount;
    });
  }

  //-----------------------------------------
  //obtained for whole category
  updateObtainedFromStorageForAll = function(this:Vue_pokemonCompletion_full){
    this.categories.forEach(cat => {
      this.updateObtainedStatusFromStr(cat, this.getObtainedFromStorage(cat));
    });
  }
  isLivingDex = function(this:Vue_pokemonCompletion_full){
    return this.objectiveStr === '1';
  }
  getCompletionType = function(this:Vue_pokemonCompletion_full){
    const compType = +this.objectiveStr;
    if (isNaN(compType))
      return 0;
    if (!this.pkCompletionist || !this.pkCompletionist.completionTypes.find(compTypeObj => compTypeObj.value === compType))
      return 0;
    return compType;
  }
  getObtainedFromStorage = function(this:Vue_pokemonCompletion_full,cat:Category) : string {
    try {
      return localStorage.getItem('pokemonCompletion-' + cat.game + '-' + cat.id) || '';
    } catch(err){
      return '';
    }
  }
  updateObtainedStatusFromStr = function(this:Vue_pokemonCompletion_full,cat:Category,str:string){
    cat.obtainedCount = 0;
    const obtained = new Set(str.split(','));
    cat.list.forEach(p => {
      p.setObtained(obtained.has(p.id));
    });
    this.updateObtainedLocalStorageAndTextArea(cat);
    this.updateAllObtainedCounts();
    this.updateVisibleCount();
  }
  updateObtainedLocalStorageAndTextArea = callableOncePerCycle(function(this:Vue_pokemonCompletion_full,cat:Category){
    try {
      const str = cat.list.filter(p => p.obtained).map(p => p.id).join(',');
      cat.textareaObtained = str;
      localStorage.setItem('pokemonCompletion-' + cat.game + '-' + cat.id, str);
    } catch(err){
      console.error(err);
    }
  });

  updateAllObtainedCounts = callableOncePerCycle(function(this:Vue_pokemonCompletion_full,){
    this.totalObtainedCount = 0;
    this.categories.forEach(c => {
      c.obtainedCount = 0;
      c.list.forEach(p => {
        if(this.hideUntrackable && !p.trackable)
          return;
        if(p.obtained)
          c.obtainedCount++;
      });

      this.totalObtainedCount += c.obtainedCount;
    });
    this.locations.forEach(loc => {
      this.updateObtainedCountForLoc(loc);
    });
  });

  updateObtainedCountForLoc = function(this:Vue_pokemonCompletion_full,loc:Location){
    loc.obtainedCount = 0;
    loc.list.forEach(c => {
      if(this.hideUntrackable && !c.trackable)
        return;
      if(c.obtained)
        loc.obtainedCount++;
    });
  }

  generateObtainedJson = function(this:Vue_pokemonCompletion_full){
    const json:any = {};
    this.categories.forEach(c => {
      json[c.id] = c.textareaObtained;
    });
    return json;
  }
  saveAllObtained = function(this:Vue_pokemonCompletion_full){
    this.textareaAllObtained = JSON.stringify(this.generateObtainedJson());
  }

  onCollectableObtainedStatusChange = function(this:Vue_pokemonCompletion_full,p:Collectable){
    const cat = this.categoriesMap.get(p.categoryId);
    if(!cat)
      return;

    p.onChange.forEach(f => f());
    this.updateObtainedLocalStorageAndTextArea(cat);
    this.updateAllObtainedCounts();

    let ctx:FormulaContext | null = null;
    let getCtx = () => {
      if(!ctx)
        ctx = this.createFormulaContext();
      return ctx!;
    };

    if(p.missable)
      this.updateMissableVisibility(p.missable, getCtx());

    p.conflicts?.forEach(cflt => this.updateConflictVisibility(cflt, getCtx()));

    if(!this.collectableWithVariableObtainability.includes(p))
      return;

    this.updateObtainableStatus(getCtx());
  }

  loadAllObtained = function(this:Vue_pokemonCompletion_full,){
    try {
      const json = JSON.parse(this.textareaAllObtained);
      this.createBackup();
      for(const i in json){
        const col = this.categories.find(c => c.id === i);
        if(!col)
          continue;
        this.updateObtainedStatusFromStr(col,json[i]);
      }
    } catch(err){
      alert("Error:" + err?.message);
    }
  }


  //display/settings
  generateSettings = function(this:Vue_pokemonCompletion_full){
    const ownedWares:string[] = [];
    this.waresByType.forEach(ws => {
      ws.wares.forEach(w => {
        if(w.owned)
          ownedWares.push(`${ws.type}@${w.id}@${w.ownedCount}`);
      });
    });
    return {
      ignoreStrictlyUnobtainable:this.ignoreStrictlyUnobtainable,
      hideObtained:this.hideObtained,
      compactView:this.compactView,
      displayedElementsSetting:this.displayedElementsSetting,
      displayPlayingWith:this.displayPlayingWith,
      displayCompletion:this.displayCompletion,
      displayViewSettings:this.displayViewSettings,
      displayInteractiveMap:this.displayInteractiveMap,
      displayImportExport:this.displayImportExport,
      displayCredits:this.displayCredits,
      showAllWares:this.showAllWares,
      playingWith:this.playingWith,
      view:this.view,
      ownedWares,
      objectiveStr:this.objectiveStr,
      hideUntrackable:this.hideUntrackable,
      displayAdditionalTasks:this.displayAdditionalTasks,
    };
  }
  onViewSettingsChanged = function(this:Vue_pokemonCompletion_full){
    this.updateVisibleCount();
    this.saveSettingsToLocalStorage();
    this.updateInteractiveMapIconsVisibility();
  }
  saveSettingsToLocalStorage = function(this:Vue_pokemonCompletion_full){
    try {
      const settings = this.generateSettings();
      localStorage.setItem('pokemonCompletion-' + this.name + '-websiteSettings', JSON.stringify(settings));
    } catch(err){}
  }
  loadSettingsFromLocalStorage = function(this:Vue_pokemonCompletion_full){
    try {
      const str = localStorage.getItem('pokemonCompletion-' + this.name + '-websiteSettings');
      if(!str)
        return;
      const settings = <ReturnType<Vue_pokemonCompletion_methods['generateSettings']>>JSON.parse(str);

      if (typeof settings.hideObtained === 'boolean')
        this.hideObtained = settings.hideObtained;

      if (typeof settings.compactView === 'boolean')
        this.compactView = settings.compactView;

      if (typeof settings.displayedElementsSetting === 'string')
        this.displayedElementsSetting = settings.displayedElementsSetting;

      if (typeof settings.ignoreStrictlyUnobtainable === 'boolean')
        this.ignoreStrictlyUnobtainable = settings.ignoreStrictlyUnobtainable;

      if (typeof settings.showAllWares === 'boolean')
        this.showAllWares = settings.showAllWares;

      if (typeof settings.displayPlayingWith === 'boolean')
        this.displayPlayingWith = settings.displayPlayingWith;

      if (typeof settings.displayCompletion === 'boolean')
        this.displayCompletion = settings.displayCompletion;

      if (typeof settings.displayImportExport === 'boolean')
        this.displayImportExport = settings.displayImportExport;

      if (typeof settings.displayViewSettings === 'boolean')
        this.displayViewSettings = settings.displayViewSettings;

      if (typeof settings.displayInteractiveMap === 'boolean')
        this.displayInteractiveMap = settings.displayInteractiveMap;

      if (typeof settings.displayCredits === 'boolean')
        this.displayCredits = settings.displayCredits;

      if (typeof settings.displayAdditionalTasks === 'boolean')
        this.displayAdditionalTasks = settings.displayAdditionalTasks;

      if (typeof settings.playingWith === 'string')
        this.playingWith = settings.playingWith;

      if (typeof settings.view === 'string')
        this.view = settings.view;

      if (typeof settings.objectiveStr === 'string')
        this.objectiveStr = settings.objectiveStr;

      if (typeof settings.hideUntrackable === 'boolean')
        this.hideUntrackable = settings.hideUntrackable;

      if(Array.isArray(settings.ownedWares)){
        const list = new Map<string,number>();
        settings.ownedWares.forEach(o => {
          if(typeof o !== 'string')
            return;
          const arr = o.split('@');
          if(arr.length !== 3 || arr[2].match(/^d+$/))
            return;
          list.set(`${arr[0]}@${arr[1]}`, +arr[2]);
        });

        this.waresByType.forEach(ws => {
          ws.wares.forEach(w => {
            let c = list.get(`${ws.type}@${w.id}`) ?? 0;
            if(c < w.minCount)
              c = w.minCount;
            if(c > w.maxCount)
              c = w.maxCount;
            w.owned = c > 0;
            w.ownedCount = c;
          });
        });
      }
      if(!this.playingWith)
        this.playingWith = this.waresByType[0]?.type || '';
    } catch(err){}
  }
  getBackgroundColor = function(this:Vue_pokemonCompletion_full, c:Collectable){
    const obt = c.obtainable;
    if(obt === ObtainType.strictlyUnobtainable)
      return 'rgba(255,0,0,0.3)';
    if(obt === ObtainType.unobtainableConflit || obt == ObtainType.unobtainableReqs || obt === ObtainType.notObtainableUnknownReason)
      return 'rgba(255,0,0,0.2)';
    if(obt === ObtainType.obtainable)
      return 'rgba(0,255,0,0.2)';
    if(obt === ObtainType.unresolvedConflict)
      return 'rgba(255,255,0,0.2)';
    return '';
  }
  getObtainableText = function(this:Vue_pokemonCompletion_full, c:Collectable){
    const obt = c.obtainable;
    if(obt === ObtainType.strictlyUnobtainable)
      return 'Never';
    if(obt === ObtainType.unobtainableConflit)
      return 'No<sup>Cflt</sup>';
    if(obt === ObtainType.unobtainableReqs)
      return 'No';
    if(obt === ObtainType.obtainable)
      return 'Yes';
    if(obt === ObtainType.unresolvedConflict)
      return 'Conflict';
    if(obt === ObtainType.unknown)
      return '?';
    if(obt === ObtainType.notObtainableUnknownReason)
      return 'No';
    return '';
  }
  getObtainableTitle = function(this:Vue_pokemonCompletion_full, c:Collectable){
    const cat = this.categoriesMap.get(c.categoryId);
    if (!cat)
      return '';

    const obt = c.obtainable;
    if(obt === ObtainType.unobtainableConflit)
      return `Unobtainable in this playthrough because of conflict.`;

    if(obt === ObtainType.unobtainableReqs)
      return `Unobtainable because you don't own the required games to get it.`;

    if(obt === ObtainType.unresolvedConflict)
      return `If you get this ${cat.name}, then another ${cat.name} becomes unobtainable.`;

    return '';
  }
  onCollectableClicked = function(this:Vue_pokemonCompletion_full,p:Collectable){
    const cat = this.categoriesMap.get(p.categoryId);
    if (!cat)
      return;
    const oldLastClicked = cat.lastClickedId;
    cat.lastClickedId = p.id;

    if(oldLastClicked){
      const oldLastClickedEl = cat.list.find(el => el.id === oldLastClicked);
      if(oldLastClickedEl)
        oldLastClickedEl.onChange.forEach(f => f()); //lastClick changed, so visiblity can change
    }

    this.onCollectableObtainedStatusChange(p);
  }
  isVisible = function(this:Vue_pokemonCompletion_full,p:Collectable){
    const cat = this.categoriesMap.get(p.categoryId);
    if (!cat)
      return false;

    if(this.hideUntrackable && p.trackable === false)
      return false;

    if(this.hideObtained && p.obtained)
      return p.id === cat.lastClickedId;

    const obt = p.obtainable;

    const getVisibleSimple = (obtainable:boolean) => {
      if(obtainable)
        return this.displayedElementsSetting !== 'unobtainableOnly';

      return this.displayedElementsSetting !== 'obtainableOnly';
    };

    if(obt === ObtainType.strictlyUnobtainable){
      if(this.ignoreStrictlyUnobtainable)
        return false;
      return getVisibleSimple(false);
    }

    if(obt === ObtainType.unobtainableReqs || obt === ObtainType.unobtainableConflit)
      return getVisibleSimple(false);

    if(obt === ObtainType.obtainable || obt === ObtainType.unresolvedConflict)
      return getVisibleSimple(true);

    return true;
  }
  pct(val:number,total:number){
    if(total === 0)
      return '100%';
    return Math.floor(val / total * 100) + '%';
  }
  expandAll = function(this:Vue_pokemonCompletion_full, expand:boolean){
    this.locations.forEach(loc => {
      loc.displayed = expand;
    });
    this.categories.forEach(cat => {
      cat.displayed = expand;
    });
    if (this.interactiveMap)
      this.setDisplayInteractiveMap(expand);
  }
  hasUnsolved = function(this:Vue_pokemonCompletion_full, arr:Missable[]){
    return arr.some(el => !el.isSolved && el.reqsForProblemFulfilled);
  }

  refreshBackupsFromLocalStorage = function(this:Vue_pokemonCompletion_full){
    const key = 'pokemonCompletion-' + this.name + '-backups';
    try {
      const str = localStorage.getItem(key) || '';
      this.parseBackups(str);
    } catch(err){}
  }
  createBackup = function(this:Vue_pokemonCompletion_full){
    const b = {
      timestamp:Date.now(),
      content:this.generateObtainedJson(),
      totalObtainedCount:this.totalObtainedCount,
    };
    try {
      const key = 'pokemonCompletion-' + this.name + '-backups';
      const currStr = localStorage.getItem(key) || '';
      if (currStr){
        const currArr = JSON.parse(currStr);
        if(Array.isArray(currArr)){
          if(currArr.length > 100)
            currArr.slice(-100);
          currArr.push(b);
          localStorage.setItem(key, JSON.stringify(currArr));
          this.refreshBackupsFromLocalStorage();
          return;
        }
      }

      localStorage.setItem(key, JSON.stringify([b]));
      this.refreshBackupsFromLocalStorage();
    } catch(err){}
  }
  parseBackups = function(this:Vue_pokemonCompletion_full, str:string){
    if(!str){
      this.backups = [];
      return;
    }

    try {
      const currArr = JSON.parse(str);
      if(!Array.isArray(currArr))
        return;

      this.backups = currArr.map(a => {
        const s = new Date(a.timestamp).toString();
        const name = `${s.split(' GMT')[0]} (${a.totalObtainedCount})`
        return {name, content:a.content};
      });
    } catch(err){}
  }
  deleteAllBackups = function(this:Vue_pokemonCompletion_full){
    if(!this.confirmDeleteAllBackups){
      this.confirmDeleteAllBackups = true;
      return
    }
    this.confirmDeleteAllBackups = false;
    try {
      const key = 'pokemonCompletion-' + this.name + '-backups';
      localStorage.setItem(key, '');
      this.refreshBackupsFromLocalStorage();
    } catch(err){}
  }
  clearAll = function(this:Vue_pokemonCompletion_full){
    if(!this.confirmClearAll){
      this.confirmClearAll = true;
      return
    }
    this.confirmClearAll = false;
    this.categories.forEach(cat => {
      cat.list.forEach(col => {
        col.setObtained(false);
      });
      this.updateObtainedLocalStorageAndTextArea(cat);
    });
    this.updateAllObtainedCounts();
    this.updateVisibleCount();
  }

  onclickBackup = function(this:Vue_pokemonCompletion_full, content:any){
    this.selectedBackupTxt = JSON.stringify(content);
  }
  debug_sortByName = function(this:Vue_pokemonCompletion_full){
    this.categories.forEach(cat => {
      cat.list.sort((a,b) => a.name < b.name ? -1 : 1);
    });
    this.locations.forEach(loc => {
      loc.list.sort((a,b) => a.name < b.name ? -1 : 1);
    });
  }
  debug_clearAll = function(this:Vue_pokemonCompletion_full){
    this.confirmClearAll = true;
    this.clearAll();
  }

  debug_obtainAllObtainable = function(this:Vue_pokemonCompletion_full, clearAll=true){
    if(clearAll)
      this.debug_clearAll();
    this.categories.forEach(cat => {
      cat.list.forEach(col => {
        if (col.obtainable){
          col.setObtained(true);
          this.onCollectableObtainedStatusChange(col);
        }
      });
    });
  }
  toggleDisplayInteractiveMap = function(this:Vue_pokemonCompletion_full){
    this.setDisplayInteractiveMap(!this.displayInteractiveMap);
  }
  setDisplayInteractiveMap = function(this:Vue_pokemonCompletion_full,val:boolean){
    this.displayInteractiveMap = val;
    return this.ensureInteractiveMapIsInit();
  }
  updateInteractiveMapIconsVisibility = function(this:Vue_pokemonCompletion_full){
    this.getAllCollectables().forEach(c => c.onChange.forEach(f => f()));
  }
  getAllCollectables = function(this:Vue_pokemonCompletion_full){
    const col:Collectable[] = [];
    this.categories.forEach(cat => {
      col.push(...cat.list);
    });
    return col;
  }
  ensureInteractiveMapIsInit = function(this:Vue_pokemonCompletion_full){
    if(!this.interactiveMap)
      return;

    if (this.displayInteractiveMap && !this.interactiveMapIsInit){
      this.interactiveMapIsInit = true;
      return new Promise<void>(resolve => {
        Vue.nextTick(() => {
          this.interactiveMapVue = PkInteractiveMap.createAndMount(this);
          resolve();
        });
      });
    }
  }
  flyToCollectable = async function(this:Vue_pokemonCompletion_full,c:Collectable){
    this.displayInteractiveMap = true;

    await this.ensureInteractiveMapIsInit();
    if(this.interactiveMapVue)
      this.interactiveMapVue.flyToCollectable(c);
  }
  debug_printCollectableWithoutPos = function(this:Vue_pokemonCompletion_full){
    return this.getAllCollectables()
            .filter(a => a.obtainable !== ObtainType.strictlyUnobtainable)
            .filter(a => a.hasLocation)
            .filter(a => !a.pos || a.pos.length === 0)
            .map(a => a.name + ' ' + a.categoryId + ' ' + a.location)
            .join('\n');
  }
  static instance:Vue_pokemonCompletion_full | null = null;
}

document.addEventListener("DOMContentLoaded",async function(){
  const gameData = await getGameDataInput();

  const overwrite:any[] = []; // (await import("./data/tmp/Platinum_pos.json")).default;
  overwrite.forEach(a => {
    if(!a.pos || !Array.isArray(a.pos) || !a.pos.length)
      return;
    const c = gameData?.categories.find(c => {
      return c.id === a.c;
    });
    const e = c?.list.find(e => {
      return e.name === a.n;
    });
    if(e)
      e.pos = [<any>a.pos];
  });

  //idk why its needed...
  gameData?.getAllCollectables().forEach(col => {
    col.pos?.forEach(p => {
      p[0] -= 8;
      p[1] -= 4;
    });
  });

  const vue = {
    data:gameData,
    methods:new Vue_pokemonCompletion_methods(),
    computed:{
      hasDiscontinued(this:Vue_pokemonCompletion_full){
        return this.getWares().some(w => w.discontinued);
      },
      unsolvedMissables :function(this:Vue_pokemonCompletion_full){
        return this.allMissables.filter(el => !el.isSolved && el.reqsForProblemFulfilled);
      }
    },
    mounted:function(this:Vue_pokemonCompletion_full){
      if(gameData.pkCompletionist){
        Vue_pkCompletionist.createAndMount('#pkCompletionist-slot', gameData.pkCompletionist, this);
        this.updatePkCompletionist();
      }

      this.ensureInteractiveMapIsInit();
    }
  };
  const v = new Vue(withRender(vue));
  Vue_pokemonCompletion_methods.instance = v;
  v.onCreate();

  (<any>window).v = v;
  v.$mount('#pokemonCompletion-slot');
});