## Pokémon Platinum: Battle Tower RNG Manipulation

### Summary

How to abuse RNG to face easy trainers in Pokémon Platinum Battle Tower. [Platinum Battle Tower RNG tool](/BattleFacilities/Platinum/RngManipulation)

### Battle Tower RNG Seeds & Formulas

There are 3 seeds/formula for Platinum Battle Tower:

- Different day seed (u32):
    - Its initial value is set when starting a new savefile.
    - It advances by 1 for each day that has passed since the last save.
    - It doesn't update when the day is earlier than the last save.
    - The update formula is new = old \* 1812433253 + 1
- Same day seed (u32):
    - When different day seed changes, same day seed is set equal to the different day seed, then advanced by 1.
    - It also advances by 1 for every new Battle Tower streak started (with 0 ongoing wins).
    - The update formula is new = old \* 1566083941 + 1
- Team generation seed (u32):
    - Its the seed used to determine trainers, TID, their Pokémons, and their PID.
    - When the teams generation starts, the team generation seed is set equal to the same day seed.
    - Afterwards, (1 + win\_count / 7 \* 24) advances are performed.
    - The update formula is new = old \* 48828125 + 1

### Battle Tower Trainer Team Generation

First, the game performs (win\_count / 7 \* 24 + 1) frame advances.

The game then selects 7 trainers. It selects a pool of possible trainers based on the number of wins you'll have when reaching that trainer.

The formula used is

Idx = ((seed / 65535) & 0xFFFF) % NumberOfTrainers;

If there is only 1 possible trainer (ex: at 48 wins), then the RNG frame is not advanced.

If the selected trainer has already been selected, a new roll is performed until an unused trainer is generated.

Each trainer has a list of possible Pokémons. The same formula as the trainer is used to determine the trainer Pokémons.

If the selected Pokémon has already been selected or if it has the same item as an already selected Pokémon for that trainer, a new roll is performed until a valid Pokémon is generated.

After selecting all 3 Pokémons, there is a 2-frames advance to generate TID.

Afterwards, for each Pokémon, random PID (2-frames advance) are generated until the nature derived from the PID matches the wanted nature of the Pokémon. In average, ~12 PID generations are needed.

For example, the trainer Pokémon must have the nature Brave. The first PID results in the nature Adamant. The 2nd PID results in Timid. The 3rd PID results in Brave. PID generation is stopped. (6-frames advances)

The gender and ability of the Pokémon is derived from its PID.

After that, there is a 1-frame avance with unknown impact.

[Source code](https://github.com/RainingChain/pk_platinum_battle_facilities_rng_manip) for Platinum Battle Tower RNG tool
