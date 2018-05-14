(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// portfolio
// animation-bouncing-colored-dots.js

//passed in via opts
let canvas;
let nCircles;
let radius;
let areaOfEffect;
//later expose to opts
let defaultCircleColor = [255, 255, 255];
let targetCircleColor1 = [255, 0, 0];
let targetCircleColor2 = [0, 255, 0];
let targetCircleColor3 = [0, 0, 255];
//calculated
let ctx;
let canvasWidth;
let canvasHeight;
let frameId;
let isPaused = false;
//animated objects
let circlesArr = [];
let targetCirclesArr = [];

//------------------------------------------------------------exported functions
function init(opts) {
  cancelAnimation();
  clearArrays();
  canvas = document.getElementById(opts.canvas);
  nCircles = opts.nCircles;
  radius = opts.radius;
  areaOfEffect = opts.areaOfEffect;
  ctx = canvas.getContext('2d');
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
  initCircleArr();
  initTargetCirclesArr();
}

function animate() {
  isPaused = false;
  frameId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  for (let i = 0; i < circlesArr.length; i++) {
    circlesArr[i].updatePos();
    circlesArr[i].updateColor();
    circlesArr[i].draw();
  }
  for (let i = 0; i < targetCirclesArr.length; i++) {
    targetCirclesArr[i].draw();
    targetCirclesArr[i].updatePos();
  }
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
  circlesArr.length = 0;
  targetCirclesArr.length = 0;
}

function initCircleArr() {
  for (let i = 0; i < nCircles; i++) {
    let x = Math.random() * (canvasWidth - radius * 2) + radius;
    let y = Math.random() * (canvasHeight - radius * 2) + radius;
    let dx = (Math.random() - 0.5) * 6;
    let dy = (Math.random() - 0.5) * 6;
    circlesArr.push( new Circle(x, y, dx, dy, radius, defaultCircleColor.slice() ) );
  }
}

function initTargetCirclesArr() {
  targetCirclesArr.push( new Circle(50, 75, 2, 3, 12, targetCircleColor1) );
  targetCirclesArr.push( new Circle(90, 40, 3, -2, 12, targetCircleColor2) );
  targetCirclesArr.push( new Circle(120, 105, -2, -3, 12, targetCircleColor3) );
}

//constructor for Circle objects
function Circle(x, y, dx, dy, radius, colorArr) {
  this.x = x;
  this.y = y;
  this.dx = dx;
  this.dy = dy;
  this.radius = radius;
  this.colorArr = colorArr;
  this.color = 'rgb(' + this.colorArr[0] + ', ' + this.colorArr[1] + ', ' + this.colorArr[2] + ')';
}
Circle.prototype.constructor = Circle;

Circle.prototype.draw = function() {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = this.color;
  ctx.fill();
}

Circle.prototype.updatePos = function() {
  if (this.x + radius > canvasWidth || this.x - radius < 0) {this.dx = -this.dx};
  if (this.y + radius > canvasHeight || this.y - radius < 0) {this.dy = -this.dy};
  this.x += this.dx;
  this.y += this.dy;
}

Circle.prototype.updateColor= function() {
  var nEffectedBy = 0;
  for (let i = 0; i < targetCirclesArr.length; i++) {
    let distanceBetween = Math.sqrt( Math.pow( (this.x - targetCirclesArr[i].x), 2) + Math.pow( (this.y - targetCirclesArr[i].y), 2) );
    if (distanceBetween < areaOfEffect) {
      if (nEffectedBy == 0) {
        this.colorArr[0] = targetCirclesArr[i].colorArr[0];
        this.colorArr[1] = targetCirclesArr[i].colorArr[1];
        this.colorArr[2] = targetCirclesArr[i].colorArr[2];
      } else {
        this.colorArr[0] = Math.round( (this.colorArr[0] + targetCirclesArr[i].colorArr[0]) / nEffectedBy );
        this.colorArr[1] = Math.round( (this.colorArr[1] + targetCirclesArr[i].colorArr[1]) / nEffectedBy );
        this.colorArr[2] = Math.round( (this.colorArr[2] + targetCirclesArr[i].colorArr[2]) / nEffectedBy );
      }
      nEffectedBy++;
    }
  }
  if (nEffectedBy == 0) {
    this.colorArr = defaultCircleColor.slice();
  }
  this.color = 'rgb(' + this.colorArr[0] + ', ' + this.colorArr[1] + ', ' + this.colorArr[2] + ')';
}

//-----------------------------------------------------------------------exports
exports.init = init;
exports.animate = animate;
exports.cancelAnimation = cancelAnimation;
exports.toggleRunAnimation = toggleRunAnimation;

},{}],2:[function(require,module,exports){
// portfolio
// animation-lozenge-spirrograph.js

const animationUtils = require('./animation-utils');

//state
let canvas;
let ctx;
let frameId;
let isPaused;
let lozengeRadius;
let lozengeLineWidth;
let speed;
let strokeColor = '#16305b';
let fillColor = 'transparent';
//animated objects
let movingLozenges = [];

//------------------------------------------------------------exported functions
function init(opts) {
  canvas = document.getElementById(opts.canvas);
  ctx = canvas.getContext('2d');
  cancelAnimation();
  movingLozenges.length = 0;
  isPaused = false;
  lozengeRadius = Math.round(canvas.width / 20);
  lozengeLineWidth = Math.round(canvas.width / 40);
  speed = Math.round(canvas.width / 400);
  movingLozengesInit()
}

function animate() {
  isPaused = false;
  frameId = requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  movingLozenges.forEach(function(element) {
    element.updatePos();
    element.draw();
  });
  ctx.beginPath();
  ctx.lineWidth = lozengeLineWidth;
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;
  animationUtils.drawLozenge(ctx, movingLozenges[0].x1, movingLozenges[0].y1, movingLozenges[1].x1, movingLozenges[1].y1, lozengeRadius);
  animationUtils.drawLozenge(ctx, movingLozenges[0].x2, movingLozenges[0].y2, movingLozenges[1].x2, movingLozenges[1].y2, lozengeRadius);
  animationUtils.drawLozenge(ctx, movingLozenges[2].x1, movingLozenges[2].y1, movingLozenges[3].x1, movingLozenges[3].y1, lozengeRadius);
  animationUtils.drawLozenge(ctx, movingLozenges[2].x2, movingLozenges[2].y2, movingLozenges[3].x2, movingLozenges[3].y2, lozengeRadius);
  ctx.stroke();
  ctx.fill();
}

function cancelAnimation() {
  cancelAnimationFrame(frameId);
  isPaused = true;
}

function reverseDX() {
  console.log('reverseDX');
  movingLozenges.forEach(function(element) {
    element.dx1 = -element.dx1;
    element.dx2 = -element.dx2;
  });
}

function reverseDY() {
  movingLozenges.forEach(function(element) {
    element.dy1 = -element.dy1;
    element.dy2 = -element.dy2;
  });
}

function switchXY() {
  movingLozenges.forEach(function(element){
    let x1 = element.x1;
    let y1 = element.y1;
    let x2 = element.x2;
    let y2 = element.y2;
    let dx1 = element.dx1;
    let dy1 = element.dy1;
    let dx2 = element.dx2;
    let dy2 = element.dy2;
    element.x1 = y1;
    element.y1 = x1;
    element.x2 = y2;
    element.y2 = x2;
    element.dx1 = dy1;
    element.dy1 = dx1;
    element.dx2 = dy2;
    element.dy2 = dx2;
  });
}

//------------------------------------------------------------internal functions
//movingLozenges initialiser
function movingLozengesInit() {
  movingLozenges.push( new MovingLozenge(lozengeRadius, canvas.height / 2, canvas.width / 2, canvas.height - lozengeRadius, speed, -speed, speed, -speed) );
  movingLozenges.push( new MovingLozenge(canvas.width -lozengeRadius, canvas.height / 2, canvas.width / 2, canvas.height - lozengeRadius, -speed, -speed, -speed, -speed) );
  movingLozenges.push( new MovingLozenge(lozengeRadius, canvas.height / 2, canvas.width / 2, lozengeRadius, speed, speed, speed, speed) );
  movingLozenges.push( new MovingLozenge(canvas.width - lozengeRadius, canvas.height / 2, canvas.width / 2, lozengeRadius, -speed, speed, -speed, speed) );
}

//constructor for MovingLozenge
function MovingLozenge(x1, y1, x2, y2, dx1, dy1, dx2, dy2) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
  this.dx1 = dx1;
  this.dy1 = dy1;
  this.dx2 = dx2;
  this.dy2 = dy2;
}
MovingLozenge.prototype.constructor = MovingLozenge;

MovingLozenge.prototype.updatePos = function() {
  if (this.x1 + lozengeRadius > canvas.width || this.x1 - lozengeRadius < 0) {this.dx1 = -this.dx1};
  if (this.y1 + lozengeRadius > canvas.height || this.y1 - lozengeRadius < 0) {this.dy1 = -this.dy1};
  if (this.x2 + lozengeRadius > canvas.width || this.x2 - lozengeRadius < 0) {this.dx2 = -this.dx2};
  if (this.y2 + lozengeRadius > canvas.height || this.y2 - lozengeRadius < 0) {this.dy2 = -this.dy2};
  this.x1 += this.dx1;
  this.y1 += this.dy1;
  this.x2 += this.dx2;
  this.y2 += this.dy2;
}

MovingLozenge.prototype.draw = function() {
  ctx.beginPath();
  ctx.lineWidth = lozengeLineWidth;
  ctx.strokeStyle = strokeColor;
  ctx.fillStyle = fillColor;
  animationUtils.drawLozenge(ctx, this.x1, this.y1, this.x2, this.y2, lozengeRadius);
  ctx.stroke();
  ctx.fill();
}

//-----------------------------------------------------------------------exports
exports.init =init;
exports.animate = animate;
exports.cancelAnimation = cancelAnimation;
//temp
exports.reverseDX = reverseDX;
exports.reverseDY = reverseDY;
exports.switchXY = switchXY;

},{"./animation-utils":5}],3:[function(require,module,exports){
// portfolio
// animation-lozenge-tester.js

const animationUtils = require('./animation-utils');

//state
let canvas;
let ctx;

//------------------------------------------------------------exported functions
function init(opts) {
  canvas = document.getElementById(opts.canvas);
  ctx = canvas.getContext('2d');
  let x1 = opts.x1;
  let y1 = opts.y1;
  let x2 = opts.x2;
  let y2 = opts.y2;
  ctx.clearRect(0, 0, 400, 400);
  ctx.beginPath();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#000000';
  ctx.fillStyle = 'transparent';
  animationUtils.drawLozenge(ctx, x1, y1, x2, y2, 20);
  ctx.stroke();
  ctx.fill();
}
//------------------------------------------------------------internal functions

//-----------------------------------------------------------------------exports
exports.init = init;

},{"./animation-utils":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
// portfolio
// animation-utils.js

//to wrtite
function randomColorInRange(redLow, redUp, greenLow, greenUp, blueLow, blueUp) {

}

function randomColors(num) {
  var chars = '0123456789ABCDEF';
  var hex;
  var colors = [];
  for (let i = 0; i < num; i++) {
    hex = '#';
    for (let j = 0; j < 6; j++) {
      hex += chars[Math.floor(Math.random() * 16)];
    }
    colors.push(hex);
  }
  return colors;
}

function drawLozenge(ctx, x1, y1, x2, y2, radius) {
  let tangentAngle = Math.atan( (y2 - y1) / (x2 - x1) );
  let preCalcDx = (Math.sin(tangentAngle) * radius);
  let preCalcDy = (Math.cos(tangentAngle) * radius);
  let corner1 = { x: x1 + preCalcDx, y: y1 - preCalcDy };
  let corner2 = { x: x1 - preCalcDx, y: y1 + preCalcDy };
  let corner3 = { x: x2 - preCalcDx, y: y2 + preCalcDy };
  let corner4 = { x: x2 + preCalcDx, y: y2 - preCalcDy };
  let apex1 = { x: x1 - preCalcDy, y: y1 - preCalcDx };
  let apex2 = { x: x2 + preCalcDy, y: y2 + preCalcDx };
  let extCorner1 = { x: corner1.x + preCalcDy, y: corner1.y + preCalcDx };
  let extCorner2 = { x: corner2.x + preCalcDy, y: corner2.y + preCalcDx };
  let extCorner3 = { x: corner3.x - preCalcDy, y: corner3.y - preCalcDx };
  let extCorner4 = { x: corner4.x - preCalcDy, y: corner4.y - preCalcDx };
  if (x1 > x2) {
    apex1 = { x: x1 + preCalcDy, y: y1 + preCalcDx };
    apex2 = { x: x2 - preCalcDy, y: y2 - preCalcDx };
  }
  if (x1 <= x2) {
    extCorner1 = { x: corner1.x - preCalcDy, y: corner1.y - preCalcDx };
    extCorner2 = { x: corner2.x - preCalcDy, y: corner2.y - preCalcDx };
    extCorner3 = { x: corner3.x + preCalcDy, y: corner3.y + preCalcDx };
    extCorner4 = { x: corner4.x + preCalcDy, y: corner4.y + preCalcDx };
  }

  ctx.moveTo(corner2.x, corner2.y);
  ctx.lineTo(corner3.x, corner3.y);
  ctx.arcTo(extCorner3.x, extCorner3.y, apex2.x, apex2.y, radius);
  ctx.arcTo(extCorner4.x, extCorner4.y, corner4.x, corner4.y, radius);
  ctx.lineTo(corner1.x, corner1.y);
  ctx.arcTo(extCorner1.x, extCorner1.y, apex1.x, apex1.y, radius);
  ctx.arcTo(extCorner2.x, extCorner2.y, corner2.x, corner2.y, radius);

/*debugging stuff, leave commented out*/
/*
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#0000ff';
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ff00ff';
  ctx.moveTo(apex1.x, apex1.y);
  ctx.lineTo(apex2.x, apex2.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ff0000';
  ctx.moveTo(corner1.x, corner1.y);
  ctx.lineTo(corner2.x, corner2.y);
  ctx.lineTo(corner3.x, corner3.y);
  ctx.lineTo(corner4.x, corner4.y);
  ctx.lineTo(corner1.x, corner1.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#00ff00';
  ctx.moveTo(extCorner1.x, extCorner1.y);
  ctx.lineTo(extCorner2.x, extCorner2.y);
  ctx.lineTo(extCorner3.x, extCorner3.y);
  ctx.lineTo(extCorner4.x, extCorner4.y);
  ctx.lineTo(extCorner1.x, extCorner1.y);
  ctx.stroke();
  */
  /*end of debugging stuff*/
}

//-----------------------------------------------------------------------exports
exports.randomColors = randomColors;
exports.drawLozenge = drawLozenge;

},{}],6:[function(require,module,exports){
// portfolio
// widgetrons.js

// File description:
// Script file linked to widgetrons.pug

const bouncingColoredDots = require('./utils/animation-bouncing-colored-dots');
const mechanicalLetters = require('./utils/animation-mechanical-letters');
const lozengeTester = require('./utils/animation-lozenge-tester');
const lozengeSpirrograph = require('./utils/animation-lozenge-spirrograph');
//const mechanicalLetters2 = require('./utils/animation-mechanical-letters-2');

let selectedAnimationsIndex = 0;
let animations = [
  {
    text: 'Bouncing Colored Dots',
    module: bouncingColoredDots,
    parentElementId: 'bouncingColoredDots',
    pauseButt: 'BCDTogglePause',
    reRunButt: 'BCDReRun',
    nCirclesInput: 'BCDInputNCircles',
    radiusInput: 'BCDInputRadius',
    areaOfEffectInput: 'BCDInputAoE',
    opts: {
      canvas: 'BCDCanvas',
      nCircles: 200,
      radius: 2,
      areaOfEffect: 80
    }
  },
  {
    text: 'Mechancial Letters',
    module: mechanicalLetters,
    parentElementId: 'mechanicalLetters',
    pauseButt: 'MLTogglePause',
    reRunButt: 'MLReRun',
    opts: {
      canvas: 'MLCanvas',
      str: 'hhhh'
    }
  },
  {
    text: 'Lozenge Tester',
    module: lozengeTester,
    parentElementId: 'lozengeTester',
    x1Slider: 'LTx1',
    y1Slider: 'LTy1',
    x2Slider: 'LTx2',
    y2Slider: 'LTy2',
    opts: {
      canvas: 'LTCanvas',
      x1: 200,
      y1: 200,
      x2: 250,
      y2: 250
    }
  },
  {
    text: 'Lozenge Spirrograph',
    module: lozengeSpirrograph,
    parentElementId: 'lozengeSpirrograph',
    reverseDXButt: 'LSReverseDXButt',
    reverseDYButt: 'LSReverseDYButt',
    switchXYButt: 'LSSwitchXYButt',
    opts: {
      canvas: 'LSCanvas'
    }
  }
];

//initialise after DOM loaded
document.addEventListener('DOMContentLoaded', function(event) {
  initAnimationPicker();
  bouncingColoredDots.init(animations[0]['opts']);
  addBCDEventListenerPause();
  addBCDEventListenerReRun();
  mechanicalLetters.init(animations[1]['opts']);
  addMLEventListenerPause();
  addMLEventListenerReRun();
  lozengeTester.init(animations[2]['opts']);
  addLTEventListenerX1Slider();
  addLTEventListenerY1Slider();
  addLTEventListenerX2Slider();
  addLTEventListenerY2Slider();
  lozengeSpirrograph.init(animations[3]['opts']);
  lozengeSpirrograph.animate();
  addLSEventListenerReverseDX();
  addLSEventListenerReverseDY();
  addLSEventListenerSwitchXY();
  startSelectedAnimation();
});

//-----------------------------------------------------animation picker controls
function initAnimationPicker() {
  document.getElementById('selectedAnimation').innerHTML = animations[selectedAnimationsIndex].text;
  document.getElementById('prevAnimation').addEventListener('click', selectAnimation('dec'));
  document.getElementById('nextAnimation').addEventListener('click', selectAnimation('inc'));
}

function selectAnimation(incOrDec) {
  return function() {
    if (incOrDec === 'dec') {selectedAnimationsIndex--;}
    if (incOrDec === 'inc') {selectedAnimationsIndex++;}
    if (selectedAnimationsIndex === -1) {selectedAnimationsIndex = animations.length - 1;}
    if (selectedAnimationsIndex === animations.length) { selectedAnimationsIndex = 0;}
    document.getElementById('selectedAnimation').innerHTML = animations[selectedAnimationsIndex].text;
    cancelAllAnimations();
    startSelectedAnimation();
  }
}

//-------------------------------------------generic & common animation controls
function cancelAllAnimations() {
  for (let i = 0; i < animations.length; i++) {
    if( animations[i].hasOwnProperty('pauseButt') ) {
      animations[i]['module'].cancelAnimation();
    }
    document.getElementById(animations[i]['parentElementId']).style.display = 'none';
  }
}

function startSelectedAnimation() {
  document.getElementById(animations[selectedAnimationsIndex]['parentElementId']).style.display = 'flex';
  if ( animations[selectedAnimationsIndex].hasOwnProperty('pauseButt') ) {
      animations[selectedAnimationsIndex]['module'].animate();
      stylePauseButt(animations[selectedAnimationsIndex]['pauseButt'], false);
  }
}

function stylePauseButt(pauseButt, isPaused) {
  if (isPaused === true) {
    document.getElementById(pauseButt).classList.remove('animationControlUnpaused');
    document.getElementById(pauseButt).classList.add('animationControlPaused');
  }
  if (isPaused === false) {
    document.getElementById(pauseButt).classList.remove('animationControlPaused');
    document.getElementById(pauseButt).classList.add('animationControlUnpaused');
  }
}

//-------------------------------------------------individual animation controls
//bouncing colored dots
function addBCDEventListenerPause() {
  document.getElementById(animations[0]['pauseButt']).addEventListener('click', function(event) {
    let isPaused = bouncingColoredDots.toggleRunAnimation();
    stylePauseButt(animations[0]['pauseButt'], isPaused);
  });
}

function addBCDEventListenerReRun() {
  document.getElementById(animations[0]['reRunButt']).addEventListener('click', function(event) {
    animations[0]['opts'].nCircles = parseInt(document.getElementById(animations[0]['nCirclesInput']).value);
    animations[0]['opts'].radius = parseInt(document.getElementById(animations[0]['radiusInput']).value);
    animations[0]['opts'].areaOfEffect = parseInt(document.getElementById(animations[0]['areaOfEffectInput']).value);
    bouncingColoredDots.init(animations[0]['opts']);
    bouncingColoredDots.animate();
    stylePauseButt(animations[0]['pauseButt'], false);
  });
}

//mechanical letters
function addMLEventListenerPause() {
  document.getElementById(animations[1]['pauseButt']).addEventListener('click', function(event) {
    let isPaused = mechanicalLetters.toggleRunAnimation();
    stylePauseButt(animations[1]['pauseButt'], isPaused);
  });
}

function addMLEventListenerReRun() {
  document.getElementById(animations[1]['reRunButt']).addEventListener('click', function(event) {
    mechanicalLetters.init(animations[1]['opts']);
    mechanicalLetters.animate();
    stylePauseButt(animations[1]['pauseButt'], false);
  });
}

//lozenge tester
function addLTEventListenerX1Slider() {
  let x1SliderElement = document.getElementById(animations[2]['x1Slider']);
  x1SliderElement.addEventListener('input', function(event) {
    animations[2]['opts'].x1 = parseInt(x1SliderElement.value);
    lozengeTester.init(animations[2]['opts']);
  });
}

function addLTEventListenerY1Slider() {
  let y1SliderElement = document.getElementById(animations[2]['y1Slider']);
  y1SliderElement.addEventListener('input', function(event) {
    animations[2]['opts'].y1 = parseInt(y1SliderElement.value);
    lozengeTester.init(animations[2]['opts']);
  });
}

function addLTEventListenerX2Slider() {
  let x2SliderElement = document.getElementById(animations[2]['x2Slider']);
  x2SliderElement.addEventListener('input', function(event) {
    animations[2]['opts'].x2 = parseInt(x2SliderElement.value);
    lozengeTester.init(animations[2]['opts']);
  });
}

function addLTEventListenerY2Slider() {
  let y2SliderElement = document.getElementById(animations[2]['y2Slider']);
  y2SliderElement.addEventListener('input', function(event) {
    animations[2]['opts'].y2 = parseInt(y2SliderElement.value);
    lozengeTester.init(animations[2]['opts']);
  });
}

//lozenge Spirrograph
function addLSEventListenerReverseDX() {
  document.getElementById(animations[3]['reverseDXButt']).addEventListener('click', lozengeSpirrograph.reverseDX);
}

function addLSEventListenerReverseDY() {
  document.getElementById(animations[3]['reverseDYButt']).addEventListener('click', lozengeSpirrograph.reverseDY);
}

function addLSEventListenerSwitchXY() {
  document.getElementById(animations[3]['switchXYButt']).addEventListener('click', lozengeSpirrograph.switchXY);
}

},{"./utils/animation-bouncing-colored-dots":1,"./utils/animation-lozenge-spirrograph":2,"./utils/animation-lozenge-tester":3,"./utils/animation-mechanical-letters":4}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9hbmltYXRpb24tYm91bmNpbmctY29sb3JlZC1kb3RzLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvYW5pbWF0aW9uLWxvemVuZ2Utc3BpcnJvZ3JhcGguanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9hbmltYXRpb24tbG96ZW5nZS10ZXN0ZXIuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9hbmltYXRpb24tbWVjaGFuaWNhbC1sZXR0ZXJzLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvYW5pbWF0aW9uLXV0aWxzLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvd2lkZ2V0cm9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBwb3J0Zm9saW9cclxuLy8gYW5pbWF0aW9uLWJvdW5jaW5nLWNvbG9yZWQtZG90cy5qc1xyXG5cclxuLy9wYXNzZWQgaW4gdmlhIG9wdHNcclxubGV0IGNhbnZhcztcclxubGV0IG5DaXJjbGVzO1xyXG5sZXQgcmFkaXVzO1xyXG5sZXQgYXJlYU9mRWZmZWN0O1xyXG4vL2xhdGVyIGV4cG9zZSB0byBvcHRzXHJcbmxldCBkZWZhdWx0Q2lyY2xlQ29sb3IgPSBbMjU1LCAyNTUsIDI1NV07XHJcbmxldCB0YXJnZXRDaXJjbGVDb2xvcjEgPSBbMjU1LCAwLCAwXTtcclxubGV0IHRhcmdldENpcmNsZUNvbG9yMiA9IFswLCAyNTUsIDBdO1xyXG5sZXQgdGFyZ2V0Q2lyY2xlQ29sb3IzID0gWzAsIDAsIDI1NV07XHJcbi8vY2FsY3VsYXRlZFxyXG5sZXQgY3R4O1xyXG5sZXQgY2FudmFzV2lkdGg7XHJcbmxldCBjYW52YXNIZWlnaHQ7XHJcbmxldCBmcmFtZUlkO1xyXG5sZXQgaXNQYXVzZWQgPSBmYWxzZTtcclxuLy9hbmltYXRlZCBvYmplY3RzXHJcbmxldCBjaXJjbGVzQXJyID0gW107XHJcbmxldCB0YXJnZXRDaXJjbGVzQXJyID0gW107XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLWV4cG9ydGVkIGZ1bmN0aW9uc1xyXG5mdW5jdGlvbiBpbml0KG9wdHMpIHtcclxuICBjYW5jZWxBbmltYXRpb24oKTtcclxuICBjbGVhckFycmF5cygpO1xyXG4gIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG9wdHMuY2FudmFzKTtcclxuICBuQ2lyY2xlcyA9IG9wdHMubkNpcmNsZXM7XHJcbiAgcmFkaXVzID0gb3B0cy5yYWRpdXM7XHJcbiAgYXJlYU9mRWZmZWN0ID0gb3B0cy5hcmVhT2ZFZmZlY3Q7XHJcbiAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgY2FudmFzV2lkdGggPSBjYW52YXMud2lkdGg7XHJcbiAgY2FudmFzSGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcclxuICBpbml0Q2lyY2xlQXJyKCk7XHJcbiAgaW5pdFRhcmdldENpcmNsZXNBcnIoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcclxuICBpc1BhdXNlZCA9IGZhbHNlO1xyXG4gIGZyYW1lSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XHJcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGNpcmNsZXNBcnIubGVuZ3RoOyBpKyspIHtcclxuICAgIGNpcmNsZXNBcnJbaV0udXBkYXRlUG9zKCk7XHJcbiAgICBjaXJjbGVzQXJyW2ldLnVwZGF0ZUNvbG9yKCk7XHJcbiAgICBjaXJjbGVzQXJyW2ldLmRyYXcoKTtcclxuICB9XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0YXJnZXRDaXJjbGVzQXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB0YXJnZXRDaXJjbGVzQXJyW2ldLmRyYXcoKTtcclxuICAgIHRhcmdldENpcmNsZXNBcnJbaV0udXBkYXRlUG9zKCk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjYW5jZWxBbmltYXRpb24oKSB7XHJcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVJZCk7XHJcbiAgaXNQYXVzZWQgPSB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0b2dnbGVSdW5BbmltYXRpb24oKSB7XHJcbiAgaXNQYXVzZWQgPT09IGZhbHNlID8oIGlzUGF1c2VkID0gdHJ1ZSwgY2FuY2VsQW5pbWF0aW9uKCkgKSA6ICggaXNQYXVzZWQgPSBmYWxzZSwgYW5pbWF0ZSgpICApO1xyXG4gIHJldHVybiBpc1BhdXNlZDtcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1pbnRlcm5hbCBmdW5jdGlvbnNcclxuZnVuY3Rpb24gY2xlYXJBcnJheXMoKSB7XHJcbiAgY2lyY2xlc0Fyci5sZW5ndGggPSAwO1xyXG4gIHRhcmdldENpcmNsZXNBcnIubGVuZ3RoID0gMDtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdENpcmNsZUFycigpIHtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IG5DaXJjbGVzOyBpKyspIHtcclxuICAgIGxldCB4ID0gTWF0aC5yYW5kb20oKSAqIChjYW52YXNXaWR0aCAtIHJhZGl1cyAqIDIpICsgcmFkaXVzO1xyXG4gICAgbGV0IHkgPSBNYXRoLnJhbmRvbSgpICogKGNhbnZhc0hlaWdodCAtIHJhZGl1cyAqIDIpICsgcmFkaXVzO1xyXG4gICAgbGV0IGR4ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpICogNjtcclxuICAgIGxldCBkeSA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDY7XHJcbiAgICBjaXJjbGVzQXJyLnB1c2goIG5ldyBDaXJjbGUoeCwgeSwgZHgsIGR5LCByYWRpdXMsIGRlZmF1bHRDaXJjbGVDb2xvci5zbGljZSgpICkgKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRUYXJnZXRDaXJjbGVzQXJyKCkge1xyXG4gIHRhcmdldENpcmNsZXNBcnIucHVzaCggbmV3IENpcmNsZSg1MCwgNzUsIDIsIDMsIDEyLCB0YXJnZXRDaXJjbGVDb2xvcjEpICk7XHJcbiAgdGFyZ2V0Q2lyY2xlc0Fyci5wdXNoKCBuZXcgQ2lyY2xlKDkwLCA0MCwgMywgLTIsIDEyLCB0YXJnZXRDaXJjbGVDb2xvcjIpICk7XHJcbiAgdGFyZ2V0Q2lyY2xlc0Fyci5wdXNoKCBuZXcgQ2lyY2xlKDEyMCwgMTA1LCAtMiwgLTMsIDEyLCB0YXJnZXRDaXJjbGVDb2xvcjMpICk7XHJcbn1cclxuXHJcbi8vY29uc3RydWN0b3IgZm9yIENpcmNsZSBvYmplY3RzXHJcbmZ1bmN0aW9uIENpcmNsZSh4LCB5LCBkeCwgZHksIHJhZGl1cywgY29sb3JBcnIpIHtcclxuICB0aGlzLnggPSB4O1xyXG4gIHRoaXMueSA9IHk7XHJcbiAgdGhpcy5keCA9IGR4O1xyXG4gIHRoaXMuZHkgPSBkeTtcclxuICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICB0aGlzLmNvbG9yQXJyID0gY29sb3JBcnI7XHJcbiAgdGhpcy5jb2xvciA9ICdyZ2IoJyArIHRoaXMuY29sb3JBcnJbMF0gKyAnLCAnICsgdGhpcy5jb2xvckFyclsxXSArICcsICcgKyB0aGlzLmNvbG9yQXJyWzJdICsgJyknO1xyXG59XHJcbkNpcmNsZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDaXJjbGU7XHJcblxyXG5DaXJjbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4LmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy5yYWRpdXMsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XHJcbiAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XHJcbiAgY3R4LmZpbGwoKTtcclxufVxyXG5cclxuQ2lyY2xlLnByb3RvdHlwZS51cGRhdGVQb3MgPSBmdW5jdGlvbigpIHtcclxuICBpZiAodGhpcy54ICsgcmFkaXVzID4gY2FudmFzV2lkdGggfHwgdGhpcy54IC0gcmFkaXVzIDwgMCkge3RoaXMuZHggPSAtdGhpcy5keH07XHJcbiAgaWYgKHRoaXMueSArIHJhZGl1cyA+IGNhbnZhc0hlaWdodCB8fCB0aGlzLnkgLSByYWRpdXMgPCAwKSB7dGhpcy5keSA9IC10aGlzLmR5fTtcclxuICB0aGlzLnggKz0gdGhpcy5keDtcclxuICB0aGlzLnkgKz0gdGhpcy5keTtcclxufVxyXG5cclxuQ2lyY2xlLnByb3RvdHlwZS51cGRhdGVDb2xvcj0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIG5FZmZlY3RlZEJ5ID0gMDtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHRhcmdldENpcmNsZXNBcnIubGVuZ3RoOyBpKyspIHtcclxuICAgIGxldCBkaXN0YW5jZUJldHdlZW4gPSBNYXRoLnNxcnQoIE1hdGgucG93KCAodGhpcy54IC0gdGFyZ2V0Q2lyY2xlc0FycltpXS54KSwgMikgKyBNYXRoLnBvdyggKHRoaXMueSAtIHRhcmdldENpcmNsZXNBcnJbaV0ueSksIDIpICk7XHJcbiAgICBpZiAoZGlzdGFuY2VCZXR3ZWVuIDwgYXJlYU9mRWZmZWN0KSB7XHJcbiAgICAgIGlmIChuRWZmZWN0ZWRCeSA9PSAwKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvckFyclswXSA9IHRhcmdldENpcmNsZXNBcnJbaV0uY29sb3JBcnJbMF07XHJcbiAgICAgICAgdGhpcy5jb2xvckFyclsxXSA9IHRhcmdldENpcmNsZXNBcnJbaV0uY29sb3JBcnJbMV07XHJcbiAgICAgICAgdGhpcy5jb2xvckFyclsyXSA9IHRhcmdldENpcmNsZXNBcnJbaV0uY29sb3JBcnJbMl07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5jb2xvckFyclswXSA9IE1hdGgucm91bmQoICh0aGlzLmNvbG9yQXJyWzBdICsgdGFyZ2V0Q2lyY2xlc0FycltpXS5jb2xvckFyclswXSkgLyBuRWZmZWN0ZWRCeSApO1xyXG4gICAgICAgIHRoaXMuY29sb3JBcnJbMV0gPSBNYXRoLnJvdW5kKCAodGhpcy5jb2xvckFyclsxXSArIHRhcmdldENpcmNsZXNBcnJbaV0uY29sb3JBcnJbMV0pIC8gbkVmZmVjdGVkQnkgKTtcclxuICAgICAgICB0aGlzLmNvbG9yQXJyWzJdID0gTWF0aC5yb3VuZCggKHRoaXMuY29sb3JBcnJbMl0gKyB0YXJnZXRDaXJjbGVzQXJyW2ldLmNvbG9yQXJyWzJdKSAvIG5FZmZlY3RlZEJ5ICk7XHJcbiAgICAgIH1cclxuICAgICAgbkVmZmVjdGVkQnkrKztcclxuICAgIH1cclxuICB9XHJcbiAgaWYgKG5FZmZlY3RlZEJ5ID09IDApIHtcclxuICAgIHRoaXMuY29sb3JBcnIgPSBkZWZhdWx0Q2lyY2xlQ29sb3Iuc2xpY2UoKTtcclxuICB9XHJcbiAgdGhpcy5jb2xvciA9ICdyZ2IoJyArIHRoaXMuY29sb3JBcnJbMF0gKyAnLCAnICsgdGhpcy5jb2xvckFyclsxXSArICcsICcgKyB0aGlzLmNvbG9yQXJyWzJdICsgJyknO1xyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tZXhwb3J0c1xyXG5leHBvcnRzLmluaXQgPSBpbml0O1xyXG5leHBvcnRzLmFuaW1hdGUgPSBhbmltYXRlO1xyXG5leHBvcnRzLmNhbmNlbEFuaW1hdGlvbiA9IGNhbmNlbEFuaW1hdGlvbjtcclxuZXhwb3J0cy50b2dnbGVSdW5BbmltYXRpb24gPSB0b2dnbGVSdW5BbmltYXRpb247XHJcbiIsIi8vIHBvcnRmb2xpb1xyXG4vLyBhbmltYXRpb24tbG96ZW5nZS1zcGlycm9ncmFwaC5qc1xyXG5cclxuY29uc3QgYW5pbWF0aW9uVXRpbHMgPSByZXF1aXJlKCcuL2FuaW1hdGlvbi11dGlscycpO1xyXG5cclxuLy9zdGF0ZVxyXG5sZXQgY2FudmFzO1xyXG5sZXQgY3R4O1xyXG5sZXQgZnJhbWVJZDtcclxubGV0IGlzUGF1c2VkO1xyXG5sZXQgbG96ZW5nZVJhZGl1cztcclxubGV0IGxvemVuZ2VMaW5lV2lkdGg7XHJcbmxldCBzcGVlZDtcclxubGV0IHN0cm9rZUNvbG9yID0gJyMxNjMwNWInO1xyXG5sZXQgZmlsbENvbG9yID0gJ3RyYW5zcGFyZW50JztcclxuLy9hbmltYXRlZCBvYmplY3RzXHJcbmxldCBtb3ZpbmdMb3plbmdlcyA9IFtdO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1leHBvcnRlZCBmdW5jdGlvbnNcclxuZnVuY3Rpb24gaW5pdChvcHRzKSB7XHJcbiAgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQob3B0cy5jYW52YXMpO1xyXG4gIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIGNhbmNlbEFuaW1hdGlvbigpO1xyXG4gIG1vdmluZ0xvemVuZ2VzLmxlbmd0aCA9IDA7XHJcbiAgaXNQYXVzZWQgPSBmYWxzZTtcclxuICBsb3plbmdlUmFkaXVzID0gTWF0aC5yb3VuZChjYW52YXMud2lkdGggLyAyMCk7XHJcbiAgbG96ZW5nZUxpbmVXaWR0aCA9IE1hdGgucm91bmQoY2FudmFzLndpZHRoIC8gNDApO1xyXG4gIHNwZWVkID0gTWF0aC5yb3VuZChjYW52YXMud2lkdGggLyA0MDApO1xyXG4gIG1vdmluZ0xvemVuZ2VzSW5pdCgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFuaW1hdGUoKSB7XHJcbiAgaXNQYXVzZWQgPSBmYWxzZTtcclxuICBmcmFtZUlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpO1xyXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcclxuICBtb3ZpbmdMb3plbmdlcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIGVsZW1lbnQudXBkYXRlUG9zKCk7XHJcbiAgICBlbGVtZW50LmRyYXcoKTtcclxuICB9KTtcclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4LmxpbmVXaWR0aCA9IGxvemVuZ2VMaW5lV2lkdGg7XHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gc3Ryb2tlQ29sb3I7XHJcbiAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvcjtcclxuICBhbmltYXRpb25VdGlscy5kcmF3TG96ZW5nZShjdHgsIG1vdmluZ0xvemVuZ2VzWzBdLngxLCBtb3ZpbmdMb3plbmdlc1swXS55MSwgbW92aW5nTG96ZW5nZXNbMV0ueDEsIG1vdmluZ0xvemVuZ2VzWzFdLnkxLCBsb3plbmdlUmFkaXVzKTtcclxuICBhbmltYXRpb25VdGlscy5kcmF3TG96ZW5nZShjdHgsIG1vdmluZ0xvemVuZ2VzWzBdLngyLCBtb3ZpbmdMb3plbmdlc1swXS55MiwgbW92aW5nTG96ZW5nZXNbMV0ueDIsIG1vdmluZ0xvemVuZ2VzWzFdLnkyLCBsb3plbmdlUmFkaXVzKTtcclxuICBhbmltYXRpb25VdGlscy5kcmF3TG96ZW5nZShjdHgsIG1vdmluZ0xvemVuZ2VzWzJdLngxLCBtb3ZpbmdMb3plbmdlc1syXS55MSwgbW92aW5nTG96ZW5nZXNbM10ueDEsIG1vdmluZ0xvemVuZ2VzWzNdLnkxLCBsb3plbmdlUmFkaXVzKTtcclxuICBhbmltYXRpb25VdGlscy5kcmF3TG96ZW5nZShjdHgsIG1vdmluZ0xvemVuZ2VzWzJdLngyLCBtb3ZpbmdMb3plbmdlc1syXS55MiwgbW92aW5nTG96ZW5nZXNbM10ueDIsIG1vdmluZ0xvemVuZ2VzWzNdLnkyLCBsb3plbmdlUmFkaXVzKTtcclxuICBjdHguc3Ryb2tlKCk7XHJcbiAgY3R4LmZpbGwoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gY2FuY2VsQW5pbWF0aW9uKCkge1xyXG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lSWQpO1xyXG4gIGlzUGF1c2VkID0gdHJ1ZTtcclxufVxyXG5cclxuZnVuY3Rpb24gcmV2ZXJzZURYKCkge1xyXG4gIGNvbnNvbGUubG9nKCdyZXZlcnNlRFgnKTtcclxuICBtb3ZpbmdMb3plbmdlcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIGVsZW1lbnQuZHgxID0gLWVsZW1lbnQuZHgxO1xyXG4gICAgZWxlbWVudC5keDIgPSAtZWxlbWVudC5keDI7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJldmVyc2VEWSgpIHtcclxuICBtb3ZpbmdMb3plbmdlcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIGVsZW1lbnQuZHkxID0gLWVsZW1lbnQuZHkxO1xyXG4gICAgZWxlbWVudC5keTIgPSAtZWxlbWVudC5keTI7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN3aXRjaFhZKCkge1xyXG4gIG1vdmluZ0xvemVuZ2VzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCl7XHJcbiAgICBsZXQgeDEgPSBlbGVtZW50LngxO1xyXG4gICAgbGV0IHkxID0gZWxlbWVudC55MTtcclxuICAgIGxldCB4MiA9IGVsZW1lbnQueDI7XHJcbiAgICBsZXQgeTIgPSBlbGVtZW50LnkyO1xyXG4gICAgbGV0IGR4MSA9IGVsZW1lbnQuZHgxO1xyXG4gICAgbGV0IGR5MSA9IGVsZW1lbnQuZHkxO1xyXG4gICAgbGV0IGR4MiA9IGVsZW1lbnQuZHgyO1xyXG4gICAgbGV0IGR5MiA9IGVsZW1lbnQuZHkyO1xyXG4gICAgZWxlbWVudC54MSA9IHkxO1xyXG4gICAgZWxlbWVudC55MSA9IHgxO1xyXG4gICAgZWxlbWVudC54MiA9IHkyO1xyXG4gICAgZWxlbWVudC55MiA9IHgyO1xyXG4gICAgZWxlbWVudC5keDEgPSBkeTE7XHJcbiAgICBlbGVtZW50LmR5MSA9IGR4MTtcclxuICAgIGVsZW1lbnQuZHgyID0gZHkyO1xyXG4gICAgZWxlbWVudC5keTIgPSBkeDI7XHJcbiAgfSk7XHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0taW50ZXJuYWwgZnVuY3Rpb25zXHJcbi8vbW92aW5nTG96ZW5nZXMgaW5pdGlhbGlzZXJcclxuZnVuY3Rpb24gbW92aW5nTG96ZW5nZXNJbml0KCkge1xyXG4gIG1vdmluZ0xvemVuZ2VzLnB1c2goIG5ldyBNb3ZpbmdMb3plbmdlKGxvemVuZ2VSYWRpdXMsIGNhbnZhcy5oZWlnaHQgLyAyLCBjYW52YXMud2lkdGggLyAyLCBjYW52YXMuaGVpZ2h0IC0gbG96ZW5nZVJhZGl1cywgc3BlZWQsIC1zcGVlZCwgc3BlZWQsIC1zcGVlZCkgKTtcclxuICBtb3ZpbmdMb3plbmdlcy5wdXNoKCBuZXcgTW92aW5nTG96ZW5nZShjYW52YXMud2lkdGggLWxvemVuZ2VSYWRpdXMsIGNhbnZhcy5oZWlnaHQgLyAyLCBjYW52YXMud2lkdGggLyAyLCBjYW52YXMuaGVpZ2h0IC0gbG96ZW5nZVJhZGl1cywgLXNwZWVkLCAtc3BlZWQsIC1zcGVlZCwgLXNwZWVkKSApO1xyXG4gIG1vdmluZ0xvemVuZ2VzLnB1c2goIG5ldyBNb3ZpbmdMb3plbmdlKGxvemVuZ2VSYWRpdXMsIGNhbnZhcy5oZWlnaHQgLyAyLCBjYW52YXMud2lkdGggLyAyLCBsb3plbmdlUmFkaXVzLCBzcGVlZCwgc3BlZWQsIHNwZWVkLCBzcGVlZCkgKTtcclxuICBtb3ZpbmdMb3plbmdlcy5wdXNoKCBuZXcgTW92aW5nTG96ZW5nZShjYW52YXMud2lkdGggLSBsb3plbmdlUmFkaXVzLCBjYW52YXMuaGVpZ2h0IC8gMiwgY2FudmFzLndpZHRoIC8gMiwgbG96ZW5nZVJhZGl1cywgLXNwZWVkLCBzcGVlZCwgLXNwZWVkLCBzcGVlZCkgKTtcclxufVxyXG5cclxuLy9jb25zdHJ1Y3RvciBmb3IgTW92aW5nTG96ZW5nZVxyXG5mdW5jdGlvbiBNb3ZpbmdMb3plbmdlKHgxLCB5MSwgeDIsIHkyLCBkeDEsIGR5MSwgZHgyLCBkeTIpIHtcclxuICB0aGlzLngxID0geDE7XHJcbiAgdGhpcy55MSA9IHkxO1xyXG4gIHRoaXMueDIgPSB4MjtcclxuICB0aGlzLnkyID0geTI7XHJcbiAgdGhpcy5keDEgPSBkeDE7XHJcbiAgdGhpcy5keTEgPSBkeTE7XHJcbiAgdGhpcy5keDIgPSBkeDI7XHJcbiAgdGhpcy5keTIgPSBkeTI7XHJcbn1cclxuTW92aW5nTG96ZW5nZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNb3ZpbmdMb3plbmdlO1xyXG5cclxuTW92aW5nTG96ZW5nZS5wcm90b3R5cGUudXBkYXRlUG9zID0gZnVuY3Rpb24oKSB7XHJcbiAgaWYgKHRoaXMueDEgKyBsb3plbmdlUmFkaXVzID4gY2FudmFzLndpZHRoIHx8IHRoaXMueDEgLSBsb3plbmdlUmFkaXVzIDwgMCkge3RoaXMuZHgxID0gLXRoaXMuZHgxfTtcclxuICBpZiAodGhpcy55MSArIGxvemVuZ2VSYWRpdXMgPiBjYW52YXMuaGVpZ2h0IHx8IHRoaXMueTEgLSBsb3plbmdlUmFkaXVzIDwgMCkge3RoaXMuZHkxID0gLXRoaXMuZHkxfTtcclxuICBpZiAodGhpcy54MiArIGxvemVuZ2VSYWRpdXMgPiBjYW52YXMud2lkdGggfHwgdGhpcy54MiAtIGxvemVuZ2VSYWRpdXMgPCAwKSB7dGhpcy5keDIgPSAtdGhpcy5keDJ9O1xyXG4gIGlmICh0aGlzLnkyICsgbG96ZW5nZVJhZGl1cyA+IGNhbnZhcy5oZWlnaHQgfHwgdGhpcy55MiAtIGxvemVuZ2VSYWRpdXMgPCAwKSB7dGhpcy5keTIgPSAtdGhpcy5keTJ9O1xyXG4gIHRoaXMueDEgKz0gdGhpcy5keDE7XHJcbiAgdGhpcy55MSArPSB0aGlzLmR5MTtcclxuICB0aGlzLngyICs9IHRoaXMuZHgyO1xyXG4gIHRoaXMueTIgKz0gdGhpcy5keTI7XHJcbn1cclxuXHJcbk1vdmluZ0xvemVuZ2UucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4LmxpbmVXaWR0aCA9IGxvemVuZ2VMaW5lV2lkdGg7XHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gc3Ryb2tlQ29sb3I7XHJcbiAgY3R4LmZpbGxTdHlsZSA9IGZpbGxDb2xvcjtcclxuICBhbmltYXRpb25VdGlscy5kcmF3TG96ZW5nZShjdHgsIHRoaXMueDEsIHRoaXMueTEsIHRoaXMueDIsIHRoaXMueTIsIGxvemVuZ2VSYWRpdXMpO1xyXG4gIGN0eC5zdHJva2UoKTtcclxuICBjdHguZmlsbCgpO1xyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tZXhwb3J0c1xyXG5leHBvcnRzLmluaXQgPWluaXQ7XHJcbmV4cG9ydHMuYW5pbWF0ZSA9IGFuaW1hdGU7XHJcbmV4cG9ydHMuY2FuY2VsQW5pbWF0aW9uID0gY2FuY2VsQW5pbWF0aW9uO1xyXG4vL3RlbXBcclxuZXhwb3J0cy5yZXZlcnNlRFggPSByZXZlcnNlRFg7XHJcbmV4cG9ydHMucmV2ZXJzZURZID0gcmV2ZXJzZURZO1xyXG5leHBvcnRzLnN3aXRjaFhZID0gc3dpdGNoWFk7XHJcbiIsIi8vIHBvcnRmb2xpb1xyXG4vLyBhbmltYXRpb24tbG96ZW5nZS10ZXN0ZXIuanNcclxuXHJcbmNvbnN0IGFuaW1hdGlvblV0aWxzID0gcmVxdWlyZSgnLi9hbmltYXRpb24tdXRpbHMnKTtcclxuXHJcbi8vc3RhdGVcclxubGV0IGNhbnZhcztcclxubGV0IGN0eDtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tZXhwb3J0ZWQgZnVuY3Rpb25zXHJcbmZ1bmN0aW9uIGluaXQob3B0cykge1xyXG4gIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG9wdHMuY2FudmFzKTtcclxuICBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICBsZXQgeDEgPSBvcHRzLngxO1xyXG4gIGxldCB5MSA9IG9wdHMueTE7XHJcbiAgbGV0IHgyID0gb3B0cy54MjtcclxuICBsZXQgeTIgPSBvcHRzLnkyO1xyXG4gIGN0eC5jbGVhclJlY3QoMCwgMCwgNDAwLCA0MDApO1xyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHgubGluZVdpZHRoID0gMTA7XHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gJyMwMDAwMDAnO1xyXG4gIGN0eC5maWxsU3R5bGUgPSAndHJhbnNwYXJlbnQnO1xyXG4gIGFuaW1hdGlvblV0aWxzLmRyYXdMb3plbmdlKGN0eCwgeDEsIHkxLCB4MiwgeTIsIDIwKTtcclxuICBjdHguc3Ryb2tlKCk7XHJcbiAgY3R4LmZpbGwoKTtcclxufVxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLWludGVybmFsIGZ1bmN0aW9uc1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLWV4cG9ydHNcclxuZXhwb3J0cy5pbml0ID0gaW5pdDtcclxuIiwiLy8gcG9ydGZvbGlvXHJcbi8vIGFuaW1hdGlvbi1tZWNoYW5pY2FsLWxldHRlcnMuanNcclxuXHJcbi8vcGFzc2VkIGluIHZpYSBvcHRzXHJcbmxldCBjYW52YXM7XHJcbmxldCBzdHI7XHJcbi8vbGF0ZXIgZXhwb3NlIHRvIG9wdHNcclxuY29uc3QgY29sb3JPbmUgPSAnI2QxODAxNyc7XHJcbmNvbnN0IGNvbG9yVHdvID0gJyM4YjhkOTEnO1xyXG5jb25zdCBjb2xvclRocmVlID0gJyNmZmZmZmYnOy8vdGVtcFxyXG5jb25zdCBvdmVyYWxsQW5pbWF0aW9uU3BlZWQgPSAxO1xyXG5jb25zdCBsZXR0ZXJQYWRkaW5nID0gNzsgLy8gQXMgYSByYXRpbyBvZiBsZXR0ZXJXaWR0aCAmIGxldHRlckhlaWdodFxyXG5jb25zdCBsZXR0ZXJMaW5lV2lkdGhSYXRpbyA9IDg7XHJcbi8vY2FsY3VsYXRlZFxyXG5sZXQgY3R4O1xyXG5sZXQgbGV0dGVyV2lkdGg7XHJcbmxldCBsZXR0ZXJIZWlnaHQ7XHJcbmxldCBmcmFtZUlkO1xyXG5sZXQgaXNQYXVzZWQgPSBmYWxzZTtcclxuLy9hbmltYXRlZCBvYmplY3RzXHJcbmxldCBtZWNoTGV0dGVyc0FyciA9IFtdO1xyXG5sZXQgbGV0dGVyTGluZVdpZHRoO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1leHBvcnRlZCBmdW5jdGlvbnNcclxuZnVuY3Rpb24gaW5pdChvcHRzKSB7XHJcbiAgY2FuY2VsQW5pbWF0aW9uKCk7XHJcbiAgY2xlYXJBcnJheXMoKTtcclxuICBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChvcHRzLmNhbnZhcyk7XHJcbiAgc3RyID0gb3B0cy5zdHI7XHJcbiAgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgbGV0dGVyV2lkdGggPSBNYXRoLnJvdW5kKGNhbnZhcy53aWR0aCAvIG9wdHMuc3RyLmxlbmd0aCk7XHJcbiAgbGV0dGVySGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcclxuICBsZXR0ZXJMaW5lV2lkdGggPSBNYXRoLnJvdW5kKGxldHRlcldpZHRoIC8gbGV0dGVyTGluZVdpZHRoUmF0aW8pO1xyXG4gIG1lY2hMZXR0ZXJzQXJyID0gaW5pdE1lY2hMZXR0ZXJzQXJyKG9wdHMuc3RyKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcclxuICBpc1BhdXNlZCA9IGZhbHNlO1xyXG4gIGZyYW1lSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSk7XHJcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gIHZhciBuUGF1c2VkID0gMDtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IG1lY2hMZXR0ZXJzQXJyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBtZWNoTGV0dGVyc0FycltpXS5hbmltYXRlTGV0dGVyKCk7XHJcbiAgICBtZWNoTGV0dGVyc0FycltpXS5kcmF3KCk7XHJcbiAgICBpZiAobWVjaExldHRlcnNBcnJbaV0ucGF1c2VkID09IHRydWUpIHtuUGF1c2VkKys7fVxyXG4gIH1cclxuICBpZiAoblBhdXNlZCA9PSBtZWNoTGV0dGVyc0Fyci5sZW5ndGgpIHtjYW5jZWxBbmltYXRpb24oKTt9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNhbmNlbEFuaW1hdGlvbigpIHtcclxuICBjYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZUlkKTtcclxuICBpc1BhdXNlZCA9IHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvZ2dsZVJ1bkFuaW1hdGlvbigpIHtcclxuICBpc1BhdXNlZCA9PT0gZmFsc2UgPyggaXNQYXVzZWQgPSB0cnVlLCBjYW5jZWxBbmltYXRpb24oKSApIDogKCBpc1BhdXNlZCA9IGZhbHNlLCBhbmltYXRlKCkgICk7XHJcbiAgcmV0dXJuIGlzUGF1c2VkO1xyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLWludGVybmFsIGZ1bmN0aW9uc1xyXG5mdW5jdGlvbiBjbGVhckFycmF5cygpIHtcclxuICBtZWNoTGV0dGVyc0Fyci5sZW5ndGggPSAwO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0TWVjaExldHRlcnNBcnIoc3RyKSB7XHJcbiAgbGV0IGFyciA9IFtdO1xyXG4gIGFyci5sZW5ndGggPSAwO1xyXG4gIGZvciAobGV0IGkgPTA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcclxuICAgIHN3aXRjaCAoc3RyW2ldKSB7XHJcbiAgICAgIGNhc2UgJ2gnOlxyXG4gICAgICBhcnIucHVzaCggbmV3IExldHRlckgoaSAqIGxldHRlcldpZHRoKSApO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIGFycjtcclxufVxyXG5cclxuLy9jb25zdHJ1Y3RvciBmb3IgcHJvdG90eXBlIG9mIGJhc2UgTGV0dGVyIG9iamVjdFxyXG5mdW5jdGlvbiBMZXR0ZXIoKSB7XHJcbiAgdGhpcy5uTW92ZW1lbnRzQmVmb3JlUGF1c2UgPSAxO1xyXG4gIHRoaXMuaW5kaXZpZHVhbEFuaW1hdGlvblNwZWVkID0gMTtcclxuICB0aGlzLnNwZWVkID0gb3ZlcmFsbEFuaW1hdGlvblNwZWVkICogdGhpcy5pbmRpdmlkdWFsQW5pbWF0aW9uU3BlZWQ7XHJcbiAgdGhpcy5uTW92ZW1lbnRzID0gMDtcclxuICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xyXG59XHJcbkxldHRlci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBMZXR0ZXI7XHJcblxyXG5MZXR0ZXIucHJvdG90eXBlLmNhbGNFZGdlcyA9IGZ1bmN0aW9uKG9mZnNldCkge1xyXG4gIGxldCBlZGdlcyA9IHtcclxuICAgIGxlZnQ6IG9mZnNldCArIChsZXR0ZXJXaWR0aCAvIGxldHRlclBhZGRpbmcpLFxyXG4gICAgcmlnaHQ6IG9mZnNldCArIGxldHRlcldpZHRoIC0gKGxldHRlcldpZHRoIC8gbGV0dGVyUGFkZGluZyksXHJcbiAgICB0b3A6IGxldHRlckhlaWdodCAvIGxldHRlclBhZGRpbmcsXHJcbiAgICBib3R0b206IGxldHRlckhlaWdodCAtIChsZXR0ZXJIZWlnaHQgLyBsZXR0ZXJQYWRkaW5nKVxyXG4gIH07XHJcbiAgcmV0dXJuIGVkZ2VzO1xyXG59XHJcblxyXG4vL2NvbnN0cnVjdG9yIGZvciB0aGUgbGV0dGVyICdIJyBvYmplY3RzXHJcbmZ1bmN0aW9uIExldHRlckgob2Zmc2V0KSB7XHJcbiAgTGV0dGVyLmNhbGwodGhpcyk7XHJcbiAgbGV0IGVkZ2VzID0gdGhpcy5jYWxjRWRnZXMob2Zmc2V0KTtcclxuICAvL292ZXJ3cml0ZSBwcm90b3R5cGUgcHJvcGVydGllcyBpZiB3YW50IGRpZmZlcmVudCB2YWx1ZXMgZnJvbSBkZWZhdWx0c1xyXG4gIHRoaXMubk1vdmVtZW50c0JlZm9yZVBhdXNlID0gMztcclxuICAvL3JhbmRvbWlzZSBhbmltYXRpb24gZGlyZWN0aW9uXHJcbiAgaWYgKE1hdGgucmFuZG9tKCkgPj0gMC41KSB7dGhpcy5zcGVlZCA9IC10aGlzLnNwZWVkO31cclxuICAvL3ZlcnRleCBkZWZpbml0aW9uc1xyXG4gIHRoaXMubGVmdFZlcnRpY2FsUDEgPSB7IHg6IGVkZ2VzLmxlZnQsIHk6IGVkZ2VzLmJvdHRvbSB9O1xyXG4gIHRoaXMubGVmdFZlcnRpY2FsUDIgPSB7IHg6IGVkZ2VzLmxlZnQsIHk6IGVkZ2VzLnRvcCB9O1xyXG4gIHRoaXMubGVmdFZlcnRpY2FsUDMgPSB7IHg6IGVkZ2VzLmxlZnQgKyBsZXR0ZXJMaW5lV2lkdGgsIHk6IGVkZ2VzLnRvcCB9O1xyXG4gIHRoaXMubGVmdFZlcnRpY2FsUDQgPSB7IHg6IGVkZ2VzLmxlZnQgKyBsZXR0ZXJMaW5lV2lkdGgsIHk6IGVkZ2VzLmJvdHRvbSB9O1xyXG5cclxuICB0aGlzLnJpZ2h0VmVydGljYWxQMSA9IHsgeDogZWRnZXMucmlnaHQgLSBsZXR0ZXJMaW5lV2lkdGgsIHk6IGVkZ2VzLmJvdHRvbSB9O1xyXG4gIHRoaXMucmlnaHRWZXJ0aWNhbFAyID0geyB4OiBlZGdlcy5yaWdodCAtIGxldHRlckxpbmVXaWR0aCwgeTogZWRnZXMudG9wIH07XHJcbiAgdGhpcy5yaWdodFZlcnRpY2FsUDMgPSB7IHg6IGVkZ2VzLnJpZ2h0LCB5OiBlZGdlcy50b3AgfTtcclxuICB0aGlzLnJpZ2h0VmVydGljYWxQNCA9IHsgeDogZWRnZXMucmlnaHQsIHk6IGVkZ2VzLmJvdHRvbSB9O1xyXG5cclxuICB0aGlzLmhvcml6b250YWxQMSA9IHsgeDogZWRnZXMubGVmdCArIGxldHRlckxpbmVXaWR0aCwgeTogKGxldHRlckhlaWdodCAvIDIpIC0gKGxldHRlckxpbmVXaWR0aCAvIDIpIH07XHJcbiAgdGhpcy5ob3Jpem9udGFsUDIgPSB7IHg6IGVkZ2VzLmxlZnQgKyBsZXR0ZXJMaW5lV2lkdGgsIHk6IChsZXR0ZXJIZWlnaHQgLyAyKSArIChsZXR0ZXJMaW5lV2lkdGggLyAyKSB9O1xyXG4gIHRoaXMuaG9yaXpvbnRhbFAzID0geyB4OiBlZGdlcy5yaWdodCAtIGxldHRlckxpbmVXaWR0aCwgeTogKGxldHRlckhlaWdodCAvIDIpICsgKGxldHRlckxpbmVXaWR0aCAvIDIpIH07XHJcbiAgdGhpcy5ob3Jpem9udGFsUDQgPSB7IHg6IGVkZ2VzLnJpZ2h0IC0gbGV0dGVyTGluZVdpZHRoLCB5OiAobGV0dGVySGVpZ2h0IC8gMikgLSAobGV0dGVyTGluZVdpZHRoIC8gMikgfTtcclxufVxyXG5MZXR0ZXJILnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoTGV0dGVyLnByb3RvdHlwZSk7XHJcbkxldHRlckgucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTGV0dGVySDtcclxuXHJcbkxldHRlckgucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbigpIHtcclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3JPbmU7XHJcbiAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yVHdvO1xyXG4gIGN0eC5saW5lV2lkdGggPSBsZXR0ZXJMaW5lV2lkdGggLyA0O1xyXG4gIC8vbGVmdCB2ZXJ0aWNhbFxyXG4gIGN0eC5tb3ZlVG8odGhpcy5sZWZ0VmVydGljYWxQMS54LCB0aGlzLmxlZnRWZXJ0aWNhbFAxLnkpO1xyXG4gIGN0eC5saW5lVG8odGhpcy5sZWZ0VmVydGljYWxQMi54LCB0aGlzLmxlZnRWZXJ0aWNhbFAyLnkpO1xyXG4gIGN0eC5hcmModGhpcy5sZWZ0VmVydGljYWxQMi54ICsgbGV0dGVyTGluZVdpZHRoIC8gMiwgdGhpcy5sZWZ0VmVydGljYWxQMi55LCBsZXR0ZXJMaW5lV2lkdGggLyAyLCBNYXRoLlBJLCAwLCBmYWxzZSk7XHJcbiAgY3R4LmxpbmVUbyh0aGlzLmxlZnRWZXJ0aWNhbFA0LngsIHRoaXMubGVmdFZlcnRpY2FsUDQueSk7XHJcbiAgY3R4LmFyYyh0aGlzLmxlZnRWZXJ0aWNhbFAyLnggKyBsZXR0ZXJMaW5lV2lkdGggLyAyLCB0aGlzLmxlZnRWZXJ0aWNhbFAxLnksIGxldHRlckxpbmVXaWR0aCAvIDIsIDAsIE1hdGguUEksIGZhbHNlKTtcclxuICAvL3JpZ2h0IHZlcnRpY2FsXHJcbiAgY3R4Lm1vdmVUbyh0aGlzLnJpZ2h0VmVydGljYWxQMS54LCB0aGlzLnJpZ2h0VmVydGljYWxQMS55KTtcclxuICBjdHgubGluZVRvKHRoaXMucmlnaHRWZXJ0aWNhbFAyLngsIHRoaXMucmlnaHRWZXJ0aWNhbFAyLnkpO1xyXG4gIGN0eC5hcmModGhpcy5yaWdodFZlcnRpY2FsUDIueCArIGxldHRlckxpbmVXaWR0aCAvIDIsIHRoaXMucmlnaHRWZXJ0aWNhbFAyLnksIGxldHRlckxpbmVXaWR0aCAvIDIsIE1hdGguUEksIDAsIGZhbHNlKTtcclxuICBjdHgubGluZVRvKHRoaXMucmlnaHRWZXJ0aWNhbFA0LngsIHRoaXMucmlnaHRWZXJ0aWNhbFA0LnkpO1xyXG4gIGN0eC5hcmModGhpcy5yaWdodFZlcnRpY2FsUDIueCArIGxldHRlckxpbmVXaWR0aCAvIDIsIHRoaXMucmlnaHRWZXJ0aWNhbFAxLnksIGxldHRlckxpbmVXaWR0aCAvIDIsIDAsIE1hdGguUEksIGZhbHNlKTtcclxuICAvL2hvcml6b250YWxcclxuICBjdHgubW92ZVRvKHRoaXMuaG9yaXpvbnRhbFAxLngsIHRoaXMuaG9yaXpvbnRhbFAxLnkpO1xyXG4gIGN0eC5saW5lVG8odGhpcy5ob3Jpem9udGFsUDIueCwgdGhpcy5ob3Jpem9udGFsUDIueSk7XHJcbiAgY3R4LmxpbmVUbyh0aGlzLmhvcml6b250YWxQMy54LCB0aGlzLmhvcml6b250YWxQMy55KTtcclxuICBjdHgubGluZVRvKHRoaXMuaG9yaXpvbnRhbFA0LngsIHRoaXMuaG9yaXpvbnRhbFA0LnkpO1xyXG4gIGN0eC5saW5lVG8odGhpcy5ob3Jpem9udGFsUDEueCwgdGhpcy5ob3Jpem9udGFsUDEueSk7XHJcbiAgLy9jb2xvciBlZXJ5dGhpbmcgaW5cclxuICBjdHguZmlsbCgpO1xyXG4gIGN0eC5zdHJva2UoKTtcclxufVxyXG5cclxuTGV0dGVySC5wcm90b3R5cGUuYW5pbWF0ZUxldHRlciA9IGZ1bmN0aW9uKCkge1xyXG4gIGlmICggdGhpcy5uTW92ZW1lbnRzID49IHRoaXMubk1vdmVtZW50c0JlZm9yZVBhdXNlICYmIE1hdGgucm91bmQodGhpcy5ob3Jpem9udGFsUDEueSkgPT0gTWF0aC5yb3VuZChsZXR0ZXJIZWlnaHQgLyAyIC0gbGV0dGVyTGluZVdpZHRoIC8gMikgKSB7XHJcbiAgICB0aGlzLnBhdXNlZCA9IHRydWU7XHJcbiAgICB0aGlzLm5Nb3ZlbWVudHMgPSAwO1xyXG4gIH1cclxuICBpZiAodGhpcy5ob3Jpem9udGFsUDIueSA+IGxldHRlckhlaWdodCAtIGxldHRlckhlaWdodCAvIGxldHRlclBhZGRpbmcgfHwgdGhpcy5ob3Jpem9udGFsUDEueSA8IGxldHRlckhlaWdodCAvIGxldHRlclBhZGRpbmcpIHtcclxuICAgIHRoaXMuc3BlZWQgPSAtdGhpcy5zcGVlZDtcclxuICAgIHRoaXMubk1vdmVtZW50cysrO1xyXG4gIH1cclxuICBpZiAodGhpcy5wYXVzZWQgPT0gZmFsc2UgKSB7XHJcbiAgICB0aGlzLmhvcml6b250YWxQMS55ICs9IHRoaXMuc3BlZWQ7XHJcbiAgICB0aGlzLmhvcml6b250YWxQMi55ICs9IHRoaXMuc3BlZWQ7XHJcbiAgICB0aGlzLmhvcml6b250YWxQMy55ICs9IHRoaXMuc3BlZWQ7XHJcbiAgICB0aGlzLmhvcml6b250YWxQNC55ICs9IHRoaXMuc3BlZWQ7XHJcbiAgfVxyXG59O1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLWV4cG9ydHNcclxuZXhwb3J0cy5pbml0ID0gaW5pdDtcclxuZXhwb3J0cy5hbmltYXRlID0gYW5pbWF0ZTtcclxuZXhwb3J0cy5jYW5jZWxBbmltYXRpb24gPSBjYW5jZWxBbmltYXRpb247XHJcbmV4cG9ydHMudG9nZ2xlUnVuQW5pbWF0aW9uID0gdG9nZ2xlUnVuQW5pbWF0aW9uO1xyXG4iLCIvLyBwb3J0Zm9saW9cclxuLy8gYW5pbWF0aW9uLXV0aWxzLmpzXHJcblxyXG4vL3RvIHdydGl0ZVxyXG5mdW5jdGlvbiByYW5kb21Db2xvckluUmFuZ2UocmVkTG93LCByZWRVcCwgZ3JlZW5Mb3csIGdyZWVuVXAsIGJsdWVMb3csIGJsdWVVcCkge1xyXG5cclxufVxyXG5cclxuZnVuY3Rpb24gcmFuZG9tQ29sb3JzKG51bSkge1xyXG4gIHZhciBjaGFycyA9ICcwMTIzNDU2Nzg5QUJDREVGJztcclxuICB2YXIgaGV4O1xyXG4gIHZhciBjb2xvcnMgPSBbXTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IG51bTsgaSsrKSB7XHJcbiAgICBoZXggPSAnIyc7XHJcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IDY7IGorKykge1xyXG4gICAgICBoZXggKz0gY2hhcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTYpXTtcclxuICAgIH1cclxuICAgIGNvbG9ycy5wdXNoKGhleCk7XHJcbiAgfVxyXG4gIHJldHVybiBjb2xvcnM7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXdMb3plbmdlKGN0eCwgeDEsIHkxLCB4MiwgeTIsIHJhZGl1cykge1xyXG4gIGxldCB0YW5nZW50QW5nbGUgPSBNYXRoLmF0YW4oICh5MiAtIHkxKSAvICh4MiAtIHgxKSApO1xyXG4gIGxldCBwcmVDYWxjRHggPSAoTWF0aC5zaW4odGFuZ2VudEFuZ2xlKSAqIHJhZGl1cyk7XHJcbiAgbGV0IHByZUNhbGNEeSA9IChNYXRoLmNvcyh0YW5nZW50QW5nbGUpICogcmFkaXVzKTtcclxuICBsZXQgY29ybmVyMSA9IHsgeDogeDEgKyBwcmVDYWxjRHgsIHk6IHkxIC0gcHJlQ2FsY0R5IH07XHJcbiAgbGV0IGNvcm5lcjIgPSB7IHg6IHgxIC0gcHJlQ2FsY0R4LCB5OiB5MSArIHByZUNhbGNEeSB9O1xyXG4gIGxldCBjb3JuZXIzID0geyB4OiB4MiAtIHByZUNhbGNEeCwgeTogeTIgKyBwcmVDYWxjRHkgfTtcclxuICBsZXQgY29ybmVyNCA9IHsgeDogeDIgKyBwcmVDYWxjRHgsIHk6IHkyIC0gcHJlQ2FsY0R5IH07XHJcbiAgbGV0IGFwZXgxID0geyB4OiB4MSAtIHByZUNhbGNEeSwgeTogeTEgLSBwcmVDYWxjRHggfTtcclxuICBsZXQgYXBleDIgPSB7IHg6IHgyICsgcHJlQ2FsY0R5LCB5OiB5MiArIHByZUNhbGNEeCB9O1xyXG4gIGxldCBleHRDb3JuZXIxID0geyB4OiBjb3JuZXIxLnggKyBwcmVDYWxjRHksIHk6IGNvcm5lcjEueSArIHByZUNhbGNEeCB9O1xyXG4gIGxldCBleHRDb3JuZXIyID0geyB4OiBjb3JuZXIyLnggKyBwcmVDYWxjRHksIHk6IGNvcm5lcjIueSArIHByZUNhbGNEeCB9O1xyXG4gIGxldCBleHRDb3JuZXIzID0geyB4OiBjb3JuZXIzLnggLSBwcmVDYWxjRHksIHk6IGNvcm5lcjMueSAtIHByZUNhbGNEeCB9O1xyXG4gIGxldCBleHRDb3JuZXI0ID0geyB4OiBjb3JuZXI0LnggLSBwcmVDYWxjRHksIHk6IGNvcm5lcjQueSAtIHByZUNhbGNEeCB9O1xyXG4gIGlmICh4MSA+IHgyKSB7XHJcbiAgICBhcGV4MSA9IHsgeDogeDEgKyBwcmVDYWxjRHksIHk6IHkxICsgcHJlQ2FsY0R4IH07XHJcbiAgICBhcGV4MiA9IHsgeDogeDIgLSBwcmVDYWxjRHksIHk6IHkyIC0gcHJlQ2FsY0R4IH07XHJcbiAgfVxyXG4gIGlmICh4MSA8PSB4Mikge1xyXG4gICAgZXh0Q29ybmVyMSA9IHsgeDogY29ybmVyMS54IC0gcHJlQ2FsY0R5LCB5OiBjb3JuZXIxLnkgLSBwcmVDYWxjRHggfTtcclxuICAgIGV4dENvcm5lcjIgPSB7IHg6IGNvcm5lcjIueCAtIHByZUNhbGNEeSwgeTogY29ybmVyMi55IC0gcHJlQ2FsY0R4IH07XHJcbiAgICBleHRDb3JuZXIzID0geyB4OiBjb3JuZXIzLnggKyBwcmVDYWxjRHksIHk6IGNvcm5lcjMueSArIHByZUNhbGNEeCB9O1xyXG4gICAgZXh0Q29ybmVyNCA9IHsgeDogY29ybmVyNC54ICsgcHJlQ2FsY0R5LCB5OiBjb3JuZXI0LnkgKyBwcmVDYWxjRHggfTtcclxuICB9XHJcblxyXG4gIGN0eC5tb3ZlVG8oY29ybmVyMi54LCBjb3JuZXIyLnkpO1xyXG4gIGN0eC5saW5lVG8oY29ybmVyMy54LCBjb3JuZXIzLnkpO1xyXG4gIGN0eC5hcmNUbyhleHRDb3JuZXIzLngsIGV4dENvcm5lcjMueSwgYXBleDIueCwgYXBleDIueSwgcmFkaXVzKTtcclxuICBjdHguYXJjVG8oZXh0Q29ybmVyNC54LCBleHRDb3JuZXI0LnksIGNvcm5lcjQueCwgY29ybmVyNC55LCByYWRpdXMpO1xyXG4gIGN0eC5saW5lVG8oY29ybmVyMS54LCBjb3JuZXIxLnkpO1xyXG4gIGN0eC5hcmNUbyhleHRDb3JuZXIxLngsIGV4dENvcm5lcjEueSwgYXBleDEueCwgYXBleDEueSwgcmFkaXVzKTtcclxuICBjdHguYXJjVG8oZXh0Q29ybmVyMi54LCBleHRDb3JuZXIyLnksIGNvcm5lcjIueCwgY29ybmVyMi55LCByYWRpdXMpO1xyXG5cclxuLypkZWJ1Z2dpbmcgc3R1ZmYsIGxlYXZlIGNvbW1lbnRlZCBvdXQqL1xyXG4vKlxyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHgubGluZVdpZHRoID0gMjtcclxuICBjdHguc3Ryb2tlU3R5bGUgPSAnIzAwMDBmZic7XHJcbiAgY3R4Lm1vdmVUbyh4MSwgeTEpO1xyXG4gIGN0eC5saW5lVG8oeDIsIHkyKTtcclxuICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHgubGluZVdpZHRoID0gMTtcclxuICBjdHguc3Ryb2tlU3R5bGUgPSAnI2ZmMDBmZic7XHJcbiAgY3R4Lm1vdmVUbyhhcGV4MS54LCBhcGV4MS55KTtcclxuICBjdHgubGluZVRvKGFwZXgyLngsIGFwZXgyLnkpO1xyXG4gIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5saW5lV2lkdGggPSAxO1xyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICcjZmYwMDAwJztcclxuICBjdHgubW92ZVRvKGNvcm5lcjEueCwgY29ybmVyMS55KTtcclxuICBjdHgubGluZVRvKGNvcm5lcjIueCwgY29ybmVyMi55KTtcclxuICBjdHgubGluZVRvKGNvcm5lcjMueCwgY29ybmVyMy55KTtcclxuICBjdHgubGluZVRvKGNvcm5lcjQueCwgY29ybmVyNC55KTtcclxuICBjdHgubGluZVRvKGNvcm5lcjEueCwgY29ybmVyMS55KTtcclxuICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gIGN0eC5iZWdpblBhdGgoKTtcclxuICBjdHgubGluZVdpZHRoID0gMjtcclxuICBjdHguc3Ryb2tlU3R5bGUgPSAnIzAwZmYwMCc7XHJcbiAgY3R4Lm1vdmVUbyhleHRDb3JuZXIxLngsIGV4dENvcm5lcjEueSk7XHJcbiAgY3R4LmxpbmVUbyhleHRDb3JuZXIyLngsIGV4dENvcm5lcjIueSk7XHJcbiAgY3R4LmxpbmVUbyhleHRDb3JuZXIzLngsIGV4dENvcm5lcjMueSk7XHJcbiAgY3R4LmxpbmVUbyhleHRDb3JuZXI0LngsIGV4dENvcm5lcjQueSk7XHJcbiAgY3R4LmxpbmVUbyhleHRDb3JuZXIxLngsIGV4dENvcm5lcjEueSk7XHJcbiAgY3R4LnN0cm9rZSgpO1xyXG4gICovXHJcbiAgLyplbmQgb2YgZGVidWdnaW5nIHN0dWZmKi9cclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLWV4cG9ydHNcclxuZXhwb3J0cy5yYW5kb21Db2xvcnMgPSByYW5kb21Db2xvcnM7XHJcbmV4cG9ydHMuZHJhd0xvemVuZ2UgPSBkcmF3TG96ZW5nZTtcclxuIiwiLy8gcG9ydGZvbGlvXHJcbi8vIHdpZGdldHJvbnMuanNcclxuXHJcbi8vIEZpbGUgZGVzY3JpcHRpb246XHJcbi8vIFNjcmlwdCBmaWxlIGxpbmtlZCB0byB3aWRnZXRyb25zLnB1Z1xyXG5cclxuY29uc3QgYm91bmNpbmdDb2xvcmVkRG90cyA9IHJlcXVpcmUoJy4vdXRpbHMvYW5pbWF0aW9uLWJvdW5jaW5nLWNvbG9yZWQtZG90cycpO1xyXG5jb25zdCBtZWNoYW5pY2FsTGV0dGVycyA9IHJlcXVpcmUoJy4vdXRpbHMvYW5pbWF0aW9uLW1lY2hhbmljYWwtbGV0dGVycycpO1xyXG5jb25zdCBsb3plbmdlVGVzdGVyID0gcmVxdWlyZSgnLi91dGlscy9hbmltYXRpb24tbG96ZW5nZS10ZXN0ZXInKTtcclxuY29uc3QgbG96ZW5nZVNwaXJyb2dyYXBoID0gcmVxdWlyZSgnLi91dGlscy9hbmltYXRpb24tbG96ZW5nZS1zcGlycm9ncmFwaCcpO1xyXG4vL2NvbnN0IG1lY2hhbmljYWxMZXR0ZXJzMiA9IHJlcXVpcmUoJy4vdXRpbHMvYW5pbWF0aW9uLW1lY2hhbmljYWwtbGV0dGVycy0yJyk7XHJcblxyXG5sZXQgc2VsZWN0ZWRBbmltYXRpb25zSW5kZXggPSAwO1xyXG5sZXQgYW5pbWF0aW9ucyA9IFtcclxuICB7XHJcbiAgICB0ZXh0OiAnQm91bmNpbmcgQ29sb3JlZCBEb3RzJyxcclxuICAgIG1vZHVsZTogYm91bmNpbmdDb2xvcmVkRG90cyxcclxuICAgIHBhcmVudEVsZW1lbnRJZDogJ2JvdW5jaW5nQ29sb3JlZERvdHMnLFxyXG4gICAgcGF1c2VCdXR0OiAnQkNEVG9nZ2xlUGF1c2UnLFxyXG4gICAgcmVSdW5CdXR0OiAnQkNEUmVSdW4nLFxyXG4gICAgbkNpcmNsZXNJbnB1dDogJ0JDRElucHV0TkNpcmNsZXMnLFxyXG4gICAgcmFkaXVzSW5wdXQ6ICdCQ0RJbnB1dFJhZGl1cycsXHJcbiAgICBhcmVhT2ZFZmZlY3RJbnB1dDogJ0JDRElucHV0QW9FJyxcclxuICAgIG9wdHM6IHtcclxuICAgICAgY2FudmFzOiAnQkNEQ2FudmFzJyxcclxuICAgICAgbkNpcmNsZXM6IDIwMCxcclxuICAgICAgcmFkaXVzOiAyLFxyXG4gICAgICBhcmVhT2ZFZmZlY3Q6IDgwXHJcbiAgICB9XHJcbiAgfSxcclxuICB7XHJcbiAgICB0ZXh0OiAnTWVjaGFuY2lhbCBMZXR0ZXJzJyxcclxuICAgIG1vZHVsZTogbWVjaGFuaWNhbExldHRlcnMsXHJcbiAgICBwYXJlbnRFbGVtZW50SWQ6ICdtZWNoYW5pY2FsTGV0dGVycycsXHJcbiAgICBwYXVzZUJ1dHQ6ICdNTFRvZ2dsZVBhdXNlJyxcclxuICAgIHJlUnVuQnV0dDogJ01MUmVSdW4nLFxyXG4gICAgb3B0czoge1xyXG4gICAgICBjYW52YXM6ICdNTENhbnZhcycsXHJcbiAgICAgIHN0cjogJ2hoaGgnXHJcbiAgICB9XHJcbiAgfSxcclxuICB7XHJcbiAgICB0ZXh0OiAnTG96ZW5nZSBUZXN0ZXInLFxyXG4gICAgbW9kdWxlOiBsb3plbmdlVGVzdGVyLFxyXG4gICAgcGFyZW50RWxlbWVudElkOiAnbG96ZW5nZVRlc3RlcicsXHJcbiAgICB4MVNsaWRlcjogJ0xUeDEnLFxyXG4gICAgeTFTbGlkZXI6ICdMVHkxJyxcclxuICAgIHgyU2xpZGVyOiAnTFR4MicsXHJcbiAgICB5MlNsaWRlcjogJ0xUeTInLFxyXG4gICAgb3B0czoge1xyXG4gICAgICBjYW52YXM6ICdMVENhbnZhcycsXHJcbiAgICAgIHgxOiAyMDAsXHJcbiAgICAgIHkxOiAyMDAsXHJcbiAgICAgIHgyOiAyNTAsXHJcbiAgICAgIHkyOiAyNTBcclxuICAgIH1cclxuICB9LFxyXG4gIHtcclxuICAgIHRleHQ6ICdMb3plbmdlIFNwaXJyb2dyYXBoJyxcclxuICAgIG1vZHVsZTogbG96ZW5nZVNwaXJyb2dyYXBoLFxyXG4gICAgcGFyZW50RWxlbWVudElkOiAnbG96ZW5nZVNwaXJyb2dyYXBoJyxcclxuICAgIHJldmVyc2VEWEJ1dHQ6ICdMU1JldmVyc2VEWEJ1dHQnLFxyXG4gICAgcmV2ZXJzZURZQnV0dDogJ0xTUmV2ZXJzZURZQnV0dCcsXHJcbiAgICBzd2l0Y2hYWUJ1dHQ6ICdMU1N3aXRjaFhZQnV0dCcsXHJcbiAgICBvcHRzOiB7XHJcbiAgICAgIGNhbnZhczogJ0xTQ2FudmFzJ1xyXG4gICAgfVxyXG4gIH1cclxuXTtcclxuXHJcbi8vaW5pdGlhbGlzZSBhZnRlciBET00gbG9hZGVkXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbihldmVudCkge1xyXG4gIGluaXRBbmltYXRpb25QaWNrZXIoKTtcclxuICBib3VuY2luZ0NvbG9yZWREb3RzLmluaXQoYW5pbWF0aW9uc1swXVsnb3B0cyddKTtcclxuICBhZGRCQ0RFdmVudExpc3RlbmVyUGF1c2UoKTtcclxuICBhZGRCQ0RFdmVudExpc3RlbmVyUmVSdW4oKTtcclxuICBtZWNoYW5pY2FsTGV0dGVycy5pbml0KGFuaW1hdGlvbnNbMV1bJ29wdHMnXSk7XHJcbiAgYWRkTUxFdmVudExpc3RlbmVyUGF1c2UoKTtcclxuICBhZGRNTEV2ZW50TGlzdGVuZXJSZVJ1bigpO1xyXG4gIGxvemVuZ2VUZXN0ZXIuaW5pdChhbmltYXRpb25zWzJdWydvcHRzJ10pO1xyXG4gIGFkZExURXZlbnRMaXN0ZW5lclgxU2xpZGVyKCk7XHJcbiAgYWRkTFRFdmVudExpc3RlbmVyWTFTbGlkZXIoKTtcclxuICBhZGRMVEV2ZW50TGlzdGVuZXJYMlNsaWRlcigpO1xyXG4gIGFkZExURXZlbnRMaXN0ZW5lclkyU2xpZGVyKCk7XHJcbiAgbG96ZW5nZVNwaXJyb2dyYXBoLmluaXQoYW5pbWF0aW9uc1szXVsnb3B0cyddKTtcclxuICBsb3plbmdlU3BpcnJvZ3JhcGguYW5pbWF0ZSgpO1xyXG4gIGFkZExTRXZlbnRMaXN0ZW5lclJldmVyc2VEWCgpO1xyXG4gIGFkZExTRXZlbnRMaXN0ZW5lclJldmVyc2VEWSgpO1xyXG4gIGFkZExTRXZlbnRMaXN0ZW5lclN3aXRjaFhZKCk7XHJcbiAgc3RhcnRTZWxlY3RlZEFuaW1hdGlvbigpO1xyXG59KTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1hbmltYXRpb24gcGlja2VyIGNvbnRyb2xzXHJcbmZ1bmN0aW9uIGluaXRBbmltYXRpb25QaWNrZXIoKSB7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbGVjdGVkQW5pbWF0aW9uJykuaW5uZXJIVE1MID0gYW5pbWF0aW9uc1tzZWxlY3RlZEFuaW1hdGlvbnNJbmRleF0udGV4dDtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJldkFuaW1hdGlvbicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2VsZWN0QW5pbWF0aW9uKCdkZWMnKSk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25leHRBbmltYXRpb24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlbGVjdEFuaW1hdGlvbignaW5jJykpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZWxlY3RBbmltYXRpb24oaW5jT3JEZWMpIHtcclxuICByZXR1cm4gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoaW5jT3JEZWMgPT09ICdkZWMnKSB7c2VsZWN0ZWRBbmltYXRpb25zSW5kZXgtLTt9XHJcbiAgICBpZiAoaW5jT3JEZWMgPT09ICdpbmMnKSB7c2VsZWN0ZWRBbmltYXRpb25zSW5kZXgrKzt9XHJcbiAgICBpZiAoc2VsZWN0ZWRBbmltYXRpb25zSW5kZXggPT09IC0xKSB7c2VsZWN0ZWRBbmltYXRpb25zSW5kZXggPSBhbmltYXRpb25zLmxlbmd0aCAtIDE7fVxyXG4gICAgaWYgKHNlbGVjdGVkQW5pbWF0aW9uc0luZGV4ID09PSBhbmltYXRpb25zLmxlbmd0aCkgeyBzZWxlY3RlZEFuaW1hdGlvbnNJbmRleCA9IDA7fVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NlbGVjdGVkQW5pbWF0aW9uJykuaW5uZXJIVE1MID0gYW5pbWF0aW9uc1tzZWxlY3RlZEFuaW1hdGlvbnNJbmRleF0udGV4dDtcclxuICAgIGNhbmNlbEFsbEFuaW1hdGlvbnMoKTtcclxuICAgIHN0YXJ0U2VsZWN0ZWRBbmltYXRpb24oKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLWdlbmVyaWMgJiBjb21tb24gYW5pbWF0aW9uIGNvbnRyb2xzXHJcbmZ1bmN0aW9uIGNhbmNlbEFsbEFuaW1hdGlvbnMoKSB7XHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbmltYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiggYW5pbWF0aW9uc1tpXS5oYXNPd25Qcm9wZXJ0eSgncGF1c2VCdXR0JykgKSB7XHJcbiAgICAgIGFuaW1hdGlvbnNbaV1bJ21vZHVsZSddLmNhbmNlbEFuaW1hdGlvbigpO1xyXG4gICAgfVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYW5pbWF0aW9uc1tpXVsncGFyZW50RWxlbWVudElkJ10pLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzdGFydFNlbGVjdGVkQW5pbWF0aW9uKCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFuaW1hdGlvbnNbc2VsZWN0ZWRBbmltYXRpb25zSW5kZXhdWydwYXJlbnRFbGVtZW50SWQnXSkuc3R5bGUuZGlzcGxheSA9ICdmbGV4JztcclxuICBpZiAoIGFuaW1hdGlvbnNbc2VsZWN0ZWRBbmltYXRpb25zSW5kZXhdLmhhc093blByb3BlcnR5KCdwYXVzZUJ1dHQnKSApIHtcclxuICAgICAgYW5pbWF0aW9uc1tzZWxlY3RlZEFuaW1hdGlvbnNJbmRleF1bJ21vZHVsZSddLmFuaW1hdGUoKTtcclxuICAgICAgc3R5bGVQYXVzZUJ1dHQoYW5pbWF0aW9uc1tzZWxlY3RlZEFuaW1hdGlvbnNJbmRleF1bJ3BhdXNlQnV0dCddLCBmYWxzZSk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBzdHlsZVBhdXNlQnV0dChwYXVzZUJ1dHQsIGlzUGF1c2VkKSB7XHJcbiAgaWYgKGlzUGF1c2VkID09PSB0cnVlKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwYXVzZUJ1dHQpLmNsYXNzTGlzdC5yZW1vdmUoJ2FuaW1hdGlvbkNvbnRyb2xVbnBhdXNlZCcpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGF1c2VCdXR0KS5jbGFzc0xpc3QuYWRkKCdhbmltYXRpb25Db250cm9sUGF1c2VkJyk7XHJcbiAgfVxyXG4gIGlmIChpc1BhdXNlZCA9PT0gZmFsc2UpIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHBhdXNlQnV0dCkuY2xhc3NMaXN0LnJlbW92ZSgnYW5pbWF0aW9uQ29udHJvbFBhdXNlZCcpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocGF1c2VCdXR0KS5jbGFzc0xpc3QuYWRkKCdhbmltYXRpb25Db250cm9sVW5wYXVzZWQnKTtcclxuICB9XHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLWluZGl2aWR1YWwgYW5pbWF0aW9uIGNvbnRyb2xzXHJcbi8vYm91bmNpbmcgY29sb3JlZCBkb3RzXHJcbmZ1bmN0aW9uIGFkZEJDREV2ZW50TGlzdGVuZXJQYXVzZSgpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhbmltYXRpb25zWzBdWydwYXVzZUJ1dHQnXSkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgbGV0IGlzUGF1c2VkID0gYm91bmNpbmdDb2xvcmVkRG90cy50b2dnbGVSdW5BbmltYXRpb24oKTtcclxuICAgIHN0eWxlUGF1c2VCdXR0KGFuaW1hdGlvbnNbMF1bJ3BhdXNlQnV0dCddLCBpc1BhdXNlZCk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZEJDREV2ZW50TGlzdGVuZXJSZVJ1bigpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhbmltYXRpb25zWzBdWydyZVJ1bkJ1dHQnXSkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgYW5pbWF0aW9uc1swXVsnb3B0cyddLm5DaXJjbGVzID0gcGFyc2VJbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYW5pbWF0aW9uc1swXVsnbkNpcmNsZXNJbnB1dCddKS52YWx1ZSk7XHJcbiAgICBhbmltYXRpb25zWzBdWydvcHRzJ10ucmFkaXVzID0gcGFyc2VJbnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYW5pbWF0aW9uc1swXVsncmFkaXVzSW5wdXQnXSkudmFsdWUpO1xyXG4gICAgYW5pbWF0aW9uc1swXVsnb3B0cyddLmFyZWFPZkVmZmVjdCA9IHBhcnNlSW50KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFuaW1hdGlvbnNbMF1bJ2FyZWFPZkVmZmVjdElucHV0J10pLnZhbHVlKTtcclxuICAgIGJvdW5jaW5nQ29sb3JlZERvdHMuaW5pdChhbmltYXRpb25zWzBdWydvcHRzJ10pO1xyXG4gICAgYm91bmNpbmdDb2xvcmVkRG90cy5hbmltYXRlKCk7XHJcbiAgICBzdHlsZVBhdXNlQnV0dChhbmltYXRpb25zWzBdWydwYXVzZUJ1dHQnXSwgZmFsc2UpO1xyXG4gIH0pO1xyXG59XHJcblxyXG4vL21lY2hhbmljYWwgbGV0dGVyc1xyXG5mdW5jdGlvbiBhZGRNTEV2ZW50TGlzdGVuZXJQYXVzZSgpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhbmltYXRpb25zWzFdWydwYXVzZUJ1dHQnXSkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgbGV0IGlzUGF1c2VkID0gbWVjaGFuaWNhbExldHRlcnMudG9nZ2xlUnVuQW5pbWF0aW9uKCk7XHJcbiAgICBzdHlsZVBhdXNlQnV0dChhbmltYXRpb25zWzFdWydwYXVzZUJ1dHQnXSwgaXNQYXVzZWQpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRNTEV2ZW50TGlzdGVuZXJSZVJ1bigpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhbmltYXRpb25zWzFdWydyZVJ1bkJ1dHQnXSkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgbWVjaGFuaWNhbExldHRlcnMuaW5pdChhbmltYXRpb25zWzFdWydvcHRzJ10pO1xyXG4gICAgbWVjaGFuaWNhbExldHRlcnMuYW5pbWF0ZSgpO1xyXG4gICAgc3R5bGVQYXVzZUJ1dHQoYW5pbWF0aW9uc1sxXVsncGF1c2VCdXR0J10sIGZhbHNlKTtcclxuICB9KTtcclxufVxyXG5cclxuLy9sb3plbmdlIHRlc3RlclxyXG5mdW5jdGlvbiBhZGRMVEV2ZW50TGlzdGVuZXJYMVNsaWRlcigpIHtcclxuICBsZXQgeDFTbGlkZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYW5pbWF0aW9uc1syXVsneDFTbGlkZXInXSk7XHJcbiAgeDFTbGlkZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGFuaW1hdGlvbnNbMl1bJ29wdHMnXS54MSA9IHBhcnNlSW50KHgxU2xpZGVyRWxlbWVudC52YWx1ZSk7XHJcbiAgICBsb3plbmdlVGVzdGVyLmluaXQoYW5pbWF0aW9uc1syXVsnb3B0cyddKTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gYWRkTFRFdmVudExpc3RlbmVyWTFTbGlkZXIoKSB7XHJcbiAgbGV0IHkxU2xpZGVyRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFuaW1hdGlvbnNbMl1bJ3kxU2xpZGVyJ10pO1xyXG4gIHkxU2xpZGVyRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICBhbmltYXRpb25zWzJdWydvcHRzJ10ueTEgPSBwYXJzZUludCh5MVNsaWRlckVsZW1lbnQudmFsdWUpO1xyXG4gICAgbG96ZW5nZVRlc3Rlci5pbml0KGFuaW1hdGlvbnNbMl1bJ29wdHMnXSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZExURXZlbnRMaXN0ZW5lclgyU2xpZGVyKCkge1xyXG4gIGxldCB4MlNsaWRlckVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhbmltYXRpb25zWzJdWyd4MlNsaWRlciddKTtcclxuICB4MlNsaWRlckVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgYW5pbWF0aW9uc1syXVsnb3B0cyddLngyID0gcGFyc2VJbnQoeDJTbGlkZXJFbGVtZW50LnZhbHVlKTtcclxuICAgIGxvemVuZ2VUZXN0ZXIuaW5pdChhbmltYXRpb25zWzJdWydvcHRzJ10pO1xyXG4gIH0pO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhZGRMVEV2ZW50TGlzdGVuZXJZMlNsaWRlcigpIHtcclxuICBsZXQgeTJTbGlkZXJFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYW5pbWF0aW9uc1syXVsneTJTbGlkZXInXSk7XHJcbiAgeTJTbGlkZXJFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgIGFuaW1hdGlvbnNbMl1bJ29wdHMnXS55MiA9IHBhcnNlSW50KHkyU2xpZGVyRWxlbWVudC52YWx1ZSk7XHJcbiAgICBsb3plbmdlVGVzdGVyLmluaXQoYW5pbWF0aW9uc1syXVsnb3B0cyddKTtcclxuICB9KTtcclxufVxyXG5cclxuLy9sb3plbmdlIFNwaXJyb2dyYXBoXHJcbmZ1bmN0aW9uIGFkZExTRXZlbnRMaXN0ZW5lclJldmVyc2VEWCgpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhbmltYXRpb25zWzNdWydyZXZlcnNlRFhCdXR0J10pLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbG96ZW5nZVNwaXJyb2dyYXBoLnJldmVyc2VEWCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZExTRXZlbnRMaXN0ZW5lclJldmVyc2VEWSgpIHtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChhbmltYXRpb25zWzNdWydyZXZlcnNlRFlCdXR0J10pLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgbG96ZW5nZVNwaXJyb2dyYXBoLnJldmVyc2VEWSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFkZExTRXZlbnRMaXN0ZW5lclN3aXRjaFhZKCkge1xyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGFuaW1hdGlvbnNbM11bJ3N3aXRjaFhZQnV0dCddKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGxvemVuZ2VTcGlycm9ncmFwaC5zd2l0Y2hYWSk7XHJcbn1cclxuIl19
