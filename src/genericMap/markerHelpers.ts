
import { Config } from "./Config";
const config = Config.c;

declare let L:any;
export type Pos = [number,number] | [number,number,number,number];

export const createBasicMarkers = function(name:string, iconUrl:string, positions:Pos[], klass=''){
  return positions.map(pos => MyMarker(pos,iconUrl,name,null, klass));
}

export const createPopupText = function(list:{iconUrl:string,name:string}[]){
  const lis = list.map(el => {
    const img = el.iconUrl ? htmlHelper(el.iconUrl,16,true) : ''
    return `<tr>
      <td>${img}</td>
      <td><span style="margin-left:5px">${el.name}</span></td>
    </tr>`;
  }).join('');

  return `<table>${lis}</table>`;
}

export const easyButton = function(myClass:string, title:string, onclick:() => void){
  return L.easyButton({
    states: [{
      stateName: 'whatever',
      icon:myClass,
      title:title,
      onClick:onclick,
    }]
  });
}

const iconModelHistory = new Map<string /*iconUrl*/,any>();

export const dependencies = {
  myMap:<any>null,
  vSave:<any>null,
}

export const MyMarker = function(pos2:Pos,iconUrl:string,title:string,popupText?:string|null,klass=''){
  let pos:number[] = [];
  const unusedPos:number[] = [];

  pos2.forEach((p,i) => {
    if (i === config.mapPosIdx * 2 || i === config.mapPosIdx * 2 + 1)
      pos.push(p);
    else
      unusedPos.push(p);
  });

  if(pos.length !== 2)
    pos = [-100000,-100000];
  if(pos[0] === 0 && pos[1] === 0)
    return null;

  pos = config.convertPixelToWH(<[number,number]>pos);

  (<any>window).markersJSON.push({pos:pos, unusedPos, iconUrl, title});

  if(config.DEBUG)
    title = pos.toString() + '  ' + title;

  const cacheKey = [iconUrl,title,popupText,klass].join('@');
  const icon = iconModelHistory.get(cacheKey) || L.divIcon({
    className:'',
    html:htmlHelper(iconUrl,20,false, klass),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
  iconModelHistory.set(cacheKey,icon);

  const opts = {
    title:title,
    riseOnHover:true,
    icon: icon,
  };
  const marker = L.marker(pos, opts);

  if(popupText){
    const myPopup = L.popup()
        .setLatLng(pos)
        .setContent(popupText)

    marker.bindPopup(popupText);
    marker.on('mouseover', function (e:any) {
      myPopup.openOn(dependencies.myMap);
    });
    marker.on('mouseout', function (e:any) {
      myPopup.removeFrom(dependencies.myMap);
    });
  }
  marker.on('click',function(ev:{originalEvent:MouseEvent}){
    if(config.noActionIconUrls.includes(iconUrl))
      return; //BAD
    if(marker.options.opacity === 1)
      marker.setOpacity(0.2);
    else
      marker.setOpacity(1);
    dependencies.vSave.onPostMapStateChange();
  });
  marker.on('click',function(ev:{originalEvent:MouseEvent}){
    if(!ev.originalEvent.shiftKey)
      return;
    alert(`${title} : [${pos[0]},${pos[1]}]`);
  });

  return marker;
}

export const htmlHelper = function(iconUrl:string,size:number,embed:boolean,klass2?:string){
  if(!iconUrl)
    return '';

  const klass = iconUrl.replace('.png','');
  const wh = config.sizeData[iconUrl];
  if (!wh)
    throw new Error('invalid iconUrl: ' + iconUrl);
  const w = size / wh.w;
  const h = size / wh.h;
  const inside = `<div class="genericMap-marker ${klass} ${klass2 || ''}" style="transform:scale3d(${w}, ${h}, 1);transform-origin:0% 0%"></div>`;
  if(!embed)
    return inside;
  return `<div style="width:${size}px;height:${size}px">${inside}</div>`;
}


export class IconLayer {
  layerGroup = <any>null; // L.layerGroup
  id = '';
  name = '';
  iconUrl = '';
  markers:any[] = [];
  isVisibleByDefault = true;

  constructor(opts:{id:string,name:string,iconUrl:string,markers:any[],isVisibleByDefault?:boolean}){
    this.id = opts.id;
    this.name = opts.name;
    this.iconUrl = opts.iconUrl;
    this.markers = opts.markers.filter((v:any) => !!v);
    this.layerGroup = L.layerGroup(this.markers);

    if(opts.isVisibleByDefault !== undefined)
      this.isVisibleByDefault = opts.isVisibleByDefault;
    if(config.DEBUG)
      this.isVisibleByDefault = true;

    IconLayer.layers.set(this.id,this);
  }
  static getGlitchMarkers(){
    const il = IconLayer.layers.get('glitchSkip');
    if(!il)
      return [];
    return il.markers;
  }
  private static layers = new Map<string,IconLayer>();
  static getLayer(id:string){
    return IconLayer.layers.get(id);
  }
  static forEachLayers(cb:(layer:IconLayer,id:string) => void){
    IconLayer.layers.forEach(lay => {
      cb(lay,lay.id);
    });
  }
  static forEachMarkerLayers(cb:(layer:IconLayer,id:string) => void){
    IconLayer.layers.forEach(lay => {
      if(lay.id === "mapLink")
        return;
      cb(lay,lay.id);
    });
  }
  static getAllMarkers(){
    const list:any[] = [];
    IconLayer.layers.forEach((l,id) => {
      if(id === 'mapLink')
        return;
      list.push(...l.markers);
    });
    return list;
  }
  static getTooCloseMarkers = function(minDist=2){
    const bad:[[number,number],[number,number]][] = [];
    const markers = IconLayer.getAllMarkers();
    markers.forEach(m => {
      markers.forEach(m2 => {
        if(m === m2)
          return;
        const dist = Math.abs(m._latlng.lat - m2._latlng.lat) + Math.abs(m._latlng.lng - m2._latlng.lng);
        if(dist <= minDist)
          bad.push([[m._latlng.lat,m._latlng.lng],[m2._latlng.lat,m2._latlng.lng]]);
      });
    });
    return bad;
  }
}

export const calculateTranslate = function(oldPos:[number,number], newPos:[number,number]){
  const round = function(num:number, decimals=0){
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  return {
    translateArr(list:[number,number][]){
      const res = list.map(pos => {
        return this.translate(pos, false);
      });
      console['log'](JSON.stringify(res));
      return res;
    },
    translate(pos:[number,number], print=true){
      const res = <[number,number]>[round(pos[0] - oldPos[0] + newPos[0], 1), round(pos[1] - oldPos[1] + newPos[1], 1)];
      if (print)
        console['log'](JSON.stringify(res));
      return res;
    },
  }
}