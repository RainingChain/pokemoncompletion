


//TODO: wrong map tiling above flukeswarm. check Yumi on discord.

import { Config } from "./Config";
import {createOverlay} from "./createOverlay";
import { ContributorPanel } from "./contributorSideBar";
import { log } from "./log";
import { IconLayer, MyMarker, dependencies, htmlHelper } from "./markerHelpers";
import { SavePanel } from "./saveSideBar";
import { initShowHideAll } from "./showHideAll";
import { SpeedrunPanel } from "./speedrunSideBar";

const config = Config.c;

const quickEdit = window.location.href.includes('localhost');
declare let L:any;

(<any>window).markersJSON = []; // for debug

export class GenericMap {
  static controlLayers:any;

  static init(){ //called from .html after hkMap_data is loaded
    GenericMap.addOverlay();
    ContributorPanel.addContributor(dependencies.myMap, () => {
      SpeedrunPanel.speedrunSidebar.hide();
      SavePanel.saveSidebar.hide();
    });

    SpeedrunPanel.addSpeedrun(dependencies.myMap, () => {
      SavePanel.saveSidebar.hide();
      ContributorPanel.contributorSidebar.hide();
    });

    SavePanel.addSavePanel(dependencies.myMap, () => {
      SpeedrunPanel.speedrunSidebar.hide();
      ContributorPanel.contributorSidebar.hide();
    });
    dependencies.vSave = SavePanel.vSave; //BAD

    GenericMap.initShowHideAll();

    IconLayer.forEachLayers(lay => {
      if(lay.isVisibleByDefault)
        lay.layerGroup.addTo(dependencies.myMap);
    });
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
      if(!ContributorPanel.vContributor.contributorMode || !e.latlng)
        return;
      const tooClose = IconLayer.getAllMarkers().some(m => {
        const MAX_DIST = config.mapIsSplitInMultipleImages ? 0.2 : 2;
        return (Math.abs(e.latlng.lat - m._latlng.lat) + Math.abs(e.latlng.lng - m._latlng.lng)) <= MAX_DIST;
      });
      if(tooClose){
        alert("Error: This icon is too close to an existing icon.");
        return;
      }

      const p = quickEdit ? '' : prompt("Description") || '';

      const lat = e.latlng.lat.toFixed(config.mapIsSplitInMultipleImages ? 1 : 0);
      const lng = e.latlng.lng.toFixed(config.mapIsSplitInMultipleImages ? 1 : 0);
      const px = config.convertWHToPixel([lat,lng]);
      const txt = quickEdit ? `[${px[0]},${px[1]}],` : `${px[0]},${px[1]},${p}\n`;
      GenericMap.addToTextArea(txt);

      if(quickEdit)
        navigator.clipboard.writeText(`,"pos":${txt.slice(0,-1)}`);

      const newMark = MyMarker(px,"contributorMarker.png",p);
      newMark.addTo(ContributorPanel.contributorLayer);
    });
  }
  static addToTextArea = function(str:string){
    const ta = (<HTMLTextAreaElement>document.getElementById('contribTextArea'));
    ta.value += str;
  }

  static initShowHideAll(){
    initShowHideAll(dependencies.myMap, IconLayer, GenericMap.controlLayers, config.alternativeMap);
  }
}

//https://youtu.be/yWYCmv8etuQ

/*
wrong: queest sattion seal is npc
*/

/*
go = function(){
  let v = {"grub":"2326_1312,2252_2290,2174_2934,2196_2570,2072_2396,2004_2452,2148_2104,1170_3572,1190_3998,958_4384,988_3918,992_3564,1138_3384,1076_2556,1922_1566,2034_1622,1978_1733,2196_1028,1590_2518,1418_2742","charm":"1068_1990,984_4154,2234_1306,912_4072","shop":"1136_2017,2276_1944,2297_1944","boss":"2031_1899,1679_2640,2064_2121,2375_2878,954_4071","upgrades":"2594_1222,1422_3422,932_3812,1084_2158,1059_4284,2513_1426","shortcut":"1042_4118,938_3509,932_3718,1602_1856,1086_2048,1517_2840,1489_2721,2175_2924,1204_3608,1057_3665,2025_1948,1044_2622,1634_2727,2448_1214,1119_3476,2333_2694,1028_3625,2080_1906,1961_2137,1134_1999,2266_1276,2146_2074,2168_2633,1091_2588,2440_2922,1619_2778,1045_3645,1052_4385,1149_3955,997_3857,1132_3365,1191_2703,2134_1919","mapMisc":"2452_1188,2332_2716,1142_3670,808_3878","transport":"2272_2002","item":"1135_3956,2135_968,1549_1867,1320_1887,1318_3427,1580_2542,1277_2552,1161_1584,1079_2421,1044_2677,2412_2923,966_4247,1576_2466,2411_2810","geo":"1340_3397,935_4378","glitchSkip":""};


  for(let i in v){
    if(!v[i])
      continue;
    let d = v[i].split(',');
    let res = [];
    d.forEach(d2 => {
      let el = markersJSON.find(m => m.unusedPos[0] + '_' + m.unusedPos[1] === d2);
      if(!el)
        console.error(d2);
      else
        res.push(el.pos[0] + '_' + el.pos[1]), console.error('win');
    })
    v[i] = res.join(',');
  }
  return v;
};
go();
*/