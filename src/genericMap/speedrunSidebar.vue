<div id="speedrun-sidebar" style="padding:15px;overflow-x:hidden">
  <div style="height:calc(100% - 100px)">
    <h3>Useful Links</h3>
    <div>
      <ul>
        <li v-for="link in links"><a :href="link.href" target="_blank" rel="noopener">{{link.text}}</a></li>
      </ul>
    </div>

    <h3>Skips & Glitches</h3>
    <div>
      <ul>
        <li v-for="g in glitches"><a @click="setVideo(g.urlInfo,g.desc)">{{g.desc}}</a></li>
      </ul>
    </div>

    <div v-show="showVideo" style="margin-top:30px">
      <h4 style="width:100%;">{{videoName}}</h4>
      <div v-show="!acceptedCookie">
        <button style="margin-left:5px;background-color:#21a3ea;color:#fff;padding:2px 10px;border-radius:3px;font-size:20px;border:none;" @click="agreeYoutube">
          Load Video
        </button>
        <br>
        <div style="padding-top:10px;padding-bottom:10px;">
          By loading the video, you agree to <a href="https://policies.google.com/privacy?hl=en" target="_blank" rel="noopener">Youtube's</a> and <a href="https://www.twitch.tv/p/legal/privacy-notice" target="_blank" rel="noopener">Twitch's</a> privacy policies.
        </div>
      </div>
      <div v-show="acceptedCookie">
        <div v-show="showYoutube === true">
          <div id="youtube-player"></div>
        </div>
        <iframe id="twitch-player" v-show="showYoutube === false" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>

  </div>
</div>