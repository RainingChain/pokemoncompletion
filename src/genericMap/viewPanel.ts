/*! LICENSED CODE BY SAMUEL MAGNAN-LEVESQUE FOR SCRIPTERSWAR.COM */
import Vue from "vue";

import type {Config} from "./Config";

import withRenderSave from "./viewPanel.vue";
import { LeafletSidebar } from "./leaflet_type";
import { GenericMap, LAYER_MAP_EDGES, LAYER_MAP_LABEL, LAYER_MAP_LINK } from "./genericMap";

const getDefaultVals = () => {
  return {
    semiTransparentMap:false,
    semiTransparentMapEdges:true,
    hideObtainedIcons:false,
    displayAct3:true,
    displaySteelSoul:true,
    displayIconLabels:true,
    displayMapLabels:true,
    displayMapLinks:true,
    displayMapEdges:true,
  };
};

const data = (config:Config, gmap:GenericMap) => ({
  gmap,
  isSilksong:window.location.href.toLowerCase().includes('silksong'),
  isHk:window.location.href.toLowerCase().includes('hollowknight/map'),
  hasMapEdges:gmap.getLayer(LAYER_MAP_EDGES) !== null,
  hasMapLinks:gmap.getLayer(LAYER_MAP_LINK) !== null,
  hasMapLabels:gmap.getLayer(LAYER_MAP_LABEL) !== null,
  localStorageKey:config.localStorage.viewPanel,
  ...getDefaultVals(),
});

class methods {
  getStateObj = function(this:ViewPanel_full){
    return {
      version:'1.0',
      semiTransparentMap:this.semiTransparentMap,
      semiTransparentMapEdges:this.semiTransparentMapEdges,
      hideObtainedIcons:this.hideObtainedIcons,
      displayAct3:this.displayAct3,
      displaySteelSoul:this.displaySteelSoul,
      displayIconLabels:this.displayIconLabels,
      displayMapLabels:this.displayMapLabels,
      displayMapLinks:this.displayMapLinks,
      displayMapEdges:this.displayMapEdges,
    };
  }
  reset = function(this:ViewPanel_full){
    Object.assign(this, getDefaultVals());
    this.onChange();
  }
  onChange = function(this:ViewPanel_full){
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.getStateObj()));
    } catch(err){}

    const el = this.gmap.myMap.getContainer();

    if(this.isSilksong){
      el.classList.toggle('map-tag-act3', this.displayAct3);
      el.classList.toggle('map-tag-steelSoul', this.displaySteelSoul);
    }

    el.classList.toggle('map-display-icon-label', this.displayIconLabels);

    el.classList.toggle('map-semi-transparent', this.semiTransparentMap);
    el.classList.toggle('map-semi-transparent-mapEdge', this.semiTransparentMapEdges);
    el.classList.toggle('map-hideObtainedIcons', this.hideObtainedIcons);

    const ovLayIdx = this.gmap.activeOverlayIdx;

    //it is permitted to manually call layerGroup.addTo because those layers aren't displayed in the mainControl
    const mapLabelLayer = this.gmap.layers.find(lay => lay.id === LAYER_MAP_LABEL);
    if (mapLabelLayer){
      if (this.displayMapLabels)
        mapLabelLayer.layerGroupByOverlay[ovLayIdx].addTo(this.gmap.myMap);
      else
        mapLabelLayer.layerGroupByOverlay[ovLayIdx].removeFrom(this.gmap.myMap);
    }

    const mapLinkLayer = this.gmap.layers.find(lay => lay.id === LAYER_MAP_LINK);
    if (mapLinkLayer){
      if (this.displayMapLinks)
        mapLinkLayer.layerGroupByOverlay[ovLayIdx].addTo(this.gmap.myMap);
      else
        mapLinkLayer.layerGroupByOverlay[ovLayIdx].removeFrom(this.gmap.myMap);
    }

    const mapEdgeLayer = this.gmap.layers.find(lay => lay.id === LAYER_MAP_EDGES);
    if (mapEdgeLayer){
      if (this.displayMapEdges)
        mapEdgeLayer.layerGroupByOverlay[ovLayIdx].addTo(this.gmap.myMap);
      else
        mapEdgeLayer.layerGroupByOverlay[ovLayIdx].removeFrom(this.gmap.myMap);
    }
  }
  onOverlayChange(this:ViewPanel_full){
    const layerIds = [LAYER_MAP_LABEL, LAYER_MAP_LINK, LAYER_MAP_EDGES];
    layerIds.forEach(id => {
      const layer = this.gmap.layers.find(lay => lay.id === id);
      if (layer)
        layer.layerGroupByOverlay.forEach(grp => {
          this.gmap.myMap.removeLayer(grp);
        });
    });

    this.onChange(); //add back the layers
  }
  applyLocalStorage = function(this:ViewPanel_full){
    try {
      const s = localStorage.getItem(this.localStorageKey);
      if (!s)
        return;

      const d = JSON.parse(s);
      if(!d || d.version !== '1.0')
        return;

      this.semiTransparentMap = !!d.semiTransparentMap;
      this.semiTransparentMapEdges = !!d.semiTransparentMapEdges;
      this.displayAct3 = !!d.displayAct3;
      this.displaySteelSoul = !!d.displaySteelSoul;
      this.hideObtainedIcons = !!d.hideObtainedIcons;
      this.displayIconLabels = !!d.displayIconLabels;
      this.displayMapLabels = !!d.displayMapLabels;
      this.displayMapLinks = !!d.displayMapLinks;
      this.displayMapEdges = !!d.displayMapEdges;

      this.onChange();
    } catch(err){
      console.error('error loading view panel settings');
    }
  }
};

export type ViewPanel_full = methods & ReturnType<typeof data> & {
  $el:HTMLElement,
  $mount:() => void,
  $refs:{}
};

export class ViewPanel {
  static sidebar:LeafletSidebar;

  static vue:ViewPanel_full;

  static addPanel(gmap:GenericMap){
    const {config, myMap} = gmap;

    const vSave = <ViewPanel_full>new Vue(withRenderSave({
      data:data(config, gmap),
      methods:new methods(),
      mounted:function(this:ViewPanel_full){
        ViewPanel.sidebar = gmap.createSidebar(this.$el, 'glyphicon-eye-open' ,"Display Settings");
      }
    }));
    vSave.$mount();
    vSave.applyLocalStorage();
    vSave.onChange();
    ViewPanel.vue = vSave;
    return vSave;
  }
}

