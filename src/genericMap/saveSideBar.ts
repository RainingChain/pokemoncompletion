
import Vue from "vue";

import {log} from "./log";
import {easyButton, IconLayer} from "./markerHelpers";
import {Config} from "./Config";
const config = Config.c;

import withRenderSave from "./saveSideBar.vue";

declare let L:any;

export class SavePanel {
  static vSave:any;
  static saveSidebar:any;

  static addSavePanel(myMap:any, onOpen:() => void){
    const getMarkerId = function(mark:any){
      const latLng = mark.getLatLng();
      return '' + latLng.lat + '_' + latLng.lng;
    }

    SavePanel.vSave = new Vue(withRenderSave({
      data: {
        stateHistory:<string[]>[],
        saveEditorUrl:config.saveEditorUrl,
        saveEditorSrcUrl:config.saveEditorSrcUrl,
      },
      methods:{
        clearState(this:any){
          this.addStateToHistory();
          IconLayer.forEachMarkerLayers(lay => {
            lay.markers.forEach(m => m.setOpacity(1));
          });
        },
        saveState(this:any){
          const saveTextArea = <HTMLInputElement>this.$refs.saveTextArea;
          saveTextArea.value = this.getCurrentStateAsStr();
        },
        getCurrentStateAsStr(this:any){
          const obj = {version:'1.0',layers:<DictObj<string>>{}};
          IconLayer.forEachMarkerLayers(lay => {
            const icons = <string[]>[];
            lay.markers.forEach(m => {
              if(m.options.opacity === 1)
                return;
              icons.push(getMarkerId(m));
            });
            obj.layers[lay.id] = icons.join(',');
          });
          return JSON.stringify(obj);
        },
        loadStateFromStr(this:any,txt:string){
          if(!txt)
            return "No load state has been pasted in the text area.";
          let obj:any;
          try {
            obj = JSON.parse(txt);
          } catch(err){
            return "Failed to parse the save state: Invalid JSON.";
          }

          try {
            const allStatesFromJson:string[] = [];
            for(const i in obj.layers){
              const stateStr = obj.layers[i];
              allStatesFromJson.push(...stateStr.split(','));
            }

            IconLayer.forEachMarkerLayers(lay => {
              lay.markers.forEach(m => {
                const markId = getMarkerId(m);
                if(allStatesFromJson.includes(markId))
                  m.setOpacity(0.2);
                else
                  m.setOpacity(1);
              });
            });
          } catch(err){
            return "Failed to parse the save state.";
          }
          return null;
        },
        loadStateFromTextArea(this:any){
          const saveTextArea = <HTMLInputElement>this.$refs.saveTextArea;
          const txt = saveTextArea.value;
          this.addStateToHistory();
          const res = this.loadStateFromStr(txt);
          if(res)
            alert(res);
        },
        saveVisibleLayer(this:any){
          const visLayers:string[] = [];
          IconLayer.forEachMarkerLayers(lay => {
            if(!lay.isVisibleByDefault && myMap.hasLayer(lay.layerGroup))
              visLayers.push(lay.id);
          });
          const str = visLayers.join(',');
          try {
            window.localStorage.setItem(config.localStorage.visibleLayers,str);
          } catch(err){
            log('Error saving map state in localStorage.',err);
          }
        },
        addStateToHistory(this:any){
          const s = this.getCurrentStateAsStr();
          try {
            window.localStorage.setItem(config.localStorage.state,s);
          } catch(err){
            log('Error saving map state in localStorage.',err);
          }
          SavePanel.vSave.stateHistory.push(s);
          if(SavePanel.vSave.stateHistory.length > 100)
            SavePanel.vSave.stateHistory.shift();
        },
        onPostMapStateChange(this:any){
          this.addStateToHistory();
        },
        revertToPreviousState(this:any){
          if(SavePanel.vSave.stateHistory.length === 0)
            return alert("Error: No previous state.");
          const lastState = SavePanel.vSave.stateHistory.pop();
          this.loadStateFromStr(lastState);
        }
      },
      mounted:function(this:any){
        setInterval(function(){
          SavePanel.vSave.saveVisibleLayer();
        },10000);

        SavePanel.saveSidebar = L.control.sidebar(this.$el, {
          position: 'left'
        });
        myMap.addControl(SavePanel.saveSidebar);

        easyButton('glyphicon-floppy-save',"Save State",function(){
          onOpen();
          SavePanel.saveSidebar.toggle();
        }).addTo(myMap);

        try {
          SavePanel.vSave.loadStateFromStr(window.localStorage.getItem(config.localStorage.state));
          SavePanel.vSave.addStateToHistory();
          const layIds = window.localStorage.getItem(config.localStorage.visibleLayers);
          if(layIds){
            layIds.split(',').forEach(layId => {
              const lay = IconLayer.getLayer(layId);
              if(lay)
                lay.layerGroup.addTo(myMap);
            });
          }
        } catch(err){
          log('Error loading map state from localStorage.',err);
        }
      }
    }));
    SavePanel.vSave.$mount();
  }
}
