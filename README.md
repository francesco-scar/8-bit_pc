# 8-bit computer Simulator and Assembler

This project is inspired by Ben Eater 8-bit computer series. I simulated the circuit with the free software Logisim, using almost only discrete logic and memory.
To run code on the machine you need to write machine code (binary/hexadecimal) in ROM, that will be copied in RAM at startup. To simplify the process I created a simple assembler ([here](https://francesco-scar.github.io/8-bit_pc/Compiler/Web/Compiler.html) you can find the assembly web page) to convert code written with mnemonics codes to machine code. In the same page you can debug your code simulating the internal status of the computer step-by-step (memory and registers).

# Table of contents
- [General description](#general-description)
- [Components](#components)
  - [Clock](#clock)
  - [Register A](#register-a)
  - [Register B](#register-b)
  - [Arithmetic Logic Unit - ALU](#arithmetic-logic-unit---alu)
  - [Program Counter](#program-counter)
  - [Random Access Memory - RAM](#random-access-memory---ram)
  - [Boot Loader](#boot-loader)
  - [Flags](#flags)
    - [Zero Flag](#zero-flag)
    - [Carry Flag](#carry-flag)
  - [Control Unit - CU](#control-unit---cu)
  - [Output - Display Decoder](#output---display-decoder)
  - [Components statistics](#components-statistics)
- [Machine code instructions](#machine-code-instructions)
  - [Instructions format and arguments](#instructions-format-and-arguments)
  - [Instructions list](#instructions-list)
- [Assembler](#assembler)
  - [Graphical User Interface - GUI](#graphical-user-interface---gui)
  - [Mnemonics](#mnemonics)
- [Simulator](#simulator)

# General description
![Computer Logisim Simulation](Images/image_color.png?raw=true)

The computer is a simple 8-bit bus calculator, it can store a program in ROM that will be copied into RAM at startup. Then the code will be executed and the result will be shown on the display.
At the moment the computer doesn't have any input (in a normal use case, without manipulating internal state and signals), so it can only execute numerical operations and show the results.

# Components

## Clock
![Computer Main Clock](Images/Clock_main.png?raw=true)

The main clock is generated from this Logisim clock block. The signal enter in a 3-input AND gate (the other two inputs are inverted), so the signal propagates only if the other two lines are both LOW. The upper line is manually controlled and enable the user to stop the clock (not very useful), whereas the bottom line is controlled by the [Control Unit](#control-unit---cu), so the program can HALT the machine (this line goes HIGH when the HALT command gets processed).

![Display Clock](Images/Clock_display.png?raw=true)

The display decoder has a separate clock, that the computer can't stop. In the real computer the two clocks would be completely independent from each other, but in Logisim this clock is actually in sync with the main clock. The display decoder design is explained in the [display](#output---display-decoder) section.

## Register A
![Register A](Images/Register_A.png?raw=true)

The computer has two registers (A and B). Register A is the main register of the computer: it is directly connected with the [ALU](#arithmetic-logic-unit---alu), and to the main bus with controlled buffers (activated by the CU during normal use).

The register can output its value to the main bus, so the data can be used by other units, for example:
- Display buffer
- RAM
- Register B
- (Register A itself)

The input of the register is directly connected to the main bus, so it can load the value on the bus on the clock rising edge if and only if the LOAD signal is HIGH, so data from the other register, RAM or ALU can be stored in this register.

## Register B
![Register B](Images/Register_B.png?raw=true)

Register B is a register of the computer: it's similar to the A register, but it's directly connected with the [ALU](#arithmetic-logic-unit---alu) and can't output its value to the main bus, so the data can't be used by other units except for the [ALU](#arithmetic-logic-unit---alu).

The input of the register is directly connected to the main bus, so it can load the value on the bus on the clock rising edge if and only if the LOAD signal is HIGH, so data from the other register, RAM or ALU can be stored in this register.

This register is essential to perform arithmetic operations, because to add or subtract two numbers its needed to load one number in register A and the other number in register B.

## Arithmetic Logic Unit - ALU
The ALU is the unit that performs arithmetic operations: in particular this unit can sum or subtract two 8 bit numbers.

![Single Adder Unit](Images/ALU_unit.png?raw=true)

The unit is composed of 8 adders that are able to sum three 1-bit numbers and output a 1-bit result and a 1-bit carry.

![Single Adder Unit](Images/ALU_general.png?raw=true)

The units are connected in cascade, so the _i-th_ unit sums the _i-th_ bit of A register, the _i-th_ bit of B register and the carry of the previous unit. The carry input of first unit is connected to the DIFF signal to subtract B from A, as explained below.

To perform the subtraction A-B is sufficient to add A+(-B), where A and B are represented in two's complement.
The two's complement of a binary number can be calculated flipping each bit and then adding one; so if the DIFF signal is HIGH the XOR gates flip each bit (XORs act as controlled NOT gates) and then 1 is added as the "carry input" of the first adder unit (that input is actually connected to the DIFF signal so it's 1 when DIFF is HIGH and 0 when it is LOW). If the DIFF signal is LOW the unit act as a normal adder.

The result of the operation output can be shared on the main bun and therefore it can be stored in registers or used from other units (current [instruction set](#instructions-list) allow to store the result only in A register, but it can be expanded to include other uses).

The carry of the last adder unit and the result of the operation are used by the [flags](#flags) register.

## Program Counter
![Program Counter](Images/Program_counter.png?raw=true)

The program counter is a D-Flip-Flop that stores the current program instruction address.

It gets incremented by 1 during the second step of every instruction, and its value gets shared on the main bus during the first step of any instruction to allow the [RAM](#random-access-memory---ram) address register to store the address of the opcode that will be executed in the next cycles.

The jump and conditional jumps instructions change the value of this counter to the appropriate address to control the execution flow.

## Random Access Memory - RAM
![RAM](Images/RAM.png?raw=true)

The computer execute the code loaded in RAM starting from address 0 (zero). The RAM unit is made of two 256 byte RAM modules, one contain the instructions opcodes (HIGH RAM), and the other one contains the parameters of the instruction (LOW RAM).

During the first step of each instruction the RAM address buffer gets loaded with the current program counter value (using the main bus).

During the second step of each instruction the RAM cell corresponding to the current RAM address buffer value gets loaded into the Instruction Register and the Parameter Register.

![Instruction and Parameter Registers](Images/Instruction_registers.png?raw=true)

The instruction register value is then used by the [Control Unit - CU](#control-unit---cu) to perform the operations corresponding to that opcode, whereas the parameter register value can be shared with other units (if needed) using the main bus.

HIGH RAM content (instructions opcodes) can't be shared on main bus, its output is connected only with the instruction register used by the [Control Unit - CU](#control-unit---cu).

## Boot Loader
![Boot Loader](Images/Bootloader.png?raw=true)

The code need to be loaded in RAM to be executed, but manually load the program every time the computer gets powered on is quite boring. So the executable machine code can be stored in a persistent memory (ROM) and automatically loaded into RAM at startup.

This process is done by the bootloader circuit.

The unit is active until the output of the OR gate is HIGH, so the counter increment its value every cycle of the JK flip-flop, so every 2 cycles of the main clock.
For each counter value the corresponding address is stored into the RAM address buffer and, during the next clock cycle, the value of the ROM gets copied into the RAM. This two phases are regulated by the JK flip-flop, because its output controls the control lines of the [CU](#control-unit---cu).

To be able to manually control the computer internal signals the Manual Control signal is kept HIGH by the OR output.

When a ROM cell with 0xff value gets reached the comparator switches to LOW, so when the flip-flop output gets LOW too (at the end of the current cycle) the enable signal of the counter gets LOW and the Manual Control signal gets LOW as well, therefore the computer will start executing the loaded code from address 0x00 on the next clock cycle.

## Flags
### Zero Flag
### Carry Flag
## Control Unit - CU
## Output - Display Decoder
## Components statistics
# Machine code instructions
## Instructions format and arguments
## Instructions list
# Assembler
## Graphical User Interface - GUI
## Mnemonics
# Simulator
