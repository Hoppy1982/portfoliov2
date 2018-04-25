(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const canvasHelpers = require('./utils/canvasHelpers.js')

let body = document.getElementsByTagName('body')[0]
let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')

let canvasWidth
let canvasHeight

//Holding pattern WP coords as ratio of canvas size
let holdingPatternWaypoints = [
  {x: 0.125, y: 0.5},//0
  {x: 0.25, y: 0.125},//1
  {x: 0.75, y: 0.125},//2
  {x: 0.875, y: 0.5},//3
  {x: 0.75, y: 0.875},//4
  {x: 0.25, y: 0.875}//5
]

//Holding pattern WP coords in pixels, recalcumalated on resize
let holdingPatternWaypointsActual = []

//Particles move about between these arrays, changing behaviour as thy do
let holdingPatternParticles = []

//------------------------------------------------------------------BREAK POINTS
function setLayout() {
  console.log(`body.clientWidth: ${body.clientWidth}, body.clientHeight: ${body.clientHeight}`)

  //small width in portrait
  if (body.clientHeight > body.clientWidth && body.clientWidth <= 480) {
    console.log('SCREEN: small width in portrait')
    canvasWidth = body.clientWidth
    canvasHeight = body.clientHeight * 0.5
  }
  //small height in landscape
  if (body.clientHeight < body.clientWidth && body.clientHeight <= 480) {
    console.log('SCREEN: small height in landscape')
    canvasWidth = body.clientWidth * 0.5
    canvasHeight = body.clientHeight
  }

  //medium width in portrait
  if (body.clientHeight > body.clientWidth && body.clientWidth <= 1024 && body.clientWidth > 480) {
    console.log('SCREEN: medium width in portrait')
    canvasWidth = body.clientWidth
    canvasHeight = body.clientHeight * 0.7
  }
  //medium height in landscape
  if (body.clientHeight < body.clientWidth && body.clientHeight <= 1024 && body.clientHeight > 480) {
    console.log('SCREEN: medium height in landscape')
    canvasWidth = body.clientWidth * 0.65
    canvasHeight = body.clientHeight
  }

  //large width in portrait
  if (body.clientHeight > body.clientWidth && body.clientWidth > 1024) {
    console.log('SCREEN: large width in portrait')
    canvasWidth = body.clientWidth
    canvasHeight = body.clientHeight * 0.65
  }
  //large height in landscape
  if (body.clientHeight < body.clientWidth && body.clientHeight > 1024) {
    console.log('SCREEN: large height in landscape')
    canvasWidth = body.clientWidth * 0.65
    canvasHeight = body.clientHeight
  }

  canvas1.width = canvasWidth
  canvas1.height = canvasHeight

  //move this lot somewhere more betterer
  initHoldingPatternWaypointsActual()
  createRandomHoldingPatternParticle()
  canvasHelpers.renderBoundingCircle(ctx1, canvasWidth, canvasHeight)
  canvasHelpers.renderHoldPatternWPs(ctx1, holdingPatternWaypointsActual)
  canvasHelpers.renderChosenHoldPatternParticlePath(ctx1, holdingPatternParticles[0])
}

function initHoldingPatternWaypointsActual() {
  holdingPatternWaypointsActual.length = 0
  holdingPatternWaypointsActual = holdingPatternWaypoints.map(el => {
    let x = el.x * canvasWidth
    let y = el.y * canvasHeight
    return {x: x, y: y}
  })
}

//------------------------------------------------------------PARTICLE CLASSES
class Particle {
  constructor(coords, age, speed) {
    this.coords = coords
    this.age = age
    this.speed = speed
  }
  listProps() {//temp method for testing
    for (let key in this) {
      console.log(`${key}: ${this[key]}`)
    }
  }
}

class PathFollowingParticle extends Particle {
  constructor(coords, age, speed, endCoords, distMoved) {
    super(coords, age, speed)
    this.endCoords = endCoords
    this.distMoved = distMoved
  }
}

class HoldingPatternParticle extends PathFollowingParticle {
  constructor(coords, age, speed, endCoords, distMoved, cp1Coords, cp2Coords) {
    super(coords, age, speed, endCoords, distMoved)
    this.cp1Coords = cp1Coords
    this.cp2Coords = cp2Coords
  }
}

function createRandomHoldingPatternParticle() {
  let randomWP = Math.floor(Math.random() * 6)

  let age = 0
  let speed = 10
  let distMoved = 0//randomise 0-1??
  let coords = holdingPatternWaypointsActual[randomWP]
  let endCoords = randomWP === 5 ? holdingPatternWaypointsActual[0] : holdingPatternWaypointsActual[randomWP + 1]
  let cp1Coords = randControlPoint(coords, endCoords)
  let cp2Coords = randControlPoint(coords, endCoords)

  function randControlPoint(p1, p2) {
    let a = p2.x - p1.x
    let b = p2.y - p1.y
    let p1P2Dist = Math.sqrt(a*a + b*b)
    let randDist = (Math.random() * p1P2Dist * 0.5) + 40
    let p1P2Angle
    let randAngle
    let coords = {x: null, y: null}

    if(Math.random() >= 0.5) {
      tPoint = 'p2'
      p1P2Angle = Math.atan2(p2.y - p1.y, p1.x - p2.x)
    } else {
      p1P2Angle = Math.atan2(p1.y - p2.y, p2.x - p1.x)
      tPoint = 'p1'
    }

    randAngle = p1P2Angle - (Math.PI / 2) + (Math.random() * Math.PI)

    if (tPoint === 'p1') {
      coords.x = p1.x + Math.cos(randAngle) * randDist
      coords.y = p1.y - Math.sin(randAngle) * randDist
    }
    if (tPoint === 'p2') {
      coords.x = p2.x + Math.cos(randAngle) * randDist
      coords.y = p2.y - Math.sin(randAngle) * randDist
    }

    return coords
  }

  let particle = new HoldingPatternParticle(coords, age, speed, endCoords, distMoved, cp1Coords, cp2Coords)
  holdingPatternParticles.push(particle)
}

//function to goes over every holdingPatternParticle in
//holdingPatternArray and implements some behaviour

//function that populates holdingPatternWaypoints

//function that updates each particles x & y on window resize

document.addEventListener("DOMContentLoaded", setLayout)
window.addEventListener('resize', setLayout)

},{"./utils/canvasHelpers.js":2}],2:[function(require,module,exports){
//-----------------------------DEV FUNCTIONS WOT FOR VISUALISING WHAT'S OCCURING
function renderBoundingCircle(ctx, canvasWidth, canvasHeight) {
  let centerX = canvasWidth / 2
  let centerY = canvasHeight / 2
  let radius = centerY > centerX ? centerX - 2 : centerY - 2
  let startAngle = 0
  let endAngle = 2 * Math.PI
  ctx.lineWidth = 1
  ctx.strokeStyle = 'grey'
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, startAngle, endAngle)
  ctx.stroke()
}

function renderHoldPatternWPs(ctx, arr) {
  ctx.beginPath()
  ctx.fillStyle = 'blue'
  arr.forEach(wp => {
    ctx.fillRect(wp.x - 6, wp.y - 6, 12, 12)
  })
  ctx.stroke()
}

function renderChosenHoldPatternParticlePath(ctx, particle) {
  let cp1X = particle.cp1Coords.x
  let cp1Y = particle.cp1Coords.y
  let cp2X = particle.cp2Coords.x
  let cp2Y = particle.cp2Coords.y
  let startX = particle.coords.x
  let startY = particle.coords.y
  let endX = particle.endCoords.x
  let endY = particle.endCoords.y
  ctx.lineWidth = 2
  //render start point
  ctx.beginPath()
  ctx.strokeStyle = 'green'
  ctx.rect(startX - 4, startY - 4, 8, 8 )
  ctx.stroke()
  //render end point
  ctx.strokeStyle = 'red'
  ctx.beginPath()
  ctx.rect(endX - 4, endY - 4, 8, 8 )
  ctx.stroke()
  //render control point 1
  ctx.beginPath()
  ctx.strokeStyle = 'yellow'
  ctx.rect(cp1X - 4, cp1Y - 4, 8, 8)
  ctx.stroke()
  //render control point 2
  ctx.beginPath()
  ctx.strokeStyle = 'orange'
  ctx.rect(cp2X - 4, cp2Y - 4, 8, 8)
  ctx.stroke()
  //render path
  ctx.beginPath()
  ctx.strokeStyle = 'white'
  ctx.moveTo(startX, startY)
  ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY)
  ctx.stroke()
}

//------------------------------------------------------------exported functions
module.exports = {
  renderBoundingCircle,
  renderHoldPatternWPs,
  renderChosenHoldPatternParticlePath
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2FudmFzSGVscGVycy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGNhbnZhc0hlbHBlcnMgPSByZXF1aXJlKCcuL3V0aWxzL2NhbnZhc0hlbHBlcnMuanMnKVxyXG5cclxubGV0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdXHJcbmxldCBjYW52YXMxID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2NhbnZhcycpWzBdXHJcbmxldCBjdHgxID0gY2FudmFzMS5nZXRDb250ZXh0KCcyZCcpXHJcblxyXG5sZXQgY2FudmFzV2lkdGhcclxubGV0IGNhbnZhc0hlaWdodFxyXG5cclxuLy9Ib2xkaW5nIHBhdHRlcm4gV1AgY29vcmRzIGFzIHJhdGlvIG9mIGNhbnZhcyBzaXplXHJcbmxldCBob2xkaW5nUGF0dGVybldheXBvaW50cyA9IFtcclxuICB7eDogMC4xMjUsIHk6IDAuNX0sLy8wXHJcbiAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzFcclxuICB7eDogMC43NSwgeTogMC4xMjV9LC8vMlxyXG4gIHt4OiAwLjg3NSwgeTogMC41fSwvLzNcclxuICB7eDogMC43NSwgeTogMC44NzV9LC8vNFxyXG4gIHt4OiAwLjI1LCB5OiAwLjg3NX0vLzVcclxuXVxyXG5cclxuLy9Ib2xkaW5nIHBhdHRlcm4gV1AgY29vcmRzIGluIHBpeGVscywgcmVjYWxjdW1hbGF0ZWQgb24gcmVzaXplXHJcbmxldCBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbCA9IFtdXHJcblxyXG4vL1BhcnRpY2xlcyBtb3ZlIGFib3V0IGJldHdlZW4gdGhlc2UgYXJyYXlzLCBjaGFuZ2luZyBiZWhhdmlvdXIgYXMgdGh5IGRvXHJcbmxldCBob2xkaW5nUGF0dGVyblBhcnRpY2xlcyA9IFtdXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUJSRUFLIFBPSU5UU1xyXG5mdW5jdGlvbiBzZXRMYXlvdXQoKSB7XHJcbiAgY29uc29sZS5sb2coYGJvZHkuY2xpZW50V2lkdGg6ICR7Ym9keS5jbGllbnRXaWR0aH0sIGJvZHkuY2xpZW50SGVpZ2h0OiAke2JvZHkuY2xpZW50SGVpZ2h0fWApXHJcblxyXG4gIC8vc21hbGwgd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC41XHJcbiAgfVxyXG4gIC8vc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcblxyXG4gIC8vbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDEwMjQgJiYgYm9keS5jbGllbnRXaWR0aCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjdcclxuICB9XHJcbiAgLy9tZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gMTAyNCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcblxyXG4gIC8vbGFyZ2Ugd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPiAxMDI0KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBsYXJnZSB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC42NVxyXG4gIH1cclxuICAvL2xhcmdlIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0ID4gMTAyNCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbGFyZ2UgaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjY1XHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuXHJcbiAgY2FudmFzMS53aWR0aCA9IGNhbnZhc1dpZHRoXHJcbiAgY2FudmFzMS5oZWlnaHQgPSBjYW52YXNIZWlnaHRcclxuXHJcbiAgLy9tb3ZlIHRoaXMgbG90IHNvbWV3aGVyZSBtb3JlIGJldHRlcmVyXHJcbiAgaW5pdEhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKClcclxuICBjcmVhdGVSYW5kb21Ib2xkaW5nUGF0dGVyblBhcnRpY2xlKClcclxuICBjYW52YXNIZWxwZXJzLnJlbmRlckJvdW5kaW5nQ2lyY2xlKGN0eDEsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpXHJcbiAgY2FudmFzSGVscGVycy5yZW5kZXJIb2xkUGF0dGVybldQcyhjdHgxLCBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbClcclxuICBjYW52YXNIZWxwZXJzLnJlbmRlckNob3NlbkhvbGRQYXR0ZXJuUGFydGljbGVQYXRoKGN0eDEsIGhvbGRpbmdQYXR0ZXJuUGFydGljbGVzWzBdKVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0SG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWwoKSB7XHJcbiAgaG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWwubGVuZ3RoID0gMFxyXG4gIGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsID0gaG9sZGluZ1BhdHRlcm5XYXlwb2ludHMubWFwKGVsID0+IHtcclxuICAgIGxldCB4ID0gZWwueCAqIGNhbnZhc1dpZHRoXHJcbiAgICBsZXQgeSA9IGVsLnkgKiBjYW52YXNIZWlnaHRcclxuICAgIHJldHVybiB7eDogeCwgeTogeX1cclxuICB9KVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVBBUlRJQ0xFIENMQVNTRVNcclxuY2xhc3MgUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3JkcywgYWdlLCBzcGVlZCkge1xyXG4gICAgdGhpcy5jb29yZHMgPSBjb29yZHNcclxuICAgIHRoaXMuYWdlID0gYWdlXHJcbiAgICB0aGlzLnNwZWVkID0gc3BlZWRcclxuICB9XHJcbiAgbGlzdFByb3BzKCkgey8vdGVtcCBtZXRob2QgZm9yIHRlc3RpbmdcclxuICAgIGZvciAobGV0IGtleSBpbiB0aGlzKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGAke2tleX06ICR7dGhpc1trZXldfWApXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBQYXRoRm9sbG93aW5nUGFydGljbGUgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBhZ2UsIHNwZWVkLCBlbmRDb29yZHMsIGRpc3RNb3ZlZCkge1xyXG4gICAgc3VwZXIoY29vcmRzLCBhZ2UsIHNwZWVkKVxyXG4gICAgdGhpcy5lbmRDb29yZHMgPSBlbmRDb29yZHNcclxuICAgIHRoaXMuZGlzdE1vdmVkID0gZGlzdE1vdmVkXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBIb2xkaW5nUGF0dGVyblBhcnRpY2xlIGV4dGVuZHMgUGF0aEZvbGxvd2luZ1BhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIGFnZSwgc3BlZWQsIGVuZENvb3JkcywgZGlzdE1vdmVkLCBjcDFDb29yZHMsIGNwMkNvb3Jkcykge1xyXG4gICAgc3VwZXIoY29vcmRzLCBhZ2UsIHNwZWVkLCBlbmRDb29yZHMsIGRpc3RNb3ZlZClcclxuICAgIHRoaXMuY3AxQ29vcmRzID0gY3AxQ29vcmRzXHJcbiAgICB0aGlzLmNwMkNvb3JkcyA9IGNwMkNvb3Jkc1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlUmFuZG9tSG9sZGluZ1BhdHRlcm5QYXJ0aWNsZSgpIHtcclxuICBsZXQgcmFuZG9tV1AgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2KVxyXG5cclxuICBsZXQgYWdlID0gMFxyXG4gIGxldCBzcGVlZCA9IDEwXHJcbiAgbGV0IGRpc3RNb3ZlZCA9IDAvL3JhbmRvbWlzZSAwLTE/P1xyXG4gIGxldCBjb29yZHMgPSBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbFtyYW5kb21XUF1cclxuICBsZXQgZW5kQ29vcmRzID0gcmFuZG9tV1AgPT09IDUgPyBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbFswXSA6IGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW3JhbmRvbVdQICsgMV1cclxuICBsZXQgY3AxQ29vcmRzID0gcmFuZENvbnRyb2xQb2ludChjb29yZHMsIGVuZENvb3JkcylcclxuICBsZXQgY3AyQ29vcmRzID0gcmFuZENvbnRyb2xQb2ludChjb29yZHMsIGVuZENvb3JkcylcclxuXHJcbiAgZnVuY3Rpb24gcmFuZENvbnRyb2xQb2ludChwMSwgcDIpIHtcclxuICAgIGxldCBhID0gcDIueCAtIHAxLnhcclxuICAgIGxldCBiID0gcDIueSAtIHAxLnlcclxuICAgIGxldCBwMVAyRGlzdCA9IE1hdGguc3FydChhKmEgKyBiKmIpXHJcbiAgICBsZXQgcmFuZERpc3QgPSAoTWF0aC5yYW5kb20oKSAqIHAxUDJEaXN0ICogMC41KSArIDQwXHJcbiAgICBsZXQgcDFQMkFuZ2xlXHJcbiAgICBsZXQgcmFuZEFuZ2xlXHJcbiAgICBsZXQgY29vcmRzID0ge3g6IG51bGwsIHk6IG51bGx9XHJcblxyXG4gICAgaWYoTWF0aC5yYW5kb20oKSA+PSAwLjUpIHtcclxuICAgICAgdFBvaW50ID0gJ3AyJ1xyXG4gICAgICBwMVAyQW5nbGUgPSBNYXRoLmF0YW4yKHAyLnkgLSBwMS55LCBwMS54IC0gcDIueClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHAxUDJBbmdsZSA9IE1hdGguYXRhbjIocDEueSAtIHAyLnksIHAyLnggLSBwMS54KVxyXG4gICAgICB0UG9pbnQgPSAncDEnXHJcbiAgICB9XHJcblxyXG4gICAgcmFuZEFuZ2xlID0gcDFQMkFuZ2xlIC0gKE1hdGguUEkgLyAyKSArIChNYXRoLnJhbmRvbSgpICogTWF0aC5QSSlcclxuXHJcbiAgICBpZiAodFBvaW50ID09PSAncDEnKSB7XHJcbiAgICAgIGNvb3Jkcy54ID0gcDEueCArIE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gICAgICBjb29yZHMueSA9IHAxLnkgLSBNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICAgIH1cclxuICAgIGlmICh0UG9pbnQgPT09ICdwMicpIHtcclxuICAgICAgY29vcmRzLnggPSBwMi54ICsgTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgICAgIGNvb3Jkcy55ID0gcDIueSAtIE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb29yZHNcclxuICB9XHJcblxyXG4gIGxldCBwYXJ0aWNsZSA9IG5ldyBIb2xkaW5nUGF0dGVyblBhcnRpY2xlKGNvb3JkcywgYWdlLCBzcGVlZCwgZW5kQ29vcmRzLCBkaXN0TW92ZWQsIGNwMUNvb3JkcywgY3AyQ29vcmRzKVxyXG4gIGhvbGRpbmdQYXR0ZXJuUGFydGljbGVzLnB1c2gocGFydGljbGUpXHJcbn1cclxuXHJcbi8vZnVuY3Rpb24gdG8gZ29lcyBvdmVyIGV2ZXJ5IGhvbGRpbmdQYXR0ZXJuUGFydGljbGUgaW5cclxuLy9ob2xkaW5nUGF0dGVybkFycmF5IGFuZCBpbXBsZW1lbnRzIHNvbWUgYmVoYXZpb3VyXHJcblxyXG4vL2Z1bmN0aW9uIHRoYXQgcG9wdWxhdGVzIGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzXHJcblxyXG4vL2Z1bmN0aW9uIHRoYXQgdXBkYXRlcyBlYWNoIHBhcnRpY2xlcyB4ICYgeSBvbiB3aW5kb3cgcmVzaXplXHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzZXRMYXlvdXQpXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzZXRMYXlvdXQpXHJcbiIsIi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1ERVYgRlVOQ1RJT05TIFdPVCBGT1IgVklTVUFMSVNJTkcgV0hBVCdTIE9DQ1VSSU5HXHJcbmZ1bmN0aW9uIHJlbmRlckJvdW5kaW5nQ2lyY2xlKGN0eCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkge1xyXG4gIGxldCBjZW50ZXJYID0gY2FudmFzV2lkdGggLyAyXHJcbiAgbGV0IGNlbnRlclkgPSBjYW52YXNIZWlnaHQgLyAyXHJcbiAgbGV0IHJhZGl1cyA9IGNlbnRlclkgPiBjZW50ZXJYID8gY2VudGVyWCAtIDIgOiBjZW50ZXJZIC0gMlxyXG4gIGxldCBzdGFydEFuZ2xlID0gMFxyXG4gIGxldCBlbmRBbmdsZSA9IDIgKiBNYXRoLlBJXHJcbiAgY3R4LmxpbmVXaWR0aCA9IDFcclxuICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JleSdcclxuICBjdHguYmVnaW5QYXRoKClcclxuICBjdHguYXJjKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckhvbGRQYXR0ZXJuV1BzKGN0eCwgYXJyKSB7XHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LmZpbGxTdHlsZSA9ICdibHVlJ1xyXG4gIGFyci5mb3JFYWNoKHdwID0+IHtcclxuICAgIGN0eC5maWxsUmVjdCh3cC54IC0gNiwgd3AueSAtIDYsIDEyLCAxMilcclxuICB9KVxyXG4gIGN0eC5zdHJva2UoKVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJDaG9zZW5Ib2xkUGF0dGVyblBhcnRpY2xlUGF0aChjdHgsIHBhcnRpY2xlKSB7XHJcbiAgbGV0IGNwMVggPSBwYXJ0aWNsZS5jcDFDb29yZHMueFxyXG4gIGxldCBjcDFZID0gcGFydGljbGUuY3AxQ29vcmRzLnlcclxuICBsZXQgY3AyWCA9IHBhcnRpY2xlLmNwMkNvb3Jkcy54XHJcbiAgbGV0IGNwMlkgPSBwYXJ0aWNsZS5jcDJDb29yZHMueVxyXG4gIGxldCBzdGFydFggPSBwYXJ0aWNsZS5jb29yZHMueFxyXG4gIGxldCBzdGFydFkgPSBwYXJ0aWNsZS5jb29yZHMueVxyXG4gIGxldCBlbmRYID0gcGFydGljbGUuZW5kQ29vcmRzLnhcclxuICBsZXQgZW5kWSA9IHBhcnRpY2xlLmVuZENvb3Jkcy55XHJcbiAgY3R4LmxpbmVXaWR0aCA9IDJcclxuICAvL3JlbmRlciBzdGFydCBwb2ludFxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICdncmVlbidcclxuICBjdHgucmVjdChzdGFydFggLSA0LCBzdGFydFkgLSA0LCA4LCA4IClcclxuICBjdHguc3Ryb2tlKClcclxuICAvL3JlbmRlciBlbmQgcG9pbnRcclxuICBjdHguc3Ryb2tlU3R5bGUgPSAncmVkJ1xyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5yZWN0KGVuZFggLSA0LCBlbmRZIC0gNCwgOCwgOCApXHJcbiAgY3R4LnN0cm9rZSgpXHJcbiAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAxXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ3llbGxvdydcclxuICBjdHgucmVjdChjcDFYIC0gNCwgY3AxWSAtIDQsIDgsIDgpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbiAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAyXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ29yYW5nZSdcclxuICBjdHgucmVjdChjcDJYIC0gNCwgY3AyWSAtIDQsIDgsIDgpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbiAgLy9yZW5kZXIgcGF0aFxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSdcclxuICBjdHgubW92ZVRvKHN0YXJ0WCwgc3RhcnRZKVxyXG4gIGN0eC5iZXppZXJDdXJ2ZVRvKGNwMVgsIGNwMVksIGNwMlgsIGNwMlksIGVuZFgsIGVuZFkpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tZXhwb3J0ZWQgZnVuY3Rpb25zXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHJlbmRlckJvdW5kaW5nQ2lyY2xlLFxyXG4gIHJlbmRlckhvbGRQYXR0ZXJuV1BzLFxyXG4gIHJlbmRlckNob3NlbkhvbGRQYXR0ZXJuUGFydGljbGVQYXRoXHJcbn1cclxuIl19
