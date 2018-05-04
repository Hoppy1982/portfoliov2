(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const canvasHelpers = require('./utils/canvas-helpers.js')
const lettersLib = require('./utils/letters-lib.js')


const TOTAL_PARTICLES = 300
const HOLD_PATTERN_WAYPOINTS = [//coords as percent of canvas size
  {x: 0.125, y: 0.5},//0
  {x: 0.25, y: 0.125},//1
  {x: 0.75, y: 0.125},//2
  {x: 0.875, y: 0.5},//3
  {x: 0.75, y: 0.875},//4
  {x: 0.25, y: 0.875}//5
]

let body = document.getElementsByTagName('body')[0]
let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')
let navGoToButton = document.getElementById('navigatorDesc')//dev
let frameId
let canvasWidth
let canvasHeight
let holdPatternWaypointsActual = []//coords in pixels, recalculated on resize
let navTargetOrigin = {x: null, y: null}
let navTargetCharSize = {width: null, height: null}
let holdPatternParticles = []
let charPatternParticles = []

let navTargetWord = 'BAD ABCDEFGH ABCDEFGHI'//dev


//------------------------------------------------------------------------EVENTS
document.addEventListener("DOMContentLoaded", init)
window.addEventListener('resize', init)
navGoToButton.addEventListener('click', initNavTarget, false)


//---------------------------------------------------FLOW CONTROL & INITIALISERS
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




//move some of this to letter-lib
function initNavTarget() {
  let requiredParticles = lettersLib.totalRequiredParticles(navTargetWord)
  let wordsInRows = lettersLib.placeWordsInRows(navTargetWord, 12)
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

  //console.log(`redNow: ${redNow}, greenNow: ${greenNow}, blueNow: ${blueNow}`)

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
  " ": []//enables having spaces between letters
}


let lettersVectors = {//Todo - check id this still needs to be exported
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
  ]
}
//--------------------------------------------------------------HELPER FUNCTIONS
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
  let charWidth = Math.round(canvasWidth / 14)
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



module.exports = {
  lettersCoords,
  lettersVectors,
  placeWordsInRows,
  totalRequiredParticles,
  calcLetterParticlesDestAndTargets
}

//have a function that takes in a string and returns total nParticles using lengths of each letter array

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2FudmFzLWhlbHBlcnMuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9sZXR0ZXJzLWxpYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGNhbnZhc0hlbHBlcnMgPSByZXF1aXJlKCcuL3V0aWxzL2NhbnZhcy1oZWxwZXJzLmpzJylcclxuY29uc3QgbGV0dGVyc0xpYiA9IHJlcXVpcmUoJy4vdXRpbHMvbGV0dGVycy1saWIuanMnKVxyXG5cclxuXHJcbmNvbnN0IFRPVEFMX1BBUlRJQ0xFUyA9IDMwMFxyXG5jb25zdCBIT0xEX1BBVFRFUk5fV0FZUE9JTlRTID0gWy8vY29vcmRzIGFzIHBlcmNlbnQgb2YgY2FudmFzIHNpemVcclxuICB7eDogMC4xMjUsIHk6IDAuNX0sLy8wXHJcbiAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzFcclxuICB7eDogMC43NSwgeTogMC4xMjV9LC8vMlxyXG4gIHt4OiAwLjg3NSwgeTogMC41fSwvLzNcclxuICB7eDogMC43NSwgeTogMC44NzV9LC8vNFxyXG4gIHt4OiAwLjI1LCB5OiAwLjg3NX0vLzVcclxuXVxyXG5cclxubGV0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdXHJcbmxldCBjYW52YXMxID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2NhbnZhcycpWzBdXHJcbmxldCBjdHgxID0gY2FudmFzMS5nZXRDb250ZXh0KCcyZCcpXHJcbmxldCBuYXZHb1RvQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdmlnYXRvckRlc2MnKS8vZGV2XHJcbmxldCBmcmFtZUlkXHJcbmxldCBjYW52YXNXaWR0aFxyXG5sZXQgY2FudmFzSGVpZ2h0XHJcbmxldCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCA9IFtdLy9jb29yZHMgaW4gcGl4ZWxzLCByZWNhbGN1bGF0ZWQgb24gcmVzaXplXHJcbmxldCBuYXZUYXJnZXRPcmlnaW4gPSB7eDogbnVsbCwgeTogbnVsbH1cclxubGV0IG5hdlRhcmdldENoYXJTaXplID0ge3dpZHRoOiBudWxsLCBoZWlnaHQ6IG51bGx9XHJcbmxldCBob2xkUGF0dGVyblBhcnRpY2xlcyA9IFtdXHJcbmxldCBjaGFyUGF0dGVyblBhcnRpY2xlcyA9IFtdXHJcblxyXG5sZXQgbmF2VGFyZ2V0V29yZCA9ICdCQUQgQUJDREVGR0ggQUJDREVGR0hJJy8vZGV2XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FVkVOVFNcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdClcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGluaXQpXHJcbm5hdkdvVG9CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpbml0TmF2VGFyZ2V0LCBmYWxzZSlcclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUZMT1cgQ09OVFJPTCAmIElOSVRJQUxJU0VSU1xyXG5mdW5jdGlvbiBpbml0KCkge1xyXG4gIHJlc2V0KClcclxuICBzZXRMYXlvdXQoKVxyXG4gIGNhbGNIb2xkUGF0dGVybldheXBvaW50Q29vcmRzKClcclxuICBpbml0SG9sZFBhdHRlcm5QYXJ0aWNsZXMoVE9UQUxfUEFSVElDTEVTKVxyXG4gIGFuaW1hdGUoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmVzZXQoKSB7XHJcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVJZClcclxuICBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbC5sZW5ndGggPSAwXHJcbiAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMubGVuZ3RoID0gMFxyXG4gIGNoYXJQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA9IDBcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNhbGNIb2xkUGF0dGVybldheXBvaW50Q29vcmRzKCkge1xyXG4gIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsID0gSE9MRF9QQVRURVJOX1dBWVBPSU5UUy5tYXAoZWwgPT4ge1xyXG4gICAgcmV0dXJuIHt4OiBlbC54ICogY2FudmFzV2lkdGgsIHk6IGVsLnkgKiBjYW52YXNIZWlnaHR9XHJcbiAgfSlcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGluaXRIb2xkUGF0dGVyblBhcnRpY2xlcyhuUGFydGljbGVzKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IG5QYXJ0aWNsZXM7IGkrKykge1xyXG4gICAgY29uc3QgU1BFRUQgPSAwLjAwMjVcclxuICAgIGxldCBmcm9tV1AgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2KVxyXG4gICAgbGV0IG5leHRXUCA9IGZyb21XUCArIDEgPT09IEhPTERfUEFUVEVSTl9XQVlQT0lOVFMubGVuZ3RoID8gMCA6IGZyb21XUCArIDFcclxuICAgIGxldCBkaXN0TW92ZWQgPSBNYXRoLnJvdW5kKCBNYXRoLnJhbmRvbSgpICogMTAgKSAvIDEwXHJcbiAgICBsZXQgc3RhcnRDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFtmcm9tV1BdKVxyXG4gICAgbGV0IGVuZENvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW25leHRXUF0pXHJcbiAgICBsZXQgY3AxQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHN0YXJ0Q29vcmRzLCBlbmRDb29yZHMpXHJcbiAgICBsZXQgY3AyQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHN0YXJ0Q29vcmRzLCBlbmRDb29yZHMpXHJcbiAgICBsZXQgY29vcmRzID0ge1xyXG4gICAgICB4OiBzdGFydENvb3Jkcy54LCB5OiBzdGFydENvb3Jkcy55LFxyXG4gICAgICB4MDogc3RhcnRDb29yZHMueCwgeTA6IHN0YXJ0Q29vcmRzLnksXHJcbiAgICAgIHgxOiBlbmRDb29yZHMueCwgeTE6IGVuZENvb3Jkcy55LFxyXG4gICAgICBjcDF4OiBjcDFDb29yZHMueCwgY3AxeTogY3AxQ29vcmRzLnksXHJcbiAgICAgIGNwMng6IGNwMkNvb3Jkcy54LCBjcDJ5OiBjcDJDb29yZHMueVxyXG4gICAgfVxyXG5cclxuICAgIGhvbGRQYXR0ZXJuUGFydGljbGVzLnB1c2gobmV3IEhvbGRQYXR0ZXJuUGFydGljbGUoY29vcmRzLCBTUEVFRCwgZGlzdE1vdmVkLCBuZXh0V1ApKVxyXG4gIH1cclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1VUERBVEUgUEFSVElDTEUgUE9TSVRJT05TICYgUkVOREVSXHJcbmZ1bmN0aW9uIGFuaW1hdGUoKSB7XHJcbiAgZnJhbWVJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKVxyXG4gIGN0eDEuY2xlYXJSZWN0KDAsIDAsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpXHJcbiAgLy9jYW52YXNIZWxwZXJzLnJlbmRlckJvdW5kaW5nQ2lyY2xlKGN0eDEsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpLy9kZXZcclxuICAvL2NhbnZhc0hlbHBlcnMucmVuZGVySG9sZFBhdHRlcm5XUHMoY3R4MSwgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwpLy9kZXZcclxuICAvL2NhbnZhc0hlbHBlcnMucmVuZGVySG9sZFBhdHRlcm5QYXJ0aWNsZVBhdGhzKGN0eDEsIGhvbGRQYXR0ZXJuUGFydGljbGVzKS8vZGV2XHJcbiAgdXBkYXRlSG9sZFBhdHRlcm5QYXJ0aWNsZXMoKVxyXG4gIHVwZGF0ZUNoYXJQYXR0ZXJuUGFydGljbGVzKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUhvbGRQYXR0ZXJuUGFydGljbGVzKCkge1xyXG4gIGhvbGRQYXR0ZXJuUGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4gey8vdGhpbmsgdGhpcyBzaG91bGQgYmUgbW92ZWQgdG8gYSBtZXRob2Qgb24gaG9sZFBhcnRpY2xlIGNsYXNzPz9cclxuICAgIHBhcnRpY2xlLnVwZGF0ZVBvcygpXHJcbiAgICBwYXJ0aWNsZS5kcmF3KCd3aGl0ZScpXHJcbiAgfSlcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUNoYXJQYXR0ZXJuUGFydGljbGVzKCkge1xyXG4gIGNoYXJQYXR0ZXJuUGFydGljbGVzLmZvckVhY2goKHBhcnRpY2xlLCBpbmRleCkgPT4ge1xyXG4gICAgcGFydGljbGUudXBkYXRlUG9zKClcclxuICAgIHBhcnRpY2xlLmRyYXcoJ3doaXRlJywgJ3JlZCcpXHJcbiAgICBwYXJ0aWNsZS5kcmF3VG9Qb2ludHNBdChpbmRleCwgJyMxZjI2MzMnLCAnI2ZmMDAwMCcpXHJcbiAgfSlcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1MQVlPVVQgQlJFQUsgUE9JTlRTXHJcbmZ1bmN0aW9uIHNldExheW91dCgpIHtcclxuICAvL3NtYWxsIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNVxyXG4gIH1cclxuICAvL3NtYWxsIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0IDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG4gIC8vbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDEwMjQgJiYgYm9keS5jbGllbnRXaWR0aCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjdcclxuICB9XHJcbiAgLy9tZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gMTAyNCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcbiAgLy9sYXJnZSB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjY1XHJcbiAgfVxyXG4gIC8vbGFyZ2UgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPiAxMDI0KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBsYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG5cclxuICBjYW52YXMxLndpZHRoID0gY2FudmFzV2lkdGhcclxuICBjYW52YXMxLmhlaWdodCA9IGNhbnZhc0hlaWdodFxyXG59XHJcblxyXG5cclxuXHJcblxyXG4vL21vdmUgc29tZSBvZiB0aGlzIHRvIGxldHRlci1saWJcclxuZnVuY3Rpb24gaW5pdE5hdlRhcmdldCgpIHtcclxuICBsZXQgcmVxdWlyZWRQYXJ0aWNsZXMgPSBsZXR0ZXJzTGliLnRvdGFsUmVxdWlyZWRQYXJ0aWNsZXMobmF2VGFyZ2V0V29yZClcclxuICBsZXQgd29yZHNJblJvd3MgPSBsZXR0ZXJzTGliLnBsYWNlV29yZHNJblJvd3MobmF2VGFyZ2V0V29yZCwgMTIpXHJcbiAgbGV0IGRlc3RpbmF0aW9uc0FuZFRhcmdldHMgPSBsZXR0ZXJzTGliLmNhbGNMZXR0ZXJQYXJ0aWNsZXNEZXN0QW5kVGFyZ2V0cyh3b3Jkc0luUm93cywgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodClcclxuXHJcbiAgaWYgKGhvbGRQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA+IHJlcXVpcmVkUGFydGljbGVzKSB7XHJcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgcmVxdWlyZWRQYXJ0aWNsZXM7IGkrKykge1xyXG4gICAgICBsZXQgdHJhbnNmZXJyaW5nUGFydGljbGUgPSBob2xkUGF0dGVyblBhcnRpY2xlcy5wb3AoKVxyXG4gICAgICBsZXQgY29vcmRzID0ge1xyXG4gICAgICAgIHg6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy54LFxyXG4gICAgICAgIHk6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy55LFxyXG4gICAgICAgIHgwOiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueCxcclxuICAgICAgICB5MDogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLnksXHJcbiAgICAgICAgeDE6IGRlc3RpbmF0aW9uc0FuZFRhcmdldHNbaV0ueDEsXHJcbiAgICAgICAgeTE6IGRlc3RpbmF0aW9uc0FuZFRhcmdldHNbaV0ueTFcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHNwZWVkID0gdHJhbnNmZXJyaW5nUGFydGljbGUuc3BlZWRcclxuICAgICAgbGV0IGRpc3RNb3ZlZCA9IDBcclxuICAgICAgbGV0IHBvaW50c0F0ID0gZGVzdGluYXRpb25zQW5kVGFyZ2V0c1tpXS5wb2ludHNBdFxyXG4gICAgICBjaGFyUGF0dGVyblBhcnRpY2xlcy5wdXNoKG5ldyBDaGFyUGF0dGVyblBhcnRpY2xlKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZCwgcG9pbnRzQXQpKVxyXG4gICAgfVxyXG5cclxuICB9XHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tUEFSVElDTEUgQ0xBU1NFU1xyXG5jbGFzcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkKSB7XHJcbiAgICB0aGlzLmNvb3JkcyA9IGNvb3Jkc1xyXG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkXHJcbiAgICB0aGlzLmRpc3RNb3ZlZCA9IGRpc3RNb3ZlZFxyXG4gIH1cclxuXHJcbiAgZHJhdyhjb2xvcikgey8vZGVmYXVsdCBzZWxmIHJlbmRlciBmb3IgcGFydGljbGVzLCBtYXliZSBjaGFuZ2UgbGF0ZXJcclxuICAgIGN0eDEuYmVnaW5QYXRoKClcclxuICAgIGN0eDEubGluZVdpZHRoID0gM1xyXG4gICAgY3R4MS5zdHJva2VTdHlsZSA9IGNvbG9yXHJcbiAgICBjdHgxLmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eDEuYXJjKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnksIDMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSlcclxuICAgIGN0eDEuc3Ryb2tlKClcclxuICAgIGN0eDEuZmlsbCgpXHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3MoKSB7XHJcbiAgICB0aGlzLmNvb3Jkcy54ICs9IHRoaXMuc3BlZWRcclxuICAgIHRoaXMuY29vcmRzLnkgKz0gdGhpcy5zcGVlZFxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgSG9sZFBhdHRlcm5QYXJ0aWNsZSBleHRlbmRzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQsIG5leHRXUCkge1xyXG4gICAgc3VwZXIoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkKVxyXG4gICAgdGhpcy5uZXh0V1AgPSBuZXh0V1BcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvcygpIHtcclxuICAgIHRoaXMuZGlzdE1vdmVkICs9IHRoaXMuc3BlZWRcclxuICAgIGlmKHRoaXMuZGlzdE1vdmVkID49IDEpIHtcclxuICAgICAgdGhpcy5kaXN0TW92ZWQgPSAwXHJcbiAgICAgIHRoaXMubmV4dFdQID0gdGhpcy5uZXh0V1AgPT09IEhPTERfUEFUVEVSTl9XQVlQT0lOVFMubGVuZ3RoIC0gMSA/IDAgOiB0aGlzLm5leHRXUCArIDFcclxuICAgICAgdGhpcy5jb29yZHMueDAgPSB0aGlzLmNvb3Jkcy54MVxyXG4gICAgICB0aGlzLmNvb3Jkcy55MCA9IHRoaXMuY29vcmRzLnkxXHJcbiAgICAgIHRoaXMuY29vcmRzLngxID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbdGhpcy5uZXh0V1BdKS54XHJcbiAgICAgIHRoaXMuY29vcmRzLnkxID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbdGhpcy5uZXh0V1BdKS55XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMXggPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS54XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMXkgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS55XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMnggPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS54XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMnkgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS55XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvb3Jkcy54ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHRoaXMuZGlzdE1vdmVkLCB0aGlzLmNvb3Jkcy54MCwgdGhpcy5jb29yZHMuY3AxeCwgdGhpcy5jb29yZHMuY3AyeCwgdGhpcy5jb29yZHMueDEpXHJcbiAgICB0aGlzLmNvb3Jkcy55ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHRoaXMuZGlzdE1vdmVkLCB0aGlzLmNvb3Jkcy55MCwgdGhpcy5jb29yZHMuY3AxeSwgdGhpcy5jb29yZHMuY3AyeSwgdGhpcy5jb29yZHMueTEpXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBDaGFyUGF0dGVyblBhcnRpY2xlIGV4dGVuZHMgUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZCwgcG9pbnRzQXQpIHtcclxuICAgIHN1cGVyKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZClcclxuICAgIHRoaXMucG9pbnRzQXQgPSBwb2ludHNBdFxyXG4gIH1cclxuXHJcbiAgdXBkYXRlUG9zKCkge1xyXG4gICAgdGhpcy5kaXN0TW92ZWQgKz0gdGhpcy5zcGVlZFxyXG4gICAgaWYodGhpcy5kaXN0TW92ZWQgPCAxKSB7XHJcbiAgICAgIGxldCBuZXdQb3MgPSBjYW52YXNIZWxwZXJzLmNvb3Jkc09uU3RyYWlnaHRMaW5lKHRoaXMuZGlzdE1vdmVkLCB7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pXHJcbiAgICAgIHRoaXMuY29vcmRzLnggPSBuZXdQb3MueFxyXG4gICAgICB0aGlzLmNvb3Jkcy55ID0gbmV3UG9zLnlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRyYXcoY29sb3JGcm9tLCBjb2xvclRvKSB7XHJcbiAgICBjdHgxLmJlZ2luUGF0aCgpXHJcbiAgICBjdHgxLmxpbmVXaWR0aCA9IDNcclxuICAgIGxldCByZ2IgPSBjYW52YXNIZWxwZXJzLmNvbG9yQmV0d2VlblR3b0NvbG9ycyh0aGlzLmRpc3RNb3ZlZCwgJyNmZmZmZmYnLCAnI2ZmMDAwMCcpLy9kZXZcclxuICAgIGN0eDEuc3Ryb2tlU3R5bGUgPSBgcmdiKCR7cmdiLnJ9LCAke3JnYi5nfSwgJHtyZ2IuYn0pYFxyXG4gICAgLy9jdHgxLnN0cm9rZVN0eWxlID0gdGhpcy5kaXN0TW92ZWQgPCAxID8gY29sb3JGcm9tIDogY29sb3JUby8vd3JpdGUgZnVuY3Rpb24gdG8gdHJhbnNpdGlvbiBiZXR3ZWVuIDIgY29sb3VycyB0aGF0IHRha2VzICUgYXMgYW4gYXJnXHJcbiAgICBjdHgxLmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eDEuYXJjKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnksIDMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSlcclxuICAgIGN0eDEuc3Ryb2tlKClcclxuICAgIGN0eDEuZmlsbCgpXHJcbiAgfVxyXG5cclxuICBkcmF3VG9Qb2ludHNBdChpbmRleCwgY29sb3JGcm9tLCBjb2xvclRvKSB7XHJcbiAgICBpZih0aGlzLmRpc3RNb3ZlZCA+IDAuMSkge1xyXG4gICAgICBpZih0aGlzLnBvaW50c0F0ICE9PSBmYWxzZSkge1xyXG4gICAgICAgIGxldCBwb2ludHNBdFggPSBjaGFyUGF0dGVyblBhcnRpY2xlc1tpbmRleCArIHRoaXMucG9pbnRzQXRdLmNvb3Jkcy54Ly90aGVzZSB0d28gbGluZXMgYXJlIGZ1Y2tpbmcgdGhpbmdzIHNvbWVob3cgZGVsZXRpbmcgdGhlIGxhc3QgcGFydGljbGUgaW4gdGhlIGNoYXIgSSB0aGlua1xyXG4gICAgICAgIGxldCBwb2ludHNBdFkgPSBjaGFyUGF0dGVyblBhcnRpY2xlc1tpbmRleCArIHRoaXMucG9pbnRzQXRdLmNvb3Jkcy55XHJcbiAgICAgICAgY3R4MS5iZWdpblBhdGgoKVxyXG4gICAgICAgIGN0eDEubGluZVdpZHRoID0gMVxyXG4gICAgICAgIGxldCByZ2IgPSBjYW52YXNIZWxwZXJzLmNvbG9yQmV0d2VlblR3b0NvbG9ycyh0aGlzLmRpc3RNb3ZlZCwgJyMxZjI2MzMnLCAnI2ZmMDAwMCcpXHJcbiAgICAgICAgY3R4MS5zdHJva2VTdHlsZSA9IGByZ2IoJHtyZ2Iucn0sICR7cmdiLmd9LCAke3JnYi5ifSlgXHJcbiAgICAgICAgLy9jdHgxLnN0cm9rZVN0eWxlID0gdGhpcy5kaXN0TW92ZWQgPCAxID8gY29sb3JGcm9tIDogY29sb3JUb1xyXG4gICAgICAgIGN0eDEubW92ZVRvKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnkpXHJcbiAgICAgICAgY3R4MS5saW5lVG8ocG9pbnRzQXRYLCBwb2ludHNBdFkpXHJcbiAgICAgICAgY3R4MS5zdHJva2UoKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTUlTQyBIRUxQRVJTXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLU1BVEggSEVMUEVSU1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUdFT01FVFJZIEhFTFBFUlNcclxuZnVuY3Rpb24gcmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhwMSwgcDIpIHtcclxuICBjb25zdCBNSU5fRElTVCA9IDQwXHJcbiAgY29uc3QgRElTVF9NT0QgPSAwLjVcclxuICBjb25zdCBBTkdMRV9XSVRISU4gPSBNYXRoLlBJXHJcbiAgbGV0IGEgPSBwMi54IC0gcDEueFxyXG4gIGxldCBiID0gcDIueSAtIHAxLnlcclxuICBsZXQgcDFQMkRpc3QgPSBNYXRoLnNxcnQoYSphICsgYipiKVxyXG4gIGxldCByYW5kRGlzdCA9IChNYXRoLnJhbmRvbSgpICogcDFQMkRpc3QgKiBESVNUX01PRCkgKyBNSU5fRElTVFxyXG4gIGxldCBhbmdsZU1vZCA9IChNYXRoLnJhbmRvbSgpICogQU5HTEVfV0lUSElOKSAtIChBTkdMRV9XSVRISU4gLyAyKVxyXG4gIGxldCByYW5kQW5nbGVcclxuICBsZXQgY29vcmRzID0ge3g6IG51bGwsIHk6IG51bGx9XHJcblxyXG4gIGlmKE1hdGgucmFuZG9tKCkgPj0gMC41KSB7XHJcbiAgICByYW5kQW5nbGUgPSBNYXRoLmF0YW4yKHAyLnkgLSBwMS55LCBwMS54IC0gcDIueCkgKyBhbmdsZU1vZFxyXG4gICAgY29vcmRzLnggPSBwMi54ICsgTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgICBjb29yZHMueSA9IHAyLnkgLSBNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICB9IGVsc2Uge1xyXG4gICAgcmFuZEFuZ2xlID0gTWF0aC5hdGFuMihwMS55IC0gcDIueSwgcDIueCAtIHAxLngpICsgYW5nbGVNb2RcclxuICAgIGNvb3Jkcy54ID0gcDEueCArIE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gICAgY29vcmRzLnkgPSBwMS55IC0gTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgfVxyXG5cclxuICByZXR1cm4gY29vcmRzXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJhbmRQb2ludE5lYXJQb2ludChwdCkge1xyXG4gIGNvbnN0IE1BWF9GUk9NID0gNDBcclxuICBsZXQgcmFuZERpc3QgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBNQVhfRlJPTSlcclxuICBsZXQgcmFuZEFuZ2xlID0gTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyXHJcbiAgbGV0IHggPSBwdC54ICsgKE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdClcclxuICBsZXQgeSA9IHB0LnkgKyAoTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0KVxyXG5cclxuICByZXR1cm4ge3g6IHgsIHk6IHl9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNvb3Jkc09uU3RyYWlnaHRMaW5lKHBlcmNlbnQsIHN0YXJ0UHQsIGVuZFB0KSB7XHJcbiAgbGV0IHhUb3RhbCA9IGVuZFB0LnggLSBzdGFydFB0LnhcclxuICBsZXQgeVRvdGFsID0gZW5kUHQueSAtIHN0YXJ0UHQueVxyXG4gIGxldCB4RGlzdCA9IHBlcmNlbnQgKiB4VG90YWxcclxuICBsZXQgeURpc3QgPSBwZXJjZW50ICogeVRvdGFsXHJcblxyXG4gIHJldHVybiB7eDogc3RhcnRQdC54ICsgeERpc3QsIHk6IHN0YXJ0UHQueSArIHlEaXN0fVxyXG59XHJcblxyXG4vL3N0b2xlbiBmcm9tIHN0YWNrb3ZlcmZsb3dcclxuZnVuY3Rpb24gY29vcmRzT25DdWJpY0JlemllcihwZXJjZW50LCBzdGFydFB0LCBjcDEsIGNwMiwgZW5kUHQpIHtcclxuICBsZXQgdDIgPSBwZXJjZW50ICogcGVyY2VudFxyXG4gIGxldCB0MyA9IHQyICogcGVyY2VudFxyXG5cclxuICByZXR1cm4gc3RhcnRQdCArICgtc3RhcnRQdCAqIDMgKyBwZXJjZW50ICogKDMgKiBzdGFydFB0IC0gc3RhcnRQdCAqIHBlcmNlbnQpKSAqIHBlcmNlbnRcclxuICArICgzICogY3AxICsgcGVyY2VudCAqICgtNiAqIGNwMSArIGNwMSAqIDMgKiBwZXJjZW50KSkgKiBwZXJjZW50XHJcbiAgKyAoY3AyICogMyAtIGNwMiAqIDMgKiBwZXJjZW50KSAqIHQyXHJcbiAgKyBlbmRQdCAqIHQzXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1ERVYgRlVOQ1RJT05TIFdPVCBGT1IgVklTVUFMSVNJTkcgV0hBVCdTIE9DQ1VSSU5HXHJcbmZ1bmN0aW9uIHJlbmRlckJvdW5kaW5nQ2lyY2xlKGN0eCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkge1xyXG4gIGxldCBjZW50ZXJYID0gY2FudmFzV2lkdGggLyAyXHJcbiAgbGV0IGNlbnRlclkgPSBjYW52YXNIZWlnaHQgLyAyXHJcbiAgbGV0IHJhZGl1cyA9IGNlbnRlclkgPiBjZW50ZXJYID8gY2VudGVyWCAtIDIgOiBjZW50ZXJZIC0gMlxyXG4gIGxldCBzdGFydEFuZ2xlID0gMFxyXG4gIGxldCBlbmRBbmdsZSA9IDIgKiBNYXRoLlBJXHJcbiAgY3R4LmxpbmVXaWR0aCA9IDFcclxuICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JleSdcclxuICBjdHguYmVnaW5QYXRoKClcclxuICBjdHguYXJjKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckhvbGRQYXR0ZXJuV1BzKGN0eCwgd2F5cG9pbnRzKSB7XHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LmZpbGxTdHlsZSA9ICdibHVlJ1xyXG4gIHdheXBvaW50cy5mb3JFYWNoKHdwID0+IHtcclxuICAgIGN0eC5maWxsUmVjdCh3cC54IC0gNCwgd3AueSAtIDQsIDgsIDgpXHJcbiAgfSlcclxuICBjdHguc3Ryb2tlKClcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVySG9sZFBhdHRlcm5QYXJ0aWNsZVBhdGhzKGN0eCwgcGFydGljbGVzKSB7XHJcbiAgcGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xyXG4gICAgbGV0IGNwMVggPSBwYXJ0aWNsZS5jb29yZHMuY3AxeFxyXG4gICAgbGV0IGNwMVkgPSBwYXJ0aWNsZS5jb29yZHMuY3AxeVxyXG4gICAgbGV0IGNwMlggPSBwYXJ0aWNsZS5jb29yZHMuY3AyeFxyXG4gICAgbGV0IGNwMlkgPSBwYXJ0aWNsZS5jb29yZHMuY3AyeVxyXG4gICAgbGV0IHN0YXJ0WCA9IHBhcnRpY2xlLmNvb3Jkcy54MFxyXG4gICAgbGV0IHN0YXJ0WSA9IHBhcnRpY2xlLmNvb3Jkcy55MFxyXG4gICAgbGV0IGVuZFggPSBwYXJ0aWNsZS5jb29yZHMueDFcclxuICAgIGxldCBlbmRZID0gcGFydGljbGUuY29vcmRzLnkxXHJcbiAgICBjdHgubGluZVdpZHRoID0gMVxyXG4gICAgLy9yZW5kZXIgc3RhcnQgcG9pbnRcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZWVuJ1xyXG4gICAgY3R4LnJlY3Qoc3RhcnRYIC0gMiwgc3RhcnRZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgZW5kIHBvaW50XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAncmVkJ1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHgucmVjdChlbmRYIC0gMiwgZW5kWSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIGNvbnRyb2wgcG9pbnQgMVxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAneWVsbG93J1xyXG4gICAgY3R4LnJlY3QoY3AxWCAtIDIsIGNwMVkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBjb250cm9sIHBvaW50IDJcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ29yYW5nZSdcclxuICAgIGN0eC5yZWN0KGNwMlggLSAyLCBjcDJZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgcGF0aFxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JleSdcclxuICAgIGN0eC5tb3ZlVG8oc3RhcnRYLCBzdGFydFkpXHJcbiAgICBjdHguYmV6aWVyQ3VydmVUbyhjcDFYLCBjcDFZLCBjcDJYLCBjcDJZLCBlbmRYLCBlbmRZKVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgfSlcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUNPTE9SIEhFTFBFUlNcclxuZnVuY3Rpb24gY29sb3JCZXR3ZWVuVHdvQ29sb3JzKHBlcmNlbnQsIGNvbG9yT25lLCBjb2xvclR3bykge1xyXG4gIGxldCBoZXggPSBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnXVxyXG5cclxuICAvL2NvbG9yT25lXHJcbiAgbGV0IGMxUmVkSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCgxKSApXHJcbiAgbGV0IGMxUmVkSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCgyKSApXHJcbiAgbGV0IGMxUmVkQmFzZVRlbiA9IChjMVJlZEluZGV4MCAqIDE2KSArIChjMVJlZEluZGV4MSlcclxuXHJcbiAgbGV0IGMxR3JlZW5JbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDMpIClcclxuICBsZXQgYzFHcmVlbkluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoNCkgKVxyXG4gIGxldCBjMUdyZWVuZEJhc2VUZW4gPSAoYzFHcmVlbkluZGV4MCAqIDE2KSArIChjMUdyZWVuSW5kZXgxKVxyXG5cclxuICBsZXQgYzFCbHVlSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCg1KSApXHJcbiAgbGV0IGMxQmx1ZUluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoNikgKVxyXG4gIGxldCBjMUJsdWVCYXNlVGVuID0gKGMxQmx1ZUluZGV4MCAqIDE2KSArIChjMUJsdWVJbmRleDEpXHJcblxyXG4gIC8vY29sb3JUd29cclxuICBsZXQgYzJSZWRJbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDEpIClcclxuICBsZXQgYzJSZWRJbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDIpIClcclxuICBsZXQgYzJSZWRCYXNlVGVuID0gKGMyUmVkSW5kZXgwICogMTYpICsgKGMyUmVkSW5kZXgxKVxyXG5cclxuICBsZXQgYzJHcmVlbkluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoMykgKVxyXG4gIGxldCBjMkdyZWVuSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCg0KSApXHJcbiAgbGV0IGMyR3JlZW5kQmFzZVRlbiA9IChjMkdyZWVuSW5kZXgwICogMTYpICsgKGMyR3JlZW5JbmRleDEpXHJcblxyXG4gIGxldCBjMkJsdWVJbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDUpIClcclxuICBsZXQgYzJCbHVlSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCg2KSApXHJcbiAgbGV0IGMyQmx1ZUJhc2VUZW4gPSAoYzJCbHVlSW5kZXgwICogMTYpICsgKGMyQmx1ZUluZGV4MSlcclxuXHJcbiAgbGV0IHJlZERlbHRhID0gYzJSZWRCYXNlVGVuIC0gYzFSZWRCYXNlVGVuXHJcbiAgbGV0IGdyZWVuRGVsdGEgPSBjMkdyZWVuZEJhc2VUZW4gLSBjMUdyZWVuZEJhc2VUZW5cclxuICBsZXQgYmx1ZURlbHRhID0gYzJCbHVlQmFzZVRlbiAtIGMxQmx1ZUJhc2VUZW5cclxuXHJcbiAgbGV0IHJlZE5vdyA9IE1hdGgucm91bmQoIGMxUmVkQmFzZVRlbiArIChyZWREZWx0YSAqIHBlcmNlbnQpIClcclxuICBsZXQgZ3JlZW5Ob3cgPSBNYXRoLnJvdW5kKCBjMUdyZWVuZEJhc2VUZW4gKyAoZ3JlZW5EZWx0YSAqIHBlcmNlbnQpIClcclxuICBsZXQgYmx1ZU5vdyA9IE1hdGgucm91bmQoIGMxQmx1ZUJhc2VUZW4gKyAoYmx1ZURlbHRhICogcGVyY2VudCkgKVxyXG5cclxuICAvL2NvbnNvbGUubG9nKGByZWROb3c6ICR7cmVkTm93fSwgZ3JlZW5Ob3c6ICR7Z3JlZW5Ob3d9LCBibHVlTm93OiAke2JsdWVOb3d9YClcclxuXHJcbiAgcmV0dXJuIHtyOiByZWROb3csIGc6IGdyZWVuTm93LCBiOiBibHVlTm93fS8vdGVtcFxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVhQT1JUU1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICByYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzLFxyXG4gIHJhbmRQb2ludE5lYXJQb2ludCxcclxuICBjb29yZHNPblN0cmFpZ2h0TGluZSxcclxuICBjb29yZHNPbkN1YmljQmV6aWVyLFxyXG4gIGNvbG9yQmV0d2VlblR3b0NvbG9ycyxcclxuICAvL2RldlxyXG4gIHJlbmRlckJvdW5kaW5nQ2lyY2xlLFxyXG4gIHJlbmRlckhvbGRQYXR0ZXJuV1BzLFxyXG4gIHJlbmRlckhvbGRQYXR0ZXJuUGFydGljbGVQYXRoc1xyXG59XHJcbiIsIi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQ09PUkRTIEFTIFJBVElPIEFORCBWRUNUT1IgUE9JTlQgQVRTXHJcbmxldCBsZXR0ZXJzQ29vcmRzID0ge1xyXG4gIEE6IFtcclxuICAgIHt4OiAwLjEyNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAgLy8xXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0sICAgLy80XHJcbiAgICB7eDogMC44NzUsIHk6IDAuODc1fSAvLzVcclxuICBdLFxyXG4gIEI6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjI1fSwgLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC43NX0gIC8vNFxyXG4gIF0sXHJcbiAgQzogW1xyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjYyNX0sLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4zNzV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSAvLzNcclxuICBdLFxyXG4gIEQ6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sIC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1IH0sLy8xXHJcbiAgICB7eDogMC43NSwgeTogMC4zNzV9LCAvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjYyNX0gIC8vM1xyXG4gIF0sXHJcbiAgRTogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjV9LCAgLy80XHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9IC8vNVxyXG4gIF0sXHJcbiAgRjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjV9ICAgLy80XHJcbiAgXSxcclxuICBHOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNjI1fSwvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjM3NX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNjI1LCB5OiAwLjV9LCAvLzRcclxuICAgIHt4OiAwLjg3NSwgeTogMC41fSAgLy81XHJcbiAgXSxcclxuICBIOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0sICAvLzRcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0gLy81XHJcbiAgXSxcclxuICBJOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuNSwgeTogMC44NzV9LCAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8yXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNSwgeTogMC4xMjV9LCAvLzRcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0gLy81XHJcbiAgXSxcclxuICBcIiBcIjogW10vL2VuYWJsZXMgaGF2aW5nIHNwYWNlcyBiZXR3ZWVuIGxldHRlcnNcclxufVxyXG5cclxuXHJcbmxldCBsZXR0ZXJzVmVjdG9ycyA9IHsvL1RvZG8gLSBjaGVjayBpZCB0aGlzIHN0aWxsIG5lZWRzIHRvIGJlIGV4cG9ydGVkXHJcbiAgQTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBCOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC00fVxyXG4gIF0sXHJcbiAgQzogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBEOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTN9XHJcbiAgXSxcclxuICBFOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTV9XHJcbiAgXSxcclxuICBGOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIEc6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtNX1cclxuICBdLFxyXG4gIEg6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgSTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXVxyXG59XHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1IRUxQRVIgRlVOQ1RJT05TXHJcbmZ1bmN0aW9uIHRvdGFsUmVxdWlyZWRQYXJ0aWNsZXMoc3RyKSB7XHJcbiAgbGV0IHJlcXVpcmVkUGFydGljbGVzID0gMFxyXG5cclxuICBmb3IoaSBpbiBzdHIpIHtcclxuICAgIHJlcXVpcmVkUGFydGljbGVzICs9IGxldHRlcnNDb29yZHNbc3RyLmNoYXJBdChpKV0ubGVuZ3RoXHJcbiAgfVxyXG4gIGNvbnNvbGUubG9nKFwidG90YWwgcmVxdWlyZWRQYXJ0aWNsZXM6IFwiICsgcmVxdWlyZWRQYXJ0aWNsZXMpXHJcbiAgcmV0dXJuIHJlcXVpcmVkUGFydGljbGVzXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBwbGFjZVdvcmRzSW5Sb3dzKHN0ciwgbWF4Q2hhcnNJblJvdykge1xyXG4gIGxldCB3b3JkcyA9IHN0ci5zcGxpdChcIiBcIilcclxuICBsZXQgcm93cyA9IFtcIlwiXVxyXG4gIGxldCByb3dzSW5kZXggPSAwXHJcblxyXG4gIHdvcmRzLmZvckVhY2goKHdvcmQsIGluZGV4KSA9PiB7XHJcbiAgICBpZihyb3dzW3Jvd3NJbmRleF0ubGVuZ3RoICsgd29yZC5sZW5ndGggKyAxIDw9IG1heENoYXJzSW5Sb3cpIHtcclxuICAgICAgcm93c1tyb3dzSW5kZXhdID0gaW5kZXggPT09IDAgPyByb3dzW3Jvd3NJbmRleF0gKyB3b3JkIDogcm93c1tyb3dzSW5kZXhdICsgXCIgXCIgKyB3b3JkXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByb3dzLnB1c2god29yZClcclxuICAgICAgcm93c0luZGV4KytcclxuICAgIH1cclxuICB9KVxyXG5cclxuICByZXR1cm4gcm93c1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY2FsY0xldHRlclBhcnRpY2xlc0Rlc3RBbmRUYXJnZXRzKHdvcmRzSW5Sb3dzLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KSB7XHJcbiAgbGV0IGNoYXJXaWR0aCA9IE1hdGgucm91bmQoY2FudmFzV2lkdGggLyAxNClcclxuICBsZXQgY2hhckhlaWdodCA9IE1hdGgucm91bmQoY2hhcldpZHRoICogMS4yKVxyXG4gIGxldCB0b3RhbFJvd3NIZWlnaHQgPSBjaGFySGVpZ2h0ICogKHdvcmRzSW5Sb3dzLmxlbmd0aCArIDEpXHJcbiAgbGV0IGZpbmFsQ29vcmRzQW5kUG9pbnRzQXRzID0gW11cclxuXHJcbiAgZm9yKGxldCByb3cgaW4gd29yZHNJblJvd3MpIHtcclxuICAgIGxldCByb3dTdGFydFggPSAoY2FudmFzV2lkdGggLyAyKSAtICh3b3Jkc0luUm93c1tyb3ddLmxlbmd0aCAqIGNoYXJXaWR0aCAvIDIpXHJcbiAgICBsZXQgcm93U3RhcnRZID0gKGNhbnZhc0hlaWdodCAvIDIpIC0gKHRvdGFsUm93c0hlaWdodCAvIDIpICsgKHJvdyAqIGNoYXJIZWlnaHQpXHJcblxyXG4gICAgZm9yKGxldCBsZXR0ZXJQb3MgPSAwOyBsZXR0ZXJQb3MgPCB3b3Jkc0luUm93c1tyb3ddLmxlbmd0aDsgbGV0dGVyUG9zKyspIHtcclxuICAgICAgbGV0IGNoYXJIZXJlID0gd29yZHNJblJvd3Nbcm93XS5jaGFyQXQobGV0dGVyUG9zKVxyXG4gICAgICBsZXQgbkNoYXJQYXJ0aWNsZXMgPSBsZXR0ZXJzQ29vcmRzW2NoYXJIZXJlXS5sZW5ndGhcclxuXHJcbiAgICAgIGZvcihsZXQgcG9zSW5DaGFyID0gMDsgcG9zSW5DaGFyIDwgbkNoYXJQYXJ0aWNsZXM7IHBvc0luQ2hhcisrKSB7XHJcbiAgICAgICAgbGV0IHgxID0gcm93U3RhcnRYICsgKGxldHRlclBvcyAqIGNoYXJXaWR0aCkgKyAoY2hhcldpZHRoICogbGV0dGVyc0Nvb3Jkc1tjaGFySGVyZV1bcG9zSW5DaGFyXS54KVxyXG4gICAgICAgIGxldCB5MSA9IHJvd1N0YXJ0WSArIChjaGFySGVpZ2h0ICogbGV0dGVyc0Nvb3Jkc1tjaGFySGVyZV1bcG9zSW5DaGFyXS55KVxyXG4gICAgICAgIGxldCBwb2ludHNBdCA9IGZhbHNlXHJcblxyXG4gICAgICAgIGlmKGxldHRlcnNWZWN0b3JzW2NoYXJIZXJlXVtwb3NJbkNoYXJdLmhhc1ZlY3RvciA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgcG9pbnRzQXQgPSBsZXR0ZXJzVmVjdG9yc1tjaGFySGVyZV1bcG9zSW5DaGFyXS5pbmRleE9mZnNldFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZmluYWxDb29yZHNBbmRQb2ludHNBdHMucHVzaCh7eDE6IHgxLCB5MTogeTEsIHBvaW50c0F0OiBwb2ludHNBdH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBmaW5hbENvb3Jkc0FuZFBvaW50c0F0c1xyXG59XHJcblxyXG5cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGxldHRlcnNDb29yZHMsXHJcbiAgbGV0dGVyc1ZlY3RvcnMsXHJcbiAgcGxhY2VXb3Jkc0luUm93cyxcclxuICB0b3RhbFJlcXVpcmVkUGFydGljbGVzLFxyXG4gIGNhbGNMZXR0ZXJQYXJ0aWNsZXNEZXN0QW5kVGFyZ2V0c1xyXG59XHJcblxyXG4vL2hhdmUgYSBmdW5jdGlvbiB0aGF0IHRha2VzIGluIGEgc3RyaW5nIGFuZCByZXR1cm5zIHRvdGFsIG5QYXJ0aWNsZXMgdXNpbmcgbGVuZ3RocyBvZiBlYWNoIGxldHRlciBhcnJheVxyXG4iXX0=
