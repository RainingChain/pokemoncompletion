
declare let YT:any;

export class Youtube {
  static youtubePlayer:any;

  static youtubeLoaded = false;
  static async loadYoutube(){
    if(Youtube.youtubeLoaded)
      return;
    Youtube.youtubeLoaded = true;

    //Youtube
    return new Promise<void>(resolve => {
      (<any>window).onYouTubeIframeAPIReady = function(){
        Youtube.youtubePlayer = new YT.Player('youtube-player', {
          height: 420 / 640 * 360,
          width: 420,
          events: {
            onReady: function() {
              setTimeout(resolve, 500);
            },
            onStateChange: function() {}
          }
        });
        Youtube.youtubePlayer.getIframe().title = "";
      }

      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode!.insertBefore(tag, firstScriptTag);
    });
  }
}