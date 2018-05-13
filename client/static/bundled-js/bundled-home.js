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
const NAV_TOPIC_ELEMENT = document.getElementById('navigatorNavTopics')
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
  NAV_TOPIC_ELEMENT.innerHTML = carousel2d.getNavTopicText()
  formNewParticleWord()
}


function carouselDown() {
  carousel2d.down()
  CHAR_PATTERN_WORDS = carousel2d.getNavItemText()
  NAV_TOPIC_ELEMENT.innerHTML = carousel2d.getNavTopicText()
  formNewParticleWord()
}


function carouselLeft() {
  carousel2d.left()
  CHAR_PATTERN_WORDS = carousel2d.getNavItemText()
  NAV_TOPIC_ELEMENT.innerHTML = carousel2d.getNavTopicText()
  formNewParticleWord()
}


function carouselRight() {
  carousel2d.right()
  CHAR_PATTERN_WORDS = carousel2d.getNavItemText()
  NAV_TOPIC_ELEMENT.innerHTML = carousel2d.getNavTopicText()
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

    //carouselVisibleItems[CAROUSEL_COLS - 1 - i].style.backgroundColor = CAROUSEL_DATA[x].bgColor
  }
}

function populateCarouselCells() {
  for(let i = 0; i < CAROUSEL_COLS; i++) {
    let x = selectedCol + i + CAROUSEL_DATA.length - 2
    while(x >= CAROUSEL_DATA.length) {x = x - CAROUSEL_DATA.length}

    for(let j = 0; j < CAROUSEL_ROWS; j++) {
      let y = selectedRowInCols[x] + j
      while(y >= CAROUSEL_DATA[x].navItems.length) {y = y - CAROUSEL_DATA[x].navItems.length}

      //carouselElements[CAROUSEL_COLS - 1 - i][j].style.backgroundColor = CAROUSEL_DATA[x].navItems[y].bgColor
      carouselElements[CAROUSEL_COLS - 1 - i][j].innerHTML = CAROUSEL_DATA[x].navItems[y].text
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9jbGFzc2VzL0NoYXJQYXR0ZXJuUGFydGljbGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9jbGFzc2VzL0hvbGRQYXR0ZXJuUGFydGljbGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9jbGFzc2VzL1BhcnRpY2xlLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvaG9tZS5qcyIsImNsaWVudC9zdGF0aWMvc291cmNlLWpzL3V0aWxzL2NhbnZhcy1oZWxwZXJzLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2Fyb3VzZWwtMmQuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9sZXR0ZXJzLWxpYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgY2FudmFzSGVscGVycyA9IHJlcXVpcmUoJy4uL3V0aWxzL2NhbnZhcy1oZWxwZXJzJylcclxuY29uc3QgUGFydGljbGUgPSByZXF1aXJlKCcuL1BhcnRpY2xlJylcclxuXHJcbmNsYXNzIENoYXJQYXR0ZXJuUGFydGljbGUgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkLCBwb2ludHNBdCkge1xyXG4gICAgc3VwZXIoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkKVxyXG4gICAgdGhpcy5wb2ludHNBdCA9IHBvaW50c0F0XHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3MoKSB7XHJcbiAgICB0aGlzLmRpc3RNb3ZlZCArPSB0aGlzLnNwZWVkXHJcbiAgICBpZiAodGhpcy5kaXN0TW92ZWQgPiAxKSB7dGhpcy5kaXN0TW92ZWQgPSAxfS8vcHJldmVudCBvdmVyc2hvb3RcclxuXHJcbiAgICBsZXQgbmV3UG9zID0gY2FudmFzSGVscGVycy5jb29yZHNPblN0cmFpZ2h0TGluZSh0aGlzLmRpc3RNb3ZlZCwge3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KVxyXG4gICAgdGhpcy5jb29yZHMueCA9IG5ld1Bvcy54XHJcbiAgICB0aGlzLmNvb3Jkcy55ID0gbmV3UG9zLnlcclxuICB9XHJcblxyXG4gIGRyYXcoY3R4LCBjb2xvckZyb20sIGNvbG9yVG8pIHtcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LmxpbmVXaWR0aCA9IDNcclxuICAgIGxldCByZ2IgPSBjYW52YXNIZWxwZXJzLmNvbG9yQmV0d2VlblR3b0NvbG9ycyh0aGlzLmRpc3RNb3ZlZCwgJyNmZmZmZmYnLCAnI2ZmMDAwMCcpLy9kZXZcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGByZ2IoJHtyZ2Iucn0sICR7cmdiLmd9LCAke3JnYi5ifSlgXHJcbiAgICAvL2N0eC5zdHJva2VTdHlsZSA9IHRoaXMuZGlzdE1vdmVkIDwgMSA/IGNvbG9yRnJvbSA6IGNvbG9yVG8vL3dyaXRlIGZ1bmN0aW9uIHRvIHRyYW5zaXRpb24gYmV0d2VlbiAyIGNvbG91cnMgdGhhdCB0YWtlcyAlIGFzIGFuIGFyZ1xyXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eC5hcmModGhpcy5jb29yZHMueCwgdGhpcy5jb29yZHMueSwgMywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICBjdHguZmlsbCgpXHJcbiAgfVxyXG5cclxuICBkcmF3VG9Qb2ludHNBdChjdHgsIGNoYXJQYXR0ZXJuUGFydGljbGVzLCBpbmRleCwgY29sb3JGcm9tLCBjb2xvclRvKSB7XHJcbiAgICBpZih0aGlzLmRpc3RNb3ZlZCA+IDAuMSkge1xyXG4gICAgICBpZih0aGlzLnBvaW50c0F0ICE9PSBmYWxzZSkge1xyXG4gICAgICAgIGxldCBwb2ludHNBdFggPSBjaGFyUGF0dGVyblBhcnRpY2xlc1tpbmRleCArIHRoaXMucG9pbnRzQXRdLmNvb3Jkcy54Ly90aGVzZSB0d28gbGluZXMgYXJlIGZ1Y2tpbmcgdGhpbmdzIHNvbWVob3cgZGVsZXRpbmcgdGhlIGxhc3QgcGFydGljbGUgaW4gdGhlIGNoYXIgSSB0aGlua1xyXG4gICAgICAgIGxldCBwb2ludHNBdFkgPSBjaGFyUGF0dGVyblBhcnRpY2xlc1tpbmRleCArIHRoaXMucG9pbnRzQXRdLmNvb3Jkcy55XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9IDJcclxuICAgICAgICBsZXQgcmdiID0gY2FudmFzSGVscGVycy5jb2xvckJldHdlZW5Ud29Db2xvcnModGhpcy5kaXN0TW92ZWQsICcjMWYyNjMzJywgJyNmZjAwMDAnKVxyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IGByZ2IoJHtyZ2Iucn0sICR7cmdiLmd9LCAke3JnYi5ifSlgXHJcbiAgICAgICAgLy9jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLmRpc3RNb3ZlZCA8IDEgPyBjb2xvckZyb20gOiBjb2xvclRvXHJcbiAgICAgICAgY3R4Lm1vdmVUbyh0aGlzLmNvb3Jkcy54LCB0aGlzLmNvb3Jkcy55KVxyXG4gICAgICAgIGN0eC5saW5lVG8ocG9pbnRzQXRYLCBwb2ludHNBdFkpXHJcbiAgICAgICAgY3R4LnN0cm9rZSgpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2hhclBhdHRlcm5QYXJ0aWNsZVxyXG4iLCJcclxuY29uc3QgY2FudmFzSGVscGVycyA9IHJlcXVpcmUoJy4uL3V0aWxzL2NhbnZhcy1oZWxwZXJzJylcclxuY29uc3QgUGFydGljbGUgPSByZXF1aXJlKCcuL1BhcnRpY2xlLmpzJylcclxuXHJcbmNsYXNzIEhvbGRQYXR0ZXJuUGFydGljbGUgZXh0ZW5kcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkLCBuZXh0V1ApIHtcclxuICAgIHN1cGVyKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZClcclxuICAgIHRoaXMubmV4dFdQID0gbmV4dFdQXHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3MoSE9MRF9QQVRURVJOX1dBWVBPSU5UUywgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwsIEhPTERfU1BFRUQpIHtcclxuICAgIHRoaXMuZGlzdE1vdmVkICs9IHRoaXMuc3BlZWRcclxuICAgIGlmKHRoaXMuZGlzdE1vdmVkID49IDEpIHtcclxuICAgICAgdGhpcy5kaXN0TW92ZWQgPSAwXHJcbiAgICAgIHRoaXMuc3BlZWQgPSBIT0xEX1NQRUVEXHJcbiAgICAgIHRoaXMubmV4dFdQID0gdGhpcy5uZXh0V1AgPT09IEhPTERfUEFUVEVSTl9XQVlQT0lOVFMubGVuZ3RoIC0gMSA/IDAgOiB0aGlzLm5leHRXUCArIDFcclxuICAgICAgdGhpcy5jb29yZHMueDAgPSB0aGlzLmNvb3Jkcy54MVxyXG4gICAgICB0aGlzLmNvb3Jkcy55MCA9IHRoaXMuY29vcmRzLnkxXHJcbiAgICAgIHRoaXMuY29vcmRzLngxID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbdGhpcy5uZXh0V1BdKS54XHJcbiAgICAgIHRoaXMuY29vcmRzLnkxID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbdGhpcy5uZXh0V1BdKS55XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMXggPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS54XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMXkgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS55XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMnggPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS54XHJcbiAgICAgIHRoaXMuY29vcmRzLmNwMnkgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoe3g6IHRoaXMuY29vcmRzLngwLCB5OiB0aGlzLmNvb3Jkcy55MH0sIHt4OiB0aGlzLmNvb3Jkcy54MSwgeTogdGhpcy5jb29yZHMueTF9KS55XHJcbiAgICB9XHJcbiAgICB0aGlzLmNvb3Jkcy54ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHRoaXMuZGlzdE1vdmVkLCB0aGlzLmNvb3Jkcy54MCwgdGhpcy5jb29yZHMuY3AxeCwgdGhpcy5jb29yZHMuY3AyeCwgdGhpcy5jb29yZHMueDEpXHJcbiAgICB0aGlzLmNvb3Jkcy55ID0gY2FudmFzSGVscGVycy5jb29yZHNPbkN1YmljQmV6aWVyKHRoaXMuZGlzdE1vdmVkLCB0aGlzLmNvb3Jkcy55MCwgdGhpcy5jb29yZHMuY3AxeSwgdGhpcy5jb29yZHMuY3AyeSwgdGhpcy5jb29yZHMueTEpXHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEhvbGRQYXR0ZXJuUGFydGljbGVcclxuIiwiXHJcbmNsYXNzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQpIHtcclxuICAgIHRoaXMuY29vcmRzID0gY29vcmRzXHJcbiAgICB0aGlzLnNwZWVkID0gc3BlZWRcclxuICAgIHRoaXMuZGlzdE1vdmVkID0gZGlzdE1vdmVkXHJcbiAgfVxyXG5cclxuICBkcmF3KGN0eCwgY29sb3IpIHsvL2RlZmF1bHQgc2VsZiByZW5kZXIgZm9yIHBhcnRpY2xlcywgbWF5YmUgY2hhbmdlIGxhdGVyXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5saW5lV2lkdGggPSAzXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvclxyXG4gICAgY3R4LmZpbGxTdHlsZSA9ICdibGFjaydcclxuICAgIGN0eC5hcmModGhpcy5jb29yZHMueCwgdGhpcy5jb29yZHMueSwgMywgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICBjdHguZmlsbCgpXHJcbiAgfVxyXG5cclxuICB1cGRhdGVQb3MoKSB7XHJcbiAgICB0aGlzLmNvb3Jkcy54ICs9IHRoaXMuc3BlZWRcclxuICAgIHRoaXMuY29vcmRzLnkgKz0gdGhpcy5zcGVlZFxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBQYXJ0aWNsZVxyXG4iLCJcclxuY29uc3QgY2FudmFzSGVscGVycyA9IHJlcXVpcmUoJy4vdXRpbHMvY2FudmFzLWhlbHBlcnMuanMnKVxyXG5jb25zdCBsZXR0ZXJzTGliID0gcmVxdWlyZSgnLi91dGlscy9sZXR0ZXJzLWxpYi5qcycpXHJcbmNvbnN0IEhvbGRQYXR0ZXJuUGFydGljbGUgPSByZXF1aXJlKCcuL2NsYXNzZXMvSG9sZFBhdHRlcm5QYXJ0aWNsZScpXHJcbmNvbnN0IENoYXJQYXR0ZXJuUGFydGljbGUgPSByZXF1aXJlKCcuL2NsYXNzZXMvQ2hhclBhdHRlcm5QYXJ0aWNsZScpXHJcbmNvbnN0IGNhcm91c2VsMmQgPSByZXF1aXJlKCcuL3V0aWxzL2Nhcm91c2VsLTJkJylcclxuXHJcbmxldCBDSEFSX1BBVFRFUk5fV09SRFMgPSAnWUFZIEFOT1RIRVIgTkVXIEJVRycvL2ZvciBub3cgZGVmaW5lZCAgaGVyZSwgbGF0ZXIgd2lsbCBjb21lIGZyb20gY2F1cm9zZWxcclxuY29uc3QgTUFYX0NIQVJTX1BFUl9ST1cgPSAxMlxyXG5jb25zdCBUT1RBTF9QQVJUSUNMRVMgPSAyMDBcclxuY29uc3QgSE9MRF9QQVRURVJOX1dBWVBPSU5UUyA9IFsvL2Nvb3JkcyBhcyAlIG9mIGNhbnZhcyBzaXplXHJcbiAge3g6IDAuMTI1LCB5OiAwLjV9LFxyXG4gIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAge3g6IDAuNzUsIHk6IDAuMTI1fSxcclxuICB7eDogMC44NzUsIHk6IDAuNX0sXHJcbiAge3g6IDAuNzUsIHk6IDAuODc1fSxcclxuICB7eDogMC4yNSwgeTogMC44NzV9XHJcbl1cclxuY29uc3QgSE9MRF9TUEVFRCA9IDAuMDAyNVxyXG5cclxuY29uc3QgTkFWX0xJTktTID0gWy8vbm90IGltcGxlbWVudGVkIHlldFxyXG4gIHtcclxuICAgIGxpbmtzX2dyb3VwOiAnTGlua3MgZ3JvdXAgIzAnLFxyXG4gICAgbGlua3NfaXRlbXM6IFtcclxuICAgICAge2xpbmtSZWY6ICd1cmwnLCBwYXJ0aWNsZVRleHQ6ICdHUk9VUCBaRVJPIExJTksgWkVSTyd9LFxyXG4gICAgICB7bGlua1JlZjogJ3VybCcsIHBhcnRpY2xlVGV4dDogJ0dST1VQIFpFUk8gTElOSyBPTkUnfSxcclxuICAgICAge2xpbmtSZWY6ICd1cmwnLCBwYXJ0aWNsZVRleHQ6ICdHUk9VUCBaRVJPIExJTksgVFdPJ31cclxuICAgIF1cclxuICB9LFxyXG4gIHtcclxuICAgIGxpbmtzX2dyb3VwOiAnTGlua3MgZ3JvdXAgIzEnLFxyXG4gICAgbGlua3NfaXRlbXM6IFtcclxuICAgICAge2xpbmtSZWY6ICd1cmwnLCBwYXJ0aWNsZVRleHQ6ICdHUk9VUCBPTkUgTElOSyBaRVJPJ30sXHJcbiAgICAgIHtsaW5rUmVmOiAndXJsJywgcGFydGljbGVUZXh0OiAnR1JPVVAgT05FIExJTksgT05FJ30sXHJcbiAgICAgIHtsaW5rUmVmOiAndXJsJywgcGFydGljbGVUZXh0OiAnR1JPVVAgT05FIExJTksgVFdPJ31cclxuICAgIF1cclxuICB9XHJcbl1cclxuXHJcbmxldCBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXVxyXG5sZXQgY2FudmFzMSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjYW52YXMnKVswXVxyXG5sZXQgY3R4MSA9IGNhbnZhczEuZ2V0Q29udGV4dCgnMmQnKVxyXG5jb25zdCBOQVZfVE9QSUNfRUxFTUVOVCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYXZpZ2F0b3JOYXZUb3BpY3MnKVxyXG5sZXQgbmF2R29Ub0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYXZpZ2F0b3JEZXNjJykvL2RldlxyXG5sZXQgZnJhbWVJZFxyXG5sZXQgY2FudmFzV2lkdGhcclxubGV0IGNhbnZhc0hlaWdodFxyXG5sZXQgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwgPSBbXS8vY29vcmRzIGluIHBpeGVscywgcmVjYWxjdWxhdGVkIG9uIHJlc2l6ZVxyXG5sZXQgaG9sZFBhdHRlcm5QYXJ0aWNsZXMgPSBbXVxyXG5sZXQgY2hhclBhdHRlcm5QYXJ0aWNsZXMgPSBbXVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVZFTlRTXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGluaXQpXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBpbml0KVxyXG5uYXZHb1RvQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZm9ybU5ld1BhcnRpY2xlV29yZCwgZmFsc2UpLy9kZXZcclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdmlnYXRvclVwJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYXJvdXNlbFVwKVxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yRG93bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2Fyb3VzZWxEb3duKVxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yTGVmdCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2Fyb3VzZWxMZWZ0KVxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yUmlnaHQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhcm91c2VsUmlnaHQpXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUZMT1cgQ09OVFJPTCAmIElOSVRJQUxJWkVSU1xyXG5mdW5jdGlvbiBpbml0KCkge1xyXG4gIHJlc2V0KClcclxuICBzZXRMYXlvdXQoKVxyXG4gIGNhbGNIb2xkUGF0dGVybldheXBvaW50Q29vcmRzKClcclxuICBpbml0SG9sZFBhdHRlcm5QYXJ0aWNsZXMoVE9UQUxfUEFSVElDTEVTKVxyXG4gIGFuaW1hdGUoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmVzZXQoKSB7XHJcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVJZClcclxuICBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbC5sZW5ndGggPSAwXHJcbiAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMubGVuZ3RoID0gMFxyXG4gIGNoYXJQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA9IDBcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNhbGNIb2xkUGF0dGVybldheXBvaW50Q29vcmRzKCkge1xyXG4gIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsID0gSE9MRF9QQVRURVJOX1dBWVBPSU5UUy5tYXAoZWwgPT4ge1xyXG4gICAgcmV0dXJuIHt4OiBlbC54ICogY2FudmFzV2lkdGgsIHk6IGVsLnkgKiBjYW52YXNIZWlnaHR9XHJcbiAgfSlcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGluaXRIb2xkUGF0dGVyblBhcnRpY2xlcyhuUGFydGljbGVzKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IG5QYXJ0aWNsZXM7IGkrKykge1xyXG4gICAgbGV0IGZyb21XUCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDYpXHJcbiAgICBsZXQgbmV4dFdQID0gZnJvbVdQICsgMSA9PT0gSE9MRF9QQVRURVJOX1dBWVBPSU5UUy5sZW5ndGggPyAwIDogZnJvbVdQICsgMVxyXG4gICAgbGV0IGRpc3RNb3ZlZCA9IE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiAxMCApIC8gMTBcclxuICAgIGxldCBzdGFydENvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW2Zyb21XUF0pXHJcbiAgICBsZXQgZW5kQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbbmV4dFdQXSlcclxuICAgIGxldCBjcDFDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoc3RhcnRDb29yZHMsIGVuZENvb3JkcylcclxuICAgIGxldCBjcDJDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMoc3RhcnRDb29yZHMsIGVuZENvb3JkcylcclxuICAgIGxldCBjb29yZHMgPSB7XHJcbiAgICAgIHg6IHN0YXJ0Q29vcmRzLngsIHk6IHN0YXJ0Q29vcmRzLnksXHJcbiAgICAgIHgwOiBzdGFydENvb3Jkcy54LCB5MDogc3RhcnRDb29yZHMueSxcclxuICAgICAgeDE6IGVuZENvb3Jkcy54LCB5MTogZW5kQ29vcmRzLnksXHJcbiAgICAgIGNwMXg6IGNwMUNvb3Jkcy54LCBjcDF5OiBjcDFDb29yZHMueSxcclxuICAgICAgY3AyeDogY3AyQ29vcmRzLngsIGNwMnk6IGNwMkNvb3Jkcy55XHJcbiAgICB9XHJcblxyXG4gICAgaG9sZFBhdHRlcm5QYXJ0aWNsZXMucHVzaCggbmV3IEhvbGRQYXR0ZXJuUGFydGljbGUoY29vcmRzLCBIT0xEX1NQRUVELCBkaXN0TW92ZWQsIG5leHRXUCkgKVxyXG4gIH1cclxuICBjb25zb2xlLmxvZyhob2xkUGF0dGVyblBhcnRpY2xlc1swXSlcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGZvcm1OZXdQYXJ0aWNsZVdvcmQoKSB7XHJcbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWVJZCkvL25vdCBzdXJlIGlmIG5lZWRlZFxyXG4gIGNoYXJUb0hvbGRUcmFuc2l0aW9uKClcclxuICBob2xkVG9DaGFyVHJhbnNpdGlvbigpXHJcbiAgYW5pbWF0ZSgpLy9ub3Qgc3VyZSBpZiBuZWVkZWRcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUNBUk9VU0VMIENPTlRST0xTXHJcbmZ1bmN0aW9uIGNhcm91c2VsVXAoKSB7XHJcbiAgY2Fyb3VzZWwyZC51cCgpXHJcbiAgQ0hBUl9QQVRURVJOX1dPUkRTID0gY2Fyb3VzZWwyZC5nZXROYXZJdGVtVGV4dCgpXHJcbiAgTkFWX1RPUElDX0VMRU1FTlQuaW5uZXJIVE1MID0gY2Fyb3VzZWwyZC5nZXROYXZUb3BpY1RleHQoKVxyXG4gIGZvcm1OZXdQYXJ0aWNsZVdvcmQoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY2Fyb3VzZWxEb3duKCkge1xyXG4gIGNhcm91c2VsMmQuZG93bigpXHJcbiAgQ0hBUl9QQVRURVJOX1dPUkRTID0gY2Fyb3VzZWwyZC5nZXROYXZJdGVtVGV4dCgpXHJcbiAgTkFWX1RPUElDX0VMRU1FTlQuaW5uZXJIVE1MID0gY2Fyb3VzZWwyZC5nZXROYXZUb3BpY1RleHQoKVxyXG4gIGZvcm1OZXdQYXJ0aWNsZVdvcmQoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY2Fyb3VzZWxMZWZ0KCkge1xyXG4gIGNhcm91c2VsMmQubGVmdCgpXHJcbiAgQ0hBUl9QQVRURVJOX1dPUkRTID0gY2Fyb3VzZWwyZC5nZXROYXZJdGVtVGV4dCgpXHJcbiAgTkFWX1RPUElDX0VMRU1FTlQuaW5uZXJIVE1MID0gY2Fyb3VzZWwyZC5nZXROYXZUb3BpY1RleHQoKVxyXG4gIGZvcm1OZXdQYXJ0aWNsZVdvcmQoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY2Fyb3VzZWxSaWdodCgpIHtcclxuICBjYXJvdXNlbDJkLnJpZ2h0KClcclxuICBDSEFSX1BBVFRFUk5fV09SRFMgPSBjYXJvdXNlbDJkLmdldE5hdkl0ZW1UZXh0KClcclxuICBOQVZfVE9QSUNfRUxFTUVOVC5pbm5lckhUTUwgPSBjYXJvdXNlbDJkLmdldE5hdlRvcGljVGV4dCgpXHJcbiAgZm9ybU5ld1BhcnRpY2xlV29yZCgpXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVRSQU5TSVRJT04gUEFSVElDTEVTIEJFVFdFRU4gQkVIQVZJT1VSIFRZUEVTXHJcbmZ1bmN0aW9uIGhvbGRUb0NoYXJUcmFuc2l0aW9uKCkge1xyXG4gIGxldCByZXF1aXJlZFBhcnRpY2xlcyA9IGxldHRlcnNMaWIudG90YWxSZXF1aXJlZFBhcnRpY2xlcyhDSEFSX1BBVFRFUk5fV09SRFMpXHJcbiAgbGV0IHdvcmRzSW5Sb3dzID0gbGV0dGVyc0xpYi5wbGFjZVdvcmRzSW5Sb3dzKENIQVJfUEFUVEVSTl9XT1JEUywgTUFYX0NIQVJTX1BFUl9ST1cpXHJcbiAgbGV0IGRlc3RpbmF0aW9uc0FuZFRhcmdldHMgPSBsZXR0ZXJzTGliLmNhbGNMZXR0ZXJQYXJ0aWNsZXNEZXN0QW5kVGFyZ2V0cyh3b3Jkc0luUm93cywgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodClcclxuXHJcbiAgaWYgKGhvbGRQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA+IHJlcXVpcmVkUGFydGljbGVzKSB7XHJcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgcmVxdWlyZWRQYXJ0aWNsZXM7IGkrKykge1xyXG4gICAgICBsZXQgdHJhbnNmZXJyaW5nUGFydGljbGUgPSBob2xkUGF0dGVyblBhcnRpY2xlcy5wb3AoKVxyXG4gICAgICBsZXQgY29vcmRzID0ge1xyXG4gICAgICAgIHg6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy54LFxyXG4gICAgICAgIHk6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy55LFxyXG4gICAgICAgIHgwOiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueCxcclxuICAgICAgICB5MDogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLnksXHJcbiAgICAgICAgeDE6IGRlc3RpbmF0aW9uc0FuZFRhcmdldHNbaV0ueDEsXHJcbiAgICAgICAgeTE6IGRlc3RpbmF0aW9uc0FuZFRhcmdldHNbaV0ueTFcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHNwZWVkID0gSE9MRF9TUEVFRCAqIDRcclxuICAgICAgbGV0IGRpc3RNb3ZlZCA9IDBcclxuICAgICAgbGV0IHBvaW50c0F0ID0gZGVzdGluYXRpb25zQW5kVGFyZ2V0c1tpXS5wb2ludHNBdFxyXG4gICAgICBjaGFyUGF0dGVyblBhcnRpY2xlcy5wdXNoKG5ldyBDaGFyUGF0dGVyblBhcnRpY2xlKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZCwgcG9pbnRzQXQpKVxyXG4gICAgfVxyXG5cclxuICB9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjaGFyVG9Ib2xkVHJhbnNpdGlvbigpIHtcclxuICB3aGlsZShjaGFyUGF0dGVyblBhcnRpY2xlcy5sZW5ndGggPiAwKSB7XHJcbiAgICBsZXQgdHJhbnNmZXJyaW5nUGFydGljbGUgPSBjaGFyUGF0dGVyblBhcnRpY2xlcy5wb3AoKVxyXG4gICAgbGV0IGRpc3RNb3ZlZCA9IDBcclxuICAgIGxldCBzcGVlZCA9ICBNYXRoLnJvdW5kKCAoTWF0aC5yYW5kb20oKSAqIChIT0xEX1NQRUVEICogMTAgLSBIT0xEX1NQRUVEKSArIEhPTERfU1BFRUQpICogMTAwMCApIC8gMTAwMFxyXG4gICAgbGV0IGZyb21XUCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDYpXHJcbiAgICBsZXQgbmV4dFdQID0gZnJvbVdQICsgMSA9PT0gSE9MRF9QQVRURVJOX1dBWVBPSU5UUy5sZW5ndGggPyAwIDogZnJvbVdQICsgMVxyXG4gICAgbGV0IHN0YXJ0Q29vcmRzID0ge3g6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy54LCB5OiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueX1cclxuICAgIGxldCBlbmRDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFtuZXh0V1BdKVxyXG4gICAgbGV0IGNwMUNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhzdGFydENvb3JkcywgZW5kQ29vcmRzKVxyXG4gICAgbGV0IGNwMkNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhzdGFydENvb3JkcywgZW5kQ29vcmRzKVxyXG4gICAgbGV0IGNvb3JkcyA9IHtcclxuICAgICAgeDogc3RhcnRDb29yZHMueCxcclxuICAgICAgeTogc3RhcnRDb29yZHMueSxcclxuICAgICAgeDA6IHN0YXJ0Q29vcmRzLngsXHJcbiAgICAgIHkwOiBzdGFydENvb3Jkcy55LFxyXG4gICAgICB4MTogZW5kQ29vcmRzLngsXHJcbiAgICAgIHkxOiBlbmRDb29yZHMueSxcclxuICAgICAgY3AxeDogY3AxQ29vcmRzLngsXHJcbiAgICAgIGNwMXk6IGNwMUNvb3Jkcy55LFxyXG4gICAgICBjcDJ4OiBjcDJDb29yZHMueCxcclxuICAgICAgY3AyeTogY3AyQ29vcmRzLnlcclxuICAgIH1cclxuXHJcbiAgICBob2xkUGF0dGVyblBhcnRpY2xlcy51bnNoaWZ0KG5ldyBIb2xkUGF0dGVyblBhcnRpY2xlKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZCwgbmV4dFdQKSlcclxuICB9XHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tVVBEQVRFIFBBUlRJQ0xFIFBPU0lUSU9OUyAmIFJFTkRFUlxyXG5mdW5jdGlvbiBhbmltYXRlKCkge1xyXG4gIGZyYW1lSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSlcclxuICBjdHgxLmNsZWFyUmVjdCgwLCAwLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KVxyXG4gIC8vY2FudmFzSGVscGVycy5yZW5kZXJCb3VuZGluZ0NpcmNsZShjdHgxLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KS8vZGV2XHJcbiAgLy9jYW52YXNIZWxwZXJzLnJlbmRlckhvbGRQYXR0ZXJuV1BzKGN0eDEsIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKS8vZGV2XHJcbiAgLy9jYW52YXNIZWxwZXJzLnJlbmRlckhvbGRQYXR0ZXJuUGFydGljbGVQYXRocyhjdHgxLCBob2xkUGF0dGVyblBhcnRpY2xlcykvL2RldlxyXG4gIHVwZGF0ZUhvbGRQYXR0ZXJuUGFydGljbGVzKClcclxuICB1cGRhdGVDaGFyUGF0dGVyblBhcnRpY2xlcygpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiB1cGRhdGVIb2xkUGF0dGVyblBhcnRpY2xlcygpIHtcclxuICBob2xkUGF0dGVyblBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcclxuICAgIHBhcnRpY2xlLnVwZGF0ZVBvcyhIT0xEX1BBVFRFUk5fV0FZUE9JTlRTLCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCwgSE9MRF9TUEVFRClcclxuICAgIHBhcnRpY2xlLmRyYXcoY3R4MSwgJ3doaXRlJylcclxuICB9KVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQ2hhclBhdHRlcm5QYXJ0aWNsZXMoKSB7XHJcbiAgY2hhclBhdHRlcm5QYXJ0aWNsZXMuZm9yRWFjaCgocGFydGljbGUsIGluZGV4KSA9PiB7XHJcbiAgICBwYXJ0aWNsZS51cGRhdGVQb3MoKVxyXG4gICAgcGFydGljbGUuZHJhdyhjdHgxLCAnd2hpdGUnLCAncmVkJylcclxuICAgIHBhcnRpY2xlLmRyYXdUb1BvaW50c0F0KGN0eDEsIGNoYXJQYXR0ZXJuUGFydGljbGVzLCBpbmRleCwgJyMxZjI2MzMnLCAnI2ZmMDAwMCcpXHJcbiAgfSlcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1MQVlPVVQgQlJFQUsgUE9JTlRTXHJcbmZ1bmN0aW9uIHNldExheW91dCgpIHtcclxuICAvL3NtYWxsIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNVxyXG4gIH1cclxuICAvL3NtYWxsIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0IDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG4gIC8vbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDEwMjQgJiYgYm9keS5jbGllbnRXaWR0aCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjdcclxuICB9XHJcbiAgLy9tZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gMTAyNCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcbiAgLy9sYXJnZSB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjY1XHJcbiAgfVxyXG4gIC8vbGFyZ2UgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPiAxMDI0KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBsYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG5cclxuICBjYW52YXMxLndpZHRoID0gY2FudmFzV2lkdGhcclxuICBjYW52YXMxLmhlaWdodCA9IGNhbnZhc0hlaWdodFxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVBBUlRJQ0xFIENMQVNTRVNcclxuIiwiLy8gRGFsZSdzIHVzZXJuYW1lOiBkYWtlYmxcclxuXHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1NSVNDIEhFTFBFUlNcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTUFUSCBIRUxQRVJTXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tR0VPTUVUUlkgSEVMUEVSU1xyXG5mdW5jdGlvbiByYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHAxLCBwMikge1xyXG4gIGNvbnN0IE1JTl9ESVNUID0gNDBcclxuICBjb25zdCBESVNUX01PRCA9IDAuNVxyXG4gIGNvbnN0IEFOR0xFX1dJVEhJTiA9IE1hdGguUElcclxuICBsZXQgYSA9IHAyLnggLSBwMS54XHJcbiAgbGV0IGIgPSBwMi55IC0gcDEueVxyXG4gIGxldCBwMVAyRGlzdCA9IE1hdGguc3FydChhKmEgKyBiKmIpXHJcbiAgbGV0IHJhbmREaXN0ID0gKE1hdGgucmFuZG9tKCkgKiBwMVAyRGlzdCAqIERJU1RfTU9EKSArIE1JTl9ESVNUXHJcbiAgbGV0IGFuZ2xlTW9kID0gKE1hdGgucmFuZG9tKCkgKiBBTkdMRV9XSVRISU4pIC0gKEFOR0xFX1dJVEhJTiAvIDIpXHJcbiAgbGV0IHJhbmRBbmdsZVxyXG4gIGxldCBjb29yZHMgPSB7eDogbnVsbCwgeTogbnVsbH1cclxuXHJcbiAgaWYoTWF0aC5yYW5kb20oKSA+PSAwLjUpIHtcclxuICAgIHJhbmRBbmdsZSA9IE1hdGguYXRhbjIocDIueSAtIHAxLnksIHAxLnggLSBwMi54KSArIGFuZ2xlTW9kXHJcbiAgICBjb29yZHMueCA9IHAyLnggKyBNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICAgIGNvb3Jkcy55ID0gcDIueSAtIE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gIH0gZWxzZSB7XHJcbiAgICByYW5kQW5nbGUgPSBNYXRoLmF0YW4yKHAxLnkgLSBwMi55LCBwMi54IC0gcDEueCkgKyBhbmdsZU1vZFxyXG4gICAgY29vcmRzLnggPSBwMS54ICsgTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgICBjb29yZHMueSA9IHAxLnkgLSBNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICB9XHJcblxyXG4gIHJldHVybiBjb29yZHNcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJhbmRQb2ludE5lYXJQb2ludChwdCkge1xyXG4gIGNvbnN0IE1BWF9GUk9NID0gNDBcclxuICBsZXQgcmFuZERpc3QgPSBNYXRoLnJhbmRvbSgpICogTUFYX0ZST01cclxuICBsZXQgcmFuZEFuZ2xlID0gTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyXHJcbiAgbGV0IHggPSBwdC54ICsgTWF0aC5yb3VuZChNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3QpXHJcbiAgbGV0IHkgPSBwdC55ICsgTWF0aC5yb3VuZChNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3QpXHJcblxyXG4gIHJldHVybiB7eDogeCwgeTogeX1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNvb3Jkc09uU3RyYWlnaHRMaW5lKHBlcmNlbnQsIHN0YXJ0UHQsIGVuZFB0KSB7XHJcbiAgbGV0IHhUb3RhbCA9IGVuZFB0LnggLSBzdGFydFB0LnhcclxuICBsZXQgeVRvdGFsID0gZW5kUHQueSAtIHN0YXJ0UHQueVxyXG4gIGxldCB4RGlzdCA9IHBlcmNlbnQgKiB4VG90YWxcclxuICBsZXQgeURpc3QgPSBwZXJjZW50ICogeVRvdGFsXHJcblxyXG4gIHJldHVybiB7eDogc3RhcnRQdC54ICsgeERpc3QsIHk6IHN0YXJ0UHQueSArIHlEaXN0fVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY29vcmRzT25DdWJpY0JlemllcihwZXJjZW50LCBzdGFydFB0LCBjcDEsIGNwMiwgZW5kUHQpIHsvL3N0b2xlbiBmcm9tIHN0YWNrb3ZlcmZsb3dcclxuICBsZXQgdDIgPSBwZXJjZW50ICogcGVyY2VudFxyXG4gIGxldCB0MyA9IHQyICogcGVyY2VudFxyXG5cclxuICByZXR1cm4gc3RhcnRQdCArICgtc3RhcnRQdCAqIDMgKyBwZXJjZW50ICogKDMgKiBzdGFydFB0IC0gc3RhcnRQdCAqIHBlcmNlbnQpKSAqIHBlcmNlbnRcclxuICArICgzICogY3AxICsgcGVyY2VudCAqICgtNiAqIGNwMSArIGNwMSAqIDMgKiBwZXJjZW50KSkgKiBwZXJjZW50XHJcbiAgKyAoY3AyICogMyAtIGNwMiAqIDMgKiBwZXJjZW50KSAqIHQyXHJcbiAgKyBlbmRQdCAqIHQzXHJcbn1cclxuXHJcblxyXG4vLy0tRlVOQ1RJT05TIFRPIFJFTkRFUiBXQVlQT0lOVFMsIENPTlRST0wgUE9JTlRTLCBFVEMgVVNFRCBJTiBQQVJUSUNMRSBDUkVBVElPTlxyXG4vL05PVCBORUNFU1NBUklMWSBVU0VEIEJVVCBVU0VGVUwgRk9SIERFQlVHR0lOR1xyXG5mdW5jdGlvbiByZW5kZXJCb3VuZGluZ0NpcmNsZShjdHgsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpIHtcclxuICBsZXQgY2VudGVyWCA9IGNhbnZhc1dpZHRoIC8gMlxyXG4gIGxldCBjZW50ZXJZID0gY2FudmFzSGVpZ2h0IC8gMlxyXG4gIGxldCByYWRpdXMgPSBjZW50ZXJZID4gY2VudGVyWCA/IGNlbnRlclggLSAyIDogY2VudGVyWSAtIDJcclxuICBsZXQgc3RhcnRBbmdsZSA9IDBcclxuICBsZXQgZW5kQW5nbGUgPSAyICogTWF0aC5QSVxyXG4gIGN0eC5saW5lV2lkdGggPSAxXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZXknXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LmFyYyhjZW50ZXJYLCBjZW50ZXJZLCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKVxyXG4gIGN0eC5zdHJva2UoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmVuZGVySG9sZFBhdHRlcm5XUHMoY3R4LCB3YXlwb2ludHMpIHtcclxuICBjdHguYmVnaW5QYXRoKClcclxuICBjdHguZmlsbFN0eWxlID0gJ2JsdWUnXHJcbiAgd2F5cG9pbnRzLmZvckVhY2god3AgPT4ge1xyXG4gICAgY3R4LmZpbGxSZWN0KHdwLnggLSA0LCB3cC55IC0gNCwgOCwgOClcclxuICB9KVxyXG4gIGN0eC5zdHJva2UoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmVuZGVySG9sZFBhdHRlcm5QYXJ0aWNsZVBhdGhzKGN0eCwgcGFydGljbGVzKSB7XHJcbiAgcGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xyXG4gICAgbGV0IGNwMVggPSBwYXJ0aWNsZS5jb29yZHMuY3AxeFxyXG4gICAgbGV0IGNwMVkgPSBwYXJ0aWNsZS5jb29yZHMuY3AxeVxyXG4gICAgbGV0IGNwMlggPSBwYXJ0aWNsZS5jb29yZHMuY3AyeFxyXG4gICAgbGV0IGNwMlkgPSBwYXJ0aWNsZS5jb29yZHMuY3AyeVxyXG4gICAgbGV0IHN0YXJ0WCA9IHBhcnRpY2xlLmNvb3Jkcy54MFxyXG4gICAgbGV0IHN0YXJ0WSA9IHBhcnRpY2xlLmNvb3Jkcy55MFxyXG4gICAgbGV0IGVuZFggPSBwYXJ0aWNsZS5jb29yZHMueDFcclxuICAgIGxldCBlbmRZID0gcGFydGljbGUuY29vcmRzLnkxXHJcbiAgICBjdHgubGluZVdpZHRoID0gMVxyXG4gICAgLy9yZW5kZXIgc3RhcnQgcG9pbnRcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZWVuJ1xyXG4gICAgY3R4LnJlY3Qoc3RhcnRYIC0gMiwgc3RhcnRZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgZW5kIHBvaW50XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAncmVkJ1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHgucmVjdChlbmRYIC0gMiwgZW5kWSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIGNvbnRyb2wgcG9pbnQgMVxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAneWVsbG93J1xyXG4gICAgY3R4LnJlY3QoY3AxWCAtIDIsIGNwMVkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBjb250cm9sIHBvaW50IDJcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ29yYW5nZSdcclxuICAgIGN0eC5yZWN0KGNwMlggLSAyLCBjcDJZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgcGF0aFxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JleSdcclxuICAgIGN0eC5tb3ZlVG8oc3RhcnRYLCBzdGFydFkpXHJcbiAgICBjdHguYmV6aWVyQ3VydmVUbyhjcDFYLCBjcDFZLCBjcDJYLCBjcDJZLCBlbmRYLCBlbmRZKVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgfSlcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1DT0xPUiBIRUxQRVJTXHJcbi8vd291bGQgYmUgbW9yZSBlZmZpY2llbnQgdG8gdGFrZSBhcmdzIGFzIHtyOiAwLTI1NSwgZzogMC0yNTUsIGI6MC0yNTV9XHJcbi8vc28gbm8gbmVlZCB0aGUgaGV4IGFycmF5IHN0dWZmIGJ1dCBvayBmb3Igbm93IGFzIGRyYXdpbmdcclxuLy9hIGZldyBodW5kcmVkIHBhcnRpY2xlcyB3aXRob3V0IGxhZ1xyXG5mdW5jdGlvbiBjb2xvckJldHdlZW5Ud29Db2xvcnMocGVyY2VudCwgY29sb3JPbmUsIGNvbG9yVHdvKSB7XHJcbiAgbGV0IGhleCA9IFsnMCcsICcxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICdhJywgJ2InLCAnYycsICdkJywgJ2UnLCAnZiddXHJcblxyXG4gIC8vY29sb3JPbmVcclxuICBsZXQgYzFSZWRJbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDEpIClcclxuICBsZXQgYzFSZWRJbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDIpIClcclxuICBsZXQgYzFSZWRCYXNlVGVuID0gKGMxUmVkSW5kZXgwICogMTYpICsgKGMxUmVkSW5kZXgxKVxyXG5cclxuICBsZXQgYzFHcmVlbkluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoMykgKVxyXG4gIGxldCBjMUdyZWVuSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCg0KSApXHJcbiAgbGV0IGMxR3JlZW5kQmFzZVRlbiA9IChjMUdyZWVuSW5kZXgwICogMTYpICsgKGMxR3JlZW5JbmRleDEpXHJcblxyXG4gIGxldCBjMUJsdWVJbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDUpIClcclxuICBsZXQgYzFCbHVlSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCg2KSApXHJcbiAgbGV0IGMxQmx1ZUJhc2VUZW4gPSAoYzFCbHVlSW5kZXgwICogMTYpICsgKGMxQmx1ZUluZGV4MSlcclxuXHJcbiAgLy9jb2xvclR3b1xyXG4gIGxldCBjMlJlZEluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoMSkgKVxyXG4gIGxldCBjMlJlZEluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoMikgKVxyXG4gIGxldCBjMlJlZEJhc2VUZW4gPSAoYzJSZWRJbmRleDAgKiAxNikgKyAoYzJSZWRJbmRleDEpXHJcblxyXG4gIGxldCBjMkdyZWVuSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCgzKSApXHJcbiAgbGV0IGMyR3JlZW5JbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDQpIClcclxuICBsZXQgYzJHcmVlbmRCYXNlVGVuID0gKGMyR3JlZW5JbmRleDAgKiAxNikgKyAoYzJHcmVlbkluZGV4MSlcclxuXHJcbiAgbGV0IGMyQmx1ZUluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoNSkgKVxyXG4gIGxldCBjMkJsdWVJbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDYpIClcclxuICBsZXQgYzJCbHVlQmFzZVRlbiA9IChjMkJsdWVJbmRleDAgKiAxNikgKyAoYzJCbHVlSW5kZXgxKVxyXG5cclxuICBsZXQgcmVkRGVsdGEgPSBjMlJlZEJhc2VUZW4gLSBjMVJlZEJhc2VUZW5cclxuICBsZXQgZ3JlZW5EZWx0YSA9IGMyR3JlZW5kQmFzZVRlbiAtIGMxR3JlZW5kQmFzZVRlblxyXG4gIGxldCBibHVlRGVsdGEgPSBjMkJsdWVCYXNlVGVuIC0gYzFCbHVlQmFzZVRlblxyXG5cclxuICBsZXQgcmVkTm93ID0gTWF0aC5yb3VuZCggYzFSZWRCYXNlVGVuICsgKHJlZERlbHRhICogcGVyY2VudCkgKVxyXG4gIGxldCBncmVlbk5vdyA9IE1hdGgucm91bmQoIGMxR3JlZW5kQmFzZVRlbiArIChncmVlbkRlbHRhICogcGVyY2VudCkgKVxyXG4gIGxldCBibHVlTm93ID0gTWF0aC5yb3VuZCggYzFCbHVlQmFzZVRlbiArIChibHVlRGVsdGEgKiBwZXJjZW50KSApXHJcblxyXG4gIHJldHVybiB7cjogcmVkTm93LCBnOiBncmVlbk5vdywgYjogYmx1ZU5vd30vL3RlbXBcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FWFBPUlRTXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMsXHJcbiAgcmFuZFBvaW50TmVhclBvaW50LFxyXG4gIGNvb3Jkc09uU3RyYWlnaHRMaW5lLFxyXG4gIGNvb3Jkc09uQ3ViaWNCZXppZXIsXHJcbiAgY29sb3JCZXR3ZWVuVHdvQ29sb3JzLFxyXG4gIC8vZGV2XHJcbiAgcmVuZGVyQm91bmRpbmdDaXJjbGUsXHJcbiAgcmVuZGVySG9sZFBhdHRlcm5XUHMsXHJcbiAgcmVuZGVySG9sZFBhdHRlcm5QYXJ0aWNsZVBhdGhzXHJcbn1cclxuIiwiY29uc3QgQ0FST1VTRUxfREFUQSA9IFtcclxuICB7dGV4dDogJ1pFUk8nLCBiZ0NvbG9yOiAncmVkJywgbmF2SXRlbXM6IFtcclxuICAgIHt0ZXh0OiAnemVybyBhJywgYmdDb2xvcjogJ3JlZCd9LFxyXG4gICAge3RleHQ6ICd6ZXJvIGInLCBiZ0NvbG9yOiAnZ3JlZW4nfSxcclxuICAgIHt0ZXh0OiAnemVybyBjJywgYmdDb2xvcjogJ2JsdWUnfSxcclxuICAgIHt0ZXh0OiAnemVybyBkJywgYmdDb2xvcjogJ29yYW5nZSd9LFxyXG4gICAge3RleHQ6ICd6ZXJvIGUnLCBiZ0NvbG9yOiAncHVycGxlJ31cclxuICBdfSxcclxuICB7dGV4dDogJ09ORScsIGJnQ29sb3I6ICdncmVlbicsIG5hdkl0ZW1zOiBbXHJcbiAgICB7dGV4dDogJ29uZSBhJywgYmdDb2xvcjogJ3JlZCd9LFxyXG4gICAge3RleHQ6ICdvbmUgYicsIGJnQ29sb3I6ICdncmVlbid9LFxyXG4gICAge3RleHQ6ICdvbmUgYycsIGJnQ29sb3I6ICdibHVlJ30sXHJcbiAgICB7dGV4dDogJ29uZSBkJywgYmdDb2xvcjogJ29yYW5nZSd9LFxyXG4gICAge3RleHQ6ICdvbmUgZScsIGJnQ29sb3I6ICdwdXJwbGUnfVxyXG4gIF19LFxyXG4gIHt0ZXh0OiAnVFdPJywgYmdDb2xvcjogJ2JsdWUnLCBuYXZJdGVtczogW1xyXG4gICAge3RleHQ6ICd0d28gYScsIGJnQ29sb3I6ICdyZWQnfSxcclxuICAgIHt0ZXh0OiAndHdvIGInLCBiZ0NvbG9yOiAnZ3JlZW4nfSxcclxuICAgIHt0ZXh0OiAndHdvIGMnLCBiZ0NvbG9yOiAnYmx1ZSd9LFxyXG4gICAge3RleHQ6ICd0d28gZCcsIGJnQ29sb3I6ICdvcmFuZ2UnfSxcclxuICAgIHt0ZXh0OiAndHdvIGUnLCBiZ0NvbG9yOiAncHVycGxlJ31cclxuICBdfSxcclxuICB7dGV4dDogJ1RIUkVFJywgYmdDb2xvcjogJ29yYW5nZScsIG5hdkl0ZW1zOiBbXHJcbiAgICB7dGV4dDogJ3RocmVlIGEnLCBiZ0NvbG9yOiAncmVkJ30sXHJcbiAgICB7dGV4dDogJ3RocmVlIGInLCBiZ0NvbG9yOiAnZ3JlZW4nfSxcclxuICAgIHt0ZXh0OiAndGhyZWUgYycsIGJnQ29sb3I6ICdibHVlJ30sXHJcbiAgICB7dGV4dDogJ3RocmVlIGQnLCBiZ0NvbG9yOiAnb3JhbmdlJ30sXHJcbiAgICB7dGV4dDogJ3RocmVlIGUnLCBiZ0NvbG9yOiAncHVycGxlJ31cclxuICBdfSxcclxuICB7dGV4dDogJ0ZPVVInLCBiZ0NvbG9yOiAncHVycGxlJywgbmF2SXRlbXM6IFtcclxuICAgIHt0ZXh0OiAnZm91ciBhJywgYmdDb2xvcjogJ3JlZCd9LFxyXG4gICAge3RleHQ6ICdmb3VyIGInLCBiZ0NvbG9yOiAnZ3JlZW4nfSxcclxuICAgIHt0ZXh0OiAnZm91ciBjJywgYmdDb2xvcjogJ2JsdWUnfSxcclxuICAgIHt0ZXh0OiAnZm91ciBkJywgYmdDb2xvcjogJ29yYW5nZSd9LFxyXG4gICAge3RleHQ6ICdmb3VyIGUnLCBiZ0NvbG9yOiAncHVycGxlJ31cclxuICBdfSxcclxuICB7dGV4dDogJ0ZJVkUnLCBiZ0NvbG9yOiAnd2hpdGUnLCBuYXZJdGVtczogW1xyXG4gICAge3RleHQ6ICdmaXZlIGEnLCBiZ0NvbG9yOiAnYmxhY2snfSxcclxuICAgIHt0ZXh0OiAnZml2ZSBiJywgYmdDb2xvcjogJ3doaXRlJ30sXHJcbiAgICB7dGV4dDogJ2ZpdmUgYycsIGJnQ29sb3I6ICdibGFjayd9LFxyXG4gICAge3RleHQ6ICdmaXZlIGQnLCBiZ0NvbG9yOiAnd2hpdGUnfSxcclxuICAgIHt0ZXh0OiAnZml2ZSBlJywgYmdDb2xvcjogJ2JsYWNrJ30sXHJcbiAgICB7dGV4dDogJ2ZpdmUgZicsIGJnQ29sb3I6ICdyZWQnfVxyXG4gIF19XHJcbl1cclxuY29uc3QgQ0FST1VTRUxfQ09MUyA9IDVcclxuY29uc3QgQ0FST1VTRUxfUk9XUyA9IDVcclxuY29uc3QgQ0VOVEVSX0NPTCA9IDJcclxuY29uc3QgQ0VOVEVSX1JPVyA9IDJcclxuXHJcbmxldCBjYXJvdXNlbENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYXZpZ2F0b3JOYXZJdGVtcycpLy9tdXN0IGJlIG1hdGNoZWQgdG8gY2Fyb3VzZWwgY29udGFpbmVyIGVsZW1lbnRcclxubGV0IGNhcm91c2VsVmlzaWJsZUl0ZW1zXHJcbmxldCBzZWxlY3RlZENvbCA9IDBcclxubGV0IHNlbGVjdGVkUm93SW5Db2xzID0gW11cclxubGV0IGNhcm91c2VsRWxlbWVudHMgPSBbXVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLU1BTkFHRVJTXHJcbi8vaW5pdGlhbGl6ZVxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgQ0FST1VTRUxfREFUQS5sZW5ndGg7IGkrKykge1xyXG4gICAgc2VsZWN0ZWRSb3dJbkNvbHMucHVzaCgwKVxyXG4gIH1cclxuXHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IENBUk9VU0VMX0NPTFM7IGkrKykge1xyXG4gICAgY2Fyb3VzZWxFbGVtZW50cy5wdXNoKFtdKVxyXG4gICAgZm9yKGxldCBqID0gMDsgaiA8IENBUk9VU0VMX1JPV1M7IGorKykge1xyXG4gICAgICBjYXJvdXNlbEVsZW1lbnRzW2ldLnB1c2goZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLmNhcm91c2VsSXRlbTpudGgtb2YtdHlwZSgkezEgKyBpfW4pIC5uYXZJdGVtYClbal0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZW5kZXIoKVxyXG59KVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxuICByZW1vdmVDYXJvdXNlbENlbGxzKClcclxuICByZW1vdmVDYXJvdXNlbENvbHVtbnMoKVxyXG4gIG1ha2VDYXJvdXNlbENvbHVtbnMoKVxyXG4gIG1ha2VDYXJvdXNlbENlbGxzKClcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxuICBwb3B1bGF0ZUNhcm91c2VsQ29sdW1ucygpXHJcbiAgcG9wdWxhdGVDYXJvdXNlbENlbGxzKClcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGxlZnQoKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IGNhcm91c2VsVmlzaWJsZUl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjYXJvdXNlbFZpc2libGVJdGVtc1tpXS5jbGFzc0xpc3QuYWRkKCdtb3ZlZExlZnQnKVxyXG4gIH1cclxuXHJcbiAgZGVjSG9yaXooKVxyXG4gIHVwZGF0ZUNhcm91c2VsU3RhdGUoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmlnaHQoKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IGNhcm91c2VsVmlzaWJsZUl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjYXJvdXNlbFZpc2libGVJdGVtc1tpXS5jbGFzc0xpc3QuYWRkKCdtb3ZlZFJpZ2h0JylcclxuICB9XHJcblxyXG4gIGluY0hvcml6KClcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHVwKCkge1xyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBjYXJvdXNlbEVsZW1lbnRzW0NFTlRFUl9DT0xdLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjYXJvdXNlbEVsZW1lbnRzW0NFTlRFUl9DT0xdW2ldLmNsYXNzTGlzdC5hZGQoJ21vdmVkVXAnKVxyXG4gIH1cclxuXHJcbiAgaW5jVmVydCgpXHJcbiAgdXBkYXRlQ2Fyb3VzZWxTdGF0ZSgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBkb3duKCkge1xyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBjYXJvdXNlbEVsZW1lbnRzW0NFTlRFUl9DT0xdLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjYXJvdXNlbEVsZW1lbnRzW0NFTlRFUl9DT0xdW2ldLmNsYXNzTGlzdC5hZGQoJ21vdmVkRG93bicpXHJcbiAgfVxyXG5cclxuICBkZWNWZXJ0KClcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1IRUxQRVJTXHJcbmZ1bmN0aW9uIHJlbW92ZUNhcm91c2VsQ29sdW1ucygpIHtcclxuICB3aGlsZShjYXJvdXNlbENvbnRhaW5lci5maXJzdENoaWxkKSB7XHJcbiAgICBjYXJvdXNlbENvbnRhaW5lci5yZW1vdmVDaGlsZChjYXJvdXNlbENvbnRhaW5lci5maXJzdENoaWxkKVxyXG4gIH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZUNhcm91c2VsQ2VsbHMoKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IGNhcm91c2VsVmlzaWJsZUl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB3aGlsZShjYXJvdXNlbFZpc2libGVJdGVtc1tpXS5maXJzdENoaWxkKSB7XHJcbiAgICAgIGNhcm91c2VsVmlzaWJsZUl0ZW1zW2ldLnJlbW92ZUNoaWxkKGNhcm91c2VsVmlzaWJsZUl0ZW1zW2ldLmZpcnN0Q2hpbGQpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gbWFrZUNhcm91c2VsQ29sdW1ucygpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgQ0FST1VTRUxfQ09MUzsgaSsrKSB7XHJcbiAgICBsZXQgbmV3RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICBuZXdFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2Nhcm91c2VsSXRlbScpXHJcbiAgICBuZXdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCByZW5kZXIpXHJcbiAgICBjYXJvdXNlbENvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdFbGVtZW50KVxyXG4gIH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIG1ha2VDYXJvdXNlbENlbGxzKCkge1xyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBDQVJPVVNFTF9DT0xTOyBpKyspIHtcclxuICAgIGZvcihsZXQgaiA9IDA7IGogPCBDQVJPVVNFTF9ST1dTOyBqKyspIHtcclxuICAgICAgbGV0IG5ld0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBuZXdFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ25hdkl0ZW0nKVxyXG4gICAgICBuZXdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCByZW5kZXIpXHJcbiAgICAgIGNhcm91c2VsVmlzaWJsZUl0ZW1zW2pdLmFwcGVuZENoaWxkKG5ld0VsZW1lbnQpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQ2Fyb3VzZWxTdGF0ZSgpIHtcclxuICBjYXJvdXNlbFZpc2libGVJdGVtcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsSXRlbScpXHJcblxyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBDQVJPVVNFTF9DT0xTOyBpKyspIHtcclxuICAgIGZvcihsZXQgaiA9IDA7IGogPCBDQVJPVVNFTF9ST1dTOyBqKyspIHtcclxuICAgICAgY2Fyb3VzZWxFbGVtZW50c1tpXVtqXSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC5jYXJvdXNlbEl0ZW06bnRoLW9mLXR5cGUoJHsxICsgaX1uKSAubmF2SXRlbWApW2pdXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gaW5jSG9yaXooKSB7XHJcbiAgc2VsZWN0ZWRDb2wgPSBzZWxlY3RlZENvbCA9PT0gQ0FST1VTRUxfREFUQS5sZW5ndGggLSAxID8gMCA6IHNlbGVjdGVkQ29sICsgMVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZGVjSG9yaXooKSB7XHJcbiAgc2VsZWN0ZWRDb2wgPSBzZWxlY3RlZENvbCA9PT0gMCA/IENBUk9VU0VMX0RBVEEubGVuZ3RoIC0gMSA6IHNlbGVjdGVkQ29sIC0gMVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gaW5jVmVydCgpIHtcclxuICBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gPSBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gPT09IENBUk9VU0VMX0RBVEFbc2VsZWN0ZWRDb2xdLm5hdkl0ZW1zLmxlbmd0aCAtIDEgPyAwIDogc2VsZWN0ZWRSb3dJbkNvbHNbc2VsZWN0ZWRDb2xdICsgMVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZGVjVmVydCgpIHtcclxuICBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gPSBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gPT09IDAgPyBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS5uYXZJdGVtcy5sZW5ndGggLSAxIDogc2VsZWN0ZWRSb3dJbkNvbHNbc2VsZWN0ZWRDb2xdIC0gMVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcG9wdWxhdGVDYXJvdXNlbENvbHVtbnMoKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IENBUk9VU0VMX0NPTFM7IGkrKykge1xyXG4gICAgbGV0IHggPSBzZWxlY3RlZENvbCArIGkgKyBDQVJPVVNFTF9EQVRBLmxlbmd0aCAtIDJcclxuICAgIHdoaWxlKHggPj0gQ0FST1VTRUxfREFUQS5sZW5ndGgpIHt4ID0geCAtIENBUk9VU0VMX0RBVEEubGVuZ3RofVxyXG5cclxuICAgIC8vY2Fyb3VzZWxWaXNpYmxlSXRlbXNbQ0FST1VTRUxfQ09MUyAtIDEgLSBpXS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDQVJPVVNFTF9EQVRBW3hdLmJnQ29sb3JcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBvcHVsYXRlQ2Fyb3VzZWxDZWxscygpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgQ0FST1VTRUxfQ09MUzsgaSsrKSB7XHJcbiAgICBsZXQgeCA9IHNlbGVjdGVkQ29sICsgaSArIENBUk9VU0VMX0RBVEEubGVuZ3RoIC0gMlxyXG4gICAgd2hpbGUoeCA+PSBDQVJPVVNFTF9EQVRBLmxlbmd0aCkge3ggPSB4IC0gQ0FST1VTRUxfREFUQS5sZW5ndGh9XHJcblxyXG4gICAgZm9yKGxldCBqID0gMDsgaiA8IENBUk9VU0VMX1JPV1M7IGorKykge1xyXG4gICAgICBsZXQgeSA9IHNlbGVjdGVkUm93SW5Db2xzW3hdICsgalxyXG4gICAgICB3aGlsZSh5ID49IENBUk9VU0VMX0RBVEFbeF0ubmF2SXRlbXMubGVuZ3RoKSB7eSA9IHkgLSBDQVJPVVNFTF9EQVRBW3hdLm5hdkl0ZW1zLmxlbmd0aH1cclxuXHJcbiAgICAgIC8vY2Fyb3VzZWxFbGVtZW50c1tDQVJPVVNFTF9DT0xTIC0gMSAtIGldW2pdLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IENBUk9VU0VMX0RBVEFbeF0ubmF2SXRlbXNbeV0uYmdDb2xvclxyXG4gICAgICBjYXJvdXNlbEVsZW1lbnRzW0NBUk9VU0VMX0NPTFMgLSAxIC0gaV1bal0uaW5uZXJIVE1MID0gQ0FST1VTRUxfREFUQVt4XS5uYXZJdGVtc1t5XS50ZXh0XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0TmF2VG9waWNUZXh0KCkge1xyXG4gIHJldHVybiBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS50ZXh0XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBnZXROYXZJdGVtVGV4dCgpIHtcclxuICBsZXQgeSA9IFtzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gKyBDRU5URVJfUk9XXVxyXG4gIHdoaWxlKHkgPj0gQ0FST1VTRUxfREFUQVtzZWxlY3RlZENvbF0ubmF2SXRlbXMubGVuZ3RoKSB7eSA9IHkgLSBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS5uYXZJdGVtcy5sZW5ndGh9XHJcblxyXG4gIHJldHVybiBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS5uYXZJdGVtc1t5XS50ZXh0LnRvVXBwZXJDYXNlKClcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVYUE9SVFNcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgdXAsXHJcbiAgZG93bixcclxuICBsZWZ0LFxyXG4gIHJpZ2h0LFxyXG4gIGdldE5hdlRvcGljVGV4dCxcclxuICBnZXROYXZJdGVtVGV4dFxyXG59XHJcbiIsIi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQ09PUkRTIEFTIFJBVElPIEFORCBWRUNUT1IgUE9JTlQgQVRTXHJcbmxldCBsZXR0ZXJzQ29vcmRzID0ge1xyXG4gIEE6IFtcclxuICAgIHt4OiAwLjEyNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAgLy8xXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0sICAgLy80XHJcbiAgICB7eDogMC44NzUsIHk6IDAuODc1fSAvLzVcclxuICBdLFxyXG4gIEI6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjI1fSwgLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC43NX0gIC8vNFxyXG4gIF0sXHJcbiAgQzogW1xyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjYyNX0sLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4zNzV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSAvLzNcclxuICBdLFxyXG4gIEQ6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sIC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1IH0sLy8xXHJcbiAgICB7eDogMC43NSwgeTogMC4zNzV9LCAvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjYyNX0gIC8vM1xyXG4gIF0sXHJcbiAgRTogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjV9LCAgLy80XHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9IC8vNVxyXG4gIF0sXHJcbiAgRjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjV9ICAgLy80XHJcbiAgXSxcclxuICBHOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNjI1fSwvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjM3NX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNjI1LCB5OiAwLjV9LCAvLzRcclxuICAgIHt4OiAwLjg3NSwgeTogMC41fSAgLy81XHJcbiAgXSxcclxuICBIOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0sICAvLzRcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0gLy81XHJcbiAgXSxcclxuICBJOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuNSwgeTogMC44NzV9LCAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8yXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNSwgeTogMC4xMjV9LCAvLzRcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0gLy81XHJcbiAgXSxcclxuICBKOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC43NX0sXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjUsIHk6IDAuNzV9LFxyXG4gICAge3g6IDAuNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIEs6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9XHJcbiAgXSxcclxuICBMOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIE06IFtcclxuICAgIHt4OiAwLjEyNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjUsIHk6IDAuNzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjg3NSwgeTogMC44NzV9XHJcbiAgXSxcclxuICBOOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9XHJcbiAgXSxcclxuICBPOiBbXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjEyNSwgeTogMC42MjV9LFxyXG4gICAge3g6IDAuMTI1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuNjI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC44NzV9XHJcbiAgXSxcclxuICBQOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4yNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4zNzV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjV9XHJcbiAgXSxcclxuICBROiBbXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjEyNSwgeTogMC42MjV9LFxyXG4gICAge3g6IDAuMTI1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuNjI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjYyNX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuODc1fVxyXG4gIF0sXHJcbiAgUjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMzc1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC41fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX1cclxuICBdLFxyXG4gIFM6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjc1fSwgIC8vMFxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjg3NX0sLy8xXHJcbiAgICB7eDogMC42MjUsIHk6IDAuODc1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjc1fSwgIC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNjI1fSwgLy80XHJcbiAgICB7eDogMC42MjUsIHk6IDAuNX0sICAvLzVcclxuICAgIHt4OiAwLjM3NSwgeTogMC41fSwgIC8vNlxyXG4gICAge3g6IDAuMjUsIHk6IDAuMzc1fSwgLy83XHJcbiAgICB7eDogMC4yNSwgeTogMC4yNX0sICAvLzhcclxuICAgIHt4OiAwLjM3NSwgeTogMC4xMjV9LC8vOVxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sLy8xMFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9ICAgLy8xMVxyXG4gIF0sXHJcbiAgVDogW1xyXG4gICAge3g6IDAuNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIFU6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC43NX0sXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuNzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTIyNX1cclxuICBdLFxyXG4gIFY6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC41LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9XHJcbiAgXSxcclxuICBXOiBbXHJcbiAgICB7eDogMC4xMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjM3NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNSwgeTogMC4yNX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjg3NSwgeTogMC4xMjV9XHJcbiAgXSxcclxuICBYOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9XHJcbiAgXSxcclxuICBZOiBbXHJcbiAgICB7eDogMC41LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC41LCB5OiAwLjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIFo6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX1cclxuICBdLFxyXG4gIFwiIFwiOiBbXS8vZW5hYmxlcyBoYXZpbmcgc3BhY2VzIGJldHdlZW4gbGV0dGVyc1xyXG59XHJcblxyXG5cclxubGV0IGxldHRlcnNWZWN0b3JzID0ge1xyXG4gIEE6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgQjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0yfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtNH1cclxuICBdLFxyXG4gIEM6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgRDogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0zfVxyXG4gIF0sXHJcbiAgRTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC01fVxyXG4gIF0sXHJcbiAgRjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBHOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTV9XHJcbiAgXSxcclxuICBIOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIEk6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgSjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBLOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTN9XHJcbiAgXSxcclxuICBMOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIE06IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgTjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBPOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTd9XHJcbiAgXSxcclxuICBQOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTV9XHJcbiAgXSxcclxuICBROiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTd9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBSOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTV9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0xfVxyXG4gIF0sXHJcbiAgUzogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBUOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIFU6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgVjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBXOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIFg6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgWTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0yfVxyXG4gIF0sXHJcbiAgWjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXVxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FWFBPUlRFRCBGVU5DVElPTlNcclxuZnVuY3Rpb24gdG90YWxSZXF1aXJlZFBhcnRpY2xlcyhzdHIpIHtcclxuICBsZXQgcmVxdWlyZWRQYXJ0aWNsZXMgPSAwXHJcblxyXG4gIGZvcihpIGluIHN0cikge1xyXG4gICAgcmVxdWlyZWRQYXJ0aWNsZXMgKz0gbGV0dGVyc0Nvb3Jkc1tzdHIuY2hhckF0KGkpXS5sZW5ndGhcclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKFwidG90YWwgcmVxdWlyZWRQYXJ0aWNsZXM6IFwiICsgcmVxdWlyZWRQYXJ0aWNsZXMpXHJcbiAgcmV0dXJuIHJlcXVpcmVkUGFydGljbGVzXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBwbGFjZVdvcmRzSW5Sb3dzKHN0ciwgbWF4Q2hhcnNJblJvdykge1xyXG4gIGxldCB3b3JkcyA9IHN0ci5zcGxpdChcIiBcIilcclxuICBsZXQgcm93cyA9IFtcIlwiXVxyXG4gIGxldCByb3dzSW5kZXggPSAwXHJcblxyXG4gIHdvcmRzLmZvckVhY2goKHdvcmQsIGluZGV4KSA9PiB7XHJcbiAgICBpZihyb3dzW3Jvd3NJbmRleF0ubGVuZ3RoICsgd29yZC5sZW5ndGggKyAxIDw9IG1heENoYXJzSW5Sb3cpIHtcclxuICAgICAgcm93c1tyb3dzSW5kZXhdID0gaW5kZXggPT09IDAgPyByb3dzW3Jvd3NJbmRleF0gKyB3b3JkIDogcm93c1tyb3dzSW5kZXhdICsgXCIgXCIgKyB3b3JkXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByb3dzLnB1c2god29yZClcclxuICAgICAgcm93c0luZGV4KytcclxuICAgIH1cclxuICB9KVxyXG5cclxuICByZXR1cm4gcm93c1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY2FsY0xldHRlclBhcnRpY2xlc0Rlc3RBbmRUYXJnZXRzKHdvcmRzSW5Sb3dzLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KSB7XHJcbiAgbGV0IGNoYXJXaWR0aCA9IE1hdGgucm91bmQoIGNhbnZhc1dpZHRoIC8gKGxvbmdlc3RFbGVtZW50TGVuZ3RoKHdvcmRzSW5Sb3dzKSArIDIpIClcclxuICBsZXQgY2hhckhlaWdodCA9IE1hdGgucm91bmQoY2hhcldpZHRoICogMS4yKVxyXG4gIGxldCB0b3RhbFJvd3NIZWlnaHQgPSBjaGFySGVpZ2h0ICogKHdvcmRzSW5Sb3dzLmxlbmd0aCArIDEpXHJcbiAgbGV0IGZpbmFsQ29vcmRzQW5kUG9pbnRzQXRzID0gW11cclxuXHJcbiAgZm9yKGxldCByb3cgaW4gd29yZHNJblJvd3MpIHtcclxuICAgIGxldCByb3dTdGFydFggPSAoY2FudmFzV2lkdGggLyAyKSAtICh3b3Jkc0luUm93c1tyb3ddLmxlbmd0aCAqIGNoYXJXaWR0aCAvIDIpXHJcbiAgICBsZXQgcm93U3RhcnRZID0gKGNhbnZhc0hlaWdodCAvIDIpIC0gKHRvdGFsUm93c0hlaWdodCAvIDIpICsgKHJvdyAqIGNoYXJIZWlnaHQpXHJcblxyXG4gICAgZm9yKGxldCBsZXR0ZXJQb3MgPSAwOyBsZXR0ZXJQb3MgPCB3b3Jkc0luUm93c1tyb3ddLmxlbmd0aDsgbGV0dGVyUG9zKyspIHtcclxuICAgICAgbGV0IGNoYXJIZXJlID0gd29yZHNJblJvd3Nbcm93XS5jaGFyQXQobGV0dGVyUG9zKVxyXG4gICAgICBsZXQgbkNoYXJQYXJ0aWNsZXMgPSBsZXR0ZXJzQ29vcmRzW2NoYXJIZXJlXS5sZW5ndGhcclxuXHJcbiAgICAgIGZvcihsZXQgcG9zSW5DaGFyID0gMDsgcG9zSW5DaGFyIDwgbkNoYXJQYXJ0aWNsZXM7IHBvc0luQ2hhcisrKSB7XHJcbiAgICAgICAgbGV0IHgxID0gcm93U3RhcnRYICsgKGxldHRlclBvcyAqIGNoYXJXaWR0aCkgKyAoY2hhcldpZHRoICogbGV0dGVyc0Nvb3Jkc1tjaGFySGVyZV1bcG9zSW5DaGFyXS54KVxyXG4gICAgICAgIGxldCB5MSA9IHJvd1N0YXJ0WSArIChjaGFySGVpZ2h0ICogbGV0dGVyc0Nvb3Jkc1tjaGFySGVyZV1bcG9zSW5DaGFyXS55KVxyXG4gICAgICAgIGxldCBwb2ludHNBdCA9IGZhbHNlXHJcblxyXG4gICAgICAgIGlmKGxldHRlcnNWZWN0b3JzW2NoYXJIZXJlXVtwb3NJbkNoYXJdLmhhc1ZlY3RvciA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgcG9pbnRzQXQgPSBsZXR0ZXJzVmVjdG9yc1tjaGFySGVyZV1bcG9zSW5DaGFyXS5pbmRleE9mZnNldFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZmluYWxDb29yZHNBbmRQb2ludHNBdHMucHVzaCh7eDE6IHgxLCB5MTogeTEsIHBvaW50c0F0OiBwb2ludHNBdH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBmaW5hbENvb3Jkc0FuZFBvaW50c0F0c1xyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1JTlRFUk5BTCBGVU5DVElPTlNcclxuZnVuY3Rpb24gbG9uZ2VzdEVsZW1lbnRMZW5ndGgoYXJyKSB7XHJcbiAgbGV0IGxlbmd0aCA9IDBcclxuICBhcnIuZm9yRWFjaChlbCA9PiB7XHJcbiAgICBsZW5ndGggPSBlbC5sZW5ndGggPj0gbGVuZ3RoID8gZWwubGVuZ3RoIDogbGVuZ3RoXHJcbiAgfSlcclxuICByZXR1cm4gbGVuZ3RoXHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVhQT1JUU1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBwbGFjZVdvcmRzSW5Sb3dzLFxyXG4gIHRvdGFsUmVxdWlyZWRQYXJ0aWNsZXMsXHJcbiAgY2FsY0xldHRlclBhcnRpY2xlc0Rlc3RBbmRUYXJnZXRzXHJcbn1cclxuIl19
