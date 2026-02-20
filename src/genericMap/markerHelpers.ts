
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

export const callableOncePerCycle = function(toCall:(this:any, arg?:any) => void){
  let map:Map<any, any> = new Map();

  return function(this:any, arg?:any){
    const timer = map.get(arg);
    if(timer)
      return;
    const tim = setTimeout(() => {
      toCall.call(this, arg);
      map.delete(arg);
    },1);
    map.set(arg, tim);
  };
}


export const MyMarkerMulti = function({
  pos,
  iconDatas,
  gmap,
  popupDiv,
  size=28,
  cols,
}:{
  pos:Pos | null,
  iconDatas:{
    iconUrl:string,
    extraClasses?:string[],
  }[],
  popupDiv:HTMLDivElement,
  gmap:GenericMap | null,
  cols:Collectable[]
  size?:number,
}){
  if(!pos)
    return null;

  if(pos[0] === 0 && pos[1] === 0)
    return null;

  if(!cols.length)
      return;

  const cat = cols[0].categoryName;

  pos = <[number,number]>pos;

  const getTitle = () => {
    let colCount = cols.filter(c => c.isVisible()).length;
    const title = `x${colCount} ${cat}`;
    if(IS_CONTRIBUTOR_MODE)
      return title +  ' | ' + pos.toString();
    return title; 
  };
  (<Any>window).debug_markersJSON.push({pos, iconUrl:iconDatas[0].iconUrl, cols});

  const subTexts:HTMLElement[] = [];
  const icons = iconDatas.map(iconData => {
    const div = document.createElement('div');
    div.style.height = `${size}px`;
    div.classList.add('icon-scaling');
    if (cols.length){
      const subText = document.createElement('div');
      subText.classList.add('icon-subText');
      subText.innerText = getTitle().split(' ')[0];
      subTexts.push(subText);
      div.append(subText);
    }
    div.append(htmlHelper(iconData.iconUrl,size,false, iconData.extraClasses));

    return L.divIcon({
      className:'',
      html:div,
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
    });
  });

  let lastIconIdx = 0;
  const opts = {
    title:getTitle(),
    riseOnHover:true,
    icon: icons[lastIconIdx],
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

  cols.forEach(col => {
    if(!gmap)
      return;

    col.onChange.push(callableOncePerCycle(() => {
      marker.options.title = getTitle();
      subTexts.forEach(subText => {
        subText.innerText = getTitle().split(' ')[0];
      });


      // checkbox/name visibility is in createMultiMarkerPopupHtml, so no need to do it here
      // icon visibility is done in setMarked

      // update the icon image
      const idx = cols.findIndex(col => col.isVisible() && !col.marked);
      if (idx >= 0 && idx !== lastIconIdx){
        marker.setIcon(icons[idx]);
        lastIconIdx = idx;
      }
    }));
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
      (<any>window).debug_clickedUid.push(...cols.map(c => c.uid));

      if (!firstTime || !IS_MULTI_MAP_MODE)
        return;

      firstTime = false;

      marker.setIcon(L.divIcon({
        html:`<div style="font-size:3em;color:white">${len} x${cols.length}</div>`
      }));
    });
  }

  return marker;
}

export const createMultiMarkerPopupHtml = (cols:Collectable[]) => {
  /*
  <div>
    <div><label><input type="checkbox"> <img> Element </label></div>
  </div>
  */

  const div = document.createElement('div');
  cols.forEach(col => {
    const div2 = document.createElement('div');
    col.tags?.forEach(tag => {
      div2.classList.add('icon-tag-' + tag);
    });
    const label = document.createElement('label');
    label.classList.add('div-h');
    label.style.alignItems = 'center';
    const input = document.createElement('input');
    input.type = 'checkbox';
    const img = htmlHelper(col.iconUrl, 20, true);
    label.append(input, img, ' ' + col.name);
    label.title = col.categoryName;
    div2.appendChild(label);
    div.appendChild(div2);

    input.addEventListener('change', () => {
      col.setMarked(input.checked);
    });

    col.onChange.push(() => {
      input.checked = col.marked;
      div2.style.display = col.isVisible() ? '' : 'none';
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
  extraClasses=[],
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
  extraClasses?:string[],
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

  const fullSubTxt = subText ? `<div class="icon-subText">${subText}</div>` : '';

  const div = document.createElement('div');
  div.style.height = `${size}px`;
  div.classList.add('icon-scaling');
  div.classList.add(...tagClasses);
  if (col?.alwaysVisible)
    div.classList.add('icon-alwaysVisible');

  div.append(fullSubTxt, htmlHelper(iconUrl,size,false, extraClasses));

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

export const htmlHelper = function(iconUrl:string,size:number,embed:boolean,extraClasses?:string[]) : HTMLElement {
  let iconData = Config.getIconData(iconUrl);
  if(!iconData){
    const div = document.createElement('div');
    div.style.width = `${size}px`;
    div.style.height = `${size}px`;
    div.style.border = '3px solid red';
    return div;
  }

  const w = size / iconData.w;
  const h = size / iconData.h;
  const inside = document.createElement('div');
  inside.classList.add('genericMap-marker', iconData.spriteClass, iconData.sizeClass, ...(extraClasses ?? []));
  inside.style.transform = `scale3d(${w}, ${h}, 1)`;
  inside.style.transformOrigin = '0% 0%';
  if(!embed)
    return inside;

  const div = document.createElement('div');
  div.style.width = `${size}px`;
  div.style.height = `${size}px`;
  div.appendChild(inside);
  return div;
}


export type IconLayerMarker = Omit<IconLayer,'markers'> & {
  markers:L.Marker[];
}


/** doesnt change after creation */
export class IconLayer {
  id = '';
  name = '';
  iconUrl = '';
  /** collectableMarkers are indirectly toggled with Collectable.onChange */
  nonCollectableMarkersByOverlay:(L.Marker | L.Polyline)[][] = [];
  collectables:Collectable[] = [];
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
    nonCollectableMarkersByOverlay:(L.Marker | L.Polyline | null)[][] | undefined,
    collectables:Collectable[],
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
      this.nonCollectableMarkersByOverlay[i] = [];

      const subLay = L.layerGroup();
      this.layerGroupByOverlay.push(subLay);
    }

    if (opts.nonCollectableMarkersByOverlay !== undefined){
      opts.nonCollectableMarkersByOverlay.forEach((markers,idx) => {
        this.addNonCollectableMarkers(idx, markers);
      });
    }
    this.collectables = opts.collectables;
  }
  addNonCollectableMarkers(overlayIdx:number, markers:(L.Marker | L.Polyline | null)[]){
    markers.forEach((m,i) => {
      if(m)
        this.addMarker(overlayIdx, m);
    });
  }
  addMarker(overlayIdx:number, marker:(L.Marker | L.Polyline)){
    marker.addTo(this.layerGroupByOverlay[overlayIdx]);
    this.nonCollectableMarkersByOverlay[overlayIdx].push(marker);
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
