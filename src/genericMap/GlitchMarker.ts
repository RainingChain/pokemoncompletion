
import {UrlInfo} from "./UrlInfo";
import {SpeedrunPanel} from "./speedrunSideBar";
import {Pos,MyMarker} from "./markerHelpers";
import L from "leaflet";
import { GenericMap } from "./genericMap";

export const markerToGlitchInfo = new Map<L.Marker, {urlInfo:UrlInfo,desc:string,}>();

export const GlitchMarker = function(gmap:GenericMap,pos:Pos,isGlitch:boolean,desc:string,linkSrc:string){
  /*const mark = MyMarker({
    gmap,
    pos,
    iconUrl:isGlitch ? "glitch.png" : "skip.png",
    title:desc,
    popupText:desc + "<br>Click to play video",
  });
  if (!mark)
    return null;
  const urlInfo = UrlInfo.create(linkSrc);
  mark.on('click',function(){
    SpeedrunPanel.vSpeedrun.setVideo(urlInfo,desc);
  });
  markerToGlitchInfo.set(mark, {
    urlInfo,
    desc
  });
  return mark;*/
  return null;
}