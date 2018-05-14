(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// portfolio
// fcc-projects-simon.js

// File description:
//

const mh_fcc_simon = require('./utils/fcc-simon-utils');

simonToggleoffOn = function() {
  mh_fcc_simon.toggleoffOn();
}

simonStrictMode = function(cmd) {
  mh_fcc_simon.strictMode(cmd);
}

simonStart = function() {
  mh_fcc_simon.start();
}

simonUserCornerPress = function(cornerId) {
  mh_fcc_simon.userCornerPress(cornerId);
}

},{"./utils/fcc-simon-utils":2}],2:[function(require,module,exports){
// portfolio
// fcc-simon-utils.js

// File description:
//

//*********************************************************//
//*********************************************************//
//OBJECT TO HOLD GAME STATE
var gameData = {
  powerOn: false,
  strictMode: false,
  counter: 0,
  winningSequence: [],
  userSequence: [],
  inputEnabled: false
};

//*********************************************************//
//*********************************************************//
//FUNCTION TO GENERATE RANDOM TARGET SEQUENCE OF 20 MOVES & START NEW GAME
resetSequences = function() {
  var nextMove

  gameData.winningSequence = [];
  gameData.userSequence = [];
  gameData.counter = 0;
  gameData.inputEnabled = false;

  for (let i = 0; i < 20; i++) {
    nextMove = Math.floor(Math.random() * 4);
    gameData.winningSequence.push(nextMove);
  }
}

//*********************************************************//
//*********************************************************//
//FUNCTION TO TOGGLE POWER OFF & ON
toggleoffOn = function() {
  var offOnSwitch = document.getElementById('offOnSwitch');

  gameData.powerOn === false ? gameData.powerOn = true : gameData.powerOn = false;

  gameData.powerOn === false ? (
    offOnSwitch.classList.remove('switchRight'),
    strictMode('off'),
    gameData.counter = 0,
    counter('off')
  ) : (
    offOnSwitch.classList.add('switchRight'),
    counter('currentCount')
  )
}

//*********************************************************//
//*********************************************************//
//FUNCTION TO CHANGE STATE OF STRICT MODE
strictMode = function(cmd) {
  var strictStatus = document.getElementById('strictStatus');

  switch (cmd) {
    case 'off':
      strictOff();
      break;
    case 'on':
      strictOn();
      break;
    case 'toggle':
      if (gameData.powerOn === true) {
        gameData.strictMode === true ? strictOff() : strictOn();
      }
      break;
    default:
      console.log('unexpected arg to function strictMode(cmd)')
  }

  function strictOff() {
    gameData.strictMode = false;
    strictStatus.classList.remove('strictModeOn');
    strictStatus.classList.add('strictModeOff');
  }

  function strictOn() {
    gameData.strictMode = true;
    strictStatus.classList.remove('strictModeOff');
    strictStatus.classList.add('strictModeOn');
  }

}

//*********************************************************//
//*********************************************************//
//FUNCTION TO CHANGE STATE OF COUNTER
counter = function(cmd) {
  var counterDispEl = document.getElementById('counter');

  switch(cmd) {
    case 'off':
      counterDispEl.innerHTML = '';
      break;
    case 'currentCount':
      gameData.counter === 0 ? counterDispEl.innerHTML = '- -' : counterDispEl.innerHTML =gameData.counter;
      break;
    case 'incorrectSeq':
      counterDispEl.innerHTML = '! !';
      break;
    case 'victory':
      counterDispEl.innerHTML = 'win';
      break;
    default:
      console.log('unexpected arg to function counter(cmd)');
  }

}

//*********************************************************//
//*********************************************************//
//FUNCTION TO START
start = function() {
  if (gameData.powerOn === true) {
    resetSequences();
    gameLoop();
  }

}

//*********************************************************//
//*********************************************************//
//FUNCTION TO ALTERNATE DEMO SEQ AND USER SEQ UNTIL GAME ENDS
gameLoop = function() {
  counter('currentCount');
  demoSeq();
  gameData.inputEnabled = true;

}

//*********************************************************//
//*********************************************************//
//FUNCTION TO DEMO APPROPRIATE SECTION OF WINNING SEQUENCE
demoSeq = function() {
  var i = 0;

  timeoutWrapper();

  function timeoutWrapper() {
    setTimeout(function() {
      highlightCorner(gameData.winningSequence[i]);
      i++;
      if (i <= gameData.counter) {
        timeoutWrapper();
      }
    }, 1000);
  }

}

//*********************************************************//
//*********************************************************//
//FUNCTION TO HIGHLIGHT A CORNER
function highlightCorner(corner) {
  //Takes 1 arg corresponding to a corner.
  //Sets applicable style class and plays applicable sound. Sound not yet implemented*
  //Corners: green is 0, red is 1, yellow is 2, blue is 3
  var soundUrl;

  switch (corner) {
    case 0:
      soundUrl = 'https://s3.amazonaws.com/freecodecamp/simonSound1.mp3';
      buzzCorner('Green');
      break;
    case 1:
      soundUrl = 'https://s3.amazonaws.com/freecodecamp/simonSound2.mp3';
      buzzCorner('Red');
      break;
    case 2:
      soundUrl = 'https://s3.amazonaws.com/freecodecamp/simonSound3.mp3';
      buzzCorner('Yellow');
      break;
    case 3:
      soundUrl = 'https://s3.amazonaws.com/freecodecamp/simonSound4.mp3';
      buzzCorner('Blue');
      break;
  }

  function buzzCorner(color) {
    var domCorner;
    var styleClassOn;
    var styleClassOff;

    var aSound = new Audio(soundUrl);
    aSound.play();

    domCorner = document.getElementById('corner' + color);
    styleClassOn = 'corner' + color + 'On';
    styleClassOff = 'corner' + color + 'Off';

    domCorner.classList.remove(styleClassOff);
    domCorner.classList.add(styleClassOn);

    setTimeout(function() {
      domCorner.classList.remove(styleClassOn);
      domCorner.classList.add(styleClassOff);
    }, 700);
  }

}

//*********************************************************//
//*********************************************************//
//FUNCTION TO HANDLE A SINGLE USER CORNER BUTTON PRESS
userCornerPress = function(cornerId) {
  var usermove;

  if (gameData.inputEnabled === true) {
    switch (cornerId) {
      case 'cornerGreen':
        highlightCorner(0);
        userMove = 0;
        break;
      case 'cornerRed':
        highlightCorner(1);
        userMove = 1;
        break;
      case 'cornerYellow':
        highlightCorner(2);
        userMove = 2;
        break;
      case 'cornerBlue':
        highlightCorner(3);
        userMove = 3;
        break;
      default:
        console.log('unhandled arg to userCornerPress');
    }

    gameData.userSequence.push(userMove);
    compareSequences();
  }

}

//*********************************************************//
//*********************************************************//
//FUNCTION TO COMPARE WHAT THE USER HAS ENTERED WITH THE WINNING SEQUENCE
function compareSequences() {
  var sequenceIncorrect = false;

  for (let i = 0; i < gameData.userSequence.length; i++) {
    if (gameData.userSequence[i] !== gameData.winningSequence[i]) {
      sequenceIncorrect = true;
    }
  }

  let logic1 = sequenceIncorrect === false;
  let logic2 = gameData.userSequence.length === gameData.counter + 1;
  let logic3 = gameData.userSequence.length > 0;

  console.log('userSeq: ' + gameData.userSequence + ', winningSeq: ' +gameData.winningSequence);

  //Sequence correct.
  if (logic1 && logic2 && logic3) {
    gameData.counter++;
    gameData.inputEnabled = false;
    counter('currentCount');
    gameData.userSequence = [];
    setTimeout(function() {
      gameLoop();
    }, 2000);
  }

  //Someones' only gone and bloody well won.
  if (gameData.counter === 20) {
    counter('victory');
    gameData.inputEnabled = false;
  }

  //Sequence incorrect.
  if (sequenceIncorrect === true) {
    //incorrect in strict mode
    if (gameData.strictMode === true) {
      counter('incorrectSeq');
      setTimeout(function() {
        start();
      }, 2000);
    //Incorrect in coward mode
    } else {
      console.log('seq wrong');
      counter('incorrectSeq');
      gameData.userSequence = [];
      setTimeout(function() {
        gameLoop();
      }, 2000);
    }
  }

}

//*********************************************************//
//*********************************************************//
//EXPORTS
module.exports = {
  toggleoffOn: toggleoffOn,
  start: start,
  strictMode: strictMode,
  userCornerPress
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9mY2MtcHJvamVjdHMtc2ltb24uanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9mY2Mtc2ltb24tdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gcG9ydGZvbGlvXHJcbi8vIGZjYy1wcm9qZWN0cy1zaW1vbi5qc1xyXG5cclxuLy8gRmlsZSBkZXNjcmlwdGlvbjpcclxuLy9cclxuXHJcbmNvbnN0IG1oX2ZjY19zaW1vbiA9IHJlcXVpcmUoJy4vdXRpbHMvZmNjLXNpbW9uLXV0aWxzJyk7XHJcblxyXG5zaW1vblRvZ2dsZW9mZk9uID0gZnVuY3Rpb24oKSB7XHJcbiAgbWhfZmNjX3NpbW9uLnRvZ2dsZW9mZk9uKCk7XHJcbn1cclxuXHJcbnNpbW9uU3RyaWN0TW9kZSA9IGZ1bmN0aW9uKGNtZCkge1xyXG4gIG1oX2ZjY19zaW1vbi5zdHJpY3RNb2RlKGNtZCk7XHJcbn1cclxuXHJcbnNpbW9uU3RhcnQgPSBmdW5jdGlvbigpIHtcclxuICBtaF9mY2Nfc2ltb24uc3RhcnQoKTtcclxufVxyXG5cclxuc2ltb25Vc2VyQ29ybmVyUHJlc3MgPSBmdW5jdGlvbihjb3JuZXJJZCkge1xyXG4gIG1oX2ZjY19zaW1vbi51c2VyQ29ybmVyUHJlc3MoY29ybmVySWQpO1xyXG59XHJcbiIsIi8vIHBvcnRmb2xpb1xyXG4vLyBmY2Mtc2ltb24tdXRpbHMuanNcclxuXHJcbi8vIEZpbGUgZGVzY3JpcHRpb246XHJcbi8vXHJcblxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLy9cclxuLy9PQkpFQ1QgVE8gSE9MRCBHQU1FIFNUQVRFXHJcbnZhciBnYW1lRGF0YSA9IHtcclxuICBwb3dlck9uOiBmYWxzZSxcclxuICBzdHJpY3RNb2RlOiBmYWxzZSxcclxuICBjb3VudGVyOiAwLFxyXG4gIHdpbm5pbmdTZXF1ZW5jZTogW10sXHJcbiAgdXNlclNlcXVlbmNlOiBbXSxcclxuICBpbnB1dEVuYWJsZWQ6IGZhbHNlXHJcbn07XHJcblxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLy9cclxuLy9GVU5DVElPTiBUTyBHRU5FUkFURSBSQU5ET00gVEFSR0VUIFNFUVVFTkNFIE9GIDIwIE1PVkVTICYgU1RBUlQgTkVXIEdBTUVcclxucmVzZXRTZXF1ZW5jZXMgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgbmV4dE1vdmVcclxuXHJcbiAgZ2FtZURhdGEud2lubmluZ1NlcXVlbmNlID0gW107XHJcbiAgZ2FtZURhdGEudXNlclNlcXVlbmNlID0gW107XHJcbiAgZ2FtZURhdGEuY291bnRlciA9IDA7XHJcbiAgZ2FtZURhdGEuaW5wdXRFbmFibGVkID0gZmFsc2U7XHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMjA7IGkrKykge1xyXG4gICAgbmV4dE1vdmUgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA0KTtcclxuICAgIGdhbWVEYXRhLndpbm5pbmdTZXF1ZW5jZS5wdXNoKG5leHRNb3ZlKTtcclxuICB9XHJcbn1cclxuXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLy9cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovL1xyXG4vL0ZVTkNUSU9OIFRPIFRPR0dMRSBQT1dFUiBPRkYgJiBPTlxyXG50b2dnbGVvZmZPbiA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBvZmZPblN3aXRjaCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdvZmZPblN3aXRjaCcpO1xyXG5cclxuICBnYW1lRGF0YS5wb3dlck9uID09PSBmYWxzZSA/IGdhbWVEYXRhLnBvd2VyT24gPSB0cnVlIDogZ2FtZURhdGEucG93ZXJPbiA9IGZhbHNlO1xyXG5cclxuICBnYW1lRGF0YS5wb3dlck9uID09PSBmYWxzZSA/IChcclxuICAgIG9mZk9uU3dpdGNoLmNsYXNzTGlzdC5yZW1vdmUoJ3N3aXRjaFJpZ2h0JyksXHJcbiAgICBzdHJpY3RNb2RlKCdvZmYnKSxcclxuICAgIGdhbWVEYXRhLmNvdW50ZXIgPSAwLFxyXG4gICAgY291bnRlcignb2ZmJylcclxuICApIDogKFxyXG4gICAgb2ZmT25Td2l0Y2guY2xhc3NMaXN0LmFkZCgnc3dpdGNoUmlnaHQnKSxcclxuICAgIGNvdW50ZXIoJ2N1cnJlbnRDb3VudCcpXHJcbiAgKVxyXG59XHJcblxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLy9cclxuLy9GVU5DVElPTiBUTyBDSEFOR0UgU1RBVEUgT0YgU1RSSUNUIE1PREVcclxuc3RyaWN0TW9kZSA9IGZ1bmN0aW9uKGNtZCkge1xyXG4gIHZhciBzdHJpY3RTdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RyaWN0U3RhdHVzJyk7XHJcblxyXG4gIHN3aXRjaCAoY21kKSB7XHJcbiAgICBjYXNlICdvZmYnOlxyXG4gICAgICBzdHJpY3RPZmYoKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICdvbic6XHJcbiAgICAgIHN0cmljdE9uKCk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAndG9nZ2xlJzpcclxuICAgICAgaWYgKGdhbWVEYXRhLnBvd2VyT24gPT09IHRydWUpIHtcclxuICAgICAgICBnYW1lRGF0YS5zdHJpY3RNb2RlID09PSB0cnVlID8gc3RyaWN0T2ZmKCkgOiBzdHJpY3RPbigpO1xyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgY29uc29sZS5sb2coJ3VuZXhwZWN0ZWQgYXJnIHRvIGZ1bmN0aW9uIHN0cmljdE1vZGUoY21kKScpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzdHJpY3RPZmYoKSB7XHJcbiAgICBnYW1lRGF0YS5zdHJpY3RNb2RlID0gZmFsc2U7XHJcbiAgICBzdHJpY3RTdGF0dXMuY2xhc3NMaXN0LnJlbW92ZSgnc3RyaWN0TW9kZU9uJyk7XHJcbiAgICBzdHJpY3RTdGF0dXMuY2xhc3NMaXN0LmFkZCgnc3RyaWN0TW9kZU9mZicpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3RyaWN0T24oKSB7XHJcbiAgICBnYW1lRGF0YS5zdHJpY3RNb2RlID0gdHJ1ZTtcclxuICAgIHN0cmljdFN0YXR1cy5jbGFzc0xpc3QucmVtb3ZlKCdzdHJpY3RNb2RlT2ZmJyk7XHJcbiAgICBzdHJpY3RTdGF0dXMuY2xhc3NMaXN0LmFkZCgnc3RyaWN0TW9kZU9uJyk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovL1xyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXHJcbi8vRlVOQ1RJT04gVE8gQ0hBTkdFIFNUQVRFIE9GIENPVU5URVJcclxuY291bnRlciA9IGZ1bmN0aW9uKGNtZCkge1xyXG4gIHZhciBjb3VudGVyRGlzcEVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZXInKTtcclxuXHJcbiAgc3dpdGNoKGNtZCkge1xyXG4gICAgY2FzZSAnb2ZmJzpcclxuICAgICAgY291bnRlckRpc3BFbC5pbm5lckhUTUwgPSAnJztcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlICdjdXJyZW50Q291bnQnOlxyXG4gICAgICBnYW1lRGF0YS5jb3VudGVyID09PSAwID8gY291bnRlckRpc3BFbC5pbm5lckhUTUwgPSAnLSAtJyA6IGNvdW50ZXJEaXNwRWwuaW5uZXJIVE1MID1nYW1lRGF0YS5jb3VudGVyO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgJ2luY29ycmVjdFNlcSc6XHJcbiAgICAgIGNvdW50ZXJEaXNwRWwuaW5uZXJIVE1MID0gJyEgISc7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAndmljdG9yeSc6XHJcbiAgICAgIGNvdW50ZXJEaXNwRWwuaW5uZXJIVE1MID0gJ3dpbic7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgY29uc29sZS5sb2coJ3VuZXhwZWN0ZWQgYXJnIHRvIGZ1bmN0aW9uIGNvdW50ZXIoY21kKScpO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLy9cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovL1xyXG4vL0ZVTkNUSU9OIFRPIFNUQVJUXHJcbnN0YXJ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgaWYgKGdhbWVEYXRhLnBvd2VyT24gPT09IHRydWUpIHtcclxuICAgIHJlc2V0U2VxdWVuY2VzKCk7XHJcbiAgICBnYW1lTG9vcCgpO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLy9cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovL1xyXG4vL0ZVTkNUSU9OIFRPIEFMVEVSTkFURSBERU1PIFNFUSBBTkQgVVNFUiBTRVEgVU5USUwgR0FNRSBFTkRTXHJcbmdhbWVMb29wID0gZnVuY3Rpb24oKSB7XHJcbiAgY291bnRlcignY3VycmVudENvdW50Jyk7XHJcbiAgZGVtb1NlcSgpO1xyXG4gIGdhbWVEYXRhLmlucHV0RW5hYmxlZCA9IHRydWU7XHJcblxyXG59XHJcblxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLy9cclxuLy9GVU5DVElPTiBUTyBERU1PIEFQUFJPUFJJQVRFIFNFQ1RJT04gT0YgV0lOTklORyBTRVFVRU5DRVxyXG5kZW1vU2VxID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGkgPSAwO1xyXG5cclxuICB0aW1lb3V0V3JhcHBlcigpO1xyXG5cclxuICBmdW5jdGlvbiB0aW1lb3V0V3JhcHBlcigpIHtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgIGhpZ2hsaWdodENvcm5lcihnYW1lRGF0YS53aW5uaW5nU2VxdWVuY2VbaV0pO1xyXG4gICAgICBpKys7XHJcbiAgICAgIGlmIChpIDw9IGdhbWVEYXRhLmNvdW50ZXIpIHtcclxuICAgICAgICB0aW1lb3V0V3JhcHBlcigpO1xyXG4gICAgICB9XHJcbiAgICB9LCAxMDAwKTtcclxuICB9XHJcblxyXG59XHJcblxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLy9cclxuLy9GVU5DVElPTiBUTyBISUdITElHSFQgQSBDT1JORVJcclxuZnVuY3Rpb24gaGlnaGxpZ2h0Q29ybmVyKGNvcm5lcikge1xyXG4gIC8vVGFrZXMgMSBhcmcgY29ycmVzcG9uZGluZyB0byBhIGNvcm5lci5cclxuICAvL1NldHMgYXBwbGljYWJsZSBzdHlsZSBjbGFzcyBhbmQgcGxheXMgYXBwbGljYWJsZSBzb3VuZC4gU291bmQgbm90IHlldCBpbXBsZW1lbnRlZCpcclxuICAvL0Nvcm5lcnM6IGdyZWVuIGlzIDAsIHJlZCBpcyAxLCB5ZWxsb3cgaXMgMiwgYmx1ZSBpcyAzXHJcbiAgdmFyIHNvdW5kVXJsO1xyXG5cclxuICBzd2l0Y2ggKGNvcm5lcikge1xyXG4gICAgY2FzZSAwOlxyXG4gICAgICBzb3VuZFVybCA9ICdodHRwczovL3MzLmFtYXpvbmF3cy5jb20vZnJlZWNvZGVjYW1wL3NpbW9uU291bmQxLm1wMyc7XHJcbiAgICAgIGJ1enpDb3JuZXIoJ0dyZWVuJyk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAxOlxyXG4gICAgICBzb3VuZFVybCA9ICdodHRwczovL3MzLmFtYXpvbmF3cy5jb20vZnJlZWNvZGVjYW1wL3NpbW9uU291bmQyLm1wMyc7XHJcbiAgICAgIGJ1enpDb3JuZXIoJ1JlZCcpO1xyXG4gICAgICBicmVhaztcclxuICAgIGNhc2UgMjpcclxuICAgICAgc291bmRVcmwgPSAnaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL2ZyZWVjb2RlY2FtcC9zaW1vblNvdW5kMy5tcDMnO1xyXG4gICAgICBidXp6Q29ybmVyKCdZZWxsb3cnKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIDM6XHJcbiAgICAgIHNvdW5kVXJsID0gJ2h0dHBzOi8vczMuYW1hem9uYXdzLmNvbS9mcmVlY29kZWNhbXAvc2ltb25Tb3VuZDQubXAzJztcclxuICAgICAgYnV6ekNvcm5lcignQmx1ZScpO1xyXG4gICAgICBicmVhaztcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGJ1enpDb3JuZXIoY29sb3IpIHtcclxuICAgIHZhciBkb21Db3JuZXI7XHJcbiAgICB2YXIgc3R5bGVDbGFzc09uO1xyXG4gICAgdmFyIHN0eWxlQ2xhc3NPZmY7XHJcblxyXG4gICAgdmFyIGFTb3VuZCA9IG5ldyBBdWRpbyhzb3VuZFVybCk7XHJcbiAgICBhU291bmQucGxheSgpO1xyXG5cclxuICAgIGRvbUNvcm5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3JuZXInICsgY29sb3IpO1xyXG4gICAgc3R5bGVDbGFzc09uID0gJ2Nvcm5lcicgKyBjb2xvciArICdPbic7XHJcbiAgICBzdHlsZUNsYXNzT2ZmID0gJ2Nvcm5lcicgKyBjb2xvciArICdPZmYnO1xyXG5cclxuICAgIGRvbUNvcm5lci5jbGFzc0xpc3QucmVtb3ZlKHN0eWxlQ2xhc3NPZmYpO1xyXG4gICAgZG9tQ29ybmVyLmNsYXNzTGlzdC5hZGQoc3R5bGVDbGFzc09uKTtcclxuXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICBkb21Db3JuZXIuY2xhc3NMaXN0LnJlbW92ZShzdHlsZUNsYXNzT24pO1xyXG4gICAgICBkb21Db3JuZXIuY2xhc3NMaXN0LmFkZChzdHlsZUNsYXNzT2ZmKTtcclxuICAgIH0sIDcwMCk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovL1xyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXHJcbi8vRlVOQ1RJT04gVE8gSEFORExFIEEgU0lOR0xFIFVTRVIgQ09STkVSIEJVVFRPTiBQUkVTU1xyXG51c2VyQ29ybmVyUHJlc3MgPSBmdW5jdGlvbihjb3JuZXJJZCkge1xyXG4gIHZhciB1c2VybW92ZTtcclxuXHJcbiAgaWYgKGdhbWVEYXRhLmlucHV0RW5hYmxlZCA9PT0gdHJ1ZSkge1xyXG4gICAgc3dpdGNoIChjb3JuZXJJZCkge1xyXG4gICAgICBjYXNlICdjb3JuZXJHcmVlbic6XHJcbiAgICAgICAgaGlnaGxpZ2h0Q29ybmVyKDApO1xyXG4gICAgICAgIHVzZXJNb3ZlID0gMDtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAnY29ybmVyUmVkJzpcclxuICAgICAgICBoaWdobGlnaHRDb3JuZXIoMSk7XHJcbiAgICAgICAgdXNlck1vdmUgPSAxO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdjb3JuZXJZZWxsb3cnOlxyXG4gICAgICAgIGhpZ2hsaWdodENvcm5lcigyKTtcclxuICAgICAgICB1c2VyTW92ZSA9IDI7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2Nvcm5lckJsdWUnOlxyXG4gICAgICAgIGhpZ2hsaWdodENvcm5lcigzKTtcclxuICAgICAgICB1c2VyTW92ZSA9IDM7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgY29uc29sZS5sb2coJ3VuaGFuZGxlZCBhcmcgdG8gdXNlckNvcm5lclByZXNzJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2FtZURhdGEudXNlclNlcXVlbmNlLnB1c2godXNlck1vdmUpO1xyXG4gICAgY29tcGFyZVNlcXVlbmNlcygpO1xyXG4gIH1cclxuXHJcbn1cclxuXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLy9cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovL1xyXG4vL0ZVTkNUSU9OIFRPIENPTVBBUkUgV0hBVCBUSEUgVVNFUiBIQVMgRU5URVJFRCBXSVRIIFRIRSBXSU5OSU5HIFNFUVVFTkNFXHJcbmZ1bmN0aW9uIGNvbXBhcmVTZXF1ZW5jZXMoKSB7XHJcbiAgdmFyIHNlcXVlbmNlSW5jb3JyZWN0ID0gZmFsc2U7XHJcblxyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZ2FtZURhdGEudXNlclNlcXVlbmNlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoZ2FtZURhdGEudXNlclNlcXVlbmNlW2ldICE9PSBnYW1lRGF0YS53aW5uaW5nU2VxdWVuY2VbaV0pIHtcclxuICAgICAgc2VxdWVuY2VJbmNvcnJlY3QgPSB0cnVlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbGV0IGxvZ2ljMSA9IHNlcXVlbmNlSW5jb3JyZWN0ID09PSBmYWxzZTtcclxuICBsZXQgbG9naWMyID0gZ2FtZURhdGEudXNlclNlcXVlbmNlLmxlbmd0aCA9PT0gZ2FtZURhdGEuY291bnRlciArIDE7XHJcbiAgbGV0IGxvZ2ljMyA9IGdhbWVEYXRhLnVzZXJTZXF1ZW5jZS5sZW5ndGggPiAwO1xyXG5cclxuICBjb25zb2xlLmxvZygndXNlclNlcTogJyArIGdhbWVEYXRhLnVzZXJTZXF1ZW5jZSArICcsIHdpbm5pbmdTZXE6ICcgK2dhbWVEYXRhLndpbm5pbmdTZXF1ZW5jZSk7XHJcblxyXG4gIC8vU2VxdWVuY2UgY29ycmVjdC5cclxuICBpZiAobG9naWMxICYmIGxvZ2ljMiAmJiBsb2dpYzMpIHtcclxuICAgIGdhbWVEYXRhLmNvdW50ZXIrKztcclxuICAgIGdhbWVEYXRhLmlucHV0RW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgY291bnRlcignY3VycmVudENvdW50Jyk7XHJcbiAgICBnYW1lRGF0YS51c2VyU2VxdWVuY2UgPSBbXTtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgIGdhbWVMb29wKCk7XHJcbiAgICB9LCAyMDAwKTtcclxuICB9XHJcblxyXG4gIC8vU29tZW9uZXMnIG9ubHkgZ29uZSBhbmQgYmxvb2R5IHdlbGwgd29uLlxyXG4gIGlmIChnYW1lRGF0YS5jb3VudGVyID09PSAyMCkge1xyXG4gICAgY291bnRlcigndmljdG9yeScpO1xyXG4gICAgZ2FtZURhdGEuaW5wdXRFbmFibGVkID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvL1NlcXVlbmNlIGluY29ycmVjdC5cclxuICBpZiAoc2VxdWVuY2VJbmNvcnJlY3QgPT09IHRydWUpIHtcclxuICAgIC8vaW5jb3JyZWN0IGluIHN0cmljdCBtb2RlXHJcbiAgICBpZiAoZ2FtZURhdGEuc3RyaWN0TW9kZSA9PT0gdHJ1ZSkge1xyXG4gICAgICBjb3VudGVyKCdpbmNvcnJlY3RTZXEnKTtcclxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICBzdGFydCgpO1xyXG4gICAgICB9LCAyMDAwKTtcclxuICAgIC8vSW5jb3JyZWN0IGluIGNvd2FyZCBtb2RlXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zb2xlLmxvZygnc2VxIHdyb25nJyk7XHJcbiAgICAgIGNvdW50ZXIoJ2luY29ycmVjdFNlcScpO1xyXG4gICAgICBnYW1lRGF0YS51c2VyU2VxdWVuY2UgPSBbXTtcclxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lTG9vcCgpO1xyXG4gICAgICB9LCAyMDAwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG59XHJcblxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi8vXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqLy9cclxuLy9FWFBPUlRTXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHRvZ2dsZW9mZk9uOiB0b2dnbGVvZmZPbixcclxuICBzdGFydDogc3RhcnQsXHJcbiAgc3RyaWN0TW9kZTogc3RyaWN0TW9kZSxcclxuICB1c2VyQ29ybmVyUHJlc3NcclxufVxyXG4iXX0=
