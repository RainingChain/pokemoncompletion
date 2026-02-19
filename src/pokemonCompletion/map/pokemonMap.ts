import "../../genericMap/libGroup";
import "../../genericMap/genericMap.css";

import { Config, OverlayConfig } from "../../genericMap/Config";
import { htmlHelper, IconLayer, MyPolyline } from "../../genericMap/markerHelpers";
import { createOverlay } from "../../genericMap/createOverlay";
import { getIconData } from "../icons/pokemonIcon";
import { Vue_pokemonCompletion_full } from "../pokemonCompletion";
import { Collectable } from "../pokemonCompletion_data";
import { callableOncePerCycle } from "../pokemonCompletion";
import { ContributorPanel } from "../../genericMap/contributorSideBar";
import { GenericMap } from "../../genericMap/genericMap";
import { GameDataJson } from "../../genericMap/dataHelper";
import L from "leaflet";

/*
TODO:
  flyTo

  htmlHelper fallback to border color

  run convertPixelToWH on yellow.json

    mouse over multi icon should have title

*/


/*
Ctrl        + Click => [pos]
Alt         + Click => [pos,pos]
Alt + Shift + Click => reset
*/

/*


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

const convertWHToPixel = (config:Config,obj:number[]) : [number, number] => {
  const br = config.overlays[0].getBottomRightIncludingBlack();
  const dim = config.overlays[0].getDim();
  // wh / totalWh  ==  px / totalPx
  // => px = wh / totalWh * totalPx
  return [
    obj[0] / br[0] * dim.h,
    obj[1] / br[1] * dim.w,
  ];
}

const MAP_LINK_ICON = 'misc/teleport.png';

const USE_LOCAL_IMG = false; //NO_PROD window.location.href.includes('localhost') && !window.location.href.includes('prod');

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
  contributorMarker = 'pokemon/p1.png';
  onlyStackSameImgIcons = false;


/*
  htmlHelper(data:ReturnType<typeof getIconData>,size:number,embed:boolean){
    const inside = document.createElement('div');
    if (!data)
      return inside;

    inside.classList.add('genericMap-marker');
    [data.sizeClass, data.spriteClass, data.colorClass].forEach(c => {
      if(c)
        inside.classList.add(c);

    });
    if(!embed)
      return inside;

    const outside = document.createElement('div');
    outside.style.width = `${size}px`;
    outside.style.height = `${size}px`;
    outside.appendChild(inside);
    return outside;
  }*/
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
              pos:col.pos, // .map(pos), // => convertPixelToWH(config, pos)),
              name:col.name,
              iconUrl:col.iconData?.id,
              href:col.href || undefined,
              uid:col.uid, //NO_PROD
              flag:null,
              extraClasses:col.iconData?.colorClass, //NO_PROD add more class
              legacyIds:[],
              tags:[],
            };
          }).filter(a => a),
        }
      }),
    };
  }

  static createAndMount(data:Vue_pokemonCompletion_full){
    if(!data.interactiveMap)
      return null;
    
    const config = PkInteractiveMap.createConfig(data.interactiveMap);
    const gmap = new PkInteractiveMap(config, data);
    gmap.createLeafMap();

    const gmapData = PkInteractiveMap.createGameDataJson(config, data);

    gmap.createMarkersFromJson(gmapData, {});
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
  protected createMapLinkLayer(){
    const mapLabel = (pxPos:[number,number], text:string,className='mapLabel') => {
      const ltnLagPos = this.config.convertPixelToWH(pxPos);
      return new L.marker(ltnLagPos, { icon:this.getOrCreateIcon({className, html:text, iconSize:null}) });
    };


    const markers = this.inp.locations.map(loc => {
      if(!loc.pos || !loc.pos.length)
        return null!;
      return mapLabel(loc.pos, loc.name);
    });

    return new IconLayer({
      id:'mapLink',
      name:'Map Labels',
      iconUrl:"misc/townMap.png",
      markers:[
        ...markers,
        ...lines.flat(),
      ],
      isVisibleByDefault:true,
    });
  }*/
  /*
  
    ['overlayadd','overlayremove'].forEach(evt => {
      this.myMap.on(evt, (e:any) => {
        this.inp.updateInteractiveMapIconsVisibility();
      });
    });

    this.inp.categories.forEach(c => {
      c.list.forEach(c => c.onChange.forEach(f => f()));
    });
    */
   /*
  flyToCollectable_lastElements:HTMLElement[] = [];

  async flyToCollectable(c:Collectable){
    this.flyToCollectable_lastElements.forEach(el => el.classList.remove('icon-highlighted'));
    this.flyToCollectable_lastElements = [];

    const pos = c.pos;
    if(!pos || !pos.length)
      return;

    if(!this.inp.displayInteractiveMap)
      await this.inp.toggleDisplayInteractiveMap();

    const header = document.getElementById('interactiveMapHeader');
    if(!header)
      return;

    header.scrollIntoView();
    setTimeout(() => {
      this.myMap.flyTo(this.config.convertPixelToWH(<[number,number]>pos[0]), this.config.getTotalMaxZoom());

      const markers = this.markersByCollectable.get(c) || [];
      markers.forEach(marker => {
        const genericMarker = marker.getElement()?.querySelector('.genericMap-marker');
        if (genericMarker){
          genericMarker.classList.add('icon-highlighted');
          this.flyToCollectable_lastElements.push(genericMarker);
        } else {
          console.error('no genericMarker');
        }
      });

    }, 250);
  }
*/
}
