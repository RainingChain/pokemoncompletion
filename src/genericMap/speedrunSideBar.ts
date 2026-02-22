/*! LICENSED CODE BY SAMUEL MAGNAN-LEVESQUE FOR SCRIPTERSWAR.COM */
import Vue from "vue";

import {Config} from "./Config";

import withRenderSpeedrun from "./speedrunSideBar.vue";
import {UrlInfo} from "./UrlInfo";
import {Youtube} from "./youtube";
import { LeafletSidebar } from "./leaflet_type";
import {markerToGlitchInfo} from "./GlitchMarker";
import L from "leaflet";
import { GenericMap } from "./genericMap";

const data = (config:Config) => ({
  videoAutoPlay:true,
  showYoutube:<boolean|null>null, //null means dont show
  showVideo:true,
  acceptedCookie:false,
  videoName:'',
  videoWidth:340,
  urlInfo:<UrlInfo|null>null,
  glitches:<{urlInfo:UrlInfo,desc:string}[]>[],
});

export type SpeedrunPanel_this = ReturnType<typeof data> & {
    $mount:() => void,
    setVideo:(urlInfo:UrlInfo,name:string) => void;
  };

export class SpeedrunPanel {
  static sidebar:LeafletSidebar & L.Control;
  static vSpeedrun:SpeedrunPanel_this;

  static addSpeedrun(gmap:GenericMap){
    const {myMap,config} = gmap;
    SpeedrunPanel.vSpeedrun = new Vue(withRenderSpeedrun({
      data:data(config),
      methods:{
        async agreeYoutube(this:SpeedrunPanel_this){
          this.acceptedCookie = true;
          await Youtube.loadYoutube();
          if(this.urlInfo)
            this.setVideo(this.urlInfo, this.videoName);
        },
        setVideo(this:SpeedrunPanel_this,urlInfo:UrlInfo,name:string){
          gmap.openCloseSidebar(SpeedrunPanel.sidebar);
          this.videoName = name;
          this.urlInfo = urlInfo;
          if(!this.acceptedCookie){
            Vue.nextTick(() => {
              const el = document.getElementById("speedrun-sidebar");
              if(!el)
                return;
              el.scrollTop = el.scrollHeight;
            });
            return;
          }

          if(urlInfo.domain === "youtube"){
            if(!Youtube.youtubePlayer)
              return;
            this.showYoutube = true;
            Youtube.youtubePlayer.loadVideoById(urlInfo.videoId, urlInfo.time || 0);
            //stop twitch
            if(!this.videoAutoPlay)
              Youtube.youtubePlayer.stopVideo();
          } else {
            this.showYoutube = false;
            if(Youtube.youtubePlayer)
              Youtube.youtubePlayer.stopVideo();

            const el = <HTMLIFrameElement>document.getElementById("twitch-player");
            if(el)
              el.src = urlInfo.getEmbedUrl();
          }
          Vue.nextTick(() => {
            const el = document.getElementById("speedrun-sidebar");
            if(!el)
              return;
            el.scrollTop = el.scrollHeight;
          });
        },
      },
      mounted:function(this:{$el:HTMLElement}){
        SpeedrunPanel.sidebar = gmap.createSidebar(this.$el, 'glyphicon-hourglass',"Speedrun");

        SpeedrunPanel.sidebar.on('show', () => {
          //TEMP IMPORTANT
            // gmap.getLayer('glitchSkip')!.layerGroup.addTo(myMap); //BAD
        });

        /*SpeedrunPanel.vSpeedrun.glitches = gmap.getGlitchMarkers().map(m => {
          return markerToGlitchInfo.get(m)!;
        }).filter(a => a);*/
      }
    }));
    SpeedrunPanel.vSpeedrun.$mount();
  }
}

