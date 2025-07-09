

let debug_rngAdvCount = 0;
let gRngValueBigInt = BigInt(0);
function Random(){
  gRngValueBigInt = (BigInt(1103515245) * gRngValueBigInt) + BigInt(24691);
  gRngValueBigInt = gRngValueBigInt & BigInt(0xFFFFFFFF); //convert to u32
  debug_rngAdvCount++;
  return Number((gRngValueBigInt / BigInt(65536)) & BigInt(0xFFFF));
}

const ARRAY_COUNT = (array:any[]) => array.length;
const MOD = (a:number, n:number) => (((n) & ((n)-1)) ? ((a) % (n)) : ((a) & ((n)-1)))

const createArray = (n:number) => {
  const arr:number[] = [];
  for(let i = 0 ; i < n; i++)
    arr.push(0);
  return arr;
};
const createMatrix = (n:number,n2:number) => {
  const arr:number[][] = [];
  for(let i = 0 ; i < n; i++)
    arr.push(createArray(n2));
  return arr;
};

const TRUE =  1;
const FALSE = 0;
export const OBJ_EVENT_GFX_ITEM_BALL =                   59;
const OBJECT_EVENT_TEMPLATES_COUNT = 64;
const FRONTIER_LVL_MODE_COUNT = 2;
const FRONTIER_STAGES_PER_CHALLENGE = 7;
const MAX_PYRAMID_TRAINERS = 8;
const PYRAMID_FLOOR_SQUARES_WIDE = 4;
const PYRAMID_FLOOR_SQUARES_HIGH = 4;
const NUM_PYRAMID_FLOOR_SQUARES = (PYRAMID_FLOOR_SQUARES_WIDE * PYRAMID_FLOOR_SQUARES_HIGH);
const OBJ_TRAINERS =  0;
const OBJ_ITEMS =     1;
const OBJ_POSITIONS_UNIFORM =               0;
const OBJ_POSITIONS_IN_AND_NEAR_ENTRANCE =  1;
const OBJ_POSITIONS_IN_AND_NEAR_EXIT =      2;
const OBJ_POSITIONS_NEAR_ENTRANCE =         3;
const OBJ_POSITIONS_NEAR_EXIT =             4;
const NUM_LAYOUT_OFFSETS = 8;
const MAP_HEADER_OBJ_COUNT = 7;

const gBitTable = [
    1 << 0,
    1 << 1,
    1 << 2,
    1 << 3,
    1 << 4,
    1 << 5,
    1 << 6,
    1 << 7,
    1 << 8,
    1 << 9,
    1 << 10,
    1 << 11,
    1 << 12,
    1 << 13,
    1 << 14,
    1 << 15,
    1 << 16,
    1 << 17,
    1 << 18,
    1 << 19,
    1 << 20,
    1 << 21,
    1 << 22,
    1 << 23,
    1 << 24,
    1 << 25,
    1 << 26,
    1 << 27,
    1 << 28,
    1 << 29,
    1 << 30,
    1 << 31,
];

class PyramidFloorTemplate
{
    constructor(
      public numItems = 0,
      public numTrainers = 0,
      public itemPositions = 0,
      public trainerPositions = 0,
      public runMultiplier = 0,
      public layoutOffsets = createArray(NUM_LAYOUT_OFFSETS)){}
};

class BattleFrontier
{
    lvlMode = 0;
    curChallengeBattleNum = 0;
    trainerIds = createArray(20);
    pyramidRandoms = createArray(4);
    pyramidWinStreaks = createArray(FRONTIER_LVL_MODE_COUNT);
};

class ObjectEventTemplate
{
    constructor(
      public graphicsId = 0,
      public x = 0,
      public y = 0,
      public localId = 0){}
};

const mapHeaders = [
  [
    new ObjectEventTemplate(0, 2, 3),
    new ObjectEventTemplate(0, 5, 3),
    new ObjectEventTemplate(0, 2, 6),
    new ObjectEventTemplate(0, 6, 6),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 4, 1),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 7, 4),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 0, 4),
  ],
  [
    new ObjectEventTemplate(0, 2, 1),
    new ObjectEventTemplate(0, 5, 6),
    new ObjectEventTemplate(0, 2, 6),
    new ObjectEventTemplate(0, 5, 1),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 6, 5),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 7, 0),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 0, 2),
  ],
  [
    new ObjectEventTemplate(0, 2, 1),
    new ObjectEventTemplate(0, 6, 1),
    new ObjectEventTemplate(0, 6, 4),
    new ObjectEventTemplate(0, 3, 4),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 4, 2),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 0, 3),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 2, 7),
  ],
  [
    new ObjectEventTemplate(0, 7, 2),
    new ObjectEventTemplate(0, 7, 7),
    new ObjectEventTemplate(0, 1, 4),
    new ObjectEventTemplate(0, 6, 4),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 2, 6),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 5, 3),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 3, 0),
  ],
  [
    new ObjectEventTemplate(0, 6, 4),
    new ObjectEventTemplate(0, 3, 7),
    new ObjectEventTemplate(0, 3, 1),
    new ObjectEventTemplate(0, 6, 0),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 0, 3),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 7, 6),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 4, 3),
  ],
  [
    new ObjectEventTemplate(0, 5, 2),
    new ObjectEventTemplate(0, 2, 5),
    new ObjectEventTemplate(0, 5, 5),
    new ObjectEventTemplate(0, 2, 2),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 7, 7),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 4, 3),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 0, 0),
  ],
  [
    new ObjectEventTemplate(0, 0, 6),
    new ObjectEventTemplate(0, 4, 0),
    new ObjectEventTemplate(0, 6, 0),
    new ObjectEventTemplate(0, 4, 4),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 7, 4),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 1, 1),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 3, 7),
  ],
  [
    new ObjectEventTemplate(0, 1, 2),
    new ObjectEventTemplate(0, 6, 5),
    new ObjectEventTemplate(0, 1, 5),
    new ObjectEventTemplate(0, 6, 2),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 4, 3),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 3, 6),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 1, 0),
  ],
  [
    new ObjectEventTemplate(0, 3, 0),
    new ObjectEventTemplate(0, 6, 4),
    new ObjectEventTemplate(0, 6, 0),
    new ObjectEventTemplate(0, 3, 5),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 7, 0),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 1, 0),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 1, 6),
  ],
  [
    new ObjectEventTemplate(0, 3, 0),
    new ObjectEventTemplate(0, 0, 3),
    new ObjectEventTemplate(0, 6, 5),
    new ObjectEventTemplate(0, 0, 5),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 3, 6),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 5, 3),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 1, 1),
  ],
  [
    new ObjectEventTemplate(0, 3, 2),
    new ObjectEventTemplate(0, 3, 6),
    new ObjectEventTemplate(0, 6, 4),
    new ObjectEventTemplate(0, 6, 7),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 6, 2),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 1, 2),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 1, 5),
  ],
  [
    new ObjectEventTemplate(0, 7, 5),
    new ObjectEventTemplate(0, 0, 5),
    new ObjectEventTemplate(0, 3, 0),
    new ObjectEventTemplate(0, 3, 3),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 7, 2),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 0, 3),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 7, 7),
  ],
  [
    new ObjectEventTemplate(0, 5, 1),
    new ObjectEventTemplate(0, 5, 6),
    new ObjectEventTemplate(0, 1, 1),
    new ObjectEventTemplate(0, 1, 6),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 3, 1),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 7, 0),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 0, 3),
  ],
  [
    new ObjectEventTemplate(0, 7, 1),
    new ObjectEventTemplate(0, 1, 1),
    new ObjectEventTemplate(0, 6, 5),
    new ObjectEventTemplate(0, 0, 5),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 5, 3),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 0, 7),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 7, 5),
  ],
  [
    new ObjectEventTemplate(0, 2, 5),
    new ObjectEventTemplate(0, 2, 1),
    new ObjectEventTemplate(0, 6, 4),
    new ObjectEventTemplate(0, 6, 0),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 0, 7),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 7, 5),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 1, 2),
  ],
  [
    new ObjectEventTemplate(0, 0, 6),
    new ObjectEventTemplate(0, 1, 0),
    new ObjectEventTemplate(0, 6, 7),
    new ObjectEventTemplate(0, 6, 0),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 0, 7),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 7, 7),
    new ObjectEventTemplate(OBJ_EVENT_GFX_ITEM_BALL, 5, 2),
  ]
];

const sPyramidFloorTemplates =
[
    new PyramidFloorTemplate(
        7,
        3,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_UNIFORM,
        128,
        [0, 0, 1, 1, 2, 2, 3, 3],
    ),
    new PyramidFloorTemplate(
        6,
        3,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_UNIFORM,
        128,
        [1, 1, 2, 2, 3, 3, 4, 4],
    ),
    new PyramidFloorTemplate(
        5,
        3,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_UNIFORM,
        120,
        [2, 2, 3, 3, 4, 4, 5, 5],
    ),
    new PyramidFloorTemplate(
        4,
        4,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_UNIFORM,
        120,
        [3, 3, 4, 4, 5, 5, 6, 6],
    ),
    new PyramidFloorTemplate(
        4,
        4,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_IN_AND_NEAR_ENTRANCE,
        112,
        [4, 4, 5, 5, 6, 6, 7, 7],
    ),
    new PyramidFloorTemplate(
        3,
        5,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_IN_AND_NEAR_EXIT,
        112,
        [5, 6, 7, 8, 9, 10, 11, 12],
    ),
    new PyramidFloorTemplate(
        3,
        5,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_UNIFORM,
        104,
        [6, 7, 8, 9, 10, 11, 12, 13],
    ),
    new PyramidFloorTemplate(
        2,
        4,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_IN_AND_NEAR_ENTRANCE,
        104,
        [7, 8, 9, 10, 11, 12, 13, 14],
    ),
    new PyramidFloorTemplate(
        4,
        5,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_IN_AND_NEAR_EXIT,
        96,
        [8, 9, 10, 11, 12, 13, 14, 15],
    ),
    new PyramidFloorTemplate(
        3,
        6,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_NEAR_EXIT,
        96,
        [8, 9, 10, 11, 12, 13, 14, 15],
    ),
    new PyramidFloorTemplate(
        2,
        3,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_UNIFORM,
        88,
        [12, 13, 14, 12, 13, 14, 12, 13],
    ),
    new PyramidFloorTemplate(
        4,
        5,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_UNIFORM,
        88,
        [11, 11, 11, 11, 11, 11, 11, 11],
    ),
    new PyramidFloorTemplate(
        3,
        7,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_UNIFORM,
        80,
        [12, 12, 12, 12, 12, 12, 12, 12],
    ),
    new PyramidFloorTemplate(
        2,
        4,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_UNIFORM,
        80,
        [13, 13, 13, 13, 13, 13, 13, 13],
    ),
    new PyramidFloorTemplate(
        3,
        6,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_UNIFORM,
        80,
        [14, 14, 14, 14, 14, 14, 14, 14],
    ),
    new PyramidFloorTemplate(
        3,
        8,
        OBJ_POSITIONS_UNIFORM,
        OBJ_POSITIONS_UNIFORM,
        80,
        [15, 15, 15, 15, 15, 15, 15, 15],
    )
];

const sPyramidFloorTemplateOptions =
[
    // Floor 0
    [40,  0],
    [70,  1],
    [90,  2],
    [100, 3],
    // Floor 1
    [35,  1],
    [55,  2],
    [75,  3],
    [90,  4],
    [100, 10],
    // Floor 2
    [35,  2],
    [55,  3],
    [75,  4],
    [90,  5],
    [100, 11],
    // Floor 3
    [35,  3],
    [55,  4],
    [75,  5],
    [90,  6],
    [100, 12],
    // Floor 4
    [35,  4],
    [55,  5],
    [75,  6],
    [90,  7],
    [100, 13],
    // Floor 5
    [35,  5],
    [55,  6],
    [75,  7],
    [90,  8],
    [100, 14],
    // Floor 6
    [35,  6],
    [55,  7],
    [75,  8],
    [90,  9],
    [100, 15]
];

const sFloorTemplateOffsets = [ 0, 4, 9, 14, 19, 24, 29 ];


const sBorderedSquareIds =
[
    [1,   4, 0xFF, 0xFF],
    [0,   2,  5, 0xFF],
    [1,   3,  6, 0xFF],
    [2,   7, 0xFF, 0xFF],
    [0,   5,  8, 0xFF],
    [1,   4,  6,  9],
    [2,   5,  7, 10],
    [3,   6, 11, 0xFF],
    [4,   9, 12, 0xFF],
    [5,   8, 10, 13],
    [6,   9, 11, 14],
    [7,  10, 15, 0xFF],
    [8,  13, 0xFF, 0xFF],
    [9,  12, 14, 0xFF],
    [10, 13, 15, 0xFF],
    [11, 14, 0xFF, 0xFF],
];

const gTowerMaleFacilityClasses = [14,17,3,21,23,7,10,25,26,27,29,30,32,38,41,9,43,45,46,48,50,52,4,53,58,5,66,68,67,0];
const gTowerFemaleFacilityClasses = [13,16,18,12,19,20,31,39,42,22,47,49,51,54,55,56,28,2,69,71];
const gTowerMaleTrainerGfxIds = [55,54,33,15,39,51,44,66,66,31,39,37,48,38,25,21,35,50,56,51,51,33,66,5,49,39,65,31,36,55];
const gTowerFemaleTrainerGfxIds = [20,53,34,40,20,45,47,14,18,22,57,52,52,14,34,52,32,20,32,47];

// New code
export class Result
{
    objects = createMatrix(64,3)
    layoutBySquareIdx = createArray(16);

    objectCount = 0;
    entranceSquareId = -1;
    exitSquareId = -1;

    /*std::string toJson() const
    {
        std::string s;
        s.reserve(1000);
        s += "{\"entranceSquareId\":";
        s += std::to_string(entranceSquareId);
        s += ",\"exitSquareId\":";
        s += std::to_string(exitSquareId);
        s += ",\"layoutBySquareIdx\":[";
        for (u8 layout : layoutBySquareId)
            s += std::to_string(layout) + ",";
        s.pop_back(); // remove last ,
        s += "],\"objects\":[";
        for (u8 i = 0; i < objectCount; i++)
        {
            const auto& obj = objects[i];
            s += "[";
            s += std::to_string(obj[0]);
            s += "," + std::to_string(obj[1]) + "," + std::to_string(obj[2]) + "],";
        }
        if (objectCount != 0)
            s.pop_back(); // remove last ,
        s += "]}";

        return s;
    }*/
};


let gSaveBlock2Ptr_frontier = new BattleFrontier();

let gSaveBlock1Ptr_objectEventTemplates = Array.from(new Array(OBJECT_EVENT_TEMPLATES_COUNT)).map(a => new ObjectEventTemplate());

function SeedPyramidFloor()
{
    let i;

    for (i = 0; i < ARRAY_COUNT(gSaveBlock2Ptr_frontier.pyramidRandoms); i++)
        gSaveBlock2Ptr_frontier.pyramidRandoms[i] = Random();
}


const sFrontierTrainerIdRanges =
[
    [0,   99],   //   0 -  99
    [80,  119],  //  80 - 119
    [100,    139],  // 100 - 139
    [120,  159], // 120 - 159
    [140,  179], // 140 - 179
    [160, 199],  // 160 - 199
    [180,    219],   // 180 - 219
    [200,   299], // 200 - 299
];

const sFrontierTrainerIdRangesHard =
[
    [100,    119],  // 100 - 119
    [120,  139],  // 120 - 139
    [140,  159], // 140 - 159
    [160, 179], // 160 - 179
    [180,    199],  // 180 - 199
    [200,   219],   // 200 - 219
    [220,    239],   // 220 - 239
    [200,   299], // 200 - 299
];


function GetRandomScaledFrontierTrainerId(challengeNum:number, battleNum:number)
{
    let trainerId;

    if (challengeNum <= 7)
    {
        if (battleNum == FRONTIER_STAGES_PER_CHALLENGE - 1)
        {
            // The last battle in each challenge has a jump in difficulty, pulls from a table with higher ranges
            trainerId = (sFrontierTrainerIdRangesHard[challengeNum][1] - sFrontierTrainerIdRangesHard[challengeNum][0]) + 1;
            trainerId = sFrontierTrainerIdRangesHard[challengeNum][0] + (Random() % trainerId);
        }
        else
        {
            trainerId = (sFrontierTrainerIdRanges[challengeNum][1] - sFrontierTrainerIdRanges[challengeNum][0]) + 1;
            trainerId = sFrontierTrainerIdRanges[challengeNum][0] + (Random() % trainerId);
        }
    }
    else
    {
        // After challenge 7, trainer IDs always come from the last, hardest range, which is the same for both trainer ID tables
        trainerId = (sFrontierTrainerIdRanges[7][1] - sFrontierTrainerIdRanges[7][0]) + 1;
        trainerId = sFrontierTrainerIdRanges[7][0] + (Random() % trainerId);
    }

    return trainerId;
}

function GetUniqueTrainerId(objectEventId:number)
{
    let i;
    let trainerId;
    let lvlMode = gSaveBlock2Ptr_frontier.lvlMode;
    let challengeNum = Math.floor(gSaveBlock2Ptr_frontier.pyramidWinStreaks[lvlMode] / FRONTIER_STAGES_PER_CHALLENGE);
    let floor = gSaveBlock2Ptr_frontier.curChallengeBattleNum;
    if (floor == FRONTIER_STAGES_PER_CHALLENGE)
    {
        do
        {
            trainerId = GetRandomScaledFrontierTrainerId(challengeNum + 1, floor);
            for (i = 0; i < objectEventId; i++)
            {
                if (gSaveBlock2Ptr_frontier.trainerIds[i] == trainerId)
                    break;
            }
        } while (i != objectEventId);
    }
    else
    {
        do
        {
            trainerId = GetRandomScaledFrontierTrainerId(challengeNum, floor);
            for (i = 0; i < objectEventId; i++)
            {
                if (gSaveBlock2Ptr_frontier.trainerIds[i] == trainerId)
                    break;
            }
        } while (i != objectEventId);
    }

    return trainerId;
}


function LoadBattlePyramidObjectEventTemplates()
{
    let i;
    let id;

    for (i = 0; i < MAX_PYRAMID_TRAINERS; i++)
        gSaveBlock2Ptr_frontier.trainerIds[i] = 0xFFFF;

    id = GetPyramidFloorTemplateId();
    const {entranceSquareId, exitSquareId} = GetPyramidEntranceAndExitSquareIds();

    gSaveBlock1Ptr_objectEventTemplates = Array.from(new Array(OBJECT_EVENT_TEMPLATES_COUNT)).map(a => new ObjectEventTemplate());

    for (i = 0; i < 2; i++)
    {
        let objectPositionsType;

        if (i == OBJ_TRAINERS)
            objectPositionsType = sPyramidFloorTemplates[id].trainerPositions;
        else  // OBJ_ITEMS
            objectPositionsType = sPyramidFloorTemplates[id].itemPositions;

        switch (objectPositionsType)
        {
        case OBJ_POSITIONS_UNIFORM:
            SetPyramidObjectPositionsUniformly(i);
            break;
        case OBJ_POSITIONS_IN_AND_NEAR_ENTRANCE:
            if (SetPyramidObjectPositionsInAndNearSquare(i, entranceSquareId))
                SetPyramidObjectPositionsUniformly(i);
            break;
        case OBJ_POSITIONS_IN_AND_NEAR_EXIT:
            if (SetPyramidObjectPositionsInAndNearSquare(i, exitSquareId))
                SetPyramidObjectPositionsUniformly(i);
            break;
        case OBJ_POSITIONS_NEAR_ENTRANCE:
            if (SetPyramidObjectPositionsNearSquare(i, entranceSquareId))
                SetPyramidObjectPositionsUniformly(i);
            break;
        case OBJ_POSITIONS_NEAR_EXIT:
            if (SetPyramidObjectPositionsNearSquare(i, exitSquareId))
                SetPyramidObjectPositionsUniformly(i);
            break;
        }
    }
}

function GetPyramidEntranceAndExitSquareIds()
{
    let entranceSquareId = gSaveBlock2Ptr_frontier.pyramidRandoms[3] % NUM_PYRAMID_FLOOR_SQUARES;
    let exitSquareId = gSaveBlock2Ptr_frontier.pyramidRandoms[0] % NUM_PYRAMID_FLOOR_SQUARES;

    if (entranceSquareId == exitSquareId)
    {
        entranceSquareId = (gSaveBlock2Ptr_frontier.pyramidRandoms[3] + 1) % NUM_PYRAMID_FLOOR_SQUARES;
        exitSquareId = (gSaveBlock2Ptr_frontier.pyramidRandoms[0] + NUM_PYRAMID_FLOOR_SQUARES - 1) % NUM_PYRAMID_FLOOR_SQUARES;
    }
    return {entranceSquareId,exitSquareId};
}

function SetPyramidObjectPositionsUniformly(objType:number)
{
    let i;
    let numObjects;
    let objectStartIndex;
    let squareId;
    let bits = 0;
    let id = GetPyramidFloorTemplateId();
    let floorLayoutOffsets = createArray(NUM_PYRAMID_FLOOR_SQUARES);

    GetPyramidFloorLayoutOffsets(floorLayoutOffsets);
    squareId = gSaveBlock2Ptr_frontier.pyramidRandoms[2] % NUM_PYRAMID_FLOOR_SQUARES;
    if (objType == OBJ_TRAINERS)
    {
        numObjects = sPyramidFloorTemplates[id].numTrainers;
        objectStartIndex = 0;
    }
    else // OBJ_ITEMS
    {
        numObjects = sPyramidFloorTemplates[id].numItems;
        objectStartIndex = sPyramidFloorTemplates[id].numTrainers;
    }

    for (i = 0; i < numObjects; i++)
    {
        do
        {
            do
            {
                if (bits & 1)
                {
                    if (!(gBitTable[squareId] & gSaveBlock2Ptr_frontier.pyramidRandoms[3]))
                        bits |= 2;
                }
                else
                {
                    if (gBitTable[squareId] & gSaveBlock2Ptr_frontier.pyramidRandoms[3])
                        bits |= 2;
                }
                if (++squareId >= NUM_PYRAMID_FLOOR_SQUARES)
                    squareId = 0;

                if (squareId == gSaveBlock2Ptr_frontier.pyramidRandoms[2] % NUM_PYRAMID_FLOOR_SQUARES)
                {
                    if (bits & 1)
                        bits |= 6;
                    else
                        bits |= 1;
                }
            } while (!(bits & 2));

        } while (!(bits & 4) && TrySetPyramidObjectEventPositionInSquare(objType, floorLayoutOffsets, squareId, objectStartIndex + i));
        bits &= 1;
    }
}

function SetPyramidObjectPositionsInAndNearSquare(objType:number, squareId:number)
{
    let i;
    let objectStartIndex;
    let borderedIndex = 0;
    let r7 = 0;
    let numPlacedObjects = 0;
    let numObjects;
    let id = GetPyramidFloorTemplateId();
    let floorLayoutOffsets = createArray(NUM_PYRAMID_FLOOR_SQUARES);

    GetPyramidFloorLayoutOffsets(floorLayoutOffsets);
    if (objType == OBJ_TRAINERS)
    {
        numObjects = sPyramidFloorTemplates[id].numTrainers;
        objectStartIndex = 0;
    }
    else // OBJ_ITEMS
    {
        numObjects = sPyramidFloorTemplates[id].numItems;
        objectStartIndex = sPyramidFloorTemplates[id].numTrainers;
    }

    for (i = 0; i < numObjects; i++)
    {
        if (r7 == 0)
        {
            if (TrySetPyramidObjectEventPositionInSquare(objType, floorLayoutOffsets, squareId, objectStartIndex + i))
                r7 = 1;
            else
                numPlacedObjects++;
        }
        if (r7 & 1)
        {
            if (TrySetPyramidObjectEventPositionInSquare(objType, floorLayoutOffsets, sBorderedSquareIds[squareId][borderedIndex], objectStartIndex + i))
            {
                do
                {
                    borderedIndex++;
                    if (sBorderedSquareIds[squareId][borderedIndex] == 0xFF || borderedIndex >= 4)
                        borderedIndex = 0;
                    r7 += 2;
                } while (r7 >> 1 != 4 && TrySetPyramidObjectEventPositionInSquare(objType, floorLayoutOffsets, sBorderedSquareIds[squareId][borderedIndex], objectStartIndex + i));
                numPlacedObjects++;
            }
            else
            {
                borderedIndex++;
                if (sBorderedSquareIds[squareId][borderedIndex] == 0xFF || borderedIndex >= 4)
                    borderedIndex = 0;
                numPlacedObjects++;
            }
        }

        if (r7 >> 1 == 4)
            break;

        r7 &= 1;
    }

    return Math.floor(numObjects / 2) > numPlacedObjects;
}

function SetPyramidObjectPositionsNearSquare(objType:number, squareId:number)
{
    let i;
    let objectStartIndex;
    let borderOffset = 0;
    let numPlacedObjects = 0;
    let r8 = 0;
    let numObjects;
    let id = GetPyramidFloorTemplateId();
    let floorLayoutOffsets = createArray(NUM_PYRAMID_FLOOR_SQUARES);

    GetPyramidFloorLayoutOffsets(floorLayoutOffsets);
    if (objType == OBJ_TRAINERS)
    {
        numObjects = sPyramidFloorTemplates[id].numTrainers;
        objectStartIndex = 0;
    }
    else // OBJ_ITEMS
    {
        numObjects = sPyramidFloorTemplates[id].numItems;
        objectStartIndex = sPyramidFloorTemplates[id].numTrainers;
    }

    for (i = 0; i < numObjects; i++)
    {
        if (TrySetPyramidObjectEventPositionInSquare(objType, floorLayoutOffsets, sBorderedSquareIds[squareId][borderOffset], objectStartIndex + i))
        {
            do
            {
                borderOffset++;
                if (sBorderedSquareIds[squareId][borderOffset] == 0xFF || borderOffset >= 4)
                    borderOffset = 0;
                r8++;
            } while (r8 != 4 && TrySetPyramidObjectEventPositionInSquare(objType, floorLayoutOffsets, sBorderedSquareIds[squareId][borderOffset], objectStartIndex + i));
            numPlacedObjects++;
        }
        else
        {
            borderOffset++;
            if (sBorderedSquareIds[squareId][borderOffset] == 0xFF || borderOffset >= 4)
                borderOffset = 0;
            numPlacedObjects++;
        }

        if (r8 == 4)
            break;
    }

    return Math.floor(numObjects / 2) > numPlacedObjects;
}

function TrySetPyramidObjectEventPositionInSquare(objType:number, floorLayoutOffsets:number[], squareId:number, objectEventId:number)
{
    let x, y;

    if (gSaveBlock2Ptr_frontier.pyramidRandoms[0] & 1)
    {
        for (y = 7; y > -1; y--)
        {
            for (x = 7; x > -1; x--)
            {
                if (!TrySetPyramidObjectEventPositionAtCoords(objType, x, y, floorLayoutOffsets, squareId, objectEventId))
                    return FALSE;
            }
        }
    }
    else
    {
        for (y = 0; y < 8; y++)
        {
            for (x = 0; x < 8; x++)
            {
                if (!TrySetPyramidObjectEventPositionAtCoords(objType, x, y, floorLayoutOffsets, squareId, objectEventId))
                    return FALSE;
            }
        }
    }

    return TRUE;
}

function TrySetPyramidObjectEventPositionAtCoords(objType:number, x:number, y:number, floorLayoutOffsets:number[], squareId:number,  objectEventId:number)
{
    let i, j;
    const floorEvents = gSaveBlock1Ptr_objectEventTemplates;

    const mapHeader_objects = mapHeaders[floorLayoutOffsets[squareId]];
    for (i = 0; i < MAP_HEADER_OBJ_COUNT; i++)
    {
        if (mapHeader_objects[i].x != x || mapHeader_objects[i].y != y)
            continue;

        if (objType != OBJ_TRAINERS || mapHeader_objects[i].graphicsId == OBJ_EVENT_GFX_ITEM_BALL)
        {
            if (objType != OBJ_ITEMS || mapHeader_objects[i].graphicsId != OBJ_EVENT_GFX_ITEM_BALL)
                continue;
        }

        // Ensure an object wasn't previously placed in the exact same position.
        for (j = 0; j < objectEventId; j++)
        {
            if (floorEvents[j].x == x + ((squareId % 4) * 8) && floorEvents[j].y == y + (Math.floor(squareId / 4) * 8))
                break;
        }

        if (j == objectEventId)
        {
            floorEvents[objectEventId].x = mapHeader_objects[i].x + (squareId % 4) * 8;
            floorEvents[objectEventId].y = mapHeader_objects[i].y +  Math.floor(squareId / 4) * 8;
            floorEvents[objectEventId].graphicsId = mapHeader_objects[i].graphicsId;
            floorEvents[objectEventId].localId = objectEventId + 1;
            if (floorEvents[objectEventId].graphicsId != OBJ_EVENT_GFX_ITEM_BALL)
            {
                i = GetUniqueTrainerId(objectEventId);
                floorEvents[objectEventId].graphicsId = GetBattleFacilityTrainerGfxId(i);
                gSaveBlock2Ptr_frontier.trainerIds[objectEventId] = i;
            }
            return FALSE;
        }
    }

    return TRUE;
}

//battleTowerTrainerId to facilityClass
const gFacilityTrainers = new Map(
[[0,43],[1,43],[2,43],[3,71],[4,71],[5,71],[6,38],[7,38],[8,38],[9,39],[10,39],[11,39],[12,21],[13,21],[14,21],[15,19],[16,19],[17,19],[18,27],[19,27],[20,27],[21,28],[22,28],[23,28],[24,17],[25,17],[26,17],[27,16],[28,16],[29,16],[30,7],[31,7],[32,7],[33,56],[34,56],[35,56],[36,41],[37,41],[38,41],[39,42],[40,42],[41,42],[42,66],[43,66],[44,66],[45,2],[46,2],[47,2],[48,67],[49,67],[50,67],[51,53],[52,53],[53,53],[54,29],[55,29],[56,29],[57,45],[58,45],[59,45],[60,14],[61,14],[62,14],[63,5],[64,5],[65,5],[66,55],[67,55],[68,55],[69,20],[70,20],[71,20],[72,13],[73,13],[74,13],[75,25],[76,25],[77,25],[78,4],[79,4],[80,4],[81,58],[82,58],[83,58],[84,0],[85,0],[86,0],[87,26],[88,26],[89,26],[90,48],[91,48],[92,49],[93,49],[94,50],[95,50],[96,51],[97,51],[98,46],[99,47],[100,48],[101,49],[102,50],[103,51],[104,46],[105,46],[106,47],[107,47],[108,10],[109,10],[110,10],[111,54],[112,54],[113,54],[114,9],[115,9],[116,9],[117,22],[118,22],[119,22],[120,30],[121,30],[122,30],[123,31],[124,31],[125,31],[126,12],[127,12],[128,12],[129,23],[130,23],[131,23],[132,32],[133,32],[134,29],[135,14],[136,5],[137,55],[138,20],[139,13],[140,3],[141,3],[142,3],[143,18],[144,18],[145,18],[146,68],[147,68],[148,68],[149,69],[150,69],[151,69],[152,52],[153,52],[154,52],[155,52],[156,41],[157,42],[158,66],[159,2],[160,43],[161,43],[162,71],[163,71],[164,38],[165,38],[166,39],[167,39],[168,21],[169,21],[170,19],[171,19],[172,67],[173,67],[174,53],[175,53],[176,17],[177,17],[178,16],[179,16],[180,29],[181,29],[182,45],[183,45],[184,14],[185,14],[186,5],[187,5],[188,25],[189,25],[190,4],[191,4],[192,58],[193,58],[194,0],[195,0],[196,26],[197,26],[198,32],[199,32],[200,43],[201,43],[202,71],[203,71],[204,27],[205,27],[206,28],[207,28],[208,7],[209,7],[210,56],[211,56],[212,41],[213,41],[214,42],[215,42],[216,66],[217,66],[218,2],[219,2],[220,3],[221,3],[222,3],[223,3],[224,18],[225,18],[226,18],[227,18],[228,68],[229,68],[230,68],[231,69],[232,69],[233,69],[234,52],[235,52],[236,52],[237,10],[238,10],[239,10],[240,54],[241,54],[242,54],[243,9],[244,9],[245,9],[246,22],[247,22],[248,22],[249,30],[250,30],[251,30],[252,31],[253,31],[254,31],[255,12],[256,12],[257,12],[258,23],[259,23],[260,23],[261,32],[262,32],[263,32],[264,48],[265,48],[266,49],[267,49],[268,50],[269,50],[270,51],[271,51],[272,46],[273,46],[274,47],[275,47],[276,29],[277,29],[278,45],[279,45],[280,14],[281,14],[282,5],[283,5],[284,25],[285,25],[286,4],[287,4],[288,58],[289,58],[290,0],[291,0],[292,26],[293,26],[294,55],[295,55],[296,20],[297,20],[298,13],[299,13]]);

function GetBattleFacilityTrainerGfxId(trainerId:number)
{
    let i;
    let facilityClass;
    let trainerObjectGfxId;

    facilityClass = gFacilityTrainers.get(trainerId)!;

    // Search male classes.
    for (i = 0; i < ARRAY_COUNT(gTowerMaleFacilityClasses); i++)
    {
        if (gTowerMaleFacilityClasses[i] == facilityClass)
            break;
    }
    if (i != ARRAY_COUNT(gTowerMaleFacilityClasses))
    {
        trainerObjectGfxId = gTowerMaleTrainerGfxIds[i];
        return trainerObjectGfxId;
    }

    // Search female classes.
    for (i = 0; i < ARRAY_COUNT(gTowerFemaleFacilityClasses); i++)
    {
        if (gTowerFemaleFacilityClasses[i] == facilityClass)
            break;
    }
    if (i != ARRAY_COUNT(gTowerFemaleFacilityClasses))
    {
        trainerObjectGfxId = gTowerFemaleTrainerGfxIds[i];
        return trainerObjectGfxId;
    }
    else
    {
        return 7; //OBJ_EVENT_GFX_BOY_1;
    }
}

function GetPyramidFloorLayoutOffsets(layoutOffsets:number[])
{
    let i;
    let rand = (gSaveBlock2Ptr_frontier.pyramidRandoms[0]) | (gSaveBlock2Ptr_frontier.pyramidRandoms[1] << 16);
    let id = GetPyramidFloorTemplateId();

    for (i = 0; i < NUM_PYRAMID_FLOOR_SQUARES; i++)
    {
        layoutOffsets[i] = sPyramidFloorTemplates[id].layoutOffsets[MOD(rand, NUM_LAYOUT_OFFSETS)];
        rand >>= 3;
        if (i == 7)
        {
            rand = (gSaveBlock2Ptr_frontier.pyramidRandoms[2]) | (gSaveBlock2Ptr_frontier.pyramidRandoms[3] << 16);
            rand >>= 8;
        }
    }
}

function GetPyramidFloorTemplateId()
{
    let i;
    let rand = gSaveBlock2Ptr_frontier.pyramidRandoms[3] % 100;
    let floor = gSaveBlock2Ptr_frontier.curChallengeBattleNum;

    for (i = sFloorTemplateOffsets[floor]; i < ARRAY_COUNT(sPyramidFloorTemplateOptions); i++)
    {
        if (rand < sPyramidFloorTemplateOptions[i][0])
            return sPyramidFloorTemplateOptions[i][1];
    }
    return 0;
}

export function Generate(rngAdv:number, winStreak:number)
{
    gRngValueBigInt = BigInt(0);
    debug_rngAdvCount = 0;
    for (let i = 0; i < rngAdv; i++)
        Random();

    const battleFrontier = new BattleFrontier();
    battleFrontier.lvlMode = 0; //doesn't matter
    battleFrontier.curChallengeBattleNum = winStreak % 7;
    battleFrontier.pyramidWinStreaks[battleFrontier.lvlMode] = winStreak;

    gSaveBlock2Ptr_frontier = battleFrontier;

    SeedPyramidFloor();

    for(let i = 0; i < 37; i++)
      Random(); //only impacts the trainer id

    LoadBattlePyramidObjectEventTemplates();

    const res = new Result();
    for (let i = 0 ; i < 64; i++)
    {
        if (gSaveBlock1Ptr_objectEventTemplates[i].localId == 0)
            break;

        res.objects[i][0] = gSaveBlock1Ptr_objectEventTemplates[i].graphicsId;
        res.objects[i][1] = gSaveBlock1Ptr_objectEventTemplates[i].x;
        res.objects[i][2] = gSaveBlock1Ptr_objectEventTemplates[i].y;
        res.objectCount++;
    }
    const {entranceSquareId, exitSquareId} = GetPyramidEntranceAndExitSquareIds();
    res.entranceSquareId = entranceSquareId;
    res.exitSquareId = exitSquareId;

    GetPyramidFloorLayoutOffsets(res.layoutBySquareIdx);

    return res;
}

