
import Vue from "vue";

import {easyButton, IconLayer} from "./markerHelpers";
import {Config} from "./Config";
const config = Config.c;

import withRenderSpeedrun from "./speedrunSideBar.vue";
import {UrlInfo} from "./UrlInfo";
import {Youtube} from "./Youtube";

declare let L:any;

export class SpeedrunPanel {
  static speedrunSidebar:any;
  static vSpeedrun:any;

  static addSpeedrun(myMap:any, onOpen:() => void){
    SpeedrunPanel.vSpeedrun = new Vue(withRenderSpeedrun({
      data: {
        videoAutoPlay:true,
        showYoutube:null, //null means dont show
        showVideo:true,
        acceptedCookie:false,
        links:config.speedrunLinks,
        videoName:'',
        videoWidth:340,
        urlInfo:null,
        glitches:<{urlInfo:UrlInfo,desc:string}[]>[],
      },
      methods:{
        async agreeYoutube(this:any){
          this.acceptedCookie = true;
          await Youtube.loadYoutube();
          if(this.urlInfo)
            this.setVideo(this.urlInfo, this.videoName);
        },
        setVideo(this:any,urlInfo:UrlInfo,name:string){
          SpeedrunPanel.speedrunSidebar.show();
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
      mounted:function(this:any){
        SpeedrunPanel.speedrunSidebar = L.control.sidebar(this.$el, {
          position: 'left'
        });
        myMap.addControl(SpeedrunPanel.speedrunSidebar);

        easyButton('glyphicon-hourglass',"Speedrun",function(){
          onOpen();
          SpeedrunPanel.speedrunSidebar.toggle();
          if(SpeedrunPanel.speedrunSidebar.isVisible())
            IconLayer.getLayer('glitchSkip')!.layerGroup.addTo(myMap); //BAD
        }).addTo(myMap);

        SpeedrunPanel.vSpeedrun.glitches = (<any[]>IconLayer.getGlitchMarkers()).map(m => {
          return {urlInfo:m.urlInfo,desc:m.desc};
        });
      }
    }));
    SpeedrunPanel.vSpeedrun.$mount();
  }
}

