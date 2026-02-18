/*! LICENSED CODE BY SAMUEL MAGNAN-LEVESQUE FOR SCRIPTERSWAR.COM */
import Vue from "vue";
import { Any, MyMarker, MyPolyline, Pos } from "./markerHelpers";

import { Config, IS_CONTRIBUTOR_MODE } from "./Config";
import withRenderContrib from "./contributorSideBar.vue";
import {GenericMap} from "./genericMap";
import type { LeafletSidebar } from "./leaflet_type";
import L from "leaflet";

const data = (config:Config) => ({
  contributorMode:IS_CONTRIBUTOR_MODE ? 'icon' : 'none',
  firstTime:true,
  contributors:config.contributors,
  fullImgSize:config.fullImgSize,
  fullImgUrl:config.fullImgUrl,
  isHk:window.location.href.toLocaleLowerCase().includes('/hollowknight/map'),
});

const methods = {
  init(){
    if(!IS_CONTRIBUTOR_MODE)
      return;

    const myMapHtml = document.getElementById('myMap');
    if(!myMapHtml)
      return;

    myMapHtml.classList.add('crosshairPointer');
  },
  activateContributorMode(){
    window.location.assign(window.location.href.replace('#','') + '?contributor');
  },
  refreshIcons(){
    ContributorPanel.contributorLayer.eachLayer(function (layer) {
      ContributorPanel.contributorLayer.removeLayer(layer);
    });

    const str = (<HTMLTextAreaElement>document.getElementById('contribTextArea')).value.split('\n');

    str.map(line => {
      line = line.trim().slice(0, -1); //remove trailing ,
      if(!line)
        return null!;
      try {
        const marker = JSON.parse(line);
        if (Array.isArray(marker))
          return MyPolyline(marker,{
            color: 'white',
            className:'mapEdge',
            weight: 1,
            smoothFactor: 1,
          });
        else
          return MyMarker({
            gmap:null,
            pos:<Pos>marker.pos,
            iconUrl:marker.iconUrl || "contributorMarker.png",
            title:marker.name,
            col:null,
          })!;
      } catch(_err){
        return null!;
      }
    })
    .filter(m => m)
    .forEach(m => m.addTo(ContributorPanel.contributorLayer));
  }
};

let prevMapLinkClickLatLng:[number,number] | null = null;
let mapLinkDynamic:L.Polyline | null = null;

export class ContributorPanel {
  static contributorLayer:L.LayerGroup;
  static sidebar:LeafletSidebar & L.Control<{}>;
  static vContributor:ReturnType<typeof data> & typeof methods & {$mount:() => void};

  static addPanel(gmap:GenericMap){
    const {config, myMap} = gmap;

    if(IS_CONTRIBUTOR_MODE){
      myMap.on('keyup', function(e) {
        if(e.originalEvent.code === "Escape")
          prevMapLinkClickLatLng = null;
      });

      myMap.on('mousemove', function(e) {
        if(prevMapLinkClickLatLng === null){
          if (mapLinkDynamic){
            mapLinkDynamic.removeFrom(myMap);
            mapLinkDynamic = null;
          }
          return;
        }

        if (!mapLinkDynamic){
          // not MyPolyline because dont want onclick
          mapLinkDynamic = new L.Polyline([prevMapLinkClickLatLng, e.latlng],{
            color: 'white',
            className:'mapEdge',
            weight: 1,
            smoothFactor: 1,
          });
          if(mapLinkDynamic)
            mapLinkDynamic.addTo(myMap);
        } else {
          mapLinkDynamic.setLatLngs([prevMapLinkClickLatLng, [e.latlng.lat,e.latlng.lng]]);
        }
      });

      myMap.on('click', function(e) {
        if (!e.latlng)
          return;

        if(ContributorPanel.vContributor.contributorMode === 'none')
          return;

        if(ContributorPanel.vContributor.contributorMode === 'icon'){
          const tooClose = gmap.getAllActiveMarkers().some(m => {
            const MAX_DIST = 0.2;
            return (Math.abs(e.latlng.lat - m.getLatLng().lat) + Math.abs(e.latlng.lng - m.getLatLng().lng)) <= MAX_DIST;
          });
          if(tooClose){
            alert("Error: This icon is too close to an existing icon.");
            return;
          }

          const quickEdit = !e.originalEvent.ctrlKey;
          const p = quickEdit ? '' : prompt("Description") || '';

          const lat = +e.latlng.lat.toFixed(2);
          const lng = +e.latlng.lng.toFixed(2);
          const px = [lat,lng];

          const str = (<HTMLTextAreaElement>document.getElementById('contribTextArea')).value.split('\n');
          const count = str.filter(s => s.includes('"pos"')).length;

          const txt = `{"num":${count}, "pos":[${px[0]},${px[1]}],"name":"${p}","iconUrl":"${gmap.contributorMarker}","flag":""},\n`;
          GenericMap.addToTextArea(txt);

          navigator.clipboard.writeText(txt);

          const newMark = MyMarker({
            pos:px,
            gmap,
            iconUrl:gmap.contributorMarker,
            title:p,
            col:null,
          });
          if(newMark)
            newMark.addTo(ContributorPanel.contributorLayer);
        }


        if(ContributorPanel.vContributor.contributorMode === 'mapLink'){
          const lat = +e.latlng.lat.toFixed(2);
          const lng = +e.latlng.lng.toFixed(2);

          if(!prevMapLinkClickLatLng){
            prevMapLinkClickLatLng = [lat,lng];
            return;
          }

          const txt = `[[${prevMapLinkClickLatLng[0]},${prevMapLinkClickLatLng[1]}],[${lat},${lng}]],\n`;
          GenericMap.addToTextArea(txt);

          prevMapLinkClickLatLng = null;

          ContributorPanel.vContributor.refreshIcons();
        }
      });
    }

    ContributorPanel.contributorLayer = L.layerGroup();
    ContributorPanel.contributorLayer.addTo(myMap);

    ContributorPanel.vContributor = new Vue(withRenderContrib({
      data:data(config),
      methods,
      mounted:function(this:Any){
        ContributorPanel.sidebar = gmap.createSidebar(this.$el, 'glyphicon-wrench',"Contributors");

        this.init();
      }
    }));
    ContributorPanel.vContributor.$mount();
  }
}