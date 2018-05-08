(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const canvasHelpers = require('./utils/canvas-helpers.js')
const lettersLib = require('./utils/letters-lib.js')

const CHAR_PATTERN_WORDS = 'POMPIDE JOKEDQRSTU Q R S T U'//for now defined staticly here, later will come from caurosel
const MAX_CHARS_PER_ROW = 12
const TOTAL_PARTICLES = 200
const HOLD_PATTERN_WAYPOINTS = [//coords as % of canvas size
  {x: 0.125, y: 0.5},
  {x: 0.25, y: 0.125},
  {x: 0.75, y: 0.125},
  {x: 0.875, y: 0.5},
  {x: 0.75, y: 0.875},
  {x: 0.25, y: 0.875}
]

let body = document.getElementsByTagName('body')[0]
let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')
let navGoToButton = document.getElementById('navigatorDesc')//dev
let frameId
let canvasWidth
let canvasHeight
let holdPatternWaypointsActual = []//coords in pixels, recalculated on resize
let holdPatternParticles = []
let charPatternParticles = []


//------------------------------------------------------------------------EVENTS
document.addEventListener("DOMContentLoaded", init)
window.addEventListener('resize', init)
navGoToButton.addEventListener('click', holdToCharTransition, false)


//---------------------------------------------------FLOW CONTROL & INITIALIZERS
function init() {
  reset()
  setLayout()
  calcHoldPatternWaypointCoords()
  initHoldPatternParticles(TOTAL_PARTICLES)
  animate()
}


function reset() {
  cancelAnimationFrame(frameId)
  holdPatternWaypointsActual.length = 0
  holdPatternParticles.length = 0
  charPatternParticles.length = 0
}


function calcHoldPatternWaypointCoords() {
  holdPatternWaypointsActual = HOLD_PATTERN_WAYPOINTS.map(el => {
    return {x: el.x * canvasWidth, y: el.y * canvasHeight}
  })
}


function initHoldPatternParticles(nParticles) {
  for(let i = 0; i < nParticles; i++) {
    const SPEED = 0.0025
    let fromWP = Math.floor(Math.random() * 6)
    let nextWP = fromWP + 1 === HOLD_PATTERN_WAYPOINTS.length ? 0 : fromWP + 1
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

    holdPatternParticles.push(new HoldPatternParticle(coords, SPEED, distMoved, nextWP))
  }
}


//----------------------------------TRANSITION PARTICLES BETWEEN BEHAVIOUR TYPES
function holdToCharTransition() {
  let requiredParticles = lettersLib.totalRequiredParticles(CHAR_PATTERN_WORDS)
  let wordsInRows = lettersLib.placeWordsInRows(CHAR_PATTERN_WORDS, MAX_CHARS_PER_ROW)
  let destinationsAndTargets = lettersLib.calcLetterParticlesDestAndTargets(wordsInRows, canvasWidth, canvasHeight)

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

      let speed = transferringParticle.speed
      let distMoved = 0
      let pointsAt = destinationsAndTargets[i].pointsAt
      charPatternParticles.push(new CharPatternParticle(coords, speed, distMoved, pointsAt))
    }

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
  updateCharPatternParticles()
}


function updateHoldPatternParticles() {
  holdPatternParticles.forEach(particle => {//think this should be moved to a method on holdParticle class??
    particle.updatePos()
    particle.draw('white')
  })
}


function updateCharPatternParticles() {
  charPatternParticles.forEach((particle, index) => {
    particle.updatePos()
    particle.draw('white', 'red')
    particle.drawToPointsAt(index, '#1f2633', '#ff0000')
  })
}


//-----------------------------------------------------------LAYOUT BREAK POINTS
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
  constructor(coords, speed, distMoved) {
    this.coords = coords
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
  constructor(coords, speed, distMoved, nextWP) {
    super(coords, speed, distMoved)
    this.nextWP = nextWP
  }

  updatePos() {
    this.distMoved += this.speed
    if(this.distMoved >= 1) {
      this.distMoved = 0
      this.nextWP = this.nextWP === HOLD_PATTERN_WAYPOINTS.length - 1 ? 0 : this.nextWP + 1
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
  constructor(coords, speed, distMoved, pointsAt) {
    super(coords, speed, distMoved)
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
    let rgb = canvasHelpers.colorBetweenTwoColors(this.distMoved, '#ffffff', '#ff0000')//dev
    ctx1.strokeStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    //ctx1.strokeStyle = this.distMoved < 1 ? colorFrom : colorTo//write function to transition between 2 colours that takes % as an arg
    ctx1.fillStyle = 'black'
    ctx1.arc(this.coords.x, this.coords.y, 3, 0, Math.PI * 2, false)
    ctx1.stroke()
    ctx1.fill()
  }

  drawToPointsAt(index, colorFrom, colorTo) {
    if(this.distMoved > 0.1) {
      if(this.pointsAt !== false) {
        let pointsAtX = charPatternParticles[index + this.pointsAt].coords.x//these two lines are fucking things somehow deleting the last particle in the char I think
        let pointsAtY = charPatternParticles[index + this.pointsAt].coords.y
        ctx1.beginPath()
        ctx1.lineWidth = 2
        let rgb = canvasHelpers.colorBetweenTwoColors(this.distMoved, '#1f2633', '#ff0000')
        ctx1.strokeStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
        //ctx1.strokeStyle = this.distMoved < 1 ? colorFrom : colorTo
        ctx1.moveTo(this.coords.x, this.coords.y)
        ctx1.lineTo(pointsAtX, pointsAtY)
        ctx1.stroke()
      }
    }
  }
}

},{"./utils/canvas-helpers.js":2,"./utils/letters-lib.js":3}],2:[function(require,module,exports){
//------------------------------------------------------------------MISC HELPERS

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
  let randDist = Math.random() * MAX_FROM
  let randAngle = Math.random() * Math.PI * 2
  let x = pt.x + Math.round(Math.cos(randAngle) * randDist)
  let y = pt.y + Math.round(Math.sin(randAngle) * randDist)

  return {x: x, y: y}
}


function coordsOnStraightLine(percent, startPt, endPt) {
  let xTotal = endPt.x - startPt.x
  let yTotal = endPt.y - startPt.y
  let xDist = percent * xTotal
  let yDist = percent * yTotal

  return {x: startPt.x + xDist, y: startPt.y + yDist}
}


function coordsOnCubicBezier(percent, startPt, cp1, cp2, endPt) {//stolen from stackoverflow
  let t2 = percent * percent
  let t3 = t2 * percent

  return startPt + (-startPt * 3 + percent * (3 * startPt - startPt * percent)) * percent
  + (3 * cp1 + percent * (-6 * cp1 + cp1 * 3 * percent)) * percent
  + (cp2 * 3 - cp2 * 3 * percent) * t2
  + endPt * t3
}


//--FUNCTIONS TO RENDER WAYPOINTS, CONTROL POINTS, ETC USED IN PARTICLE CREATION
//NOT NECESSARILY USED BUT USEFUL FOR DEBUGGING
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
//would be more efficient to take args as {r: 0-255, g: 0-255, b:0-255}
//so no need the hex array stuff but ok for now as drawing
//a few hundred particles without lag
function colorBetweenTwoColors(percent, colorOne, colorTwo) {
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

  //colorTwo
  let c2RedIndex0 = hex.indexOf( colorTwo.charAt(1) )
  let c2RedIndex1 = hex.indexOf( colorTwo.charAt(2) )
  let c2RedBaseTen = (c2RedIndex0 * 16) + (c2RedIndex1)

  let c2GreenIndex0 = hex.indexOf( colorTwo.charAt(3) )
  let c2GreenIndex1 = hex.indexOf( colorTwo.charAt(4) )
  let c2GreendBaseTen = (c2GreenIndex0 * 16) + (c2GreenIndex1)

  let c2BlueIndex0 = hex.indexOf( colorTwo.charAt(5) )
  let c2BlueIndex1 = hex.indexOf( colorTwo.charAt(6) )
  let c2BlueBaseTen = (c2BlueIndex0 * 16) + (c2BlueIndex1)

  let redDelta = c2RedBaseTen - c1RedBaseTen
  let greenDelta = c2GreendBaseTen - c1GreendBaseTen
  let blueDelta = c2BlueBaseTen - c1BlueBaseTen

  let redNow = Math.round( c1RedBaseTen + (redDelta * percent) )
  let greenNow = Math.round( c1GreendBaseTen + (greenDelta * percent) )
  let blueNow = Math.round( c1BlueBaseTen + (blueDelta * percent) )

  return {r: redNow, g: greenNow, b: blueNow}//temp
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
  B: [
    {x: 0.25, y: 0.875},//0
    {x: 0.25, y: 0.5},  //1
    {x: 0.25, y: 0.125},//2
    {x: 0.75, y: 0.25}, //3
    {x: 0.75, y: 0.75}  //4
  ],
  C: [
    {x: 0.75, y: 0.875},//0
    {x: 0.25, y: 0.625},//1
    {x: 0.25, y: 0.375},//2
    {x: 0.75, y: 0.125} //3
  ],
  D: [
    {x: 0.25, y: 0.875}, //0
    {x: 0.25, y: 0.125 },//1
    {x: 0.75, y: 0.375}, //2
    {x: 0.75, y: 0.625}  //3
  ],
  E: [
    {x: 0.25, y: 0.875},//0
    {x: 0.25, y: 0.5},  //1
    {x: 0.25, y: 0.125},//2
    {x: 0.75, y: 0.125},//3
    {x: 0.75, y: 0.5},  //4
    {x: 0.75, y: 0.875} //5
  ],
  F: [
    {x: 0.25, y: 0.875},//0
    {x: 0.25, y: 0.5},  //1
    {x: 0.25, y: 0.125},//2
    {x: 0.75, y: 0.125},//3
    {x: 0.75, y: 0.5}   //4
  ],
  G: [
    {x: 0.75, y: 0.875},//0
    {x: 0.25, y: 0.625},//1
    {x: 0.25, y: 0.375},//2
    {x: 0.75, y: 0.125},//3
    {x: 0.625, y: 0.5}, //4
    {x: 0.875, y: 0.5}  //5
  ],
  H: [
    {x: 0.25, y: 0.875},//0
    {x: 0.25, y: 0.5},  //1
    {x: 0.25, y: 0.125},//2
    {x: 0.75, y: 0.125},//3
    {x: 0.75, y: 0.5},  //4
    {x: 0.75, y: 0.875} //5
  ],
  I: [
    {x: 0.75, y: 0.875},//0
    {x: 0.5, y: 0.875}, //1
    {x: 0.25, y: 0.875},//2
    {x: 0.25, y: 0.125},//3
    {x: 0.5, y: 0.125}, //4
    {x: 0.75, y: 0.125} //5
  ],
  J: [
    {x: 0.25, y: 0.75},
    {x: 0.375, y: 0.875},
    {x: 0.5, y: 0.75},
    {x: 0.5, y: 0.125},
    {x: 0.25, y: 0.125},
    {x: 0.75, y: 0.125}
  ],
  K: [
    {x: 0.25, y: 0.875},
    {x: 0.25, y: 0.5},
    {x: 0.25, y: 0.125},
    {x: 0.75, y: 0.875},
    {x: 0.75, y: 0.25}
  ],
  L: [
    {x: 0.75, y: 0.875},
    {x: 0.25, y: 0.875},
    {x: 0.25, y: 0.125}
  ],
  M: [
    {x: 0.125, y: 0.875},
    {x: 0.25, y: 0.125},
    {x: 0.5, y: 0.75},
    {x: 0.75, y: 0.125},
    {x: 0.875, y: 0.875}
  ],
  N: [
    {x: 0.25, y: 0.875},
    {x: 0.25, y: 0.125},
    {x: 0.75, y: 0.875},
    {x: 0.75, y: 0.125}
  ],
  O: [
    {x: 0.375, y: 0.875},
    {x: 0.125, y: 0.625},
    {x: 0.125, y: 0.375},
    {x: 0.375, y: 0.125},
    {x: 0.625, y: 0.125},
    {x: 0.875, y: 0.375},
    {x: 0.875, y: 0.625},
    {x: 0.625, y: 0.875}
  ],
  P: [
    {x: 0.25, y: 0.875},
    {x: 0.25, y: 0.5},
    {x: 0.25, y: 0.125},
    {x: 0.625, y: 0.125},
    {x: 0.75, y: 0.25},
    {x: 0.75, y: 0.375},
    {x: 0.625, y: 0.5}
  ],
  Q: [
    {x: 0.375, y: 0.875},
    {x: 0.125, y: 0.625},
    {x: 0.125, y: 0.375},
    {x: 0.375, y: 0.125},
    {x: 0.625, y: 0.125},
    {x: 0.875, y: 0.375},
    {x: 0.875, y: 0.625},
    {x: 0.625, y: 0.875},
    {x: 0.625, y: 0.625},
    {x: 0.875, y: 0.875}
  ],
  R: [
    {x: 0.25, y: 0.875},
    {x: 0.25, y: 0.5},
    {x: 0.25, y: 0.125},
    {x: 0.625, y: 0.125},
    {x: 0.75, y: 0.25},
    {x: 0.75, y: 0.375},
    {x: 0.625, y: 0.5},
    {x: 0.75, y: 0.875}
  ],
  S: [
    {x: 0.25, y: 0.75},  //0
    {x: 0.375, y: 0.875},//1
    {x: 0.625, y: 0.875},//2
    {x: 0.75, y: 0.75},  //3
    {x: 0.75, y: 0.625}, //4
    {x: 0.625, y: 0.5},  //5
    {x: 0.375, y: 0.5},  //6
    {x: 0.25, y: 0.375}, //7
    {x: 0.25, y: 0.25},  //8
    {x: 0.375, y: 0.125},//9
    {x: 0.625, y: 0.125},//10
    {x: 0.75, y: 0.25}   //11
  ],
  T: [
    {x: 0.5, y: 0.875},
    {x: 0.5, y: 0.125},
    {x: 0.25, y: 0.125},
    {x: 0.75, y: 0.125}
  ],
  U: [
    {x: 0.25, y: 0.125},
    {x: 0.25, y: 0.75},
    {x: 0.375, y: 0.875},
    {x: 0.625, y: 0.875},
    {x: 0.75, y: 0.75},
    {x: 0.75, y: 0.1225}
  ],
  " ": []//enables having spaces between letters
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
  ],
  C: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  D: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: -3}
  ],
  E: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 3},
    {hasVector: true, indexOffset: 1},
    {hasVector: false},
    {hasVector: false},
    {hasVector: true, indexOffset: -5}
  ],
  F: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 3},
    {hasVector: true, indexOffset: 1},
    {hasVector: false},
    {hasVector: false}
  ],
  G: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: -5}
  ],
  H: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 3},
    {hasVector: false},
    {hasVector: true, indexOffset: 2},
    {hasVector: false},
    {hasVector: false}
  ],
  I: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 3},
    {hasVector: false},
    {hasVector: true, indexOffset: 2},
    {hasVector: false},
    {hasVector: false}
  ],
  J: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  K: [
    {hasVector: true, indexOffset: 2},
    {hasVector: true, indexOffset: 2},
    {hasVector: false},
    {hasVector: false},
    {hasVector: true, indexOffset: -3}
  ],
  L: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  M: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  N: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  O: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: -7}
  ],
  P: [
    {hasVector: true, indexOffset: 2},
    {hasVector: false},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: -5}
  ],
  Q: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: -7},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  R: [
    {hasVector: true, indexOffset: 2},
    {hasVector: false},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: -5},
    {hasVector: true, indexOffset: -1}
  ],
  S: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  T: [
    {hasVector: true, indexOffset: 1},
    {hasVector: false},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  U: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ]
}


//------------------------------------------------------------EXPORTED FUNCTIONS
function totalRequiredParticles(str) {
  let requiredParticles = 0

  for(i in str) {
    requiredParticles += lettersCoords[str.charAt(i)].length
  }

  console.log("total requiredParticles: " + requiredParticles)
  return requiredParticles
}


function placeWordsInRows(str, maxCharsInRow) {
  let words = str.split(" ")
  let rows = [""]
  let rowsIndex = 0

  words.forEach((word, index) => {
    if(rows[rowsIndex].length + word.length + 1 <= maxCharsInRow) {
      rows[rowsIndex] = index === 0 ? rows[rowsIndex] + word : rows[rowsIndex] + " " + word
    } else {
      rows.push(word)
      rowsIndex++
    }
  })

  return rows
}


function calcLetterParticlesDestAndTargets(wordsInRows, canvasWidth, canvasHeight) {
  let charWidth = Math.round( canvasWidth / (longestElementLength(wordsInRows) + 2) )
  let charHeight = Math.round(charWidth * 1.2)
  let totalRowsHeight = charHeight * (wordsInRows.length + 1)
  let finalCoordsAndPointsAts = []

  for(let row in wordsInRows) {
    let rowStartX = (canvasWidth / 2) - (wordsInRows[row].length * charWidth / 2)
    let rowStartY = (canvasHeight / 2) - (totalRowsHeight / 2) + (row * charHeight)

    for(let letterPos = 0; letterPos < wordsInRows[row].length; letterPos++) {
      let charHere = wordsInRows[row].charAt(letterPos)
      let nCharParticles = lettersCoords[charHere].length

      for(let posInChar = 0; posInChar < nCharParticles; posInChar++) {
        let x1 = rowStartX + (letterPos * charWidth) + (charWidth * lettersCoords[charHere][posInChar].x)
        let y1 = rowStartY + (charHeight * lettersCoords[charHere][posInChar].y)
        let pointsAt = false

        if(lettersVectors[charHere][posInChar].hasVector === true) {
          pointsAt = lettersVectors[charHere][posInChar].indexOffset
        }

        finalCoordsAndPointsAts.push({x1: x1, y1: y1, pointsAt: pointsAt})
      }
    }
  }

  return finalCoordsAndPointsAts
}


//------------------------------------------------------------INTERNAL FUNCTIONS
function longestElementLength(arr) {
  let length = 0
  arr.forEach(el => {
    length = el.length >= length ? el.length : length
  })
  return length
}


//-----------------------------------------------------------------------EXPORTS
module.exports = {
  placeWordsInRows,
  totalRequiredParticles,
  calcLetterParticlesDestAndTargets
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2FudmFzLWhlbHBlcnMuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9sZXR0ZXJzLWxpYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgY2FudmFzSGVscGVycyA9IHJlcXVpcmUoJy4vdXRpbHMvY2FudmFzLWhlbHBlcnMuanMnKVxyXG5jb25zdCBsZXR0ZXJzTGliID0gcmVxdWlyZSgnLi91dGlscy9sZXR0ZXJzLWxpYi5qcycpXHJcblxyXG5jb25zdCBDSEFSX1BBVFRFUk5fV09SRFMgPSAnUE9NUElERSBKT0tFRFFSU1RVIFEgUiBTIFQgVScvL2ZvciBub3cgZGVmaW5lZCBzdGF0aWNseSBoZXJlLCBsYXRlciB3aWxsIGNvbWUgZnJvbSBjYXVyb3NlbFxyXG5jb25zdCBNQVhfQ0hBUlNfUEVSX1JPVyA9IDEyXHJcbmNvbnN0IFRPVEFMX1BBUlRJQ0xFUyA9IDIwMFxyXG5jb25zdCBIT0xEX1BBVFRFUk5fV0FZUE9JTlRTID0gWy8vY29vcmRzIGFzICUgb2YgY2FudmFzIHNpemVcclxuICB7eDogMC4xMjUsIHk6IDAuNX0sXHJcbiAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICB7eDogMC43NSwgeTogMC4xMjV9LFxyXG4gIHt4OiAwLjg3NSwgeTogMC41fSxcclxuICB7eDogMC43NSwgeTogMC44NzV9LFxyXG4gIHt4OiAwLjI1LCB5OiAwLjg3NX1cclxuXVxyXG5cclxubGV0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdXHJcbmxldCBjYW52YXMxID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2NhbnZhcycpWzBdXHJcbmxldCBjdHgxID0gY2FudmFzMS5nZXRDb250ZXh0KCcyZCcpXHJcbmxldCBuYXZHb1RvQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdmlnYXRvckRlc2MnKS8vZGV2XHJcbmxldCBmcmFtZUlkXHJcbmxldCBjYW52YXNXaWR0aFxyXG5sZXQgY2FudmFzSGVpZ2h0XHJcbmxldCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCA9IFtdLy9jb29yZHMgaW4gcGl4ZWxzLCByZWNhbGN1bGF0ZWQgb24gcmVzaXplXHJcbmxldCBob2xkUGF0dGVyblBhcnRpY2xlcyA9IFtdXHJcbmxldCBjaGFyUGF0dGVyblBhcnRpY2xlcyA9IFtdXHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FVkVOVFNcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdClcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGluaXQpXHJcbm5hdkdvVG9CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBob2xkVG9DaGFyVHJhbnNpdGlvbiwgZmFsc2UpXHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1GTE9XIENPTlRST0wgJiBJTklUSUFMSVpFUlNcclxuZnVuY3Rpb24gaW5pdCgpIHtcclxuICByZXNldCgpXHJcbiAgc2V0TGF5b3V0KClcclxuICBjYWxjSG9sZFBhdHRlcm5XYXlwb2ludENvb3JkcygpXHJcbiAgaW5pdEhvbGRQYXR0ZXJuUGFydGljbGVzKFRPVEFMX1BBUlRJQ0xFUylcclxuICBhbmltYXRlKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlc2V0KCkge1xyXG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lSWQpXHJcbiAgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwubGVuZ3RoID0gMFxyXG4gIGhvbGRQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA9IDBcclxuICBjaGFyUGF0dGVyblBhcnRpY2xlcy5sZW5ndGggPSAwXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjYWxjSG9sZFBhdHRlcm5XYXlwb2ludENvb3JkcygpIHtcclxuICBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCA9IEhPTERfUEFUVEVSTl9XQVlQT0lOVFMubWFwKGVsID0+IHtcclxuICAgIHJldHVybiB7eDogZWwueCAqIGNhbnZhc1dpZHRoLCB5OiBlbC55ICogY2FudmFzSGVpZ2h0fVxyXG4gIH0pXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBpbml0SG9sZFBhdHRlcm5QYXJ0aWNsZXMoblBhcnRpY2xlcykge1xyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBuUGFydGljbGVzOyBpKyspIHtcclxuICAgIGNvbnN0IFNQRUVEID0gMC4wMDI1XHJcbiAgICBsZXQgZnJvbVdQID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNilcclxuICAgIGxldCBuZXh0V1AgPSBmcm9tV1AgKyAxID09PSBIT0xEX1BBVFRFUk5fV0FZUE9JTlRTLmxlbmd0aCA/IDAgOiBmcm9tV1AgKyAxXHJcbiAgICBsZXQgZGlzdE1vdmVkID0gTWF0aC5yb3VuZCggTWF0aC5yYW5kb20oKSAqIDEwICkgLyAxMFxyXG4gICAgbGV0IHN0YXJ0Q29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbZnJvbVdQXSlcclxuICAgIGxldCBlbmRDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFtuZXh0V1BdKVxyXG4gICAgbGV0IGNwMUNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhzdGFydENvb3JkcywgZW5kQ29vcmRzKVxyXG4gICAgbGV0IGNwMkNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhzdGFydENvb3JkcywgZW5kQ29vcmRzKVxyXG4gICAgbGV0IGNvb3JkcyA9IHtcclxuICAgICAgeDogc3RhcnRDb29yZHMueCwgeTogc3RhcnRDb29yZHMueSxcclxuICAgICAgeDA6IHN0YXJ0Q29vcmRzLngsIHkwOiBzdGFydENvb3Jkcy55LFxyXG4gICAgICB4MTogZW5kQ29vcmRzLngsIHkxOiBlbmRDb29yZHMueSxcclxuICAgICAgY3AxeDogY3AxQ29vcmRzLngsIGNwMXk6IGNwMUNvb3Jkcy55LFxyXG4gICAgICBjcDJ4OiBjcDJDb29yZHMueCwgY3AyeTogY3AyQ29vcmRzLnlcclxuICAgIH1cclxuXHJcbiAgICBob2xkUGF0dGVyblBhcnRpY2xlcy5wdXNoKG5ldyBIb2xkUGF0dGVyblBhcnRpY2xlKGNvb3JkcywgU1BFRUQsIGRpc3RNb3ZlZCwgbmV4dFdQKSlcclxuICB9XHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1UUkFOU0lUSU9OIFBBUlRJQ0xFUyBCRVRXRUVOIEJFSEFWSU9VUiBUWVBFU1xyXG5mdW5jdGlvbiBob2xkVG9DaGFyVHJhbnNpdGlvbigpIHtcclxuICBsZXQgcmVxdWlyZWRQYXJ0aWNsZXMgPSBsZXR0ZXJzTGliLnRvdGFsUmVxdWlyZWRQYXJ0aWNsZXMoQ0hBUl9QQVRURVJOX1dPUkRTKVxyXG4gIGxldCB3b3Jkc0luUm93cyA9IGxldHRlcnNMaWIucGxhY2VXb3Jkc0luUm93cyhDSEFSX1BBVFRFUk5fV09SRFMsIE1BWF9DSEFSU19QRVJfUk9XKVxyXG4gIGxldCBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzID0gbGV0dGVyc0xpYi5jYWxjTGV0dGVyUGFydGljbGVzRGVzdEFuZFRhcmdldHMod29yZHNJblJvd3MsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpXHJcblxyXG4gIGlmIChob2xkUGF0dGVyblBhcnRpY2xlcy5sZW5ndGggPiByZXF1aXJlZFBhcnRpY2xlcykge1xyXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHJlcXVpcmVkUGFydGljbGVzOyBpKyspIHtcclxuICAgICAgbGV0IHRyYW5zZmVycmluZ1BhcnRpY2xlID0gaG9sZFBhdHRlcm5QYXJ0aWNsZXMucG9wKClcclxuICAgICAgbGV0IGNvb3JkcyA9IHtcclxuICAgICAgICB4OiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueCxcclxuICAgICAgICB5OiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueSxcclxuICAgICAgICB4MDogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLngsXHJcbiAgICAgICAgeTA6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy55LFxyXG4gICAgICAgIHgxOiBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzW2ldLngxLFxyXG4gICAgICAgIHkxOiBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzW2ldLnkxXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBzcGVlZCA9IHRyYW5zZmVycmluZ1BhcnRpY2xlLnNwZWVkXHJcbiAgICAgIGxldCBkaXN0TW92ZWQgPSAwXHJcbiAgICAgIGxldCBwb2ludHNBdCA9IGRlc3RpbmF0aW9uc0FuZFRhcmdldHNbaV0ucG9pbnRzQXRcclxuICAgICAgY2hhclBhdHRlcm5QYXJ0aWNsZXMucHVzaChuZXcgQ2hhclBhdHRlcm5QYXJ0aWNsZShjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQsIHBvaW50c0F0KSlcclxuICAgIH1cclxuXHJcbiAgfVxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVVQREFURSBQQVJUSUNMRSBQT1NJVElPTlMgJiBSRU5ERVJcclxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcclxuICBmcmFtZUlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpXHJcbiAgY3R4MS5jbGVhclJlY3QoMCwgMCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodClcclxuICAvL2NhbnZhc0hlbHBlcnMucmVuZGVyQm91bmRpbmdDaXJjbGUoY3R4MSwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkvL2RldlxyXG4gIC8vY2FudmFzSGVscGVycy5yZW5kZXJIb2xkUGF0dGVybldQcyhjdHgxLCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCkvL2RldlxyXG4gIC8vY2FudmFzSGVscGVycy5yZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHMoY3R4MSwgaG9sZFBhdHRlcm5QYXJ0aWNsZXMpLy9kZXZcclxuICB1cGRhdGVIb2xkUGF0dGVyblBhcnRpY2xlcygpXHJcbiAgdXBkYXRlQ2hhclBhdHRlcm5QYXJ0aWNsZXMoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gdXBkYXRlSG9sZFBhdHRlcm5QYXJ0aWNsZXMoKSB7XHJcbiAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7Ly90aGluayB0aGlzIHNob3VsZCBiZSBtb3ZlZCB0byBhIG1ldGhvZCBvbiBob2xkUGFydGljbGUgY2xhc3M/P1xyXG4gICAgcGFydGljbGUudXBkYXRlUG9zKClcclxuICAgIHBhcnRpY2xlLmRyYXcoJ3doaXRlJylcclxuICB9KVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQ2hhclBhdHRlcm5QYXJ0aWNsZXMoKSB7XHJcbiAgY2hhclBhdHRlcm5QYXJ0aWNsZXMuZm9yRWFjaCgocGFydGljbGUsIGluZGV4KSA9PiB7XHJcbiAgICBwYXJ0aWNsZS51cGRhdGVQb3MoKVxyXG4gICAgcGFydGljbGUuZHJhdygnd2hpdGUnLCAncmVkJylcclxuICAgIHBhcnRpY2xlLmRyYXdUb1BvaW50c0F0KGluZGV4LCAnIzFmMjYzMycsICcjZmYwMDAwJylcclxuICB9KVxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUxBWU9VVCBCUkVBSyBQT0lOVFNcclxuZnVuY3Rpb24gc2V0TGF5b3V0KCkge1xyXG4gIC8vc21hbGwgd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC41XHJcbiAgfVxyXG4gIC8vc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcbiAgLy9tZWRpdW0gd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gMTAyNCAmJiBib2R5LmNsaWVudFdpZHRoID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuN1xyXG4gIH1cclxuICAvL21lZGl1bSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA8PSAxMDI0ICYmIGJvZHkuY2xpZW50SGVpZ2h0ID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjY1XHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuICAvL2xhcmdlIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoID4gMTAyNCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbGFyZ2Ugd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNjVcclxuICB9XHJcbiAgLy9sYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcblxyXG4gIGNhbnZhczEud2lkdGggPSBjYW52YXNXaWR0aFxyXG4gIGNhbnZhczEuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0XHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tUEFSVElDTEUgQ0xBU1NFU1xyXG5jbGFzcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkKSB7XHJcbiAgICB0aGlzLmNvb3JkcyA9IGNvb3Jkc1xyXG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkXHJcbiAgICB0aGlzLmRpc3RNb3ZlZCA9IGRpc3RNb3ZlZFxyXG4gIH1cclxuXHJcbiAgZHJhdyhjb2xvcikgey8vZGVmYXVsdCBzZWxmIHJlbmRlciBmb3IgcGFydGljbGVzLCBtYXliZSBjaGFuZ2UgbGF0ZXJcclxuICAgIGN0eDEuYmVnaW5QYXRoKClcclxuICAgIGN0eDEubGluZVdpZHRoID0gM1xyXG4gICAgY3R4MS5zdHJva2VTdHlsZSA9IGNvbG9yXHJcbiAgICBjdHgxLmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eDEuYXJjKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnksIDMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSlcclxuICAgIGN0eDEuc3Ryb2tlKClcclxuICAgIGN0eDEuZmlsbCgpXHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3MoKSB7XHJcbiAgICB0aGlzLmNvb3Jkcy54ICs9IHRoaXMuc3BlZWRcclxuICAgIHRoaXMuY29vcmRzLnkgKz0gdGhpcy5zcGVlZFxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgSG9sZFBhdHRlcm5QYXJ0aWNsZSBleHRlbmRzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQsIG5leHRXUCkge1xyXG4gICAgc3VwZXIoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkKVxyXG4gICAgdGhpcy5uZXh0V1AgPSBuZXh0V1BcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvcygpIHtcclxuICAgIHRoaXMuZGlzdE1vdmVkICs9IHRoaXMuc3BlZWRcclxuICAgIGlmKHRoaXMuZGlzdE1vdmVkID49IDEpIHtcclxuICAgICAgdGhpcy5kaXN0TW92ZWQgPSAwXHJcbiAgICAgIHRoaXMubmV4dFdQID0gdGhpcy5uZXh0V1AgPT09IEhPTERfUEFUVEVSTl9XQVlQT0lOVFMubGVuZ3RoIC0gMSA/IDAgOiB0aGlzLm5leHRXUCArIDFcclxuICAgICAgdGhpcy5jb29yZHMueDAgPSB0aGlzLmNvb3Jkcy54MVxyXG4gICAgICB0aGlzLmNvb3Jkcy55MCA9IHRoaXMuY29vcmRzLnkxXHJcbiAgICAgIHRoaXMuY29vcmRzLngxID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbdGhpcy5uZXh0V1BdKS54XHJcbiAgICAgIHRoaXMuY29vcmRzLnkxID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbdGhpcy5uZXh0V1BdKS55XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMXggPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS54XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMXkgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS55XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMnggPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS54XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMnkgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS55XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvb3Jkcy54ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHRoaXMuZGlzdE1vdmVkLCB0aGlzLmNvb3Jkcy54MCwgdGhpcy5jb29yZHMuY3AxeCwgdGhpcy5jb29yZHMuY3AyeCwgdGhpcy5jb29yZHMueDEpXHJcbiAgICB0aGlzLmNvb3Jkcy55ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHRoaXMuZGlzdE1vdmVkLCB0aGlzLmNvb3Jkcy55MCwgdGhpcy5jb29yZHMuY3AxeSwgdGhpcy5jb29yZHMuY3AyeSwgdGhpcy5jb29yZHMueTEpXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBDaGFyUGF0dGVyblBhcnRpY2xlIGV4dGVuZHMgUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZCwgcG9pbnRzQXQpIHtcclxuICAgIHN1cGVyKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZClcclxuICAgIHRoaXMucG9pbnRzQXQgPSBwb2ludHNBdFxyXG4gIH1cclxuXHJcbiAgdXBkYXRlUG9zKCkge1xyXG4gICAgdGhpcy5kaXN0TW92ZWQgKz0gdGhpcy5zcGVlZFxyXG4gICAgaWYodGhpcy5kaXN0TW92ZWQgPCAxKSB7XHJcbiAgICAgIGxldCBuZXdQb3MgPSBjYW52YXNIZWxwZXJzLmNvb3Jkc09uU3RyYWlnaHRMaW5lKHRoaXMuZGlzdE1vdmVkLCB7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pXHJcbiAgICAgIHRoaXMuY29vcmRzLnggPSBuZXdQb3MueFxyXG4gICAgICB0aGlzLmNvb3Jkcy55ID0gbmV3UG9zLnlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRyYXcoY29sb3JGcm9tLCBjb2xvclRvKSB7XHJcbiAgICBjdHgxLmJlZ2luUGF0aCgpXHJcbiAgICBjdHgxLmxpbmVXaWR0aCA9IDNcclxuICAgIGxldCByZ2IgPSBjYW52YXNIZWxwZXJzLmNvbG9yQmV0d2VlblR3b0NvbG9ycyh0aGlzLmRpc3RNb3ZlZCwgJyNmZmZmZmYnLCAnI2ZmMDAwMCcpLy9kZXZcclxuICAgIGN0eDEuc3Ryb2tlU3R5bGUgPSBgcmdiKCR7cmdiLnJ9LCAke3JnYi5nfSwgJHtyZ2IuYn0pYFxyXG4gICAgLy9jdHgxLnN0cm9rZVN0eWxlID0gdGhpcy5kaXN0TW92ZWQgPCAxID8gY29sb3JGcm9tIDogY29sb3JUby8vd3JpdGUgZnVuY3Rpb24gdG8gdHJhbnNpdGlvbiBiZXR3ZWVuIDIgY29sb3VycyB0aGF0IHRha2VzICUgYXMgYW4gYXJnXHJcbiAgICBjdHgxLmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eDEuYXJjKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnksIDMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSlcclxuICAgIGN0eDEuc3Ryb2tlKClcclxuICAgIGN0eDEuZmlsbCgpXHJcbiAgfVxyXG5cclxuICBkcmF3VG9Qb2ludHNBdChpbmRleCwgY29sb3JGcm9tLCBjb2xvclRvKSB7XHJcbiAgICBpZih0aGlzLmRpc3RNb3ZlZCA+IDAuMSkge1xyXG4gICAgICBpZih0aGlzLnBvaW50c0F0ICE9PSBmYWxzZSkge1xyXG4gICAgICAgIGxldCBwb2ludHNBdFggPSBjaGFyUGF0dGVyblBhcnRpY2xlc1tpbmRleCArIHRoaXMucG9pbnRzQXRdLmNvb3Jkcy54Ly90aGVzZSB0d28gbGluZXMgYXJlIGZ1Y2tpbmcgdGhpbmdzIHNvbWVob3cgZGVsZXRpbmcgdGhlIGxhc3QgcGFydGljbGUgaW4gdGhlIGNoYXIgSSB0aGlua1xyXG4gICAgICAgIGxldCBwb2ludHNBdFkgPSBjaGFyUGF0dGVyblBhcnRpY2xlc1tpbmRleCArIHRoaXMucG9pbnRzQXRdLmNvb3Jkcy55XHJcbiAgICAgICAgY3R4MS5iZWdpblBhdGgoKVxyXG4gICAgICAgIGN0eDEubGluZVdpZHRoID0gMlxyXG4gICAgICAgIGxldCByZ2IgPSBjYW52YXNIZWxwZXJzLmNvbG9yQmV0d2VlblR3b0NvbG9ycyh0aGlzLmRpc3RNb3ZlZCwgJyMxZjI2MzMnLCAnI2ZmMDAwMCcpXHJcbiAgICAgICAgY3R4MS5zdHJva2VTdHlsZSA9IGByZ2IoJHtyZ2Iucn0sICR7cmdiLmd9LCAke3JnYi5ifSlgXHJcbiAgICAgICAgLy9jdHgxLnN0cm9rZVN0eWxlID0gdGhpcy5kaXN0TW92ZWQgPCAxID8gY29sb3JGcm9tIDogY29sb3JUb1xyXG4gICAgICAgIGN0eDEubW92ZVRvKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnkpXHJcbiAgICAgICAgY3R4MS5saW5lVG8ocG9pbnRzQXRYLCBwb2ludHNBdFkpXHJcbiAgICAgICAgY3R4MS5zdHJva2UoKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTUlTQyBIRUxQRVJTXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLU1BVEggSEVMUEVSU1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUdFT01FVFJZIEhFTFBFUlNcclxuZnVuY3Rpb24gcmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhwMSwgcDIpIHtcclxuICBjb25zdCBNSU5fRElTVCA9IDQwXHJcbiAgY29uc3QgRElTVF9NT0QgPSAwLjVcclxuICBjb25zdCBBTkdMRV9XSVRISU4gPSBNYXRoLlBJXHJcbiAgbGV0IGEgPSBwMi54IC0gcDEueFxyXG4gIGxldCBiID0gcDIueSAtIHAxLnlcclxuICBsZXQgcDFQMkRpc3QgPSBNYXRoLnNxcnQoYSphICsgYipiKVxyXG4gIGxldCByYW5kRGlzdCA9IChNYXRoLnJhbmRvbSgpICogcDFQMkRpc3QgKiBESVNUX01PRCkgKyBNSU5fRElTVFxyXG4gIGxldCBhbmdsZU1vZCA9IChNYXRoLnJhbmRvbSgpICogQU5HTEVfV0lUSElOKSAtIChBTkdMRV9XSVRISU4gLyAyKVxyXG4gIGxldCByYW5kQW5nbGVcclxuICBsZXQgY29vcmRzID0ge3g6IG51bGwsIHk6IG51bGx9XHJcblxyXG4gIGlmKE1hdGgucmFuZG9tKCkgPj0gMC41KSB7XHJcbiAgICByYW5kQW5nbGUgPSBNYXRoLmF0YW4yKHAyLnkgLSBwMS55LCBwMS54IC0gcDIueCkgKyBhbmdsZU1vZFxyXG4gICAgY29vcmRzLnggPSBwMi54ICsgTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgICBjb29yZHMueSA9IHAyLnkgLSBNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICB9IGVsc2Uge1xyXG4gICAgcmFuZEFuZ2xlID0gTWF0aC5hdGFuMihwMS55IC0gcDIueSwgcDIueCAtIHAxLngpICsgYW5nbGVNb2RcclxuICAgIGNvb3Jkcy54ID0gcDEueCArIE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gICAgY29vcmRzLnkgPSBwMS55IC0gTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgfVxyXG5cclxuICByZXR1cm4gY29vcmRzXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiByYW5kUG9pbnROZWFyUG9pbnQocHQpIHtcclxuICBjb25zdCBNQVhfRlJPTSA9IDQwXHJcbiAgbGV0IHJhbmREaXN0ID0gTWF0aC5yYW5kb20oKSAqIE1BWF9GUk9NXHJcbiAgbGV0IHJhbmRBbmdsZSA9IE1hdGgucmFuZG9tKCkgKiBNYXRoLlBJICogMlxyXG4gIGxldCB4ID0gcHQueCArIE1hdGgucm91bmQoTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0KVxyXG4gIGxldCB5ID0gcHQueSArIE1hdGgucm91bmQoTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0KVxyXG5cclxuICByZXR1cm4ge3g6IHgsIHk6IHl9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjb29yZHNPblN0cmFpZ2h0TGluZShwZXJjZW50LCBzdGFydFB0LCBlbmRQdCkge1xyXG4gIGxldCB4VG90YWwgPSBlbmRQdC54IC0gc3RhcnRQdC54XHJcbiAgbGV0IHlUb3RhbCA9IGVuZFB0LnkgLSBzdGFydFB0LnlcclxuICBsZXQgeERpc3QgPSBwZXJjZW50ICogeFRvdGFsXHJcbiAgbGV0IHlEaXN0ID0gcGVyY2VudCAqIHlUb3RhbFxyXG5cclxuICByZXR1cm4ge3g6IHN0YXJ0UHQueCArIHhEaXN0LCB5OiBzdGFydFB0LnkgKyB5RGlzdH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNvb3Jkc09uQ3ViaWNCZXppZXIocGVyY2VudCwgc3RhcnRQdCwgY3AxLCBjcDIsIGVuZFB0KSB7Ly9zdG9sZW4gZnJvbSBzdGFja292ZXJmbG93XHJcbiAgbGV0IHQyID0gcGVyY2VudCAqIHBlcmNlbnRcclxuICBsZXQgdDMgPSB0MiAqIHBlcmNlbnRcclxuXHJcbiAgcmV0dXJuIHN0YXJ0UHQgKyAoLXN0YXJ0UHQgKiAzICsgcGVyY2VudCAqICgzICogc3RhcnRQdCAtIHN0YXJ0UHQgKiBwZXJjZW50KSkgKiBwZXJjZW50XHJcbiAgKyAoMyAqIGNwMSArIHBlcmNlbnQgKiAoLTYgKiBjcDEgKyBjcDEgKiAzICogcGVyY2VudCkpICogcGVyY2VudFxyXG4gICsgKGNwMiAqIDMgLSBjcDIgKiAzICogcGVyY2VudCkgKiB0MlxyXG4gICsgZW5kUHQgKiB0M1xyXG59XHJcblxyXG5cclxuLy8tLUZVTkNUSU9OUyBUTyBSRU5ERVIgV0FZUE9JTlRTLCBDT05UUk9MIFBPSU5UUywgRVRDIFVTRUQgSU4gUEFSVElDTEUgQ1JFQVRJT05cclxuLy9OT1QgTkVDRVNTQVJJTFkgVVNFRCBCVVQgVVNFRlVMIEZPUiBERUJVR0dJTkdcclxuZnVuY3Rpb24gcmVuZGVyQm91bmRpbmdDaXJjbGUoY3R4LCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KSB7XHJcbiAgbGV0IGNlbnRlclggPSBjYW52YXNXaWR0aCAvIDJcclxuICBsZXQgY2VudGVyWSA9IGNhbnZhc0hlaWdodCAvIDJcclxuICBsZXQgcmFkaXVzID0gY2VudGVyWSA+IGNlbnRlclggPyBjZW50ZXJYIC0gMiA6IGNlbnRlclkgLSAyXHJcbiAgbGV0IHN0YXJ0QW5nbGUgPSAwXHJcbiAgbGV0IGVuZEFuZ2xlID0gMiAqIE1hdGguUElcclxuICBjdHgubGluZVdpZHRoID0gMVxyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICdncmV5J1xyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5hcmMoY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSlcclxuICBjdHguc3Ryb2tlKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckhvbGRQYXR0ZXJuV1BzKGN0eCwgd2F5cG9pbnRzKSB7XHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LmZpbGxTdHlsZSA9ICdibHVlJ1xyXG4gIHdheXBvaW50cy5mb3JFYWNoKHdwID0+IHtcclxuICAgIGN0eC5maWxsUmVjdCh3cC54IC0gNCwgd3AueSAtIDQsIDgsIDgpXHJcbiAgfSlcclxuICBjdHguc3Ryb2tlKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckhvbGRQYXR0ZXJuUGFydGljbGVQYXRocyhjdHgsIHBhcnRpY2xlcykge1xyXG4gIHBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcclxuICAgIGxldCBjcDFYID0gcGFydGljbGUuY29vcmRzLmNwMXhcclxuICAgIGxldCBjcDFZID0gcGFydGljbGUuY29vcmRzLmNwMXlcclxuICAgIGxldCBjcDJYID0gcGFydGljbGUuY29vcmRzLmNwMnhcclxuICAgIGxldCBjcDJZID0gcGFydGljbGUuY29vcmRzLmNwMnlcclxuICAgIGxldCBzdGFydFggPSBwYXJ0aWNsZS5jb29yZHMueDBcclxuICAgIGxldCBzdGFydFkgPSBwYXJ0aWNsZS5jb29yZHMueTBcclxuICAgIGxldCBlbmRYID0gcGFydGljbGUuY29vcmRzLngxXHJcbiAgICBsZXQgZW5kWSA9IHBhcnRpY2xlLmNvb3Jkcy55MVxyXG4gICAgY3R4LmxpbmVXaWR0aCA9IDFcclxuICAgIC8vcmVuZGVyIHN0YXJ0IHBvaW50XHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmVlbidcclxuICAgIGN0eC5yZWN0KHN0YXJ0WCAtIDIsIHN0YXJ0WSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIGVuZCBwb2ludFxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3JlZCdcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnJlY3QoZW5kWCAtIDIsIGVuZFkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBjb250cm9sIHBvaW50IDFcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3llbGxvdydcclxuICAgIGN0eC5yZWN0KGNwMVggLSAyLCBjcDFZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAyXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdvcmFuZ2UnXHJcbiAgICBjdHgucmVjdChjcDJYIC0gMiwgY3AyWSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIHBhdGhcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZXknXHJcbiAgICBjdHgubW92ZVRvKHN0YXJ0WCwgc3RhcnRZKVxyXG4gICAgY3R4LmJlemllckN1cnZlVG8oY3AxWCwgY3AxWSwgY3AyWCwgY3AyWSwgZW5kWCwgZW5kWSlcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gIH0pXHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQ09MT1IgSEVMUEVSU1xyXG4vL3dvdWxkIGJlIG1vcmUgZWZmaWNpZW50IHRvIHRha2UgYXJncyBhcyB7cjogMC0yNTUsIGc6IDAtMjU1LCBiOjAtMjU1fVxyXG4vL3NvIG5vIG5lZWQgdGhlIGhleCBhcnJheSBzdHVmZiBidXQgb2sgZm9yIG5vdyBhcyBkcmF3aW5nXHJcbi8vYSBmZXcgaHVuZHJlZCBwYXJ0aWNsZXMgd2l0aG91dCBsYWdcclxuZnVuY3Rpb24gY29sb3JCZXR3ZWVuVHdvQ29sb3JzKHBlcmNlbnQsIGNvbG9yT25lLCBjb2xvclR3bykge1xyXG4gIGxldCBoZXggPSBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnXVxyXG5cclxuICAvL2NvbG9yT25lXHJcbiAgbGV0IGMxUmVkSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCgxKSApXHJcbiAgbGV0IGMxUmVkSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCgyKSApXHJcbiAgbGV0IGMxUmVkQmFzZVRlbiA9IChjMVJlZEluZGV4MCAqIDE2KSArIChjMVJlZEluZGV4MSlcclxuXHJcbiAgbGV0IGMxR3JlZW5JbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDMpIClcclxuICBsZXQgYzFHcmVlbkluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoNCkgKVxyXG4gIGxldCBjMUdyZWVuZEJhc2VUZW4gPSAoYzFHcmVlbkluZGV4MCAqIDE2KSArIChjMUdyZWVuSW5kZXgxKVxyXG5cclxuICBsZXQgYzFCbHVlSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCg1KSApXHJcbiAgbGV0IGMxQmx1ZUluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoNikgKVxyXG4gIGxldCBjMUJsdWVCYXNlVGVuID0gKGMxQmx1ZUluZGV4MCAqIDE2KSArIChjMUJsdWVJbmRleDEpXHJcblxyXG4gIC8vY29sb3JUd29cclxuICBsZXQgYzJSZWRJbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDEpIClcclxuICBsZXQgYzJSZWRJbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDIpIClcclxuICBsZXQgYzJSZWRCYXNlVGVuID0gKGMyUmVkSW5kZXgwICogMTYpICsgKGMyUmVkSW5kZXgxKVxyXG5cclxuICBsZXQgYzJHcmVlbkluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoMykgKVxyXG4gIGxldCBjMkdyZWVuSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCg0KSApXHJcbiAgbGV0IGMyR3JlZW5kQmFzZVRlbiA9IChjMkdyZWVuSW5kZXgwICogMTYpICsgKGMyR3JlZW5JbmRleDEpXHJcblxyXG4gIGxldCBjMkJsdWVJbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDUpIClcclxuICBsZXQgYzJCbHVlSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCg2KSApXHJcbiAgbGV0IGMyQmx1ZUJhc2VUZW4gPSAoYzJCbHVlSW5kZXgwICogMTYpICsgKGMyQmx1ZUluZGV4MSlcclxuXHJcbiAgbGV0IHJlZERlbHRhID0gYzJSZWRCYXNlVGVuIC0gYzFSZWRCYXNlVGVuXHJcbiAgbGV0IGdyZWVuRGVsdGEgPSBjMkdyZWVuZEJhc2VUZW4gLSBjMUdyZWVuZEJhc2VUZW5cclxuICBsZXQgYmx1ZURlbHRhID0gYzJCbHVlQmFzZVRlbiAtIGMxQmx1ZUJhc2VUZW5cclxuXHJcbiAgbGV0IHJlZE5vdyA9IE1hdGgucm91bmQoIGMxUmVkQmFzZVRlbiArIChyZWREZWx0YSAqIHBlcmNlbnQpIClcclxuICBsZXQgZ3JlZW5Ob3cgPSBNYXRoLnJvdW5kKCBjMUdyZWVuZEJhc2VUZW4gKyAoZ3JlZW5EZWx0YSAqIHBlcmNlbnQpIClcclxuICBsZXQgYmx1ZU5vdyA9IE1hdGgucm91bmQoIGMxQmx1ZUJhc2VUZW4gKyAoYmx1ZURlbHRhICogcGVyY2VudCkgKVxyXG5cclxuICByZXR1cm4ge3I6IHJlZE5vdywgZzogZ3JlZW5Ob3csIGI6IGJsdWVOb3d9Ly90ZW1wXHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVhQT1JUU1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICByYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzLFxyXG4gIHJhbmRQb2ludE5lYXJQb2ludCxcclxuICBjb29yZHNPblN0cmFpZ2h0TGluZSxcclxuICBjb29yZHNPbkN1YmljQmV6aWVyLFxyXG4gIGNvbG9yQmV0d2VlblR3b0NvbG9ycyxcclxuICAvL2RldlxyXG4gIHJlbmRlckJvdW5kaW5nQ2lyY2xlLFxyXG4gIHJlbmRlckhvbGRQYXR0ZXJuV1BzLFxyXG4gIHJlbmRlckhvbGRQYXR0ZXJuUGFydGljbGVQYXRoc1xyXG59XHJcbiIsIi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQ09PUkRTIEFTIFJBVElPIEFORCBWRUNUT1IgUE9JTlQgQVRTXHJcbmxldCBsZXR0ZXJzQ29vcmRzID0ge1xyXG4gIEE6IFtcclxuICAgIHt4OiAwLjEyNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAgLy8xXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0sICAgLy80XHJcbiAgICB7eDogMC44NzUsIHk6IDAuODc1fSAvLzVcclxuICBdLFxyXG4gIEI6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjI1fSwgLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC43NX0gIC8vNFxyXG4gIF0sXHJcbiAgQzogW1xyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjYyNX0sLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4zNzV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSAvLzNcclxuICBdLFxyXG4gIEQ6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sIC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1IH0sLy8xXHJcbiAgICB7eDogMC43NSwgeTogMC4zNzV9LCAvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjYyNX0gIC8vM1xyXG4gIF0sXHJcbiAgRTogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjV9LCAgLy80XHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9IC8vNVxyXG4gIF0sXHJcbiAgRjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjV9ICAgLy80XHJcbiAgXSxcclxuICBHOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNjI1fSwvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjM3NX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNjI1LCB5OiAwLjV9LCAvLzRcclxuICAgIHt4OiAwLjg3NSwgeTogMC41fSAgLy81XHJcbiAgXSxcclxuICBIOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0sICAvLzRcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0gLy81XHJcbiAgXSxcclxuICBJOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuNSwgeTogMC44NzV9LCAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8yXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNSwgeTogMC4xMjV9LCAvLzRcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0gLy81XHJcbiAgXSxcclxuICBKOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC43NX0sXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjUsIHk6IDAuNzV9LFxyXG4gICAge3g6IDAuNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIEs6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9XHJcbiAgXSxcclxuICBMOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIE06IFtcclxuICAgIHt4OiAwLjEyNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjUsIHk6IDAuNzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjg3NSwgeTogMC44NzV9XHJcbiAgXSxcclxuICBOOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9XHJcbiAgXSxcclxuICBPOiBbXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjEyNSwgeTogMC42MjV9LFxyXG4gICAge3g6IDAuMTI1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuNjI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC44NzV9XHJcbiAgXSxcclxuICBQOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4yNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4zNzV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjV9XHJcbiAgXSxcclxuICBROiBbXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjEyNSwgeTogMC42MjV9LFxyXG4gICAge3g6IDAuMTI1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuNjI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjYyNX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuODc1fVxyXG4gIF0sXHJcbiAgUjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMzc1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC41fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX1cclxuICBdLFxyXG4gIFM6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjc1fSwgIC8vMFxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjg3NX0sLy8xXHJcbiAgICB7eDogMC42MjUsIHk6IDAuODc1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjc1fSwgIC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNjI1fSwgLy80XHJcbiAgICB7eDogMC42MjUsIHk6IDAuNX0sICAvLzVcclxuICAgIHt4OiAwLjM3NSwgeTogMC41fSwgIC8vNlxyXG4gICAge3g6IDAuMjUsIHk6IDAuMzc1fSwgLy83XHJcbiAgICB7eDogMC4yNSwgeTogMC4yNX0sICAvLzhcclxuICAgIHt4OiAwLjM3NSwgeTogMC4xMjV9LC8vOVxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sLy8xMFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9ICAgLy8xMVxyXG4gIF0sXHJcbiAgVDogW1xyXG4gICAge3g6IDAuNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIFU6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC43NX0sXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuNzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTIyNX1cclxuICBdLFxyXG4gIFwiIFwiOiBbXS8vZW5hYmxlcyBoYXZpbmcgc3BhY2VzIGJldHdlZW4gbGV0dGVyc1xyXG59XHJcblxyXG5cclxubGV0IGxldHRlcnNWZWN0b3JzID0ge1xyXG4gIEE6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgQjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0yfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtNH1cclxuICBdLFxyXG4gIEM6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgRDogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0zfVxyXG4gIF0sXHJcbiAgRTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC01fVxyXG4gIF0sXHJcbiAgRjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBHOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTV9XHJcbiAgXSxcclxuICBIOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIEk6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgSjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBLOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTN9XHJcbiAgXSxcclxuICBMOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIE06IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgTjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBPOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTd9XHJcbiAgXSxcclxuICBQOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTV9XHJcbiAgXSxcclxuICBROiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTd9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBSOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTV9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0xfVxyXG4gIF0sXHJcbiAgUzogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBUOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIFU6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF1cclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVhQT1JURUQgRlVOQ1RJT05TXHJcbmZ1bmN0aW9uIHRvdGFsUmVxdWlyZWRQYXJ0aWNsZXMoc3RyKSB7XHJcbiAgbGV0IHJlcXVpcmVkUGFydGljbGVzID0gMFxyXG5cclxuICBmb3IoaSBpbiBzdHIpIHtcclxuICAgIHJlcXVpcmVkUGFydGljbGVzICs9IGxldHRlcnNDb29yZHNbc3RyLmNoYXJBdChpKV0ubGVuZ3RoXHJcbiAgfVxyXG5cclxuICBjb25zb2xlLmxvZyhcInRvdGFsIHJlcXVpcmVkUGFydGljbGVzOiBcIiArIHJlcXVpcmVkUGFydGljbGVzKVxyXG4gIHJldHVybiByZXF1aXJlZFBhcnRpY2xlc1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcGxhY2VXb3Jkc0luUm93cyhzdHIsIG1heENoYXJzSW5Sb3cpIHtcclxuICBsZXQgd29yZHMgPSBzdHIuc3BsaXQoXCIgXCIpXHJcbiAgbGV0IHJvd3MgPSBbXCJcIl1cclxuICBsZXQgcm93c0luZGV4ID0gMFxyXG5cclxuICB3b3Jkcy5mb3JFYWNoKCh3b3JkLCBpbmRleCkgPT4ge1xyXG4gICAgaWYocm93c1tyb3dzSW5kZXhdLmxlbmd0aCArIHdvcmQubGVuZ3RoICsgMSA8PSBtYXhDaGFyc0luUm93KSB7XHJcbiAgICAgIHJvd3Nbcm93c0luZGV4XSA9IGluZGV4ID09PSAwID8gcm93c1tyb3dzSW5kZXhdICsgd29yZCA6IHJvd3Nbcm93c0luZGV4XSArIFwiIFwiICsgd29yZFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcm93cy5wdXNoKHdvcmQpXHJcbiAgICAgIHJvd3NJbmRleCsrXHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIHJvd3NcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNhbGNMZXR0ZXJQYXJ0aWNsZXNEZXN0QW5kVGFyZ2V0cyh3b3Jkc0luUm93cywgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkge1xyXG4gIGxldCBjaGFyV2lkdGggPSBNYXRoLnJvdW5kKCBjYW52YXNXaWR0aCAvIChsb25nZXN0RWxlbWVudExlbmd0aCh3b3Jkc0luUm93cykgKyAyKSApXHJcbiAgbGV0IGNoYXJIZWlnaHQgPSBNYXRoLnJvdW5kKGNoYXJXaWR0aCAqIDEuMilcclxuICBsZXQgdG90YWxSb3dzSGVpZ2h0ID0gY2hhckhlaWdodCAqICh3b3Jkc0luUm93cy5sZW5ndGggKyAxKVxyXG4gIGxldCBmaW5hbENvb3Jkc0FuZFBvaW50c0F0cyA9IFtdXHJcblxyXG4gIGZvcihsZXQgcm93IGluIHdvcmRzSW5Sb3dzKSB7XHJcbiAgICBsZXQgcm93U3RhcnRYID0gKGNhbnZhc1dpZHRoIC8gMikgLSAod29yZHNJblJvd3Nbcm93XS5sZW5ndGggKiBjaGFyV2lkdGggLyAyKVxyXG4gICAgbGV0IHJvd1N0YXJ0WSA9IChjYW52YXNIZWlnaHQgLyAyKSAtICh0b3RhbFJvd3NIZWlnaHQgLyAyKSArIChyb3cgKiBjaGFySGVpZ2h0KVxyXG5cclxuICAgIGZvcihsZXQgbGV0dGVyUG9zID0gMDsgbGV0dGVyUG9zIDwgd29yZHNJblJvd3Nbcm93XS5sZW5ndGg7IGxldHRlclBvcysrKSB7XHJcbiAgICAgIGxldCBjaGFySGVyZSA9IHdvcmRzSW5Sb3dzW3Jvd10uY2hhckF0KGxldHRlclBvcylcclxuICAgICAgbGV0IG5DaGFyUGFydGljbGVzID0gbGV0dGVyc0Nvb3Jkc1tjaGFySGVyZV0ubGVuZ3RoXHJcblxyXG4gICAgICBmb3IobGV0IHBvc0luQ2hhciA9IDA7IHBvc0luQ2hhciA8IG5DaGFyUGFydGljbGVzOyBwb3NJbkNoYXIrKykge1xyXG4gICAgICAgIGxldCB4MSA9IHJvd1N0YXJ0WCArIChsZXR0ZXJQb3MgKiBjaGFyV2lkdGgpICsgKGNoYXJXaWR0aCAqIGxldHRlcnNDb29yZHNbY2hhckhlcmVdW3Bvc0luQ2hhcl0ueClcclxuICAgICAgICBsZXQgeTEgPSByb3dTdGFydFkgKyAoY2hhckhlaWdodCAqIGxldHRlcnNDb29yZHNbY2hhckhlcmVdW3Bvc0luQ2hhcl0ueSlcclxuICAgICAgICBsZXQgcG9pbnRzQXQgPSBmYWxzZVxyXG5cclxuICAgICAgICBpZihsZXR0ZXJzVmVjdG9yc1tjaGFySGVyZV1bcG9zSW5DaGFyXS5oYXNWZWN0b3IgPT09IHRydWUpIHtcclxuICAgICAgICAgIHBvaW50c0F0ID0gbGV0dGVyc1ZlY3RvcnNbY2hhckhlcmVdW3Bvc0luQ2hhcl0uaW5kZXhPZmZzZXRcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZpbmFsQ29vcmRzQW5kUG9pbnRzQXRzLnB1c2goe3gxOiB4MSwgeTE6IHkxLCBwb2ludHNBdDogcG9pbnRzQXR9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmluYWxDb29yZHNBbmRQb2ludHNBdHNcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tSU5URVJOQUwgRlVOQ1RJT05TXHJcbmZ1bmN0aW9uIGxvbmdlc3RFbGVtZW50TGVuZ3RoKGFycikge1xyXG4gIGxldCBsZW5ndGggPSAwXHJcbiAgYXJyLmZvckVhY2goZWwgPT4ge1xyXG4gICAgbGVuZ3RoID0gZWwubGVuZ3RoID49IGxlbmd0aCA/IGVsLmxlbmd0aCA6IGxlbmd0aFxyXG4gIH0pXHJcbiAgcmV0dXJuIGxlbmd0aFxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVYUE9SVFNcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgcGxhY2VXb3Jkc0luUm93cyxcclxuICB0b3RhbFJlcXVpcmVkUGFydGljbGVzLFxyXG4gIGNhbGNMZXR0ZXJQYXJ0aWNsZXNEZXN0QW5kVGFyZ2V0c1xyXG59XHJcbiJdfQ==
