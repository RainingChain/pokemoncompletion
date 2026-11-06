<h2 class="pokemon-title">
      <a href="/articles"><span>Pokémon Articles</span></a><span>▸</span><span>State of Emulation</span>
    </h2>

This page indicates what is missing to be able to emulate all features related with Pokémon games.

### Summary

<table>
<tr>
<th>Limitation</th>
<th>Impact</th>
<th>Complexity</th>
<th>Workaround</th>
<th>Status</th>
</tr>
<tr>
<td><a href="https://github.com/mgba-emu/mgba/issues/2690" target="_blank" rel="noopener">GBC-to-GBC Infrared</a></td>
<td class="c-small">Small</td><td class="c-small">Small</td>
<td><a href="https://github.com/RainingChain/PkCompletionist" target="_blank" rel="noopener">Yes</a></td>
<td></td>
</tr>
<tr>
<td><a href="https://gbatemp.net/threads/has-pocket-pikachu-1-and-or-2-ever-been-emulated.610007/" target="_blank" rel="noopener">  Pokémon Pikachu 2 GS Emulator</a></td>
<td class="c-small">Small</td><td class="c-large">Very Large</td>
<td>None</td>
<td></td>
</tr>
<tr>
<td><a href="https://github.com/mgba-emu/mgba/issues/472" target="_blank" rel="noopener"> GBA Wireless Adapters</a></td>
<td class="c-large">Large</td><td class="c-large">Large</td>
<td>None</td>
<td><a href="https://www.davidgf.net/2024/01/13/gba-wireless-adapter/" target="_blank" rel="noopener">Now supported!</a></td>
</tr>
<tr>
<td><a href="https://forums.dolphin-emu.org/Thread-ds-connectivity-in-dolphin" target="_blank" rel="noopener">DS-Wii Connectivity</a></td>
<td class="c-medium">Medium</td><td class="c-large">Large</td>
<td><a href="https://github.com/RainingChain/PkCompletionist/issues/3" target="_blank" rel="noopener">In Progress</a></td>
<td></td>
</tr>
<tr>
<td><a href="https://github.com/RainingChain/PkCompletionist/issues/2" target="_blank" rel="noopener">DS-PokéWalker Connectivity</a></td>
<td class="c-small">Small</td><td class="c-medium">Medium</td>
<td><a href="https://github.com/RainingChain/PkCompletionist/issues/2" target="_blank" rel="noopener">In Progress</a></td>
<td></td>
</tr>
<!--<tr>
<td>Pokémon Ranger Event Injection</td><td class="c-medium">Medium</td><td class="c-medium">Medium</td>
</tr>-->
</table>

<!--
    <h3>Generation 1</h3>
    <div>
      <h4>N64 TransferPak Save State</h4>
      <div>
        <p>Project64 doesn't support save states when using TransferPak.</p>
        <p>Impact: Small. </p>
        <p class="indented">More difficult to research and debug assembly.</p>
        <p>Complexity to support: Small</p>
        <p>To contribute: ???</p>
      </div>
    </div>
    -->

### Generation 2

#### GBC-to-GBC Infrared

mGBA doesn't support Infrared. GBE+ does support it, but the performance is very poor, making it pratically unusable.

Infrared is required to obtain all decorations on the same savefile via Mystery Gift.

Check support progress: <a href="https://github.com/mgba-emu/mgba/issues/2690" target="_blank" rel="noopener">mGBA GitHub</a>

Workaround:

Using Mystery Gift Simulator from [PkCompletionist](github.com/RainingChain/PkCompletionist).

#### Pokémon Pikachu 2 GS Emulator

There are no emulators for Pokémon Pikachu 2 GS. In fact, the ROM has never been dumped.

All items given by Pokémon Pikachu 2 GS can be obtained elsewhere.

<!-- -->

### Generation 3

#### GBA Wireless Adapters

Since 2024-01-13, GBA Wireless Adapters is fully supported on [gpSP emulator](https://github.com/davidgfnet/gpsp).

mGBA doesn't support it.

<!-- -->

### Generation 4

#### DS-Wii Connectivity

The emulators melonDS (DS) and Dolphin (Wii) can't communicate.

Unable to transfer Mew and Phione from My Pokémon Ranch (Wii) to Diamond/Pearl/Platinum (DS). It is the only non-discontinued method to obtain Mew. Note: Phione can be obtained by breeding Manaphy obtained from Pokémon Ranger US.

Check limitation status: <a href="https://forums.dolphin-emu.org/Thread-ds-connectivity-in-dolphin" target="_blank" rel="noopener">Dolphin Forum</a>

Workaround:

Simulator Tool that transfers Pokémons and items by reading and modifying savefiles.

Check workaround status on <a href="https://github.com/RainingChain/PkCompletionist/issues/3" target="_blank" rel="noopener">PkCompletionist GitHub</a>

#### DS-PokéWalker Connectivity

The emulators melonDS (DS) and Powar (PokéWalker) can't communicate. It is not possible to use routes unlocked by events.

All items given by PokéWalker can be obtained elsewhere.

Check limitation status: <a href="https://github.com/UnrealPowerz/powar/issues/2" target="_blank" rel="noopener">Powar Github</a>

Workaround:

Simulator Tool that transfers Pokémons and items by reading and modifying savefiles.

Check workaround status on <a href="https://github.com/RainingChain/PkCompletionist/issues/2" target="_blank" rel="noopener">PkCompletionist GitHub</a>

<!--
      <h4>Pokémon Ranger Event Injection</h4>
      <div>
        <p>No tools exist to inject discontinued events to Pokémon Ranger: Shadows of Almia and Pokémon Ranger: Guardian Signs.</p>
        <p>Impact: Medium. </p>
        <p>Those events give Manaphy, Darkrai, Deoxys and Shaymin. Manaphy can be obtained from Pokémon Ranger US without requiring discontinued events. Darkrai, Deoxys and Shaymin can be obtained in Platinum using items obtained from other discontinued events.</p>

        <p>Complexity to support: Medium</p>
        <p>Complexity to create a workaround: Small (Simulator Tool that transfer Pokémons and items by reading and modifying savefiles.)</p>
      </div>
      -->

<!-- -->
