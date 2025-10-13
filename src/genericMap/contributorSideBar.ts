/*! LICENSED CODE BY SAMUEL MAGNAN-LEVESQUE FOR SCRIPTERSWAR.COM */
import Vue from "vue";
import { easyButton, MyMarker, polyline } from "./markerHelpers";

import { Config } from "./Config";
import withRenderContrib from "./contributorSideBar.vue";
import { IconLayer } from "./markerHelpers";

const config = Config.c;

declare let L:any;

export class ContributorPanel {
  static contributorLayer:any;
  static contributorSidebar:any;
  static vContributor:any;

  static addContributor(myMap:any, onOpen:() => void){
    ContributorPanel.contributorLayer = L.layerGroup();
    ContributorPanel.contributorLayer.addTo(myMap);

    ContributorPanel.vContributor = new Vue(withRenderContrib({
      data: {
        contributorMode:'none',
        firstTime:true,
        contributors:config.contributors,
        fullImgSize:config.fullImgSize,
        fullImgUrl:config.fullImgUrl,
      },
      methods:{
        onContributorModeChange(this:any){
          const myMapHtml = document.getElementById('myMap');
          if(!myMapHtml)
            return;

          if(ContributorPanel.vContributor.contributorMode !== 'none'){
            myMapHtml.classList.add('crosshairPointer');
            ContributorPanel.contributorLayer.addTo(myMap);

            if (ContributorPanel.vContributor.firstTime &&
                window.location.href.includes('localhost')){
              ContributorPanel.vContributor.firstTime = false;

              IconLayer.forEachMarkerLayers(lay => {
                lay.markers.forEach(marker => {
                  marker.on('click',function(e:any){
                    if(!e.latlng)
                      return;
                    const lat = e.latlng.lat.toFixed(config.mapIsSplitInMultipleImages ? 1 : 0);
                    const lng = e.latlng.lng.toFixed(config.mapIsSplitInMultipleImages ? 1 : 0);
                    const px = config.convertWHToPixel([lat,lng]);
                    navigator.clipboard.writeText(`,"pos":[${px[0]},${px[1]}]`);
                  });
                });
              });
            }
          } else {
            myMapHtml.classList.remove('crosshairPointer');
            ContributorPanel.contributorLayer.removeFrom(myMap);
          }
        },
        refreshIcons(this:any){
          ContributorPanel.contributorLayer.eachLayer(function (layer:any) {
            ContributorPanel.contributorLayer.removeLayer(layer);
          });

          const str = (<HTMLTextAreaElement>document.getElementById('contribTextArea')).value.split('\n');

          str.map(line => {
            line = line.trim().slice(0, -1); //remove trailing ,
            if(!line)
              return null;
            try {
              const marker = JSON.parse(line);
              if (Array.isArray(marker))
                return polyline(<any>marker);
              else
                return MyMarker(<any>[...marker.pos,...marker.pos], marker.iconUrl || "contributorMarker.png",marker.name);
            } catch(_err){
              return null;
            }
          })
          .filter(m => m)
          .forEach(m => m.addTo(ContributorPanel.contributorLayer));
        }
      },
      mounted:function(this:any){
        ContributorPanel.contributorSidebar = L.control.sidebar(this.$el, {
          position: 'left'
        });
        myMap.addControl(ContributorPanel.contributorSidebar);

        easyButton('glyphicon-cog',"Contributors",function(){
          onOpen();
          ContributorPanel.contributorSidebar.toggle();
        }).addTo(myMap);
      }
    }));
    ContributorPanel.vContributor.$mount();
  }
}