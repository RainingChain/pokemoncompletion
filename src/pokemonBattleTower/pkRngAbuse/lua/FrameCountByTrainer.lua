--[[
v1
Author: RainingChain

Goal: Print the number of frames (v-blank) during trainer start speech.

- Edit overwriteTrainer (if you want to skip trainer id)
- Savestate after a battle, when you can select to conitnue, reset or quit
- Hold autofire A
- Upon printing HealPlayerParty, reload the savestate
-   HealPlayerParty : 7841    (+41)      +41 is frame count

Results:
[33,29,45,43,31,35,35,45,33,35,37,37,39,41,35,41,41,31,39,41,33,37,41,35,37,33,33,37,39,41,33,35,31,43,39,35,47,37,33,37,35,45,39,35,31,39,39,37,37,47,29,37,33,35,37,47,27,39,41,27,33,29,33,33,25,33,37,33,33,37,39,39,29,41,35,27,33,35,47,31,35,35,27,39,33,39,37,29,37,27,35,43,35,31,33,43,31,43,37,39,35,35,33,33,31,23,29,33,23,35,37,39,39,39,33,27,17,25,25,33,23,37,41,41,35,37,39,41,33,39,43,33,35,29,37,27,43,41,33,43,35,39,43,39,37,43,41,37,41,33,35,33,39,39,39,29,37,31,37,39,35,33,35,39,33,35,33,41,19,37,35,33,47,33,49,33,33,39,31,45,33,41,33,41,35,33,33,35,37,31,43,39,47,43,41,27,39,29,33,27,35,41,33,43,37,39,35,35,37,31,45,29,41,27,39,31,21,31,39,41,31,35,33,37,37,31,35,25,37,43,41,33,31,41,29,43,39,41,35,33,33,37,39,37,35,31,31,35,35,35,35,39,41,35,37,45,35,25,37,33,35,29,29,37,31,45,39,37,31,33,41,37,39,35,39,37,41,35,35,27,45,41,37,41,29,41,33,41,37,35,37,39,35,39,39,37,23,41,35]
]]--

local lastRngCount = 0
local overwriteTrainer = 0 -- trainer Dev

function getRngCount()
  return emu:read32(0x020249c0)
end

-- overwrite results of GetRandomScaledFrontierTrainerId() in SetNextFacilityOpponent
emu:setBreakpoint(function()
  emu:writeRegister("r0", overwriteTrainer)
  console:log("overwriteTrainer=" .. overwriteTrainer)
  overwriteTrainer = overwriteTrainer + 1
  lastRngCount = getRngCount()
end, 0x081624c6)


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

logOnExec("GetOpponentIntroSpeech", 0x08163914)
logOnExec("HealPlayerParty", 0x080f9180)
