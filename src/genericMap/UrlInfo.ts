
export class UrlInfo { //copy of Zdb
  domain:'youtube' | 'twitch' = undefined!;
  videoId:string = undefined!;
  time:number = undefined!;

  static create(url:string){
    const q = url.split('?');
    let time = 0;
    if(q[1]){
      let ts = q[1].replace('t=','');
      if(!isNaN(+ts)) //aka ?t=12321
        time = +ts;
      else { //aka ?t=1h02m20
        if(ts.indexOf('s') === -1)
          ts = ts + "00s"
        if(ts.indexOf('m') === -1)
          ts = "00m" + ts;
        if(ts.indexOf('h') === -1)
          ts = '00h' + ts;
        const ts2 = ts.replace('h','_').replace('m','_').replace('s','');
        const ts3 = ts2.split('_');
        time = (+ts3[0]) * 3600 + (+ts3[1]) * 60 + (+ts3[2]);
      }
    }
    const domain = q[0].indexOf('twitch') !== -1 ? 'twitch' : 'youtube';
    //crash if fails but wanted
    const videoId = domain === 'youtube'
      ? q[0].match(/[\w|_|-]{10,15}/)![0]  //real count is 11
      : q[0].match(/[\d]{6,15}/)![0];    //real count is 7.

    const urlInfo = new UrlInfo();
    urlInfo.domain = domain;
    urlInfo.videoId = videoId;
    urlInfo.time = time;
    return urlInfo;
  }
  getUrl(){
    return this.domain === "youtube"
      ? "https://youtu.be/" + this.videoId + "?t=" + this.time
      : "https://www.twitch.tv/videos/" + this.videoId + "?t=" + this.time + "s";
  }
  getEmbedUrl(){
    return this.domain === "youtube"
      ? "https://www.youtube-nocookie.com/embed/" + this.videoId + "?t=" + this.time
      : "https://player.twitch.tv/?video=v" + this.videoId + "?t=" + this.time + "&autoplay=false";
  }
}