(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const canvasHelpers = require('./utils/canvas-helpers.js')
const lettersLib = require('./utils/letters-lib.js')

const CHAR_PATTERN_WORDS = 'YAY ANOTHER NEW BUG'//for now defined staticly here, later will come from caurosel
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
const HOLD_SPEED = 0.0025

const NAV_LINKS = [//not implemented yet
  {
    links_group: 'Links group #0',
    links_items: [
      {linkRef: 'url', particleText: 'GROUP ZERO LINK ZERO'},
      {linkRef: 'url', particleText: 'GROUP ZERO LINK ONE'},
      {linkRef: 'url', particleText: 'GROUP ZERO LINK TWO'}
    ]
  },
  {
    links_group: 'Links group #1',
    links_items: [
      {linkRef: 'url', particleText: 'GROUP ONE LINK ZERO'},
      {linkRef: 'url', particleText: 'GROUP ONE LINK ONE'},
      {linkRef: 'url', particleText: 'GROUP ONE LINK TWO'}
    ]
  }
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
navGoToButton.addEventListener('click', formNewParticleWord, false)


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

    holdPatternParticles.push(new HoldPatternParticle(coords, HOLD_SPEED, distMoved, nextWP))
  }
}


function formNewParticleWord() {
  cancelAnimationFrame(frameId)//not sure if needed
  charToHoldTransition()
  holdToCharTransition()
  animate()//not sure if needed
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

      let speed = HOLD_SPEED * 4
      let distMoved = 0
      let pointsAt = destinationsAndTargets[i].pointsAt
      charPatternParticles.push(new CharPatternParticle(coords, speed, distMoved, pointsAt))
    }

  }
}


function charToHoldTransition() {
  while(charPatternParticles.length > 0) {
    let transferringParticle = charPatternParticles.pop()
    let distMoved = 0
    let speed =  Math.round( (Math.random() * (HOLD_SPEED * 10 - HOLD_SPEED) + HOLD_SPEED) * 1000 ) / 1000
    let fromWP = Math.floor(Math.random() * 6)
    let nextWP = fromWP + 1 === HOLD_PATTERN_WAYPOINTS.length ? 0 : fromWP + 1
    let startCoords = {x: transferringParticle.coords.x, y: transferringParticle.coords.y}
    let endCoords = canvasHelpers.randPointNearPoint(holdPatternWaypointsActual[nextWP])
    let cp1Coords = canvasHelpers.randPointBetweenTwoPoints(startCoords, endCoords)
    let cp2Coords = canvasHelpers.randPointBetweenTwoPoints(startCoords, endCoords)
    let coords = {
      x: startCoords.x,
      y: startCoords.y,
      x0: startCoords.x,
      y0: startCoords.y,
      x1: endCoords.x,
      y1: endCoords.y,
      cp1x: cp1Coords.x,
      cp1y: cp1Coords.y,
      cp2x: cp2Coords.x,
      cp2y: cp2Coords.y
    }

    holdPatternParticles.unshift(new HoldPatternParticle(coords, speed, distMoved, nextWP))
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
      this.speed = HOLD_SPEED
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
    if (this.distMoved > 1) {this.distMoved = 1}//prevent overshoot

    let newPos = canvasHelpers.coordsOnStraightLine(this.distMoved, {x: this.coords.x0, y: this.coords.y0}, {x: this.coords.x1, y: this.coords.y1})
    this.coords.x = newPos.x
    this.coords.y = newPos.y
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
  V: [
    {x: 0.25, y: 0.125},
    {x: 0.5, y: 0.875},
    {x: 0.75, y: 0.125}
  ],
  W: [
    {x: 0.125, y: 0.125},
    {x: 0.375, y: 0.875},
    {x: 0.5, y: 0.25},
    {x: 0.625, y: 0.875},
    {x: 0.875, y: 0.125}
  ],
  X: [
    {x: 0.25, y: 0.125},
    {x: 0.75, y: 0.875},
    {x: 0.75, y: 0.125},
    {x: 0.25, y: 0.875}
  ],
  Y: [
    {x: 0.5, y: 0.875},
    {x: 0.5, y: 0.5},
    {x: 0.25, y: 0.125},
    {x: 0.75, y: 0.125}
  ],
  Z: [
    {x: 0.25, y: 0.125},
    {x: 0.75, y: 0.125},
    {x: 0.25, y: 0.875},
    {x: 0.75, y: 0.875}
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
  ],
  V: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  W: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  X: [
    {hasVector: true, indexOffset: 1},
    {hasVector: false},
    {hasVector: true, indexOffset: 1},
    {hasVector: false}
  ],
  Y: [
    {hasVector: true, indexOffset: 1},
    {hasVector: true, indexOffset: 1},
    {hasVector: false},
    {hasVector: true, indexOffset: -2}
  ],
  Z: [
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2FudmFzLWhlbHBlcnMuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9sZXR0ZXJzLWxpYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgY2FudmFzSGVscGVycyA9IHJlcXVpcmUoJy4vdXRpbHMvY2FudmFzLWhlbHBlcnMuanMnKVxyXG5jb25zdCBsZXR0ZXJzTGliID0gcmVxdWlyZSgnLi91dGlscy9sZXR0ZXJzLWxpYi5qcycpXHJcblxyXG5jb25zdCBDSEFSX1BBVFRFUk5fV09SRFMgPSAnWUFZIEFOT1RIRVIgTkVXIEJVRycvL2ZvciBub3cgZGVmaW5lZCBzdGF0aWNseSBoZXJlLCBsYXRlciB3aWxsIGNvbWUgZnJvbSBjYXVyb3NlbFxyXG5jb25zdCBNQVhfQ0hBUlNfUEVSX1JPVyA9IDEyXHJcbmNvbnN0IFRPVEFMX1BBUlRJQ0xFUyA9IDIwMFxyXG5jb25zdCBIT0xEX1BBVFRFUk5fV0FZUE9JTlRTID0gWy8vY29vcmRzIGFzICUgb2YgY2FudmFzIHNpemVcclxuICB7eDogMC4xMjUsIHk6IDAuNX0sXHJcbiAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICB7eDogMC43NSwgeTogMC4xMjV9LFxyXG4gIHt4OiAwLjg3NSwgeTogMC41fSxcclxuICB7eDogMC43NSwgeTogMC44NzV9LFxyXG4gIHt4OiAwLjI1LCB5OiAwLjg3NX1cclxuXVxyXG5jb25zdCBIT0xEX1NQRUVEID0gMC4wMDI1XHJcblxyXG5jb25zdCBOQVZfTElOS1MgPSBbLy9ub3QgaW1wbGVtZW50ZWQgeWV0XHJcbiAge1xyXG4gICAgbGlua3NfZ3JvdXA6ICdMaW5rcyBncm91cCAjMCcsXHJcbiAgICBsaW5rc19pdGVtczogW1xyXG4gICAgICB7bGlua1JlZjogJ3VybCcsIHBhcnRpY2xlVGV4dDogJ0dST1VQIFpFUk8gTElOSyBaRVJPJ30sXHJcbiAgICAgIHtsaW5rUmVmOiAndXJsJywgcGFydGljbGVUZXh0OiAnR1JPVVAgWkVSTyBMSU5LIE9ORSd9LFxyXG4gICAgICB7bGlua1JlZjogJ3VybCcsIHBhcnRpY2xlVGV4dDogJ0dST1VQIFpFUk8gTElOSyBUV08nfVxyXG4gICAgXVxyXG4gIH0sXHJcbiAge1xyXG4gICAgbGlua3NfZ3JvdXA6ICdMaW5rcyBncm91cCAjMScsXHJcbiAgICBsaW5rc19pdGVtczogW1xyXG4gICAgICB7bGlua1JlZjogJ3VybCcsIHBhcnRpY2xlVGV4dDogJ0dST1VQIE9ORSBMSU5LIFpFUk8nfSxcclxuICAgICAge2xpbmtSZWY6ICd1cmwnLCBwYXJ0aWNsZVRleHQ6ICdHUk9VUCBPTkUgTElOSyBPTkUnfSxcclxuICAgICAge2xpbmtSZWY6ICd1cmwnLCBwYXJ0aWNsZVRleHQ6ICdHUk9VUCBPTkUgTElOSyBUV08nfVxyXG4gICAgXVxyXG4gIH1cclxuXVxyXG5cclxubGV0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdXHJcbmxldCBjYW52YXMxID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2NhbnZhcycpWzBdXHJcbmxldCBjdHgxID0gY2FudmFzMS5nZXRDb250ZXh0KCcyZCcpXHJcbmxldCBuYXZHb1RvQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdmlnYXRvckRlc2MnKS8vZGV2XHJcbmxldCBmcmFtZUlkXHJcbmxldCBjYW52YXNXaWR0aFxyXG5sZXQgY2FudmFzSGVpZ2h0XHJcbmxldCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCA9IFtdLy9jb29yZHMgaW4gcGl4ZWxzLCByZWNhbGN1bGF0ZWQgb24gcmVzaXplXHJcbmxldCBob2xkUGF0dGVyblBhcnRpY2xlcyA9IFtdXHJcbmxldCBjaGFyUGF0dGVyblBhcnRpY2xlcyA9IFtdXHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FVkVOVFNcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdClcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGluaXQpXHJcbm5hdkdvVG9CdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmb3JtTmV3UGFydGljbGVXb3JkLCBmYWxzZSlcclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUZMT1cgQ09OVFJPTCAmIElOSVRJQUxJWkVSU1xyXG5mdW5jdGlvbiBpbml0KCkge1xyXG4gIHJlc2V0KClcclxuICBzZXRMYXlvdXQoKVxyXG4gIGNhbGNIb2xkUGF0dGVybldheXBvaW50Q29vcmRzKClcclxuICBpbml0SG9sZFBhdHRlcm5QYXJ0aWNsZXMoVE9UQUxfUEFSVElDTEVTKVxyXG4gIGFuaW1hdGUoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmVzZXQoKSB7XHJcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVJZClcclxuICBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbC5sZW5ndGggPSAwXHJcbiAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMubGVuZ3RoID0gMFxyXG4gIGNoYXJQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA9IDBcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNhbGNIb2xkUGF0dGVybldheXBvaW50Q29vcmRzKCkge1xyXG4gIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsID0gSE9MRF9QQVRURVJOX1dBWVBPSU5UUy5tYXAoZWwgPT4ge1xyXG4gICAgcmV0dXJuIHt4OiBlbC54ICogY2FudmFzV2lkdGgsIHk6IGVsLnkgKiBjYW52YXNIZWlnaHR9XHJcbiAgfSlcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGluaXRIb2xkUGF0dGVyblBhcnRpY2xlcyhuUGFydGljbGVzKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IG5QYXJ0aWNsZXM7IGkrKykge1xyXG4gICAgbGV0IGZyb21XUCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDYpXHJcbiAgICBsZXQgbmV4dFdQID0gZnJvbVdQICsgMSA9PT0gSE9MRF9QQVRURVJOX1dBWVBPSU5UUy5sZW5ndGggPyAwIDogZnJvbVdQICsgMVxyXG4gICAgbGV0IGRpc3RNb3ZlZCA9IE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiAxMCApIC8gMTBcclxuICAgIGxldCBzdGFydENvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW2Zyb21XUF0pXHJcbiAgICBsZXQgZW5kQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbbmV4dFdQXSlcclxuICAgIGxldCBjcDFDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoc3RhcnRDb29yZHMsIGVuZENvb3JkcylcclxuICAgIGxldCBjcDJDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoc3RhcnRDb29yZHMsIGVuZENvb3JkcylcclxuICAgIGxldCBjb29yZHMgPSB7XHJcbiAgICAgIHg6IHN0YXJ0Q29vcmRzLngsIHk6IHN0YXJ0Q29vcmRzLnksXHJcbiAgICAgIHgwOiBzdGFydENvb3Jkcy54LCB5MDogc3RhcnRDb29yZHMueSxcclxuICAgICAgeDE6IGVuZENvb3Jkcy54LCB5MTogZW5kQ29vcmRzLnksXHJcbiAgICAgIGNwMXg6IGNwMUNvb3Jkcy54LCBjcDF5OiBjcDFDb29yZHMueSxcclxuICAgICAgY3AyeDogY3AyQ29vcmRzLngsIGNwMnk6IGNwMkNvb3Jkcy55XHJcbiAgICB9XHJcblxyXG4gICAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMucHVzaChuZXcgSG9sZFBhdHRlcm5QYXJ0aWNsZShjb29yZHMsIEhPTERfU1BFRUQsIGRpc3RNb3ZlZCwgbmV4dFdQKSlcclxuICB9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBmb3JtTmV3UGFydGljbGVXb3JkKCkge1xyXG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lKGZyYW1lSWQpLy9ub3Qgc3VyZSBpZiBuZWVkZWRcclxuICBjaGFyVG9Ib2xkVHJhbnNpdGlvbigpXHJcbiAgaG9sZFRvQ2hhclRyYW5zaXRpb24oKVxyXG4gIGFuaW1hdGUoKS8vbm90IHN1cmUgaWYgbmVlZGVkXHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1UUkFOU0lUSU9OIFBBUlRJQ0xFUyBCRVRXRUVOIEJFSEFWSU9VUiBUWVBFU1xyXG5mdW5jdGlvbiBob2xkVG9DaGFyVHJhbnNpdGlvbigpIHtcclxuICBsZXQgcmVxdWlyZWRQYXJ0aWNsZXMgPSBsZXR0ZXJzTGliLnRvdGFsUmVxdWlyZWRQYXJ0aWNsZXMoQ0hBUl9QQVRURVJOX1dPUkRTKVxyXG4gIGxldCB3b3Jkc0luUm93cyA9IGxldHRlcnNMaWIucGxhY2VXb3Jkc0luUm93cyhDSEFSX1BBVFRFUk5fV09SRFMsIE1BWF9DSEFSU19QRVJfUk9XKVxyXG4gIGxldCBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzID0gbGV0dGVyc0xpYi5jYWxjTGV0dGVyUGFydGljbGVzRGVzdEFuZFRhcmdldHMod29yZHNJblJvd3MsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpXHJcblxyXG4gIGlmIChob2xkUGF0dGVyblBhcnRpY2xlcy5sZW5ndGggPiByZXF1aXJlZFBhcnRpY2xlcykge1xyXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IHJlcXVpcmVkUGFydGljbGVzOyBpKyspIHtcclxuICAgICAgbGV0IHRyYW5zZmVycmluZ1BhcnRpY2xlID0gaG9sZFBhdHRlcm5QYXJ0aWNsZXMucG9wKClcclxuICAgICAgbGV0IGNvb3JkcyA9IHtcclxuICAgICAgICB4OiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueCxcclxuICAgICAgICB5OiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueSxcclxuICAgICAgICB4MDogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLngsXHJcbiAgICAgICAgeTA6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy55LFxyXG4gICAgICAgIHgxOiBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzW2ldLngxLFxyXG4gICAgICAgIHkxOiBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzW2ldLnkxXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBzcGVlZCA9IEhPTERfU1BFRUQgKiA0XHJcbiAgICAgIGxldCBkaXN0TW92ZWQgPSAwXHJcbiAgICAgIGxldCBwb2ludHNBdCA9IGRlc3RpbmF0aW9uc0FuZFRhcmdldHNbaV0ucG9pbnRzQXRcclxuICAgICAgY2hhclBhdHRlcm5QYXJ0aWNsZXMucHVzaChuZXcgQ2hhclBhdHRlcm5QYXJ0aWNsZShjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQsIHBvaW50c0F0KSlcclxuICAgIH1cclxuXHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY2hhclRvSG9sZFRyYW5zaXRpb24oKSB7XHJcbiAgd2hpbGUoY2hhclBhdHRlcm5QYXJ0aWNsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgbGV0IHRyYW5zZmVycmluZ1BhcnRpY2xlID0gY2hhclBhdHRlcm5QYXJ0aWNsZXMucG9wKClcclxuICAgIGxldCBkaXN0TW92ZWQgPSAwXHJcbiAgICBsZXQgc3BlZWQgPSAgTWF0aC5yb3VuZCggKE1hdGgucmFuZG9tKCkgKiAoSE9MRF9TUEVFRCAqIDEwIC0gSE9MRF9TUEVFRCkgKyBIT0xEX1NQRUVEKSAqIDEwMDAgKSAvIDEwMDBcclxuICAgIGxldCBmcm9tV1AgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2KVxyXG4gICAgbGV0IG5leHRXUCA9IGZyb21XUCArIDEgPT09IEhPTERfUEFUVEVSTl9XQVlQT0lOVFMubGVuZ3RoID8gMCA6IGZyb21XUCArIDFcclxuICAgIGxldCBzdGFydENvb3JkcyA9IHt4OiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueCwgeTogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLnl9XHJcbiAgICBsZXQgZW5kQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbbmV4dFdQXSlcclxuICAgIGxldCBjcDFDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoc3RhcnRDb29yZHMsIGVuZENvb3JkcylcclxuICAgIGxldCBjcDJDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoc3RhcnRDb29yZHMsIGVuZENvb3JkcylcclxuICAgIGxldCBjb29yZHMgPSB7XHJcbiAgICAgIHg6IHN0YXJ0Q29vcmRzLngsXHJcbiAgICAgIHk6IHN0YXJ0Q29vcmRzLnksXHJcbiAgICAgIHgwOiBzdGFydENvb3Jkcy54LFxyXG4gICAgICB5MDogc3RhcnRDb29yZHMueSxcclxuICAgICAgeDE6IGVuZENvb3Jkcy54LFxyXG4gICAgICB5MTogZW5kQ29vcmRzLnksXHJcbiAgICAgIGNwMXg6IGNwMUNvb3Jkcy54LFxyXG4gICAgICBjcDF5OiBjcDFDb29yZHMueSxcclxuICAgICAgY3AyeDogY3AyQ29vcmRzLngsXHJcbiAgICAgIGNwMnk6IGNwMkNvb3Jkcy55XHJcbiAgICB9XHJcblxyXG4gICAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMudW5zaGlmdChuZXcgSG9sZFBhdHRlcm5QYXJ0aWNsZShjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQsIG5leHRXUCkpXHJcbiAgfVxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVVQREFURSBQQVJUSUNMRSBQT1NJVElPTlMgJiBSRU5ERVJcclxuZnVuY3Rpb24gYW5pbWF0ZSgpIHtcclxuICBmcmFtZUlkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGFuaW1hdGUpXHJcbiAgY3R4MS5jbGVhclJlY3QoMCwgMCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodClcclxuICAvL2NhbnZhc0hlbHBlcnMucmVuZGVyQm91bmRpbmdDaXJjbGUoY3R4MSwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkvL2RldlxyXG4gIC8vY2FudmFzSGVscGVycy5yZW5kZXJIb2xkUGF0dGVybldQcyhjdHgxLCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCkvL2RldlxyXG4gIC8vY2FudmFzSGVscGVycy5yZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHMoY3R4MSwgaG9sZFBhdHRlcm5QYXJ0aWNsZXMpLy9kZXZcclxuICB1cGRhdGVIb2xkUGF0dGVyblBhcnRpY2xlcygpXHJcbiAgdXBkYXRlQ2hhclBhdHRlcm5QYXJ0aWNsZXMoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gdXBkYXRlSG9sZFBhdHRlcm5QYXJ0aWNsZXMoKSB7XHJcbiAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7Ly90aGluayB0aGlzIHNob3VsZCBiZSBtb3ZlZCB0byBhIG1ldGhvZCBvbiBob2xkUGFydGljbGUgY2xhc3M/P1xyXG4gICAgcGFydGljbGUudXBkYXRlUG9zKClcclxuICAgIHBhcnRpY2xlLmRyYXcoJ3doaXRlJylcclxuICB9KVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQ2hhclBhdHRlcm5QYXJ0aWNsZXMoKSB7XHJcbiAgY2hhclBhdHRlcm5QYXJ0aWNsZXMuZm9yRWFjaCgocGFydGljbGUsIGluZGV4KSA9PiB7XHJcbiAgICBwYXJ0aWNsZS51cGRhdGVQb3MoKVxyXG4gICAgcGFydGljbGUuZHJhdygnd2hpdGUnLCAncmVkJylcclxuICAgIHBhcnRpY2xlLmRyYXdUb1BvaW50c0F0KGluZGV4LCAnIzFmMjYzMycsICcjZmYwMDAwJylcclxuICB9KVxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUxBWU9VVCBCUkVBSyBQT0lOVFNcclxuZnVuY3Rpb24gc2V0TGF5b3V0KCkge1xyXG4gIC8vc21hbGwgd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC41XHJcbiAgfVxyXG4gIC8vc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcbiAgLy9tZWRpdW0gd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gMTAyNCAmJiBib2R5LmNsaWVudFdpZHRoID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuN1xyXG4gIH1cclxuICAvL21lZGl1bSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA8PSAxMDI0ICYmIGJvZHkuY2xpZW50SGVpZ2h0ID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjY1XHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuICAvL2xhcmdlIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoID4gMTAyNCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbGFyZ2Ugd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNjVcclxuICB9XHJcbiAgLy9sYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcblxyXG4gIGNhbnZhczEud2lkdGggPSBjYW52YXNXaWR0aFxyXG4gIGNhbnZhczEuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0XHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tUEFSVElDTEUgQ0xBU1NFU1xyXG5jbGFzcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkKSB7XHJcbiAgICB0aGlzLmNvb3JkcyA9IGNvb3Jkc1xyXG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkXHJcbiAgICB0aGlzLmRpc3RNb3ZlZCA9IGRpc3RNb3ZlZFxyXG4gIH1cclxuXHJcbiAgZHJhdyhjb2xvcikgey8vZGVmYXVsdCBzZWxmIHJlbmRlciBmb3IgcGFydGljbGVzLCBtYXliZSBjaGFuZ2UgbGF0ZXJcclxuICAgIGN0eDEuYmVnaW5QYXRoKClcclxuICAgIGN0eDEubGluZVdpZHRoID0gM1xyXG4gICAgY3R4MS5zdHJva2VTdHlsZSA9IGNvbG9yXHJcbiAgICBjdHgxLmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eDEuYXJjKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnksIDMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSlcclxuICAgIGN0eDEuc3Ryb2tlKClcclxuICAgIGN0eDEuZmlsbCgpXHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3MoKSB7XHJcbiAgICB0aGlzLmNvb3Jkcy54ICs9IHRoaXMuc3BlZWRcclxuICAgIHRoaXMuY29vcmRzLnkgKz0gdGhpcy5zcGVlZFxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgSG9sZFBhdHRlcm5QYXJ0aWNsZSBleHRlbmRzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQsIG5leHRXUCkge1xyXG4gICAgc3VwZXIoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkKVxyXG4gICAgdGhpcy5uZXh0V1AgPSBuZXh0V1BcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvcygpIHtcclxuICAgIHRoaXMuZGlzdE1vdmVkICs9IHRoaXMuc3BlZWRcclxuICAgIGlmKHRoaXMuZGlzdE1vdmVkID49IDEpIHtcclxuICAgICAgdGhpcy5kaXN0TW92ZWQgPSAwXHJcbiAgICAgIHRoaXMuc3BlZWQgPSBIT0xEX1NQRUVEXHJcbiAgICAgIHRoaXMubmV4dFdQID0gdGhpcy5uZXh0V1AgPT09IEhPTERfUEFUVEVSTl9XQVlQT0lOVFMubGVuZ3RoIC0gMSA/IDAgOiB0aGlzLm5leHRXUCArIDFcclxuICAgICAgdGhpcy5jb29yZHMueDAgPSB0aGlzLmNvb3Jkcy54MVxyXG4gICAgICB0aGlzLmNvb3Jkcy55MCA9IHRoaXMuY29vcmRzLnkxXHJcbiAgICAgIHRoaXMuY29vcmRzLngxID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbdGhpcy5uZXh0V1BdKS54XHJcbiAgICAgIHRoaXMuY29vcmRzLnkxID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbdGhpcy5uZXh0V1BdKS55XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMXggPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS54XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMXkgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS55XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMnggPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS54XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMnkgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS55XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvb3Jkcy54ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHRoaXMuZGlzdE1vdmVkLCB0aGlzLmNvb3Jkcy54MCwgdGhpcy5jb29yZHMuY3AxeCwgdGhpcy5jb29yZHMuY3AyeCwgdGhpcy5jb29yZHMueDEpXHJcbiAgICB0aGlzLmNvb3Jkcy55ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHRoaXMuZGlzdE1vdmVkLCB0aGlzLmNvb3Jkcy55MCwgdGhpcy5jb29yZHMuY3AxeSwgdGhpcy5jb29yZHMuY3AyeSwgdGhpcy5jb29yZHMueTEpXHJcbiAgfVxyXG59XHJcblxyXG5jbGFzcyBDaGFyUGF0dGVyblBhcnRpY2xlIGV4dGVuZHMgUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZCwgcG9pbnRzQXQpIHtcclxuICAgIHN1cGVyKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZClcclxuICAgIHRoaXMucG9pbnRzQXQgPSBwb2ludHNBdFxyXG4gIH1cclxuXHJcbiAgdXBkYXRlUG9zKCkge1xyXG4gICAgdGhpcy5kaXN0TW92ZWQgKz0gdGhpcy5zcGVlZFxyXG4gICAgaWYgKHRoaXMuZGlzdE1vdmVkID4gMSkge3RoaXMuZGlzdE1vdmVkID0gMX0vL3ByZXZlbnQgb3ZlcnNob290XHJcblxyXG4gICAgbGV0IG5ld1BvcyA9IGNhbnZhc0hlbHBlcnMuY29vcmRzT25TdHJhaWdodExpbmUodGhpcy5kaXN0TW92ZWQsIHt4OiB0aGlzLmNvb3Jkcy54MCwgeTogdGhpcy5jb29yZHMueTB9LCB7eDogdGhpcy5jb29yZHMueDEsIHk6IHRoaXMuY29vcmRzLnkxfSlcclxuICAgIHRoaXMuY29vcmRzLnggPSBuZXdQb3MueFxyXG4gICAgdGhpcy5jb29yZHMueSA9IG5ld1Bvcy55XHJcbiAgfVxyXG5cclxuICBkcmF3KGNvbG9yRnJvbSwgY29sb3JUbykge1xyXG4gICAgY3R4MS5iZWdpblBhdGgoKVxyXG4gICAgY3R4MS5saW5lV2lkdGggPSAzXHJcbiAgICBsZXQgcmdiID0gY2FudmFzSGVscGVycy5jb2xvckJldHdlZW5Ud29Db2xvcnModGhpcy5kaXN0TW92ZWQsICcjZmZmZmZmJywgJyNmZjAwMDAnKS8vZGV2XHJcbiAgICBjdHgxLnN0cm9rZVN0eWxlID0gYHJnYigke3JnYi5yfSwgJHtyZ2IuZ30sICR7cmdiLmJ9KWBcclxuICAgIC8vY3R4MS5zdHJva2VTdHlsZSA9IHRoaXMuZGlzdE1vdmVkIDwgMSA/IGNvbG9yRnJvbSA6IGNvbG9yVG8vL3dyaXRlIGZ1bmN0aW9uIHRvIHRyYW5zaXRpb24gYmV0d2VlbiAyIGNvbG91cnMgdGhhdCB0YWtlcyAlIGFzIGFuIGFyZ1xyXG4gICAgY3R4MS5maWxsU3R5bGUgPSAnYmxhY2snXHJcbiAgICBjdHgxLmFyYyh0aGlzLmNvb3Jkcy54LCB0aGlzLmNvb3Jkcy55LCAzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpXHJcbiAgICBjdHgxLnN0cm9rZSgpXHJcbiAgICBjdHgxLmZpbGwoKVxyXG4gIH1cclxuXHJcbiAgZHJhd1RvUG9pbnRzQXQoaW5kZXgsIGNvbG9yRnJvbSwgY29sb3JUbykge1xyXG4gICAgaWYodGhpcy5kaXN0TW92ZWQgPiAwLjEpIHtcclxuICAgICAgaWYodGhpcy5wb2ludHNBdCAhPT0gZmFsc2UpIHtcclxuICAgICAgICBsZXQgcG9pbnRzQXRYID0gY2hhclBhdHRlcm5QYXJ0aWNsZXNbaW5kZXggKyB0aGlzLnBvaW50c0F0XS5jb29yZHMueC8vdGhlc2UgdHdvIGxpbmVzIGFyZSBmdWNraW5nIHRoaW5ncyBzb21laG93IGRlbGV0aW5nIHRoZSBsYXN0IHBhcnRpY2xlIGluIHRoZSBjaGFyIEkgdGhpbmtcclxuICAgICAgICBsZXQgcG9pbnRzQXRZID0gY2hhclBhdHRlcm5QYXJ0aWNsZXNbaW5kZXggKyB0aGlzLnBvaW50c0F0XS5jb29yZHMueVxyXG4gICAgICAgIGN0eDEuYmVnaW5QYXRoKClcclxuICAgICAgICBjdHgxLmxpbmVXaWR0aCA9IDJcclxuICAgICAgICBsZXQgcmdiID0gY2FudmFzSGVscGVycy5jb2xvckJldHdlZW5Ud29Db2xvcnModGhpcy5kaXN0TW92ZWQsICcjMWYyNjMzJywgJyNmZjAwMDAnKVxyXG4gICAgICAgIGN0eDEuc3Ryb2tlU3R5bGUgPSBgcmdiKCR7cmdiLnJ9LCAke3JnYi5nfSwgJHtyZ2IuYn0pYFxyXG4gICAgICAgIC8vY3R4MS5zdHJva2VTdHlsZSA9IHRoaXMuZGlzdE1vdmVkIDwgMSA/IGNvbG9yRnJvbSA6IGNvbG9yVG9cclxuICAgICAgICBjdHgxLm1vdmVUbyh0aGlzLmNvb3Jkcy54LCB0aGlzLmNvb3Jkcy55KVxyXG4gICAgICAgIGN0eDEubGluZVRvKHBvaW50c0F0WCwgcG9pbnRzQXRZKVxyXG4gICAgICAgIGN0eDEuc3Ryb2tlKClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCIvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLU1JU0MgSEVMUEVSU1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1NQVRIIEhFTFBFUlNcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1HRU9NRVRSWSBIRUxQRVJTXHJcbmZ1bmN0aW9uIHJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMocDEsIHAyKSB7XHJcbiAgY29uc3QgTUlOX0RJU1QgPSA0MFxyXG4gIGNvbnN0IERJU1RfTU9EID0gMC41XHJcbiAgY29uc3QgQU5HTEVfV0lUSElOID0gTWF0aC5QSVxyXG4gIGxldCBhID0gcDIueCAtIHAxLnhcclxuICBsZXQgYiA9IHAyLnkgLSBwMS55XHJcbiAgbGV0IHAxUDJEaXN0ID0gTWF0aC5zcXJ0KGEqYSArIGIqYilcclxuICBsZXQgcmFuZERpc3QgPSAoTWF0aC5yYW5kb20oKSAqIHAxUDJEaXN0ICogRElTVF9NT0QpICsgTUlOX0RJU1RcclxuICBsZXQgYW5nbGVNb2QgPSAoTWF0aC5yYW5kb20oKSAqIEFOR0xFX1dJVEhJTikgLSAoQU5HTEVfV0lUSElOIC8gMilcclxuICBsZXQgcmFuZEFuZ2xlXHJcbiAgbGV0IGNvb3JkcyA9IHt4OiBudWxsLCB5OiBudWxsfVxyXG5cclxuICBpZihNYXRoLnJhbmRvbSgpID49IDAuNSkge1xyXG4gICAgcmFuZEFuZ2xlID0gTWF0aC5hdGFuMihwMi55IC0gcDEueSwgcDEueCAtIHAyLngpICsgYW5nbGVNb2RcclxuICAgIGNvb3Jkcy54ID0gcDIueCArIE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gICAgY29vcmRzLnkgPSBwMi55IC0gTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgfSBlbHNlIHtcclxuICAgIHJhbmRBbmdsZSA9IE1hdGguYXRhbjIocDEueSAtIHAyLnksIHAyLnggLSBwMS54KSArIGFuZ2xlTW9kXHJcbiAgICBjb29yZHMueCA9IHAxLnggKyBNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICAgIGNvb3Jkcy55ID0gcDEueSAtIE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGNvb3Jkc1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmFuZFBvaW50TmVhclBvaW50KHB0KSB7XHJcbiAgY29uc3QgTUFYX0ZST00gPSA0MFxyXG4gIGxldCByYW5kRGlzdCA9IE1hdGgucmFuZG9tKCkgKiBNQVhfRlJPTVxyXG4gIGxldCByYW5kQW5nbGUgPSBNYXRoLnJhbmRvbSgpICogTWF0aC5QSSAqIDJcclxuICBsZXQgeCA9IHB0LnggKyBNYXRoLnJvdW5kKE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdClcclxuICBsZXQgeSA9IHB0LnkgKyBNYXRoLnJvdW5kKE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdClcclxuXHJcbiAgcmV0dXJuIHt4OiB4LCB5OiB5fVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY29vcmRzT25TdHJhaWdodExpbmUocGVyY2VudCwgc3RhcnRQdCwgZW5kUHQpIHtcclxuICBsZXQgeFRvdGFsID0gZW5kUHQueCAtIHN0YXJ0UHQueFxyXG4gIGxldCB5VG90YWwgPSBlbmRQdC55IC0gc3RhcnRQdC55XHJcbiAgbGV0IHhEaXN0ID0gcGVyY2VudCAqIHhUb3RhbFxyXG4gIGxldCB5RGlzdCA9IHBlcmNlbnQgKiB5VG90YWxcclxuXHJcbiAgcmV0dXJuIHt4OiBzdGFydFB0LnggKyB4RGlzdCwgeTogc3RhcnRQdC55ICsgeURpc3R9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjb29yZHNPbkN1YmljQmV6aWVyKHBlcmNlbnQsIHN0YXJ0UHQsIGNwMSwgY3AyLCBlbmRQdCkgey8vc3RvbGVuIGZyb20gc3RhY2tvdmVyZmxvd1xyXG4gIGxldCB0MiA9IHBlcmNlbnQgKiBwZXJjZW50XHJcbiAgbGV0IHQzID0gdDIgKiBwZXJjZW50XHJcblxyXG4gIHJldHVybiBzdGFydFB0ICsgKC1zdGFydFB0ICogMyArIHBlcmNlbnQgKiAoMyAqIHN0YXJ0UHQgLSBzdGFydFB0ICogcGVyY2VudCkpICogcGVyY2VudFxyXG4gICsgKDMgKiBjcDEgKyBwZXJjZW50ICogKC02ICogY3AxICsgY3AxICogMyAqIHBlcmNlbnQpKSAqIHBlcmNlbnRcclxuICArIChjcDIgKiAzIC0gY3AyICogMyAqIHBlcmNlbnQpICogdDJcclxuICArIGVuZFB0ICogdDNcclxufVxyXG5cclxuXHJcbi8vLS1GVU5DVElPTlMgVE8gUkVOREVSIFdBWVBPSU5UUywgQ09OVFJPTCBQT0lOVFMsIEVUQyBVU0VEIElOIFBBUlRJQ0xFIENSRUFUSU9OXHJcbi8vTk9UIE5FQ0VTU0FSSUxZIFVTRUQgQlVUIFVTRUZVTCBGT1IgREVCVUdHSU5HXHJcbmZ1bmN0aW9uIHJlbmRlckJvdW5kaW5nQ2lyY2xlKGN0eCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkge1xyXG4gIGxldCBjZW50ZXJYID0gY2FudmFzV2lkdGggLyAyXHJcbiAgbGV0IGNlbnRlclkgPSBjYW52YXNIZWlnaHQgLyAyXHJcbiAgbGV0IHJhZGl1cyA9IGNlbnRlclkgPiBjZW50ZXJYID8gY2VudGVyWCAtIDIgOiBjZW50ZXJZIC0gMlxyXG4gIGxldCBzdGFydEFuZ2xlID0gMFxyXG4gIGxldCBlbmRBbmdsZSA9IDIgKiBNYXRoLlBJXHJcbiAgY3R4LmxpbmVXaWR0aCA9IDFcclxuICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JleSdcclxuICBjdHguYmVnaW5QYXRoKClcclxuICBjdHguYXJjKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiByZW5kZXJIb2xkUGF0dGVybldQcyhjdHgsIHdheXBvaW50cykge1xyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5maWxsU3R5bGUgPSAnYmx1ZSdcclxuICB3YXlwb2ludHMuZm9yRWFjaCh3cCA9PiB7XHJcbiAgICBjdHguZmlsbFJlY3Qod3AueCAtIDQsIHdwLnkgLSA0LCA4LCA4KVxyXG4gIH0pXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiByZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHMoY3R4LCBwYXJ0aWNsZXMpIHtcclxuICBwYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7XHJcbiAgICBsZXQgY3AxWCA9IHBhcnRpY2xlLmNvb3Jkcy5jcDF4XHJcbiAgICBsZXQgY3AxWSA9IHBhcnRpY2xlLmNvb3Jkcy5jcDF5XHJcbiAgICBsZXQgY3AyWCA9IHBhcnRpY2xlLmNvb3Jkcy5jcDJ4XHJcbiAgICBsZXQgY3AyWSA9IHBhcnRpY2xlLmNvb3Jkcy5jcDJ5XHJcbiAgICBsZXQgc3RhcnRYID0gcGFydGljbGUuY29vcmRzLngwXHJcbiAgICBsZXQgc3RhcnRZID0gcGFydGljbGUuY29vcmRzLnkwXHJcbiAgICBsZXQgZW5kWCA9IHBhcnRpY2xlLmNvb3Jkcy54MVxyXG4gICAgbGV0IGVuZFkgPSBwYXJ0aWNsZS5jb29yZHMueTFcclxuICAgIGN0eC5saW5lV2lkdGggPSAxXHJcbiAgICAvL3JlbmRlciBzdGFydCBwb2ludFxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JlZW4nXHJcbiAgICBjdHgucmVjdChzdGFydFggLSAyLCBzdGFydFkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBlbmQgcG9pbnRcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZWQnXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5yZWN0KGVuZFggLSAyLCBlbmRZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAxXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICd5ZWxsb3cnXHJcbiAgICBjdHgucmVjdChjcDFYIC0gMiwgY3AxWSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIGNvbnRyb2wgcG9pbnQgMlxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnb3JhbmdlJ1xyXG4gICAgY3R4LnJlY3QoY3AyWCAtIDIsIGNwMlkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBwYXRoXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmV5J1xyXG4gICAgY3R4Lm1vdmVUbyhzdGFydFgsIHN0YXJ0WSlcclxuICAgIGN0eC5iZXppZXJDdXJ2ZVRvKGNwMVgsIGNwMVksIGNwMlgsIGNwMlksIGVuZFgsIGVuZFkpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICB9KVxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUNPTE9SIEhFTFBFUlNcclxuLy93b3VsZCBiZSBtb3JlIGVmZmljaWVudCB0byB0YWtlIGFyZ3MgYXMge3I6IDAtMjU1LCBnOiAwLTI1NSwgYjowLTI1NX1cclxuLy9zbyBubyBuZWVkIHRoZSBoZXggYXJyYXkgc3R1ZmYgYnV0IG9rIGZvciBub3cgYXMgZHJhd2luZ1xyXG4vL2EgZmV3IGh1bmRyZWQgcGFydGljbGVzIHdpdGhvdXQgbGFnXHJcbmZ1bmN0aW9uIGNvbG9yQmV0d2VlblR3b0NvbG9ycyhwZXJjZW50LCBjb2xvck9uZSwgY29sb3JUd28pIHtcclxuICBsZXQgaGV4ID0gWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJ11cclxuXHJcbiAgLy9jb2xvck9uZVxyXG4gIGxldCBjMVJlZEluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoMSkgKVxyXG4gIGxldCBjMVJlZEluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoMikgKVxyXG4gIGxldCBjMVJlZEJhc2VUZW4gPSAoYzFSZWRJbmRleDAgKiAxNikgKyAoYzFSZWRJbmRleDEpXHJcblxyXG4gIGxldCBjMUdyZWVuSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCgzKSApXHJcbiAgbGV0IGMxR3JlZW5JbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDQpIClcclxuICBsZXQgYzFHcmVlbmRCYXNlVGVuID0gKGMxR3JlZW5JbmRleDAgKiAxNikgKyAoYzFHcmVlbkluZGV4MSlcclxuXHJcbiAgbGV0IGMxQmx1ZUluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoNSkgKVxyXG4gIGxldCBjMUJsdWVJbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDYpIClcclxuICBsZXQgYzFCbHVlQmFzZVRlbiA9IChjMUJsdWVJbmRleDAgKiAxNikgKyAoYzFCbHVlSW5kZXgxKVxyXG5cclxuICAvL2NvbG9yVHdvXHJcbiAgbGV0IGMyUmVkSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCgxKSApXHJcbiAgbGV0IGMyUmVkSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCgyKSApXHJcbiAgbGV0IGMyUmVkQmFzZVRlbiA9IChjMlJlZEluZGV4MCAqIDE2KSArIChjMlJlZEluZGV4MSlcclxuXHJcbiAgbGV0IGMyR3JlZW5JbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDMpIClcclxuICBsZXQgYzJHcmVlbkluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoNCkgKVxyXG4gIGxldCBjMkdyZWVuZEJhc2VUZW4gPSAoYzJHcmVlbkluZGV4MCAqIDE2KSArIChjMkdyZWVuSW5kZXgxKVxyXG5cclxuICBsZXQgYzJCbHVlSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCg1KSApXHJcbiAgbGV0IGMyQmx1ZUluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoNikgKVxyXG4gIGxldCBjMkJsdWVCYXNlVGVuID0gKGMyQmx1ZUluZGV4MCAqIDE2KSArIChjMkJsdWVJbmRleDEpXHJcblxyXG4gIGxldCByZWREZWx0YSA9IGMyUmVkQmFzZVRlbiAtIGMxUmVkQmFzZVRlblxyXG4gIGxldCBncmVlbkRlbHRhID0gYzJHcmVlbmRCYXNlVGVuIC0gYzFHcmVlbmRCYXNlVGVuXHJcbiAgbGV0IGJsdWVEZWx0YSA9IGMyQmx1ZUJhc2VUZW4gLSBjMUJsdWVCYXNlVGVuXHJcblxyXG4gIGxldCByZWROb3cgPSBNYXRoLnJvdW5kKCBjMVJlZEJhc2VUZW4gKyAocmVkRGVsdGEgKiBwZXJjZW50KSApXHJcbiAgbGV0IGdyZWVuTm93ID0gTWF0aC5yb3VuZCggYzFHcmVlbmRCYXNlVGVuICsgKGdyZWVuRGVsdGEgKiBwZXJjZW50KSApXHJcbiAgbGV0IGJsdWVOb3cgPSBNYXRoLnJvdW5kKCBjMUJsdWVCYXNlVGVuICsgKGJsdWVEZWx0YSAqIHBlcmNlbnQpIClcclxuXHJcbiAgcmV0dXJuIHtyOiByZWROb3csIGc6IGdyZWVuTm93LCBiOiBibHVlTm93fS8vdGVtcFxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVYUE9SVFNcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgcmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyxcclxuICByYW5kUG9pbnROZWFyUG9pbnQsXHJcbiAgY29vcmRzT25TdHJhaWdodExpbmUsXHJcbiAgY29vcmRzT25DdWJpY0JlemllcixcclxuICBjb2xvckJldHdlZW5Ud29Db2xvcnMsXHJcbiAgLy9kZXZcclxuICByZW5kZXJCb3VuZGluZ0NpcmNsZSxcclxuICByZW5kZXJIb2xkUGF0dGVybldQcyxcclxuICByZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHNcclxufVxyXG4iLCIvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUNPT1JEUyBBUyBSQVRJTyBBTkQgVkVDVE9SIFBPSU5UIEFUU1xyXG5sZXQgbGV0dGVyc0Nvb3JkcyA9IHtcclxuICBBOiBbXHJcbiAgICB7eDogMC4xMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgIC8vMVxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjEyNX0sLy8yXHJcbiAgICB7eDogMC42MjUsIHk6IDAuMTI1fSwvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjV9LCAgIC8vNFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjg3NX0gLy81XHJcbiAgXSxcclxuICBCOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4yNX0sIC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNzV9ICAvLzRcclxuICBdLFxyXG4gIEM6IFtcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC42MjV9LC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMzc1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0gLy8zXHJcbiAgXSxcclxuICBEOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LCAvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNSB9LC8vMVxyXG4gICAge3g6IDAuNzUsIHk6IDAuMzc1fSwgLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC42MjV9ICAvLzNcclxuICBdLFxyXG4gIEU6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC41fSwgIC8vNFxyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSAvLzVcclxuICBdLFxyXG4gIEY6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC41fSAgIC8vNFxyXG4gIF0sXHJcbiAgRzogW1xyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjYyNX0sLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4zNzV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzNcclxuICAgIHt4OiAwLjYyNSwgeTogMC41fSwgLy80XHJcbiAgICB7eDogMC44NzUsIHk6IDAuNX0gIC8vNVxyXG4gIF0sXHJcbiAgSDogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjV9LCAgLy80XHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9IC8vNVxyXG4gIF0sXHJcbiAgSTogW1xyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjUsIHk6IDAuODc1fSwgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LC8vMlxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzNcclxuICAgIHt4OiAwLjUsIHk6IDAuMTI1fSwgLy80XHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9IC8vNVxyXG4gIF0sXHJcbiAgSjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuNzV9LFxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC41LCB5OiAwLjc1fSxcclxuICAgIHt4OiAwLjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9XHJcbiAgXSxcclxuICBLOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjI1fVxyXG4gIF0sXHJcbiAgTDogW1xyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9XHJcbiAgXSxcclxuICBNOiBbXHJcbiAgICB7eDogMC4xMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC41LCB5OiAwLjc1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuODc1fVxyXG4gIF0sXHJcbiAgTjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fVxyXG4gIF0sXHJcbiAgTzogW1xyXG4gICAge3g6IDAuMzc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4xMjUsIHk6IDAuNjI1fSxcclxuICAgIHt4OiAwLjEyNSwgeTogMC4zNzV9LFxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjg3NSwgeTogMC4zNzV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjYyNX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuODc1fVxyXG4gIF0sXHJcbiAgUDogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMzc1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC41fVxyXG4gIF0sXHJcbiAgUTogW1xyXG4gICAge3g6IDAuMzc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4xMjUsIHk6IDAuNjI1fSxcclxuICAgIHt4OiAwLjEyNSwgeTogMC4zNzV9LFxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjg3NSwgeTogMC4zNzV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjYyNX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC42MjV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjg3NX1cclxuICBdLFxyXG4gIFI6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9XHJcbiAgXSxcclxuICBTOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC43NX0sICAvLzBcclxuICAgIHt4OiAwLjM3NSwgeTogMC44NzV9LC8vMVxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjg3NX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC43NX0sICAvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjYyNX0sIC8vNFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjV9LCAgLy81XHJcbiAgICB7eDogMC4zNzUsIHk6IDAuNX0sICAvLzZcclxuICAgIHt4OiAwLjI1LCB5OiAwLjM3NX0sIC8vN1xyXG4gICAge3g6IDAuMjUsIHk6IDAuMjV9LCAgLy84XHJcbiAgICB7eDogMC4zNzUsIHk6IDAuMTI1fSwvLzlcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LC8vMTBcclxuICAgIHt4OiAwLjc1LCB5OiAwLjI1fSAgIC8vMTFcclxuICBdLFxyXG4gIFQ6IFtcclxuICAgIHt4OiAwLjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9XHJcbiAgXSxcclxuICBVOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNzV9LFxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjc1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyMjV9XHJcbiAgXSxcclxuICBWOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fVxyXG4gIF0sXHJcbiAgVzogW1xyXG4gICAge3g6IDAuMTI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjUsIHk6IDAuMjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuMTI1fVxyXG4gIF0sXHJcbiAgWDogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fVxyXG4gIF0sXHJcbiAgWTogW1xyXG4gICAge3g6IDAuNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNSwgeTogMC41fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9XHJcbiAgXSxcclxuICBaOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9XHJcbiAgXSxcclxuICBcIiBcIjogW10vL2VuYWJsZXMgaGF2aW5nIHNwYWNlcyBiZXR3ZWVuIGxldHRlcnNcclxufVxyXG5cclxuXHJcbmxldCBsZXR0ZXJzVmVjdG9ycyA9IHtcclxuICBBOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIEI6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTR9XHJcbiAgXSxcclxuICBDOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIEQ6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtM31cclxuICBdLFxyXG4gIEU6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtNX1cclxuICBdLFxyXG4gIEY6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgRzogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC01fVxyXG4gIF0sXHJcbiAgSDogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBJOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIEo6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgSzogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0zfVxyXG4gIF0sXHJcbiAgTDogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBNOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIE46IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgTzogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC03fVxyXG4gIF0sXHJcbiAgUDogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC01fVxyXG4gIF0sXHJcbiAgUTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC03fSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgUjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC01fSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtMX1cclxuICBdLFxyXG4gIFM6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgVDogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBVOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIFY6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgVzogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBYOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIFk6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtMn1cclxuICBdLFxyXG4gIFo6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF1cclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVhQT1JURUQgRlVOQ1RJT05TXHJcbmZ1bmN0aW9uIHRvdGFsUmVxdWlyZWRQYXJ0aWNsZXMoc3RyKSB7XHJcbiAgbGV0IHJlcXVpcmVkUGFydGljbGVzID0gMFxyXG5cclxuICBmb3IoaSBpbiBzdHIpIHtcclxuICAgIHJlcXVpcmVkUGFydGljbGVzICs9IGxldHRlcnNDb29yZHNbc3RyLmNoYXJBdChpKV0ubGVuZ3RoXHJcbiAgfVxyXG5cclxuICBjb25zb2xlLmxvZyhcInRvdGFsIHJlcXVpcmVkUGFydGljbGVzOiBcIiArIHJlcXVpcmVkUGFydGljbGVzKVxyXG4gIHJldHVybiByZXF1aXJlZFBhcnRpY2xlc1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcGxhY2VXb3Jkc0luUm93cyhzdHIsIG1heENoYXJzSW5Sb3cpIHtcclxuICBsZXQgd29yZHMgPSBzdHIuc3BsaXQoXCIgXCIpXHJcbiAgbGV0IHJvd3MgPSBbXCJcIl1cclxuICBsZXQgcm93c0luZGV4ID0gMFxyXG5cclxuICB3b3Jkcy5mb3JFYWNoKCh3b3JkLCBpbmRleCkgPT4ge1xyXG4gICAgaWYocm93c1tyb3dzSW5kZXhdLmxlbmd0aCArIHdvcmQubGVuZ3RoICsgMSA8PSBtYXhDaGFyc0luUm93KSB7XHJcbiAgICAgIHJvd3Nbcm93c0luZGV4XSA9IGluZGV4ID09PSAwID8gcm93c1tyb3dzSW5kZXhdICsgd29yZCA6IHJvd3Nbcm93c0luZGV4XSArIFwiIFwiICsgd29yZFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcm93cy5wdXNoKHdvcmQpXHJcbiAgICAgIHJvd3NJbmRleCsrXHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIHJvd3NcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNhbGNMZXR0ZXJQYXJ0aWNsZXNEZXN0QW5kVGFyZ2V0cyh3b3Jkc0luUm93cywgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkge1xyXG4gIGxldCBjaGFyV2lkdGggPSBNYXRoLnJvdW5kKCBjYW52YXNXaWR0aCAvIChsb25nZXN0RWxlbWVudExlbmd0aCh3b3Jkc0luUm93cykgKyAyKSApXHJcbiAgbGV0IGNoYXJIZWlnaHQgPSBNYXRoLnJvdW5kKGNoYXJXaWR0aCAqIDEuMilcclxuICBsZXQgdG90YWxSb3dzSGVpZ2h0ID0gY2hhckhlaWdodCAqICh3b3Jkc0luUm93cy5sZW5ndGggKyAxKVxyXG4gIGxldCBmaW5hbENvb3Jkc0FuZFBvaW50c0F0cyA9IFtdXHJcblxyXG4gIGZvcihsZXQgcm93IGluIHdvcmRzSW5Sb3dzKSB7XHJcbiAgICBsZXQgcm93U3RhcnRYID0gKGNhbnZhc1dpZHRoIC8gMikgLSAod29yZHNJblJvd3Nbcm93XS5sZW5ndGggKiBjaGFyV2lkdGggLyAyKVxyXG4gICAgbGV0IHJvd1N0YXJ0WSA9IChjYW52YXNIZWlnaHQgLyAyKSAtICh0b3RhbFJvd3NIZWlnaHQgLyAyKSArIChyb3cgKiBjaGFySGVpZ2h0KVxyXG5cclxuICAgIGZvcihsZXQgbGV0dGVyUG9zID0gMDsgbGV0dGVyUG9zIDwgd29yZHNJblJvd3Nbcm93XS5sZW5ndGg7IGxldHRlclBvcysrKSB7XHJcbiAgICAgIGxldCBjaGFySGVyZSA9IHdvcmRzSW5Sb3dzW3Jvd10uY2hhckF0KGxldHRlclBvcylcclxuICAgICAgbGV0IG5DaGFyUGFydGljbGVzID0gbGV0dGVyc0Nvb3Jkc1tjaGFySGVyZV0ubGVuZ3RoXHJcblxyXG4gICAgICBmb3IobGV0IHBvc0luQ2hhciA9IDA7IHBvc0luQ2hhciA8IG5DaGFyUGFydGljbGVzOyBwb3NJbkNoYXIrKykge1xyXG4gICAgICAgIGxldCB4MSA9IHJvd1N0YXJ0WCArIChsZXR0ZXJQb3MgKiBjaGFyV2lkdGgpICsgKGNoYXJXaWR0aCAqIGxldHRlcnNDb29yZHNbY2hhckhlcmVdW3Bvc0luQ2hhcl0ueClcclxuICAgICAgICBsZXQgeTEgPSByb3dTdGFydFkgKyAoY2hhckhlaWdodCAqIGxldHRlcnNDb29yZHNbY2hhckhlcmVdW3Bvc0luQ2hhcl0ueSlcclxuICAgICAgICBsZXQgcG9pbnRzQXQgPSBmYWxzZVxyXG5cclxuICAgICAgICBpZihsZXR0ZXJzVmVjdG9yc1tjaGFySGVyZV1bcG9zSW5DaGFyXS5oYXNWZWN0b3IgPT09IHRydWUpIHtcclxuICAgICAgICAgIHBvaW50c0F0ID0gbGV0dGVyc1ZlY3RvcnNbY2hhckhlcmVdW3Bvc0luQ2hhcl0uaW5kZXhPZmZzZXRcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZpbmFsQ29vcmRzQW5kUG9pbnRzQXRzLnB1c2goe3gxOiB4MSwgeTE6IHkxLCBwb2ludHNBdDogcG9pbnRzQXR9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4gZmluYWxDb29yZHNBbmRQb2ludHNBdHNcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tSU5URVJOQUwgRlVOQ1RJT05TXHJcbmZ1bmN0aW9uIGxvbmdlc3RFbGVtZW50TGVuZ3RoKGFycikge1xyXG4gIGxldCBsZW5ndGggPSAwXHJcbiAgYXJyLmZvckVhY2goZWwgPT4ge1xyXG4gICAgbGVuZ3RoID0gZWwubGVuZ3RoID49IGxlbmd0aCA/IGVsLmxlbmd0aCA6IGxlbmd0aFxyXG4gIH0pXHJcbiAgcmV0dXJuIGxlbmd0aFxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVYUE9SVFNcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgcGxhY2VXb3Jkc0luUm93cyxcclxuICB0b3RhbFJlcXVpcmVkUGFydGljbGVzLFxyXG4gIGNhbGNMZXR0ZXJQYXJ0aWNsZXNEZXN0QW5kVGFyZ2V0c1xyXG59XHJcbiJdfQ==
