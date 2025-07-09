

<div class="pkAssistant">

<h2 class="pokemon-title">
  <a href="/BattleFacilities"><span>Battle Facilities</span></a><span>▸</span><span>Pokémon {{gameName}} Assistant</span>
</h2>

<div v-if="lastServerMsg">
  <button @click="lastServerMsg = ''" style="padding:2px">Hide Log</button> Log: <span  :style="{color:lastServerMsg.includes('Error:') ? 'red' : ''}">{{lastServerMsg}}</span>
</div>

<div v-if="!connected" style="padding-bottom:30px">
  <h5>Setup</h5>
  <div style="margin-left:5px">
    <label>
      Enter below the Session ID displayed in the Scripting console when running the <a type="download" :href="luaHref" download="BattleFacilitiesAssistant_Emerald_v6.lua">BattleFacilitiesAssistant_Emerald_v6.lua</a> script in <a href="https://mgba.io/downloads.html#development-downloads">mGBA v0.11-8511</a>: <input style="width:150px" v-model="mgbaId"></input>
    </label>
    <button @click="connect" :disabled="!mgbaId" style="margin-left:0px">Connect</button>
  </div>
</div>
<div v-else-if="!battleState.playerMonName" style="padding-bottom:30px">
  No data has been received from the emulator yet. Make sure the script is running in the emulator. Read the How To Use for more details.
</div>
<div v-else>
  <br>
  <h5>
    <span  @click="displayVisibleData = !displayVisibleData">
      {{displayVisibleData ? '▼' : '▶'}} Visible Data
    </span>
  </h5>
  <div v-if="displayVisibleData">
    <div>
      <div>Player</div>
      <div class="flex">
        <div class="icon-64x64" style="margin-top:-2px;width: 48px; height:48px;"><div class="genericMap-marker" :class="'pokemon-p' + battleState.playerMonSpeciesId"></div></div>
        <div>
          <div>
          <span class="playerColor">{{battleState.playerMonName}}</span>: {{battleState.playerCurrentHpPct}} HP, {{battleState.playerEffectiveSpeed}} Speed, Status: {{battleState.playerStatus || '-'}}
          </div>
          <div>
            <span :title="battleState.playerStatValsDesc">Stats: {{battleState.playerStatStagesDesc || 'No boosts'}}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex" style="padding:5px 10px;">
    VS
    </div>

    <div>
      <div>Trainer {{battleState.trainerName}} (#{{battleState.trainerId}}) in {{battleState.facilityName}} (Battle #{{battleState.winStreak + 1}})</div>
      <div class="flex">
        <div class="icon-64x64" style="margin-top:-2px;width: 48px; height: 48px;"><div class="genericMap-marker" :class="'pokemon-p' + battleState.trainerMonSpeciesId"></div></div>
        <div>
          <div><span class="trainerColor">{{battleState.trainerMonName}}</span>, <span :title="battleState.trainerMaxHpApproxDesc">{{battleState.trainerMaxHpApprox}} HP</span>, Status: {{battleState.trainerStatus || '-'}}</div>
          <div>
            <span :title="battleState.statValsDesc">Stats:</span> {{battleState.trainerStatStagesDesc || 'No boosts'}}
          </div>
          <div class="flex">
            Used moves:
            <div style="padding-left:5px" v-for="m in battleState.trainerUsedMoves">{{m.name}} ({{m.pp}}/{{m.maxpp}}),</div>
            <div style="padding-left:5px" v-for="m in (4 - battleState.trainerUsedMoves.length)">???, </div>
          </div>
        </div>
      </div>
    </div>
    <br>
    <div v-if="permitRngManip && previousTrainers">Previous trainers: {{previousTrainers}}<br></div>
  </div>
  <br>
  <div class="flex" :style="{'paddingBottom':displayTrainerPokemons ? '' : '30px'}">
    <h5  @click="displayTrainerPokemons = !displayTrainerPokemons">
      {{displayTrainerPokemons ? '▼' : '▶'}} Trainer Pokémon ({{getVisibleVtmonCount()}} / {{trainerMons.length}})
    </h5>

    <button class="smallBtn" style="margin-left:20px;height:25px" v-if="getVisibleVtmonCount() !== trainerMons.length" @click="showAllVtmon">Show All</button>
    <button class="smallBtn" style="margin-left:20px;height:25px" v-if="jtmonsFromRng.length" @click="clearJtmonsFromRng">Remove Pokémon from RNG Manip</button>
  </div>

  <div v-show="displayTrainerPokemons" style="padding:5px 5px 15px 5px">
    <label style="cursor:pointer;"><input type="checkbox" v-model="displayBenchedPokemon"> Display your benched Pokémon</label>
  </div>
  <div v-show="displayTrainerPokemons && (jtmonsFromRng.length || onlyDisplayRngPokemon)" style="padding:5px 5px 15px 5px">
    <label style="cursor:pointer;"><input type="checkbox" v-model="onlyDisplayRngPokemon"> Only Display Pokémon from RNG Manipulation</label>
  </div>
  <div v-show="displayTrainerPokemons && permitRngManip" style="padding:5px 5px 15px 5px">
    <label style="cursor:pointer;"><input type="checkbox" v-model="onlyDisplayProbableRngPokemon"> Only Display Probable Pokémon from RNG Manipulation</label>
  </div>

  <div class="flex" v-if="!displayBenchedPokemon && displayTrainerPokemons" style="flex-wrap: wrap;gap:15px;">
    <div v-for="(m,i) in trainerMons" :key="m.uid" v-if="isVtmonVisible(m)" v-bind="m" :hideVtmon="hideVtmon" class="smaller-pk-icons" is="Vue_pkTmon"></div>
  </div>

  <div v-if="displayBenchedPokemon && displayTrainerPokemons">
    <table>
      <tr>
        <td></td>
        <td v-for="vpmon in playerMons">
          <div class="flex" style="align-items:center">
            <div class="icon-64x64" style="margin-top:-2px;width: 48px; height:48px;"><div class="genericMap-marker" :class="'pokemon-p' + vpmon.speciesId"></div></div>
            <div style="font-size:1.5em">{{vpmon.name}}</div>
          </div>
        </td>
      </tr>
      <tr v-for="vtmons in trainerMonsByTmon" v-if="vtmons.some(vtmon => vtmon && isVtmonVisible(vtmon))">
        <td>
          <div class="icon-64x64" style="margin-top:-2px;width: 48px; height:48px;"><div class="genericMap-marker" :class="'pokemon-p' + vtmons[0].speciesId"></div></div>
          <div style="width:48px;word-wrap: break-word;font-size:1.2em">{{vtmons[0].name}}<br>{{getVtmonProbStr(vtmons[0])}}</div>
        </td>
        <td v-for="vtmon in vtmons" :key="vtmon.uid" v-if="vtmon">
          <div :key="vtmon.uid" v-if="isVtmonVisible(vtmon)" v-bind="vtmon" :hideVtmon="hideVtmon" class="smaller-pk-icons" is="Vue_pkTmon"></div>
        </td>
      </tr>
    </table>
  </div>

  <div>
    Manually add Pokémon: <button v-if="manuallyAddedPokemonInput" @click="manuallyAddPokemon">Add</button>
    <input v-model="manuallyAddedPokemonInput">
  </div>
</div>


<div class="container" style="padding-bottom:30px" v-show="!hideRngManip && !!getRefsRngCalib()">
  <h5>
    <span @click="displayRngManip = !displayRngManip">
      {{displayRngManip ? '▼' : '▶'}} RNG Manipulation
    </span>
  </h5>
  <div v-show="displayRngManip" style="margin-left:5px">
    <p>
      <label>
        <input v-model="permitRngManip" type="checkbox"> <span>Permit RNG Manipulation?</span>
      </label>
    </p>
    <div v-if="!permitRngManip">
      <p>
        By enabling this option, the assistant predicts the entire Battle Frontier opponent team based on the trainer and their first Pokémon.
      </p>
      <p>
        This feature is also available as a <a href="/BattleFacilities/Emerald/RngManipulation" target="_blank" rel="noopener">standalone tool</a>.
      </p>
      <p style="padding-left:10px">
        <span style="font-weight:bold">How it works:</span> The opponent team is randomly generated by using an algorithm based on the
        number of frames since the game was booted. By starting the game and pressing A as fast as
        possible, the number of frames before the battle is within a small range. This means only a small
        subset of trainer teams are actually possible. This tool calculates the possible trainer teams and displays the most probable ones.
      </p>
    </div>


    <div v-show="permitRngManip">
      <div v-if="rngProgressMsg">
        {{rngProgressMsg}}<br>
      </div>
      <div v-if="permitRngCheat && rngCheatMsg" style="font-weight: bold; color:red;">
        {{rngCheatMsg}}
      </div>
      <div is="Vue_pkRngAbuseResult" ref="pkRngAbuseResult" :result="rngAbuseRangeResult" :onJmonClicked="onJmonClicked" :displayCalibMsg="false" :additionalJtmons="jtmonsFromRng"></div>

      <h4>RNG Settings</h4>
      <div>
        <p>
          <label>
            <input v-model="permitRngCheat" type="checkbox"> <span>Cheat: Display a warning if RNG Manipulation returns incorrect results </span>
          </label>
        </p>
        <p v-if="permitRngCheat">
          <label>
            <input type="checkbox" v-model="rngCheatDisplayOpponentTeam"> Cheat: Display opponent team
          </label>
        </p>
        <p v-if="permitRngCheat && rngCheatDisplayOpponentTeam" v-html="opponentTeamStr"></p>

        <div is="Vue_pkRngFrameInput" v-show="lastMsg && lastMsg.facilityNum === FacilityNum.tower"  v-bind="{
          saveToLocalStorage:saveSettingsToLocalStorage,
          facility:Facility.tower,
        }" ref="rngCalib_tower"></div>

        <div is="Vue_pkRngFrameInput" v-show="lastMsg && lastMsg.facilityNum === FacilityNum.arena"  v-bind="{
          saveToLocalStorage:saveSettingsToLocalStorage,
          facility:Facility.arena,
        }" ref="rngCalib_arena"></div>

        <div is="Vue_pkRngFrameInput" v-show="lastMsg && lastMsg.facilityNum === FacilityNum.factory"  v-bind="{
          saveToLocalStorage:saveSettingsToLocalStorage,
          facility:Facility.factory,
        }" ref="rngCalib_factory"></div>

        <div is="Vue_pkRngFrameInput" v-show="lastMsg && lastMsg.facilityNum === FacilityNum.palace"  v-bind="{
          saveToLocalStorage:saveSettingsToLocalStorage,
          facility:Facility.palace,
        }" ref="rngCalib_palace"></div>

        <br>
        <div v-if="rngProgressMsg">
          {{rngProgressMsg}}
        </div>
        <div v-if="permitRngCheat && rngCheatMsg" style="font-weight: bold; color:red;">
          {{rngCheatMsg}}
        </div>
        <p>
          <button @click="updateRngAbuseRangeResult(true)">Refresh RNG Results</button>
        </p>
      </div>
    </div>

  </div>
</div>

<div class="container" style="padding-bottom:30px">
  <h5>
    <span  @click="displayGuide = !displayGuide">
      {{displayGuide ? '▼' : '▶'}} How To Use
    </span>
  </h5>
  <div v-show="displayGuide" style="margin-left:5px">
    <h6>Goal</h6>
    <div>
      <p>
        The goal of the tool is to help players beat the Pokémon Emerald Battle Frontier, which is a requirement in the <a href="/completion/Emerald" target="_blank" rel="noopener">Pokémon Emerald 100% Checklist</a>.
        <br>
        The tool helps decide what move to use and what Pokémon to switch to, by automatically calculating the expected damage of each move.
        <br>
        <a href="https://youtu.be/glNuPNk8VR4">Video Demo without RNG Manipulation</a>
        <a href="https://youtu.be/s0LiWClMPuc" v-if="!hideRngManip">Video Demo with RNG Manipulation</a>
      </p>
    </div>

    <h6>Implementation</h6>
    <div>
      <p>
        The player plays English Pokémon Emerald on the mGBA emulator and runs a script in the emulator to transfer game data to
        this web page. The web page uses that data to deduct the opponent Pokémon and calculate expected damage.
      </p>
      <p>
        The tool <span style="font-weight: bold">only</span> uses information available to the player to deduct the opponent Pokémon, such as the used moves and the number of pixels of the HP bar. Everything done by the tool could also be done manually by a player playing on a retail cartridge.
      </p>
    </div>

    <h6>How To Use</h6>
    <div>
      <ul>
        <li>Download <a href="https://mgba.io/downloads.html#development-downloads">mGBA v0.11-8511</a> or newer, in the <span style="font-weight: bold">the Development downloads section</span>. The current non-developement release (mGBA v0.10.3) <span style="font-weight: bold">doesn't work</span>.</li>
        <li>Download <a type="download" :href="luaHref" download="BattleFacilitiesAssistant_Emerald_v6.lua">BattleFacilitiesAssistant_Emerald_v6.lua</a> script.</li>
        <li>While playing English Pokémon Emerald in Battle Frontier, press Tools->Scripting... <br> <img :src="imgs.guide1_img"></li>
        <li>In the Scripting window, click on File->Load script... and select the downloaded BattleFacilitiesAssistant_Emerald_v6.lua script.<br><img :src="imgs.guide2_img"></li>
        <li>In the console of the Scripting window in mGBA, a session ID should be displayed. Enter that session ID on the website page in the Setup section then press Connect.</li>
        <li>Upon starting a battle or using a move, the web page will update to display info about the battle.<br><img :src="imgs.guide3_img"></li>
      </ul>
    </div>

    <h6>Limitations</h6>
    <div>
      <ul>
        <li>It only supports Singles battle against trainers.</li>
        <li>Incorrect damage calculation when the following moves are involved: Rollout, Foresight, Focus Energy.</li>
        <li>Incorrect damage calculation when the following abilities are involved: Cloud Nine, Air Lock.</li>
      </ul>
    </div>
    <hr>
    <br>
  </div>
</div>

  <div class="container" style="padding-bottom:30px">
    <h5>
      <span  @click="displayImportExport = !displayImportExport">
        {{displayImportExport ? '▼' : '▶'}} Import/Export
      </span>
    </h5>
    <div v-show="displayImportExport" style="margin-left:5px">
      <h4>Battle</h4>
      <div>The battle data format is a text starting with <span style="padding:1px;border:1px solid rgba(255,255,255,0.3)">data=</span> .</div>
      <div v-if="importExportDataTxtErr">{{importExportDataTxtErr}}</div>
      <div class="div-section">
        <div>
          <button @click="exportData">Export</button>
          <button @click="importData(importExportDataTxt)">Import</button>
        </div>
        <div>
          <textarea v-model="importExportDataTxt" style="width:100%;height:calc(100% - 230px)"></textarea>
        </div>
      </div>
      <div v-if="lastMsg && lastMsgHistory.length > 1">
        <div>Currently showing Msg #{{lastMsg.msgId}}</div>
        <button v-if="lastMsgHistory[0].msgId >= lastMsg.msgId - 1" @click="importState(lastMsg.msgId - 1)">Display previous battle state (Msg #{{lastMsg.msgId - 1}})</button>

        <div>
          <button @click="importState(importMsgId)">Display battle state #{{importMsgId}}</button>
          <input style="width:200px" v-model="importMsgId" type="range" :min="lastMsgHistory[0].msgId" :max="lastMsgHistory[lastMsgHistory.length - 1].msgId" step="1">
        </div>
      </div>
    </div>

    <div v-show="displayImportExport" style="margin-top:10px;margin-left:5px">
      <h4>Settings</h4>
      <div v-if="importExportSettingsDataTxtErr" style="color:red">{{importExportSettingsDataTxtErr}}</div>
      <div class="div-section">
        <div>
          <button @click="exportSettingsData">Export</button>
          <button @click="importSettingsData(importExportSettingsDataTxt)">Import</button>
        </div>
        <div>
          <textarea v-model="importExportSettingsDataTxt" style="width:100%;height:calc(100% - 230px)"></textarea>
        </div>
      </div>
    </div>
  </div>


  <div class="container" style="padding-bottom:30px">
    <h5>
      <span  @click="displayReportBug = !displayReportBug">
        {{displayReportBug ? '▼' : '▶'}} Report Bug
      </span>
    </h5>
    <div v-show="displayReportBug" style="margin-left:5px">
      <p>
        Contact RainingChain on <a target="_blank" rel="noopener" href="https://discord.gg/FZf9WNZZ"> Scripters War Discord</a>.
      </p>
      <p>
        For issues with damage calculation, open the Import/Export Battle section, export your battle and include the battle in the issue.
      </p>
    </div>
  </div>

  <div class="container" style="padding-bottom:30px">
    <h5>
      <span  @click="displayCredits = !displayCredits">
        {{displayCredits ? '▼' : '▶'}} Credits
      </span>
    </h5>
    <div v-show="displayCredits" style="margin-left:5px">
      <p>
        Contact me: RainingChain on <a target="_blank" rel="noopener" href="https://discord.gg/FZf9WNZZ"> Scripters War Discord</a>.
      </p>
      <p v-show="pkCompletionist">
        Powered by <a href="https://github.com/smogon/damage-calc" target="_blank" rel="noopener">Smogon Damage Calculator</a>.
      </p>
      <p>
        Pokémon is a registered trademark of Game Freak, The Pokémon Company, and Nintendo.
      </p>
    </div>
  </div>
</div>
