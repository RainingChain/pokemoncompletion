import Vue from "vue";
import withRender from "./Vue_bpyVisualizer.vue"
import "./Vue_bpyVisualizer.css";

import "../BattleTower/Vue_pkRngFrameInput";
import {Vue_pkRngFrameInput_full} from "../BattleTower/Vue_pkRngFrameInput";

import {Facility} from "../Structs";
import {MAPS} from "./MAPS";
import {Generate, Result, OBJ_EVENT_GFX_ITEM_BALL} from "./BpyGenerator";

const toMatrix = function<T = number>(grid1d:T[] | Int32Array | Uint16Array | Uint8Array, width:number) {
  const grid:T[][] = [];
  const height = grid1d.length / width;
  for(let i = 0; i < height; i++) {
    grid.push([]);
    for(let j = 0; j < width; j++)
      grid[i].push(<T>grid1d[i * width + j]);
  }
  return grid;
}

const LAYOUTS = MAPS.map(map => {
  const str = map.layoutContent.split(' ');
  let u16Vals:number[] = [];
  for(let i = 0; i < str.length; i += 2)
    u16Vals.push(+('0x' + str.slice(i, i + 2).reverse().join('')));
  const walls = toMatrix(u16Vals.map(a => (a & 0x0C00) ? true : false), 8);
  const exit1dIdx = u16Vals.findIndex(u16 => (u16 & 0x03FF) === 0x28E);
  return {walls, exit:{x: exit1dIdx % 8, y: Math.floor(exit1dIdx / 8)}};
});

export class DisplayOptions {
  displayAllExit = false;
  ignoreTrainerInRangeOutsideSquare = false;
  entranceTile = TileType.player;
}

//also used as classname
enum TileType {
  empty = 'emptyTile',
  wall = 'wallTile',
  item = 'itemTile',
  trainer = 'trainerTile',
  entrance = 'entranceTile',
  exit = 'exitTile',
  unknown = 'unknownTile',
  oob = 'oobTile',
  player = 'playerTile',
}

const typeToChar = function(type:TileType){
  if (type === TileType.empty)
    return ' ';
  if (type === TileType.wall)
    return 'W';
  if (type === TileType.item)
    return 'o';
  if (type === TileType.trainer)
    return 'T';
  if (type === TileType.entrance || type === TileType.player)
    return 'x';
  if (type === TileType.exit)
    return 'X';
  if (type === TileType.unknown)
    return '?';
  if (type === TileType.oob)
    return '■';
  return 'E';
}

enum Mode {
  oneRng = 'oneRng',
  layouts = 'layouts',
  findFloor = 'findFloor',
}

class Tile {
  constructor(public type:TileType,
              public inTrainerRange:boolean,
              public rotateDeg:number,
              public sight:number,
              public trainerGraphicId:number){}
}

class InputTile {
  constructor(public type:TileType){}
  trainerProb = 0;
  itemProb = 0;
  inTrainerRangeProb = 0;
}

const createEmptyTiles = function(type=TileType.unknown){
  return Array.from(new Array(32)).map(row => {
    return Array.from(new Array(32)).map(() => new Tile(type, false, 0, 0, 0));
  });
};

const INPUT_TILE_WIDTH = 21;
const CENTER_INPUT_TILE = (INPUT_TILE_WIDTH - 1) / 2;

const createEmptyInputTiles = function(){
  const mat = Array.from(new Array(INPUT_TILE_WIDTH)).map(row => {
    return Array.from(new Array(INPUT_TILE_WIDTH)).map(() => new InputTile(TileType.unknown));
  });
  mat[CENTER_INPUT_TILE][CENTER_INPUT_TILE].type = TileType.player;
  return mat;
};

export class Vue_bpyVisualizer_data {
  tiles = createEmptyTiles();
  inputTiles = createEmptyInputTiles();

  mode = Mode.layouts;
  rngAdvCount = 0;
  winStreak = 0;
  displayHowToUse = true;

  Mode = JSON.parse(JSON.stringify(Mode));
  TileType = JSON.parse(JSON.stringify(TileType));
  Facility = JSON.parse(JSON.stringify(Facility));

  displayOutput = true;
  floorFoundCount:number | null = null;
  floorFoundCount_title = '';

  selectedTile = TileType.empty;

  selectableTiles = [
    TileType.empty,
    TileType.wall,
    TileType.oob,
    TileType.item,
    TileType.trainer,
  ];
}

class Vue_bpyVisualizer_props {
  saveToLocalStorage:() => void = null!;
}

class Vue_bpyVisualizer_methods {
  createDefaultInput = function(this:Vue_bpyVisualizer_full){
    let inp = new Result();
    inp.entranceSquareId = -1;
    inp.exitSquareId = -1;
    inp.layoutBySquareIdx = [0,1,2,3,
                            4,5,6,7,
                            8,9,10,11,
                            12,13,14,15];
    inp.objects = [];

    MAPS.forEach((lay,i) => {
      const offX = (i % 4) * 8;
      const offY = Math.floor(i / 4) * 8;
      lay.object_events.forEach(evt => {
        const isItem = evt.graphics_id === "OBJ_EVENT_GFX_ITEM_BALL";
        inp.objects.push([isItem ? OBJ_EVENT_GFX_ITEM_BALL : 14, offX + evt.x, offY + evt.y]);
      });
    });
    return inp;
  }
  displayAllObjects = function(this:Vue_bpyVisualizer_full){
    const opts = new DisplayOptions();
    opts.displayAllExit = true;
    opts.ignoreTrainerInRangeOutsideSquare = true;
    opts.entranceTile = TileType.entrance;
    this.tiles = this.generateTilesFromResult(this.createDefaultInput(), opts);
    this.displayOutput = true;
  }
  /** no side effect */
  generateTilesFromResult = function(this:Vue_bpyVisualizer_full, inp:Result, opts:DisplayOptions){
    const tiles = createEmptyTiles(TileType.empty);

    const markAsInTrainerRange = (x:number, y:number, trainerSquareIdx:number) => {
      if(x < 0 || y < 0)
        return false;
      if (x >= 32 || y >= 32)
        return false;

      const squareY = Math.floor(y / 8); //squareY is between 0 and 3
      const squareX = Math.floor(x / 8);
      const squareIdx = squareY * 4 + squareX;
      if (trainerSquareIdx !== squareIdx && opts.ignoreTrainerInRangeOutsideSquare)
        return false;

      if(tiles[y][x].type === TileType.wall)
        return false;

      tiles[y][x].inTrainerRange = true;
      return true;
    };

    tiles.forEach((row,y) => { //y is between 0 and 31
      const squareY = Math.floor(y / 8); //squareY is between 0 and 3
      const localY = y % 8; //localY is between 0 and 7
      row.forEach((tile,x) => {
        const squareX = Math.floor(x / 8);
        const localX = x % 8;

        const squareIdx = squareY * 4 + squareX;
        const layoutId = inp.layoutBySquareIdx[squareIdx];
        if (LAYOUTS[layoutId].walls[localY][localX])
          tile.type = TileType.wall;

        if(squareIdx === inp.entranceSquareId || squareIdx === inp.exitSquareId || opts.displayAllExit){
          if (LAYOUTS[layoutId].exit.x === localX && LAYOUTS[layoutId].exit.y === localY)
            tile.type = squareIdx === inp.entranceSquareId ? opts.entranceTile : TileType.exit;
        }
      });
    });

    inp.objects.forEach(obj => {
      const [graphicId, x,y] = obj;
      if(graphicId === 0 && x === 0 && y === 0) //trainer is never at 0,0
        return;

      const isItem = graphicId === OBJ_EVENT_GFX_ITEM_BALL;
      tiles[y][x].type = isItem ? TileType.item : TileType.trainer;
      if (isItem)
        return;

      tiles[y][x].trainerGraphicId = graphicId;

      const squareY = Math.floor(y / 8); //squareY is between 0 and 3
      const localY = y % 8; //localY is between 0 and 7
      const squareX = Math.floor(x / 8);
      const localX = x % 8;
      const squareIdx = squareY * 4 + squareX;
      const layoutId = inp.layoutBySquareIdx[squareIdx];
      const objDefinition = MAPS[layoutId].object_events.find(obj => obj.x === localX && obj.y === localY);
      if(!objDefinition){
        console.error(`invalid object obj=${obj}, squareIdx=${squareIdx}, layoutId=${layoutId}`);
        return;
      }

      const sight = +objDefinition.trainer_sight_or_berry_tree_id;

      if (objDefinition.movement_type.includes('DOWN')){
        for(let off = 1 ; off <= sight; off++){
          if (!markAsInTrainerRange(x, y + off, squareIdx))
            break;
        }
      }
      if (objDefinition.movement_type.includes('UP')){
        for(let off = 1 ; off <= sight; off++){
          if (!markAsInTrainerRange(x, y - off, squareIdx))
            break;
        }
      }

      if (objDefinition.movement_type.includes('LEFT')){
        for(let off = 1 ; off <= sight; off++){
          if (!markAsInTrainerRange(x - off, y, squareIdx))
            break;
        }
      }
      if (objDefinition.movement_type.includes('RIGHT')){
        for(let off = 1 ; off <= sight; off++){
          if(!markAsInTrainerRange(x + off, y, squareIdx))
            break;
        }
      }

      let deg = 0;
      if (objDefinition.movement_type === 'MOVEMENT_TYPE_FACE_LEFT_AND_RIGHT' || objDefinition.movement_type === 'MOVEMENT_TYPE_FACE_RIGHT')
        deg = -90; //right
      else if (objDefinition.movement_type === 'MOVEMENT_TYPE_FACE_LEFT')
        deg = 90;
      else if (objDefinition.movement_type === 'MOVEMENT_TYPE_FACE_DOWN')
        deg = 0;
      else if (objDefinition.movement_type === 'MOVEMENT_TYPE_FACE_UP')
        deg = 180;
      else if (objDefinition.movement_type === 'MOVEMENT_TYPE_FACE_UP_AND_LEFT')
        deg = 180 - 45;
      else if (objDefinition.movement_type === 'MOVEMENT_TYPE_FACE_UP_AND_RIGHT')
        deg = 180 + 45;
      else if (objDefinition.movement_type === 'MOVEMENT_TYPE_FACE_DOWN_AND_LEFT')
        deg = 45;
      else if (objDefinition.movement_type === 'MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT')
        deg = -45;
      else if (objDefinition.movement_type === 'MOVEMENT_TYPE_FACE_DOWN_AND_RIGHT')
        deg = -45;

      tiles[y][x].rotateDeg = deg;
      tiles[y][x].sight = sight;
    });
    return tiles;
  }
  clearInputGrid = function(this:Vue_bpyVisualizer_full,incrementWin:boolean){
    this.inputTiles = createEmptyInputTiles();
    this.displayOutput = false;
    if(incrementWin)
      this.winStreak = (+this.winStreak) + 1;
    this.floorFoundCount = null;
    this.floorFoundCount_title = '';
  }
  onClickTile = function(this:Vue_bpyVisualizer_full, inputTile:InputTile){
    if(inputTile.type === TileType.player)
      return;

    if (inputTile.type === this.selectedTile)
      inputTile.type = TileType.unknown;
    else
      inputTile.type = this.selectedTile;
  }
  onMouseoverTile = function(this:Vue_bpyVisualizer_full, event:MouseEvent, inputTile:InputTile){
    if(inputTile.type === TileType.player)
      return;
    if(!event.buttons)
      return;

    if(this.selectedTile !== TileType.empty &&
       this.selectedTile !== TileType.wall &&
       this.selectedTile !== TileType.oob)
      return;
    inputTile.type = this.selectedTile;
  }
  generate = function(this:Vue_bpyVisualizer_full){
    if(this.mode === Mode.layouts)
      return this.displayAllObjects();

    if(this.mode === Mode.oneRng){
      const res = Generate(+this.rngAdvCount, +this.winStreak);
      this.tiles = this.generateTilesFromResult(res, new DisplayOptions());
      this.displayOutput = true;
      return;
    }

    if(this.mode === Mode.findFloor)
      return this.findFloor();
  }
  findFloor = function(this:Vue_bpyVisualizer_full){
    this.floorFoundCount = null;
    this.floorFoundCount_title = '';

    const results:Result[] = [];
    const minMax = this.$refs.rngCalib.getRngCalib((+this.winStreak) % 7,{}).beforeTrainer;
    for(let i = minMax.min; i <= minMax.max; i++){
      const res = Generate(i, +this.winStreak);
      results.push(res);
    }

    const opts = new DisplayOptions();
    const grids = results.map(r => this.generateTilesFromResult(r, opts));
    const resWithRegion = grids.map((grid,i) => {
      const rngAdvCount = i + minMax.min;
      return {
        grid,
        rngAdvCount,
        prob:minMax.getProbForVal(rngAdvCount) || 0,
        region:this.createRegionWithPlayerInCenter(grid)
      };
    });
    const resMatching = resWithRegion.filter(res => {
      return this.doesResultMatchFilter(res.region);
    });
    this.floorFoundCount = resMatching.length;

    if(resMatching.length === 0){
      this.displayOutput = false;
      return;
    }
    this.floorFoundCount_title = 'RNG: ' + resMatching.slice(0,50).map(a => a.rngAdvCount).join(', ');

    const probSum = resWithRegion.reduce((prev,cur) => prev + cur.prob, 0);
    resWithRegion.forEach(r => {
      r.prob /= probSum;
    });

    this.displayOutput = true;
    this.tiles = this.mergeTiles(resMatching.map(a => a.grid));
    this.inputTiles = this.mergeInputTiles(resMatching);
  }
  findEntrancePos = function(tiles:Tile[][]){
    for(let y = 0; y < tiles.length; y++){
      for(let x = 0; x < tiles[y].length; x++){
        if(tiles[y][x].type === TileType.entrance || tiles[y][x].type === TileType.player)
          return {x,y};
      }
    }
    return null;
  }
  debug_printGrid = function(tiles:Tile[][] | InputTile[][]){
    return tiles.map(row => {
      return row.map(t => typeToChar(t.type)).join('');
    }).join('\n');
  }
  createRegionWithPlayerInCenter = function(this:Vue_bpyVisualizer_full,grid:Tile[][]){
    const inputTiles = createEmptyInputTiles();
    const player = this.findEntrancePos(grid);
    if(!player){
      console.error('!player');
      return inputTiles;
    }

    inputTiles.forEach((row, y) => {
      row.forEach((tile,x) => {
        const xInTiles = x + player.x - CENTER_INPUT_TILE;
        const yInTiles = y + player.y - CENTER_INPUT_TILE;
        if(xInTiles < 0 || xInTiles >= 32 || yInTiles < 0 || yInTiles >= 32)
          tile.type = TileType.oob;
        else {
          tile.type = grid[yInTiles][xInTiles].type;
          if(grid[yInTiles][xInTiles].inTrainerRange)
            tile.inTrainerRangeProb = 1;
        }
      });
    });
    return inputTiles;
  }
  mergeInputTiles = function(this:Vue_bpyVisualizer_full, results:{prob:number,region:InputTile[][]}[]){
    if(!results.length)
      return createEmptyInputTiles();
    if(results.length === 1)
      return results[0].region;

    const inputTiles = createEmptyInputTiles();
    for(let y = 0; y < inputTiles.length; y++){
      for(let x = 0; x < inputTiles[y].length; x++){
        const t = inputTiles[y][x];
        if (t.type === TileType.player)
          continue;
        const r0Type = results[0].region[y][x].type;
        const allSame = results.every(r => r.region[y][x].type === r0Type);
        if (allSame){
          t.type = results[0].region[y][x].type;
        } else {
          t.trainerProb = results.reduce((prev, r) => {
            if (r.region[y][x].type === TileType.trainer)
              return prev + r.prob;
            return prev;
          }, 0);
          t.itemProb = results.reduce((prev, r) => {
            if (r.region[y][x].type === TileType.item)
              return prev + r.prob;
            return prev;
          }, 0);
        }
        t.inTrainerRangeProb = results.reduce((prev, r) => {
          if (r.region[y][x].inTrainerRangeProb === 1)
            return prev + r.prob;
          return prev;
        }, 0);
      }
    }
    return inputTiles;
  }
  mergeTiles = function(this:Vue_bpyVisualizer_full, grids:Tile[][][]){
    if(!grids.length)
      return createEmptyTiles();
    if(grids.length === 1)
      return grids[0];

    const mergedTiles = createEmptyTiles();
    mergedTiles.forEach((row, y) => {
      row.forEach((tile,x) => {
        const toMatch = grids[0][y][x];
        const allSame = grids.every(mat => {
          return mat[y][x].type === toMatch.type &&
                 mat[y][x].trainerGraphicId === toMatch.trainerGraphicId &&
                 mat[y][x].rotateDeg === toMatch.rotateDeg &&
                 mat[y][x].sight === toMatch.sight &&
                 mat[y][x].inTrainerRange === toMatch.inTrainerRange;
        });
        if(!allSame)
          return;

        tile.type = toMatch.type;
        tile.trainerGraphicId = toMatch.trainerGraphicId;
        tile.rotateDeg = toMatch.rotateDeg;
        tile.sight = toMatch.sight;
        tile.inTrainerRange = toMatch.inTrainerRange;
      });
    });

    return mergedTiles;
  }
  doesResultMatchFilter = function(this:Vue_bpyVisualizer_full, region:InputTile[][]){
    for(let y = 0; y < region.length; y++){
      for(let x = 0; x < region[y].length; x++){
        const generated = region[y][x].type;
        const fromInput = this.inputTiles[y][x].type;
        if (fromInput === TileType.unknown)
          continue;
        if(generated !== fromInput)
          return false;
      }
    }
    return true;
  }
  getInputTileClass = function(this:Vue_bpyVisualizer_full,tile:InputTile){
    if(tile.type === TileType.trainer)
      return 'trainerOnTile';
    if (tile.type !== TileType.unknown)
      return tile.type;
    if(tile.trainerProb === 0 && tile.itemProb === 0)
      return tile.type;
    return '';
  }
  getDataToExport = function(this:Vue_bpyVisualizer_full){
    return {
      mode:this.mode,
      rngAdvCount:+this.rngAdvCount,
      winStreak:+this.winStreak,
      displayHowToUse:this.displayHowToUse,
      rngCalib:this.$refs.rngCalib.getDataToExport(),
    };
  }
  importData = function(this:Vue_bpyVisualizer_full, json:Partial<ReturnType<Vue_bpyVisualizer_full['getDataToExport']>>){
    if (typeof json.mode === 'string')
      this.mode = json.mode;

    if (typeof json.rngAdvCount === 'number')
      this.rngAdvCount = json.rngAdvCount;

    if (typeof json.winStreak === 'number')
      this.winStreak = json.winStreak;
    if (typeof json.displayHowToUse === 'boolean')
      this.displayHowToUse = json.displayHowToUse;

    if (json.rngCalib && typeof json.rngCalib === 'object')
      this.$refs.rngCalib.importData(json.rngCalib);
  }
}

export type Vue_bpyVisualizer_full = Vue_bpyVisualizer_props & Vue_bpyVisualizer_data & Vue_bpyVisualizer_methods & {$refs:{
  rngCalib:Vue_pkRngFrameInput_full,
}};

export class Vue_bpyVisualizer {
  static Component = Vue.component('Vue_bpyVisualizer', withRender(new Vue_bpyVisualizer()));

  props = Object.keys(new Vue_bpyVisualizer_props());
  methods = new Vue_bpyVisualizer_methods();
  data = function(){
    return new Vue_bpyVisualizer_data();
  }
  watch = <any>{
    mode:<any>function(this:Vue_bpyVisualizer_full){
      if(this.mode === Mode.layouts)
        this.generate();
      else {
        this.displayOutput = false;
        this.floorFoundCount = null;
      }
      this.saveToLocalStorage();
    },
    rngAdvCount:<any>function(this:Vue_bpyVisualizer_full){ this.saveToLocalStorage(); },
    winStreak:<any>function(this:Vue_bpyVisualizer_full){ this.saveToLocalStorage(); },
    displayHowToUse:<any>function(this:Vue_bpyVisualizer_full){ this.saveToLocalStorage(); },
  }
  mounted = <any>function(this:Vue_bpyVisualizer_full){
    this.generate();

    document.addEventListener('keydown', (evt) => {
      if(this.mode !== Mode.findFloor)
        return;

      if (document.activeElement && document.activeElement.tagName === 'INPUT')
        return;

      for(let i = 0 ; i < this.selectableTiles.length; i++){
        if(evt.key === '' + (i + 1))
          this.selectedTile = this.selectableTiles[i];
      }
    });
  }
}


