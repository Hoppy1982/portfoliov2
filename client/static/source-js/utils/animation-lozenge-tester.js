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
