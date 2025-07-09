

<div class="root-container">
<div>Settings: Check MIN_DMG_PCT, initSelfPks, dangerousItems, ohkoPreventItems, getBattleSubwaySelfPokemon</div>
<h2>In console</h2>
<ul style="font-size:1.5em">
  <li>
    ph.allRatings_as_str(await ph.evalAllRatings())
    <ul><li>Returns in format used by RngTool.exe</li></ul>
  </li>
  <li>ph.selfPks.findIndex(a => a.getDesc() === "Latios, Modest, Life Orb, Psychic,Dragon Pulse,Surf,Thunderbolt")</li>
  <li>debug(ph.evalRating)</li>
  <li>ph.evalRating(ph.selfPks[179], ph.trainerPks[360 * 2])</li>
  <li>
    ph.evalRatings(ph.selfPks[0])
    <ul><li>For debugging specific mon</li></ul>
  </li>
  <li>
    ph.evalRatings(ph.selfPks[0]).toJsonString()
    <ul><li>Returns in format used by RngTool.exe</li></ul>
  </li>
  <li>
    await ph.evalAllRatings()
    <ul><li>For debugging all mon</li></ul>
  </li>
</ul>
</div>