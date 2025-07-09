
import Vue from "vue";

import { loadDotnet } from "./loadDotnet";
import withRenderContrib from "./pkCompletionist.vue";
import type { Vue_pokemonCompletion_full } from "./pokemonCompletion";
import { PkCompEvent, PkCompletionistInput } from "./pokemonCompletion_data";

/*
savObtainedStatus:{category, obtained, notObtainable}[]

Obtained in .sav but marked as not obtained in website
  Pokemons: <textarea>Bulbasaur,asd,as a,asd asd, a,d</texter>

Not obtained in .sav but marked as obtained in website
  Items: asda, asd

obtainedDifferencesWithSav:{categoryId, categoryName,

*/

export class SaveInfo {
  hasSavData = false;
  savDataDesc = 'RC (C) - 167:51:58';
  savDataVersion = '';
  savDataFilename = '';
  savDataFilenameModified = '';
  modifiedSavDataUrl:string | null = null;
  modificationsAppliedOnSavFile:string[] = [];
}

export class Vue_pkCompletionist_data {
  constructor(inp:PkCompletionistInput){
    this.supportedVersions = inp.versions;
    this.supportedVersionsLongName = inp.versionsLongName;
    this.versionHint = inp.versionHint || '';

    this.events = inp.events.map(evt => {
      return {
        name:evt.name,
        id:evt.id,
        url:evt.url,
        fullName:evt.fullName || evt.name,
        longDesc:evt.longDesc ?? '',
        optional:evt.optional ?? false,
        japanOnly: evt.japanOnly ?? false,
        promo: evt.promo ?? '',
        where: evt.where ?? '',
        when: evt.when ?? '',
        region: evt.region ?? 'US',
        savUrl: evt.savUrl ?? '',
      };
    });

    this.selectedEventId = this.events.length ? this.events[0].id : '';
    this.hasEventUsingSavB = inp.hasEventUsingSavB ?? false;
    this.supportSortPkms = inp.supportSortPkms ?? true;
  }
  displayImport = false;
  displayEvents = false;
  displaySortPkms = false;
  display = true;
  supportSortPkms = true;
  savObtainedStatus:{category:string, obtainedIds:string[], notObtainedIds:string[]}[] = [];
  savIncompleteHints:string[] = [];

  obtainedDifferencesWithSav:{categoryName:string, categoryId:string, toMarkAsObtainedNamesStr:string, toMarkAsNotObtainedNamesStr:string,diffCount:number}[] = [];

  messages:string[] = [];

  supportedVersions:string[] = []; //game version associated with the checklist in the website. used to ensure .sav is the right version
  supportedVersionsLongName:string[] = [];
  events:PkCompEvent[] = [];
  selectedEventId = '';
  savDataFilename = '';
  savDataFilenameModified = '';
  hasEventUsingSavB = false;

  savInfos = [
    new SaveInfo(),
    new SaveInfo(),
  ];

  hasTriggeredEvent = false;
  hasSorted = false;

  permitJapanOnlyEvents = false;
  permitOptionalEvents = false;
  permitEvents = false;
  dllVersion = '';
  versionHint = '';
}

const savDatas:[Uint8Array | null,Uint8Array | null] = [null,null];

export class Vue_pkCompletionist_methods {
  getDotnet = async function(this:Vue_pkCompletionist_full){
    return await loadDotnet();
  }
  updateSavObtainedStatus = async function(this:Vue_pkCompletionist_full){
    if (!savDatas[0])
      return;

    const {CompletionValidator,Command} = await this.getDotnet();
    const compType = Vue_pkCompletionist.pokemonCompletion.getCompletionType();
    const success = CompletionValidator.Execute(savDatas[0], this.versionHint, compType);

    if (success){
      const res:string[] = CompletionValidator.GetLastObtainedStatus();
      if (res.length){
        this.savObtainedStatus = [];
        for (let i = 0; i < res.length; i += 3){
          const n = {
            category:res[i],
            obtainedIds:res[i+1].split(',').filter(n => n),
            notObtainedIds:res[i+2].split(',').filter(n => n)
          };
          this.savObtainedStatus.push(n);
        }
      }

      this.savIncompleteHints = CompletionValidator.GetLastCompletionHints();
    }
    this.messages = Command.GetMessages();

    this.refreshObtainedDifferences();
  }

  updateObtainedBasedOnSav = function(this:Vue_pkCompletionist_full, categoryId:string, mark:boolean, createBackup:boolean){
    const m = this.obtainedDifferencesWithSav.find(c => c.categoryId === categoryId);
    const cat = Vue_pkCompletionist.pokemonCompletion.categoriesMap.get(categoryId);
    if(!m || !cat)
      return;

    if(createBackup)
      Vue_pkCompletionist.pokemonCompletion.createBackup();

    const namesStr = mark ? m.toMarkAsObtainedNamesStr : m.toMarkAsNotObtainedNamesStr;
    const badNames:string[] = [];
    const names = namesStr.split(',').map(a => a.trim()).filter(a => a);
    names.forEach(n => {
      const el = cat.listByNameMap.get(n);
      if(!el){
        this.messages.push(`Error: Invalid ${m.categoryName}: ${n}.`);
        badNames.push(n);
        return;
      }
      el.obtained = mark;
      Vue_pkCompletionist.pokemonCompletion.onCollectableObtainedStatusChange(el);
    });

    if(mark)
      m.toMarkAsObtainedNamesStr = badNames.join(',');
    else
      m.toMarkAsNotObtainedNamesStr = badNames.join(',');

    m.diffCount = m.toMarkAsObtainedNamesStr.split(',').filter(a => a).length + m.toMarkAsNotObtainedNamesStr.split(',').filter(a => a).length;
  }
  updateObtainedBasedOnSav_all = function(this:Vue_pkCompletionist_full){
    Vue_pkCompletionist.pokemonCompletion.createBackup();
    this.obtainedDifferencesWithSav.forEach(d => {
      this.updateObtainedBasedOnSav(d.categoryId, true, false);
      this.updateObtainedBasedOnSav(d.categoryId, false, false);
    });
  }

  onError = function(this:Vue_pkCompletionist_full, err:string){
    console.error(err);
  }
  refreshObtainedDifferences = function(this:Vue_pkCompletionist_full){
    this.obtainedDifferencesWithSav = [];
    this.savObtainedStatus.forEach(n => {
      const cat = Vue_pkCompletionist.pokemonCompletion.categoriesMap.get(n.category);
      if(!cat)
        return this.onError('invalid cat=' + n.category);

      const toMarkAsObtainedNames:string[] = [];
      const toMarkAsNotObtainedNames:string[] = [];
      n.obtainedIds.forEach(id => {
        const el = cat.listByIdMap.get(id);
        if(!el)
          return this.onError('invalid el. cat=' + n.category + ' el=' + id);
        if(!el.obtained)
          toMarkAsObtainedNames.push(el.name);
      });
      n.notObtainedIds.forEach(id => {
        const el = cat.listByIdMap.get(id);
        if(!el)
          return this.onError('invalid el. cat=' + n.category + ' el=' + id);
        if(el.obtained)
          toMarkAsNotObtainedNames.push(el.name);
      });

      const m = {
        categoryName:cat.name,
        categoryId:cat.id,
        toMarkAsObtainedNamesStr:toMarkAsObtainedNames.join(','),
        toMarkAsNotObtainedNamesStr:toMarkAsNotObtainedNames.join(','),
        diffCount:toMarkAsObtainedNames.length + toMarkAsNotObtainedNames.length,
      };
      this.obtainedDifferencesWithSav.push(m);
    });
  }
  onSavFileLoaded = async function(this:Vue_pkCompletionist_full, event:Event, savIdx:number){
    if (!(event.target instanceof HTMLInputElement))
      return;
    if(!event.target.files)
      return;
    const file = event.target.files[event.target.files.length - 1];
    if(!file)
      return;

    const buffer = await file.arrayBuffer();
    savDatas[savIdx] = new Uint8Array(buffer);

    const {SavDescriptor,Command,Meta} = await this.getDotnet();
    const [version, lang, saveDesc] = SavDescriptor.Execute(savDatas[savIdx], this.versionHint);

    this.messages = Command.GetMessages();

    if(savIdx === 0 && !this.supportedVersions.includes(version)){
      this.messages.unshift(`Error: The game version of the .sav (${version}) is not supported. Supported versions are ${this.supportedVersions.join(',')} (${this.supportedVersionsLongName.join(',')})`);
      return;
    }

    const obj = this.savInfos[savIdx];
    if(!obj){
      console.error('Invalid idx', savIdx);
      return;
    }
    this.dllVersion = 'Version ' + Meta.GetVersion();
    obj.savDataVersion = version;
    obj.savDataDesc = saveDesc;
    obj.hasSavData = !!saveDesc;
    obj.savDataFilename = file.name;
    obj.savDataFilenameModified = file.name.replace('.sav', '_modified.sav');

    this.updateSavObtainedStatus();
  }

  unloadSav = function(this:Vue_pkCompletionist_full, savIdx:number){
    if(savDatas[savIdx] === null)
      return;

    savDatas[savIdx] = null;

    const obj = this.savInfos[savIdx];
    obj.hasSavData = false;
    obj.modifiedSavDataUrl = null;
    obj.savDataDesc = '';

    if(savIdx === 0){
      this.obtainedDifferencesWithSav = [];
      this.messages = [];
      this.hasTriggeredEvent = false;
      this.hasSorted = false;
      this.unloadSav(1);
    }
  }
  sortPkms = async function(this:Vue_pkCompletionist_full){
    if(!savDatas[0])
      return;

    const {PkSorter,Command} = await this.getDotnet();

    const success = PkSorter.Execute(savDatas[0], this.versionHint);
    if (success){
      this.savInfos[0].modificationsAppliedOnSavFile.push(`Sorted Pokemon PC Boxes`);
      this.hasSorted = true;
      this.updateDownloadLinkSav(0);
    }
    this.messages = Command.GetMessages();
  }

  triggerEvent = async function(this:Vue_pkCompletionist_full){
    if(!savDatas[0])
      return;

    const selectedEvt = this.events.find(evt => evt.id === this.selectedEventId);
    if(!selectedEvt)
      return;

    const {EventSimulator,Command} = await this.getDotnet();

    this.messages = [];

    const events = this.selectedEventId === '*' ? this.events.slice(1) : [selectedEvt];
    events.forEach(evt => {
      const success = EventSimulator.Execute(evt.id, savDatas[0], this.versionHint, savDatas[1]);
      if (success){
        this.savInfos[0].modificationsAppliedOnSavFile.push(`Applied event "${evt.name}"`); //TMP, modify savB
        this.hasTriggeredEvent = true;
        this.updateDownloadLinkSav(0);
        if(savDatas[1])
          this.updateDownloadLinkSav(1);
      }
      const msgs:string[] = Command.GetMessages();
      const shortName = evt.name.split('(')[0].trim();
      this.messages.push(...msgs.map(msg => shortName + ' - ' + msg));
    });

  }

  updateDownloadLinkSav = async function(this:Vue_pkCompletionist_full, savIdx:number){
    const {Command} = await this.getDotnet();
    const savData = savIdx === 0 ? Command.GetSavA() : Command.GetSavB();
    if(!savData || !savData.length)
      return;

    this.updateDownloadLink(savIdx, savData);
  }

  updateDownloadLink = async function(this:Vue_pkCompletionist_full, savIdx:number, savDataRes:number[]){
    const arr = new Uint8Array(savDataRes);
    savDatas[savIdx] = arr;
    const blob = new Blob([arr], { type:"application/octet-stream"});
    this.savInfos[savIdx].modifiedSavDataUrl = URL.createObjectURL(blob);
  }

}

export type Vue_pkCompletionist_full = Vue_pkCompletionist_data & Vue_pkCompletionist_methods;

export class Vue_pkCompletionist {
  static instance:Vue_pkCompletionist_full = null!;

  static createAndMount(domSelec:string,data:PkCompletionistInput, full:Vue_pokemonCompletion_full){
    Vue_pkCompletionist.pokemonCompletion = full;

    const v = new Vue(withRenderContrib({
      data:new Vue_pkCompletionist_data(data),
      methods:new Vue_pkCompletionist_methods(),
      computed:<any>{
        obtainedDifferencesWithSav_toMarkCount:function(this:Vue_pkCompletionist_full){
          return this.obtainedDifferencesWithSav.some(c => c.toMarkAsObtainedNamesStr);
        },
        obtainedDifferencesWithSav_toUnmarkCount:function(this:Vue_pkCompletionist_full){
          return this.obtainedDifferencesWithSav.some(c => c.toMarkAsNotObtainedNamesStr);
        },
        obtainedDifferencesWithSav_AllCount:function(this:Vue_pkCompletionist_full){
          let count = 0;
          this.obtainedDifferencesWithSav.forEach(c => {
            count += c.diffCount;
          });
          return count;
        },
        selectedEvent:function(this:Vue_pkCompletionist_full){
          return this.events.find(ev => ev.id === this.selectedEventId) || null;
        },
        selectedEvent_warning:function(this:Vue_pkCompletionist_full){
          const ev = this.events.find(ev => ev.id === this.selectedEventId);
          if(!ev)
            return '';
          if(!this.permitEvents)
            return `Warning: The option "Event Simulator" is unchecked in the section "Playing with".`;
          if(ev.optional && !this.permitOptionalEvents)
            return `Warning: The option "Permit optional events?" is unchecked in the section "Playing with".`;
          if(ev.japanOnly && !this.permitJapanOnlyEvents)
            return `Warning: The option "Cheat: Permit JP events on US games?" is unchecked in the section "Playing with".`;
          return '';
        }
      }
    }));

    v.$mount(domSelec);

    //if(!full.mustHideEmulator()) //for performance
      loadDotnet(); // fetch as soon as possible

    Vue_pkCompletionist.instance = v;
    (<any>window).v2 = v;
    return v;
  }

  static pokemonCompletion:Vue_pokemonCompletion_full = undefined!;
}