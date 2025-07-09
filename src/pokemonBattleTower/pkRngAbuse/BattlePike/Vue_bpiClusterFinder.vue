<div>
  <h3>Battle Pike Easy Room Cluster Finder</h3>
  <div>
    <span style="font-weight:bold">Objective:</span> Find consecutive RNG frames that result in easy rooms (Npc, Heal, Status, Wild Pokémon).
  </div>
  <br>
  <div>
    <h5>
      <span  @click="displayHowToUse = !displayHowToUse">
        {{displayHowToUse ? '▼' : '▶'}} How To Use
      </span>
    </h5>
    <div v-show="displayHowToUse" style="margin-left:5px">
      <div>
        Before using the tool, RNG calibration is required. RNG calibration for Battle Pike is similar to RNG calibration for wild Pokémon encounters:
        <ul>
          <li>Identify the target RNG frame</li>
          <li>Attempt to hit the target RNG frame without calibration using <a href="https://www.einarkl.no/Pokemon/RNGTimer/">RNG Timer</a></li>
          <li>Adjust the timer (calibrate) depending on how much ahead or late you were</li>
        </ul>
      </div>

      <p>
        <span style="font-weight:bold">Video guide:</span> <a href="https://www.youtube.com/watch?v=7yOBywyFb2Q" target="_blank" rel="noopener">https://www.youtube.com/watch?v=7yOBywyFb2Q</a>
      </p>

      <div>For 1st Room RNG calibration/manipulation:</div>
      <ul>
        <li>To help calibrating, in mGBA, click Tools -> Scripting... and load <a type="download" download="PikeRngAdvCount.lua" :href="PikeRngAdvCountLua">PikeRngAdvCount.lua</a>.</li>
        <li>Fill the Cluster Input and identify the ideal target RNG frame.</li>
        <li>On RNG Timer, change to GBA mode, and copy-paste the ideal target RNG frame in the "Frame" input.</li>
        <li>Start the timer. When it reaches 0.000, reset the GBA (Start+Select+A+B).</li>
        <li>Enter the Battle Pike, until the message "Your Battle Choice challenge has now begun..."</li>
        <li>When the timer reaches 0.000, press A and hold forward to enter the center room.</li>
        <li>In mGBA scripting console, the RNG frame when entering the room with the hint lady will be displayed. Copy-paste it in RNG Timer  in the "Frame hit" input, then click Update.</li>
        <li>Remember the Calibration value (ex: -4052). It will be the same for all your future 1st Room RNG manipulations.</li>
        <li>For real RNG manipulation attempts, repeat the steps above with the obtained calibration. If everything goes well, the room should be easy (NPC, Status, Heal or Wild Pokémon).</li>
      </ul>

      <div>For 2nd+ Room RNG calibration/manipulation:</div>
      <ul>
        <li>To help calibrating, in mGBA, click Tools -> Scripting... and load <a type="download" download="PikeRngAdvCount.lua" :href="PikeRngAdvCountLua">PikeRngAdvCount.lua</a>.</li>
        <li>The process is similar, except that you must fill more Cluster Input, including the hint.</li>
        <li>The calibration for 2nd+ Room is different than 1st Room. Initially, reset calibration to 0.</li>
        <li>Rest at the lady, start the timer. At 0.000, restart the game.</li>
        <li>Stand next to the entrance of a room that was NOT hinted by the lady. Ex: If hint is for the left room, you must use the center or right room.</li>
        <li>At 0.000. hold forward to enter the room.</li>
        <li>In mGBA scripting console, the RNG frame when entering the room with random event will be displayed. Copy-paste it in RNG Timer in the "Frame hit" input, then click Update.</li>
        <li>Remember the Calibration value (ex: -419). It will be the same for all your future 2nd+ Room RNG manipulations.</li>
        <li>For real RNG manipulation attempts, repeat the steps above with the obtained calibration. If everything goes well, the room should be easy (NPC, Status, Heal or Wild Pokémon).</li>
      </ul>
    </div>
  </div>
  <br>

  <h4>Cluster Input</h4>
  <div>
    <table>
      <tr>
        <td>Is first room?</td>
        <td><input v-model="isFirstRoom" type="checkbox"></td>
      </tr>
      <tr v-if="!isFirstRoom">
        <td>Hint</td>
        <td>
          <select v-model="hint">
            <option :value="Hint.Status_HealPart">For some odd reason, I felt a wave of nostalgia coming from it...</option>
            <option :value="Hint.Single_HealFull">Is it...A Trainer? I sense the presence of people...</option>
            <option :value="Hint.Wild_Hard">It seems to have the distinct aroma of Pokémon wafting around it...</option>
            <option :value="Hint.Npc_Double">I seem to have heard something... It may have been whispering...</option>
          </select>
        </td>
      </tr>
      <tr v-if="!isFirstRoom">
        <td>Are all Pokémon fully healed?</td>
        <td><input v-model="pikeHealingRoomsDisabled" type="checkbox"></td>
      </tr>
      <tr v-if="!isFirstRoom">
        <td>At least one Pokémon without status?</td>
        <td><input v-model="atLeastOneHealthyMon" type="checkbox"></td>
      </tr>
      <tr v-if="!isFirstRoom">
        <td>At least two Pokémon alive?</td>
        <td><input v-model="atLeastTwoAliveMons" type="checkbox"></td>
      </tr>
      <tr>
        <td>Min RNG frame when entering {{isFirstRoom ? 'the room with the hint lady' : 'the room with the random event'}}</td>
        <td>
          <input v-if="isFirstRoom" v-model="rngFrame_min_1st_room" type="number" min="0">
          <input v-else v-model="rngFrame_min_2nd_room" type="number" min="0">
        </td>
      </tr>
      <tr>
        <td>Max RNG frame when entering {{isFirstRoom ? 'the room with the hint lady' : 'the room with the random event'}}</td>
        <td>
          <input v-if="isFirstRoom" v-model="rngFrame_max_1st_room" type="number" min="0">
          <input v-else v-model="rngFrame_max_2nd_room" type="number" min="0">
        </td>
      </tr>
    </table>
  </div>
  <div>
    <button @click="generate">Generate</button>
  </div>
  <br>
  <div v-show="results.length">
    <h4>Cluster Output</h4>
    <div>
      Max displayed count <label><input style="display:inline-block;width:100px" v-model="maxDisplayedCount" type="number" min="0"></label>
    </div>
    <div>Longest easy room streak: {{longestEasyRoomStreak_end - longestEasyRoomStreak_start + 1}} (RNG frames {{longestEasyRoomStreak_start}} - {{longestEasyRoomStreak_end}})</div>
    <div>Ideal target RNG frame for RNG manipulation: {{Math.floor((longestEasyRoomStreak_start + longestEasyRoomStreak_end) / 2)}}</div>
    <br>
    <div style="max-width:250px">
      <div style="font-weight: bold">RNG frame - Room</div>
      <div v-for="res in results" :title="res.hintText"
        :class="{inLongestStreak:res.rngAdvCount >= longestEasyRoomStreak_start && res.rngAdvCount <= longestEasyRoomStreak_end}">{{res.rngAdvCount}} <span :class="{
        easyRoom:res.isEasy,
        notEasyRoom:!res.isEasy}">{{res.roomTypeName}}</span></div>
    </div>
  </div>
</div>

