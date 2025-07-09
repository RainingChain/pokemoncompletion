-- GenerateInitialRentalMons
emu:setBreakpoint(function()
  console:log("RNG frame at start of GenerateInitialRentalMons(): " .. emu:read32(0x020249c0))
end, 0x081a67ec)

-- GenerateOpponentMons
emu:setBreakpoint(function()
  console:log("RNG frame at start of GenerateOpponentMons(): " .. emu:read32(0x020249c0))
end, 0x081a61b0)
