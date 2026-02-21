/*! LICENSED CODE BY SAMUEL MAGNAN-LEVESQUE FOR SCRIPTERSWAR.COM */
//TODO: wrong map tiling above flukeswarm. check Yumi on discord.

import { Config, IS_CONTRIBUTOR_MODE, OverlayConfig } from "./Config";
import {createOverlay} from "./createOverlay";
import { ContributorPanel } from "./contributorSideBar";
import { Any, IconLayer, IconLayerMarker, MyMarker, MyMarkerMulti, MyPolyline, Pos, createMultiMarkerPopupHtml, easyButton } from "./markerHelpers";
import { SavePanel, SavePanel_full } from "./saveSideBar";
import { SpeedrunPanel } from "./speedrunSideBar";
import { RoadmapPanel } from "./roadmapSidePanel";
import { LeafletSidebar } from "./leaflet_type";
import L from "leaflet";
import { Collectable, CollectableJson, mapPush, markerToCollectables } from "./Collectable";
import { GameDataJson } from "./dataHelper";
import { ViewPanel } from "./viewPanel";
import { create_mainControl, All as MainControl } from "./mainControl";
import { ChecklistPanel } from "./checklistPanel";

(<Any>window).debug_markersJSON = []; // for debug

export const LAYER_MAP_EDGES = 'mapEdge';
export const LAYER_MAP_LINK = 'mapLink';
export const LAYER_MAP_LABEL = 'mapLabel';

export type GenericMapOptions = {
  isAlwaysVisible?:(colJson:CollectableJson) => boolean,
  parseCollectableFlagInSave?:(str?:string | null) => any | null,
  getLegacyIds?:(colJson:CollectableJson) => string[],
  fallbackIconUrl?:string,
};

export type OverlayInfo = {
  overlay:L.TileLayer | L.ImageOverlay;
  //name is config.name
  config:OverlayConfig;
  idx:number;
}

const STACKED_POS_OFFSET = 5;

export class GenericMap {
  constructor(
    public config:Config,
  ){
    (<Any>window).debug_gmap = this;
  }

  myMap:L.Map;
  permanentlyMissableList:{name:string,desc:string,associatedCollectableUids:number[]}[] = [];

  layers:IconLayer[] = [];
  vSave:SavePanel_full;
  overlayInfos:OverlayInfo[] = [];
  /** set site-spec */
  activeOverlayIdx = 0;
  mainControl: MainControl;

  baseWikiLink = '';
  displayContributorButton = true;
  displayChecklistButton = true;
  displaySaveRestoreStatButton = true;
  onlyStackSameImgIcons = true;

  collectableByUid = new Map<number,Collectable>();

  vue_saveUpload:{
    onLoadSaveFileClick:() => void,
  } | null = null;

  createLeafMap(){
    this.myMap = L.map('myMap', this.config.overlays[0].getLeafMapOpts());
  }

  updateMapOptions(overlayConfig:OverlayConfig){
    const opts = overlayConfig.getLeafMapOpts();
    if (opts.minZoom !== undefined)
      this.myMap.setMinZoom(opts.minZoom);
    if(opts.maxZoom !== undefined)
      this.myMap.setMaxZoom(opts.maxZoom);
    if(opts.maxBounds)
      this.myMap.setMaxBounds(opts.maxBounds);
  }

  getSubText(colJson:CollectableJson){
    return '';
  }
  formatHref(href:boolean | string | undefined, name:string){
    if(!href)
      return '';

    if(href === true){
      // Upgrade - Memory Locket #1
      const removeHash = name.split(' #')[0];
      const removeBracket = removeHash.split(' (')[0];
      const removeHypen = removeBracket.split(' - ');
      return this.baseWikiLink + '/' + removeHypen[removeHypen.length - 1];
    }
    if (href.startsWith('http'))
       return href;
      
    return this.baseWikiLink + '/' + href;
  }
  getFlyToZoom(){
    return this.myMap.getMaxZoom() - 2;
  }

  createCollectablesFromJson(
    jsonData:GameDataJson,
    opts:GenericMapOptions){

    jsonData.categories.forEach(cat => {
      cat.list.forEach(colJson => {
        const col = new Collectable({
          name:colJson.name,
          categoryId:cat.group,
          categoryName:cat.name ?? '',
          uid:colJson.uid,
          tags:colJson.tags,
          iconUrl:colJson.iconUrl ?? cat.iconUrl ?? opts.fallbackIconUrl,
          href:this.formatHref(colJson.href ?? cat.href, colJson.name),
          alwaysVisible: opts.isAlwaysVisible?.(colJson) ?? false,
          flag:opts.parseCollectableFlagInSave?.(colJson.flag) ?? null,
          legacyIds:opts.getLegacyIds?.(colJson),
          sourceJsonObj:colJson,
        });
        this.collectableByUid.set(col.uid, col);
      });
    });
  }

  getColJsonsForGroup(jsonData:GameDataJson, grp:GameDataJson['groups'][0]){
    return jsonData.categories.filter(cat => cat.group === grp.id).map(cat => {
      return cat.list.map(col => {
        return {colJson:col, cat};
      });
    }).flat();
  }
  createLayersFromJson(jsonData:GameDataJson){
    jsonData.groups.forEach(grp => {
      const colJsons = this.getColJsonsForGroup(jsonData, grp);

      if (!colJsons.length)
        return;

      const collectables = colJsons.map(colJson => this.collectableByUid.get(colJson.colJson.uid)!).filter(a => a);

      const lay = new IconLayer({
        id:grp.id,
        name:grp.name,
        iconUrl:grp.iconUrl,
        nonCollectableMarkersByOverlay:undefined,
        isVisibleByDefault:grp.isVisibleByDefault,
        overlayCount:this.config.overlays.length,
        collectables,
      });

      this.layers.push(lay);
    });
  }

  private stackPos = (() => {
    const RIGHT = 1;
    const LEFT = -1;
    const UP = 1;
    const DOWN = -1;
    return [
      //veritcal,horitzontal
      [0,0],
      [0,RIGHT],
      [DOWN,0],
      [0,LEFT],
      [UP,0],
      [DOWN,RIGHT],
      [DOWN,LEFT],
      [UP,LEFT],
      [UP,RIGHT],

      [0,RIGHT * 2],
      [DOWN * 2,0],
      [0,LEFT * 2],
      [UP * 2,0],
      [DOWN * 2,RIGHT * 2],
      [DOWN * 2,LEFT * 2],
      [UP * 2,LEFT * 2],
      [UP * 2,RIGHT * 2],
    ];
  })();

  adaptStackedPos(originalPos:Pos, stackIdx:number,overlayIdx:number) : Pos {
    const offset = this.stackPos[stackIdx % this.stackPos.length];
    return [
      originalPos[0] + STACKED_POS_OFFSET * offset[0],
      originalPos[1] + STACKED_POS_OFFSET * offset[1],
    ];
  }
  getExtraClasses(colJson:CollectableJson){
    if (Array.isArray(colJson.extraClasses))
      return colJson.extraClasses;
    if(!colJson.extraClasses)
      return [];
    return [colJson.extraClasses];
  }
  createMarkersFromJson(
    jsonData:GameDataJson,
    opts:GenericMapOptions,
  ){
    this.createCollectablesFromJson(jsonData, opts);
    this.createLayersFromJson(jsonData);

    this.config.overlays.forEach((ovConfig,ovIdx) => {
      const iconsByPos = new Map<string, {
        samePosCollectables:CollectableJson[],
        pos:Pos,
      }>();

      jsonData.categories.forEach(cat => {
        cat.list.forEach(col => {
          if(!col.name)
            return;

          const posList = ovConfig.getMarkerPositions(col);
          if(!posList)
            return;

          posList.forEach(pos => {
            if (pos[0] === 0 && pos[1] === 0)
              return;

            const posStr = pos.toString();
            const existing = iconsByPos.get(posStr);
            if (existing){
              if (existing.samePosCollectables.includes(col))
                  throw new Error('duplicate pos for col.name=' + col.name);
              existing.samePosCollectables.push(col);
            }
            else
              iconsByPos.set(posStr, {
                samePosCollectables:[col],
                pos,
              })
          });
        });
      });

      //NO_PROD some duplicate collectable.

      iconsByPos.forEach(({samePosCollectables,pos}) => {
        const cols = samePosCollectables.map(sib => {
          return this.collectableByUid.get(sib.uid)!;
        }).filter(a => a && a.iconUrl);

        const colsByImg = new Map<string, Collectable[]>();
        cols.forEach(col => {
          const key = this.onlyStackSameImgIcons ? col.iconUrl : '';
          const arr = colsByImg.get(key);
          if (arr)
            arr.push(col)
          else
            colsByImg.set(key, [col]);
        });

        Array.from(colsByImg.values()).forEach((samePosAndImgCollectables, idx) => {
          const firstCol = samePosAndImgCollectables[0];
          const firstColJson = firstCol.sourceJsonObj;

          const adaptedPos = this.adaptStackedPos(pos, idx, ovIdx);
          const m = (() => {
            //multi marker
            if (samePosAndImgCollectables.length > 1){
              const popupDiv = createMultiMarkerPopupHtml(samePosAndImgCollectables);

              return MyMarkerMulti({
                pos:adaptedPos,
                iconDatas:samePosAndImgCollectables.map(col => {
                  return {iconUrl:col.iconUrl, extraClasses:this.getExtraClasses(col.sourceJsonObj)};
                }),
                gmap:this,
                popupDiv,
                size:20,
                cols:samePosAndImgCollectables,
              });
            }

            return MyMarker({
              pos:adaptedPos,
              gmap:this,
              href:firstCol.href,
              subText:this.getSubText(firstColJson),
              iconUrl:firstCol.iconUrl,
              title:firstCol.name,
              extraClasses:this.getExtraClasses(firstColJson),
              tagClasses:(firstCol.tags?.map(t => 'icon-tag-' + t) ?? []),
              size:20,
              uid:firstCol.uid,
              col: firstCol,
            });
          })();

          if(!m)
            return;

          samePosAndImgCollectables.forEach(col => {
            col.addMarker(ovIdx, m);

            const lay = this.layers.find(lay => lay.id === col.categoryId);
            if(lay)
              lay.addMarker(ovIdx, m); 
          });

        }); // for each siblings
      }); //iconByPos.forEach
    }); // overlays.forEach
  }

  getLayer(id:string){
    return this.layers.find(l => l.id === id) ?? null;
  }
  getAllActiveMarkers(){
    const list:L.Marker[] = [];
    this.layers.forEach((l,id) => {
      if(!l.areIcons)
        return;
      list.push(...(<L.Marker[]>l.nonCollectableMarkersByOverlay[this.activeOverlayIdx] ?? []));
    });
    return list;
  }
  debug_getTooCloseMarkers(minDist=2){
    const bad:[[number,number],[number,number]][] = [];
    const markers = this.getAllActiveMarkers();
    markers.forEach(m => {
      markers.forEach(m2 => {
        if(m === m2)
          return;
        const dist = Math.abs(m.getLatLng().lat - m2.getLatLng().lat) + Math.abs(m.getLatLng().lng - m2.getLatLng().lng);
        if(dist <= minDist)
          bad.push([[m.getLatLng().lat,m.getLatLng().lng],[m2.getLatLng().lat,m2.getLatLng().lng]]);
      });
    });
    return bad;
  }


  /*
  toJSON(){
    const obj:any = {};

    let lays:IconLayer[] = [];
    this.forEachMarkerLayers(lay => {
      lays.push(lay);
    });

    obj.groups = lays.map(lay => {
      return {
        id:lay.id,
        name:lay.name,
        iconUrl:lay.iconUrl,
        isVisibleByDefault:lay.isVisibleByDefault,
      };
    });

    obj.categories = lays.map(lay => {
      return {
        id:lay.id,
        name:lay.name,
        iconUrl:lay.iconUrl,
        group:lay.id,
        list:lay.markers.map(m => {
          const m2 = m as L.Marker;
          const col = markerToCollectables.get(m2)?.[0];
          if(!col)
            throw new Error('no col');
          return JSON.stringify({
            pos:[m2.getLatLng().lat, m2.getLatLng().lng],
            name:col.name,
            iconUrl:(<any>m2).iconUrl,
          });
        }).join(',\n')
      };
    });
    return obj;
  }
  */

  openCloseSidebar(sidebar:LeafletSidebar, val?:boolean){
    this.sidebars.forEach(s => {
      if(s !== sidebar)
        s.hide();
    });
    if (val === undefined)
      sidebar.toggle();
    else if(val === false)
      sidebar.hide();
    else
      sidebar.show();
  }
  sidebars:LeafletSidebar[] = [];
  createSidebar(el:HTMLElement, myClass:string, title:string){
    const sidebar = (<Any>L).control.sidebar(el, {
      position: 'left',
      autoPan:false,
    });
    this.sidebars.push(sidebar);
    this.myMap.addControl(sidebar);
    easyButton(myClass, title,() => {
      this.openCloseSidebar(sidebar);
    }).addTo(this.myMap);

    return sidebar;
  }
  init(){ //called from .html after hkMap_data is loaded
    this.addOverlay();

    if (this.displayContributorButton)
      ContributorPanel.addPanel(this);

    ViewPanel.addPanel(this);

    if (this.displayChecklistButton)
      ChecklistPanel.addPanel(this);

    if (this.displaySaveRestoreStatButton)
      this.vSave = SavePanel.addSavePanel(this);

    this.addLastClickedIconName();

    this.addZoomClassEvent();
  }
  /** doesnt update icons */
  activateOverlay(overlayIdx:number){
    this.activeOverlayIdx = overlayIdx;
    const newOverlayInfo = this.overlayInfos[overlayIdx];

    this.overlayInfos.forEach((ov,idx) => {
      if (ov !== newOverlayInfo)
        ov.overlay.removeFrom(this.myMap);
      else
        ov.overlay.addTo(this.myMap);
    });

    this.updateMapOptions(newOverlayInfo.config);
  }
  addOverlay(){
    this.overlayInfos = this.config.overlays.map((overlayConfig,idx) => {
      return {
        overlay:createOverlay(overlayConfig),
        idx,
        config:overlayConfig
      };
    });

    this.activateOverlay(this.activeOverlayIdx);

    const newOverlayInfo = this.overlayInfos[this.activeOverlayIdx];

    const initView = newOverlayInfo.config.getInitialView();
    this.myMap.setView(<L.LatLngTuple>initView.pos, initView.zoom);

    const gmap = this;
    const CustomInfo = L.Control.extend({
      onAdd: function() {
        const div = L.DomUtil.create('div', '');
        gmap.mainControl = create_mainControl(gmap);
        div.appendChild(gmap.mainControl.$el);
        L.DomEvent.disableClickPropagation(div);
        return div;
      }
    });

    (new CustomInfo({ position: 'topright' })).addTo(this.myMap);
  }
  static addToTextArea(str:string){
    const ta = (<HTMLTextAreaElement>document.getElementById('contribTextArea'));
    ta.value += str;
  }

  addLastClickedIconName(){
    const MyCustomControl = L.Control.extend({
      options: {
          position: 'bottomleft'
      },
      initialize: function (options:unknown) {
          L.Util.setOptions(this, options);
      },
      onAdd: function (this:{_container:HTMLDivElement}) {
          this._container = L.DomUtil.create('div', 'leaflet-bar flex');
          this._container.id = 'lastClickedIconName';

          this._container.innerHTML = `
            <span id="lastClickedIconName-name"></span>
            <a target="_blank" rel="noopener" style="padding-left:15px;color:rgba(0,200,255);background-color:rgba(0,0,0,0);white-space: nowrap;display:none" id="lastClickedIconName-link">Wiki <span class="glyphicon glyphicon-new-window"></span></a>
          `;

          L.DomEvent.disableClickPropagation(this._container);
          L.DomEvent.disableScrollPropagation(this._container);

          return this._container;
      },
    });

    const myCustomControl = new MyCustomControl({});

    myCustomControl.addTo(this.myMap);
  }

  protected getOrCreateIcon(data:L.DivIconOptions){
    //its more performant to create a div and give it to leaflet.
    //however, that means that multiple icons cant share the same divIcon
    const icon = L.divIcon(data);
    return icon;
  }

  createPolylineArrow(pos:number[][]){
    const polylineArrow_sub = function(pos:number[][]){
      const [y1,x1] = pos[0];
      const [y2,x2] = pos[1];
      const angle = Math.atan2(y2 - y1, x2 - x1) / (2 * Math.PI) * 360;

      const angle1 = ((angle + 30 + 180) % 360);
      const angle2 = ((angle + 330 + 180) % 360);

      const RADIUS = 1;
      const head1X = Math.cos(angle1 / 180 * Math.PI) * RADIUS;
      const head1Y = Math.sin(angle1 / 180 * Math.PI) * RADIUS;

      const head2X = Math.cos(angle2 / 180 * Math.PI) * RADIUS;
      const head2Y = Math.sin(angle2 / 180 * Math.PI) * RADIUS;


      return [
        MyPolyline(<L.LatLngTuple[]>[
          [head1Y + pos[1][0],head1X + pos[1][1]],
          pos[1],
        ],{
          color: 'white',
          weight: 5,
          opacity: 0.5,
          smoothFactor: 1,
          className:'mapLink',
        }),

        MyPolyline(<L.LatLngTuple[]>[
          [head2Y + pos[1][0],head2X + pos[1][1]],
          pos[1],
        ],{
          color: 'white',
          weight: 5,
          opacity: 0.5,
          smoothFactor: 1,
          className:'mapLink',
        })
      ];
    };

    return [
      MyPolyline(<L.LatLngTuple[]>pos,{
        color: 'white',
        weight: 2,
        opacity: 0.5,
        smoothFactor: 1,
        className:'mapLink',
      }),
      ...polylineArrow_sub(pos),
      ...polylineArrow_sub([pos[1], pos[0]]),
    ];
  }
  createMapLink(pos:number[][],dashArray:string|null=null){
    return MyPolyline(<L.LatLngTuple[]>pos,{
      color: 'white',
      weight: dashArray ? 2 : 5,
      opacity: 0.5,
      smoothFactor: 1,
      className:'mapLink',
      dashArray:dashArray ?? undefined,
    });
  }
  createMapLinkMarkersByOverlay(mapLinksByOverlay:MapLinks[]){
    return mapLinksByOverlay.map(mapLinks => {
      return [
        ...mapLinks.smallGaps.map((pos) => this.createMapLink(pos)),
        ...mapLinks.largeGapsConnectingOverMaps.map((pos) => this.createMapLink(pos,'1 24')),
        ...mapLinks.largeGapsConnectingOverVoid.map((pos) => this.createMapLink(pos,'1 8')),
        ...mapLinks.arrows.map(pos => this.createPolylineArrow(pos)).flat()
      ];
    });
  }
  createMapLinkLayer(markersByOverlay:(L.Marker | L.Polyline | null)[][]){
    // const markersByOverlay = this.createMapLinkMarkersByOverlay(mapLinksByOverlay);

    if (markersByOverlay.every(m => m.length === 0))
      return;

    const lay = new IconLayer({
      id:LAYER_MAP_LINK,
      isVisibleByDefault:true,
      alwaysVisible:true,
      areIcons:false,
      toggleableByUser:false,
      name:'Area Connection Lines',
      iconUrl:'',
      nonCollectableMarkersByOverlay: markersByOverlay,
      collectables:[],
      overlayCount:this.config.overlays.length,
    });
    this.layers.push(lay);
  }


  createMapLabelLayer(locationsByOverlay:Location[][]){
    const mapLabel = (pxPos:[number,number], text:string,color='white') => {
      if (pxPos[0] === 0 && pxPos[1] === 0)
        return null;

      const ltnLagPos = pxPos;
      const html = `<span style="filter: brightness(150%);font-weight:bold;color:${color}">${text}</span>`;
      return L.marker(ltnLagPos, {
        icon:this.getOrCreateIcon({className:'mapLabel', html})
      });
    };

    const markersByOverlay = locationsByOverlay.map(locations => {
      return locations.map(loc => {
        return mapLabel(<[number, number]>loc.pos, loc.name, loc.color)!;
      }).filter(a => a);
    });

    if (markersByOverlay.every(m => m.length === 0))
      return;

    const lay = new IconLayer({
      id:LAYER_MAP_LABEL,
      isVisibleByDefault:true,
      alwaysVisible:true,
      areIcons:false,
      toggleableByUser:false,
      name:'Area Names',
      iconUrl:'',
      nonCollectableMarkersByOverlay: markersByOverlay,
      collectables:[],
      overlayCount:this.config.overlays.length,
    });
    this.layers.push(lay);
  }

  createMapEdgeLayer(mapEdgesByOverlay:MapEdge[][]){
    const dist = (p1:number[],p2:number[]) => {
      return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
    };
    const groupLinesInPaths = (lines:number[][][]) => {
      if(IS_CONTRIBUTOR_MODE)
        return <L.LatLngTuple[][]>lines; //1 line per path. needed so when you click one, it displays its position to delete it

      const resultPaths:number[][][] = [];

      const leftovers = new Set(lines);
      const pop = () => {
        return popWithFilter(() => true);
      };

      const popWithFilter = (f:(pos:number[][]) => boolean) => {
        const v = leftovers.keys();
        while(true){
          const a = v.next();
          if(a.done)
            return null;

          if(f(a.value)){
            leftovers.delete(a.value);
            return a.value;
          }
        }
      };

      while(true){
        let center = pop();
        if (center === null)
          break;

        let createPath = (init:number[]) => {
          const prevs = [init];
          while(true){
            const lastPrev = prevs[prevs.length - 1];
            const toAddPrev = popWithFilter(potentialPrev => {
              return dist(potentialPrev[0], lastPrev) < 1;
            });
            if (toAddPrev){
              prevs.push(toAddPrev[1]);
              continue;
            }

            const toAddPrev2 = popWithFilter(potentialPrev => {
              return dist(potentialPrev[1], lastPrev) < 1;
            });
            if (toAddPrev2){
              prevs.push(toAddPrev2[0]);
              continue;
            }

            return prevs;
          }
        };


        //before
        const prevs = createPath(center[0]);
        const nexts = createPath(center[1]);

        resultPaths.push([
          ...prevs.reverse(),
          ...nexts,
        ]);
      }

      return <L.LatLngTuple[][]>resultPaths;
    };

    const markersByOverlay = mapEdgesByOverlay.map(mapEdges => {
      return mapEdges.map(mapEdge => {
        const paths = groupLinesInPaths(mapEdge.lines);
        return paths.map(path => {
          return MyPolyline(path,{
              color: mapEdge.color,
              className:'mapEdge',
              weight: 3,
              lineCap:'inherit',
              lineJoin:'inherit',
              //smoothFactor: 1,
          });
        });
      }).flat();
    });

    if (markersByOverlay.every(m => m.length === 0))
      return;

    const lay = new IconLayer({
      id:LAYER_MAP_EDGES,
      iconUrl:"mapedge.png",
      isVisibleByDefault:true,
      toggleableByUser:false,
      areIcons:false,
      name:'Map Edges',
      nonCollectableMarkersByOverlay: markersByOverlay,
      collectables:[],
      overlayCount:this.config.overlays.length,
    });
    this.layers.push(lay);
  }

  addZoomClassEvent(){
    this.myMap.on('zoomend', () => {
      let z = this.myMap.getZoom();
      const dom = this.myMap.getContainer();
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
  }

  flyToCollectable_lastElements:HTMLElement[] = [];
  async flyToCollectable(c:Collectable){
    //fly to first marker, but highlight them all
    const pos = c.getFirstPosition(this.activeOverlayIdx);
    if(!pos)
      return;

    this.myMap.flyTo(pos, this.getFlyToZoom());

    this.flyToCollectable_lastElements.forEach(el => el.classList.remove('icon-highlighted'));
    this.flyToCollectable_lastElements = [];

    c.markersByOverlay[this.activeOverlayIdx]?.forEach(marker => {
      const genericMarker = marker.getElement()?.querySelector('.genericMap-marker');
      if (genericMarker instanceof HTMLElement){
        genericMarker.classList.add('icon-highlighted');
        this.flyToCollectable_lastElements.push(genericMarker);
      }
    });
  }
}

type Location = {
  name:string,
  pos:number[],
  color?:string,
}

type MapLinks = {
  smallGaps:number[][][],
  largeGapsConnectingOverMaps:number[][][],
  largeGapsConnectingOverVoid:number[][][],
  arrows:number[][][],
}

type MapEdge = {
  color:string;
  lines:number[][][];
}