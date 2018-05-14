// portfolio
// animation-mechanical-letters.js

//passed in via opts
let canvas;
let str;
//later expose to opts
const colorOne = '#d18017';
const colorTwo = '#8b8d91';
const colorThree = '#ffffff';//temp
const overallAnimationSpeed = 1;
const letterPadding = 7; // As a ratio of letterWidth & letterHeight
const letterLineWidthRatio = 8;
//calculated
let ctx;
let letterWidth;
let letterHeight;
let frameId;
let isPaused = false;
//animated objects
let mechLettersArr = [];
let letterLineWidth;

//------------------------------------------------------------exported functions
function init(opts) {
  cancelAnimation();
  clearArrays();
  canvas = document.getElementById(opts.canvas);
  str = opts.str;
  ctx = canvas.getContext('2d');
  letterWidth = Math.round(canvas.width / opts.str.length);
  letterHeight = canvas.height;
  letterLineWidth = Math.round(letterWidth / letterLineWidthRatio);
  mechLettersArr = initMechLettersArr(opts.str);
}

function animate() {
  isPaused = false;
  frameId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var nPaused = 0;
  for (let i = 0; i < mechLettersArr.length; i++) {
    mechLettersArr[i].animateLetter();
    mechLettersArr[i].draw();
    if (mechLettersArr[i].paused == true) {nPaused++;}
  }
  if (nPaused == mechLettersArr.length) {cancelAnimation();}
}

function cancelAnimation() {
  cancelAnimationFrame(frameId);
  isPaused = true;
}

function toggleRunAnimation() {
  isPaused === false ?( isPaused = true, cancelAnimation() ) : ( isPaused = false, animate()  );
  return isPaused;
}

//------------------------------------------------------------internal functions
function clearArrays() {
  mechLettersArr.length = 0;
}

function initMechLettersArr(str) {
  let arr = [];
  arr.length = 0;
  for (let i =0; i < str.length; i++) {
    switch (str[i]) {
      case 'h':
      arr.push( new LetterH(i * letterWidth) );
      break;
    }
  }
  return arr;
}

//constructor for prototype of base Letter object
function Letter() {
  this.nMovementsBeforePause = 1;
  this.individualAnimationSpeed = 1;
  this.speed = overallAnimationSpeed * this.individualAnimationSpeed;
  this.nMovements = 0;
  this.paused = false;
}
Letter.prototype.constructor = Letter;

Letter.prototype.calcEdges = function(offset) {
  let edges = {
    left: offset + (letterWidth / letterPadding),
    right: offset + letterWidth - (letterWidth / letterPadding),
    top: letterHeight / letterPadding,
    bottom: letterHeight - (letterHeight / letterPadding)
  };
  return edges;
}

//constructor for the letter 'H' objects
function LetterH(offset) {
  Letter.call(this);
  let edges = this.calcEdges(offset);
  //overwrite prototype properties if want different values from defaults
  this.nMovementsBeforePause = 3;
  //randomise animation direction
  if (Math.random() >= 0.5) {this.speed = -this.speed;}
  //vertex definitions
  this.leftVerticalP1 = { x: edges.left, y: edges.bottom };
  this.leftVerticalP2 = { x: edges.left, y: edges.top };
  this.leftVerticalP3 = { x: edges.left + letterLineWidth, y: edges.top };
  this.leftVerticalP4 = { x: edges.left + letterLineWidth, y: edges.bottom };

  this.rightVerticalP1 = { x: edges.right - letterLineWidth, y: edges.bottom };
  this.rightVerticalP2 = { x: edges.right - letterLineWidth, y: edges.top };
  this.rightVerticalP3 = { x: edges.right, y: edges.top };
  this.rightVerticalP4 = { x: edges.right, y: edges.bottom };

  this.horizontalP1 = { x: edges.left + letterLineWidth, y: (letterHeight / 2) - (letterLineWidth / 2) };
  this.horizontalP2 = { x: edges.left + letterLineWidth, y: (letterHeight / 2) + (letterLineWidth / 2) };
  this.horizontalP3 = { x: edges.right - letterLineWidth, y: (letterHeight / 2) + (letterLineWidth / 2) };
  this.horizontalP4 = { x: edges.right - letterLineWidth, y: (letterHeight / 2) - (letterLineWidth / 2) };
}
LetterH.prototype = Object.create(Letter.prototype);
LetterH.prototype.constructor = LetterH;

LetterH.prototype.draw = function() {
  ctx.beginPath();
  ctx.strokeStyle = colorOne;
  ctx.fillStyle = colorTwo;
  ctx.lineWidth = letterLineWidth / 4;
  //left vertical
  ctx.moveTo(this.leftVerticalP1.x, this.leftVerticalP1.y);
  ctx.lineTo(this.leftVerticalP2.x, this.leftVerticalP2.y);
  ctx.arc(this.leftVerticalP2.x + letterLineWidth / 2, this.leftVerticalP2.y, letterLineWidth / 2, Math.PI, 0, false);
  ctx.lineTo(this.leftVerticalP4.x, this.leftVerticalP4.y);
  ctx.arc(this.leftVerticalP2.x + letterLineWidth / 2, this.leftVerticalP1.y, letterLineWidth / 2, 0, Math.PI, false);
  //right vertical
  ctx.moveTo(this.rightVerticalP1.x, this.rightVerticalP1.y);
  ctx.lineTo(this.rightVerticalP2.x, this.rightVerticalP2.y);
  ctx.arc(this.rightVerticalP2.x + letterLineWidth / 2, this.rightVerticalP2.y, letterLineWidth / 2, Math.PI, 0, false);
  ctx.lineTo(this.rightVerticalP4.x, this.rightVerticalP4.y);
  ctx.arc(this.rightVerticalP2.x + letterLineWidth / 2, this.rightVerticalP1.y, letterLineWidth / 2, 0, Math.PI, false);
  //horizontal
  ctx.moveTo(this.horizontalP1.x, this.horizontalP1.y);
  ctx.lineTo(this.horizontalP2.x, this.horizontalP2.y);
  ctx.lineTo(this.horizontalP3.x, this.horizontalP3.y);
  ctx.lineTo(this.horizontalP4.x, this.horizontalP4.y);
  ctx.lineTo(this.horizontalP1.x, this.horizontalP1.y);
  //color eerything in
  ctx.fill();
  ctx.stroke();
}

LetterH.prototype.animateLetter = function() {
  if ( this.nMovements >= this.nMovementsBeforePause && Math.round(this.horizontalP1.y) == Math.round(letterHeight / 2 - letterLineWidth / 2) ) {
    this.paused = true;
    this.nMovements = 0;
  }
  if (this.horizontalP2.y > letterHeight - letterHeight / letterPadding || this.horizontalP1.y < letterHeight / letterPadding) {
    this.speed = -this.speed;
    this.nMovements++;
  }
  if (this.paused == false ) {
    this.horizontalP1.y += this.speed;
    this.horizontalP2.y += this.speed;
    this.horizontalP3.y += this.speed;
    this.horizontalP4.y += this.speed;
  }
};

//-----------------------------------------------------------------------exports
exports.init = init;
exports.animate = animate;
exports.cancelAnimation = cancelAnimation;
exports.toggleRunAnimation = toggleRunAnimation;
