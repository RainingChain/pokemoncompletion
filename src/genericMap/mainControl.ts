
import Vue from "vue";
import withRender from "./mainControl.vue";
import { GenericMap, OverlayInfo } from "./genericMap";
import { ViewPanel } from "./viewPanel";
import { Any, htmlHelper, IconLayer } from "./markerHelpers";
import { Collectable, markerToCollectables } from "./Collectable";
import clarity from "@microsoft/clarity";
import { SavePanel } from "./saveSideBar";

type LayGroupInfo = {
  name:string,
  id:string,
  iconLayer:IconLayer,
  isShown:boolean,
  iconHtml:string,
};

const getSearchableTerms = () => {
  const terms = new Set<string>();
  Collectable.list.forEach(c => {
    const t = c.name.split(' #')[0].trim();
    const t2 = t.split(' (')[0].trim();
    terms.add(t2); //merge Mask #1 and Mask #2 into Mask
  });
  return Array.from(terms).sort();
};

class Data {
  gmap:GenericMap;
  toggleableLayers:LayGroupInfo[] = [];
  isFirstSearch = true;
  searchDataList:{name:string,value:string}[] = [];
  searchValue = '';
  extended = true;
  localStorage_visibleLayers = '';
  saveLocalStorageTimeout:ReturnType<typeof setTimeout> | null = null;
  overlays:OverlayInfo[] = [];
  selectedOverlayIdxStr = '0';
  hasSaveFlagEvaluator = false;

  constructor(gmap:GenericMap){
    this.gmap = gmap;
    this.hasSaveFlagEvaluator = gmap.config.hasSaveFlagEvaluator;

    this.toggleableLayers = gmap.layers.map(lay => {
      if(!lay.toggleableByUser)
        return null!;

      return {
        name:lay.name,
        id:lay.id,
        iconLayer:lay,
        iconHtml:htmlHelper(lay.iconUrl,24,true),
        isShown:lay.isVisibleByDefault,
      };
    }).filter(a => a);

    this.overlays = gmap.overlayInfos.slice(0);

    this.searchDataList = getSearchableTerms().map(term => {
      return {
        value:term,
        name:term,
      };
    });

    this.localStorage_visibleLayers = this.gmap.config.localStorage.visibleLayers;
    this.selectedOverlayIdxStr = '' + this.gmap.activeOverlayIdx;
  }
}


class Methods {
  collapse(this:All){
    this.extended = false;
  }
  extend(this:All){
    this.extended = true;
  }
  onclickDisplaySettings(this:All){
    this.gmap.openCloseSidebar(ViewPanel.sidebar);
  }
  clickLayerGroup(this:All,layGrp:LayGroupInfo){
    this.setLayerGroupVisibility(layGrp.id, layGrp.isShown);
  }
  refreshLayerGroupVisibility(this:All, lay:LayGroupInfo){
    const overlayIdx = this.gmap.activeOverlayIdx;
    const layGrp = lay.iconLayer.layerGroupByOverlay[overlayIdx];
    if(lay.isShown)
      this.gmap.myMap.addLayer(layGrp);
    else
      this.gmap.myMap.removeLayer(layGrp);
  }
  setLayerGroupVisibility(this:All, layGroupId:string, active:boolean){
    const lay = this.toggleableLayers.find(l => l.id === layGroupId);
    if(!lay)
      return;

    lay.isShown = active;
    this.refreshLayerGroupVisibility(lay);
    this.saveVisibleLayers();
  }
  showAll(this:All){
    this.toggleableLayers.forEach(v => {
      this.setLayerGroupVisibility(v.id, true);
    });
  }

  hideAll(this:All){
    this.toggleableLayers.forEach(v => {
      this.setLayerGroupVisibility(v.id, false);
    });
  }


  stopSearch(this:All){
    this.searchValue = '';
    this.onSearchInputChange();
  }
  onSearchInputChange(this:All){
    if (this.isFirstSearch){
      this.isFirstSearch = false;
      try {
        clarity.event('genericMap_search_onchange');
      } catch(err){
        //console.error(err);
      }
    }

    const {myMap} = this.gmap;

    const searchValue = this.searchValue.toLowerCase();
    if (searchValue){
      myMap.getContainer()?.classList.add('map-search-active');

      this.gmap.getAllActiveMarkers().forEach(m => {
        const siblings = markerToCollectables.get(m) ?? [];
        const match = siblings.some(sib => {
          return sib.name.toLowerCase().includes(searchValue);
        });

        if (match && !(<Any>m)._icon)
          m.addTo(myMap);

        if (!match && (<Any>m)._icon)
          m.removeFrom(myMap);
      });
    } else {
      myMap.getContainer()?.classList.remove('map-search-active');

      this.toggleableLayers.forEach(lay => {
        const overlayIdx = this.gmap.activeOverlayIdx;
        const layGrp = lay.iconLayer.layerGroupByOverlay[overlayIdx];
        layGrp.removeFrom(myMap);  //hack to force full refresh
        this.refreshLayerGroupVisibility(lay);
      });
    }
  }
  saveVisibleLayers = function(this:All){
    if (this.saveLocalStorageTimeout !== null)
      clearTimeout(this.saveLocalStorageTimeout);

    this.saveLocalStorageTimeout = setTimeout(() => {
      this.saveVisibleLayers_onTimeout();
      this.saveLocalStorageTimeout = null;
    },100);
  }
  saveVisibleLayers_onTimeout = function(this:All){
    const visLayers = this.toggleableLayers.filter(l => l.isShown).map(a => a.id);

    const str = visLayers.join(',');
    try {
      window.localStorage.setItem(this.localStorage_visibleLayers,str);
    } catch(err){
      console.error('Error saving map state in localStorage.',err);
    }
  }

  loadSavedVisibleLayers(this:All){
    const layIds = window.localStorage.getItem(this.localStorage_visibleLayers);

    if (layIds !== null){
      const visibleLays = layIds ? layIds.split(',') : [];

      this.toggleableLayers.forEach(lay => {
        this.setLayerGroupVisibility(lay.id, visibleLays.includes(lay.id));
      });
    } else {
      // isShown is based on visibleByDefault
      this.toggleableLayers.forEach(lay => {
        this.refreshLayerGroupVisibility(lay);
      });
    }
  }
  getMarkerNearCenterAndOffset(this:All){
    const center = this.gmap.myMap.getCenter();
    const markers = this.gmap.getAllActiveMarkers();

    let closestMarker:L.Marker | null = null;
    let closestDist = Infinity;
    markers.forEach(m => {
      const cols = markerToCollectables.get(m);
      if(!cols || !cols.length)
        return;

      const latLng = m.getLatLng();
      const dist = Math.abs(center.lat - latLng.lat) + Math.abs(center.lng - latLng.lng);
      if (dist < closestDist){
        closestDist = dist;
        closestMarker = m;
      }
    });
    return {center, closestMarker};
  }
  setViewToMarkerOfOldOverlay(this:All,marker:L.Marker,oldCenter:L.LatLng){

    const cols = markerToCollectables.get(marker);
    if(!cols || !cols.length)
      return;

    // Limitation: You can't have collectable with multiple locations AND multiple overlays. flyTo might fly to a
    // different location. To fix, we need to pick the right position (and not just the first one).
    const markerInNewOverlayPos = cols[0].getFirstPosition(this.gmap.activeOverlayIdx);
    if(!markerInNewOverlayPos)
      return;

    const newCenter = markerInNewOverlayPos;

    //hack because setView doesnt work until the map is ready, and we can't know easily when it is ready. whenReady() doesnt work.
    setTimeout(() => {
      this.gmap.myMap.setView(newCenter);
    }, 500);
    setTimeout(() => {
      this.gmap.myMap.setView(newCenter);
    }, 1000);
    setTimeout(() => {
      this.gmap.myMap.setView(newCenter);
    }, 2000);
  }
  onOverlayInputChanged(this:All){
    const {center, closestMarker} = this.getMarkerNearCenterAndOffset();

    const newOvIdx = +this.selectedOverlayIdxStr;
    this.gmap.activateOverlay(newOvIdx);

    this.toggleableLayers.forEach(lay => {
      lay.iconLayer.layerGroupByOverlay.forEach((layGrp,idx) => {
        if (idx !== newOvIdx)
          this.gmap.myMap.removeLayer(layGrp);
        else
          this.refreshLayerGroupVisibility(lay);
      });
    });

    ViewPanel.vue?.onOverlayChange();

    if(closestMarker)
      this.setViewToMarkerOfOldOverlay(closestMarker,center);

    try {
      const key = this.gmap.config.localStorage.overlay;
      if (key)
        window.localStorage.setItem(key, this.selectedOverlayIdxStr);
    } catch(err){}
  }
  onclickLoadSavefile(this:All){
    if(SavePanel.sidebar)
      this.gmap.openCloseSidebar(SavePanel.sidebar);

    this.gmap.vue_saveUpload?.onLoadSaveFileClick();
    try {
      clarity.event('genericMap_onLoadSaveFileClick');
    } catch(err){
      //console.error(err);
    }
  }
}

export type All = Methods & Data & {$el:HTMLElement,$mount:() => void};

export const create_mainControl = (gmap:GenericMap) => {
  const v:All = new Vue(withRender({
    data:new Data(gmap),
    methods:new Methods(),
  }));
  v.$mount();
  v.loadSavedVisibleLayers();
  (<any>window).debug_mainControl = v;
  return v;
};