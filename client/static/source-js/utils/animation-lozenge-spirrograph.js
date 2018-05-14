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
