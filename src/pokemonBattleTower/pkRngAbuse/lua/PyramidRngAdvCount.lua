-- SeedPyramidFloor
emu:setBreakpoint(function()
  console:log("RNG advance count at start of SeedPyramidFloor(): " .. emu:read32(0x020249c0))
end, 0x081a9254)
