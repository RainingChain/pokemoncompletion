
import {Options, RangeAndProb, Generator_base, FilteredReason,Result,SubNode,Node,Arc,JsonTrainerPokemon,getGender,AlgoSection,Range,Trainer} from "../Structs";
import {Rng} from "../Rng";
import {TYPE, TYPES_BY_SPECIES, FACTORY_sInitialRentalMonRanges,FRONTIER_MONS_HIGH_TIER,factory_sMoves,factory_sRequiredMoveCounts,FACTORY_STYLE} from "../const";

export class BfResult {
  trainer:Trainer = null!;
  playerRental:JsonTrainerPokemon[] = [];
  jmons:JsonTrainerPokemon[] = [];
  battleStyle:FACTORY_STYLE = null!;
  commonType:TYPE = null!;
}

export class BfGenerator extends Generator_base {
  GetNumPastRentalsRank(){
    if (this.opts.factoryPastRentalCount < 15)
      return 0;
    else if (this.opts.factoryPastRentalCount < 22)
      return 1;
    else if (this.opts.factoryPastRentalCount < 29)
      return 2;
    else if (this.opts.factoryPastRentalCount < 36)
      return 3;
    else if (this.opts.factoryPastRentalCount < 43)
      return 4;
    else
      return 5;
  }
  generate_room1(rng:Rng){
    const rentalRank = this.GetNumPastRentalsRank();
    const playerRental:BfResult['playerRental'] = [];
    while(playerRental.length !== 6){
      const useBetterRange = playerRental.length < rentalRank;
      const newJmon = this.getJmon(rng, useBetterRange);
      if(!this.isValidNewJmon(newJmon, playerRental, []))
        continue;
      playerRental.push(newJmon);
    }

    if(this.opts.factoryPlayerJmons.length){
      const allSame = this.opts.factoryPlayerJmons.some((p,i) => {
        if (p.species === this.opts.factoryPlayerJmons[i].species)
          return true;
        // if the package was sent after rental selection, some rental will be duplicated
        // if duplicated, rental[3-5] overwrote [0-2]
        if (i < 3 && this.opts.factoryPlayerJmons[i] === this.opts.factoryPlayerJmons[i + 3])
          return true;
        return false;
      });
      if (!allSame)
        return [FilteredReason.factory_wrongPlayerRental, null] as const;
    }

    const [filtered, res] = this.generate_trainer(rng, playerRental);
    if(!res)
      return [filtered,null] as const;

    res.playerRental = playerRental;

    return [null, res] as const;
  }

  isValidNewJmon(newJmon:JsonTrainerPokemon, noSameSpeciesAndItem:JsonTrainerPokemon[], noSameSpecies:JsonTrainerPokemon[]){
    if(newJmon.species === 'Unown')
      return false;
    if(this.opts.isLvl50 && newJmon.id > FRONTIER_MONS_HIGH_TIER)
      return false;

    if(noSameSpeciesAndItem.some(jmon => jmon.item === newJmon.item || jmon.species === newJmon.species))
      return false;

    if(noSameSpecies.some(jmon => jmon.species === newJmon.species))
      return false;

    return true;
  }
  getJmon(rng:Rng, useBetterRange:boolean){
    const list = this.opts.isLvl50 ? FACTORY_sInitialRentalMonRanges.lvl50 : FACTORY_sInitialRentalMonRanges.openLvl;

    let chalNum = this.opts.getChallengeNum();
    if(useBetterRange)
      chalNum++;
    if(chalNum > 7)
      chalNum = 7;

    const monId = this.getRandomFromRange(list[chalNum], rng, 'getJsonTmon');
    return this.opts.gameData.trainerPokemons[monId];
  }

  generate_room2(rng:Rng){
    return this.generate_trainer(rng, this.opts.factoryPlayerJmons);
  }
  generate_trainer(rng:Rng, playerJmons:JsonTrainerPokemon[]){
    let trainer:Trainer;
    do {
      trainer = this.GetRandomScaledFrontierTrainer(rng);
    } while(this.opts.trainersBattledAlready.includes(trainer.id));

    if(this.opts.filter.trainerId !== null && this.opts.filter.trainerId !== trainer.id)
      return [FilteredReason.wrongTrainer, null] as const;

    const res = new BfResult();
    res.trainer = trainer;

    while (res.jmons.length !== 3){
      const newJmon = this.getJmon(rng, false);
      if(!this.isValidNewJmon(newJmon, res.jmons, playerJmons))
        continue;

      if(res.jmons.length === 0){
        if(!this.opts.filter.doesMonRespectFilter0(newJmon))
          return [FilteredReason.wrongPokemon0, null] as const;
      } else {
        const jmon12:{jmon?: JsonTrainerPokemon}[] = res.jmons.slice(1).map(j => ({jmon:j}));
        while(jmon12.length < 2)
          jmon12.push({});
        if(!this.opts.filter.doesMonRespectFilter12(jmon12))
          return [FilteredReason.wrongPokemon12, null] as const;
      }
      res.jmons.push(newJmon);
    }

    res.battleStyle = BfGenerator.GetOpponentBattleStyle(res.jmons);
    if(this.opts.filter.factory_battleStyle !== null &&
       this.opts.filter.factory_battleStyle !== res.battleStyle)
      return [FilteredReason.factory_wrongStyle, null] as const;

    res.commonType = BfGenerator.GetOpponentMostCommonMonType(res.jmons);
    if(this.opts.filter.factory_commonType !== null &&
       this.opts.filter.factory_commonType !== res.commonType)
      return [FilteredReason.factory_wrongCommonType, null] as const;

    return [null, res] as const;
  }

  static GetMoveBattleStyle(move:string){
    const formattedMove = move.replace(/\W/g,'').toLowerCase();
    const res = factory_sMoves.get(formattedMove) ?? FACTORY_STYLE.NONE;
    return res;
  }
  static GetOpponentBattleStyle(tjmons:{moves:string[]}[]){
    let stylePoints = new Uint8Array(8);

    for (let i = 0; i < 9; i++)
      stylePoints[i] = 0;

    for (let i = 0; i < tjmons.length; i++){
      const tjmon = tjmons[i];
      for (let j = 0; j < 4; j++){
        let battleStyle = j >= tjmon.moves.length ? FACTORY_STYLE.NONE : BfGenerator.GetMoveBattleStyle(tjmon.moves[j]);
        stylePoints[battleStyle]++;
      }
    }

    let count = 0;
    let gSpecialVar_Result = FACTORY_STYLE.NONE;
    for (let i = 1; i < 8; i++){
      if (stylePoints[i] >= factory_sRequiredMoveCounts[i - 1]){
        gSpecialVar_Result = i;
        count++;
      }
    }

    // Has no singular style
    if (count > 2)
      return FACTORY_STYLE.FLEXIBLE;

    return <FACTORY_STYLE>gSpecialVar_Result;
  }

  static GetOpponentMostCommonMonType(tjmons:{species:string}[]) : TYPE {
    const typeCounts = new Uint8Array(TYPE.DARK + 1);

    tjmons.forEach(v => {
      const monTypes = TYPES_BY_SPECIES.get(v.species)!;
      monTypes.forEach(t => {
        typeCounts[t]++;
      });
    });

    let mostCommonTypes0:TYPE = 0;
    let mostCommonTypes1:TYPE = 0;
    typeCounts.forEach((v, i) => {
      if (typeCounts[mostCommonTypes0] < v)
          mostCommonTypes0 = i;
      else if (typeCounts[mostCommonTypes0] == v)
          mostCommonTypes1 = i;
    });

    if (typeCounts[mostCommonTypes0] !== 0)
    {
      if (typeCounts[mostCommonTypes0] > typeCounts[mostCommonTypes1])
        return mostCommonTypes0;
      else if (mostCommonTypes0 === mostCommonTypes1)
        return mostCommonTypes0;
      else
        return TYPE.NONE;
    }
    return TYPE.NONE;
  }
}







