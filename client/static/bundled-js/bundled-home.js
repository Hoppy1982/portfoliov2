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
let navTargetOrigin = {x: 50, y: 50}
let navTargetCharSize = {width: 80, height: 80}

let holdPatternParticles = []
let navTargetParticles = []

let navTargetWord = 'BBA'//dev temp

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
  initHoldPatternParticles(20)
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
    let speed = 0.0025
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

    let particle = new HoldPatternParticle(coords, age, speed, distMoved, nextWP)

    holdPatternParticles.push(particle)
  }
}

//--------------------------------------------UPDATE PARTICLE POSITIONS & RENDER
function animate() {
  frameId = requestAnimationFrame(animate)
  ctx1.clearRect(0, 0, canvasWidth, canvasHeight)
  //canvasHelpers.renderBoundingCircle(ctx1, canvasWidth, canvasHeight)//dev
  //canvasHelpers.renderHoldPatternWPs(ctx1, holdPatternWaypointsActual)//dev
  //canvasHelpers.renderHoldPatternParticlePaths(ctx1, holdPatternParticles)//dev
  updateHoldPatternParticles()
  updateNavTargetLettersParticles()
}

function updateHoldPatternParticles() {
  holdPatternParticles.forEach(particle => {//think this should be moved to a method on holdParticle class??
    particle.updatePos()
    particle.draw('white')
  })
}

function updateNavTargetLettersParticles() {
  navTargetParticles.forEach((particle, index) => {
    //if distMoved < 1.0 then update pos
    //if distMoved > threshold then render vector
    //render self
    particle.updatePos()
    particle.draw('red')
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
document.addEventListener("DOMContentLoaded", init)
window.addEventListener('resize', init)
navGoToButton.addEventListener('click', initNavTarget, false)

//move some of this to letter-lib
function initNavTarget() {
  let requiredParticles = lettersLib.totalRequiredParticles(navTargetWord)
  let destinationsAndTargets = lettersLib.getDestinationsAndTargets(navTargetWord, navTargetOrigin, navTargetCharSize)

  if (holdPatternParticles.length > requiredParticles) {
    for(let i = 0; i < requiredParticles; i++) {
      let transferringParticle = holdPatternParticles.pop()
      let coords = {
        x: transferringParticle.coords.x,
        y: transferringParticle.coords.y,
        x0: transferringParticle.coords.x,
        y0: transferringParticle.coords.y,
        x1: destinationsAndTargets[i].x1,
        y1: destinationsAndTargets[i].y1
      }
      let age = transferringParticle.age
      let speed = transferringParticle.speed
      let distMoved = 0
      let pointsAt = destinationsAndTargets[i].pointsAt
      navTargetParticles.push(new CharPatternParticle(coords, age, speed, distMoved, pointsAt))
    }

  }
  console.log(destinationsAndTargets)
}
//holdPatternPrticles | HoldPatternParticle: coords, age, speed, distMoved, nextWP
//navTargetParticles: | CharPatternParticle: coords, age, speed, distMoved, char, posInChar, posInStr, pointsAt


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

  draw(color) {//default self render for particles, maybe change later
    ctx1.beginPath()
    ctx1.lineWidth = 3
    ctx1.strokeStyle = color
    ctx1.fillStyle = 'black'
    ctx1.arc(this.coords.x, this.coords.y, 3, 0, Math.PI * 2, false)
    ctx1.stroke()
    ctx1.fill()
  }

  updatePos() {
    this.coords.x += this.speed
    this.coords.y += this.speed
  }
}

class HoldPatternParticle extends Particle {
  constructor(coords, age, speed, distMoved, nextWP) {
    super(coords, age, speed, distMoved)
    this.nextWP = nextWP
  }

  updatePos() {
    this.distMoved += this.speed
    if(this.distMoved >= 1) {
      this.distMoved = 0
      this.nextWP = this.nextWP === holdPatternWaypoints.length - 1 ? 0 : this.nextWP + 1
      this.coords.x0 = this.coords.x1
      this.coords.y0 = this.coords.y1
      this.coords.x1 = canvasHelpers.randPointNearPoint(holdPatternWaypointsActual[this.nextWP]).x
      this.coords.y1 = canvasHelpers.randPointNearPoint(holdPatternWaypointsActual[this.nextWP]).y
      this.coords.cp1x = canvasHelpers.randPointBetweenTwoPoints({x: this.coords.x0, y: this.coords.y0}, {x: this.coords.x1, y: this.coords.y1}).x
      this.coords.cp1y = canvasHelpers.randPointBetweenTwoPoints({x: this.coords.x0, y: this.coords.y0}, {x: this.coords.x1, y: this.coords.y1}).y
      this.coords.cp2x = canvasHelpers.randPointBetweenTwoPoints({x: this.coords.x0, y: this.coords.y0}, {x: this.coords.x1, y: this.coords.y1}).x
      this.coords.cp2y = canvasHelpers.randPointBetweenTwoPoints({x: this.coords.x0, y: this.coords.y0}, {x: this.coords.x1, y: this.coords.y1}).y
    }
    this.coords.x = canvasHelpers.coordsOnCubicBezier(this.distMoved, this.coords.x0, this.coords.cp1x, this.coords.cp2x, this.coords.x1)
    this.coords.y = canvasHelpers.coordsOnCubicBezier(this.distMoved, this.coords.y0, this.coords.cp1y, this.coords.cp2y, this.coords.y1)
  }
}

class CharPatternParticle extends Particle {
  constructor(coords, age, speed, distMoved, pointsAt) {
    super(coords, age, speed, distMoved)
    this.pointsAt = pointsAt
  }

  updatePos() {
    this.distMoved += this.speed

    if(this.distMoved < 1) {
      let newPos = canvasHelpers.coordsOnStraightLine(this.distMoved, {x: this.coords.x0, y: this.coords.y0}, {x: this.coords.x1, y: this.coords.y1})
      this.coords.x = newPos.x
      this.coords.y = newPos.y
    }
  }
}

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

function coordsOnStraightLine(percent, startPt, endPt) {
  let xTotal = endPt.x - startPt.x
  let yTotal = endPt.y - startPt.y
  let xDist = percent * xTotal
  let yDist = percent * yTotal

  return {x: startPt.x + xDist, y: startPt.y + yDist}
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
  coordsOnStraightLine,
  coordsOnCubicBezier,
  //dev
  renderBoundingCircle,
  renderHoldPatternWPs,
  renderHoldPatternParticlePaths
}

},{}],3:[function(require,module,exports){
//------------------------------------------COORDS AS RATIO AND VECTOR POINT ATS
let lettersCoords = {
  A: [
    {x: 0.125, y: 0.875},//0
    {x: 0.25, y: 0.5},   //1
    {x: 0.375, y: 0.125},//2
    {x: 0.625, y: 0.125},//3
    {x: 0.75, y: 0.5},   //4
    {x: 0.875, y: 0.875} //5
  ],
  B : [
    {x: 0.25, y: 0.875},//0
    {x: 0.25, y: 0.5},  //1
    {x: 0.25, y: 0.125},//2
    {x: 0.75, y: 0.25}, //3
    {x: 0.75, y: 0.75}  //4
  ]
}

let lettersVectors = {
  A: [
    {from: 0, to: 2},
    {from: 1, to: 4},
    {from: 2, to: 3},
    {from: 3, to: 5}
  ]
}
//--------------------------------------------------------------HELPER FUNCTIONS
function totalRequiredParticles(str) {
  let requiredParticles = 0

  for(i in str) {
    //todo think about way of swapping the switch statement for something more general
    switch(str.charAt(i)) {
      case 'A':
        requiredParticles += lettersCoords.A.length
        break
      case 'B':
        requiredParticles += lettersCoords.B.length
        break
    }
  }

  return requiredParticles
}


//let navTargetOrigin = {x: 30, y: 30}
//let navTargetSize = {width: 300, height: 60}
function getDestinationsAndTargets(str, origin, charSize) {
  let destinationsAndTargets = []

  //target == origin plus (char pos in str * width of char) plus particle pos in char
  for(let posInStr in str) {
    let x1 = null
    let y1 = null
    let pointsAt = null
    let charHere = str.charAt(posInStr)
    let nParticlesForThisChar =lettersCoords[charHere].length

    for(let posInChar = 0; posInChar < nParticlesForThisChar; posInChar++) {
      x1 = origin.x + (posInStr * charSize.width) + (charSize.width * lettersCoords[charHere][posInChar].x)
      y1 = origin.y + (charSize.height * lettersCoords[charHere][posInChar].y)
      destinationsAndTargets.push( {x1: x1, y1: y1, pointsAt: pointsAt} )
    }

  }

  return destinationsAndTargets

}


module.exports = {
  lettersCoords,
  lettersVectors,
  totalRequiredParticles,
  getDestinationsAndTargets
}

//have a function that takes in a string and returns total nParticles using lengths of each letter array

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2FudmFzLWhlbHBlcnMuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9sZXR0ZXJzLWxpYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGNhbnZhc0hlbHBlcnMgPSByZXF1aXJlKCcuL3V0aWxzL2NhbnZhcy1oZWxwZXJzLmpzJylcclxuY29uc3QgbGV0dGVyc0xpYiA9IHJlcXVpcmUoJy4vdXRpbHMvbGV0dGVycy1saWIuanMnKVxyXG5cclxubGV0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdXHJcbmxldCBjYW52YXMxID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2NhbnZhcycpWzBdXHJcbmxldCBjdHgxID0gY2FudmFzMS5nZXRDb250ZXh0KCcyZCcpXHJcbmxldCBuYXZHb1RvQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdmlnYXRvckRlc2MnKS8vZGV2XHJcbmxldCBmcmFtZUlkXHJcbmxldCBjYW52YXNXaWR0aFxyXG5sZXQgY2FudmFzSGVpZ2h0XHJcblxyXG4vL2hvbGQgcGF0dGVybiBXUCBjb29yZHMgYXMgcmF0aW8gb2YgY2FudmFzIHNpemVcclxubGV0IGhvbGRQYXR0ZXJuV2F5cG9pbnRzID0gW1xyXG4gIHt4OiAwLjEyNSwgeTogMC41fSwvLzBcclxuICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMVxyXG4gIHt4OiAwLjc1LCB5OiAwLjEyNX0sLy8yXHJcbiAge3g6IDAuODc1LCB5OiAwLjV9LC8vM1xyXG4gIHt4OiAwLjc1LCB5OiAwLjg3NX0sLy80XHJcbiAge3g6IDAuMjUsIHk6IDAuODc1fS8vNVxyXG5dXHJcbmxldCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCA9IFtdLy9ob2xkIHBhdHRlcm4gV1AgY29vcmRzIGluIHBpeGVscywgcmVjYWxjdW1hbGF0ZWQgb24gcmVzaXplXHJcbmxldCBuYXZUYXJnZXRPcmlnaW4gPSB7eDogNTAsIHk6IDUwfVxyXG5sZXQgbmF2VGFyZ2V0Q2hhclNpemUgPSB7d2lkdGg6IDgwLCBoZWlnaHQ6IDgwfVxyXG5cclxubGV0IGhvbGRQYXR0ZXJuUGFydGljbGVzID0gW11cclxubGV0IG5hdlRhcmdldFBhcnRpY2xlcyA9IFtdXHJcblxyXG5sZXQgbmF2VGFyZ2V0V29yZCA9ICdCQkEnLy9kZXYgdGVtcFxyXG5cclxuLy9hcnJheSBmb3Igc3Bhd25pbmcgcG9vbCBwYXJ0aWNsZXNcclxuLy9hcnJheSBmb3Igd29ybWhvbGUgbGVhdmluZyBwYXJ0aWNsZXNcclxuLy9hcnJheSBmb3IgcGFydGljbGVzIHRyYW5zaXRpb25pbmcgYmV0d2VlbiBtYWluIGFycmF5cz8/P1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTUFOQUdFUlNcclxuLy9wb3NzaWJseSBzcGxpdCB0aGlzIGludG8gYSBmdW5jdGlvbiB0aGF0IGZpcmVzIGp1c3Qgb25jZSBvbiBkb20gbG9hZCxcclxuLy90aGVuIGFub3RoZXIgbWFuYWdlciB0aGF0IHJ1bnMgb24gcmVzaXppbmc/XHJcbmZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgcmVzZXQoKVxyXG4gIHNldExheW91dCgpXHJcbiAgaW5pdEhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKClcclxuICBpbml0SG9sZFBhdHRlcm5QYXJ0aWNsZXMoMjApXHJcbiAgYW5pbWF0ZSgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc2V0KCkge1xyXG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lSWQpXHJcbiAgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwubGVuZ3RoID0gMFxyXG4gIGhvbGRQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA9IDBcclxuICBuYXZUYXJnZXRMZXR0ZXJzUGFydGljbGVzID0gMC8vZGV2XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRIb2xkUGF0dGVybldheXBvaW50c0FjdHVhbCgpIHtcclxuICBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCA9IGhvbGRQYXR0ZXJuV2F5cG9pbnRzLm1hcChlbCA9PiB7XHJcbiAgICBsZXQgeCA9IGVsLnggKiBjYW52YXNXaWR0aFxyXG4gICAgbGV0IHkgPSBlbC55ICogY2FudmFzSGVpZ2h0XHJcbiAgICByZXR1cm4ge3g6IHgsIHk6IHl9XHJcbiAgfSlcclxufVxyXG4vL2Nvb3JkcywgYWdlLCBzcGVlZCwgZGlzdE1vdmVkLCBuZXh0V1BcclxuZnVuY3Rpb24gaW5pdEhvbGRQYXR0ZXJuUGFydGljbGVzKG5QYXJ0aWNsZXMpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgblBhcnRpY2xlczsgaSsrKSB7XHJcbiAgICBsZXQgZnJvbVdQID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNilcclxuICAgIGxldCBuZXh0V1AgPSBmcm9tV1AgKyAxXHJcbiAgICBpZihuZXh0V1AgPT09IGhvbGRQYXR0ZXJuV2F5cG9pbnRzLmxlbmd0aCkge25leHRXUCA9IDB9XHJcbiAgICBsZXQgYWdlID0gMFxyXG4gICAgbGV0IHNwZWVkID0gMC4wMDI1XHJcbiAgICAvL2xldCBkaXN0TW92ZWQgPSBOdW1iZXIoIChNYXRoLnJhbmRvbSgpICkudG9GaXhlZCgxKSApXHJcbiAgICBsZXQgZGlzdE1vdmVkID0gTWF0aC5yb3VuZCggTWF0aC5yYW5kb20oKSAqIDEwICkgLyAxMFxyXG4gICAgbGV0IHN0YXJ0Q29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbZnJvbVdQXSlcclxuICAgIGxldCBlbmRDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFtuZXh0V1BdKVxyXG4gICAgbGV0IGNwMUNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhzdGFydENvb3JkcywgZW5kQ29vcmRzKVxyXG4gICAgbGV0IGNwMkNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhzdGFydENvb3JkcywgZW5kQ29vcmRzKVxyXG5cclxuICAgIGxldCBjb29yZHMgPSB7XHJcbiAgICAgIHg6IHN0YXJ0Q29vcmRzLngsIHk6IHN0YXJ0Q29vcmRzLnksXHJcbiAgICAgIHgwOiBzdGFydENvb3Jkcy54LCB5MDogc3RhcnRDb29yZHMueSxcclxuICAgICAgeDE6IGVuZENvb3Jkcy54LCB5MTogZW5kQ29vcmRzLnksXHJcbiAgICAgIGNwMXg6IGNwMUNvb3Jkcy54LCBjcDF5OiBjcDFDb29yZHMueSxcclxuICAgICAgY3AyeDogY3AyQ29vcmRzLngsIGNwMnk6IGNwMkNvb3Jkcy55XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHBhcnRpY2xlID0gbmV3IEhvbGRQYXR0ZXJuUGFydGljbGUoY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQsIG5leHRXUClcclxuXHJcbiAgICBob2xkUGF0dGVyblBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKVxyXG4gIH1cclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVVQREFURSBQQVJUSUNMRSBQT1NJVElPTlMgJiBSRU5ERVJcclxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcclxuICBmcmFtZUlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpXHJcbiAgY3R4MS5jbGVhclJlY3QoMCwgMCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodClcclxuICAvL2NhbnZhc0hlbHBlcnMucmVuZGVyQm91bmRpbmdDaXJjbGUoY3R4MSwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkvL2RldlxyXG4gIC8vY2FudmFzSGVscGVycy5yZW5kZXJIb2xkUGF0dGVybldQcyhjdHgxLCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCkvL2RldlxyXG4gIC8vY2FudmFzSGVscGVycy5yZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHMoY3R4MSwgaG9sZFBhdHRlcm5QYXJ0aWNsZXMpLy9kZXZcclxuICB1cGRhdGVIb2xkUGF0dGVyblBhcnRpY2xlcygpXHJcbiAgdXBkYXRlTmF2VGFyZ2V0TGV0dGVyc1BhcnRpY2xlcygpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUhvbGRQYXR0ZXJuUGFydGljbGVzKCkge1xyXG4gIGhvbGRQYXR0ZXJuUGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4gey8vdGhpbmsgdGhpcyBzaG91bGQgYmUgbW92ZWQgdG8gYSBtZXRob2Qgb24gaG9sZFBhcnRpY2xlIGNsYXNzPz9cclxuICAgIHBhcnRpY2xlLnVwZGF0ZVBvcygpXHJcbiAgICBwYXJ0aWNsZS5kcmF3KCd3aGl0ZScpXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlTmF2VGFyZ2V0TGV0dGVyc1BhcnRpY2xlcygpIHtcclxuICBuYXZUYXJnZXRQYXJ0aWNsZXMuZm9yRWFjaCgocGFydGljbGUsIGluZGV4KSA9PiB7XHJcbiAgICAvL2lmIGRpc3RNb3ZlZCA8IDEuMCB0aGVuIHVwZGF0ZSBwb3NcclxuICAgIC8vaWYgZGlzdE1vdmVkID4gdGhyZXNob2xkIHRoZW4gcmVuZGVyIHZlY3RvclxyXG4gICAgLy9yZW5kZXIgc2VsZlxyXG4gICAgcGFydGljbGUudXBkYXRlUG9zKClcclxuICAgIHBhcnRpY2xlLmRyYXcoJ3JlZCcpXHJcbiAgfSlcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1CUkVBSyBQT0lOVFNcclxuZnVuY3Rpb24gc2V0TGF5b3V0KCkge1xyXG4gIC8vc21hbGwgd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC41XHJcbiAgfVxyXG4gIC8vc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcbiAgLy9tZWRpdW0gd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gMTAyNCAmJiBib2R5LmNsaWVudFdpZHRoID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuN1xyXG4gIH1cclxuICAvL21lZGl1bSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA8PSAxMDI0ICYmIGJvZHkuY2xpZW50SGVpZ2h0ID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjY1XHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuICAvL2xhcmdlIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoID4gMTAyNCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbGFyZ2Ugd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNjVcclxuICB9XHJcbiAgLy9sYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcblxyXG4gIGNhbnZhczEud2lkdGggPSBjYW52YXNXaWR0aFxyXG4gIGNhbnZhczEuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0XHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVZFTlQgTElTVEVORVJTXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGluaXQpXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBpbml0KVxyXG5uYXZHb1RvQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaW5pdE5hdlRhcmdldCwgZmFsc2UpXHJcblxyXG4vL21vdmUgc29tZSBvZiB0aGlzIHRvIGxldHRlci1saWJcclxuZnVuY3Rpb24gaW5pdE5hdlRhcmdldCgpIHtcclxuICBsZXQgcmVxdWlyZWRQYXJ0aWNsZXMgPSBsZXR0ZXJzTGliLnRvdGFsUmVxdWlyZWRQYXJ0aWNsZXMobmF2VGFyZ2V0V29yZClcclxuICBsZXQgZGVzdGluYXRpb25zQW5kVGFyZ2V0cyA9IGxldHRlcnNMaWIuZ2V0RGVzdGluYXRpb25zQW5kVGFyZ2V0cyhuYXZUYXJnZXRXb3JkLCBuYXZUYXJnZXRPcmlnaW4sIG5hdlRhcmdldENoYXJTaXplKVxyXG5cclxuICBpZiAoaG9sZFBhdHRlcm5QYXJ0aWNsZXMubGVuZ3RoID4gcmVxdWlyZWRQYXJ0aWNsZXMpIHtcclxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCByZXF1aXJlZFBhcnRpY2xlczsgaSsrKSB7XHJcbiAgICAgIGxldCB0cmFuc2ZlcnJpbmdQYXJ0aWNsZSA9IGhvbGRQYXR0ZXJuUGFydGljbGVzLnBvcCgpXHJcbiAgICAgIGxldCBjb29yZHMgPSB7XHJcbiAgICAgICAgeDogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLngsXHJcbiAgICAgICAgeTogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLnksXHJcbiAgICAgICAgeDA6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy54LFxyXG4gICAgICAgIHkwOiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueSxcclxuICAgICAgICB4MTogZGVzdGluYXRpb25zQW5kVGFyZ2V0c1tpXS54MSxcclxuICAgICAgICB5MTogZGVzdGluYXRpb25zQW5kVGFyZ2V0c1tpXS55MVxyXG4gICAgICB9XHJcbiAgICAgIGxldCBhZ2UgPSB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5hZ2VcclxuICAgICAgbGV0IHNwZWVkID0gdHJhbnNmZXJyaW5nUGFydGljbGUuc3BlZWRcclxuICAgICAgbGV0IGRpc3RNb3ZlZCA9IDBcclxuICAgICAgbGV0IHBvaW50c0F0ID0gZGVzdGluYXRpb25zQW5kVGFyZ2V0c1tpXS5wb2ludHNBdFxyXG4gICAgICBuYXZUYXJnZXRQYXJ0aWNsZXMucHVzaChuZXcgQ2hhclBhdHRlcm5QYXJ0aWNsZShjb29yZHMsIGFnZSwgc3BlZWQsIGRpc3RNb3ZlZCwgcG9pbnRzQXQpKVxyXG4gICAgfVxyXG5cclxuICB9XHJcbiAgY29uc29sZS5sb2coZGVzdGluYXRpb25zQW5kVGFyZ2V0cylcclxufVxyXG4vL2hvbGRQYXR0ZXJuUHJ0aWNsZXMgfCBIb2xkUGF0dGVyblBhcnRpY2xlOiBjb29yZHMsIGFnZSwgc3BlZWQsIGRpc3RNb3ZlZCwgbmV4dFdQXHJcbi8vbmF2VGFyZ2V0UGFydGljbGVzOiB8IENoYXJQYXR0ZXJuUGFydGljbGU6IGNvb3JkcywgYWdlLCBzcGVlZCwgZGlzdE1vdmVkLCBjaGFyLCBwb3NJbkNoYXIsIHBvc0luU3RyLCBwb2ludHNBdFxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1QQVJUSUNMRSBDTEFTU0VTXHJcbi8vY29vcmRzIHt4OiBudW1iZXIsIHk6IG51bWJlciwgeDA6IG51bWJlciwgeTA6IG51bWJlciwgeDE6IG51bWJlciwgeTE6IG51bWJlciwgY3AxeDogbnVtYmVyLCBjcDF5OiBudW1iZXIsIGNwMng6IG51bWJlciwgY3AyeTogbnVtYmVyfVxyXG4vL2FnZSBudW1iZXJcclxuLy9zcGVlZCBudW1iZXJcclxuLy9kaXN0TW92ZWQgbnVtYmVyICglIGFsb25nIHBhdGggYXMgZGVjaW1hbClcclxuLy9uZXh0V1AgbnVtYmVyKGluZGV4KVxyXG5cclxuLy90aGluayBpZGVhIG1pZ2h0IGJlIHRvIHN0aWNrIG5lYXJseSBhbGwgdGhlIHByb3BzIG9uIHRoIFBhcnRpY2xlIHBhcmVudCwgc2NyYXAgdGhlIGludGVybWVkaWF0ZSBjbGFzcyBhbmQgY29uY2VudHJhdGUgb24gdGhlIG1ldGhvZHMgaW4gaW5kaXZpZHVhbFxyXG4vL3BhcnRpY2xlIGNsYXNzZXMuXHJcblxyXG5jbGFzcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQpIHtcclxuICAgIHRoaXMuY29vcmRzID0gY29vcmRzXHJcbiAgICB0aGlzLmFnZSA9IGFnZVxyXG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkXHJcbiAgICB0aGlzLmRpc3RNb3ZlZCA9IGRpc3RNb3ZlZFxyXG4gIH1cclxuXHJcbiAgZHJhdyhjb2xvcikgey8vZGVmYXVsdCBzZWxmIHJlbmRlciBmb3IgcGFydGljbGVzLCBtYXliZSBjaGFuZ2UgbGF0ZXJcclxuICAgIGN0eDEuYmVnaW5QYXRoKClcclxuICAgIGN0eDEubGluZVdpZHRoID0gM1xyXG4gICAgY3R4MS5zdHJva2VTdHlsZSA9IGNvbG9yXHJcbiAgICBjdHgxLmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eDEuYXJjKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnksIDMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSlcclxuICAgIGN0eDEuc3Ryb2tlKClcclxuICAgIGN0eDEuZmlsbCgpXHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3MoKSB7XHJcbiAgICB0aGlzLmNvb3Jkcy54ICs9IHRoaXMuc3BlZWRcclxuICAgIHRoaXMuY29vcmRzLnkgKz0gdGhpcy5zcGVlZFxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgSG9sZFBhdHRlcm5QYXJ0aWNsZSBleHRlbmRzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIGFnZSwgc3BlZWQsIGRpc3RNb3ZlZCwgbmV4dFdQKSB7XHJcbiAgICBzdXBlcihjb29yZHMsIGFnZSwgc3BlZWQsIGRpc3RNb3ZlZClcclxuICAgIHRoaXMubmV4dFdQID0gbmV4dFdQXHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3MoKSB7XHJcbiAgICB0aGlzLmRpc3RNb3ZlZCArPSB0aGlzLnNwZWVkXHJcbiAgICBpZih0aGlzLmRpc3RNb3ZlZCA+PSAxKSB7XHJcbiAgICAgIHRoaXMuZGlzdE1vdmVkID0gMFxyXG4gICAgICB0aGlzLm5leHRXUCA9IHRoaXMubmV4dFdQID09PSBob2xkUGF0dGVybldheXBvaW50cy5sZW5ndGggLSAxID8gMCA6IHRoaXMubmV4dFdQICsgMVxyXG4gICAgICB0aGlzLmNvb3Jkcy54MCA9IHRoaXMuY29vcmRzLngxXHJcbiAgICAgIHRoaXMuY29vcmRzLnkwID0gdGhpcy5jb29yZHMueTFcclxuICAgICAgdGhpcy5jb29yZHMueDEgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFt0aGlzLm5leHRXUF0pLnhcclxuICAgICAgdGhpcy5jb29yZHMueTEgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFt0aGlzLm5leHRXUF0pLnlcclxuICAgICAgdGhpcy5jb29yZHMuY3AxeCA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnhcclxuICAgICAgdGhpcy5jb29yZHMuY3AxeSA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnlcclxuICAgICAgdGhpcy5jb29yZHMuY3AyeCA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnhcclxuICAgICAgdGhpcy5jb29yZHMuY3AyeSA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnlcclxuICAgIH1cclxuICAgIHRoaXMuY29vcmRzLnggPSBjYW52YXNIZWxwZXJzLmNvb3Jkc09uQ3ViaWNCZXppZXIodGhpcy5kaXN0TW92ZWQsIHRoaXMuY29vcmRzLngwLCB0aGlzLmNvb3Jkcy5jcDF4LCB0aGlzLmNvb3Jkcy5jcDJ4LCB0aGlzLmNvb3Jkcy54MSlcclxuICAgIHRoaXMuY29vcmRzLnkgPSBjYW52YXNIZWxwZXJzLmNvb3Jkc09uQ3ViaWNCZXppZXIodGhpcy5kaXN0TW92ZWQsIHRoaXMuY29vcmRzLnkwLCB0aGlzLmNvb3Jkcy5jcDF5LCB0aGlzLmNvb3Jkcy5jcDJ5LCB0aGlzLmNvb3Jkcy55MSlcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIENoYXJQYXR0ZXJuUGFydGljbGUgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQsIHBvaW50c0F0KSB7XHJcbiAgICBzdXBlcihjb29yZHMsIGFnZSwgc3BlZWQsIGRpc3RNb3ZlZClcclxuICAgIHRoaXMucG9pbnRzQXQgPSBwb2ludHNBdFxyXG4gIH1cclxuXHJcbiAgdXBkYXRlUG9zKCkge1xyXG4gICAgdGhpcy5kaXN0TW92ZWQgKz0gdGhpcy5zcGVlZFxyXG5cclxuICAgIGlmKHRoaXMuZGlzdE1vdmVkIDwgMSkge1xyXG4gICAgICBsZXQgbmV3UG9zID0gY2FudmFzSGVscGVycy5jb29yZHNPblN0cmFpZ2h0TGluZSh0aGlzLmRpc3RNb3ZlZCwge3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KVxyXG4gICAgICB0aGlzLmNvb3Jkcy54ID0gbmV3UG9zLnhcclxuICAgICAgdGhpcy5jb29yZHMueSA9IG5ld1Bvcy55XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTUFUSCBIRUxQRVJTXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tR0VPTUVUUlkgSEVMUEVSU1xyXG5mdW5jdGlvbiByYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHAxLCBwMikge1xyXG4gIGNvbnN0IE1JTl9ESVNUID0gNDBcclxuICBjb25zdCBESVNUX01PRCA9IDAuNVxyXG4gIGNvbnN0IEFOR0xFX1dJVEhJTiA9IE1hdGguUElcclxuICBsZXQgYSA9IHAyLnggLSBwMS54XHJcbiAgbGV0IGIgPSBwMi55IC0gcDEueVxyXG4gIGxldCBwMVAyRGlzdCA9IE1hdGguc3FydChhKmEgKyBiKmIpXHJcbiAgbGV0IHJhbmREaXN0ID0gKE1hdGgucmFuZG9tKCkgKiBwMVAyRGlzdCAqIERJU1RfTU9EKSArIE1JTl9ESVNUXHJcbiAgbGV0IGFuZ2xlTW9kID0gKE1hdGgucmFuZG9tKCkgKiBBTkdMRV9XSVRISU4pIC0gKEFOR0xFX1dJVEhJTiAvIDIpXHJcbiAgbGV0IHJhbmRBbmdsZVxyXG4gIGxldCBjb29yZHMgPSB7eDogbnVsbCwgeTogbnVsbH1cclxuXHJcbiAgaWYoTWF0aC5yYW5kb20oKSA+PSAwLjUpIHtcclxuICAgIHJhbmRBbmdsZSA9IE1hdGguYXRhbjIocDIueSAtIHAxLnksIHAxLnggLSBwMi54KSArIGFuZ2xlTW9kXHJcbiAgICBjb29yZHMueCA9IHAyLnggKyBNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICAgIGNvb3Jkcy55ID0gcDIueSAtIE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gIH0gZWxzZSB7XHJcbiAgICByYW5kQW5nbGUgPSBNYXRoLmF0YW4yKHAxLnkgLSBwMi55LCBwMi54IC0gcDEueCkgKyBhbmdsZU1vZFxyXG4gICAgY29vcmRzLnggPSBwMS54ICsgTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgICBjb29yZHMueSA9IHAxLnkgLSBNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICB9XHJcblxyXG4gIHJldHVybiBjb29yZHNcclxufVxyXG5cclxuZnVuY3Rpb24gcmFuZFBvaW50TmVhclBvaW50KHB0KSB7XHJcbiAgY29uc3QgTUFYX0ZST00gPSA0MFxyXG4gIGxldCByYW5kRGlzdCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE1BWF9GUk9NKVxyXG4gIGxldCByYW5kQW5nbGUgPSBNYXRoLnJhbmRvbSgpICogTWF0aC5QSSAqIDJcclxuICBsZXQgeCA9IHB0LnggKyAoTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0KVxyXG4gIGxldCB5ID0gcHQueSArIChNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3QpXHJcblxyXG4gIHJldHVybiB7eDogeCwgeTogeX1cclxufVxyXG5cclxuZnVuY3Rpb24gY29vcmRzT25TdHJhaWdodExpbmUocGVyY2VudCwgc3RhcnRQdCwgZW5kUHQpIHtcclxuICBsZXQgeFRvdGFsID0gZW5kUHQueCAtIHN0YXJ0UHQueFxyXG4gIGxldCB5VG90YWwgPSBlbmRQdC55IC0gc3RhcnRQdC55XHJcbiAgbGV0IHhEaXN0ID0gcGVyY2VudCAqIHhUb3RhbFxyXG4gIGxldCB5RGlzdCA9IHBlcmNlbnQgKiB5VG90YWxcclxuXHJcbiAgcmV0dXJuIHt4OiBzdGFydFB0LnggKyB4RGlzdCwgeTogc3RhcnRQdC55ICsgeURpc3R9XHJcbn1cclxuXHJcbi8vc3RvbGVuIGZyb20gc3RhY2tvdmVyZmxvd1xyXG5mdW5jdGlvbiBjb29yZHNPbkN1YmljQmV6aWVyKHBlcmNlbnQsIHN0YXJ0UHQsIGNwMSwgY3AyLCBlbmRQdCkge1xyXG4gIGxldCB0MiA9IHBlcmNlbnQgKiBwZXJjZW50XHJcbiAgbGV0IHQzID0gdDIgKiBwZXJjZW50XHJcblxyXG4gIHJldHVybiBzdGFydFB0ICsgKC1zdGFydFB0ICogMyArIHBlcmNlbnQgKiAoMyAqIHN0YXJ0UHQgLSBzdGFydFB0ICogcGVyY2VudCkpICogcGVyY2VudFxyXG4gICsgKDMgKiBjcDEgKyBwZXJjZW50ICogKC02ICogY3AxICsgY3AxICogMyAqIHBlcmNlbnQpKSAqIHBlcmNlbnRcclxuICArIChjcDIgKiAzIC0gY3AyICogMyAqIHBlcmNlbnQpICogdDJcclxuICArIGVuZFB0ICogdDNcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLURFViBGVU5DVElPTlMgV09UIEZPUiBWSVNVQUxJU0lORyBXSEFUJ1MgT0NDVVJJTkdcclxuZnVuY3Rpb24gcmVuZGVyQm91bmRpbmdDaXJjbGUoY3R4LCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KSB7XHJcbiAgbGV0IGNlbnRlclggPSBjYW52YXNXaWR0aCAvIDJcclxuICBsZXQgY2VudGVyWSA9IGNhbnZhc0hlaWdodCAvIDJcclxuICBsZXQgcmFkaXVzID0gY2VudGVyWSA+IGNlbnRlclggPyBjZW50ZXJYIC0gMiA6IGNlbnRlclkgLSAyXHJcbiAgbGV0IHN0YXJ0QW5nbGUgPSAwXHJcbiAgbGV0IGVuZEFuZ2xlID0gMiAqIE1hdGguUElcclxuICBjdHgubGluZVdpZHRoID0gMVxyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICdncmV5J1xyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5hcmMoY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSlcclxuICBjdHguc3Ryb2tlKClcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVySG9sZFBhdHRlcm5XUHMoY3R4LCB3YXlwb2ludHMpIHtcclxuICBjdHguYmVnaW5QYXRoKClcclxuICBjdHguZmlsbFN0eWxlID0gJ2JsdWUnXHJcbiAgd2F5cG9pbnRzLmZvckVhY2god3AgPT4ge1xyXG4gICAgY3R4LmZpbGxSZWN0KHdwLnggLSA0LCB3cC55IC0gNCwgOCwgOClcclxuICB9KVxyXG4gIGN0eC5zdHJva2UoKVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHMoY3R4LCBwYXJ0aWNsZXMpIHtcclxuICBwYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7XHJcbiAgICBsZXQgY3AxWCA9IHBhcnRpY2xlLmNvb3Jkcy5jcDF4XHJcbiAgICBsZXQgY3AxWSA9IHBhcnRpY2xlLmNvb3Jkcy5jcDF5XHJcbiAgICBsZXQgY3AyWCA9IHBhcnRpY2xlLmNvb3Jkcy5jcDJ4XHJcbiAgICBsZXQgY3AyWSA9IHBhcnRpY2xlLmNvb3Jkcy5jcDJ5XHJcbiAgICBsZXQgc3RhcnRYID0gcGFydGljbGUuY29vcmRzLngwXHJcbiAgICBsZXQgc3RhcnRZID0gcGFydGljbGUuY29vcmRzLnkwXHJcbiAgICBsZXQgZW5kWCA9IHBhcnRpY2xlLmNvb3Jkcy54MVxyXG4gICAgbGV0IGVuZFkgPSBwYXJ0aWNsZS5jb29yZHMueTFcclxuICAgIGN0eC5saW5lV2lkdGggPSAxXHJcbiAgICAvL3JlbmRlciBzdGFydCBwb2ludFxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JlZW4nXHJcbiAgICBjdHgucmVjdChzdGFydFggLSAyLCBzdGFydFkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBlbmQgcG9pbnRcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZWQnXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5yZWN0KGVuZFggLSAyLCBlbmRZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAxXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICd5ZWxsb3cnXHJcbiAgICBjdHgucmVjdChjcDFYIC0gMiwgY3AxWSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIGNvbnRyb2wgcG9pbnQgMlxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnb3JhbmdlJ1xyXG4gICAgY3R4LnJlY3QoY3AyWCAtIDIsIGNwMlkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBwYXRoXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmV5J1xyXG4gICAgY3R4Lm1vdmVUbyhzdGFydFgsIHN0YXJ0WSlcclxuICAgIGN0eC5iZXppZXJDdXJ2ZVRvKGNwMVgsIGNwMVksIGNwMlgsIGNwMlksIGVuZFgsIGVuZFkpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICB9KVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLWV4cG9ydGVkIGZ1bmN0aW9uc1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICByYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzLFxyXG4gIHJhbmRQb2ludE5lYXJQb2ludCxcclxuICBjb29yZHNPblN0cmFpZ2h0TGluZSxcclxuICBjb29yZHNPbkN1YmljQmV6aWVyLFxyXG4gIC8vZGV2XHJcbiAgcmVuZGVyQm91bmRpbmdDaXJjbGUsXHJcbiAgcmVuZGVySG9sZFBhdHRlcm5XUHMsXHJcbiAgcmVuZGVySG9sZFBhdHRlcm5QYXJ0aWNsZVBhdGhzXHJcbn1cclxuIiwiLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1DT09SRFMgQVMgUkFUSU8gQU5EIFZFQ1RPUiBQT0lOVCBBVFNcclxubGV0IGxldHRlcnNDb29yZHMgPSB7XHJcbiAgQTogW1xyXG4gICAge3g6IDAuMTI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgICAvLzFcclxuICAgIHt4OiAwLjM3NSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC41fSwgICAvLzRcclxuICAgIHt4OiAwLjg3NSwgeTogMC44NzV9IC8vNVxyXG4gIF0sXHJcbiAgQiA6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjI1fSwgLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC43NX0gIC8vNFxyXG4gIF1cclxufVxyXG5cclxubGV0IGxldHRlcnNWZWN0b3JzID0ge1xyXG4gIEE6IFtcclxuICAgIHtmcm9tOiAwLCB0bzogMn0sXHJcbiAgICB7ZnJvbTogMSwgdG86IDR9LFxyXG4gICAge2Zyb206IDIsIHRvOiAzfSxcclxuICAgIHtmcm9tOiAzLCB0bzogNX1cclxuICBdXHJcbn1cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUhFTFBFUiBGVU5DVElPTlNcclxuZnVuY3Rpb24gdG90YWxSZXF1aXJlZFBhcnRpY2xlcyhzdHIpIHtcclxuICBsZXQgcmVxdWlyZWRQYXJ0aWNsZXMgPSAwXHJcblxyXG4gIGZvcihpIGluIHN0cikge1xyXG4gICAgLy90b2RvIHRoaW5rIGFib3V0IHdheSBvZiBzd2FwcGluZyB0aGUgc3dpdGNoIHN0YXRlbWVudCBmb3Igc29tZXRoaW5nIG1vcmUgZ2VuZXJhbFxyXG4gICAgc3dpdGNoKHN0ci5jaGFyQXQoaSkpIHtcclxuICAgICAgY2FzZSAnQSc6XHJcbiAgICAgICAgcmVxdWlyZWRQYXJ0aWNsZXMgKz0gbGV0dGVyc0Nvb3Jkcy5BLmxlbmd0aFxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgJ0InOlxyXG4gICAgICAgIHJlcXVpcmVkUGFydGljbGVzICs9IGxldHRlcnNDb29yZHMuQi5sZW5ndGhcclxuICAgICAgICBicmVha1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlcXVpcmVkUGFydGljbGVzXHJcbn1cclxuXHJcblxyXG4vL2xldCBuYXZUYXJnZXRPcmlnaW4gPSB7eDogMzAsIHk6IDMwfVxyXG4vL2xldCBuYXZUYXJnZXRTaXplID0ge3dpZHRoOiAzMDAsIGhlaWdodDogNjB9XHJcbmZ1bmN0aW9uIGdldERlc3RpbmF0aW9uc0FuZFRhcmdldHMoc3RyLCBvcmlnaW4sIGNoYXJTaXplKSB7XHJcbiAgbGV0IGRlc3RpbmF0aW9uc0FuZFRhcmdldHMgPSBbXVxyXG5cclxuICAvL3RhcmdldCA9PSBvcmlnaW4gcGx1cyAoY2hhciBwb3MgaW4gc3RyICogd2lkdGggb2YgY2hhcikgcGx1cyBwYXJ0aWNsZSBwb3MgaW4gY2hhclxyXG4gIGZvcihsZXQgcG9zSW5TdHIgaW4gc3RyKSB7XHJcbiAgICBsZXQgeDEgPSBudWxsXHJcbiAgICBsZXQgeTEgPSBudWxsXHJcbiAgICBsZXQgcG9pbnRzQXQgPSBudWxsXHJcbiAgICBsZXQgY2hhckhlcmUgPSBzdHIuY2hhckF0KHBvc0luU3RyKVxyXG4gICAgbGV0IG5QYXJ0aWNsZXNGb3JUaGlzQ2hhciA9bGV0dGVyc0Nvb3Jkc1tjaGFySGVyZV0ubGVuZ3RoXHJcblxyXG4gICAgZm9yKGxldCBwb3NJbkNoYXIgPSAwOyBwb3NJbkNoYXIgPCBuUGFydGljbGVzRm9yVGhpc0NoYXI7IHBvc0luQ2hhcisrKSB7XHJcbiAgICAgIHgxID0gb3JpZ2luLnggKyAocG9zSW5TdHIgKiBjaGFyU2l6ZS53aWR0aCkgKyAoY2hhclNpemUud2lkdGggKiBsZXR0ZXJzQ29vcmRzW2NoYXJIZXJlXVtwb3NJbkNoYXJdLngpXHJcbiAgICAgIHkxID0gb3JpZ2luLnkgKyAoY2hhclNpemUuaGVpZ2h0ICogbGV0dGVyc0Nvb3Jkc1tjaGFySGVyZV1bcG9zSW5DaGFyXS55KVxyXG4gICAgICBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzLnB1c2goIHt4MTogeDEsIHkxOiB5MSwgcG9pbnRzQXQ6IHBvaW50c0F0fSApXHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGRlc3RpbmF0aW9uc0FuZFRhcmdldHNcclxuXHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBsZXR0ZXJzQ29vcmRzLFxyXG4gIGxldHRlcnNWZWN0b3JzLFxyXG4gIHRvdGFsUmVxdWlyZWRQYXJ0aWNsZXMsXHJcbiAgZ2V0RGVzdGluYXRpb25zQW5kVGFyZ2V0c1xyXG59XHJcblxyXG4vL2hhdmUgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGluIGEgc3RyaW5nIGFuZCByZXR1cm5zIHRvdGFsIG5QYXJ0aWNsZXMgdXNpbmcgbGVuZ3RocyBvZiBlYWNoIGxldHRlciBhcnJheVxyXG4iXX0=
