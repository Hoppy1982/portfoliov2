(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//portfolio
//fcc-projects-tictactoe.js

const fccTictactoe = require('./utils/fcc-tictactoe-utils');


resetGame = function() {
  fccTictactoe.resetGame();
}

},{"./utils/fcc-tictactoe-utils":2}],2:[function(require,module,exports){
//portfolio
//fcc-tictactoe-utils.js

//FCC TIC TAC TOE GAME

//********************************************************
//********************************************************

//GAME STATE
var gameData = {
  p1: {
    being: 'Human',
    hasWon: false,
    shape: 'Noughts'
  },
  p2: {
    being: 'Human',
    hasWon: false,
    shape: 'Crosses'
  },
  whoseTurn: 'p1',
  currentStage: 0,
  board: [
    {owner: 'none', row: 0, col: 0},
    {owner: 'none', row: 0, col: 1},
    {owner: 'none', row: 0, col: 2},
    {owner: 'none', row: 1, col: 0},
    {owner: 'none', row: 1, col: 1},
    {owner: 'none', row: 1, col: 2},
    {owner: 'none', row: 2, col: 0},
    {owner: 'none', row: 2, col: 1},
    {owner: 'none', row: 2, col: 2},
  ],
  gameEnded: false
}

//********************************************************
//********************************************************

//RESET
function resetGame() {
  gameData.p1.being = 'Human';
  gameData.p1.hasWon = false;
  gameData.p1.shape = 'Noughts';
  gameData.p2.being = 'Human';
  gameData.p2.hasWon = false;
  gameData.p2.shape = 'Crosses';
  gameData.whoseTurn = 'p1';
  gameData.currentStage = 0;
  gameData.gameEnded = false;
  gameData.board.forEach(function(element) {
    element.owner = 'none';
  });
  wipeScreen();
  renderOptionsScreen();
}

//********************************************************
//********************************************************

//WIPE SCREEN CLEAN
function wipeScreen() {
    while (gameCentral.firstChild) {
      gameCentral.removeChild(gameCentral.firstChild);
    }
    gameCentral.className = '';
    gameCentral.classList.add('gameCentralDefault');
}

//********************************************************
//********************************************************

//UPDATE SCREEN
function updateScreen() {
  checkGameEnded();
  wipeScreen();

  switch (gameData.currentStage) {
    case 0:
      renderOptionsScreen();
      break;
    case 1:
      renderGameBoard();
      break;
    case 2:
      console.log('p1: ' + gameData.p1.hasWon + ' ,p2: ' + gameData.p2.hasWon);
      renderEndGame();
      break;
    default:
      console.log('Entered unexpected stage');
  }

  if (gameData[gameData.whoseTurn].being === 'AI' && gameData.gameEnded === false) {
    window.setTimeout(AITurn, 1000);
  }
}

//********************************************************
//********************************************************

//RENDER OPTIONS SCREEN
function renderOptionsScreen() {
  var gameCentral = document.getElementById('gameCentral');
  var fragment = document.createDocumentFragment();

  var startButton = document.createElement('div');
  var p1Being = document.createElement('div');
  var p2Being = document.createElement('div');
  var p1Shape = document.createElement('div');

  var startButtonText = document.createTextNode('START GAME');
  var p1BeingText = document.createTextNode('P1: ' + gameData.p1.being);
  var p2BeingText = document.createTextNode('P2: ' + gameData.p2.being);
  var p1ShapeText = document.createTextNode('P1: ' + gameData.p1.shape);

  startButton.onclick = function() {
    gameData.currentStage = 1;
    updateScreen();
  }

  p1Being.onclick = function() {
    gameData.p1.being === 'Human' ? gameData.p1.being = 'AI' : gameData.p1.being = 'Human';
    updateScreen();
  }

  p2Being.onclick = function() {
    gameData.p2.being === 'Human' ? gameData.p2.being = 'AI' : gameData.p2.being = 'Human';
    updateScreen();
  }

  p1Shape.onclick = function() {
    gameData.p1.shape === 'Noughts' ? (
      gameData.p1.shape = 'Crosses',
      gameData.p2.shape = 'Noughts'
    ) : (
      gameData.p1.shape = 'Noughts',
      gameData.p2.shape = 'Crosses'
    );
    updateScreen();
  }

  gameCentral.classList.add('gameCentralOptions');
  startButton.classList.add('startButton');
  p1Being.classList.add('optionsButton');
  p2Being.classList.add('optionsButton');
  p1Shape.classList.add('optionsButton');

  startButton.appendChild(startButtonText);
  p1Being.appendChild(p1BeingText);
  p2Being.appendChild(p2BeingText);
  p1Shape.appendChild(p1ShapeText);

  fragment.appendChild(startButton);
  fragment.appendChild(p1Being);
  fragment.appendChild(p2Being);
  fragment.appendChild(p1Shape);
  gameCentral.appendChild(fragment);
}

//********************************************************
//********************************************************

//RENDER GAME BOARD
function renderGameBoard() {
  var gameCentral = document.getElementById('gameCentral');
  var fragment = document.createDocumentFragment();

  var p1Piece;
  var p2Piece;

  var boardSquare;
  var boardSquareShape;
  var boardSquareContent;

  gameData.p1.shape === 'Noughts' ? (
    p1Piece = 'O',
    p2Piece = 'X'
  ) : (
    p1Piece = 'X',
    p2Piece = 'O'
  );

  gameData.board.forEach(function(element, index) {
    boardSquare = document.createElement('div');
    boardSquare.id = 'square' + index;

    if (element.owner === 'none') {
      boardSquareShape = '';
    } else if (element.owner === 'p1') {
      boardSquareShape = p1Piece;
    } else if (element.owner === 'p2') {
      boardSquareShape = p2Piece;
    }

    boardSquare.onclick = function() {
      humanTurn(element.row, element.col);
    }

    boardSquare.classList.add('boardSquare');
    boardSquareContent = document.createTextNode(boardSquareShape);
    boardSquare.appendChild(boardSquareContent);
    fragment.appendChild(boardSquare);
  });

  gameCentral.classList.add('gameCentralPlaying');
  gameCentral.appendChild(fragment);
}

//********************************************************
//********************************************************

//RENDER END GAME SCREEN
function renderEndGame() {
  var gameCentral = document.getElementById('gameCentral');
  var fragment = document.createDocumentFragment();
  var endGameMsgBox = document.createElement('div');
  var msgText = '';
  var msgTextNode;

  if (gameData.p1.hasWon === true) {
    msgText = 'P1 WON!';
  }

  if (gameData.p2.hasWon === true) {
    msgText = 'P2 WON!';
  }

  if (gameData.p1.hasWon === false && gameData.p2.hasWon === false) {
    msgText = 'DRAW!';
  }
  gameCentral.classList.add('gameCentralOptions');
  endGameMsgBox.classList.add('optionsButton');
  msgTextNode = document.createTextNode(msgText);
  endGameMsgBox.appendChild(msgTextNode);
  fragment.appendChild(endGameMsgBox);
  gameCentral.appendChild(fragment);
}

//********************************************************
//********************************************************

//HANDLE USER CLICKING A BOARD SQUARE
function humanTurn(r,c) {
  if (gameData[gameData.whoseTurn].being === 'Human' && gameData.board[(r * 3) + c].owner === 'none') {

    gameData.board[(r * 3) + c].owner = gameData.whoseTurn;
    gameData.whoseTurn === 'p1' ? gameData.whoseTurn = 'p2' : gameData.whoseTurn = 'p1';
    updateScreen();
  }
}

//********************************************************
//********************************************************

//CHECK IF GAME ENDED
function checkGameEnded() {
  //Avoid lines 57km long
  var lowRight = gameData.board[8].owner;
  var midMid = gameData.board[4].owner;
  var upLeft = gameData.board[0].owner;
  var lowLeft = gameData.board[6].owner;
  var upRight = gameData.board[2].owner;
  //Evaluate to true if all 3 squares of a diagonal same owner
  var diagA = (lowRight === midMid ) && (upLeft === midMid) && (midMid !== 'none');
  var diagB = (lowLeft === midMid ) && (upRight === midMid) && (midMid !== 'none');
  //If an element reaches 3 or -3 then a player has won
  var upDownLeftRightWin = [
    0,//top
    0,//middle row
    0,//bottom row
    0,//left col
    0,//midle col
    0//right col
  ];
  var boardFilled = false;


  //Check diagonal victories
  if ( diagA || diagB ) {
    gameData.board[4].owner === 'p1' ? gameData.p1.hasWon = true : gameData.p2.hasWon = true;
  }
  //Check for uppydownyleftyrighty victories
  gameData.board.forEach(function(element) {
    if (element.owner === 'p1') {
      upDownLeftRightWin[element.row]++;
      upDownLeftRightWin[element.col + 3]++;
    } else if (element.owner === 'p2') {
      upDownLeftRightWin[element.row]--;
      upDownLeftRightWin[element.col + 3]--;
    }
  });

  upDownLeftRightWin.forEach(function(element) {
    if (element === 3) {
      gameData.p1.hasWon = true;
    } else if (element === -3) {
      gameData.p2.hasWon = true;
    }
  });

  if (gameData.p1.hasWon === true || gameData.p2.hasWon === true) {
    gameData.currentStage = 2;
    gameData.gameEnded = true;
  }

  //Check no empty squares
  boardFilled = gameData.board.every(function(element) {
    return element.owner !== 'none';
  });

  if (boardFilled) {
    gameData.currentStage = 2;
    gameData.gameEnded = true;
  }
}

//********************************************************
//********************************************************

//TAKE AI's TURN
function AITurn() {
  //work out where the holy blue smeg balls to place piece***
  var hasMoved = false;
  var freeCorner = [0, 2, 6, 8];
  var freeSide = [1, 3, 5, 7];
  //1st 3 elements are squares in gameData.board, 4th element is counter
  //for how close to victory on that line, 3 for this player, -3 for other player
  var possibleWins = [
    [0, 1, 2, 0],
    [3, 4, 5, 0],
    [6, 7, 8, 0],
    [0, 3, 6, 0],
    [1, 4, 7, 0],
    [2, 5, 8, 0],
    [0, 4, 8, 0],
    [2, 4, 6, 0]
  ];
  //4th element in a sub arr of possibleWins will either be 2 or -2 if a win is possible.
  //target is either 2 or -2 depending on if AI is p1 or p2.
  var target;

  gameData.whoseTurn === 'p1' ? target = 2 : target = -2;

  for (let i = 0; i < possibleWins.length; i++) {
    for (let j =0; j < possibleWins[i].length - 1; j++) {
      if (gameData.board[possibleWins[i][j]].owner === 'p1') {
        possibleWins[i][3]++;
      } else if (gameData.board[possibleWins[i][j]].owner === 'p2') {
        possibleWins[i][3]--;
      }
    }
  }
  //win
  for (let i = 0; i < possibleWins.length; i++) {
    if (possibleWins[i][3] === target) {
      for (let j = 0; j < possibleWins[i].length - 1; j++) {
        if (gameData.board[possibleWins[i][j]].owner === 'none' && hasMoved === false) {
          gameData.board[possibleWins[i][j]].owner = gameData.whoseTurn;
          hasMoved = true;
        }
      }
    }
  }
  //block win
  if (hasMoved === false) {
    for (let i = 0; i < possibleWins.length; i++) {
    if (possibleWins[i][3] === target * -1) {
      for (let j = 0; j < possibleWins[i].length - 1; j++) {
        if (gameData.board[possibleWins[i][j]].owner === 'none' && hasMoved === false) {
          gameData.board[possibleWins[i][j]].owner = gameData.whoseTurn;
          hasMoved = true;
        }
      }
    }
  }
}
  //fork
  //Seems unbeatable without adding this
  //block fork
  //Seems unbeatable without adding this
  //center
  if (hasMoved === false && gameData.board[4].owner === 'none') {
    gameData.board[4].owner = gameData.whoseTurn;
    hasMoved = true;
  }
  //opposite corner
  //Seems unbeatable without adding this
  //empty corner
  if (hasMoved === false) {
    for (let i = 0; i < freeCorner.length; i++) {
      if (gameData.board[freeCorner[i]].owner === 'none') {
        gameData.board[freeCorner[i]].owner = gameData.whoseTurn;
        hasMoved = true;
        break;
      }
    }
  }
  //empty side
  if (hasMoved === false) {
    for (let i = 0; i < freeSide.length; i++) {
      if (gameData.board[freeSide[i]].owner === 'none') {
        gameData.board[freeSide[i]].owner = gameData.whoseTurn;
        hasMoved = true;
        break;
      }
    }
  }

  gameData.whoseTurn === 'p1' ? gameData.whoseTurn = 'p2' : gameData.whoseTurn = 'p1';
  updateScreen();
}

//********************************************************
//********************************************************


module.exports = {
  resetGame
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9mY2MtcHJvamVjdHMtdGljdGFjdG9lLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvZmNjLXRpY3RhY3RvZS11dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vcG9ydGZvbGlvXHJcbi8vZmNjLXByb2plY3RzLXRpY3RhY3RvZS5qc1xyXG5cclxuY29uc3QgZmNjVGljdGFjdG9lID0gcmVxdWlyZSgnLi91dGlscy9mY2MtdGljdGFjdG9lLXV0aWxzJyk7XHJcblxyXG5cclxucmVzZXRHYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgZmNjVGljdGFjdG9lLnJlc2V0R2FtZSgpO1xyXG59XHJcbiIsIi8vcG9ydGZvbGlvXHJcbi8vZmNjLXRpY3RhY3RvZS11dGlscy5qc1xyXG5cclxuLy9GQ0MgVElDIFRBQyBUT0UgR0FNRVxyXG5cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcblxyXG4vL0dBTUUgU1RBVEVcclxudmFyIGdhbWVEYXRhID0ge1xyXG4gIHAxOiB7XHJcbiAgICBiZWluZzogJ0h1bWFuJyxcclxuICAgIGhhc1dvbjogZmFsc2UsXHJcbiAgICBzaGFwZTogJ05vdWdodHMnXHJcbiAgfSxcclxuICBwMjoge1xyXG4gICAgYmVpbmc6ICdIdW1hbicsXHJcbiAgICBoYXNXb246IGZhbHNlLFxyXG4gICAgc2hhcGU6ICdDcm9zc2VzJ1xyXG4gIH0sXHJcbiAgd2hvc2VUdXJuOiAncDEnLFxyXG4gIGN1cnJlbnRTdGFnZTogMCxcclxuICBib2FyZDogW1xyXG4gICAge293bmVyOiAnbm9uZScsIHJvdzogMCwgY29sOiAwfSxcclxuICAgIHtvd25lcjogJ25vbmUnLCByb3c6IDAsIGNvbDogMX0sXHJcbiAgICB7b3duZXI6ICdub25lJywgcm93OiAwLCBjb2w6IDJ9LFxyXG4gICAge293bmVyOiAnbm9uZScsIHJvdzogMSwgY29sOiAwfSxcclxuICAgIHtvd25lcjogJ25vbmUnLCByb3c6IDEsIGNvbDogMX0sXHJcbiAgICB7b3duZXI6ICdub25lJywgcm93OiAxLCBjb2w6IDJ9LFxyXG4gICAge293bmVyOiAnbm9uZScsIHJvdzogMiwgY29sOiAwfSxcclxuICAgIHtvd25lcjogJ25vbmUnLCByb3c6IDIsIGNvbDogMX0sXHJcbiAgICB7b3duZXI6ICdub25lJywgcm93OiAyLCBjb2w6IDJ9LFxyXG4gIF0sXHJcbiAgZ2FtZUVuZGVkOiBmYWxzZVxyXG59XHJcblxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbi8vUkVTRVRcclxuZnVuY3Rpb24gcmVzZXRHYW1lKCkge1xyXG4gIGdhbWVEYXRhLnAxLmJlaW5nID0gJ0h1bWFuJztcclxuICBnYW1lRGF0YS5wMS5oYXNXb24gPSBmYWxzZTtcclxuICBnYW1lRGF0YS5wMS5zaGFwZSA9ICdOb3VnaHRzJztcclxuICBnYW1lRGF0YS5wMi5iZWluZyA9ICdIdW1hbic7XHJcbiAgZ2FtZURhdGEucDIuaGFzV29uID0gZmFsc2U7XHJcbiAgZ2FtZURhdGEucDIuc2hhcGUgPSAnQ3Jvc3Nlcyc7XHJcbiAgZ2FtZURhdGEud2hvc2VUdXJuID0gJ3AxJztcclxuICBnYW1lRGF0YS5jdXJyZW50U3RhZ2UgPSAwO1xyXG4gIGdhbWVEYXRhLmdhbWVFbmRlZCA9IGZhbHNlO1xyXG4gIGdhbWVEYXRhLmJvYXJkLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgZWxlbWVudC5vd25lciA9ICdub25lJztcclxuICB9KTtcclxuICB3aXBlU2NyZWVuKCk7XHJcbiAgcmVuZGVyT3B0aW9uc1NjcmVlbigpO1xyXG59XHJcblxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbi8vV0lQRSBTQ1JFRU4gQ0xFQU5cclxuZnVuY3Rpb24gd2lwZVNjcmVlbigpIHtcclxuICAgIHdoaWxlIChnYW1lQ2VudHJhbC5maXJzdENoaWxkKSB7XHJcbiAgICAgIGdhbWVDZW50cmFsLnJlbW92ZUNoaWxkKGdhbWVDZW50cmFsLmZpcnN0Q2hpbGQpO1xyXG4gICAgfVxyXG4gICAgZ2FtZUNlbnRyYWwuY2xhc3NOYW1lID0gJyc7XHJcbiAgICBnYW1lQ2VudHJhbC5jbGFzc0xpc3QuYWRkKCdnYW1lQ2VudHJhbERlZmF1bHQnKTtcclxufVxyXG5cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcblxyXG4vL1VQREFURSBTQ1JFRU5cclxuZnVuY3Rpb24gdXBkYXRlU2NyZWVuKCkge1xyXG4gIGNoZWNrR2FtZUVuZGVkKCk7XHJcbiAgd2lwZVNjcmVlbigpO1xyXG5cclxuICBzd2l0Y2ggKGdhbWVEYXRhLmN1cnJlbnRTdGFnZSkge1xyXG4gICAgY2FzZSAwOlxyXG4gICAgICByZW5kZXJPcHRpb25zU2NyZWVuKCk7XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAxOlxyXG4gICAgICByZW5kZXJHYW1lQm9hcmQoKTtcclxuICAgICAgYnJlYWs7XHJcbiAgICBjYXNlIDI6XHJcbiAgICAgIGNvbnNvbGUubG9nKCdwMTogJyArIGdhbWVEYXRhLnAxLmhhc1dvbiArICcgLHAyOiAnICsgZ2FtZURhdGEucDIuaGFzV29uKTtcclxuICAgICAgcmVuZGVyRW5kR2FtZSgpO1xyXG4gICAgICBicmVhaztcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIGNvbnNvbGUubG9nKCdFbnRlcmVkIHVuZXhwZWN0ZWQgc3RhZ2UnKTtcclxuICB9XHJcblxyXG4gIGlmIChnYW1lRGF0YVtnYW1lRGF0YS53aG9zZVR1cm5dLmJlaW5nID09PSAnQUknICYmIGdhbWVEYXRhLmdhbWVFbmRlZCA9PT0gZmFsc2UpIHtcclxuICAgIHdpbmRvdy5zZXRUaW1lb3V0KEFJVHVybiwgMTAwMCk7XHJcbiAgfVxyXG59XHJcblxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbi8vUkVOREVSIE9QVElPTlMgU0NSRUVOXHJcbmZ1bmN0aW9uIHJlbmRlck9wdGlvbnNTY3JlZW4oKSB7XHJcbiAgdmFyIGdhbWVDZW50cmFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVDZW50cmFsJyk7XHJcbiAgdmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG5cclxuICB2YXIgc3RhcnRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICB2YXIgcDFCZWluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xyXG4gIHZhciBwMkJlaW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgdmFyIHAxU2hhcGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcbiAgdmFyIHN0YXJ0QnV0dG9uVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdTVEFSVCBHQU1FJyk7XHJcbiAgdmFyIHAxQmVpbmdUZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ1AxOiAnICsgZ2FtZURhdGEucDEuYmVpbmcpO1xyXG4gIHZhciBwMkJlaW5nVGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdQMjogJyArIGdhbWVEYXRhLnAyLmJlaW5nKTtcclxuICB2YXIgcDFTaGFwZVRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnUDE6ICcgKyBnYW1lRGF0YS5wMS5zaGFwZSk7XHJcblxyXG4gIHN0YXJ0QnV0dG9uLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcclxuICAgIGdhbWVEYXRhLmN1cnJlbnRTdGFnZSA9IDE7XHJcbiAgICB1cGRhdGVTY3JlZW4oKTtcclxuICB9XHJcblxyXG4gIHAxQmVpbmcub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZ2FtZURhdGEucDEuYmVpbmcgPT09ICdIdW1hbicgPyBnYW1lRGF0YS5wMS5iZWluZyA9ICdBSScgOiBnYW1lRGF0YS5wMS5iZWluZyA9ICdIdW1hbic7XHJcbiAgICB1cGRhdGVTY3JlZW4oKTtcclxuICB9XHJcblxyXG4gIHAyQmVpbmcub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZ2FtZURhdGEucDIuYmVpbmcgPT09ICdIdW1hbicgPyBnYW1lRGF0YS5wMi5iZWluZyA9ICdBSScgOiBnYW1lRGF0YS5wMi5iZWluZyA9ICdIdW1hbic7XHJcbiAgICB1cGRhdGVTY3JlZW4oKTtcclxuICB9XHJcblxyXG4gIHAxU2hhcGUub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgZ2FtZURhdGEucDEuc2hhcGUgPT09ICdOb3VnaHRzJyA/IChcclxuICAgICAgZ2FtZURhdGEucDEuc2hhcGUgPSAnQ3Jvc3NlcycsXHJcbiAgICAgIGdhbWVEYXRhLnAyLnNoYXBlID0gJ05vdWdodHMnXHJcbiAgICApIDogKFxyXG4gICAgICBnYW1lRGF0YS5wMS5zaGFwZSA9ICdOb3VnaHRzJyxcclxuICAgICAgZ2FtZURhdGEucDIuc2hhcGUgPSAnQ3Jvc3NlcydcclxuICAgICk7XHJcbiAgICB1cGRhdGVTY3JlZW4oKTtcclxuICB9XHJcblxyXG4gIGdhbWVDZW50cmFsLmNsYXNzTGlzdC5hZGQoJ2dhbWVDZW50cmFsT3B0aW9ucycpO1xyXG4gIHN0YXJ0QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3N0YXJ0QnV0dG9uJyk7XHJcbiAgcDFCZWluZy5jbGFzc0xpc3QuYWRkKCdvcHRpb25zQnV0dG9uJyk7XHJcbiAgcDJCZWluZy5jbGFzc0xpc3QuYWRkKCdvcHRpb25zQnV0dG9uJyk7XHJcbiAgcDFTaGFwZS5jbGFzc0xpc3QuYWRkKCdvcHRpb25zQnV0dG9uJyk7XHJcblxyXG4gIHN0YXJ0QnV0dG9uLmFwcGVuZENoaWxkKHN0YXJ0QnV0dG9uVGV4dCk7XHJcbiAgcDFCZWluZy5hcHBlbmRDaGlsZChwMUJlaW5nVGV4dCk7XHJcbiAgcDJCZWluZy5hcHBlbmRDaGlsZChwMkJlaW5nVGV4dCk7XHJcbiAgcDFTaGFwZS5hcHBlbmRDaGlsZChwMVNoYXBlVGV4dCk7XHJcblxyXG4gIGZyYWdtZW50LmFwcGVuZENoaWxkKHN0YXJ0QnV0dG9uKTtcclxuICBmcmFnbWVudC5hcHBlbmRDaGlsZChwMUJlaW5nKTtcclxuICBmcmFnbWVudC5hcHBlbmRDaGlsZChwMkJlaW5nKTtcclxuICBmcmFnbWVudC5hcHBlbmRDaGlsZChwMVNoYXBlKTtcclxuICBnYW1lQ2VudHJhbC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XHJcbn1cclxuXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5cclxuLy9SRU5ERVIgR0FNRSBCT0FSRFxyXG5mdW5jdGlvbiByZW5kZXJHYW1lQm9hcmQoKSB7XHJcbiAgdmFyIGdhbWVDZW50cmFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVDZW50cmFsJyk7XHJcbiAgdmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG5cclxuICB2YXIgcDFQaWVjZTtcclxuICB2YXIgcDJQaWVjZTtcclxuXHJcbiAgdmFyIGJvYXJkU3F1YXJlO1xyXG4gIHZhciBib2FyZFNxdWFyZVNoYXBlO1xyXG4gIHZhciBib2FyZFNxdWFyZUNvbnRlbnQ7XHJcblxyXG4gIGdhbWVEYXRhLnAxLnNoYXBlID09PSAnTm91Z2h0cycgPyAoXHJcbiAgICBwMVBpZWNlID0gJ08nLFxyXG4gICAgcDJQaWVjZSA9ICdYJ1xyXG4gICkgOiAoXHJcbiAgICBwMVBpZWNlID0gJ1gnLFxyXG4gICAgcDJQaWVjZSA9ICdPJ1xyXG4gICk7XHJcblxyXG4gIGdhbWVEYXRhLmJvYXJkLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaW5kZXgpIHtcclxuICAgIGJvYXJkU3F1YXJlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICBib2FyZFNxdWFyZS5pZCA9ICdzcXVhcmUnICsgaW5kZXg7XHJcblxyXG4gICAgaWYgKGVsZW1lbnQub3duZXIgPT09ICdub25lJykge1xyXG4gICAgICBib2FyZFNxdWFyZVNoYXBlID0gJyc7XHJcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQub3duZXIgPT09ICdwMScpIHtcclxuICAgICAgYm9hcmRTcXVhcmVTaGFwZSA9IHAxUGllY2U7XHJcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQub3duZXIgPT09ICdwMicpIHtcclxuICAgICAgYm9hcmRTcXVhcmVTaGFwZSA9IHAyUGllY2U7XHJcbiAgICB9XHJcblxyXG4gICAgYm9hcmRTcXVhcmUub25jbGljayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBodW1hblR1cm4oZWxlbWVudC5yb3csIGVsZW1lbnQuY29sKTtcclxuICAgIH1cclxuXHJcbiAgICBib2FyZFNxdWFyZS5jbGFzc0xpc3QuYWRkKCdib2FyZFNxdWFyZScpO1xyXG4gICAgYm9hcmRTcXVhcmVDb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYm9hcmRTcXVhcmVTaGFwZSk7XHJcbiAgICBib2FyZFNxdWFyZS5hcHBlbmRDaGlsZChib2FyZFNxdWFyZUNvbnRlbnQpO1xyXG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoYm9hcmRTcXVhcmUpO1xyXG4gIH0pO1xyXG5cclxuICBnYW1lQ2VudHJhbC5jbGFzc0xpc3QuYWRkKCdnYW1lQ2VudHJhbFBsYXlpbmcnKTtcclxuICBnYW1lQ2VudHJhbC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XHJcbn1cclxuXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5cclxuLy9SRU5ERVIgRU5EIEdBTUUgU0NSRUVOXHJcbmZ1bmN0aW9uIHJlbmRlckVuZEdhbWUoKSB7XHJcbiAgdmFyIGdhbWVDZW50cmFsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVDZW50cmFsJyk7XHJcbiAgdmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xyXG4gIHZhciBlbmRHYW1lTXNnQm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgdmFyIG1zZ1RleHQgPSAnJztcclxuICB2YXIgbXNnVGV4dE5vZGU7XHJcblxyXG4gIGlmIChnYW1lRGF0YS5wMS5oYXNXb24gPT09IHRydWUpIHtcclxuICAgIG1zZ1RleHQgPSAnUDEgV09OISc7XHJcbiAgfVxyXG5cclxuICBpZiAoZ2FtZURhdGEucDIuaGFzV29uID09PSB0cnVlKSB7XHJcbiAgICBtc2dUZXh0ID0gJ1AyIFdPTiEnO1xyXG4gIH1cclxuXHJcbiAgaWYgKGdhbWVEYXRhLnAxLmhhc1dvbiA9PT0gZmFsc2UgJiYgZ2FtZURhdGEucDIuaGFzV29uID09PSBmYWxzZSkge1xyXG4gICAgbXNnVGV4dCA9ICdEUkFXISc7XHJcbiAgfVxyXG4gIGdhbWVDZW50cmFsLmNsYXNzTGlzdC5hZGQoJ2dhbWVDZW50cmFsT3B0aW9ucycpO1xyXG4gIGVuZEdhbWVNc2dCb3guY2xhc3NMaXN0LmFkZCgnb3B0aW9uc0J1dHRvbicpO1xyXG4gIG1zZ1RleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobXNnVGV4dCk7XHJcbiAgZW5kR2FtZU1zZ0JveC5hcHBlbmRDaGlsZChtc2dUZXh0Tm9kZSk7XHJcbiAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoZW5kR2FtZU1zZ0JveCk7XHJcbiAgZ2FtZUNlbnRyYWwuYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xyXG59XHJcblxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuXHJcbi8vSEFORExFIFVTRVIgQ0xJQ0tJTkcgQSBCT0FSRCBTUVVBUkVcclxuZnVuY3Rpb24gaHVtYW5UdXJuKHIsYykge1xyXG4gIGlmIChnYW1lRGF0YVtnYW1lRGF0YS53aG9zZVR1cm5dLmJlaW5nID09PSAnSHVtYW4nICYmIGdhbWVEYXRhLmJvYXJkWyhyICogMykgKyBjXS5vd25lciA9PT0gJ25vbmUnKSB7XHJcblxyXG4gICAgZ2FtZURhdGEuYm9hcmRbKHIgKiAzKSArIGNdLm93bmVyID0gZ2FtZURhdGEud2hvc2VUdXJuO1xyXG4gICAgZ2FtZURhdGEud2hvc2VUdXJuID09PSAncDEnID8gZ2FtZURhdGEud2hvc2VUdXJuID0gJ3AyJyA6IGdhbWVEYXRhLndob3NlVHVybiA9ICdwMSc7XHJcbiAgICB1cGRhdGVTY3JlZW4oKTtcclxuICB9XHJcbn1cclxuXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5cclxuLy9DSEVDSyBJRiBHQU1FIEVOREVEXHJcbmZ1bmN0aW9uIGNoZWNrR2FtZUVuZGVkKCkge1xyXG4gIC8vQXZvaWQgbGluZXMgNTdrbSBsb25nXHJcbiAgdmFyIGxvd1JpZ2h0ID0gZ2FtZURhdGEuYm9hcmRbOF0ub3duZXI7XHJcbiAgdmFyIG1pZE1pZCA9IGdhbWVEYXRhLmJvYXJkWzRdLm93bmVyO1xyXG4gIHZhciB1cExlZnQgPSBnYW1lRGF0YS5ib2FyZFswXS5vd25lcjtcclxuICB2YXIgbG93TGVmdCA9IGdhbWVEYXRhLmJvYXJkWzZdLm93bmVyO1xyXG4gIHZhciB1cFJpZ2h0ID0gZ2FtZURhdGEuYm9hcmRbMl0ub3duZXI7XHJcbiAgLy9FdmFsdWF0ZSB0byB0cnVlIGlmIGFsbCAzIHNxdWFyZXMgb2YgYSBkaWFnb25hbCBzYW1lIG93bmVyXHJcbiAgdmFyIGRpYWdBID0gKGxvd1JpZ2h0ID09PSBtaWRNaWQgKSAmJiAodXBMZWZ0ID09PSBtaWRNaWQpICYmIChtaWRNaWQgIT09ICdub25lJyk7XHJcbiAgdmFyIGRpYWdCID0gKGxvd0xlZnQgPT09IG1pZE1pZCApICYmICh1cFJpZ2h0ID09PSBtaWRNaWQpICYmIChtaWRNaWQgIT09ICdub25lJyk7XHJcbiAgLy9JZiBhbiBlbGVtZW50IHJlYWNoZXMgMyBvciAtMyB0aGVuIGEgcGxheWVyIGhhcyB3b25cclxuICB2YXIgdXBEb3duTGVmdFJpZ2h0V2luID0gW1xyXG4gICAgMCwvL3RvcFxyXG4gICAgMCwvL21pZGRsZSByb3dcclxuICAgIDAsLy9ib3R0b20gcm93XHJcbiAgICAwLC8vbGVmdCBjb2xcclxuICAgIDAsLy9taWRsZSBjb2xcclxuICAgIDAvL3JpZ2h0IGNvbFxyXG4gIF07XHJcbiAgdmFyIGJvYXJkRmlsbGVkID0gZmFsc2U7XHJcblxyXG5cclxuICAvL0NoZWNrIGRpYWdvbmFsIHZpY3Rvcmllc1xyXG4gIGlmICggZGlhZ0EgfHwgZGlhZ0IgKSB7XHJcbiAgICBnYW1lRGF0YS5ib2FyZFs0XS5vd25lciA9PT0gJ3AxJyA/IGdhbWVEYXRhLnAxLmhhc1dvbiA9IHRydWUgOiBnYW1lRGF0YS5wMi5oYXNXb24gPSB0cnVlO1xyXG4gIH1cclxuICAvL0NoZWNrIGZvciB1cHB5ZG93bnlsZWZ0eXJpZ2h0eSB2aWN0b3JpZXNcclxuICBnYW1lRGF0YS5ib2FyZC5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIGlmIChlbGVtZW50Lm93bmVyID09PSAncDEnKSB7XHJcbiAgICAgIHVwRG93bkxlZnRSaWdodFdpbltlbGVtZW50LnJvd10rKztcclxuICAgICAgdXBEb3duTGVmdFJpZ2h0V2luW2VsZW1lbnQuY29sICsgM10rKztcclxuICAgIH0gZWxzZSBpZiAoZWxlbWVudC5vd25lciA9PT0gJ3AyJykge1xyXG4gICAgICB1cERvd25MZWZ0UmlnaHRXaW5bZWxlbWVudC5yb3ddLS07XHJcbiAgICAgIHVwRG93bkxlZnRSaWdodFdpbltlbGVtZW50LmNvbCArIDNdLS07XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHVwRG93bkxlZnRSaWdodFdpbi5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIGlmIChlbGVtZW50ID09PSAzKSB7XHJcbiAgICAgIGdhbWVEYXRhLnAxLmhhc1dvbiA9IHRydWU7XHJcbiAgICB9IGVsc2UgaWYgKGVsZW1lbnQgPT09IC0zKSB7XHJcbiAgICAgIGdhbWVEYXRhLnAyLmhhc1dvbiA9IHRydWU7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGlmIChnYW1lRGF0YS5wMS5oYXNXb24gPT09IHRydWUgfHwgZ2FtZURhdGEucDIuaGFzV29uID09PSB0cnVlKSB7XHJcbiAgICBnYW1lRGF0YS5jdXJyZW50U3RhZ2UgPSAyO1xyXG4gICAgZ2FtZURhdGEuZ2FtZUVuZGVkID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vQ2hlY2sgbm8gZW1wdHkgc3F1YXJlc1xyXG4gIGJvYXJkRmlsbGVkID0gZ2FtZURhdGEuYm9hcmQuZXZlcnkoZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgcmV0dXJuIGVsZW1lbnQub3duZXIgIT09ICdub25lJztcclxuICB9KTtcclxuXHJcbiAgaWYgKGJvYXJkRmlsbGVkKSB7XHJcbiAgICBnYW1lRGF0YS5jdXJyZW50U3RhZ2UgPSAyO1xyXG4gICAgZ2FtZURhdGEuZ2FtZUVuZGVkID0gdHJ1ZTtcclxuICB9XHJcbn1cclxuXHJcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5cclxuLy9UQUtFIEFJJ3MgVFVSTlxyXG5mdW5jdGlvbiBBSVR1cm4oKSB7XHJcbiAgLy93b3JrIG91dCB3aGVyZSB0aGUgaG9seSBibHVlIHNtZWcgYmFsbHMgdG8gcGxhY2UgcGllY2UqKipcclxuICB2YXIgaGFzTW92ZWQgPSBmYWxzZTtcclxuICB2YXIgZnJlZUNvcm5lciA9IFswLCAyLCA2LCA4XTtcclxuICB2YXIgZnJlZVNpZGUgPSBbMSwgMywgNSwgN107XHJcbiAgLy8xc3QgMyBlbGVtZW50cyBhcmUgc3F1YXJlcyBpbiBnYW1lRGF0YS5ib2FyZCwgNHRoIGVsZW1lbnQgaXMgY291bnRlclxyXG4gIC8vZm9yIGhvdyBjbG9zZSB0byB2aWN0b3J5IG9uIHRoYXQgbGluZSwgMyBmb3IgdGhpcyBwbGF5ZXIsIC0zIGZvciBvdGhlciBwbGF5ZXJcclxuICB2YXIgcG9zc2libGVXaW5zID0gW1xyXG4gICAgWzAsIDEsIDIsIDBdLFxyXG4gICAgWzMsIDQsIDUsIDBdLFxyXG4gICAgWzYsIDcsIDgsIDBdLFxyXG4gICAgWzAsIDMsIDYsIDBdLFxyXG4gICAgWzEsIDQsIDcsIDBdLFxyXG4gICAgWzIsIDUsIDgsIDBdLFxyXG4gICAgWzAsIDQsIDgsIDBdLFxyXG4gICAgWzIsIDQsIDYsIDBdXHJcbiAgXTtcclxuICAvLzR0aCBlbGVtZW50IGluIGEgc3ViIGFyciBvZiBwb3NzaWJsZVdpbnMgd2lsbCBlaXRoZXIgYmUgMiBvciAtMiBpZiBhIHdpbiBpcyBwb3NzaWJsZS5cclxuICAvL3RhcmdldCBpcyBlaXRoZXIgMiBvciAtMiBkZXBlbmRpbmcgb24gaWYgQUkgaXMgcDEgb3IgcDIuXHJcbiAgdmFyIHRhcmdldDtcclxuXHJcbiAgZ2FtZURhdGEud2hvc2VUdXJuID09PSAncDEnID8gdGFyZ2V0ID0gMiA6IHRhcmdldCA9IC0yO1xyXG5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc3NpYmxlV2lucy5sZW5ndGg7IGkrKykge1xyXG4gICAgZm9yIChsZXQgaiA9MDsgaiA8IHBvc3NpYmxlV2luc1tpXS5sZW5ndGggLSAxOyBqKyspIHtcclxuICAgICAgaWYgKGdhbWVEYXRhLmJvYXJkW3Bvc3NpYmxlV2luc1tpXVtqXV0ub3duZXIgPT09ICdwMScpIHtcclxuICAgICAgICBwb3NzaWJsZVdpbnNbaV1bM10rKztcclxuICAgICAgfSBlbHNlIGlmIChnYW1lRGF0YS5ib2FyZFtwb3NzaWJsZVdpbnNbaV1bal1dLm93bmVyID09PSAncDInKSB7XHJcbiAgICAgICAgcG9zc2libGVXaW5zW2ldWzNdLS07XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgLy93aW5cclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc3NpYmxlV2lucy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKHBvc3NpYmxlV2luc1tpXVszXSA9PT0gdGFyZ2V0KSB7XHJcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcG9zc2libGVXaW5zW2ldLmxlbmd0aCAtIDE7IGorKykge1xyXG4gICAgICAgIGlmIChnYW1lRGF0YS5ib2FyZFtwb3NzaWJsZVdpbnNbaV1bal1dLm93bmVyID09PSAnbm9uZScgJiYgaGFzTW92ZWQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICBnYW1lRGF0YS5ib2FyZFtwb3NzaWJsZVdpbnNbaV1bal1dLm93bmVyID0gZ2FtZURhdGEud2hvc2VUdXJuO1xyXG4gICAgICAgICAgaGFzTW92ZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICAvL2Jsb2NrIHdpblxyXG4gIGlmIChoYXNNb3ZlZCA9PT0gZmFsc2UpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zc2libGVXaW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAocG9zc2libGVXaW5zW2ldWzNdID09PSB0YXJnZXQgKiAtMSkge1xyXG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHBvc3NpYmxlV2luc1tpXS5sZW5ndGggLSAxOyBqKyspIHtcclxuICAgICAgICBpZiAoZ2FtZURhdGEuYm9hcmRbcG9zc2libGVXaW5zW2ldW2pdXS5vd25lciA9PT0gJ25vbmUnICYmIGhhc01vdmVkID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgZ2FtZURhdGEuYm9hcmRbcG9zc2libGVXaW5zW2ldW2pdXS5vd25lciA9IGdhbWVEYXRhLndob3NlVHVybjtcclxuICAgICAgICAgIGhhc01vdmVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuICAvL2ZvcmtcclxuICAvL1NlZW1zIHVuYmVhdGFibGUgd2l0aG91dCBhZGRpbmcgdGhpc1xyXG4gIC8vYmxvY2sgZm9ya1xyXG4gIC8vU2VlbXMgdW5iZWF0YWJsZSB3aXRob3V0IGFkZGluZyB0aGlzXHJcbiAgLy9jZW50ZXJcclxuICBpZiAoaGFzTW92ZWQgPT09IGZhbHNlICYmIGdhbWVEYXRhLmJvYXJkWzRdLm93bmVyID09PSAnbm9uZScpIHtcclxuICAgIGdhbWVEYXRhLmJvYXJkWzRdLm93bmVyID0gZ2FtZURhdGEud2hvc2VUdXJuO1xyXG4gICAgaGFzTW92ZWQgPSB0cnVlO1xyXG4gIH1cclxuICAvL29wcG9zaXRlIGNvcm5lclxyXG4gIC8vU2VlbXMgdW5iZWF0YWJsZSB3aXRob3V0IGFkZGluZyB0aGlzXHJcbiAgLy9lbXB0eSBjb3JuZXJcclxuICBpZiAoaGFzTW92ZWQgPT09IGZhbHNlKSB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZyZWVDb3JuZXIubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGdhbWVEYXRhLmJvYXJkW2ZyZWVDb3JuZXJbaV1dLm93bmVyID09PSAnbm9uZScpIHtcclxuICAgICAgICBnYW1lRGF0YS5ib2FyZFtmcmVlQ29ybmVyW2ldXS5vd25lciA9IGdhbWVEYXRhLndob3NlVHVybjtcclxuICAgICAgICBoYXNNb3ZlZCA9IHRydWU7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgLy9lbXB0eSBzaWRlXHJcbiAgaWYgKGhhc01vdmVkID09PSBmYWxzZSkge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmVlU2lkZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoZ2FtZURhdGEuYm9hcmRbZnJlZVNpZGVbaV1dLm93bmVyID09PSAnbm9uZScpIHtcclxuICAgICAgICBnYW1lRGF0YS5ib2FyZFtmcmVlU2lkZVtpXV0ub3duZXIgPSBnYW1lRGF0YS53aG9zZVR1cm47XHJcbiAgICAgICAgaGFzTW92ZWQgPSB0cnVlO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnYW1lRGF0YS53aG9zZVR1cm4gPT09ICdwMScgPyBnYW1lRGF0YS53aG9zZVR1cm4gPSAncDInIDogZ2FtZURhdGEud2hvc2VUdXJuID0gJ3AxJztcclxuICB1cGRhdGVTY3JlZW4oKTtcclxufVxyXG5cclxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgcmVzZXRHYW1lXHJcbn1cclxuIl19
