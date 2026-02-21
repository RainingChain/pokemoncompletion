import L from "leaflet";

export const OPACITY_CLICKED = 0.2;
export const OPACITY_ALWAYS_VISIBLE_MARKER = 0.8;

export const mapPush = <T,U>(map:Map<T,U[]>,key:T,newKeyVal:U) => {
  const v = map.get(key);
  if(v === undefined)
    return map.set(key, [newKeyVal]);
  v.push(newKeyVal);
};

export type CollectableJson = {
  pos:number[] | number[][],
  name:string;
  iconUrl?:string;
  extraClasses?:string | string[];
  href?:boolean | string;
  uid:number;
  flag?:string | null;
  legacyIds?:string[];
  tags?:string[];
};

export class Collectable {
  constructor(opts:Partial<Collectable>){
    Object.assign(this, opts);
    
    this.onChange.push(() => {
      this.markersByOverlay.forEach(markers => {
        markers.forEach(marker => {
          const siblings = markerToCollectables.get(marker) ?? [];
          const allMarked = siblings.every(s => !s.isVisible() || s.marked);
          const visible = siblings.some(s => s.isVisible());

          const leaf_icon = marker.options.icon as L.DivIcon;
          const html = leaf_icon?.options?.html as HTMLElement;
          
          if (html?.classList){
            html.classList.toggle('icon-marked', allMarked);
            html.classList.toggle('icon-invisible', !visible);
          } else { //fallback
            if (allMarked)
              marker.setOpacity(this.alwaysVisible ? OPACITY_ALWAYS_VISIBLE_MARKER : OPACITY_CLICKED);
            else
              marker.setOpacity(1);
          }
        });
      });
    });
  }

  marked = false;
  /** doesnt take into consideration hideIfMarked and display settings */
  isVisible(){
    return this.isIconLayerVisible && this.isVisibleCustomReason;
  }
  isVisibleCustomReason = true;
  isIconLayerVisible = true;
  markersByOverlay:L.Marker[][] = [];
  iconUrl = '';
  name = '';
  categoryId = '';
  categoryName = '';
  uid = 0;
  legacyIds:string[] = [];
  flag:any | null = null;
  alwaysVisible = false;
  href = '';
  sourceJsonObj:CollectableJson;

  /** when marked or isVisible changes */
  onChange:(() => void)[] = [];
  tags:string[] | null = null;


  setMarked(marked:boolean){
    if(this.marked === marked)
      return;

    this.marked = marked;
    this.emitOnChange();
  }

  /** must be called when isVisible or marked is changed */
  emitOnChange(){
    console.log('gcol.emitOnChange');
    this.onChange.forEach(f => f());
  }

  addMarker(overlayIdx:number, m:L.Marker){
    while (this.markersByOverlay.length <= overlayIdx)
      this.markersByOverlay.push([]);

    this.markersByOverlay[overlayIdx].push(m);
    mapPush(markerToCollectables, m, this);
  }

  getFirstPosition(overlayIdx:number){
    const list = this.markersByOverlay[overlayIdx];
    if (!list || list.length === 0)
      return null;
    return list[0].getLatLng();
  }
};

export const markerToCollectables = new Map<L.Marker, Collectable[]>();


