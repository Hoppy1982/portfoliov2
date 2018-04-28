(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const canvasHelpers = require('./utils/canvas-helpers.js')
const lettersLib = require('./utils/letters-lib.js')

let body = document.getElementsByTagName('body')[0]
let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')
let navGoToButton = document.getElementById('navigatorDesc')//dev
let frameId
let canvasWidth
let canvasHeight

document.addEventListener("DOMContentLoaded", init)
window.addEventListener('resize', init)

//hold pattern WP coords as ratio of canvas size
let holdPatternWaypoints = [
  {x: 0.125, y: 0.5},//0
  {x: 0.25, y: 0.125},//1
  {x: 0.75, y: 0.125},//2
  {x: 0.875, y: 0.5},//3
  {x: 0.75, y: 0.875},//4
  {x: 0.25, y: 0.875}//5
]
let holdPatternWaypointsActual = []//hold pattern WP coords in pixels, recalcumalated on resize
let holdPatternParticles = []

let navTargetLettersOrigin = {x: 100, y: 100}
let navTargetParticles = []

//array for spawning pool particles
//array for wormhole leaving particles
//array for particles transitioning between main arrays???

//----------------------------------------------------------------------MANAGERS
//possibly split this into a function that fires just once on dom load,
//then another manager that runs on resizing?
function init() {
  reset()
  setLayout()
  initHoldPatternWaypointsActual()
  initHoldPatternParticles(3)
  initLetterParticles()//dev
  animate()
}

function reset() {
  cancelAnimationFrame(frameId)
  holdPatternWaypointsActual.length = 0
  holdPatternParticles.length = 0
  navTargetLettersParticles = 0//dev
}

function initHoldPatternWaypointsActual() {
  holdPatternWaypointsActual = holdPatternWaypoints.map(el => {
    let x = el.x * canvasWidth
    let y = el.y * canvasHeight
    return {x: x, y: y}
  })
}

function initHoldPatternParticles(nParticles) {
  for(let i = 0; i < nParticles; i++) {
    let fromWP = Math.floor(Math.random() * 6)
    let toWP = fromWP + 1
    if(toWP === holdPatternWaypoints.length) {toWP = 0}
    let age = 0
    let speed = 0.005
    //let distMoved = Number( (Math.random() ).toFixed(1) )
    let distMoved = Math.round( Math.random() * 10 ) / 10
    let startCoords = canvasHelpers.randPointNearPoint(holdPatternWaypointsActual[fromWP])
    let endCoords = canvasHelpers.randPointNearPoint(holdPatternWaypointsActual[toWP])
    let coords = {x: startCoords.x, y: startCoords.y}
    let cp1Coords = canvasHelpers.randPointBetweenTwoPoints(coords, endCoords)
    let cp2Coords = canvasHelpers.randPointBetweenTwoPoints(coords, endCoords)
    let particle = new holdPatternParticle(startCoords, endCoords, coords, age, speed, distMoved, cp1Coords, cp2Coords, fromWP, toWP)

    holdPatternParticles.push(particle)
  }
}

function initLetterParticles() {
  navTargetParticles.push({ char: 'A', posInChar: 0, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: 2 })
  navTargetParticles.push({ char: 'A', posInChar: 1, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: 4 })
  navTargetParticles.push({ char: 'A', posInChar: 2, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: 3 })
  navTargetParticles.push({ char: 'A', posInChar: 3, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: 5 })
  navTargetParticles.push({ char: 'A', posInChar: 4, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: null })
  navTargetParticles.push({ char: 'A', posInChar: 5, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: null })
}

//--------------------------------------------UPDATE PARTICLE POSITIONS & RENDER
function animate() {
  frameId = requestAnimationFrame(animate)
  ctx1.clearRect(0, 0, canvasWidth, canvasHeight)
  canvasHelpers.renderBoundingCircle(ctx1, canvasWidth, canvasHeight)//dev
  canvasHelpers.renderHoldPatternWPs(ctx1, holdPatternWaypointsActual)//dev
  canvasHelpers.renderHoldPatternParticlePaths(ctx1, holdPatternParticles)//dev
  updateHoldPatternParticles()
  updateNavTargetLettersParticles()
}

function updateHoldPatternParticles() {
  holdPatternParticles.forEach(particle => {
    particle.distMoved = particle.distMoved + particle.speed

    if(particle.distMoved >= 1) {
      particle.distMoved = 0
      Object.assign(particle.startCoords, particle.endCoords)
      Object.assign(particle.coords, particle.startCoords)
      particle.fromWP = particle.fromWP === holdPatternWaypoints.length - 1 ? 0 : particle.fromWP + 1
      particle.toWP = particle.toWP === holdPatternWaypoints.length - 1 ? 0 : particle.toWP + 1
      particle.endCoords = canvasHelpers.randPointNearPoint(holdPatternWaypointsActual[particle.toWP])
      particle.cp1Coords = canvasHelpers.randPointBetweenTwoPoints(particle.startCoords, particle.endCoords)
      particle.cp2Coords = canvasHelpers.randPointBetweenTwoPoints(particle.startCoords, particle.endCoords)
    }

    particle.coords.x = canvasHelpers.coordsOnCubicBezier(particle.distMoved, particle.startCoords.x, particle.cp1Coords.x, particle.cp2Coords.x, particle.endCoords.x)
    particle.coords.y = canvasHelpers.coordsOnCubicBezier(particle.distMoved, particle.startCoords.y, particle.cp1Coords.y, particle.cp2Coords.y, particle.endCoords.y)

    particle.draw()
  })
}

function updateNavTargetLettersParticles() {
  navTargetParticles.forEach((particle, index) => {
    console.log(particle)
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

//---------------------------------------------------------------EVENT LISTENERS
navGoToButton.addEventListener('click', particleLettersTest, false)

function particleLettersTest() {
  console.log(lettersLib.letterACoords)
  console.log(lettersLib.letterAVectors)
}

//--------------------------------------------------------------PARTICLE CLASSES
class Particle {
  constructor(coords, age, speed) {
    this.coords = coords
    this.age = age
    this.speed = speed
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

class PathParticle extends Particle {
  constructor(startCoords, endCoords, coords, age, speed, distMoved) {
    super(coords, age, speed)
    this.startCoords = startCoords
    this.endCoords = endCoords
    this.distMoved = distMoved
  }
}

class holdPatternParticle extends PathParticle {
  constructor(startCoords, endCoords, coords, age, speed, distMoved, cp1Coords, cp2Coords, fromWP, toWP) {
    super(startCoords, endCoords, coords, age, speed, distMoved)
    this.cp1Coords = cp1Coords
    this.cp2Coords = cp2Coords
    this.fromWP = fromWP
    this.toWP = toWP
  }
}

//to do: function that updates each particles x & y on window resize

},{"./utils/canvas-helpers.js":2,"./utils/letters-lib.js":3}],2:[function(require,module,exports){
//------------------------------------------------------------------MATH HELPERS

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

function randPointNearPoint(pt) {
  const MAX_FROM = 40
  let randDist = Math.floor(Math.random() * MAX_FROM)
  let randAngle = Math.random() * Math.PI * 2
  let x = pt.x + (Math.cos(randAngle) * randDist)
  let y = pt.y + (Math.sin(randAngle) * randDist)

  return {x: x, y: y}
}

//stolen from stackoverflow
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

function renderHoldPatternWPs(ctx, waypoints) {
  ctx.beginPath()
  ctx.fillStyle = 'blue'
  waypoints.forEach(wp => {
    ctx.fillRect(wp.x - 4, wp.y - 4, 8, 8)
  })
  ctx.stroke()
}

function renderHoldPatternParticlePaths(ctx, particles) {
  particles.forEach(particle => {
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
    ctx.rect(startX - 2, startY - 2, 4, 4)
    ctx.stroke()
    //render end point
    ctx.strokeStyle = 'red'
    ctx.beginPath()
    ctx.rect(endX - 2, endY - 2, 4, 4)
    ctx.stroke()
    //render control point 1
    ctx.beginPath()
    ctx.strokeStyle = 'yellow'
    ctx.rect(cp1X - 2, cp1Y - 2, 4, 4)
    ctx.stroke()
    //render control point 2
    ctx.beginPath()
    ctx.strokeStyle = 'orange'
    ctx.rect(cp2X - 2, cp2Y - 2, 4, 4)
    ctx.stroke()
    //render path
    ctx.beginPath()
    ctx.strokeStyle = 'grey'
    ctx.moveTo(startX, startY)
    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY)
    ctx.stroke()
  })
}

//------------------------------------------------------------exported functions
module.exports = {
  randPointBetweenTwoPoints,
  randPointNearPoint,
  coordsOnCubicBezier,
  //dev
  renderBoundingCircle,
  renderHoldPatternWPs,
  renderHoldPatternParticlePaths
}

},{}],3:[function(require,module,exports){
//array for nav target lettering particles
let letterACoords = [
  {x: 0.125, y: 0.875},//0
  {x: 0.25, y: 0.5},   //1
  {x: 0.375, y: 0.125},//2
  {x: 0.625, y: 0.125},//3
  {x: 0.75, y: 0.5},   //4
  {x: 0.875, y: 0.875} //5
]
let letterAVectors = [
  {from: 0, to: 2},
  {from: 1, to: 4},
  {from: 2, to: 3},
  {from: 3, to: 5}
]

module.exports = {
  letterACoords,
  letterAVectors
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2FudmFzLWhlbHBlcnMuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9sZXR0ZXJzLWxpYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBjYW52YXNIZWxwZXJzID0gcmVxdWlyZSgnLi91dGlscy9jYW52YXMtaGVscGVycy5qcycpXHJcbmNvbnN0IGxldHRlcnNMaWIgPSByZXF1aXJlKCcuL3V0aWxzL2xldHRlcnMtbGliLmpzJylcclxuXHJcbmxldCBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXVxyXG5sZXQgY2FudmFzMSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjYW52YXMnKVswXVxyXG5sZXQgY3R4MSA9IGNhbnZhczEuZ2V0Q29udGV4dCgnMmQnKVxyXG5sZXQgbmF2R29Ub0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYXZpZ2F0b3JEZXNjJykvL2RldlxyXG5sZXQgZnJhbWVJZFxyXG5sZXQgY2FudmFzV2lkdGhcclxubGV0IGNhbnZhc0hlaWdodFxyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdClcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGluaXQpXHJcblxyXG4vL2hvbGQgcGF0dGVybiBXUCBjb29yZHMgYXMgcmF0aW8gb2YgY2FudmFzIHNpemVcclxubGV0IGhvbGRQYXR0ZXJuV2F5cG9pbnRzID0gW1xyXG4gIHt4OiAwLjEyNSwgeTogMC41fSwvLzBcclxuICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMVxyXG4gIHt4OiAwLjc1LCB5OiAwLjEyNX0sLy8yXHJcbiAge3g6IDAuODc1LCB5OiAwLjV9LC8vM1xyXG4gIHt4OiAwLjc1LCB5OiAwLjg3NX0sLy80XHJcbiAge3g6IDAuMjUsIHk6IDAuODc1fS8vNVxyXG5dXHJcbmxldCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCA9IFtdLy9ob2xkIHBhdHRlcm4gV1AgY29vcmRzIGluIHBpeGVscywgcmVjYWxjdW1hbGF0ZWQgb24gcmVzaXplXHJcbmxldCBob2xkUGF0dGVyblBhcnRpY2xlcyA9IFtdXHJcblxyXG5sZXQgbmF2VGFyZ2V0TGV0dGVyc09yaWdpbiA9IHt4OiAxMDAsIHk6IDEwMH1cclxubGV0IG5hdlRhcmdldFBhcnRpY2xlcyA9IFtdXHJcblxyXG4vL2FycmF5IGZvciBzcGF3bmluZyBwb29sIHBhcnRpY2xlc1xyXG4vL2FycmF5IGZvciB3b3JtaG9sZSBsZWF2aW5nIHBhcnRpY2xlc1xyXG4vL2FycmF5IGZvciBwYXJ0aWNsZXMgdHJhbnNpdGlvbmluZyBiZXR3ZWVuIG1haW4gYXJyYXlzPz8/XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1NQU5BR0VSU1xyXG4vL3Bvc3NpYmx5IHNwbGl0IHRoaXMgaW50byBhIGZ1bmN0aW9uIHRoYXQgZmlyZXMganVzdCBvbmNlIG9uIGRvbSBsb2FkLFxyXG4vL3RoZW4gYW5vdGhlciBtYW5hZ2VyIHRoYXQgcnVucyBvbiByZXNpemluZz9cclxuZnVuY3Rpb24gaW5pdCgpIHtcclxuICByZXNldCgpXHJcbiAgc2V0TGF5b3V0KClcclxuICBpbml0SG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwoKVxyXG4gIGluaXRIb2xkUGF0dGVyblBhcnRpY2xlcygzKVxyXG4gIGluaXRMZXR0ZXJQYXJ0aWNsZXMoKS8vZGV2XHJcbiAgYW5pbWF0ZSgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc2V0KCkge1xyXG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lSWQpXHJcbiAgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwubGVuZ3RoID0gMFxyXG4gIGhvbGRQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA9IDBcclxuICBuYXZUYXJnZXRMZXR0ZXJzUGFydGljbGVzID0gMC8vZGV2XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRIb2xkUGF0dGVybldheXBvaW50c0FjdHVhbCgpIHtcclxuICBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCA9IGhvbGRQYXR0ZXJuV2F5cG9pbnRzLm1hcChlbCA9PiB7XHJcbiAgICBsZXQgeCA9IGVsLnggKiBjYW52YXNXaWR0aFxyXG4gICAgbGV0IHkgPSBlbC55ICogY2FudmFzSGVpZ2h0XHJcbiAgICByZXR1cm4ge3g6IHgsIHk6IHl9XHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEhvbGRQYXR0ZXJuUGFydGljbGVzKG5QYXJ0aWNsZXMpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgblBhcnRpY2xlczsgaSsrKSB7XHJcbiAgICBsZXQgZnJvbVdQID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNilcclxuICAgIGxldCB0b1dQID0gZnJvbVdQICsgMVxyXG4gICAgaWYodG9XUCA9PT0gaG9sZFBhdHRlcm5XYXlwb2ludHMubGVuZ3RoKSB7dG9XUCA9IDB9XHJcbiAgICBsZXQgYWdlID0gMFxyXG4gICAgbGV0IHNwZWVkID0gMC4wMDVcclxuICAgIC8vbGV0IGRpc3RNb3ZlZCA9IE51bWJlciggKE1hdGgucmFuZG9tKCkgKS50b0ZpeGVkKDEpIClcclxuICAgIGxldCBkaXN0TW92ZWQgPSBNYXRoLnJvdW5kKCBNYXRoLnJhbmRvbSgpICogMTAgKSAvIDEwXHJcbiAgICBsZXQgc3RhcnRDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFtmcm9tV1BdKVxyXG4gICAgbGV0IGVuZENvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW3RvV1BdKVxyXG4gICAgbGV0IGNvb3JkcyA9IHt4OiBzdGFydENvb3Jkcy54LCB5OiBzdGFydENvb3Jkcy55fVxyXG4gICAgbGV0IGNwMUNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhjb29yZHMsIGVuZENvb3JkcylcclxuICAgIGxldCBjcDJDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoY29vcmRzLCBlbmRDb29yZHMpXHJcbiAgICBsZXQgcGFydGljbGUgPSBuZXcgaG9sZFBhdHRlcm5QYXJ0aWNsZShzdGFydENvb3JkcywgZW5kQ29vcmRzLCBjb29yZHMsIGFnZSwgc3BlZWQsIGRpc3RNb3ZlZCwgY3AxQ29vcmRzLCBjcDJDb29yZHMsIGZyb21XUCwgdG9XUClcclxuXHJcbiAgICBob2xkUGF0dGVyblBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKVxyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdExldHRlclBhcnRpY2xlcygpIHtcclxuICBuYXZUYXJnZXRQYXJ0aWNsZXMucHVzaCh7IGNoYXI6ICdBJywgcG9zSW5DaGFyOiAwLCBwbGFjZUluU3RyOiAwLCBkaXN0TW92ZWQ6IDAsIGNvb3Jkczoge3g6IDAsIHk6IDAsIHgwOiAwLCB5MDogMCwgeDE6IG51bGwsIHkxOiBudWxsfSwgcG9pbnRzQXQ6IDIgfSlcclxuICBuYXZUYXJnZXRQYXJ0aWNsZXMucHVzaCh7IGNoYXI6ICdBJywgcG9zSW5DaGFyOiAxLCBwbGFjZUluU3RyOiAwLCBkaXN0TW92ZWQ6IDAsIGNvb3Jkczoge3g6IDAsIHk6IDAsIHgwOiAwLCB5MDogMCwgeDE6IG51bGwsIHkxOiBudWxsfSwgcG9pbnRzQXQ6IDQgfSlcclxuICBuYXZUYXJnZXRQYXJ0aWNsZXMucHVzaCh7IGNoYXI6ICdBJywgcG9zSW5DaGFyOiAyLCBwbGFjZUluU3RyOiAwLCBkaXN0TW92ZWQ6IDAsIGNvb3Jkczoge3g6IDAsIHk6IDAsIHgwOiAwLCB5MDogMCwgeDE6IG51bGwsIHkxOiBudWxsfSwgcG9pbnRzQXQ6IDMgfSlcclxuICBuYXZUYXJnZXRQYXJ0aWNsZXMucHVzaCh7IGNoYXI6ICdBJywgcG9zSW5DaGFyOiAzLCBwbGFjZUluU3RyOiAwLCBkaXN0TW92ZWQ6IDAsIGNvb3Jkczoge3g6IDAsIHk6IDAsIHgwOiAwLCB5MDogMCwgeDE6IG51bGwsIHkxOiBudWxsfSwgcG9pbnRzQXQ6IDUgfSlcclxuICBuYXZUYXJnZXRQYXJ0aWNsZXMucHVzaCh7IGNoYXI6ICdBJywgcG9zSW5DaGFyOiA0LCBwbGFjZUluU3RyOiAwLCBkaXN0TW92ZWQ6IDAsIGNvb3Jkczoge3g6IDAsIHk6IDAsIHgwOiAwLCB5MDogMCwgeDE6IG51bGwsIHkxOiBudWxsfSwgcG9pbnRzQXQ6IG51bGwgfSlcclxuICBuYXZUYXJnZXRQYXJ0aWNsZXMucHVzaCh7IGNoYXI6ICdBJywgcG9zSW5DaGFyOiA1LCBwbGFjZUluU3RyOiAwLCBkaXN0TW92ZWQ6IDAsIGNvb3Jkczoge3g6IDAsIHk6IDAsIHgwOiAwLCB5MDogMCwgeDE6IG51bGwsIHkxOiBudWxsfSwgcG9pbnRzQXQ6IG51bGwgfSlcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVVQREFURSBQQVJUSUNMRSBQT1NJVElPTlMgJiBSRU5ERVJcclxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcclxuICBmcmFtZUlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpXHJcbiAgY3R4MS5jbGVhclJlY3QoMCwgMCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodClcclxuICBjYW52YXNIZWxwZXJzLnJlbmRlckJvdW5kaW5nQ2lyY2xlKGN0eDEsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpLy9kZXZcclxuICBjYW52YXNIZWxwZXJzLnJlbmRlckhvbGRQYXR0ZXJuV1BzKGN0eDEsIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKS8vZGV2XHJcbiAgY2FudmFzSGVscGVycy5yZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHMoY3R4MSwgaG9sZFBhdHRlcm5QYXJ0aWNsZXMpLy9kZXZcclxuICB1cGRhdGVIb2xkUGF0dGVyblBhcnRpY2xlcygpXHJcbiAgdXBkYXRlTmF2VGFyZ2V0TGV0dGVyc1BhcnRpY2xlcygpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUhvbGRQYXR0ZXJuUGFydGljbGVzKCkge1xyXG4gIGhvbGRQYXR0ZXJuUGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xyXG4gICAgcGFydGljbGUuZGlzdE1vdmVkID0gcGFydGljbGUuZGlzdE1vdmVkICsgcGFydGljbGUuc3BlZWRcclxuXHJcbiAgICBpZihwYXJ0aWNsZS5kaXN0TW92ZWQgPj0gMSkge1xyXG4gICAgICBwYXJ0aWNsZS5kaXN0TW92ZWQgPSAwXHJcbiAgICAgIE9iamVjdC5hc3NpZ24ocGFydGljbGUuc3RhcnRDb29yZHMsIHBhcnRpY2xlLmVuZENvb3JkcylcclxuICAgICAgT2JqZWN0LmFzc2lnbihwYXJ0aWNsZS5jb29yZHMsIHBhcnRpY2xlLnN0YXJ0Q29vcmRzKVxyXG4gICAgICBwYXJ0aWNsZS5mcm9tV1AgPSBwYXJ0aWNsZS5mcm9tV1AgPT09IGhvbGRQYXR0ZXJuV2F5cG9pbnRzLmxlbmd0aCAtIDEgPyAwIDogcGFydGljbGUuZnJvbVdQICsgMVxyXG4gICAgICBwYXJ0aWNsZS50b1dQID0gcGFydGljbGUudG9XUCA9PT0gaG9sZFBhdHRlcm5XYXlwb2ludHMubGVuZ3RoIC0gMSA/IDAgOiBwYXJ0aWNsZS50b1dQICsgMVxyXG4gICAgICBwYXJ0aWNsZS5lbmRDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFtwYXJ0aWNsZS50b1dQXSlcclxuICAgICAgcGFydGljbGUuY3AxQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHBhcnRpY2xlLnN0YXJ0Q29vcmRzLCBwYXJ0aWNsZS5lbmRDb29yZHMpXHJcbiAgICAgIHBhcnRpY2xlLmNwMkNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhwYXJ0aWNsZS5zdGFydENvb3JkcywgcGFydGljbGUuZW5kQ29vcmRzKVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnRpY2xlLmNvb3Jkcy54ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHBhcnRpY2xlLmRpc3RNb3ZlZCwgcGFydGljbGUuc3RhcnRDb29yZHMueCwgcGFydGljbGUuY3AxQ29vcmRzLngsIHBhcnRpY2xlLmNwMkNvb3Jkcy54LCBwYXJ0aWNsZS5lbmRDb29yZHMueClcclxuICAgIHBhcnRpY2xlLmNvb3Jkcy55ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHBhcnRpY2xlLmRpc3RNb3ZlZCwgcGFydGljbGUuc3RhcnRDb29yZHMueSwgcGFydGljbGUuY3AxQ29vcmRzLnksIHBhcnRpY2xlLmNwMkNvb3Jkcy55LCBwYXJ0aWNsZS5lbmRDb29yZHMueSlcclxuXHJcbiAgICBwYXJ0aWNsZS5kcmF3KClcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVOYXZUYXJnZXRMZXR0ZXJzUGFydGljbGVzKCkge1xyXG4gIG5hdlRhcmdldFBhcnRpY2xlcy5mb3JFYWNoKChwYXJ0aWNsZSwgaW5kZXgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKHBhcnRpY2xlKVxyXG4gIH0pXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQlJFQUsgUE9JTlRTXHJcbmZ1bmN0aW9uIHNldExheW91dCgpIHtcclxuICAvL3NtYWxsIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNVxyXG4gIH1cclxuICAvL3NtYWxsIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0IDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG4gIC8vbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDEwMjQgJiYgYm9keS5jbGllbnRXaWR0aCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjdcclxuICB9XHJcbiAgLy9tZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gMTAyNCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcbiAgLy9sYXJnZSB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjY1XHJcbiAgfVxyXG4gIC8vbGFyZ2UgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPiAxMDI0KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBsYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG5cclxuICBjYW52YXMxLndpZHRoID0gY2FudmFzV2lkdGhcclxuICBjYW52YXMxLmhlaWdodCA9IGNhbnZhc0hlaWdodFxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVWRU5UIExJU1RFTkVSU1xyXG5uYXZHb1RvQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcGFydGljbGVMZXR0ZXJzVGVzdCwgZmFsc2UpXHJcblxyXG5mdW5jdGlvbiBwYXJ0aWNsZUxldHRlcnNUZXN0KCkge1xyXG4gIGNvbnNvbGUubG9nKGxldHRlcnNMaWIubGV0dGVyQUNvb3JkcylcclxuICBjb25zb2xlLmxvZyhsZXR0ZXJzTGliLmxldHRlckFWZWN0b3JzKVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tUEFSVElDTEUgQ0xBU1NFU1xyXG5jbGFzcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBhZ2UsIHNwZWVkKSB7XHJcbiAgICB0aGlzLmNvb3JkcyA9IGNvb3Jkc1xyXG4gICAgdGhpcy5hZ2UgPSBhZ2VcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZFxyXG4gIH1cclxuXHJcbiAgZHJhdygpIHsvL2RlZmF1bHQgc2VsZiByZW5kZXIgZm9yIHBhcnRpY2xlcywgbWF5YmUgY2hhbmdlIGxhdGVyXHJcbiAgICBjdHgxLmJlZ2luUGF0aCgpXHJcbiAgICBjdHgxLmxpbmVXaWR0aCA9IDNcclxuICAgIGN0eDEuc3Ryb2tlU3R5bGUgPSAnd2hpdGUnXHJcbiAgICBjdHgxLmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eDEuYXJjKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnksIDMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSlcclxuICAgIGN0eDEuc3Ryb2tlKClcclxuICAgIGN0eDEuZmlsbCgpXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBQYXRoUGFydGljbGUgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3Ioc3RhcnRDb29yZHMsIGVuZENvb3JkcywgY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQpIHtcclxuICAgIHN1cGVyKGNvb3JkcywgYWdlLCBzcGVlZClcclxuICAgIHRoaXMuc3RhcnRDb29yZHMgPSBzdGFydENvb3Jkc1xyXG4gICAgdGhpcy5lbmRDb29yZHMgPSBlbmRDb29yZHNcclxuICAgIHRoaXMuZGlzdE1vdmVkID0gZGlzdE1vdmVkXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBob2xkUGF0dGVyblBhcnRpY2xlIGV4dGVuZHMgUGF0aFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3RvcihzdGFydENvb3JkcywgZW5kQ29vcmRzLCBjb29yZHMsIGFnZSwgc3BlZWQsIGRpc3RNb3ZlZCwgY3AxQ29vcmRzLCBjcDJDb29yZHMsIGZyb21XUCwgdG9XUCkge1xyXG4gICAgc3VwZXIoc3RhcnRDb29yZHMsIGVuZENvb3JkcywgY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQpXHJcbiAgICB0aGlzLmNwMUNvb3JkcyA9IGNwMUNvb3Jkc1xyXG4gICAgdGhpcy5jcDJDb29yZHMgPSBjcDJDb29yZHNcclxuICAgIHRoaXMuZnJvbVdQID0gZnJvbVdQXHJcbiAgICB0aGlzLnRvV1AgPSB0b1dQXHJcbiAgfVxyXG59XHJcblxyXG4vL3RvIGRvOiBmdW5jdGlvbiB0aGF0IHVwZGF0ZXMgZWFjaCBwYXJ0aWNsZXMgeCAmIHkgb24gd2luZG93IHJlc2l6ZVxyXG4iLCIvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLU1BVEggSEVMUEVSU1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUdFT01FVFJZIEhFTFBFUlNcclxuZnVuY3Rpb24gcmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhwMSwgcDIpIHtcclxuICBjb25zdCBNSU5fRElTVCA9IDQwXHJcbiAgY29uc3QgRElTVF9NT0QgPSAwLjVcclxuICBjb25zdCBBTkdMRV9XSVRISU4gPSBNYXRoLlBJXHJcbiAgbGV0IGEgPSBwMi54IC0gcDEueFxyXG4gIGxldCBiID0gcDIueSAtIHAxLnlcclxuICBsZXQgcDFQMkRpc3QgPSBNYXRoLnNxcnQoYSphICsgYipiKVxyXG4gIGxldCByYW5kRGlzdCA9IChNYXRoLnJhbmRvbSgpICogcDFQMkRpc3QgKiBESVNUX01PRCkgKyBNSU5fRElTVFxyXG4gIGxldCBhbmdsZU1vZCA9IChNYXRoLnJhbmRvbSgpICogQU5HTEVfV0lUSElOKSAtIChBTkdMRV9XSVRISU4gLyAyKVxyXG4gIGxldCByYW5kQW5nbGVcclxuICBsZXQgY29vcmRzID0ge3g6IG51bGwsIHk6IG51bGx9XHJcblxyXG4gIGlmKE1hdGgucmFuZG9tKCkgPj0gMC41KSB7XHJcbiAgICByYW5kQW5nbGUgPSBNYXRoLmF0YW4yKHAyLnkgLSBwMS55LCBwMS54IC0gcDIueCkgKyBhbmdsZU1vZFxyXG4gICAgY29vcmRzLnggPSBwMi54ICsgTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgICBjb29yZHMueSA9IHAyLnkgLSBNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICB9IGVsc2Uge1xyXG4gICAgcmFuZEFuZ2xlID0gTWF0aC5hdGFuMihwMS55IC0gcDIueSwgcDIueCAtIHAxLngpICsgYW5nbGVNb2RcclxuICAgIGNvb3Jkcy54ID0gcDEueCArIE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gICAgY29vcmRzLnkgPSBwMS55IC0gTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgfVxyXG5cclxuICByZXR1cm4gY29vcmRzXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJhbmRQb2ludE5lYXJQb2ludChwdCkge1xyXG4gIGNvbnN0IE1BWF9GUk9NID0gNDBcclxuICBsZXQgcmFuZERpc3QgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNQVhfRlJPTSlcclxuICBsZXQgcmFuZEFuZ2xlID0gTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyXHJcbiAgbGV0IHggPSBwdC54ICsgKE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdClcclxuICBsZXQgeSA9IHB0LnkgKyAoTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0KVxyXG5cclxuICByZXR1cm4ge3g6IHgsIHk6IHl9XHJcbn1cclxuXHJcbi8vc3RvbGVuIGZyb20gc3RhY2tvdmVyZmxvd1xyXG5mdW5jdGlvbiBjb29yZHNPbkN1YmljQmV6aWVyKHBlcmNlbnQsIHN0YXJ0UHQsIGNwMSwgY3AyLCBlbmRQdCkge1xyXG4gIGxldCB0MiA9IHBlcmNlbnQgKiBwZXJjZW50XHJcbiAgbGV0IHQzID0gdDIgKiBwZXJjZW50XHJcblxyXG4gIHJldHVybiBzdGFydFB0ICsgKC1zdGFydFB0ICogMyArIHBlcmNlbnQgKiAoMyAqIHN0YXJ0UHQgLSBzdGFydFB0ICogcGVyY2VudCkpICogcGVyY2VudFxyXG4gICsgKDMgKiBjcDEgKyBwZXJjZW50ICogKC02ICogY3AxICsgY3AxICogMyAqIHBlcmNlbnQpKSAqIHBlcmNlbnRcclxuICArIChjcDIgKiAzIC0gY3AyICogMyAqIHBlcmNlbnQpICogdDJcclxuICArIGVuZFB0ICogdDNcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLURFViBGVU5DVElPTlMgV09UIEZPUiBWSVNVQUxJU0lORyBXSEFUJ1MgT0NDVVJJTkdcclxuZnVuY3Rpb24gcmVuZGVyQm91bmRpbmdDaXJjbGUoY3R4LCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KSB7XHJcbiAgbGV0IGNlbnRlclggPSBjYW52YXNXaWR0aCAvIDJcclxuICBsZXQgY2VudGVyWSA9IGNhbnZhc0hlaWdodCAvIDJcclxuICBsZXQgcmFkaXVzID0gY2VudGVyWSA+IGNlbnRlclggPyBjZW50ZXJYIC0gMiA6IGNlbnRlclkgLSAyXHJcbiAgbGV0IHN0YXJ0QW5nbGUgPSAwXHJcbiAgbGV0IGVuZEFuZ2xlID0gMiAqIE1hdGguUElcclxuICBjdHgubGluZVdpZHRoID0gMVxyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICdncmV5J1xyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5hcmMoY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSlcclxuICBjdHguc3Ryb2tlKClcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVySG9sZFBhdHRlcm5XUHMoY3R4LCB3YXlwb2ludHMpIHtcclxuICBjdHguYmVnaW5QYXRoKClcclxuICBjdHguZmlsbFN0eWxlID0gJ2JsdWUnXHJcbiAgd2F5cG9pbnRzLmZvckVhY2god3AgPT4ge1xyXG4gICAgY3R4LmZpbGxSZWN0KHdwLnggLSA0LCB3cC55IC0gNCwgOCwgOClcclxuICB9KVxyXG4gIGN0eC5zdHJva2UoKVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHMoY3R4LCBwYXJ0aWNsZXMpIHtcclxuICBwYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7XHJcbiAgICBsZXQgY3AxWCA9IHBhcnRpY2xlLmNwMUNvb3Jkcy54XHJcbiAgICBsZXQgY3AxWSA9IHBhcnRpY2xlLmNwMUNvb3Jkcy55XHJcbiAgICBsZXQgY3AyWCA9IHBhcnRpY2xlLmNwMkNvb3Jkcy54XHJcbiAgICBsZXQgY3AyWSA9IHBhcnRpY2xlLmNwMkNvb3Jkcy55XHJcbiAgICBsZXQgc3RhcnRYID0gcGFydGljbGUuc3RhcnRDb29yZHMueFxyXG4gICAgbGV0IHN0YXJ0WSA9IHBhcnRpY2xlLnN0YXJ0Q29vcmRzLnlcclxuICAgIGxldCBlbmRYID0gcGFydGljbGUuZW5kQ29vcmRzLnhcclxuICAgIGxldCBlbmRZID0gcGFydGljbGUuZW5kQ29vcmRzLnlcclxuICAgIGN0eC5saW5lV2lkdGggPSAxXHJcbiAgICAvL3JlbmRlciBzdGFydCBwb2ludFxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JlZW4nXHJcbiAgICBjdHgucmVjdChzdGFydFggLSAyLCBzdGFydFkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBlbmQgcG9pbnRcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZWQnXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5yZWN0KGVuZFggLSAyLCBlbmRZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAxXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICd5ZWxsb3cnXHJcbiAgICBjdHgucmVjdChjcDFYIC0gMiwgY3AxWSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIGNvbnRyb2wgcG9pbnQgMlxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnb3JhbmdlJ1xyXG4gICAgY3R4LnJlY3QoY3AyWCAtIDIsIGNwMlkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBwYXRoXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmV5J1xyXG4gICAgY3R4Lm1vdmVUbyhzdGFydFgsIHN0YXJ0WSlcclxuICAgIGN0eC5iZXppZXJDdXJ2ZVRvKGNwMVgsIGNwMVksIGNwMlgsIGNwMlksIGVuZFgsIGVuZFkpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICB9KVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLWV4cG9ydGVkIGZ1bmN0aW9uc1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICByYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzLFxyXG4gIHJhbmRQb2ludE5lYXJQb2ludCxcclxuICBjb29yZHNPbkN1YmljQmV6aWVyLFxyXG4gIC8vZGV2XHJcbiAgcmVuZGVyQm91bmRpbmdDaXJjbGUsXHJcbiAgcmVuZGVySG9sZFBhdHRlcm5XUHMsXHJcbiAgcmVuZGVySG9sZFBhdHRlcm5QYXJ0aWNsZVBhdGhzXHJcbn1cclxuIiwiLy9hcnJheSBmb3IgbmF2IHRhcmdldCBsZXR0ZXJpbmcgcGFydGljbGVzXHJcbmxldCBsZXR0ZXJBQ29vcmRzID0gW1xyXG4gIHt4OiAwLjEyNSwgeTogMC44NzV9LC8vMFxyXG4gIHt4OiAwLjI1LCB5OiAwLjV9LCAgIC8vMVxyXG4gIHt4OiAwLjM3NSwgeTogMC4xMjV9LC8vMlxyXG4gIHt4OiAwLjYyNSwgeTogMC4xMjV9LC8vM1xyXG4gIHt4OiAwLjc1LCB5OiAwLjV9LCAgIC8vNFxyXG4gIHt4OiAwLjg3NSwgeTogMC44NzV9IC8vNVxyXG5dXHJcbmxldCBsZXR0ZXJBVmVjdG9ycyA9IFtcclxuICB7ZnJvbTogMCwgdG86IDJ9LFxyXG4gIHtmcm9tOiAxLCB0bzogNH0sXHJcbiAge2Zyb206IDIsIHRvOiAzfSxcclxuICB7ZnJvbTogMywgdG86IDV9XHJcbl1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGxldHRlckFDb29yZHMsXHJcbiAgbGV0dGVyQVZlY3RvcnNcclxufVxyXG4iXX0=
