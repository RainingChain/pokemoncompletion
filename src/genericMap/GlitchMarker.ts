
import {UrlInfo} from "./UrlInfo";
import {SpeedrunPanel} from "./speedrunSideBar";
import {Pos,MyMarker} from "./markerHelpers";

export const GlitchMarker = function(pos:Pos,isGlitch:boolean,desc:string,linkSrc:string){
  const mark = MyMarker(pos,isGlitch ? "glitch.png" : "skip.png",desc,desc + "<br>Click to play video");
  const urlInfo = UrlInfo.create(linkSrc);
  mark.on('click',function(){
    SpeedrunPanel.vSpeedrun.setVideo(urlInfo,desc);
  });
  mark.urlInfo = urlInfo;
  mark.desc = desc;
  return mark;
}