/*! LICENSED CODE BY SAMUEL MAGNAN-LEVESQUE FOR SCRIPTERSWAR.COM */
import Vue from "vue";

import withRender from "./checklistPanel.vue";
import { LeafletSidebar } from "./leaflet_type";
import { GenericMap } from "./genericMap";
import { Collectable } from "./Collectable";

//TODO: hide info only (aka alwaysVisible)

type Cat = {
  expanded:boolean,
  list:Collectable[],
  name:string,
};

type PermMiss = {
  name:string,
  desc:string,
  collectables:Collectable[],
  collectableHasPositionByOverlay:boolean[],
};

const data = (gmap:GenericMap) : {
  gmap:GenericMap,
  hideObtained:boolean,
  permanentlyMissableExpanded:boolean,
  categories:Cat[],
  permanentlyMissableList:PermMiss[]
} => {

  return {
    gmap,
    hideObtained:true,
    permanentlyMissableExpanded:true,
    permanentlyMissableList:[],
    categories:[],
  };
};

class methods {
  init = function(this:ChecklistPanel_full){
    this.permanentlyMissableList = this.gmap.permanentlyMissableList.map(p => {
      const cols = p.associatedCollectableUids.map(uid => this.gmap.collectableByUid.get(uid)!).filter(a => a);
      if(!cols.length)
        return null!;
      return {
        name:p.name,
        desc:p.desc,
        collectables:cols,
        collectableHasPositionByOverlay:this.gmap.config.overlays.map((ov,idx) => {
          return cols.some(col => col.markersByOverlay[idx]?.length);
        }),
      };
    }).filter(a => a);

    this.categories = this.gmap.layers.map(lay => {
      if(!lay.areIcons)
        return null!;

      return {
        expanded:false,
        name:lay.name,
        list:lay.collectables,
      };
    }).filter(a => a);
  }
  onColChange = function(col:Collectable){
    col.setMarked(col.marked, true);
  }
  getObtainedCount = function(cat:Cat){
    return cat.list.reduce((prev, v) => {
      return prev + (v.marked ? 1 : 0);
    }, 0);
  }
  flyTo(this:ChecklistPanel_full, col:Collectable){
    const pos = col.getFirstPosition(this.gmap.activeOverlayIdx);
    if(!pos)
      return false;
    this.gmap.myMap.flyTo(pos, this.gmap.getFlyToZoom());
    return true;
  }
  flyToPermMiss(this:ChecklistPanel_full, permMiss:PermMiss){
    //priority to unmarked, with fallback to any
    let unmarkedCol = permMiss.collectables.filter(col => !col.marked);
    for (const col of unmarkedCol){
      if (this.flyTo(col))
        return;
    }
    for (const col of permMiss.collectables){
      if (this.flyTo(col))
        return;
    }
  }
  allCollectablesAreMarked(cols:Collectable[]){
    return cols.every(col => col.marked);
  }
  hasVisibiblePermanentlyMissable(this:ChecklistPanel_full){
    return this.permanentlyMissableList.some(p => {
      return !this.hideObtained || !this.allCollectablesAreMarked(p.collectables);
    });
  }
};

export type ChecklistPanel_full = methods & ReturnType<typeof data> & {
  $el:HTMLElement,
  $mount:() => void,
  $refs:{}
};

export class ChecklistPanel {
  static sidebar:LeafletSidebar;

  static vue:ChecklistPanel_full;

  static addPanel(gmap:GenericMap){
    const {config, myMap} = gmap;

    const vSave = <ChecklistPanel_full>new Vue(withRender({
      data:data(gmap),
      methods:new methods(),
      mounted:function(this:ChecklistPanel_full){
        ChecklistPanel.sidebar = gmap.createSidebar(this.$el, 'glyphicon-th-list' ,"Checklist");
        let init = false;
        ChecklistPanel.sidebar.on('show', () => {
          if(!init){
            init = true;
            vSave.init();
          }
        });
      }
    }));
    vSave.$mount();
    ChecklistPanel.vue = vSave;
    return vSave;
  }
}



