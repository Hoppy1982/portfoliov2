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
