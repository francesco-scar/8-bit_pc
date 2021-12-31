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
### Register B
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
