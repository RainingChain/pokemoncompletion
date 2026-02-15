import L from "leaflet";
import { CollectableFlagInSave } from "../hollowknight/ssMap/saveFlagEvaluator";

export const OPACITY_CLICKED = 0.2;
export const OPACITY_ALWAYS_VISIBLE_MARKER = 0.8;

export const mapPush = <T,U>(map:Map<T,U[]>,key:T,newKeyVal:U) => {
  const v = map.get(key);
  if(v === undefined)
    return map.set(key, [newKeyVal]);
  v.push(newKeyVal);
};

export type CollectableJson = {
  pos:number[]
  name:string;
  iconUrl?:string;
  href?:boolean | string;
  uid:number;
  flag?:string | null;
  myClass?:string;
  legacyIds?:string[];
  tags?:string[];
};

export class Collectable {
  constructor(opts:Partial<Collectable>){
    Object.assign(this, opts);
  }

  marked = false;
  isVisible = true;
  markerByOverlay:(L.Marker | null)[] = [];
  iconUrl = '';
  name = '';
  categoryId = '';
  uid = 0;
  legacyIds:string[] = [];
  flag:CollectableFlagInSave | null = null;
  alwaysVisible = false;
  href = '';
  sourceJsonObj:CollectableJson;

  /** when marked or isVisible changes */
  onChange:(() => void)[] = [];
  tags:string[] | null = null;


  setMarked(marked:boolean, forceUpdate=false){
    if(!forceUpdate && this.marked === marked)
      return;

    this.marked = marked;

    this.onChange.forEach(f => f());

    this.markerByOverlay.forEach(marker => {
      if(!marker)
        return;

      const siblings = markerToCollectables.get(marker) ?? [];
      const marked = siblings.every(s => s.marked);

      const leaf_icon = marker.options.icon as L.DivIcon;
      const html = leaf_icon?.options?.html as HTMLElement;

      if (html?.classList){
        if (marked)
          html.classList.add('icon-marked');
        else
          html.classList.remove('icon-marked');
      } else { //fallback
        if (marked)
          marker.setOpacity(this.alwaysVisible ? OPACITY_ALWAYS_VISIBLE_MARKER : OPACITY_CLICKED);
        else
          marker.setOpacity(1);
      }
    });
  }

  static create(opts:Partial<Collectable>){
    const col = new Collectable(opts);
    Collectable.list.push(col);
    Collectable.listByUid.set(col.uid, col);
    return col;
  }
  addMarker(overlayIdx:number, m:L.Marker){
    while (this.markerByOverlay.length <= overlayIdx)
      this.markerByOverlay.push(null);

    this.markerByOverlay[overlayIdx] = m;
    mapPush(markerToCollectables, m, this);
  }

  getPosition(overlayIdx:number){
    return this.markerByOverlay[overlayIdx]?.getLatLng() ?? null;
  }

  static list:Collectable[] = [];
  static listByUid = new Map<number, Collectable>();
};

export const markerToCollectables = new Map<L.Marker, Collectable[]>();


