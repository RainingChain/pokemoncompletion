import type { Config } from "./Config";
import type { IconLayer as IconLayer2 } from "./markerHelpers";

export const initShowHideAll = function(myMap:any,IconLayer:typeof IconLayer2,controlLayers:any, alternativeMap?:Config['alternativeMap']){
  //hack for All and Hide buttons:
  (<any>window).showAll = function(){
    IconLayer.forEachMarkerLayers(v => {
      v.layerGroup.addTo(myMap);
    });
    hack();
  };

  (<any>window).hideAll = function(){
    IconLayer.forEachMarkerLayers(v => {
      v.layerGroup.removeFrom(myMap);
    });
    hack();
  };

  (<any>window).hideControlLayers = function(){
    controlLayers.collapse();
    hack();
  };
  const hack = function(){
    const overlay = document.querySelector('.leaflet-control-layers-overlays');
    if(!overlay)
      return;
    if(!overlay.querySelector('.leaflet-bar')){ //missing All and None
      overlay.insertAdjacentHTML('afterbegin',`
        <div class="leaflet-bar" style="text-align:center;margin-bottom:5px;display:inline-block;width:45%">
          <button type="button" onclick="showAll()" style="margin:0px;line-height:20px;width:100%;height:25px;">
            <span>All</span>
          </button>
        </div>
        <div class="leaflet-bar" style="text-align:center;margin-bottom:5px;display:inline-block;width:45%">
          <button type="button" onclick="hideAll()" style="margin:0px;line-height:20px;width:100%;height:25px;">
            <span>None</span>
          </button>
        </div>
      `);
    }
    const contrForm = document.querySelector('.leaflet-control-layers-list');
    if(!contrForm)
      return;
    if(!contrForm.querySelector('.glyphicon-remove')){ //missing close
      contrForm.insertAdjacentHTML('afterbegin',`
        <div style="position:absolute;top:-5px;right:-5px;width:20px;height:20px;">
          <span onclick="hideControlLayers()" class="glyphicon glyphicon-remove" style="font-size:20px;cursor: pointer;"></span>
        </div>
      `);
    }


    if(alternativeMap){
      if(!overlay.querySelector('.sketch-map-link')){ //missing Sketch Map link
        const text = alternativeMap.text;
        const url = alternativeMap.href;
        overlay.insertAdjacentHTML('beforeend',`
          <div style="margin-top:10px" class="sketch-map-link">
            <a href="${url}" target="_blank" rel="noopener">Use ${text} map image</a>
          </div>
        `);
      }
    }
  };

  hack();
  setInterval(hack, 1000);
}