--[[
Pokemon Emerald Battle Facilities Assistant v6 by RainingChain

Goal
- The goal of the tool is to help players beat the Pokemon Emerald Battle Frontier.
- The tool helps decide what move to use and what Pokemon to switch to, by automatically calculating the expected damage of each move.

Implementation
- The player plays English Pokemon Emerald on the mGBA emulator and runs a script in the emulator to transfer game data to this web page. The web page uses that data to deduct the opponent Pokemon and calculate expected damage.
- The tool only uses information available to the player to deduct the opponent Pokemon, such as the used moves and the number of pixels of the HP bar. Everything done by the tool could also be done manually by a player playing on a retail cartridge.

How To Use
- Download mGBA v0.11-8511 or newer, in the the Development downloads section. The current non-developement release (mGBA v0.10.3) doesn't work.
- Download BattleFrontierAssistant_Emerald_v6.lua script.
- While playing English Pokemon Emerald in Battle Frontier, press Tools->Scriptings... then File->Load script... and select the downloaded BattleFrontierAssistant_Emerald_v6.lua script.
- In the console of the Scripting window in mGBA, a session ID should be displayed. Enter that session ID on the website page in the Setup section then press Connect.
- Upon starting a battle or using a move, the web page will update to display info about the battle.
--]]

-- #######################################################
-- Config Start
local supportBattlePalace = true

-- if true, this can cause timing issues if you enter the battle factory area. if false, there are no timing issues but the RNG manip in the Assistant doesn't work for 1st battle of battle factory
local supportBattle1OfBattleFactory = true

-- if true, the site is updated automatically. if false, you must manually run update() in the script console to send data to the website
local automaticUpdate = true
-- Config End
-- #######################################################

local SCRIPT_VERSION = 6 --v6. Note: to change, must update MGBA_VERSION in pkAssistant.ts too
local SESSION_ID = tostring(math.random(10000000))
local HOST_URL = "pokemoncompletion.com"
local PORT = 80
local CLIENT_UI_URL = "https://pokemoncompletion.com/BattleFacilities/Emerald/Assistant?mgbaId=" .. SESSION_ID

local IS_DEV = true -- set to false by the JS on the site
local VERBOSE = 1

local addedCallbackForBattlePalace = false
local addedCallbackForBattleFactory = false

local lastRngFrameInfo = ''
local printCycleCountPerSectionJson = false
active = true -- global variable

-- for development
if (IS_DEV) then
  SESSION_ID = '0'
  HOST_URL = "localhost"
  VERBOSE = 1
  PORT = 3000
  CLIENT_UI_URL = "http://localhost:3000/BattleFacilities/Emerald/Assistant?mgbaId=" .. SESSION_ID
  printCycleCountPerSectionJson = true
  automaticUpdate = false
  supportBattle1OfBattleFactory = false
end


local gPlayerParty = 0x020244ec
local gEnemyParty  = 0x02024744
local gTrainerId  = 0x2038bca

local gBattleMons  = 0x2024084
local gActiveBattler  = 0x2024064
local gBattlersCount = 0x0202406c
local gBattleWeather = 0x020243cc

local gSaveBlock2Ptr = 0x03005d90
local gSaveBlock1Ptr = 0x03005d8c

local PARTY_MON_COUNT = 3
local PARTY_MON_LEN = 100

local BATTLE_MON_COUNT = 2
local BATTLE_MON_LEN = 88

local lastPalaceOldManMsgId = 255
local lastFactoryPlayerRental = "000000000000000000000000"

local SEP = "SEP!"

console:log("How to use:")
console:log("- Open a browser, and go to the website below")
console:log("- " .. CLIENT_UI_URL)
console:log("- Enter the session ID " .. SESSION_ID .. " then press Connect")
console:log(" ")

function computeChecksum()
	local checksum = 0
	for i, v in ipairs({emu:checksum(C.CHECKSUM.CRC32):byte(1, 4)}) do
		checksum = checksum * 256 + v
	end
	return checksum
end

local chksum = computeChecksum()
if (chksum ~= 1576469289 and chksum ~= 521931003) then
  console:error("Warning: Make sure the loaded ROM is Pokemon Emerald English. Loaded ROM checksum: " .. tostring(chksum) .. ". Expected ROM checksum: 521931003")
end

--https://mgba.io/docs/dev/scripting.html

local sock = socket.tcp()
local connected = false

function onSocketError()
  connected = false
  if (VERBOSE >= 2) then
    console:log("Info: onSocketError");
  end
end

function onSocketReceived()
  if (connected == false) then
    return
  end

  local message, error = sock:receive(1024)
  if (error ~= nil) then
    connected = false
    if (VERBOSE >= 2) then
      console:log("Info: sock:receive returned an error");
    end
  end
end

if (automaticUpdate) then
  sock:add("received", onSocketReceived)
  sock:add("error", onSocketError)
end

local msgId = 1
function sendMsg_internal(str)
  if (connected == false) then
    local res = sock:connect(HOST_URL, PORT)

    if (VERBOSE >= 2) then
      console:log("Info: refreshing TCP connection to " .. HOST_URL .. ":" .. tostring(PORT) .. " (return code " .. tostring(res) .. ")");
    end

    if (res == 1) then
      connected = true
    else
      console:log("Error: sock.connect failed (return code " .. tostring(res) .. ")");
      return
    end
  end

  str = string.format("%08X", msgId) .. SEP .. str
  str = string.format("%02X", SCRIPT_VERSION) .. SEP .. str

  -- curl -X POST http://pokemoncompletion/BattleFacilities/Emerald/Assistant/mGBA/0 -d data=
  local data = "data=" .. str
  local cmd = "POST /BattleFacilities/Emerald/Assistant/mGBA/" .. SESSION_ID .. " HTTP/1.1\r\nHost: " .. HOST_URL .. ":" .. tostring(PORT) .. "\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: " .. tostring(string.len(data)) .. "\r\n\r\n" .. data .. "\r\n"

  if (VERBOSE >= 1) then
    console:log("Msg #" .. tostring(msgId))
    if (VERBOSE >= 3) then
      console:log(cmd)
    else
      console:log(data)
    end
    console:log("")
  end

  msgId = msgId + 1

  sock:send(cmd)
end

function sendMsg(str)
  local co = coroutine.create(function ()
    sendMsg_internal(str)
  end)

  coroutine.resume(co)
end


function mod(a, b)
    return a - (math.floor(a/b)*b)
end

local frameCount = 0
local lastDataSent = ''
local dataPlannedToBeSent = ''
local dataPlannedToBeSentFrame = 0
local dataPlannedToBeSentTime = 0

function generateDataToSend()
  local d = emu:read8(gEnemyParty + 19)
  if ((d & 2) == 0) then
    if (VERBOSE >= 1) then
      console:log('No active battle.')
    end
    return -- no active pokemon
  end

  local str = ""

  for i = 0,PARTY_MON_COUNT - 1 do
    for j = 0,PARTY_MON_LEN - 1 do
      str = str .. string.format("%02X", emu:read8(gEnemyParty + (PARTY_MON_LEN * i) + j))
    end
    str = str .. SEP
  end

  for i = 0,PARTY_MON_COUNT - 1 do
    for j = 0,PARTY_MON_LEN - 1 do
      str = str .. string.format("%02X", emu:read8(gPlayerParty + (PARTY_MON_LEN * i) + j))
    end
    str = str .. SEP
  end

  for i = 0,BATTLE_MON_COUNT - 1 do
    for j = 0,BATTLE_MON_LEN - 1 do
      str = str .. string.format("%02X", emu:read8(gBattleMons + (BATTLE_MON_LEN * i) + j))
    end
    str = str .. SEP
  end

  str = str .. string.format("%04X", emu:read16(gTrainerId))
  str = str .. SEP .. string.format("%02X", emu:read8(gActiveBattler))
  str = str .. SEP .. string.format("%02X", emu:read8(gBattlersCount))
  str = str .. SEP .. string.format("%02X", emu:read8(gBattleWeather))

  str = str .. SEP .. string.format("%02X", getFacility())
  str = str .. SEP .. string.format("%02X", getLvlMode())
  str = str .. SEP .. string.format("%02X", getBattleMode())
  str = str .. SEP .. string.format("%04X", getCurrentWinStreak())
  str = str .. SEP .. getTrainerIds()
  str = str .. SEP .. string.format("%02X", lastPalaceOldManMsgId)
  str = str .. SEP .. string.format("%04X", getFactoryPastRentalCount())
  if (addedCallbackForBattleFactory) then
    str = str .. SEP .. lastFactoryPlayerRental
  else
    str = str .. SEP .. getFactoryPlayerRental()
  end
  str = str .. SEP .. lastRngFrameInfo

  return str
end

function getTrainerIds()
  -- u16[20] gSaveBlock2Ptr_val->frontier.trainerIds
  local gSaveBlock2Ptr_val = emu:read32(gSaveBlock2Ptr) -- 0x03005d90
  local str = ""
  for i = 0,20 - 1 do
    local tid = emu:read16(gSaveBlock2Ptr_val + 0xCB4 + i * 2)
    str = str .. string.format("%04X", tid)
  end
  return str
end

function getLvlMode()
  -- gSaveBlock2Ptr_val->frontier.lvlMode
  local gSaveBlock2Ptr_val = emu:read32(gSaveBlock2Ptr) -- 0x03005d90
  local lvlMode = emu:read8(gSaveBlock2Ptr_val + 0xCA9)
  return math.fmod(lvlMode, 2)
end

function getCurrentWinStreak()
  -- gSaveBlock2Ptr->frontier.towerWinStreaks[battleMode][lvlMode]
  --  /*0xCE0*/ u16 towerWinStreaks[battleMode 4][FRONTIER_LVL_MODE_COUNT 2];
  --u16 array1[4][2] = {{0, 1}, {2, 3}, {4, 5}, {6, 7}};

  local gSaveBlock2Ptr_val = emu:read32(gSaveBlock2Ptr) -- 0x03005d90

  local varOffsetByFacility = 0

  local facility = getFacility();

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

  return emu:read16(gSaveBlock2Ptr_val + varOffsetByFacility + 2 * (2 * getBattleMode() + getLvlMode()))
end

local layer = canvas:newLayer(1, 1)
layer.image:setPixel(0,0, 0x22000000)
layer:update()

function getBattleMode()
 -- u16 gSaveBlock1Ptr->vars[0x40CE - VARS_START];
  local gSaveBlock1Ptr_val = emu:read32(gSaveBlock1Ptr) -- 0x03005d8c
  return emu:read16(gSaveBlock1Ptr_val + 0x139C + 2 * (0x40CE - 0x4000))
end

function getFacility()
  -- u16 gSaveBlock1Ptr->vars[0x40CF - VARS_START];
  local gSaveBlock1Ptr_val = emu:read32(gSaveBlock1Ptr) -- 0x03005d8c
  return emu:read16(gSaveBlock1Ptr_val + 0x139C + 2 * (0x40CF - 0x4000))
end

function getFactoryPastRentalCount()
  -- gSaveBlock2Ptr->frontier.factoryRentsCount[battleMode][lvlMode]
  local gSaveBlock2Ptr_val = emu:read32(gSaveBlock2Ptr) -- 0x03005d90
  return emu:read16(gSaveBlock2Ptr_val + 0xDF6 + 2 * (2 * getBattleMode() + getLvlMode()))
end

function getFactoryPlayerRental()
  -- gSaveBlock2Ptr_val->frontier.rentalMons. RentalMon is 12 bytes. first 2 bytes is monId
  local gSaveBlock2Ptr_val = emu:read32(gSaveBlock2Ptr) -- 0x03005d90
  local str = ""
  for i = 0,6 - 1 do
    local monId = emu:read16(gSaveBlock2Ptr_val + 0xE70 + i * 12)
    str = str .. string.format("%04X", monId)
  end
  return str
end


function onFrame()
  if (active == false) then
    return
  end

  frameCount = frameCount + 1

  if(mod(frameCount, 10) == 0) then
    if (supportBattlePalace == true and addedCallbackForBattlePalace == false and getFacility() == 2) then
      addedCallbackForBattlePalace = true
      --in GetPalaceCommentId, after Random() % 3
      emu:setBreakpoint(function()
        lastPalaceOldManMsgId = tonumber(emu:readRegister("r0"));
      end, 0x8195BE8)
    end

    if (supportBattle1OfBattleFactory == true and addedCallbackForBattleFactory == false and getFacility() == 4) then
      addedCallbackForBattleFactory = true
      -- GenerateOpponentMons
      emu:setBreakpoint(function()
        lastFactoryPlayerRental = getFactoryPlayerRental()
      end, 0x081a61b0)
    end
  end



  if(mod(frameCount, 150) ~= 0) then
    return
  end

  -- console:log('...')

  local str = generateDataToSend();

  if (lastDataSent == str) then
    -- console:log('lastDataSent == str') -- .. ",'" .. lastDataSent .. "' == '" .. str .. "'")
    return
  end

  -- console:log('lastDataSent ~= str')

  -- at this point, we want to send <str>, but only if the state doesn't change in the next 150 frames and 1 sec
  if (dataPlannedToBeSent == str and
      frameCount >= dataPlannedToBeSentFrame and
      os.clock() >= dataPlannedToBeSentTime) then
    -- the state didn't change in the last 150 frames. we send it
    dataPlannedToBeSent = ""
    dataPlannedToBeSentFrame = 0
    dataPlannedToBeSentTime = 0
    lastDataSent = str
    sendMsg(str)
  else
    dataPlannedToBeSent = str
    dataPlannedToBeSentFrame = frameCount + 150
    dataPlannedToBeSentTime = os.clock() + 1
  end
end

-- global variable
update = function()
  sendMsg(generateDataToSend())
end

u = function()
  update()
end

if (automaticUpdate) then
  callbacks:add('frame', onFrame)
end
