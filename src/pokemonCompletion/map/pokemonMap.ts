import "../../genericMap/libGroup";
import "../../genericMap/genericMap.css";

import { Config, OverlayConfig } from "../../genericMap/Config";
import { IconLayer } from "../../genericMap/markerHelpers";
import { createOverlay } from "../../genericMap/createOverlay";
import { getIconData } from "../icons/pokemonIcon";
import { Vue_pokemonCompletion_full } from "../pokemonCompletion";
import { Collectable } from "../pokemonCompletion_data";
import { callableOncePerCycle } from "../pokemonCompletion";
import { ContributorPanel } from "../../genericMap/contributorSideBar";
import { GenericMap } from "../../genericMap/genericMap";

/*
add uid to json.
add group to json

*/


/*
Ctrl        + Click => [pos]
Alt         + Click => [pos,pos]
Alt + Shift + Click => reset
*/

/*


  convertPixelToWH(px:[number,number]){
    if(!this.usePxRefForIconPos)
      return px;

    const br = this.getBottomRight();
    const dim = this.getDim();
    // wh / totalWh  ==  px / totalPx
    // => wh = px / totalPx * totalWh
    return [
      px[0] / dim.h * br[0],
      px[1] / dim.w * br[1],
    ];
  }
  convertWHToPixel(obj:[number,number]) : [number, number]{
    if(!this.usePxRefForIconPos)
      return obj;

    const br = this.getBottomRight();
    const dim = this.getDim();
    // wh / totalWh  ==  px / totalPx
    // => px = wh / totalWh * totalPx
    return [
      obj[0] / br[0] * dim.h,
      obj[1] / br[1] * dim.w,
    ];
  }
    */

const MAP_LINK_ICON = 'misc/teleport.png';

const USE_LOCAL_IMG = false; //NO_PROD window.location.href.includes('localhost') && !window.location.href.includes('prod');
const ICON_SIZE = 24; //hardcoded in .css

type LeafletEvent = {latlng:{lat:number,lng:number},originalEvent:MouseEvent};

const allMarkers:any[] = [];
(<any>window).debug_markers = allMarkers;

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
  imgCredit = '';
  mapLinks:number[][][] = [];
};

export class PkInteractiveMap extends GenericMap {
  constructor(config:Config,
              public inp:Vue_pokemonCompletion_full){
    super(config);
  }
  displayContributorButton = false;
  displayChecklistButton = false;
  displaySaveRestoreStatButton = false;

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

    const polyline = (pos:[[number,number],[number,number]],dashArray:string|null='1 8') => {
      const pos0 = this.config.convertPixelToWH(pos[0]);
      const pos1 = this.config.convertPixelToWH(pos[1]);
      let opacity = 0;
      const line = new L.polyline([pos0,pos1],{
        color: 'white',
        weight: dashArray ? 2 : 3,
        opacity,
        smoothFactor: 1,
        dashArray,
      });
      const icons = [pos0,pos1].map(p => {
        const iconSize = ICON_SIZE / 2;
        const m = L.marker(p, {
          icon:this.getOrCreateIcon({
            className:'mapLink-marker',
            html:this.htmlHelper(getIconData(MAP_LINK_ICON), iconSize,false,),
            iconSize: [iconSize,iconSize],
            iconAnchor: [iconSize / 2, iconSize / 2],
          })
        });
        m.on('click',function(e:LeafletEvent){
          if(e.originalEvent.shiftKey)
            alert(`${pos[0]},${pos[1]}`);
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
    };

    const markers = this.inp.locations.map(loc => {
      if(!loc.pos || !loc.pos.length)
        return null!;
      return mapLabel(loc.pos, loc.name);
    });
    const lines = this.inp.interactiveMap!.mapLinks.map(link => {
      return polyline(<[[number,number],[number,number]]>link);
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
  static createAndMount(data:Vue_pokemonCompletion_full){
    if(!data.interactiveMap)
      return null;
    const config = PkInteractiveMap.createConfig(data.interactiveMap);
    const gmap = new PkInteractiveMap(config, data);
    gmap.createLeafMap();
    gmap.init();

      
    /*gmap.createMarkersFromJson({
      ...data,
      groups:[]
    }, {
      isAlwaysVisible:(jsonMarker) => jsonMarker.name.includes('Bench') || jsonMarker.name.includes('Stag Station'),
      getLegacyIds:(colJson) => {
        return [
          ...(colJson.legacyIds ?? []),
          ...((<any>colJson).legacyIds2 ?? [])
        ];
      }
    });*/

    (<any>window).debug_PkInteractiveMap = gmap;
    return gmap;
  }
}
