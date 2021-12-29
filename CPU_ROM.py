AI  = 0b1000000000000000				# LOAD BUS IN A REGISTER
AO  = 0b0100000000000000				# OUTPUT A REGISETER TO BUS
BI  = 0b0010000000000000				# LOAD BUS IN B REGISTER
MI  = 0b0001000000000000				# LOAD BUS IN RAM ADDRESS REGISTER
OUT = 0b0000100000000000				# LOAD BUS IN DISPLAY DECODER REGISTER
ALU = 0b0000010000000000				# OUTPUT SUM/DIFF RESULT TO BUS
DIF = 0b0000001000000000				# ALU MAKES A-B (DIFFERENCE BETWEEN A AND B)
RE  = 0b0000000100000000				# ENABLE RAM

RO  = 0b0000000010000000				# OUTPUT RAM CONTENT TO APPROPRIATE REGISTERS
II  = 0b0000000001000000				# INSTRUCTION REGISTER INPUT
IO  = 0b0000000000100000				# INSTRUCTION REGISTER OUTPUT (ONLY LOW BYTE)
CE  = 0b0000000000010000				# COUNT ENABLE - INCREMENT PROGRAM COUNTER ON NEXT CLOCK
CI  = 0b0000000000001000				# LOAD BUS TO PROGRAM COUNTER (JUMP)
CO  = 0b0000000000000100				# OUTPUT PROGRAM COUNTER STATE TO BUS
FI  = 0b0000000000000010				# LOAD FLAGS INTO FLAG REGISTER
HLT = 0b0000000000000001				# STOP CLOCK SIGNALS (AUTOKILL)


high_ROM = open("CPU_ROM_high", "w")
low_ROM = open("CPU_ROM_low", "w")

result_high = "v2.0 raw\n"
result_low = "v2.0 raw\n"


address = 0

nop = [MI|CO,	RE|RO|II|CE,	0,				0,				0,			0,	0,	0 ]

FORMAT = [
		[MI|CO,	RE|RO|II|CE,	0,				0,				0,			0,	0,	0 ],		# NOP  - Do nothing
		[MI|CO,	RE|RO|II|CE,	IO|AI,			0,				0,			0,	0,	0 ],		# LDIA - Load immediate to A
		[MI|CO,	RE|RO|II|CE,	IO|BI,			0,				0,			0,	0,	0 ],		# LDIB - Load immediate to B
		[MI|CO,	RE|RO|II|CE,	ALU|AI|FI,		0,				0,			0,	0,	0 ],		# SUM  - Store A+B in A
		[MI|CO,	RE|RO|II|CE,	DIF|ALU|AI|FI,	0,				0,			0,	0,	0 ],		# SUB  - Store A-B in B
		[MI|CO,	RE|RO|II|CE,	IO|BI,			ALU|AI|FI,		0,			0,	0,	0 ],		# SUMI - Add parameter to A
		[MI|CO,	RE|RO|II|CE,	IO|BI,			DIF|ALU|AI|FI,	0,			0,	0,	0 ],		# SUBI - Subrtact parameter to A
		[MI|CO,	RE|RO|II|CE,	IO|MI,			AO|RE,			0,			0,	0,	0 ],		# LDR  - Load A into RAM address
		[MI|CO,	RE|RO|II|CE,	IO|MI,			RE|RO|AI,		0,			0,	0,	0 ],		# LDA  - Load value in RAM address into A
		[MI|CO,	RE|RO|II|CE,	IO|MI,			RE|RO|BI,		0,			0,	0,	0 ],		# LDB  - Load value in RAM address into B
		[MI|CO,	RE|RO|II|CE,	IO|MI,			OUT|RE|RO,		0,			0,	0,	0 ],		# OUTR - Output value in RAM address
		[MI|CO,	RE|RO|II|CE,	IO|CI,			0,				0,			0,	0,	0 ],		# JMP  - Jump to specific memory address
		[MI|CO,	RE|RO|II|CE,	0,				0,				0,			0,	0,	0 ],		# JCF  - Jump if carry flag is set
		[MI|CO,	RE|RO|II|CE,	0,				0,				0,			0,	0,	0 ],		# JZF  - Jump if zero flag is set
		[MI|CO,	RE|RO|II|CE,	0,				0,				0,			0,	0,	0 ],		# JZC  - Junp if both (z, c) flag are set
		[MI|CO,	RE|RO|II|CE,	AO|OUT,			0,				0,			0,	0,	0 ],		# OUT  - Output A value
		[MI|CO,	RE|RO|II|CE,	HLT,			0,				0,			0,	0,	0 ]]		# HALT - Halt Clock signal



mnemonic = ["NOP", "LDIA", "LDIB", "SUM", "SUB", "SUMI", "SUBI", "LDR", "LDA", "LDB", "OUTR", "JMP", "JCF", "JZF", "JZC", "OUT", "HALT"]

instructions = []


F0 = [x[:] for x in FORMAT]
F1 = [x[:] for x in FORMAT]
F2 = [x[:] for x in FORMAT]
F3 = [x[:] for x in FORMAT]

instructions += [F0]
instructions += [F1]
instructions += [F2]
instructions += [F3]


instructions[0b01][12][2] = IO|CI					# JCF
instructions[0b11][12][2] = IO|CI					# JCF

instructions[0b10][13][2] = IO|CI					# JZF
instructions[0b11][13][2] = IO|CI					# JZF

instructions[0b11][14][2] = IO|CI					# JZC


# Address:  xx			xxxxxx				xxx
#			zc flags	instr code			step

#print(instructions[0][1][2])

while address < 2**11:					# 11
	flag = (address & 0b11000000000) >> 9
	code = (address & 0b00111111000) >> 3
	step = (address & 0b00000000111)

	try:
		result_high += hex(instructions[flag][code][step] >> 8)[2:] + " "
		result_low += hex(instructions[flag][code][step] & 0b0000000011111111)[2:] + " "
	except IndexError:
#		print(address, flag, code, step)
		result_high += hex(nop[step] >> 8)[2:] + " "
		result_low += hex(nop[step] & 0b0000000011111111)[2:] + " "

	address += 1

for i in range(0, len(mnemonic)):
	print(mnemonic[i], " \t--> \t", "{:6b}".format(i).replace(" ", "0"), " \t ", hex(i)[2:])

high_ROM.write(result_high)
low_ROM.write(result_low)

high_ROM.close()
low_ROM.close()



'''
LDA 0
SUMI 12
JCF 5
OUT
JMP 1
LDIA 252
SUBI 6
OUT
JZF 1
JMP 6
'''

'''
Fibonacci

LDIA 1
LDR 50
LDR 51
LDA 50
LDB 51
SUM
OUT
LDR 52
LDA 50
LDR 51
LDA 52
LDR 50
JMP 3
'''
