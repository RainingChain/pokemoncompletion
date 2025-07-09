import * as fs from "fs/promises";

/* REQUIREMENTS for the .json file:
- must contain a line with "categories":[
- each category must contains a line ending with "list":[
- each collectable must be in a single line
*/

if(true){
  const list = `1 Bulbasaur
2 Ivysaur
3 Venusaur
4 Charmander
5 Charmeleon
6 Charizard
7 Squirtle
8 Wartortle
9 Blastoise
10 Caterpie
11 Metapod
12 Butterfree
13 Weedle
14 Kakuna
15 Beedrill
16 Pidgey
17 Pidgeotto
18 Pidgeot
19 Rattata
20 Raticate
21 Spearow
22 Fearow
23 Ekans
24 Arbok
25 Pikachu
26 Raichu
27 Sandshrew
28 Sandslash
29 Nidoran?
30 Nidorina
31 Nidoqueen
32 Nidoran?
33 Nidorino
34 Nidoking
35 Clefairy
36 Clefable
37 Vulpix
38 Ninetales
39 Jigglypuff
40 Wigglytuff
41 Zubat
42 Golbat
43 Oddish
44 Gloom
45 Vileplume
46 Paras
47 Parasect
48 Venonat
49 Venomoth
50 Diglett
51 Dugtrio
52 Meowth
53 Persian
54 Psyduck
55 Golduck
56 Mankey
57 Primeape
58 Growlithe
59 Arcanine
60 Poliwag
61 Poliwhirl
62 Poliwrath
63 Abra
64 Kadabra
65 Alakazam
66 Machop
67 Machoke
68 Machamp
69 Bellsprout
70 Weepinbell
71 Victreebel
72 Tentacool
73 Tentacruel
74 Geodude
75 Graveler
76 Golem
77 Ponyta
78 Rapidash
79 Slowpoke
80 Slowbro
81 Magnemite
82 Magneton
83 Farfetch'd
84 Doduo
85 Dodrio
86 Seel
87 Dewgong
88 Grimer
89 Muk
90 Shellder
91 Cloyster
92 Gastly
93 Haunter
94 Gengar
95 Onix
96 Drowzee
97 Hypno
98 Krabby
99 Kingler
100 Voltorb
101 Electrode
102 Exeggcute
103 Exeggutor
104 Cubone
105 Marowak
106 Hitmonlee
107 Hitmonchan
108 Lickitung
109 Koffing
110 Weezing
111 Rhyhorn
112 Rhydon
113 Chansey
114 Tangela
115 Kangaskhan
116 Horsea
117 Seadra
118 Goldeen
119 Seaking
120 Staryu
121 Starmie
122 Mr. Mime
123 Scyther
124 Jynx
125 Electabuzz
126 Magmar
127 Pinsir
128 Tauros
129 Magikarp
130 Gyarados
131 Lapras
132 Ditto
133 Eevee
134 Vaporeon
135 Jolteon
136 Flareon
137 Porygon
138 Omanyte
139 Omastar
140 Kabuto
141 Kabutops
142 Aerodactyl
143 Snorlax
144 Articuno
145 Zapdos
146 Moltres
147 Dratini
148 Dragonair
149 Dragonite
150 Mewtwo
151 Mew
152 Chikorita
153 Bayleef
154 Meganium
155 Cyndaquil
156 Quilava
157 Typhlosion
158 Totodile
159 Croconaw
160 Feraligatr
161 Sentret
162 Furret
163 Hoothoot
164 Noctowl
165 Ledyba
166 Ledian
167 Spinarak
168 Ariados
169 Crobat
170 Chinchou
171 Lanturn
172 Pichu
173 Cleffa
174 Igglybuff
175 Togepi
176 Togetic
177 Natu
178 Xatu
179 Mareep
180 Flaaffy
181 Ampharos
182 Bellossom
183 Marill
184 Azumarill
185 Sudowoodo
186 Politoed
187 Hoppip
188 Skiploom
189 Jumpluff
190 Aipom
191 Sunkern
192 Sunflora
193 Yanma
194 Wooper
195 Quagsire
196 Espeon
197 Umbreon
198 Murkrow
199 Slowking
200 Misdreavus
201 Unown-A
202 Unown-B
203 Unown-C
204 Unown-D
205 Unown-E
206 Unown-F
207 Unown-G
208 Unown-H
209 Unown-I
210 Unown-J
211 Unown-K
212 Unown-L
213 Unown-M
214 Unown-N
215 Unown-O
216 Unown-P
217 Unown-Q
218 Unown-R
219 Unown-S
220 Unown-T
221 Unown-U
222 Unown-V
223 Unown-W
224 Unown-X
225 Unown-Y
226 Unown-Z
227 Unown-Exclamation
228 Unown-Question
229 Wobbuffet
230 Girafarig
231 Pineco
232 Forretress
233 Dunsparce
234 Gligar
235 Steelix
236 Snubbull
237 Granbull
238 Qwilfish
239 Scizor
240 Shuckle
241 Heracross
242 Sneasel
243 Teddiursa
244 Ursaring
245 Slugma
246 Magcargo
247 Swinub
248 Piloswine
249 Corsola
250 Remoraid
251 Octillery
252 Delibird
253 Mantine
254 Skarmory
255 Houndour
256 Houndoom
257 Kingdra
258 Phanpy
259 Donphan
260 Porygon2
261 Stantler
262 Smeargle
263 Tyrogue
264 Hitmontop
265 Smoochum
266 Elekid
267 Magby
268 Miltank
269 Blissey
270 Raikou
271 Entei
272 Suicune
273 Larvitar
274 Pupitar
275 Tyranitar
276 Lugia
277 Ho-Oh
278 Celebi
279 Treecko
280 Grovyle
281 Sceptile
282 Torchic
283 Combusken
284 Blaziken
285 Mudkip
286 Marshtomp
287 Swampert
288 Poochyena
289 Mightyena
290 Zigzagoon
291 Linoone
292 Wurmple
293 Silcoon
294 Beautifly
295 Cascoon
296 Dustox
297 Lotad
298 Lombre
299 Ludicolo
300 Seedot
301 Nuzleaf
302 Shiftry
303 Taillow
304 Swellow
305 Wingull
306 Pelipper
307 Ralts
308 Kirlia
309 Gardevoir
310 Surskit
311 Masquerain
312 Shroomish
313 Breloom
314 Slakoth
315 Vigoroth
316 Slaking
317 Nincada
318 Ninjask
319 Shedinja
320 Whismur
321 Loudred
322 Exploud
323 Makuhita
324 Hariyama
325 Azurill
326 Nosepass
327 Skitty
328 Delcatty
329 Sableye
330 Mawile
331 Aron
332 Lairon
333 Aggron
334 Meditite
335 Medicham
336 Electrike
337 Manectric
338 Plusle
339 Minun
340 Volbeat
341 Illumise
342 Roselia
343 Gulpin
344 Swalot
345 Carvanha
346 Sharpedo
347 Wailmer
348 Wailord
349 Numel
350 Camerupt
351 Torkoal
352 Spoink
353 Grumpig
354 Spinda
355 Trapinch
356 Vibrava
357 Flygon
358 Cacnea
359 Cacturne
360 Swablu
361 Altaria
362 Zangoose
363 Seviper
364 Lunatone
365 Solrock
366 Barboach
367 Whiscash
368 Corphish
369 Crawdaunt
370 Baltoy
371 Claydol
372 Lileep
373 Cradily
374 Anorith
375 Armaldo
376 Feebas
377 Milotic
378 Castform
379 Kecleon
380 Shuppet
381 Banette
382 Duskull
383 Dusclops
384 Tropius
385 Chimecho
386 Absol
387 Wynaut
388 Snorunt
389 Glalie
390 Spheal
391 Sealeo
392 Walrein
393 Clamperl
394 Huntail
395 Gorebyss
396 Relicanth
397 Luvdisc
398 Bagon
399 Shelgon
400 Salamence
401 Beldum
402 Metang
403 Metagross
404 Regirock
405 Regice
406 Registeel
407 Latias
408 Latios
409 Kyogre
410 Kyogre Primal
411 Groudon
412 Groudon Primal
413 Rayquaza
414 Jirachi
415 Deoxys
416 Turtwig
417 Grotle
418 Torterra
419 Chimchar
420 Monferno
421 Infernape
422 Piplup
423 Prinplup
424 Empoleon
425 Starly
426 Staravia
427 Staraptor
428 Bidoof
429 Bibarel
430 Kricketot
431 Kricketune
432 Shinx
433 Luxio
434 Luxray
435 Budew
436 Roserade
437 Cranidos
438 Rampardos
439 Shieldon
440 Bastiodon
441 Burmy Plant Cloak
442 Burmy Sand Cloak
443 Burmy Trash Cloak
444 Wormadam Plant Cloak
445 Wormadam Sand Cloak
446 Wormadam Trash Cloak
447 Mothim
448 Combee
449 Vespiquen
450 Pachirisu
451 Buizel
452 Floatzel
453 Cherubi
454 Cherrim
455 Shellos West Sea
456 Shellos East Sea
457 Gastrodon West Sea
458 Gastrodon East Sea
459 Ambipom
460 Drifloon
461 Drifblim
462 Buneary
463 Lopunny
464 Mismagius
465 Honchkrow
466 Glameow
467 Purugly
468 Chingling
469 Stunky
470 Skuntank
471 Bronzor
472 Bronzong
473 Bonsly
474 Mime Jr.
475 Happiny
476 Chatot
477 Spiritomb
478 Gible
479 Gabite
480 Garchomp
481 Munchlax
482 Riolu
483 Lucario
484 Hippopotas
485 Hippowdon
486 Skorupi
487 Drapion
488 Croagunk
489 Toxicroak
490 Carnivine
491 Finneon
492 Lumineon
493 Mantyke
494 Snover
495 Abomasnow
496 Weavile
497 Magnezone
498 Lickilicky
499 Rhyperior
500 Tangrowth
501 Electivire
502 Magmortar
503 Togekiss
504 Yanmega
505 Leafeon
506 Glaceon
507 Gliscor
508 Mamoswine
509 Porygon-Z
510 Gallade
511 Probopass
512 Dusknoir
513 Froslass
514 Rotom
515 Rotom Heat
516 Rotom Wash
517 Rotom Frost
518 Rotom Fan
519 Rotom Mow
520 Uxie
521 Mesprit
522 Azelf
523 Dialga
524 Palkia
525 Heatran
526 Regigigas
527 Giratina
528 Giratina Origin
529 Cresselia
530 Phione
531 Manaphy
532 Darkrai
533 Shaymin
534 Shaymin Sky
535 Arceus
536 Victini
537 Snivy
538 Servine
539 Serperior
540 Tepig
541 Pignite
542 Emboar
543 Oshawott
544 Dewott
545 Samurott
546 Patrat
547 Watchog
548 Lillipup
549 Herdier
550 Stoutland
551 Purrloin
552 Liepard
553 Pansage
554 Simisage
555 Pansear
556 Simisear
557 Panpour
558 Simipour
559 Munna
560 Musharna
561 Pidove
562 Tranquill
563 Unfezant Male
564 Blitzle
565 Zebstrika
566 Roggenrola
567 Boldore
568 Gigalith
569 Woobat
570 Swoobat
571 Drilbur
572 Excadrill
573 Audino
574 Timburr
575 Gurdurr
576 Conkeldurr
577 Tympole
578 Palpitoad
579 Seismitoad
580 Throh
581 Sawk
582 Sewaddle
583 Swadloon
584 Leavanny
585 Venipede
586 Whirlipede
587 Scolipede
588 Cottonee
589 Whimsicott
590 Petilil
591 Lilligant
592 Basculin Red-Striped Form
593 Basculin Blue-Striped Form
594 Sandile
595 Krokorok
596 Krookodile
597 Darumaka
598 Darmanitan
599 Maractus
600 Dwebble
601 Crustle
602 Scraggy
603 Scrafty
604 Sigilyph
605 Yamask
606 Cofagrigus
607 Tirtouga
608 Carracosta
609 Archen
610 Archeops
611 Trubbish
612 Garbodor
613 Zorua
614 Zoroark
615 Minccino
616 Cinccino
617 Gothita
618 Gothorita
619 Gothitelle
620 Solosis
621 Duosion
622 Reuniclus
623 Ducklett
624 Swanna
625 Vanillite
626 Vanillish
627 Vanilluxe
628 Deerling Spring Form
629 Deerling Summer Form
630 Deerling Autumn Form
631 Deerling Winter Form
632 Sawsbuck Spring Form
633 Sawsbuck Summer Form
634 Sawsbuck Autumn Form
635 Sawsbuck Winter Form
636 Emolga
637 Karrablast
638 Escavalier
639 Foongus
640 Amoonguss
641 Frillish Male
642 Frillish Female
643 Jellicent Male
644 Jellicent Female
645 Alomomola
646 Joltik
647 Galvantula
648 Ferroseed
649 Ferrothorn
650 Klink
651 Klang
652 Klinklang
653 Tynamo
654 Eelektrik
655 Eelektross
656 Elgyem
657 Beheeyem
658 Litwick
659 Lampent
660 Chandelure
661 Axew
662 Fraxure
663 Haxorus
664 Cubchoo
665 Beartic
666 Cryogonal
667 Shelmet
668 Accelgor
669 Stunfisk
670 Mienfoo
671 Mienshao
672 Druddigon
673 Golett
674 Golurk
675 Pawniard
676 Bisharp
677 Bouffalant
678 Rufflet
679 Braviary
680 Vullaby
681 Mandibuzz
682 Heatmor
683 Durant
684 Deino
685 Zweilous
686 Hydreigon
687 Larvesta
688 Volcarona
689 Cobalion
690 Terrakion
691 Virizion
692 Tornadus
693 Tornadus-T
694 Thundurus
695 Thundurus-T
696 Reshiram
697 Zekrom
698 Landorus
699 Landorus-T
700 Kyurem
701 Kyurem White
702 Kyurem Black
703 Keldeo
704 Keldeo Resolute
705 Meloetta Aria Forme
706 Genesect
707 Genesect Shiny
708 Chespin
709 Quilladin
710 Chesnaught
711 Fennekin
712 Braixen
713 Delphox
714 Froakie
715 Frogadier
716 Greninja
717 Bunnelby
718 Diggersby
719 Fletchling
720 Fletchinder
721 Talonflame
722 Scatterbug
723 Spewpa
724 Vivillon
725 Litleo
726 Pyroar Male
727 Pyroar Female
728 Flabébé
729 Floette
730 Florges
731 Skiddo
732 Gogoat
733 Pancham
734 Pangoro
735 Furfrou
736 Espurr
737 Meowstic Male
738 Meowstic Female
739 Honedge
740 Doublade
741 Aegislash
742 Spritzee
743 Aromatisse
744 Swirlix
745 Slurpuff
746 Inkay
747 Malamar
748 Binacle
749 Barbaracle
750 Skrelp
751 Dragalge
752 Clauncher
753 Clawitzer
754 Helioptile
755 Heliolisk
756 Tyrunt
757 Tyrantrum
758 Amaura
759 Aurorus
760 Sylveon
761 Hawlucha
762 Dedenne
763 Carbink
764 Goomy
765 Sliggoo
766 Goodra
767 Klefki
768 Phantump
769 Trevenant
770 Pumpkaboo
771 Gourgeist
772 Bergmite
773 Avalugg
774 Noibat
775 Noivern
776 Xerneas
777 Yveltal
778 Zygarde 50% Forme
779 Diancie
780 Hoopa Confined
781 Hoopa Unbound
782 Volcanion
783 Bulbasaur Winking
784 Charmander Winking
785 Squirtle Winking
786 Pikachu Angry
787 Pikachu Winking
788 Pikachu Sleeping
789 Pikachu Disappointed
790 Pikachu Fired Up
791 Pikachu Surprised
792 Pikachu Enamored
793 Pikachu Teary
794 Pikachu Dejected
795 Pikachu Smiling
796 Pikachu Dizzy
797 Pikachu Happy
798 Pikachu Spooky
799 Pikachu Holiday
800 Raichu Winking
801 Clefairy Winking
802 Clefable Winking
803 Jigglypuff Winking
804 Wigglytuff Winking
805 Gengar Smiling
806 Chansey Winking
807 Magikarp Shiny
808 Gyarados Shiny
809 Chikorita Winking
810 Cyndaquil Winking
811 Totodile Winking
812 Togetic Winking
813 Marill Winking
814 Azumarill Winking
815 Hoppip Winking
816 Skiploom Winking
817 Jumpluff Winking
818 Snubbull Winking
819 Granbull Winking
820 Delibird Holiday
821 Blissey Winking
822 Treecko Winking
823 Torchic Winking
824 Mudkip Winking
825 Shroomish Winking
826 Delcatty Winking
827 Sableye Costumed
828 Plusle Winking
829 Minun Winking
830 Castform Winking
831 Snorunt Winking
832 Glalie Winking
833 Rayquaza Shiny
834 Turtwig Winking
835 Chimchar Winking
836 Piplup Winking
837 Roserade Winking
838 Pachirisu Winking
839 Cherubi Winking
840 Cherrim Winking
841 Snover Holiday
842 Togekiss Winking
843 Phione Winking
844 Manaphy Winking
845 Snivy Winking
846 Tepig Winking
847 Oshawott Winking
848 Audino Winking
849 Cottonee Winking
850 Whimsicott Winking
851 Vanillite Smiling
852 Cubchoo Holiday
853 Chespin Winking
854 Fennekin Winking
855 Froakie Winking
856 Greninja Ash
857 Flabébé Winking
858 Floette Winking
859 Aromatisse Winking
860 Swirlix Winking
861 Slurpuff Winking
862 Dedenne Winking
863 Carbink Winking
864 Pumpkaboo Smiling
865 Gourgeist Smiling
866 Zygarde 10% Forme
867 Zygarde Complete Forme
868 Charizard Shiny
869 Pikachu Costume (Charizard)
870 Pikachu Costume (Magikarp)
871 Pikachu Costume (Gyarados)
872 Pikachu Costume (Shiny Gyarados)
873 Pikachu Costume (Ho-Oh)
874 Pikachu Costume (Lugia)
875 Pikachu Imperial
876 Pikachu Kimono
877 Pikachu Costume (Rayquaza)
878 Pikachu Costume (Shiny Rayquaza)

879 Pikachu Celebration (Smart)
880 Pikachu Celebration (W Hat)
882 Pikachu Celebration (Festival)
883 Pikachu Celebration (Sailor)

887 Pikachu Celebration (Present)
889 Pikachu Celebration (Futon)
881 Pikachu Celebration (Hoodie)
888 Pikachu Celebration (Entei)
886 Pikachu Celebration (Dark Hoodie)
884 Pikachu Celebration (Chef)
885 Pikachu Celebration (Artist)
890 Pikachu Celebration (Graduate)

891 Gengar Shiny
892 Mewtwo Shiny
893 Wobbuffet Female
894 Tyranitar Shiny
895 Ho-Oh Shiny
896 Gardevoir Shiny
897 Castform Fire
898 Castform Water
899 Castform Wind
900 Metagross Shiny
901 Deoxys Speed
902 Deoxys Defense
903 Deoxys Attack
904 Hippopotas Female
905 Hippowdon Female
906 Unfezant Female
907 Meloetta Pirouette Forme
908 Vivillon Pokéball
909 Hawlucha Shiny
910 Xerneas Shiny
911 Yveltal Shiny
912 Zygarde Core
913 Zygarde Cell
914 Diancie Shiny
915 Rattata Alola Form
916 Raticate Alola Form
917 Pikachu Original Cap
918 Pikachu Hoenn Cap
919 Pikachu Shinnoh Cap
920 Pikachu Unova Cap
921 Pikachu Kalos Cap
922 Pikachu Alola Form Cap
923 Raichu Alola Form
924 Sandshrew Alola Form
925 Sandslash Alola Form
926 Vulpix Alola Form
927 Ninetales Alola Form
928 Diglett Alola Form
929 Dugtrio Alola Form
930 Meowth Alola Form
931 Persian Alola Form
932 Geodude Alola Form
933 Graveler Alola Form
934 Golem Alola Form
935 Grimer Alola Form
936 Muk Alola Form
937 Exeggutor Alola Form
938 Marowak Alola Form
939 Rowlet
940 Dartrix
941 Decidueye
942 Litten
943 Torracat
944 Incineroar
945 Popplio
946 Brionne
947 Primarina
948 Pikipek
949 Trumbeak
950 Toucannon
951 Yungoos
952 Gumshoos
953 Grubbin
954 Charjabug
955 Vikavolt
956 Crabrawler
957 Crabominable
958 Oricorio Fire
959 Oricorio Electrik
960 Oricorio Psychic
961 Oricorio Ghost
962 Cutiefly
963 Ribombee
964 Rockruff
965 Lycanroc
966 Wishiwashi
967 Mareanie
968 Toxapex
969 Mudbray
970 Mudsdale
971 Dewpider
972 Araquanid
973 Fomantis
974 Lurantis
975 Morelull
976 Shiinotic
977 Salandit
978 Salazzle
979 Stufful
980 Bewear
981 Bounsweet
982 Steenee
983 Tsareena
984 Comfey
985 Oranguru
986 Passimian
987 Wimpod
988 Golisopod
989 Sandygast
990 Palossand
991 Pyukumuku
992 Type: Null
993 Silvally
994 Minior
995 Komala
996 Turtonator
997 Togedemaru
998 Mimikyu
999 Bruxish
1000 Drampa
1001 Dhelmise
1002 Jangmo-o
1003 Hakamo-o
1004 Kommo-o
1005 Tapu Koko
1006 Tapu Lele
1007 Tapu Bulu
1008 Tapu Fini
1009 Cosmog
1010 Cosmoem
1011 Solgaleo
1012 Lunala
1013 Nihilego
1014 Buzzwole
1015 Pheromosa
1016 Xurkitree
1017 Celesteela
1018 Kartana
1019 Guzzlord
1020 Necrozma
1021 Magearna
1022 Marshadow
`.split('\n').map(a => {
  return [a.split(' ')[0],  a.split(' ').slice(1).join(' ').replace(/\W/g,'').toLowerCase()];
});

setTimeout(async () => {
  await func(`C:\\rc\\rainingchain\\src\\pokemonCompletion\\data\\Shuffle.json`, (col, cat) => {
    if(cat === 'pokemon'){
      if(col.id !== "-1")
        return;

      const n = col.name.replace(/\W/g,'').toLowerCase();
      let idx = list.findIndex(el => el[1] === n);
      let id = idx === -1 ? -1 : list[idx][0];
      console.log(n, id, idx, list[idx]);
      delete col.id;
      return {id:"" + id, ...col};
    }
    /*const em = eme.categories.find(c => c.id === cat);
    if(!em)
      return null;

    const emel = em.list.find(a => a.name === col.name);
    if(emel && emel.iconUrl)
      col.iconUrl = emel.iconUrl;
    return col;*/
  });
}, 1);
}

if(false){
setTimeout(async () => {
  let a =
[
["Main stage 1","Espurr"],
["Main stage 2","Bulbasaur"],
["Main stage 3","Squirtle"],
["Main stage 4","Charmander"],
["Main stage 5","Eevee"],
["Main stage 6","Pidgey"],
["Main stage 7","Togepi"],
["Main stage 8","Pichu"],
["Main stage 9","Audino"],
["Main stage 10","Mega Audino"],
["Main stage 11","Happiny"],
["Main stage 12","Mareep"],
["Main stage 13","Purrloin"],
["Main stage 14","Torchic"],
["Main stage 15","Phanpy"],
["Main stage 16","Nidoran-F"],
["Main stage 17","Nidoran-M"],
["Main stage 18","Klefki"],
["Main stage 19","Kangaskhan"],
["Main stage 20","Mega Kangaskhan"],
["Main stage 21","Buneary"],
["Main stage 22","Treecko"],
["Main stage 23","Pikachu"],
["Main stage 24","Sableye"],
["Main stage 25","Litwick"],
["Main stage 26","Chingling"],
["Main stage 27","Swirlix"],
["Main stage 28","Volbeat"],
["Main stage 29","Illumise"],
["Main stage 30","Mega Sableye"],
["Main stage 31","Slowpoke"],
["Main stage 32","Azurill"],
["Main stage 33","Riolu"],
["Main stage 34","Swablu"],
["Main stage 35","Surskit"],
["Main stage 36","Taillow"],
["Main stage 37","Meowth"],
["Main stage 38","Croagunk"],
["Main stage 39","Corsola"],
["Main stage 40","Marill"],
["Main stage 41","Mudkip"],
["Main stage 42","Vulpix"],
["Main stage 43","Lapras"],
["Main stage 44","Pidgeotto"],
["Main stage 45","Mega Slowbro"],
["Main stage 46","Minccino"],
["Main stage 47","Vanillite"],
["Main stage 48","Chatot"],
["Main stage 49","Axew"],
["Main stage 50","Zorua"],
["Main stage 51","Mawile"],
["Main stage 52","Lopunny"],
["Main stage 53","Flaaffy"],
["Main stage 54","Vaporeon"],
["Main stage 55","Charmeleon"],
["Main stage 56","Buizel"],
["Main stage 57","Wartortle"],
["Main stage 58","Hawlucha"],
["Main stage 59","Ivysaur"],
["Main stage 60","Mega Lopunny"],
["Main stage 61","Bonsly"],
["Main stage 62","Gastly"],
["Main stage 63","Marshtomp"],
["Main stage 64","Dratini"],
["Main stage 65","Amaura"],
["Main stage 66","Combusken"],
["Main stage 67","Meowstic\nMale"],
["Main stage 68","Togetic"],
["Main stage 69","Slowbro"],
["Main stage 70","Umbreon"],
["Main stage 71","Espeon"],
["Main stage 72","Grovyle"],
["Main stage 73","Swellow"],
["Main stage 74","Cubone"],
["Main stage 75","Mega Altaria"],
["Main stage 76","Azumarill"],
["Main stage 77","Mienfoo"],
["Main stage 78","Snorunt"],
["Main stage 79","Sylveon"],
["Main stage 80","Miltank"],
["Main stage 81","Meowstic\nFemale"],
["Main stage 82","Masquerain"],
["Main stage 83","Cottonee"],
["Main stage 84","Petilil"],
["Main stage 85","Dedenne"],
["Main stage 86","Slurpuff"],
["Main stage 87","Liepard"],
["Main stage 88","Chansey"],
["Main stage 89","Gulpin"],
["Main stage 90","Mega Mawile"],
["Main stage 91","Bronzor"],
["Main stage 92","Emolga"],
["Main stage 93","Sudowoodo"],
["Main stage 94","Scyther"],
["Main stage 95","Nidorina"],
["Main stage 96","Nidorino"],
["Main stage 97","Carbink"],
["Main stage 98","Throh"],
["Main stage 99","Sawk"],
["Main stage 100","Chimecho"],
["Main stage 101","Donphan"],
["Main stage 102","Fraxure"],
["Main stage 103","Raichu"],
["Main stage 104","Aerodactyl"],
["Main stage 105","Mega Ampharos"],
["Main stage 106","Delibird"],
["Main stage 107","Misdreavus"],
["Main stage 108","Glalie"],
["Main stage 109","Dragonair"],
["Main stage 110","Mienshao"],
["Main stage 111","Vanillish"],
["Main stage 112","Jolteon"],
["Main stage 113","Cinccino"],
["Main stage 114","Glaceon"],
["Main stage 115","Blissey"],
["Main stage 116","Aurorus"],
["Main stage 117","Ninetales"],
["Main stage 118","Altaria"],
["Main stage 119","Vanilluxe"],
["Main stage 120","Mega Glalie"],
["Main stage 121","Haunter"],
["Main stage 122","Lampent"],
["Main stage 123","Flareon"],
["Main stage 124","Swalot"],
["Main stage 125","Gengar"],
["Main stage 126","Persian"],
["Main stage 127","Lilligant"],
["Main stage 128","Froslass"],
["Main stage 129","Zoroark"],
["Main stage 130","Ampharos"],
["Main stage 131","Mismagius"],
["Main stage 132","Slowking"],
["Main stage 133","Bronzong"],
["Main stage 134","Chandelure"],
["Main stage 135","Mega Gengar"],
["Main stage 136","Stunfisk"],
["Main stage 137","Pidgeot"],
["Main stage 138","Whimsicott"],
["Main stage 139","Marowak"],
["Main stage 140","Nidoqueen"],
["Main stage 141","Nidoking"],
["Main stage 142","Leafeon"],
["Main stage 143","Scizor"],
["Main stage 144","Skarmory"],
["Main stage 145","Floatzel"],
["Main stage 146","Toxicroak"],
["Main stage 147","Togekiss"],
["Main stage 148","Heracross"],
["Main stage 149","Haxorus"],
["Main stage 150","Mega Mewtwo Y"],
["Main stage 151","Munchlax"],
["Main stage 152","Chespin"],
["Main stage 153","Onix"],
["Main stage 154","Froakie"],
["Main stage 155","Smeargle"],
["Main stage 156","Fennekin"],
["Main stage 157","Larvesta"],
["Main stage 158","Feebas"],
["Main stage 159","Poochyena"],
["Main stage 160","Trubbish"],
["Main stage 161","Hippopotas\nMale"],
["Main stage 162","Bagon"],
["Main stage 163","Pancham"],
["Main stage 164","Yamask"],
["Main stage 165","Milotic"],
["Main stage 166","Solosis"],
["Main stage 167","Honedge"],
["Main stage 168","Drilbur"],
["Main stage 169","Larvitar"],
["Main stage 170","Shuppet"],
["Main stage 171","Rufflet"],
["Main stage 172","Bergmite"],
["Main stage 173","Mightyena"],
["Main stage 174","Snubbull"],
["Main stage 175","Lickitung"],
["Main stage 176","Timburr"],
["Main stage 177","Banette"],
["Main stage 178","Tangela"],
["Main stage 179","Pupitar"],
["Main stage 180","Mega Aerodactyl"],
["Main stage 181","Sneasel"],
["Main stage 182","Duosion"],
["Main stage 183","Snorlax"],
["Main stage 184","Granbull"],
["Main stage 185","Frogadier"],
["Main stage 186","Gurdurr"],
["Main stage 187","Quilladin"],
["Main stage 188","Shelgon"],
["Main stage 189","Braixen"],
["Main stage 190","Steelix"],
["Main stage 191","Blitzle"],
["Main stage 192","Lickilicky"],
["Main stage 193","Pangoro"],
["Main stage 194","Garbodor"],
["Main stage 195","Doublade"],
["Main stage 196","Cofagrigus"],
["Main stage 197","Reuniclus"],
["Main stage 198","Conkeldurr"],
["Main stage 199","Tangrowth"],
["Main stage 200","Tyranitar"],
["Main stage 201","Hippowdon\nMale"],
["Main stage 202","Weavile"],
["Main stage 203","Avalugg"],
["Main stage 204","Braviary"],
["Main stage 205","Excadrill"],
["Main stage 206","Volcarona"],
["Main stage 207","Aegislash"],
["Main stage 208","Zebstrika"],
["Main stage 209","Salamence"],
["Main stage 210","Mega Heracross"],
["Main stage 211","Starly"],
["Main stage 212","Gothita"],
["Main stage 213","Goomy"],
["Main stage 214","Mime Jr."],
["Main stage 215","Staravia"],
["Main stage 216","Gothorita"],
["Main stage 217","Ralts"],
["Main stage 218","Scatterbug"],
["Main stage 219","Spewpa"],
["Main stage 220","Vivillon\nMeadow Pattern"],
["Main stage 221","Meditite"],
["Main stage 222","Skitty"],
["Main stage 223","Kirlia"],
["Main stage 224","Staraptor"],
["Main stage 225","Klink"],
["Main stage 226","Mr. Mime"],
["Main stage 227","Klang"],
["Main stage 228","Gothitelle"],
["Main stage 229","Sliggoo"],
["Main stage 230","Medicham"],
["Main stage 231","Grimer"],
["Main stage 232","Wingull"],
["Main stage 233","Bouffalant"],
["Main stage 234","Muk"],
["Main stage 235","Pawniard"],
["Main stage 236","Delcatty"],
["Main stage 237","Pelipper"],
["Main stage 238","Gardevoir"],
["Main stage 239","Klinklang"],
["Main stage 240","Mega Medicham"],
["Main stage 241","Budew"],
["Main stage 242","Machop"],
["Main stage 243","Shinx"],
["Main stage 244","Whismur"],
["Main stage 245","Luxio"],
["Main stage 246","Spritzee"],
["Main stage 247","Machoke"],
["Main stage 248","Roselia"],
["Main stage 249","Aromatisse"],
["Main stage 250","Roserade"],
["Main stage 251","Inkay"],
["Main stage 252","Chimchar"],
["Main stage 253","Skiddo"],
["Main stage 254","Monferno"],
["Main stage 255","Joltik"],
["Main stage 256","Gogoat"],
["Main stage 257","Loudred"],
["Main stage 258","Galvantula"],
["Main stage 259","Exploud"],
["Main stage 260","Deoxys\nNormal Forme"],
["Main stage 261","Aron"],
["Main stage 262","Flabébé"],
["Main stage 263","Makuhita"],
["Main stage 264","Hariyama"],
["Main stage 265","Munna"],
["Main stage 266","Vullaby"],
["Main stage 267","Musharna"],
["Main stage 268","Lairon"],
["Main stage 269","Gligar"],
["Main stage 270","Aggron"],
["Main stage 271","Tympole"],
["Main stage 272","Nosepass"],
["Main stage 273","Floette"],
["Main stage 274","Mandibuzz"],
["Main stage 275","Spinarak"],
["Main stage 276","Rattata"],
["Main stage 277","Ariados"],
["Main stage 278","Porygon"],
["Main stage 279","Stunky"],
["Main stage 280","Florges"],
["Main stage 281","Raticate"],
["Main stage 282","Chinchou"],
["Main stage 283","Palpitoad"],
["Main stage 284","Probopass"],
["Main stage 285","Igglybuff"],
["Main stage 286","Snover"],
["Main stage 287","Lanturn"],
["Main stage 288","Alomomola"],
["Main stage 289","Abomasnow"],
["Main stage 290","Rayquaza"],
["Main stage 291","Swinub"],
["Main stage 292","Seismitoad"],
["Main stage 293","Jigglypuff"],
["Main stage 294","Doduo"],
["Main stage 295","Piloswine"],
["Main stage 296","Dodrio"],
["Main stage 297","Porygon2"],
["Main stage 298","Skuntank"],
["Main stage 299","Wigglytuff"],
["Main stage 300","Mega Rayquaza"],
["Main stage 301","Pansear"],
["Main stage 302","Paras"],
["Main stage 303","Phantump"],
["Main stage 304","Spoink"],
["Main stage 305","Koffing"],
["Main stage 306","Parasect"],
["Main stage 307","Murkrow"],
["Main stage 308","Trevenant"],
["Main stage 309","Grumpig"],
["Main stage 310","Weezing"],
["Main stage 311","Spearow"],
["Main stage 312","Panpour"],
["Main stage 313","Growlithe"],
["Main stage 314","Spheal"],
["Main stage 315","Pansage"],
["Main stage 316","Tyrunt"],
["Main stage 317","Sealeo"],
["Main stage 318","Fearow"],
["Main stage 319","Mankey"],
["Main stage 320","Tyrantrum"],
["Main stage 321","Magikarp"],
["Main stage 322","Simisear"],
["Main stage 323","Exeggcute"],
["Main stage 324","Golett"],
["Main stage 325","Magnemite"],
["Main stage 326","Finneon"],
["Main stage 327","Sandile"],
["Main stage 328","Magneton"],
["Main stage 329","Teddiursa"],
["Main stage 330","Magnezone"],
["Main stage 331","Simipour"],
["Main stage 332","Kabuto"],
["Main stage 333","Smoochum"],
["Main stage 334","Simisage"],
["Main stage 335","Lumineon"],
["Main stage 336","Omanyte"],
["Main stage 337","Weedle"],
["Main stage 338","Sentret"],
["Main stage 339","Furret"],
["Main stage 340","Golurk"],
["Main stage 341","Kakuna"],
["Main stage 342","Ursaring"],
["Main stage 343","Skorupi"],
["Main stage 344","Primeape"],
["Main stage 345","Jynx"],
["Main stage 346","Krokorok"],
["Main stage 347","Drapion"],
["Main stage 348","Exeggutor"],
["Main stage 349","Krookodile"],
["Main stage 350","Mega Mewtwo X"],
["Main stage 351","Lotad"],
["Main stage 352","Psyduck"],
["Main stage 353","Cranidos"],
["Main stage 354","Yanma"],
["Main stage 355","Glameow"],
["Main stage 356","Lombre"],
["Main stage 357","Golduck"],
["Main stage 358","Trapinch"],
["Main stage 359","Binacle"],
["Main stage 360","Rampardos"],
["Main stage 361","Slugma"],
["Main stage 362","Purugly"],
["Main stage 363","Natu"],
["Main stage 364","Skrelp"],
["Main stage 365","Magcargo"],
["Main stage 366","Barbaracle"],
["Main stage 367","Combee"],
["Main stage 368","Deino"],
["Main stage 369","Xatu"],
["Main stage 370","Dragalge"],
["Main stage 371","Vespiquen"],
["Main stage 372","Zweilous"],
["Main stage 373","Unown\nExclamation"],
["Main stage 374","Horsea"],
["Main stage 375","Shieldon"],
["Main stage 376","Scraggy"],
["Main stage 377","Rhyhorn"],
["Main stage 378","Patrat"],
["Main stage 379","Seadra"],
["Main stage 380","Bastiodon"],
["Main stage 381","Rhydon"],
["Main stage 382","Scrafty"],
["Main stage 383","Unown\nQuestion"],
["Main stage 384","Watchog"],
["Main stage 385","Shellos\nWest Sea"],
["Main stage 386","Vibrava"],
["Main stage 387","Elekid"],
["Main stage 388","Bunnelby"],
["Main stage 389","Gastrodon\nWest Sea"],
["Main stage 390","Flygon"],
["Main stage 391","Electabuzz"],
["Main stage 392","Clamperl"],
["Main stage 393","Diggersby"],
["Main stage 394","Cacnea"],
["Main stage 395","Huntail"],
["Main stage 396","Magby"],
["Main stage 397","Cacturne"],
["Main stage 398","Gorebyss"],
["Main stage 399","Magmar"],
["Main stage 400","Mega Scizor"],
["Main stage 401","Tynamo"],
["Main stage 402","Squirtle"],
["Main stage 403","Phanpy"],
["Main stage 404","Eelektrik"],
["Main stage 405","Seel"],
["Main stage 406","Charmander"],
["Main stage 407","Chikorita"],
["Main stage 408","Dewgong"],
["Main stage 409","Donphan"],
["Main stage 410","Eelektross"],
["Main stage 411","Wartortle"],
["Main stage 412","Geodude"],
["Main stage 413","Charmeleon"],
["Main stage 414","Bayleef"],
["Main stage 415","Graveler"],
["Main stage 416","Eevee"],
["Main stage 417","Snorunt"],
["Main stage 418","Espurr"],
["Main stage 419","Gulpin"],
["Main stage 420","Mega Tyranitar"],
["Main stage 421","Frillish\nMale"],
["Main stage 422","Hawlucha"],
["Main stage 423","Umbreon"],
["Main stage 424","Bulbasaur"],
["Main stage 425","Poliwag"],
["Main stage 426","Cyndaquil"],
["Main stage 427","Glalie"],
["Main stage 428","Meowstic\nMale"],
["Main stage 429","Swalot"],
["Main stage 430","Jellicent\nMale"],
["Main stage 431","Meowstic\nFemale"],
["Main stage 432","Slakoth"],
["Main stage 433","Totodile"],
["Main stage 434","Pidgey"],
["Main stage 435","Venipede"],
["Main stage 436","Ivysaur"],
["Main stage 437","Croconaw"],
["Main stage 438","Minccino"],
["Main stage 439","Whirlipede"],
["Main stage 440","Vigoroth"],
["Main stage 441","Espeon"],
["Main stage 442","Voltorb"],
["Main stage 443","Pidgeotto"],
["Main stage 444","Scolipede"],
["Main stage 445","Cinccino"],
["Main stage 446","Audino"],
["Main stage 447","Poliwhirl"],
["Main stage 448","Quilava"],
["Main stage 449","Pidgeot"],
["Main stage 450","Hoopa\nHoopa Unbound"],
["Main stage 451","Duskull"],
["Main stage 452","Archen"],
["Main stage 453","Nincada"],
["Main stage 454","Bidoof"],
["Main stage 455","Dusclops"],
["Main stage 456","Ferroseed"],
["Main stage 457","Shedinja"],
["Main stage 458","Sableye"],
["Main stage 459","Flareon"],
["Main stage 460","Ferrothorn"],
["Main stage 461","Zorua"],
["Main stage 462","Beldum"],
["Main stage 463","Vaporeon"],
["Main stage 464","Volbeat"],
["Main stage 465","Zoroark"],
["Main stage 466","Metang"],
["Main stage 467","Jolteon"],
["Main stage 468","Illumise"],
["Main stage 469","Bibarel"],
["Main stage 470","Metagross"],
["Main stage 471","Wailmer"],
["Main stage 472","Seedot"],
["Main stage 473","Klefki"],
["Main stage 474","Pichu"],
["Main stage 475","Tirtouga"],
["Main stage 476","Nuzleaf"],
["Main stage 477","Pikachu"],
["Main stage 478","Pumpkaboo"],
["Main stage 479","Happiny"],
["Main stage 480","Shiftry"],
["Main stage 481","Raichu"],
["Main stage 482","Baltoy"],
["Main stage 483","Helioptile"],
["Main stage 484","Gourgeist"],
["Main stage 485","Burmy\nPlant Cloak"],
["Main stage 486","Shroomish"],
["Main stage 487","Chansey"],
["Main stage 488","Axew"],
["Main stage 489","Shuppet"],
["Main stage 490","Claydol"],
["Main stage 491","Heliolisk"],
["Main stage 492","Fraxure"],
["Main stage 493","Blissey"],
["Main stage 494","Wormadam\nPlant Cloak"],
["Main stage 495","Haxorus"],
["Main stage 496","Skarmory"],
["Main stage 497","Mothim"],
["Main stage 498","Banette"],
["Main stage 499","Kangaskhan"],
["Main stage 500","Mega Metagross"],
["Main stage 501","Bellsprout"],
["Main stage 502","Carbink"],
["Main stage 503","Emolga"],
["Main stage 504","Weepinbell"],
["Main stage 505","Munchlax"],
["Main stage 506","Togepi"],
["Main stage 507","Lileep"],
["Main stage 508","Purrloin"],
["Main stage 509","Litleo"],
["Main stage 510","Snorlax"],
["Main stage 511","Woobat"],
["Main stage 512","Togetic"],
["Main stage 513","Liepard"],
["Main stage 514","Sawk"],
["Main stage 515","Pyroar\nFemale"],
["Main stage 516","Aerodactyl"],
["Main stage 517","Swoobat"],
["Main stage 518","Togekiss"],
["Main stage 519","Throh"],
["Main stage 520","Anorith"],
["Main stage 521","Vanillite"],
["Main stage 522","Corphish"],
["Main stage 523","Shelmet"],
["Main stage 524","Foongus"],
["Main stage 525","Pyroar\nMale"],
["Main stage 526","Vanillish"],
["Main stage 527","Crawdaunt"],
["Main stage 528","Karrablast"],
["Main stage 529","Vanilluxe"],
["Main stage 530","Mega Salamence"],
["Main stage 531","Hoppip"],
["Main stage 532","Dratini"],
["Main stage 533","Litwick"],
["Main stage 534","Skiploom"],
["Main stage 535","Dragonair"],
["Main stage 536","Sylveon"],
["Main stage 537","Oshawott"],
["Main stage 538","Mareep"],
["Main stage 539","Lampent"],
["Main stage 540","Dragonite"],
["Main stage 541","Tentacool"],
["Main stage 542","Flaaffy"],
["Main stage 543","Dewott"],
["Main stage 544","Cubchoo"],
["Main stage 545","Ampharos"],
["Main stage 546","Tentacruel"],
["Main stage 547","Chandelure"],
["Main stage 548","Beartic"],
["Main stage 549","Lapras"],
["Main stage 550","Mega Aggron"],
["Main stage 551","Gastly"],
["Main stage 552","Tauros"],
["Main stage 553","Ponyta"],
["Main stage 554","Shellos\nEast Sea"],
["Main stage 555","Haunter"],
["Main stage 556","Ekans"],
["Main stage 557","Gengar"],
["Main stage 558","Ralts"],
["Main stage 559","Gastrodon\nEast Sea"],
["Main stage 560","Arbok"],
["Main stage 561","Pancham"],
["Main stage 562","Mawile"],
["Main stage 563","Ducklett"],
["Main stage 564","Kirlia"],
["Main stage 565","Clauncher"],
["Main stage 566","Swanna"],
["Main stage 567","Wurmple"],
["Main stage 568","Pangoro"],
["Main stage 569","Diglett"],
["Main stage 570","Clawitzer"],
["Main stage 571","Silcoon"],
["Main stage 572","Gardevoir"],
["Main stage 573","Poochyena"],
["Main stage 574","Ditto"],
["Main stage 575","Gallade"],
["Main stage 576","Glaceon"],
["Main stage 577","Miltank"],
["Main stage 578","Beautifly"],
["Main stage 579","Mightyena"],
["Main stage 580","Mega Gallade"],
["Main stage 581","Cascoon"],
["Main stage 582","Remoraid"],
["Main stage 583","Timburr"],
["Main stage 584","Dustox"],
["Main stage 585","Gurdurr"],
["Main stage 586","Spinda"],
["Main stage 587","Dwebble"],
["Main stage 588","Conkeldurr"],
["Main stage 589","Leafeon"],
["Main stage 590","Crustle"],
["Main stage 591","Carvanha"],
["Main stage 592","Vulpix"],
["Main stage 593","Snivy"],
["Main stage 594","Basculin\nRed-Striped Form"],
["Main stage 595","Larvesta"],
["Main stage 596","Ninetales"],
["Main stage 597","Servine"],
["Main stage 598","Sharpedo"],
["Main stage 599","Volcarona"],
["Main stage 600","Mega Sharpedo"],
["Main stage 601","Kricketot"],
["Main stage 602","Bagon"],
["Main stage 603","Cryogonal"],
["Main stage 604","Kricketune"],
["Main stage 605","Croagunk"],
["Main stage 606","Shelgon"],
["Main stage 607","Basculin\nBlue-Striped Form"],
["Main stage 608","Snover"],
["Main stage 609","Toxicroak"],
["Main stage 610","Salamence"],
["Main stage 611","Hippopotas\nMale"],
["Main stage 612","Turtwig"],
["Main stage 613","Abomasnow"],
["Main stage 614","Cherubi"],
["Main stage 615","Buneary"],
["Main stage 616","Hippowdon\nMale"],
["Main stage 617","Cherrim"],
["Main stage 618","Grotle"],
["Main stage 619","Lopunny"],
["Main stage 620","Mega Abomasnow"],
["Main stage 621","Torchic"],
["Main stage 622","Deerling\nAutumn Form"],
["Main stage 623","Combusken"],
["Main stage 624","Misdreavus"],
["Main stage 625","Octillery"],
["Main stage 626","Sneasel"],
["Main stage 627","Sawsbuck\nAutumn Form"],
["Main stage 628","Weavile"],
["Main stage 629","Mismagius"],
["Main stage 630","Victreebel"],
["Main stage 631","Feebas"],
["Main stage 632","Larvitar"],
["Main stage 633","Meowth"],
["Main stage 634","Milotic"],
["Main stage 635","Piplup"],
["Main stage 636","Pupitar"],
["Main stage 637","Prinplup"],
["Main stage 638","Persian"],
["Main stage 639","Tyranitar"],
["Main stage 640","Deoxys\nDefense Forme"],
["Main stage 641","Wooper"],
["Main stage 642","Chansey"],
["Main stage 643","Frillish\nMale"],
["Main stage 644","Quagsire"],
["Main stage 645","Blissey"],
["Main stage 646","Tympole"],
["Main stage 647","Jellicent\nMale"],
["Main stage 648","Castform\nSunny Form"],
["Main stage 649","Tyrunt"],
["Main stage 650","Yveltal\nShiny"],
["Main stage 651","Zubat"],
["Main stage 652","Palpitoad"],
["Main stage 653","Tyrantrum"],
["Main stage 654","Treecko"],
["Main stage 655","Onix"],
["Main stage 656","Grovyle"],
["Main stage 657","Seismitoad"],
["Main stage 658","Castform (Snowy Form)"],
["Main stage 659","Golbat"],
["Main stage 660","Empoleon"],
["Main stage 661","Sandshrew"],
["Main stage 662","Tepig"],
["Main stage 663","Steelix"],
["Main stage 664","Castform (Rainy Form)"],
["Main stage 665","Pignite"],
["Main stage 666","Drowzee"],
["Main stage 667","Crobat"],
["Main stage 668","Sandslash"],
["Main stage 669","Hypno"],
["Main stage 670","Xerneas\nShiny"],
["Main stage 671","Deerling\nWinter Form"],
["Main stage 672","Honedge"],
["Main stage 673","Lillipup"],
["Main stage 674","Sawsbuck\nWinter Form"],
["Main stage 675","Doublade"],
["Main stage 676","Herdier"],
["Main stage 677","Elgyem"],
["Main stage 678","Stoutland"],
["Main stage 679","Drilbur"],
["Main stage 680","Aegislash"],
["Main stage 681","Beheeyem"],
["Main stage 682","Rufflet"],
["Main stage 683","Excadrill"],
["Main stage 684","Braviary"],
["Main stage 685","Rayquaza\nShiny"],
["Main stage 686","Lickitung"],
["Main stage 687","Cleffa"],
["Main stage 688","Burmy\nSandy Cloak"],
["Main stage 689","Barboach"],
["Main stage 690","Torterra"],
["Main stage 691","Clefairy"],
["Main stage 692","Mudkip"],
["Main stage 693","Lickilicky"],
["Main stage 694","Wormadam\nSandy Cloak"],
["Main stage 695","Marshtomp"],
["Main stage 696","Roselia"],
["Main stage 697","Clefable"],
["Main stage 698","Roserade"],
["Main stage 699","Whiscash"],
["Main stage 700","Kyogre\nPrimal Kyogre"],
["Expert stage 1","Absol"],
["Expert stage 2","Rotom"],
["Expert stage 3","Lucario"],
["Expert stage 4","Articuno"],
["Expert stage 5","Zapdos"],
["Expert stage 6","Moltres"],
["Expert stage 7","Venusaur"],
["Expert stage 8","Blastoise"],
["Expert stage 9","Charizard"],
["Expert stage 10","Dragonite"],
["Expert stage 11","Sceptile"],
["Expert stage 12","Blaziken"],
["Expert stage 13","Swampert"],
["Expert stage 14","Entei"],
["Expert stage 15","Suicune"],
["Expert stage 16","Raikou"],
["Expert stage 17","Heatran"],
["Expert stage 18","Xerneas"],
["Expert stage 19","Yveltal"],
["Expert stage 20","Mewtwo"],
["Expert stage 21","Genesect"],
["Expert stage 22","Chesnaught"],
["Expert stage 23","Delphox"],
["Expert stage 24","Greninja"],
["Expert stage 25","Terrakion"],
["Expert stage 26","Virizion"],
["Expert stage 27","Cobalion"],
["Expert stage 28","Bisharp"],
["Expert stage 29","Gallade"],
["Expert stage 30","Goodra"],
["Expert stage 31","Luxray"],
["Expert stage 32","Malamar"],
["Expert stage 33","Mamoswine"],
["Expert stage 34","Gliscor"],
["Expert stage 35","Porygon-Z"],
["Expert stage 36","Walrein"],
["Expert stage 37","Honchkrow"],
["Expert stage 38","Arcanine"],
["Expert stage 39","Yanmega"],
["Expert stage 40","Ludicolo"],
["Expert stage 41","Hydreigon"],
["Expert stage 42","Poliwrath"],
["Expert stage 43","Electrode"],
["Expert stage 44","Ninjask"],
["Expert stage 45","Mantine"],
["Expert stage 46","Jumpluff"],
["Expert stage 47","Samurott"],
["Expert stage 48","Rapidash"],
["Expert stage 49","Serperior"],
["Expert stage 50","Dugtrio"],
["Expert stage 51","Genesect\nShiny"],
["Expert stage 52","Deoxys\nSpeed Forme"],
["Expert stage 53","Groudon\nPrimal Groudon"],
["Special stage Great Challenge (Week 1)", "Mew"],
["Special stage Great Challenge (Week 1)", "Litten"],
["Special stage Great Challenge (Week 1)", "Accelgor"],
["Special stage Great Challenge (Week 1)", "Typhlosion"],
["Special stage Great Challenge (Week 1)", "Roserade\nWinking"],
["Special stage Great Challenge (Week 2)", "Meganium"],
["Special stage Great Challenge (Week 2)", "Rowlet"],
["Special stage Great Challenge (Week 2)", "Amoonguss"],
["Special stage Great Challenge (Week 2)", "Emboar"],
["Special stage Great Challenge (Week 2)", "Ho-Oh"],
["Special stage Great Challenge (Week 3)", "Feraligatr"],
["Special stage Great Challenge (Week 3)", "Popplio"],
["Special stage Great Challenge (Week 3)", "Escavalier"],
["Special stage Great Challenge (Week 3)", "Hawlucha\nShiny"],
["Special stage Great Challenge (Week 4)", "Golem"],
["Special stage Great Challenge (Week 4)", "Wobbuffet\nMale"],
["Special stage Great Challenge (Week 4)", "Celebi"],
["Special stage Great Challenge (Week 4)", "Marowak\nAlola Form"],
["Special stage Great Challenge (Week 4)", "Regirock"],
["Special stage Great Challenge (Week 5)", "Drifloon"],
["Special stage Great Challenge (Week 5)", "Muk\nAlola Form"],
["Special stage Great Challenge (Week 5)", "Kyogre"],
["Special stage Great Challenge (Week 5)", "Regice"],
["Special stage Great Challenge (Week 6)", "Dhelmise"],
["Special stage Great Challenge (Week 6)", "Mimikyu"],
["Special stage Great Challenge (Week 6)", "Cyndaquil\nWinking"],
["Special stage Great Challenge (Week 6)", "Groudon"],
["Special stage Great Challenge (Week 6)", "Registeel"],
["Special stage Great Challenge (Week 7)", "Dialga"],
["Special stage Great Challenge (Week 7)", "Chikorita\nWinking"],
["Special stage Great Challenge (Week 7)", "Lycanroc"],
["Special stage Great Challenge (Week 7)", "Toxapex"],
["Special stage Great Challenge (Week 8)", "Toucannon"],
["Special stage Great Challenge (Week 8)", "Wailord"],
["Special stage Great Challenge (Week 8)", "Totodile\nWinking"],
["Special stage Great Challenge (Week 8)", "Palkia"],
["Special stage Great Challenge (Week 8)", "Wigglytuff\nWinking"],
["Special stage Great Challenge (Week 9)", "Gyarados"],
["Special stage Great Challenge (Week 9)", "Minior"],
["Special stage Great Challenge (Week 9)", "Metagross\nShiny"],
["Special stage Great Challenge (Week 10)", "Mudsdale"],
["Special stage Great Challenge (Week 10)", "Armaldo"],
["Special stage Great Challenge (Week 10)", "Oranguru"],
["Special stage Great Challenge (Week 11)", "Manaphy"],
["Special stage Great Challenge (Week 11)", "Cradily"],
["Special stage Great Challenge (Week 11)", "Chimchar\nWinking"],
["Special stage Great Challenge (Week 11)", "Blissey\nWinking"],
["Special stage Great Challenge (Week 12)", "Togekiss\nWinking"],
["Special stage Great Challenge (Week 12)", "Rhyperior"],
["Special stage Great Challenge (Week 12)", "Turtwig\nWinking"],
["Special stage Great Challenge (Week 12)", "Kingdra"],
["Special stage Great Challenge (Week 12)", "Reshiram"],
["Special stage Great Challenge (Week 13)", "Omastar"],
["Special stage Great Challenge (Week 13)", "Breloom"],
["Special stage Great Challenge (Week 13)", "Piplup\nWinking"],
["Special stage Great Challenge (Week 13)", "Zekrom"],
["Special stage Great Challenge (Week 14)", "Wobbuffet\nFemale"],
["Special stage Great Challenge (Week 14)", "Slaking"],
["Special stage Great Challenge (Week 14)", "Keldeo\nOrdinary Form"],
["Special stage Great Challenge (Week 14)", "Azumarill\nWinking"],
["Special stage Great Challenge (Week 15)", "Bellossom"],
["Special stage Great Challenge (Week 15)", "Exeggutor\nAlola Form"],
["Special stage Great Challenge (Week 15)", "Comfey"],
["Special stage Great Challenge (Week 15)", "Kommo-o"],
["Special stage Great Challenge (Week 15)", "Cresselia"],
["Special stage Great Challenge (Week 16)", "Politoed"],
["Special stage Great Challenge (Week 16)", "Keldeo\nResolute Form"],
["Special stage Great Challenge (Week 16)", "Tepig\nWinking"],
["Special stage Great Challenge (Week 16)", "Machamp"],
["Special stage Great Challenge (Week 16)", "Zygarde\n10% Forme"],
["Special stage Great Challenge (Week 17)", "Electivire"],
["Special stage Great Challenge (Week 17)", "Snivy\nWinking"],
["Special stage Great Challenge (Week 17)", "Diancie\nShiny"],
["Special stage Great Challenge (Week 17)", "Bruxish"],
["Special stage Great Challenge (Week 18)", "Magmortar"],
["Special stage Great Challenge (Week 18)", "Dusknoir"],
["Special stage Great Challenge (Week 18)", "Oshawott\nWinking"],
["Special stage Great Challenge (Week 18)", "Gengar\nShiny"],
["Special stage Great Challenge (Week 18)", "Hoopa\nHoopa Confined"],
["Special stage Great Challenge (Week 19)", "Ribombee"],
["Special stage Great Challenge (Week 19)", "Golisopod"],
["Special stage Great Challenge (Week 19)", "Ninetales\nAlola Form"],
["Special stage Great Challenge (Week 19)", "Delcatty\nWinking"],
["Special stage Great Challenge (Week 20)", "Stufful"],
["Special stage Great Challenge (Week 20)", "Bewear"],
["Special stage Great Challenge (Week 20)", "Hitmonlee"],
["Special stage Great Challenge (Week 21)", "Araquanid"],
["Special stage Great Challenge (Week 21)", "Landorus\nTherian Forme"],
["Special stage Great Challenge (Week 21)", "Fennekin\nWinking"],
["Special stage Great Challenge (Week 21)", "Gardevoir\nShiny"],
["Special stage Great Challenge (Week 21)", "Hitmonchan"],
["Special stage Great Challenge (Week 22)", "Carracosta"],
["Special stage Great Challenge (Week 22)", "Turtonator"],
["Special stage Great Challenge (Week 22)", "Chespin\nWinking"],
["Special stage Great Challenge (Week 22)", "Uxie"],
["Special stage Great Challenge (Week 22)", "Type: Null"],
["Special stage Great Challenge (Week 23)", "Infernape"],
["Special stage Great Challenge (Week 23)", "Hitmontop"],
["Special stage Great Challenge (Week 23)", "Froakie\nWinking"],
["Special stage Great Challenge (Week 23)", "Mesprit"],
["Special stage Great Challenge (Week 23)", "Granbull\nWinking"],
["Special stage Great Challenge (Week 24)", "Palossand"],
["Special stage Great Challenge (Week 24)", "Sandslash\nAlola Form"],
["Special stage Ultra Challenge (Week 1)", "Deoxys\nAttack Forme"],
["Special stage Ultra Challenge (Week 2)", "Regigigas"],
["Special stage Ultra Challenge (Week 4)", "Meloetta\nPirouette Forme"],
["Special stage Ultra Challenge (Week 5)", "Arceus"],
["Special stage Ultra Challenge (Week 7)", "Kyurem\nWhite Kyurem"],
["Special stage Ultra Challenge (Week 8)", "Kyurem\nBlack Kyurem"],
["Special stage Ultra Challenge (Week 10)", "Ho-Oh\nShiny"],
["Special stage Ultra Challenge (Week 11)", "Zygarde\nComplete Forme"],
["Special stage Ultra Challenge (Week 13)", "Tapu Koko"],
["Special stage Ultra Challenge (Week 14)", "Tapu Fini"],
["Special stage Ultra Challenge (Week 16)", "Solgaleo"],
["Special stage Ultra Challenge (Week 17)", "Lunala"],
["Special stage Ultra Challenge (Week 19)", "Tapu Bulu"],
["Special stage Ultra Challenge (Week 20)", "Tapu Lele"],
["Special stage Ultra Challenge (Week 22)", "Silvally"],
["Special stage Ultra Challenge (Week 23)", "Marshadow"],
["Special stage Ultra Challenge (Week 24)", "Necrozma"],
["Special stage UB Challenge (Week 3)", "Nihilego"],
["Special stage UB Challenge (Week 6)", "Buzzwole"],
["Special stage UB Challenge (Week 9)", "Pheromosa"],
["Special stage UB Challenge (Week 12)", "Xurkitree"],
["Special stage UB Challenge (Week 15)", "Celesteela"],
["Special stage UB Challenge (Week 18)", "Kartana"],
["Special stage UB Challenge (Week 21)", "Guzzlord"],
["Special stage High-Speed Challenge (Week 3)", "Lugia"],
["Special stage High-Speed Challenge (Week 5)", "Drifblim"],
["Special stage High-Speed Challenge (Week 7)", "Salazzle"],
["Special stage High-Speed Challenge (Week 9)", "Noivern"],
["Special stage High-Speed Challenge (Week 9)", "Passimian"],
["Special stage High-Speed Challenge (Week 10)", "Shaymin\nSky Forme"],
["Special stage High-Speed Challenge (Week 10)", "Raichu\nAlola Form"],
["Special stage High-Speed Challenge (Week 11)", "Talonflame"],
["Special stage High-Speed Challenge (Week 13)", "Charizard\nShiny"],
["Special stage High-Speed Challenge (Week 14)", "Kabutops"],
["Special stage High-Speed Challenge (Week 17)", "Beedrill"],
["Special stage High-Speed Challenge (Week 19)", "Tornadus\nTherian Forme"],
["Special stage High-Speed Challenge (Week 20)", "Thundurus\nTherian Forme"],
["Special stage High-Speed Challenge (Week 20)", "Greninja\nAsh-Greninja"],
["Special stage High-Speed Challenge (Week 24)", "Archeops"],
["Special stage High-Speed Challenge (Week 24)", "Carnivine"],
["Special stage High-Speed Challenge (Week 24)", "Azelf"],
["Special stage Special Challenge (Week 2)", "Xerneas"],
["Special stage Special Challenge (Week 4)", "Yveltal"],
["Special stage Special Challenge (Week 6)", "Genesect"],
["Special stage Special Challenge (Week 8)", "Mewtwo\nShiny"],
["Special stage Special Challenge (Week 10)", "Tyranitar\nShiny"],
["Special stage Special Challenge (Week 12)", "Salamence"],
["Special stage Special Challenge (Week 14)", "Rayquaza"],
["Special stage Special Challenge (Week 16)", "Luxray"],
["Special stage Special Challenge (Week 18)", "Hydreigon"],
["Special stage Special Challenge (Week 20)", "Porygon-Z"],
["Special stage Special Challenge (Week 22)", "Goodra"],
["Special stage Special Challenge (Week 24)", "Hoopa\nHoopa Unbound"],
["Special stage Tons of Exp. Points (Monday)", "Victini"],
["Special stage Skill Booster M Stage! (Tuesday)", "Eevee"],
["Special stage A Great Chance a Day (Week 1 & Week 9 & Week 17)", "Pinsir"],
["Special stage A Great Chance a Day (Week 2 & Week 10 & Week 18)", "Tornadus\nIncarnate Forme"],
["Special stage A Great Chance a Day (Week 3 & Week 11 & Week 19)", "Frillish\nFemale"],
["Special stage A Great Chance a Day (Week 4 & Week 12 & Week 20)", "Thundurus\nIncarnate Forme"],
["Special stage A Great Chance a Day (Week 5 & Week 13 & Week 21)", "Jellicent\nFemale"],
["Special stage A Great Chance a Day (Week 6 & Week 14 & Week 2)", "Landorus\nIncarnate Forme"],
["Special stage A Great Chance a Day (Week 7 & Week 15 & Week 23)", "Cosmog"],
["Special stage A Great Chance a Day (Week 8 & Week 16 & Week 24)", "Cosmoem"],
["Special stage A Great Chance a Day (February 13th-15th)", "Pikachu (Enamored)"],
["Special stage A Great Chance a Day (February 18th-20th)", "Shaymin (Land Forme)"],
["Special stage A Great Chance a Day (January 6th-8th)", "Jirachi"],
["Special stage Daily Pokémon (Week 1 & Week 13 Monday)", "Rotom\nFan Rotom"],
["Special stage Daily Pokémon (Week 1 & Week 13 Tuesday)", "Rotom\nFrost Rotom"],
["Special stage Daily Pokémon (Week 1 & Week 13 Wednesday)", "Rotom\nHeat Rotom"],
["Special stage Daily Pokémon (Week 1 & Week 13 Thursday)", "Rotom\nWash Rotom"],
["Special stage Daily Pokémon (Week 1 & Week 13 Friday)", "Rotom\nMow Rotom"],
["Special stage Daily Pokémon (Week 2 & Week 14 Monday)", "Druddigon"],
["Special stage Daily Pokémon (Week 2 & Week 14 Tuesday)", "Pachirisu"],
["Special stage Daily Pokémon (Week 2 & Week 14 Wednesday)", "Sigilyph"],
["Special stage Daily Pokémon (Week 2 & Week 14 Thursday)", "Tropius"],
["Special stage Daily Pokémon (Week 2 & Week 14 Friday)", "Farfetch'd"],
["Special stage Daily Pokémon (Week 3 & Week 15 Monday)", "Spiritomb"],
["Special stage Daily Pokémon (Week 3 & Week 15 Tuesday)", "Girafarig"],
["Special stage Daily Pokémon (Week 3 & Week 15 Wednesday)", "Kecleon"],
["Special stage Daily Pokémon (Week 3 & Week 15 Thursday)", "Shuckle"],
["Special stage Daily Pokémon (Week 3 & Week 15 Friday)", "Relicanth"],
["Special stage Daily Pokémon (Week 4 & Week 16 Monday)", "Clefairy\nWinking"],
["Special stage Daily Pokémon (Week 4 & Week 16 Tuesday)", "Charmander\nWinking"],
["Special stage Daily Pokémon (Week 4 & Week 16 Wednesday)", "Squirtle\nWinking"],
["Special stage Daily Pokémon (Week 4 & Week 16 Thursday)", "Bulbasaur\nWinking"],
["Special stage Daily Pokémon (Week 4 & Week 16 Friday)", "Jigglypuff\nWinking"],
["Special stage Daily Pokémon (Week 5 & Week 17 Monday)", "Seviper"],
["Special stage Daily Pokémon (Week 5 & Week 17 Tuesday)", "Wynaut"],
["Special stage Daily Pokémon (Week 5 & Week 17 Wednesday)", "Torkoal"],
["Special stage Daily Pokémon (Week 5 & Week 17 Thursday)", "Zangoose"],
["Special stage Daily Pokémon (Week 5 & Week 17 Friday)", "Luvdisc"],
["Special stage Daily Pokémon (Week 6 & Week 18 Monday)", "Maractus"],
["Special stage Daily Pokémon (Week 6 & Week 18 Tuesday)", "Dunsparce"],
["Special stage Daily Pokémon (Week 6 & Week 18 Wednesday)", "Qwilfish"],
["Special stage Daily Pokémon (Week 6 & Week 18 Thursday)", "Durant"],
["Special stage Daily Pokémon (Week 6 & Week 18 Friday)", "Heatmor"],
["Special stage Daily Pokémon (Week 7 & Week 19 Monday)", "Lunatone"],
["Special stage Daily Pokémon (Week 7 & Week 19 Tuesday)", "Tyrogue"],
["Special stage Daily Pokémon (Week 7 & Week 19 Wednesday)", "Castform"],
["Special stage Daily Pokémon (Week 7 & Week 19 Thursday)", "Mantyke"],
["Special stage Daily Pokémon (Week 7 & Week 19 Friday)", "Solrock"],
["Special stage Daily Pokémon (Week 8 & Week 20 Monday)", "Pikachu\nSleeping"],
["Special stage Daily Pokémon (Week 8 & Week 20 Tuesday)", "Torchic\nWinking"],
["Special stage Daily Pokémon (Week 8 & Week 20 Wednesday)", "Treecko\nWinking"],
["Special stage Daily Pokémon (Week 8 & Week 20 Thursday)", "Mudkip\nWinking"],
["Special stage Daily Pokémon (Week 8 & Week 20 Friday)", "Castform\nWinking"],
["Special stage Daily Pokémon (Week 9 & Week 21 Monday)", "Oricorio\nPom-Pom Style"],
["Special stage Daily Pokémon (Week 9 & Week 21 Tuesday)", "Wishiwashi"],
["Special stage Daily Pokémon (Week 9 & Week 21 Wednesday)", "Komala"],
["Special stage Daily Pokémon (Week 9 & Week 21 Thursday)", "Fomantis"],
["Special stage Daily Pokémon (Week 9 & Week 21 Friday)", "Torracat"],
["Special stage Daily Pokémon (Week 10 & Week 22 Monday)", "Oricorio\nPa'u Style"],
["Special stage Daily Pokémon (Week 10 & Week 22 Tuesday)", "Grimer\nAlola Form"],
["Special stage Daily Pokémon (Week 10 & Week 22 Wednesday)", "Dewpider"],
["Special stage Daily Pokémon (Week 10 & Week 22 Thursday)", "Sandshrew\nAlola Form"],
["Special stage Daily Pokémon (Week 10 & Week 22 Friday)", "Brionne"],
["Special stage Daily Pokémon (Week 11 & Week 23 Monday)", "Oricorio\nBaile Style"],
["Special stage Daily Pokémon (Week 11 & Week 23 Tuesday)", "Pyukumuku"],
["Special stage Daily Pokémon (Week 11 & Week 23 Wednesday)", "Oricorio\nSensu Style"],
["Special stage Daily Pokémon (Week 11 & Week 23 Thursday)", "Mudbray"],
["Special stage Daily Pokémon (Week 11 & Week 23 Friday)", "Dartrix"],
["Special stage Daily Pokémon (Week 12 & Week 24 Monday)", "Slurpuff\nWinking"],
["Special stage Daily Pokémon (Week 12 & Week 24 Tuesday)", "Audino\nWinking"],
["Special stage Daily Pokémon (Week 12 & Week 24 Wednesday)", "Togetic\nWinking"],
["Special stage Daily Pokémon (Week 12 & Week 24 Thursday)", "Carbink\nWinking"],
["Special stage Daily Pokémon (Week 12 & Week 24 Friday)", "Swirlix\nWinking"],
["Special stage Daily Pokémon (October 17-30 Monday)", "Sableye\nSpooky"],
["Special stage Daily Pokémon (October 17-30 Tuesday)", "Pikachu\nSpooky"],
["Special stage Daily Pokémon (October 17-30 Wednesday)", "Pumpkaboo\nSpooky"],
["Special stage Daily Pokémon (October 17-30 Thursday)", "Gourgeist\nSpooky"],
["Special stage Daily Pokémon (October 17-30 Friday)", "Gengar\nSpooky"],
["Special stage Daily Pokémon (December 11-25 Monday)", "Delibird\nHoliday"],
["Special stage Daily Pokémon (December 11-25 Tuesday)", "Pikachu\nHoliday"],
["Special stage Daily Pokémon (December 11-25 Wednesday)", "Vanillite\nHoliday"],
["Special stage Daily Pokémon (December 11-25 Thursday)", "Snover\nHoliday"],
["Special stage Daily Pokémon (December 11-25 Friday)", "Cubchoo\nHoliday"],
["Special stage Escalation Battle (Week 1)", "Decidueye"],
["Special stage Escalation Battle (Week 2 & Week 3)", "Volcanion"],
["Special stage Escalation Battle (Week 4 & Week 5)", "Latios"],
["Special stage Escalation Battle (Week 6 & Week 7)", "Giratina\nAltered Forme"],
["Special stage Escalation Battle (Week 8 & Week 9)", "Latias"],
["Special stage Escalation Battle (Week 10 & Week 11)", "Diancie"],
["Special stage Escalation Battle (Week 12 & Week 13)", "Darkrai"],
["Special stage Escalation Battle (Week 14 & Week 15)", "Kyurem"],
["Special stage Escalation Battle (Week 16 & Week 17)", "Zygarde\n50% Forme"],
["Special stage Escalation Battle (Week 18 & Week 19)", "Meloetta\nAria Forme"],
["Special stage Escalation Battle (Week 20 & Week 21)", "Giratina\nOrigin Forme"],
["Special stage Escalation Battle (Week 22)", "Magearna"],
["Special stage Escalation Battle (Week 23)", "Incineroar"],
["Special stage Escalation Battle (Week 24)", "Primarina"],

["Special stage Pokémon Safari (Week 1 & Week 2)", "Grubbin"],
["Special stage Pokémon Safari (Week 1 & Week 2)", "Charjabug"],
["Special stage Pokémon Safari (Week 1 & Week 2)", "Vikavolt"],
["Special stage Pokémon Safari (Week 1 & Week 2)", "Crabrawler"],
["Special stage Pokémon Safari (Week 1 & Week 2)", "Crabominable"],
["Special stage Pokémon Safari (Week 1 & Week 2)", "Caterpie"],
["Special stage Pokémon Safari (Week 1 & Week 2)", "Metapod"],
["Special stage Pokémon Safari (Week 1 & Week 2)", "Butterfree"],
["Special stage Pokémon Safari (Week 1 & Week 2)", "Yungoos"],
["Special stage Pokémon Safari (Week 1 & Week 2)", "Gumshoos"],
["Special stage Pokémon Safari (Week 3 & Week 4)", "Gible"],
["Special stage Pokémon Safari (Week 3 & Week 4)", "Gabite"],
["Special stage Pokémon Safari (Week 3 & Week 4)", "Garchomp"],
["Special stage Pokémon Safari (Week 3 & Week 4)", "Staryu"],
["Special stage Pokémon Safari (Week 3 & Week 4)", "Starmie"],
["Special stage Pokémon Safari (Week 3 & Week 4)", "Furfrou"],
["Special stage Pokémon Safari (Week 3 & Week 4)", "Manaphy\nWinking"],
["Special stage Pokémon Safari (Week 3 & Week 4)", "Phione"],
["Special stage Pokémon Safari (Week 3 & Week 4)", "Phione\nWinking"],
["Special stage Pokémon Safari (Week 3 & Week 4)", "Sandygast"],
["Special stage Pokémon Safari (Week 5 & Week 6)", "Krabby"],
["Special stage Pokémon Safari (Week 5 & Week 6)", "Kingler"],
["Special stage Pokémon Safari (Week 5 & Week 6)", "Shellder"],
["Special stage Pokémon Safari (Week 5 & Week 6)", "Cloyster"],
["Special stage Pokémon Safari (Week 5 & Week 6)", "Magikarp\nShiny"],
["Special stage Pokémon Safari (Week 5 & Week 6)", "Gyarados\nShiny"],
["Special stage Pokémon Safari (Week 5 & Week 6)", "Goldeen"],
["Special stage Pokémon Safari (Week 5 & Week 6)", "Seaking"],
["Special stage Pokémon Safari (Week 5 & Week 6)", "Aipom"],
["Special stage Pokémon Safari (Week 5 & Week 6)", "Ambipom"],
["Special stage Pokémon Safari (Week 7 & Week 8)", "Electrike"],
["Special stage Pokémon Safari (Week 7 & Week 8)", "Manectric"],
["Special stage Pokémon Safari (Week 7 & Week 8)", "Darumaka"],
["Special stage Pokémon Safari (Week 7 & Week 8)", "Darmanitan"],
["Special stage Pokémon Safari (Week 7 & Week 8)", "Pikachu\nWinking"],
["Special stage Pokémon Safari (Week 7 & Week 8)", "Raichu\nWinking"],
["Special stage Pokémon Safari (Week 7 & Week 8)", "Plusle"],
["Special stage Pokémon Safari (Week 7 & Week 8)", "Minun"],
["Special stage Pokémon Safari (Week 7 & Week 8)", "Diglett\nAlola Form"],
["Special stage Pokémon Safari (Week 7 & Week 8)", "Dugtrio\nAlola Form"],
["Special stage Pokémon Safari (Week 9)", "Salandit"],
["Special stage Pokémon Safari (Week 9)", "Togedemaru"],
["Special stage Pokémon Safari (Week 9)", "Roggenrola"],
["Special stage Pokémon Safari (Week 9)", "Boldore"],
["Special stage Pokémon Safari (Week 9)", "Gigalith"],
["Special stage Pokémon Safari (Week 9)", "Rockruff"],
["Special stage Pokémon Safari (Week 9)", "Geodude\nAlola Form"],
["Special stage Pokémon Safari (Week 9)", "Graveler\nAlola Form"],
["Special stage Pokémon Safari (Week 9)", "Golem\nAlola Form"],
["Special stage Pokémon Safari (Week 9)", "Mareanie"],
["Special stage Pokémon Safari (Week 10)", "Pikachu\nCharizard Costume"],
["Special stage Pokémon Safari (Week 10)", "Pikachu\nMagikarp Costume"],
["Special stage Pokémon Safari (Week 10)", "Pikachu\nGyarados Costume"],
["Special stage Pokémon Safari (Week 10)", "Pikachu\nShiny Gyarados Costume"],
["Special stage Pokémon Safari (Week 10)", "Pikachu\nLugia Costume"],
["Special stage Pokémon Safari (Week 10)", "Pikachu\nHo-Oh Costume"],
["Special stage Pokémon Safari (Week 10)", "Pikachu\nRayquaza Costume"],
["Special stage Pokémon Safari (Week 10)", "Pikachu\nShiny Rayquaza Costume"],
["Special stage Pokémon Safari (Week 10)", "Pikachu\nKimono Boy"],
["Special stage Pokémon Safari (Week 10)", "Pikachu\nKimono Girl"],
["Special stage Pokémon Safari (Week 11 & Week 12)", "Abra"],
["Special stage Pokémon Safari (Week 11 & Week 12)", "Kadabra"],
["Special stage Pokémon Safari (Week 11 & Week 12)", "Alakazam"],
["Special stage Pokémon Safari (Week 11 & Week 12)", "Tauros"],
["Special stage Pokémon Safari (Week 11 & Week 12)", "Oddish"],
["Special stage Pokémon Safari (Week 11 & Week 12)", "Gloom"],
["Special stage Pokémon Safari (Week 11 & Week 12)", "Vileplume"],
["Special stage Pokémon Safari (Week 11 & Week 12)", "Bounsweet"],
["Special stage Pokémon Safari (Week 11 & Week 12)", "Steenee"],
["Special stage Pokémon Safari (Week 11 & Week 12)", "Tsareena"],
["Special stage Pokémon Safari (Week 13)", "Burmy\nTrash Cloak"],
["Special stage Pokémon Safari (Week 13)", "Wormadam\nTrash Cloak"],
["Special stage Pokémon Safari (Week 13)", "Pikachu\nAngry"],
["Special stage Pokémon Safari (Week 13)", "Deerling\nSpring Form"],
["Special stage Pokémon Safari (Week 13)", "Sawsbuck\nSpring Form"],
["Special stage Pokémon Safari (Week 13)", "Morelull"],
["Special stage Pokémon Safari (Week 13)", "Shiinotic"],
["Special stage Pokémon Safari (Week 13)", "Wimpod"],
["Special stage Pokémon Safari (Week 13)", "Venonat"],
["Special stage Pokémon Safari (Week 13)", "Venomoth"],
["Special stage Pokémon Safari (Week 14)", "Sunkern"],
["Special stage Pokémon Safari (Week 14)", "Sunflora"],
["Special stage Pokémon Safari (Week 14)", "Pikipek"],
["Special stage Pokémon Safari (Week 14)", "Trumbeak"],
["Special stage Pokémon Safari (Week 14)", "Lurantis"],
["Special stage Pokémon Safari (Week 14)", "Drampa"],
["Special stage Pokémon Safari (Week 14)", "Deerling\nSummer Form"],
["Special stage Pokémon Safari (Week 14)", "Sawsbuck\nSummer Form"],
["Special stage Pokémon Safari (Week 14)", "Stantler"],
["Special stage Pokémon Safari (Week 14)", "Pikachu\nDizzy"],
["Special stage Pokémon Safari (Week 15 & Week 16)", "Numel"],
["Special stage Pokémon Safari (Week 15 & Week 16)", "Camerupt"],
["Special stage Pokémon Safari (Week 15 & Week 16)", "Hippopotas\nFemale"],
["Special stage Pokémon Safari (Week 15 & Week 16)", "Hippowdon\nFemale"],
["Special stage Pokémon Safari (Week 15 & Week 16)", "Pidove"],
["Special stage Pokémon Safari (Week 15 & Week 16)", "Tranquill"],
["Special stage Pokémon Safari (Week 15 & Week 16)", "Unfezant\nMale"],
["Special stage Pokémon Safari (Week 15 & Week 16)", "Unfezant\nFemale"],
["Special stage Pokémon Safari (Week 15 & Week 16)", "Jangmo-o"],
["Special stage Pokémon Safari (Week 15 & Week 16)", "Hakamo-o"],
["Special stage Pokémon Safari (Week 17)", "Pikachu\nOriginal Cap"],
["Special stage Pokémon Safari (Week 17)", "Pikachu\nHoenn Cap"],
["Special stage Pokémon Safari (Week 17)", "Pikachu\nSinnoh Cap"],
["Special stage Pokémon Safari (Week 17)", "Pikachu\nUnova Cap"],
["Special stage Pokémon Safari (Week 17)", "Pikachu\nKalos Cap"],
["Special stage Pokémon Safari (Week 17)", "Pikachu\nAlola Cap"],
["Special stage Pokémon Safari (Week 17)", "Pikachu\nSmiling"],
["Special stage Pokémon Safari (Week 17)", "Pikachu\nHappy"],
["Special stage Pokémon Safari (Week 17)", "Pikachu\nFired Up"],
["Special stage Pokémon Safari (Week 17)", "Pikachu\nSurprised"],
["Special stage Pokémon Safari (Week 18)", "Meowth\nAlola Form"],
["Special stage Pokémon Safari (Week 18)", "Persian\nAlola Form"],
["Special stage Pokémon Safari (Week 18)", "Rattata\nAlola Form"],
["Special stage Pokémon Safari (Week 18)", "Raticate\nAlola Form"],
["Special stage Pokémon Safari (Week 18)", "Unown\nN"],
["Special stage Pokémon Safari (Week 18)", "Unown\nI"],
["Special stage Pokémon Safari (Week 18)", "Unown\nC"],
["Special stage Pokémon Safari (Week 18)", "Unown\nE"],
["Special stage Pokémon Safari (Week 18)", "Cherubi\nWinking"],
["Special stage Pokémon Safari (Week 18)", "Cherrim\nWinking"],
["Special stage Pokémon Safari (Week 19 & Week 20)", "Pineco"],
["Special stage Pokémon Safari (Week 19 & Week 20)", "Forretress"],
["Special stage Pokémon Safari (Week 19 & Week 20)", "Ledyba"],
["Special stage Pokémon Safari (Week 19 & Week 20)", "Ledian"],
["Special stage Pokémon Safari (Week 19 & Week 20)", "Houndour"],
["Special stage Pokémon Safari (Week 19 & Week 20)", "Houndoom"],
["Special stage Pokémon Safari (Week 19 & Week 20)", "Noibat"],
["Special stage Pokémon Safari (Week 19 & Week 20)", "Hoothoot"],
["Special stage Pokémon Safari (Week 19 & Week 20)", "Noctowl"],
["Special stage Pokémon Safari (Week 19 & Week 20)", "Vivillon\nPoké Ball Pattern"],
["Special stage Pokémon Safari (Week 21 & Week 22)", "Sewaddle"],
["Special stage Pokémon Safari (Week 21 & Week 22)", "Swadloon"],
["Special stage Pokémon Safari (Week 21 & Week 22)", "Leavanny"],
["Special stage Pokémon Safari (Week 21 & Week 22)", "Cottonee\nWinking"],
["Special stage Pokémon Safari (Week 21 & Week 22)", "Whimsicott\nWinking"],
["Special stage Pokémon Safari (Week 21 & Week 22)", "Flabébé\nWinking"],
["Special stage Pokémon Safari (Week 21 & Week 22)", "Floette\nWinking"],
["Special stage Pokémon Safari (Week 21 & Week 22)", "Snubbull\nWinking"],
["Special stage Pokémon Safari (Week 21 & Week 22)", "Chansey\nWinking"],
["Special stage Pokémon Safari (Week 21 & Week 22)", "Cutiefly"],
["Special stage Pokémon Safari (Week 23 & Week 24)", "Fletchling"],
["Special stage Pokémon Safari (Week 23 & Week 24)", "Fletchinder"],
["Special stage Pokémon Safari (Week 23 & Week 24)", "Zigzagoon"],
["Special stage Pokémon Safari (Week 23 & Week 24)", "Linoone"],
["Special stage Pokémon Safari (Week 23 & Week 24)", "Hoppip\nWinking"],
["Special stage Pokémon Safari (Week 23 & Week 24)", "Skiploom\nWinking"],
["Special stage Pokémon Safari (Week 23 & Week 24)", "Jumpluff\nWinking"],
["Special stage Pokémon Safari (Week 23 & Week 24)", "Vulpix\nAlola Form"],
["Special stage Pokémon Safari (Week 23 & Week 24)", "Snorunt\nWinking"],
["Special stage Pokémon Safari (Week 23 & Week 24)", "Glalie\nWinking"],
];

  a.forEach(b => {
    if (b[1].includes('\n'))
      b[1] = b[1].replace('\n', ' (') + ')';
  });
  let list = new Set();
  await func(`C:\\rc\\rainingchain\\src\\pokemonCompletion\\data\\Shuffle.json`, (col, cat) => {
    if(cat === 'pokemon'){
      list.add(col.name);
      let af = a.filter(b => {
        return b[1] === col.name
      });
      col.location = af.map(b => b[0]).join(', ');
      return col;
    }
    /*const em = eme.categories.find(c => c.id === cat);
    if(!em)
      return null;

    const emel = em.list.find(a => a.name === col.name);
    if(emel && emel.iconUrl)
      col.iconUrl = emel.iconUrl;
    return col;*/
  });
  a.forEach(b => {
    if (!list.has(b[1]) && !b[1].startsWith('Mega '))
      console.log(b[1], 'what');
  });
}, 1);
}


if(false){
setTimeout(async () => {
  const plat = await readJson(`C:\\rc\\rainingchain\\src\\pokemonCompletion\\data\\Platinum.json`);
  const items = plat.categories.find(c => c.name === 'Item').list;
  await func(`C:\\rc\\rainingchain\\src\\pokemonCompletion\\data\\Ranger.json`, (col, cat) => {
    if(cat === 'pokemon'){
      const p = plat.categories[0].list.find(m => m.name === col.name);
      if (p)
        col.iconUrl = p.iconUrl;
      return col;
    }
    /*const em = eme.categories.find(c => c.id === cat);
    if(!em)
      return null;

    const emel = em.list.find(a => a.name === col.name);
    if(emel && emel.iconUrl)
      col.iconUrl = emel.iconUrl;
    return col;*/
  });
}, 1);
}



if(false){
setTimeout(async () => {
  const pmdSky = await readJson(`C:\\rc\\rainingchain\\src\\pokemonCompletion\\data\\tmp\\skyItemFromDungeon.json`);
  await func(`C:\\rc\\rainingchain\\src\\pokemonCompletion\\data\\PmdSky.json`, (col, cat) => {
    if(cat === 'item'){
      const ov = pmdSky.find(a => a.name === col.name);
      if (ov){
        col.location = ov.location;
        return col;
      }
    }
    /*const em = eme.categories.find(c => c.id === cat);
    if(!em)
      return null;

    const emel = em.list.find(a => a.name === col.name);
    if(emel && emel.iconUrl)
      col.iconUrl = emel.iconUrl;
    return col;*/
  });
}, 1);
}


//add "pos" to .json
if(false){
setTimeout(async () => {
  const overwrite = JSON.parse(await fs.readFile(`C:\\rc\\rainingchain\\src\\pokemonCompletion\\data\\tmp\\Platinum_pos.json`,'utf8'));

  await func(`C:\\rc\\rainingchain\\src\\pokemonCompletion\\data\\Platinum.json`, (col, cat) => {

    const ovs = overwrite.filter(a => {
      return a.c === cat && a.pos && a.n === col.name;
    });
    if(!ovs.length)
      return null;

    ovs.forEach(ov => {
      col.pos = col.pos || [];
      if (!col.pos.some(a => a[0] === ov.pos[0] && a[1] === ov.pos[1]))
        col.pos.push(ov.pos);
    });
    return col;
  });
}, 1);
}

//------------------------
/*dont touch below*/

const readJson = async function(file){
  return JSON.parse(await fs.readFile(file,'utf8'));
};

const func = async function(file, edit){
  const str = await fs.readFile(file,'utf8');
  const json = JSON.parse(str);
  const lines = str.split('\n');
  const catStartId = lines.findIndex(line => line.trim().includes(`"categories":[`));
  if (catStartId === -1)
    return "catStartId === -1";

  const collCountByCat = json.categories.map((cat) => cat.list.length);

  let currentCatIdx = -1;
  let catIsActive = false;
  for (let i = catStartId; i < lines.length; i++){
    let line = lines[i].trim();
    if (line.endsWith(`"list":[`)){
      currentCatIdx++;
      catIsActive = true;
      continue;
    }
    if(currentCatIdx === -1 || !catIsActive)
      continue;

    if (collCountByCat[currentCatIdx] === 0){
      catIsActive = false;
      continue;
    }
    collCountByCat[currentCatIdx]--;

    const endsWithComma = line.endsWith(',');
    if(endsWithComma)
      line = line.slice(0,-1);

    if(!line)
      continue;

    let col;
    try {
      col = JSON.parse(line);
    } catch(err){
      throw new Error('error at line:' + i + ' ; ' + line);
    }
    const newCollJson = edit(col, json.categories[currentCatIdx].id);
    if(!newCollJson)
      continue;

    let newCollStr = JSON.stringify(newCollJson);
    if (endsWithComma)
      newCollStr += ',';
    lines[i] = '  ' + newCollStr;
  }

  await fs.writeFile(file + '2', lines.join('\n'));
};
