<div id="view-sidebar" style="padding:15px;overflow-x:hidden">
  <div style="height:calc(100% - 100px)">
    <h4>Display Settings</h4>
    <p v-if="isSilksong">
      <label>
        <input type="checkbox" v-model="displayAct3" @change="onChange"> Display Act 3 exclusive icons?
      </label>
    </p>
    <p v-if="isSilksong">
      <label>
        <input type="checkbox" v-model="displaySteelSoul" @change="onChange"> Display Steel Soul exclusive icons?
      </label>
    </p>
    <div style="margin-bottom:15px;"> <!-- <p> can't include div -->
      <label>
        <input type="checkbox" v-model="displayIconLabels" @change="onChange"> Display Icon Labels?
      </label>
      <div v-if="isSilksong" style="margin-left:20px;font-size:0.8em">Ex: A3 for Act 3 exclusive icons, SS for Steel Soul exclusive.</div>
      <div v-if="isHk" style="margin-left:20px;font-size:0.8em">Ex: M for missable icons.</div>
    </div>
    <p>
      <label>
        <input type="checkbox" v-model="semiTransparentMap" @change="onChange"> Semi-Transparent Map Image
      </label>
    </p>
    <p>
      <label>
        <input type="checkbox" v-model="hideObtainedIcons" @change="onChange"> Fully Hide Obtained Elements
      </label>
    </p>
    <p v-if="hasMapLabels">
      <label>
        <input type="checkbox" v-model="displayMapLabels" @change="onChange"> Display Area Names
      </label>
    </p>
    <p v-if="hasMapLinks">
      <label>
        <input type="checkbox" v-model="displayMapLinks" @change="onChange"> Display Area Connection Lines
      </label>
    </p>
    <p v-if="hasMapEdges">
      <label>
        <input type="checkbox" v-model="displayMapEdges" @change="onChange"> Display Map Edges
      </label>
    </p>
    <p v-if="hasMapEdges && displayMapEdges" style="padding-left:20px">
      <label>
        <input type="checkbox" v-model="semiTransparentMapEdges" @change="onChange"> Semi-Transparent Map Edges
      </label>
    </p>

    <p>
      <button @click="reset">Reset to default</button>
    </p>

  </div>
</div>