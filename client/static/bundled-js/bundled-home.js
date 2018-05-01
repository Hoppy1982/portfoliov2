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

let navTargetWord = 'A B'//dev temp

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
    particle.drawToPointsAt(index, '#ffffff', '#ff0000')
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

canvasHelpers.colorBetweenTwoColors(0.5, '#ffc4dd', '#0000ff')//dev

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

//-----------------------------------------------------------------COLOR HELPERS
function colorBetweenTwoColors(percent, colorOne, colorTwo) {
  //'#ff0000'
  let hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f']
  //colorOne
  let c1RedIndex0 = hex.indexOf( colorOne.charAt(1) )
  let c1RedIndex1 = hex.indexOf( colorOne.charAt(2) )
  let c1RedBaseTen = (c1RedIndex0 * 16) + (c1RedIndex1)

  let c1GreenIndex0 = hex.indexOf( colorOne.charAt(3) )
  let c1GreenIndex1 = hex.indexOf( colorOne.charAt(4) )
  let c1GreendBaseTen = (c1GreenIndex0 * 16) + (c1GreenIndex1)

  let c1BlueIndex0 = hex.indexOf( colorOne.charAt(5) )
  let c1BlueIndex1 = hex.indexOf( colorOne.charAt(6) )
  let c1BlueBaseTen = (c1BlueIndex0 * 16) + (c1BlueIndex1)


  console.log(`c1RedBaseTen: ${c1RedBaseTen}, c1GreendBaseTen: ${c1GreendBaseTen}, c1BlueBaseTen: ${c1BlueBaseTen}`)
}

//-----------------------------------------------------------------------EXPORTS
module.exports = {
  randPointBetweenTwoPoints,
  randPointNearPoint,
  coordsOnStraightLine,
  coordsOnCubicBezier,
  colorBetweenTwoColors,
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
  ],
  B: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 3},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: -2},
    {hasVector: true, indexOffset: -4}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2FudmFzLWhlbHBlcnMuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9sZXR0ZXJzLWxpYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgY2FudmFzSGVscGVycyA9IHJlcXVpcmUoJy4vdXRpbHMvY2FudmFzLWhlbHBlcnMuanMnKVxyXG5jb25zdCBsZXR0ZXJzTGliID0gcmVxdWlyZSgnLi91dGlscy9sZXR0ZXJzLWxpYi5qcycpXHJcblxyXG5sZXQgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF1cclxubGV0IGNhbnZhczEgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY2FudmFzJylbMF1cclxubGV0IGN0eDEgPSBjYW52YXMxLmdldENvbnRleHQoJzJkJylcclxubGV0IG5hdkdvVG9CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yRGVzYycpLy9kZXZcclxubGV0IGZyYW1lSWRcclxubGV0IGNhbnZhc1dpZHRoXHJcbmxldCBjYW52YXNIZWlnaHRcclxuXHJcbi8vaG9sZCBwYXR0ZXJuIFdQIGNvb3JkcyBhcyByYXRpbyBvZiBjYW52YXMgc2l6ZVxyXG5sZXQgaG9sZFBhdHRlcm5XYXlwb2ludHMgPSBbXHJcbiAge3g6IDAuMTI1LCB5OiAwLjV9LC8vMFxyXG4gIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8xXHJcbiAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzJcclxuICB7eDogMC44NzUsIHk6IDAuNX0sLy8zXHJcbiAge3g6IDAuNzUsIHk6IDAuODc1fSwvLzRcclxuICB7eDogMC4yNSwgeTogMC44NzV9Ly81XHJcbl1cclxubGV0IGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsID0gW10vL2hvbGQgcGF0dGVybiBXUCBjb29yZHMgaW4gcGl4ZWxzLCByZWNhbGN1bWFsYXRlZCBvbiByZXNpemVcclxubGV0IG5hdlRhcmdldE9yaWdpbiA9IHt4OiA1MCwgeTogNTB9XHJcbmxldCBuYXZUYXJnZXRDaGFyU2l6ZSA9IHt3aWR0aDogODAsIGhlaWdodDogODB9XHJcblxyXG5sZXQgaG9sZFBhdHRlcm5QYXJ0aWNsZXMgPSBbXVxyXG5sZXQgbmF2VGFyZ2V0UGFydGljbGVzID0gW11cclxuXHJcbmxldCBuYXZUYXJnZXRXb3JkID0gJ0EgQicvL2RldiB0ZW1wXHJcblxyXG4vL2FycmF5IGZvciBzcGF3bmluZyBwb29sIHBhcnRpY2xlc1xyXG4vL2FycmF5IGZvciB3b3JtaG9sZSBsZWF2aW5nIHBhcnRpY2xlc1xyXG4vL2FycmF5IGZvciBwYXJ0aWNsZXMgdHJhbnNpdGlvbmluZyBiZXR3ZWVuIG1haW4gYXJyYXlzPz8/XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1NQU5BR0VSU1xyXG4vL3Bvc3NpYmx5IHNwbGl0IHRoaXMgaW50byBhIGZ1bmN0aW9uIHRoYXQgZmlyZXMganVzdCBvbmNlIG9uIGRvbSBsb2FkLFxyXG4vL3RoZW4gYW5vdGhlciBtYW5hZ2VyIHRoYXQgcnVucyBvbiByZXNpemluZz9cclxuZnVuY3Rpb24gaW5pdCgpIHtcclxuICByZXNldCgpXHJcbiAgc2V0TGF5b3V0KClcclxuICBpbml0TmF2VGFyZ2V0UG9zKClcclxuICBpbml0SG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwoKVxyXG4gIGluaXRIb2xkUGF0dGVyblBhcnRpY2xlcyg0MDApXHJcbiAgYW5pbWF0ZSgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlc2V0KCkge1xyXG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lSWQpXHJcbiAgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwubGVuZ3RoID0gMFxyXG4gIGhvbGRQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA9IDBcclxuICBuYXZUYXJnZXRQYXJ0aWNsZXMubGVuZ3RoID0gMFxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0SG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwoKSB7XHJcbiAgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwgPSBob2xkUGF0dGVybldheXBvaW50cy5tYXAoZWwgPT4ge1xyXG4gICAgbGV0IHggPSBlbC54ICogY2FudmFzV2lkdGhcclxuICAgIGxldCB5ID0gZWwueSAqIGNhbnZhc0hlaWdodFxyXG4gICAgcmV0dXJuIHt4OiB4LCB5OiB5fVxyXG4gIH0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRIb2xkUGF0dGVyblBhcnRpY2xlcyhuUGFydGljbGVzKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IG5QYXJ0aWNsZXM7IGkrKykge1xyXG4gICAgbGV0IGZyb21XUCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDYpXHJcbiAgICBsZXQgbmV4dFdQID0gZnJvbVdQICsgMVxyXG4gICAgaWYobmV4dFdQID09PSBob2xkUGF0dGVybldheXBvaW50cy5sZW5ndGgpIHtuZXh0V1AgPSAwfVxyXG4gICAgbGV0IGFnZSA9IDBcclxuICAgIGxldCBzcGVlZCA9IDAuMDAyNVxyXG4gICAgLy9sZXQgZGlzdE1vdmVkID0gTnVtYmVyKCAoTWF0aC5yYW5kb20oKSApLnRvRml4ZWQoMSkgKVxyXG4gICAgbGV0IGRpc3RNb3ZlZCA9IE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiAxMCApIC8gMTBcclxuICAgIGxldCBzdGFydENvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW2Zyb21XUF0pXHJcbiAgICBsZXQgZW5kQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbbmV4dFdQXSlcclxuICAgIGxldCBjcDFDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoc3RhcnRDb29yZHMsIGVuZENvb3JkcylcclxuICAgIGxldCBjcDJDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoc3RhcnRDb29yZHMsIGVuZENvb3JkcylcclxuXHJcbiAgICBsZXQgY29vcmRzID0ge1xyXG4gICAgICB4OiBzdGFydENvb3Jkcy54LCB5OiBzdGFydENvb3Jkcy55LFxyXG4gICAgICB4MDogc3RhcnRDb29yZHMueCwgeTA6IHN0YXJ0Q29vcmRzLnksXHJcbiAgICAgIHgxOiBlbmRDb29yZHMueCwgeTE6IGVuZENvb3Jkcy55LFxyXG4gICAgICBjcDF4OiBjcDFDb29yZHMueCwgY3AxeTogY3AxQ29vcmRzLnksXHJcbiAgICAgIGNwMng6IGNwMkNvb3Jkcy54LCBjcDJ5OiBjcDJDb29yZHMueVxyXG4gICAgfVxyXG5cclxuICAgIGxldCBwYXJ0aWNsZSA9IG5ldyBIb2xkUGF0dGVyblBhcnRpY2xlKGNvb3JkcywgYWdlLCBzcGVlZCwgZGlzdE1vdmVkLCBuZXh0V1ApXHJcblxyXG4gICAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSlcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXROYXZUYXJnZXRQb3MoKSB7XHJcbiAgY29uc29sZS5sb2coYG9yaWdpbiB4OiAke25hdlRhcmdldE9yaWdpbi54fWApXHJcbiAgbmF2VGFyZ2V0Q2hhclNpemUuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0IC8gOFxyXG4gIG5hdlRhcmdldENoYXJTaXplLndpZHRoID0gbmF2VGFyZ2V0Q2hhclNpemUuaGVpZ2h0ICogMC44XHJcbiAgbmF2VGFyZ2V0T3JpZ2luLnggPSAoY2FudmFzV2lkdGggLyAyKSAtIChuYXZUYXJnZXRXb3JkLmxlbmd0aCAqIG5hdlRhcmdldENoYXJTaXplLndpZHRoIC8gMilcclxuICBuYXZUYXJnZXRPcmlnaW4ueSA9IChjYW52YXNIZWlnaHQgLyAyKSAtIChuYXZUYXJnZXRDaGFyU2l6ZS5oZWlnaHQgLyAyKVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tVVBEQVRFIFBBUlRJQ0xFIFBPU0lUSU9OUyAmIFJFTkRFUlxyXG5mdW5jdGlvbiBhbmltYXRlKCkge1xyXG4gIGZyYW1lSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSlcclxuICBjdHgxLmNsZWFyUmVjdCgwLCAwLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KVxyXG4gIC8vY2FudmFzSGVscGVycy5yZW5kZXJCb3VuZGluZ0NpcmNsZShjdHgxLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KS8vZGV2XHJcbiAgLy9jYW52YXNIZWxwZXJzLnJlbmRlckhvbGRQYXR0ZXJuV1BzKGN0eDEsIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKS8vZGV2XHJcbiAgLy9jYW52YXNIZWxwZXJzLnJlbmRlckhvbGRQYXR0ZXJuUGFydGljbGVQYXRocyhjdHgxLCBob2xkUGF0dGVyblBhcnRpY2xlcykvL2RldlxyXG4gIHVwZGF0ZUhvbGRQYXR0ZXJuUGFydGljbGVzKClcclxuICB1cGRhdGVOYXZUYXJnZXRMZXR0ZXJzUGFydGljbGVzKClcclxufVxyXG5cclxuZnVuY3Rpb24gdXBkYXRlSG9sZFBhdHRlcm5QYXJ0aWNsZXMoKSB7XHJcbiAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7Ly90aGluayB0aGlzIHNob3VsZCBiZSBtb3ZlZCB0byBhIG1ldGhvZCBvbiBob2xkUGFydGljbGUgY2xhc3M/P1xyXG4gICAgcGFydGljbGUudXBkYXRlUG9zKClcclxuICAgIHBhcnRpY2xlLmRyYXcoJ3doaXRlJylcclxuICB9KVxyXG59XHJcblxyXG5mdW5jdGlvbiB1cGRhdGVOYXZUYXJnZXRMZXR0ZXJzUGFydGljbGVzKCkge1xyXG4gIG5hdlRhcmdldFBhcnRpY2xlcy5mb3JFYWNoKChwYXJ0aWNsZSwgaW5kZXgpID0+IHtcclxuICAgIHBhcnRpY2xlLnVwZGF0ZVBvcygpXHJcbiAgICBwYXJ0aWNsZS5kcmF3KCd3aGl0ZScsICdyZWQnKVxyXG4gICAgcGFydGljbGUuZHJhd1RvUG9pbnRzQXQoaW5kZXgsICcjZmZmZmZmJywgJyNmZjAwMDAnKVxyXG4gIH0pXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQlJFQUsgUE9JTlRTXHJcbmZ1bmN0aW9uIHNldExheW91dCgpIHtcclxuICAvL3NtYWxsIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNVxyXG4gIH1cclxuICAvL3NtYWxsIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0IDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG4gIC8vbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDEwMjQgJiYgYm9keS5jbGllbnRXaWR0aCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjdcclxuICB9XHJcbiAgLy9tZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gMTAyNCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcbiAgLy9sYXJnZSB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjY1XHJcbiAgfVxyXG4gIC8vbGFyZ2UgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPiAxMDI0KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBsYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG5cclxuICBjYW52YXMxLndpZHRoID0gY2FudmFzV2lkdGhcclxuICBjYW52YXMxLmhlaWdodCA9IGNhbnZhc0hlaWdodFxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVWRU5UIExJU1RFTkVSU1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBpbml0KVxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaW5pdClcclxubmF2R29Ub0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGluaXROYXZUYXJnZXQsIGZhbHNlKVxyXG5cclxuLy9tb3ZlIHNvbWUgb2YgdGhpcyB0byBsZXR0ZXItbGliXHJcbmZ1bmN0aW9uIGluaXROYXZUYXJnZXQoKSB7XHJcbiAgbGV0IHJlcXVpcmVkUGFydGljbGVzID0gbGV0dGVyc0xpYi50b3RhbFJlcXVpcmVkUGFydGljbGVzKG5hdlRhcmdldFdvcmQpXHJcbiAgbGV0IGRlc3RpbmF0aW9uc0FuZFRhcmdldHMgPSBsZXR0ZXJzTGliLmdldERlc3RpbmF0aW9uc0FuZFRhcmdldHMobmF2VGFyZ2V0V29yZCwgbmF2VGFyZ2V0T3JpZ2luLCBuYXZUYXJnZXRDaGFyU2l6ZSlcclxuXHJcbiAgaWYgKGhvbGRQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA+IHJlcXVpcmVkUGFydGljbGVzKSB7XHJcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgcmVxdWlyZWRQYXJ0aWNsZXM7IGkrKykge1xyXG4gICAgICBsZXQgdHJhbnNmZXJyaW5nUGFydGljbGUgPSBob2xkUGF0dGVyblBhcnRpY2xlcy5wb3AoKVxyXG4gICAgICBsZXQgY29vcmRzID0ge1xyXG4gICAgICAgIHg6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy54LFxyXG4gICAgICAgIHk6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy55LFxyXG4gICAgICAgIHgwOiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueCxcclxuICAgICAgICB5MDogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLnksXHJcbiAgICAgICAgeDE6IGRlc3RpbmF0aW9uc0FuZFRhcmdldHNbaV0ueDEsXHJcbiAgICAgICAgeTE6IGRlc3RpbmF0aW9uc0FuZFRhcmdldHNbaV0ueTFcclxuICAgICAgfVxyXG4gICAgICBsZXQgYWdlID0gdHJhbnNmZXJyaW5nUGFydGljbGUuYWdlXHJcbiAgICAgIGxldCBzcGVlZCA9IHRyYW5zZmVycmluZ1BhcnRpY2xlLnNwZWVkXHJcbiAgICAgIGxldCBkaXN0TW92ZWQgPSAwXHJcbiAgICAgIGxldCBwb2ludHNBdCA9IGRlc3RpbmF0aW9uc0FuZFRhcmdldHNbaV0ucG9pbnRzQXRcclxuICAgICAgbmF2VGFyZ2V0UGFydGljbGVzLnB1c2gobmV3IENoYXJQYXR0ZXJuUGFydGljbGUoY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQsIHBvaW50c0F0KSlcclxuICAgIH1cclxuXHJcbiAgfVxyXG4gIGNvbnNvbGUubG9nKGRlc3RpbmF0aW9uc0FuZFRhcmdldHMpXHJcbn1cclxuLy9ob2xkUGF0dGVyblBydGljbGVzIHwgSG9sZFBhdHRlcm5QYXJ0aWNsZTogY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQsIG5leHRXUFxyXG4vL25hdlRhcmdldFBhcnRpY2xlczogfCBDaGFyUGF0dGVyblBhcnRpY2xlOiBjb29yZHMsIGFnZSwgc3BlZWQsIGRpc3RNb3ZlZCwgY2hhciwgcG9zSW5DaGFyLCBwb3NJblN0ciwgcG9pbnRzQXRcclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tUEFSVElDTEUgQ0xBU1NFU1xyXG4vL2Nvb3JkcyB7eDogbnVtYmVyLCB5OiBudW1iZXIsIHgwOiBudW1iZXIsIHkwOiBudW1iZXIsIHgxOiBudW1iZXIsIHkxOiBudW1iZXIsIGNwMXg6IG51bWJlciwgY3AxeTogbnVtYmVyLCBjcDJ4OiBudW1iZXIsIGNwMnk6IG51bWJlcn1cclxuLy9hZ2UgbnVtYmVyXHJcbi8vc3BlZWQgbnVtYmVyXHJcbi8vZGlzdE1vdmVkIG51bWJlciAoJSBhbG9uZyBwYXRoIGFzIGRlY2ltYWwpXHJcbi8vbmV4dFdQIG51bWJlcihpbmRleClcclxuXHJcbi8vdGhpbmsgaWRlYSBtaWdodCBiZSB0byBzdGljayBuZWFybHkgYWxsIHRoZSBwcm9wcyBvbiB0aCBQYXJ0aWNsZSBwYXJlbnQsIHNjcmFwIHRoZSBpbnRlcm1lZGlhdGUgY2xhc3MgYW5kIGNvbmNlbnRyYXRlIG9uIHRoZSBtZXRob2RzIGluIGluZGl2aWR1YWxcclxuLy9wYXJ0aWNsZSBjbGFzc2VzLlxyXG5cclxuY2xhc3MgUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3JkcywgYWdlLCBzcGVlZCwgZGlzdE1vdmVkKSB7XHJcbiAgICB0aGlzLmNvb3JkcyA9IGNvb3Jkc1xyXG4gICAgdGhpcy5hZ2UgPSBhZ2VcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZFxyXG4gICAgdGhpcy5kaXN0TW92ZWQgPSBkaXN0TW92ZWRcclxuICB9XHJcblxyXG4gIGRyYXcoY29sb3IpIHsvL2RlZmF1bHQgc2VsZiByZW5kZXIgZm9yIHBhcnRpY2xlcywgbWF5YmUgY2hhbmdlIGxhdGVyXHJcbiAgICBjdHgxLmJlZ2luUGF0aCgpXHJcbiAgICBjdHgxLmxpbmVXaWR0aCA9IDNcclxuICAgIGN0eDEuc3Ryb2tlU3R5bGUgPSBjb2xvclxyXG4gICAgY3R4MS5maWxsU3R5bGUgPSAnYmxhY2snXHJcbiAgICBjdHgxLmFyYyh0aGlzLmNvb3Jkcy54LCB0aGlzLmNvb3Jkcy55LCAzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpXHJcbiAgICBjdHgxLnN0cm9rZSgpXHJcbiAgICBjdHgxLmZpbGwoKVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlUG9zKCkge1xyXG4gICAgdGhpcy5jb29yZHMueCArPSB0aGlzLnNwZWVkXHJcbiAgICB0aGlzLmNvb3Jkcy55ICs9IHRoaXMuc3BlZWRcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIEhvbGRQYXR0ZXJuUGFydGljbGUgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQsIG5leHRXUCkge1xyXG4gICAgc3VwZXIoY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQpXHJcbiAgICB0aGlzLm5leHRXUCA9IG5leHRXUFxyXG4gIH1cclxuXHJcbiAgdXBkYXRlUG9zKCkge1xyXG4gICAgdGhpcy5kaXN0TW92ZWQgKz0gdGhpcy5zcGVlZFxyXG4gICAgaWYodGhpcy5kaXN0TW92ZWQgPj0gMSkge1xyXG4gICAgICB0aGlzLmRpc3RNb3ZlZCA9IDBcclxuICAgICAgdGhpcy5uZXh0V1AgPSB0aGlzLm5leHRXUCA9PT0gaG9sZFBhdHRlcm5XYXlwb2ludHMubGVuZ3RoIC0gMSA/IDAgOiB0aGlzLm5leHRXUCArIDFcclxuICAgICAgdGhpcy5jb29yZHMueDAgPSB0aGlzLmNvb3Jkcy54MVxyXG4gICAgICB0aGlzLmNvb3Jkcy55MCA9IHRoaXMuY29vcmRzLnkxXHJcbiAgICAgIHRoaXMuY29vcmRzLngxID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbdGhpcy5uZXh0V1BdKS54XHJcbiAgICAgIHRoaXMuY29vcmRzLnkxID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbdGhpcy5uZXh0V1BdKS55XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMXggPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS54XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMXkgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS55XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMnggPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS54XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMnkgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS55XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvb3Jkcy54ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHRoaXMuZGlzdE1vdmVkLCB0aGlzLmNvb3Jkcy54MCwgdGhpcy5jb29yZHMuY3AxeCwgdGhpcy5jb29yZHMuY3AyeCwgdGhpcy5jb29yZHMueDEpXHJcbiAgICB0aGlzLmNvb3Jkcy55ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHRoaXMuZGlzdE1vdmVkLCB0aGlzLmNvb3Jkcy55MCwgdGhpcy5jb29yZHMuY3AxeSwgdGhpcy5jb29yZHMuY3AyeSwgdGhpcy5jb29yZHMueTEpXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBDaGFyUGF0dGVyblBhcnRpY2xlIGV4dGVuZHMgUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3JkcywgYWdlLCBzcGVlZCwgZGlzdE1vdmVkLCBwb2ludHNBdCkge1xyXG4gICAgc3VwZXIoY29vcmRzLCBhZ2UsIHNwZWVkLCBkaXN0TW92ZWQpXHJcbiAgICB0aGlzLnBvaW50c0F0ID0gcG9pbnRzQXRcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvcygpIHtcclxuICAgIHRoaXMuZGlzdE1vdmVkICs9IHRoaXMuc3BlZWRcclxuICAgIGlmKHRoaXMuZGlzdE1vdmVkIDwgMSkge1xyXG4gICAgICBsZXQgbmV3UG9zID0gY2FudmFzSGVscGVycy5jb29yZHNPblN0cmFpZ2h0TGluZSh0aGlzLmRpc3RNb3ZlZCwge3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KVxyXG4gICAgICB0aGlzLmNvb3Jkcy54ID0gbmV3UG9zLnhcclxuICAgICAgdGhpcy5jb29yZHMueSA9IG5ld1Bvcy55XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkcmF3KGNvbG9yRnJvbSwgY29sb3JUbykge1xyXG4gICAgY3R4MS5iZWdpblBhdGgoKVxyXG4gICAgY3R4MS5saW5lV2lkdGggPSAzXHJcbiAgICBjdHgxLnN0cm9rZVN0eWxlID0gdGhpcy5kaXN0TW92ZWQgPCAxID8gY29sb3JGcm9tIDogY29sb3JUby8vd3JpdGUgZnVuY3Rpb24gdG8gdHJhbnNpdGlvbiBiZXR3ZWVuIDIgY29sb3VycyB0aGF0IHRha2VzICUgYXMgYW4gYXJnXHJcbiAgICBjdHgxLmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eDEuYXJjKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnksIDMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSlcclxuICAgIGN0eDEuc3Ryb2tlKClcclxuICAgIGN0eDEuZmlsbCgpXHJcbiAgfVxyXG5cclxuICBkcmF3VG9Qb2ludHNBdChpbmRleCwgY29sb3JGcm9tLCBjb2xvclRvKSB7XHJcbiAgICBpZih0aGlzLnBvaW50c0F0ICE9PSBmYWxzZSkge1xyXG4gICAgICBsZXQgcG9pbnRzQXRYID0gbmF2VGFyZ2V0UGFydGljbGVzW2luZGV4ICsgdGhpcy5wb2ludHNBdF0uY29vcmRzLngvL3RoZXNlIHR3byBsaW5lcyBhcmUgZnVja2luZyB0aGluZ3Mgc29tZWhvdyBkZWxldGluZyB0aGUgbGFzdCBwYXJ0aWNsZSBpbiB0aGUgY2hhciBJIHRoaW5rXHJcbiAgICAgIGxldCBwb2ludHNBdFkgPSBuYXZUYXJnZXRQYXJ0aWNsZXNbaW5kZXggKyB0aGlzLnBvaW50c0F0XS5jb29yZHMueVxyXG4gICAgICBjdHgxLmJlZ2luUGF0aCgpXHJcbiAgICAgIGN0eDEubGluZVdpZHRoID0gMVxyXG4gICAgICBjdHgxLnN0cm9rZVN0eWxlID0gdGhpcy5kaXN0TW92ZWQgPCAxID8gY29sb3JGcm9tIDogY29sb3JUb1xyXG4gICAgICBjdHgxLm1vdmVUbyh0aGlzLmNvb3Jkcy54LCB0aGlzLmNvb3Jkcy55KVxyXG4gICAgICBjdHgxLmxpbmVUbyhwb2ludHNBdFgsIHBvaW50c0F0WSlcclxuICAgICAgY3R4MS5zdHJva2UoKVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2FudmFzSGVscGVycy5jb2xvckJldHdlZW5Ud29Db2xvcnMoMC41LCAnI2ZmYzRkZCcsICcjMDAwMGZmJykvL2RldlxyXG4iLCIvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLU1BVEggSEVMUEVSU1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUdFT01FVFJZIEhFTFBFUlNcclxuZnVuY3Rpb24gcmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhwMSwgcDIpIHtcclxuICBjb25zdCBNSU5fRElTVCA9IDQwXHJcbiAgY29uc3QgRElTVF9NT0QgPSAwLjVcclxuICBjb25zdCBBTkdMRV9XSVRISU4gPSBNYXRoLlBJXHJcbiAgbGV0IGEgPSBwMi54IC0gcDEueFxyXG4gIGxldCBiID0gcDIueSAtIHAxLnlcclxuICBsZXQgcDFQMkRpc3QgPSBNYXRoLnNxcnQoYSphICsgYipiKVxyXG4gIGxldCByYW5kRGlzdCA9IChNYXRoLnJhbmRvbSgpICogcDFQMkRpc3QgKiBESVNUX01PRCkgKyBNSU5fRElTVFxyXG4gIGxldCBhbmdsZU1vZCA9IChNYXRoLnJhbmRvbSgpICogQU5HTEVfV0lUSElOKSAtIChBTkdMRV9XSVRISU4gLyAyKVxyXG4gIGxldCByYW5kQW5nbGVcclxuICBsZXQgY29vcmRzID0ge3g6IG51bGwsIHk6IG51bGx9XHJcblxyXG4gIGlmKE1hdGgucmFuZG9tKCkgPj0gMC41KSB7XHJcbiAgICByYW5kQW5nbGUgPSBNYXRoLmF0YW4yKHAyLnkgLSBwMS55LCBwMS54IC0gcDIueCkgKyBhbmdsZU1vZFxyXG4gICAgY29vcmRzLnggPSBwMi54ICsgTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgICBjb29yZHMueSA9IHAyLnkgLSBNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICB9IGVsc2Uge1xyXG4gICAgcmFuZEFuZ2xlID0gTWF0aC5hdGFuMihwMS55IC0gcDIueSwgcDIueCAtIHAxLngpICsgYW5nbGVNb2RcclxuICAgIGNvb3Jkcy54ID0gcDEueCArIE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gICAgY29vcmRzLnkgPSBwMS55IC0gTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgfVxyXG5cclxuICByZXR1cm4gY29vcmRzXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJhbmRQb2ludE5lYXJQb2ludChwdCkge1xyXG4gIGNvbnN0IE1BWF9GUk9NID0gNDBcclxuICBsZXQgcmFuZERpc3QgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNQVhfRlJPTSlcclxuICBsZXQgcmFuZEFuZ2xlID0gTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyXHJcbiAgbGV0IHggPSBwdC54ICsgKE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdClcclxuICBsZXQgeSA9IHB0LnkgKyAoTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0KVxyXG5cclxuICByZXR1cm4ge3g6IHgsIHk6IHl9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvb3Jkc09uU3RyYWlnaHRMaW5lKHBlcmNlbnQsIHN0YXJ0UHQsIGVuZFB0KSB7XHJcbiAgbGV0IHhUb3RhbCA9IGVuZFB0LnggLSBzdGFydFB0LnhcclxuICBsZXQgeVRvdGFsID0gZW5kUHQueSAtIHN0YXJ0UHQueVxyXG4gIGxldCB4RGlzdCA9IHBlcmNlbnQgKiB4VG90YWxcclxuICBsZXQgeURpc3QgPSBwZXJjZW50ICogeVRvdGFsXHJcblxyXG4gIHJldHVybiB7eDogc3RhcnRQdC54ICsgeERpc3QsIHk6IHN0YXJ0UHQueSArIHlEaXN0fVxyXG59XHJcblxyXG4vL3N0b2xlbiBmcm9tIHN0YWNrb3ZlcmZsb3dcclxuZnVuY3Rpb24gY29vcmRzT25DdWJpY0JlemllcihwZXJjZW50LCBzdGFydFB0LCBjcDEsIGNwMiwgZW5kUHQpIHtcclxuICBsZXQgdDIgPSBwZXJjZW50ICogcGVyY2VudFxyXG4gIGxldCB0MyA9IHQyICogcGVyY2VudFxyXG5cclxuICByZXR1cm4gc3RhcnRQdCArICgtc3RhcnRQdCAqIDMgKyBwZXJjZW50ICogKDMgKiBzdGFydFB0IC0gc3RhcnRQdCAqIHBlcmNlbnQpKSAqIHBlcmNlbnRcclxuICArICgzICogY3AxICsgcGVyY2VudCAqICgtNiAqIGNwMSArIGNwMSAqIDMgKiBwZXJjZW50KSkgKiBwZXJjZW50XHJcbiAgKyAoY3AyICogMyAtIGNwMiAqIDMgKiBwZXJjZW50KSAqIHQyXHJcbiAgKyBlbmRQdCAqIHQzXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1ERVYgRlVOQ1RJT05TIFdPVCBGT1IgVklTVUFMSVNJTkcgV0hBVCdTIE9DQ1VSSU5HXHJcbmZ1bmN0aW9uIHJlbmRlckJvdW5kaW5nQ2lyY2xlKGN0eCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkge1xyXG4gIGxldCBjZW50ZXJYID0gY2FudmFzV2lkdGggLyAyXHJcbiAgbGV0IGNlbnRlclkgPSBjYW52YXNIZWlnaHQgLyAyXHJcbiAgbGV0IHJhZGl1cyA9IGNlbnRlclkgPiBjZW50ZXJYID8gY2VudGVyWCAtIDIgOiBjZW50ZXJZIC0gMlxyXG4gIGxldCBzdGFydEFuZ2xlID0gMFxyXG4gIGxldCBlbmRBbmdsZSA9IDIgKiBNYXRoLlBJXHJcbiAgY3R4LmxpbmVXaWR0aCA9IDFcclxuICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JleSdcclxuICBjdHguYmVnaW5QYXRoKClcclxuICBjdHguYXJjKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckhvbGRQYXR0ZXJuV1BzKGN0eCwgd2F5cG9pbnRzKSB7XHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LmZpbGxTdHlsZSA9ICdibHVlJ1xyXG4gIHdheXBvaW50cy5mb3JFYWNoKHdwID0+IHtcclxuICAgIGN0eC5maWxsUmVjdCh3cC54IC0gNCwgd3AueSAtIDQsIDgsIDgpXHJcbiAgfSlcclxuICBjdHguc3Ryb2tlKClcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVySG9sZFBhdHRlcm5QYXJ0aWNsZVBhdGhzKGN0eCwgcGFydGljbGVzKSB7XHJcbiAgcGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xyXG4gICAgbGV0IGNwMVggPSBwYXJ0aWNsZS5jb29yZHMuY3AxeFxyXG4gICAgbGV0IGNwMVkgPSBwYXJ0aWNsZS5jb29yZHMuY3AxeVxyXG4gICAgbGV0IGNwMlggPSBwYXJ0aWNsZS5jb29yZHMuY3AyeFxyXG4gICAgbGV0IGNwMlkgPSBwYXJ0aWNsZS5jb29yZHMuY3AyeVxyXG4gICAgbGV0IHN0YXJ0WCA9IHBhcnRpY2xlLmNvb3Jkcy54MFxyXG4gICAgbGV0IHN0YXJ0WSA9IHBhcnRpY2xlLmNvb3Jkcy55MFxyXG4gICAgbGV0IGVuZFggPSBwYXJ0aWNsZS5jb29yZHMueDFcclxuICAgIGxldCBlbmRZID0gcGFydGljbGUuY29vcmRzLnkxXHJcbiAgICBjdHgubGluZVdpZHRoID0gMVxyXG4gICAgLy9yZW5kZXIgc3RhcnQgcG9pbnRcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZWVuJ1xyXG4gICAgY3R4LnJlY3Qoc3RhcnRYIC0gMiwgc3RhcnRZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgZW5kIHBvaW50XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAncmVkJ1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHgucmVjdChlbmRYIC0gMiwgZW5kWSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIGNvbnRyb2wgcG9pbnQgMVxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAneWVsbG93J1xyXG4gICAgY3R4LnJlY3QoY3AxWCAtIDIsIGNwMVkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBjb250cm9sIHBvaW50IDJcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ29yYW5nZSdcclxuICAgIGN0eC5yZWN0KGNwMlggLSAyLCBjcDJZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgcGF0aFxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JleSdcclxuICAgIGN0eC5tb3ZlVG8oc3RhcnRYLCBzdGFydFkpXHJcbiAgICBjdHguYmV6aWVyQ3VydmVUbyhjcDFYLCBjcDFZLCBjcDJYLCBjcDJZLCBlbmRYLCBlbmRZKVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgfSlcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUNPTE9SIEhFTFBFUlNcclxuZnVuY3Rpb24gY29sb3JCZXR3ZWVuVHdvQ29sb3JzKHBlcmNlbnQsIGNvbG9yT25lLCBjb2xvclR3bykge1xyXG4gIC8vJyNmZjAwMDAnXHJcbiAgbGV0IGhleCA9IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICdhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZiddXHJcbiAgLy9jb2xvck9uZVxyXG4gIGxldCBjMVJlZEluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoMSkgKVxyXG4gIGxldCBjMVJlZEluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoMikgKVxyXG4gIGxldCBjMVJlZEJhc2VUZW4gPSAoYzFSZWRJbmRleDAgKiAxNikgKyAoYzFSZWRJbmRleDEpXHJcblxyXG4gIGxldCBjMUdyZWVuSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCgzKSApXHJcbiAgbGV0IGMxR3JlZW5JbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDQpIClcclxuICBsZXQgYzFHcmVlbmRCYXNlVGVuID0gKGMxR3JlZW5JbmRleDAgKiAxNikgKyAoYzFHcmVlbkluZGV4MSlcclxuXHJcbiAgbGV0IGMxQmx1ZUluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoNSkgKVxyXG4gIGxldCBjMUJsdWVJbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDYpIClcclxuICBsZXQgYzFCbHVlQmFzZVRlbiA9IChjMUJsdWVJbmRleDAgKiAxNikgKyAoYzFCbHVlSW5kZXgxKVxyXG5cclxuXHJcbiAgY29uc29sZS5sb2coYGMxUmVkQmFzZVRlbjogJHtjMVJlZEJhc2VUZW59LCBjMUdyZWVuZEJhc2VUZW46ICR7YzFHcmVlbmRCYXNlVGVufSwgYzFCbHVlQmFzZVRlbjogJHtjMUJsdWVCYXNlVGVufWApXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FWFBPUlRTXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMsXHJcbiAgcmFuZFBvaW50TmVhclBvaW50LFxyXG4gIGNvb3Jkc09uU3RyYWlnaHRMaW5lLFxyXG4gIGNvb3Jkc09uQ3ViaWNCZXppZXIsXHJcbiAgY29sb3JCZXR3ZWVuVHdvQ29sb3JzLFxyXG4gIC8vZGV2XHJcbiAgcmVuZGVyQm91bmRpbmdDaXJjbGUsXHJcbiAgcmVuZGVySG9sZFBhdHRlcm5XUHMsXHJcbiAgcmVuZGVySG9sZFBhdHRlcm5QYXJ0aWNsZVBhdGhzXHJcbn1cclxuIiwiLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1DT09SRFMgQVMgUkFUSU8gQU5EIFZFQ1RPUiBQT0lOVCBBVFNcclxubGV0IGxldHRlcnNDb29yZHMgPSB7XHJcbiAgQTogW1xyXG4gICAge3g6IDAuMTI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgICAvLzFcclxuICAgIHt4OiAwLjM3NSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC41fSwgICAvLzRcclxuICAgIHt4OiAwLjg3NSwgeTogMC44NzV9IC8vNVxyXG4gIF0sXHJcbiAgQiA6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjI1fSwgLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC43NX0gIC8vNFxyXG4gIF0sXHJcbiAgXCIgXCIgOltdXHJcbn1cclxuXHJcbmxldCBsZXR0ZXJzVmVjdG9ycyA9IHtcclxuICBBOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIEI6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTR9XHJcbiAgXVxyXG59XHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1IRUxQRVIgRlVOQ1RJT05TXHJcbmZ1bmN0aW9uIHRvdGFsUmVxdWlyZWRQYXJ0aWNsZXMoc3RyKSB7XHJcbiAgbGV0IHJlcXVpcmVkUGFydGljbGVzID0gMFxyXG5cclxuICBmb3IoaSBpbiBzdHIpIHtcclxuICAgIC8vdG9kbyB0aGluayBhYm91dCB3YXkgb2Ygc3dhcHBpbmcgdGhlIHN3aXRjaCBzdGF0ZW1lbnQgZm9yIHNvbWV0aGluZyBtb3JlIGdlbmVyYWxcclxuICAgIHN3aXRjaChzdHIuY2hhckF0KGkpKSB7XHJcbiAgICAgIGNhc2UgJ0EnOlxyXG4gICAgICAgIHJlcXVpcmVkUGFydGljbGVzICs9IGxldHRlcnNDb29yZHMuQS5sZW5ndGhcclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICdCJzpcclxuICAgICAgICByZXF1aXJlZFBhcnRpY2xlcyArPSBsZXR0ZXJzQ29vcmRzLkIubGVuZ3RoXHJcbiAgICAgICAgYnJlYWtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiByZXF1aXJlZFBhcnRpY2xlc1xyXG59XHJcblxyXG5cclxuLy9sZXQgbmF2VGFyZ2V0T3JpZ2luID0ge3g6IDMwLCB5OiAzMH1cclxuLy9sZXQgbmF2VGFyZ2V0U2l6ZSA9IHt3aWR0aDogMzAwLCBoZWlnaHQ6IDYwfVxyXG5mdW5jdGlvbiBnZXREZXN0aW5hdGlvbnNBbmRUYXJnZXRzKHN0ciwgb3JpZ2luLCBjaGFyU2l6ZSkge1xyXG4gIGxldCBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzID0gW11cclxuXHJcbiAgLy90YXJnZXQgPT0gb3JpZ2luIHBsdXMgKGNoYXIgcG9zIGluIHN0ciAqIHdpZHRoIG9mIGNoYXIpIHBsdXMgcGFydGljbGUgcG9zIGluIGNoYXJcclxuICBmb3IobGV0IHBvc0luU3RyIGluIHN0cikge1xyXG4gICAgbGV0IHgxID0gbnVsbFxyXG4gICAgbGV0IHkxID0gbnVsbFxyXG4gICAgbGV0IHBvaW50c0F0ID0gbnVsbFxyXG4gICAgbGV0IGNoYXJIZXJlID0gc3RyLmNoYXJBdChwb3NJblN0cilcclxuICAgIGxldCBuUGFydGljbGVzRm9yVGhpc0NoYXIgPWxldHRlcnNDb29yZHNbY2hhckhlcmVdLmxlbmd0aFxyXG5cclxuICAgIGZvcihsZXQgcG9zSW5DaGFyID0gMDsgcG9zSW5DaGFyIDwgblBhcnRpY2xlc0ZvclRoaXNDaGFyOyBwb3NJbkNoYXIrKykge1xyXG4gICAgICB4MSA9IG9yaWdpbi54ICsgKHBvc0luU3RyICogY2hhclNpemUud2lkdGgpICsgKGNoYXJTaXplLndpZHRoICogbGV0dGVyc0Nvb3Jkc1tjaGFySGVyZV1bcG9zSW5DaGFyXS54KVxyXG4gICAgICB5MSA9IG9yaWdpbi55ICsgKGNoYXJTaXplLmhlaWdodCAqIGxldHRlcnNDb29yZHNbY2hhckhlcmVdW3Bvc0luQ2hhcl0ueSlcclxuXHJcbiAgICAgIGlmKGxldHRlcnNWZWN0b3JzW2NoYXJIZXJlXVtwb3NJbkNoYXJdLmhhc1ZlY3RvciA9PT0gdHJ1ZSkgey8vc29tZXRoaW5nIGFib3V0IHRoaXMgaXMgbGF5aW5nIHR1cmRzXHJcbiAgICAgICAgcG9pbnRzQXQgPSBsZXR0ZXJzVmVjdG9yc1tjaGFySGVyZV1bcG9zSW5DaGFyXS5pbmRleE9mZnNldFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBvaW50c0F0ID0gZmFsc2VcclxuICAgICAgfVxyXG5cclxuICAgICAgZGVzdGluYXRpb25zQW5kVGFyZ2V0cy5wdXNoKCB7eDE6IHgxLCB5MTogeTEsIHBvaW50c0F0OiBwb2ludHNBdH0gKVxyXG4gICAgfVxyXG5cclxuICB9XHJcblxyXG4gIHJldHVybiBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzXHJcblxyXG59XHJcblxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgbGV0dGVyc0Nvb3JkcyxcclxuICBsZXR0ZXJzVmVjdG9ycyxcclxuICB0b3RhbFJlcXVpcmVkUGFydGljbGVzLFxyXG4gIGdldERlc3RpbmF0aW9uc0FuZFRhcmdldHNcclxufVxyXG5cclxuLy9oYXZlIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyBpbiBhIHN0cmluZyBhbmQgcmV0dXJucyB0b3RhbCBuUGFydGljbGVzIHVzaW5nIGxlbmd0aHMgb2YgZWFjaCBsZXR0ZXIgYXJyYXlcclxuIl19
