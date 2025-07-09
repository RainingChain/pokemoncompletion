
<div style="padding:2px; margin-bottom: 20px;" :style="{border:isActiveBattle ? '2px solid white' : '2px solid rgba(255,255,255,0.2)'}" class="smaller-pk-icons">
  <div>
    <span @click="hideVtmon($props)" style="cursor:pointer;border:1px solid rgba(255,255,255,0.5)">❌</span>
    <span>#{{displayIdx}} {{isActiveBattle}}: </span>
    <span :title="nature + ', ' + statValsDesc">{{name}}
      (<span v-for="(ab,i) in abilitiesUsefulness" :style="{opacity:ab.useful ? '1' : '0.8'}"><span v-if="i !== 0">, </span>{{ab.name}}</span>)
    </span> <span :style="{color:itemDangerousColor}">@{{itemName}}</span>,
    <span :style="{color:effectiveSpeed >= vpmon.effectiveSpeed ? 'red' : ''}">{{effectiveSpeed}} Speed</span>
  </div>
  <div>
    <div style="padding-bottom:5px">
      <div class="flex">
        <div class="icon-64x64" style="margin-top:-2px;width: 24px; height: 24px;"><div class="genericMap-marker" :class="'pokemon-p' + speciesId"></div></div>
        <div><span class="trainerColor">{{stmon.species.name}}</span> attacking <span class="playerColor">{{vpmon.name}}</span> (<span>{{vpmon.currentHpPct}} HP</span>): </div>
      </div>
      <table style="padding-left:10px">
        <tr v-for="mov in trainerMovesAgainstPlayer">
          <td><span :style="{color:mov.color}">{{mov.displayName || mov.name}}</span><span v-if="mov.priority > 0" :style="{color:'orange'}"> (P{{mov.priority}})</span>:</td>
          <!--<td style="padding-right:5px;padding-left:5px" :style="{color:playerHasLumBerry ? '' : 'orange'}">{{mov.statusStr}}</td>-->
          <td style="padding-right:5px;padding-left:5px">{{mov.dmgText}}</td>
          <td v-if="mov.hkoText" style="border-left:1px solid white;padding-left:5px" :title="mov.hkoTitle" v-html="mov.hkoText"></td>
        </tr>
      </table>
    </div>

    <div>
      <div class="flex">
        <div class="icon-64x64" style="margin-top:-2px;width: 24px; height: 24px;"><div class="genericMap-marker" :class="'pokemon-p' + vpmon.speciesId"></div></div>
        <div><span class="playerColor">{{vpmon.name}}</span> attacking <span class="trainerColor">{{stmon.species.name}}</span> (<span>{{trainerMaxHpApprox}} HP</span>): </div>
      </div>
      <table style="padding-left:10px">
        <tr v-for="mov in playerMovesAgainstTrainer">
          <td :style="{color:mov.color}">{{mov.displayName || mov.name}}:</td>
          <td style="padding-right:5px;padding-left:5px">{{mov.dmgText}}</td>
          <td v-if="mov.hkoText" style="border-left:1px solid white;padding-left:5px" :title="mov.hkoTitle" v-html="mov.hkoText"></td>
        </tr>
      </table>
    </div>
  </div>
</div>