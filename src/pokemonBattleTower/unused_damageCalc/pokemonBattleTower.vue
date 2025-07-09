

<div class="root-container">

<h2>Pokémon {{gameName}} Battle Tower</h2>

<div>
  <label>
    Only 29+ Wins Pokémons
    <input type="checkbox" v-model="only29WinsTrainers" @change="updateVisibility" />
  </label>
</div>
<div>
  Trainer Filter:
  <input v-model="trainerFilter" @keyup="onFilterChanged(true, $event)" />
</div>
<div>
  Pokémon Filter:
  <input v-model="pokemonFilter" @keyup="onFilterChanged(false, $event)" />
</div>

<br>
<br>

<div>
  <h3>Player Team</h3>
  <table>
    <tr v-for="pk in vue_selfPks" is="selfPokemon-one" :self="pk"></tr>
  </table>
</div>

<br>
<br>

<div>
  <h3>Trainer Pokémons</h3>
  <table>
    <tr>
      <td>Name</td>
      <!--<td :colspan="selfPks.length">Flags</td>-->
      <td :colspan="selfPks.length">OutSpd</td>
      <td :colspan="selfPks.length" title="Assumes Min Roll">Dmg%<br>FromYou</td>
      <td :colspan="selfPks.length" title="Assumes Crit and Max Roll">Dmg%ToYou</td>
      <td>Item</td>
      <td colspan="4">Moves</td>
      <td>Comment</td>
    </tr>
    <tr v-for="pk in trainerPks" is="pokemon-one" :self="pk"></tr>
  </table>
</div>

<div class="container">
  <p>Data from <a href="https://www.smogon.com/" target="_blank" rel="noopener">https://www.smogon.com/</a>.</p>
  <p>
  <p>
    Contact me: RainingChain on <a target="_blank" rel="noopener" href="https://discord.gg/FZf9WNZZ"> Scripters War Discord</a>.
  </p>
</div>

</div>