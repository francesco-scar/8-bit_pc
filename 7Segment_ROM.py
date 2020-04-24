truthTable = [0b11111100, 0b01100000, 0b11011010, 0b11110010, 0b01100110, 0b10110110, 0b10111110, 0b11100000, 0b11111110, 0b11110110, 0b00000000]

address = 0
result = "v2.0 raw\n"
output = open("/home/test_reti/Desktop/Projects/8-bit_pc/7Segment_ROM", "w")

def getDigit(number, digit):
	if digit < len(str(number)):
		return int(str(number)[len(str(number))-1-digit])

	return 10						# Display off

while address < 2**10:
	num = address & 0b11111111
	digit = address >> 8
	
	value = getDigit(num, digit)

	print(address, "\t\tNum: ", num, "\t\tDigit: ", digit, "\t\tValue: ", value)

	result += hex(truthTable[value])[2:] + " "

	address += 1

print(result)
print("\n\n\n")
print(address)

output.write(result)
output.close()
