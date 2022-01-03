# 8-bit computer Simulator and Assembler

This project is inspired by Ben Eater 8-bit computer series. I simulated the circuit with the free software Logisim, using almost only discrete logic and memory.
To run code on the machine you need to write machine code (binary/hexadecimal) in ROM, that will be copied in RAM at startup. To simplify the process I created a simple assembler ([here](https://francesco-scar.github.io/8-bit_pc/Compiler/Web/Compiler.html) you can find the assembly web page) to convert code written with mnemonics codes to machine code. In the same page you can debug your code simulating the internal status of the computer step-by-step (memory and registers).

## Table of contents
- [General description](#general-description)
- [Components](#components)
  - [Clock](#clock)
  - [Register A](#register-a)
  - [Register B](#register-b)
  - [Arithmetic Logic Unit - ALU](#arithmetic-logic-unit---alu)
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

## General description
![Computer Logisim Simulation](Images/image_color.png?raw=true)

The computer is a simple 8-bit bus calculator, it can store a program in ROM that will be copied into RAM at startup. Then the code will be executed and the result will be shown on the display.
At the moment the computer doesn't have any input (in a normal use case, without manipulating internal state and signals), so it can only execute numerical operations and show the results.

## Components

### Clock
![Computer Main Clock](Images/Clock_main.png?raw=true)

The main clock is generated from this Logisim clock block. The signal enter in a 3-input AND gate (the other two inputs are inverted), so the signal propagates only if the other two lines are both LOW. The upper line is manually controlled and enable the user to stop the clock (not very useful), whereas the bottom line is controlled by the [Control Unit](#control-unit---cu), so the program can HALT the machine (this line goes HIGH when the HALT command gets processed).

![Display Clock](Images/Clock_display.png?raw=true)

The display decoder has a separate clock, that the computer can't stop. In the real computer the two clocks would be completely independent from each other, but in Logisim this clock is actually in sync with the main clock. The display decoder design is explained in the [display](#output---display-decoder) section.

### Register A
![Register A](Images/Register_A.png?raw=true)

The computer has two registers (A and B). Register A is the main register of the computer: it is directly connected with the [ALU](#arithmetic-logic-unit---alu), and to the main bus with controlled buffers (activated by the CU during normal use).

The register can output its value to the main bus, so the data can be used by other units, for example:
- Display buffer
- RAM
- Register B
- (Register A itself)

The input of the register is directly connected to the main bus, so it can load the value on the bus on the clock rising edge if and only if the LOAD signal is HIGH, so data from the other register, RAM or ALU can be stored in this register.

### Register B
![Register B](Images/Register_B.png?raw=true)

Register B is a register of the computer: it's similar to the A register, but it's directly connected with the [ALU](#arithmetic-logic-unit---alu) and can't output its value to the main bus, so the data can't be used by other units except for the [ALU](#arithmetic-logic-unit---alu).

The input of the register is directly connected to the main bus, so it can load the value on the bus on the clock rising edge if and only if the LOAD signal is HIGH, so data from the other register, RAM or ALU can be stored in this register.

This register is essential to perform arithmetic operations, because to add or subtract two numbers its needed to load one number in register A and the other number in register B.

### Arithmetic Logic Unit - ALU
### Random Access Memory - RAM
### Boot Loader
### Flags
#### Zero Flag
#### Carry Flag
### Control Unit - CU
### Output - Display Decoder
### Components statistics
## Machine code instructions
### Instructions format and arguments
### Instructions list
## Assembler
### Graphical User Interface - GUI
### Mnemonics
## Simulator
