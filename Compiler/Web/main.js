var assemblyDiv = document.getElementById("assemblyDiv");
var assemblyLines = document.getElementById("assemblyLines")
var binaryDiv = document.getElementById("binaryDiv");
var hexDiv = document.getElementById("hexDiv");

var optionColor = document.getElementById("textColor");
var optionEnd = document.getElementById("endBootloader");


var clearedContnent = false;
var compileError = false;
var savedRange;
var lastChange = assemblyDiv.innerHTML;

assemblyDiv.spellcheck = false;
binaryDiv.spellcheck = false;
hexDiv.spellcheck = false;

var orderLongerKeyword = ["LDIA", "LDIB", "SUMI", "SUBI", "OUTR", "HALT", "NOP", "SUM", "SUB", "LDR", "LDA", "LDB", "JMP", "JCF", "JZF", "JZC", "OUT"];

var keyword = ["NOP", "LDIA", "LDIB", "SUM", "SUB", "SUMI", "SUBI", "LDR", "LDA", "LDB", "OUTR", "JMP", "JCF", "JZF", "JZC", "OUT", "HALT"];
var requireArgument = [0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0];
var clockRequired = [2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3]; // TODO: correct conditional jmp time


//assemblyDiv.oninput = assemblyInputChanged;
assemblyDiv.oninput = assemblyInputChanged;
optionColor.onchange = optionColorChange;
optionEnd.onchange = compileToHex;

assemblyDiv.onfocus = function() {
  if (!clearedContnent) {
    assemblyDiv.innerHTML = "<br>";
  }
  clearedContnent = true;
};



function optionColorChange() {
  if (optionColor.checked) {
    formatColorText();
  } else {
    var text = assemblyDiv.innerHTML.toUpperCase();
    text = text.replace(new RegExp("&nbsp;", "gi"), " ");
    text = text.replace(new RegExp("<br>", "gi"), "<br>");
    text = text.replace(new RegExp("\s+", "g"), " ");
    text = text.replace(new RegExp("<span[^>]*>", "gi"), "");
    text = text.replace(new RegExp("<\/span>", "gi"), "");
    assemblyDiv.innerHTML = text;
  }
}

function assemblyInputChanged() {
  /*
    if (idTimeout) {
      clearTimeout(idTimeout);
    }
    idTimeout = setTimeout(formatColorText, 5000);
  */

  if (optionColor.checked) {
    if (!accetableDiff(lastChange, assemblyDiv.innerHTML)) {
      formatColorText();
    } else {
      changeLinesNumber();
      compileToBin();
    }
    lastChange = assemblyDiv.innerHTML;
  } else {
    changeLinesNumber();
    compileToBin();
  }

}

//setInterval(formatColorText, 3000);

function compileToBin() {
  compileError = false;

  var text = assemblyDiv.innerText.toUpperCase();
  text = text.replace(/\n\n+/g, '\n'); // collapse multiple lines
  text = text.replace(/\s\s+/g, ' '); // collapse multiple spaces or tabs in on space
  text = text.split("\n"); // split by line

  var output = "";
  for (line in text) {
    try {
      if (keyword.indexOf(text[line].split(" ")[0]) >= 0) {
        output += pad(keyword.indexOf(text[line].split(" ")[0]).toString(2), 8);
        if (requireArgument[keyword.indexOf(text[line].split(" ")[0])]) {
          try {
            if (text[line].split(" ")[1] >= 0 && text[line].split(" ")[1] <= 255) {
              output += " " + pad(Number(text[line].split(" ")[1]).toString(2), 8);
            } else {
              output += ' <span style="color: red;"> [ARG]</span><br>';
              compileError = true;
            }
          } catch {
            output += ' <span style="color: red;">[NULL ARG]</span><br>';
            compileError = true;
          } finally {
            output += "<br>";
          }
        } else {
          output += " 00000000<br>";
        }
      } else if (text[line].split(" ")[0].length > 0) {
        output += '<span style="color: red;"><b>Istruzione sconosciuta alla riga ' + line + '</b></span><br>';
        compileError = true;
      }
    } catch {
      console.log(line + "  " + text[line]);
    }
  }
  //  output = output.replace(/\n\n+/g, '\n'); // collapse multiple lines
  output.replace(new RegExp("\n", "g"), "<br>");

  binaryDiv.innerHTML = output;

  compileToHex();
}


function compileToHex() {
  if (!compileError) {
    var text = binaryDiv.innerText.split("\n");

    var outHigh = "";
    var outLow = "";

    for (line in text) {
      if (text[line].length == 17) {
        outHigh += pad(parseInt(text[line].split(" ")[0], 2).toString(16), 2) + " ";
        outLow += pad(parseInt(text[line].split(" ")[1], 2).toString(16), 2) + " ";
      } else if (text[line].length > 1) {
        outHigh += '<span style="color: red">EE</span> ';
        outLow += '<span style="color: red">EE</span> ';
      }
    }
    if (optionEnd.checked) {
      outHigh += "ff";
      outLow += "ff";
    }

    hexDiv.innerHTML = 'High: ' + outHigh + "<br><br>Low : " + outLow;
    loadToRam(outHigh, outLow);
  } else {
    hexDiv.innerHTML = '<span style="color: red"><b>Non disponibile con errori nella compilazione!</b></span>';
  }
}


function changeLinesNumber() {
  var text = assemblyDiv.innerHTML;


  // text = text.replace(new RegExp("\n\n", "g"), "<br>"); // Little hack to preserve the correct blank lines
  // text = text.replace(new RegExp("\n", "g"), "<br>");

  text = text.replace(new RegExp("<span[^>]*>", "gi"), "");
  text = text.replace(new RegExp("<\/span>", "gi"), "");
  text = text.replace(new RegExp("&nbsp;", "gi"), " ");
  text = text.replace(new RegExp("\s+", "g"), " ");


  var lines = (text.match(/<br>/g) || []).length;

  text = text.split("<br>");

  output = "";
  realLine = 0

  for (var i = 0; i <= lines; i++) {
    if (text[i].length >= 1) {
      output += '<span class="lineNumberText" id="lineN_' + realLine + '">' + realLine + '</span>';
      realLine++;
    }
    output += "<br>";
  }
  assemblyLines.innerHTML = output;
}

function pad(number, length) {
  var str = '' + number;
  while (str.length < length) {
    str = '0' + str;
  }
  return str;
}
