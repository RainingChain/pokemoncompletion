<div>
  <h5 @click="display = !display" :title="dllVersion">
    {{display ? '▼' : '▶'}} Savefile (.sav) Utilities
  </h5>
  <div v-if="display" style="margin-left:20px;padding-bottom:20px">
    Load your game savefile (.sav) to mark collected elements{{events.length ? ' or simulate discontinued events' : ''}}.
    <br>
    <br>
    <div v-if="!savInfos[0].hasSavData">
      <label for="file-upload" class="button" style="cursor: pointer;">
        Load .sav
      </label>
      <input id="file-upload" accept=".sav, .srm, .bin" style="display: none;" type="file" @change="onSavFileLoaded($event, 0)"/>

      <div v-if="events.length">
        <br>
        <h6 @click="displayEvents = !displayEvents">{{displayEvents ? '▼' : '▶'}} Simulable Events</h6>
        <ul v-if="displayEvents" style="margin-bottom:-10px">
          <li v-for="ev in events">
            <a :href="ev.url" target="_blank" rel="noopener">{{ev.fullName}}</a>:
            <span v-if="ev.longDesc">{{ev.longDesc}}</span>
            <span v-else-if="ev.promo" :title="ev.where + ' (' + ev.when + ')'">
              From {{ev.promo}} ({{ev.region}})
            </span>
            <span v-else="">
              From <span :title="'Region: ' + ev.region">{{ev.where}}</span> ({{ev.when}})
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div v-else>
      <div v-for="(savInfo,i) in savInfos" v-if="savInfo.hasSavData" style="padding-bottom:20px">
        <div style="display:flex">
          <div>
            <div>Currently loaded savefile #{{i+1}}: {{savInfo.savDataFilename}}</div>
            <div style="margin-left:20px">{{savInfo.savDataDesc}}</div>
          </div>
          <div><button style="margin-left:20px" @click="unloadSav(i)">Unload .sav</button></div>
        </div>

        <div style="padding-top:5px;padding-left:20px" v-if="savInfo.modificationsAppliedOnSavFile.length">
          Modifications:
          <ul style="margin-top:5px">
            <li v-for="m in savInfo.modificationsAppliedOnSavFile">{{m}}</li>
          </ul>
          <a v-if="savInfo.modifiedSavDataUrl" type="download" :href="savInfo.modifiedSavDataUrl" :download="savInfo.savDataFilenameModified">Download modified .sav #{{i + 1}}</a>
        </div>
      </div>

      <div v-if="!savInfos[1].hasSavData && hasEventUsingSavB">
        <label for="file-upload" class="button" style="cursor: pointer;">
          Load .sav #2
        </label>
        <input id="file-upload" accept=".sav, .srm, .bin" style="display: none;" type="file" @change="onSavFileLoaded($event, 1)"/>
      </div>
    </div>
    <div v-if="messages.length">
      <br>
      <div>Messages:</div>
      <ul style="margin-top:5px">
        <li v-for="m in messages" :class="{'cs-red':m.includes('rror:')}">{{m}}</li>
      </ul>
      <br>
    </div>
  </div>

  <div v-if="display && savInfos[0].hasSavData" style="margin-left:20px">
    <h5  @click="displayImport = !displayImport">
      {{displayImport ? '▼' : '▶'}} Import Progress <span style="font-size:0.8em">({{obtainedDifferencesWithSav_AllCount === 0 ? 'No Differences' : 'x' + obtainedDifferencesWithSav_AllCount + ' Differences'}})</span>
    </h5>
    <div style="padding-left:20px" v-if="displayImport">
      <div v-if="!obtainedDifferencesWithSav_toMarkCount && !obtainedDifferencesWithSav_toUnmarkCount">No differences between .sav and website tracker</div>

      <div v-if="obtainedDifferencesWithSav_toMarkCount || obtainedDifferencesWithSav_toUnmarkCount">
        <button @click="updateObtainedBasedOnSav_all">Sync All Categories</button>
        <button @click="updateSavObtainedStatus">Refresh Differences</button>

        <h6 v-if="obtainedDifferencesWithSav_toMarkCount" style="text-decoration:underline">Elements obtained in .sav file but not marked as obtained in the website tracker:</h6>
        <table v-if="obtainedDifferencesWithSav_toMarkCount" style="margin-bottom:20px">
          <tr v-for="m in obtainedDifferencesWithSav" v-if="m.toMarkAsObtainedNamesStr" :key="m.categoryName">
            <td>{{m.categoryName}}</td>
            <textarea v-model="m.toMarkAsObtainedNamesStr" style="width:400px"></textarea>
            <td><button @click="updateObtainedBasedOnSav(m.categoryId, true, true)">Sync {{m.categoryName}}</button></td>
          </tr>
        </table>

        <h6 v-if="obtainedDifferencesWithSav_toUnmarkCount" style="text-decoration:underline">Elements not obtained in .sav file but marked as obtained in the website tracker:</h6>
        <table v-if="obtainedDifferencesWithSav_toUnmarkCount"  style="margin-bottom:20px">
          <tr v-for="m in obtainedDifferencesWithSav" v-if="m.toMarkAsNotObtainedNamesStr" :key="m.categoryName">
            <td>{{m.categoryName}}</td>
            <textarea v-model="m.toMarkAsNotObtainedNamesStr" style="width:400px"></textarea>
            <td><button @click="updateObtainedBasedOnSav(m.categoryId, false, true)">Sync {{m.categoryName}}</button></td>
          </tr>
        </table>
      </div>

      <div v-if="savIncompleteHints.length" style="padding-top:15px">
        <h6>Incomplete objective details:</h6>
        <ul>
          <li v-for="savIncompleteHint in savIncompleteHints" :title="savIncompleteHint">{{savIncompleteHint.slice(0, 200)}}</li>
        </ul>
      </div>
    </div>
    <br>
  </div>
  <div v-if="display && savInfos[0].hasSavData && events.length" style="margin-left:20px">
    <h5  @click="displayEvents = !displayEvents">
      {{displayEvents ? '▼' : '▶'}} Trigger Events
    </h5>
    <div style="padding-left:20px" v-if="displayEvents">
      Select the event you want to simulate on your .sav file.
      <br>
      <div>
        <div>
          <select v-model="selectedEventId">
            <option v-for="evt in events" :value="evt.id">{{evt.name}}</option>
          </select>
          <span style="padding-left:20px" v-if="selectedEvent_warning" class="cs-orange">{{selectedEvent_warning}}</span>
        </div>
        <div style="padding:10px" v-if="selectedEvent">
          <p>
            <a :href="selectedEvent.url" target="_blank" rel="noopener">{{selectedEvent.fullName}}</a>:
            <span v-if="selectedEvent.longDesc">{{selectedEvent.longDesc}}</span>
            <span v-else-if="selectedEvent.promo" :title="selectedEvent.where + ' (' + selectedEvent.when + ')'">
              {{selectedEvent.promo}} ({{selectedEvent.region}})
            </span>
            <span v-else="">
              <span :title="'Region: ' + selectedEvent.region">{{selectedEvent.where}}</span> ({{selectedEvent.when}})
            </span>
          </p>
          <p v-if="selectedEvent.requirements">
            {{selectedEvent.requirements}}
          </p>
        </div>
        <button @click="triggerEvent" v-if="selectedEvent">Trigger Event</button>
        <div style="padding:10px" v-if="hasTriggeredEvent" v-for="(savInfo,i) in savInfos">
          <a v-if="savInfo.modifiedSavDataUrl" type="download" :href="savInfo.modifiedSavDataUrl" :download="savInfo.savDataFilenameModified">Download modified .sav #{{i+1}}</a>
        </div>
      </div>
    </div>
    <br>
  </div>
  <div v-if="display && savInfos[0].hasSavData && supportSortPkms" style="margin-left:20px">
    <h5  @click="displaySortPkms = !displaySortPkms">
      {{displaySortPkms ? '▼' : '▶'}} Sort Pokémons
    </h5>
    <div style="padding-left:20px" v-if="displaySortPkms">
      Sort Pokémons in PC Boxes by their National Pokédex number.
      <br>
      <button @click="sortPkms">Sort</button>
    </div>

    <div style="padding:10px" v-if="hasSorted" v-for="(savInfo,i) in savInfos">
      <a v-if="savInfo.modifiedSavDataUrl" type="download" :href="savInfo.modifiedSavDataUrl" :download="savInfo.savDataFilenameModified">Download modified .sav #{{i + 1}}</a>
    </div>
  </div>
  <br v-if="display">
</div>