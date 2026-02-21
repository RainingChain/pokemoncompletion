//this file only contains constructor with no dependencies on localStorage and UI state
import externalLinkIcon from "./externalLinkIcon.svg";
import { getIconData } from "./icons/pokemonIcon";
import type { PkInteractiveMap, PkInteractiveMapInput } from "./map/pokemonMap";

const DEFAULT_TO_CONSOLE = window.location.href.includes('reddit');

export const getGameDataInput = async function(){
  const game = window.location.pathname.toLowerCase();

  if(game === "/completion/yellow")
    return new GameData(await import("./data/Yellow.json"));

  if(game === "/completion/crystal")
    return new GameData(await import("./data/Crystal.json"));

  if(game === "/completion/emerald")
    return new GameData(await import("./data/Emerald.json"));
  if(game === "/completion/platinum")
    return new GameData(await import("./data/Platinum.json"));
  if(game === "/completion/black2")
    return new GameData(await import("./data/Black2.json"));
  if(game === "/completion/x")
    return new GameData(await import("./data/X.json"));
  if(game === "/completion/ultrasun")
    return new GameData(await import("./data/UltraSun.json"));
  if(game === "/completion/pinballrubysapphire")
    return new GameData(await import("./data/PinballRubySapphire.json"));
  if(game === "/completion/pinball")
    return new GameData(await import("./data/Pinball.json"));
  if(game === "/completion/stadium")
    return new GameData(await import("./data/Stadium.json"));
  if(game === "/completion/mysterydungeonrescueteam")
    return new GameData(await import("./data/PmdRescueTeam.json"));
  if(game === "/completion/shuffle")
    return new GameData(await import("./data/Shuffle.json"));
  if(game === "/completion/mysterydungeonexplorersofsky")
    return new GameData(await import("./data/PmdSky.json"));
  if(game === "/completion/ranger")
    return new GameData(await import("./data/Ranger.json"));

  // must update App_httpPages pokemonsGameToName too if adding something here
  //return null;
  return new GameData(await import("./data/Yellow.json"));
};

const DEFAULT_ICON = "misc/default.png";
const DEFAULT_ICON_COLOR_CLASS = "cat-default";

/** hardcoded in .json */
export enum ObtainTypeInJson {
  strictlyUnobtainable = -1,
  unobtainable = 0,
  obtainable = 1,
  conflict = 2,
  unknown = 3,
}

export enum ObtainType {
  strictlyUnobtainable = -1,
  obtainable = 1,
  unresolvedConflict = 2,
  unknown = 3,
  unobtainableConflit = 4,
  unobtainableReqs = 5,
  ignoredBecauseUntrackable = 6,
  /** for games without wares */
  notObtainableUnknownReason = 0
}

export type CollectableInput = {
  id?: string,
  uid?:number, //NO_PROD will be mandatory
  name: string,
  location?: string,
  obtainable?: ObtainTypeInJson, href?: string, reqs?: (string | string[])[],
  trackable?:boolean,
  pos?:number[] | number[][],
  iconUrl?:string,
};

export class FormulaContext {
  constructor(public waresMarkedOwned:Map<string,number>,
              public ownedWares:Map<string,number> | null,
              public requirementsFulfilled:Set<string> | null){}
}

export class Formula {
  constructor(str?:string[][] | null){
    if(str === null || str === undefined)
      return;

    this.list = str.map(s => {
      return s.map(s2 => new Expression(s2));
    });
  }

  isNull(){
    return this.list === null;
  }
  list:Expression[][] | null = null;
  // [(A1 and A2 and A3)  or   (B1 and B2 and B3)   or    (C1 and C2 and C3)]

  evaluate(getFunc:(id:string) => number){
    if(!this.list)
      return true;

    try {
      return this.list.some(crits => {
        return crits.every(crit => crit.evaluate(getFunc));
      });
    } catch(err){
      console['log'](err, this.getIdsReferenced());
      return false;
    }
  }

  getIdsReferenced(){
    if(!this.list)
      return [];
    const list:string[] = [];
    this.list.forEach(crits => {
      crits.forEach(crit => {
        list.push(...crit.getIdsReferenced());
      });
    });
    return Array.from(new Set(list));
  }
}

enum ExpressionType {
  gte,
  sum,
  min,
  constant,
  id,
}

export class Expression {
  static nextUid = 0;
  constructor(public rawInput:string){
    if (rawInput.match(/^\d+$/)){
      this.type = ExpressionType.constant;
      return;
    }
    if(!rawInput.includes('(')){
      this.type = ExpressionType.id;
      return;
    }
    const prefix = rawInput.split('(')[0];
    const argsStr = rawInput.slice(prefix.length + 1, -1).trim();
    const args = Expression.strToArgs(argsStr);

    this.args = args.map(arg => new Expression(arg));

    if(rawInput.startsWith('GTE('))
      this.type = ExpressionType.gte;

    else if(rawInput.startsWith('SUM('))
      this.type = ExpressionType.sum;

    else if(rawInput.startsWith('MIN('))
      this.type = ExpressionType.min;

    else
      console.error('Invalid expression: ' + rawInput);
  }


  static strToArgs(argsStr:string){
    const args:string[] = [];
    let bracketState = 0;
    let curArg = '';
    for(let i = 0; i < argsStr.length; i++){
      const char = argsStr[i];
      if(char === '(')
        bracketState++;
      if(char === ')')
        bracketState--;

      if(bracketState !== 0){
        curArg += char;
        continue;
      }

      if(char === ','){
        args.push(curArg.trim());
        curArg = '';
        continue;
      }
      curArg += char;
    }
    args.push(curArg.trim());
    return args;
  }
  type:ExpressionType = undefined!;
  args:Expression[] = [];
  uid = ++Expression.nextUid;

  getIdsReferenced(){ //for valids
    if(this.type === ExpressionType.id)
      return [this.rawInput];

    const arr:string[] = [];
    this.args.forEach(arg => {
      arr.push(...arg.getIdsReferenced());
    });
    return arr;
  }

  evaluate(getFunc:(id:string) => number) : number {
    //if(this.rawInput === "GTE($Emerald_US, $FireRed_US, $LeafGreen_US, $Emerald_JP, $FireRed_JP, $LeafGreen_JP, 2)")
    //  deb ugger;

    if(this.type === ExpressionType.constant)
      return +this.rawInput;
    if(this.type === ExpressionType.id)
      return getFunc(this.rawInput);

    const vals = this.args.map(arg => arg.evaluate(getFunc));
    if(this.type === ExpressionType.sum)
      return vals.reduce((a,b) => a + b, 0);

    if(this.type === ExpressionType.min)
      return Math.min(...vals);

    if(this.type === ExpressionType.gte)
      return vals.slice(0,-1).reduce((a,b) => a + b, 0) >= vals[vals.length - 1] ? 1 : 0;

    console.error('Unsupported formula: ' + this.rawInput);
    return 0;
  }
}

export type ConflictInput = {
  name: string,
  list: string[][],
  reqsToSolve: string[][],
  reqsForProblem?:string[][],
  reqsForProblemOnlyIfLivingDex?:boolean | null,
};

export type Conflict = {
  name: string,
  list: string[][],
  reqsToSolve: Formula,
  reqsForProblem:Formula,
  reqsForProblemOnlyIfLivingDex:boolean | null,
  reqsForProblemFulfilled:boolean,
  isSolved:boolean,
  desc:string,
  categoryId:string,
};

export type PkCompEvent = {
  id:string,
  name:string,
  url:string,
  fullName:string,
  promo:string,
  where:string,
  when:string,
  region:string,
  savUrl:string,
  optional:boolean,
  japanOnly:boolean,
  longDesc:string,
  modifiedSavDataIdx:number[],
  requirements:string,
};
export type PkCompEventInput = {
  id:string,
  name:string,
  url:string,
  when?:string,
  where?:string,
  fullName?:string,
  region?:string,
  promo?:string,
  savUrl?:string,
  optional?:boolean,
  japanOnly?:boolean,
  versions?:string[],
  longDesc?:string,
  modifiedSavDataIdx?:number[],
  requirements?:string,
};

export type PkCompletionistInput = {
  versions:string[],
  versionsLongName:string[],
  events:PkCompEventInput[],
  completionTypes:{name:string,value:number,desc?:string}[],
  versionHint?:string,
  hasEventUsingSavB?:boolean,
  supportSortPkms?:boolean,
}

export type CollectableCategoryInput = {
  id?: string,
  name: string,
  url?: string,
  showId?: boolean,
  conflicts?: string[][][] | ConflictInput[],
  missables?: MissableInput[],
  urlSuffix?: string | null,
  iconUrl?:string,
  list: CollectableInput[],
  iconColorClass?:string,
  iconVisibleByDefault?:boolean,
};

export type WareInput = {
  id:string,
  name:string,
  indent?:number,
  fullCompl?:number,
  minCount?:number,
  preReqs?:string[][],
  warning?:string,
  discontinued?:boolean,
  desc?:string,
  url?:string[],
  maxCount?:number,
}

export type RequirementInput = {
  id:string,
  formula?:string[][],
  waresByType?:{type:string | string[], formula:string[][]}[]
} | string[] | string;

export type WaresInput = {
  type:string | string[],
  name:string,
  aliases?:string[][],
  warning?:string,
  list:(WareInput | WareInput[])[]
};

export type LocationInput = {
  name:string,
  alias?:string[],
  href?:string,
  exclude?:string[],
  isParentLoc?:boolean,
  pos?:number[],
};


export type GameDataInput = {
  name:string,
  id:string,
  wip?:string,
  additionalCredits?:string,
  showWares?:boolean,
  categories:CollectableCategoryInput[],
  additionalTasks?:string[],
  advices?:string[],
  guide?:string[],
  locations?:LocationInput[],
  requirements?:RequirementInput[],
  waresByType?:WaresInput[],
  pkCompletionist?:PkCompletionistInput,
  interactiveMap?:PkInteractiveMapInput,
  displayIcons?:boolean,
  iconUrl?:string,
}

const nameToHref = function(name:string,urlSuffix?:string){
  name = name.replace(/ #\d+$/,'');
  return `https://bulbapedia.bulbagarden.net/wiki/${name.replace(/ /g, '_')}${urlSuffix || ''}`;
};

const formatHref = function(href?:string){
  if(!href)
    return '';

  if(href.startsWith('http'))
    return href;

  return `https://bulbapedia.bulbagarden.net/wiki/${href}`;
};

const formatNameToId = function(name:string){
  return name.replace(/é/g,'e').replace(/[^A-Za-z0-9]/g,'');
}

export class Collectable {
  obtained = false;
  /** obtainable changes depending on conflict and wares */
  obtainable = ObtainType.obtainable;
  /** obtainableJson is const */
  obtainableJson = ObtainTypeInJson.obtainable;
  uid = -1;
  id = "";
  name = "";
  location = "";
  locationHtml = "";
  href = '';
  categoryId = '';
  hasLocation = false;
  requirements:Formula = undefined!;
  trackable = true;
  pos:number[][] | null = null;
  iconData:ReturnType<typeof getIconData> = null;
  missable:Missable | null = null;
  conflicts:Conflict[] | null = null;
  showId = false;

  onChange:(() => void)[] = [];

  constructor(info:CollectableInput,cat:CollectableCategoryInput){
    const categoryUrl = cat.url;
    const urlSuffix = cat.urlSuffix;

    this.showId = cat.showId ?? false;

    if (info.pos && info.pos.length){
      if (typeof info.pos[0] === 'number')
        this.pos = [<number[]>info.pos];
      else
        this.pos = <number[][]>info.pos;
    }

    if(info.id)
      this.id = info.id;
    else
      this.id = formatNameToId(info.name);

    if(info.uid != undefined)
      this.uid = info.uid;

    this.name = info.name;
    this.categoryId = cat.id ?? formatNameToId(info.name);

    if (this.name.includes(','))
      console.error('invalid name ' + this.name); // wont work with pkCompletionist import

    this.trackable = info.trackable ?? true;

    this.iconData = getIconData(info.iconUrl || cat.iconUrl || DEFAULT_ICON, cat.iconColorClass || DEFAULT_ICON_COLOR_CLASS);

    if (info.obtainable !== undefined)
      this.obtainableJson = info.obtainable;

    if (info.location !== undefined)
      this.location = info.location;
    else if (info.obtainable === ObtainTypeInJson.strictlyUnobtainable)
      this.location = 'Unobtainable';

    if (info.reqs){
      const reqStrs = info.reqs.map(s => {
        return typeof s === 'string' ? [s] : s;
      });
      this.requirements = new Formula(reqStrs);
      this.obtainableJson = ObtainTypeInJson.unobtainable;
    } else
      this.requirements = new Formula(null);

    //obtainableJson for conflit is handled later

    if (info.href)
      this.href = formatHref(info.href);
    else if(categoryUrl)
      this.href = categoryUrl;
    else if (urlSuffix !== null) //urlSuffix can be '' or undefined
      this.href = nameToHref(this.name, urlSuffix);

    this.obtainable = <ObtainType><unknown>this.obtainableJson;

    if (this.obtainableJson === ObtainTypeInJson.unobtainable && !info.reqs)
      console.error('this.obtainableJson === ObtainTypeInJson.unobtainable && !info.reqs', this.name, this);
  }
  setObtainable(t:ObtainType){
    this.obtainable = t;
    this.emitOnChange();
  }
  setObtained(t:boolean){
    this.obtained = t;
    this.emitOnChange();
  }
  emitOnChange(){
    console.log('pkcol.emitOnChange');
    this.onChange.forEach(f => f());
  }
}


export class Category {
  constructor(game:string,cat:CollectableCategoryInput){
    this.game = game;
    this.id = cat.id ?? formatNameToId(cat.name);
    this.name = cat.name;

    if(cat.iconUrl){
      this.iconUrl = cat.iconUrl;
      this.iconData = getIconData(cat.iconUrl);
    }

    if(cat.missables !== undefined)
      this.missables = cat.missables.map(m => {
        return {
          text:m.text,
          reqsToSolve:new Formula(m.reqsToSolve),
          reqsForProblem:new Formula(m.reqsForProblem),
          reqsForProblemOnlyIfLivingDex:m.reqsForProblemOnlyIfLivingDex !== undefined ? m.reqsForProblemOnlyIfLivingDex : null,
          isSolved:false,
          reqsForProblemFulfilled:true,
          collectables:m.collectables || null,
          categoryId:this.id,
        }
      });

    if(cat.urlSuffix !== undefined)
      this.urlSuffix = cat.urlSuffix;
    if(cat.url !== undefined)
      this.url = cat.url;
    if(cat.showId !== undefined)
      this.showId = cat.showId;
    if(cat.iconVisibleByDefault !== undefined)
      this.iconVisibleByDefault = cat.iconVisibleByDefault;

    if (cat.conflicts !== undefined && cat.conflicts.length){
      const cflts = Array.isArray(cat.conflicts[0])
                    ? (<any[]>cat.conflicts).map((list:string[][]) => {
                      return <ConflictInput>{name:'', list, reqsToSolve:[]};
                    })
                    : <ConflictInput[]>cat.conflicts;

      this.conflicts = cflts.map(cflt => {
        const desc = cflt.list.map(c2 => {
          if(c2.length < (window.location.href.includes('localhost') ? 1000 : 20))
            return c2.join(', ');
          return `${c2.slice(0, 10).join(', ')}, and ${c2.length - 10} more...`;
        }).join(') OR (');

        return <Conflict>{
          name:cflt.name,
          list:cflt.list,
          reqsToSolve:new Formula(cflt.reqsToSolve),
          reqsForProblem:new Formula(cflt.reqsForProblem),
          reqsForProblemOnlyIfLivingDex:cflt.reqsForProblemOnlyIfLivingDex !== undefined ? cflt.reqsForProblemOnlyIfLivingDex : null,
          isSolved:false,
          desc:`(${desc})`,
          reqsForProblemFulfilled:true,
          categoryId:cat.id,
        }
      });
    }

    this.conflicts.forEach(c => {
      this.firstInConflictGroup.push(...c.list[0]);
    });

    const idsForDupeCheck = new Set<string>();
    this.list = cat.list.map(info => {
      const p = new Collectable(info, cat);

      if(idsForDupeCheck.has(p.id))
        console.error('dupe id',p);
      idsForDupeCheck.add(p.id);

      return p;
    });
    if(!this.iconData && this.list[0]){
      this.iconUrl = this.list[0].iconData?.id ?? '';
      this.iconData = this.list[0].iconData;
    }

    this.listByNameMap = new Map(this.list.map(el => ([el.name,el])));
    this.listByIdMap = new Map(this.list.map(el => ([el.id,el])));
  }
  displayed = false;
  id = "";
  name = "";
  list:Collectable[] = [];
  listByNameMap = new Map<string, Collectable>();
  listByIdMap = new Map<string, Collectable>();
  game = '';
  conflicts:Conflict[] = [];
  urlSuffix:string | null = null;
  url:string | null = null;
  missables:Missable[] = [];
  textareaObtained = '';
  showId = false;
  iconUrl = '';
  iconData:ReturnType<typeof getIconData> = null;
  iconVisibleByDefault = true;

  firstInConflictGroup:string[] = [];
  obtainableCount = 0;
  obtainedCount = 0;
  conflictCount = 0;
  unobtainableCount = 0;
  strictlyUnobtainableCount = 0; //const
  untrackableCount = 0; //const
  visibleCount = 0;

  lastClickedId = '';
}

export class Location {
  name = '';
  href = '';
  aliases:string[] = [];
  lastClickedId = '';
  list:Collectable[] = [];
  displayed = false;
  obtainedCount = 0;
  obtainableCount = 0;
  visibleCount = 0;
  exclude:string[] = [];
  isParentLoc = false;
  pos:[number,number] | null = null;
}

export interface Requirement {
  id:string,
  waresByType:{type:string,reqWares:Formula}[],
}

export type Ware = {
  id:string,
  name:string,
  owned:boolean,
  ownedCount:number,
  mandatoryForFullCompletion:number,
  discontinued:boolean,
  minCount:number,
  preReqs:Formula,
  visible:boolean,
  alwaysVisible:boolean,
  /** only for vue usage */
  hasWarning:boolean,
  warning:string | null,
  expanded:boolean,
  desc:string | null,
  url:string[] | null,
  maxCount:number,
}

export type MissableInput = {
  text:string,
  reqsToSolve:string[][],
  reqsForProblem?:string[][],
  reqsForProblemOnlyIfLivingDex?:boolean | null,
  collectables?:string[],
}

export type Missable = {
  text:string,
  reqsToSolve:Formula,
  reqsForProblem:Formula,
  reqsForProblemOnlyIfLivingDex:boolean | null,
  isSolved:boolean,
  reqsForProblemFulfilled:boolean,
  collectables:string[] | null,
  categoryId:string,
}

export type WareGroup = {
  obtainableVariationIfToggledHtml:string,
  wares:Ware[],
  id:string,
  indent:number,
  isLabel:boolean,
  warning:string,
  parentIsOwned:boolean, //only used to change visibility if same ware appears multiple times
}

export class GameData {
  name = "";
  id = "";
  wip = "";
  additionalCredits = '';
  displayIcons = false;
  iconData:ReturnType<typeof getIconData> = null;

  waresByType:{type:string, name:string, warning:string | null, wares:Ware[], groups:WareGroup[],aliases:Map<string,string>, isEmu:boolean}[] = [];
  requirements:Requirement[] = [];

  collectableWithVariableObtainability:Collectable[] = [];
  categories:Category[] = [];
  categoriesMap = new Map<string, Category>();
  totalObtainableCount = 0;
  totalObtainedCount = 0;
  untrackableCount = 0;

  showAllWares = false;
  hasCollectableRequirements = false;

  hideObtained = false;
  compactView = window.innerWidth <= 720;
  ignoreStrictlyUnobtainable = true;
  hideUntrackable = false;
  displayedElementsSetting = 'both';
  pkCompletionist:PkCompletionistInput | null = null;

  displayPlayingWith = true;
  displayCompletion = true;
  displayViewSettings = true;
  displayInteractiveMap = true;
  interactiveMapIsInit = false;
  displayImportExport = false;
  displayCredits = false;
  displayPermanentlyMissable = false;
  displayAdvices = false;

  advices:string[] = [];
  guide:{html:string, indented:boolean}[] = [];

  textareaAllObtained = '';
  displayImportExportForEachCategory = false;
  locations:Location[] = [];
  playingWith = '';
  view = 'byCategory';
  allMissables:Missable[] = [];
  allConflicts:Conflict[] = [];
  backups:{name:string, content:string}[] = [];
  selectedBackupTxt = '';
  confirmDeleteAllBackups = false;
  confirmClearAll = false;
  objectiveStr = '0';
  externalLinkIcon = externalLinkIcon;
  interactiveMap:GameDataInput['interactiveMap'] | null = null;
  interactiveMapVue:PkInteractiveMap | null = null;
  additionalTasks:string[] = [];
  displayAdditionalTasks = false;
  displayWaresUrl = !window.location.href.includes('reddit');

  constructor(gameInput:GameDataInput){
    const game = {...gameInput};
    this.name = game.name;
    this.id = game.id;

    if(game.showWares === false && !window.location.href.includes('localhost')){
      game.waresByType = undefined;
      game.requirements = undefined;
    }

    if(game.pkCompletionist !== undefined){
      this.pkCompletionist = game.pkCompletionist;
      this.pkCompletionist.versionHint = this.name;
    }

    if(game.additionalTasks !== undefined)
      this.additionalTasks = game.additionalTasks;

    this.interactiveMap = gameInput.interactiveMap || null;
    this.displayIcons = gameInput.displayIcons ?? false;
    this.iconData = gameInput.iconUrl ? getIconData(gameInput.iconUrl) : null;

    this.categories = game.categories.map((cat:any) => {
      const c = new Category(game.id, cat);
      this.categoriesMap.set(c.id, c);

      this.allMissables.push(...c.missables);
      this.allConflicts.push(...c.conflicts);

      c.conflicts.forEach(cflt => {
        this.getConflictElements(cflt).forEach(col => {
          col.obtainableJson = ObtainTypeInJson.conflict;
          col.obtainable = ObtainType.unresolvedConflict;

          if(!col.conflicts)
            col.conflicts = [cflt];
          else
            col.conflicts.push(cflt);
        });
      });

      c.list.forEach(c2 => {
        if(c2.requirements.list || c2.obtainableJson === ObtainTypeInJson.conflict || !c2.trackable)
          this.collectableWithVariableObtainability.push(c2);
      });
      c.missables.forEach(m => {
        m.collectables?.forEach(colName => {
          const col = c.listByNameMap.get(colName);
          if(!col)
            console.error('invalid missable name: ' + colName);
          else if (col.missable)
            console.error('limitation: only 1 missable by collectable: ' + colName);
          else
            col.missable = m;
        });
      });
      return c;
    });

    if(game.wip !== undefined)
      this.wip = game.wip;

    if(game.additionalCredits !== undefined)
      this.additionalCredits = game.additionalCredits;

    if(game.advices !== undefined)
      this.advices = game.advices;

    if(game.locations){
      this.locations = game.locations.map(loc => this.createLocation(loc));

      this.createLocationHtmls();
      this.locations.push(this.createUnlocatedLocation());
    }


    if(game.waresByType){
      if (DEFAULT_TO_CONSOLE){
        game.waresByType.sort((w1,w2) => {
          return w1.name.includes('emulator') ? 1 : -1;
        });
      }
      this.createWaresByType(game);
      this.playingWith = this.waresByType[0]?.type || '';

      if (DEFAULT_TO_CONSOLE &&
          this.playingWith.includes('emulator') &&
          this.waresByType.length > 1)
        this.playingWith = this.waresByType.find(t => !t.type.includes('emulator'))?.type || '';
    }

    if(game.requirements){
      const types = this.waresByType.map(w => w.type);


      this.requirements = game.requirements.map(raw => {
        if(typeof raw === 'string')
          return null!;
        const r = (() => {
          if (Array.isArray(raw)){
            const [reqId, ...formula] = raw;
            const orList = formula.map(f => [f]);
            return {id:reqId, waresByType:[
              {type:types, formula:orList}
            ]};
          }
          return raw;
        })();

        const waresByType:Requirement['waresByType'] = [];
        const waresByTypeInput = r.waresByType || types.map(type => {
          return {type, formula: r.formula!};
        });
        waresByTypeInput.forEach(t => {
          const arr = typeof t.type === 'string' ? [t.type] : t.type;

          arr.forEach(t2 => {
            const list2 = t.formula.map(l2 => l2.slice(0)); //copy
            waresByType.push({type:t2, reqWares:new Formula(list2)});
          });
        });
        return {id:r.id, waresByType, isFulfilled:false};
      }).filter(a => a);

    }

    this.guide = game.guide?.map(g => {
      if (g.startsWith('-'))
        return {html:g.slice(1), indented:true};
      return {html:g, indented:false};
    }) || [];

    this.hasCollectableRequirements = this.getAllCollectables().some(c => !c.requirements.isNull());
    this.validateReqsIntegrity();

    this.untrackableCount = this.categories.reduce((prev,cat) => {
      return prev + cat.list.reduce((prev, el) => prev + (el.trackable ? 1 : 0), 0);
    }, 0);
  }

  createWaresByType(game:GameDataInput){
    game.waresByType?.forEach(s => {
      const types = typeof s.type === 'string' ? [s.type] : s.type;
      types.forEach(type => {
        const groups = s.list.map((wOrWs,groupIdx) : WareGroup => {
          const ws = Array.isArray(wOrWs) ? wOrWs : [wOrWs];

          const wares = ws.map((w) : Ware => {

            const parentGroups:WareInput[] = [];
            let currentIndent = w.indent || 0;
            for(let i = groupIdx - 1; i >= 0; i--){
              const prev = s.list[i];
              const prevWare = Array.isArray(prev) ? prev[0] : prev;
              const prevIndent = prevWare.indent || 0;
              if(prevIndent < currentIndent){
                parentGroups.push(prevWare);
                currentIndent = prevIndent;
              }
              if(prevIndent === 0)
                break;
            }
            const parentGroupIds = parentGroups.map(a => a.id).filter(a => a); // aka label
            const preReqs = w.preReqs ?? [[]];
            //if (w.id === '$eReader_AnyBerry')
            //  debu gger; //debug
            preReqs.forEach(r => {
              if(!r || !r.push)
                debugger; // permanent
              r.push(...parentGroupIds); //to use a child wares, the requirement of parent must be fulfilled
            });
            const allParentsAreMandatory = parentGroups.every(p => (p.minCount ?? 0) > 0);

            return {
              id:w.id,
              name:w.name,
              owned:!!w.minCount,
              mandatoryForFullCompletion: Math.max(w.minCount ?? 0, w.fullCompl ?? 0),
              minCount:w.minCount || 0,
              preReqs:new Formula(preReqs),
              alwaysVisible:!!(allParentsAreMandatory && w.minCount),
              hasWarning:false,
              visible:true,
              warning:w.warning || null,
              discontinued:w.discontinued || parentGroups.some(p => p.discontinued),
              expanded:false,
              desc:w.desc || null,
              url:w.url || null,
              ownedCount:1,
              maxCount:w.maxCount ?? 1,
            };
          });

          return {
            obtainableVariationIfToggledHtml:'',
            wares,
            id:'' + Math.random(),
            indent:ws[0].indent || 0,
            isLabel:!ws[0].id,
            warning:ws.map(w => w.warning).filter(a => a).join(' '),
            parentIsOwned:true,
          };
        });

        const wares = GameData.flatten(groups.map(gr => gr.wares));
        this.waresByType.push({
          type, name:s.name, warning:s.warning || '', groups, wares,
          aliases:new Map(<[string,string][]>s.aliases),
          isEmu:s.name.includes('emulator'),
        });
      });
    });
  }
  getAllCollectables(){
    const col:Collectable[] = [];
    this.categories.forEach(cat => {
      col.push(...cat.list);
    });
    return col;
  }
  createLocationHtmls(){
    const uidToAlias = new Map<number, string>();
    const aliasToUid = new Map<string, number>();
    const aliasToLoc = new Map<string, Location>();
    const isParentLoc = new Set<string>();

    this.locations.forEach(loc => {
      if(!loc.href)
        return;
      loc.aliases.forEach(a => {
        const uid = uidToAlias.size;
        uidToAlias.set(uid, a);
        aliasToUid.set(a, uid);
        aliasToLoc.set(a, loc);
        if(loc.isParentLoc)
          isParentLoc.add(a);
      });
    });
    const locByLen = Array.from(aliasToLoc.keys()).sort((a,b) => b.length - a.length);

    this.getAllCollectables().forEach(col => {
      let html = col.location;
      const uids = new Map<number, number>();

      //if(col.name === 'Glitter Gem')
      //  debugger;
      let htmlBeforeReplace = html;
      locByLen.forEach(locName => {
        const uid = aliasToUid.get(locName);
        if(uid === undefined)
          return; // error

        const excludes = aliasToLoc.get(locName)?.exclude || [];
        excludes.forEach((e,excludeId) => {
          for(let i = 0; i < 10; i++){
            let changed = false;
            if(htmlBeforeReplace.includes(e)){
              htmlBeforeReplace = htmlBeforeReplace.replace(e, `***${excludeId}***`);
              changed = true;
            }
            if(html.includes(e)){
              html = html.replace(e, `***${excludeId}***`);
              changed = true;
            }
            if(!changed)
              break;
          }
        });
        for(let i = 0; i < 100; i++){
          if(isParentLoc.has(locName)){
            if(htmlBeforeReplace.includes(locName)){
              uids.set(uid, 1);
              break;
            }
          } else if(html.includes(locName)){
            html = html.replace(locName, `###${uid}###`);
            uids.set(uid, i + 1);
            if(isParentLoc.has(locName)){
              break;
            }
          } else
            break;
        }
        excludes.forEach((e,excludeId) => {
          for(let i = 0; i < 10; i++){
            if(html.includes(`***${excludeId}***`))
              html = html.replace(`***${excludeId}***`, e);
            else
              break;
          }
        });
      });

      uids.forEach((count,uid) => {
        const locName = uidToAlias.get(uid);
        const loc = aliasToLoc.get(locName || '');
        if(!loc)
          return; // bug

        for(let i = 0; i < count; i++)
          html = html.replace(`###${uid}###`, `<a href="${loc.href}" class="sobreLink" target="_blank" rel="noopener">${locName}</a>`);

        col.hasLocation = true;
        if(!loc.list.includes(col)) //avoid dupes
          loc.list.push(col);
      });

      if(html.includes('><') || html.match(/\w<a /)) // mean a comma or space is missing
        (<any>window)['c' + 'onsole'].log('bad html', col.name);

      if (html.includes(`###`))
        console.error('invalid locationHtml');
      else
        col.locationHtml = html;
    });
  }

  static flatten<T>(arr:T[][]){
    const a:T[] = [];
    arr.forEach(list => a.push(...list));
    return a;
  }
  createUnlocatedLocation(){
    const unlocated = new Location();
    unlocated.name = 'Unlocated';
    this.getAllCollectables().forEach(c => {
      if(c.hasLocation)
        return;
      unlocated.list.push(c);
    });
    return unlocated;
  }
  createLocation(locInp:LocationInput){
    const loc = new Location();
    loc.name = locInp.name;
    loc.href = formatHref(locInp.href) || nameToHref(locInp.name);
    loc.aliases = [locInp.name, ...(locInp.alias || [])];
    loc.exclude = locInp.exclude?.sort((a,b) => b.length - a.length) || [];
    loc.isParentLoc = locInp.isParentLoc ?? false;
    loc.pos = <[number,number]>locInp.pos ?? null;

    return loc;
  }


  getConflictElements(cflt:Conflict){
    const cat = this.categoriesMap.get(cflt.categoryId);
    if(!cat)
      return [];

    const list:Collectable[] = [];
    cflt.list.forEach(els => {
      els.forEach(id => {
        const exists = cat.list.find(e => e.name === id);
        if(!exists)
          console.error('invalid collectable ' + id);
        else
          list.push(exists);
      });
    });
    return list;
  }

  validateReqsIntegrity(){
    this.categories.forEach(cat => {
      const nameSet = new Set<string>();
      cat.list.forEach(el => {
        if (el.obtainableJson === ObtainTypeInJson.strictlyUnobtainable)
          return;
        if (nameSet.has(el.name))
          console.error('duplicate name: ' + el.name); //issue for import/export
        nameSet.add(el.name);
      });
    });

    this.collectableWithVariableObtainability.forEach(c => {
      const ids = c.requirements.getIdsReferenced();
      ids.forEach(id => {
        const exists = this.requirements.find(r => r.id === id);
        if(!exists)
          console.error('invalid requirement ' + id);
      });
    });


    [this.allConflicts, this.allMissables].forEach(all => {
      all.forEach(m => {
        [m.reqsToSolve, m.reqsForProblem].forEach(formula => {
          const wares = formula.getIdsReferenced();
          wares.forEach(id => {
            const exists = this.requirements.some(r => r.id === id);
            if(!exists)
              console.error('missing requirement ' + id);
          });
        });
      });
    });

    this.categories.forEach(cat => {
      cat.conflicts.forEach(c => {
        this.getConflictElements(c);
      });
    });
  }
}