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

let navTargetWord = 'A'//dev temp

//array for spawning pool particles
//array for wormhole leaving particles
//array for particles transitioning between main arrays???

//----------------------------------------------------------------------MANAGERS
//possibly split this into a function that fires just once on dom load,
//then another manager that runs on resizing?
function init() {
  reset()
  setLayout()
  initNavTargetPos()
  initHoldPatternWaypointsActual()
  initHoldPatternParticles(400)
  animate()
}

function reset() {
  cancelAnimationFrame(frameId)
  holdPatternWaypointsActual.length = 0
  holdPatternParticles.length = 0
  navTargetParticles.length = 0
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

function initNavTargetPos() {
  console.log(`origin x: ${navTargetOrigin.x}`)
  navTargetCharSize.height = canvasHeight / 8
  navTargetCharSize.width = navTargetCharSize.height * 0.8
  navTargetOrigin.x = (canvasWidth / 2) - (navTargetWord.length * navTargetCharSize.width / 2)
  navTargetOrigin.y = (canvasHeight / 2) - (navTargetCharSize.height / 2)
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
    particle.updatePos()
    particle.draw('white', 'red')
    particle.drawToPointsAt(index, 'white', 'red')
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

  draw(colorFrom, colorTo) {
    ctx1.beginPath()
    ctx1.lineWidth = 3
    ctx1.strokeStyle = this.distMoved < 1 ? colorFrom : colorTo//write function to transition between 2 colours that takes % as an arg
    ctx1.fillStyle = 'black'
    ctx1.arc(this.coords.x, this.coords.y, 3, 0, Math.PI * 2, false)
    ctx1.stroke()
    ctx1.fill()
  }

  drawToPointsAt(index, colorFrom, colorTo) {
    if(this.pointsAt !== false) {
      let pointsAtX = navTargetParticles[index + this.pointsAt].coords.x//these two lines are fucking things somehow deleting the last particle in the char I think
      let pointsAtY = navTargetParticles[index + this.pointsAt].coords.y
      ctx1.beginPath()
      ctx1.lineWidth = 1
      ctx1.strokeStyle = this.distMoved < 1 ? colorFrom : colorTo
      ctx1.moveTo(this.coords.x, this.coords.y)
      ctx1.lineTo(pointsAtX, pointsAtY)
      ctx1.stroke()
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
  ],
  " " :[]
}

let lettersVectors = {
  A: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 3},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 2},
    {hasVector: false},
    {hasVector: false}
  ]
  /*
  A: [
    {from: 0, to: 2},
    {from: 1, to: 4},
    {from: 2, to: 3},
    {from: 3, to: 5},
    {from: 4, to: null},
    {from: 5, to: null}
  ]
  */
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

      if(lettersVectors[charHere][posInChar].hasVector === true) {//something about this is laying turds
        pointsAt = lettersVectors[charHere][posInChar].indexOffset
      } else {
        pointsAt = false
      }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2FudmFzLWhlbHBlcnMuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9sZXR0ZXJzLWxpYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgY2FudmFzSGVscGVycyA9IHJlcXVpcmUoJy4vdXRpbHMvY2FudmFzLWhlbHBlcnMuanMnKVxyXG5jb25zdCBsZXR0ZXJzTGliID0gcmVxdWlyZSgnLi91dGlscy9sZXR0ZXJzLWxpYi5qcycpXHJcblxyXG5sZXQgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF1cclxubGV0IGNhbnZhczEgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY2FudmFzJylbMF1cclxubGV0IGN0eDEgPSBjYW52YXMxLmdldENvbnRleHQoJzJkJylcclxubGV0IG5hdkdvVG9CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yRGVzYycpLy9kZXZcclxubGV0IGZyYW1lSWRcclxubGV0IGNhbnZhc1dpZHRoXHJcbmxldCBjYW52YXNIZWlnaHRcclxuXHJcbi8vaG9sZCBwYXR0ZXJuIFdQIGNvb3JkcyBhcyByYXRpbyBvZiBjYW52YXMgc2l6ZVxyXG5sZXQgaG9sZFBhdHRlcm5XYXlwb2ludHMgPSBbXHJcbiAge3g6IDAuMTI1LCB5OiAwLjV9LC8vMFxyXG4gIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8xXHJcbiAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzJcclxuICB7eDogMC44NzUsIHk6IDAuNX0sLy8zXHJcbiAge3g6IDAuNzUsIHk6IDAuODc1fSwvLzRcclxuICB7eDogMC4yNSwgeTogMC44NzV9Ly81XHJcbl1cclxubGV0IGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsID0gW10vL2hvbGQgcGF0dGVybiBXUCBjb29yZHMgaW4gcGl4ZWxzLCByZWNhbGN1bWFsYXRlZCBvbiByZXNpemVcclxubGV0IG5hdlRhcmdldE9yaWdpbiA9IHt4OiA1MCwgeTogNTB9XHJcbmxldCBuYXZUYXJnZXRDaGFyU2l6ZSA9IHt3aWR0aDogODAsIGhlaWdodDogODB9XHJcblxyXG5sZXQgaG9sZFBhdHRlcm5QYXJ0aWNsZXMgPSBbXVxyXG5sZXQgbmF2VGFyZ2V0UGFydGljbGVzID0gW11cclxuXHJcbmxldCBuYXZUYXJnZXRXb3JkID0gJ0EnLy9kZXYgdGVtcFxyXG5cclxuLy9hcnJheSBmb3Igc3Bhd25pbmcgcG9vbCBwYXJ0aWNsZXNcclxuLy9hcnJheSBmb3Igd29ybWhvbGUgbGVhdmluZyBwYXJ0aWNsZXNcclxuLy9hcnJheSBmb3IgcGFydGljbGVzIHRyYW5zaXRpb25pbmcgYmV0d2VlbiBtYWluIGFycmF5cz8/P1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTUFOQUdFUlNcclxuLy9wb3NzaWJseSBzcGxpdCB0aGlzIGludG8gYSBmdW5jdGlvbiB0aGF0IGZpcmVzIGp1c3Qgb25jZSBvbiBkb20gbG9hZCxcclxuLy90aGVuIGFub3RoZXIgbWFuYWdlciB0aGF0IHJ1bnMgb24gcmVzaXppbmc/XHJcbmZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgcmVzZXQoKVxyXG4gIHNldExheW91dCgpXHJcbiAgaW5pdE5hdlRhcmdldFBvcygpXHJcbiAgaW5pdEhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKClcclxuICBpbml0SG9sZFBhdHRlcm5QYXJ0aWNsZXMoNDAwKVxyXG4gIGFuaW1hdGUoKVxyXG59XHJcblxyXG5mdW5jdGlvbiByZXNldCgpIHtcclxuICBjYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZUlkKVxyXG4gIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsLmxlbmd0aCA9IDBcclxuICBob2xkUGF0dGVyblBhcnRpY2xlcy5sZW5ndGggPSAwXHJcbiAgbmF2VGFyZ2V0UGFydGljbGVzLmxlbmd0aCA9IDBcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKCkge1xyXG4gIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsID0gaG9sZFBhdHRlcm5XYXlwb2ludHMubWFwKGVsID0+IHtcclxuICAgIGxldCB4ID0gZWwueCAqIGNhbnZhc1dpZHRoXHJcbiAgICBsZXQgeSA9IGVsLnkgKiBjYW52YXNIZWlnaHRcclxuICAgIHJldHVybiB7eDogeCwgeTogeX1cclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0SG9sZFBhdHRlcm5QYXJ0aWNsZXMoblBhcnRpY2xlcykge1xyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBuUGFydGljbGVzOyBpKyspIHtcclxuICAgIGxldCBmcm9tV1AgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2KVxyXG4gICAgbGV0IG5leHRXUCA9IGZyb21XUCArIDFcclxuICAgIGlmKG5leHRXUCA9PT0gaG9sZFBhdHRlcm5XYXlwb2ludHMubGVuZ3RoKSB7bmV4dFdQID0gMH1cclxuICAgIGxldCBhZ2UgPSAwXHJcbiAgICBsZXQgc3BlZWQgPSAwLjAwMjVcclxuICAgIC8vbGV0IGRpc3RNb3ZlZCA9IE51bWJlciggKE1hdGgucmFuZG9tKCkgKS50b0ZpeGVkKDEpIClcclxuICAgIGxldCBkaXN0TW92ZWQgPSBNYXRoLnJvdW5kKCBNYXRoLnJhbmRvbSgpICogMTAgKSAvIDEwXHJcbiAgICBsZXQgc3RhcnRDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFtmcm9tV1BdKVxyXG4gICAgbGV0IGVuZENvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW25leHRXUF0pXHJcbiAgICBsZXQgY3AxQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHN0YXJ0Q29vcmRzLCBlbmRDb29yZHMpXHJcbiAgICBsZXQgY3AyQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHN0YXJ0Q29vcmRzLCBlbmRDb29yZHMpXHJcblxyXG4gICAgbGV0IGNvb3JkcyA9IHtcclxuICAgICAgeDogc3RhcnRDb29yZHMueCwgeTogc3RhcnRDb29yZHMueSxcclxuICAgICAgeDA6IHN0YXJ0Q29vcmRzLngsIHkwOiBzdGFydENvb3Jkcy55LFxyXG4gICAgICB4MTogZW5kQ29vcmRzLngsIHkxOiBlbmRDb29yZHMueSxcclxuICAgICAgY3AxeDogY3AxQ29vcmRzLngsIGNwMXk6IGNwMUNvb3Jkcy55LFxyXG4gICAgICBjcDJ4OiBjcDJDb29yZHMueCwgY3AyeTogY3AyQ29vcmRzLnlcclxuICAgIH1cclxuXHJcbiAgICBsZXQgcGFydGljbGUgPSBuZXcgSG9sZFBhdHRlcm5QYXJ0aWNsZShjb29yZHMsIGFnZSwgc3BlZWQsIGRpc3RNb3ZlZCwgbmV4dFdQKVxyXG5cclxuICAgIGhvbGRQYXR0ZXJuUGFydGljbGVzLnB1c2gocGFydGljbGUpXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0TmF2VGFyZ2V0UG9zKCkge1xyXG4gIGNvbnNvbGUubG9nKGBvcmlnaW4geDogJHtuYXZUYXJnZXRPcmlnaW4ueH1gKVxyXG4gIG5hdlRhcmdldENoYXJTaXplLmhlaWdodCA9IGNhbnZhc0hlaWdodCAvIDhcclxuICBuYXZUYXJnZXRDaGFyU2l6ZS53aWR0aCA9IG5hdlRhcmdldENoYXJTaXplLmhlaWdodCAqIDAuOFxyXG4gIG5hdlRhcmdldE9yaWdpbi54ID0gKGNhbnZhc1dpZHRoIC8gMikgLSAobmF2VGFyZ2V0V29yZC5sZW5ndGggKiBuYXZUYXJnZXRDaGFyU2l6ZS53aWR0aCAvIDIpXHJcbiAgbmF2VGFyZ2V0T3JpZ2luLnkgPSAoY2FudmFzSGVpZ2h0IC8gMikgLSAobmF2VGFyZ2V0Q2hhclNpemUuaGVpZ2h0IC8gMilcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVVQREFURSBQQVJUSUNMRSBQT1NJVElPTlMgJiBSRU5ERVJcclxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcclxuICBmcmFtZUlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpXHJcbiAgY3R4MS5jbGVhclJlY3QoMCwgMCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodClcclxuICAvL2NhbnZhc0hlbHBlcnMucmVuZGVyQm91bmRpbmdDaXJjbGUoY3R4MSwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkvL2RldlxyXG4gIC8vY2FudmFzSGVscGVycy5yZW5kZXJIb2xkUGF0dGVybldQcyhjdHgxLCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCkvL2RldlxyXG4gIC8vY2FudmFzSGVscGVycy5yZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHMoY3R4MSwgaG9sZFBhdHRlcm5QYXJ0aWNsZXMpLy9kZXZcclxuICB1cGRhdGVIb2xkUGF0dGVyblBhcnRpY2xlcygpXHJcbiAgdXBkYXRlTmF2VGFyZ2V0TGV0dGVyc1BhcnRpY2xlcygpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUhvbGRQYXR0ZXJuUGFydGljbGVzKCkge1xyXG4gIGhvbGRQYXR0ZXJuUGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4gey8vdGhpbmsgdGhpcyBzaG91bGQgYmUgbW92ZWQgdG8gYSBtZXRob2Qgb24gaG9sZFBhcnRpY2xlIGNsYXNzPz9cclxuICAgIHBhcnRpY2xlLnVwZGF0ZVBvcygpXHJcbiAgICBwYXJ0aWNsZS5kcmF3KCd3aGl0ZScpXHJcbiAgfSlcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlTmF2VGFyZ2V0TGV0dGVyc1BhcnRpY2xlcygpIHtcclxuICBuYXZUYXJnZXRQYXJ0aWNsZXMuZm9yRWFjaCgocGFydGljbGUsIGluZGV4KSA9PiB7XHJcbiAgICBwYXJ0aWNsZS51cGRhdGVQb3MoKVxyXG4gICAgcGFydGljbGUuZHJhdygnd2hpdGUnLCAncmVkJylcclxuICAgIHBhcnRpY2xlLmRyYXdUb1BvaW50c0F0KGluZGV4LCAnd2hpdGUnLCAncmVkJylcclxuICB9KVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUJSRUFLIFBPSU5UU1xyXG5mdW5jdGlvbiBzZXRMYXlvdXQoKSB7XHJcbiAgLy9zbWFsbCB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA8PSA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IHNtYWxsIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjVcclxuICB9XHJcbiAgLy9zbWFsbCBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA8PSA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IHNtYWxsIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC41XHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuICAvL21lZGl1bSB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA8PSAxMDI0ICYmIGJvZHkuY2xpZW50V2lkdGggPiA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IG1lZGl1bSB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC43XHJcbiAgfVxyXG4gIC8vbWVkaXVtIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0IDw9IDEwMjQgJiYgYm9keS5jbGllbnRIZWlnaHQgPiA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IG1lZGl1bSBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG4gIC8vbGFyZ2Ugd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPiAxMDI0KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBsYXJnZSB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC42NVxyXG4gIH1cclxuICAvL2xhcmdlIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0ID4gMTAyNCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbGFyZ2UgaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjY1XHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuXHJcbiAgY2FudmFzMS53aWR0aCA9IGNhbnZhc1dpZHRoXHJcbiAgY2FudmFzMS5oZWlnaHQgPSBjYW52YXNIZWlnaHRcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FVkVOVCBMSVNURU5FUlNcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdClcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGluaXQpXHJcbm5hdkdvVG9CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpbml0TmF2VGFyZ2V0LCBmYWxzZSlcclxuXHJcbi8vbW92ZSBzb21lIG9mIHRoaXMgdG8gbGV0dGVyLWxpYlxyXG5mdW5jdGlvbiBpbml0TmF2VGFyZ2V0KCkge1xyXG4gIGxldCByZXF1aXJlZFBhcnRpY2xlcyA9IGxldHRlcnNMaWIudG90YWxSZXF1aXJlZFBhcnRpY2xlcyhuYXZUYXJnZXRXb3JkKVxyXG4gIGxldCBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzID0gbGV0dGVyc0xpYi5nZXREZXN0aW5hdGlvbnNBbmRUYXJnZXRzKG5hdlRhcmdldFdvcmQsIG5hdlRhcmdldE9yaWdpbiwgbmF2VGFyZ2V0Q2hhclNpemUpXHJcblxyXG4gIGlmIChob2xkUGF0dGVyblBhcnRpY2xlcy5sZW5ndGggPiByZXF1aXJlZFBhcnRpY2xlcykge1xyXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHJlcXVpcmVkUGFydGljbGVzOyBpKyspIHtcclxuICAgICAgbGV0IHRyYW5zZmVycmluZ1BhcnRpY2xlID0gaG9sZFBhdHRlcm5QYXJ0aWNsZXMucG9wKClcclxuICAgICAgbGV0IGNvb3JkcyA9IHtcclxuICAgICAgICB4OiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueCxcclxuICAgICAgICB5OiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueSxcclxuICAgICAgICB4MDogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLngsXHJcbiAgICAgICAgeTA6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy55LFxyXG4gICAgICAgIHgxOiBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzW2ldLngxLFxyXG4gICAgICAgIHkxOiBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzW2ldLnkxXHJcbiAgICAgIH1cclxuICAgICAgbGV0IGFnZSA9IHRyYW5zZmVycmluZ1BhcnRpY2xlLmFnZVxyXG4gICAgICBsZXQgc3BlZWQgPSB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5zcGVlZFxyXG4gICAgICBsZXQgZGlzdE1vdmVkID0gMFxyXG4gICAgICBsZXQgcG9pbnRzQXQgPSBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzW2ldLnBvaW50c0F0XHJcbiAgICAgIG5hdlRhcmdldFBhcnRpY2xlcy5wdXNoKG5ldyBDaGFyUGF0dGVyblBhcnRpY2xlKGNvb3JkcywgYWdlLCBzcGVlZCwgZGlzdE1vdmVkLCBwb2ludHNBdCkpXHJcbiAgICB9XHJcblxyXG4gIH1cclxuICBjb25zb2xlLmxvZyhkZXN0aW5hdGlvbnNBbmRUYXJnZXRzKVxyXG59XHJcbi8vaG9sZFBhdHRlcm5QcnRpY2xlcyB8IEhvbGRQYXR0ZXJuUGFydGljbGU6IGNvb3JkcywgYWdlLCBzcGVlZCwgZGlzdE1vdmVkLCBuZXh0V1BcclxuLy9uYXZUYXJnZXRQYXJ0aWNsZXM6IHwgQ2hhclBhdHRlcm5QYXJ0aWNsZTogY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQsIGNoYXIsIHBvc0luQ2hhciwgcG9zSW5TdHIsIHBvaW50c0F0XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVBBUlRJQ0xFIENMQVNTRVNcclxuLy9jb29yZHMge3g6IG51bWJlciwgeTogbnVtYmVyLCB4MDogbnVtYmVyLCB5MDogbnVtYmVyLCB4MTogbnVtYmVyLCB5MTogbnVtYmVyLCBjcDF4OiBudW1iZXIsIGNwMXk6IG51bWJlciwgY3AyeDogbnVtYmVyLCBjcDJ5OiBudW1iZXJ9XHJcbi8vYWdlIG51bWJlclxyXG4vL3NwZWVkIG51bWJlclxyXG4vL2Rpc3RNb3ZlZCBudW1iZXIgKCUgYWxvbmcgcGF0aCBhcyBkZWNpbWFsKVxyXG4vL25leHRXUCBudW1iZXIoaW5kZXgpXHJcblxyXG4vL3RoaW5rIGlkZWEgbWlnaHQgYmUgdG8gc3RpY2sgbmVhcmx5IGFsbCB0aGUgcHJvcHMgb24gdGggUGFydGljbGUgcGFyZW50LCBzY3JhcCB0aGUgaW50ZXJtZWRpYXRlIGNsYXNzIGFuZCBjb25jZW50cmF0ZSBvbiB0aGUgbWV0aG9kcyBpbiBpbmRpdmlkdWFsXHJcbi8vcGFydGljbGUgY2xhc3Nlcy5cclxuXHJcbmNsYXNzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIGFnZSwgc3BlZWQsIGRpc3RNb3ZlZCkge1xyXG4gICAgdGhpcy5jb29yZHMgPSBjb29yZHNcclxuICAgIHRoaXMuYWdlID0gYWdlXHJcbiAgICB0aGlzLnNwZWVkID0gc3BlZWRcclxuICAgIHRoaXMuZGlzdE1vdmVkID0gZGlzdE1vdmVkXHJcbiAgfVxyXG5cclxuICBkcmF3KGNvbG9yKSB7Ly9kZWZhdWx0IHNlbGYgcmVuZGVyIGZvciBwYXJ0aWNsZXMsIG1heWJlIGNoYW5nZSBsYXRlclxyXG4gICAgY3R4MS5iZWdpblBhdGgoKVxyXG4gICAgY3R4MS5saW5lV2lkdGggPSAzXHJcbiAgICBjdHgxLnN0cm9rZVN0eWxlID0gY29sb3JcclxuICAgIGN0eDEuZmlsbFN0eWxlID0gJ2JsYWNrJ1xyXG4gICAgY3R4MS5hcmModGhpcy5jb29yZHMueCwgdGhpcy5jb29yZHMueSwgMywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKVxyXG4gICAgY3R4MS5zdHJva2UoKVxyXG4gICAgY3R4MS5maWxsKClcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvcygpIHtcclxuICAgIHRoaXMuY29vcmRzLnggKz0gdGhpcy5zcGVlZFxyXG4gICAgdGhpcy5jb29yZHMueSArPSB0aGlzLnNwZWVkXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBIb2xkUGF0dGVyblBhcnRpY2xlIGV4dGVuZHMgUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3JkcywgYWdlLCBzcGVlZCwgZGlzdE1vdmVkLCBuZXh0V1ApIHtcclxuICAgIHN1cGVyKGNvb3JkcywgYWdlLCBzcGVlZCwgZGlzdE1vdmVkKVxyXG4gICAgdGhpcy5uZXh0V1AgPSBuZXh0V1BcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvcygpIHtcclxuICAgIHRoaXMuZGlzdE1vdmVkICs9IHRoaXMuc3BlZWRcclxuICAgIGlmKHRoaXMuZGlzdE1vdmVkID49IDEpIHtcclxuICAgICAgdGhpcy5kaXN0TW92ZWQgPSAwXHJcbiAgICAgIHRoaXMubmV4dFdQID0gdGhpcy5uZXh0V1AgPT09IGhvbGRQYXR0ZXJuV2F5cG9pbnRzLmxlbmd0aCAtIDEgPyAwIDogdGhpcy5uZXh0V1AgKyAxXHJcbiAgICAgIHRoaXMuY29vcmRzLngwID0gdGhpcy5jb29yZHMueDFcclxuICAgICAgdGhpcy5jb29yZHMueTAgPSB0aGlzLmNvb3Jkcy55MVxyXG4gICAgICB0aGlzLmNvb3Jkcy54MSA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW3RoaXMubmV4dFdQXSkueFxyXG4gICAgICB0aGlzLmNvb3Jkcy55MSA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW3RoaXMubmV4dFdQXSkueVxyXG4gICAgICB0aGlzLmNvb3Jkcy5jcDF4ID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHt4OiB0aGlzLmNvb3Jkcy54MCwgeTogdGhpcy5jb29yZHMueTB9LCB7eDogdGhpcy5jb29yZHMueDEsIHk6IHRoaXMuY29vcmRzLnkxfSkueFxyXG4gICAgICB0aGlzLmNvb3Jkcy5jcDF5ID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHt4OiB0aGlzLmNvb3Jkcy54MCwgeTogdGhpcy5jb29yZHMueTB9LCB7eDogdGhpcy5jb29yZHMueDEsIHk6IHRoaXMuY29vcmRzLnkxfSkueVxyXG4gICAgICB0aGlzLmNvb3Jkcy5jcDJ4ID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHt4OiB0aGlzLmNvb3Jkcy54MCwgeTogdGhpcy5jb29yZHMueTB9LCB7eDogdGhpcy5jb29yZHMueDEsIHk6IHRoaXMuY29vcmRzLnkxfSkueFxyXG4gICAgICB0aGlzLmNvb3Jkcy5jcDJ5ID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHt4OiB0aGlzLmNvb3Jkcy54MCwgeTogdGhpcy5jb29yZHMueTB9LCB7eDogdGhpcy5jb29yZHMueDEsIHk6IHRoaXMuY29vcmRzLnkxfSkueVxyXG4gICAgfVxyXG4gICAgdGhpcy5jb29yZHMueCA9IGNhbnZhc0hlbHBlcnMuY29vcmRzT25DdWJpY0Jlemllcih0aGlzLmRpc3RNb3ZlZCwgdGhpcy5jb29yZHMueDAsIHRoaXMuY29vcmRzLmNwMXgsIHRoaXMuY29vcmRzLmNwMngsIHRoaXMuY29vcmRzLngxKVxyXG4gICAgdGhpcy5jb29yZHMueSA9IGNhbnZhc0hlbHBlcnMuY29vcmRzT25DdWJpY0Jlemllcih0aGlzLmRpc3RNb3ZlZCwgdGhpcy5jb29yZHMueTAsIHRoaXMuY29vcmRzLmNwMXksIHRoaXMuY29vcmRzLmNwMnksIHRoaXMuY29vcmRzLnkxKVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgQ2hhclBhdHRlcm5QYXJ0aWNsZSBleHRlbmRzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIGFnZSwgc3BlZWQsIGRpc3RNb3ZlZCwgcG9pbnRzQXQpIHtcclxuICAgIHN1cGVyKGNvb3JkcywgYWdlLCBzcGVlZCwgZGlzdE1vdmVkKVxyXG4gICAgdGhpcy5wb2ludHNBdCA9IHBvaW50c0F0XHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3MoKSB7XHJcbiAgICB0aGlzLmRpc3RNb3ZlZCArPSB0aGlzLnNwZWVkXHJcbiAgICBpZih0aGlzLmRpc3RNb3ZlZCA8IDEpIHtcclxuICAgICAgbGV0IG5ld1BvcyA9IGNhbnZhc0hlbHBlcnMuY29vcmRzT25TdHJhaWdodExpbmUodGhpcy5kaXN0TW92ZWQsIHt4OiB0aGlzLmNvb3Jkcy54MCwgeTogdGhpcy5jb29yZHMueTB9LCB7eDogdGhpcy5jb29yZHMueDEsIHk6IHRoaXMuY29vcmRzLnkxfSlcclxuICAgICAgdGhpcy5jb29yZHMueCA9IG5ld1Bvcy54XHJcbiAgICAgIHRoaXMuY29vcmRzLnkgPSBuZXdQb3MueVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZHJhdyhjb2xvckZyb20sIGNvbG9yVG8pIHtcclxuICAgIGN0eDEuYmVnaW5QYXRoKClcclxuICAgIGN0eDEubGluZVdpZHRoID0gM1xyXG4gICAgY3R4MS5zdHJva2VTdHlsZSA9IHRoaXMuZGlzdE1vdmVkIDwgMSA/IGNvbG9yRnJvbSA6IGNvbG9yVG8vL3dyaXRlIGZ1bmN0aW9uIHRvIHRyYW5zaXRpb24gYmV0d2VlbiAyIGNvbG91cnMgdGhhdCB0YWtlcyAlIGFzIGFuIGFyZ1xyXG4gICAgY3R4MS5maWxsU3R5bGUgPSAnYmxhY2snXHJcbiAgICBjdHgxLmFyYyh0aGlzLmNvb3Jkcy54LCB0aGlzLmNvb3Jkcy55LCAzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpXHJcbiAgICBjdHgxLnN0cm9rZSgpXHJcbiAgICBjdHgxLmZpbGwoKVxyXG4gIH1cclxuXHJcbiAgZHJhd1RvUG9pbnRzQXQoaW5kZXgsIGNvbG9yRnJvbSwgY29sb3JUbykge1xyXG4gICAgaWYodGhpcy5wb2ludHNBdCAhPT0gZmFsc2UpIHtcclxuICAgICAgbGV0IHBvaW50c0F0WCA9IG5hdlRhcmdldFBhcnRpY2xlc1tpbmRleCArIHRoaXMucG9pbnRzQXRdLmNvb3Jkcy54Ly90aGVzZSB0d28gbGluZXMgYXJlIGZ1Y2tpbmcgdGhpbmdzIHNvbWVob3cgZGVsZXRpbmcgdGhlIGxhc3QgcGFydGljbGUgaW4gdGhlIGNoYXIgSSB0aGlua1xyXG4gICAgICBsZXQgcG9pbnRzQXRZID0gbmF2VGFyZ2V0UGFydGljbGVzW2luZGV4ICsgdGhpcy5wb2ludHNBdF0uY29vcmRzLnlcclxuICAgICAgY3R4MS5iZWdpblBhdGgoKVxyXG4gICAgICBjdHgxLmxpbmVXaWR0aCA9IDFcclxuICAgICAgY3R4MS5zdHJva2VTdHlsZSA9IHRoaXMuZGlzdE1vdmVkIDwgMSA/IGNvbG9yRnJvbSA6IGNvbG9yVG9cclxuICAgICAgY3R4MS5tb3ZlVG8odGhpcy5jb29yZHMueCwgdGhpcy5jb29yZHMueSlcclxuICAgICAgY3R4MS5saW5lVG8ocG9pbnRzQXRYLCBwb2ludHNBdFkpXHJcbiAgICAgIGN0eDEuc3Ryb2tlKClcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1NQVRIIEhFTFBFUlNcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1HRU9NRVRSWSBIRUxQRVJTXHJcbmZ1bmN0aW9uIHJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMocDEsIHAyKSB7XHJcbiAgY29uc3QgTUlOX0RJU1QgPSA0MFxyXG4gIGNvbnN0IERJU1RfTU9EID0gMC41XHJcbiAgY29uc3QgQU5HTEVfV0lUSElOID0gTWF0aC5QSVxyXG4gIGxldCBhID0gcDIueCAtIHAxLnhcclxuICBsZXQgYiA9IHAyLnkgLSBwMS55XHJcbiAgbGV0IHAxUDJEaXN0ID0gTWF0aC5zcXJ0KGEqYSArIGIqYilcclxuICBsZXQgcmFuZERpc3QgPSAoTWF0aC5yYW5kb20oKSAqIHAxUDJEaXN0ICogRElTVF9NT0QpICsgTUlOX0RJU1RcclxuICBsZXQgYW5nbGVNb2QgPSAoTWF0aC5yYW5kb20oKSAqIEFOR0xFX1dJVEhJTikgLSAoQU5HTEVfV0lUSElOIC8gMilcclxuICBsZXQgcmFuZEFuZ2xlXHJcbiAgbGV0IGNvb3JkcyA9IHt4OiBudWxsLCB5OiBudWxsfVxyXG5cclxuICBpZihNYXRoLnJhbmRvbSgpID49IDAuNSkge1xyXG4gICAgcmFuZEFuZ2xlID0gTWF0aC5hdGFuMihwMi55IC0gcDEueSwgcDEueCAtIHAyLngpICsgYW5nbGVNb2RcclxuICAgIGNvb3Jkcy54ID0gcDIueCArIE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gICAgY29vcmRzLnkgPSBwMi55IC0gTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgfSBlbHNlIHtcclxuICAgIHJhbmRBbmdsZSA9IE1hdGguYXRhbjIocDEueSAtIHAyLnksIHAyLnggLSBwMS54KSArIGFuZ2xlTW9kXHJcbiAgICBjb29yZHMueCA9IHAxLnggKyBNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICAgIGNvb3Jkcy55ID0gcDEueSAtIE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGNvb3Jkc1xyXG59XHJcblxyXG5mdW5jdGlvbiByYW5kUG9pbnROZWFyUG9pbnQocHQpIHtcclxuICBjb25zdCBNQVhfRlJPTSA9IDQwXHJcbiAgbGV0IHJhbmREaXN0ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogTUFYX0ZST00pXHJcbiAgbGV0IHJhbmRBbmdsZSA9IE1hdGgucmFuZG9tKCkgKiBNYXRoLlBJICogMlxyXG4gIGxldCB4ID0gcHQueCArIChNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3QpXHJcbiAgbGV0IHkgPSBwdC55ICsgKE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdClcclxuXHJcbiAgcmV0dXJuIHt4OiB4LCB5OiB5fVxyXG59XHJcblxyXG5mdW5jdGlvbiBjb29yZHNPblN0cmFpZ2h0TGluZShwZXJjZW50LCBzdGFydFB0LCBlbmRQdCkge1xyXG4gIGxldCB4VG90YWwgPSBlbmRQdC54IC0gc3RhcnRQdC54XHJcbiAgbGV0IHlUb3RhbCA9IGVuZFB0LnkgLSBzdGFydFB0LnlcclxuICBsZXQgeERpc3QgPSBwZXJjZW50ICogeFRvdGFsXHJcbiAgbGV0IHlEaXN0ID0gcGVyY2VudCAqIHlUb3RhbFxyXG5cclxuICByZXR1cm4ge3g6IHN0YXJ0UHQueCArIHhEaXN0LCB5OiBzdGFydFB0LnkgKyB5RGlzdH1cclxufVxyXG5cclxuLy9zdG9sZW4gZnJvbSBzdGFja292ZXJmbG93XHJcbmZ1bmN0aW9uIGNvb3Jkc09uQ3ViaWNCZXppZXIocGVyY2VudCwgc3RhcnRQdCwgY3AxLCBjcDIsIGVuZFB0KSB7XHJcbiAgbGV0IHQyID0gcGVyY2VudCAqIHBlcmNlbnRcclxuICBsZXQgdDMgPSB0MiAqIHBlcmNlbnRcclxuXHJcbiAgcmV0dXJuIHN0YXJ0UHQgKyAoLXN0YXJ0UHQgKiAzICsgcGVyY2VudCAqICgzICogc3RhcnRQdCAtIHN0YXJ0UHQgKiBwZXJjZW50KSkgKiBwZXJjZW50XHJcbiAgKyAoMyAqIGNwMSArIHBlcmNlbnQgKiAoLTYgKiBjcDEgKyBjcDEgKiAzICogcGVyY2VudCkpICogcGVyY2VudFxyXG4gICsgKGNwMiAqIDMgLSBjcDIgKiAzICogcGVyY2VudCkgKiB0MlxyXG4gICsgZW5kUHQgKiB0M1xyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tREVWIEZVTkNUSU9OUyBXT1QgRk9SIFZJU1VBTElTSU5HIFdIQVQnUyBPQ0NVUklOR1xyXG5mdW5jdGlvbiByZW5kZXJCb3VuZGluZ0NpcmNsZShjdHgsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpIHtcclxuICBsZXQgY2VudGVyWCA9IGNhbnZhc1dpZHRoIC8gMlxyXG4gIGxldCBjZW50ZXJZID0gY2FudmFzSGVpZ2h0IC8gMlxyXG4gIGxldCByYWRpdXMgPSBjZW50ZXJZID4gY2VudGVyWCA/IGNlbnRlclggLSAyIDogY2VudGVyWSAtIDJcclxuICBsZXQgc3RhcnRBbmdsZSA9IDBcclxuICBsZXQgZW5kQW5nbGUgPSAyICogTWF0aC5QSVxyXG4gIGN0eC5saW5lV2lkdGggPSAxXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZXknXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LmFyYyhjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKVxyXG4gIGN0eC5zdHJva2UoKVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJIb2xkUGF0dGVybldQcyhjdHgsIHdheXBvaW50cykge1xyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5maWxsU3R5bGUgPSAnYmx1ZSdcclxuICB3YXlwb2ludHMuZm9yRWFjaCh3cCA9PiB7XHJcbiAgICBjdHguZmlsbFJlY3Qod3AueCAtIDQsIHdwLnkgLSA0LCA4LCA4KVxyXG4gIH0pXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckhvbGRQYXR0ZXJuUGFydGljbGVQYXRocyhjdHgsIHBhcnRpY2xlcykge1xyXG4gIHBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcclxuICAgIGxldCBjcDFYID0gcGFydGljbGUuY29vcmRzLmNwMXhcclxuICAgIGxldCBjcDFZID0gcGFydGljbGUuY29vcmRzLmNwMXlcclxuICAgIGxldCBjcDJYID0gcGFydGljbGUuY29vcmRzLmNwMnhcclxuICAgIGxldCBjcDJZID0gcGFydGljbGUuY29vcmRzLmNwMnlcclxuICAgIGxldCBzdGFydFggPSBwYXJ0aWNsZS5jb29yZHMueDBcclxuICAgIGxldCBzdGFydFkgPSBwYXJ0aWNsZS5jb29yZHMueTBcclxuICAgIGxldCBlbmRYID0gcGFydGljbGUuY29vcmRzLngxXHJcbiAgICBsZXQgZW5kWSA9IHBhcnRpY2xlLmNvb3Jkcy55MVxyXG4gICAgY3R4LmxpbmVXaWR0aCA9IDFcclxuICAgIC8vcmVuZGVyIHN0YXJ0IHBvaW50XHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmVlbidcclxuICAgIGN0eC5yZWN0KHN0YXJ0WCAtIDIsIHN0YXJ0WSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIGVuZCBwb2ludFxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3JlZCdcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnJlY3QoZW5kWCAtIDIsIGVuZFkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBjb250cm9sIHBvaW50IDFcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3llbGxvdydcclxuICAgIGN0eC5yZWN0KGNwMVggLSAyLCBjcDFZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAyXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdvcmFuZ2UnXHJcbiAgICBjdHgucmVjdChjcDJYIC0gMiwgY3AyWSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIHBhdGhcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZXknXHJcbiAgICBjdHgubW92ZVRvKHN0YXJ0WCwgc3RhcnRZKVxyXG4gICAgY3R4LmJlemllckN1cnZlVG8oY3AxWCwgY3AxWSwgY3AyWCwgY3AyWSwgZW5kWCwgZW5kWSlcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gIH0pXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tZXhwb3J0ZWQgZnVuY3Rpb25zXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMsXHJcbiAgcmFuZFBvaW50TmVhclBvaW50LFxyXG4gIGNvb3Jkc09uU3RyYWlnaHRMaW5lLFxyXG4gIGNvb3Jkc09uQ3ViaWNCZXppZXIsXHJcbiAgLy9kZXZcclxuICByZW5kZXJCb3VuZGluZ0NpcmNsZSxcclxuICByZW5kZXJIb2xkUGF0dGVybldQcyxcclxuICByZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHNcclxufVxyXG4iLCIvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUNPT1JEUyBBUyBSQVRJTyBBTkQgVkVDVE9SIFBPSU5UIEFUU1xyXG5sZXQgbGV0dGVyc0Nvb3JkcyA9IHtcclxuICBBOiBbXHJcbiAgICB7eDogMC4xMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgIC8vMVxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjEyNX0sLy8yXHJcbiAgICB7eDogMC42MjUsIHk6IDAuMTI1fSwvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjV9LCAgIC8vNFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjg3NX0gLy81XHJcbiAgXSxcclxuICBCIDogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9LCAvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjc1fSAgLy80XHJcbiAgXSxcclxuICBcIiBcIiA6W11cclxufVxyXG5cclxubGV0IGxldHRlcnNWZWN0b3JzID0ge1xyXG4gIEE6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF1cclxuICAvKlxyXG4gIEE6IFtcclxuICAgIHtmcm9tOiAwLCB0bzogMn0sXHJcbiAgICB7ZnJvbTogMSwgdG86IDR9LFxyXG4gICAge2Zyb206IDIsIHRvOiAzfSxcclxuICAgIHtmcm9tOiAzLCB0bzogNX0sXHJcbiAgICB7ZnJvbTogNCwgdG86IG51bGx9LFxyXG4gICAge2Zyb206IDUsIHRvOiBudWxsfVxyXG4gIF1cclxuICAqL1xyXG59XHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1IRUxQRVIgRlVOQ1RJT05TXHJcbmZ1bmN0aW9uIHRvdGFsUmVxdWlyZWRQYXJ0aWNsZXMoc3RyKSB7XHJcbiAgbGV0IHJlcXVpcmVkUGFydGljbGVzID0gMFxyXG5cclxuICBmb3IoaSBpbiBzdHIpIHtcclxuICAgIC8vdG9kbyB0aGluayBhYm91dCB3YXkgb2Ygc3dhcHBpbmcgdGhlIHN3aXRjaCBzdGF0ZW1lbnQgZm9yIHNvbWV0aGluZyBtb3JlIGdlbmVyYWxcclxuICAgIHN3aXRjaChzdHIuY2hhckF0KGkpKSB7XHJcbiAgICAgIGNhc2UgJ0EnOlxyXG4gICAgICAgIHJlcXVpcmVkUGFydGljbGVzICs9IGxldHRlcnNDb29yZHMuQS5sZW5ndGhcclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICdCJzpcclxuICAgICAgICByZXF1aXJlZFBhcnRpY2xlcyArPSBsZXR0ZXJzQ29vcmRzLkIubGVuZ3RoXHJcbiAgICAgICAgYnJlYWtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiByZXF1aXJlZFBhcnRpY2xlc1xyXG59XHJcblxyXG5cclxuLy9sZXQgbmF2VGFyZ2V0T3JpZ2luID0ge3g6IDMwLCB5OiAzMH1cclxuLy9sZXQgbmF2VGFyZ2V0U2l6ZSA9IHt3aWR0aDogMzAwLCBoZWlnaHQ6IDYwfVxyXG5mdW5jdGlvbiBnZXREZXN0aW5hdGlvbnNBbmRUYXJnZXRzKHN0ciwgb3JpZ2luLCBjaGFyU2l6ZSkge1xyXG4gIGxldCBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzID0gW11cclxuXHJcbiAgLy90YXJnZXQgPT0gb3JpZ2luIHBsdXMgKGNoYXIgcG9zIGluIHN0ciAqIHdpZHRoIG9mIGNoYXIpIHBsdXMgcGFydGljbGUgcG9zIGluIGNoYXJcclxuICBmb3IobGV0IHBvc0luU3RyIGluIHN0cikge1xyXG4gICAgbGV0IHgxID0gbnVsbFxyXG4gICAgbGV0IHkxID0gbnVsbFxyXG4gICAgbGV0IHBvaW50c0F0ID0gbnVsbFxyXG4gICAgbGV0IGNoYXJIZXJlID0gc3RyLmNoYXJBdChwb3NJblN0cilcclxuICAgIGxldCBuUGFydGljbGVzRm9yVGhpc0NoYXIgPWxldHRlcnNDb29yZHNbY2hhckhlcmVdLmxlbmd0aFxyXG5cclxuICAgIGZvcihsZXQgcG9zSW5DaGFyID0gMDsgcG9zSW5DaGFyIDwgblBhcnRpY2xlc0ZvclRoaXNDaGFyOyBwb3NJbkNoYXIrKykge1xyXG4gICAgICB4MSA9IG9yaWdpbi54ICsgKHBvc0luU3RyICogY2hhclNpemUud2lkdGgpICsgKGNoYXJTaXplLndpZHRoICogbGV0dGVyc0Nvb3Jkc1tjaGFySGVyZV1bcG9zSW5DaGFyXS54KVxyXG4gICAgICB5MSA9IG9yaWdpbi55ICsgKGNoYXJTaXplLmhlaWdodCAqIGxldHRlcnNDb29yZHNbY2hhckhlcmVdW3Bvc0luQ2hhcl0ueSlcclxuXHJcbiAgICAgIGlmKGxldHRlcnNWZWN0b3JzW2NoYXJIZXJlXVtwb3NJbkNoYXJdLmhhc1ZlY3RvciA9PT0gdHJ1ZSkgey8vc29tZXRoaW5nIGFib3V0IHRoaXMgaXMgbGF5aW5nIHR1cmRzXHJcbiAgICAgICAgcG9pbnRzQXQgPSBsZXR0ZXJzVmVjdG9yc1tjaGFySGVyZV1bcG9zSW5DaGFyXS5pbmRleE9mZnNldFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBvaW50c0F0ID0gZmFsc2VcclxuICAgICAgfVxyXG5cclxuICAgICAgZGVzdGluYXRpb25zQW5kVGFyZ2V0cy5wdXNoKCB7eDE6IHgxLCB5MTogeTEsIHBvaW50c0F0OiBwb2ludHNBdH0gKVxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIHJldHVybiBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzXHJcblxyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbGV0dGVyc0Nvb3JkcyxcclxuICBsZXR0ZXJzVmVjdG9ycyxcclxuICB0b3RhbFJlcXVpcmVkUGFydGljbGVzLFxyXG4gIGdldERlc3RpbmF0aW9uc0FuZFRhcmdldHNcclxufVxyXG5cclxuLy9oYXZlIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBpbiBhIHN0cmluZyBhbmQgcmV0dXJucyB0b3RhbCBuUGFydGljbGVzIHVzaW5nIGxlbmd0aHMgb2YgZWFjaCBsZXR0ZXIgYXJyYXlcclxuIl19
