

<tr v-show="isVisible">
  <td>{{battleTowerId}} {{name}} {{trainersSet.join(',')}}</td>
  <!--<td v-for="flag in flags">
    <input style="width:20px" :style="{backgroundColor:flag.color}" v-model="flag.value"></input>
  </td>-->
  <td v-for="(outSpd,i) in outSpds" :style="{'border-left':i === 0 ? '1px solid grey' : ''}">
    {{outSpd.value ? (i + 1) : ''}}
  </td>
  <td v-for="(dmg,i) in dmgsFromYou" :style="{backgroundColor:dmg.color,'border-left':i === 0 ? '1px solid grey' : ''}" :title="dmg.tooltip">
    {{dmg.value}}
  </td>
  <td v-for="(dmg,i) in dmgsToYou" :style="{backgroundColor:dmg.color,'border-left':i === 0 ? '1px solid grey' : ''}" :title="dmg.tooltip">
    {{dmg.value}}
  </td>
  <td :style="{backgroundColor:itemDangerous ? '#FFAAAA' : ''}">{{itemName}}</td>
  <td v-for="(move,i) in moves" :style="{backgroundColor:move.color,'border-left':i === 0 ? '1px solid grey' : ''}">
    {{move.name}}
  </td>
  <td :title="statDesc">
    {{nature}}
  </td>
  <td>
    <input v-model="comment"></input>
  </td>
</tr>