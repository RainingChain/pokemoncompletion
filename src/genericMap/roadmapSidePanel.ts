/*! LICENSED CODE BY SAMUEL MAGNAN-LEVESQUE FOR SCRIPTERSWAR.COM */
import Vue from "vue";
import { Any, easyButton, } from "./markerHelpers";

import withRender from "./roadmapSidebar.vue";
import {GenericMap} from "./genericMap";
import { LeafletSidebar } from "./leaflet_type";

import L from "leaflet";

export class RoadmapPanel {
  static sidebar:LeafletSidebar;

  static addRoadMap(gmap:GenericMap){
    const v = new Vue(withRender({
      data: {
      },
      mounted:function(this:{$el:HTMLElement}){
        RoadmapPanel.sidebar = gmap.createSidebar(this.$el, 'glyphicon-road',"Roadmap");
      }
    }));
    v.$mount();
  }
}