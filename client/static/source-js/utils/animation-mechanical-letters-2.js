// portfolio
// animation-mechanical-letters-2.js

const animationUtils = require('./animation-utils');

//later on pass opts object in to init from parent script
let fallBackOpts = {
  canvasElementId: 'ML2Canvas',
  str: 'aba',
  letterOuterColor: '#000000',
  letterInnerColor: 'transparent',
  letterDetailColor: '#ff0000',
  letterLineSizeRatio: 0.2,
  letterOutlineSizeRatio: 0.04,
  letterXPadRatio: 0.1,
  letterYPadRatio: 0
}
//state
let canvas;
let ctx;
let frameId;
let nLetters;
let isPaused;

let letterBoxWidth;
let letterBoxHeight;
let letterXPad;
let letterYPad;
let letterWidth;
let letterHeight;
let letterLineSize;
let letterOutlineSize

let ML2Arr = [];

//------------------------------------------------------------exported functions
function init() {
  canvas = document.getElementById(fallBackOpts.canvasElementId);
  ctx = canvas.getContext('2d');
  nLetters = fallBackOpts.str.length;
  isPaused = false;

  letterBoxWidth = Math.round(canvas.width / nLetters);
  letterBoxHeight = canvas.height;
  letterXpad = Math.round(letterBoxWidth * fallBackOpts.letterXPadRatio);
  letterYPad = Math.round(letterBoxHeight * fallBackOpts.letterPadYRatio);
  letterWidth = letterBoxWidth - 2 * letterXPad;
  letterHeight = letterBoxHeight - 2 * letterYPad;
  letterLineSize = Math.round(letterBoxWidth * fallBackOpts.letterLineSizeRatio);
  letterOutlineSize = Math.round(letterBoxWidth * fallBackOpts.letterOutlineSizeRatio);

  ML2Arr.length = 0;
  initML2Arr();
  tempTester();
}

function animate() {

}

function cancelAnimation() {

}

function toggleRunAnimation() {

}

//------------------------------------------------------------internal functions
function calcLetterEdges(letterPosInStr) {

}

function initML2Arr() {

}

function tempTester() {
  let x1 = parseInt(document.getElementById('ML2x1').value);
  let y1 = parseInt(document.getElementById('ML2y1').value);
  let x2 = parseInt(document.getElementById('ML2x2').value);
  let y2 = parseInt(document.getElementById('ML2y2').value);
  let ctx = document.getElementById('ML2Canvas').getContext('2d');
  ctx.clearRect(0, 0, 400, 400);
  ctx.beginPath();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#000000';
  ctx.fillStyle = 'transparent';
  animationUtils.drawLozenge(ctx, x1, y1, x2, y2, 20);
  ctx.stroke();
  ctx.fill();
}
//-----------------------------------------------------------------------exports
exports.init = init;
exports.animate = animate;
exports.cancelAnimation = cancelAnimation;
exports.toggleRunAnimation = toggleRunAnimation;
