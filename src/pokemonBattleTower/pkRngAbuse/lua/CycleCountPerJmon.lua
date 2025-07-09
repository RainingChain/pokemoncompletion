--[[
v1
Author: RainingChain

This script prints {"id":0, "modulo":1000, cycle:123123, vblank:10, pid:0},
for every pokemon preset from MIN_MIN to MAX_MON for Battle Tower Single.

The script must be ran just beforce continuing a streak, in the appropriate mode (level 50 or open)

The data collected is used in CYCLE_INFO_PER_JMON.ts
--]]

--Config start
local MIN_MIN = 0
local MAX_MON = 881 -- 849 for lvl50, 881 for open lvl
--Config end

local overwriteMon = MIN_MIN
local stop = false

local vblankDurList = {}
local vblankDurList_len = 0
local cycleAtLastVblankStart = nil
local modulo = 0

local lastSectionWasMonNat = false
local cycleInfoAtLastMonNatStart = nil
local pid = 0

-- VblankIntr start
emu:setBreakpoint(function()
  cycleAtLastVblankStart = emu:currentCycle()
end, 0x08000738)

-- VblankIntr end
emu:setBreakpoint(function()
  if (cycleAtLastVblankStart ~= nil) then
    local dur = emu:currentCycle() - cycleAtLastVblankStart;
    table.insert(vblankDurList, dur)
    vblankDurList_len = vblankDurList_len + 1
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

  local vblankCount = 0
  if (startInfo.vblankCountAtStart < vblankDurList_len) then
    for i = startInfo.vblankCountAtStart + 1, vblankDurList_len do
      cycleWithVblanks = cycleWithVblanks - vblankDurList[i]
      vblankCount = vblankCount + 1
    end
  end

  return {cycleWithVblanks, vblankCount}
end

-- MONDID Random()
emu:setBreakpoint(function()

  if (lastSectionWasMonNat and overwriteMon ~= nil) then
    local cc = getIntervalCycleCount(cycleInfoAtLastMonNatStart)
    local str = "{id:" .. (overwriteMon - 1)
              .. ", modulo:" .. modulo
              .. ", cycle:" .. cc[1]
              .. ", vblank:" .. cc[2]
              .. ", pid:" .. pid .. "},"
    console:log(str)

    --overwrite monIdx to 0 to repeat generating monIdx 0
    emu:writeRegister("r7", 0)

    if (stop) then
      overwriteMon = nil
    end
  end

  cycleInfoAtLastMonNatStart = nil
  lastSectionWasMonNat = false

end, 0x08163296)

-- overwrite mon
emu:setBreakpoint(function()
  if (stop or overwriteMon == nil) then
    return
  end

  emu:writeRegister("r4", overwriteMon)
  overwriteMon = overwriteMon + 1
  if (overwriteMon > MAX_MON) then
    stop = true
  end
end, 0x81632AC)

-- MONDNAT Random32()
emu:setBreakpoint(function()
  cycleInfoAtLastMonNatStart = getCurrentCycleInfo()
  lastSectionWasMonNat = true
  modulo = 0
end, 0x8068664)

-- __umodsi3
emu:setBreakpoint(function()
  if (lastSectionWasMonNat) then
    pid = emu:readRegister("r0")
    local divisor = emu:readRegister("r1")
    if (divisor == 24) then
      modulo = modulo + 1
    end
  end
end, 0x082e7be0)
