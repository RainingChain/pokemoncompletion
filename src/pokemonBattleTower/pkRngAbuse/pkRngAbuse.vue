

<div class="pkRngAbuse" style="padding-bottom:100px;max-width:1080px;">
  <h2 class="pokemon-title">
    <a href="/BattleFacilities"><span>Battle Facilities</span></a><span>▸</span><span>Pokémon Emerald RNG Manipulation</span>
  </h2>

  <table class="input-table">
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
  </table>

  <div v-show="facility === Facility.pike">
    <div style="padding:5px 0px;margin-bottom:10px;">
      <div style="display: flex">
        <div>Mode:</div>
        <div style="padding-left:20px">
          <div style="padding-bottom:5px"><label class="clickable"><input type="radio" :value="FactoryPikeMode.cluster" v-model="pikeMode" @change="saveToLocalStorage"> Find consecutive RNG frames that result in easy rooms</label></div>
          <div style="padding-bottom:5px"><label class="clickable"><input type="radio" :value="FactoryPikeMode.team" v-model="pikeMode" @change="saveToLocalStorage"> Determine entire opponent team from trainer and 1st Pokémon</label></div>
        </div>
      </div>
    </div>
    <div ref="bpiClusterFinder" v-show="pikeMode === FactoryPikeMode.cluster" style="padding-bottom:30px" is="Vue_bpiClusterFinder" v-bind="{
      saveToLocalStorage:saveToLocalStorage,
    }"></div>
  </div>

  <div v-show="facility === Facility.factory">
    <div style="padding:5px 0px;margin-bottom:10px;">
      <div style="display: flex">
        <div>Mode:</div>
        <div style="padding-left:20px">
          <div style="padding-bottom:5px"><label class="clickable"><input type="radio" :value="FactoryPikeMode.cluster" v-model="factoryMode" @change="saveToLocalStorage"> Find consecutive RNG frames that result in the wanted rentals or easy opponents</label></div>
          <div style="padding-bottom:5px"><label class="clickable"><input type="radio" :value="FactoryPikeMode.team" v-model="factoryMode" @change="saveToLocalStorage"> Determine entire opponent team from trainer and 1st Pokémon</label></div>
        </div>
      </div>
    </div>
    <div ref="bfRentalFinder" v-show="factoryMode === FactoryPikeMode.cluster" style="padding-bottom:30px" is="Vue_bfRentalFinder" v-bind="{
      saveToLocalStorage:saveToLocalStorage,
    }"></div>
  </div>

  <div v-show="facility === Facility.dome">
    <iframe style="width:1550px;height:1000px;" src="https://pokemow.com/Gen3/DomeAssistantWeb/"></iframe>
  </div>

  <div v-show="facility === Facility.pyramid">
    <div ref="bpyVisualizer" is="Vue_bpyVisualizer" v-bind="{
      saveToLocalStorage:saveToLocalStorage,
    }"></div>
  </div>

  <div v-show="facility === Facility.tower || facility === Facility.arena || facility === Facility.palace || (facility === Facility.pike && pikeMode === FactoryPikeMode.team) || (facility === Facility.factory && factoryMode === FactoryPikeMode.team)">
    <h5>
      <span  @click="displaySummary = !displaySummary, saveToLocalStorage()">
        {{displaySummary ? '▼' : '▶'}} Summary
      </span>
    </h5>
    <div v-if="displaySummary">
      <p>
        This tool predicts the entire Battle <span v-if="facility === Facility.tower">Tower</span><span v-if="facility === Facility.palace">Palace</span><span v-if="facility === Facility.arena">Arena</span><span v-if="facility === Facility.pike">Pike</span><span v-if="facility === Facility.factory">Factory</span> opponent team based on the trainer and their first Pokémon.
      </p>
      <p>
        <div>Example:</div>
        <img :src="howToImgUrl">
      </p>

      <p style="padding-left:10px">
        <span style="font-weight:bold">Video demo:</span> <a href="https://www.youtube.com/watch?v=1UQxz6yZ6IU" target="_blank" rel="noopener">https://www.youtube.com/watch?v=1UQxz6yZ6IU</a>
      </p>
    </div>

    <div style="padding:5px 0px">
      <h5>
        <span @click="displayHowToUse = !displayHowToUse, saveToLocalStorage()">
          {{displayHowToUse ? '▼' : '▶'}} How To Use
        </span>
      </h5>
      <div v-if="displayHowToUse">
        <ul>
          <li>Make sure that you Rest after the previous battle, and press A as fast as possible until you see the opponent trainer name IN BATTLE.
            <ul>
              <li>Optionally, on mGBA emulator, Tools -> Settings -> Shortcuts -> Tools -> Autofire -> Autofire A.</li>
              <li>If not using Autofire A, make sure to play at regular (100%) speed and press A as fast as possible.</li>
            </ul>
          </li>
          <li>In the Input section, enter info about the Pokémon of your current trainer opponent.</li>
          <li>Click "Generate" to display the list of possible opponent teams in the Output section.</li>
          <li>You can add more info about the opponent team and click Generate again for more accurate results.</li>
        </ul>
        <p style="padding-left:10px"><span style="font-weight:bold">Limitations:</span> Only Single Battles are supported. </p>
        <p style="padding-left:10px">
          <span style="font-weight:bold">How it works:</span> The opponent team is randomly generated by using an algorithm based on the
          number of frames since the game was booted. By starting the game and pressing A as fast as
          possible, the number of frames before the battle is within a small range. This means only a small
          subset of trainer teams are actually possible. This tool calculates the possible trainer teams and displays the most probable ones. <a href="
        /articles/Emerald_Battle_Tower_RNG_Manipulation">Check here for technical details.</a>
        </p>
      </div>
    </div>

    <h3>Input</h3>
    <div>
      <div>
        <table class="input-table">
          <tr>
            <td>{{facility === Facility.pike ? 'Completed Room Count' : 'Win Count'}}</td>
            <td>
              <input v-model="winStreak" type="number" min="0" @change="updateAllInputNames(),saveToLocalStorage()" style="display:inline-block">
              <span v-if="facility !== Facility.pike" style="padding-left:10px">Attempting RNG manipulation of Round {{Math.floor(+winStreak / 7) + 1}}, Battle {{(+winStreak % 7) + 1}}</span>
              <span style="padding-left:10px" v-else>Attempting RNG manipulation of Round {{Math.floor(+winStreak / 14) + 1}}, Room {{(+winStreak % 14) + 2 - (+winStreak % 2)}}</span>
            </td>

          </tr>

          <!-- previous trainer aren't that important because it only changes frame by small amount -->
          <tr v-for="(trainerBattled,i) in trainersBattled" v-if="facility !== Facility.pike ? i < (+winStreak % 7) : i < (+winStreak % 14) / 2">
            <td>{{'Previous Trainer #' + (i + 1)}}</td>
            <td>
              <input v-model="trainerBattled.input" :list="trainerBattled.listId" @change="updateTrainersBattled(), saveToLocalStorage()" :class="trainerBattled.getKlass()">
              <datalist :id="trainerBattled.listId">
                <option v-for="possVal in trainerBattled.possibleValues" :value="possVal" v-if="possVal !== trainerBattled.input">{{possVal}}</option>
              </datalist>
            </td>
          </tr>
          <tr><td>Level 50?</td><td><input type="checkbox" v-model="isLvl50" @change="saveToLocalStorage()"></td></tr>

          <tr v-if="+winStreak < 50 && facility === Facility.palace"><td>Old Man Speech</td><td>
            <select v-model="palaceOldManMessage" @change="saveToLocalStorage()" style="margin-left:0px">
              <option :value="PalaceOldManMsg.People">People and POKéMON, they are but...</option>
              <option :value="PalaceOldManMsg.Rather">Rather than trying to make a POKéMON...</option>
              <option :value="PalaceOldManMsg.APokemon">A POKéMON's nature is a remarkable...</option>
            </select>
          </td></tr>

          <tr v-if="+winStreak < 112 && facility === Facility.pike"><td>Facing Hard Trainer with Healing Reward?</td><td>
             <input v-model="pikeDifficultTrainer" type="checkbox">
          </td></tr>


          <tr v-for="mon in factoryPokemonNames" v-if="facility === Facility.factory">
            <td>{{mon.inputName}}</td>
            <td>
              <label>
                <input placeholder="Name" v-model="mon.input" :list="mon.listId" @change="updateFactoryPokemonInputName(mon),saveToLocalStorage()" :class="mon.getKlass()">
                <datalist :id="mon.listId">
                  <option v-for="(possVal,i) in mon.possibleValues" :value="possVal" v-if="possVal !== mon.input">{{possVal}}</option>
                </datalist>
              </label>
            </td>
          </tr>
          </tr>

          <tr v-if="facility === Facility.factory && (+winStreak) % 7 === 0">
            <td>Number of Rental/Swap</td>
            <td><input v-model="factoryPastRentalCount" type="number" min="0"></td>
          </tr>


          <tr v-if="facility === Facility.factory">
            <td>Opponent Common Type Hint</td>
            <td><select v-model="factoryCommonType" @change="saveToLocalStorage()" style="margin-left:0px">
              <option value="null">Unknown</option>
              <option v-for="(n,i) in TYPE_TO_NAME" :value="i" v-if="n !== '???'">{{n}}</option>
            </select></td>
          </tr>

          <tr v-if="facility === Facility.factory">
            <td>Opponent Battle Style Hint</td>
            <td><select v-model="factoryBattleStyle" @change="saveToLocalStorage()" style="margin-left:0px">
              <option value="null">Unknown</option>
              <option v-for="(n,i) in FACTORY_STYLE_TO_NAME" :value="i">{{n}}</option>
            </select></td>
          </tr>

          <tr>
            <td>Current Trainer</td>
            <td>
              <input v-model="trainerNameFilter.input" :list="trainerNameFilter.listId" @change="updateCurrentTrainerInputName(),saveToLocalStorage()" :class="trainerNameFilter.getKlass()">
              <datalist :id="trainerNameFilter.listId">
                <option v-for="possVal in trainerNameFilter.possibleValues" :value="possVal" v-if="possVal !== trainerNameFilter.input">{{possVal}}</option>
              </datalist>
            </td>
          </tr>


          <tr v-for="(pokemonFilter,i) in pokemonsFilter" v-if="pokemonFilter.input || i === 0 || (i === 1 && pokemonsFilter[0].input) || (i === 2 && pokemonsFilter[1].input)">
            <td style="padding-top:15px;padding-bottom:10px;vertical-align:top">Trainer Pokémon #{{i + 1}}</td>
            <td style="padding-top:10px;padding-bottom:10px;">
              <div style="padding:2px 0px">
                <label>
                  <input placeholder="Name" v-model="pokemonFilter.input" :list="pokemonFilter.listId" @change="updatePokemonInputName(pokemonFilter),saveToLocalStorage()" :class="pokemonFilter.getKlass()">
                  <datalist :id="pokemonFilter.listId">
                    <option v-for="possVal in pokemonFilter.possibleValues" :value="possVal" v-if="possVal !== pokemonFilter.input">{{possVal}}</option>
                  </datalist>
                </label>
              </div>

              <div style="padding:5px 0px" v-if="pokemonFilter.canBeMaleAndFemale">
                <label>Gender:
                  <label class="clickable"><input type="radio" value="unknown" v-model="pokemonFilter.genderInput" @change="updatePokemonInputName(pokemonFilter),saveToLocalStorage()"> Unknown</label>
                  <label class="clickable"><input type="radio" value="male" v-model="pokemonFilter.genderInput" @change="updatePokemonInputName(pokemonFilter),saveToLocalStorage()"> Male</label>
                  <label class="clickable"><input type="radio" value="female" v-model="pokemonFilter.genderInput" @change="updatePokemonInputName(pokemonFilter),saveToLocalStorage()"> Female</label>
                </label>
              </div>

              <div style="padding:5px 0px" v-if="displayBattleFrontierIdInputs">
                <input type="number" placeholder="Battle Frontier ID" style="width:200px" v-model="pokemonFilter.battleFrontierIdInput" @change="updatePokemonInputName(pokemonFilter),saveToLocalStorage()">
              </div>

              <div style="padding:2px 0px" v-for="(mv,j) in pokemonFilter.moveInputs" v-if="pokemonFilter.speciesName && (j === 0 || (j === 1 && pokemonFilter.moveInputs[0].computedValue) || (j === 2 && pokemonFilter.moveInputs[0].computedValue && pokemonFilter.moveInputs[1].computedValue) || (j === 3 && pokemonFilter.moveInputs[0].computedValue && pokemonFilter.moveInputs[1].computedValue && pokemonFilter.moveInputs[2].computedValue))">
                <label>
                  <input v-model="mv.input" :placeholder="'Move #' + (j + 1)" :list="mv.listId" @change="updatePokemonInputName(pokemonFilter),saveToLocalStorage()" :class="mv.getKlass()">
                  <datalist :id="mv.listId">
                    <option v-for="possVal in mv.possibleValues" :value="possVal" v-if="possVal !== mv.input">{{possVal}}</option>
                  </datalist>
                </label>
              </div>

              <div style="padding:2px 0px" v-if="pokemonFilter.speciesName">
                <label>
                  <input placeholder="Item" v-model="pokemonFilter.itemInput.input" :list="pokemonFilter.itemInput.listId" @change="updatePokemonInputName(pokemonFilter),saveToLocalStorage()" :class="pokemonFilter.itemInput.getKlass()">
                  <datalist :id="pokemonFilter.itemInput.listId">
                    <option v-for="possVal in pokemonFilter.itemInput.possibleValues" v-if="possVal !== pokemonFilter.itemInput.input" :value="possVal">{{possVal}}</option>
                  </datalist>
                </label>
              </div>

              <div style="padding:5px 0px" v-if="pokemonFilter.speciesName && pokemonFilter.possibleAbilities.length > 1">
                <label>Ability:
                  <label class="clickable"><input type="radio" value="unknown" v-model="pokemonFilter.abilityInput" @change="updatePokemonInputName(pokemonFilter),saveToLocalStorage()"> Unknown</label>
                  <label class="clickable"><input type="radio" value="0" v-model="pokemonFilter.abilityInput" @change="updatePokemonInputName(pokemonFilter),saveToLocalStorage()"> {{pokemonFilter.possibleAbilities[0]}}</label>
                  <label class="clickable"><input type="radio" value="1" v-model="pokemonFilter.abilityInput" @change="updatePokemonInputName(pokemonFilter),saveToLocalStorage()"> {{pokemonFilter.possibleAbilities[1]}}</label>
                </label>
              </div>

              <div style="padding:5px 0px" v-if="pokemonFilter.possibleJmonsStr">
                Possible Preset(s): {{pokemonFilter.possibleJmonsStr}}
              </div>
            </td>
          </tr>

        </table>

        <div is="Vue_pkRngFrameInput" v-show="facility === Facility.tower" v-bind="{
          saveToLocalStorage:saveToLocalStorage,
          facility:Facility.tower,
        }" ref="rngCalib_tower"></div>

        <div is="Vue_pkRngFrameInput" v-show="facility === Facility.arena" v-bind="{
          saveToLocalStorage:saveToLocalStorage,
          facility:Facility.arena,
        }" ref="rngCalib_arena"></div>

        <div is="Vue_pkRngFrameInput" v-show="facility === Facility.palace" v-bind="{
          saveToLocalStorage:saveToLocalStorage,
          facility:Facility.palace,
        }" ref="rngCalib_palace"></div>

        <div is="Vue_pkRngFrameInput" v-show="facility === Facility.pike" v-bind="{
          saveToLocalStorage:saveToLocalStorage,
          facility:Facility.pike,
        }" ref="rngCalib_pike"></div>

        <div is="Vue_pkRngFrameInput" v-show="facility === Facility.factory" v-bind="{
          saveToLocalStorage:saveToLocalStorage,
          facility:Facility.factory,
        }" ref="rngCalib_factory"></div>
      </div>
      <br>
      <div>
        <button @click="update(),saveToLocalStorage()">Generate</button>

        <button @click="clear(true),saveToLocalStorage()">Clear and Update Win Streak</button>
        <button @click="clear(false),saveToLocalStorage()">Clear</button>
      </div>

      <br>
      <div v-if="inputError" style="color:red">
        {{inputError}}
      </div>
    </div>
    <h3>Output</h3>
    <div>
      <div v-if="rngProgressMsg">
        {{rngProgressMsg}}
      </div>
      <div is="Vue_pkRngAbuseResult" :result="rangeResult" :onJmonClicked="null" :displayCalibMsg="true"></div>
    </div>
  </div>

  <div v-show="facility !== Facility.dome" class="container" style="padding-bottom:30px;padding-top:20px">
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
    <div v-show="displayCredits && facility !== Facility.dome" style="margin-left:5px">
      <p>
        Contact me: RainingChain on <a target="_blank" rel="noopener" href="https://discord.gg/FZf9WNZZ"> Scripters War Discord</a>.
      </p>
      <p>
        Thanks to Shao and the mGBA team for support. Thanks to the <a href="https://github.com/pret/pokeemerald">pokeemerald</a> project.
      </p>
      <p>
        Thanks to werster for recommended rental teams for Battle Factory.
      </p>
      <p>
        Pokémon is a registered trademark of Game Freak, The Pokémon Company, and Nintendo.
      </p>
    </div>
    <div v-show="displayCredits && facility === Facility.dome" style="margin-left:5px">
      <p>
        taxicat1 and Actaeon (<a href="https://pokemow.com/Gen3/DomeAssistantWeb/">https://pokemow.com/Gen3/DomeAssistantWeb/</a>)
      </p>
    </div>
  </div>
</div>
