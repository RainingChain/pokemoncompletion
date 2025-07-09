import type {Trainer,GameData,JsonTrainerPokemon} from "../data/getData";

export const INPUT_VALID_KLASS = 'input-valid';
export const INPUT_INVALID_KLASS = 'input-invalid';

export class InputName<T> {
  static nextId = 0;
  input = '';
  computedValue:T|null = null;
  listId = 'InputName' + InputName.nextId++;
  possibleValues:string[] = [];
  clear(){
    this.computedValue = null;
    this.input = '';
  }
  clearComputed(){
    this.computedValue = null;
  }
  getKlass(){
    if (!this.input)
      return '';
    return this.computedValue !== null ? INPUT_VALID_KLASS : INPUT_INVALID_KLASS;
  }
  static formatName = function(name:string){
    if(!name)
      return '';
    return name.replace(/\W/g,'').toLowerCase();
  }
}

export class TrainerInputName extends InputName<Trainer> {
  private constructor(){ super(); }
  static trainerByFormattedName:{trainer:Trainer, formattedName:string}[] = [];

  static create(gameData:GameData){
    if (!TrainerInputName.trainerByFormattedName.length)
      gameData.trainers.forEach(t => {
        TrainerInputName.trainerByFormattedName.push({formattedName:InputName.formatName(t.givenName), trainer:t});
      });

    const pn = new TrainerInputName();
    let possTrainers = TrainerInputName.trainerByFormattedName;
    pn.possibleValues = Array.from(new Set(possTrainers.map(t => t.trainer.givenName))).sort();
    return pn;
  }
  static update(t:TrainerInputName, possTrainerRange:number[] | null){
    t.clearComputed();

    let possTrainers = TrainerInputName.trainerByFormattedName;
    if (possTrainerRange){
      possTrainers = TrainerInputName.trainerByFormattedName.filter(m => m.trainer.id >= possTrainerRange[0] && m.trainer.id <= possTrainerRange[1]);
    }

    t.possibleValues = Array.from(new Set(possTrainers.map(t => t.trainer.givenName))).sort();

    const formattedInput = InputName.formatName(t.input);
    if (!formattedInput)
      return;

    let el = TrainerInputName.trainerByFormattedName.find(t => t.formattedName === formattedInput);
    if(!el)
      el = TrainerInputName.trainerByFormattedName.find(t => t.trainer.id === +formattedInput);
    if (el)
      t.computedValue = el.trainer;
  }
}
export class MoveInputName extends InputName<string> {}
export class ItemInputName extends InputName<string> {}

export class JtmonInputName extends InputName<string> {
  speciesName = '';
  speciesNum:number | null = null;
  moveInputs = [new MoveInputName(),new MoveInputName(),new MoveInputName(),new MoveInputName()];
  itemInput = new ItemInputName();
  possibleAbilities:string[] = [];
  canBeMaleAndFemale = false;
  abilityInput = 'unknown';
  genderInput = 'unknown';
  possibleJmonsStr = '';
  battleFrontierIdInput = '';

  clearComputed(){
    super.clearComputed();
    this.speciesName = '';
    this.possibleJmonsStr = '';
    this.speciesNum = null;
    this.possibleAbilities = [];
    this.moveInputs.forEach(m => m.clearComputed());
    this.itemInput.clearComputed();
    this.canBeMaleAndFemale = false;
  }
  clear(){
    super.clear();
    this.moveInputs.forEach(m => m.clear());
    this.itemInput.clear();
    this.abilityInput = 'unknown';
    this.genderInput = 'unknown';
  }
}

export class PokemonName extends InputName<JsonTrainerPokemon> {
  private constructor(public inputName:string, public speciesOnly:boolean){
    super();
  }
  static jtmonByFormattedName:{jtmon:JsonTrainerPokemon, formattedName:string}[] = [];
  static jtmonByFormattedSpecies:{jtmon:JsonTrainerPokemon, formattedName:string}[] = [];

  static create(gameData:GameData, inputName:string, speciesOnly:boolean ){
    const pn = new PokemonName(inputName, speciesOnly);

    pn.possibleValues = Array.from(new Set(Array.from(gameData.trainerPokemons.map(m => speciesOnly ? m.species : m.displayName)))).sort();

    if (!PokemonName.jtmonByFormattedName.length)
      PokemonName.jtmonByFormattedName = gameData.trainerPokemons.map(m => {
        return {jtmon:m, formattedName:InputName.formatName(m.displayName)};
      });
    if (!PokemonName.jtmonByFormattedSpecies.length)
      PokemonName.jtmonByFormattedSpecies = gameData.trainerPokemons.map(m => {
        return {jtmon:m, formattedName:InputName.formatName(m.species)};
      });
    return pn;
  }

  static update(pn:PokemonName){
    pn.clearComputed();

    //some species have multiple jtmon. but the factory opponent generation logic only consider the species
    //it doesnt matter if the jtmon doesn't have the right item.
    const inputFormatted = InputName.formatName(pn.input);
    const list = pn.speciesOnly ? PokemonName.jtmonByFormattedSpecies : PokemonName.jtmonByFormattedName;
    const el = list.find(m => {
      return m.formattedName === inputFormatted;
    });
    pn.computedValue = el ? el.jtmon : null;
  }
  static createForFactory(gameData:GameData){
    return [
      PokemonName.create(gameData,'Player Pokémon #1', false),
      PokemonName.create(gameData,'Player Pokémon #2', false),
      PokemonName.create(gameData,'Player Pokémon #3', false),
      PokemonName.create(gameData,'Previous Trainer Pokémon #1', true),
      PokemonName.create(gameData,'Previous Trainer Pokémon #2', true),
      PokemonName.create(gameData,'Previous Trainer Pokémon #3', true),
    ]
  }

}