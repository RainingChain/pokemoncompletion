/*! LICENSED CODE BY SAMUEL MAGNAN-LEVESQUE FOR SCRIPTERSWAR.COM */
import Vue from "vue";
import { easyButton, MyMarker, polyline } from "./markerHelpers";

import { Config } from "./Config";
import withRenderContrib from "./contributorSideBar.vue";
import { IconLayer } from "./markerHelpers";

const config = Config.c;

declare let L:any;

let prevMapLinkClickLatLng:number[] | null = null;

export class ContributorPanel {
  static contributorLayer:any;
  static contributorSidebar:any;
  static vContributor:any;

  static addToTextArea = function(str:string){
    const ta = (<HTMLTextAreaElement>document.getElementById('contribTextArea'));
    ta.value += str;
  }
  static addContributor(myMap:any, onOpen:() => void){
    ContributorPanel.contributorLayer = L.layerGroup();
    ContributorPanel.contributorLayer.addTo(myMap);

    
    myMap.on('click', function(e:any) {
      if (!e.latlng)
        return;

      if(ContributorPanel.vContributor.contributorMode === 'none')
        return;

      if(ContributorPanel.vContributor.contributorMode === 'icon'){
        //TEMP move to contributor panel
        const tooClose = IconLayer.getAllMarkers().some(m => {
          const MAX_DIST = config.mapIsSplitInMultipleImages ? 0.2 : 2;
          return (Math.abs(e.latlng.lat - m._latlng.lat) + Math.abs(e.latlng.lng - m._latlng.lng)) <= MAX_DIST;
        });
        if(tooClose){
          alert("Error: This icon is too close to an existing icon.");
          return;
        }

        const quickEdit = !e.originalEvent.ctrlKey;
        const p = quickEdit ? '' : prompt("Description") || '';

        const lat = e.latlng.lat.toFixed(config.mapIsSplitInMultipleImages ? 2 : 0);
        const lng = e.latlng.lng.toFixed(config.mapIsSplitInMultipleImages ? 2 : 0);
        const px = config.convertWHToPixel([lat,lng]);
        const txt = `{"pos":[${px[0]},${px[1]}],"name":"${p}","iconUrl":"","flag":""},\n`;
        ContributorPanel.addToTextArea(txt);

        const POKEMON = false;
        if(POKEMON)
          navigator.clipboard.writeText(`"pos":[${px[0]},${px[1]}]`);
        else
          navigator.clipboard.writeText(txt);


        const newMark = MyMarker(px,"pokemon/p213.png",p);
        if(newMark)
          newMark.addTo(ContributorPanel.contributorLayer);
      }


      if(ContributorPanel.vContributor.contributorMode === 'mapLink'){
        const lat = e.latlng.lat.toFixed(config.mapIsSplitInMultipleImages ? 2 : 0);
        const lng = e.latlng.lng.toFixed(config.mapIsSplitInMultipleImages ? 2 : 0);
        const px = config.convertWHToPixel([lat,lng]);

        if(!prevMapLinkClickLatLng){
          prevMapLinkClickLatLng = px;
          return;
        }

        const txt = `[[${prevMapLinkClickLatLng[0]},${prevMapLinkClickLatLng[1]}],[${px[0]},${px[1]}]],\n`;
        ContributorPanel.addToTextArea(txt);

        prevMapLinkClickLatLng = null;

        ContributorPanel.vContributor.refreshIcons();
      }
    });

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
          const myMapHtml = document.getElementById('pkInteractiveMap-slot');
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
                return MyMarker(<any>[...marker.pos,...marker.pos], marker.iconUrl || "pokemon/p213.png",marker.name);
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