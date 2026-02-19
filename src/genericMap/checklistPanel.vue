
<div>
  <p>
    <label>
      <input type="checkbox" v-model="hideObtained">
      Hide obtained elements
    </label>
  </p>

  <div v-if="hasVisibiblePermanentlyMissable()" style="padding-bottom:20px">
    <span @click="permanentlyMissableExpanded = !permanentlyMissableExpanded">
      <h5> {{permanentlyMissableExpanded ? '▼' : '▶'}} Permanently Missable:</h5>
    </span>

    <table v-if="permanentlyMissableExpanded">
      <tr v-for="p in permanentlyMissableList" v-if="!hideObtained || !allCollectablesAreMarked(p.collectables)" :class="{'permanentlyMissable-obtained':allCollectablesAreMarked(p.collectables)}">
        <td>
          <span class="bold">{{p.name}}:</span> <span style="font-size:0.9em">{{p.desc}}</span>
        </td>
        <td>
          <div v-if="p.collectableHasPositionByOverlay[gmap.activeOverlayIdx]" @click="flyToPermMiss(p)" class="flyToPin">📍</div>
        </td>
      </tr>
    </table>
  </div>

  <h5>Checklist:</h5>
  <div v-for="cat in categories" style="padding-bottom:10px">
    <span @click="cat.expanded = !cat.expanded">
      {{cat.expanded ? '▼' : '▶'}}
      {{cat.name}} ({{getObtainedCount(cat)}} / {{cat.list.length}})
    </span>

    <table class="table" style="text-align:left;padding-bottom:20px;" v-if="cat.expanded">

      <tr v-for="col in cat.list" v-if="col.isVisible() && (!hideObtained || !col.marked)">
        <td>
          <input v-model="col.marked" type="checkbox" @change="onColChange(col)"/>
        </td>
        <td>
          {{col.name}}
        </td>
        <td>
          <div v-if="col.markerByOverlay[gmap.activeOverlayIdx]" @click="flyTo(col)" class="flyToPin">📍</div>
        </td>
      </tr>
    </table>
  </div>
</div>
