<div>
  <div style="padding:5px 0px">
    <div style="display: flex">
      <div>Mode:</div>
      <div style="padding-left:20px">
        <div style="padding-bottom:5px"><label class="clickable"><input type="radio" :value="Mode.layouts" v-model="mode"> Display the 16 possible 8x8 layouts with all items and trainers</label></div>
        <div style="padding-bottom:5px"><label class="clickable"><input type="radio" :value="Mode.oneRng" v-model="mode"> Generate the floor for a given RNG advance count</label></div>
        <div style="padding-bottom:5px"><label class="clickable"><input type="radio" :value="Mode.findFloor" v-model="mode"> Find the floor matching what's visible in-game (RNG Manip)</label></div>
      </div>
    </div>
  </div>

  <div v-if="mode === Mode.findFloor">
    <h5>
      <span  @click="displayHowToUse = !displayHowToUse, saveToLocalStorage()">
        {{displayHowToUse ? '▼' : '▶'}} How To Use
      </span>
    </h5>
    <div v-if="displayHowToUse">
      <ul>
        <li>Make sure that you Rest next to the exit tile, <span style="font-weight: bold">facing in its direction.</span> Press A and hold the correct direction to enter the exit as fast as possible.
          <ul>
            <li>Optionally, on mGBA emulator, Tools -> Settings -> Shortcuts -> Tools -> Autofire -> Autofire A.</li>
            <li>If not using Autofire A, make sure to play at regular (100%) speed and press A as fast as possible.</li>
          </ul>
        </li>
        <li>In the Input section, enter the number of completed floor since the very beginning.</li>
        <li>Draw the tiles that are visible in-game, by selecting a tile type then clicking on ? tiles.</li>
        <li>Click "Find Matching Floor" to display the list of possible floors.</li>
        <li>In case multiple floors are possible, partial results will be displayed.
          <ul>
            <li>A semi-transparent trainer tile indicates at least one possible floor has a trainer on that tile. </li>
            <li>The more opaque the trainer is, the more likely the trainer is there.</li>
          </ul>
        </li>
      </ul>
      <p style="padding-left:10px">
        <span style="font-weight:bold">Video demo:</span> <a href="https://www.youtube.com/watch?v=FxikFvUPnEk" target="_blank" rel="noopener">https://www.youtube.com/watch?v=FxikFvUPnEk</a>
      </p>
    </div>
  </div>


  <h3>Input</h3>
  <div v-show="mode === Mode.findFloor">
    <table style="padding-bottom:10px">
      <tr style="padding:5px 0px" class="display:flex">
        <td>Total Completed Floor Count:</td>
        <td><input type="number" v-model="winStreak"  style="margin:0px" min="0"></td>
        <td><span style="padding-left:10px">Attempting RNG manipulation of Round {{Math.floor(+winStreak / 7) + 1}}, Floor {{(+winStreak % 7) + 1}}</span></td>
      </tr>
    </table>
    <div is="Vue_pkRngFrameInput" v-bind="{
      saveToLocalStorage:saveToLocalStorage,
      facility:Facility.pyramid,
    }" ref="rngCalib"></div>
    <br>

    <div style="display:flex;padding-bottom:5px">
      <div style="margin-right:30px;font-size:1.5em;">Select tile:</div>
      <div v-for="(tile,i) in selectableTiles">
        <kbd>{{i + 1}}</kbd>
        <div :style="{border:'2px solid ' + (tile === selectedTile ? 'white' : 'rgba(0,0,0,0)')}" @click="selectedTile = tile" style="margin-right:5px;margin-top:3px;cursor:pointer;box-sizing:content-box;" class="selectableInputTile" :class="tile === TileType.trainer ? 'trainerOnTile' : tile"></div>
      </div>
      <button style="height:40px;margin:0px;margin-left:40px" @click="clearInputGrid(false)">Clear All</button>
      <button style="height:40px;margin:0px;margin-left:40px" @click="clearInputGrid(true)">Clear and Increment Floor</button>
    </div>

    <div class="myTable" v-if="!(displayOutput && floorFoundCount === 1)">
      <div v-for="row in inputTiles" style="user-select: none;">
        <div v-for="tile in row" @mousedown="onClickTile(tile)" @mouseover="onMouseoverTile($event, tile)"
         :class="getInputTileClass(tile)">
          <div v-if="tile.type === TileType.unknown && tile.trainerProb > 0" :style="{opacity:0.1 + tile.trainerProb * 0.6}" class="trainerTile-sub subTile"></div>
          <div v-if="tile.type === TileType.unknown && tile.itemProb > 0" :style="{opacity:0.1 + tile.itemProb * 0.6}" class="itemNoTile subTile"></div>
          <div v-if="tile.inTrainerRangeProb > 0" :style="{opacity:0.3 + tile.inTrainerRangeProb * 0.7}" class="inTrainerRange subTile"></div>
        </div>
      </div>
    </div>
  </div>

  <table v-if="mode === Mode.oneRng">
    <tr style="padding:5px 0px">
      <td>Total Completed Floor Count:</td>
      <td><input type="number" v-model="winStreak" style="margin:0px" min="0"></td>
      <td><span style="padding-left:10px">Attempting RNG manipulation of Round {{Math.floor(+winStreak / 7) + 1}}, Floor {{(+winStreak % 7) + 1}}</span></td>
    </tr>
    <tr style="padding:5px 0px">
      <td>RNG Advance Count:</td>
      <td><input type="number" v-model="rngAdvCount" style="margin:0px" min="0"></td>
    </tr>
  </table>
  <div v-if="mode == Mode.oneRng">
    <button @click="generate">Generate</button>
  </div>
  <div v-if="mode === Mode.findFloor && !(displayOutput && floorFoundCount === 1)">
    <button @click="generate">Find Matching Floor</button>
  </div>

  <div v-if="mode === Mode.findFloor && floorFoundCount === 0" style="font-size: 1.5em;color:red">
    Error: No floors were found that match the provided input. <br>
    Either the provided input is invalid, or the RNG advance when the floor was generated in-game is outside the RNG advance range in the input section.<br>
    Make sure to Rest right next to the exit tile. Mash A and hold the correct direction to enter the exit as fast as possible.
  </div>
  <div v-if="mode === Mode.findFloor && floorFoundCount > 1" style="font-size: 1.2em;" :title="floorFoundCount_title">
    {{floorFoundCount}} floors were found that match the provided input.<br>
    Provide additional tiles to narrow the results.
  </div>

  <br>
  <h3 :title="floorFoundCount === 1 ? floorFoundCount_title : ''">Output</h3>
  <div v-if="displayOutput">
    <div class="myTable" :class="{withSquareBorder:mode === Mode.layouts}">
      <div v-for="row in tiles">
        <div v-for="tile in row" :class="tile.type">
          <div v-if="tile.type === TileType.trainer" :style="{transform:'rotate(' + tile.rotateDeg + 'deg)'}" :class="'trainer-' + tile.trainerGraphicId"></div>
          <div v-if="tile.inTrainerRange" class="inTrainerRange"></div>
          <div v-if="tile.type === TileType.trainer" class="trainer-sight">{{tile.sight}}</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    No output yet.
  </div>
</div>
