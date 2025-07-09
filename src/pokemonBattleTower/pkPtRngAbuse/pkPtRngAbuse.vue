

<div class="pkPtRngAbuse" style="padding-bottom:100px;max-width:1080px;">

  <h2 class="pokemon-title">
    <a href="/BattleFacilities"><span>Battle Facilities</span></a><span>▸</span><span>Pokemon Platinum RNG Manipulation</span>
  </h2>

  <!--<table class="input-table">
    <tr><td>Facility</td><td>
      <select v-model="facility" @change="saveToLocalStorage()" style="margin-left:0px">
        <option :value="Facility.arena">Battle Arena</option>
        <option :value="Facility.dome">Battle Dome</option>
        <option :value="Facility.factory">Battle Factory</option>
        <option :value="Facility.palace">Battle Palace</option>
        <option :value="Facility.pike">Battle Pike</option>
        <option :value="Facility.pyramid">Battle Pyramid</option>
        <option :value="Facility.tower">Battle Tower</option>
      </select>
    </td></tr>
  </table>-->

  <div>
    <h5>
      <span  @click="displaySummary = !displaySummary, saveToLocalStorage()">
        {{displaySummary ? '▼' : '▶'}} Summary
      </span>
    </h5>
    <div v-if="displaySummary" style="padding-left:10px">
      <p>The goal of the tool is to help players beat the Pokemon Platinum Battle Frontier, which is a requirement in the <a href="/completion/Platinum" target="_blank" rel="noopener">Pokemon Platinum 100% Checklist</a>.
      </p>
      <p>
      In Pokemon Platinum Battle Tower, all 7 trainer teams are generated when starting the first battle. <br>
      It is possible to manipulate RNG to <span style="font-weight:bold">battle against a series of easy Pokemons (guaranteed win).</span> <br>
      <p>Step 1: Determine your seed based on first seen trainer Pokemons</p>
      <p>Step 2: Use your seed to determine advances for easiest trainer teams</p>
      <a href="/articles/Platinum_Battle_Tower_RNG_Manipulation">Technical implementation article</a>
    </div>
    <br>

    <div style="padding:5px 0px">
      <div style="display: flex">
        <div style="font-size:1.5em">Mode:</div>
        <div style="padding-left:20px">
          <div style="padding-bottom:5px"><label class="clickable"><input type="radio" :value="Mode.find_seed" v-model="mode" @change="saveToLocalStorage"> Step 1: Determine your seed based on first seen trainer Pokemons</label></div>
          <div style="padding-bottom:5px"><label class="clickable"><input type="radio" :value="Mode.search_easy" v-model="mode"  @change="saveToLocalStorage"> Step 2: Determine advances for easiest trainer teams</label></div>
          <hr>
          <div style="padding-bottom:5px"><label class="clickable"><input type="radio" :value="Mode.find_team" v-model="mode"  @change="saveToLocalStorage"> Determine all 7 trainer teams based on first seen trainer Pokemons</label></div>
          <div style="padding-bottom:5px"><label class="clickable"><input type="radio" :value="Mode.generate_one" v-model="mode"  @change="saveToLocalStorage"> Determine all 7 trainer teams based on same day seed</label></div>
          <div style="padding-bottom:5px"><label class="clickable"><input type="radio" :value="Mode.seed_formula" v-model="mode"  @change="saveToLocalStorage"> Calculate seeds after advances</label></div>
        </div>
      </div>
    </div>

    <h5>
      <span  @click="displayHowToUse = !displayHowToUse, saveToLocalStorage()">
        {{displayHowToUse ? '▼' : '▶'}} How To Use
      </span>
    </h5>
    <div v-if="displayHowToUse" style="padding-left:10px">
      <div v-if="mode === Mode.find_seed">
        <ul>
          <li><span class="cs-red">Important: </span> Save the game, then advance the DS clock by 1 day.</li>
          <li>If your goal is to manipulate RNG for Single, boot the game and start/continue your <span style="font-weight:bold">Double</span> streak.</li>
          <li>The tool doesn't support yet RNG manipulation for Double.</li>
          <li>Write down the trainer names and their Pokemons. At least 2 trainers and their Pokemon are recommended.</li>
          <li>Fill the other input fields, then press Calculate.</li>
          <li>Calculating can take some time (4 billions possibilities must be tested).</li>
          <li>If multiple trainer teams are listed, continue fighting trainers until only 1 team matches what's ingame.</li>
          <li>Press "Find easy trainers" to switch to the mode "Determine advances for easiest trainer teams".</li>
        </ul>
      </div>
      <div v-if="mode === Mode.search_easy">
        <ul>
          <li><span class="cs-red">Important: </span> This section assumes that you have already determined your same day and difference day seed. If not, click change the mode to "Step 1: Determine your seed based on first seen trainer Pokemons".</li>

          <li>Fill the inputs and click Calculate.</li>
          <li>
            The tool will calculate the RNG manipulation to perform to fight easy Pokemon.
            <ul>
              <li>A trainer Pokemon with a <span class="cs-green">green name</span> indicates that the Player Pokemon is guaranteed to outspeed and One-Hit-KO it.</li>
              <li>A trainer Pokemon with a <span style="font-weight:bold">white name</span> indicates that the win isn't 100% guaranteed, but the Pokemon doesn't have attacks with unpredictable outcomes (ex: Thunder Wave, Fissure). By planning carefully the 2nd and 3rd Player Pokemon of your team, it is possible to ensure a victory.</li>
              <li>A trainer Pokemon with a <span class="cs-red">red name</span> indicates that the Pokemon is dangerous and luck-based.</li>
            </ul>
          </li>
          <li>The column "Different Day Advances" indicates the DS clock changes to perform.
            <ul>
              <li>For example, 2000-01-01 -> 2099-12-31 (x3) + 2000-01-01 -> 2053-03-28 means
                <ul>
                  <li>Change the DS clock for 2000-01-01, load your game and save again without doing anything more.</li>
                  <li>Change the DS clock for 2099-12-31, load your game, start/continue your Battle Tower Double streak (assuming you want to RNG manipulate your Single streak). Abandon and save again.</li>
                  <li>Repeat the 2 steps above 2 more times (for a total of 3 times).</li>
                  <li>Change the DS clock for 2000-01-01, load your game and save again without doing anything more.</li>
                  <li>Change the DS clock for 2053-03-28, load your game. Additional steps might be needed (see Same Day Advances)</li>
                </ul>
              </li>
            </ul>
          </li>
          <li>The column "Same Day Advances" indicates the number of time you must start and abandon your Battle Tower Double streak <span style="font-weight:bold">after performing the different day advances.</span>

            <ul>
              <li>By checking "At least one same day advance count", you can see the expected first Pokemon from last forfeited Double streak. If the Pokemon you face in the Double battle don't match the ones on the site, this means the RNG manipulation failed and you should not attempt to continue your Single streak. Instead, you must go back to finding seeds (Step 1). The downside of using this feature is that it reduces the possibilities a bit.</li>
            </ul>
          </li>
          <li>Once different and same day advances are completed, continue your Single streak to battle RNG manipulated teams.</li>
        </ul>
      </div>
      <p>
        <span style="font-weight:bold">Video demo:</span> <a href="https://youtu.be/kEvqc0Vpzsc" target="_blank" rel="noopener">https://youtu.be/kEvqc0Vpzsc</a>
      </p>
    </div>


    <h3>Input</h3>
    <table style="padding-bottom:10px">
      <tr v-if="mode !== Mode.seed_formula" style="padding:5px 0px" class="display:flex">
        <td>Battle room:</td>
        <td v-if="mode === Mode.search_easy">
          <label class="clickable"><input type="radio" :value="BattleRoom.single" v-model="battleRoom_search_easy" @change="saveToLocalStorage"> Single</label>
          <label class="clickable"><input type="radio" :value="BattleRoom.double" v-model="battleRoom_search_easy" @change="saveToLocalStorage"> Double</label>
        </td>
        <td v-else>
          <label class="clickable"><input type="radio" :value="BattleRoom.single" v-model="battleRoom" @change="saveToLocalStorage"> Single</label>
          <label class="clickable"><input type="radio" :value="BattleRoom.double" v-model="battleRoom" @change="saveToLocalStorage"> Double</label>
        </td>
      </tr>
      <tr v-if="mode !== Mode.seed_formula" style="padding:5px 0px" class="display:flex">
        <td>Win count:</td>
        <td  v-if="mode === Mode.search_easy"><input type="number" v-model="winStreak_search_easy"  style="margin:0px" min="0" @change="saveToLocalStorage"></td>
        <td v-else><input type="number" v-model="winStreak"  style="margin:0px" min="0" @change="saveToLocalStorage"></td>
      </tr>

      <tr v-if="mode === Mode.seed_formula" style="padding:5px 0px" class="display:flex">
        <td style="min-width:300px">Different day advance count:</td>
        <td><input v-model="diffDayAdv" style="margin:0px" type="number" min="0" max="9999999" @change="saveToLocalStorage"></td>
      </tr>
      <tr v-if="mode === Mode.seed_formula" style="padding:5px 0px" class="display:flex">
        <td>Same day advance count:</td>
        <td><input v-model="sameDayAdv" style="margin:0px" type="number" min="0" max="9999999" @change="saveToLocalStorage"></td>
      </tr>

      <tr v-if="mode === Mode.generate_one || (mode === Mode.seed_formula && +diffDayAdv === 0) || mode === Mode.search_easy" style="padding:5px 0px" class="display:flex">
        <td>Same day seed (hex format) in savefile:</td>
        <td><input v-model="sameDaySeed" style="margin:0px" maxlength="10" @change="saveToLocalStorage"></td>
      </tr>

      <tr v-if="(mode === Mode.seed_formula && +diffDayAdv > 0) || mode === Mode.search_easy" style="padding:5px 0px" class="display:flex">
        <td>Different day seed (hex format) in savefile:</td>
        <td><input v-model="diffDaySeed" style="margin:0px" maxlength="10" @change="saveToLocalStorage"></td>
      </tr>
      <tr v-if="mode === Mode.search_easy" style="padding:5px 0px" class="display:flex">
        <td>Max DS clock date change:</td>
        <td><input v-model="maxClockChange" style="margin:0px" maxlength="5" @change="saveToLocalStorage"></td>
      </tr>
      <tr v-if="mode === Mode.search_easy" style="padding:5px 0px" class="display:flex">
        <td>Max same day advance count:</td>
        <td><input v-model="maxSameDayAdvCount" style="margin:0px" maxlength="5" @change="saveToLocalStorage"></td>
      </tr>
      <tr v-if="mode === Mode.search_easy && +maxSameDayAdvCount > 0" style="padding:5px 0px" class="display:flex">
        <td>At least one same day advance count?</td>
        <td><input v-model="at_least_one_same_day_adv" type="checkbox" @change="saveToLocalStorage"></td>
      </tr>


    </table>

    <div v-if="mode === Mode.find_seed || mode === Mode.find_team">
      <div class="flex" style="align-items:center">
        <h5>Battled Trainer Pokemon</h5>
        <button style="margin-left:20px;font-size:0.8em" @click="clearAllBattledTmons">Clear All</button>
      </div>
      <div class="input-table" style="padding-left:10px">
        <div v-for="(grp,i) in battledTmons" v-if="i === 0 || battledTrainers[i - 1].input" class="flex" style="align-items:center">
          <span style="padding-right:10px">Trainer #{{i+1}}: </span>

          <span>
            <input v-model="battledTrainers[i].input" :list="battledTrainers[i].listId" @change="updateBattledTrainer(battledTrainers[i]), saveToLocalStorage()" :class="battledTrainers[i].getKlass()" style="width:125px">
            <datalist :id="battledTrainers[i].listId">
              <option v-for="possVal in battledTrainers[i].possibleValues" :value="possVal" v-if="possVal !== battledTrainers[i].input">{{possVal}}</option>
            </datalist>
          </span>

          <span v-if="battledTrainers[i].input" v-for="(tmon,j) in grp.slice(0, get_mon_by_battle())">
            <input v-model="tmon.input" :list="tmon.listId" @change="updateBattledTmon(tmon), saveToLocalStorage()" :class="tmon.getKlass()" style="width:125px">
            <datalist :id="tmon.listId">
              <option v-for="possVal in tmon.possibleValues" :value="possVal" v-if="possVal !== tmon.input">{{possVal}}</option>
            </datalist>
          </span>
        </div>
      </div>
    </div>

    <div v-if="mode === Mode.search_easy">
      <div class="flex" style="align-items:center">
        <h5>Owned Player Pokemon</h5>
      </div>
      <table class="result-table" style="padding-left:10px">
        <tr v-for="(pmon,i) in pmons">
          <td><label><input type="checkbox" v-model="pmon.owned"></label></td>
          <td @click="pmon.owned = !pmon.owned"><div class="icon-48x48" style="margin-top: -2px; width: 32px; height: 32px;">
              <div class="genericMap-marker" :class="'pokemon-p' + pmon.nationalDex"></div>
            </div></td>
          <td @click="pmon.owned = !pmon.owned">{{pmon.name}}</td>
          <td @click="pmon.owned = !pmon.owned">{{pmon.nature}}</td>
          <td @click="pmon.owned = !pmon.owned">{{pmon.evIv}}</td>
          <td @click="pmon.owned = !pmon.owned">{{pmon.moves}}</td>
        </tr>
      </table>
    </div>

    <ul v-if="errors.length" class="cs-red">
      <li v-for="e in errors">Error: {{e}}</li>
    </ul>
    <div class="flex">
      <button @click="calculate" :disabled="isCalculating()">Calculate</button>
      <button style="margin-left:30px" v-if="isCalculating()" @click="stop">Stop</button>
    </div>

    <div v-if="isCalculating() && progressTodo">
      Progress: {{(progressCurrent/progressTodo * 100).toFixed(1)}}% ({{numberWithCommas(progressCurrent)}} / {{numberWithCommas(progressTodo)}})
    </div>


    <br>
    <h3>Output</h3>
    <div v-if="results && resultsMode === mode">
      <div v-if="results.length === 0" class="cs-orange">The search yielded no results. Make sure the inputs are correct.</div>
      <table class="results-table" v-else>
        <tr>
          <th v-if="resultsMode === Mode.find_seed"></th>
          <th v-if="resultsMode !== Mode.generate_one && resultsMode !== Mode.search_easy">Same Day Seed</th>
          <th v-if="results[0].diffDaySeed !== null && resultsMode !== Mode.search_easy">Different Day Seed</th>

          <th v-if="resultsMode === Mode.search_easy">Player Pokemon</th>
          <th v-if="resultsMode === Mode.search_easy">Different Day Advances</th>
          <th v-if="resultsMode === Mode.search_easy">Same Day Advances</th>
          <th v-if="resultsMode === Mode.search_easy">Rating</th>

          <th v-if="resultsMode !== Mode.seed_formula">Trainer Pokemons</th>
          <th v-if="resultsMode === Mode.search_easy">Ending Seeds</th>
        </tr>
        <tr v-for="r in results">
          <td v-if="resultsMode === Mode.find_seed"><button @click="clickFindEasyTrainer(r)">Find<br>easy<br>trainers</button></td>
          <td v-if="resultsMode !== Mode.generate_one && resultsMode !== Mode.search_easy">{{toHex(r.sameDaySeed)}}</td>
          <td v-if="r.diffDaySeed !== null && resultsMode !== Mode.search_easy">{{toHex(r.diffDaySeed)}}</td>

          <td v-if="resultsMode === Mode.search_easy" :title="r.pmonTitle">
            <div class="icon-48x48" style="margin-top: -2px; width: 32px; height: 32px;">
              <div class="genericMap-marker" :class="'pokemon-p' + r.pmonNationalDex"></div>
            </div>
            <div v-for="d in r.pmonDesc">{{d}}</div>
          </td>

          <td v-if="resultsMode === Mode.search_easy" :title="r.diffDayAdv + ' day advances'">
            <div v-for="d in r.clockDateChanges" style="white-space: nowrap">{{d}}</div>
            <div v-if="r.clockDateChanges.length === 0">No DS clock change</div>
          </td>
          <td v-if="resultsMode === Mode.search_easy">
            {{r.sameDayAdv}}
          </td>
          <td v-if="resultsMode === Mode.search_easy">
            {{r.rating.toFixed(2)}}
          </td>
          <td v-if="resultsMode !== Mode.seed_formula && resultsMode !== Mode.search_easy && results.length > 1"> <!-- 2 rows form, no desc -->
            <div style="display:grid;grid-template-columns: 1fr 1fr 1fr 1fr;">
              <div v-for="(tmons2,i) in r.tmons" class="flex" style="margin-right:20px">
                <div :title="tmon.desc" v-for="(tmon,j) in tmons2" class="icon-48x48" style="margin-top: -2px; width: 32px; height: 32px;">
                  <div class="genericMap-marker" :class="'pokemon-p' + tmon.nationalDex"></div>
                </div>
              </div>
            </div>
          </td>
          <td v-if="resultsMode === Mode.search_easy || (resultsMode !== Mode.seed_formula && results.length === 1)">

            <div v-if="r.search_prevSameDayResult.length" style="padding-bottom:10px">
              <div>First Pokemon from the last forfeited Double streak:</div>

              <div class="flex">
                <div v-for="tmon in r.search_prevSameDayResult" class="flex" style="white-space: nowrap;padding-left:30px;">
                  <div class="icon-48x48" style="margin-top: -2px; width: 32px; height: 32px;">
                    <div class="genericMap-marker" :class="'pokemon-p' + tmon.nationalDex"></div>
                  </div>
                  {{tmon.species}}
                </div>
              </div>
            </div>

            <table>
              <tr v-for="(tmons2,i) in r.tmons">
                <td v-if="tmons2[0].pmonMove" style="white-space: nowrap;padding-right:2px;">
                  {{tmons2[0].pmonMove}}
                </td>
                <td v-for="(tmon,j) in tmons2">
                  <div class="flex" :title="tmon.desc" :class="ratingToCssClass(tmon.rating)" style="white-space: nowrap;padding-right:2px;">
                    <div class="icon-48x48" style="margin-top: -2px; width: 32px; height: 32px;">
                      <div class="genericMap-marker" :class="'pokemon-p' + tmon.nationalDex"></div>
                    </div>
                    {{tmon.shortDesc}}
                  </div>
                </td>
              </tr>
            </table>
          </td>
          <td v-if="resultsMode === Mode.search_easy">
            <div style="white-space: nowrap;padding-right:2px;">Same Day: {{toHex(r.sameDaySeed)}}</div>
            <div style="white-space: nowrap;padding-right:2px;">Diff Day: {{toHex(r.diffDaySeed)}}</div>
            <div><button v-if="!areInputSeedsSameAsResult(r)" @click="setSeedsAsInput(r)">Set as input</button></div>
          </td>
        </tr>
      </table>
    </div>
    <div v-else>
      No output yet.
    </div>
  </div>


  <div class="container" style="padding-bottom:30px;padding-top:20px">
    <h5>
      <span  @click="displayImportExport = !displayImportExport">
        {{displayImportExport ? '▼' : '▶'}} Import/Export Settings
      </span>
    </h5>
    <div v-show="displayImportExport" style="margin-left:5px">
      <div v-if="importExportDataTxtErr" style="color:red">{{importExportDataTxtErr}}</div>
      <div class="div-section">
        <div>
          <button @click="exportData">Export</button>
          <button @click="importData(importExportDataTxt)">Import</button>
        </div>
        <div>
          <textarea v-model="importExportDataTxt" style="width:100%;height:calc(100% - 230px)"></textarea>
        </div>
      </div>
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
      <p>
        <a target="_blank" rel="noopener" href="https://github.com/pret/pokeplatinum">Platinum decompil project</a>
      </p>
      <p>
        Pokémon is a registered trademark of Game Freak, The Pokemon Company, and Nintendo.
      </p>
    </div>
  </div>
</div>
