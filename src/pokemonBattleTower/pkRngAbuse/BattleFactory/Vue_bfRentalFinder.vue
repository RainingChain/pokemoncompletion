<div>
  <h3>Battle Factory Rental Generator</h3>
  <div>
    <span style="font-weight:bold">Objective:</span> Find consecutive RNG frames that result in the wanted Rental Pokémon or easy opponents
  </div>
  <br>
  <div>
    <h5>
      <span  @click="displayHowToUse = !displayHowToUse">
        {{displayHowToUse ? '▼' : '▶'}} How To Use
      </span>
    </h5>
    <div v-show="displayHowToUse" style="margin-left:10px">
      <div>
        Before using the tool, RNG calibration is required. RNG calibration for Battle Factory is similar to RNG calibration for wild Pokémon encounters:
        <ul>
          <li>Identify the target RNG frame</li>
          <li>Attempt to hit the target RNG frame without calibration using <a href="https://www.einarkl.no/Pokemon/RNGTimer/">RNG Timer</a></li>
          <li>Adjust the timer (calibrate) depending on how much ahead or late you were</li>
        </ul>
      </div>

      <p>Important: Make sure you have an active Battle Tower streak of less than 7, because the opponent IV depends on the Battle Tower streak. Note: If you had a high Battle Tower streak and lost, you MUST start a new Battle Tower streak to reset the active streak.</p>

      <h6>Rental RNG Calibration & Manipulation (Battle #1)</h6>
      <div style="margin-left:5px">
        <span style="font-weight:bold">Video guide:</span> <a href="https://youtu.be/-hVbVQkOGvs" target="_blank" rel="noopener">https://youtu.be/-hVbVQkOGvs</a>
      </div>
      <ul style="margin-top:5px">
        <li>Fill the Input and identify the ideal target RNG frame.</li>
        <li>On RNG Timer, change to GBA mode, and copy-paste the ideal target RNG frame in the "Frame" input.</li>
        <li>Start the timer. When it reaches 0.000, reset the GBA (Start+Select+A+B).</li>
        <li>Enter the Battle Factory, until the message "Please step this way."</li>
        <li>When the timer reaches 0.000, press A.</li>
        <li>Fill the "RNG Calibration for finding Hit RNG frame" section.</li>
        <li>Copy-paste the RNG frame in RNG Timer in the "Frame hit" input, then click Update.</li>
        <li>Remember the Calibration value (ex: -3699). It will be the same for all your future Rental RNG manipulations.</li>
        <li>For real RNG manipulation attempts, repeat the steps above with the obtained calibration.</li>
      </ul>
      <h6>Easy Opponents RNG Manipulation (Battle #2-7)</h6>
      <div style="margin-left:5px">
        <span style="font-weight:bold">Video guide:</span> <a href="https://youtu.be/M_eGYnZgmts" target="_blank" rel="noopener">https://youtu.be/M_eGYnZgmts</a>
      </div>
      <ul style="margin-top:5px">
        <li>To calibrate, use a similar approach as above. The timing is when selecting the option "GO ON".</li>
        <li>When starting a new streak, click "Generate Recommended".</li>
        <li>Copy-paste the ideal target RNG frame in RNG Timer.</li>
        <li>Find the RNG frame matching the in-game rentals. Select the rental according to the recommendation and press "Use as Input".</li>
        <li>For battle #2-7, click "Generate" and copy-paste the ideal target RNG frame in RNG Timer. Adapt the calibration.</li>
        <li>Find the RNG frame matching the in-game opponent, and click on Use as Input.</li>
        <li>If your hit RNG frame is way off the target RNG frame, you can use "RNG Calibration for finding hit RNG frame".</li>
      </ul>
      <h6>Using the Battle Facilities Assistant</h6>
      <ul style="margin-top:5px">
        <li>Running the .lua script for the <a href="/BattleFacilities/Emerald/Assistant">Assistant</a> can cause timing delay issues.</li>
        <li>To avoid inaccurate timings, open the .lua script and</li>
        <li style="padding-left:10px">Change "local supportBattle1OfBattleFactory = true" into "local supportBattle1OfBattleFactory = false"</li>
        <li style="padding-left:10px">Change "local automaticUpdate = true" into "local automaticUpdate = false"</li>
        <li>To update the website, you must manually type "update()" in the scripting console of the emulator.</li>
        <li>The RNG manipulation won't be accurate for the first battle in the Assistant. Entire opponent can still be known using this page.</li>
      </ul>
    </div>
  </div>

  <br>

  <h4>Input</h4>
  <div>
    <table>
      <tr>
        <td>Win count</td>
        <td>
          <input v-model="winStreak" type="number" min="0" style="width:200px;display:inline-block">
          <span style="padding-left:10px">Attempting RNG manipulation of Round {{Math.floor(+winStreak / 7) + 1}}, Battle {{(+winStreak % 7) + 1}}</span>
        </td>
      </tr>
      <tr v-for="mon in pokemonNames" v-if="!isRoom1()">
        <td>{{mon.inputName}}</td>
        <td>
          <label>
            <input placeholder="Name" v-model="mon.input" :list="mon.listId" @change="updatePokemonInputName(mon)" :class="mon.getKlass()">
            <datalist :id="mon.listId">
              <option v-for="(possVal,i) in mon.possibleValues" :value="possVal" v-if="possVal !== mon.input">{{possVal}}</option>
            </datalist>
          </label>
        </td>
      </tr>
      <tr v-for="(trainerBattled,i) in trainersBattled" v-if="i < (+winStreak % 7)">
        <td>{{'Previous Trainer #' + (i + 1)}}</td>
        <td>
          <input v-model="trainerBattled.input" :list="trainerBattled.listId" @change="updateTrainerInputName(trainerBattled), saveToLocalStorage()" :class="trainerBattled.getKlass()">
          <datalist :id="trainerBattled.listId">
            <option v-for="possVal in trainerBattled.possibleValues" :value="possVal" v-if="possVal !== trainerBattled.input">{{possVal}}</option>
          </datalist>
        </td>
      </tr>
      <tr>
        <td>Level 50?</td>
        <td><input type="checkbox" v-model="isLvl50"></td>
      </tr>
      <tr>
        <td>Min RNG frame</td>
        <td><input v-if="isRoom1()" v-model="rngFrame_min_1stRoom" type="number" min="0">
            <input v-else v-model="rngFrame_min_2ndRoom" type="number" min="0"></td>
      </tr>
      <tr>
        <td>Max RNG frame</td>
        <td><input v-if="isRoom1()" v-model="rngFrame_max_1stRoom" type="number" min="0">
            <input v-else v-model="rngFrame_max_2ndRoom" type="number" min="0"></td>
      </tr>
      <tr v-if="!isRoom1()">
        <td>Find Easiest Opponents</td>
        <td><input type="checkbox" v-model="mustSimulateBattle"> </td>
      </tr>
      <tr v-if="!isRoom1()">
        <td colspan="2"><div style="padding-bottom:15px">For each possible opponent team, a battle simulation is ran. A score is given depending on the battle result.</div></td>
      </tr>
      <tr v-if="!isRoom1() && mustSimulateBattle">
        <td>Frame Range Size for Easiest Opponents</td>
        <td><input type="number" min="1" v-model="simulateBattleRange"> </td>
      </tr>
      <tr v-if="!isRoom1()">
        <td colspan="2"><div style="padding-bottom:15px">The ideal RNG frame for easy opponents is based on the score of the {{simulateBattleRange}} surrounding frames.</div></td>
      </tr>
      <tr v-if="isRoom1()">
        <td>Number of Rental/Swap</td>
        <td><input v-model="pastRentalCount" type="number" min="0"></td>
      </tr>
      <tr v-if="isRoom1()">
        <td>Highlight Rentals with Pokémon:</td>
        <td><input v-model="pokemonToInclude"></td>
      </tr>
      <tr v-if="isRoom1() && pokemonToInclude">
        <td></td>
        <td><input v-model="pokemonToInclude2"></td>
      </tr>
    </table>
  </div>
  <div>
    <div v-if="!((+winStreak) === 20 || (+winStreak) === 41)">
      <button @click="generate">Generate</button>
      <button @click="generateRecommendation" v-if="(+winStreak) % 7 === 0 && (+winStreak) < 42">Generate Recommended</button>
    </div>
    <span v-else style="color:orange">Limitation: RNG manipulation for Noland battles are not supported.</span>

  </div>
  <br>
  <div v-show="results.length">
    <h4>Output</h4>
    <div v-if="results_isFirstRoom && results_pokemonToInclude">
      <div v-if="longestStreak_end !== -1">
        <div>Longest streak<span v-if="results_pokemonToInclude.trim()"> with "{{results_pokemonToInclude}}"</span><span v-if="results_pokemonToInclude2"> and "{{results_pokemonToInclude2}}"</span>:
          {{longestStreak_end - longestStreak_start + 1}} (RNG frames {{longestStreak_start}} - {{longestStreak_end}})</div>
        <div>Ideal target RNG frame for RNG manipulation: {{Math.floor((longestStreak_start + longestStreak_end) / 2)}}</div>
      </div>
      <div v-else style="color:red">
        No rental Pokémon contains "{{results_pokemonToInclude}}"<span v-if="results_pokemonToInclude2"> and "{{results_pokemonToInclude2}}"</span>.
      </div>
    </div>
    <div v-if="!results_isFirstRoom && longestStreak_end !== -1">
      <div>Ideal target RNG frame for RNG manipulation: {{Math.floor((longestStreak_start + longestStreak_end) / 2)}}</div>
    </div>

    <div v-if="results_pokemonToInclude">
      <div>
        <label><input type="checkbox" v-model="hideFarFromWantedRental"> Hide results without wanted rental</label>
      </div>
    </div>

    <p v-if="results.length && results_isFirstRoom">
      <h6><label><input type="checkbox" v-model="rngCalib_active" @change="updateResultVisibility"> RNG Calibration for finding Hit RNG frame</label></h6>
      <table v-if="rngCalib_active">
        <tr>
          <td>Opponent Common Type Hint</td>
          <td><select v-model="rngCalib_type" style="margin-left:0px" @change="updateResultVisibility">
            <option value="null">Unknown</option>
            <option v-for="(n,i) in TYPE_TO_NAME" :value="i" v-if="n !== '???'">{{n}}</option>
          </select></td>
        </tr>
        <tr>
          <td>Opponent Battle Style Hint</td>
          <td><select v-model="rngCalib_style" style="margin-left:0px" @change="updateResultVisibility">
            <option value="null">Unknown</option>
            <option v-for="(n,i) in FACTORY_STYLE_TO_NAME" :value="i">{{n}}</option>
          </select></td>
        </tr>
        <tr>
          <td v-if="results_isFirstRoom">Player Rental Name Filter</td>
          <td v-else>Trainer Pokémon Name Filter</td>
          <td><label><input style="display:inline-block;width:250px" @change="updateResultVisibility" v-model="rngCalib_pokemonName"></label></td>
        </tr>
      </table>
    </p>

    <br>
    <div style="overflow-y:scroll;height:80vh">
      <table class="outputTable" :class="{hideFarFromWantedRental:hideFarFromWantedRental}">
        <tr><th>RNG Frame</th><th v-if="results_isFirstRoom">Player Rental (Selectable for Use as Input)</th><th>Trainer Pokémon</th><th></th><th v-if="results_bestRngFrameForBattle">Battle Score</th><th v-if="results_bestRngFrameForBattle">Battles In Range Score</th><th>Trainer</th><th>Trainer Type</th><th>Trainer Style</th></tr>
        <tr v-for="res in results" v-if="res.visible"
          :class="{inLongestStreak:res.rngAdvCount >= longestStreak_start && res.rngAdvCount <= longestStreak_end, farFromWantedRental:res.farFromWantedRental}">
          <td>{{res.rngAdvCount}}</td>
          <td :class="{hasPokemonToInclude:!rngCalib_active && res.hasPokemonToInclude === true,notHasPokemonToInclude:!rngCalib_active && res.hasPokemonToInclude === false}" v-if="res.playerRental.length">
            <span v-for="(p,i) in res.playerRental" @click="clickSelectRental(res.playerRental, p)" :class="{rentalSelected:p.selected !== -1}">
              {{p.name}}<span v-if="p.selected !== -1"> [#{{p.selected + 1}}]</span><span v-if="i !== 5">,</span>
            </span>
          </td>
          <td>{{res.jtmonsText}}</td>
          <td><button @click="useAsInput(res)" style="padding:0px 5px;margin:0px;letter-spacing:0px;border:0px;">Use As Input</button</td>
          <td v-if="results_bestRngFrameForBattle">{{res.battleSelfScore}}</td>
          <td v-if="results_bestRngFrameForBattle">{{res.battleScore.toFixed(1)}}</td>
          <td>{{res.trainer}}</td>
          <td>{{TYPE_TO_NAME[res.commonType]}}</td>
          <td>{{FACTORY_STYLE_TO_NAME[res.battleStyle]}}</td>
        </tr>
      </table>
    </div>
    <div v-if="!results_atLeastOneVisible" style="color:red">
      Error: No results that match the provided RNG Calibration for finding Hit RNG frame.
    </div>
  </div>
</div>

