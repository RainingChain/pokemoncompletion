
<div class="pk-root-container" :class="compactView ? 'compactView' : ''">

<h3 class="pokemon-title flex">
  <div v-if="iconData" :class="iconData.sizeClass"  style="width:32px;height:32px;margin-right:3px;">
    <div class="genericMap-marker" :class="iconData.spriteClass"></div>
  </div>
  <a href="/completion"><span>Pokémon 100% Checklist</span></a><span>▸</span><span>Pokémon {{name}} {{interactiveMap ? 'with Interactive Map' : ''}}</span>
</h3>

<div v-if="wip" style="color: #f0ad4e;text-shadow: 0.1em  0.1em 0 #000 !important;font-size:2em;padding-bottom:10px;">
  <div>This page is a work in progress.</div>
  <div style="font-size:0.5em">TODO: {{wip}}</div>
</div>

<div v-if="!waresByType.length">
  The goal is to collect everything possible using only the Pokémon {{name}} game, without glitches. Pokémons or items requiring additional games, other players, Nintendo events, or an internet connection are considered unobtainable and are not required for 100% completion. (Similar to glitchless speedrun ruleset.)
  <br>
  <br>
</div>

<div class="div-section" v-if="waresByType.length">
  <div style="margin-top:20px">
    <h5 @click="displayPlayingWith = !displayPlayingWith, saveSettingsToLocalStorage()">
      {{displayPlayingWith ? '▼' : '▶'}} Playing with:
    </h5>
    <div @click="displayPlayingWith = true">
      <label class="clickable" v-for="w in waresByType" style="margin-left:10px" v-if="mustHideEmulator() && w.type.includes('emulator') ? false : true">
        <input type="radio" :value="w.type" v-model="playingWith"  @change="onOwnedWaresChanged()"> {{w.name}}
      </label>
      <div style="margin-left:20px;padding-top:5px;opacity:0.5;" v-if="!displayPlayingWith">
        {{getWareGroups().length}} options hidden
      </div>
    </div>
  </div>
  <table style="padding-left:40px" class="noPaddingIfSmallDevice" v-if="displayPlayingWith" >
    <tr v-for="grp in getWareGroups()" :key="grp.id + playingWith" v-if="showAllWares || grp.wares[0].visible">
      <td :style="{padding:grp.wares.length > 1 ? '5px 0px' : ''}" class="flex">
        <div style="margin:auto 0" v-show="!grp.isLabel" :style="{paddingLeft:(grp.indent * 20) + 'px'}">
          <input type="checkbox" v-model="grp.wares[0].owned" @change="onOwnedWareGroupChanged(grp)" :id="grp.id + playingWith" :disabled="grp.wares[0].minCount > 0">
        </div>
        <table :style="{borderLeft:grp.wares.length > 1 ? '0.5px solid rgba(255,255,255,0.3)' : ''}" style="border-radius:8px;">
          <tr v-for="w in grp.wares">
            <td>
              <div>
                <label style="padding-left:5px;" :for="grp.id + playingWith" class="clickable" :class="{'cs-orange':grp.wares[0].hasWarning && grp.wares[0].minCount === 0}">
                  {{w.name}}
                </label>
                <span v-if="w.url">
                  ({{w.url[2] === undefined ? 'Ex: ' : w.url[2]}}<a :href="w.url[1]" target="_blank" rel="noopener">{{w.url[0]}}</a>)
                </span>
                <span v-if="w.warning" style="color: #f0ad4e; text-shadow: 0.1em  0.1em 0 #000;">⚠{{w.warning}}⚠</span>
                <span v-if="w.desc" style="padding-left:5px" class="clickable" @click="w.expanded = !w.expanded">{{w.expanded ? '▼' : 'ⓘ'}}</span>

                <span v-if="w.owned && w.maxCount > 1" @>(x{{w.ownedCount}})</span>
              </div>
              <div style="padding-left:20px;font-size:0.9em;" v-if="w.expanded" @click="w.expanded = false">⤷  {{w.desc}}</div>
            </td>
            <td>
              <span v-if="w.owned && w.maxCount > 1">
                <button v-if="w.ownedCount < w.maxCount && !w.hasWarning" @click="w.ownedCount++, onOwnedWareGroupChanged(grp,w)" style="padding: 1px 6px; margin: 0px;margin-left:5px;width:33px;">&#10133;</button>
                <button v-else style="opacity:0;padding: 1px 6px; margin: 0px;margin-left:5px;width:33px;">&#10133;</button>
                <button v-if="w.maxCount > 1 && w.ownedCount > w.minCount" @click="w.ownedCount--, onOwnedWareGroupChanged(grp,w)" style="padding: 1px 6px; margin: 0px;margin-left:5px;width:33px;">&#10134;</button>
              </span>
            </td>
          </tr>
        </table>
      </td>
      <td style="padding-left:20px;vertical-align:middle;" class="noPaddingIfSmallDevice" v-if="totalObtainableCount !== 0">
        <span v-if="grp.obtainableVariationIfToggledHtml" v-html="grp.obtainableVariationIfToggledHtml"></span>
      </td>
    </tr>
  </table>
  <div v-if="displayPlayingWith" class="noPaddingIfSmallDevice" style="padding-left:40px;margin-top:10px">
    <p v-if="hasCollectableRequirements">
      Select:
      <button @click="clearAllWares">Min</button>
      <button @click="selectAllWares">All</button>
      <button @click="selectMandatoryReqsForFullCompletion(true)">Fewest for 100%</button>
      <br>
      <!--<button @click="selectAllWaresNotDiscontinued" v-if="hasDiscontinued">All But Discontinued</button> -->
      <button @click="selectMandatoryReqsForFullCompletion(false)" v-if="hasDiscontinued">Fewest for 100% Without Discontinued</button>
    </p>
    <p v-if="hasCollectableRequirements">
      <label class="clickable"><input type="checkbox" v-model="showAllWares" @change="onOwnedWaresChanged"> Show all requirements</label>
    </p>
    <p v-if="pkCompletionist && pkCompletionist.completionTypes.length > 0">
      <span style="font-size:1.2em">Objective:</span>
      <label class="clickable" style="margin-left:10px" v-for="ct in pkCompletionist.completionTypes"  :title="ct.desc">
        <input type="radio" :value="ct.value" v-model="objectiveStr" @change="onOwnedWaresChanged"> {{ct.name}}
      </label>
    </p>
    <p v-if="pkCompletionist && untrackableCount > 0">
      <div title="Whether to ignore elements that can't be verified because obtaining them doesn't alter the savefile."><label class="clickable"><input type="checkbox" v-model="hideUntrackable" @change="onOwnedWaresChanged"> Ignore untrackable elements</label></div>
    </p>
  </div>
</div>

<div class="div-section" v-if="totalObtainableCount === 0">
  <h5 style="color: #f0ad4e; text-shadow: 0.1em  0.1em 0 #000;">Warning: Unable to play the game with the current setup.</h5>
  <br>
</div>

<div class="div-section" v-if="totalObtainableCount > 0">
  <h5 :class="{collectableComplete:totalObtainedCount >= totalObtainableCount}" @click="displayCompletion = !displayCompletion, saveSettingsToLocalStorage()">
    {{displayCompletion ? '▼' : '▶'}} Completion: {{totalObtainedCount}} / {{totalObtainableCount}} ({{pct(totalObtainedCount, totalObtainableCount)}}):
  </h5>
  <table style="padding-left:40px" class="noPaddingIfSmallDevice" v-if="displayCompletion">
    <tr v-for="c in categories">
      <td :class="{collectableComplete:c.obtainedCount >= c.obtainableCount && c.obtainableCount !== 0}">
        {{c.obtainedCount}} / {{c.obtainableCount}} {{c.name}}
        <span v-if="c.obtainableCount !== 0" class="hiddenIfSmallDevice">({{pct(c.obtainedCount, c.obtainableCount)}})</span>
      </td>
      <td style="padding-left:20px">
        <span v-if="getVisibleUnobtainableCount(c) !== 0">
          {{getVisibleUnobtainableCount(c)}} unobtainable
          <span v-if="c.conflictCount">+</span>
        </span>
        <span v-if="c.conflictCount">{{c.conflictCount}} in conflicts</span>
      </td>
    </tr>
  </table>
</div>

<div class="div-section" v-if="guide.length !== 0 || unsolvedMissables.length !== 0">
  <h5 @click="displayAdvices = !displayAdvices">
    {{displayAdvices ? '▼' : '▶'}} Guide:
  </h5>

  <div v-if="displayAdvices" style="padding-bottom:20px;margin-left:5px">
    <div v-show="unsolvedMissables.length">
      <h6>Permanently missable:</h6>
      <ul>
        <li v-for="m in unsolvedMissables" :key="m.text">
          {{m.text}}
        </li>
      </ul>
    </div>

    <div v-show="guide.length !== 0">
      <h6>Walkthrough:</h6>
      <ul>
        <li v-for="(a,i) in guide" :key="i" v-if="mustHideEmulator ? !a.html.toLowerCase().includes('emulator') : true" v-html="a.html" :style="{marginLeft:a.indented ? '20px':'' }"></li>
      </ul>
    </div>
  </div>
</div>

<div class="div-section" v-if="advices.length !== 0">
  <h5 @click="displayAdvices = !displayAdvices">
    {{displayAdvices ? '▼' : '▶'}} Advices:
  </h5>

  <div v-if="displayAdvices" style="padding-bottom:20px">
    <div class="container" style="margin-bottom:30px">
      <div class="div-section">
        <ul>
          <li v-for="a in advices" :key="a" v-html="a"></li>
        </ul>
      </div>
    </div>
  </div>
</div>

<div class="div-section" v-if="pkCompletionist" v-show="playingWith.includes('emulator') || !waresByType.length">
  <div id="pkCompletionist-slot"></div>
</div>

<div class="div-section">
  <h5>
    <span  @click="displayViewSettings = !displayViewSettings, saveSettingsToLocalStorage()">
      {{displayViewSettings ? '▼' : '▶'}} View Settings
    </span>
  </h5>
  <div v-if="displayViewSettings" style="margin-left:5px"> <!--  no need for padding-bottom:20px; because last -->
    <ul class="settingsUl" style="padding-left:5px;list-style-type: none;">
      <li><label><input type="checkbox" v-model="hideObtained" @change="onViewSettingsChanged"> Hide obtained elements</label></li>
      <li title="Whether to hide elements that are part of the internal game data but can't never be legitimately obtained."><label><input type="checkbox" v-model="ignoreStrictlyUnobtainable" @change="onViewSettingsChanged"> Hide elements impossible to get legitimately</label></li>
      <li><label><input type="checkbox" v-model="compactView"> Compact view</label></li>

      <li class="radioLi">
          <div style="display:inline-block;width:150px">Displayed elements:</div>
          <input type="radio" id="obtainableOnly" value="obtainableOnly" v-model="displayedElementsSetting" @change="onViewSettingsChanged">
          <label for="obtainableOnly">Obtainable</label>
          <input type="radio" id="unobtainableOnly" value="unobtainableOnly" v-model="displayedElementsSetting" @change="onViewSettingsChanged">
          <label for="unobtainableOnly">Unobtainable</label>
          <input type="radio" id="both" value="both" v-model="displayedElementsSetting" @change="onViewSettingsChanged">
          <label for="both">Both</label>
      </li>
      <li class="radioLi" v-if="locations.length">
        <div style="display:inline-block;width:150px">Regroup elements:</div>
        <input type="radio" id="radio-byCategory" value="byCategory" v-model="view" @change="onViewSettingsChanged">
        <label for="radio-byCategory">By category</label>
        <input type="radio" id="radio-byLocation" value="byLocation" v-model="view" @change="onViewSettingsChanged">
        <label for="radio-byLocation">By location</label>
      </li>
    </ul>
    <div >
      <button type="button" @click="expandAll(true)">Expand All</button>
      <button type="button" @click="expandAll(false)">Collapse All</button>
    </div>
  </div>
</div>

<hr style="margin-top:20px;margin-bottom:20px">

<div class="container" v-if="interactiveMap" style="padding-bottom:20px">
  <h5>
    <span  @click="toggleDisplayInteractiveMap(), saveSettingsToLocalStorage()" id="interactiveMapHeader">
      {{displayInteractiveMap ? '▼' : '▶'}} Interactive Map
      <span style="padding-left:20px;font-size:0.7em" v-if="displayInteractiveMap">(Image by <span v-html="interactiveMap.imgCredit"></span>)</span>
    </span>
  </h5>
  <div v-show="displayInteractiveMap" style="background-color: black;height: 95vh;width: 100%;padding-left:5px;padding-bottom:20px">
    <div id="pkInteractiveMap-slot" style="background-color: black;height: 95vh;width: 100%;"></div>
    <br>
  </div>
  <div v-show="displayInteractiveMap && interactiveMap.fullImgUrl">
    <a :href="interactiveMap.fullImgUrl" target="_blank" rel="noopener" download>Download map image</a> ({{interactiveMap.fullImgSize}})
  </div>
</div>

<div class="container" v-for="c in categories"
     v-if="view === 'byCategory' && c.visibleCount > 0">
  <h5>
    <span  @click="c.displayed = !c.displayed" class="flex" style="align-items:center">
      {{c.displayed ? '▼' : '▶'}}

      <div v-if="displayIcons && c.iconData" :class="c.iconData.sizeClass"  style="width:32px;height:32px">
        <div class="genericMap-marker" :class="c.iconData.spriteClass"></div>
      </div>

      <span style="padding-right:3px">{{c.name}}</span>
      <span v-if="displayedElementsSetting !== 'unobtainableOnly'">({{c.obtainedCount}} / {{c.obtainableCount}})</span>
      <span v-else>({{c.visibleCount}})</span>
    </span>
  </h5>
  <div v-if="c.displayed">
    <div class="div-section" v-if="c.conflictCount > 0">
      {{c.conflictCount}} unobtainable {{c.name}} because of conflict (getting one of the {{c.name}} makes another one impossible to get).
    </div>

    <div class="div-section" v-show="hasUnsolved(c.conflicts)">
      <h6>
        Conflicts:
      </h6>
      <ul>
        <li v-for="c2 in c.conflicts" v-if="!c2.isSolved && c2.reqsForProblemFulfilled">
          Choose between {{c2.desc}}
        </li>
      </ul>
    </div>

    <div class="div-section" v-if="c.missable">
      <h6>Permanently missable:</h6>
      <div>{{c.missable}}</div>
    </div>

    <div class="div-section" v-show="hasUnsolved(c.missables)">
      <h6>Permanently missable:</h6>
      <ul>
        <li v-for="m in c.missables" v-if="!m.isSolved && m.reqsForProblemFulfilled">
          {{m.text}}
        </li>
      </ul>
    </div>

    <table class="table" style="text-align:left" :class="compactView ? 'compactView' : ''">
      <tr>
        <th>{{compactView ? '' : 'Obtained'}}</th>
        <th v-if="compactView">Can<br>Get?</td>
          <th v-else>Obtainable</td>
        <th v-if="displayIcons"></th>
        <th v-if="c.showId && !compactView">Id</th>
        <th>Name</th>
        <th colspan="2">Location</th>
      </tr>

      <tr v-for="p in c.list" v-if="isVisible(p)" :style="{backgroundColor:c.lastClickedId === p.id ? 'rgba(0,0,0,0.1' : ''}">
        <td>
          <input type="checkbox" v-model="p.obtained" @change="onCollectableClicked(p)">
          <span style="padding-left:3px;padding-top: 2px;" v-if="!p.trackable && (!waresByType.length || playingWith.includes('emulator'))" title="The savefile can't be used to determine if this element was obtained or not.">❔</span>
          <span style="padding-left:3px;padding-top: 2px;" v-else-if="p.missable && !p.missable.isSolved && !p.obtained" :title="'Missable: ' + p.missable.text">⚠</span>

        </td>
        <td :style="{backgroundColor:getBackgroundColor(p)}">
          <span :title="getObtainableTitle(p)" v-html="getObtainableText(p)"></span>
        </td>
        <td v-if="displayIcons" style="width:32px;height:32px">
          <div v-if="p.iconData" :class="p.iconData.sizeClass"  style="width:32px;height:32px">
            <div class="genericMap-marker" :class="p.iconData.spriteClass"></div>
          </div>
        </td>
        <td v-if="c.showId && !compactView">{{p.id}}</td>
        <td><a v-if="p.href" :href="p.href" target="_blank" rel="noopener">{{p.name}}</a><span v-else>{{p.name}}</span></td>
        <td>
          <div v-if="p.pos && p.pos.length" @click="flyToCollectable(p)" class="flyToPin">📍</div>
        </td>
        <td v-if="p.locationHtml" v-html="p.locationHtml" class="td-location"></td>
        <td v-else class="td-location">{{p.location}}</td>
      </tr>
    </table>
    <div class="div-section" v-if="displayImportExportForEachCategory">
      <div>
        <button @click="updateObtainedStatusFromStr(c, c.textareaObtained)">Load</button>
        <textarea v-model="c.textareaObtained" style="width:100%;height:calc(100% - 230px)"></textarea>
      </div>
    </div>
  </div>
  <br>
</div>

<br>

<div class="container" v-for="c in locations"
      v-if="view === 'byLocation' && c.visibleCount > 0">
  <h5 @click="c.displayed = !c.displayed">
    {{c.displayed ? '▼' : '▶'}} {{c.name}}

    <span v-if="displayedElementsSetting !== 'unobtainableOnly'">({{c.obtainedCount}} / {{c.obtainableCount}})</span>
    <span v-else>({{c.visibleCount}})</span>

    <a class="externalLinkIcon" v-if="c.href" :href="c.href" target="_blank" rel="noopener" @click.stop=""> <img :src="externalLinkIcon" /> </a>
  </h5>
  <table class="table" style="text-align:left" v-if="c.displayed" :class="compactView ? 'compactView' : ''">
    <tr>
      <th>{{compactView ? '' : 'Obtained'}}</th>
      <th v-if="compactView">Can<br>Get?</td>
        <th v-else>Obtainable</td>
      <th v-if="displayIcons"></th>
      <th v-if="!compactView">Id</th>
      <th>Name</th>
      <th colspan="2">Location</th>
    </tr>

    <tr v-for="p in c.list" v-if="isVisible(p) || c.lastClickedId === p.id" :style="{backgroundColor:c.lastClickedId === p.id ? 'rgba(0,0,0,0.1' : ''}">
      <td class="flex">
        <input type="checkbox" v-model="p.obtained" @change="onCollectableClicked(p)">
        <span style="padding-left:3px;padding-top: 2px;" v-if="!p.trackable && playingWith.includes('emulator')" title="The savefile can't be used to determine if this element was obtained or not.">⚠</span>
      </td>
      <td :style="{backgroundColor:getBackgroundColor(p)}">
        <span :title="getObtainableTitle(p)" v-html="getObtainableText(p)"></span>
      </td>
      <td v-if="displayIcons" style="width:32px;height:32px">
        <div v-if="p.iconData" :class="p.iconData.sizeClass"  style="width:32px;height:32px">
          <div class="genericMap-marker" :class="p.iconData.spriteClass"></div>
        </div>
      </td>
      <td v-if="!compactView">{{p.showId ? p.id : ''}}</td>
      <td><a v-if="p.href" :href="p.href" target="_blank" rel="noopener">{{p.name}}</a><span v-else>{{p.name}}</span></td>
      <td>
        <div v-if="p.pos && p.pos.length" @click="flyToCollectable(p)" class="flyToPin">📍</div>
      </td>
      <td class="td-location" v-html="p.locationHtml"></td>
    </tr>
  </table>
  <div v-if="c.displayed && c.obtainableCount < c.list.length" class="italic">
    {{c.list.length - c.obtainableCount}} unobtainable elements
  </div>
  <br>
</div>

<div class="container" v-if="additionalTasks.length">
  <h5 @click="displayAdditionalTasks = !displayAdditionalTasks">
    {{displayAdditionalTasks ? '▼' : '▶'}}Additional Tasks
  </h5>
  <ul v-if="displayAdditionalTasks">
    <li v-for="t in additionalTasks">{{t}}</li>
  </ul>
  <br>
</div>

<br>

<hr style="margin-top:20px;margin-bottom:20px">

<div class="container">
  <h5>
    <span  @click="displayImportExport = !displayImportExport, saveSettingsToLocalStorage()">
      {{displayImportExport ? '▼' : '▶'}} Import/Export Between Computers
    </span>
  </h5>
  <div v-if="displayImportExport" style="padding-bottom:20px; padding-left:5px">
    <div>
      This panel can be used to easily transferred checked elements between different computers/browsers.
      <div class="div-section">
          <div>
            <button @click="saveAllObtained()">Export</button>
            <button @click="loadAllObtained()">Import</button>
            <button @click="clearAll" class="dangerBtn">{{confirmClearAll ? 'Confirm' : ''}} Clear All</button>
          </div>
          <div>
            <textarea v-model="textareaAllObtained" style="width:100%;height:calc(100% - 230px)"></textarea>
          </div>
      </div>
      <div class="checkbox-container">
        <label><input type="checkbox" v-model="displayImportExportForEachCategory"> Display export/import box for individual categories</label>
      </div>
    </div>
    <div v-if="displayImportExport">
      <br>
      <h5>Backups</h5>
      <textarea style="width:100%;" v-model="selectedBackupTxt" v-if="selectedBackupTxt"></textarea>
      <div>
        <button @click="createBackup">Create New Backup</button>
        <button @click="deleteAllBackups" class="dangerBtn">{{confirmDeleteAllBackups ? 'Confirm' : ''}} Delete All Backups</button>
        <div>
          <a v-for="b in backups" style="padding-right:20px" @click="onclickBackup(b.content)">{{b.name}}</a>
        </div>
      </div>
    </div>
  </div>
  <br>
</div>

<div class="container" style="padding-bottom:30px">
  <h5>
    <span  @click="displayCredits = !displayCredits, saveSettingsToLocalStorage()">
      {{displayCredits ? '▼' : '▶'}} Credits
    </span>
  </h5>
  <div v-show="displayCredits" style="margin-left:5px">
    <p>
      Contact me: RainingChain on <a target="_blank" rel="noopener" href="https://discord.com/invite/tMXrJzjWmg">Discord</a>.
    </p>
    <p>
      Data gathered from <a href="http://bulbapedia.bulbagarden.net/" target="_blank" rel="noopener">http://bulbapedia.bulbagarden.net/</a>.
    </p>
    <p v-show="pkCompletionist">
      <a href="https://github.com/RainingChain/PkCompletionist" target="_blank" rel="noopener">Savefile (.sav) Utilities</a> powered by <a href="https://github.com/kwsch/PKHeX" target="_blank" rel="noopener">PKHeX</a>.
    </p>
    <p v-show="additionalCredits">
      Special thanks to <span v-html="additionalCredits"></span>
    </p>
    <p>
      Pokémon is a registered trademark of Game Freak, The Pokémon Company, and Nintendo.
    </p>
  </div>
  <br>
  <p><a href="/completion" target="_blank" rel="noopener">Other 100% Pokémon Challenges</a></p>
  <p><a href="/" target="_blank" rel="noopener">Other Pokémon Projects</a></p>
</div>

</div>