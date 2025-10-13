
<div id="contributor-sidebar">
  <div v-show="contributorMode === 'none'">
    <h3>Credits</h3>
    <ul>
      <li class="bold" style="font-size:1.2em">RainingChain</li>
      <li v-for="contributor in contributors">
        <a v-if="contributor.href" :href="contributor.href" target="_blank" rel="noopener">{{contributor.text}}</a>
        <span v-else>{{contributor.text}}</span>
      </li>
    </ul>

    <div>
      Feedback: Contact RainingChain on <a target='_blank' rel="noopener" href='https://discord.gg/dKEegX4'>Discord</a></li>
    </div>
    <br>
    <div>
      Contribute by adding missing icons and glitch videos
    </div>
  </div>

  <div style="font-size:1.2em">
    Contributor Mode:
    <div style="padding-left:10px">
      <input type="radio" id="ContributorModeInactive" value="none" v-model="contributorMode" @change="onContributorModeChange">
      <label for="ContributorModeInactive">Inactive</label>
      <br>
      <input type="radio" id="ContributorModeIcon" value="icon" v-model="contributorMode" @change="onContributorModeChange">
      <label for="ContributorModeIcon">Icon</label>
      <br>
      <input type="radio" id="ContributorModeMapLink" value="mapLink" v-model="contributorMode" @change="onContributorModeChange">
      <label for="ContributorModeMapLink">Map Link</label>
    </div>
  </div>

  <div v-show="contributorMode !== 'none'" style="height:calc(100% - 100px)">
    <h3>How to contribute</h3>
    <div>
      <ol>
        <li v-show="contributorMode === 'icon'">Click on the map where you want to add a nameless icon.</li>
        <li v-show="contributorMode === 'icon'">Cltr+Click to add an icon with a description.</li>

        <li v-show="contributorMode === 'mapLink'">Click twice the map to add a white line connecting your 2 clicks.</li>

        <li>Once all icons/map links have been added, send the textbox content to RainingChain on <a target='_blank' rel="noopener" href='https://discord.gg/dKEegX4'>Discord</a>.</li>
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
