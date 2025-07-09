
<div id="contributor-sidebar">
  <div v-show="!contributorMode">
    <h3>Credits</h3>
    <ul>
      <li class="bold" style="font-size:1.2em">RainingChain</li>
      <li v-for="contributor in contributors">
        <a v-if="contributor.href" :href="contributor.href" target="_blank" rel="noopener">{{contributor.text}}</a>
        <span v-else>{{contributor.text}}</span>
      </li>
    </ul>

    <div>
      Feedback: Contact RainingChain on Discord</li>
    </div>
    <br>
    <div>
      Contribute by adding missing icons and glitch videos
    </div>
  </div>

  <label><input type="checkbox" v-model="contributorMode" @change="onContributorModeChange"> Activate Contributor Mode</label>
  <div v-show="contributorMode" style="height:calc(100% - 100px)">
    <h3>How to contribute</h3>
    <div>
      <ol>
        <li>Click on the map where you want to add an icon.</li>
        <li>Enter the description in the dialogue box. This will add an entry in the textbox below.</li>
        <li>Once all icons have been done, send the textbox content to RainingChain on Discord.</li>
      </ol>
    </div>
    <button @click="refreshIcons" class="btn btn-primary">Refresh Icons</button>
    <textarea id="contribTextArea" style="width:100%;height:calc(100% - 130px)"></textarea>
  </div>

  <div v-if="fullImgUrl">
    <br>
    <a :href="fullImgUrl" download>Download map image</a> ({{fullImgSize}})
  </div>
</div>
