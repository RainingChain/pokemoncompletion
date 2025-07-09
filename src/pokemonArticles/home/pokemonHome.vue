
<div class="root-container">
<div v-if="loc === 'completion'">
  <h2 class="pokemon-title">
    <a href="/"><span>Pokémon</span></a><span>▸</span><span>100% Checklist</span>
  </h2>
  <div>The goal is to collect everything possible in a specific Pokémon game.<br></div>
  <br>
  <h4>Main Series</h4>
  <ul style="margin-top:0px">
    <li is="pokemon-link" v-for="c in completionMain" v-bind="c"></li>
  </ul>
  <br>
  <h4>Spin-Off Games</h4>
  <ul style="margin-top:0px">
    <li is="pokemon-link" v-for="c in completionSide" v-bind="c"></li>
  </ul>
</div>

<div v-if="loc === 'versioncompatibility'">
  <h2 class="pokemon-title">
    <a href="/"><span>Pokémon</span></a><span>▸</span><span>Version Compatibility</span>
  </h2>
  <div>Compatibility between Pokémon game versions, accessories, and consoles for each generation.<br></div>

  <ul>
    <li is="pokemon-link" v-for="c in versionCompatibility" v-bind="c"></li>
  </ul>
</div>


<div v-if="loc === 'articles'">
  <h2 class="pokemon-title">
    <a href="/"><span>Pokémon</span></a><span>▸</span><span>Articles</span>
  </h2>
  <div>Various exploits, RNG manipulation, world records, trivia<br></div>
  <ul>
    <li is="pokemon-link" v-for="c in articles" v-bind="c"></li>
  </ul>
</div>


<div v-if="loc === 'battlefacilities'">
  <h2 class="pokemon-title">
    <a href="/"><span>Pokémon</span></a><span>▸</span><span>Battle Facilities</span>
  </h2>
  <div>Guides and RNG manipulation tools for Battle Facilities<br></div>
  <ul>
    <li is="pokemon-link" v-for="c in battleFacilities" v-bind="c"></li>
  </ul>
</div>

<hr v-if="loc !== 'home'">
<br v-if="loc !== 'home'">
<h2 v-if="loc === 'home'">Pokémon Projects</h2>
<h4 v-else>Other Pokémon Projects</h4>
<ul style="margin-top:0px">
  <li is="pokemon-link" v-if="loc !== 'completion'" v-bind="projects.completion"></li>
  <li is="pokemon-link" v-if="loc !== 'battlefacilities'" v-bind="projects.battleFacilities"></li>
  <li is="pokemon-link" v-if="loc !== 'versioncompatibility'" v-bind="projects.versionCompatibility"></li>
  <li is="pokemon-link" v-if="loc !== 'articles'" v-bind="projects.articles"></li>
</ul>
<br>
<div v-if="loc === 'home'">
  <h3>Currently working on</h3>
  <ul>
    <li>Pokémon Platinum RNG manipulation for Battle Tower Single and Double</li>
    <li>Pokémon Platinum simulated events</li>
    <li>Pokémon Version Compatibility Generation IV</li>
    <li>Pokémon Ranger Almia 100% Checklist</li>
    <li>Pokémon Black 2 interative map</li>
    <li>Pokémon Black 2 hardware/requirement list</li>
  </ul>
</div>

<div v-if="loc === 'home'">
  <h3>Changelog</h3>
  <ul>
    <li>2025-07-06: The website is now hosted on pokemoncompletion.com.</li>
    <li>2025-06-30: <a href="/articles/GamePreservation">Pokémon Game Preservation</a></li>
    <li>2025-06-25: <a href="/completion/shuffle/dlc">Pokémon Shuffle Special Stages DLC</a></li>
    <li>2025-06-20: <a href="/completion/shuffle">Pokémon Shuffle 100% Completion Checklist</a></li>
    <li>2025-03-30: <a href="/BattleFacilities/Emerald/Guide">Pokémon Emerald 100% Completion Guide</a></li>
    <li>2025-03-30: <a href="/BattleFacilities/Emerald/Guide/RNG">Pokémon Emerald 100% Completion RNG Manipulation Guide</a></li>
    <li>2025-03-23: <a href="/BattleFacilities/Platinum/RngManipulation">Pokémon Platinum RNG Manipulation tool</a></li>
    <li>2025-03-23: <a href="/articles/Platinum_Battle_Tower_RNG_Manipulation">Pokémon Platinum RNG Manipulation article</a></li>
    <li>2025-03-19: New Pokémon website structure</li>
  </ul>
</div>

<div v-if="loc === 'home'" style="padding:10px;padding-top:30px;font-size:12px;">
    <p>Contact: RainingChain on <a target="_blank" rel="noopener" href="https://discord.com/invite/tMXrJzjWmg">Discord</a></p>
    <p><a href="/legal">Terms & Privacy</a></p>
    <p>Pokémon is a registered trademark of Game Freak, The Pokémon Company, and Nintendo. This website is not affiliated with Nintendo.</p>
</div>

</div>