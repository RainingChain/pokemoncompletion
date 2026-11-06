## Pokémon Emerald: Battle Tower RNG Manipulation

### Summary

How RNG works in Emerald Battle Tower and how the [Emerald Battle Tower RNG Manipulation Tool](/BattleFacilities/Emerald/RngManipulation) exploits it.

### Table of Contents

- [1\. First version of the RNG manipulation tool: Naive Approach](#h3)
    - [1.1 Opponent Team Generation Algorithm](#h4)
    - [1.2 RNG Manipulation Basics](#h5)
    - [1.3 Estimating Frames Before Trainer](#h6)
    - [1.4 Estimating Frames Between Trainer And 1st Pokémon](#h7)
    - [1.5 Outcome](#h8)
- [2\. Second version of the RNG manipulation tool: V-Blanks by Section](#h9)
    - [2.1 What are V-Blank Interrupts?](#h10)
    - [2.2 RNG Manipulation considering V-Blank Interrupts](#h11)
    - [2.3 Optimizing V-Blanks During Pokémon Generation Retries](#h12)
        - [2.3.1 Determining the Different Outcomes for Pokémon Generation](#h13)
        - [2.3.2 How Helpful That Pokémon Generation Optimization Is](#h14)
    - [2.4 Optimizing V-Blank After Pokémon Generation](#h15)
        - [2.4.1 Impact of PID on Cycle Count](#h16)
        - [2.4.2 Impact of Pokémon Preset on Cycle Count](#h17)
- [3\. Third version of the RNG manipulation tool: Cycle Simulator](#h18)
    - [3.1 How to Reduce Possibilities Even More](#h19)
    - [3.2 Data Required](#h20)
    - [3.3 Cycles Per V-blanks](#h21)
    - [3.4 Algo Summary](#h22)
    - [3.5 Algo Execution Example](#h23)
    - [3.6 Supporting Uncommon Results](#h24)
    - [3.7 Calculating Probabilities](#h25)
        - [3.7.1 Probability Distribution for V-Blanks from Player Inputs](#h26)
        - [3.7.2 Probability Distribution for Current Cycle At 1st Pokémon Selection](#h27)
        - [3.7.3 Probability Distribution for Cycles Per V-blank](#h28)
    - [3.8 Apply Probabilities](#h29)
    - [3.9. Useful Scripts](#h30)
    - [4\. Final Result](#h31)
    - [5\. Credits](#h32)

<a id="h3"></a>

## 1\. First version of the RNG manipulation tool: Naive Approach

<a id="h4"></a>

### 1.1 Opponent Team Generation Algorithm

By itself, the algorithm used to generate the opponent team is quite simple.

- Select a random trainer that hasn't been battled yet in the current challenge series.
- Select a random Pokémon Preset (species, nature, item and moveset) from a pool of predefined Pokémon presets.
- Generate the Pokémon which also assigns a random ability and gender.
- Select a 2nd random Pokémon which is compatible with the first one (doesn't share the same species, nor item as the first one).
- Generate the 2nd Pokémon.
- Select the 3rd Pokémon while ensuring compability.
- Generate the 3rd Pokémon.

<a id="h5"></a>

### 1.2 RNG Manipulation Basics

In Emerald, RNG updates every frame. Forcing a specific battle requires frame-perfect button presses, which is very difficult. Unlike wild Pokémon encounters that can be attempted multiple times, the Battle Frontier can only be attempted once. In short, RNG manipulation in Emerald Battle Frontier can't be used to force a specific battle.

A less risky and easier RNG manipulation is to be able to predict the entire opponent team, based on the trainer and their first Pokémon. With this extra knowledge, the battle becomes a lot easier.

In theory, there are only two unknown variables at play:

- Number of frames before the trainer is selected
- Number of frames between the trainer and the selection of the first Pokémon

<a id="h6"></a>

### 1.3 Estimating Frames Before Trainer

The trainer is selected upon entering the battle map. The number of frames before reaching the map depends on the time spent in the Battle Tower elevator, which depends on the current win streak. The more win streak you have, the higher up you go, and the more time you spend in the elevator.

Here's the number of frames in the elevator by win streak:

- Win streak 0-6: 53
- Win streak 7-13: 80
- Win streak 14-20: 107
- Win streak 21-27: 128
- Win streak 28-34: 155
- Win streak 35-41: 176
- Win streak 42-48: 176
- Win streak 49-55: 191
- Win streak 56+: 197

Considering this, we can accurately predict the frame when the trainer is selected with autofire (pressing A every frame). Without autofire (pressing A about 5 times per second), the additional frames is between 120 and 180 (~2-3 seconds slower than TAS).

<a id="h7"></a>

### 1.4 Estimating Frames Between Trainer And 1st Pokémon

The first Pokémon is selected upon starting the battle, upon pressing A after the trainer greeting message. The number of frames for the greeting message depends on trainer. Every trainer has a different message, with variable length.

The shortest message is "FUFUFU..." by Joel which takes 17 frames. The longest is "MY SECRET POWER IS OVERWHELMING TO POKEMON" by Jamison which takes 49 frames. It's about 0.88 frames per letter.

<a id="h8"></a>

### 1.5 Outcome

I applied each step of the generation algorithm perfectly. And the results were... totally wrong... For a mysterious reason, the Pokémon team predicted by the tool didn't match at all the ones when playing the game.

After debugging the assembly, I discovered that the Random() function was called way more often than expected. The reason: v-blank interrupts.

* * *

<a id="h9"></a>

## 2\. Second version of the RNG manipulation tool: V-Blanks by Section

<a id="h10"></a>

### 2.1 What are V-Blank Interrupts?

A V-blank interrupt is the mechanism used by the GBA to refresh the screen. It is triggered every 1/60th of a second independently from regular game logic execution.

When a V-blank interrupt occurs, the regular game program execution is paused, v-blank associated code is executed, then the regular game program resumes.

In Pokémon Emerald, the v-blank associated code updates the RNG frame by 1. This means that every 1/60th of a second, the RNG frame updates by 1.

Every single program operation has an impact on v-blank interrupts. Two GBAs with different saves that boot the game and press the buttons at the same time will not result in the exact same outcome. This is because loading and saving the savefile take a variable number of operations.

In short, it's impossible to precisely determine when v-blank interrupts will occur in the context of the Battle Frontier.

<a id="h11"></a>

### 2.2 RNG Manipulation considering V-Blank Interrupts

Here is the list of important RNG steps:

- Trainer
- 1st Pokémon Preset
- 1st Pokémon Generation (Nature)
- 2nd Pokémon Preset
- 2nd Pokémon Generation (Nature)
- 3rd Pokémon Preset
- 3rd Pokémon Generation (Nature)

V-blanks can occur between steps, or during the retry attempts of a step.

For the tool to return accurate results, we need to estimate as accurately as possible the number of v-blanks occuring between and during each step.

The V-blanks occuring before 1st Pokémon Preset don't really matter, because it depends on the player input. We already add a buffer to take into consideration the variability.

According to my tests, the following is the range of V-blanks for each step:

| Step | V-Blank Count | \# of Possible Outcomes |
| --- | --- | --- |
| During 1st Pokémon Preset retries: | 0-1 | 2 |
| Between 1st Pokémon Preset and 1st Pokémon Generation: | 0-1 | 2 |
| During 1st Pokémon Generation retries | 0-1 | ~100† |
| Between 1st Pokémon Generation and 2nd Pokémon Preset | 0-16 | 17 |
| During 2nd Pokémon Preset retries: | 0-1 | 2 |
| Between 2nd Pokémon Preset and 2nd Pokémon Generation: | 0-1 | 2 |
| During 2nd Pokémon Generation retries | 0-1 | ~100† |
| Between 2nd Pokémon Generation and 3rd Pokémon Preset | 0-16 | 17 |
| During 3rd Pokémon Preset retries: | 0-1 | 2 |
| Between 3rd Pokémon Preset and 3rd Pokémon Generation: | 0-1 | 2 |
| During 3rd Pokémon Generation retries | 0-1 | ~100† |

The overall number of possibilities is: 2 \* 2 \* 100 \* 17 \* 2 \* 2 \* 100 \* 17 \* 2 \* 2 \* 100 = **18\_496\_000\_000 !**

Note † : The reason why Pokémon Generation retries generate so much possibilities will be explained later.

Obviously, it's impossible to brute force this number of possibilities. There's no point in having a tool that displays 18\_496\_000\_000 possible trainer teams. We need to optimize certain sections by understanding why the v-blank varies so much.

<a id="h12"></a>

### 2.3 Optimizing V-Blanks During Pokémon Generation Retries

Pokémon Generation has a very variable number of RNG calls. In Generation 3, the nature is determined by using the formula (PID modulo 25) where PID is the personality ID. To create a Pokémon with a specific nature, the game generates a random PID until it results in the wanted nature. In average, it takes 25 attempts to create a valid PID. In some cases, it can take many many more (100+).

A v-blank can occur at any time during those RNG calls. If there are 100 RNG calls, then there are 100 possible outcomes (v-blank at 1st retry, v-blank at 2nd retry, v-blank at 3rd retry etc.)

Fortunately, in most cases, the exact moment when the v-blank occurs doesn't impact the end result. We need to take advantage of that fact to optimize the RNG manipulation.

<a id="h13"></a>

#### 2.3.1 Determining the Different Outcomes for Pokémon Generation

We want determine the list of different outcomes for the nature generation. Note that each nature generation attempt calls RNG twice (PID has 32 bits, and Random() returns 16 random bits).

For example, nature generation starts at RNG frame 1000 and the wanted nature is Brave. We make the list of all frames after 1000 that result in the Brave nature, for example frames 1005, 1015, 1018, 1027, 1039, and 1050.

From those values, we can determine the following:

- If the v-blank occurs between RNG frame 1000 to 1004, the valid PID will be generated on frame 1005.
- If the v-blank occurs between RNG frame 1006 to 1014, the valid PID will be generated on frame 1015.
- If the v-blank occurs between RNG frame 1016 to 1018, the valid PID will be generated on frame 1027.
- If the v-blank occurs later than RNG frame 1018, the valid PID will be generated on frame 1018.

As you can notice, v-blank occuring after RNG frame 1018 doesn't matter, because the valid PID would already be found at this point.

The number of different outcomes is 2 + (the number of odd RNG frames resulting in valid PID before the first valid even RNG frame). With the example above (1005, 1015, 1018, 1027, 1039, 1050), we get 4 different outcomes (1000 to 1004 for 1005, 1006 to 1014 for 1015, 1016 to 1018 for 1027, later than 1018 for 1018).

<a id="h14"></a>

#### 2.3.2 How Helpful That Pokémon Generation Optimization Is

In average, the average number of different outcomes for nature generation is 3. (The average the number of odd RNG frames resulting in valid PID before the first valid even RNG frame is 1.)

Another easy optimization is to ignore nature generation for the 3rd Pokémon, because it only impacts its ability and gender, which are not that important.

In short, with this optimization, the average number of possible outcomes caused by Nature Generation retries was reduced from 100^3 (1\_000\_000) to 3^2 (9).

<a id="h15"></a>

### 2.4 Optimizing V-Blank After Pokémon Generation

The number of v-blanks between selecting the PID of the 1st Pokémon and selecting the Pokémon preset of the 2nd Pokémon is also very variable. It ranges between 0 to 16 v-blanks.

Unlike v-blanks occuring during Pokémon Generation, every v-blank after Pokémon Generation results in a different outcome.

Reminder: The number of v-blanks is directly related to the number of processor cycles which is related to the instructions performed. For some reasons, the number of instructions performed greatly vary depending on the Pokémon generated.

The number of cycles (instructions) during Pokémon Generation depends on:

- The PID of the Pokémon
- The Pokémon preset (species + moves + nature)

<a id="h16"></a>

#### 2.4.1 Impact of PID on Cycle Count

The reason why PID has an impact on cycle count is because Pokémon Emerald was compiled with a compiler that has a [poorly-optimized modulo operator code.](https://github.com/gcc-mirror/gcc/blob/master/libgcc/config/lm32/_umodsi3.c) The modulo operator takes between 10 and 900 cycles.

In theory, taking 10 or 900 cycles shouldn't have a big impact on v-blank count. Reminder: V-blanks occur every 280\_896 cycles. To cause a difference of 16 v-blanks, you would need to call the modulo function on the PID thousands of times! It makes no sense to call the modulo operator that many times when creating a Pokémon, right?!

Well, it turns out that the game does indeed call the modulo operator thousands of times (x2924 times to be exact for Level 100 Roselia 1).

The reason it is being called so much is because the Pokémon data structure is always encrypted in the RAM. Every access to read or write a Pokémon attribute must decrypt the data structure. And to decrypt the data structure, 4 calls to (PID % 24) are performed.

This means the number of times Pokémon attributes are accessed impacts the number of cycles. The number of accesses depends on the Pokémon preset.

<a id="h17"></a>

#### 2.4.2 Impact of Pokémon Preset on Cycle Count

The Pokémon preset in the Battle Frontier includes:

- Pokémon species
- Moveset
- Nature
- Item
- EV

The number of accesses to Pokémon attributes depend on:

- Level-up learnset (depends on Pokémon species)
- Pokémon Level (normally 50 or 100)
- Battle Frontier Moveset (whether the moves in the Battle Frontier are the same as the level-up learnset or not)
- The number of non-zero EV (varies between 2 and 3 in the Battle Frontier)
- Whether the species has 1 or 2 abilities.
    - Note: Even if Granbull, Vibrava and Flygon only have 1 ability, internally they have 2 abilities (twice the same ability).

I was able to extract the number of modulo calls and cycle count for each Pokémon preset. Using this data, the tool can determine the number of cycles of a Pokémon generation for a given PID and level.

Let say that the number of cycles for Level 50 Jynx with a given PID is 2\_500\_000. (2\_500\_000 cycles) / (280\_896 cycles / vblank) = 8.9 vblanks. This means generating that Pokémon will cause 8 or 9 v-blanks. If the current cycle when Pokémon generation starts is below 28\_089 (90% of 280\_896), there will be 8 v-blanks. If it is above or equal to 28\_089, there will be 9 v-blanks.

In short, with this optimization, the number of average number of possible outcomes caused by Pokémon Generation was reduced from 17^3 (4913) to 2^3 (8).

The total number of possible teams is now relatively small, but we can do even better by simulating cycles!

* * *

<a id="h18"></a>

## 3\. Third version of the RNG manipulation tool: Cycle Simulator

<a id="h19"></a>

### 3.1 How to Reduce Possibilities Even More

So far, we only tried to reduce possibilities of each step taken individually. We can reduce it even further by considering how the steps interact with eachother.

For example, generating the Pokémon Nature has taken 100 retries without any v-blank occuring. Afterwards, the number of v-blanks for Pokémon generation is estimated at ~8.9.

So far, we assumed that Pokémon generation would result in 8 or 9 v-blanks. (If the current cycle is below 28\_089, there will be 8 v-blanks. If it is above 28\_089, there will be 9 v-blanks.)

In reality, it's impossible for the current cycle to be below 28\_089 cycle when Pokémon generation starts, because in the previous step, generating the Pokémon Nature has taken 100 retries without any v-blank occuring. Those 100 retries already rose the current cycles far above 28\_089.

To improve the accuracy, we need a new RNG manipulation algorithm that simulates cycle count for all steps.

<a id="h20"></a>

### 3.2 Data Required

For this new algorithm, we need the number of cycles of every step and each of its outcomes. Some steps have many possible outcomes. Here's the list of steps and outcomes:

- 1st Pokémon Preset :
    - Success
    - Failure because of invalid Pokémon preset for level 50
- 1st Pokémon Generation :
    - Success
    - Failure because invalid nature
- 2nd Pokémon Preset :
    - Success
    - Failure because of invalid Pokémon preset for level 50
    - Failure because of same species as 1st Pokémon
    - Failure because of same item as 1st Pokémon
- 2nd Pokémon Generation :
    - Success
    - Failure because invalid nature
- 3rd Pokémon Preset :
    - Success
    - Failure because of invalid Pokémon preset for level 50
    - Failure because of same species as 1st Pokémon
    - Failure because of same species as 2nd Pokémon
    - Failure because of same item as 1st Pokémon
    - Failure because of same item as 2nd Pokémon
- 3rd Pokémon Generation :
    - Success
    - Failure because invalid nature

For the same outcome, the number of cycles also depends on the RNG state at the time of the call. For example, the number of cycles for "Failure because invalid nature" depends on the cycles for the operation (PID % 25) which depends on the value of the last Random() call. Fortunately, we are able to accurately calculate it.

<a id="h21"></a>

### 3.3 Cycles Per V-blanks

The v-blank interrupt function occurs every 280\_896 cycles. In the v-blank function, two main things occur: updating what's displayed on the screen and updating the audio. In the case of Battle Tower, there's nothing to update visually, so that duration is constant. But the number of cycles to update the sound is highly variable (between 35\_000 and 65\_000 cycles depending on where the audio track is).

When the cycle counter reaches 280\_896, the cyle counter is reset, regular program execution is stopped, and the v-blank function is called. Once the v-blank function is done, regular program execution resumes. The cycle counter when the regular program execution resumes is between a 35\_000 and 65\_000 range.

In the previous sections, I simplified the problem when calculating the number of v-blanks for Pokémon generation. If generating a Pokémon takes 2\_500\_000 cycles excluding v-blanks, the number of v-blanks is actually between 10 and 12 (not between 8 and 9) because of the cycles taken by the v-blank themselves. This extra variability makes it even harder to accurately determine the outcome.

Additionally, v-blank interrupts are not the only possible interrupts. There are also Vcount interrupts which work similarly, but they only run for 120 cycles in the Battle Frontier.

<a id="h22"></a>

### 3.4 Algo Summary

With all the data collected, we need an algorithm to simulate cycles and calculate possible teams.

In short, for every starting state possible, the algo applies the generation steps. When a v-blank occurs, it takes into consideration all possible v-blank durations.

A starting state is composed of three values:

- RNG state when selecting the trainer
- RNG state when selecting the 1st Pokémon
- Current cycle count (value between 0 and 280\_895) when selecting the 1st Pokémon

<a id="h23"></a>

### 3.5 Algo Execution Example

For example, the starting state is {RNG\_Trainer=2050, RNG\_1st\_Pokémon=2132, Cycle\_Count\_1st\_Pokémon=250\_000}. RNG\_Trainer=2050 results in the trainer Dev being selected. RNG\_1st\_Pokémon=2132 results in the Pokémon Nidoking 1 being selected. The selection took 10\_000 cycles. We are now at {RNG=2133,cycle=260\_000}.

We attempt to generate a PID that results in the Adamant nature. The first attempt is a failure (nature was Brave) and took 5\_000 cycles. The state is now {RNG=2135,cycle=265\_000}. The second attempt is also a failure (nature was Modest) and took 20\_896 cycles. The state is now {RNG=2137,cycle=285\_896}.

Because the cycle is above 280\_896, a v-blank occurs. The v-blank takes between 35\_000 and 65\_000 cycles. The tool selects a random number in that range, for example 40\_000 cycles. The state is now {RNG=2138,cycle=45\_000}.

A 3rd attempt for nature generation is a success (nature is Adamant). The generation of the Pokémon takes 2\_500\_000 cycles. The state is now {RNG=2140,cycle=2\_545\_000}. Because the cycle is above 280\_896, v-blanks occur (x9 times). The state is now {RNG=2140,cycle=16\_936 + 9 v-blanks}. The tool selects a random number of cycles that the x9 v-blanks took themselves to update the screen/audio, for example 375\_000 cycles. The state is now {RNG=2149,cycle=386\_936}. Because the cycle is above 280\_896, an additional v-blank occurs {RNG=2149,cycle=106\_040 + 1 v-blank}. The tool selects a random number of cycles for the v-blank (ex: 43\_960 cycles). The state becomes {RNG=2150,cycle=150\_000}.

We repeat this process until all 3 Pokémon are generated.

<a id="h24"></a>

### 3.6 Supporting Uncommon Results

A problem with the implementation above is that only 1 final outcome is generated, based on the random number of cycles per v-blank used. To generate multiple possible outcomes, the algo must be ran multiple times. It's unclear how many times the algo must be ran to ensure that all possible outcomes have been found.

To overcome this problem, the strategy is to always explore two branches: the lower bound and the upper bound. For example, if v-blank cycles are between 35\_000 and 65\_000, we will explore the outcome given that v-blank cycles is 35\_000, then explore the outcome for 65\_000. This ensures all possible outcomes are explored. Note: Additional tweaks were also added to explore different outcomes for cycles in-between the bounds.

<a id="h25"></a>

### 3.7 Calculating Probabilities

So far, we were only interested in knowning the possible teams. In most cases, there are over 100 possible teams, but some of them are a lot more probable then others (often one with 50%+ chance). It is a lot more useful to players if we can identify the most probable teams.

For accurate probabilities, we need the distribution probabilities for all randomized ranges.

- Number of v-blanks before selecting the trainer
- Number of v-blanks between selecting the trainer and selecting the 1st Pokémon
- Current cycle when selecting the 1st Pokémon
- Number of cycles per v-blank

<a id="h26"></a>

#### 3.7.1 Probability Distribution for V-Blanks from Player Inputs

This covers v-blanks before selecting the trainer and before the 1st Pokémon.

Assuming the player presses A every 12 frames (x5 times per second), the average frame delay per press is between 0 and 12 (average of ~6). It takes 9 A-presses from the game booting to selecting the trainer.

- In the best case, there will be 0 total frame delay compared to frame-perfect inputs (TAS).
- In the average average case, there will be 54 total frame delay.
- In the worst case, there will be 108 total frame delay.

In reality, it's a bit more complex than that, because there's a fixed delay between optimal inputs. Having a slower but better tuned mashing speed may result in better results. For example, in a text transition, a minimal delay of 15 frames is required between two inputs. Mashing once every 14 frames will trigger the text after 28 frames. Mashing once every 16 frames (slower than before) will trigger the text after 16 frames. In short, it's hard to estimate the real delay based on calculations alone. Actual in-game testing was required. Note: This is a simplified example with made-up numbers.

Still, we can make some assumptions. The probability distribution of the frame delay should follow a pyramid-like curve, with the average case being a lot more probable than the extremity. It is similar to the probability distribution when summing two random dices (obtaining 7 is a lot more common than obtaining 12).

The distribution can be approximated as 1,1,3,8,8,3,1,1. A value near the average region is about x8 more like than in the extremity region.

The same logic can be applied for estimating the frame delay for the trainer greeting message, before selecting the 1st Pokémon.

<a id="h27"></a>

#### 3.7.2 Probability Distribution for Current Cycle At 1st Pokémon Selection

The current cycle count is the number of cycles since the last v-blank. It is a value between 0 and 280\_895. It impacts when the next v-blank will occur and can greatly change the end result.

According to my tests, its value range between 185\_000 and 235\_000, with the range 210\_000 to 215\_000 being the most likely.

<a id="h28"></a>

#### 3.7.3 Probability Distribution for Cycles Per V-blank

Even though a v-blank takes between 35\_000 and 65\_000 cycles, not all values have the same chance of occuring. For example, a v-blank taking between \[50\_000, 55\_000\] cycles is x5 more likely than a v-blank taking between \[35\_000, 40\_000\] cycles.

Furthermore, the range of x10 consecutive v-blanks is a lot smaller than 10 times the range of a single v-blank (350\_000 to 650\_000). The reason is that multiple consecutive "long" v-blanks are impossible.

For example, the v-blank takes 65\_000 cycles only when the audio reaches the end of the song and loops back to the beginning of the song. This means it's impossible to reach 130\_000 cycles in 2 consecutive v-blanks, because the audio can't loop twice consecutively. Note: Audio looping is not the real reason for long v-blanks. This is only a supposition to illustrate the idea.

By collecting data of many consecutive v-blanks, it is possible to have a better approximation when multiple consecutive v-blanks occur. For example, the actual range for x10 consecutive v-blank is between 374\_000 and 574\_000.

Additional research could be done to better understand the number of cycles of the function SoundMain() called in the v-blank interrupt function.

<a id="h29"></a>

### 3.8 Apply Probabilities

The easiest way to simulate probabilities in complex multi-step logic is to run simulations. The more simulations, the better the accuracy.

Even though we could simply run simulations of the entire Pokémon team generation, it wouldn't be very efficient. This is because about 99% of teams generated are invalid because they don't match the trainer and Pokémon the player is facing in-game.

A better way is to split the algorithm in two parts: determining the possible valid team outcomes, then calculating probabilities only on the "paths" that lead to valid outcomes.

<a id="h30"></a>

### 3.9 Useful Scripts

Those scripts must be used on the latest **dev** version of the [mGBA emulator](https://mgba.io/downloads.html#development-downloads).

- [Script]({{SCRIPT1}}) to display general frame and cycle information for a team generation
- [Script]({{SCRIPT2}}) to extract the number of cycles and modulo operations for all 882 possible Pokémon preset
- [Script]({{SCRIPT3}}) to extract the number of frames for all 300 Trainer greeting speeches
- [Script]({{SCRIPT4}}) to extract the number of frames for each possible elevator floor

<a id="h31"></a>

## 4\. Final Result

Here's the [Emerald Battle Tower RNG Manipulation Tool](/BattleFacilities/Emerald/RngManipulation).

![]({{IMG}})

Here's the [Emerald Battle Frontier Assistant](/BattleFacilities/Emerald/Assistant) which fills the input for the RNG Manipulation tool automatically.

<a id="h32"></a>

## 5\. Credits

Author: RainingChain

Special thanks to Shao for support and providing the functions to calculate cycle count for the modulo operator.

Special thanks to mGBA team for the mGBA emulator.
