-- SetHintedRoom
emu:setBreakpoint(function()
  console:log("RNG frame when entering the room with the hint lady (To use for 1st Room RNG manip): " .. emu:read32(0x020249c0))
end, 0x081a80dc)

-- GetNextRoomType
emu:setBreakpoint(function()
  console:log("RNG frame when entering the room with the random event (To use for 2nd+ Room RNG manip): " .. emu:read32(0x020249c0))
end, 0x081a79ec)

-- FillTrainerParty
-- emu:setBreakpoint(function()
--   console:log("RNG advance count at start of FillTrainerParty(): " .. emu:read32(0x020249c0))
-- end, 0x081630c4)

-- GetRandomScaledFrontierTrainerId
-- emu:setBreakpoint(function()
--   console:log("RNG advance count at start of GetRandomScaledFrontierTrainerId(): " .. emu:read32(0x020249c0))
-- end, 0x08162548)

