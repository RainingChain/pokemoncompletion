import "../../genericMap/libGroup";
import "../../genericMap/genericMap.css";

import { Config, OverlayConfig } from "../../genericMap/Config";
import { htmlHelper, IconLayer, MyPolyline } from "../../genericMap/markerHelpers";
import { createOverlay } from "../../genericMap/createOverlay";
import { getIconData } from "../icons/pokemonIcon";
import { Vue_pokemonCompletion_full } from "../pokemonCompletion";
import { Collectable as PkCollectable } from "../pokemonCompletion_data";
import { callableOncePerCycle } from "../pokemonCompletion";
import { ContributorPanel } from "../../genericMap/contributorSideBar";
import { GenericMap } from "../../genericMap/genericMap";
import { GameDataJson } from "../../genericMap/dataHelper";
import {Collectable as GenericMapCollectable} from "../../genericMap/Collectable";
import L from "leaflet";

/*
TODO:

  run convertPixelToWH on all .json

test:
  test change overlay in silksong

  rename htmlHelper to createIconDiv

*/

const convertPixelToWH = (config:Config, px:number[]) : [number,number] => {
  if(px[0] === 655)
    debugger;
  const br = config.overlays[0].getBottomRightIncludingBlack();
  const dim = config.overlays[0].getDim();
  // wh / totalWh  ==  px / totalPx
  // => wh = px / totalPx * totalWh
  return [
    px[0] / dim.h * br[0],
    px[1] / dim.w * br[1],
  ];
}

const MAP_LINK_ICON = 'misc/teleport.png';

let USE_LOCAL_IMG = false;
if (!window.location.href.includes('localhost'))
  USE_LOCAL_IMG = false; //DONT TOUCH

const mapSetOrPush = function<T,U>(map:Map<T,U[]>, key:T, val:U){
  const arr = map.get(key);
  if(!arr)
    map.set(key, [val]);
  else
    arr.push(val);
};

export class PkInteractiveMapInput {
  url = ``;
  dim = {w:16384,h:8192};
  digitalZoom = 1; // only value = 1 is supported. to support > 1, we need to adapt getTileUrl and tileloadstart
  mapZoomIconScaleModifier = 0;
  initialPos = {zoom:1, pos:[0,0]};
  cropSize = 512;
  mapContributors:Config['contributors'] = [];
  mapLinks:number[][][] = [];
};

export class PkInteractiveMap extends GenericMap {
  constructor(config:Config,
              public inp:Vue_pokemonCompletion_full){
    super(config);
  }
  displayContributorButton = true; //window.location.href.includes('contributor');
  displayChecklistButton = false;
  displaySaveRestoreStatButton = false;
  onlyStackSameImgIcons = false;
  baseWikiLink = 'https://bulbapedia.bulbagarden.net/wiki'

  static createConfig(mapData:PkInteractiveMapInput){
    return Config.create({
      mapZoomIconScaleModifier:mapData.mapZoomIconScaleModifier,
      contributors:mapData.mapContributors,
      overlays:[
        OverlayConfig.create({
          digitalZoom:mapData.digitalZoom,
          getUrl:function(){
            if (USE_LOCAL_IMG)
              return `/genericMap-image/{z}_{x}_{y}.png?v=1`;
            return mapData.url;
          },
          getDim:function(){
            return mapData.dim;
          },
          getCropSize:function(){
            return mapData.cropSize;
          },
          getInitialView(){
            return mapData.initialPos;
          },
        })
      ],
    });
  }
  static createGameDataJson(config:Config, data:Vue_pokemonCompletion_full) : GameDataJson {
    return {
      groups:data.categories.map(cat => {
        return {
          id: cat.id,
          name: cat.name,
          iconUrl: cat.iconUrl,
          isVisibleByDefault: cat.iconVisibleByDefault,
        }
      }),
      categories:data.categories.map(cat => {
        return {
          group: cat.id,
          href: cat.url || undefined,
          iconUrl: cat.iconUrl,
          name:cat.name,
          list: cat.list.map(col => {
            if(!col.pos)
              return null!;
            return {
              pos:col.pos,
              name:col.name,
              iconUrl:col.iconData?.id,
              href:col.href || undefined,
              uid:col.uid,
              flag:null,
              extraClasses:col.iconData?.colorClass,
              legacyIds:[],
              tags:[],
            };
          }).filter(a => a),
        }
      }),
    };
  }

  set2WaysBindingForCollectables(data:Vue_pokemonCompletion_full){
    data.getAllCollectables().forEach(pkCol => {
      const gcol = this.collectableByUid.get(pkCol.uid);
      if(!gcol)
        return;

      pkCol.onChange.push(() => { 
        let changed = false;
        const newVis = data.isVisible(pkCol);
        if(gcol.isVisibleCustomReason !== newVis){
          gcol.isVisibleCustomReason = newVis;
          changed = true;
        }

        const newMarked = pkCol.obtained;
        if(gcol.marked !== newMarked){
          gcol.marked = newMarked;
          changed = true;
        }

        if(changed)
          gcol.emitOnChange();
      });

      gcol.onChange.push(() => {
        if(pkCol.obtained !== gcol.marked){
          pkCol.obtained = gcol.marked;
          data.onCollectableObtainedStatusChange(pkCol);
        }
      });
    });

  }

  static createAndMount(data:Vue_pokemonCompletion_full){
    if(!data.interactiveMap)
      return null;

    const config = PkInteractiveMap.createConfig(data.interactiveMap);
    const gmap = new PkInteractiveMap(config, data);
    gmap.createLeafMap();

    const gmapData = PkInteractiveMap.createGameDataJson(config, data);

    gmap.createMarkersFromJson(gmapData, {});
    gmap.set2WaysBindingForCollectables(data);

    gmap.createMapLabelLayer([
      data.locations.filter(loc => loc.pos).map(loc => {
        return {name:loc.name, pos:convertPixelToWH(config, loc.pos!)};
      })
    ])
    gmap.createMapLinkLayer([
      data.interactiveMap.mapLinks.map(mapLink => gmap.createMapLinkMarkers(mapLink)).flat()
    ]);

    gmap.init();


    (<any>window).debug_PkInteractiveMap = gmap;
    return gmap;
  }

  createMapLinkMarkers(pos:[[number,number],[number,number]] | number[][]){
    const pos0 = convertPixelToWH(this.config, pos[0]);
    const pos1 = convertPixelToWH(this.config, pos[1]);
    let opacity = 0;
    const line = MyPolyline([pos0,pos1],{
      color: 'white',
      weight: 2,
      opacity,
      smoothFactor: 1,
      dashArray:'1 8',
    });
    const icons = [pos0,pos1].map(p => {
      const iconSize = 24 / 2;
      const m = L.marker(p, {
        icon:this.getOrCreateIcon({
          className:'mapLink-marker',
          html:htmlHelper(MAP_LINK_ICON, iconSize,false,),
          iconSize: [iconSize,iconSize],
          iconAnchor: [iconSize / 2, iconSize / 2],
        })
      });

      m.on('click',function(){
        opacity = 1 - opacity;
        line.setStyle({opacity});
      });
      //mouseover/out only matters if map link isnt clicked
      m.on('mouseover',function(){
        if(opacity === 0)
          line.setStyle({opacity:1});
      });
      m.on('mouseout',function(){
        if(opacity === 0)
          line.setStyle({opacity:0});
      });
      return m;
    });
    return [...icons, line];
  }
  /*

    cols.forEach(col => {
      col.onChange.push(callableOncePerCycle(() => {
        const visibles = icons.filter(icon => this.inp.isVisible(icon.col));
        const shouldBeInMap = visibles.length > 0;
        const firstNotObtained = visibles.find(icon => !icon.col.obtained);
        const allObtained = !firstNotObtained;
        if (shouldBeInMap){
          marker.setOpacity(allObtained ? 0.2 : 1);
          if(firstNotObtained)
            marker.setIcon(firstNotObtained.icon);
        }

        const domEl:HTMLElement = marker.getElement();
        if(domEl)
          domEl.style.display = shouldBeInMap ? '' : 'none';
      }));
      mapSetOrPush(this.markersByCollectable, col, marker);
    });

    return marker;
  }

    col.onChange.push(() => {
      let shouldBeInMap = this.inp.isVisible(col);
      if(col.obtained && col.categoryId === 'pokemon' && col.id !== this.inp.categoriesMap.get(col.categoryId)?.lastClickedId)
        shouldBeInMap = false;

      if (shouldBeInMap)
        marker.setOpacity(col.obtained ? 0.2 : 1);

      const domEl:HTMLElement = marker.getElement();
      if(domEl)
        domEl.style.display = shouldBeInMap ? '' : 'none';
    });
  */
   /*
*/

  async flyToPkCollectable(c:PkCollectable){
    const gcol = this.collectableByUid.get(c.uid);
    if(!gcol)
      return;

    if(!this.inp.displayInteractiveMap)
      await this.inp.toggleDisplayInteractiveMap();

    const header = document.getElementById('interactiveMapHeader');
    if(header)
      header.scrollIntoView();

    setTimeout(() => {
      this.flyToCollectable(gcol);
    }, 250);
  }
}
