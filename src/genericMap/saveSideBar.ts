/*! LICENSED CODE BY SAMUEL MAGNAN-LEVESQUE FOR SCRIPTERSWAR.COM */
import Vue from "vue";

import {log} from "./log";
import {easyButton, Any } from "./markerHelpers";
import type {Config} from "./Config";
import L from "leaflet";

import withRenderSave from "./saveSideBar.vue";
import { LeafletSidebar } from "./leaflet_type";
import { Collectable } from "./Collectable";
import clarity from "@microsoft/clarity";
import { GenericMap } from "./genericMap";

const data = (config:Config, gmap:GenericMap) => ({
  stateHistory:<string[]>[],
  saveVersion:config.saveVersion,
  localStorage:config.localStorage,
  saveEditorUrl:config.saveEditorUrl,
  saveEditorSrcUrl:config.saveEditorSrcUrl,
  gmap,
});

export const getLocalStorageConvertedSave = function(gmap:GenericMap, txt:string): [string,null] | [null, any] {
  let obj:Any;
  try {
    obj = JSON.parse(txt);
  } catch(err){
    return ["Failed to parse the save state: Invalid JSON.", null];
  }

  if (obj.version === '1.1')
    return [null, obj];

  try {
    //convert to 1.1
    const res = {
      version:'1.1',
      markedElements:<number[]>[],
    };
    const allStatesFromJson = new Map<string,string[]>();
    for(const i in obj.layers){
      const stateStr = obj.layers[i];
      allStatesFromJson.set(i, stateStr.split(','));
    }
    gmap.collectableByUid.forEach(col => {
      const jsonMarks = allStatesFromJson.get(col.categoryId) ?? [];
      const marked = col.legacyIds?.some(colId => jsonMarks.includes(colId));
      if (marked)
        res.markedElements.push(col.uid);
    });
    return [null, res];
  } catch(err){
    return ["Failed to convert to supported save state format.", null];
  }
}

class methods {
  clearState = function(this:SavePanel_full){
    this.addStateToHistory();
    this.gmap.collectableByUid.forEach(c => {
      c.setMarked(false);
    });
  }
  saveState = function(this:SavePanel_full){
    const saveTextArea = <HTMLInputElement>this.$refs.saveTextArea;
    saveTextArea.value = this.getCurrentStateAsStr();
  }
  getCurrentStateAsStr = function(this:SavePanel_full){
    const obj = {version:this.saveVersion, markedElements:<number[]>[]};
    this.gmap.collectableByUid.forEach(col => {
      if(!col.marked)
        return;
      obj.markedElements.push(col.uid);
    });
    obj.markedElements.sort((a,b) => a - b);
    return JSON.stringify(obj);
  }
  loadStateFromStr = function(this:SavePanel_full,txt?:string | null){
    if(!txt)
      return "No load state has been pasted in the text area.";
    try {
      let [err,obj] = getLocalStorageConvertedSave(this.gmap, txt);
      if(err)
        return err;

      this.gmap.collectableByUid.forEach(col => {
        const marked = obj.markedElements.includes(col.uid);
        col.setMarked(marked);
      });
    } catch(err){
      return "Failed to parse the save state:" + err.message;
    }
    return null;
  }
  loadStateFromTextArea = function(this:SavePanel_full){
    const saveTextArea = <HTMLInputElement>this.$refs.saveTextArea;
    const txt = saveTextArea.value;
    this.addStateToHistory();
    const res = this.loadStateFromStr(txt);
    if(res)
      alert(res);

    try {
      clarity.event('genericMap_loadStateFromTextArea_' + this.localStorage.state);
    } catch(err){
      //console.error(err);
    }
  }
  addStateToHistory = function(this:SavePanel_full){
    const s = this.getCurrentStateAsStr();
    try {
      window.localStorage.setItem(this.localStorage.state,s);
    } catch(err){
      log('Error saving map state in localStorage.',err);
    }
    this.stateHistory.push(s);
    if(this.stateHistory.length > 10000)
      this.stateHistory.shift();
  }
  onPostMapStateChange = function(this:SavePanel_full){
    this.addStateToHistory();
  }
  revertToPreviousState = function(this:SavePanel_full){
    if(this.stateHistory.length === 0)
      return alert("Error: No previous state.");
    const lastState = this.stateHistory.pop();
    this.loadStateFromStr(lastState);
  }
};

export type SavePanel_full = methods & ReturnType<typeof data> & {
  $el:HTMLElement,
  $mount:() => void,
  $refs:{saveTextArea:HTMLElement}
};

export class SavePanel {
  static vSave:SavePanel_full;
  static sidebar:LeafletSidebar;

  static addSavePanel(gmap:GenericMap){
    const {config,myMap} = gmap;

    const vSave = <SavePanel_full>new Vue(withRenderSave({
      data:data(config, gmap),
      methods:new methods(),
      mounted:function(this:SavePanel_full){
        SavePanel.sidebar = gmap.createSidebar(this.$el, 'glyphicon-floppy-open',"Save/Restore Icons");

        try {
          vSave.loadStateFromStr(window.localStorage.getItem(config.localStorage.state));
          vSave.addStateToHistory();
        } catch(err){
          log('Error loading map state from localStorage.',err);
        }
      }
    }));
    vSave.$mount();

    return vSave;
  }
}
