## Pokémon Black 2: Subway RNG Manipulation

### Summary

How to abuse RNG to face easy trainers in Pokémon White 2 and Black 2 Battle Subway.

### Tool

[PokemonB2W2BattleSubwayRNG](https://github.com/RainingChain/PokemonB2W2BattleSubwayRNG) is a tool that predicts the trainer pokemons you'll face depending on your initial RNG seed.

Special thanks to Admiral Fish for his PokéFinder project.

### Battle Subway RNG Mechanisms

The map where the player starts the Battle Subway has no wandering NPCs, which makes it perfect for RNG abuse.

Battle Subway only uses PID RNG to determine trainers and pokemons.

Upon loading the game, an initial seed and initial frame advance is determined based on the boot time, mac, ds type etc.

Afterwards, when starting the battle subway, the player must save the game, which advances the RNG frame by 1.

Then, the game selects 7 trainers. The game selects a pool of possible trainers based on the number of wins you'll have when reaching that trainer. The following info is for Super Single subway:

- 0-5 wins: Trainers with IDs 110-159
- 6-12 wins: Trainers with IDs 140-179
- 13-19 wins: Trainers with IDs 160-199
- 20-26 wins: Trainers with IDs 180-219
- 27 wins: Trainers with IDs 200-239
- 28-47 wins: Trainers with IDs 200-299
- 48 wins: Trainers with ID 307 (Boss)
- 49+ wins: Trainers with IDs 200-299

The formula used is

```text
Idx = ((((seed >> 32) >> 16) + (seed >> 32)) >> 16) % NumberOfTrainers;
```

If there is only 1 possible trainer (ex: at 48 wins), then the RNG frame is not advanced.

If the selected trainer has already been selected, a new roll is performed until an unused trainer is generated.

After selecting all 7 trainers, the player character moves inside the subway vehicle, which changes the map. Changing map after changing the DS clock date may trigger the daily event reset which will advance the RNG frame uncontrollably. This will cause pokemons predicted by the tool to be incorrect. Note that the trainer prediction is still valid because it was generated before changing map. To avoid this issue, change the DS clock, load the game, go outside, save the game, go inside, save the game again.

After entering the vehicle, the pokemons of the first trainer are calculated.

Each trainer has a list of possible pokemons. The same formula as the trainer is used.

```text
Idx = ((((seed >> 32) >> 16) + (seed >> 32)) >> 16) % NumberOfPokémons;
```

If the selected pokemon has already been selected or if it has the same item as an already selected pokemon for that trainer, a new roll is performed until a valid pokemon is generated.

After selecting all 3 pokemons, there is a 2-frames advance with unknown impact.

Afterwards, the gender and ability for each pokemon is selected, according to this formula:

```text
AbilityIdx = (seed >> 32) % 2
```

After that, there is a 6-frames avance with unknown impact (most likely battle setup?).

During the battle, PID RNG is not advanced (thankfully!).

After defeating the first trainer, the 3 pokemons of the next trainer is calculated with the same formula, all the way until the 7th trainer.
