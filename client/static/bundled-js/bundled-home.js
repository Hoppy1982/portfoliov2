(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const canvasHelpers = require('../utils/canvas-helpers')
const Particle = require('./Particle')

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

  draw(ctx, colorFrom, colorTo) {
    ctx.beginPath()
    ctx.lineWidth = 3
    let rgb = canvasHelpers.colorBetweenTwoColors(this.distMoved, '#ffffff', '#ff0000')//dev
    ctx.strokeStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
    //ctx.strokeStyle = this.distMoved < 1 ? colorFrom : colorTo//write function to transition between 2 colours that takes % as an arg
    ctx.fillStyle = 'black'
    ctx.arc(this.coords.x, this.coords.y, 3, 0, Math.PI * 2, false)
    ctx.stroke()
    ctx.fill()
  }

  drawToPointsAt(ctx, charPatternParticles, index, colorFrom, colorTo) {
    if(this.distMoved > 0.1) {
      if(this.pointsAt !== false) {
        let pointsAtX = charPatternParticles[index + this.pointsAt].coords.x//these two lines are fucking things somehow deleting the last particle in the char I think
        let pointsAtY = charPatternParticles[index + this.pointsAt].coords.y
        ctx.beginPath()
        ctx.lineWidth = 2
        let rgb = canvasHelpers.colorBetweenTwoColors(this.distMoved, '#1f2633', '#ff0000')
        ctx.strokeStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
        //ctx.strokeStyle = this.distMoved < 1 ? colorFrom : colorTo
        ctx.moveTo(this.coords.x, this.coords.y)
        ctx.lineTo(pointsAtX, pointsAtY)
        ctx.stroke()
      }
    }
  }
}

module.exports = CharPatternParticle

},{"../utils/canvas-helpers":5,"./Particle":3}],2:[function(require,module,exports){

const canvasHelpers = require('../utils/canvas-helpers')
const Particle = require('./Particle.js')

class HoldPatternParticle extends Particle {
  constructor(coords, speed, distMoved, nextWP) {
    super(coords, speed, distMoved)
    this.nextWP = nextWP
  }

  updatePos(HOLD_PATTERN_WAYPOINTS, holdPatternWaypointsActual, HOLD_SPEED) {
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

module.exports = HoldPatternParticle

},{"../utils/canvas-helpers":5,"./Particle.js":3}],3:[function(require,module,exports){

class Particle {
  constructor(coords, speed, distMoved) {
    this.coords = coords
    this.speed = speed
    this.distMoved = distMoved
  }

  draw(ctx, color) {//default self render for particles, maybe change later
    ctx.beginPath()
    ctx.lineWidth = 3
    ctx.strokeStyle = color
    ctx.fillStyle = 'black'
    ctx.arc(this.coords.x, this.coords.y, 3, 0, Math.PI * 2, false)
    ctx.stroke()
    ctx.fill()
  }

  updatePos() {
    this.coords.x += this.speed
    this.coords.y += this.speed
  }
}

module.exports = Particle

},{}],4:[function(require,module,exports){

const canvasHelpers = require('./utils/canvas-helpers.js')
const lettersLib = require('./utils/letters-lib.js')
const HoldPatternParticle = require('./classes/HoldPatternParticle')
const CharPatternParticle = require('./classes/CharPatternParticle')
const carousel2d = require('./utils/carousel-2d')

let CHAR_PATTERN_WORDS = 'YAY ANOTHER NEW BUG'//for now defined  here, later will come from caurosel
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
navGoToButton.addEventListener('click', formNewParticleWord, false)//dev
document.getElementById('navigatorUp').addEventListener('click', carouselUp)
document.getElementById('navigatorDown').addEventListener('click', carouselDown)
document.getElementById('navigatorLeft').addEventListener('click', carouselLeft)
document.getElementById('navigatorRight').addEventListener('click', carouselRight)

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

    holdPatternParticles.push( new HoldPatternParticle(coords, HOLD_SPEED, distMoved, nextWP) )
  }
  console.log(holdPatternParticles[0])
}


function formNewParticleWord() {
  cancelAnimationFrame(frameId)//not sure if needed
  charToHoldTransition()
  holdToCharTransition()
  animate()//not sure if needed
}


//-------------------------------------------------------------CAROUSEL CONTROLS
function carouselUp() {
  carousel2d.up()
  CHAR_PATTERN_WORDS = carousel2d.getNavItemText()
  formNewParticleWord()
}


function carouselDown() {
  carousel2d.down()
  CHAR_PATTERN_WORDS = carousel2d.getNavItemText()
  formNewParticleWord()
}


function carouselLeft() {
  carousel2d.left()
  CHAR_PATTERN_WORDS = carousel2d.getNavItemText()
  formNewParticleWord()
}


function carouselRight() {
  carousel2d.right()
  CHAR_PATTERN_WORDS = carousel2d.getNavItemText()
  formNewParticleWord()
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
  holdPatternParticles.forEach(particle => {
    particle.updatePos(HOLD_PATTERN_WAYPOINTS, holdPatternWaypointsActual, HOLD_SPEED)
    particle.draw(ctx1, 'white')
  })
}


function updateCharPatternParticles() {
  charPatternParticles.forEach((particle, index) => {
    particle.updatePos()
    particle.draw(ctx1, 'white', 'red')
    particle.drawToPointsAt(ctx1, charPatternParticles, index, '#1f2633', '#ff0000')
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

},{"./classes/CharPatternParticle":1,"./classes/HoldPatternParticle":2,"./utils/canvas-helpers.js":5,"./utils/carousel-2d":6,"./utils/letters-lib.js":7}],5:[function(require,module,exports){
// Dale's username: dakebl



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

},{}],6:[function(require,module,exports){
const CAROUSEL_DATA = [
  {text: 'ZERO', bgColor: 'red', navItems: [
    {text: 'zero a', bgColor: 'red'},
    {text: 'zero b', bgColor: 'green'},
    {text: 'zero c', bgColor: 'blue'},
    {text: 'zero d', bgColor: 'orange'},
    {text: 'zero e', bgColor: 'purple'}
  ]},
  {text: 'ONE', bgColor: 'green', navItems: [
    {text: 'one a', bgColor: 'red'},
    {text: 'one b', bgColor: 'green'},
    {text: 'one c', bgColor: 'blue'},
    {text: 'one d', bgColor: 'orange'},
    {text: 'one e', bgColor: 'purple'}
  ]},
  {text: 'TWO', bgColor: 'blue', navItems: [
    {text: 'two a', bgColor: 'red'},
    {text: 'two b', bgColor: 'green'},
    {text: 'two c', bgColor: 'blue'},
    {text: 'two d', bgColor: 'orange'},
    {text: 'two e', bgColor: 'purple'}
  ]},
  {text: 'THREE', bgColor: 'orange', navItems: [
    {text: 'three a', bgColor: 'red'},
    {text: 'three b', bgColor: 'green'},
    {text: 'three c', bgColor: 'blue'},
    {text: 'three d', bgColor: 'orange'},
    {text: 'three e', bgColor: 'purple'}
  ]},
  {text: 'FOUR', bgColor: 'purple', navItems: [
    {text: 'four a', bgColor: 'red'},
    {text: 'four b', bgColor: 'green'},
    {text: 'four c', bgColor: 'blue'},
    {text: 'four d', bgColor: 'orange'},
    {text: 'four e', bgColor: 'purple'}
  ]},
  {text: 'FIVE', bgColor: 'white', navItems: [
    {text: 'five a', bgColor: 'black'},
    {text: 'five b', bgColor: 'white'},
    {text: 'five c', bgColor: 'black'},
    {text: 'five d', bgColor: 'white'},
    {text: 'five e', bgColor: 'black'},
    {text: 'five f', bgColor: 'red'}
  ]}
]
const CAROUSEL_COLS = 5
const CAROUSEL_ROWS = 5
const CENTER_COL = 2
const CENTER_ROW = 2

let carouselContainer = document.getElementById('navigatorNavItems')//must be matched to carousel container element
let carouselVisibleItems
let selectedCol = 0
let selectedRowInCols = []
let carouselElements = []


//----------------------------------------------------------------------MANAGERS
//initialize
document.addEventListener('DOMContentLoaded', function(event) {
  for(let i = 0; i < CAROUSEL_DATA.length; i++) {
    selectedRowInCols.push(0)
  }

  for(let i = 0; i < CAROUSEL_COLS; i++) {
    carouselElements.push([])
    for(let j = 0; j < CAROUSEL_ROWS; j++) {
      carouselElements[i].push(document.querySelectorAll(`.carouselItem:nth-of-type(${1 + i}n) .navItem`)[j])
    }
  }

  render()
})


function render() {
  updateCarouselState()
  removeCarouselCells()
  removeCarouselColumns()
  makeCarouselColumns()
  makeCarouselCells()
  updateCarouselState()
  populateCarouselColumns()
  populateCarouselCells()
  updateCarouselState()
}


function left() {
  for(let i = 0; i < carouselVisibleItems.length; i++) {
    carouselVisibleItems[i].classList.add('movedLeft')
  }

  decHoriz()
  updateCarouselState()
}


function right() {
  for(let i = 0; i < carouselVisibleItems.length; i++) {
    carouselVisibleItems[i].classList.add('movedRight')
  }

  incHoriz()
  updateCarouselState()
}


function up() {
  for(let i = 0; i < carouselElements[CENTER_COL].length; i++) {
    carouselElements[CENTER_COL][i].classList.add('movedUp')
  }

  incVert()
  updateCarouselState()
}


function down() {
  for(let i = 0; i < carouselElements[CENTER_COL].length; i++) {
    carouselElements[CENTER_COL][i].classList.add('movedDown')
  }

  decVert()
  updateCarouselState()
}


//-----------------------------------------------------------------------HELPERS
function removeCarouselColumns() {
  while(carouselContainer.firstChild) {
    carouselContainer.removeChild(carouselContainer.firstChild)
  }
}


function removeCarouselCells() {
  for(let i = 0; i < carouselVisibleItems.length; i++) {
    while(carouselVisibleItems[i].firstChild) {
      carouselVisibleItems[i].removeChild(carouselVisibleItems[i].firstChild)
    }
  }
}


function makeCarouselColumns() {
  for(let i = 0; i < CAROUSEL_COLS; i++) {
    let newElement = document.createElement('div')
    newElement.classList.add('carouselItem')
    newElement.addEventListener('transitionend', render)
    carouselContainer.appendChild(newElement)
  }
}


function makeCarouselCells() {
  for(let i = 0; i < CAROUSEL_COLS; i++) {
    for(let j = 0; j < CAROUSEL_ROWS; j++) {
      let newElement = document.createElement('div')
      newElement.classList.add('navItem')
      newElement.addEventListener('transitionend', render)
      carouselVisibleItems[j].appendChild(newElement)
    }
  }
}


function updateCarouselState() {
  carouselVisibleItems = document.getElementsByClassName('carouselItem')

  for(let i = 0; i < CAROUSEL_COLS; i++) {
    for(let j = 0; j < CAROUSEL_ROWS; j++) {
      carouselElements[i][j] = document.querySelectorAll(`.carouselItem:nth-of-type(${1 + i}n) .navItem`)[j]
    }
  }
}


function incHoriz() {
  selectedCol = selectedCol === CAROUSEL_DATA.length - 1 ? 0 : selectedCol + 1
}


function decHoriz() {
  selectedCol = selectedCol === 0 ? CAROUSEL_DATA.length - 1 : selectedCol - 1
}


function incVert() {
  selectedRowInCols[selectedCol] = selectedRowInCols[selectedCol] === CAROUSEL_DATA[selectedCol].navItems.length - 1 ? 0 : selectedRowInCols[selectedCol] + 1
}


function decVert() {
  selectedRowInCols[selectedCol] = selectedRowInCols[selectedCol] === 0 ? CAROUSEL_DATA[selectedCol].navItems.length - 1 : selectedRowInCols[selectedCol] - 1
}


function populateCarouselColumns() {
  for(let i = 0; i < CAROUSEL_COLS; i++) {
    let x = selectedCol + i + CAROUSEL_DATA.length - 2
    while(x >= CAROUSEL_DATA.length) {x = x - CAROUSEL_DATA.length}

    carouselVisibleItems[CAROUSEL_COLS - 1 - i].style.backgroundColor = CAROUSEL_DATA[x].bgColor
  }
}

function populateCarouselCells() {
  for(let i = 0; i < CAROUSEL_COLS; i++) {
    let x = selectedCol + i + CAROUSEL_DATA.length - 2
    while(x >= CAROUSEL_DATA.length) {x = x - CAROUSEL_DATA.length}

    for(let j = 0; j < CAROUSEL_ROWS; j++) {
      let y = selectedRowInCols[x] + j
      while(y >= CAROUSEL_DATA[x].navItems.length) {y = y - CAROUSEL_DATA[x].navItems.length}

      carouselElements[CAROUSEL_COLS - 1 - i][j].style.backgroundColor = CAROUSEL_DATA[x].navItems[y].bgColor
    }
  }
}


function getNavTopicText() {
  return CAROUSEL_DATA[selectedCol].text
}


function getNavItemText() {
  let y = [selectedRowInCols[selectedCol] + CENTER_ROW]
  while(y >= CAROUSEL_DATA[selectedCol].navItems.length) {y = y - CAROUSEL_DATA[selectedCol].navItems.length}

  return CAROUSEL_DATA[selectedCol].navItems[y].text.toUpperCase()
}

//-----------------------------------------------------------------------EXPORTS
module.exports = {
  up,
  down,
  left,
  right,
  getNavTopicText,
  getNavItemText
}

},{}],7:[function(require,module,exports){
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

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9jbGFzc2VzL0NoYXJQYXR0ZXJuUGFydGljbGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9jbGFzc2VzL0hvbGRQYXR0ZXJuUGFydGljbGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9jbGFzc2VzL1BhcnRpY2xlLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvaG9tZS5qcyIsImNsaWVudC9zdGF0aWMvc291cmNlLWpzL3V0aWxzL2NhbnZhcy1oZWxwZXJzLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2Fyb3VzZWwtMmQuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9sZXR0ZXJzLWxpYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgY2FudmFzSGVscGVycyA9IHJlcXVpcmUoJy4uL3V0aWxzL2NhbnZhcy1oZWxwZXJzJylcclxuY29uc3QgUGFydGljbGUgPSByZXF1aXJlKCcuL1BhcnRpY2xlJylcclxuXHJcbmNsYXNzIENoYXJQYXR0ZXJuUGFydGljbGUgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkLCBwb2ludHNBdCkge1xyXG4gICAgc3VwZXIoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkKVxyXG4gICAgdGhpcy5wb2ludHNBdCA9IHBvaW50c0F0XHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3MoKSB7XHJcbiAgICB0aGlzLmRpc3RNb3ZlZCArPSB0aGlzLnNwZWVkXHJcbiAgICBpZiAodGhpcy5kaXN0TW92ZWQgPiAxKSB7dGhpcy5kaXN0TW92ZWQgPSAxfS8vcHJldmVudCBvdmVyc2hvb3RcclxuXHJcbiAgICBsZXQgbmV3UG9zID0gY2FudmFzSGVscGVycy5jb29yZHNPblN0cmFpZ2h0TGluZSh0aGlzLmRpc3RNb3ZlZCwge3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KVxyXG4gICAgdGhpcy5jb29yZHMueCA9IG5ld1Bvcy54XHJcbiAgICB0aGlzLmNvb3Jkcy55ID0gbmV3UG9zLnlcclxuICB9XHJcblxyXG4gIGRyYXcoY3R4LCBjb2xvckZyb20sIGNvbG9yVG8pIHtcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LmxpbmVXaWR0aCA9IDNcclxuICAgIGxldCByZ2IgPSBjYW52YXNIZWxwZXJzLmNvbG9yQmV0d2VlblR3b0NvbG9ycyh0aGlzLmRpc3RNb3ZlZCwgJyNmZmZmZmYnLCAnI2ZmMDAwMCcpLy9kZXZcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGByZ2IoJHtyZ2Iucn0sICR7cmdiLmd9LCAke3JnYi5ifSlgXHJcbiAgICAvL2N0eC5zdHJva2VTdHlsZSA9IHRoaXMuZGlzdE1vdmVkIDwgMSA/IGNvbG9yRnJvbSA6IGNvbG9yVG8vL3dyaXRlIGZ1bmN0aW9uIHRvIHRyYW5zaXRpb24gYmV0d2VlbiAyIGNvbG91cnMgdGhhdCB0YWtlcyAlIGFzIGFuIGFyZ1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eC5hcmModGhpcy5jb29yZHMueCwgdGhpcy5jb29yZHMueSwgMywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICBjdHguZmlsbCgpXHJcbiAgfVxyXG5cclxuICBkcmF3VG9Qb2ludHNBdChjdHgsIGNoYXJQYXR0ZXJuUGFydGljbGVzLCBpbmRleCwgY29sb3JGcm9tLCBjb2xvclRvKSB7XHJcbiAgICBpZih0aGlzLmRpc3RNb3ZlZCA+IDAuMSkge1xyXG4gICAgICBpZih0aGlzLnBvaW50c0F0ICE9PSBmYWxzZSkge1xyXG4gICAgICAgIGxldCBwb2ludHNBdFggPSBjaGFyUGF0dGVyblBhcnRpY2xlc1tpbmRleCArIHRoaXMucG9pbnRzQXRdLmNvb3Jkcy54Ly90aGVzZSB0d28gbGluZXMgYXJlIGZ1Y2tpbmcgdGhpbmdzIHNvbWVob3cgZGVsZXRpbmcgdGhlIGxhc3QgcGFydGljbGUgaW4gdGhlIGNoYXIgSSB0aGlua1xyXG4gICAgICAgIGxldCBwb2ludHNBdFkgPSBjaGFyUGF0dGVyblBhcnRpY2xlc1tpbmRleCArIHRoaXMucG9pbnRzQXRdLmNvb3Jkcy55XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDJcclxuICAgICAgICBsZXQgcmdiID0gY2FudmFzSGVscGVycy5jb2xvckJldHdlZW5Ud29Db2xvcnModGhpcy5kaXN0TW92ZWQsICcjMWYyNjMzJywgJyNmZjAwMDAnKVxyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGByZ2IoJHtyZ2Iucn0sICR7cmdiLmd9LCAke3JnYi5ifSlgXHJcbiAgICAgICAgLy9jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLmRpc3RNb3ZlZCA8IDEgPyBjb2xvckZyb20gOiBjb2xvclRvXHJcbiAgICAgICAgY3R4Lm1vdmVUbyh0aGlzLmNvb3Jkcy54LCB0aGlzLmNvb3Jkcy55KVxyXG4gICAgICAgIGN0eC5saW5lVG8ocG9pbnRzQXRYLCBwb2ludHNBdFkpXHJcbiAgICAgICAgY3R4LnN0cm9rZSgpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhclBhdHRlcm5QYXJ0aWNsZVxyXG4iLCJcclxuY29uc3QgY2FudmFzSGVscGVycyA9IHJlcXVpcmUoJy4uL3V0aWxzL2NhbnZhcy1oZWxwZXJzJylcclxuY29uc3QgUGFydGljbGUgPSByZXF1aXJlKCcuL1BhcnRpY2xlLmpzJylcclxuXHJcbmNsYXNzIEhvbGRQYXR0ZXJuUGFydGljbGUgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkLCBuZXh0V1ApIHtcclxuICAgIHN1cGVyKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZClcclxuICAgIHRoaXMubmV4dFdQID0gbmV4dFdQXHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3MoSE9MRF9QQVRURVJOX1dBWVBPSU5UUywgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwsIEhPTERfU1BFRUQpIHtcclxuICAgIHRoaXMuZGlzdE1vdmVkICs9IHRoaXMuc3BlZWRcclxuICAgIGlmKHRoaXMuZGlzdE1vdmVkID49IDEpIHtcclxuICAgICAgdGhpcy5kaXN0TW92ZWQgPSAwXHJcbiAgICAgIHRoaXMuc3BlZWQgPSBIT0xEX1NQRUVEXHJcbiAgICAgIHRoaXMubmV4dFdQID0gdGhpcy5uZXh0V1AgPT09IEhPTERfUEFUVEVSTl9XQVlQT0lOVFMubGVuZ3RoIC0gMSA/IDAgOiB0aGlzLm5leHRXUCArIDFcclxuICAgICAgdGhpcy5jb29yZHMueDAgPSB0aGlzLmNvb3Jkcy54MVxyXG4gICAgICB0aGlzLmNvb3Jkcy55MCA9IHRoaXMuY29vcmRzLnkxXHJcbiAgICAgIHRoaXMuY29vcmRzLngxID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbdGhpcy5uZXh0V1BdKS54XHJcbiAgICAgIHRoaXMuY29vcmRzLnkxID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbdGhpcy5uZXh0V1BdKS55XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMXggPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS54XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMXkgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS55XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMnggPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS54XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMnkgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS55XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvb3Jkcy54ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHRoaXMuZGlzdE1vdmVkLCB0aGlzLmNvb3Jkcy54MCwgdGhpcy5jb29yZHMuY3AxeCwgdGhpcy5jb29yZHMuY3AyeCwgdGhpcy5jb29yZHMueDEpXHJcbiAgICB0aGlzLmNvb3Jkcy55ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHRoaXMuZGlzdE1vdmVkLCB0aGlzLmNvb3Jkcy55MCwgdGhpcy5jb29yZHMuY3AxeSwgdGhpcy5jb29yZHMuY3AyeSwgdGhpcy5jb29yZHMueTEpXHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEhvbGRQYXR0ZXJuUGFydGljbGVcclxuIiwiXHJcbmNsYXNzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQpIHtcclxuICAgIHRoaXMuY29vcmRzID0gY29vcmRzXHJcbiAgICB0aGlzLnNwZWVkID0gc3BlZWRcclxuICAgIHRoaXMuZGlzdE1vdmVkID0gZGlzdE1vdmVkXHJcbiAgfVxyXG5cclxuICBkcmF3KGN0eCwgY29sb3IpIHsvL2RlZmF1bHQgc2VsZiByZW5kZXIgZm9yIHBhcnRpY2xlcywgbWF5YmUgY2hhbmdlIGxhdGVyXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5saW5lV2lkdGggPSAzXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvclxyXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eC5hcmModGhpcy5jb29yZHMueCwgdGhpcy5jb29yZHMueSwgMywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICBjdHguZmlsbCgpXHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3MoKSB7XHJcbiAgICB0aGlzLmNvb3Jkcy54ICs9IHRoaXMuc3BlZWRcclxuICAgIHRoaXMuY29vcmRzLnkgKz0gdGhpcy5zcGVlZFxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXJ0aWNsZVxyXG4iLCJcclxuY29uc3QgY2FudmFzSGVscGVycyA9IHJlcXVpcmUoJy4vdXRpbHMvY2FudmFzLWhlbHBlcnMuanMnKVxyXG5jb25zdCBsZXR0ZXJzTGliID0gcmVxdWlyZSgnLi91dGlscy9sZXR0ZXJzLWxpYi5qcycpXHJcbmNvbnN0IEhvbGRQYXR0ZXJuUGFydGljbGUgPSByZXF1aXJlKCcuL2NsYXNzZXMvSG9sZFBhdHRlcm5QYXJ0aWNsZScpXHJcbmNvbnN0IENoYXJQYXR0ZXJuUGFydGljbGUgPSByZXF1aXJlKCcuL2NsYXNzZXMvQ2hhclBhdHRlcm5QYXJ0aWNsZScpXHJcbmNvbnN0IGNhcm91c2VsMmQgPSByZXF1aXJlKCcuL3V0aWxzL2Nhcm91c2VsLTJkJylcclxuXHJcbmxldCBDSEFSX1BBVFRFUk5fV09SRFMgPSAnWUFZIEFOT1RIRVIgTkVXIEJVRycvL2ZvciBub3cgZGVmaW5lZCAgaGVyZSwgbGF0ZXIgd2lsbCBjb21lIGZyb20gY2F1cm9zZWxcclxuY29uc3QgTUFYX0NIQVJTX1BFUl9ST1cgPSAxMlxyXG5jb25zdCBUT1RBTF9QQVJUSUNMRVMgPSAyMDBcclxuY29uc3QgSE9MRF9QQVRURVJOX1dBWVBPSU5UUyA9IFsvL2Nvb3JkcyBhcyAlIG9mIGNhbnZhcyBzaXplXHJcbiAge3g6IDAuMTI1LCB5OiAwLjV9LFxyXG4gIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAge3g6IDAuNzUsIHk6IDAuMTI1fSxcclxuICB7eDogMC44NzUsIHk6IDAuNX0sXHJcbiAge3g6IDAuNzUsIHk6IDAuODc1fSxcclxuICB7eDogMC4yNSwgeTogMC44NzV9XHJcbl1cclxuY29uc3QgSE9MRF9TUEVFRCA9IDAuMDAyNVxyXG5cclxuY29uc3QgTkFWX0xJTktTID0gWy8vbm90IGltcGxlbWVudGVkIHlldFxyXG4gIHtcclxuICAgIGxpbmtzX2dyb3VwOiAnTGlua3MgZ3JvdXAgIzAnLFxyXG4gICAgbGlua3NfaXRlbXM6IFtcclxuICAgICAge2xpbmtSZWY6ICd1cmwnLCBwYXJ0aWNsZVRleHQ6ICdHUk9VUCBaRVJPIExJTksgWkVSTyd9LFxyXG4gICAgICB7bGlua1JlZjogJ3VybCcsIHBhcnRpY2xlVGV4dDogJ0dST1VQIFpFUk8gTElOSyBPTkUnfSxcclxuICAgICAge2xpbmtSZWY6ICd1cmwnLCBwYXJ0aWNsZVRleHQ6ICdHUk9VUCBaRVJPIExJTksgVFdPJ31cclxuICAgIF1cclxuICB9LFxyXG4gIHtcclxuICAgIGxpbmtzX2dyb3VwOiAnTGlua3MgZ3JvdXAgIzEnLFxyXG4gICAgbGlua3NfaXRlbXM6IFtcclxuICAgICAge2xpbmtSZWY6ICd1cmwnLCBwYXJ0aWNsZVRleHQ6ICdHUk9VUCBPTkUgTElOSyBaRVJPJ30sXHJcbiAgICAgIHtsaW5rUmVmOiAndXJsJywgcGFydGljbGVUZXh0OiAnR1JPVVAgT05FIExJTksgT05FJ30sXHJcbiAgICAgIHtsaW5rUmVmOiAndXJsJywgcGFydGljbGVUZXh0OiAnR1JPVVAgT05FIExJTksgVFdPJ31cclxuICAgIF1cclxuICB9XHJcbl1cclxuXHJcbmxldCBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXVxyXG5sZXQgY2FudmFzMSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjYW52YXMnKVswXVxyXG5sZXQgY3R4MSA9IGNhbnZhczEuZ2V0Q29udGV4dCgnMmQnKVxyXG5sZXQgbmF2R29Ub0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYXZpZ2F0b3JEZXNjJykvL2RldlxyXG5sZXQgZnJhbWVJZFxyXG5sZXQgY2FudmFzV2lkdGhcclxubGV0IGNhbnZhc0hlaWdodFxyXG5sZXQgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwgPSBbXS8vY29vcmRzIGluIHBpeGVscywgcmVjYWxjdWxhdGVkIG9uIHJlc2l6ZVxyXG5sZXQgaG9sZFBhdHRlcm5QYXJ0aWNsZXMgPSBbXVxyXG5sZXQgY2hhclBhdHRlcm5QYXJ0aWNsZXMgPSBbXVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVZFTlRTXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGluaXQpXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBpbml0KVxyXG5uYXZHb1RvQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZm9ybU5ld1BhcnRpY2xlV29yZCwgZmFsc2UpLy9kZXZcclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdmlnYXRvclVwJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYXJvdXNlbFVwKVxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yRG93bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2Fyb3VzZWxEb3duKVxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yTGVmdCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2Fyb3VzZWxMZWZ0KVxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yUmlnaHQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhcm91c2VsUmlnaHQpXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUZMT1cgQ09OVFJPTCAmIElOSVRJQUxJWkVSU1xyXG5mdW5jdGlvbiBpbml0KCkge1xyXG4gIHJlc2V0KClcclxuICBzZXRMYXlvdXQoKVxyXG4gIGNhbGNIb2xkUGF0dGVybldheXBvaW50Q29vcmRzKClcclxuICBpbml0SG9sZFBhdHRlcm5QYXJ0aWNsZXMoVE9UQUxfUEFSVElDTEVTKVxyXG4gIGFuaW1hdGUoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmVzZXQoKSB7XHJcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVJZClcclxuICBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbC5sZW5ndGggPSAwXHJcbiAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMubGVuZ3RoID0gMFxyXG4gIGNoYXJQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA9IDBcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNhbGNIb2xkUGF0dGVybldheXBvaW50Q29vcmRzKCkge1xyXG4gIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsID0gSE9MRF9QQVRURVJOX1dBWVBPSU5UUy5tYXAoZWwgPT4ge1xyXG4gICAgcmV0dXJuIHt4OiBlbC54ICogY2FudmFzV2lkdGgsIHk6IGVsLnkgKiBjYW52YXNIZWlnaHR9XHJcbiAgfSlcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGluaXRIb2xkUGF0dGVyblBhcnRpY2xlcyhuUGFydGljbGVzKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IG5QYXJ0aWNsZXM7IGkrKykge1xyXG4gICAgbGV0IGZyb21XUCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDYpXHJcbiAgICBsZXQgbmV4dFdQID0gZnJvbVdQICsgMSA9PT0gSE9MRF9QQVRURVJOX1dBWVBPSU5UUy5sZW5ndGggPyAwIDogZnJvbVdQICsgMVxyXG4gICAgbGV0IGRpc3RNb3ZlZCA9IE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiAxMCApIC8gMTBcclxuICAgIGxldCBzdGFydENvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW2Zyb21XUF0pXHJcbiAgICBsZXQgZW5kQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbbmV4dFdQXSlcclxuICAgIGxldCBjcDFDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoc3RhcnRDb29yZHMsIGVuZENvb3JkcylcclxuICAgIGxldCBjcDJDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoc3RhcnRDb29yZHMsIGVuZENvb3JkcylcclxuICAgIGxldCBjb29yZHMgPSB7XHJcbiAgICAgIHg6IHN0YXJ0Q29vcmRzLngsIHk6IHN0YXJ0Q29vcmRzLnksXHJcbiAgICAgIHgwOiBzdGFydENvb3Jkcy54LCB5MDogc3RhcnRDb29yZHMueSxcclxuICAgICAgeDE6IGVuZENvb3Jkcy54LCB5MTogZW5kQ29vcmRzLnksXHJcbiAgICAgIGNwMXg6IGNwMUNvb3Jkcy54LCBjcDF5OiBjcDFDb29yZHMueSxcclxuICAgICAgY3AyeDogY3AyQ29vcmRzLngsIGNwMnk6IGNwMkNvb3Jkcy55XHJcbiAgICB9XHJcblxyXG4gICAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMucHVzaCggbmV3IEhvbGRQYXR0ZXJuUGFydGljbGUoY29vcmRzLCBIT0xEX1NQRUVELCBkaXN0TW92ZWQsIG5leHRXUCkgKVxyXG4gIH1cclxuICBjb25zb2xlLmxvZyhob2xkUGF0dGVyblBhcnRpY2xlc1swXSlcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGZvcm1OZXdQYXJ0aWNsZVdvcmQoKSB7XHJcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVJZCkvL25vdCBzdXJlIGlmIG5lZWRlZFxyXG4gIGNoYXJUb0hvbGRUcmFuc2l0aW9uKClcclxuICBob2xkVG9DaGFyVHJhbnNpdGlvbigpXHJcbiAgYW5pbWF0ZSgpLy9ub3Qgc3VyZSBpZiBuZWVkZWRcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUNBUk9VU0VMIENPTlRST0xTXHJcbmZ1bmN0aW9uIGNhcm91c2VsVXAoKSB7XHJcbiAgY2Fyb3VzZWwyZC51cCgpXHJcbiAgQ0hBUl9QQVRURVJOX1dPUkRTID0gY2Fyb3VzZWwyZC5nZXROYXZJdGVtVGV4dCgpXHJcbiAgZm9ybU5ld1BhcnRpY2xlV29yZCgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjYXJvdXNlbERvd24oKSB7XHJcbiAgY2Fyb3VzZWwyZC5kb3duKClcclxuICBDSEFSX1BBVFRFUk5fV09SRFMgPSBjYXJvdXNlbDJkLmdldE5hdkl0ZW1UZXh0KClcclxuICBmb3JtTmV3UGFydGljbGVXb3JkKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNhcm91c2VsTGVmdCgpIHtcclxuICBjYXJvdXNlbDJkLmxlZnQoKVxyXG4gIENIQVJfUEFUVEVSTl9XT1JEUyA9IGNhcm91c2VsMmQuZ2V0TmF2SXRlbVRleHQoKVxyXG4gIGZvcm1OZXdQYXJ0aWNsZVdvcmQoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY2Fyb3VzZWxSaWdodCgpIHtcclxuICBjYXJvdXNlbDJkLnJpZ2h0KClcclxuICBDSEFSX1BBVFRFUk5fV09SRFMgPSBjYXJvdXNlbDJkLmdldE5hdkl0ZW1UZXh0KClcclxuICBmb3JtTmV3UGFydGljbGVXb3JkKClcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tVFJBTlNJVElPTiBQQVJUSUNMRVMgQkVUV0VFTiBCRUhBVklPVVIgVFlQRVNcclxuZnVuY3Rpb24gaG9sZFRvQ2hhclRyYW5zaXRpb24oKSB7XHJcbiAgbGV0IHJlcXVpcmVkUGFydGljbGVzID0gbGV0dGVyc0xpYi50b3RhbFJlcXVpcmVkUGFydGljbGVzKENIQVJfUEFUVEVSTl9XT1JEUylcclxuICBsZXQgd29yZHNJblJvd3MgPSBsZXR0ZXJzTGliLnBsYWNlV29yZHNJblJvd3MoQ0hBUl9QQVRURVJOX1dPUkRTLCBNQVhfQ0hBUlNfUEVSX1JPVylcclxuICBsZXQgZGVzdGluYXRpb25zQW5kVGFyZ2V0cyA9IGxldHRlcnNMaWIuY2FsY0xldHRlclBhcnRpY2xlc0Rlc3RBbmRUYXJnZXRzKHdvcmRzSW5Sb3dzLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KVxyXG5cclxuICBpZiAoaG9sZFBhdHRlcm5QYXJ0aWNsZXMubGVuZ3RoID4gcmVxdWlyZWRQYXJ0aWNsZXMpIHtcclxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCByZXF1aXJlZFBhcnRpY2xlczsgaSsrKSB7XHJcbiAgICAgIGxldCB0cmFuc2ZlcnJpbmdQYXJ0aWNsZSA9IGhvbGRQYXR0ZXJuUGFydGljbGVzLnBvcCgpXHJcbiAgICAgIGxldCBjb29yZHMgPSB7XHJcbiAgICAgICAgeDogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLngsXHJcbiAgICAgICAgeTogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLnksXHJcbiAgICAgICAgeDA6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy54LFxyXG4gICAgICAgIHkwOiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueSxcclxuICAgICAgICB4MTogZGVzdGluYXRpb25zQW5kVGFyZ2V0c1tpXS54MSxcclxuICAgICAgICB5MTogZGVzdGluYXRpb25zQW5kVGFyZ2V0c1tpXS55MVxyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgc3BlZWQgPSBIT0xEX1NQRUVEICogNFxyXG4gICAgICBsZXQgZGlzdE1vdmVkID0gMFxyXG4gICAgICBsZXQgcG9pbnRzQXQgPSBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzW2ldLnBvaW50c0F0XHJcbiAgICAgIGNoYXJQYXR0ZXJuUGFydGljbGVzLnB1c2gobmV3IENoYXJQYXR0ZXJuUGFydGljbGUoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkLCBwb2ludHNBdCkpXHJcbiAgICB9XHJcblxyXG4gIH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNoYXJUb0hvbGRUcmFuc2l0aW9uKCkge1xyXG4gIHdoaWxlKGNoYXJQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA+IDApIHtcclxuICAgIGxldCB0cmFuc2ZlcnJpbmdQYXJ0aWNsZSA9IGNoYXJQYXR0ZXJuUGFydGljbGVzLnBvcCgpXHJcbiAgICBsZXQgZGlzdE1vdmVkID0gMFxyXG4gICAgbGV0IHNwZWVkID0gIE1hdGgucm91bmQoIChNYXRoLnJhbmRvbSgpICogKEhPTERfU1BFRUQgKiAxMCAtIEhPTERfU1BFRUQpICsgSE9MRF9TUEVFRCkgKiAxMDAwICkgLyAxMDAwXHJcbiAgICBsZXQgZnJvbVdQID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNilcclxuICAgIGxldCBuZXh0V1AgPSBmcm9tV1AgKyAxID09PSBIT0xEX1BBVFRFUk5fV0FZUE9JTlRTLmxlbmd0aCA/IDAgOiBmcm9tV1AgKyAxXHJcbiAgICBsZXQgc3RhcnRDb29yZHMgPSB7eDogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLngsIHk6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy55fVxyXG4gICAgbGV0IGVuZENvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW25leHRXUF0pXHJcbiAgICBsZXQgY3AxQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHN0YXJ0Q29vcmRzLCBlbmRDb29yZHMpXHJcbiAgICBsZXQgY3AyQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHN0YXJ0Q29vcmRzLCBlbmRDb29yZHMpXHJcbiAgICBsZXQgY29vcmRzID0ge1xyXG4gICAgICB4OiBzdGFydENvb3Jkcy54LFxyXG4gICAgICB5OiBzdGFydENvb3Jkcy55LFxyXG4gICAgICB4MDogc3RhcnRDb29yZHMueCxcclxuICAgICAgeTA6IHN0YXJ0Q29vcmRzLnksXHJcbiAgICAgIHgxOiBlbmRDb29yZHMueCxcclxuICAgICAgeTE6IGVuZENvb3Jkcy55LFxyXG4gICAgICBjcDF4OiBjcDFDb29yZHMueCxcclxuICAgICAgY3AxeTogY3AxQ29vcmRzLnksXHJcbiAgICAgIGNwMng6IGNwMkNvb3Jkcy54LFxyXG4gICAgICBjcDJ5OiBjcDJDb29yZHMueVxyXG4gICAgfVxyXG5cclxuICAgIGhvbGRQYXR0ZXJuUGFydGljbGVzLnVuc2hpZnQobmV3IEhvbGRQYXR0ZXJuUGFydGljbGUoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkLCBuZXh0V1ApKVxyXG4gIH1cclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1VUERBVEUgUEFSVElDTEUgUE9TSVRJT05TICYgUkVOREVSXHJcbmZ1bmN0aW9uIGFuaW1hdGUoKSB7XHJcbiAgZnJhbWVJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKVxyXG4gIGN0eDEuY2xlYXJSZWN0KDAsIDAsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpXHJcbiAgLy9jYW52YXNIZWxwZXJzLnJlbmRlckJvdW5kaW5nQ2lyY2xlKGN0eDEsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpLy9kZXZcclxuICAvL2NhbnZhc0hlbHBlcnMucmVuZGVySG9sZFBhdHRlcm5XUHMoY3R4MSwgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwpLy9kZXZcclxuICAvL2NhbnZhc0hlbHBlcnMucmVuZGVySG9sZFBhdHRlcm5QYXJ0aWNsZVBhdGhzKGN0eDEsIGhvbGRQYXR0ZXJuUGFydGljbGVzKS8vZGV2XHJcbiAgdXBkYXRlSG9sZFBhdHRlcm5QYXJ0aWNsZXMoKVxyXG4gIHVwZGF0ZUNoYXJQYXR0ZXJuUGFydGljbGVzKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUhvbGRQYXR0ZXJuUGFydGljbGVzKCkge1xyXG4gIGhvbGRQYXR0ZXJuUGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xyXG4gICAgcGFydGljbGUudXBkYXRlUG9zKEhPTERfUEFUVEVSTl9XQVlQT0lOVFMsIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsLCBIT0xEX1NQRUVEKVxyXG4gICAgcGFydGljbGUuZHJhdyhjdHgxLCAnd2hpdGUnKVxyXG4gIH0pXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiB1cGRhdGVDaGFyUGF0dGVyblBhcnRpY2xlcygpIHtcclxuICBjaGFyUGF0dGVyblBhcnRpY2xlcy5mb3JFYWNoKChwYXJ0aWNsZSwgaW5kZXgpID0+IHtcclxuICAgIHBhcnRpY2xlLnVwZGF0ZVBvcygpXHJcbiAgICBwYXJ0aWNsZS5kcmF3KGN0eDEsICd3aGl0ZScsICdyZWQnKVxyXG4gICAgcGFydGljbGUuZHJhd1RvUG9pbnRzQXQoY3R4MSwgY2hhclBhdHRlcm5QYXJ0aWNsZXMsIGluZGV4LCAnIzFmMjYzMycsICcjZmYwMDAwJylcclxuICB9KVxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUxBWU9VVCBCUkVBSyBQT0lOVFNcclxuZnVuY3Rpb24gc2V0TGF5b3V0KCkge1xyXG4gIC8vc21hbGwgd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC41XHJcbiAgfVxyXG4gIC8vc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcbiAgLy9tZWRpdW0gd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gMTAyNCAmJiBib2R5LmNsaWVudFdpZHRoID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuN1xyXG4gIH1cclxuICAvL21lZGl1bSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA8PSAxMDI0ICYmIGJvZHkuY2xpZW50SGVpZ2h0ID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjY1XHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuICAvL2xhcmdlIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoID4gMTAyNCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbGFyZ2Ugd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNjVcclxuICB9XHJcbiAgLy9sYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcblxyXG4gIGNhbnZhczEud2lkdGggPSBjYW52YXNXaWR0aFxyXG4gIGNhbnZhczEuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0XHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tUEFSVElDTEUgQ0xBU1NFU1xyXG4iLCIvLyBEYWxlJ3MgdXNlcm5hbWU6IGRha2VibFxyXG5cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLU1JU0MgSEVMUEVSU1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1NQVRIIEhFTFBFUlNcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1HRU9NRVRSWSBIRUxQRVJTXHJcbmZ1bmN0aW9uIHJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMocDEsIHAyKSB7XHJcbiAgY29uc3QgTUlOX0RJU1QgPSA0MFxyXG4gIGNvbnN0IERJU1RfTU9EID0gMC41XHJcbiAgY29uc3QgQU5HTEVfV0lUSElOID0gTWF0aC5QSVxyXG4gIGxldCBhID0gcDIueCAtIHAxLnhcclxuICBsZXQgYiA9IHAyLnkgLSBwMS55XHJcbiAgbGV0IHAxUDJEaXN0ID0gTWF0aC5zcXJ0KGEqYSArIGIqYilcclxuICBsZXQgcmFuZERpc3QgPSAoTWF0aC5yYW5kb20oKSAqIHAxUDJEaXN0ICogRElTVF9NT0QpICsgTUlOX0RJU1RcclxuICBsZXQgYW5nbGVNb2QgPSAoTWF0aC5yYW5kb20oKSAqIEFOR0xFX1dJVEhJTikgLSAoQU5HTEVfV0lUSElOIC8gMilcclxuICBsZXQgcmFuZEFuZ2xlXHJcbiAgbGV0IGNvb3JkcyA9IHt4OiBudWxsLCB5OiBudWxsfVxyXG5cclxuICBpZihNYXRoLnJhbmRvbSgpID49IDAuNSkge1xyXG4gICAgcmFuZEFuZ2xlID0gTWF0aC5hdGFuMihwMi55IC0gcDEueSwgcDEueCAtIHAyLngpICsgYW5nbGVNb2RcclxuICAgIGNvb3Jkcy54ID0gcDIueCArIE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gICAgY29vcmRzLnkgPSBwMi55IC0gTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgfSBlbHNlIHtcclxuICAgIHJhbmRBbmdsZSA9IE1hdGguYXRhbjIocDEueSAtIHAyLnksIHAyLnggLSBwMS54KSArIGFuZ2xlTW9kXHJcbiAgICBjb29yZHMueCA9IHAxLnggKyBNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICAgIGNvb3Jkcy55ID0gcDEueSAtIE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGNvb3Jkc1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmFuZFBvaW50TmVhclBvaW50KHB0KSB7XHJcbiAgY29uc3QgTUFYX0ZST00gPSA0MFxyXG4gIGxldCByYW5kRGlzdCA9IE1hdGgucmFuZG9tKCkgKiBNQVhfRlJPTVxyXG4gIGxldCByYW5kQW5nbGUgPSBNYXRoLnJhbmRvbSgpICogTWF0aC5QSSAqIDJcclxuICBsZXQgeCA9IHB0LnggKyBNYXRoLnJvdW5kKE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdClcclxuICBsZXQgeSA9IHB0LnkgKyBNYXRoLnJvdW5kKE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdClcclxuXHJcbiAgcmV0dXJuIHt4OiB4LCB5OiB5fVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY29vcmRzT25TdHJhaWdodExpbmUocGVyY2VudCwgc3RhcnRQdCwgZW5kUHQpIHtcclxuICBsZXQgeFRvdGFsID0gZW5kUHQueCAtIHN0YXJ0UHQueFxyXG4gIGxldCB5VG90YWwgPSBlbmRQdC55IC0gc3RhcnRQdC55XHJcbiAgbGV0IHhEaXN0ID0gcGVyY2VudCAqIHhUb3RhbFxyXG4gIGxldCB5RGlzdCA9IHBlcmNlbnQgKiB5VG90YWxcclxuXHJcbiAgcmV0dXJuIHt4OiBzdGFydFB0LnggKyB4RGlzdCwgeTogc3RhcnRQdC55ICsgeURpc3R9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjb29yZHNPbkN1YmljQmV6aWVyKHBlcmNlbnQsIHN0YXJ0UHQsIGNwMSwgY3AyLCBlbmRQdCkgey8vc3RvbGVuIGZyb20gc3RhY2tvdmVyZmxvd1xyXG4gIGxldCB0MiA9IHBlcmNlbnQgKiBwZXJjZW50XHJcbiAgbGV0IHQzID0gdDIgKiBwZXJjZW50XHJcblxyXG4gIHJldHVybiBzdGFydFB0ICsgKC1zdGFydFB0ICogMyArIHBlcmNlbnQgKiAoMyAqIHN0YXJ0UHQgLSBzdGFydFB0ICogcGVyY2VudCkpICogcGVyY2VudFxyXG4gICsgKDMgKiBjcDEgKyBwZXJjZW50ICogKC02ICogY3AxICsgY3AxICogMyAqIHBlcmNlbnQpKSAqIHBlcmNlbnRcclxuICArIChjcDIgKiAzIC0gY3AyICogMyAqIHBlcmNlbnQpICogdDJcclxuICArIGVuZFB0ICogdDNcclxufVxyXG5cclxuXHJcbi8vLS1GVU5DVElPTlMgVE8gUkVOREVSIFdBWVBPSU5UUywgQ09OVFJPTCBQT0lOVFMsIEVUQyBVU0VEIElOIFBBUlRJQ0xFIENSRUFUSU9OXHJcbi8vTk9UIE5FQ0VTU0FSSUxZIFVTRUQgQlVUIFVTRUZVTCBGT1IgREVCVUdHSU5HXHJcbmZ1bmN0aW9uIHJlbmRlckJvdW5kaW5nQ2lyY2xlKGN0eCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkge1xyXG4gIGxldCBjZW50ZXJYID0gY2FudmFzV2lkdGggLyAyXHJcbiAgbGV0IGNlbnRlclkgPSBjYW52YXNIZWlnaHQgLyAyXHJcbiAgbGV0IHJhZGl1cyA9IGNlbnRlclkgPiBjZW50ZXJYID8gY2VudGVyWCAtIDIgOiBjZW50ZXJZIC0gMlxyXG4gIGxldCBzdGFydEFuZ2xlID0gMFxyXG4gIGxldCBlbmRBbmdsZSA9IDIgKiBNYXRoLlBJXHJcbiAgY3R4LmxpbmVXaWR0aCA9IDFcclxuICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JleSdcclxuICBjdHguYmVnaW5QYXRoKClcclxuICBjdHguYXJjKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiByZW5kZXJIb2xkUGF0dGVybldQcyhjdHgsIHdheXBvaW50cykge1xyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5maWxsU3R5bGUgPSAnYmx1ZSdcclxuICB3YXlwb2ludHMuZm9yRWFjaCh3cCA9PiB7XHJcbiAgICBjdHguZmlsbFJlY3Qod3AueCAtIDQsIHdwLnkgLSA0LCA4LCA4KVxyXG4gIH0pXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiByZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHMoY3R4LCBwYXJ0aWNsZXMpIHtcclxuICBwYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7XHJcbiAgICBsZXQgY3AxWCA9IHBhcnRpY2xlLmNvb3Jkcy5jcDF4XHJcbiAgICBsZXQgY3AxWSA9IHBhcnRpY2xlLmNvb3Jkcy5jcDF5XHJcbiAgICBsZXQgY3AyWCA9IHBhcnRpY2xlLmNvb3Jkcy5jcDJ4XHJcbiAgICBsZXQgY3AyWSA9IHBhcnRpY2xlLmNvb3Jkcy5jcDJ5XHJcbiAgICBsZXQgc3RhcnRYID0gcGFydGljbGUuY29vcmRzLngwXHJcbiAgICBsZXQgc3RhcnRZID0gcGFydGljbGUuY29vcmRzLnkwXHJcbiAgICBsZXQgZW5kWCA9IHBhcnRpY2xlLmNvb3Jkcy54MVxyXG4gICAgbGV0IGVuZFkgPSBwYXJ0aWNsZS5jb29yZHMueTFcclxuICAgIGN0eC5saW5lV2lkdGggPSAxXHJcbiAgICAvL3JlbmRlciBzdGFydCBwb2ludFxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JlZW4nXHJcbiAgICBjdHgucmVjdChzdGFydFggLSAyLCBzdGFydFkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBlbmQgcG9pbnRcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZWQnXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5yZWN0KGVuZFggLSAyLCBlbmRZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAxXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICd5ZWxsb3cnXHJcbiAgICBjdHgucmVjdChjcDFYIC0gMiwgY3AxWSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIGNvbnRyb2wgcG9pbnQgMlxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnb3JhbmdlJ1xyXG4gICAgY3R4LnJlY3QoY3AyWCAtIDIsIGNwMlkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBwYXRoXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmV5J1xyXG4gICAgY3R4Lm1vdmVUbyhzdGFydFgsIHN0YXJ0WSlcclxuICAgIGN0eC5iZXppZXJDdXJ2ZVRvKGNwMVgsIGNwMVksIGNwMlgsIGNwMlksIGVuZFgsIGVuZFkpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICB9KVxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUNPTE9SIEhFTFBFUlNcclxuLy93b3VsZCBiZSBtb3JlIGVmZmljaWVudCB0byB0YWtlIGFyZ3MgYXMge3I6IDAtMjU1LCBnOiAwLTI1NSwgYjowLTI1NX1cclxuLy9zbyBubyBuZWVkIHRoZSBoZXggYXJyYXkgc3R1ZmYgYnV0IG9rIGZvciBub3cgYXMgZHJhd2luZ1xyXG4vL2EgZmV3IGh1bmRyZWQgcGFydGljbGVzIHdpdGhvdXQgbGFnXHJcbmZ1bmN0aW9uIGNvbG9yQmV0d2VlblR3b0NvbG9ycyhwZXJjZW50LCBjb2xvck9uZSwgY29sb3JUd28pIHtcclxuICBsZXQgaGV4ID0gWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJ11cclxuXHJcbiAgLy9jb2xvck9uZVxyXG4gIGxldCBjMVJlZEluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoMSkgKVxyXG4gIGxldCBjMVJlZEluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoMikgKVxyXG4gIGxldCBjMVJlZEJhc2VUZW4gPSAoYzFSZWRJbmRleDAgKiAxNikgKyAoYzFSZWRJbmRleDEpXHJcblxyXG4gIGxldCBjMUdyZWVuSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCgzKSApXHJcbiAgbGV0IGMxR3JlZW5JbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDQpIClcclxuICBsZXQgYzFHcmVlbmRCYXNlVGVuID0gKGMxR3JlZW5JbmRleDAgKiAxNikgKyAoYzFHcmVlbkluZGV4MSlcclxuXHJcbiAgbGV0IGMxQmx1ZUluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoNSkgKVxyXG4gIGxldCBjMUJsdWVJbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDYpIClcclxuICBsZXQgYzFCbHVlQmFzZVRlbiA9IChjMUJsdWVJbmRleDAgKiAxNikgKyAoYzFCbHVlSW5kZXgxKVxyXG5cclxuICAvL2NvbG9yVHdvXHJcbiAgbGV0IGMyUmVkSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCgxKSApXHJcbiAgbGV0IGMyUmVkSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCgyKSApXHJcbiAgbGV0IGMyUmVkQmFzZVRlbiA9IChjMlJlZEluZGV4MCAqIDE2KSArIChjMlJlZEluZGV4MSlcclxuXHJcbiAgbGV0IGMyR3JlZW5JbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDMpIClcclxuICBsZXQgYzJHcmVlbkluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoNCkgKVxyXG4gIGxldCBjMkdyZWVuZEJhc2VUZW4gPSAoYzJHcmVlbkluZGV4MCAqIDE2KSArIChjMkdyZWVuSW5kZXgxKVxyXG5cclxuICBsZXQgYzJCbHVlSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCg1KSApXHJcbiAgbGV0IGMyQmx1ZUluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoNikgKVxyXG4gIGxldCBjMkJsdWVCYXNlVGVuID0gKGMyQmx1ZUluZGV4MCAqIDE2KSArIChjMkJsdWVJbmRleDEpXHJcblxyXG4gIGxldCByZWREZWx0YSA9IGMyUmVkQmFzZVRlbiAtIGMxUmVkQmFzZVRlblxyXG4gIGxldCBncmVlbkRlbHRhID0gYzJHcmVlbmRCYXNlVGVuIC0gYzFHcmVlbmRCYXNlVGVuXHJcbiAgbGV0IGJsdWVEZWx0YSA9IGMyQmx1ZUJhc2VUZW4gLSBjMUJsdWVCYXNlVGVuXHJcblxyXG4gIGxldCByZWROb3cgPSBNYXRoLnJvdW5kKCBjMVJlZEJhc2VUZW4gKyAocmVkRGVsdGEgKiBwZXJjZW50KSApXHJcbiAgbGV0IGdyZWVuTm93ID0gTWF0aC5yb3VuZCggYzFHcmVlbmRCYXNlVGVuICsgKGdyZWVuRGVsdGEgKiBwZXJjZW50KSApXHJcbiAgbGV0IGJsdWVOb3cgPSBNYXRoLnJvdW5kKCBjMUJsdWVCYXNlVGVuICsgKGJsdWVEZWx0YSAqIHBlcmNlbnQpIClcclxuXHJcbiAgcmV0dXJuIHtyOiByZWROb3csIGc6IGdyZWVuTm93LCBiOiBibHVlTm93fS8vdGVtcFxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVYUE9SVFNcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgcmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyxcclxuICByYW5kUG9pbnROZWFyUG9pbnQsXHJcbiAgY29vcmRzT25TdHJhaWdodExpbmUsXHJcbiAgY29vcmRzT25DdWJpY0JlemllcixcclxuICBjb2xvckJldHdlZW5Ud29Db2xvcnMsXHJcbiAgLy9kZXZcclxuICByZW5kZXJCb3VuZGluZ0NpcmNsZSxcclxuICByZW5kZXJIb2xkUGF0dGVybldQcyxcclxuICByZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHNcclxufVxyXG4iLCJjb25zdCBDQVJPVVNFTF9EQVRBID0gW1xyXG4gIHt0ZXh0OiAnWkVSTycsIGJnQ29sb3I6ICdyZWQnLCBuYXZJdGVtczogW1xyXG4gICAge3RleHQ6ICd6ZXJvIGEnLCBiZ0NvbG9yOiAncmVkJ30sXHJcbiAgICB7dGV4dDogJ3plcm8gYicsIGJnQ29sb3I6ICdncmVlbid9LFxyXG4gICAge3RleHQ6ICd6ZXJvIGMnLCBiZ0NvbG9yOiAnYmx1ZSd9LFxyXG4gICAge3RleHQ6ICd6ZXJvIGQnLCBiZ0NvbG9yOiAnb3JhbmdlJ30sXHJcbiAgICB7dGV4dDogJ3plcm8gZScsIGJnQ29sb3I6ICdwdXJwbGUnfVxyXG4gIF19LFxyXG4gIHt0ZXh0OiAnT05FJywgYmdDb2xvcjogJ2dyZWVuJywgbmF2SXRlbXM6IFtcclxuICAgIHt0ZXh0OiAnb25lIGEnLCBiZ0NvbG9yOiAncmVkJ30sXHJcbiAgICB7dGV4dDogJ29uZSBiJywgYmdDb2xvcjogJ2dyZWVuJ30sXHJcbiAgICB7dGV4dDogJ29uZSBjJywgYmdDb2xvcjogJ2JsdWUnfSxcclxuICAgIHt0ZXh0OiAnb25lIGQnLCBiZ0NvbG9yOiAnb3JhbmdlJ30sXHJcbiAgICB7dGV4dDogJ29uZSBlJywgYmdDb2xvcjogJ3B1cnBsZSd9XHJcbiAgXX0sXHJcbiAge3RleHQ6ICdUV08nLCBiZ0NvbG9yOiAnYmx1ZScsIG5hdkl0ZW1zOiBbXHJcbiAgICB7dGV4dDogJ3R3byBhJywgYmdDb2xvcjogJ3JlZCd9LFxyXG4gICAge3RleHQ6ICd0d28gYicsIGJnQ29sb3I6ICdncmVlbid9LFxyXG4gICAge3RleHQ6ICd0d28gYycsIGJnQ29sb3I6ICdibHVlJ30sXHJcbiAgICB7dGV4dDogJ3R3byBkJywgYmdDb2xvcjogJ29yYW5nZSd9LFxyXG4gICAge3RleHQ6ICd0d28gZScsIGJnQ29sb3I6ICdwdXJwbGUnfVxyXG4gIF19LFxyXG4gIHt0ZXh0OiAnVEhSRUUnLCBiZ0NvbG9yOiAnb3JhbmdlJywgbmF2SXRlbXM6IFtcclxuICAgIHt0ZXh0OiAndGhyZWUgYScsIGJnQ29sb3I6ICdyZWQnfSxcclxuICAgIHt0ZXh0OiAndGhyZWUgYicsIGJnQ29sb3I6ICdncmVlbid9LFxyXG4gICAge3RleHQ6ICd0aHJlZSBjJywgYmdDb2xvcjogJ2JsdWUnfSxcclxuICAgIHt0ZXh0OiAndGhyZWUgZCcsIGJnQ29sb3I6ICdvcmFuZ2UnfSxcclxuICAgIHt0ZXh0OiAndGhyZWUgZScsIGJnQ29sb3I6ICdwdXJwbGUnfVxyXG4gIF19LFxyXG4gIHt0ZXh0OiAnRk9VUicsIGJnQ29sb3I6ICdwdXJwbGUnLCBuYXZJdGVtczogW1xyXG4gICAge3RleHQ6ICdmb3VyIGEnLCBiZ0NvbG9yOiAncmVkJ30sXHJcbiAgICB7dGV4dDogJ2ZvdXIgYicsIGJnQ29sb3I6ICdncmVlbid9LFxyXG4gICAge3RleHQ6ICdmb3VyIGMnLCBiZ0NvbG9yOiAnYmx1ZSd9LFxyXG4gICAge3RleHQ6ICdmb3VyIGQnLCBiZ0NvbG9yOiAnb3JhbmdlJ30sXHJcbiAgICB7dGV4dDogJ2ZvdXIgZScsIGJnQ29sb3I6ICdwdXJwbGUnfVxyXG4gIF19LFxyXG4gIHt0ZXh0OiAnRklWRScsIGJnQ29sb3I6ICd3aGl0ZScsIG5hdkl0ZW1zOiBbXHJcbiAgICB7dGV4dDogJ2ZpdmUgYScsIGJnQ29sb3I6ICdibGFjayd9LFxyXG4gICAge3RleHQ6ICdmaXZlIGInLCBiZ0NvbG9yOiAnd2hpdGUnfSxcclxuICAgIHt0ZXh0OiAnZml2ZSBjJywgYmdDb2xvcjogJ2JsYWNrJ30sXHJcbiAgICB7dGV4dDogJ2ZpdmUgZCcsIGJnQ29sb3I6ICd3aGl0ZSd9LFxyXG4gICAge3RleHQ6ICdmaXZlIGUnLCBiZ0NvbG9yOiAnYmxhY2snfSxcclxuICAgIHt0ZXh0OiAnZml2ZSBmJywgYmdDb2xvcjogJ3JlZCd9XHJcbiAgXX1cclxuXVxyXG5jb25zdCBDQVJPVVNFTF9DT0xTID0gNVxyXG5jb25zdCBDQVJPVVNFTF9ST1dTID0gNVxyXG5jb25zdCBDRU5URVJfQ09MID0gMlxyXG5jb25zdCBDRU5URVJfUk9XID0gMlxyXG5cclxubGV0IGNhcm91c2VsQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdmlnYXRvck5hdkl0ZW1zJykvL211c3QgYmUgbWF0Y2hlZCB0byBjYXJvdXNlbCBjb250YWluZXIgZWxlbWVudFxyXG5sZXQgY2Fyb3VzZWxWaXNpYmxlSXRlbXNcclxubGV0IHNlbGVjdGVkQ29sID0gMFxyXG5sZXQgc2VsZWN0ZWRSb3dJbkNvbHMgPSBbXVxyXG5sZXQgY2Fyb3VzZWxFbGVtZW50cyA9IFtdXHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTUFOQUdFUlNcclxuLy9pbml0aWFsaXplXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbihldmVudCkge1xyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBDQVJPVVNFTF9EQVRBLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBzZWxlY3RlZFJvd0luQ29scy5wdXNoKDApXHJcbiAgfVxyXG5cclxuICBmb3IobGV0IGkgPSAwOyBpIDwgQ0FST1VTRUxfQ09MUzsgaSsrKSB7XHJcbiAgICBjYXJvdXNlbEVsZW1lbnRzLnB1c2goW10pXHJcbiAgICBmb3IobGV0IGogPSAwOyBqIDwgQ0FST1VTRUxfUk9XUzsgaisrKSB7XHJcbiAgICAgIGNhcm91c2VsRWxlbWVudHNbaV0ucHVzaChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGAuY2Fyb3VzZWxJdGVtOm50aC1vZi10eXBlKCR7MSArIGl9bikgLm5hdkl0ZW1gKVtqXSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlbmRlcigpXHJcbn0pXHJcblxyXG5cclxuZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gIHVwZGF0ZUNhcm91c2VsU3RhdGUoKVxyXG4gIHJlbW92ZUNhcm91c2VsQ2VsbHMoKVxyXG4gIHJlbW92ZUNhcm91c2VsQ29sdW1ucygpXHJcbiAgbWFrZUNhcm91c2VsQ29sdW1ucygpXHJcbiAgbWFrZUNhcm91c2VsQ2VsbHMoKVxyXG4gIHVwZGF0ZUNhcm91c2VsU3RhdGUoKVxyXG4gIHBvcHVsYXRlQ2Fyb3VzZWxDb2x1bW5zKClcclxuICBwb3B1bGF0ZUNhcm91c2VsQ2VsbHMoKVxyXG4gIHVwZGF0ZUNhcm91c2VsU3RhdGUoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gbGVmdCgpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgY2Fyb3VzZWxWaXNpYmxlSXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGNhcm91c2VsVmlzaWJsZUl0ZW1zW2ldLmNsYXNzTGlzdC5hZGQoJ21vdmVkTGVmdCcpXHJcbiAgfVxyXG5cclxuICBkZWNIb3JpeigpXHJcbiAgdXBkYXRlQ2Fyb3VzZWxTdGF0ZSgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiByaWdodCgpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgY2Fyb3VzZWxWaXNpYmxlSXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGNhcm91c2VsVmlzaWJsZUl0ZW1zW2ldLmNsYXNzTGlzdC5hZGQoJ21vdmVkUmlnaHQnKVxyXG4gIH1cclxuXHJcbiAgaW5jSG9yaXooKVxyXG4gIHVwZGF0ZUNhcm91c2VsU3RhdGUoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gdXAoKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IGNhcm91c2VsRWxlbWVudHNbQ0VOVEVSX0NPTF0ubGVuZ3RoOyBpKyspIHtcclxuICAgIGNhcm91c2VsRWxlbWVudHNbQ0VOVEVSX0NPTF1baV0uY2xhc3NMaXN0LmFkZCgnbW92ZWRVcCcpXHJcbiAgfVxyXG5cclxuICBpbmNWZXJ0KClcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGRvd24oKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IGNhcm91c2VsRWxlbWVudHNbQ0VOVEVSX0NPTF0ubGVuZ3RoOyBpKyspIHtcclxuICAgIGNhcm91c2VsRWxlbWVudHNbQ0VOVEVSX0NPTF1baV0uY2xhc3NMaXN0LmFkZCgnbW92ZWREb3duJylcclxuICB9XHJcblxyXG4gIGRlY1ZlcnQoKVxyXG4gIHVwZGF0ZUNhcm91c2VsU3RhdGUoKVxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUhFTFBFUlNcclxuZnVuY3Rpb24gcmVtb3ZlQ2Fyb3VzZWxDb2x1bW5zKCkge1xyXG4gIHdoaWxlKGNhcm91c2VsQ29udGFpbmVyLmZpcnN0Q2hpbGQpIHtcclxuICAgIGNhcm91c2VsQ29udGFpbmVyLnJlbW92ZUNoaWxkKGNhcm91c2VsQ29udGFpbmVyLmZpcnN0Q2hpbGQpXHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlQ2Fyb3VzZWxDZWxscygpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgY2Fyb3VzZWxWaXNpYmxlSXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHdoaWxlKGNhcm91c2VsVmlzaWJsZUl0ZW1zW2ldLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgY2Fyb3VzZWxWaXNpYmxlSXRlbXNbaV0ucmVtb3ZlQ2hpbGQoY2Fyb3VzZWxWaXNpYmxlSXRlbXNbaV0uZmlyc3RDaGlsZClcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBtYWtlQ2Fyb3VzZWxDb2x1bW5zKCkge1xyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBDQVJPVVNFTF9DT0xTOyBpKyspIHtcclxuICAgIGxldCBuZXdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgIG5ld0VsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2Fyb3VzZWxJdGVtJylcclxuICAgIG5ld0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIHJlbmRlcilcclxuICAgIGNhcm91c2VsQ29udGFpbmVyLmFwcGVuZENoaWxkKG5ld0VsZW1lbnQpXHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gbWFrZUNhcm91c2VsQ2VsbHMoKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IENBUk9VU0VMX0NPTFM7IGkrKykge1xyXG4gICAgZm9yKGxldCBqID0gMDsgaiA8IENBUk9VU0VMX1JPV1M7IGorKykge1xyXG4gICAgICBsZXQgbmV3RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgIG5ld0VsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbmF2SXRlbScpXHJcbiAgICAgIG5ld0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIHJlbmRlcilcclxuICAgICAgY2Fyb3VzZWxWaXNpYmxlSXRlbXNbal0uYXBwZW5kQ2hpbGQobmV3RWxlbWVudClcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiB1cGRhdGVDYXJvdXNlbFN0YXRlKCkge1xyXG4gIGNhcm91c2VsVmlzaWJsZUl0ZW1zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnY2Fyb3VzZWxJdGVtJylcclxuXHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IENBUk9VU0VMX0NPTFM7IGkrKykge1xyXG4gICAgZm9yKGxldCBqID0gMDsgaiA8IENBUk9VU0VMX1JPV1M7IGorKykge1xyXG4gICAgICBjYXJvdXNlbEVsZW1lbnRzW2ldW2pdID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLmNhcm91c2VsSXRlbTpudGgtb2YtdHlwZSgkezEgKyBpfW4pIC5uYXZJdGVtYClbal1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBpbmNIb3JpeigpIHtcclxuICBzZWxlY3RlZENvbCA9IHNlbGVjdGVkQ29sID09PSBDQVJPVVNFTF9EQVRBLmxlbmd0aCAtIDEgPyAwIDogc2VsZWN0ZWRDb2wgKyAxXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBkZWNIb3JpeigpIHtcclxuICBzZWxlY3RlZENvbCA9IHNlbGVjdGVkQ29sID09PSAwID8gQ0FST1VTRUxfREFUQS5sZW5ndGggLSAxIDogc2VsZWN0ZWRDb2wgLSAxXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBpbmNWZXJ0KCkge1xyXG4gIHNlbGVjdGVkUm93SW5Db2xzW3NlbGVjdGVkQ29sXSA9IHNlbGVjdGVkUm93SW5Db2xzW3NlbGVjdGVkQ29sXSA9PT0gQ0FST1VTRUxfREFUQVtzZWxlY3RlZENvbF0ubmF2SXRlbXMubGVuZ3RoIC0gMSA/IDAgOiBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gKyAxXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBkZWNWZXJ0KCkge1xyXG4gIHNlbGVjdGVkUm93SW5Db2xzW3NlbGVjdGVkQ29sXSA9IHNlbGVjdGVkUm93SW5Db2xzW3NlbGVjdGVkQ29sXSA9PT0gMCA/IENBUk9VU0VMX0RBVEFbc2VsZWN0ZWRDb2xdLm5hdkl0ZW1zLmxlbmd0aCAtIDEgOiBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gLSAxXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBwb3B1bGF0ZUNhcm91c2VsQ29sdW1ucygpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgQ0FST1VTRUxfQ09MUzsgaSsrKSB7XHJcbiAgICBsZXQgeCA9IHNlbGVjdGVkQ29sICsgaSArIENBUk9VU0VMX0RBVEEubGVuZ3RoIC0gMlxyXG4gICAgd2hpbGUoeCA+PSBDQVJPVVNFTF9EQVRBLmxlbmd0aCkge3ggPSB4IC0gQ0FST1VTRUxfREFUQS5sZW5ndGh9XHJcblxyXG4gICAgY2Fyb3VzZWxWaXNpYmxlSXRlbXNbQ0FST1VTRUxfQ09MUyAtIDEgLSBpXS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDQVJPVVNFTF9EQVRBW3hdLmJnQ29sb3JcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBvcHVsYXRlQ2Fyb3VzZWxDZWxscygpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgQ0FST1VTRUxfQ09MUzsgaSsrKSB7XHJcbiAgICBsZXQgeCA9IHNlbGVjdGVkQ29sICsgaSArIENBUk9VU0VMX0RBVEEubGVuZ3RoIC0gMlxyXG4gICAgd2hpbGUoeCA+PSBDQVJPVVNFTF9EQVRBLmxlbmd0aCkge3ggPSB4IC0gQ0FST1VTRUxfREFUQS5sZW5ndGh9XHJcblxyXG4gICAgZm9yKGxldCBqID0gMDsgaiA8IENBUk9VU0VMX1JPV1M7IGorKykge1xyXG4gICAgICBsZXQgeSA9IHNlbGVjdGVkUm93SW5Db2xzW3hdICsgalxyXG4gICAgICB3aGlsZSh5ID49IENBUk9VU0VMX0RBVEFbeF0ubmF2SXRlbXMubGVuZ3RoKSB7eSA9IHkgLSBDQVJPVVNFTF9EQVRBW3hdLm5hdkl0ZW1zLmxlbmd0aH1cclxuXHJcbiAgICAgIGNhcm91c2VsRWxlbWVudHNbQ0FST1VTRUxfQ09MUyAtIDEgLSBpXVtqXS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDQVJPVVNFTF9EQVRBW3hdLm5hdkl0ZW1zW3ldLmJnQ29sb3JcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBnZXROYXZUb3BpY1RleHQoKSB7XHJcbiAgcmV0dXJuIENBUk9VU0VMX0RBVEFbc2VsZWN0ZWRDb2xdLnRleHRcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGdldE5hdkl0ZW1UZXh0KCkge1xyXG4gIGxldCB5ID0gW3NlbGVjdGVkUm93SW5Db2xzW3NlbGVjdGVkQ29sXSArIENFTlRFUl9ST1ddXHJcbiAgd2hpbGUoeSA+PSBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS5uYXZJdGVtcy5sZW5ndGgpIHt5ID0geSAtIENBUk9VU0VMX0RBVEFbc2VsZWN0ZWRDb2xdLm5hdkl0ZW1zLmxlbmd0aH1cclxuXHJcbiAgcmV0dXJuIENBUk9VU0VMX0RBVEFbc2VsZWN0ZWRDb2xdLm5hdkl0ZW1zW3ldLnRleHQudG9VcHBlckNhc2UoKVxyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVhQT1JUU1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICB1cCxcclxuICBkb3duLFxyXG4gIGxlZnQsXHJcbiAgcmlnaHQsXHJcbiAgZ2V0TmF2VG9waWNUZXh0LFxyXG4gIGdldE5hdkl0ZW1UZXh0XHJcbn1cclxuIiwiLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1DT09SRFMgQVMgUkFUSU8gQU5EIFZFQ1RPUiBQT0lOVCBBVFNcclxubGV0IGxldHRlcnNDb29yZHMgPSB7XHJcbiAgQTogW1xyXG4gICAge3g6IDAuMTI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgICAvLzFcclxuICAgIHt4OiAwLjM3NSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC41fSwgICAvLzRcclxuICAgIHt4OiAwLjg3NSwgeTogMC44NzV9IC8vNVxyXG4gIF0sXHJcbiAgQjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9LCAvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjc1fSAgLy80XHJcbiAgXSxcclxuICBDOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNjI1fSwvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjM3NX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9IC8vM1xyXG4gIF0sXHJcbiAgRDogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwgLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjUgfSwvLzFcclxuICAgIHt4OiAwLjc1LCB5OiAwLjM3NX0sIC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuNjI1fSAgLy8zXHJcbiAgXSxcclxuICBFOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0sICAvLzRcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0gLy81XHJcbiAgXSxcclxuICBGOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0gICAvLzRcclxuICBdLFxyXG4gIEc6IFtcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC42MjV9LC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMzc1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC42MjUsIHk6IDAuNX0sIC8vNFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjV9ICAvLzVcclxuICBdLFxyXG4gIEg6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC41fSwgIC8vNFxyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSAvLzVcclxuICBdLFxyXG4gIEk6IFtcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC41LCB5OiAwLjg3NX0sIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzJcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC41LCB5OiAwLjEyNX0sIC8vNFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSAvLzVcclxuICBdLFxyXG4gIEo6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjc1fSxcclxuICAgIHt4OiAwLjM3NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNSwgeTogMC43NX0sXHJcbiAgICB7eDogMC41LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fVxyXG4gIF0sXHJcbiAgSzogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4yNX1cclxuICBdLFxyXG4gIEw6IFtcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fVxyXG4gIF0sXHJcbiAgTTogW1xyXG4gICAge3g6IDAuMTI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNSwgeTogMC43NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjg3NX1cclxuICBdLFxyXG4gIE46IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIE86IFtcclxuICAgIHt4OiAwLjM3NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMTI1LCB5OiAwLjYyNX0sXHJcbiAgICB7eDogMC4xMjUsIHk6IDAuMzc1fSxcclxuICAgIHt4OiAwLjM3NSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuMzc1fSxcclxuICAgIHt4OiAwLjg3NSwgeTogMC42MjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjg3NX1cclxuICBdLFxyXG4gIFA6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuNX1cclxuICBdLFxyXG4gIFE6IFtcclxuICAgIHt4OiAwLjM3NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMTI1LCB5OiAwLjYyNX0sXHJcbiAgICB7eDogMC4xMjUsIHk6IDAuMzc1fSxcclxuICAgIHt4OiAwLjM3NSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuMzc1fSxcclxuICAgIHt4OiAwLjg3NSwgeTogMC42MjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuNjI1fSxcclxuICAgIHt4OiAwLjg3NSwgeTogMC44NzV9XHJcbiAgXSxcclxuICBSOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4yNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4zNzV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fVxyXG4gIF0sXHJcbiAgUzogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuNzV9LCAgLy8wXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSwvLzFcclxuICAgIHt4OiAwLjYyNSwgeTogMC44NzV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuNzV9LCAgLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC42MjV9LCAvLzRcclxuICAgIHt4OiAwLjYyNSwgeTogMC41fSwgIC8vNVxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjV9LCAgLy82XHJcbiAgICB7eDogMC4yNSwgeTogMC4zNzV9LCAvLzdcclxuICAgIHt4OiAwLjI1LCB5OiAwLjI1fSwgIC8vOFxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjEyNX0sLy85XHJcbiAgICB7eDogMC42MjUsIHk6IDAuMTI1fSwvLzEwXHJcbiAgICB7eDogMC43NSwgeTogMC4yNX0gICAvLzExXHJcbiAgXSxcclxuICBUOiBbXHJcbiAgICB7eDogMC41LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC41LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fVxyXG4gIF0sXHJcbiAgVTogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjc1fSxcclxuICAgIHt4OiAwLjM3NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC43NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjI1fVxyXG4gIF0sXHJcbiAgVjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIFc6IFtcclxuICAgIHt4OiAwLjEyNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC41LCB5OiAwLjI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIFg6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX1cclxuICBdLFxyXG4gIFk6IFtcclxuICAgIHt4OiAwLjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjUsIHk6IDAuNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fVxyXG4gIF0sXHJcbiAgWjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fVxyXG4gIF0sXHJcbiAgXCIgXCI6IFtdLy9lbmFibGVzIGhhdmluZyBzcGFjZXMgYmV0d2VlbiBsZXR0ZXJzXHJcbn1cclxuXHJcblxyXG5sZXQgbGV0dGVyc1ZlY3RvcnMgPSB7XHJcbiAgQTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBCOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC00fVxyXG4gIF0sXHJcbiAgQzogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBEOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTN9XHJcbiAgXSxcclxuICBFOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTV9XHJcbiAgXSxcclxuICBGOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIEc6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtNX1cclxuICBdLFxyXG4gIEg6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgSTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBKOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIEs6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtM31cclxuICBdLFxyXG4gIEw6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgTTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBOOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIE86IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtN31cclxuICBdLFxyXG4gIFA6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtNX1cclxuICBdLFxyXG4gIFE6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtN30sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIFI6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtNX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTF9XHJcbiAgXSxcclxuICBTOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIFQ6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgVTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBWOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIFc6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgWDogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBZOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTJ9XHJcbiAgXSxcclxuICBaOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdXHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVYUE9SVEVEIEZVTkNUSU9OU1xyXG5mdW5jdGlvbiB0b3RhbFJlcXVpcmVkUGFydGljbGVzKHN0cikge1xyXG4gIGxldCByZXF1aXJlZFBhcnRpY2xlcyA9IDBcclxuXHJcbiAgZm9yKGkgaW4gc3RyKSB7XHJcbiAgICByZXF1aXJlZFBhcnRpY2xlcyArPSBsZXR0ZXJzQ29vcmRzW3N0ci5jaGFyQXQoaSldLmxlbmd0aFxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coXCJ0b3RhbCByZXF1aXJlZFBhcnRpY2xlczogXCIgKyByZXF1aXJlZFBhcnRpY2xlcylcclxuICByZXR1cm4gcmVxdWlyZWRQYXJ0aWNsZXNcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHBsYWNlV29yZHNJblJvd3Moc3RyLCBtYXhDaGFyc0luUm93KSB7XHJcbiAgbGV0IHdvcmRzID0gc3RyLnNwbGl0KFwiIFwiKVxyXG4gIGxldCByb3dzID0gW1wiXCJdXHJcbiAgbGV0IHJvd3NJbmRleCA9IDBcclxuXHJcbiAgd29yZHMuZm9yRWFjaCgod29yZCwgaW5kZXgpID0+IHtcclxuICAgIGlmKHJvd3Nbcm93c0luZGV4XS5sZW5ndGggKyB3b3JkLmxlbmd0aCArIDEgPD0gbWF4Q2hhcnNJblJvdykge1xyXG4gICAgICByb3dzW3Jvd3NJbmRleF0gPSBpbmRleCA9PT0gMCA/IHJvd3Nbcm93c0luZGV4XSArIHdvcmQgOiByb3dzW3Jvd3NJbmRleF0gKyBcIiBcIiArIHdvcmRcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJvd3MucHVzaCh3b3JkKVxyXG4gICAgICByb3dzSW5kZXgrK1xyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIHJldHVybiByb3dzXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjYWxjTGV0dGVyUGFydGljbGVzRGVzdEFuZFRhcmdldHMod29yZHNJblJvd3MsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpIHtcclxuICBsZXQgY2hhcldpZHRoID0gTWF0aC5yb3VuZCggY2FudmFzV2lkdGggLyAobG9uZ2VzdEVsZW1lbnRMZW5ndGgod29yZHNJblJvd3MpICsgMikgKVxyXG4gIGxldCBjaGFySGVpZ2h0ID0gTWF0aC5yb3VuZChjaGFyV2lkdGggKiAxLjIpXHJcbiAgbGV0IHRvdGFsUm93c0hlaWdodCA9IGNoYXJIZWlnaHQgKiAod29yZHNJblJvd3MubGVuZ3RoICsgMSlcclxuICBsZXQgZmluYWxDb29yZHNBbmRQb2ludHNBdHMgPSBbXVxyXG5cclxuICBmb3IobGV0IHJvdyBpbiB3b3Jkc0luUm93cykge1xyXG4gICAgbGV0IHJvd1N0YXJ0WCA9IChjYW52YXNXaWR0aCAvIDIpIC0gKHdvcmRzSW5Sb3dzW3Jvd10ubGVuZ3RoICogY2hhcldpZHRoIC8gMilcclxuICAgIGxldCByb3dTdGFydFkgPSAoY2FudmFzSGVpZ2h0IC8gMikgLSAodG90YWxSb3dzSGVpZ2h0IC8gMikgKyAocm93ICogY2hhckhlaWdodClcclxuXHJcbiAgICBmb3IobGV0IGxldHRlclBvcyA9IDA7IGxldHRlclBvcyA8IHdvcmRzSW5Sb3dzW3Jvd10ubGVuZ3RoOyBsZXR0ZXJQb3MrKykge1xyXG4gICAgICBsZXQgY2hhckhlcmUgPSB3b3Jkc0luUm93c1tyb3ddLmNoYXJBdChsZXR0ZXJQb3MpXHJcbiAgICAgIGxldCBuQ2hhclBhcnRpY2xlcyA9IGxldHRlcnNDb29yZHNbY2hhckhlcmVdLmxlbmd0aFxyXG5cclxuICAgICAgZm9yKGxldCBwb3NJbkNoYXIgPSAwOyBwb3NJbkNoYXIgPCBuQ2hhclBhcnRpY2xlczsgcG9zSW5DaGFyKyspIHtcclxuICAgICAgICBsZXQgeDEgPSByb3dTdGFydFggKyAobGV0dGVyUG9zICogY2hhcldpZHRoKSArIChjaGFyV2lkdGggKiBsZXR0ZXJzQ29vcmRzW2NoYXJIZXJlXVtwb3NJbkNoYXJdLngpXHJcbiAgICAgICAgbGV0IHkxID0gcm93U3RhcnRZICsgKGNoYXJIZWlnaHQgKiBsZXR0ZXJzQ29vcmRzW2NoYXJIZXJlXVtwb3NJbkNoYXJdLnkpXHJcbiAgICAgICAgbGV0IHBvaW50c0F0ID0gZmFsc2VcclxuXHJcbiAgICAgICAgaWYobGV0dGVyc1ZlY3RvcnNbY2hhckhlcmVdW3Bvc0luQ2hhcl0uaGFzVmVjdG9yID09PSB0cnVlKSB7XHJcbiAgICAgICAgICBwb2ludHNBdCA9IGxldHRlcnNWZWN0b3JzW2NoYXJIZXJlXVtwb3NJbkNoYXJdLmluZGV4T2Zmc2V0XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmaW5hbENvb3Jkc0FuZFBvaW50c0F0cy5wdXNoKHt4MTogeDEsIHkxOiB5MSwgcG9pbnRzQXQ6IHBvaW50c0F0fSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGZpbmFsQ29vcmRzQW5kUG9pbnRzQXRzXHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUlOVEVSTkFMIEZVTkNUSU9OU1xyXG5mdW5jdGlvbiBsb25nZXN0RWxlbWVudExlbmd0aChhcnIpIHtcclxuICBsZXQgbGVuZ3RoID0gMFxyXG4gIGFyci5mb3JFYWNoKGVsID0+IHtcclxuICAgIGxlbmd0aCA9IGVsLmxlbmd0aCA+PSBsZW5ndGggPyBlbC5sZW5ndGggOiBsZW5ndGhcclxuICB9KVxyXG4gIHJldHVybiBsZW5ndGhcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FWFBPUlRTXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHBsYWNlV29yZHNJblJvd3MsXHJcbiAgdG90YWxSZXF1aXJlZFBhcnRpY2xlcyxcclxuICBjYWxjTGV0dGVyUGFydGljbGVzRGVzdEFuZFRhcmdldHNcclxufVxyXG4iXX0=
