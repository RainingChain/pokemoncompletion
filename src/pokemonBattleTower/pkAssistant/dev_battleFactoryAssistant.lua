-- calibration
-- -3699
-- -292

local str = ""

for i = 0,3 - 1 do
  for j = 0,100 - 1 do
    str = str .. string.format("%02X", emu:read8(0x02024744 + (100 * i) + j))
  end
  str = str .. "SEP!"
end

for i = 0,3 - 1 do
  for j = 0,100 - 1 do
    str = str .. string.format("%02X", emu:read8(0x020244ec + (100 * i) + j))
  end
  str = str .. "SEP!"
end

for i = 0,2 - 1 do
  for j = 0,88 - 1 do
    str = str .. string.format("%02X", emu:read8(0x2024084 + (88 * i) + j))
  end
  str = str .. "SEP!"
end

--getTrainerIds
local getTrainerIds = ""
for i = 0,20 - 1 do
  local tid = emu:read16(emu:read32(0x03005d90) + 0xCB4 + i * 2)
  getTrainerIds = getTrainerIds .. string.format("%04X", tid)
end
--getTrainerIds

--getFactoryPlayerRental
local getFactoryPlayerRental = ""
for i = 0,6 - 1 do
  local monId = emu:read16(emu:read32(0x03005d90) + 0xE70 + i * 12)
  getFactoryPlayerRental = getFactoryPlayerRental .. string.format("%04X", monId)
end
--getFactoryPlayerRental

str = str .. string.format("%04X", emu:read16(0x2038bca))
str = str .. "SEP!" .. string.format("%02X", emu:read8(0x2024064))
str = str .. "SEP!" .. string.format("%02X", emu:read8(0x0202406c))
str = str .. "SEP!" .. string.format("%02X", emu:read8(0x020243cc))
str = str .. "SEP!" .. string.format("%02X", 4)
str = str .. "SEP!" .. string.format("%02X", 0)
str = str .. "SEP!" .. string.format("%02X", 0)
str = str .. "SEP!" .. string.format("%04X", emu:read16(emu:read32(0x03005d90) + 0xDE2))
str = str .. "SEP!" .. getTrainerIds
str = str .. "SEP!" .. string.format("%02X", 255)
str = str .. "SEP!" .. string.format("%04X", 0)
str = str .. "SEP!" .. getFactoryPlayerRental
str = str .. "SEP!" .. ""

local sock = socket.tcp()
local res = sock:connect("localhost", 3000)

if (res ~= 1) then
  console:log("Error: sock.connect failed (return code " .. tostring(res) .. ")");
  return
end

str = string.format("%08X", 1) .. "SEP!" .. str
str = string.format("%02X", 6) .. "SEP!" .. str

local data = "data=" .. str
local cmd = "POST /BattleFacilities/Emerald/Assistant/mGBA/0 HTTP/1.1\r\nHost: localhost:3000\r\nContent-Type: application/x-www-form-urlencoded\r\nContent-Length: " .. tostring(string.len(data)) .. "\r\n\r\n" .. data .. "\r\n"

sock:send(cmd)
sock = nil
