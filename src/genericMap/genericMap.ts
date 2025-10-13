/*! LICENSED CODE BY SAMUEL MAGNAN-LEVESQUE FOR SCRIPTERSWAR.COM */
//TODO: wrong map tiling above flukeswarm. check Yumi on discord.

import { Config, isMobile } from "./Config";
import {createOverlay} from "./createOverlay";
import { ContributorPanel } from "./contributorSideBar";
import { IconLayer, MyMarker, dependencies, htmlHelper, polyline } from "./markerHelpers";
import { SavePanel } from "./saveSideBar";
import { initShowHideAll } from "./showHideAll";
import { SpeedrunPanel } from "./speedrunSideBar";

const config = Config.c;

declare let L:any;

(<any>window).markersJSON = []; // for debug

let prevMapLinkClickLatLng:number[] | null = null;

export class GenericMap {
  static controlLayers:any;

  static init(){ //called from .html after hkMap_data is loaded
    GenericMap.addOverlay();

    SavePanel.addSavePanel(dependencies.myMap, () => {
      SpeedrunPanel.speedrunSidebar?.hide();
      ContributorPanel.contributorSidebar?.hide();
    });

    ContributorPanel.addContributor(dependencies.myMap, () => {
      SpeedrunPanel.speedrunSidebar?.hide();
      SavePanel.saveSidebar?.hide();
    });

    if(config.speedrunLinks.length){
      SpeedrunPanel.addSpeedrun(dependencies.myMap, () => {
        SavePanel.saveSidebar?.hide();
        ContributorPanel.contributorSidebar?.hide();
      });
    }

    dependencies.vSave = SavePanel.vSave; //BAD

    GenericMap.initShowHideAll();

    if (isMobile()) // alternative to mouseover title
      GenericMap.addLastClickedIconName();
  }

  static addOverlay(){
    let overlay:any;
    let overlaySemi:any;

    if (config.mapIsSplitInMultipleImages){
      overlay = createOverlay(config).setOpacity(config.mainImgOpacity).addTo(dependencies.myMap);
      overlaySemi = createOverlay(config).setOpacity(0.5);
      const initView = config.getInitialView();
      dependencies.myMap.setView(initView.pos, initView.zoom);
    } else {
      const f = function(){
        return L.imageOverlay(config.nonDetailedImageUrl, config.nonDetailedImageBounds);
      }

      overlay = f().setOpacity(config.mainImgOpacity).addTo(dependencies.myMap);
      overlaySemi = f().setOpacity(0.25);
      dependencies.myMap.fitBounds(config.nonDetailedImageBounds);
    }

    //controls
    const controlOverlays:DictObj<any> = {};
    IconLayer.forEachMarkerLayers(layer => {
      const img = htmlHelper(layer.iconUrl,24,true);
      controlOverlays[`<span class="div-h">${img} ${layer.name}</span>`] = layer.layerGroup;
    });
    GenericMap.controlLayers = L.control.layers({
      "Opaque Map":overlay,
      "Semi-Transparent Map":overlaySemi,
    }, controlOverlays,{collapsed:false}).addTo(dependencies.myMap);

    dependencies.myMap.on('click', function(e:any) {
      if (!e.latlng)
        return;

      if(ContributorPanel.vContributor.contributorMode === 'none')
        return;

      if(ContributorPanel.vContributor.contributorMode === 'icon'){
        //TEMP move to contributor panel
        const tooClose = IconLayer.getAllMarkers().some(m => {
          const MAX_DIST = config.mapIsSplitInMultipleImages ? 0.2 : 2;
          return (Math.abs(e.latlng.lat - m._latlng.lat) + Math.abs(e.latlng.lng - m._latlng.lng)) <= MAX_DIST;
        });
        if(tooClose){
          alert("Error: This icon is too close to an existing icon.");
          return;
        }

        const quickEdit = !e.originalEvent.ctrlKey;
        const p = quickEdit ? '' : prompt("Description") || '';

        const lat = e.latlng.lat.toFixed(config.mapIsSplitInMultipleImages ? 1 : 0);
        const lng = e.latlng.lng.toFixed(config.mapIsSplitInMultipleImages ? 1 : 0);
        const px = config.convertWHToPixel([lat,lng]);
        const txt = `{"pos":[${px[0]},${px[1]}],"name":"${p}","iconUrl":""},\n`;
        GenericMap.addToTextArea(txt);

        const POKEMON = false;
        if(POKEMON)
          navigator.clipboard.writeText(`,"pos":[${px[0]},${px[1]}]`);

        const newMark = MyMarker(px,"contributorMarker.png",p);
        if(newMark)
          newMark.addTo(ContributorPanel.contributorLayer);
      }


      if(ContributorPanel.vContributor.contributorMode === 'mapLink'){
        const lat = e.latlng.lat.toFixed(config.mapIsSplitInMultipleImages ? 1 : 0);
        const lng = e.latlng.lng.toFixed(config.mapIsSplitInMultipleImages ? 1 : 0);
        const px = config.convertWHToPixel([lat,lng]);

        if(!prevMapLinkClickLatLng){
          prevMapLinkClickLatLng = px;
          return;
        }

        const txt = `[[${prevMapLinkClickLatLng[0]},${prevMapLinkClickLatLng[1]}],[${px[0]},${px[1]}]],\n`;
        GenericMap.addToTextArea(txt);

        const line = polyline(<any>[...prevMapLinkClickLatLng, ...px]);
        prevMapLinkClickLatLng = null;

        line.addTo(ContributorPanel.contributorLayer);
      }
    });
  }
  static addToTextArea = function(str:string){
    const ta = (<HTMLTextAreaElement>document.getElementById('contribTextArea'));
    ta.value += str;
  }

  static initShowHideAll(){
    initShowHideAll(dependencies.myMap, IconLayer, GenericMap.controlLayers, config.alternativeMap);
  }

  static addLastClickedIconName(){
    const MyCustomControl = L.Control.extend({
      options: {
          position: 'bottomleft'
      },
      initialize: function (options:any) {
          L.Util.setOptions(this, options);
      },
      onAdd: function () {
          this._container = L.DomUtil.create('div', 'leaflet-bar');
          this._container.id = 'lastClickedIconName';

          L.DomEvent.disableClickPropagation(this._container);
          L.DomEvent.disableScrollPropagation(this._container);

          return this._container;
      },
    });

    const myCustomControl = new MyCustomControl({});

    myCustomControl.addTo(dependencies.myMap);
  }

}
