
<div id="contributor-sidebar">
  <div v-show="contributorMode === 'none'">
    <h3>Credits</h3>
    <div>
      <div style="font-size:1.1em">Website, Design & More</div>
      <ul style="margin-top:0px; max-height:100px;overflow-y:auto;">
        <li class="bold" style="font-size:1.2em"><a target='_blank' rel="noopener" href='https://discord.gg/dKEegX4'>RainingChain</a></li>
      </ul>

      <div v-for="contributorGrp in contributors" :style="{fontSize:contributorGrp.fontSize || ''}">
        <div v-if="contributorGrp.title">{{contributorGrp.title}}</div>
        <ul style="margin-top:0px; max-height:100px;overflow-y:auto;">
          <li v-for="contributor in contributorGrp.list">
            <span v-if="contributor.html" v-html="contributor.html"></span>
            <a v-else-if="contributor.href" :href="contributor.href" target="_blank" rel="noopener">{{contributor.text}}</a>
            <span v-else>{{contributor.text}}</span>
          </li>
        </ul>
      </div>
    </div>
    <div v-if="fullImgUrl">
      <br>
      <a :href="fullImgUrl" download>Download map image</a> ({{fullImgSize}})
    </div>

    <div>
      For feedback or to contribute, contact @RainingChain on <a target='_blank' rel="noopener" href='https://discord.gg/dKEegX4'>Discord</a></li>
    </div>
    <div v-if="isHk" style="padding:10px 0px">
      Nook has given permission to scripterswar.com to use the high-resolution map image originally made for <a href="https://www.hallownest.net/">hallownest.net</a>.
    </div>
    <br>
    <div>
      <button @click="activateContributorMode">Activate Contributor Mode</button>
    </div>
  </div>

  <div v-show="contributorMode !== 'none'">
    <p>
      Before contributing, contact @RainingChain on <a target='_blank' rel="noopener" href='https://discord.gg/dKEegX4'>Discord</a>
    </p>

    <div style="font-size:1.2em">
      Contributor Mode:
      <div style="padding-left:10px">
        <input type="radio" id="ContributorModeIcon" value="icon" v-model="contributorMode">
        <label for="ContributorModeIcon">Icon</label>
        <br>
        <input type="radio" id="ContributorModeMapLink" value="mapLink" v-model="contributorMode">
        <label for="ContributorModeMapLink">Map Link</label>
      </div>
    </div>

    <div v-show="contributorMode !== 'none'" style="height:calc(100% - 100px)">
      <h3>How to contribute</h3>
      <div>
        <ol>
          <li v-show="contributorMode === 'icon'">Click on the map where you want to add a nameless icon.</li>
          <li v-show="contributorMode === 'icon'">Ctrl+Click to add an icon with a description.</li>

          <li v-show="contributorMode === 'mapLink'">Click twice the map to add a white line connecting your 2 clicks.</li>
          <li v-show="contributorMode === 'mapLink'">Press ESCAPE to cancel your first click.</li>

          <li>Once all icons/map links have been added, send the textbox content to RainingChain on <a target='_blank' rel="noopener" href='https://discord.gg/dKEegX4'>Discord</a>.</li>
        </ol>
      </div>
      <button @click="refreshIcons" class="btn btn-primary">Refresh Icons</button>
      <textarea id="contribTextArea" style="width:100%;height:calc(100% - 130px)"></textarea>
    </div>


    <h4>Contributor Mode Features</h4>
    <ul>
      <li>In contributor mode, icon titles contain their position.</li>
      <li>Click an existing icon to set the clipboard to "pos":[XXX,YYY]</li>
      <li>Ctrl+Click an existing map link to set the clipboard to [[XXX,YYY],[XXX,YYY]]</li>
    </ul>
  </div>
</div>
