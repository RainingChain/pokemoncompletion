
// convert in-game format to smogon format
export const renameMap = new Map<string,string>(`AncientPower	Ancient Power
BubbleBeam	Bubble Beam
DoubleSlap	Double Slap
DragonBreath	Dragon Breath
DynamicPunch	Dynamic Punch
ExtremeSpeed	Extreme Speed
Faint Attack	Feint Attack
FeatherDance	Feather Dance
GrassWhistle	Grass Whistle
Hi Jump Kick	High Jump Kick
PoisonPowder	Poison Powder
Sand-Attack	Sand Attack
Selfdestruct	Self-Destruct
SmellingSalt	Smelling Salts
SmokeScreen	Smokescreen
Softboiled	Soft-Boiled
SolarBeam	Solar Beam
SonicBoom	Sonic Boom
ThunderPunch	Thunder Punch
ThunderShock	Thunder Shock
ViceGrip	Vise Grip
Vice Grip	Vise Grip
Conversion2	Conversion 2
Nidoran♀ Nidoran-F
Nidoran♂ Nidoran-M`.split('\n').map(a => <[string,string]>a.split('\t')));

export const renameIfNeeded = function(term:string){
  return renameMap.get(term) || term;
}

export const renameAllIfNeeded = function(list:{species:string,moves:string[]}[]){
  list.forEach(el => {
    renameIfNeeded(el.species);
    el.moves = el.moves.map(m => renameIfNeeded(m));
  });
}
