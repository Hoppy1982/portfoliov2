(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const canvasHelpers = require('./utils/canvas-helpers.js')

let body = document.getElementsByTagName('body')[0]
let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')
let frameId
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

//Particles move about between these arrays, changing behaviour as they do
let holdingPatternParticles = []
//array for nav target lettering particles
//array for spawning pool particles
//array for wormhole leaving particles
//array for particles transitioning between main arrays???

//----------------------------------------------------------------------MANAGERS
//possibly split this into a function that fires just once on dom load,
//then another manager that runs on resizing?
function init() {
  setLayout()
  initHoldingPatternWaypointsActual()
  createRandomHoldingPatternParticle()
  animate()
}

function initHoldingPatternWaypointsActual() {
  holdingPatternWaypointsActual.length = 0
  holdingPatternWaypointsActual = holdingPatternWaypoints.map(el => {
    let x = el.x * canvasWidth
    let y = el.y * canvasHeight
    return {x: x, y: y}
  })
}

//--------------------------------------------UPDATE PARTICLE POSITIONS & RENDER
function animate() {
  frameId = requestAnimationFrame(animate)
  ctx1.clearRect(0, 0, canvasWidth, canvasHeight)

  canvasHelpers.renderBoundingCircle(ctx1, canvasWidth, canvasHeight)
  canvasHelpers.renderHoldPatternWPs(ctx1, holdingPatternWaypointsActual)
  canvasHelpers.renderChosenHoldPatternParticlePath(ctx1, holdingPatternParticles[0])
  updateHoldPattern()
}

function updateHoldPattern() {
  holdingPatternParticles.forEach(particle => {

    particle.distMoved = particle.distMoved + particle.speed

    if(particle.distMoved >= 1) {
      particle.distMoved = 0
      particle.startCoords.x = particle.endCoords.x
      particle.startCoords.y = particle.endCoords.y
      particle.coords.x = particle.startCoords.x
      particle.coords.y = particle.startCoords.y

      particle.fromWP = particle.fromWP + 1
      if(particle.fromWP === holdingPatternWaypoints.length) {particle.fromWP = 0}
      particle.toWP = particle.toWP + 1
      if(particle.toWP === holdingPatternWaypoints.length) {particle.toWP = 0}
      console.log(`fromWP: ${particle.fromWP} , toWP: ${particle.toWP}`)

      particle.endCoords.x = holdingPatternWaypointsActual[particle.toWP].x
      particle.endCoords.y = holdingPatternWaypointsActual[particle.toWP].y

      particle.cp1Coords = canvasHelpers.randPointBetweenTwoPoints(particle.startCoords, particle.endCoords)
      particle.cp2Coords = canvasHelpers.randPointBetweenTwoPoints(particle.startCoords, particle.endCoords)

      console.log(holdingPatternWaypointsActual)
    }

    particle.coords.x = canvasHelpers.coordsOnCubicBezier(particle.distMoved, particle.startCoords.x, particle.cp1Coords.x, particle.cp2Coords.x, particle.endCoords.x)
    particle.coords.y = canvasHelpers.coordsOnCubicBezier(particle.distMoved, particle.startCoords.y, particle.cp1Coords.y, particle.cp2Coords.y, particle.endCoords.y)

    particle.draw()

  })
}

//------------------------------------------------------------------BREAK POINTS
function setLayout() {
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
}

//--------------------------------------------------------------PARTICLE CLASSES
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
  draw() {//default self render for particles, maybe change later
    ctx1.beginPath()
    ctx1.lineWidth = 3
    ctx1.strokeStyle = 'white'
    ctx1.fillStyle = 'black'
    ctx1.arc(this.coords.x, this.coords.y, 3, 0, Math.PI * 2, false)
    ctx1.stroke()
    ctx1.fill()
  }
}

class PathFollowingParticle extends Particle {
  constructor(startCoords, endCoords, coords, age, speed, distMoved) {
    super(coords, age, speed)
    this.startCoords = startCoords
    this.endCoords = endCoords
    this.distMoved = distMoved
  }
}

class HoldingPatternParticle extends PathFollowingParticle {
  constructor(startCoords, endCoords, coords, age, speed, distMoved, cp1Coords, cp2Coords, fromWP, toWP) {
    super(startCoords, endCoords, coords, age, speed, distMoved)
    this.cp1Coords = cp1Coords
    this.cp2Coords = cp2Coords
    this.fromWP = fromWP
    this.toWP = toWP
  }
}

//not final version, not sure what logic to put in the constructor and what here
function createRandomHoldingPatternParticle() {
  holdingPatternParticles.length = 0
  let fromWP = Math.floor(Math.random() * 6)
  let toWP = fromWP + 1
  if(toWP === holdingPatternWaypoints.length) {toWP = 0}
  let age = 0
  let speed = 0.01
  let distMoved = 0//randomise 0-1??
  let startCoords = {x: null, y: null}
  startCoords.x = holdingPatternWaypointsActual[fromWP].x
  startCoords.y = holdingPatternWaypointsActual[fromWP].y
  let endCoords = {x: null, y: null}
  endCoords.x = holdingPatternWaypointsActual[toWP].x
  endCoords.y = holdingPatternWaypointsActual[toWP].y
  let coords = {x: startCoords.x, y: startCoords.y}
  let cp1Coords = canvasHelpers.randPointBetweenTwoPoints(coords, endCoords)
  let cp2Coords = canvasHelpers.randPointBetweenTwoPoints(coords, endCoords)

  let particle = new HoldingPatternParticle(startCoords, endCoords, coords, age, speed, distMoved, cp1Coords, cp2Coords, fromWP, toWP)
  holdingPatternParticles.push(particle)
}

//function to goes over every holdingPatternParticle in
//holdingPatternArray and implements some behaviour

//function that populates holdingPatternWaypoints

//function that updates each particles x & y on window resize

document.addEventListener("DOMContentLoaded", init)
window.addEventListener('resize', init)

},{"./utils/canvas-helpers.js":2}],2:[function(require,module,exports){
//--------------------------------------------------------------GEOMETRY HELPERS
function randPointBetweenTwoPoints(p1, p2) {
  const MIN_DIST = 40
  const DIST_MOD = 0.5
  const ANGLE_WITHIN = Math.PI
  let a = p2.x - p1.x
  let b = p2.y - p1.y
  let p1P2Dist = Math.sqrt(a*a + b*b)
  let randDist = (Math.random() * p1P2Dist * DIST_MOD) + MIN_DIST
  let angleMod = (Math.random() * ANGLE_WITHIN) - (ANGLE_WITHIN / 2)
  let randAngle
  let coords = {x: null, y: null}

  if(Math.random() >= 0.5) {
    randAngle = Math.atan2(p2.y - p1.y, p1.x - p2.x) + angleMod
    coords.x = p2.x + Math.cos(randAngle) * randDist
    coords.y = p2.y - Math.sin(randAngle) * randDist
  } else {
    randAngle = Math.atan2(p1.y - p2.y, p2.x - p1.x) + angleMod
    coords.x = p1.x + Math.cos(randAngle) * randDist
    coords.y = p1.y - Math.sin(randAngle) * randDist
  }

  return coords
}

function randPointNearPoint(p) {

}

//stolen from stackoverflow, I understand shit all but it works
function coordsOnCubicBezier(percent, startPt, cp1, cp2, endPt) {
  let t2 = percent * percent
  let t3 = t2 * percent

  return startPt + (-startPt * 3 + percent * (3 * startPt - startPt * percent)) * percent
  + (3 * cp1 + percent * (-6 * cp1 + cp1 * 3 * percent)) * percent
  + (cp2 * 3 - cp2 * 3 * percent) * t2
  + endPt * t3
}

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
  let startX = particle.startCoords.x
  let startY = particle.startCoords.y
  let endX = particle.endCoords.x
  let endY = particle.endCoords.y
  ctx.lineWidth = 1
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
  randPointBetweenTwoPoints,
  coordsOnCubicBezier,
  //dev
  renderBoundingCircle,
  renderHoldPatternWPs,
  renderChosenHoldPatternParticlePath
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2FudmFzLWhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGNhbnZhc0hlbHBlcnMgPSByZXF1aXJlKCcuL3V0aWxzL2NhbnZhcy1oZWxwZXJzLmpzJylcclxuXHJcbmxldCBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXVxyXG5sZXQgY2FudmFzMSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjYW52YXMnKVswXVxyXG5sZXQgY3R4MSA9IGNhbnZhczEuZ2V0Q29udGV4dCgnMmQnKVxyXG5sZXQgZnJhbWVJZFxyXG5sZXQgY2FudmFzV2lkdGhcclxubGV0IGNhbnZhc0hlaWdodFxyXG5cclxuLy9Ib2xkaW5nIHBhdHRlcm4gV1AgY29vcmRzIGFzIHJhdGlvIG9mIGNhbnZhcyBzaXplXHJcbmxldCBob2xkaW5nUGF0dGVybldheXBvaW50cyA9IFtcclxuICB7eDogMC4xMjUsIHk6IDAuNX0sLy8wXHJcbiAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzFcclxuICB7eDogMC43NSwgeTogMC4xMjV9LC8vMlxyXG4gIHt4OiAwLjg3NSwgeTogMC41fSwvLzNcclxuICB7eDogMC43NSwgeTogMC44NzV9LC8vNFxyXG4gIHt4OiAwLjI1LCB5OiAwLjg3NX0vLzVcclxuXVxyXG5cclxuLy9Ib2xkaW5nIHBhdHRlcm4gV1AgY29vcmRzIGluIHBpeGVscywgcmVjYWxjdW1hbGF0ZWQgb24gcmVzaXplXHJcbmxldCBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbCA9IFtdXHJcblxyXG4vL1BhcnRpY2xlcyBtb3ZlIGFib3V0IGJldHdlZW4gdGhlc2UgYXJyYXlzLCBjaGFuZ2luZyBiZWhhdmlvdXIgYXMgdGhleSBkb1xyXG5sZXQgaG9sZGluZ1BhdHRlcm5QYXJ0aWNsZXMgPSBbXVxyXG4vL2FycmF5IGZvciBuYXYgdGFyZ2V0IGxldHRlcmluZyBwYXJ0aWNsZXNcclxuLy9hcnJheSBmb3Igc3Bhd25pbmcgcG9vbCBwYXJ0aWNsZXNcclxuLy9hcnJheSBmb3Igd29ybWhvbGUgbGVhdmluZyBwYXJ0aWNsZXNcclxuLy9hcnJheSBmb3IgcGFydGljbGVzIHRyYW5zaXRpb25pbmcgYmV0d2VlbiBtYWluIGFycmF5cz8/P1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTUFOQUdFUlNcclxuLy9wb3NzaWJseSBzcGxpdCB0aGlzIGludG8gYSBmdW5jdGlvbiB0aGF0IGZpcmVzIGp1c3Qgb25jZSBvbiBkb20gbG9hZCxcclxuLy90aGVuIGFub3RoZXIgbWFuYWdlciB0aGF0IHJ1bnMgb24gcmVzaXppbmc/XHJcbmZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgc2V0TGF5b3V0KClcclxuICBpbml0SG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWwoKVxyXG4gIGNyZWF0ZVJhbmRvbUhvbGRpbmdQYXR0ZXJuUGFydGljbGUoKVxyXG4gIGFuaW1hdGUoKVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0SG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWwoKSB7XHJcbiAgaG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWwubGVuZ3RoID0gMFxyXG4gIGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsID0gaG9sZGluZ1BhdHRlcm5XYXlwb2ludHMubWFwKGVsID0+IHtcclxuICAgIGxldCB4ID0gZWwueCAqIGNhbnZhc1dpZHRoXHJcbiAgICBsZXQgeSA9IGVsLnkgKiBjYW52YXNIZWlnaHRcclxuICAgIHJldHVybiB7eDogeCwgeTogeX1cclxuICB9KVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tVVBEQVRFIFBBUlRJQ0xFIFBPU0lUSU9OUyAmIFJFTkRFUlxyXG5mdW5jdGlvbiBhbmltYXRlKCkge1xyXG4gIGZyYW1lSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSlcclxuICBjdHgxLmNsZWFyUmVjdCgwLCAwLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KVxyXG5cclxuICBjYW52YXNIZWxwZXJzLnJlbmRlckJvdW5kaW5nQ2lyY2xlKGN0eDEsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpXHJcbiAgY2FudmFzSGVscGVycy5yZW5kZXJIb2xkUGF0dGVybldQcyhjdHgxLCBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbClcclxuICBjYW52YXNIZWxwZXJzLnJlbmRlckNob3NlbkhvbGRQYXR0ZXJuUGFydGljbGVQYXRoKGN0eDEsIGhvbGRpbmdQYXR0ZXJuUGFydGljbGVzWzBdKVxyXG4gIHVwZGF0ZUhvbGRQYXR0ZXJuKClcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlSG9sZFBhdHRlcm4oKSB7XHJcbiAgaG9sZGluZ1BhdHRlcm5QYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7XHJcblxyXG4gICAgcGFydGljbGUuZGlzdE1vdmVkID0gcGFydGljbGUuZGlzdE1vdmVkICsgcGFydGljbGUuc3BlZWRcclxuXHJcbiAgICBpZihwYXJ0aWNsZS5kaXN0TW92ZWQgPj0gMSkge1xyXG4gICAgICBwYXJ0aWNsZS5kaXN0TW92ZWQgPSAwXHJcbiAgICAgIHBhcnRpY2xlLnN0YXJ0Q29vcmRzLnggPSBwYXJ0aWNsZS5lbmRDb29yZHMueFxyXG4gICAgICBwYXJ0aWNsZS5zdGFydENvb3Jkcy55ID0gcGFydGljbGUuZW5kQ29vcmRzLnlcclxuICAgICAgcGFydGljbGUuY29vcmRzLnggPSBwYXJ0aWNsZS5zdGFydENvb3Jkcy54XHJcbiAgICAgIHBhcnRpY2xlLmNvb3Jkcy55ID0gcGFydGljbGUuc3RhcnRDb29yZHMueVxyXG5cclxuICAgICAgcGFydGljbGUuZnJvbVdQID0gcGFydGljbGUuZnJvbVdQICsgMVxyXG4gICAgICBpZihwYXJ0aWNsZS5mcm9tV1AgPT09IGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzLmxlbmd0aCkge3BhcnRpY2xlLmZyb21XUCA9IDB9XHJcbiAgICAgIHBhcnRpY2xlLnRvV1AgPSBwYXJ0aWNsZS50b1dQICsgMVxyXG4gICAgICBpZihwYXJ0aWNsZS50b1dQID09PSBob2xkaW5nUGF0dGVybldheXBvaW50cy5sZW5ndGgpIHtwYXJ0aWNsZS50b1dQID0gMH1cclxuICAgICAgY29uc29sZS5sb2coYGZyb21XUDogJHtwYXJ0aWNsZS5mcm9tV1B9ICwgdG9XUDogJHtwYXJ0aWNsZS50b1dQfWApXHJcblxyXG4gICAgICBwYXJ0aWNsZS5lbmRDb29yZHMueCA9IGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW3BhcnRpY2xlLnRvV1BdLnhcclxuICAgICAgcGFydGljbGUuZW5kQ29vcmRzLnkgPSBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbFtwYXJ0aWNsZS50b1dQXS55XHJcblxyXG4gICAgICBwYXJ0aWNsZS5jcDFDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMocGFydGljbGUuc3RhcnRDb29yZHMsIHBhcnRpY2xlLmVuZENvb3JkcylcclxuICAgICAgcGFydGljbGUuY3AyQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHBhcnRpY2xlLnN0YXJ0Q29vcmRzLCBwYXJ0aWNsZS5lbmRDb29yZHMpXHJcblxyXG4gICAgICBjb25zb2xlLmxvZyhob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbClcclxuICAgIH1cclxuXHJcbiAgICBwYXJ0aWNsZS5jb29yZHMueCA9IGNhbnZhc0hlbHBlcnMuY29vcmRzT25DdWJpY0JlemllcihwYXJ0aWNsZS5kaXN0TW92ZWQsIHBhcnRpY2xlLnN0YXJ0Q29vcmRzLngsIHBhcnRpY2xlLmNwMUNvb3Jkcy54LCBwYXJ0aWNsZS5jcDJDb29yZHMueCwgcGFydGljbGUuZW5kQ29vcmRzLngpXHJcbiAgICBwYXJ0aWNsZS5jb29yZHMueSA9IGNhbnZhc0hlbHBlcnMuY29vcmRzT25DdWJpY0JlemllcihwYXJ0aWNsZS5kaXN0TW92ZWQsIHBhcnRpY2xlLnN0YXJ0Q29vcmRzLnksIHBhcnRpY2xlLmNwMUNvb3Jkcy55LCBwYXJ0aWNsZS5jcDJDb29yZHMueSwgcGFydGljbGUuZW5kQ29vcmRzLnkpXHJcblxyXG4gICAgcGFydGljbGUuZHJhdygpXHJcblxyXG4gIH0pXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQlJFQUsgUE9JTlRTXHJcbmZ1bmN0aW9uIHNldExheW91dCgpIHtcclxuICAvL3NtYWxsIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNVxyXG4gIH1cclxuICAvL3NtYWxsIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0IDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG4gIC8vbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDEwMjQgJiYgYm9keS5jbGllbnRXaWR0aCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjdcclxuICB9XHJcbiAgLy9tZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gMTAyNCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcbiAgLy9sYXJnZSB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjY1XHJcbiAgfVxyXG4gIC8vbGFyZ2UgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPiAxMDI0KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBsYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG5cclxuICBjYW52YXMxLndpZHRoID0gY2FudmFzV2lkdGhcclxuICBjYW52YXMxLmhlaWdodCA9IGNhbnZhc0hlaWdodFxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tUEFSVElDTEUgQ0xBU1NFU1xyXG5jbGFzcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBhZ2UsIHNwZWVkKSB7XHJcbiAgICB0aGlzLmNvb3JkcyA9IGNvb3Jkc1xyXG4gICAgdGhpcy5hZ2UgPSBhZ2VcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZFxyXG4gIH1cclxuICBsaXN0UHJvcHMoKSB7Ly90ZW1wIG1ldGhvZCBmb3IgdGVzdGluZ1xyXG4gICAgZm9yIChsZXQga2V5IGluIHRoaXMpIHtcclxuICAgICAgY29uc29sZS5sb2coYCR7a2V5fTogJHt0aGlzW2tleV19YClcclxuICAgIH1cclxuICB9XHJcbiAgZHJhdygpIHsvL2RlZmF1bHQgc2VsZiByZW5kZXIgZm9yIHBhcnRpY2xlcywgbWF5YmUgY2hhbmdlIGxhdGVyXHJcbiAgICBjdHgxLmJlZ2luUGF0aCgpXHJcbiAgICBjdHgxLmxpbmVXaWR0aCA9IDNcclxuICAgIGN0eDEuc3Ryb2tlU3R5bGUgPSAnd2hpdGUnXHJcbiAgICBjdHgxLmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eDEuYXJjKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnksIDMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSlcclxuICAgIGN0eDEuc3Ryb2tlKClcclxuICAgIGN0eDEuZmlsbCgpXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBQYXRoRm9sbG93aW5nUGFydGljbGUgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3Ioc3RhcnRDb29yZHMsIGVuZENvb3JkcywgY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQpIHtcclxuICAgIHN1cGVyKGNvb3JkcywgYWdlLCBzcGVlZClcclxuICAgIHRoaXMuc3RhcnRDb29yZHMgPSBzdGFydENvb3Jkc1xyXG4gICAgdGhpcy5lbmRDb29yZHMgPSBlbmRDb29yZHNcclxuICAgIHRoaXMuZGlzdE1vdmVkID0gZGlzdE1vdmVkXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBIb2xkaW5nUGF0dGVyblBhcnRpY2xlIGV4dGVuZHMgUGF0aEZvbGxvd2luZ1BhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3RvcihzdGFydENvb3JkcywgZW5kQ29vcmRzLCBjb29yZHMsIGFnZSwgc3BlZWQsIGRpc3RNb3ZlZCwgY3AxQ29vcmRzLCBjcDJDb29yZHMsIGZyb21XUCwgdG9XUCkge1xyXG4gICAgc3VwZXIoc3RhcnRDb29yZHMsIGVuZENvb3JkcywgY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQpXHJcbiAgICB0aGlzLmNwMUNvb3JkcyA9IGNwMUNvb3Jkc1xyXG4gICAgdGhpcy5jcDJDb29yZHMgPSBjcDJDb29yZHNcclxuICAgIHRoaXMuZnJvbVdQID0gZnJvbVdQXHJcbiAgICB0aGlzLnRvV1AgPSB0b1dQXHJcbiAgfVxyXG59XHJcblxyXG4vL25vdCBmaW5hbCB2ZXJzaW9uLCBub3Qgc3VyZSB3aGF0IGxvZ2ljIHRvIHB1dCBpbiB0aGUgY29uc3RydWN0b3IgYW5kIHdoYXQgaGVyZVxyXG5mdW5jdGlvbiBjcmVhdGVSYW5kb21Ib2xkaW5nUGF0dGVyblBhcnRpY2xlKCkge1xyXG4gIGhvbGRpbmdQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA9IDBcclxuICBsZXQgZnJvbVdQID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNilcclxuICBsZXQgdG9XUCA9IGZyb21XUCArIDFcclxuICBpZih0b1dQID09PSBob2xkaW5nUGF0dGVybldheXBvaW50cy5sZW5ndGgpIHt0b1dQID0gMH1cclxuICBsZXQgYWdlID0gMFxyXG4gIGxldCBzcGVlZCA9IDAuMDFcclxuICBsZXQgZGlzdE1vdmVkID0gMC8vcmFuZG9taXNlIDAtMT8/XHJcbiAgbGV0IHN0YXJ0Q29vcmRzID0ge3g6IG51bGwsIHk6IG51bGx9XHJcbiAgc3RhcnRDb29yZHMueCA9IGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW2Zyb21XUF0ueFxyXG4gIHN0YXJ0Q29vcmRzLnkgPSBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbFtmcm9tV1BdLnlcclxuICBsZXQgZW5kQ29vcmRzID0ge3g6IG51bGwsIHk6IG51bGx9XHJcbiAgZW5kQ29vcmRzLnggPSBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbFt0b1dQXS54XHJcbiAgZW5kQ29vcmRzLnkgPSBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbFt0b1dQXS55XHJcbiAgbGV0IGNvb3JkcyA9IHt4OiBzdGFydENvb3Jkcy54LCB5OiBzdGFydENvb3Jkcy55fVxyXG4gIGxldCBjcDFDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoY29vcmRzLCBlbmRDb29yZHMpXHJcbiAgbGV0IGNwMkNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhjb29yZHMsIGVuZENvb3JkcylcclxuXHJcbiAgbGV0IHBhcnRpY2xlID0gbmV3IEhvbGRpbmdQYXR0ZXJuUGFydGljbGUoc3RhcnRDb29yZHMsIGVuZENvb3JkcywgY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQsIGNwMUNvb3JkcywgY3AyQ29vcmRzLCBmcm9tV1AsIHRvV1ApXHJcbiAgaG9sZGluZ1BhdHRlcm5QYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSlcclxufVxyXG5cclxuLy9mdW5jdGlvbiB0byBnb2VzIG92ZXIgZXZlcnkgaG9sZGluZ1BhdHRlcm5QYXJ0aWNsZSBpblxyXG4vL2hvbGRpbmdQYXR0ZXJuQXJyYXkgYW5kIGltcGxlbWVudHMgc29tZSBiZWhhdmlvdXJcclxuXHJcbi8vZnVuY3Rpb24gdGhhdCBwb3B1bGF0ZXMgaG9sZGluZ1BhdHRlcm5XYXlwb2ludHNcclxuXHJcbi8vZnVuY3Rpb24gdGhhdCB1cGRhdGVzIGVhY2ggcGFydGljbGVzIHggJiB5IG9uIHdpbmRvdyByZXNpemVcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGluaXQpXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBpbml0KVxyXG4iLCIvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tR0VPTUVUUlkgSEVMUEVSU1xyXG5mdW5jdGlvbiByYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHAxLCBwMikge1xyXG4gIGNvbnN0IE1JTl9ESVNUID0gNDBcclxuICBjb25zdCBESVNUX01PRCA9IDAuNVxyXG4gIGNvbnN0IEFOR0xFX1dJVEhJTiA9IE1hdGguUElcclxuICBsZXQgYSA9IHAyLnggLSBwMS54XHJcbiAgbGV0IGIgPSBwMi55IC0gcDEueVxyXG4gIGxldCBwMVAyRGlzdCA9IE1hdGguc3FydChhKmEgKyBiKmIpXHJcbiAgbGV0IHJhbmREaXN0ID0gKE1hdGgucmFuZG9tKCkgKiBwMVAyRGlzdCAqIERJU1RfTU9EKSArIE1JTl9ESVNUXHJcbiAgbGV0IGFuZ2xlTW9kID0gKE1hdGgucmFuZG9tKCkgKiBBTkdMRV9XSVRISU4pIC0gKEFOR0xFX1dJVEhJTiAvIDIpXHJcbiAgbGV0IHJhbmRBbmdsZVxyXG4gIGxldCBjb29yZHMgPSB7eDogbnVsbCwgeTogbnVsbH1cclxuXHJcbiAgaWYoTWF0aC5yYW5kb20oKSA+PSAwLjUpIHtcclxuICAgIHJhbmRBbmdsZSA9IE1hdGguYXRhbjIocDIueSAtIHAxLnksIHAxLnggLSBwMi54KSArIGFuZ2xlTW9kXHJcbiAgICBjb29yZHMueCA9IHAyLnggKyBNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICAgIGNvb3Jkcy55ID0gcDIueSAtIE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gIH0gZWxzZSB7XHJcbiAgICByYW5kQW5nbGUgPSBNYXRoLmF0YW4yKHAxLnkgLSBwMi55LCBwMi54IC0gcDEueCkgKyBhbmdsZU1vZFxyXG4gICAgY29vcmRzLnggPSBwMS54ICsgTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgICBjb29yZHMueSA9IHAxLnkgLSBNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICB9XHJcblxyXG4gIHJldHVybiBjb29yZHNcclxufVxyXG5cclxuZnVuY3Rpb24gcmFuZFBvaW50TmVhclBvaW50KHApIHtcclxuXHJcbn1cclxuXHJcbi8vc3RvbGVuIGZyb20gc3RhY2tvdmVyZmxvdywgSSB1bmRlcnN0YW5kIHNoaXQgYWxsIGJ1dCBpdCB3b3Jrc1xyXG5mdW5jdGlvbiBjb29yZHNPbkN1YmljQmV6aWVyKHBlcmNlbnQsIHN0YXJ0UHQsIGNwMSwgY3AyLCBlbmRQdCkge1xyXG4gIGxldCB0MiA9IHBlcmNlbnQgKiBwZXJjZW50XHJcbiAgbGV0IHQzID0gdDIgKiBwZXJjZW50XHJcblxyXG4gIHJldHVybiBzdGFydFB0ICsgKC1zdGFydFB0ICogMyArIHBlcmNlbnQgKiAoMyAqIHN0YXJ0UHQgLSBzdGFydFB0ICogcGVyY2VudCkpICogcGVyY2VudFxyXG4gICsgKDMgKiBjcDEgKyBwZXJjZW50ICogKC02ICogY3AxICsgY3AxICogMyAqIHBlcmNlbnQpKSAqIHBlcmNlbnRcclxuICArIChjcDIgKiAzIC0gY3AyICogMyAqIHBlcmNlbnQpICogdDJcclxuICArIGVuZFB0ICogdDNcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLURFViBGVU5DVElPTlMgV09UIEZPUiBWSVNVQUxJU0lORyBXSEFUJ1MgT0NDVVJJTkdcclxuZnVuY3Rpb24gcmVuZGVyQm91bmRpbmdDaXJjbGUoY3R4LCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KSB7XHJcbiAgbGV0IGNlbnRlclggPSBjYW52YXNXaWR0aCAvIDJcclxuICBsZXQgY2VudGVyWSA9IGNhbnZhc0hlaWdodCAvIDJcclxuICBsZXQgcmFkaXVzID0gY2VudGVyWSA+IGNlbnRlclggPyBjZW50ZXJYIC0gMiA6IGNlbnRlclkgLSAyXHJcbiAgbGV0IHN0YXJ0QW5nbGUgPSAwXHJcbiAgbGV0IGVuZEFuZ2xlID0gMiAqIE1hdGguUElcclxuICBjdHgubGluZVdpZHRoID0gMVxyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICdncmV5J1xyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5hcmMoY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSlcclxuICBjdHguc3Ryb2tlKClcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVySG9sZFBhdHRlcm5XUHMoY3R4LCBhcnIpIHtcclxuICBjdHguYmVnaW5QYXRoKClcclxuICBjdHguZmlsbFN0eWxlID0gJ2JsdWUnXHJcbiAgYXJyLmZvckVhY2god3AgPT4ge1xyXG4gICAgY3R4LmZpbGxSZWN0KHdwLnggLSA2LCB3cC55IC0gNiwgMTIsIDEyKVxyXG4gIH0pXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckNob3NlbkhvbGRQYXR0ZXJuUGFydGljbGVQYXRoKGN0eCwgcGFydGljbGUpIHtcclxuICBsZXQgY3AxWCA9IHBhcnRpY2xlLmNwMUNvb3Jkcy54XHJcbiAgbGV0IGNwMVkgPSBwYXJ0aWNsZS5jcDFDb29yZHMueVxyXG4gIGxldCBjcDJYID0gcGFydGljbGUuY3AyQ29vcmRzLnhcclxuICBsZXQgY3AyWSA9IHBhcnRpY2xlLmNwMkNvb3Jkcy55XHJcbiAgbGV0IHN0YXJ0WCA9IHBhcnRpY2xlLnN0YXJ0Q29vcmRzLnhcclxuICBsZXQgc3RhcnRZID0gcGFydGljbGUuc3RhcnRDb29yZHMueVxyXG4gIGxldCBlbmRYID0gcGFydGljbGUuZW5kQ29vcmRzLnhcclxuICBsZXQgZW5kWSA9IHBhcnRpY2xlLmVuZENvb3Jkcy55XHJcbiAgY3R4LmxpbmVXaWR0aCA9IDFcclxuICAvL3JlbmRlciBzdGFydCBwb2ludFxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICdncmVlbidcclxuICBjdHgucmVjdChzdGFydFggLSA0LCBzdGFydFkgLSA0LCA4LCA4IClcclxuICBjdHguc3Ryb2tlKClcclxuICAvL3JlbmRlciBlbmQgcG9pbnRcclxuICBjdHguc3Ryb2tlU3R5bGUgPSAncmVkJ1xyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5yZWN0KGVuZFggLSA0LCBlbmRZIC0gNCwgOCwgOCApXHJcbiAgY3R4LnN0cm9rZSgpXHJcbiAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAxXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ3llbGxvdydcclxuICBjdHgucmVjdChjcDFYIC0gNCwgY3AxWSAtIDQsIDgsIDgpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbiAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAyXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ29yYW5nZSdcclxuICBjdHgucmVjdChjcDJYIC0gNCwgY3AyWSAtIDQsIDgsIDgpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbiAgLy9yZW5kZXIgcGF0aFxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSdcclxuICBjdHgubW92ZVRvKHN0YXJ0WCwgc3RhcnRZKVxyXG4gIGN0eC5iZXppZXJDdXJ2ZVRvKGNwMVgsIGNwMVksIGNwMlgsIGNwMlksIGVuZFgsIGVuZFkpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tZXhwb3J0ZWQgZnVuY3Rpb25zXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMsXHJcbiAgY29vcmRzT25DdWJpY0JlemllcixcclxuICAvL2RldlxyXG4gIHJlbmRlckJvdW5kaW5nQ2lyY2xlLFxyXG4gIHJlbmRlckhvbGRQYXR0ZXJuV1BzLFxyXG4gIHJlbmRlckNob3NlbkhvbGRQYXR0ZXJuUGFydGljbGVQYXRoXHJcbn1cclxuIl19
