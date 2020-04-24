var highRam = [];
var lowRam = [];

var totalClock = 0;
var running = false;
var idTimeout = 0;
var correctFactor = 0.8;
var lastLineColor = 0;

/*
var regA = 0;
var regB = 0;
var regPC = 0;
var regIST = 0;
var regSTEP = 0;
var regOUT = 0;*/

var dict = {
  'A': 0,
  'B': 1,
  'PC': 2,
  'IST': 3,
  'STEP': 4,
  'PAR': 5,
  'ADDR': 6,
  'OUT': 7
};

var regStatus = [0, 0, 0, 0, 0, 0, 0, 0];
var carryFlag = false;
var zeroFlag = false;

var istructionRam = 0;

var clockRange = document.getElementById("clockRange");

document.getElementById("clockFreqSpan").innerHTML = (Math.round(clockRange.value / 20 * 100) / 100).toFixed(2);
clockRange.oninput = function() {
  document.getElementById("clockFreqSpan").innerHTML = (Math.round(clockRange.value / 20 * 100) / 100).toFixed(2);
};


for (var address = 0; address < 256; address++) {
  highRam.push(0);
  lowRam.push(0);
}

displayRAMTable();




function displayRAMTable() {
  outH = '<caption style="margin: 5px;"><b>High RAM</b></caption><th class="ramCell">Addr</th><th class="nbsp" rowspan="33" style="border">&nbsp;</th><th>00</th><th>01</th><th>02</th><th>03</th><th class="nbsp" rowspan="33">&nbsp;</th><th>04</th><th>05</th><th>06</th><th>07</th>';
  outL = '<caption style="margin: 5px;"><b>Low RAM</b></caption><th class="ramCell">Addr</th><th class="nbsp" rowspan="33" style="border">&nbsp;</th><th>00</th><th>01</th><th>02</th><th>03</th><th class="nbsp" rowspan="33">&nbsp;</th><th>04</th><th>05</th><th>06</th><th>07</th>';
  for (var address = 0; address < 256; address++) {
    if (address % 8 == 0) {
      outH += '<tr><th class="ramCell">' + pad(address.toString(16), 2) + '</th>';
      outL += '<tr><th class="ramCell">' + pad(address.toString(16), 2) + '</th>';
    }
    outH += '<td class="ramCell"><span id="ramH_' + address + '">' + pad(highRam[address].toString(16), 2) + '</span></td>';
    outL += '<td class="ramCell"><span id="ramL_' + address + '">' + pad(lowRam[address].toString(16), 2) + '</span></td>';
  }
  document.getElementById("highRamTable").innerHTML = outH;
  document.getElementById("lowRamTable").innerHTML = outL;
}


function loadToRam(high, low) {
  high = high.split(" ");
  low = low.split(" ");
  for (var i = 0; i < 256; i++) {
    if (i < high.length - 1) {
      highRam[i] = parseInt(high[i], 16);
      lowRam[i] = parseInt(low[i], 16);
    } else {
      highRam[i] = 0;
      lowRam[i] = 0;
    }
  }
  displayRAMTable();
}


function startStop() {
  if (running) {
    document.getElementById("startStop").className = "";
    document.getElementById("startStop").innerText = "START";
    document.getElementById("tickClock").disabled = false;
    running = false;
    if (idTimeout) {
      clearTimeout(idTimeout);
      idTimeout = 0;
    }
  } else {
    document.getElementById("startStop").className = "stopButton";
    document.getElementById("startStop").innerText = "STOP";
    document.getElementById("tickClock").disabled = true;
    running = true;
    exec();
  }
}


function ramVal(address, high = true, value = -1) {
  if (value != -1) {
    setTimeout(function() {
      if (high) {
        document.getElementById("ramH_" + address).innerHTML = pad(value.toString(16), 2);
      } else {
        document.getElementById("ramL_" + address).innerHTML = pad(value.toString(16), 2);
      }
    }, 500 / (clockRange.value / 20));

    if (high) {
      highRam[address] = value;
    } else {
      lowRam[address] = value;
    }
  }

  if (high) {
    document.getElementById("ramH_" + address).style.backgroundColor = "#f00a";
    setTimeout(function() {
      document.getElementById("ramH_" + address).style.backgroundColor = "";
    }, 1000 / (clockRange.value / 20) * correctFactor);
    return highRam[address];
  } else {
    document.getElementById("ramL_" + address).style.backgroundColor = "#f00a";
    setTimeout(function() {
      document.getElementById("ramL_" + address).style.backgroundColor = "";
    }, 1000 / (clockRange.value / 20) * correctFactor);
    return lowRam[address];
  }
}



function regVal(reg, value = -1) {
  document.getElementById("div" + reg).style.backgroundColor = "#f00a";
  setTimeout(function() {
    document.getElementById("div" + reg).style.backgroundColor = "";
  }, 1000 / (clockRange.value / 20) * correctFactor);

  if (value != -1) {
    regStatus[dict[reg]] = value;
    setTimeout(function() {
      if (reg == "STEP") {
        document.getElementById("reg" + reg).innerHTML = pad(value.toString(2), 3) + " (" + value + ")";
      } else {
        document.getElementById("reg" + reg).innerHTML = pad(value.toString(2), 8) + " (" + pad(value, 3) + ")";
      }
    }, 500 / (clockRange.value / 20));
  }
  return regStatus[dict[reg]];
}



function exec(once = false) {
  if (running || once) {
    totalClock++;
    document.getElementById("clockCounter").innerHTML = totalClock;
    if (!once) {
      idTimeout = setTimeout(exec, 1000 / (clockRange.value / 20));
    }

    if (regVal('STEP') == 0) {
      colorLine(regStatus[dict["PC"]]);
      regVal("ADDR", regVal("PC"));
    } else if (regVal('STEP') == 1) {
      regVal("IST", ramVal(regVal("ADDR"), true));
      regVal("PAR", ramVal(regVal("ADDR"), false));
      regVal("PC", regStatus[dict["PC"]] + 1);
    } else if (regVal('STEP') == 2) {
      var tmpIST = regVal('IST');
      if (tmpIST == 1) {
        regVal("A", regVal("PAR")); // LDIA
      } else if (tmpIST == 2) {
        regVal("B", regVal("PAR")); // LDIB
      } else if (tmpIST == 3) {
        var tmpResult = regStatus[dict["A"]] + regVal("B");
        if (tmpResult >= 256) {
          tmpResult %= 256;
          carryFlag = true;
        } else {
          carryFlag = false;
        }
        if (tmpResult == 0) {
          zeroFlag = true;
        } else {
          zeroFlag = false;
        }
        regVal("A", tmpResult); // SUM
        updateFlagGraphic();
      } else if (tmpIST == 4) {
        var tmpResult = regStatus[dict["A"]] - regVal("B");
        if (tmpResult < 0) {
          tmpResult += 256;
          carryFlag = false; // The flags work this way, even if it seems flipped
        } else {
          carryFlag = true;
        }
        if (tmpResult == 0) {
          zeroFlag = true;
        } else {
          zeroFlag = false;
        }
        regVal("A", tmpResult); // SUB
        updateFlagGraphic();
      } else if (tmpIST == 5 || tmpIST == 6) {
        regVal("B", regVal("PAR")); // SUMI or SUBI (pt1)
      } else if (tmpIST == 7 || tmpIST == 8 || tmpIST == 9 || tmpIST == 10) {
        regVal("ADDR", regVal("PAR")); // Various stuff
      } else if (tmpIST == 11) {
        regVal("PC", regVal("PAR")); // JMP
      } else if (tmpIST == 12) {
        if (carryFlag) {
          regVal("PC", regVal("PAR")); // JCF
        } else {
          clearTimeout(idTimeout);
          regVal("STEP", 0);
          totalClock--;
          exec();
          return 0;
        }
      } else if (tmpIST == 13) {
        if (zeroFlag) {
          regVal("PC", regVal("PAR")); // JZF
        } else {
          clearTimeout(idTimeout);
          regVal("STEP", 0);
          totalClock--;
          exec();
          return 0;
        }
      } else if (tmpIST == 14) {
        if (carryFlag && zeroFlag) {
          regVal("PC", regVal("PAR")); // JZC
        } else {
          clearTimeout(idTimeout);
          regVal("STEP", 0);
          totalClock--;
          exec();
          return 0;
        }
      } else if (tmpIST == 15) {
        regVal("OUT", regVal("A")); // OUT
      } else if (tmpIST == 16) {
        startStop();
        return 0;
      }
    } else if (regVal('STEP') == 3) {
      var tmpIST = regVal('IST');
      if (tmpIST == 5) {
        var tmpResult = regStatus[dict["A"]] + regVal("B");
        if (tmpResult >= 256) {
          tmpResult %= 256;
          carryFlag = true;
        } else {
          carryFlag = false;
        }
        if (tmpResult == 0) {
          zeroFlag = true;
        } else {
          zeroFlag = false;
        }
        regVal("A", tmpResult); // SUMI (pt2)
        updateFlagGraphic();
      } else if (tmpIST == 6) {
        var tmpResult = regStatus[dict["A"]] - regVal("B");
        if (tmpResult < 0) {
          tmpResult += 256;
          carryFlag = false; // The flags work this way, even if it seems flipped
        } else {
          carryFlag = true;
        }
        if (tmpResult == 0) {
          zeroFlag = true;
        } else {
          zeroFlag = false;
        }
        regVal("A", tmpResult); // SUB
        updateFlagGraphic();
      } else if (tmpIST == 7) {
        ramVal(regVal("ADDR"), false, regVal("A"));
      } else if (tmpIST == 8) {
        regVal("A", ramVal(regVal("ADDR"), false)); // LDA (pt2)
      } else if (tmpIST == 9) {
        regVal("B", ramVal(regVal("ADDR"), false)); // LDB (pt2)
      } else if (tmpIST == 10) {
        regVal("OUT", ramVal(regVal("ADDR"), false)); // OUTR (pt2)
      }
    }

    regVal("STEP", (regStatus[dict["STEP"]] + 1) % 8);

    if (regStatus[dict["STEP"]] >= clockRequired[regStatus[dict["IST"]]]) {
      regVal("STEP", 0);
    }
  }
}



function resetAll() {
  for (var r in dict) {
    regVal(r, 0);
  }
  zeroFlag = 0;
  carryFlag = 0;
  totalClock = 0;
  document.getElementById("clockCounter").innerHTML = 0;
  updateFlagGraphic();
}

function colorLine(line) {
  try {
    document.getElementById("lineN_" + lastLineColor).style.color = "";
    document.getElementById("lineN_" + lastLineColor).style.backgroundColor = "";
    lastLineColor = line;
    document.getElementById("lineN_" + line).style.color = "#f00";
    document.getElementById("lineN_" + line).style.backgroundColor = "#0f0";
  } catch {}
}

function updateFlagGraphic() {
  if (zeroFlag) {
    document.getElementById("zeroFlag").style.backgroundColor = "#00d326";
  } else {
    document.getElementById("zeroFlag").style.backgroundColor = "";
  }
  if (carryFlag) {
    document.getElementById("carryFlag").style.backgroundColor = "#00d326";
  } else {
    document.getElementById("carryFlag").style.backgroundColor = "";
  }
}


function changeClock(val) {
  var d
  if (clockRange.value/20 < 1){
    d = 0.05;
  } else if (clockRange.value/20 < 3) {
    d = 0.25;
  } else if (clockRange.value/20 < 6) {
    d = 0.5;
  } else if (clockRange.value/20 < 10) {
    d = 1;
  } else if (clockRange.value/20 < 20) {
    d = 2;
  } else {
    d = 5;
  }

  clockRange.value = Number(clockRange.value) + d*val*20;

  document.getElementById("clockFreqSpan").innerHTML = (Math.round(clockRange.value / 20 * 100) / 100).toFixed(2);;
}
