function formatColorText2() {
  var text = assemblyDiv.innerHTML.toUpperCase();
  var range = window.getSelection().getRangeAt(0);
  var beforePosition = getCursor(range, assemblyDiv);
  console.log("Caret char pos: " + beforePosition);

  text = text.replace(new RegExp("&nbsp;", "gi"), " ");
  text = text.replace(new RegExp("<br>", "gi"), "<span><br></span>");
  text = text.replace(new RegExp("\s+", "g"), " ");

  var prevTags = (text.match(new RegExp("<span[^>]*>", "gi")) || []).length

  text = text.replace(new RegExp("<span[^>]*>", "gi"), "");
  text = text.replace(new RegExp("<\/span>", "gi"), "");

  var currentIndex = 0;
  var finalOutput = "";

  while (currentIndex < text.length) {
    if (keyword.indexOf(text.slice(currentIndex).replace("<span><br></span>", " ").split(" ")[0]) != -1) {
      var word = text.slice(currentIndex).replace("<span><br></span>", " ").split(" ")[0];
      for (var c in word) {
        finalOutput += '<span class="keyword">' + word[c] + '</span>';
      }
      currentIndex += c;
    } else {
      finalOutput += text[currentIndex];
      currentIndex++;
    }
  }
  console.log(text);
  console.log(finalOutput);
  assemblyDiv.innerHTML = finalOutput;


  changeLinesNumber();

  setCursor(assemblyDiv, beforePosition);

  compileToBin();
}









function formatColorText() {
  var text = assemblyDiv.innerHTML.toUpperCase();

  //  var beforePosition = getCaretPosition(assemblyDiv);

  var range = window.getSelection().getRangeAt(0);

  var beforePosition = getCursor(range, assemblyDiv);
  console.log("Caret char pos: " + beforePosition);

  text = text.replace(new RegExp("&nbsp;", "gi"), " ");
  text = text.replace(new RegExp("<br>", "gi"), "<br>");
  text = text.replace(new RegExp("\s+", "g"), " ");

  var prevTags = (text.match(new RegExp("<span[^>]*>", "gi")) || []).length

  text = text.replace(new RegExp("<span[^>]*>", "gi"), "");
  text = text.replace(new RegExp("<\/span>", "gi"), "");

  for (key in orderLongerKeyword) {
    text = text.replace(new RegExp(orderLongerKeyword[key], "g"), '<span class="keyword">' + orderLongerKeyword[key] + '</span>');
  }

  for (var i = 255; i >= 0; i--) {
    text = text.replace(new RegExp(" " + i, "g"), ' <span class="number">' + i + '</span>');
  }

  //  text = text.replace(new RegExp("\n+", "g"), "<br>");
  //  text = text.replace(/\s\s+/g, ' '); // collapse multiple spaces or tabs in on space
  //  text = text.replace(new RegExp("\n\n", "g"), "<br>"); // Little hack to preserve the correct blank lines

  if (prevTags != (text.match(new RegExp("<span[^>]*>", "gi")) || []).length) {
    assemblyDiv.innerHTML = text;
  }

  changeLinesNumber();

  setCursor(assemblyDiv, beforePosition);

  compileToBin();
}




function getCursor(range, element) {
  var selection = window.getSelection();
  var treeWalker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    function(element) {
      var nodeRange = document.createRange();
      nodeRange.selectNode(element);
      return nodeRange.compareBoundaryPoints(Range.END_TO_END, range) < 1 ?
        NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
    false
  );
  var nodeCount = 0;
  var charCount = 0;
  while (treeWalker.nextNode()) {
    nodeCount++;
    charCount += treeWalker.currentNode.length;
    //    console.log(treeWalker.currentNode);
  }

  if (selection.anchorNode == element) {
    console.log(nodeCount, selection.anchorOffset);
    charCount += (selection.anchorOffset - nodeCount);

    return charCount;
  } else if (range.startContainer.nodeType == 3) {
    charCount += range.startOffset;
  }

  var offset = 0;
  var brFound = 0;
  for (var child = 0; child < element.childNodes.length && offset + brFound < charCount; child++) {
    try {
      if (element.childNodes[child].nodeType == 1) {
        if (element.childNodes[child].nodeName == "BR") {
          brFound++;
        } else {
          for (var subChild = 0; subChild < element.childNodes[child].childNodes.length && offset + brFound < charCount; subChild++) {
            if (element.childNodes[child].childNodes[subChild].nodeType == 1) {
              if (element.childNodes[child].childNodes[subChild].nodeName == "BR") {
                brFound++;
              } else {
                console.log("Eh boh... \n", element.childNodes[child].childNodes[subChild]);
              }
            } else {
              offset += element.childNodes[child].childNodes[subChild].length;
            }
          }
        }
      } else if (element.childNodes[child].nodeType == 3) {
        offset += element.childNodes[child].length;
      } else {
        offset += 0;
        console.log(element.childNodes[child]);
      }
    } catch (e) {
      console.log(e, "\n\n", element.childNodes[child]);
    }
  }
  console.log(charCount);
  return charCount + brFound;
}


function setCursor(element, pos) {
  var range = document.createRange();
  var sel = window.getSelection();
  //  range.setStart(el.childNodes[el.childNodes.length - 3], el.childNodes[el.childNodes.length - 1].textContent.length - 1);

  var offset = 0;
  var lastAdded;
  for (var child = 0; child < element.childNodes.length && offset < pos; child++) {
    try {
      if (element.childNodes[child].nodeType == 1) {
        if (element.childNodes[child].nodeName == "BR") {
          lastAdded = 1;
        } else {
          lastAdded = element.childNodes[child].firstChild.length;
        }
      } else if (element.childNodes[child].nodeType == 3) {
        lastAdded = element.childNodes[child].length;
      } else {
        lastAdded = 0;
        console.log(element.childNodes[child]);
      }
      offset += lastAdded;
    } catch (e) {
      console.log(e, "\n\n", element.childNodes[child]);
    }
  }
  child--;
  //  range.setStart(element.childNodes[child], pos - (offset - lastAdded));
  if (element.childNodes[child].nodeType == 1) {
    if (element.childNodes[child].nodeName == "BR") {
      console.log("Belin, allora poteva...");
      range.setStart(element.childNodes[child - 1], 0);
      // TODO : Devo ancora capire se qesto caso può capitare
    } else {
      range.setStart(element.childNodes[child].firstChild, pos - (offset - lastAdded));
    }
  } else if (element.childNodes[child].nodeType == 3) {
    range.setStart(element.childNodes[child], pos - (offset - lastAdded));
  } else {
    console.log("Child: ", child, "  Pos: ", pos, "  Offset: ", offset, "  LastAdded: ", lastAdded);
    console.log("Boh...", "\n\n", element.childNodes[child]);
  }
  //  range.setStart(element.childNodes[child].firstChild, 1);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}


function accetableDiff(str1, str2) {
  str1 = str1.replace(new RegExp("<span[^>]*>", "gi"), "");
  str1 = str1.replace(new RegExp("<\/span>", "gi"), "");
  str1 = str1.replace(new RegExp("&nbsp;", "gi"), " ");
  str1 = str1.replace(new RegExp("<br>", "gi"), "<br>");
  str1 = str1.replace(new RegExp("\s+", "g"), " ");

  str2 = str2.replace(new RegExp("<span[^>]*>", "gi"), "");
  str2 = str2.replace(new RegExp("<\/span>", "gi"), "");
  str2 = str2.replace(new RegExp("&nbsp;", "gi"), " ");
  str2 = str2.replace(new RegExp("<br>", "gi"), "<br>");
  str2 = str2.replace(new RegExp("\s+", "g"), " ");

  if (str1.length > str2.length) {
    var tmp = str1;
    str1 = str2;
    str2 = tmp;
  }
  if (str2.length - str1.length <= 4) {
    var diff = "";
    for (var c = 0; c < str2.length; c++) {
      if (str1[c - diff.length] != str2[c]) {
        diff += str2[c]
      }
    }
    if (diff.toUpperCase() == "<BR>") {
      return true;
    }
  }

  return false;
}

/*
function getCaretPosition(editableDiv) { // Thanks https://stackoverflow.com/a/3976125/13040240
  var caretPos = 0,
    sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode == editableDiv) {
        caretPos = range.endOffset;
      }
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    if (range.parentElement() == editableDiv) {
      var tempEl = document.createElement("span");
      editableDiv.insertBefore(tempEl, editableDiv.firstChild);
      var tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint("EndToEnd", range);
      caretPos = tempRange.text.length;
    }
  }
  return caretPos;
}


function getCharacterOffsetWithin(range, node) {
  var treeWalker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_TEXT,
    function(node) {
      var nodeRange = document.createRange();
      nodeRange.selectNode(node);
      return nodeRange.compareBoundaryPoints(Range.END_TO_END, range) < 1 ?
        NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
    false
  );

  var charCount = 0;
  console.log(treeWalker.nextNode());
  while (treeWalker.nextNode()) {
    charCount += treeWalker.currentNode.length;
    console.log(treeWalker.currentNode);
  }

  console.log(range.startOffset);
  if (range.startContainer.nodeType == 3) {
    charCount += range.startOffset;
  }
  return charCount;
}



function setCursor2(range, node, pos){
  var treeWalker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_TEXT,
    function(node) {
      var nodeRange = document.createRange();
      nodeRange.selectNode(node);
      return nodeRange.compareBoundaryPoints(Range.END_TO_END, range) < 1 ?
        NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
    false
  );

  var charCount = 0;
  var lastNode;
  console.log(treeWalker.nextNode());
  while (treeWalker.nextNode() && charCount + treeWalker.currentNode.length <= pos) {
    charCount += treeWalker.currentNode.length;
    lastNode = treeWalker.currentNode;
    console.log("fhbrjfbjre");
  }

  if (range.startContainer.nodeType == 3) {
    charCount += range.startOffset;
  }

  var setpos = document.createRange();
  var set = window.getSelection();
  console.log(lastNode);
  setpos.setStart(lastNode, range.startOffset);
  setpos.collapse(true);
  set.removeAllRanges();
  set.addRange(setpos);
  tag.focus();
}

function setCursor(pos, tag) {
  var setpos = document.createRange();
  var set = window.getSelection();
  console.log(tag.childNodes);
  setpos.setStart(tag.childNodes[0], pos);
  setpos.collapse(true);
  set.removeAllRanges();
  set.addRange(setpos);
  tag.focus();
}*/
