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

let navTargetOrigin = {x: 30, y: 30}
let navTargetSize = {width: 300, height: 60}
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
  initHoldPatternParticles(22)
  initNavTargetParticles()//dev
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
//coords, age, speed, distMoved, nextWP
function initHoldPatternParticles(nParticles) {
  for(let i = 0; i < nParticles; i++) {
    let fromWP = Math.floor(Math.random() * 6)
    let nextWP = fromWP + 1
    if(nextWP === holdPatternWaypoints.length) {nextWP = 0}
    let age = 0
    let speed = 0.005
    //let distMoved = Number( (Math.random() ).toFixed(1) )
    let distMoved = Math.round( Math.random() * 10 ) / 10
    let startCoords = canvasHelpers.randPointNearPoint(holdPatternWaypointsActual[fromWP])
    let endCoords = canvasHelpers.randPointNearPoint(holdPatternWaypointsActual[nextWP])
    let cp1Coords = canvasHelpers.randPointBetweenTwoPoints(startCoords, endCoords)
    let cp2Coords = canvasHelpers.randPointBetweenTwoPoints(startCoords, endCoords)

    let coords = {
      x: startCoords.x, y: startCoords.y,
      x0: startCoords.x, y0: startCoords.y,
      x1: endCoords.x, y1: endCoords.y,
      cp1x: cp1Coords.x, cp1y: cp1Coords.y,
      cp2x: cp2Coords.x, cp2y: cp2Coords.y
    }

    let particle = new holdPatternParticle(coords, age, speed, distMoved, nextWP)

    holdPatternParticles.push(particle)
  }
}

function initNavTargetParticles() {
  navTargetParticles.push({ char: 'A', posInChar: 0, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: 2 })
  navTargetParticles.push({ char: 'A', posInChar: 1, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: 4 })
  navTargetParticles.push({ char: 'A', posInChar: 2, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: 3 })
  navTargetParticles.push({ char: 'A', posInChar: 3, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: 5 })
  navTargetParticles.push({ char: 'A', posInChar: 4, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: null })
  navTargetParticles.push({ char: 'A', posInChar: 5, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: null })

  //calc x1 & y1 from navTargetOrigin, navTargetSize, letters in navTarget, char number, particle number
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
  holdPatternParticles.forEach(particle => {//think this should be moved to a method on holdParticle class??
    particle.distMoved = particle.distMoved + particle.speed

    if(particle.distMoved >= 1) {
      particle.distMoved = 0
      particle.nextWP = particle.nextWP === holdPatternWaypoints.length - 1 ? 0 : particle.nextWP + 1

      particle.coords.x0 = particle.coords.x1
      particle.coords.y0 = particle.coords.y1
      particle.coords.x1 = canvasHelpers.randPointNearPoint(holdPatternWaypointsActual[particle.nextWP]).x
      particle.coords.y1 = canvasHelpers.randPointNearPoint(holdPatternWaypointsActual[particle.nextWP]).y

      particle.coords.cp1x = canvasHelpers.randPointBetweenTwoPoints({x: particle.coords.x0, y: particle.coords.y0}, {x: particle.coords.x1, y: particle.coords.y1}).x
      particle.coords.cp1y = canvasHelpers.randPointBetweenTwoPoints({x: particle.coords.x0, y: particle.coords.y0}, {x: particle.coords.x1, y: particle.coords.y1}).y
      particle.coords.cp2x = canvasHelpers.randPointBetweenTwoPoints({x: particle.coords.x0, y: particle.coords.y0}, {x: particle.coords.x1, y: particle.coords.y1}).x
      particle.coords.cp2y = canvasHelpers.randPointBetweenTwoPoints({x: particle.coords.x0, y: particle.coords.y0}, {x: particle.coords.x1, y: particle.coords.y1}).y
    }

    particle.coords.x = canvasHelpers.coordsOnCubicBezier(particle.distMoved, particle.coords.x0, particle.coords.cp1x, particle.coords.cp2x, particle.coords.x1)
    particle.coords.y = canvasHelpers.coordsOnCubicBezier(particle.distMoved, particle.coords.y0, particle.coords.cp1y, particle.coords.cp2y, particle.coords.y1)

    particle.draw()
  })
}

function updateNavTargetLettersParticles() {
  navTargetParticles.forEach((particle, index) => {
    //if distMoved < 1.0 then update pos
    //if distMoved > threshold then render vector
    //render self
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
//coords {x: number, y: number, x0: number, y0: number, x1: number, y1: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number}
//age number
//speed number
//distMoved number (% along path as decimal)
//nextWP number(index)

//think idea might be to stick nearly all the props on th Particle parent, scrap the intermediate class and concentrate on the methods in individual
//particle classes.

class Particle {
  constructor(coords, age, speed, distMoved) {
    this.coords = coords
    this.age = age
    this.speed = speed
    this.distMoved = distMoved
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

class holdPatternParticle extends Particle {
  constructor(coords, age, speed, distMoved, nextWP) {
    super(coords, age, speed, distMoved)
    this.nextWP = nextWP
  }
}
/*
class holdPatternParticle extends Particle {
  constructor(startCoords, endCoords, coords, age, speed, distMoved, cp1Coords, cp2Coords, nextWP) {
    super(coords, age, speed, distMoved, startCoords, endCoords)
    this.cp1Coords = cp1Coords
    this.cp2Coords = cp2Coords
    this.nextWP = nextWP
  }
}
*/

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
    let cp1X = particle.coords.cp1x
    let cp1Y = particle.coords.cp1y
    let cp2X = particle.coords.cp2x
    let cp2Y = particle.coords.cp2y
    let startX = particle.coords.x0
    let startY = particle.coords.y0
    let endX = particle.coords.x1
    let endY = particle.coords.y1
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2FudmFzLWhlbHBlcnMuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9sZXR0ZXJzLWxpYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgY2FudmFzSGVscGVycyA9IHJlcXVpcmUoJy4vdXRpbHMvY2FudmFzLWhlbHBlcnMuanMnKVxyXG5jb25zdCBsZXR0ZXJzTGliID0gcmVxdWlyZSgnLi91dGlscy9sZXR0ZXJzLWxpYi5qcycpXHJcblxyXG5sZXQgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF1cclxubGV0IGNhbnZhczEgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY2FudmFzJylbMF1cclxubGV0IGN0eDEgPSBjYW52YXMxLmdldENvbnRleHQoJzJkJylcclxubGV0IG5hdkdvVG9CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yRGVzYycpLy9kZXZcclxubGV0IGZyYW1lSWRcclxubGV0IGNhbnZhc1dpZHRoXHJcbmxldCBjYW52YXNIZWlnaHRcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGluaXQpXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBpbml0KVxyXG5cclxuLy9ob2xkIHBhdHRlcm4gV1AgY29vcmRzIGFzIHJhdGlvIG9mIGNhbnZhcyBzaXplXHJcbmxldCBob2xkUGF0dGVybldheXBvaW50cyA9IFtcclxuICB7eDogMC4xMjUsIHk6IDAuNX0sLy8wXHJcbiAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzFcclxuICB7eDogMC43NSwgeTogMC4xMjV9LC8vMlxyXG4gIHt4OiAwLjg3NSwgeTogMC41fSwvLzNcclxuICB7eDogMC43NSwgeTogMC44NzV9LC8vNFxyXG4gIHt4OiAwLjI1LCB5OiAwLjg3NX0vLzVcclxuXVxyXG5sZXQgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwgPSBbXS8vaG9sZCBwYXR0ZXJuIFdQIGNvb3JkcyBpbiBwaXhlbHMsIHJlY2FsY3VtYWxhdGVkIG9uIHJlc2l6ZVxyXG5sZXQgaG9sZFBhdHRlcm5QYXJ0aWNsZXMgPSBbXVxyXG5cclxubGV0IG5hdlRhcmdldE9yaWdpbiA9IHt4OiAzMCwgeTogMzB9XHJcbmxldCBuYXZUYXJnZXRTaXplID0ge3dpZHRoOiAzMDAsIGhlaWdodDogNjB9XHJcbmxldCBuYXZUYXJnZXRQYXJ0aWNsZXMgPSBbXVxyXG5cclxuLy9hcnJheSBmb3Igc3Bhd25pbmcgcG9vbCBwYXJ0aWNsZXNcclxuLy9hcnJheSBmb3Igd29ybWhvbGUgbGVhdmluZyBwYXJ0aWNsZXNcclxuLy9hcnJheSBmb3IgcGFydGljbGVzIHRyYW5zaXRpb25pbmcgYmV0d2VlbiBtYWluIGFycmF5cz8/P1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTUFOQUdFUlNcclxuLy9wb3NzaWJseSBzcGxpdCB0aGlzIGludG8gYSBmdW5jdGlvbiB0aGF0IGZpcmVzIGp1c3Qgb25jZSBvbiBkb20gbG9hZCxcclxuLy90aGVuIGFub3RoZXIgbWFuYWdlciB0aGF0IHJ1bnMgb24gcmVzaXppbmc/XHJcbmZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgcmVzZXQoKVxyXG4gIHNldExheW91dCgpXHJcbiAgaW5pdEhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKClcclxuICBpbml0SG9sZFBhdHRlcm5QYXJ0aWNsZXMoMjIpXHJcbiAgaW5pdE5hdlRhcmdldFBhcnRpY2xlcygpLy9kZXZcclxuICBhbmltYXRlKClcclxufVxyXG5cclxuZnVuY3Rpb24gcmVzZXQoKSB7XHJcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVJZClcclxuICBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbC5sZW5ndGggPSAwXHJcbiAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMubGVuZ3RoID0gMFxyXG4gIG5hdlRhcmdldExldHRlcnNQYXJ0aWNsZXMgPSAwLy9kZXZcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKCkge1xyXG4gIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsID0gaG9sZFBhdHRlcm5XYXlwb2ludHMubWFwKGVsID0+IHtcclxuICAgIGxldCB4ID0gZWwueCAqIGNhbnZhc1dpZHRoXHJcbiAgICBsZXQgeSA9IGVsLnkgKiBjYW52YXNIZWlnaHRcclxuICAgIHJldHVybiB7eDogeCwgeTogeX1cclxuICB9KVxyXG59XHJcbi8vY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQsIG5leHRXUFxyXG5mdW5jdGlvbiBpbml0SG9sZFBhdHRlcm5QYXJ0aWNsZXMoblBhcnRpY2xlcykge1xyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBuUGFydGljbGVzOyBpKyspIHtcclxuICAgIGxldCBmcm9tV1AgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2KVxyXG4gICAgbGV0IG5leHRXUCA9IGZyb21XUCArIDFcclxuICAgIGlmKG5leHRXUCA9PT0gaG9sZFBhdHRlcm5XYXlwb2ludHMubGVuZ3RoKSB7bmV4dFdQID0gMH1cclxuICAgIGxldCBhZ2UgPSAwXHJcbiAgICBsZXQgc3BlZWQgPSAwLjAwNVxyXG4gICAgLy9sZXQgZGlzdE1vdmVkID0gTnVtYmVyKCAoTWF0aC5yYW5kb20oKSApLnRvRml4ZWQoMSkgKVxyXG4gICAgbGV0IGRpc3RNb3ZlZCA9IE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiAxMCApIC8gMTBcclxuICAgIGxldCBzdGFydENvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW2Zyb21XUF0pXHJcbiAgICBsZXQgZW5kQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbbmV4dFdQXSlcclxuICAgIGxldCBjcDFDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoc3RhcnRDb29yZHMsIGVuZENvb3JkcylcclxuICAgIGxldCBjcDJDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoc3RhcnRDb29yZHMsIGVuZENvb3JkcylcclxuXHJcbiAgICBsZXQgY29vcmRzID0ge1xyXG4gICAgICB4OiBzdGFydENvb3Jkcy54LCB5OiBzdGFydENvb3Jkcy55LFxyXG4gICAgICB4MDogc3RhcnRDb29yZHMueCwgeTA6IHN0YXJ0Q29vcmRzLnksXHJcbiAgICAgIHgxOiBlbmRDb29yZHMueCwgeTE6IGVuZENvb3Jkcy55LFxyXG4gICAgICBjcDF4OiBjcDFDb29yZHMueCwgY3AxeTogY3AxQ29vcmRzLnksXHJcbiAgICAgIGNwMng6IGNwMkNvb3Jkcy54LCBjcDJ5OiBjcDJDb29yZHMueVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwYXJ0aWNsZSA9IG5ldyBob2xkUGF0dGVyblBhcnRpY2xlKGNvb3JkcywgYWdlLCBzcGVlZCwgZGlzdE1vdmVkLCBuZXh0V1ApXHJcblxyXG4gICAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXROYXZUYXJnZXRQYXJ0aWNsZXMoKSB7XHJcbiAgbmF2VGFyZ2V0UGFydGljbGVzLnB1c2goeyBjaGFyOiAnQScsIHBvc0luQ2hhcjogMCwgcGxhY2VJblN0cjogMCwgZGlzdE1vdmVkOiAwLCBjb29yZHM6IHt4OiAwLCB5OiAwLCB4MDogMCwgeTA6IDAsIHgxOiBudWxsLCB5MTogbnVsbH0sIHBvaW50c0F0OiAyIH0pXHJcbiAgbmF2VGFyZ2V0UGFydGljbGVzLnB1c2goeyBjaGFyOiAnQScsIHBvc0luQ2hhcjogMSwgcGxhY2VJblN0cjogMCwgZGlzdE1vdmVkOiAwLCBjb29yZHM6IHt4OiAwLCB5OiAwLCB4MDogMCwgeTA6IDAsIHgxOiBudWxsLCB5MTogbnVsbH0sIHBvaW50c0F0OiA0IH0pXHJcbiAgbmF2VGFyZ2V0UGFydGljbGVzLnB1c2goeyBjaGFyOiAnQScsIHBvc0luQ2hhcjogMiwgcGxhY2VJblN0cjogMCwgZGlzdE1vdmVkOiAwLCBjb29yZHM6IHt4OiAwLCB5OiAwLCB4MDogMCwgeTA6IDAsIHgxOiBudWxsLCB5MTogbnVsbH0sIHBvaW50c0F0OiAzIH0pXHJcbiAgbmF2VGFyZ2V0UGFydGljbGVzLnB1c2goeyBjaGFyOiAnQScsIHBvc0luQ2hhcjogMywgcGxhY2VJblN0cjogMCwgZGlzdE1vdmVkOiAwLCBjb29yZHM6IHt4OiAwLCB5OiAwLCB4MDogMCwgeTA6IDAsIHgxOiBudWxsLCB5MTogbnVsbH0sIHBvaW50c0F0OiA1IH0pXHJcbiAgbmF2VGFyZ2V0UGFydGljbGVzLnB1c2goeyBjaGFyOiAnQScsIHBvc0luQ2hhcjogNCwgcGxhY2VJblN0cjogMCwgZGlzdE1vdmVkOiAwLCBjb29yZHM6IHt4OiAwLCB5OiAwLCB4MDogMCwgeTA6IDAsIHgxOiBudWxsLCB5MTogbnVsbH0sIHBvaW50c0F0OiBudWxsIH0pXHJcbiAgbmF2VGFyZ2V0UGFydGljbGVzLnB1c2goeyBjaGFyOiAnQScsIHBvc0luQ2hhcjogNSwgcGxhY2VJblN0cjogMCwgZGlzdE1vdmVkOiAwLCBjb29yZHM6IHt4OiAwLCB5OiAwLCB4MDogMCwgeTA6IDAsIHgxOiBudWxsLCB5MTogbnVsbH0sIHBvaW50c0F0OiBudWxsIH0pXHJcblxyXG4gIC8vY2FsYyB4MSAmIHkxIGZyb20gbmF2VGFyZ2V0T3JpZ2luLCBuYXZUYXJnZXRTaXplLCBsZXR0ZXJzIGluIG5hdlRhcmdldCwgY2hhciBudW1iZXIsIHBhcnRpY2xlIG51bWJlclxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tVVBEQVRFIFBBUlRJQ0xFIFBPU0lUSU9OUyAmIFJFTkRFUlxyXG5mdW5jdGlvbiBhbmltYXRlKCkge1xyXG4gIGZyYW1lSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSlcclxuICBjdHgxLmNsZWFyUmVjdCgwLCAwLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KVxyXG4gIGNhbnZhc0hlbHBlcnMucmVuZGVyQm91bmRpbmdDaXJjbGUoY3R4MSwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkvL2RldlxyXG4gIGNhbnZhc0hlbHBlcnMucmVuZGVySG9sZFBhdHRlcm5XUHMoY3R4MSwgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwpLy9kZXZcclxuICBjYW52YXNIZWxwZXJzLnJlbmRlckhvbGRQYXR0ZXJuUGFydGljbGVQYXRocyhjdHgxLCBob2xkUGF0dGVyblBhcnRpY2xlcykvL2RldlxyXG4gIHVwZGF0ZUhvbGRQYXR0ZXJuUGFydGljbGVzKClcclxuICB1cGRhdGVOYXZUYXJnZXRMZXR0ZXJzUGFydGljbGVzKClcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlSG9sZFBhdHRlcm5QYXJ0aWNsZXMoKSB7XHJcbiAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7Ly90aGluayB0aGlzIHNob3VsZCBiZSBtb3ZlZCB0byBhIG1ldGhvZCBvbiBob2xkUGFydGljbGUgY2xhc3M/P1xyXG4gICAgcGFydGljbGUuZGlzdE1vdmVkID0gcGFydGljbGUuZGlzdE1vdmVkICsgcGFydGljbGUuc3BlZWRcclxuXHJcbiAgICBpZihwYXJ0aWNsZS5kaXN0TW92ZWQgPj0gMSkge1xyXG4gICAgICBwYXJ0aWNsZS5kaXN0TW92ZWQgPSAwXHJcbiAgICAgIHBhcnRpY2xlLm5leHRXUCA9IHBhcnRpY2xlLm5leHRXUCA9PT0gaG9sZFBhdHRlcm5XYXlwb2ludHMubGVuZ3RoIC0gMSA/IDAgOiBwYXJ0aWNsZS5uZXh0V1AgKyAxXHJcblxyXG4gICAgICBwYXJ0aWNsZS5jb29yZHMueDAgPSBwYXJ0aWNsZS5jb29yZHMueDFcclxuICAgICAgcGFydGljbGUuY29vcmRzLnkwID0gcGFydGljbGUuY29vcmRzLnkxXHJcbiAgICAgIHBhcnRpY2xlLmNvb3Jkcy54MSA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW3BhcnRpY2xlLm5leHRXUF0pLnhcclxuICAgICAgcGFydGljbGUuY29vcmRzLnkxID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbcGFydGljbGUubmV4dFdQXSkueVxyXG5cclxuICAgICAgcGFydGljbGUuY29vcmRzLmNwMXggPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHBhcnRpY2xlLmNvb3Jkcy54MCwgeTogcGFydGljbGUuY29vcmRzLnkwfSwge3g6IHBhcnRpY2xlLmNvb3Jkcy54MSwgeTogcGFydGljbGUuY29vcmRzLnkxfSkueFxyXG4gICAgICBwYXJ0aWNsZS5jb29yZHMuY3AxeSA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogcGFydGljbGUuY29vcmRzLngwLCB5OiBwYXJ0aWNsZS5jb29yZHMueTB9LCB7eDogcGFydGljbGUuY29vcmRzLngxLCB5OiBwYXJ0aWNsZS5jb29yZHMueTF9KS55XHJcbiAgICAgIHBhcnRpY2xlLmNvb3Jkcy5jcDJ4ID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHt4OiBwYXJ0aWNsZS5jb29yZHMueDAsIHk6IHBhcnRpY2xlLmNvb3Jkcy55MH0sIHt4OiBwYXJ0aWNsZS5jb29yZHMueDEsIHk6IHBhcnRpY2xlLmNvb3Jkcy55MX0pLnhcclxuICAgICAgcGFydGljbGUuY29vcmRzLmNwMnkgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHBhcnRpY2xlLmNvb3Jkcy54MCwgeTogcGFydGljbGUuY29vcmRzLnkwfSwge3g6IHBhcnRpY2xlLmNvb3Jkcy54MSwgeTogcGFydGljbGUuY29vcmRzLnkxfSkueVxyXG4gICAgfVxyXG5cclxuICAgIHBhcnRpY2xlLmNvb3Jkcy54ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHBhcnRpY2xlLmRpc3RNb3ZlZCwgcGFydGljbGUuY29vcmRzLngwLCBwYXJ0aWNsZS5jb29yZHMuY3AxeCwgcGFydGljbGUuY29vcmRzLmNwMngsIHBhcnRpY2xlLmNvb3Jkcy54MSlcclxuICAgIHBhcnRpY2xlLmNvb3Jkcy55ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHBhcnRpY2xlLmRpc3RNb3ZlZCwgcGFydGljbGUuY29vcmRzLnkwLCBwYXJ0aWNsZS5jb29yZHMuY3AxeSwgcGFydGljbGUuY29vcmRzLmNwMnksIHBhcnRpY2xlLmNvb3Jkcy55MSlcclxuXHJcbiAgICBwYXJ0aWNsZS5kcmF3KClcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVOYXZUYXJnZXRMZXR0ZXJzUGFydGljbGVzKCkge1xyXG4gIG5hdlRhcmdldFBhcnRpY2xlcy5mb3JFYWNoKChwYXJ0aWNsZSwgaW5kZXgpID0+IHtcclxuICAgIC8vaWYgZGlzdE1vdmVkIDwgMS4wIHRoZW4gdXBkYXRlIHBvc1xyXG4gICAgLy9pZiBkaXN0TW92ZWQgPiB0aHJlc2hvbGQgdGhlbiByZW5kZXIgdmVjdG9yXHJcbiAgICAvL3JlbmRlciBzZWxmXHJcbiAgfSlcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1CUkVBSyBQT0lOVFNcclxuZnVuY3Rpb24gc2V0TGF5b3V0KCkge1xyXG4gIC8vc21hbGwgd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC41XHJcbiAgfVxyXG4gIC8vc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcbiAgLy9tZWRpdW0gd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gMTAyNCAmJiBib2R5LmNsaWVudFdpZHRoID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuN1xyXG4gIH1cclxuICAvL21lZGl1bSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA8PSAxMDI0ICYmIGJvZHkuY2xpZW50SGVpZ2h0ID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjY1XHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuICAvL2xhcmdlIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoID4gMTAyNCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbGFyZ2Ugd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNjVcclxuICB9XHJcbiAgLy9sYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcblxyXG4gIGNhbnZhczEud2lkdGggPSBjYW52YXNXaWR0aFxyXG4gIGNhbnZhczEuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0XHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVZFTlQgTElTVEVORVJTXHJcbm5hdkdvVG9CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBwYXJ0aWNsZUxldHRlcnNUZXN0LCBmYWxzZSlcclxuXHJcbmZ1bmN0aW9uIHBhcnRpY2xlTGV0dGVyc1Rlc3QoKSB7XHJcbiAgY29uc29sZS5sb2cobGV0dGVyc0xpYi5sZXR0ZXJBQ29vcmRzKVxyXG4gIGNvbnNvbGUubG9nKGxldHRlcnNMaWIubGV0dGVyQVZlY3RvcnMpXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1QQVJUSUNMRSBDTEFTU0VTXHJcbi8vY29vcmRzIHt4OiBudW1iZXIsIHk6IG51bWJlciwgeDA6IG51bWJlciwgeTA6IG51bWJlciwgeDE6IG51bWJlciwgeTE6IG51bWJlciwgY3AxeDogbnVtYmVyLCBjcDF5OiBudW1iZXIsIGNwMng6IG51bWJlciwgY3AyeTogbnVtYmVyfVxyXG4vL2FnZSBudW1iZXJcclxuLy9zcGVlZCBudW1iZXJcclxuLy9kaXN0TW92ZWQgbnVtYmVyICglIGFsb25nIHBhdGggYXMgZGVjaW1hbClcclxuLy9uZXh0V1AgbnVtYmVyKGluZGV4KVxyXG5cclxuLy90aGluayBpZGVhIG1pZ2h0IGJlIHRvIHN0aWNrIG5lYXJseSBhbGwgdGhlIHByb3BzIG9uIHRoIFBhcnRpY2xlIHBhcmVudCwgc2NyYXAgdGhlIGludGVybWVkaWF0ZSBjbGFzcyBhbmQgY29uY2VudHJhdGUgb24gdGhlIG1ldGhvZHMgaW4gaW5kaXZpZHVhbFxyXG4vL3BhcnRpY2xlIGNsYXNzZXMuXHJcblxyXG5jbGFzcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQpIHtcclxuICAgIHRoaXMuY29vcmRzID0gY29vcmRzXHJcbiAgICB0aGlzLmFnZSA9IGFnZVxyXG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkXHJcbiAgICB0aGlzLmRpc3RNb3ZlZCA9IGRpc3RNb3ZlZFxyXG4gIH1cclxuXHJcbiAgZHJhdygpIHsvL2RlZmF1bHQgc2VsZiByZW5kZXIgZm9yIHBhcnRpY2xlcywgbWF5YmUgY2hhbmdlIGxhdGVyXHJcbiAgICBjdHgxLmJlZ2luUGF0aCgpXHJcbiAgICBjdHgxLmxpbmVXaWR0aCA9IDNcclxuICAgIGN0eDEuc3Ryb2tlU3R5bGUgPSAnd2hpdGUnXHJcbiAgICBjdHgxLmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eDEuYXJjKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnksIDMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSlcclxuICAgIGN0eDEuc3Ryb2tlKClcclxuICAgIGN0eDEuZmlsbCgpXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBob2xkUGF0dGVyblBhcnRpY2xlIGV4dGVuZHMgUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3JkcywgYWdlLCBzcGVlZCwgZGlzdE1vdmVkLCBuZXh0V1ApIHtcclxuICAgIHN1cGVyKGNvb3JkcywgYWdlLCBzcGVlZCwgZGlzdE1vdmVkKVxyXG4gICAgdGhpcy5uZXh0V1AgPSBuZXh0V1BcclxuICB9XHJcbn1cclxuLypcclxuY2xhc3MgaG9sZFBhdHRlcm5QYXJ0aWNsZSBleHRlbmRzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3RvcihzdGFydENvb3JkcywgZW5kQ29vcmRzLCBjb29yZHMsIGFnZSwgc3BlZWQsIGRpc3RNb3ZlZCwgY3AxQ29vcmRzLCBjcDJDb29yZHMsIG5leHRXUCkge1xyXG4gICAgc3VwZXIoY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQsIHN0YXJ0Q29vcmRzLCBlbmRDb29yZHMpXHJcbiAgICB0aGlzLmNwMUNvb3JkcyA9IGNwMUNvb3Jkc1xyXG4gICAgdGhpcy5jcDJDb29yZHMgPSBjcDJDb29yZHNcclxuICAgIHRoaXMubmV4dFdQID0gbmV4dFdQXHJcbiAgfVxyXG59XHJcbiovXHJcbiIsIi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTUFUSCBIRUxQRVJTXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tR0VPTUVUUlkgSEVMUEVSU1xyXG5mdW5jdGlvbiByYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHAxLCBwMikge1xyXG4gIGNvbnN0IE1JTl9ESVNUID0gNDBcclxuICBjb25zdCBESVNUX01PRCA9IDAuNVxyXG4gIGNvbnN0IEFOR0xFX1dJVEhJTiA9IE1hdGguUElcclxuICBsZXQgYSA9IHAyLnggLSBwMS54XHJcbiAgbGV0IGIgPSBwMi55IC0gcDEueVxyXG4gIGxldCBwMVAyRGlzdCA9IE1hdGguc3FydChhKmEgKyBiKmIpXHJcbiAgbGV0IHJhbmREaXN0ID0gKE1hdGgucmFuZG9tKCkgKiBwMVAyRGlzdCAqIERJU1RfTU9EKSArIE1JTl9ESVNUXHJcbiAgbGV0IGFuZ2xlTW9kID0gKE1hdGgucmFuZG9tKCkgKiBBTkdMRV9XSVRISU4pIC0gKEFOR0xFX1dJVEhJTiAvIDIpXHJcbiAgbGV0IHJhbmRBbmdsZVxyXG4gIGxldCBjb29yZHMgPSB7eDogbnVsbCwgeTogbnVsbH1cclxuXHJcbiAgaWYoTWF0aC5yYW5kb20oKSA+PSAwLjUpIHtcclxuICAgIHJhbmRBbmdsZSA9IE1hdGguYXRhbjIocDIueSAtIHAxLnksIHAxLnggLSBwMi54KSArIGFuZ2xlTW9kXHJcbiAgICBjb29yZHMueCA9IHAyLnggKyBNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICAgIGNvb3Jkcy55ID0gcDIueSAtIE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gIH0gZWxzZSB7XHJcbiAgICByYW5kQW5nbGUgPSBNYXRoLmF0YW4yKHAxLnkgLSBwMi55LCBwMi54IC0gcDEueCkgKyBhbmdsZU1vZFxyXG4gICAgY29vcmRzLnggPSBwMS54ICsgTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgICBjb29yZHMueSA9IHAxLnkgLSBNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICB9XHJcblxyXG4gIHJldHVybiBjb29yZHNcclxufVxyXG5cclxuZnVuY3Rpb24gcmFuZFBvaW50TmVhclBvaW50KHB0KSB7XHJcbiAgY29uc3QgTUFYX0ZST00gPSA0MFxyXG4gIGxldCByYW5kRGlzdCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE1BWF9GUk9NKVxyXG4gIGxldCByYW5kQW5nbGUgPSBNYXRoLnJhbmRvbSgpICogTWF0aC5QSSAqIDJcclxuICBsZXQgeCA9IHB0LnggKyAoTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0KVxyXG4gIGxldCB5ID0gcHQueSArIChNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3QpXHJcblxyXG4gIHJldHVybiB7eDogeCwgeTogeX1cclxufVxyXG5cclxuLy9zdG9sZW4gZnJvbSBzdGFja292ZXJmbG93XHJcbmZ1bmN0aW9uIGNvb3Jkc09uQ3ViaWNCZXppZXIocGVyY2VudCwgc3RhcnRQdCwgY3AxLCBjcDIsIGVuZFB0KSB7XHJcbiAgbGV0IHQyID0gcGVyY2VudCAqIHBlcmNlbnRcclxuICBsZXQgdDMgPSB0MiAqIHBlcmNlbnRcclxuXHJcbiAgcmV0dXJuIHN0YXJ0UHQgKyAoLXN0YXJ0UHQgKiAzICsgcGVyY2VudCAqICgzICogc3RhcnRQdCAtIHN0YXJ0UHQgKiBwZXJjZW50KSkgKiBwZXJjZW50XHJcbiAgKyAoMyAqIGNwMSArIHBlcmNlbnQgKiAoLTYgKiBjcDEgKyBjcDEgKiAzICogcGVyY2VudCkpICogcGVyY2VudFxyXG4gICsgKGNwMiAqIDMgLSBjcDIgKiAzICogcGVyY2VudCkgKiB0MlxyXG4gICsgZW5kUHQgKiB0M1xyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tREVWIEZVTkNUSU9OUyBXT1QgRk9SIFZJU1VBTElTSU5HIFdIQVQnUyBPQ0NVUklOR1xyXG5mdW5jdGlvbiByZW5kZXJCb3VuZGluZ0NpcmNsZShjdHgsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpIHtcclxuICBsZXQgY2VudGVyWCA9IGNhbnZhc1dpZHRoIC8gMlxyXG4gIGxldCBjZW50ZXJZID0gY2FudmFzSGVpZ2h0IC8gMlxyXG4gIGxldCByYWRpdXMgPSBjZW50ZXJZID4gY2VudGVyWCA/IGNlbnRlclggLSAyIDogY2VudGVyWSAtIDJcclxuICBsZXQgc3RhcnRBbmdsZSA9IDBcclxuICBsZXQgZW5kQW5nbGUgPSAyICogTWF0aC5QSVxyXG4gIGN0eC5saW5lV2lkdGggPSAxXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZXknXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LmFyYyhjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKVxyXG4gIGN0eC5zdHJva2UoKVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJIb2xkUGF0dGVybldQcyhjdHgsIHdheXBvaW50cykge1xyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5maWxsU3R5bGUgPSAnYmx1ZSdcclxuICB3YXlwb2ludHMuZm9yRWFjaCh3cCA9PiB7XHJcbiAgICBjdHguZmlsbFJlY3Qod3AueCAtIDQsIHdwLnkgLSA0LCA4LCA4KVxyXG4gIH0pXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckhvbGRQYXR0ZXJuUGFydGljbGVQYXRocyhjdHgsIHBhcnRpY2xlcykge1xyXG4gIHBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcclxuICAgIGxldCBjcDFYID0gcGFydGljbGUuY29vcmRzLmNwMXhcclxuICAgIGxldCBjcDFZID0gcGFydGljbGUuY29vcmRzLmNwMXlcclxuICAgIGxldCBjcDJYID0gcGFydGljbGUuY29vcmRzLmNwMnhcclxuICAgIGxldCBjcDJZID0gcGFydGljbGUuY29vcmRzLmNwMnlcclxuICAgIGxldCBzdGFydFggPSBwYXJ0aWNsZS5jb29yZHMueDBcclxuICAgIGxldCBzdGFydFkgPSBwYXJ0aWNsZS5jb29yZHMueTBcclxuICAgIGxldCBlbmRYID0gcGFydGljbGUuY29vcmRzLngxXHJcbiAgICBsZXQgZW5kWSA9IHBhcnRpY2xlLmNvb3Jkcy55MVxyXG4gICAgY3R4LmxpbmVXaWR0aCA9IDFcclxuICAgIC8vcmVuZGVyIHN0YXJ0IHBvaW50XHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmVlbidcclxuICAgIGN0eC5yZWN0KHN0YXJ0WCAtIDIsIHN0YXJ0WSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIGVuZCBwb2ludFxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3JlZCdcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnJlY3QoZW5kWCAtIDIsIGVuZFkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBjb250cm9sIHBvaW50IDFcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3llbGxvdydcclxuICAgIGN0eC5yZWN0KGNwMVggLSAyLCBjcDFZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAyXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdvcmFuZ2UnXHJcbiAgICBjdHgucmVjdChjcDJYIC0gMiwgY3AyWSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIHBhdGhcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZXknXHJcbiAgICBjdHgubW92ZVRvKHN0YXJ0WCwgc3RhcnRZKVxyXG4gICAgY3R4LmJlemllckN1cnZlVG8oY3AxWCwgY3AxWSwgY3AyWCwgY3AyWSwgZW5kWCwgZW5kWSlcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gIH0pXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tZXhwb3J0ZWQgZnVuY3Rpb25zXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMsXHJcbiAgcmFuZFBvaW50TmVhclBvaW50LFxyXG4gIGNvb3Jkc09uQ3ViaWNCZXppZXIsXHJcbiAgLy9kZXZcclxuICByZW5kZXJCb3VuZGluZ0NpcmNsZSxcclxuICByZW5kZXJIb2xkUGF0dGVybldQcyxcclxuICByZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHNcclxufVxyXG4iLCIvL2FycmF5IGZvciBuYXYgdGFyZ2V0IGxldHRlcmluZyBwYXJ0aWNsZXNcclxubGV0IGxldHRlckFDb29yZHMgPSBbXHJcbiAge3g6IDAuMTI1LCB5OiAwLjg3NX0sLy8wXHJcbiAge3g6IDAuMjUsIHk6IDAuNX0sICAgLy8xXHJcbiAge3g6IDAuMzc1LCB5OiAwLjEyNX0sLy8yXHJcbiAge3g6IDAuNjI1LCB5OiAwLjEyNX0sLy8zXHJcbiAge3g6IDAuNzUsIHk6IDAuNX0sICAgLy80XHJcbiAge3g6IDAuODc1LCB5OiAwLjg3NX0gLy81XHJcbl1cclxubGV0IGxldHRlckFWZWN0b3JzID0gW1xyXG4gIHtmcm9tOiAwLCB0bzogMn0sXHJcbiAge2Zyb206IDEsIHRvOiA0fSxcclxuICB7ZnJvbTogMiwgdG86IDN9LFxyXG4gIHtmcm9tOiAzLCB0bzogNX1cclxuXVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbGV0dGVyQUNvb3JkcyxcclxuICBsZXR0ZXJBVmVjdG9yc1xyXG59XHJcbiJdfQ==
