
<tr>
  <td>{{name}}</td>
  <td>{{itemName}}</td>
  <td v-for="(move,i) in moves" :style="{'border-left':i === 0 ? '1px solid grey' : ''}">
    {{move}}
  </td>
  <td :title="statDesc">
    {{nature}}
  </td>
</tr>