(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const canvasHelpers = require('./utils/canvas-helpers.js')
const lettersLib = require('./utils/letters-lib.js')

const CHAR_PATTERN_WORDS = 'A BB CCC DDDD K AAK KLM L M'//for now defined staticly here, later will come from caurosel
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
        ctx1.lineWidth = 1
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2FudmFzLWhlbHBlcnMuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9sZXR0ZXJzLWxpYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgY2FudmFzSGVscGVycyA9IHJlcXVpcmUoJy4vdXRpbHMvY2FudmFzLWhlbHBlcnMuanMnKVxyXG5jb25zdCBsZXR0ZXJzTGliID0gcmVxdWlyZSgnLi91dGlscy9sZXR0ZXJzLWxpYi5qcycpXHJcblxyXG5jb25zdCBDSEFSX1BBVFRFUk5fV09SRFMgPSAnQSBCQiBDQ0MgRERERCBLIEFBSyBLTE0gTCBNJy8vZm9yIG5vdyBkZWZpbmVkIHN0YXRpY2x5IGhlcmUsIGxhdGVyIHdpbGwgY29tZSBmcm9tIGNhdXJvc2VsXHJcbmNvbnN0IE1BWF9DSEFSU19QRVJfUk9XID0gMTJcclxuY29uc3QgVE9UQUxfUEFSVElDTEVTID0gMjAwXHJcbmNvbnN0IEhPTERfUEFUVEVSTl9XQVlQT0lOVFMgPSBbLy9jb29yZHMgYXMgJSBvZiBjYW52YXMgc2l6ZVxyXG4gIHt4OiAwLjEyNSwgeTogMC41fSxcclxuICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gIHt4OiAwLjc1LCB5OiAwLjEyNX0sXHJcbiAge3g6IDAuODc1LCB5OiAwLjV9LFxyXG4gIHt4OiAwLjc1LCB5OiAwLjg3NX0sXHJcbiAge3g6IDAuMjUsIHk6IDAuODc1fVxyXG5dXHJcblxyXG5sZXQgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF1cclxubGV0IGNhbnZhczEgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY2FudmFzJylbMF1cclxubGV0IGN0eDEgPSBjYW52YXMxLmdldENvbnRleHQoJzJkJylcclxubGV0IG5hdkdvVG9CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yRGVzYycpLy9kZXZcclxubGV0IGZyYW1lSWRcclxubGV0IGNhbnZhc1dpZHRoXHJcbmxldCBjYW52YXNIZWlnaHRcclxubGV0IGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsID0gW10vL2Nvb3JkcyBpbiBwaXhlbHMsIHJlY2FsY3VsYXRlZCBvbiByZXNpemVcclxubGV0IGhvbGRQYXR0ZXJuUGFydGljbGVzID0gW11cclxubGV0IGNoYXJQYXR0ZXJuUGFydGljbGVzID0gW11cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVWRU5UU1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBpbml0KVxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaW5pdClcclxubmF2R29Ub0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhvbGRUb0NoYXJUcmFuc2l0aW9uLCBmYWxzZSlcclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUZMT1cgQ09OVFJPTCAmIElOSVRJQUxJWkVSU1xyXG5mdW5jdGlvbiBpbml0KCkge1xyXG4gIHJlc2V0KClcclxuICBzZXRMYXlvdXQoKVxyXG4gIGNhbGNIb2xkUGF0dGVybldheXBvaW50Q29vcmRzKClcclxuICBpbml0SG9sZFBhdHRlcm5QYXJ0aWNsZXMoVE9UQUxfUEFSVElDTEVTKVxyXG4gIGFuaW1hdGUoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmVzZXQoKSB7XHJcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVJZClcclxuICBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbC5sZW5ndGggPSAwXHJcbiAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMubGVuZ3RoID0gMFxyXG4gIGNoYXJQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA9IDBcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNhbGNIb2xkUGF0dGVybldheXBvaW50Q29vcmRzKCkge1xyXG4gIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsID0gSE9MRF9QQVRURVJOX1dBWVBPSU5UUy5tYXAoZWwgPT4ge1xyXG4gICAgcmV0dXJuIHt4OiBlbC54ICogY2FudmFzV2lkdGgsIHk6IGVsLnkgKiBjYW52YXNIZWlnaHR9XHJcbiAgfSlcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGluaXRIb2xkUGF0dGVyblBhcnRpY2xlcyhuUGFydGljbGVzKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IG5QYXJ0aWNsZXM7IGkrKykge1xyXG4gICAgY29uc3QgU1BFRUQgPSAwLjAwMjVcclxuICAgIGxldCBmcm9tV1AgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2KVxyXG4gICAgbGV0IG5leHRXUCA9IGZyb21XUCArIDEgPT09IEhPTERfUEFUVEVSTl9XQVlQT0lOVFMubGVuZ3RoID8gMCA6IGZyb21XUCArIDFcclxuICAgIGxldCBkaXN0TW92ZWQgPSBNYXRoLnJvdW5kKCBNYXRoLnJhbmRvbSgpICogMTAgKSAvIDEwXHJcbiAgICBsZXQgc3RhcnRDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFtmcm9tV1BdKVxyXG4gICAgbGV0IGVuZENvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW25leHRXUF0pXHJcbiAgICBsZXQgY3AxQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHN0YXJ0Q29vcmRzLCBlbmRDb29yZHMpXHJcbiAgICBsZXQgY3AyQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHN0YXJ0Q29vcmRzLCBlbmRDb29yZHMpXHJcbiAgICBsZXQgY29vcmRzID0ge1xyXG4gICAgICB4OiBzdGFydENvb3Jkcy54LCB5OiBzdGFydENvb3Jkcy55LFxyXG4gICAgICB4MDogc3RhcnRDb29yZHMueCwgeTA6IHN0YXJ0Q29vcmRzLnksXHJcbiAgICAgIHgxOiBlbmRDb29yZHMueCwgeTE6IGVuZENvb3Jkcy55LFxyXG4gICAgICBjcDF4OiBjcDFDb29yZHMueCwgY3AxeTogY3AxQ29vcmRzLnksXHJcbiAgICAgIGNwMng6IGNwMkNvb3Jkcy54LCBjcDJ5OiBjcDJDb29yZHMueVxyXG4gICAgfVxyXG5cclxuICAgIGhvbGRQYXR0ZXJuUGFydGljbGVzLnB1c2gobmV3IEhvbGRQYXR0ZXJuUGFydGljbGUoY29vcmRzLCBTUEVFRCwgZGlzdE1vdmVkLCBuZXh0V1ApKVxyXG4gIH1cclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVRSQU5TSVRJT04gUEFSVElDTEVTIEJFVFdFRU4gQkVIQVZJT1VSIFRZUEVTXHJcbmZ1bmN0aW9uIGhvbGRUb0NoYXJUcmFuc2l0aW9uKCkge1xyXG4gIGxldCByZXF1aXJlZFBhcnRpY2xlcyA9IGxldHRlcnNMaWIudG90YWxSZXF1aXJlZFBhcnRpY2xlcyhDSEFSX1BBVFRFUk5fV09SRFMpXHJcbiAgbGV0IHdvcmRzSW5Sb3dzID0gbGV0dGVyc0xpYi5wbGFjZVdvcmRzSW5Sb3dzKENIQVJfUEFUVEVSTl9XT1JEUywgTUFYX0NIQVJTX1BFUl9ST1cpXHJcbiAgbGV0IGRlc3RpbmF0aW9uc0FuZFRhcmdldHMgPSBsZXR0ZXJzTGliLmNhbGNMZXR0ZXJQYXJ0aWNsZXNEZXN0QW5kVGFyZ2V0cyh3b3Jkc0luUm93cywgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodClcclxuXHJcbiAgaWYgKGhvbGRQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA+IHJlcXVpcmVkUGFydGljbGVzKSB7XHJcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgcmVxdWlyZWRQYXJ0aWNsZXM7IGkrKykge1xyXG4gICAgICBsZXQgdHJhbnNmZXJyaW5nUGFydGljbGUgPSBob2xkUGF0dGVyblBhcnRpY2xlcy5wb3AoKVxyXG4gICAgICBsZXQgY29vcmRzID0ge1xyXG4gICAgICAgIHg6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy54LFxyXG4gICAgICAgIHk6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy55LFxyXG4gICAgICAgIHgwOiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueCxcclxuICAgICAgICB5MDogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLnksXHJcbiAgICAgICAgeDE6IGRlc3RpbmF0aW9uc0FuZFRhcmdldHNbaV0ueDEsXHJcbiAgICAgICAgeTE6IGRlc3RpbmF0aW9uc0FuZFRhcmdldHNbaV0ueTFcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHNwZWVkID0gdHJhbnNmZXJyaW5nUGFydGljbGUuc3BlZWRcclxuICAgICAgbGV0IGRpc3RNb3ZlZCA9IDBcclxuICAgICAgbGV0IHBvaW50c0F0ID0gZGVzdGluYXRpb25zQW5kVGFyZ2V0c1tpXS5wb2ludHNBdFxyXG4gICAgICBjaGFyUGF0dGVyblBhcnRpY2xlcy5wdXNoKG5ldyBDaGFyUGF0dGVyblBhcnRpY2xlKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZCwgcG9pbnRzQXQpKVxyXG4gICAgfVxyXG5cclxuICB9XHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tVVBEQVRFIFBBUlRJQ0xFIFBPU0lUSU9OUyAmIFJFTkRFUlxyXG5mdW5jdGlvbiBhbmltYXRlKCkge1xyXG4gIGZyYW1lSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSlcclxuICBjdHgxLmNsZWFyUmVjdCgwLCAwLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KVxyXG4gIC8vY2FudmFzSGVscGVycy5yZW5kZXJCb3VuZGluZ0NpcmNsZShjdHgxLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KS8vZGV2XHJcbiAgLy9jYW52YXNIZWxwZXJzLnJlbmRlckhvbGRQYXR0ZXJuV1BzKGN0eDEsIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKS8vZGV2XHJcbiAgLy9jYW52YXNIZWxwZXJzLnJlbmRlckhvbGRQYXR0ZXJuUGFydGljbGVQYXRocyhjdHgxLCBob2xkUGF0dGVyblBhcnRpY2xlcykvL2RldlxyXG4gIHVwZGF0ZUhvbGRQYXR0ZXJuUGFydGljbGVzKClcclxuICB1cGRhdGVDaGFyUGF0dGVyblBhcnRpY2xlcygpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiB1cGRhdGVIb2xkUGF0dGVyblBhcnRpY2xlcygpIHtcclxuICBob2xkUGF0dGVyblBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHsvL3RoaW5rIHRoaXMgc2hvdWxkIGJlIG1vdmVkIHRvIGEgbWV0aG9kIG9uIGhvbGRQYXJ0aWNsZSBjbGFzcz8/XHJcbiAgICBwYXJ0aWNsZS51cGRhdGVQb3MoKVxyXG4gICAgcGFydGljbGUuZHJhdygnd2hpdGUnKVxyXG4gIH0pXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiB1cGRhdGVDaGFyUGF0dGVyblBhcnRpY2xlcygpIHtcclxuICBjaGFyUGF0dGVyblBhcnRpY2xlcy5mb3JFYWNoKChwYXJ0aWNsZSwgaW5kZXgpID0+IHtcclxuICAgIHBhcnRpY2xlLnVwZGF0ZVBvcygpXHJcbiAgICBwYXJ0aWNsZS5kcmF3KCd3aGl0ZScsICdyZWQnKVxyXG4gICAgcGFydGljbGUuZHJhd1RvUG9pbnRzQXQoaW5kZXgsICcjMWYyNjMzJywgJyNmZjAwMDAnKVxyXG4gIH0pXHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTEFZT1VUIEJSRUFLIFBPSU5UU1xyXG5mdW5jdGlvbiBzZXRMYXlvdXQoKSB7XHJcbiAgLy9zbWFsbCB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA8PSA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IHNtYWxsIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjVcclxuICB9XHJcbiAgLy9zbWFsbCBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA8PSA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IHNtYWxsIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC41XHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuICAvL21lZGl1bSB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA8PSAxMDI0ICYmIGJvZHkuY2xpZW50V2lkdGggPiA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IG1lZGl1bSB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC43XHJcbiAgfVxyXG4gIC8vbWVkaXVtIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0IDw9IDEwMjQgJiYgYm9keS5jbGllbnRIZWlnaHQgPiA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IG1lZGl1bSBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG4gIC8vbGFyZ2Ugd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPiAxMDI0KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBsYXJnZSB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC42NVxyXG4gIH1cclxuICAvL2xhcmdlIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0ID4gMTAyNCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbGFyZ2UgaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjY1XHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuXHJcbiAgY2FudmFzMS53aWR0aCA9IGNhbnZhc1dpZHRoXHJcbiAgY2FudmFzMS5oZWlnaHQgPSBjYW52YXNIZWlnaHRcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1QQVJUSUNMRSBDTEFTU0VTXHJcbmNsYXNzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQpIHtcclxuICAgIHRoaXMuY29vcmRzID0gY29vcmRzXHJcbiAgICB0aGlzLnNwZWVkID0gc3BlZWRcclxuICAgIHRoaXMuZGlzdE1vdmVkID0gZGlzdE1vdmVkXHJcbiAgfVxyXG5cclxuICBkcmF3KGNvbG9yKSB7Ly9kZWZhdWx0IHNlbGYgcmVuZGVyIGZvciBwYXJ0aWNsZXMsIG1heWJlIGNoYW5nZSBsYXRlclxyXG4gICAgY3R4MS5iZWdpblBhdGgoKVxyXG4gICAgY3R4MS5saW5lV2lkdGggPSAzXHJcbiAgICBjdHgxLnN0cm9rZVN0eWxlID0gY29sb3JcclxuICAgIGN0eDEuZmlsbFN0eWxlID0gJ2JsYWNrJ1xyXG4gICAgY3R4MS5hcmModGhpcy5jb29yZHMueCwgdGhpcy5jb29yZHMueSwgMywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKVxyXG4gICAgY3R4MS5zdHJva2UoKVxyXG4gICAgY3R4MS5maWxsKClcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvcygpIHtcclxuICAgIHRoaXMuY29vcmRzLnggKz0gdGhpcy5zcGVlZFxyXG4gICAgdGhpcy5jb29yZHMueSArPSB0aGlzLnNwZWVkXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBIb2xkUGF0dGVyblBhcnRpY2xlIGV4dGVuZHMgUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZCwgbmV4dFdQKSB7XHJcbiAgICBzdXBlcihjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQpXHJcbiAgICB0aGlzLm5leHRXUCA9IG5leHRXUFxyXG4gIH1cclxuXHJcbiAgdXBkYXRlUG9zKCkge1xyXG4gICAgdGhpcy5kaXN0TW92ZWQgKz0gdGhpcy5zcGVlZFxyXG4gICAgaWYodGhpcy5kaXN0TW92ZWQgPj0gMSkge1xyXG4gICAgICB0aGlzLmRpc3RNb3ZlZCA9IDBcclxuICAgICAgdGhpcy5uZXh0V1AgPSB0aGlzLm5leHRXUCA9PT0gSE9MRF9QQVRURVJOX1dBWVBPSU5UUy5sZW5ndGggLSAxID8gMCA6IHRoaXMubmV4dFdQICsgMVxyXG4gICAgICB0aGlzLmNvb3Jkcy54MCA9IHRoaXMuY29vcmRzLngxXHJcbiAgICAgIHRoaXMuY29vcmRzLnkwID0gdGhpcy5jb29yZHMueTFcclxuICAgICAgdGhpcy5jb29yZHMueDEgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFt0aGlzLm5leHRXUF0pLnhcclxuICAgICAgdGhpcy5jb29yZHMueTEgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFt0aGlzLm5leHRXUF0pLnlcclxuICAgICAgdGhpcy5jb29yZHMuY3AxeCA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnhcclxuICAgICAgdGhpcy5jb29yZHMuY3AxeSA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnlcclxuICAgICAgdGhpcy5jb29yZHMuY3AyeCA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnhcclxuICAgICAgdGhpcy5jb29yZHMuY3AyeSA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnlcclxuICAgIH1cclxuICAgIHRoaXMuY29vcmRzLnggPSBjYW52YXNIZWxwZXJzLmNvb3Jkc09uQ3ViaWNCZXppZXIodGhpcy5kaXN0TW92ZWQsIHRoaXMuY29vcmRzLngwLCB0aGlzLmNvb3Jkcy5jcDF4LCB0aGlzLmNvb3Jkcy5jcDJ4LCB0aGlzLmNvb3Jkcy54MSlcclxuICAgIHRoaXMuY29vcmRzLnkgPSBjYW52YXNIZWxwZXJzLmNvb3Jkc09uQ3ViaWNCZXppZXIodGhpcy5kaXN0TW92ZWQsIHRoaXMuY29vcmRzLnkwLCB0aGlzLmNvb3Jkcy5jcDF5LCB0aGlzLmNvb3Jkcy5jcDJ5LCB0aGlzLmNvb3Jkcy55MSlcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIENoYXJQYXR0ZXJuUGFydGljbGUgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkLCBwb2ludHNBdCkge1xyXG4gICAgc3VwZXIoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkKVxyXG4gICAgdGhpcy5wb2ludHNBdCA9IHBvaW50c0F0XHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3MoKSB7XHJcbiAgICB0aGlzLmRpc3RNb3ZlZCArPSB0aGlzLnNwZWVkXHJcbiAgICBpZih0aGlzLmRpc3RNb3ZlZCA8IDEpIHtcclxuICAgICAgbGV0IG5ld1BvcyA9IGNhbnZhc0hlbHBlcnMuY29vcmRzT25TdHJhaWdodExpbmUodGhpcy5kaXN0TW92ZWQsIHt4OiB0aGlzLmNvb3Jkcy54MCwgeTogdGhpcy5jb29yZHMueTB9LCB7eDogdGhpcy5jb29yZHMueDEsIHk6IHRoaXMuY29vcmRzLnkxfSlcclxuICAgICAgdGhpcy5jb29yZHMueCA9IG5ld1Bvcy54XHJcbiAgICAgIHRoaXMuY29vcmRzLnkgPSBuZXdQb3MueVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZHJhdyhjb2xvckZyb20sIGNvbG9yVG8pIHtcclxuICAgIGN0eDEuYmVnaW5QYXRoKClcclxuICAgIGN0eDEubGluZVdpZHRoID0gM1xyXG4gICAgbGV0IHJnYiA9IGNhbnZhc0hlbHBlcnMuY29sb3JCZXR3ZWVuVHdvQ29sb3JzKHRoaXMuZGlzdE1vdmVkLCAnI2ZmZmZmZicsICcjZmYwMDAwJykvL2RldlxyXG4gICAgY3R4MS5zdHJva2VTdHlsZSA9IGByZ2IoJHtyZ2Iucn0sICR7cmdiLmd9LCAke3JnYi5ifSlgXHJcbiAgICAvL2N0eDEuc3Ryb2tlU3R5bGUgPSB0aGlzLmRpc3RNb3ZlZCA8IDEgPyBjb2xvckZyb20gOiBjb2xvclRvLy93cml0ZSBmdW5jdGlvbiB0byB0cmFuc2l0aW9uIGJldHdlZW4gMiBjb2xvdXJzIHRoYXQgdGFrZXMgJSBhcyBhbiBhcmdcclxuICAgIGN0eDEuZmlsbFN0eWxlID0gJ2JsYWNrJ1xyXG4gICAgY3R4MS5hcmModGhpcy5jb29yZHMueCwgdGhpcy5jb29yZHMueSwgMywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKVxyXG4gICAgY3R4MS5zdHJva2UoKVxyXG4gICAgY3R4MS5maWxsKClcclxuICB9XHJcblxyXG4gIGRyYXdUb1BvaW50c0F0KGluZGV4LCBjb2xvckZyb20sIGNvbG9yVG8pIHtcclxuICAgIGlmKHRoaXMuZGlzdE1vdmVkID4gMC4xKSB7XHJcbiAgICAgIGlmKHRoaXMucG9pbnRzQXQgIT09IGZhbHNlKSB7XHJcbiAgICAgICAgbGV0IHBvaW50c0F0WCA9IGNoYXJQYXR0ZXJuUGFydGljbGVzW2luZGV4ICsgdGhpcy5wb2ludHNBdF0uY29vcmRzLngvL3RoZXNlIHR3byBsaW5lcyBhcmUgZnVja2luZyB0aGluZ3Mgc29tZWhvdyBkZWxldGluZyB0aGUgbGFzdCBwYXJ0aWNsZSBpbiB0aGUgY2hhciBJIHRoaW5rXHJcbiAgICAgICAgbGV0IHBvaW50c0F0WSA9IGNoYXJQYXR0ZXJuUGFydGljbGVzW2luZGV4ICsgdGhpcy5wb2ludHNBdF0uY29vcmRzLnlcclxuICAgICAgICBjdHgxLmJlZ2luUGF0aCgpXHJcbiAgICAgICAgY3R4MS5saW5lV2lkdGggPSAxXHJcbiAgICAgICAgbGV0IHJnYiA9IGNhbnZhc0hlbHBlcnMuY29sb3JCZXR3ZWVuVHdvQ29sb3JzKHRoaXMuZGlzdE1vdmVkLCAnIzFmMjYzMycsICcjZmYwMDAwJylcclxuICAgICAgICBjdHgxLnN0cm9rZVN0eWxlID0gYHJnYigke3JnYi5yfSwgJHtyZ2IuZ30sICR7cmdiLmJ9KWBcclxuICAgICAgICAvL2N0eDEuc3Ryb2tlU3R5bGUgPSB0aGlzLmRpc3RNb3ZlZCA8IDEgPyBjb2xvckZyb20gOiBjb2xvclRvXHJcbiAgICAgICAgY3R4MS5tb3ZlVG8odGhpcy5jb29yZHMueCwgdGhpcy5jb29yZHMueSlcclxuICAgICAgICBjdHgxLmxpbmVUbyhwb2ludHNBdFgsIHBvaW50c0F0WSlcclxuICAgICAgICBjdHgxLnN0cm9rZSgpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1NSVNDIEhFTFBFUlNcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTUFUSCBIRUxQRVJTXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tR0VPTUVUUlkgSEVMUEVSU1xyXG5mdW5jdGlvbiByYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHAxLCBwMikge1xyXG4gIGNvbnN0IE1JTl9ESVNUID0gNDBcclxuICBjb25zdCBESVNUX01PRCA9IDAuNVxyXG4gIGNvbnN0IEFOR0xFX1dJVEhJTiA9IE1hdGguUElcclxuICBsZXQgYSA9IHAyLnggLSBwMS54XHJcbiAgbGV0IGIgPSBwMi55IC0gcDEueVxyXG4gIGxldCBwMVAyRGlzdCA9IE1hdGguc3FydChhKmEgKyBiKmIpXHJcbiAgbGV0IHJhbmREaXN0ID0gKE1hdGgucmFuZG9tKCkgKiBwMVAyRGlzdCAqIERJU1RfTU9EKSArIE1JTl9ESVNUXHJcbiAgbGV0IGFuZ2xlTW9kID0gKE1hdGgucmFuZG9tKCkgKiBBTkdMRV9XSVRISU4pIC0gKEFOR0xFX1dJVEhJTiAvIDIpXHJcbiAgbGV0IHJhbmRBbmdsZVxyXG4gIGxldCBjb29yZHMgPSB7eDogbnVsbCwgeTogbnVsbH1cclxuXHJcbiAgaWYoTWF0aC5yYW5kb20oKSA+PSAwLjUpIHtcclxuICAgIHJhbmRBbmdsZSA9IE1hdGguYXRhbjIocDIueSAtIHAxLnksIHAxLnggLSBwMi54KSArIGFuZ2xlTW9kXHJcbiAgICBjb29yZHMueCA9IHAyLnggKyBNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICAgIGNvb3Jkcy55ID0gcDIueSAtIE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gIH0gZWxzZSB7XHJcbiAgICByYW5kQW5nbGUgPSBNYXRoLmF0YW4yKHAxLnkgLSBwMi55LCBwMi54IC0gcDEueCkgKyBhbmdsZU1vZFxyXG4gICAgY29vcmRzLnggPSBwMS54ICsgTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgICBjb29yZHMueSA9IHAxLnkgLSBNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICB9XHJcblxyXG4gIHJldHVybiBjb29yZHNcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJhbmRQb2ludE5lYXJQb2ludChwdCkge1xyXG4gIGNvbnN0IE1BWF9GUk9NID0gNDBcclxuICBsZXQgcmFuZERpc3QgPSBNYXRoLnJhbmRvbSgpICogTUFYX0ZST01cclxuICBsZXQgcmFuZEFuZ2xlID0gTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyXHJcbiAgbGV0IHggPSBwdC54ICsgTWF0aC5yb3VuZChNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3QpXHJcbiAgbGV0IHkgPSBwdC55ICsgTWF0aC5yb3VuZChNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3QpXHJcblxyXG4gIHJldHVybiB7eDogeCwgeTogeX1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNvb3Jkc09uU3RyYWlnaHRMaW5lKHBlcmNlbnQsIHN0YXJ0UHQsIGVuZFB0KSB7XHJcbiAgbGV0IHhUb3RhbCA9IGVuZFB0LnggLSBzdGFydFB0LnhcclxuICBsZXQgeVRvdGFsID0gZW5kUHQueSAtIHN0YXJ0UHQueVxyXG4gIGxldCB4RGlzdCA9IHBlcmNlbnQgKiB4VG90YWxcclxuICBsZXQgeURpc3QgPSBwZXJjZW50ICogeVRvdGFsXHJcblxyXG4gIHJldHVybiB7eDogc3RhcnRQdC54ICsgeERpc3QsIHk6IHN0YXJ0UHQueSArIHlEaXN0fVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY29vcmRzT25DdWJpY0JlemllcihwZXJjZW50LCBzdGFydFB0LCBjcDEsIGNwMiwgZW5kUHQpIHsvL3N0b2xlbiBmcm9tIHN0YWNrb3ZlcmZsb3dcclxuICBsZXQgdDIgPSBwZXJjZW50ICogcGVyY2VudFxyXG4gIGxldCB0MyA9IHQyICogcGVyY2VudFxyXG5cclxuICByZXR1cm4gc3RhcnRQdCArICgtc3RhcnRQdCAqIDMgKyBwZXJjZW50ICogKDMgKiBzdGFydFB0IC0gc3RhcnRQdCAqIHBlcmNlbnQpKSAqIHBlcmNlbnRcclxuICArICgzICogY3AxICsgcGVyY2VudCAqICgtNiAqIGNwMSArIGNwMSAqIDMgKiBwZXJjZW50KSkgKiBwZXJjZW50XHJcbiAgKyAoY3AyICogMyAtIGNwMiAqIDMgKiBwZXJjZW50KSAqIHQyXHJcbiAgKyBlbmRQdCAqIHQzXHJcbn1cclxuXHJcblxyXG4vLy0tRlVOQ1RJT05TIFRPIFJFTkRFUiBXQVlQT0lOVFMsIENPTlRST0wgUE9JTlRTLCBFVEMgVVNFRCBJTiBQQVJUSUNMRSBDUkVBVElPTlxyXG4vL05PVCBORUNFU1NBUklMWSBVU0VEIEJVVCBVU0VGVUwgRk9SIERFQlVHR0lOR1xyXG5mdW5jdGlvbiByZW5kZXJCb3VuZGluZ0NpcmNsZShjdHgsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpIHtcclxuICBsZXQgY2VudGVyWCA9IGNhbnZhc1dpZHRoIC8gMlxyXG4gIGxldCBjZW50ZXJZID0gY2FudmFzSGVpZ2h0IC8gMlxyXG4gIGxldCByYWRpdXMgPSBjZW50ZXJZID4gY2VudGVyWCA/IGNlbnRlclggLSAyIDogY2VudGVyWSAtIDJcclxuICBsZXQgc3RhcnRBbmdsZSA9IDBcclxuICBsZXQgZW5kQW5nbGUgPSAyICogTWF0aC5QSVxyXG4gIGN0eC5saW5lV2lkdGggPSAxXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZXknXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LmFyYyhjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKVxyXG4gIGN0eC5zdHJva2UoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmVuZGVySG9sZFBhdHRlcm5XUHMoY3R4LCB3YXlwb2ludHMpIHtcclxuICBjdHguYmVnaW5QYXRoKClcclxuICBjdHguZmlsbFN0eWxlID0gJ2JsdWUnXHJcbiAgd2F5cG9pbnRzLmZvckVhY2god3AgPT4ge1xyXG4gICAgY3R4LmZpbGxSZWN0KHdwLnggLSA0LCB3cC55IC0gNCwgOCwgOClcclxuICB9KVxyXG4gIGN0eC5zdHJva2UoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmVuZGVySG9sZFBhdHRlcm5QYXJ0aWNsZVBhdGhzKGN0eCwgcGFydGljbGVzKSB7XHJcbiAgcGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xyXG4gICAgbGV0IGNwMVggPSBwYXJ0aWNsZS5jb29yZHMuY3AxeFxyXG4gICAgbGV0IGNwMVkgPSBwYXJ0aWNsZS5jb29yZHMuY3AxeVxyXG4gICAgbGV0IGNwMlggPSBwYXJ0aWNsZS5jb29yZHMuY3AyeFxyXG4gICAgbGV0IGNwMlkgPSBwYXJ0aWNsZS5jb29yZHMuY3AyeVxyXG4gICAgbGV0IHN0YXJ0WCA9IHBhcnRpY2xlLmNvb3Jkcy54MFxyXG4gICAgbGV0IHN0YXJ0WSA9IHBhcnRpY2xlLmNvb3Jkcy55MFxyXG4gICAgbGV0IGVuZFggPSBwYXJ0aWNsZS5jb29yZHMueDFcclxuICAgIGxldCBlbmRZID0gcGFydGljbGUuY29vcmRzLnkxXHJcbiAgICBjdHgubGluZVdpZHRoID0gMVxyXG4gICAgLy9yZW5kZXIgc3RhcnQgcG9pbnRcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZWVuJ1xyXG4gICAgY3R4LnJlY3Qoc3RhcnRYIC0gMiwgc3RhcnRZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgZW5kIHBvaW50XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAncmVkJ1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHgucmVjdChlbmRYIC0gMiwgZW5kWSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIGNvbnRyb2wgcG9pbnQgMVxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAneWVsbG93J1xyXG4gICAgY3R4LnJlY3QoY3AxWCAtIDIsIGNwMVkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBjb250cm9sIHBvaW50IDJcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ29yYW5nZSdcclxuICAgIGN0eC5yZWN0KGNwMlggLSAyLCBjcDJZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgcGF0aFxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JleSdcclxuICAgIGN0eC5tb3ZlVG8oc3RhcnRYLCBzdGFydFkpXHJcbiAgICBjdHguYmV6aWVyQ3VydmVUbyhjcDFYLCBjcDFZLCBjcDJYLCBjcDJZLCBlbmRYLCBlbmRZKVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgfSlcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1DT0xPUiBIRUxQRVJTXHJcbi8vd291bGQgYmUgbW9yZSBlZmZpY2llbnQgdG8gdGFrZSBhcmdzIGFzIHtyOiAwLTI1NSwgZzogMC0yNTUsIGI6MC0yNTV9XHJcbi8vc28gbm8gbmVlZCB0aGUgaGV4IGFycmF5IHN0dWZmIGJ1dCBvayBmb3Igbm93IGFzIGRyYXdpbmdcclxuLy9hIGZldyBodW5kcmVkIHBhcnRpY2xlcyB3aXRob3V0IGxhZ1xyXG5mdW5jdGlvbiBjb2xvckJldHdlZW5Ud29Db2xvcnMocGVyY2VudCwgY29sb3JPbmUsIGNvbG9yVHdvKSB7XHJcbiAgbGV0IGhleCA9IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICdhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZiddXHJcblxyXG4gIC8vY29sb3JPbmVcclxuICBsZXQgYzFSZWRJbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDEpIClcclxuICBsZXQgYzFSZWRJbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDIpIClcclxuICBsZXQgYzFSZWRCYXNlVGVuID0gKGMxUmVkSW5kZXgwICogMTYpICsgKGMxUmVkSW5kZXgxKVxyXG5cclxuICBsZXQgYzFHcmVlbkluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoMykgKVxyXG4gIGxldCBjMUdyZWVuSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCg0KSApXHJcbiAgbGV0IGMxR3JlZW5kQmFzZVRlbiA9IChjMUdyZWVuSW5kZXgwICogMTYpICsgKGMxR3JlZW5JbmRleDEpXHJcblxyXG4gIGxldCBjMUJsdWVJbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDUpIClcclxuICBsZXQgYzFCbHVlSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCg2KSApXHJcbiAgbGV0IGMxQmx1ZUJhc2VUZW4gPSAoYzFCbHVlSW5kZXgwICogMTYpICsgKGMxQmx1ZUluZGV4MSlcclxuXHJcbiAgLy9jb2xvclR3b1xyXG4gIGxldCBjMlJlZEluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoMSkgKVxyXG4gIGxldCBjMlJlZEluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoMikgKVxyXG4gIGxldCBjMlJlZEJhc2VUZW4gPSAoYzJSZWRJbmRleDAgKiAxNikgKyAoYzJSZWRJbmRleDEpXHJcblxyXG4gIGxldCBjMkdyZWVuSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCgzKSApXHJcbiAgbGV0IGMyR3JlZW5JbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDQpIClcclxuICBsZXQgYzJHcmVlbmRCYXNlVGVuID0gKGMyR3JlZW5JbmRleDAgKiAxNikgKyAoYzJHcmVlbkluZGV4MSlcclxuXHJcbiAgbGV0IGMyQmx1ZUluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoNSkgKVxyXG4gIGxldCBjMkJsdWVJbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDYpIClcclxuICBsZXQgYzJCbHVlQmFzZVRlbiA9IChjMkJsdWVJbmRleDAgKiAxNikgKyAoYzJCbHVlSW5kZXgxKVxyXG5cclxuICBsZXQgcmVkRGVsdGEgPSBjMlJlZEJhc2VUZW4gLSBjMVJlZEJhc2VUZW5cclxuICBsZXQgZ3JlZW5EZWx0YSA9IGMyR3JlZW5kQmFzZVRlbiAtIGMxR3JlZW5kQmFzZVRlblxyXG4gIGxldCBibHVlRGVsdGEgPSBjMkJsdWVCYXNlVGVuIC0gYzFCbHVlQmFzZVRlblxyXG5cclxuICBsZXQgcmVkTm93ID0gTWF0aC5yb3VuZCggYzFSZWRCYXNlVGVuICsgKHJlZERlbHRhICogcGVyY2VudCkgKVxyXG4gIGxldCBncmVlbk5vdyA9IE1hdGgucm91bmQoIGMxR3JlZW5kQmFzZVRlbiArIChncmVlbkRlbHRhICogcGVyY2VudCkgKVxyXG4gIGxldCBibHVlTm93ID0gTWF0aC5yb3VuZCggYzFCbHVlQmFzZVRlbiArIChibHVlRGVsdGEgKiBwZXJjZW50KSApXHJcblxyXG4gIHJldHVybiB7cjogcmVkTm93LCBnOiBncmVlbk5vdywgYjogYmx1ZU5vd30vL3RlbXBcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FWFBPUlRTXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMsXHJcbiAgcmFuZFBvaW50TmVhclBvaW50LFxyXG4gIGNvb3Jkc09uU3RyYWlnaHRMaW5lLFxyXG4gIGNvb3Jkc09uQ3ViaWNCZXppZXIsXHJcbiAgY29sb3JCZXR3ZWVuVHdvQ29sb3JzLFxyXG4gIC8vZGV2XHJcbiAgcmVuZGVyQm91bmRpbmdDaXJjbGUsXHJcbiAgcmVuZGVySG9sZFBhdHRlcm5XUHMsXHJcbiAgcmVuZGVySG9sZFBhdHRlcm5QYXJ0aWNsZVBhdGhzXHJcbn1cclxuIiwiLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1DT09SRFMgQVMgUkFUSU8gQU5EIFZFQ1RPUiBQT0lOVCBBVFNcclxubGV0IGxldHRlcnNDb29yZHMgPSB7XHJcbiAgQTogW1xyXG4gICAge3g6IDAuMTI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgICAvLzFcclxuICAgIHt4OiAwLjM3NSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC41fSwgICAvLzRcclxuICAgIHt4OiAwLjg3NSwgeTogMC44NzV9IC8vNVxyXG4gIF0sXHJcbiAgQjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9LCAvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjc1fSAgLy80XHJcbiAgXSxcclxuICBDOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNjI1fSwvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjM3NX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9IC8vM1xyXG4gIF0sXHJcbiAgRDogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwgLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjUgfSwvLzFcclxuICAgIHt4OiAwLjc1LCB5OiAwLjM3NX0sIC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuNjI1fSAgLy8zXHJcbiAgXSxcclxuICBFOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0sICAvLzRcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0gLy81XHJcbiAgXSxcclxuICBGOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0gICAvLzRcclxuICBdLFxyXG4gIEc6IFtcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC42MjV9LC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMzc1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC42MjUsIHk6IDAuNX0sIC8vNFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjV9ICAvLzVcclxuICBdLFxyXG4gIEg6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC41fSwgIC8vNFxyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSAvLzVcclxuICBdLFxyXG4gIEk6IFtcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC41LCB5OiAwLjg3NX0sIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzJcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC41LCB5OiAwLjEyNX0sIC8vNFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSAvLzVcclxuICBdLFxyXG4gIEo6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjc1fSxcclxuICAgIHt4OiAwLjM3NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNSwgeTogMC43NX0sXHJcbiAgICB7eDogMC41LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fVxyXG4gIF0sXHJcbiAgSzogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4yNX1cclxuICBdLFxyXG4gIEw6IFtcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fVxyXG4gIF0sXHJcbiAgTTogW1xyXG4gICAge3g6IDAuMTI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNSwgeTogMC43NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjg3NX1cclxuICBdLFxyXG4gIFwiIFwiOiBbXS8vZW5hYmxlcyBoYXZpbmcgc3BhY2VzIGJldHdlZW4gbGV0dGVyc1xyXG59XHJcblxyXG5cclxubGV0IGxldHRlcnNWZWN0b3JzID0ge1xyXG4gIEE6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgQjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0yfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtNH1cclxuICBdLFxyXG4gIEM6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgRDogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0zfVxyXG4gIF0sXHJcbiAgRTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC01fVxyXG4gIF0sXHJcbiAgRjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBHOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTV9XHJcbiAgXSxcclxuICBIOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIEk6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgSjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBLOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTN9XHJcbiAgXSxcclxuICBMOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIE06IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF1cclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVhQT1JURUQgRlVOQ1RJT05TXHJcbmZ1bmN0aW9uIHRvdGFsUmVxdWlyZWRQYXJ0aWNsZXMoc3RyKSB7XHJcbiAgbGV0IHJlcXVpcmVkUGFydGljbGVzID0gMFxyXG5cclxuICBmb3IoaSBpbiBzdHIpIHtcclxuICAgIHJlcXVpcmVkUGFydGljbGVzICs9IGxldHRlcnNDb29yZHNbc3RyLmNoYXJBdChpKV0ubGVuZ3RoXHJcbiAgfVxyXG5cclxuICBjb25zb2xlLmxvZyhcInRvdGFsIHJlcXVpcmVkUGFydGljbGVzOiBcIiArIHJlcXVpcmVkUGFydGljbGVzKVxyXG4gIHJldHVybiByZXF1aXJlZFBhcnRpY2xlc1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcGxhY2VXb3Jkc0luUm93cyhzdHIsIG1heENoYXJzSW5Sb3cpIHtcclxuICBsZXQgd29yZHMgPSBzdHIuc3BsaXQoXCIgXCIpXHJcbiAgbGV0IHJvd3MgPSBbXCJcIl1cclxuICBsZXQgcm93c0luZGV4ID0gMFxyXG5cclxuICB3b3Jkcy5mb3JFYWNoKCh3b3JkLCBpbmRleCkgPT4ge1xyXG4gICAgaWYocm93c1tyb3dzSW5kZXhdLmxlbmd0aCArIHdvcmQubGVuZ3RoICsgMSA8PSBtYXhDaGFyc0luUm93KSB7XHJcbiAgICAgIHJvd3Nbcm93c0luZGV4XSA9IGluZGV4ID09PSAwID8gcm93c1tyb3dzSW5kZXhdICsgd29yZCA6IHJvd3Nbcm93c0luZGV4XSArIFwiIFwiICsgd29yZFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcm93cy5wdXNoKHdvcmQpXHJcbiAgICAgIHJvd3NJbmRleCsrXHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIHJvd3NcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNhbGNMZXR0ZXJQYXJ0aWNsZXNEZXN0QW5kVGFyZ2V0cyh3b3Jkc0luUm93cywgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkge1xyXG4gIGxldCBjaGFyV2lkdGggPSBNYXRoLnJvdW5kKCBjYW52YXNXaWR0aCAvIChsb25nZXN0RWxlbWVudExlbmd0aCh3b3Jkc0luUm93cykgKyAyKSApXHJcbiAgbGV0IGNoYXJIZWlnaHQgPSBNYXRoLnJvdW5kKGNoYXJXaWR0aCAqIDEuMilcclxuICBsZXQgdG90YWxSb3dzSGVpZ2h0ID0gY2hhckhlaWdodCAqICh3b3Jkc0luUm93cy5sZW5ndGggKyAxKVxyXG4gIGxldCBmaW5hbENvb3Jkc0FuZFBvaW50c0F0cyA9IFtdXHJcblxyXG4gIGZvcihsZXQgcm93IGluIHdvcmRzSW5Sb3dzKSB7XHJcbiAgICBsZXQgcm93U3RhcnRYID0gKGNhbnZhc1dpZHRoIC8gMikgLSAod29yZHNJblJvd3Nbcm93XS5sZW5ndGggKiBjaGFyV2lkdGggLyAyKVxyXG4gICAgbGV0IHJvd1N0YXJ0WSA9IChjYW52YXNIZWlnaHQgLyAyKSAtICh0b3RhbFJvd3NIZWlnaHQgLyAyKSArIChyb3cgKiBjaGFySGVpZ2h0KVxyXG5cclxuICAgIGZvcihsZXQgbGV0dGVyUG9zID0gMDsgbGV0dGVyUG9zIDwgd29yZHNJblJvd3Nbcm93XS5sZW5ndGg7IGxldHRlclBvcysrKSB7XHJcbiAgICAgIGxldCBjaGFySGVyZSA9IHdvcmRzSW5Sb3dzW3Jvd10uY2hhckF0KGxldHRlclBvcylcclxuICAgICAgbGV0IG5DaGFyUGFydGljbGVzID0gbGV0dGVyc0Nvb3Jkc1tjaGFySGVyZV0ubGVuZ3RoXHJcblxyXG4gICAgICBmb3IobGV0IHBvc0luQ2hhciA9IDA7IHBvc0luQ2hhciA8IG5DaGFyUGFydGljbGVzOyBwb3NJbkNoYXIrKykge1xyXG4gICAgICAgIGxldCB4MSA9IHJvd1N0YXJ0WCArIChsZXR0ZXJQb3MgKiBjaGFyV2lkdGgpICsgKGNoYXJXaWR0aCAqIGxldHRlcnNDb29yZHNbY2hhckhlcmVdW3Bvc0luQ2hhcl0ueClcclxuICAgICAgICBsZXQgeTEgPSByb3dTdGFydFkgKyAoY2hhckhlaWdodCAqIGxldHRlcnNDb29yZHNbY2hhckhlcmVdW3Bvc0luQ2hhcl0ueSlcclxuICAgICAgICBsZXQgcG9pbnRzQXQgPSBmYWxzZVxyXG5cclxuICAgICAgICBpZihsZXR0ZXJzVmVjdG9yc1tjaGFySGVyZV1bcG9zSW5DaGFyXS5oYXNWZWN0b3IgPT09IHRydWUpIHtcclxuICAgICAgICAgIHBvaW50c0F0ID0gbGV0dGVyc1ZlY3RvcnNbY2hhckhlcmVdW3Bvc0luQ2hhcl0uaW5kZXhPZmZzZXRcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZpbmFsQ29vcmRzQW5kUG9pbnRzQXRzLnB1c2goe3gxOiB4MSwgeTE6IHkxLCBwb2ludHNBdDogcG9pbnRzQXR9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmluYWxDb29yZHNBbmRQb2ludHNBdHNcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tSU5URVJOQUwgRlVOQ1RJT05TXHJcbmZ1bmN0aW9uIGxvbmdlc3RFbGVtZW50TGVuZ3RoKGFycikge1xyXG4gIGxldCBsZW5ndGggPSAwXHJcbiAgYXJyLmZvckVhY2goZWwgPT4ge1xyXG4gICAgbGVuZ3RoID0gZWwubGVuZ3RoID49IGxlbmd0aCA/IGVsLmxlbmd0aCA6IGxlbmd0aFxyXG4gIH0pXHJcbiAgcmV0dXJuIGxlbmd0aFxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVYUE9SVFNcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgcGxhY2VXb3Jkc0luUm93cyxcclxuICB0b3RhbFJlcXVpcmVkUGFydGljbGVzLFxyXG4gIGNhbGNMZXR0ZXJQYXJ0aWNsZXNEZXN0QW5kVGFyZ2V0c1xyXG59XHJcbiJdfQ==
