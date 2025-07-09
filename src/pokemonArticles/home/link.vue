<li style="padding:8px 0px">
  <div class="flex">
    <div class="home-gameLogo"><div class="genericMap-marker" :class="klass"></div></div>
    <a style="margin-left:35px" :href="href">{{name}}</a> <span v-if="desc" style="margin-left:5px">{{desc}}</span>
  </div>
</li>