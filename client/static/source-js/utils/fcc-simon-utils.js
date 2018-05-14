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
