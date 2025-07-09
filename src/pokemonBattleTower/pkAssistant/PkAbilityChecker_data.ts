// format is smogon string

// https://bulbapedia.bulbagarden.net/wiki/Burn_(status_condition)
// JSON.stringify(Array.from(a.querySelectorAll('tr')).map(a => a.querySelector('td')?.innerText).filter(a => a))
export const SLEEP = ["Dark Void","Dire Claw","G-Max Befuddle","G-Max Snooze","Grass Whistle","Hypnosis","Lovely Kiss","Psycho Shift","Relic Song","Secret Power","Sing","Sleep Powder","Spore","Wicked Torque","Yawn"];
export const SLEEP_SELF = ["Rest"];
export const BURN = ["Beak Blast","Blaze Kick","Blazing Torque","Blue Flare","Burning Bulwark","Burning Jealousy","Ember","Fire Blast","Fire Fang","Fire Punch","Flame Wheel","Flamethrower","Flare Blitz","Fling","Heat Wave","Ice Burn","Infernal Parade","Inferno","Matcha Gotcha","Lava Plume","Psycho Shift","Pyro Ball","Sacred Fire","Sandsear Storm","Scald","Scorching Sands","Searing Shot","Secret Power","Shadow Fire","Sizzly Slide","Steam Eruption","Tri Attack","Will-O-Wisp"]
export const PARALYZE = ["Body Slam","Bolt Strike","Bounce","Buzzy Buzz","Combat Torque","Dire Claw","Discharge","Dragon Breath","Fling","Force Palm","Freeze Shock","G-Max Befuddle","G-Max Stun Shock","G-Max Volt Crash","Glare","Lick","Nuzzle","Psycho Shift","Secret Power","Shadow Bolt","Spark","Splishy Splash","Stoked Sparksurfer","Stun Spore","Thunder","Thunder Fang","Thunder Punch","Thunder Shock","Thunder Wave","Thunderbolt","Tri Attack","Volt Tackle","Wildbolt Storm","Zap Cannon"];
export const FRZ = ["Blizzard","Freeze-Dry","Freezing Glare","Ice Beam","Ice Fang","Ice Punch","Powder Snow","Secret Power","Shadow Chill","Tri Attack"];
export const PSN = ["Baneful Bunker","Barb Barrage","Cross Poison","Dire Claw","Fling","G-Max Befuddle","G-Max Malodor","G-Max Stun Shock","Gunk Shot","Mortal Spin","Noxious Torque","Poison Gas","Poison Jab","Poison Powder","Poison Sting","Poison Tail","Psycho Shift","Secret Power","Shell Side Arm","Sludge","Sludge Bomb","Sludge Wave","Smog","Toxic Spikes","Toxic Thread","Twineedle"].concat(["Fling","Malignant Chain","Poison Fang","Psycho Shift","Toxic","Toxic Spikes"]);

export const FLINCH = ["Air Slash","Astonish","Bite","Bone Club","Dark Pulse","Double Iron Bash","Dragon Rush","Extrasensory","Fake Out","Fiery Wrath","Fire Fang","Fling","Floaty Fall","Headbutt","Heart Stamp","Hyper Fang","Ice Fang","Icicle Crash","Iron Head","Low Kick","Mountain Gale","Needle Arm","Rock Slide","Rolling Kick","Secret Power","Sky Attack","Snore","Steamroller","Stomp","Thunder Fang","Triple Arrows","Twister","Waterfall","Zen Headbutt","Zing Zap"];

export const CONFUSE = ["Axe Kick","Chatter","Confuse Ray","Confusion","Dizzy Punch","Dynamic Punch","Flatter","G-Max Gold Rush","G-Max Smite","Hurricane","Magical Torque","Psybeam","Rock Climb","Secret Power","Shadow Panic","Signal Beam","Strange Steam","Supersonic","Swagger","Sweet Kiss","Teeter Dance","Water Pulse"];

export const STATUS_ANY_BUT_SLEEP = [...BURN, ...PARALYZE, ...FRZ, ...PSN];
export const STATUS_ANY = [...SLEEP, ...BURN, ...PARALYZE, ...FRZ, ...PSN];

//https://bulbapedia.bulbagarden.net/wiki/Category:Moves_that_can_lower_the_target%27s_Speed
//JSON.stringify(Array.from(document.body.querySelectorAll('a')).filter(a => a.innerText.includes('(move)')).map(a => a.innerText.replace(' (move)','')))
export const LOWER_SPE = ["Bleakwind Storm","Bubble","Bubble Beam","Bulldoze","Constrict","Cotton Spore","Drum Beating","Electroweb","G-Max Foam Burst","Glaciate","Icy Wind","Low Sweep","Max Strike","Mud Shot","Pounce","Rock Tomb","Scary Face","Secret Power","Silk Trap","Sticky Web","String Shot","Syrup Bomb","Tar Shot","Toxic Thread","Venom Drench"];

export const LOWER_ATK = ["Aurora Beam","Baby-Doll Eyes","Bitter Malice","Breaking Swipe","Charm","Chilling Water","Feather Dance","Growl","King's Shield","Lunge","Memento","Noble Roar","Parting Shot","Play Nice","Play Rough","Secret Power","Springtide Storm","Strength Sap","Tearful Look","Tickle","Trop Kick","Venom Drench"];

export const LOWER_DEF = ["Acid","Crunch","Crush Claw","Fire Lash","Grav Apple","Iron Tail","Leer","Liquidation","Max Phantasm","Obstruct","Octolock","Razor Shell","Rock Smash","Screech","Secret Power","Shadow Bone","Shadow Down","Spicy Extract","Tail Whip","Thunderous Kick","Tickle","Triple Arrows"];

export const LOWER_ACC = ["Flash","Kinesis","Leaf Tornado","Mirror Shot","Mud Bomb","Mud-Slap","Muddy Water","Night Daze","Octazooka","Sand Attack","Secret Power","Smokescreen"]

export const LOWER_EVA = ["Defog","G-Max Tartness","Shadow Mist","Sweet Scent"];

export const LOWER_SPA = ["Captivate","Confide","Eerie Impulse","Max Flutterby","Memento","Mist Ball","Moonblast","Mystical Fire","Noble Roar","Parting Shot","Secret Power","Skitter Smack","Snarl","Spirit Break","Struggle Bug","Tearful Look","Venom Drench"];

export const LOWER_SPD = ["Acid","Acid Spray","Apple Acid","Bug Buzz","Crunch","Earth Power","Energy Ball","Fake Tears","Flash Cannon","Focus Blast","Lumina Crash","Luster Purge","Max Darkness","Metal Sound","Octolock","Psychic","Seed Flare","Shadow Ball"];

export const LOWER_ANY = [...LOWER_SPE, ...LOWER_ATK, ...LOWER_DEF, ...LOWER_ACC, ...LOWER_EVA, ...LOWER_SPA, ...LOWER_SPD];

export const LIQUID_OOZE = ["Absorb", "Dream Eater", "Giga Drain", "Leech Life", "Leech Seed", "Mega Drain"];

export const RECOIL = ["Brave Bird","Chloroblast","Double-Edge","Flare Blitz","Head Charge","Head Smash","Light of Ruin","Self-DestructLA","Shadow End","Shadow RushColo","Struggle","Submission","Take Down","Volt Tackle","Wave Crash","Wild Charge","Wood Hammer"];

export const SOUND = ["Alluring Voice","Boomburst","Bug Buzz","Chatter","Clanging Scales","Clangorous Soul","Clangorous Soulblaze","Confide","Disarming Voice","Echoed Voice","Eerie Spell","Grass Whistle","Growl","Heal Bell","Howl","Hyper Voice","Metal Sound","Noble Roar","Overdrive","Parting Shot","Perish Song","Psychic Noise","Relic Song","Roar","Round","Screech","Shadow Panic*","Sing","Snarl","Snore","Sparkling Aria","Supersonic","Torch Song","Uproar"];

export const STICKY_HOLD = ["Covet","Thief", "Pickpocket","Magician","Bug Bite","Pluck","Incinerate","Corrosive Gas","Knock Off"];

export const OHKO = ["Fissure", "Guillotine", "Horn Drill","Sheer Cold"];

export const PROTECT = ["Baneful Bunker","Burning Bulwark","Crafty Shield","Detect","King's Shield","Mat Block","Max Guard","Obstruct","Protect","Quick Guard","Silk Trap","Spiky Shield","Wide Guard"];

