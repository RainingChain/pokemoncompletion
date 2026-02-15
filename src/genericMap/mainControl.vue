<div class="leaflet-control-layers leaflet-control" :class="{'leaflet-control-layers-expanded':extended}">
  <a class="leaflet-control-layers-toggle" href="#" title="Layers" role="button" @click="extend"></a>

  <div v-show="extended" class="leaflet-control-layers-list">
    <div style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px;"><span
        class="glyphicon glyphicon-remove" @click="collapse" style="font-size: 20px; cursor: pointer;"></span>
    </div>

    <div v-if="overlays.length > 1" style="padding-bottom:10px">
      <label v-for="ov in overlays">
        <input type="radio" :value="'' + ov.idx" v-model="selectedOverlayIdxStr" @change="onOverlayInputChanged">
        {{ov.config.name}}
        <br>
      </label>
    </div>

    <div class="leaflet-bar" style="margin-bottom: 10px; display: flex; width: 80%;">
      <div class="glyphicon glyphicon-eye-open" style="margin-top: 8px; margin-left: 8px;"></div> <button
        class="genericMap-displaySettingsBtn" style="width: 100%;" @click="onclickDisplaySettings">Display Settings</button>
    </div>

    <div>
      <div class="leaflet-bar" style="text-align: center; margin-bottom: 5px; display: inline-block; width: 45%;">
        <button type="button" @click="showAll"
          style="margin: 0px; line-height: 20px; width: 100%; height: 25px;"><span>All</span></button>
      </div>
      <div class="leaflet-bar" style="text-align: center; margin-bottom: 5px; display: inline-block; width: 45%;">
        <button type="button" @click="hideAll"
          style="margin: 0px; line-height: 20px; width: 100%; height: 25px;"><span>None</span></button>
      </div>
    </div>

    <div>
      <label v-for="lay in toggleableLayers" style="white-space:nowrap;">
        <input type="checkbox" class="leaflet-control-layers-selector" v-model="lay.isShown"
          @change="clickLayerGroup(lay)">
        <span>
          <span class="div-h">
            <div v-html="lay.iconHtml"></div> {{lay.name}}
          </span>
        </span>
      </label>
    </div>

    <datalist id="genericMap-search-list">
      <option v-for="d in searchDataList" :value="d.value">{{d.name}}</option>
    </datalist>

    <div id="genericMap-search" class="flex" style="margin-top: 10px;">
      <div style="width:30px;align-items:center;" class="flex">
        <div v-if="!searchValue" style="font-size:1.2em">🔍</div>
        <button v-else="" @click="stopSearch">❌</button>
      </div>
      <div style="width:calc(100% - 30px);">
        <input style="width:100%" @change="onSearchInputChange" v-model="searchValue" list="genericMap-search-list"
          placeholder="Search...">
      </div>
    </div>

    <div style="margin-top:10px" v-if="hasSaveFlagEvaluator" class="leaflet-bar">
      <button style="width:100%" @click="onclickLoadSavefile(event)">Load save file to mark icons</button>
    </div>
  </div>
</div>