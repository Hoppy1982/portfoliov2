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
