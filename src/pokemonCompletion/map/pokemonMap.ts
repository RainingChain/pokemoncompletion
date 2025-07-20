import "../../genericMap/libGroup";
declare let L:any;

import { Config } from "../../genericMap/Config";
import { IconLayer } from "../../genericMap/markerHelpers";
import { initShowHideAll } from "../../genericMap/showHideAll";
import { createOverlay } from "../../genericMap/createOverlay";
import { getIconData } from "../icons/pokemonIcon";
import { Vue_pokemonCompletion_full } from "../pokemonCompletion";
import { Collectable } from "../pokemonCompletion_data";
import { callableOncePerCycle } from "../pokemonCompletion";

/*
Ctrl        + Click => [pos]
Alt         + Click => [pos,pos]
Alt + Shift + Click => reset
*/

const MAP_LINK_ICON = 'misc/teleport.png';

const USE_LOCAL_IMG = window.location.href.includes('localhost');
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
  maxZoom = 5;
  digitalZoom = 1;
  mapZoomIconScaleModifier = 0;
  initialPos = {zoom:1, pos:[0,0]};
  cropSize = 512;
  imgCredit = '';
  mapLinks:number[][][] = [];
};

const iconModelHistory = new Map<string,any>();

export class PkInteractiveMap {
  constructor(public domQuery:string, public inp:Vue_pokemonCompletion_full){
  }
  config:Config;
  myMap:any;

  markersByCollectable = new Map<Collectable, any[]>();

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
  }
  protected createConfig(mapData:PkInteractiveMapInput){
    this.config = Config.init({
      nonDetailedImageUrl:null,
      mapZoomIconScaleModifier:mapData.mapZoomIconScaleModifier,
      digitalZoom:mapData.digitalZoom,
      usePxRefForIconPos:true,
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
    });
  }
  protected createMultiMarkerPopupHtml(cols:Collectable[]){
    /*
    <div>
      <div><label><input type="checkbox"> Element </label></div>
    </div>
    */

    const div = document.createElement('div');
    cols.forEach(col => {
      const div2 = document.createElement('div');
      const label = document.createElement('label');
      label.style.alignItems = 'center';
      const input = document.createElement('input');
      input.type = 'checkbox';
      label.append(input, ' ' + col.name);
      label.title = this.inp.categoriesMap.get(col.categoryId)?.name || '';
      div2.appendChild(label);
      div.appendChild(div2);

      input.addEventListener('change', () => {
        col.obtained = input.checked;
        this.inp.onCollectableClicked(col);
      });

      col.onChange.push(() => {
        input.checked = col.obtained;
        label.style.display = this.inp.isVisible(col) ? 'flex' : 'none';
      });
    });
    return div;
  }
  protected getOrCreateIcon(data:any){
    //its more performant to create a div and give it to leaflet.
    //however, that means that multiple icons cant share the same divIcon
    const icon = L.divIcon(data);
    return icon;
  }
  protected createMultiMarker(cols:Collectable[], posPx:[number,number]){
    let title = cols.map(c => c.name).join(', ');
    if (title.length > 40)
      title = title.slice(0, 37) + '...';

    const pos = this.config.convertPixelToWH(posPx);

    const icons = cols.map(col => {
      return {col, icon:this.getOrCreateIcon({
        className:'',
        html:this.htmlHelper(col.iconData,ICON_SIZE,false),
        iconSize: [ICON_SIZE, ICON_SIZE],
        iconAnchor: [ICON_SIZE/2, ICON_SIZE/2],
      })};
    });

    const opts = {
      title:title,
      riseOnHover:true,
      icon: icons[0].icon,
    };
    const marker = L.marker(pos, opts);

    const popupText = this.createMultiMarkerPopupHtml(cols);

    const myPopup = L.popup()
        .setLatLng(pos)
        .setContent(popupText)

    marker.bindPopup(popupText);

    marker.on('click',(ev:LeafletEvent) => {
      if(ev.originalEvent.shiftKey){ //debug
        alert(`${title} : ${posPx}`);
        return;
      }
      myPopup.openOn(this.myMap);
    });

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
  protected createMarker(col:Collectable,posPx:[number,number]){
    if(!col.iconData)
      return;

    const title = `${this.inp.categoriesMap.get(col.categoryId)?.name ?? ''}: ${col.name}`;
    const pos = this.config.convertPixelToWH(<[number,number]>posPx);

    const icon = this.getOrCreateIcon({
      className:'',
      html:this.htmlHelper(col.iconData,ICON_SIZE,false,),
      iconSize: [ICON_SIZE, ICON_SIZE],
      iconAnchor: [ICON_SIZE/2, ICON_SIZE/2],
    });

    const opts = {
      title:title,
      riseOnHover:true,
      icon: icon,
    };
    const marker = L.marker(pos, opts);

    marker.on('click', (ev:LeafletEvent) => {
      if(ev.originalEvent.shiftKey){ //debug
        alert(`${title} : ${posPx}`);
        return;
      }

      col.obtained = !col.obtained;
      this.inp.onCollectableClicked(col);
    });

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

    mapSetOrPush(this.markersByCollectable, col, marker);

    return marker;
  }
  /** for each col in a group, returns the list of same-position cols.
  an icon will only be created for the first cols */
  protected getColGroups(){
    const colsByPos = new Map<string, Collectable[]>();

    this.inp.categories.forEach(cat => {
      cat.list.forEach(col => {
        if(!col.pos)
          return;
        col.pos.forEach(p => {
          const arr = colsByPos.get(JSON.stringify(p)) || [];
          arr.push(col);
          colsByPos.set(JSON.stringify(p), arr);
        });
      });
    });
    return colsByPos;
  }
  protected createIconLayers(){
    const colGroups = this.getColGroups();

    return this.inp.categories.map(cat => {
      const markers = cat.list.map(col => {
        if(!col.pos)
          return null!;
        return col.pos.map(pos => {
          const colGroup = colGroups.get(JSON.stringify(pos));
          if (!colGroup || colGroup.length === 1)
            return this.createMarker(col, <[number,number]>pos);
          if(colGroup[0] !== col)
            return null;  //only created a real leaftlet icon for the first collectable
          return this.createMultiMarker(colGroup, <[number,number]>pos);
        });
      }).filter(a => a).flat().filter(a => a);

      if(!markers.length)
        return null!;

      allMarkers.push(...markers);

      return new IconLayer({
        id:cat.id,
        name:cat.name,
        iconUrl:cat.iconData?.id || '',
        markers,
        isVisibleByDefault:cat.iconVisibleByDefault,
      });
    }).filter(a => a);
  }
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
  }
  convertLatLngToPx(latlng:{lat:number,lng:number}){
    return this.config.convertWHToPixel([latlng.lat, latlng.lng]);
  }
  convertLatLngToPxStr(latlng:{lat:number,lng:number}){
    const arr = this.convertLatLngToPx(latlng);
    return `${arr[0].toFixed(1)},${arr[1].toFixed(1)}`
  }
  protected createMap(){
    this.myMap = L.map(this.domQuery.replace('#',''), this.config.myMapParams());
    const dom:HTMLElement = this.myMap.getContainer();
    if(dom)
      dom.style.imageRendering = 'pixelated';

    this.myMap.on('zoomend', () => {
      let z = this.myMap.getZoom();
      const dom:HTMLElement = this.myMap.getContainer();
      if(!dom)
        return;

      z += this.config.mapZoomIconScaleModifier;

      if (z <= 0)
        z = 0;
      if (z >= 6)
        z = 6;

      let list = ['map-zoom-0','map-zoom-1','map-zoom-2','map-zoom-3','map-zoom-4','map-zoom-5','map-zoom-6'];
      list.forEach((klass,i) => {
        if (i !== z)
          dom.classList.remove(klass);
        else
          dom.classList.add(klass);
      });
    });

    this.myMap.on('click', (e:LeafletEvent) => {
      if(!e.originalEvent.ctrlKey)
        return;

      const txt = this.convertLatLngToPxStr(e.latlng);
      navigator.clipboard.writeText(txt);
    });

    let altTxt:string[] = [];
    this.myMap.on('click', (e:LeafletEvent) => {
      if(!e.originalEvent.altKey)
        return;

      if(e.originalEvent.shiftKey){
        altTxt = [];
        navigator.clipboard.writeText('');
        return;
      }

      const txt = this.convertLatLngToPxStr(e.latlng);
      altTxt.push(txt);

      let res:string[] = [];
      for (let i = 0; i < altTxt.length; i += 2)
        res.push('[' + ['[' + altTxt[i] + ']', '[' + altTxt[i+1] + ']'].toString() + ']');
      navigator.clipboard.writeText(res.join(',\n   '));
    });
  }
  create(){
    if(!this.inp.interactiveMap)
      return;
    this.createConfig(this.inp.interactiveMap);
    this.createMap();

    const overlay = createOverlay(this.config).setOpacity(1).addTo(this.myMap);
    const overlaySemi = createOverlay(this.config).setOpacity(0.5);
    const initView = this.config.getInitialView();
    this.myMap.setView(this.config.convertPixelToWH(<[number,number]>initView.pos), initView.zoom);


    const controlOverlays:DictObj<any> = {};
    const layers = [
      ...this.createIconLayers(),
      this.createMapLinkLayer(),
    ];

    layers.forEach(layer => {
      const img = this.htmlHelper(getIconData(layer.iconUrl),24,true).outerHTML;
      controlOverlays[`<span class="div-h">${img} ${layer.name}</span>`] = layer.layerGroup;
      if(layer.isVisibleByDefault)
        layer.layerGroup.addTo(this.myMap);
    });
    const controlLayers = L.control.layers({
      "Opaque Map":overlay,
      "Semi-Transparent Map":overlaySemi,
    }, controlOverlays,{collapsed:false}).addTo(this.myMap);


    ['overlayadd','overlayremove'].forEach(evt => {
      this.myMap.on(evt, (e:any) => {
        this.inp.updateInteractiveMapIconsVisibility();
      });
    });

    this.inp.categories.forEach(c => {
      c.list.forEach(c => c.onChange.forEach(f => f()));
    });

    initShowHideAll(this.myMap, IconLayer, controlLayers, null);
  }
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

  static createAndMount(domQuery:string, data:Vue_pokemonCompletion_full){
    const imap = new PkInteractiveMap(domQuery, data);
    imap.create();
    (<any>window).debug_PkInteractiveMap = imap;
    return imap;
  }
}
