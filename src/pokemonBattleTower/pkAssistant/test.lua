

local gSaveBlock2Ptr = 0x03005d90

function onFrame()
  local gSaveBlock2Ptr_val = emu:read32(gSaveBlock2Ptr) -- 0x020243cc
  local lvlMode = emu:read8(gSaveBlock2Ptr_val + 0xCA9) -- gSaveBlock2Ptr_val->frontier.lvlMode
  lvlMode = math.fmod(lvlMode, 2)

  if (1) then
    local battleMode = 0
    --  /*0xCE0*/ u16 towerWinStreaks[battleMode 4][FRONTIER_LVL_MODE_COUNT 2];
    --u16 array1[4][2] = {{0, 1}, {2, 3}, {4, 5}, {6, 7}};
    local winStreak = emu:read16(gSaveBlock2Ptr_val + 0xCE0 + 2 * (2 * battleMode + lvlMode)) -- gSaveBlock2Ptr->frontier.towerWinStreaks[battleMode][lvlMode]


    console:log(""..lvlMode .. " - " .. winStreak)
  end
end

callbacks:add('frame', onFrame)