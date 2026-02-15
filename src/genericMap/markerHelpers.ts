
import { Collectable } from "./Collectable";
import { Config, IS_MULTI_MAP_MODE, IS_CONTRIBUTOR_MODE } from "./Config";
import L from "leaflet";
import { GenericMap } from "./genericMap";

export type Any = any; // use Any when it's a valid usage of any

export type Pos = [number,number];

export const easyButton = function(myClass:string, title:string, onclick:() => void){
  return (<Any>L).easyButton({
    states: [{
      stateName: 'whatever',
      icon:myClass,
      title:title,
      onClick:onclick,
    }]
  });
}

export const MyMarkerMulti = function({
  pos,
  iconUrl,
  title,
  gmap,
  popupDiv,
  klass,
  size=28,
  uids=[],
}:{
  pos:Pos | null,
  iconUrl:string,
  title:string,
  popupDiv:HTMLDivElement,
  gmap:GenericMap | null,
  klass?:string,
  size?:number,
  uids?:number[]
}){
  if(!pos)
    return null;

  if(pos[0] === 0 && pos[1] === 0)
    return null;

  pos = <[number,number]>pos;

  (<Any>window).debug_markersJSON.push({pos, iconUrl, title});

  if(IS_CONTRIBUTOR_MODE)
    title = pos.toString() + ' | '  + title;

  const fullSubTxt = uids ? `<div class="icon-subText">x${uids.length}</div>` : '';

  const div = document.createElement('div');
  div.style.height = `${size}px`;
  div.classList.add('icon-scaling');
  if (klass)
    div.classList.add(klass);
  div.innerHTML = `
    ${fullSubTxt}${htmlHelper(iconUrl,size,false)}
  `;

  const icon = L.divIcon({
    className:'',
    html:div,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });

  const opts = {
    title,
    riseOnHover:true,
    icon: icon,
  };
  const marker = L.marker(<L.LatLngTuple>pos, opts);

  const myPopup = L.popup()
      .setLatLng(<L.LatLngTuple>pos)
      .setContent(popupDiv)

  marker.bindPopup(popupDiv);
  marker.on('click',  (e) => {
    const myMap = (<any>marker)._map;
    if(myMap)
      myPopup.openOn(myMap);
  });

  if(IS_CONTRIBUTOR_MODE){
    let firstTime = true;
    marker.on('click',function(e){
      if(!e.latlng)
        return;

      const lat = +e.latlng.lat.toFixed(2);
      const lng = +e.latlng.lng.toFixed(2);
      const px = [lat,lng];
      const posTerm = gmap?.activeOverlayIdx === 1 ? 'pos2' : 'pos';
      navigator.clipboard.writeText(`"${posTerm}":[${px[0]},${px[1]}]`);

      (<any>window).debug_clickedUid = (<any>window).debug_clickedUid || [];
      const len = (<any>window).debug_clickedUid.length;
      (<any>window).debug_clickedUid.push(...uids);

      if (!firstTime || !IS_MULTI_MAP_MODE)
        return;

      firstTime = false;

      marker.setIcon(L.divIcon({
        html:`<div style="font-size:3em;color:white">${len} x${uids.length}</div>`
      }));
    });
  }

  return marker;
}

export const createMultiMarkerPopupHtml = (cols:Collectable[]) => {
  /*
  <div>
    <div><label><input type="checkbox"> Element </label></div>
  </div>
  */

  const div = document.createElement('div');
  cols.forEach(col => {
    const div2 = document.createElement('div');
    col.tags?.forEach(tag => {
      div2.classList.add('icon-tag-' + tag);
    });
    const label = document.createElement('label');
    label.style.alignItems = 'center';
    const input = document.createElement('input');
    input.type = 'checkbox';
    label.append(input, ' ' + col.name);
    div2.appendChild(label);
    div.appendChild(div2);

    input.addEventListener('change', () => {
      col.setMarked(input.checked);
    });

    col.onChange.push(() => {
      input.checked = col.marked;
      input.style.display = col.isVisible ? '' : 'none';
    });
  });
  return div;
};

export const MyMarker = function({
  pos,
  iconUrl,
  title,
  gmap=null,
  popupText=null,
  klass=[],
  tagClasses=[],
  href='',
  subText='',
  size=20,
  col=null,
  uid=0
}: {
  pos:Pos | null | number[],
  iconUrl:string,
  title:string,
  gmap:GenericMap | null,
  popupText?:string|null,
  href?:string,
  subText?:string,
  klass?:string[],
  tagClasses?:string[],
  size?:number,
  uid?:number,
  col:Collectable | null,
}){
  if(!pos)
    return null;

  if(pos[0] === 0 && pos[1] === 0)
    return null;

  (<Any>window).debug_markersJSON.push({pos:pos, iconUrl, title});

  if(IS_CONTRIBUTOR_MODE)
    title = pos.toString() + ' | '  + title;

  const cacheKey = [iconUrl,title,popupText,...klass].join('@');
  const fullSubTxt = subText ? `<div class="icon-subText">${subText}</div>` : '';

  const div = document.createElement('div');
  div.style.height = `${size}px`;
  div.classList.add('icon-scaling');
  div.classList.add(...tagClasses);
  if (col?.alwaysVisible)
    div.classList.add('icon-alwaysVisible');

  div.innerHTML = `
    ${fullSubTxt}
    ${htmlHelper(iconUrl,size,false, klass)}
  `;
  const icon = L.divIcon({
    className:'',
    html:div,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });



  const opts = {
    title:title,
    riseOnHover:true,
    icon: icon,
  };
  const marker = L.marker(<L.LatLngTuple>pos, opts);

  if(popupText && gmap){
    const myPopup = L.popup()
        .setLatLng(<L.LatLngTuple>pos)
        .setContent(popupText)

    marker.bindPopup(popupText);
    marker.on('mouseover', function (e) {
      myPopup.openOn(gmap.myMap);
    });
    marker.on('mouseout', function (e) {
      myPopup.removeFrom(gmap.myMap);
    });
  }

  if (gmap && col){
    marker.on('click',function(){
      col.setMarked(!col.marked)

      gmap.vSave?.onPostMapStateChange();
    });
  }
  marker.on('click',function(ev:{originalEvent:MouseEvent}){
    const lastTxtName = document.getElementById('lastClickedIconName-name');
    if(lastTxtName){
      lastTxtName.innerText = title;
    }

    const lastTxtWiki = <HTMLAnchorElement>document.getElementById('lastClickedIconName-link');
    if(lastTxtWiki){
      if (href){
        lastTxtWiki.href = href;
        lastTxtWiki.style.display = '';
      }
      else
        lastTxtWiki.style.display = 'none';
    }
  });

  if(IS_CONTRIBUTOR_MODE){
    let firstTime = true;
    marker.on('click',function(e){
      if(!e.latlng)
        return;
      const lat = +e.latlng.lat.toFixed(2);
      const lng = +e.latlng.lng.toFixed(2);
      const px = [lat,lng];
      const posTerm = gmap?.activeOverlayIdx === 1 ? 'pos2' : 'pos';
      navigator.clipboard.writeText(`"${posTerm}":[${px[0]},${px[1]}]`);

      const str = (<HTMLTextAreaElement>document.getElementById('contribTextArea')).value.split('\n');
      const count = str.filter(s => s.includes('"pos"')).length;

      const txt = `{"num":${count}, "pos":[${px[0]},${px[1]}],"name":"","iconUrl":"","flag":""},\n`;
      GenericMap.addToTextArea(txt);

      (<any>window).debug_clickedUid = (<any>window).debug_clickedUid || [];
      (<any>window).debug_clickedUid.push(uid);

      if (!uid || !firstTime || !IS_MULTI_MAP_MODE)
        return;

      firstTime = false;

      marker.setIcon(L.divIcon({
        html:`<div style="font-size:3em;color:white">${(<any>window).debug_clickedUid.length - 1}</div>`
      }));
    });
  }
  return marker;
}

export const htmlHelper = function(iconUrl:string,size:number,embed:boolean,klass2?:string[]) : string {
  if(!iconUrl)
    return '';

  const klass = iconUrl.replace('.png','');
  const wh = Config.iconSizeData[iconUrl];
  if (!wh){
    console.error(new Error('invalid iconUrl: ' + iconUrl));
    if (iconUrl === 'contributorMarker.png')
      return '';
    return htmlHelper('contributorMarker.png', size, embed, klass2);
  }

  const w = size / wh.w;
  const h = size / wh.h;
  const inside = `<div class="genericMap-marker ${klass} ${klass2?.join(' ') ?? ''}" style="transform:scale3d(${w}, ${h}, 1);transform-origin:0% 0%"></div>`;
  if(!embed)
    return inside;
  return `<div style="width:${size}px;height:${size}px">${inside}</div>`;
}


export type IconLayerMarker = Omit<IconLayer,'markers'> & {
  markers:L.Marker[];
}

/** doesnt change after creation */
export class IconLayer {
  id = '';
  name = '';
  iconUrl = '';
  markersByOverlay:(L.Marker | L.Polyline)[][] = [];
  isVisibleByDefault = true;
  alwaysVisible = false;
  areIcons = true;
  toggleableByUser = true;
  layerGroupByOverlay:L.LayerGroup[] = [];

  constructor(opts:{
    id:string,
    name:string,
    areIcons?:boolean,
    iconUrl:string,
    markersByOverlay:(L.Marker | L.Polyline | null)[][] | undefined,
    isVisibleByDefault?:boolean,
    alwaysVisible?:boolean,
    toggleableByUser?:boolean,
    overlayCount:number,
  }){
    this.id = opts.id;
    this.name = opts.name;
    this.iconUrl = opts.iconUrl;
    if (opts.isVisibleByDefault !== undefined)
      this.isVisibleByDefault = opts.isVisibleByDefault;
    if (opts.alwaysVisible !== undefined)
      this.alwaysVisible = opts.alwaysVisible;

    if(opts.areIcons !== undefined)
      this.areIcons = opts.areIcons;
    if(opts.toggleableByUser !== undefined)
      this.toggleableByUser = opts.toggleableByUser;

    for (let i = 0; i < opts.overlayCount; i++){
      this.markersByOverlay[i] = [];

      const subLay = L.layerGroup();
      this.layerGroupByOverlay.push(subLay);
    }

    if (opts.markersByOverlay !== undefined){
      opts.markersByOverlay.forEach((markers,idx) => {
        this.addMarkers(idx, markers);
      });
    }
  }
  addMarkers(overlayIdx:number, markers:(L.Marker | L.Polyline | null)[]){
    markers.forEach((m,i) => {
      if(m)
        this.addMarker(overlayIdx, m);
    });
  }
  addMarker(overlayIdx:number, marker:(L.Marker | L.Polyline)){
    marker.addTo(this.layerGroupByOverlay[overlayIdx]);
    this.markersByOverlay[overlayIdx].push(marker);
  }
}

//for debug/dev
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

export const MyPolyline = function(pos:L.LatLngTuple[], opts:L.PolylineOptions){
  //return MyMarker(pos,"jiji.png","Debug Map Link"); //for debugging
  const poly = L.polyline(pos,opts);
  if (IS_CONTRIBUTOR_MODE){
    poly.on('click',function(e){
      if(e.originalEvent.ctrlKey){
        poly.setStyle({color:'red'});
        navigator.clipboard.writeText(JSON.stringify(pos));
        L.DomEvent.stopPropagation(e);
      }
    });
  }
  return poly;
}

export const polyline = function(pos:number[][],dashArray:string|null=null){
  //return MyMarker(pos,"jiji.png","Debug Map Link"); //for debugging
  return MyPolyline(<L.LatLngTuple[]>pos,{
    color: 'white',
    weight: dashArray ? 2 : 10,
    opacity: 0.5,
    smoothFactor: 1,
    dashArray:dashArray ?? undefined,
  });
}
