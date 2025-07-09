--[[
v1
Author: RainingChain

Goal: Print the number of v-blank passed in the elevator based on the win streak in Battle Tower.

- Edit nextWinStreak to initial value that matches saved data
- Savestate on the menu (before selecting Continue)
- Press Enter to increment winStreak
- Load the game and press A
- The 2nd PlaySE after MoveElevator is the variable time spent in elevator
  MoveElevator                : 4761    (+99)
  PlaySE                      : 4761    (+0)
  PlaySE                      : 4958    (+197) <===
- Repeat (reload save state, Enter, press A)

Results:
  export const ELEVATOR_FRAME_BY_STREAK = [53,80,107,128,155,176,176,191,197,197];

  streak=0, newWin=1    (+53)
  streak=1, newWin=8    (+80)
  streak=2, newWin=15  (+107)
  streak=3, newWin=22  (+128)
  streak=4, newWin=29  (+155)
  streak=5, newWin=36  (+176)
  streak=6, newWin=43  (+176)
  streak=7, newWin=50  (+191)
  streak=8, newWin=57  (+191)
  streak=9, newWin=64  (+197)
  streak=10, newWin=71 (+197)
  streak++             (+197)

  streak=0, newWinStreak=6 (+53)
  streak=1, newWinStreak=13 (+80)
  streak=2, newWinStreak=20 (+107)
  streak=3, newWinStreak=27 (+128)
  streak=4, newWinStreak=34(+155)
  streak=5, newWinStreak=41 (+176)
  streak=6, newWinStreak=48 (+176)
  streak=7, newWinStreak=55(+191)
  streak=8, newWinStreak=62(+191)
  streak=9, newWinStreak=69 (+197)
  streak=10, newWinStreak=76 (+197)
  streak=+   (+197)

]]--

local nextWinStreak = 69

function getRngCount()
  return emu:read32(0x020249c0)
end

local gSaveBlock2Ptr = 0x03005d90
local gSaveBlock1Ptr = 0x03005d8c

function getLvlMode()
  -- gSaveBlock2Ptr_val->frontier.lvlMode
  local gSaveBlock2Ptr_val = emu:read32(gSaveBlock2Ptr) -- 0x03005d90
  local lvlMode = emu:read8(gSaveBlock2Ptr_val + 0xCA9)
  return math.fmod(lvlMode, 2)
end

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

function setCurrentWinStreak(val)
  -- gSaveBlock2Ptr->frontier.towerWinStreaks[battleMode][lvlMode]
  --  /*0xCE0*/ u16 towerWinStreaks[battleMode 4][FRONTIER_LVL_MODE_COUNT 2];
  --u16 array1[4][2] = {{0, 1}, {2, 3}, {4, 5}, {6, 7}};

  local gSaveBlock2Ptr_val = emu:read32(gSaveBlock2Ptr) -- 0x03005d90

  local varOffsetByFacility = 0

  local facility = getFacility();

  if (facility == 0) then
    varOffsetByFacility = 0xCE0 -- towerWinStreaks
  elseif (facility == 0) then
    varOffsetByFacility = 0xD0C -- domeWinStreaks
  elseif (facility == 0) then
    varOffsetByFacility = 0xDC8 -- palaceWinStreaks
  elseif (facility == 0) then
    varOffsetByFacility = 0xDDA -- arenaWinStreaks
  elseif (facility == 0) then
    varOffsetByFacility = 0xDE2 -- factoryWinStreaks
  elseif (facility == 0) then
    varOffsetByFacility = 0xE04 -- pikeWinStreaks
  elseif (facility == 0) then
    varOffsetByFacility = 0xE1A -- pyramidWinStreaks
  end

  return emu:write16(gSaveBlock2Ptr_val + varOffsetByFacility + 2 * (2 * getBattleMode() + getLvlMode()), val)
end

local lastRngCount = 0
function logOnExec(what, addr)
  emu:setBreakpoint(function()
    local diff = getRngCount() - lastRngCount
    lastRngCount = getRngCount()
    local str = "" .. getRngCount()
    if (getRngCount() < 1000) then
      str = " " .. str
    end
    console:log(what .. " : " .. str .. "    (+" .. diff .. ")")
  end, addr)
end

logOnExec("MoveElevator               ", 0x08139a78)
logOnExec("PlaySE                     ", 0x080a37a4)


local frameCount = 0
local ignoreWinIncrUntil = 0

callbacks:add('frame', function()
  frameCount = frameCount + 1

  if (input:isKeyActive(C.KEY.ENTER) and frameCount >= ignoreWinIncrUntil) then
    ignoreWinIncrUntil = frameCount + 600 --ignore input for 600 frames

    console:log("streak=" .. math.floor(nextWinStreak / 7) .. ", newWinStreak=" .. nextWinStreak)
    setCurrentWinStreak(nextWinStreak)
    nextWinStreak = nextWinStreak + 7
  end

end)