
--[[
v1
Author: RainingChain

Print useful info about the generation of a specific battle in Battle Tower.

Output example:
{
 "winStreak":57,
 "FramesBeforeTrainerSelection_WithoutElevator":11828,
 "FramesBetweenTrainerAnd1stPokemon_WithoutSpeech":117,
 "CurrentCycleAt1stPokemon":238051,
 "generatedTrainer":["Dev", 67],
 "generatedMons":[
  ["Rhydon 1", 45, -12312],
  ["Rattata 1", 35, 123123],
  ["Raticate 1", 32, 34234324],
 ],
 "FramesBeforeTrainerSelection_WithElevator":12025,
 "FramesBetweenTrainerAnd1stPokemon_WithSpeech":160,
 "sectionRngAndCycleAtStartAndActionCycleCount":[
  ["MonID1",12186,238051,885],
  ["MonNAT1",12187,238936,978],
  ["MonNAT1",12189,239914,993],
  ["MonNAT1",12191,240907,952],
  ["MonNAT1",12193,241859,1010],
 ]
}

Note: generatedMons: [DisplayName, PresetId, PID]


--]]

-- External optional inputs (for mgba_battleTower.lua)
-- local lastRngFrameInfo
-- local printCycleCountPerSectionJson

-- Config Start
local printSections = true
local printModulo = true
local printVblanks = true

local overwriteTrainer = nil
local overwriteMonId1 = nil
local overwriteMonId2 = nil
local overwriteMonId3 = nil
-- Config End

if (pcall(function()
  emu:currentCycle()
end) == false) then
  console:error("Error: A mGBA dev version 8511 or more recent is required to run this script. The current mGBA version is not supported.")
  return
end


local mustPrint = false

local vblankDurList = {}
local vblankDurList_len = 0
local vblankStart = nil

local jsonStruct = nil
local currentSection = nil
local start = nil
local monIdx = 0
local logVblank = false
local lastVblankCycle = 0

local STARTMSG_FRAME_BY_TRAINER = {33,29,45,43,31,35,35,45,33,35,37,37,39,41,35,41,41,31,39,41,33,37,41,35,37,33,33,37,39,41,33,35,31,43,39,35,47,37,33,37,35,45,39,35,31,39,39,37,37,47,29,37,33,35,37,47,27,39,41,27,33,29,33,33,25,33,37,33,33,37,39,39,29,41,35,27,33,35,47,31,35,35,27,39,33,39,37,29,37,27,35,43,35,31,33,43,31,43,37,39,35,35,33,33,31,23,29,33,23,35,37,39,39,39,33,27,17,25,25,33,23,37,41,41,35,37,39,41,33,39,43,33,35,29,37,27,43,41,33,43,35,39,43,39,37,43,41,37,41,33,35,33,39,39,39,29,37,31,37,39,35,33,35,39,33,35,33,41,19,37,35,33,47,33,49,33,33,39,31,45,33,41,33,41,35,33,33,35,37,31,43,39,47,43,41,27,39,29,33,27,35,41,33,43,37,39,35,35,37,31,45,29,41,27,39,31,21,31,39,41,31,35,33,37,37,31,35,25,37,43,41,33,31,41,29,43,39,41,35,33,33,37,39,37,35,31,31,35,35,35,35,39,41,35,37,45,35,25,37,33,35,29,29,37,31,45,39,37,31,33,41,37,39,35,39,37,41,35,35,27,45,41,37,41,29,41,33,41,37,35,37,39,35,39,39,37,23,41,35}

local TRAINER_NAME = {"Brady","Conner","Bradley","Cybil","Rodette","Peggy","Keith","Grayson","Glenn","Liliana","Elise","Zoey","Manuel","Russ","Dustin","Tina","Gillian","Zoe","Chen","Al","Mitch","Anne","Alize","Lauren","Kipp","Jason","John","Ann","Eileen","Carlie","Gordon","Ayden","Marco","Cierra","Marcy","Kathy","Peyton","Julian","Quinn","Haylee","Amanda","Stacy","Rafael","Oliver","Payton","Pamela","Eliza","Marisa","Lewis","Yoshi","Destin","Keon","Stuart","Nestor","Derrick","Bryson","Clayton","Trenton","Jenson","Wesley","Anton","Lawson","Sammy","Arnie","Adrian","Tristan","Juliana","Rylee","Chelsea","Danela","Lizbeth","Amelia","Jillian","Abbie","Briana","Antonio","Jaden","Dakota","Brayden","Corson","Trevin","Patrick","Kaden","Maxwell","Daryl","Kenneth","Rich","Caden","Marlon","Nash","Robby","Reece","Kathryn","Ellen","Ramon","Arthur","Alondra","Adriana","Malik","Jill","Erik","Yazmin","Jamal","Leslie","Dave","Carlo","Emilia","Dalia","Hitomi","Ricardo","Shizuka","Joana","Kelly","Rayna","Evan","Jordan","Joel","Kristen","Selphy","Chloe","Norton","Lukas","Zach","Kaitlyn","Breanna","Kendra","Molly","Jazmin","Kelsey","Jalen","Griffen","Xander","Marvin","Brennan","Baley","Zackary","Gabriel","Emily","Jordyn","Sofia","Braden","Kayden","Cooper","Julia","Amara","Lynn","Jovan","Dominic","Nikolas","Valeria","Delaney","Meghan","Roberto","Damian","Brody","Graham","Tylor","Jaren","Cordell","Jazlyn","Zachery","Johan","Shea","Kaila","Isiah","Garrett","Haylie","Megan","Issac","Quinton","Salma","Ansley","Holden","Luca","Jamison","Gunnar","Craig","Pierce","Regina","Alison","Hank","Earl","Ramiro","Hunter","Aiden","Xavier","Clinton","Jesse","Eduardo","Hal","Gage","Arnold","Jarrett","Garett","Emanuel","Gustavo","Kameron","Alfredo","Ruben","Lamar","Jaxon","Logan","Emilee","Josie","Armando","Skyler","Ruth","Melody","Pedro","Erick","Elaine","Joyce","Todd","Gavin","Malory","Esther","Oscar","Wilson","Clare","Tess","Leon","Alonzo","Vince","Bryon","Ava","Miriam","Carrie","Gillian","Tyler","Chaz","Nelson","Shania","Stella","Dorine","Maddox","Davin","Trevon","Mateo","Bret","Raul","Kay","Elena","Alana","Alexas","Weston","Jasper","Nadia","Miranda","Emma","Rolando","Stanly","Dario","Karlee","Jaylin","Ingrid","Delilah","Carly","Lexie","Miller","Marv","Layton","Brooks","Gregory","Reese","Mason","Toby","Dorothy","Piper","Finn","Samir","Fiona","Gloria","Nico","Jeremy","Caitlin","Reena","Avery","Liam","Theo","Bailey","Hugo","Bryce","Gideon","Triston","Charles","Raymond","Dirk","Harold","Omar","Peter","Dev","Corey","Andre","Ferris","Alivia","Paige","Anya","Dawn","Abby","Gretel"}

local MON_BY_ID = {"Sunkern 1","Azurill 1","Caterpie 1","Weedle 1","Wurmple 1","Ralts 1","Magikarp 1","Feebas 1","Metapod 1","Kakuna 1","Pichu 1","Silcoon 1","Cascoon 1","Igglybuff 1","Wooper 1","Tyrogue 1","Sentret 1","Cleffa 1","Seedot 1","Lotad 1","Poochyena 1","Shedinja 1","Makuhita 1","Whismur 1","Zigzagoon 1","Zubat 1","Togepi 1","Spinarak 1","Marill 1","Hoppip 1","Slugma 1","Swinub 1","Smeargle 1","Pidgey 1","Rattata 1","Wynaut 1","Skitty 1","Spearow 1","Hoothoot 1","Diglett 1","Ledyba 1","Nincada 1","Surskit 1","Jigglypuff 1","Taillow 1","Wingull 1","Nidoran♂ 1","Nidoran♀ 1","Kirlia 1","Mareep 1","Meditite 1","Slakoth 1","Paras 1","Ekans 1","Ditto 1","Barboach 1","Meowth 1","Pineco 1","Trapinch 1","Spheal 1","Horsea 1","Shroomish 1","Shuppet 1","Duskull 1","Electrike 1","Vulpix 1","Pikachu 1","Sandshrew 1","Poliwag 1","Bellsprout 1","Geodude 1","Dratini 1","Snubbull 1","Remoraid 1","Larvitar 1","Baltoy 1","Snorunt 1","Bagon 1","Beldum 1","Gulpin 1","Venonat 1","Mankey 1","Machop 1","Shellder 1","Smoochum 1","Numel 1","Carvanha 1","Corphish 1","Charmander 1","Cyndaquil 1","Abra 1","Doduo 1","Gastly 1","Swablu 1","Treecko 1","Torchic 1","Mudkip 1","Squirtle 1","Totodile 1","Slowpoke 1","Bulbasaur 1","Chikorita 1","Oddish 1","Psyduck 1","Cubone 1","Goldeen 1","Natu 1","Clefairy 1","Magnemite 1","Seel 1","Grimer 1","Krabby 1","Exeggcute 1","Eevee 1","Drowzee 1","Voltorb 1","Chinchou 1","Teddiursa 1","Delibird 1","Houndour 1","Phanpy 1","Spoink 1","Aron 1","Luvdisc 1","Tentacool 1","Cacnea 1","Unown 1","Koffing 1","Staryu 1","Skiploom 1","Nuzleaf 1","Lombre 1","Vibrava 1","Rhyhorn 1","Clamperl 1","Pidgeotto 1","Growlithe 1","Farfetch'd 1","Omanyte 1","Kabuto 1","Lileep 1","Anorith 1","Aipom 1","Elekid 1","Loudred 1","Spinda 1","Nidorina 1","Nidorino 1","Flaaffy 1","Magby 1","Nosepass 1","Corsola 1","Mawile 1","Butterfree 1","Beedrill 1","Poliwhirl 1","Onix 1","Beautifly 1","Dustox 1","Ledian 1","Ariados 1","Yanma 1","Delcatty 1","Sableye 1","Lickitung 1","Weepinbell 1","Graveler 1","Gloom 1","Porygon 1","Kadabra 1","Wailmer 1","Roselia 1","Volbeat 1","Illumise 1","Ivysaur 1","Charmeleon 1","Wartortle 1","Parasect 1","Machoke 1","Haunter 1","Bayleef 1","Quilava 1","Croconaw 1","Togetic 1","Murkrow 1","Wobbuffet 1","Plusle 1","Minun 1","Grovyle 1","Combusken 1","Marshtomp 1","Ponyta 1","Azumarill 1","Sudowoodo 1","Magcargo 1","Pupitar 1","Sealeo 1","Raticate 1","Masquerain 1","Furret 1","Dunsparce 1","Dragonair 1","Mightyena 1","Linoone 1","Castform 1","Shelgon 1","Metang 1","Wigglytuff 1","Sunflora 1","Chimecho 1","Gligar 1","Qwilfish 1","Sneasel 1","Pelipper 1","Swellow 1","Lairon 1","Tangela 1","Arbok 1","Persian 1","Seadra 1","Kecleon 1","Vigoroth 1","Lunatone 1","Solrock 1","Noctowl 1","Sandslash 1","Venomoth 1","Chansey 1","Seaking 1","Jumpluff 1","Piloswine 1","Golbat 1","Primeape 1","Hitmonlee 1","Hitmonchan 1","Girafarig 1","Hitmontop 1","Banette 1","Ninjask 1","Seviper 1","Zangoose 1","Camerupt 1","Sharpedo 1","Tropius 1","Magneton 1","Mantine 1","Stantler 1","Absol 1","Swalot 1","Crawdaunt 1","Pidgeot 1","Grumpig 1","Torkoal 1","Kingler 1","Cacturne 1","Bellossom 1","Octillery 1","Huntail 1","Gorebyss 1","Relicanth 1","Omastar 1","Kabutops 1","Poliwrath 1","Scyther 1","Pinsir 1","Politoed 1","Cloyster 1","Delcatty 2","Sableye 2","Lickitung 2","Weepinbell 2","Graveler 2","Gloom 2","Porygon 2","Kadabra 2","Wailmer 2","Roselia 2","Volbeat 2","Illumise 2","Ivysaur 2","Charmeleon 2","Wartortle 2","Parasect 2","Machoke 2","Haunter 2","Bayleef 2","Quilava 2","Croconaw 2","Togetic 2","Murkrow 2","Wobbuffet 2","Plusle 2","Minun 2","Grovyle 2","Combusken 2","Marshtomp 2","Ponyta 2","Azumarill 2","Sudowoodo 2","Magcargo 2","Pupitar 2","Sealeo 2","Raticate 2","Masquerain 2","Furret 2","Dunsparce 2","Dragonair 2","Mightyena 2","Linoone 2","Castform 2","Shelgon 2","Metang 2","Wigglytuff 2","Sunflora 2","Chimecho 2","Gligar 2","Qwilfish 2","Sneasel 2","Pelipper 2","Swellow 2","Lairon 2","Tangela 2","Arbok 2","Persian 2","Seadra 2","Kecleon 2","Vigoroth 2","Lunatone 2","Solrock 2","Noctowl 2","Sandslash 2","Venomoth 2","Chansey 2","Seaking 2","Jumpluff 2","Piloswine 2","Golbat 2","Primeape 2","Hitmonlee 2","Hitmonchan 2","Girafarig 2","Hitmontop 2","Banette 2","Ninjask 2","Seviper 2","Zangoose 2","Camerupt 2","Sharpedo 2","Tropius 2","Magneton 2","Mantine 2","Stantler 2","Absol 2","Swalot 2","Crawdaunt 2","Pidgeot 2","Grumpig 2","Torkoal 2","Kingler 2","Cacturne 2","Bellossom 2","Octillery 2","Huntail 2","Gorebyss 2","Relicanth 2","Omastar 2","Kabutops 2","Poliwrath 2","Scyther 2","Pinsir 2","Politoed 2","Cloyster 2","Dugtrio 1","Medicham 1","Misdreavus 1","Fearow 1","Granbull 1","Jynx 1","Dusclops 1","Dodrio 1","Mr. Mime 1","Lanturn 1","Breloom 1","Forretress 1","Whiscash 1","Xatu 1","Skarmory 1","Marowak 1","Quagsire 1","Clefable 1","Hariyama 1","Raichu 1","Dewgong 1","Manectric 1","Vileplume 1","Victreebel 1","Electrode 1","Exploud 1","Shiftry 1","Glalie 1","Ludicolo 1","Hypno 1","Golem 1","Rhydon 1","Alakazam 1","Weezing 1","Kangaskhan 1","Electabuzz 1","Tauros 1","Slowbro 1","Slowking 1","Miltank 1","Altaria 1","Nidoqueen 1","Nidoking 1","Magmar 1","Cradily 1","Armaldo 1","Golduck 1","Rapidash 1","Muk 1","Gengar 1","Ampharos 1","Scizor 1","Heracross 1","Ursaring 1","Houndoom 1","Donphan 1","Claydol 1","Wailord 1","Ninetales 1","Machamp 1","Shuckle 1","Steelix 1","Tentacruel 1","Aerodactyl 1","Porygon2 1","Gardevoir 1","Exeggutor 1","Starmie 1","Flygon 1","Venusaur 1","Vaporeon 1","Jolteon 1","Flareon 1","Meganium 1","Espeon 1","Umbreon 1","Blastoise 1","Feraligatr 1","Aggron 1","Blaziken 1","Walrein 1","Sceptile 1","Charizard 1","Typhlosion 1","Lapras 1","Crobat 1","Swampert 1","Gyarados 1","Snorlax 1","Kingdra 1","Blissey 1","Milotic 1","Arcanine 1","Salamence 1","Metagross 1","Slaking 1","Dugtrio 2","Medicham 2","Marowak 2","Quagsire 2","Misdreavus 2","Fearow 2","Granbull 2","Jynx 2","Dusclops 2","Dodrio 2","Mr. Mime 2","Lanturn 2","Breloom 2","Forretress 2","Skarmory 2","Whiscash 2","Xatu 2","Clefable 2","Hariyama 2","Raichu 2","Dewgong 2","Manectric 2","Vileplume 2","Victreebel 2","Electrode 2","Exploud 2","Shiftry 2","Glalie 2","Ludicolo 2","Hypno 2","Golem 2","Rhydon 2","Alakazam 2","Weezing 2","Kangaskhan 2","Electabuzz 2","Tauros 2","Slowbro 2","Slowking 2","Miltank 2","Altaria 2","Nidoqueen 2","Nidoking 2","Magmar 2","Cradily 2","Armaldo 2","Golduck 2","Rapidash 2","Muk 2","Gengar 2","Ampharos 2","Scizor 2","Heracross 2","Ursaring 2","Houndoom 2","Donphan 2","Claydol 2","Wailord 2","Ninetales 2","Machamp 2","Shuckle 2","Steelix 2","Tentacruel 2","Aerodactyl 2","Porygon2 2","Gardevoir 2","Exeggutor 2","Starmie 2","Flygon 2","Venusaur 2","Vaporeon 2","Jolteon 2","Flareon 2","Meganium 2","Espeon 2","Umbreon 2","Blastoise 2","Feraligatr 2","Aggron 2","Blaziken 2","Walrein 2","Sceptile 2","Charizard 2","Typhlosion 2","Lapras 2","Crobat 2","Swampert 2","Gyarados 2","Snorlax 2","Kingdra 2","Blissey 2","Milotic 2","Arcanine 2","Salamence 2","Metagross 2","Slaking 2","Dugtrio 3","Medicham 3","Misdreavus 3","Fearow 3","Granbull 3","Jynx 3","Dusclops 3","Dodrio 3","Mr. Mime 3","Lanturn 3","Breloom 3","Forretress 3","Whiscash 3","Xatu 3","Skarmory 3","Marowak 3","Quagsire 3","Clefable 3","Hariyama 3","Raichu 3","Dewgong 3","Manectric 3","Vileplume 3","Victreebel 3","Electrode 3","Exploud 3","Shiftry 3","Glalie 3","Ludicolo 3","Hypno 3","Golem 3","Rhydon 3","Alakazam 3","Weezing 3","Kangaskhan 3","Electabuzz 3","Tauros 3","Slowbro 3","Slowking 3","Miltank 3","Altaria 3","Nidoqueen 3","Nidoking 3","Magmar 3","Cradily 3","Armaldo 3","Golduck 3","Rapidash 3","Muk 3","Gengar 3","Ampharos 3","Scizor 3","Heracross 3","Ursaring 3","Houndoom 3","Donphan 3","Claydol 3","Wailord 3","Ninetales 3","Machamp 3","Shuckle 3","Steelix 3","Tentacruel 3","Aerodactyl 3","Porygon2 3","Gardevoir 3","Exeggutor 3","Starmie 3","Flygon 3","Venusaur 3","Vaporeon 3","Jolteon 3","Flareon 3","Meganium 3","Espeon 3","Umbreon 3","Blastoise 3","Feraligatr 3","Aggron 3","Blaziken 3","Walrein 3","Sceptile 3","Charizard 3","Typhlosion 3","Lapras 3","Crobat 3","Swampert 3","Gyarados 3","Snorlax 3","Kingdra 3","Blissey 3","Milotic 3","Arcanine 3","Salamence 3","Metagross 3","Slaking 3","Dugtrio 4","Medicham 4","Misdreavus 4","Fearow 4","Granbull 4","Jynx 4","Dusclops 4","Dodrio 4","Mr. Mime 4","Lanturn 4","Breloom 4","Forretress 4","Whiscash 4","Xatu 4","Skarmory 4","Marowak 4","Quagsire 4","Clefable 4","Hariyama 4","Raichu 4","Dewgong 4","Manectric 4","Vileplume 4","Victreebel 4","Electrode 4","Exploud 4","Shiftry 4","Glalie 4","Ludicolo 4","Hypno 4","Golem 4","Rhydon 4","Alakazam 4","Weezing 4","Kangaskhan 4","Electabuzz 4","Tauros 4","Slowbro 4","Slowking 4","Miltank 4","Altaria 4","Nidoqueen 4","Nidoking 4","Magmar 4","Cradily 4","Armaldo 4","Golduck 4","Rapidash 4","Muk 4","Gengar 4","Ampharos 4","Scizor 4","Heracross 4","Ursaring 4","Houndoom 4","Donphan 4","Claydol 4","Wailord 4","Ninetales 4","Machamp 4","Shuckle 4","Steelix 4","Tentacruel 4","Aerodactyl 4","Porygon2 4","Gardevoir 4","Exeggutor 4","Starmie 4","Flygon 4","Venusaur 4","Vaporeon 4","Jolteon 4","Flareon 4","Meganium 4","Espeon 4","Umbreon 4","Blastoise 4","Feraligatr 4","Aggron 4","Blaziken 4","Walrein 4","Sceptile 4","Charizard 4","Typhlosion 4","Lapras 4","Crobat 4","Swampert 4","Gyarados 4","Snorlax 4","Kingdra 4","Blissey 4","Milotic 4","Arcanine 4","Salamence 4","Metagross 4","Slaking 4","Articuno 1","Zapdos 1","Moltres 1","Raikou 1","Entei 1","Suicune 1","Regirock 1","Regice 1","Registeel 1","Latias 1","Latios 1","Articuno 2","Zapdos 2","Moltres 2","Raikou 2","Entei 2","Suicune 2","Regirock 2","Regice 2","Registeel 2","Latias 2","Latios 2","Articuno 3","Zapdos 3","Moltres 3","Raikou 3","Entei 3","Suicune 3","Regirock 3","Regice 3","Registeel 3","Latias 3","Latios 3","Articuno 4","Zapdos 4","Moltres 4","Raikou 4","Entei 4","Suicune 4","Regirock 4","Regice 4","Registeel 4","Latias 4","Latios 4","Gengar 5","Gengar 6","Gengar 7","Gengar 8","Ursaring 5","Ursaring 6","Ursaring 7","Ursaring 8","Machamp 5","Machamp 6","Machamp 7","Machamp 8","Gardevoir 5","Gardevoir 6","Gardevoir 7","Gardevoir 8","Starmie 5","Starmie 6","Starmie 7","Starmie 8","Lapras 5","Lapras 6","Lapras 7","Lapras 8","Snorlax 5","Snorlax 6","Snorlax 7","Snorlax 8","Salamence 5","Salamence 6","Salamence 7","Salamence 8","Metagross 5","Metagross 6","Metagross 7","Metagross 8","Regirock 5","Regirock 6","Regice 5","Regice 6","Registeel 5","Registeel 6","Latias 5","Latias 6","Latias 7","Latias 8","Latios 5","Latios 6","Latios 7","Latios 8","Dragonite 1","Dragonite 2","Dragonite 3","Dragonite 4","Dragonite 5","Dragonite 6","Dragonite 7","Dragonite 8","Dragonite 9","Dragonite 10","Tyranitar 1","Tyranitar 2","Tyranitar 3","Tyranitar 4","Tyranitar 5","Tyranitar 6","Tyranitar 7","Tyranitar 8","Tyranitar 9","Tyranitar 10","Articuno 5","Articuno 6","Zapdos 5","Zapdos 6","Moltres 5","Moltres 6","Raikou 5","Raikou 6","Entei 5","Entei 6","Suicune 5","Suicune 6"}

local ELEVATOR_FRAME_BY_STREAK = {53,80,107,128,155,176,176,191,197,197}

function printLog(name)
  if (mustPrint) then
    console:log(name)
  end
end

function createFormattedJsonStruct()
  local s = {}
  s.rngFrameAndVblanks = ""
  s.vblanks2 = ""
  --SECTION,FrameAtStart,CycleAtFrame,FrameAtEnd,CycleAtEnd,CycleDiff
  s.sectionInfo = ""
  s.sectionInfo_isFstEl = true
  s.RngAvdCountAtTrainer = 0
  s.RngAvdCountAfterTrainer = 0
  s.RngAvdCountAtMon1ID = 0
  s.CurrentCycleAtMon1ID = 0
  s.selectedTrainerId = nil
  s.monIds = {0,0,0}
  s.monPids = {"","",""}

  s.modulo = ""
  s.currentSection_modulo = {}

  return s
end

function addToSection(what)
  jsonStruct.sectionInfo = jsonStruct.sectionInfo .. what
end


function resetAll()
  mustPrint = false

  vblankDurList = {}
  vblankDurList_len = 0
  vblankStart = nil

  jsonStruct = createFormattedJsonStruct()
  currentSection = nil
  start = nil
  monIdx = 0
  logVblank = false
end

function onSectionEnd(sectionName)
  local str = ""

  for k, v in pairs(jsonStruct.currentSection_modulo) do
    str = str .. k .. "," .. v .. ","
  end

  if (str == "") then
    return
  end

  jsonStruct.modulo = jsonStruct.modulo .. sectionName .. "," .. str .. "|"
  jsonStruct.currentSection_modulo = {}
end


function getRngCount()
  return emu:read32(0x020249c0)
end

function emu_currentCycleInFrame()
  return emu:currentCycle() - lastVblankCycle
end

function getRngCountAndCycleToStr()
  return "" .. getRngCount() .. "," .. emu_currentCycleInFrame() .. ","
end

function getFacility2()
  -- u16 gSaveBlock1Ptr->vars[0x40CF - VARS_START];
  local gSaveBlock1Ptr_val = emu:read32(0x03005d8c)
  return emu:read16(gSaveBlock1Ptr_val + 0x139C + 2 * (0x40CF - 0x4000))
end

function getBattleMode2()
 -- u16 gSaveBlock1Ptr->vars[0x40CE - VARS_START];
  local gSaveBlock1Ptr_val = emu:read32(0x03005d8c)
  return emu:read16(gSaveBlock1Ptr_val + 0x139C + 2 * (0x40CE - 0x4000))
end

function getLvlMode2()
  -- gSaveBlock2Ptr_val->frontier.lvlMode
  local gSaveBlock2Ptr_val = emu:read32(0x03005d90) --
  local lvlMode = emu:read8(gSaveBlock2Ptr_val + 0xCA9)
  return math.fmod(lvlMode, 2)
end

function getCurrentWinStreak2()
  -- gSaveBlock2Ptr->frontier.towerWinStreaks[battleMode][lvlMode]
  --  /*0xCE0*/ u16 towerWinStreaks[battleMode 4][FRONTIER_LVL_MODE_COUNT 2];
  --u16 array1[4][2] = {{0, 1}, {2, 3}, {4, 5}, {6, 7}};

  local gSaveBlock2Ptr_val = emu:read32(0x03005d90)

  local varOffsetByFacility = 0

  local facility = getFacility2();

  if (facility == 0) then
    varOffsetByFacility = 0xCE0 -- towerWinStreaks
  elseif (facility == 1) then
    varOffsetByFacility = 0xD0C -- domeWinStreaks
  elseif (facility == 2) then
    varOffsetByFacility = 0xDC8 -- palaceWinStreaks
  elseif (facility == 3) then
    varOffsetByFacility = 0xDDA -- arenaWinStreaks
  elseif (facility == 4) then
    varOffsetByFacility = 0xDE2 -- factoryWinStreaks
  elseif (facility == 5) then
    varOffsetByFacility = 0xE04 -- pikeWinStreaks
  elseif (facility == 6) then
    varOffsetByFacility = 0xE1A -- pyramidWinStreaks
  end

  return emu:read16(gSaveBlock2Ptr_val + varOffsetByFacility + 2 * (2 * getBattleMode2() + getLvlMode2()))
end

--SetNextFacilityOpponent: Start
emu:setBreakpoint(function()
  resetAll()
  mustPrint = true

  jsonStruct.RngAvdCountAtTrainer = getRngCount()
  --printLog("RngAvdCountAtTrainer=" .. jsonStruct.RngAvdCountAtTrainer)
end, 0x081623f0)

-- overwrite results of GetRandomScaledFrontierTrainerId() in SetNextFacilityOpponent
emu:setBreakpoint(function()
  jsonStruct.RngAvdCountAfterTrainer = getRngCount()

  if (overwriteTrainer ~= nil) then
    emu:writeRegister("r0", overwriteTrainer)
    overwriteTrainer = nil
  end


  jsonStruct.selectedTrainerId = tonumber(emu:readRegister("r0"))
end, 0x081624c6);

function to_base64(data)
    local b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    return ((data:gsub('.', function(x)
        local r,b='',x:byte()
        for i=8,1,-1 do r=r..(b%2^i-b%2^(i-1)>0 and '1' or '0') end
        return r;
    end)..'0000'):gsub('%d%d%d?%d?%d?%d?', function(x)
        if (#x < 6) then return '' end
        local c=0
        for i=1,6 do c=c+(x:sub(i,i)=='1' and 2^(6-i) or 0) end
        return b:sub(c+1,c+1)
    end)..({ '', '==', '=' })[#data%3+1])
end

--FillTrainerParty: End
emu:setBreakpoint(function()
  mustPrint = false

  local winStreak = getCurrentWinStreak2()
  local elevatorFloor = math.floor(winStreak / 7)
  if (elevatorFloor >= 9) then
    elevatorFloor = 9
  end

  local FramesBeforeTrainerSelection_WithElevator = jsonStruct.RngAvdCountAtTrainer;
  local elevatorFrames = ELEVATOR_FRAME_BY_STREAK[elevatorFloor + 1]
  local FramesBeforeTrainerSelection_WithoutElevator = FramesBeforeTrainerSelection_WithElevator - elevatorFrames

  local FramesBetweenTrainerAnd1stPokemon_WithSpeech = jsonStruct.RngAvdCountAtMon1ID - jsonStruct.RngAvdCountAfterTrainer
  local FramesBetweenTrainerAnd1stPokemon_WithoutSpeech = FramesBetweenTrainerAnd1stPokemon_WithSpeech

  if (jsonStruct.selectedTrainerId ~= nil) then
    -- minus 2 for OT generation
    FramesBetweenTrainerAnd1stPokemon_WithoutSpeech = FramesBetweenTrainerAnd1stPokemon_WithSpeech - STARTMSG_FRAME_BY_TRAINER[jsonStruct.selectedTrainerId + 1] - 2
  end

  -- print general json
  local s = "{\n"
  s = s .. " \"winStreak\":" .. winStreak .. ",\n"
  s = s .. " \"FramesBeforeTrainerSelection_WithoutElevator\":" .. FramesBeforeTrainerSelection_WithoutElevator .. ",\n"
  s = s .. " \"FramesBetweenTrainerAnd1stPokemon_WithoutSpeech\":" .. FramesBetweenTrainerAnd1stPokemon_WithoutSpeech .. ",\n"
  s = s .. " \"CurrentCycleAt1stPokemon\":" .. jsonStruct.CurrentCycleAtMon1ID .. ",\n"
  s = s .. " \n"
  s = s .. " \"FramesBeforeTrainerSelection_WithElevator\":" .. FramesBeforeTrainerSelection_WithElevator .. ",\n"
  s = s .. " \"FramesBetweenTrainerAnd1stPokemon_WithSpeech\":" .. FramesBetweenTrainerAnd1stPokemon_WithSpeech .. ",\n"

  s = s .. " \"generatedTrainer\":[\"" .. TRAINER_NAME[jsonStruct.selectedTrainerId + 1] .. "\"," .. jsonStruct.selectedTrainerId .. "],\n"
  s = s .. " \"generatedMons\":[\n"

  s = s .. "  [\"" .. MON_BY_ID[jsonStruct.monIds[1] + 1] .. "\"," .. jsonStruct.monIds[1] .. "," .. jsonStruct.monPids[1] .. "],\n"
  s = s .. "  [\"" .. MON_BY_ID[jsonStruct.monIds[2] + 1] .. "\"," .. jsonStruct.monIds[2] .. "," .. jsonStruct.monPids[2] .. "],\n"
  s = s .. "  [\"" .. MON_BY_ID[jsonStruct.monIds[3] + 1] .. "\"," .. jsonStruct.monIds[3] .. "," .. jsonStruct.monPids[3] .. "]\n"
  s = s .. " ]"

  if (printSections) then
    -- 0 is for the ending of the MonNAT3 which isn't printed
    s = s .. ",\n \"sectionRngAndCycleAtStartAndActionCycleCount\":[\n" .. jsonStruct.sectionInfo .. "0]\n]"
  end

  if (printVblanks) then
    s = s .. ",\n \"rngFrameAndVblankCycleCount\":[\n" .. jsonStruct.rngFrameAndVblanks .. "]"
  end

  if (printModulo) then
    s = s .. ",\n \"modulo\":\"" .. jsonStruct.modulo .. "\""
  end
  s = s .. "\n}\n"
  if (printCycleCountPerSectionJson ~= false) then
    console:log(s);
  end

  lastRngFrameInfo = to_base64(s) --for mgba_battleTower.lua

  -- console:log(jsonStruct.vblanks2);

  -- print json for pkRngAbuse
  local gSaveBlock2Ptr_val = emu:read32(0x03005d90)
  local lvlMode = math.fmod(emu:read8(gSaveBlock2Ptr_val + 0xCA9), 2)
  local isLvl50 = "true"
  if (lvlMode == 1) then
    isLvl50 = "false"
  end

  local trainersBattled = "["
  for i = 0,math.fmod(winStreak,7) - 1 do
    local tid = emu:read16(gSaveBlock2Ptr_val + 0xCB4 + i * 2)
    trainersBattled = trainersBattled .. "\"" .. TRAINER_NAME[tid + 1] .. "\","
  end
  trainersBattled = trainersBattled:sub(1, -2) .. "],"

  local s2 = ""
  s2 = s2 .. "{"
  s2 = s2 .. "\"version\":2,"
  s2 = s2 .. "\"isLvl50\":" .. isLvl50 .. ","
  s2 = s2 .. " \"winStreak\":" .. winStreak .. ","
  s2 = s2 .. " \"trainerNameFilter\":\"" .. TRAINER_NAME[jsonStruct.selectedTrainerId + 1] .. "\","
  s2 = s2 .. " \"trainersBattled\":" .. trainersBattled

  s2 = s2 .. " \"displayCredits\":false,"
  s2 = s2 .. " \"displayImportExport\":true,"
  s2 = s2 .. " \"pokemonsFilter\":["
  s2 = s2 .. "  {\"battleFrontierId\":" .. jsonStruct.monIds[1] .. ", \"pid\":" .. jsonStruct.monPids[1] .. "},"
  s2 = s2 .. "  {\"battleFrontierId\":" .. jsonStruct.monIds[2] .. ", \"pid\":" .. jsonStruct.monPids[2] .. "},"
  s2 = s2 .. "  {\"battleFrontierId\":" .. jsonStruct.monIds[3] .. ", \"pid\":" .. jsonStruct.monPids[3] .. "}"
  s2 = s2 .. " ],"
  s2 = s2 .. " \"rngCalib\":{"
  s2 = s2 .. " \"nodeInputType\":\"advancedMode\","
  s2 = s2 .. " \"beforeTrainer_1stBattle\":\"" .. FramesBeforeTrainerSelection_WithoutElevator .. "|" .. FramesBeforeTrainerSelection_WithoutElevator .. "\","
  s2 = s2 .. " \"beforeTrainer_2ndBattle\":\"" .. FramesBeforeTrainerSelection_WithoutElevator .. "|" .. FramesBeforeTrainerSelection_WithoutElevator .. "\","
  s2 = s2 .. " \"beforeMon1\":\"" .. FramesBetweenTrainerAnd1stPokemon_WithoutSpeech .. "|" ..  FramesBetweenTrainerAnd1stPokemon_WithoutSpeech .. "\","
  s2 = s2 .. " \"cycleMon1Id\":\"" .. jsonStruct.CurrentCycleAtMon1ID .. "|" .. jsonStruct.CurrentCycleAtMon1ID .. "\","
  s2 = s2 .. "  \"includesFramesStartSpeech\":false,"
  s2 = s2 .. "  \"includesFramesInElevator\":false,"
  s2 = s2 .. "  \"usingDeadBattery\":false"
  s2 = s2 .. " }"
  s2 = s2 .. "}"

  if (printCycleCountPerSectionJson ~= false) then
    console:log(s2);
  end

end, 0x8163064)

-- VblankIntr start
emu:setBreakpoint(function()
  lastVblankCycle = emu:currentCycle()

  if (mustPrint == false) then
    return
  end
  vblankStart = emu:currentCycle()
end, 0x08000738)

-- VblankIntr end
emu:setBreakpoint(function()
  if (mustPrint == false) then
    return
  end
  if (logVblank == false) then
    return
  end

  if (vblankStart == nil) then
    if (vblankDurList_len ~= 0) then
      console:log("Vblank end with error. end called before vblank start")
    end
  else
    local dur = emu:currentCycle() - vblankStart;
    table.insert(vblankDurList, dur)
    vblankDurList_len = vblankDurList_len + 1
    local rngCountAtStart = getRngCount() - 1
    -- printLog("vblankDurList[" .. vblankDurList_len .. "] = " .. vblankDurList[vblankDurList_len] .. ". Rng=" .. rngCountAtStart)
    if (jsonStruct.rngFrameAndVblanks ~= "") then
      jsonStruct.rngFrameAndVblanks = jsonStruct.rngFrameAndVblanks .. ",\n"
    end
    jsonStruct.rngFrameAndVblanks = jsonStruct.rngFrameAndVblanks .. "  [" .. rngCountAtStart .. "," .. vblankDurList[vblankDurList_len] .. "]"
    jsonStruct.vblanks2 = jsonStruct.vblanks2 .. vblankDurList[vblankDurList_len] .. ","
  end
end, 0x80007dA)

function getCurrentCycleInfo()
  local a = {}
  a.startCycle = emu:currentCycle()
  a.vblankCountAtStart = vblankDurList_len
  return a
end


function getIntervalCycleCount(startInfo)
  local endCycle = emu:currentCycle()
  local cycleWithVblanks = endCycle - startInfo.startCycle

  if (startInfo.vblankCountAtStart < vblankDurList_len) then
    for i = startInfo.vblankCountAtStart + 1, vblankDurList_len do
      cycleWithVblanks = cycleWithVblanks - vblankDurList[i]
    end
  end

  return cycleWithVblanks
end

-- MONDID Random()
emu:setBreakpoint(function()
  logVblank = true
  monIdx = tonumber(emu:readRegister("r7")) + 1

  local sec = "MonID" .. monIdx
  if (currentSection ~= sec) then
    -- first time calling Random()
    if (currentSection == "MonNAT1" or currentSection == "MonNAT2") then
      local cc = getIntervalCycleCount(start)
      local prevSec = "MonNAT" .. (monIdx - 1)
      --printLog(prevSec .. " success : " .. cc .. " cycles")
      onSectionEnd(prevSec)
      addToSection(cc .. "],\n")
    end

    --printLog(sec .. " first Random call")
    start = getCurrentCycleInfo()

    addToSection("  [\"" .. sec .. "\"," .. getRngCountAndCycleToStr())

    if (monIdx == 1) then
      jsonStruct.RngAvdCountAtMon1ID = getRngCount()
      --printLog("RngAvdCountAtMon1ID=" .. jsonStruct.RngAvdCountAtMon1ID)

      jsonStruct.CurrentCycleAtMon1ID = emu_currentCycleInFrame()
      --printLog("CurrentCycleAtMon1ID=" .. jsonStruct.CurrentCycleAtMon1ID)
    end

  else
    local cc = getIntervalCycleCount(start)

    -- print endInfo of previous call
    addToSection(cc .. "],\n")

    -- print startInfo of current call
    addToSection("  [\"" .. sec .. "\"," .. getRngCountAndCycleToStr())

    -- 2+ time calling Random(). this means its a retry
    --printLog(sec .. " retry : " .. cc .. " cycles")
    onSectionEnd(sec .. "_Retry")
    start = getCurrentCycleInfo()
  end
  currentSection = sec

end, 0x08163296)

-- MONID immediately after Random()
emu:setBreakpoint(function()
  local monIdx = tonumber(emu:readRegister("r7")) + 1

  jsonStruct.monIds[monIdx] = tonumber(emu:readRegister("r4"))

  if (overwriteMonId1 ~= nil and monIdx == 1) then
    emu:writeRegister("r4", overwriteMonId1)
    overwriteMonId1 = nil
  end
  if (overwriteMonId2 ~= nil and monIdx == 2) then
    emu:writeRegister("r4", overwriteMonId2)
    overwriteMonId2 = nil
  end
  if (overwriteMonId3 ~= nil and monIdx == 3) then
    emu:writeRegister("r4", overwriteMonId3)
    overwriteMonId3 = nil
  end
end, 0x81632AC);


-- MONXNAT Random32()
emu:setBreakpoint(function()
  local sec = "MonNAT" .. monIdx
  if (currentSection ~= sec) then
    -- first time calling Random()
    if (currentSection == "MonID1" or currentSection == "MonID2" or currentSection == "MonID3") then
      local cc = getIntervalCycleCount(start)
      local prevSec = "MonID" .. monIdx
      --printLog(prevSec .. " success : " .. cc .. " cycles")
      onSectionEnd(prevSec)
      addToSection(cc .. "],\n")
    end

    --printLog(sec .. " first Random call")
    start = getCurrentCycleInfo()

    addToSection("  [\"" .. sec .. "\"," .. getRngCountAndCycleToStr())
  else
    local cc = getIntervalCycleCount(start)

    -- print endInfo of previous call
    addToSection(cc .. "],\n")

    -- print startInfo of current call
    addToSection("  [\"" .. sec .. "\"," .. getRngCountAndCycleToStr())

    -- 2+ time calling Random(). this means its a retry
    --printLog(sec .. " retry : " .. cc .. " cycles")
    jsonStruct.currentSection_modulo = {} -- not relevant to log
    start = getCurrentCycleInfo()
  end

  currentSection = sec
end, 0x8068664)


-- MONXNAT after Random32()
emu:setBreakpoint(function()
  jsonStruct.monPids[monIdx] = emu:readRegister("r0")
end, 0x8068678)

-- __umodsi3
emu:setBreakpoint(function()
  if (mustPrint == false) then
    return
  end

  local dividend = emu:readRegister("r0")
  local divisor = emu:readRegister("r1")
  local str = "" .. dividend .. " %u " .. divisor;
  --printLog(str)

  if (jsonStruct.currentSection_modulo[str]) then
    jsonStruct.currentSection_modulo[str] = jsonStruct.currentSection_modulo[str] + 1
  else
    jsonStruct.currentSection_modulo[str] = 1
  end

end, 0x082e7be0)

-- __modsi3
emu:setBreakpoint(function()
  if (mustPrint == false) then
    return
  end

  local dividend = emu:readRegister("r0")
  local divisor = emu:readRegister("r1")
  local str = "" .. dividend .. " %s " .. divisor;
  --printLog(str)

  if (jsonStruct.currentSection_modulo[str]) then
    jsonStruct.currentSection_modulo[str] = jsonStruct.currentSection_modulo[str] + 1
  else
    jsonStruct.currentSection_modulo[str] = 1
  end
end, 0x082e7650)
