<div>
  <div v-if="!result">
    Result: No data about the opponent team has been calculated.
  </div>
  <div v-if="result && result.teamResultsFiltered.length === 0">
    <div style="color:red">No possible trainer teams found.</div>
    <div>
      Important: You must rest (save and restart the game) after each battle. You must press A as fast as possible from the game start until the battle starts.
      <span v-if="displayCalibMsg">Make sure the Input section and RNG Frames Calibration have correct info.</span>
      <br>
    </div>
    <div>
      To report a bug, contact RainingChain on <a target="_blank" rel="noopener" href="https://discord.com/invite/tMXrJzjWmg">Discord</a>
    </div>
  </div>
  <div v-if="result && result.teamResultsFiltered.length !== 0" class="smaller-pk-icons">
    <div style="padding-bottom:10px">
      Display Mode:
      <label class="clickable"><input type="radio" :value="ResultView.auto" v-model="resultViewInput" @change="updateResultViewInput"> Auto</label>
      <label class="clickable"><input type="radio" :value="ResultView.mon" v-model="resultViewInput" @change="updateResultViewInput"> Pokémon</label>
      <label class="clickable"><input type="radio" :value="ResultView.team" v-model="resultViewInput" @change="updateResultViewInput"> Teams</label>
    </div>
    <div v-if="resultView === ResultView.team">
      <table style="border-collapse: collapse;">
        <tr style="text-align:left">
          <th v-if="false">Trainer</th>
          <th>Probability</th>
          <th>Team</th>
          <th v-if="onJmonClicked">Examine</th>
          <th v-if="displayResultRngFrames">RNG Frame</th>
        </tr>

        <tr v-for="(res) in result.teamResultsFiltered" style="border-bottom:1px solid white;" :style="{backgroundColor:res.highlight ? '#000' : ''}">
          <td style="padding-right:10px" :title="'#' + res.trainer.id + ' - ' + res.trainer.startMsg" v-if="false">{{res.trainer.name}}</td>
          <td>{{res.probPctStr}}</td>
          <td style="padding:5px">
            <div v-for="mon in res.pokemons" style="white-space: nowrap;"  class="flex">
              <div class="icon-64x64" style="margin-top: -2px; width: 24px; height: 24px;">
                <div class="genericMap-marker" :class="'pokemon-p' + mon.speciesNum"></div>
              </div>
              <span v-html="mon.desc"></span>
            </div>
          </td>
          <td v-show="onJmonClicked && showClickTeam(res)">
            <button @click="onTeamClicked(res)">🔍</button>
          </td>
          <td v-if="displayResultRngFrames" :style="{'minWidth':res.showFrameCountInfoDetails ? '600px' : ''}">
            {{res.frameCountInfoStr}}
            <span v-if="res.frameCountInfoDetails.length > 1" @click="res.showFrameCountInfoDetails = !res.showFrameCountInfoDetails">[+ {{res.frameCountInfoDetails.length}}]</span>
            <div v-if="res.showFrameCountInfoDetails" style="white-space: nowrap;">
              <div v-for="s in res.frameCountInfoDetails">{{s}}</div>
            </div>
          </td>
        </tr>
      </table>

      <p style="padding-top:10px">
        <label>
          <input type="checkbox" v-model="displayResultRngFrames"> Show RNG Frames?
        </label>
      </p>
    </div>
    <table v-else>
      <tr>
        <th>Probability</th>
        <th>Pokémon</th>
        <th v-if="onJmonClicked">Examine</th>
      </tr>
      <tr v-for="pack in result.probByMons">
        <td v-if="pack.rowspan !== null" :rowspan="pack.rowspan" :style="{borderTop: pack.rowspan !== null ? '1px solid white' : ''}">
          <div class="flex">
            <div class="icon-64x64" style="margin-top: -2px; width: 24px; height: 24px;">
              <div class="genericMap-marker" :class="'pokemon-p' + pack.speciesNum"></div>
            </div>
            {{pack.speciesProbPctStr}}
          </div>
        </td>
        <td :style="{borderTop: pack.rowspan !== null ? '1px solid white' : ''}">
          {{pack.pctStr}}
        </td>
        <td :style="{borderTop: pack.rowspan !== null ? '1px solid white' : ''}">
          <div class="flex">
            <div class="icon-64x64" style="margin-top: -2px; width: 24px; height: 24px;">
              <div class="genericMap-marker" :class="'pokemon-p' + pack.speciesNum"></div>
            </div>
            <span v-html="pack.desc"></span>
          </div>
        </td>
        <td v-show="onJmonClicked && showClickMon(pack)" :style="{borderTop: pack.rowspan !== null ? '1px solid white' : ''}">
          <div @click="onMonClicked(pack)" style="text-align:center;cursor:pointer;border:1px solid white">🔍</div>
        </td>
      </tr>
    </table>
  </div>
</div>

