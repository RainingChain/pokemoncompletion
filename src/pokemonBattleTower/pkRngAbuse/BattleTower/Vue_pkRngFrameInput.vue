<div>
  <h5>RNG Frames Calibration</h5>

  <p v-if="nodeInputType !== NodeInputType.advancedMode" >
    <label><input v-model="usingDeadBattery" type="checkbox" @change="updateFrameRangeInputs()"> Using Dead Battery?</label>
  </p>
  <div>
    <label class="clickable"><input type="radio" :value="NodeInputType.x5" v-model="nodeInputType" @change="updateFrameRangeInputs()"> x5 A-press per second</label>
    <label class="clickable"><input type="radio" :value="NodeInputType.x60" v-model="nodeInputType" @change="updateFrameRangeInputs()"> x60 A-press per second (Autofire)</label>
    <label class="clickable"><input type="radio" :value="NodeInputType.advancedMode" v-model="nodeInputType" @change="hasClickedRngCalibAdvancedMode = true,updateFrameRangeInputs()"> Advanced Mode</label>
  </div>

  <div v-if="hasClickedRngCalibAdvancedMode || nodeInputType === NodeInputType.advancedMode">
    <table class="input-table">
      <tr><th></th><th>Min</th><th>Max</th><th>Probability Distribution</th></tr>

      <tr>
        <td>Frames Before {{facility !== Facility.pyramid ? 'Trainer Selection Battle' : 'Floor'}} #1:</td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="beforeTrainer_1stBattle.min" type="number" min="0"></td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="beforeTrainer_1stBattle.max" type="number" min="0"></td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="beforeTrainer_1stBattle.distr"></td>
        <td v-if="facility === Facility.tower"><label>
          <input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="includesFramesInElevator" type="checkbox"> Includes Frames in Elevator?
        </label></td>
        <td v-if="facility === Facility.palace"><label>
          <input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="includesFramesInElevator" type="checkbox"> Includes Old Man Speech?
        </label></td>
      </tr>

      <tr>
        <td>Frames Before {{facility !== Facility.pyramid ? 'Trainer Selection Battle' : 'Floor'}} #2-7:</td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="beforeTrainer_2ndBattle.min" type="number" min="0"></td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="beforeTrainer_2ndBattle.max" type="number" min="0"></td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="beforeTrainer_2ndBattle.distr"></td>
        <td v-if="facility === Facility.tower"><label>
          <input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="includesFramesInElevator" type="checkbox"> Includes Frames in Elevator?
        </label></td>
        <td v-if="facility === Facility.palace"><label>
          <input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="includesFramesInElevator" type="checkbox"> Includes Old Man Speech?
        </label></td>
      </tr>

      <tr v-if="facility !== Facility.pyramid && facility !== Facility.factory">
        <td>Frames Between Trainer and 1st Pokemon Selection:</td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="beforeMon1.min" type="number" min="0"></td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="beforeMon1.max" type="number" min="0"></td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="beforeMon1.distr"></td>
        <td colspan="3"><label>
          <input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="includesFramesStartSpeech" type="checkbox"> Includes Frames of the Greeting Speech?
        </label></td>
      </tr>

      <tr v-if="facility === Facility.pike">
        <td>Frames Between Trainer and 1st Pokemon Selection (Hard Battle):</td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="pike_beforeMon1_hardBattle.min" type="number" min="0"></td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="pike_beforeMon1_hardBattle.max" type="number" min="0"></td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="pike_beforeMon1_hardBattle.distr"></td>
        <td colspan="3"><label>
          <input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="includesFramesStartSpeech" type="checkbox"> Includes Frames of the Greeting Speech?
        </label></td>
      </tr>

      <tr v-if="facility !== Facility.pyramid && facility !== Facility.factory">
        <td>Cycle Count at 1st Pokemon Selection:</td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="cycleMon1Id.min" type="number" min="0"></td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="cycleMon1Id.max" type="number" min="0"></td>
        <td><input :disabled="nodeInputType !== NodeInputType.advancedMode" v-model="cycleMon1Id.distr"></td>
      </tr>
    </table>
  </div>
  <p v-if="inputError" style="color:red">
    {{inputError}}
  </p>
</div>