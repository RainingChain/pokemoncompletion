
import Vue from "vue";
import { easyButton, MyMarker } from "./markerHelpers";

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
        contributorMode:false,
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

          if(ContributorPanel.vContributor.contributorMode){
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

          const str = (<HTMLTextAreaElement>document.getElementById('contribTextArea')).value;
          if (config.DEBUG){
            const maches = str.match(/\[.*?\]/g);
            if (maches){
              Array.from(maches).map(line => {
                const [lat,lng] = JSON.parse(line);
                return MyMarker([lat,lng,lat,lng],"contributorMarker.png",'');
              })
                  .forEach(m => m.addTo(ContributorPanel.contributorLayer));
            }
          } else {
            str
                .split('\n')
                .map(s => s.trim())
                .filter(a => a)
                .map(line => {
                  const el = line.replace('[','').replace(']','').split(',');
                  if(el.length < 2)
                    return null;
                  const desc = el.slice(2).join(',') || 'No description'; //case desc had comma
                  const lat = +el[0];
                  const lng = +el[1];
                  if(isNaN(lat) || isNaN(lng))
                    return null;
                  return MyMarker([lat,lng,lat,lng],"contributorMarker.png",desc);
                })
                .filter(m => m)
                .forEach(m => m.addTo(ContributorPanel.contributorLayer));
          }
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