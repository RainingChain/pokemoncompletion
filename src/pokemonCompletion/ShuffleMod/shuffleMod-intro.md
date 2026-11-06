<h2 class="pokemon-title">
       <a href="/completion/shuffle"><span>Pokémon Shuffle</span></a><span>▸</span><span>Special stages DLC</span>
     </h2>

This page contains a web tool to inject the Special stages DLC into the original 3DS Pokémon Shuffle game file.

Those Special stages were originally available for download in 3DS eShop. Unfortunately, it is no longer possible to obtain them by official means since the eShop closure in 2023.

<img id="img_map" class="shuffle-image">

<!-- ################### -->

#### DLC Features:

- Access to all [Special stages](https://bulbapedia.bulbagarden.net/wiki/Special_stage), repeating on a [24-week schedule](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Shuffle_event_cycle) (Competitive stage, Daily Pokémon, Escalation battle, Great Challenge, High-Speed Challenge, One Chance a Day!, Pokémon Safari, Resource events, Special Challenge, UB Challenge).
- This increases the number of catchable Pokémon from 584 to 975, the number of Mega Stones from 34 to 48, and the maximum Trainer Rank from 22 to 30.
- Completing Mission Card #3 is now possible.
- The number of Mega Speedup, Raise Max Level, Level Up, Skill Booster, and Skill Swapper is no longer limited. All Pokémon can now be fully upgraded.

<!-- ################### -->

#### Notable differences with the original game:

- Competitive stages have been converted into boss stages. When defeated, they give their respective Mega Stone. Their HP is based on a F-Class (30% percentile) cutoff of the last live service competition. In the original game, their Mega Stone would be awarded based on a H-Class (50% percentile) cutoff.
- Changing the 3DS clock won't remove access to the Special stages. In the original game, changing the 3DS clock (or changing the battery) would permanently prevent access to the Special stages.
- It is not possible to obtain the 12 Pikachu Celebration Pokémon. To obtain them, use the [Event Simulator](/completion/Shuffle) instead.
- [Complete changelog](https://github.com/SaltedNeos/shuffle-preservation-mod/releases/tag/v1.2)

<!-- ################### -->

### How to play Pokémon Shuffle with the DLC on emulator:

- Step 1: Locate the required files.
- Step 2: Inject the DLC in the game file.
- Step 3: Adapt your save data file.
- Step 4: Enjoy!

An alternative installation procedure for 3DS is detailed [here.](https://github.com/SaltedNeos/shuffle-preservation-mod)

##### Step 1: Locate the required files.

1. Original Pokémon Shuffle game file:

   - Title ID: 0004000000141000
   - Version: 5.6.0 (5216)
   - Size: 89.27 MiB
   - Product Code: CTR-N-KRXA
   - SHA-256 Hash: 9c801679d4a37a1a28d259ac7aee950b00383bbebfb4513350114a1c6d9a345f
2. Pokémon Shuffle save data file: `savedata.bin`

   - To get that file, install the original Pokémon Shuffle game file on the [Azahar emulator.](https://github.com/azahar-emu/azahar)
   - Play the game shortly, then close the game.
   - If you are on PC, in the Installed Titles in Azahar, right-click Pokémon Shuffle, and select "Open → Save Data Location".
   - If you are on Android, click and hold the Pokémon Shuffle game label. Click the "Directory" icon next to "➤ Play" and select "Open Save Data Folder".
   - Note: The file is located at `<EMULATOR>/sdmc/Nintendo 3DS/00000000000000000000000000000000/00000000000000000000000000000000/title/00040000/00141000/data/00000001/savedata.bin`

##### Step 2: Inject the DLC in the game file.

1. Click the "Load .cia" button below and select `0004000000141000 Pokémon Shuffle (CTR-N-KRXA) (v5.6.0) (W).cia`.
