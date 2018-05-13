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
//navGoToButton.addEventListener('click', formNewParticleWord, false)//dev
document.getElementById('navigatorUp').addEventListener('click', carouselUp)
document.getElementById('navigatorDown').addEventListener('click', carouselDown)
document.getElementById('navigatorLeft').addEventListener('click', carouselLeft)
document.getElementById('navigatorRight').addEventListener('click', carouselRight)

//---------------------------------------------------FLOW CONTROL & INITIALIZERS
function init() {
  reset()
  setLayout()
  NAV_TOPIC_ELEMENT.innerHTML = carousel2d.getNavTopicText()
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
  {text: ' TPOIC ZERO', bgColor: 'red', navItems: [
    {text: 'nav link zero a', bgColor: 'red'},
    {text: 'nav link zero b', bgColor: 'green'},
    {text: 'nav link zero c', bgColor: 'blue'},
    {text: 'nav link zero d', bgColor: 'orange'},
    {text: 'nav link zero e', bgColor: 'purple'}
  ]},
  {text: 'TOPIC ONE', bgColor: 'green', navItems: [
    {text: 'nav link one a', bgColor: 'red'},
    {text: 'nav link one b', bgColor: 'green'},
    {text: 'nav link one c', bgColor: 'blue'},
    {text: 'nav link one d', bgColor: 'orange'},
    {text: 'nav link one e', bgColor: 'purple'}
  ]},
  {text: 'TOPIC TWO', bgColor: 'blue', navItems: [
    {text: 'nav link two a', bgColor: 'red'},
    {text: 'nav link two b', bgColor: 'green'},
    {text: 'nav link two c', bgColor: 'blue'},
    {text: 'nav link two d', bgColor: 'orange'},
    {text: 'nav link two e', bgColor: 'purple'}
  ]},
  {text: 'TOPIC THREE', bgColor: 'orange', navItems: [
    {text: 'nav link three a', bgColor: 'red'},
    {text: 'nav link three b', bgColor: 'green'},
    {text: 'nav link three c', bgColor: 'blue'},
    {text: 'nav link three d', bgColor: 'orange'},
    {text: 'nav link three e', bgColor: 'purple'}
  ]},
  {text: 'TOPIC FOUR', bgColor: 'purple', navItems: [
    {text: 'nav link four a', bgColor: 'red'},
    {text: 'nav link four b', bgColor: 'green'},
    {text: 'nav link four c', bgColor: 'blue'},
    {text: 'nav link four d', bgColor: 'orange'},
    {text: 'nav link four e', bgColor: 'purple'}
  ]},
  {text: 'TOPIC FIVE', bgColor: 'white', navItems: [
    {text: 'nav link five a', bgColor: 'black'},
    {text: 'nav link five b', bgColor: 'white'},
    {text: 'nav link five c', bgColor: 'black'},
    {text: 'nav link five d', bgColor: 'white'},
    {text: 'nav link five e', bgColor: 'black'},
    {text: 'nav link five f', bgColor: 'red'}
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9jbGFzc2VzL0NoYXJQYXR0ZXJuUGFydGljbGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9jbGFzc2VzL0hvbGRQYXR0ZXJuUGFydGljbGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9jbGFzc2VzL1BhcnRpY2xlLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvaG9tZS5qcyIsImNsaWVudC9zdGF0aWMvc291cmNlLWpzL3V0aWxzL2NhbnZhcy1oZWxwZXJzLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2Fyb3VzZWwtMmQuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9sZXR0ZXJzLWxpYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBjYW52YXNIZWxwZXJzID0gcmVxdWlyZSgnLi4vdXRpbHMvY2FudmFzLWhlbHBlcnMnKVxyXG5jb25zdCBQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vUGFydGljbGUnKVxyXG5cclxuY2xhc3MgQ2hhclBhdHRlcm5QYXJ0aWNsZSBleHRlbmRzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQsIHBvaW50c0F0KSB7XHJcbiAgICBzdXBlcihjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQpXHJcbiAgICB0aGlzLnBvaW50c0F0ID0gcG9pbnRzQXRcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvcygpIHtcclxuICAgIHRoaXMuZGlzdE1vdmVkICs9IHRoaXMuc3BlZWRcclxuICAgIGlmICh0aGlzLmRpc3RNb3ZlZCA+IDEpIHt0aGlzLmRpc3RNb3ZlZCA9IDF9Ly9wcmV2ZW50IG92ZXJzaG9vdFxyXG5cclxuICAgIGxldCBuZXdQb3MgPSBjYW52YXNIZWxwZXJzLmNvb3Jkc09uU3RyYWlnaHRMaW5lKHRoaXMuZGlzdE1vdmVkLCB7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pXHJcbiAgICB0aGlzLmNvb3Jkcy54ID0gbmV3UG9zLnhcclxuICAgIHRoaXMuY29vcmRzLnkgPSBuZXdQb3MueVxyXG4gIH1cclxuXHJcbiAgZHJhdyhjdHgsIGNvbG9yRnJvbSwgY29sb3JUbykge1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHgubGluZVdpZHRoID0gM1xyXG4gICAgbGV0IHJnYiA9IGNhbnZhc0hlbHBlcnMuY29sb3JCZXR3ZWVuVHdvQ29sb3JzKHRoaXMuZGlzdE1vdmVkLCAnI2ZmZmZmZicsICcjZmYwMDAwJykvL2RldlxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gYHJnYigke3JnYi5yfSwgJHtyZ2IuZ30sICR7cmdiLmJ9KWBcclxuICAgIC8vY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5kaXN0TW92ZWQgPCAxID8gY29sb3JGcm9tIDogY29sb3JUby8vd3JpdGUgZnVuY3Rpb24gdG8gdHJhbnNpdGlvbiBiZXR3ZWVuIDIgY29sb3VycyB0aGF0IHRha2VzICUgYXMgYW4gYXJnXHJcbiAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJ1xyXG4gICAgY3R4LmFyYyh0aGlzLmNvb3Jkcy54LCB0aGlzLmNvb3Jkcy55LCAzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIGN0eC5maWxsKClcclxuICB9XHJcblxyXG4gIGRyYXdUb1BvaW50c0F0KGN0eCwgY2hhclBhdHRlcm5QYXJ0aWNsZXMsIGluZGV4LCBjb2xvckZyb20sIGNvbG9yVG8pIHtcclxuICAgIGlmKHRoaXMuZGlzdE1vdmVkID4gMC4xKSB7XHJcbiAgICAgIGlmKHRoaXMucG9pbnRzQXQgIT09IGZhbHNlKSB7XHJcbiAgICAgICAgbGV0IHBvaW50c0F0WCA9IGNoYXJQYXR0ZXJuUGFydGljbGVzW2luZGV4ICsgdGhpcy5wb2ludHNBdF0uY29vcmRzLngvL3RoZXNlIHR3byBsaW5lcyBhcmUgZnVja2luZyB0aGluZ3Mgc29tZWhvdyBkZWxldGluZyB0aGUgbGFzdCBwYXJ0aWNsZSBpbiB0aGUgY2hhciBJIHRoaW5rXHJcbiAgICAgICAgbGV0IHBvaW50c0F0WSA9IGNoYXJQYXR0ZXJuUGFydGljbGVzW2luZGV4ICsgdGhpcy5wb2ludHNBdF0uY29vcmRzLnlcclxuICAgICAgICBjdHguYmVnaW5QYXRoKClcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gMlxyXG4gICAgICAgIGxldCByZ2IgPSBjYW52YXNIZWxwZXJzLmNvbG9yQmV0d2VlblR3b0NvbG9ycyh0aGlzLmRpc3RNb3ZlZCwgJyMxZjI2MzMnLCAnI2ZmMDAwMCcpXHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gYHJnYigke3JnYi5yfSwgJHtyZ2IuZ30sICR7cmdiLmJ9KWBcclxuICAgICAgICAvL2N0eC5zdHJva2VTdHlsZSA9IHRoaXMuZGlzdE1vdmVkIDwgMSA/IGNvbG9yRnJvbSA6IGNvbG9yVG9cclxuICAgICAgICBjdHgubW92ZVRvKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnkpXHJcbiAgICAgICAgY3R4LmxpbmVUbyhwb2ludHNBdFgsIHBvaW50c0F0WSlcclxuICAgICAgICBjdHguc3Ryb2tlKClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGFyUGF0dGVyblBhcnRpY2xlXHJcbiIsIlxyXG5jb25zdCBjYW52YXNIZWxwZXJzID0gcmVxdWlyZSgnLi4vdXRpbHMvY2FudmFzLWhlbHBlcnMnKVxyXG5jb25zdCBQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vUGFydGljbGUuanMnKVxyXG5cclxuY2xhc3MgSG9sZFBhdHRlcm5QYXJ0aWNsZSBleHRlbmRzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQsIG5leHRXUCkge1xyXG4gICAgc3VwZXIoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkKVxyXG4gICAgdGhpcy5uZXh0V1AgPSBuZXh0V1BcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvcyhIT0xEX1BBVFRFUk5fV0FZUE9JTlRTLCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCwgSE9MRF9TUEVFRCkge1xyXG4gICAgdGhpcy5kaXN0TW92ZWQgKz0gdGhpcy5zcGVlZFxyXG4gICAgaWYodGhpcy5kaXN0TW92ZWQgPj0gMSkge1xyXG4gICAgICB0aGlzLmRpc3RNb3ZlZCA9IDBcclxuICAgICAgdGhpcy5zcGVlZCA9IEhPTERfU1BFRURcclxuICAgICAgdGhpcy5uZXh0V1AgPSB0aGlzLm5leHRXUCA9PT0gSE9MRF9QQVRURVJOX1dBWVBPSU5UUy5sZW5ndGggLSAxID8gMCA6IHRoaXMubmV4dFdQICsgMVxyXG4gICAgICB0aGlzLmNvb3Jkcy54MCA9IHRoaXMuY29vcmRzLngxXHJcbiAgICAgIHRoaXMuY29vcmRzLnkwID0gdGhpcy5jb29yZHMueTFcclxuICAgICAgdGhpcy5jb29yZHMueDEgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFt0aGlzLm5leHRXUF0pLnhcclxuICAgICAgdGhpcy5jb29yZHMueTEgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFt0aGlzLm5leHRXUF0pLnlcclxuICAgICAgdGhpcy5jb29yZHMuY3AxeCA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnhcclxuICAgICAgdGhpcy5jb29yZHMuY3AxeSA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnlcclxuICAgICAgdGhpcy5jb29yZHMuY3AyeCA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnhcclxuICAgICAgdGhpcy5jb29yZHMuY3AyeSA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnlcclxuICAgIH1cclxuICAgIHRoaXMuY29vcmRzLnggPSBjYW52YXNIZWxwZXJzLmNvb3Jkc09uQ3ViaWNCZXppZXIodGhpcy5kaXN0TW92ZWQsIHRoaXMuY29vcmRzLngwLCB0aGlzLmNvb3Jkcy5jcDF4LCB0aGlzLmNvb3Jkcy5jcDJ4LCB0aGlzLmNvb3Jkcy54MSlcclxuICAgIHRoaXMuY29vcmRzLnkgPSBjYW52YXNIZWxwZXJzLmNvb3Jkc09uQ3ViaWNCZXppZXIodGhpcy5kaXN0TW92ZWQsIHRoaXMuY29vcmRzLnkwLCB0aGlzLmNvb3Jkcy5jcDF5LCB0aGlzLmNvb3Jkcy5jcDJ5LCB0aGlzLmNvb3Jkcy55MSlcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSG9sZFBhdHRlcm5QYXJ0aWNsZVxyXG4iLCJcclxuY2xhc3MgUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZCkge1xyXG4gICAgdGhpcy5jb29yZHMgPSBjb29yZHNcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZFxyXG4gICAgdGhpcy5kaXN0TW92ZWQgPSBkaXN0TW92ZWRcclxuICB9XHJcblxyXG4gIGRyYXcoY3R4LCBjb2xvcikgey8vZGVmYXVsdCBzZWxmIHJlbmRlciBmb3IgcGFydGljbGVzLCBtYXliZSBjaGFuZ2UgbGF0ZXJcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LmxpbmVXaWR0aCA9IDNcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yXHJcbiAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJ1xyXG4gICAgY3R4LmFyYyh0aGlzLmNvb3Jkcy54LCB0aGlzLmNvb3Jkcy55LCAzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIGN0eC5maWxsKClcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvcygpIHtcclxuICAgIHRoaXMuY29vcmRzLnggKz0gdGhpcy5zcGVlZFxyXG4gICAgdGhpcy5jb29yZHMueSArPSB0aGlzLnNwZWVkXHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnRpY2xlXHJcbiIsIlxyXG5jb25zdCBjYW52YXNIZWxwZXJzID0gcmVxdWlyZSgnLi91dGlscy9jYW52YXMtaGVscGVycy5qcycpXHJcbmNvbnN0IGxldHRlcnNMaWIgPSByZXF1aXJlKCcuL3V0aWxzL2xldHRlcnMtbGliLmpzJylcclxuY29uc3QgSG9sZFBhdHRlcm5QYXJ0aWNsZSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9Ib2xkUGF0dGVyblBhcnRpY2xlJylcclxuY29uc3QgQ2hhclBhdHRlcm5QYXJ0aWNsZSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9DaGFyUGF0dGVyblBhcnRpY2xlJylcclxuY29uc3QgY2Fyb3VzZWwyZCA9IHJlcXVpcmUoJy4vdXRpbHMvY2Fyb3VzZWwtMmQnKVxyXG5cclxubGV0IENIQVJfUEFUVEVSTl9XT1JEUyA9ICdZQVkgQU5PVEhFUiBORVcgQlVHJy8vZm9yIG5vdyBkZWZpbmVkICBoZXJlLCBsYXRlciB3aWxsIGNvbWUgZnJvbSBjYXVyb3NlbFxyXG5jb25zdCBNQVhfQ0hBUlNfUEVSX1JPVyA9IDEyXHJcbmNvbnN0IFRPVEFMX1BBUlRJQ0xFUyA9IDIwMFxyXG5jb25zdCBIT0xEX1BBVFRFUk5fV0FZUE9JTlRTID0gWy8vY29vcmRzIGFzICUgb2YgY2FudmFzIHNpemVcclxuICB7eDogMC4xMjUsIHk6IDAuNX0sXHJcbiAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICB7eDogMC43NSwgeTogMC4xMjV9LFxyXG4gIHt4OiAwLjg3NSwgeTogMC41fSxcclxuICB7eDogMC43NSwgeTogMC44NzV9LFxyXG4gIHt4OiAwLjI1LCB5OiAwLjg3NX1cclxuXVxyXG5jb25zdCBIT0xEX1NQRUVEID0gMC4wMDI1XHJcblxyXG5jb25zdCBOQVZfTElOS1MgPSBbLy9ub3QgaW1wbGVtZW50ZWQgeWV0XHJcbiAge1xyXG4gICAgbGlua3NfZ3JvdXA6ICdMaW5rcyBncm91cCAjMCcsXHJcbiAgICBsaW5rc19pdGVtczogW1xyXG4gICAgICB7bGlua1JlZjogJ3VybCcsIHBhcnRpY2xlVGV4dDogJ0dST1VQIFpFUk8gTElOSyBaRVJPJ30sXHJcbiAgICAgIHtsaW5rUmVmOiAndXJsJywgcGFydGljbGVUZXh0OiAnR1JPVVAgWkVSTyBMSU5LIE9ORSd9LFxyXG4gICAgICB7bGlua1JlZjogJ3VybCcsIHBhcnRpY2xlVGV4dDogJ0dST1VQIFpFUk8gTElOSyBUV08nfVxyXG4gICAgXVxyXG4gIH0sXHJcbiAge1xyXG4gICAgbGlua3NfZ3JvdXA6ICdMaW5rcyBncm91cCAjMScsXHJcbiAgICBsaW5rc19pdGVtczogW1xyXG4gICAgICB7bGlua1JlZjogJ3VybCcsIHBhcnRpY2xlVGV4dDogJ0dST1VQIE9ORSBMSU5LIFpFUk8nfSxcclxuICAgICAge2xpbmtSZWY6ICd1cmwnLCBwYXJ0aWNsZVRleHQ6ICdHUk9VUCBPTkUgTElOSyBPTkUnfSxcclxuICAgICAge2xpbmtSZWY6ICd1cmwnLCBwYXJ0aWNsZVRleHQ6ICdHUk9VUCBPTkUgTElOSyBUV08nfVxyXG4gICAgXVxyXG4gIH1cclxuXVxyXG5cclxubGV0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdXHJcbmxldCBjYW52YXMxID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2NhbnZhcycpWzBdXHJcbmxldCBjdHgxID0gY2FudmFzMS5nZXRDb250ZXh0KCcyZCcpXHJcbmNvbnN0IE5BVl9UT1BJQ19FTEVNRU5UID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdmlnYXRvck5hdlRvcGljcycpXHJcbmxldCBuYXZHb1RvQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdmlnYXRvckRlc2MnKS8vZGV2XHJcbmxldCBmcmFtZUlkXHJcbmxldCBjYW52YXNXaWR0aFxyXG5sZXQgY2FudmFzSGVpZ2h0XHJcbmxldCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCA9IFtdLy9jb29yZHMgaW4gcGl4ZWxzLCByZWNhbGN1bGF0ZWQgb24gcmVzaXplXHJcbmxldCBob2xkUGF0dGVyblBhcnRpY2xlcyA9IFtdXHJcbmxldCBjaGFyUGF0dGVyblBhcnRpY2xlcyA9IFtdXHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FVkVOVFNcclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdClcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGluaXQpXHJcbi8vbmF2R29Ub0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZvcm1OZXdQYXJ0aWNsZVdvcmQsIGZhbHNlKS8vZGV2XHJcbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYXZpZ2F0b3JVcCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2Fyb3VzZWxVcClcclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdmlnYXRvckRvd24nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhcm91c2VsRG93bilcclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdmlnYXRvckxlZnQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhcm91c2VsTGVmdClcclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdmlnYXRvclJpZ2h0JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYXJvdXNlbFJpZ2h0KVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1GTE9XIENPTlRST0wgJiBJTklUSUFMSVpFUlNcclxuZnVuY3Rpb24gaW5pdCgpIHtcclxuICByZXNldCgpXHJcbiAgc2V0TGF5b3V0KClcclxuICBOQVZfVE9QSUNfRUxFTUVOVC5pbm5lckhUTUwgPSBjYXJvdXNlbDJkLmdldE5hdlRvcGljVGV4dCgpXHJcbiAgY2FsY0hvbGRQYXR0ZXJuV2F5cG9pbnRDb29yZHMoKVxyXG4gIGluaXRIb2xkUGF0dGVyblBhcnRpY2xlcyhUT1RBTF9QQVJUSUNMRVMpXHJcbiAgYW5pbWF0ZSgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiByZXNldCgpIHtcclxuICBjYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZUlkKVxyXG4gIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsLmxlbmd0aCA9IDBcclxuICBob2xkUGF0dGVyblBhcnRpY2xlcy5sZW5ndGggPSAwXHJcbiAgY2hhclBhdHRlcm5QYXJ0aWNsZXMubGVuZ3RoID0gMFxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY2FsY0hvbGRQYXR0ZXJuV2F5cG9pbnRDb29yZHMoKSB7XHJcbiAgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwgPSBIT0xEX1BBVFRFUk5fV0FZUE9JTlRTLm1hcChlbCA9PiB7XHJcbiAgICByZXR1cm4ge3g6IGVsLnggKiBjYW52YXNXaWR0aCwgeTogZWwueSAqIGNhbnZhc0hlaWdodH1cclxuICB9KVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gaW5pdEhvbGRQYXR0ZXJuUGFydGljbGVzKG5QYXJ0aWNsZXMpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgblBhcnRpY2xlczsgaSsrKSB7XHJcbiAgICBsZXQgZnJvbVdQID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNilcclxuICAgIGxldCBuZXh0V1AgPSBmcm9tV1AgKyAxID09PSBIT0xEX1BBVFRFUk5fV0FZUE9JTlRTLmxlbmd0aCA/IDAgOiBmcm9tV1AgKyAxXHJcbiAgICBsZXQgZGlzdE1vdmVkID0gTWF0aC5yb3VuZCggTWF0aC5yYW5kb20oKSAqIDEwICkgLyAxMFxyXG4gICAgbGV0IHN0YXJ0Q29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbZnJvbVdQXSlcclxuICAgIGxldCBlbmRDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFtuZXh0V1BdKVxyXG4gICAgbGV0IGNwMUNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhzdGFydENvb3JkcywgZW5kQ29vcmRzKVxyXG4gICAgbGV0IGNwMkNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhzdGFydENvb3JkcywgZW5kQ29vcmRzKVxyXG4gICAgbGV0IGNvb3JkcyA9IHtcclxuICAgICAgeDogc3RhcnRDb29yZHMueCwgeTogc3RhcnRDb29yZHMueSxcclxuICAgICAgeDA6IHN0YXJ0Q29vcmRzLngsIHkwOiBzdGFydENvb3Jkcy55LFxyXG4gICAgICB4MTogZW5kQ29vcmRzLngsIHkxOiBlbmRDb29yZHMueSxcclxuICAgICAgY3AxeDogY3AxQ29vcmRzLngsIGNwMXk6IGNwMUNvb3Jkcy55LFxyXG4gICAgICBjcDJ4OiBjcDJDb29yZHMueCwgY3AyeTogY3AyQ29vcmRzLnlcclxuICAgIH1cclxuXHJcbiAgICBob2xkUGF0dGVyblBhcnRpY2xlcy5wdXNoKCBuZXcgSG9sZFBhdHRlcm5QYXJ0aWNsZShjb29yZHMsIEhPTERfU1BFRUQsIGRpc3RNb3ZlZCwgbmV4dFdQKSApXHJcbiAgfVxyXG4gIGNvbnNvbGUubG9nKGhvbGRQYXR0ZXJuUGFydGljbGVzWzBdKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZm9ybU5ld1BhcnRpY2xlV29yZCgpIHtcclxuICBjYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZUlkKS8vbm90IHN1cmUgaWYgbmVlZGVkXHJcbiAgY2hhclRvSG9sZFRyYW5zaXRpb24oKVxyXG4gIGhvbGRUb0NoYXJUcmFuc2l0aW9uKClcclxuICBhbmltYXRlKCkvL25vdCBzdXJlIGlmIG5lZWRlZFxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQ0FST1VTRUwgQ09OVFJPTFNcclxuZnVuY3Rpb24gY2Fyb3VzZWxVcCgpIHtcclxuICBjYXJvdXNlbDJkLnVwKClcclxuICBDSEFSX1BBVFRFUk5fV09SRFMgPSBjYXJvdXNlbDJkLmdldE5hdkl0ZW1UZXh0KClcclxuICBOQVZfVE9QSUNfRUxFTUVOVC5pbm5lckhUTUwgPSBjYXJvdXNlbDJkLmdldE5hdlRvcGljVGV4dCgpXHJcbiAgZm9ybU5ld1BhcnRpY2xlV29yZCgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjYXJvdXNlbERvd24oKSB7XHJcbiAgY2Fyb3VzZWwyZC5kb3duKClcclxuICBDSEFSX1BBVFRFUk5fV09SRFMgPSBjYXJvdXNlbDJkLmdldE5hdkl0ZW1UZXh0KClcclxuICBOQVZfVE9QSUNfRUxFTUVOVC5pbm5lckhUTUwgPSBjYXJvdXNlbDJkLmdldE5hdlRvcGljVGV4dCgpXHJcbiAgZm9ybU5ld1BhcnRpY2xlV29yZCgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjYXJvdXNlbExlZnQoKSB7XHJcbiAgY2Fyb3VzZWwyZC5sZWZ0KClcclxuICBDSEFSX1BBVFRFUk5fV09SRFMgPSBjYXJvdXNlbDJkLmdldE5hdkl0ZW1UZXh0KClcclxuICBOQVZfVE9QSUNfRUxFTUVOVC5pbm5lckhUTUwgPSBjYXJvdXNlbDJkLmdldE5hdlRvcGljVGV4dCgpXHJcbiAgZm9ybU5ld1BhcnRpY2xlV29yZCgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjYXJvdXNlbFJpZ2h0KCkge1xyXG4gIGNhcm91c2VsMmQucmlnaHQoKVxyXG4gIENIQVJfUEFUVEVSTl9XT1JEUyA9IGNhcm91c2VsMmQuZ2V0TmF2SXRlbVRleHQoKVxyXG4gIE5BVl9UT1BJQ19FTEVNRU5ULmlubmVySFRNTCA9IGNhcm91c2VsMmQuZ2V0TmF2VG9waWNUZXh0KClcclxuICBmb3JtTmV3UGFydGljbGVXb3JkKClcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tVFJBTlNJVElPTiBQQVJUSUNMRVMgQkVUV0VFTiBCRUhBVklPVVIgVFlQRVNcclxuZnVuY3Rpb24gaG9sZFRvQ2hhclRyYW5zaXRpb24oKSB7XHJcbiAgbGV0IHJlcXVpcmVkUGFydGljbGVzID0gbGV0dGVyc0xpYi50b3RhbFJlcXVpcmVkUGFydGljbGVzKENIQVJfUEFUVEVSTl9XT1JEUylcclxuICBsZXQgd29yZHNJblJvd3MgPSBsZXR0ZXJzTGliLnBsYWNlV29yZHNJblJvd3MoQ0hBUl9QQVRURVJOX1dPUkRTLCBNQVhfQ0hBUlNfUEVSX1JPVylcclxuICBsZXQgZGVzdGluYXRpb25zQW5kVGFyZ2V0cyA9IGxldHRlcnNMaWIuY2FsY0xldHRlclBhcnRpY2xlc0Rlc3RBbmRUYXJnZXRzKHdvcmRzSW5Sb3dzLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KVxyXG5cclxuICBpZiAoaG9sZFBhdHRlcm5QYXJ0aWNsZXMubGVuZ3RoID4gcmVxdWlyZWRQYXJ0aWNsZXMpIHtcclxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCByZXF1aXJlZFBhcnRpY2xlczsgaSsrKSB7XHJcbiAgICAgIGxldCB0cmFuc2ZlcnJpbmdQYXJ0aWNsZSA9IGhvbGRQYXR0ZXJuUGFydGljbGVzLnBvcCgpXHJcbiAgICAgIGxldCBjb29yZHMgPSB7XHJcbiAgICAgICAgeDogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLngsXHJcbiAgICAgICAgeTogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLnksXHJcbiAgICAgICAgeDA6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy54LFxyXG4gICAgICAgIHkwOiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueSxcclxuICAgICAgICB4MTogZGVzdGluYXRpb25zQW5kVGFyZ2V0c1tpXS54MSxcclxuICAgICAgICB5MTogZGVzdGluYXRpb25zQW5kVGFyZ2V0c1tpXS55MVxyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgc3BlZWQgPSBIT0xEX1NQRUVEICogNFxyXG4gICAgICBsZXQgZGlzdE1vdmVkID0gMFxyXG4gICAgICBsZXQgcG9pbnRzQXQgPSBkZXN0aW5hdGlvbnNBbmRUYXJnZXRzW2ldLnBvaW50c0F0XHJcbiAgICAgIGNoYXJQYXR0ZXJuUGFydGljbGVzLnB1c2gobmV3IENoYXJQYXR0ZXJuUGFydGljbGUoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkLCBwb2ludHNBdCkpXHJcbiAgICB9XHJcblxyXG4gIH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNoYXJUb0hvbGRUcmFuc2l0aW9uKCkge1xyXG4gIHdoaWxlKGNoYXJQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA+IDApIHtcclxuICAgIGxldCB0cmFuc2ZlcnJpbmdQYXJ0aWNsZSA9IGNoYXJQYXR0ZXJuUGFydGljbGVzLnBvcCgpXHJcbiAgICBsZXQgZGlzdE1vdmVkID0gMFxyXG4gICAgbGV0IHNwZWVkID0gIE1hdGgucm91bmQoIChNYXRoLnJhbmRvbSgpICogKEhPTERfU1BFRUQgKiAxMCAtIEhPTERfU1BFRUQpICsgSE9MRF9TUEVFRCkgKiAxMDAwICkgLyAxMDAwXHJcbiAgICBsZXQgZnJvbVdQID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNilcclxuICAgIGxldCBuZXh0V1AgPSBmcm9tV1AgKyAxID09PSBIT0xEX1BBVFRFUk5fV0FZUE9JTlRTLmxlbmd0aCA/IDAgOiBmcm9tV1AgKyAxXHJcbiAgICBsZXQgc3RhcnRDb29yZHMgPSB7eDogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLngsIHk6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy55fVxyXG4gICAgbGV0IGVuZENvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50TmVhclBvaW50KGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsW25leHRXUF0pXHJcbiAgICBsZXQgY3AxQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHN0YXJ0Q29vcmRzLCBlbmRDb29yZHMpXHJcbiAgICBsZXQgY3AyQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKHN0YXJ0Q29vcmRzLCBlbmRDb29yZHMpXHJcbiAgICBsZXQgY29vcmRzID0ge1xyXG4gICAgICB4OiBzdGFydENvb3Jkcy54LFxyXG4gICAgICB5OiBzdGFydENvb3Jkcy55LFxyXG4gICAgICB4MDogc3RhcnRDb29yZHMueCxcclxuICAgICAgeTA6IHN0YXJ0Q29vcmRzLnksXHJcbiAgICAgIHgxOiBlbmRDb29yZHMueCxcclxuICAgICAgeTE6IGVuZENvb3Jkcy55LFxyXG4gICAgICBjcDF4OiBjcDFDb29yZHMueCxcclxuICAgICAgY3AxeTogY3AxQ29vcmRzLnksXHJcbiAgICAgIGNwMng6IGNwMkNvb3Jkcy54LFxyXG4gICAgICBjcDJ5OiBjcDJDb29yZHMueVxyXG4gICAgfVxyXG5cclxuICAgIGhvbGRQYXR0ZXJuUGFydGljbGVzLnVuc2hpZnQobmV3IEhvbGRQYXR0ZXJuUGFydGljbGUoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkLCBuZXh0V1ApKVxyXG4gIH1cclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1VUERBVEUgUEFSVElDTEUgUE9TSVRJT05TICYgUkVOREVSXHJcbmZ1bmN0aW9uIGFuaW1hdGUoKSB7XHJcbiAgZnJhbWVJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKVxyXG4gIGN0eDEuY2xlYXJSZWN0KDAsIDAsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpXHJcbiAgLy9jYW52YXNIZWxwZXJzLnJlbmRlckJvdW5kaW5nQ2lyY2xlKGN0eDEsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpLy9kZXZcclxuICAvL2NhbnZhc0hlbHBlcnMucmVuZGVySG9sZFBhdHRlcm5XUHMoY3R4MSwgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwpLy9kZXZcclxuICAvL2NhbnZhc0hlbHBlcnMucmVuZGVySG9sZFBhdHRlcm5QYXJ0aWNsZVBhdGhzKGN0eDEsIGhvbGRQYXR0ZXJuUGFydGljbGVzKS8vZGV2XHJcbiAgdXBkYXRlSG9sZFBhdHRlcm5QYXJ0aWNsZXMoKVxyXG4gIHVwZGF0ZUNoYXJQYXR0ZXJuUGFydGljbGVzKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHVwZGF0ZUhvbGRQYXR0ZXJuUGFydGljbGVzKCkge1xyXG4gIGhvbGRQYXR0ZXJuUGFydGljbGVzLmZvckVhY2gocGFydGljbGUgPT4ge1xyXG4gICAgcGFydGljbGUudXBkYXRlUG9zKEhPTERfUEFUVEVSTl9XQVlQT0lOVFMsIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsLCBIT0xEX1NQRUVEKVxyXG4gICAgcGFydGljbGUuZHJhdyhjdHgxLCAnd2hpdGUnKVxyXG4gIH0pXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiB1cGRhdGVDaGFyUGF0dGVyblBhcnRpY2xlcygpIHtcclxuICBjaGFyUGF0dGVyblBhcnRpY2xlcy5mb3JFYWNoKChwYXJ0aWNsZSwgaW5kZXgpID0+IHtcclxuICAgIHBhcnRpY2xlLnVwZGF0ZVBvcygpXHJcbiAgICBwYXJ0aWNsZS5kcmF3KGN0eDEsICd3aGl0ZScsICdyZWQnKVxyXG4gICAgcGFydGljbGUuZHJhd1RvUG9pbnRzQXQoY3R4MSwgY2hhclBhdHRlcm5QYXJ0aWNsZXMsIGluZGV4LCAnIzFmMjYzMycsICcjZmYwMDAwJylcclxuICB9KVxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUxBWU9VVCBCUkVBSyBQT0lOVFNcclxuZnVuY3Rpb24gc2V0TGF5b3V0KCkge1xyXG4gIC8vc21hbGwgd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC41XHJcbiAgfVxyXG4gIC8vc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcbiAgLy9tZWRpdW0gd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gMTAyNCAmJiBib2R5LmNsaWVudFdpZHRoID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuN1xyXG4gIH1cclxuICAvL21lZGl1bSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA8PSAxMDI0ICYmIGJvZHkuY2xpZW50SGVpZ2h0ID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjY1XHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuICAvL2xhcmdlIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoID4gMTAyNCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbGFyZ2Ugd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNjVcclxuICB9XHJcbiAgLy9sYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcblxyXG4gIGNhbnZhczEud2lkdGggPSBjYW52YXNXaWR0aFxyXG4gIGNhbnZhczEuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0XHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tUEFSVElDTEUgQ0xBU1NFU1xyXG4iLCIvLyBEYWxlJ3MgdXNlcm5hbWU6IGRha2VibFxyXG5cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLU1JU0MgSEVMUEVSU1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1NQVRIIEhFTFBFUlNcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1HRU9NRVRSWSBIRUxQRVJTXHJcbmZ1bmN0aW9uIHJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMocDEsIHAyKSB7XHJcbiAgY29uc3QgTUlOX0RJU1QgPSA0MFxyXG4gIGNvbnN0IERJU1RfTU9EID0gMC41XHJcbiAgY29uc3QgQU5HTEVfV0lUSElOID0gTWF0aC5QSVxyXG4gIGxldCBhID0gcDIueCAtIHAxLnhcclxuICBsZXQgYiA9IHAyLnkgLSBwMS55XHJcbiAgbGV0IHAxUDJEaXN0ID0gTWF0aC5zcXJ0KGEqYSArIGIqYilcclxuICBsZXQgcmFuZERpc3QgPSAoTWF0aC5yYW5kb20oKSAqIHAxUDJEaXN0ICogRElTVF9NT0QpICsgTUlOX0RJU1RcclxuICBsZXQgYW5nbGVNb2QgPSAoTWF0aC5yYW5kb20oKSAqIEFOR0xFX1dJVEhJTikgLSAoQU5HTEVfV0lUSElOIC8gMilcclxuICBsZXQgcmFuZEFuZ2xlXHJcbiAgbGV0IGNvb3JkcyA9IHt4OiBudWxsLCB5OiBudWxsfVxyXG5cclxuICBpZihNYXRoLnJhbmRvbSgpID49IDAuNSkge1xyXG4gICAgcmFuZEFuZ2xlID0gTWF0aC5hdGFuMihwMi55IC0gcDEueSwgcDEueCAtIHAyLngpICsgYW5nbGVNb2RcclxuICAgIGNvb3Jkcy54ID0gcDIueCArIE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gICAgY29vcmRzLnkgPSBwMi55IC0gTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgfSBlbHNlIHtcclxuICAgIHJhbmRBbmdsZSA9IE1hdGguYXRhbjIocDEueSAtIHAyLnksIHAyLnggLSBwMS54KSArIGFuZ2xlTW9kXHJcbiAgICBjb29yZHMueCA9IHAxLnggKyBNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICAgIGNvb3Jkcy55ID0gcDEueSAtIE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGNvb3Jkc1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmFuZFBvaW50TmVhclBvaW50KHB0KSB7XHJcbiAgY29uc3QgTUFYX0ZST00gPSA0MFxyXG4gIGxldCByYW5kRGlzdCA9IE1hdGgucmFuZG9tKCkgKiBNQVhfRlJPTVxyXG4gIGxldCByYW5kQW5nbGUgPSBNYXRoLnJhbmRvbSgpICogTWF0aC5QSSAqIDJcclxuICBsZXQgeCA9IHB0LnggKyBNYXRoLnJvdW5kKE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdClcclxuICBsZXQgeSA9IHB0LnkgKyBNYXRoLnJvdW5kKE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdClcclxuXHJcbiAgcmV0dXJuIHt4OiB4LCB5OiB5fVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY29vcmRzT25TdHJhaWdodExpbmUocGVyY2VudCwgc3RhcnRQdCwgZW5kUHQpIHtcclxuICBsZXQgeFRvdGFsID0gZW5kUHQueCAtIHN0YXJ0UHQueFxyXG4gIGxldCB5VG90YWwgPSBlbmRQdC55IC0gc3RhcnRQdC55XHJcbiAgbGV0IHhEaXN0ID0gcGVyY2VudCAqIHhUb3RhbFxyXG4gIGxldCB5RGlzdCA9IHBlcmNlbnQgKiB5VG90YWxcclxuXHJcbiAgcmV0dXJuIHt4OiBzdGFydFB0LnggKyB4RGlzdCwgeTogc3RhcnRQdC55ICsgeURpc3R9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjb29yZHNPbkN1YmljQmV6aWVyKHBlcmNlbnQsIHN0YXJ0UHQsIGNwMSwgY3AyLCBlbmRQdCkgey8vc3RvbGVuIGZyb20gc3RhY2tvdmVyZmxvd1xyXG4gIGxldCB0MiA9IHBlcmNlbnQgKiBwZXJjZW50XHJcbiAgbGV0IHQzID0gdDIgKiBwZXJjZW50XHJcblxyXG4gIHJldHVybiBzdGFydFB0ICsgKC1zdGFydFB0ICogMyArIHBlcmNlbnQgKiAoMyAqIHN0YXJ0UHQgLSBzdGFydFB0ICogcGVyY2VudCkpICogcGVyY2VudFxyXG4gICsgKDMgKiBjcDEgKyBwZXJjZW50ICogKC02ICogY3AxICsgY3AxICogMyAqIHBlcmNlbnQpKSAqIHBlcmNlbnRcclxuICArIChjcDIgKiAzIC0gY3AyICogMyAqIHBlcmNlbnQpICogdDJcclxuICArIGVuZFB0ICogdDNcclxufVxyXG5cclxuXHJcbi8vLS1GVU5DVElPTlMgVE8gUkVOREVSIFdBWVBPSU5UUywgQ09OVFJPTCBQT0lOVFMsIEVUQyBVU0VEIElOIFBBUlRJQ0xFIENSRUFUSU9OXHJcbi8vTk9UIE5FQ0VTU0FSSUxZIFVTRUQgQlVUIFVTRUZVTCBGT1IgREVCVUdHSU5HXHJcbmZ1bmN0aW9uIHJlbmRlckJvdW5kaW5nQ2lyY2xlKGN0eCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkge1xyXG4gIGxldCBjZW50ZXJYID0gY2FudmFzV2lkdGggLyAyXHJcbiAgbGV0IGNlbnRlclkgPSBjYW52YXNIZWlnaHQgLyAyXHJcbiAgbGV0IHJhZGl1cyA9IGNlbnRlclkgPiBjZW50ZXJYID8gY2VudGVyWCAtIDIgOiBjZW50ZXJZIC0gMlxyXG4gIGxldCBzdGFydEFuZ2xlID0gMFxyXG4gIGxldCBlbmRBbmdsZSA9IDIgKiBNYXRoLlBJXHJcbiAgY3R4LmxpbmVXaWR0aCA9IDFcclxuICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JleSdcclxuICBjdHguYmVnaW5QYXRoKClcclxuICBjdHguYXJjKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiByZW5kZXJIb2xkUGF0dGVybldQcyhjdHgsIHdheXBvaW50cykge1xyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5maWxsU3R5bGUgPSAnYmx1ZSdcclxuICB3YXlwb2ludHMuZm9yRWFjaCh3cCA9PiB7XHJcbiAgICBjdHguZmlsbFJlY3Qod3AueCAtIDQsIHdwLnkgLSA0LCA4LCA4KVxyXG4gIH0pXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiByZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHMoY3R4LCBwYXJ0aWNsZXMpIHtcclxuICBwYXJ0aWNsZXMuZm9yRWFjaChwYXJ0aWNsZSA9PiB7XHJcbiAgICBsZXQgY3AxWCA9IHBhcnRpY2xlLmNvb3Jkcy5jcDF4XHJcbiAgICBsZXQgY3AxWSA9IHBhcnRpY2xlLmNvb3Jkcy5jcDF5XHJcbiAgICBsZXQgY3AyWCA9IHBhcnRpY2xlLmNvb3Jkcy5jcDJ4XHJcbiAgICBsZXQgY3AyWSA9IHBhcnRpY2xlLmNvb3Jkcy5jcDJ5XHJcbiAgICBsZXQgc3RhcnRYID0gcGFydGljbGUuY29vcmRzLngwXHJcbiAgICBsZXQgc3RhcnRZID0gcGFydGljbGUuY29vcmRzLnkwXHJcbiAgICBsZXQgZW5kWCA9IHBhcnRpY2xlLmNvb3Jkcy54MVxyXG4gICAgbGV0IGVuZFkgPSBwYXJ0aWNsZS5jb29yZHMueTFcclxuICAgIGN0eC5saW5lV2lkdGggPSAxXHJcbiAgICAvL3JlbmRlciBzdGFydCBwb2ludFxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JlZW4nXHJcbiAgICBjdHgucmVjdChzdGFydFggLSAyLCBzdGFydFkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBlbmQgcG9pbnRcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZWQnXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5yZWN0KGVuZFggLSAyLCBlbmRZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAxXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICd5ZWxsb3cnXHJcbiAgICBjdHgucmVjdChjcDFYIC0gMiwgY3AxWSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIGNvbnRyb2wgcG9pbnQgMlxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnb3JhbmdlJ1xyXG4gICAgY3R4LnJlY3QoY3AyWCAtIDIsIGNwMlkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBwYXRoXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmV5J1xyXG4gICAgY3R4Lm1vdmVUbyhzdGFydFgsIHN0YXJ0WSlcclxuICAgIGN0eC5iZXppZXJDdXJ2ZVRvKGNwMVgsIGNwMVksIGNwMlgsIGNwMlksIGVuZFgsIGVuZFkpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICB9KVxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUNPTE9SIEhFTFBFUlNcclxuLy93b3VsZCBiZSBtb3JlIGVmZmljaWVudCB0byB0YWtlIGFyZ3MgYXMge3I6IDAtMjU1LCBnOiAwLTI1NSwgYjowLTI1NX1cclxuLy9zbyBubyBuZWVkIHRoZSBoZXggYXJyYXkgc3R1ZmYgYnV0IG9rIGZvciBub3cgYXMgZHJhd2luZ1xyXG4vL2EgZmV3IGh1bmRyZWQgcGFydGljbGVzIHdpdGhvdXQgbGFnXHJcbmZ1bmN0aW9uIGNvbG9yQmV0d2VlblR3b0NvbG9ycyhwZXJjZW50LCBjb2xvck9uZSwgY29sb3JUd28pIHtcclxuICBsZXQgaGV4ID0gWycwJywgJzEnLCAnMicsICczJywgJzQnLCAnNScsICc2JywgJzcnLCAnOCcsICc5JywgJ2EnLCAnYicsICdjJywgJ2QnLCAnZScsICdmJ11cclxuXHJcbiAgLy9jb2xvck9uZVxyXG4gIGxldCBjMVJlZEluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoMSkgKVxyXG4gIGxldCBjMVJlZEluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoMikgKVxyXG4gIGxldCBjMVJlZEJhc2VUZW4gPSAoYzFSZWRJbmRleDAgKiAxNikgKyAoYzFSZWRJbmRleDEpXHJcblxyXG4gIGxldCBjMUdyZWVuSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCgzKSApXHJcbiAgbGV0IGMxR3JlZW5JbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDQpIClcclxuICBsZXQgYzFHcmVlbmRCYXNlVGVuID0gKGMxR3JlZW5JbmRleDAgKiAxNikgKyAoYzFHcmVlbkluZGV4MSlcclxuXHJcbiAgbGV0IGMxQmx1ZUluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoNSkgKVxyXG4gIGxldCBjMUJsdWVJbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDYpIClcclxuICBsZXQgYzFCbHVlQmFzZVRlbiA9IChjMUJsdWVJbmRleDAgKiAxNikgKyAoYzFCbHVlSW5kZXgxKVxyXG5cclxuICAvL2NvbG9yVHdvXHJcbiAgbGV0IGMyUmVkSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCgxKSApXHJcbiAgbGV0IGMyUmVkSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCgyKSApXHJcbiAgbGV0IGMyUmVkQmFzZVRlbiA9IChjMlJlZEluZGV4MCAqIDE2KSArIChjMlJlZEluZGV4MSlcclxuXHJcbiAgbGV0IGMyR3JlZW5JbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDMpIClcclxuICBsZXQgYzJHcmVlbkluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoNCkgKVxyXG4gIGxldCBjMkdyZWVuZEJhc2VUZW4gPSAoYzJHcmVlbkluZGV4MCAqIDE2KSArIChjMkdyZWVuSW5kZXgxKVxyXG5cclxuICBsZXQgYzJCbHVlSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCg1KSApXHJcbiAgbGV0IGMyQmx1ZUluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoNikgKVxyXG4gIGxldCBjMkJsdWVCYXNlVGVuID0gKGMyQmx1ZUluZGV4MCAqIDE2KSArIChjMkJsdWVJbmRleDEpXHJcblxyXG4gIGxldCByZWREZWx0YSA9IGMyUmVkQmFzZVRlbiAtIGMxUmVkQmFzZVRlblxyXG4gIGxldCBncmVlbkRlbHRhID0gYzJHcmVlbmRCYXNlVGVuIC0gYzFHcmVlbmRCYXNlVGVuXHJcbiAgbGV0IGJsdWVEZWx0YSA9IGMyQmx1ZUJhc2VUZW4gLSBjMUJsdWVCYXNlVGVuXHJcblxyXG4gIGxldCByZWROb3cgPSBNYXRoLnJvdW5kKCBjMVJlZEJhc2VUZW4gKyAocmVkRGVsdGEgKiBwZXJjZW50KSApXHJcbiAgbGV0IGdyZWVuTm93ID0gTWF0aC5yb3VuZCggYzFHcmVlbmRCYXNlVGVuICsgKGdyZWVuRGVsdGEgKiBwZXJjZW50KSApXHJcbiAgbGV0IGJsdWVOb3cgPSBNYXRoLnJvdW5kKCBjMUJsdWVCYXNlVGVuICsgKGJsdWVEZWx0YSAqIHBlcmNlbnQpIClcclxuXHJcbiAgcmV0dXJuIHtyOiByZWROb3csIGc6IGdyZWVuTm93LCBiOiBibHVlTm93fS8vdGVtcFxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVYUE9SVFNcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgcmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyxcclxuICByYW5kUG9pbnROZWFyUG9pbnQsXHJcbiAgY29vcmRzT25TdHJhaWdodExpbmUsXHJcbiAgY29vcmRzT25DdWJpY0JlemllcixcclxuICBjb2xvckJldHdlZW5Ud29Db2xvcnMsXHJcbiAgLy9kZXZcclxuICByZW5kZXJCb3VuZGluZ0NpcmNsZSxcclxuICByZW5kZXJIb2xkUGF0dGVybldQcyxcclxuICByZW5kZXJIb2xkUGF0dGVyblBhcnRpY2xlUGF0aHNcclxufVxyXG4iLCJjb25zdCBDQVJPVVNFTF9EQVRBID0gW1xyXG4gIHt0ZXh0OiAnIFRQT0lDIFpFUk8nLCBiZ0NvbG9yOiAncmVkJywgbmF2SXRlbXM6IFtcclxuICAgIHt0ZXh0OiAnbmF2IGxpbmsgemVybyBhJywgYmdDb2xvcjogJ3JlZCd9LFxyXG4gICAge3RleHQ6ICduYXYgbGluayB6ZXJvIGInLCBiZ0NvbG9yOiAnZ3JlZW4nfSxcclxuICAgIHt0ZXh0OiAnbmF2IGxpbmsgemVybyBjJywgYmdDb2xvcjogJ2JsdWUnfSxcclxuICAgIHt0ZXh0OiAnbmF2IGxpbmsgemVybyBkJywgYmdDb2xvcjogJ29yYW5nZSd9LFxyXG4gICAge3RleHQ6ICduYXYgbGluayB6ZXJvIGUnLCBiZ0NvbG9yOiAncHVycGxlJ31cclxuICBdfSxcclxuICB7dGV4dDogJ1RPUElDIE9ORScsIGJnQ29sb3I6ICdncmVlbicsIG5hdkl0ZW1zOiBbXHJcbiAgICB7dGV4dDogJ25hdiBsaW5rIG9uZSBhJywgYmdDb2xvcjogJ3JlZCd9LFxyXG4gICAge3RleHQ6ICduYXYgbGluayBvbmUgYicsIGJnQ29sb3I6ICdncmVlbid9LFxyXG4gICAge3RleHQ6ICduYXYgbGluayBvbmUgYycsIGJnQ29sb3I6ICdibHVlJ30sXHJcbiAgICB7dGV4dDogJ25hdiBsaW5rIG9uZSBkJywgYmdDb2xvcjogJ29yYW5nZSd9LFxyXG4gICAge3RleHQ6ICduYXYgbGluayBvbmUgZScsIGJnQ29sb3I6ICdwdXJwbGUnfVxyXG4gIF19LFxyXG4gIHt0ZXh0OiAnVE9QSUMgVFdPJywgYmdDb2xvcjogJ2JsdWUnLCBuYXZJdGVtczogW1xyXG4gICAge3RleHQ6ICduYXYgbGluayB0d28gYScsIGJnQ29sb3I6ICdyZWQnfSxcclxuICAgIHt0ZXh0OiAnbmF2IGxpbmsgdHdvIGInLCBiZ0NvbG9yOiAnZ3JlZW4nfSxcclxuICAgIHt0ZXh0OiAnbmF2IGxpbmsgdHdvIGMnLCBiZ0NvbG9yOiAnYmx1ZSd9LFxyXG4gICAge3RleHQ6ICduYXYgbGluayB0d28gZCcsIGJnQ29sb3I6ICdvcmFuZ2UnfSxcclxuICAgIHt0ZXh0OiAnbmF2IGxpbmsgdHdvIGUnLCBiZ0NvbG9yOiAncHVycGxlJ31cclxuICBdfSxcclxuICB7dGV4dDogJ1RPUElDIFRIUkVFJywgYmdDb2xvcjogJ29yYW5nZScsIG5hdkl0ZW1zOiBbXHJcbiAgICB7dGV4dDogJ25hdiBsaW5rIHRocmVlIGEnLCBiZ0NvbG9yOiAncmVkJ30sXHJcbiAgICB7dGV4dDogJ25hdiBsaW5rIHRocmVlIGInLCBiZ0NvbG9yOiAnZ3JlZW4nfSxcclxuICAgIHt0ZXh0OiAnbmF2IGxpbmsgdGhyZWUgYycsIGJnQ29sb3I6ICdibHVlJ30sXHJcbiAgICB7dGV4dDogJ25hdiBsaW5rIHRocmVlIGQnLCBiZ0NvbG9yOiAnb3JhbmdlJ30sXHJcbiAgICB7dGV4dDogJ25hdiBsaW5rIHRocmVlIGUnLCBiZ0NvbG9yOiAncHVycGxlJ31cclxuICBdfSxcclxuICB7dGV4dDogJ1RPUElDIEZPVVInLCBiZ0NvbG9yOiAncHVycGxlJywgbmF2SXRlbXM6IFtcclxuICAgIHt0ZXh0OiAnbmF2IGxpbmsgZm91ciBhJywgYmdDb2xvcjogJ3JlZCd9LFxyXG4gICAge3RleHQ6ICduYXYgbGluayBmb3VyIGInLCBiZ0NvbG9yOiAnZ3JlZW4nfSxcclxuICAgIHt0ZXh0OiAnbmF2IGxpbmsgZm91ciBjJywgYmdDb2xvcjogJ2JsdWUnfSxcclxuICAgIHt0ZXh0OiAnbmF2IGxpbmsgZm91ciBkJywgYmdDb2xvcjogJ29yYW5nZSd9LFxyXG4gICAge3RleHQ6ICduYXYgbGluayBmb3VyIGUnLCBiZ0NvbG9yOiAncHVycGxlJ31cclxuICBdfSxcclxuICB7dGV4dDogJ1RPUElDIEZJVkUnLCBiZ0NvbG9yOiAnd2hpdGUnLCBuYXZJdGVtczogW1xyXG4gICAge3RleHQ6ICduYXYgbGluayBmaXZlIGEnLCBiZ0NvbG9yOiAnYmxhY2snfSxcclxuICAgIHt0ZXh0OiAnbmF2IGxpbmsgZml2ZSBiJywgYmdDb2xvcjogJ3doaXRlJ30sXHJcbiAgICB7dGV4dDogJ25hdiBsaW5rIGZpdmUgYycsIGJnQ29sb3I6ICdibGFjayd9LFxyXG4gICAge3RleHQ6ICduYXYgbGluayBmaXZlIGQnLCBiZ0NvbG9yOiAnd2hpdGUnfSxcclxuICAgIHt0ZXh0OiAnbmF2IGxpbmsgZml2ZSBlJywgYmdDb2xvcjogJ2JsYWNrJ30sXHJcbiAgICB7dGV4dDogJ25hdiBsaW5rIGZpdmUgZicsIGJnQ29sb3I6ICdyZWQnfVxyXG4gIF19XHJcbl1cclxuY29uc3QgQ0FST1VTRUxfQ09MUyA9IDVcclxuY29uc3QgQ0FST1VTRUxfUk9XUyA9IDVcclxuY29uc3QgQ0VOVEVSX0NPTCA9IDJcclxuY29uc3QgQ0VOVEVSX1JPVyA9IDJcclxuXHJcbmxldCBjYXJvdXNlbENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYXZpZ2F0b3JOYXZJdGVtcycpLy9tdXN0IGJlIG1hdGNoZWQgdG8gY2Fyb3VzZWwgY29udGFpbmVyIGVsZW1lbnRcclxubGV0IGNhcm91c2VsVmlzaWJsZUl0ZW1zXHJcbmxldCBzZWxlY3RlZENvbCA9IDBcclxubGV0IHNlbGVjdGVkUm93SW5Db2xzID0gW11cclxubGV0IGNhcm91c2VsRWxlbWVudHMgPSBbXVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLU1BTkFHRVJTXHJcbi8vaW5pdGlhbGl6ZVxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgQ0FST1VTRUxfREFUQS5sZW5ndGg7IGkrKykge1xyXG4gICAgc2VsZWN0ZWRSb3dJbkNvbHMucHVzaCgwKVxyXG4gIH1cclxuXHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IENBUk9VU0VMX0NPTFM7IGkrKykge1xyXG4gICAgY2Fyb3VzZWxFbGVtZW50cy5wdXNoKFtdKVxyXG4gICAgZm9yKGxldCBqID0gMDsgaiA8IENBUk9VU0VMX1JPV1M7IGorKykge1xyXG4gICAgICBjYXJvdXNlbEVsZW1lbnRzW2ldLnB1c2goZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLmNhcm91c2VsSXRlbTpudGgtb2YtdHlwZSgkezEgKyBpfW4pIC5uYXZJdGVtYClbal0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZW5kZXIoKVxyXG59KVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxuICByZW1vdmVDYXJvdXNlbENlbGxzKClcclxuICByZW1vdmVDYXJvdXNlbENvbHVtbnMoKVxyXG4gIG1ha2VDYXJvdXNlbENvbHVtbnMoKVxyXG4gIG1ha2VDYXJvdXNlbENlbGxzKClcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxuICBwb3B1bGF0ZUNhcm91c2VsQ29sdW1ucygpXHJcbiAgcG9wdWxhdGVDYXJvdXNlbENlbGxzKClcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGxlZnQoKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IGNhcm91c2VsVmlzaWJsZUl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjYXJvdXNlbFZpc2libGVJdGVtc1tpXS5jbGFzc0xpc3QuYWRkKCdtb3ZlZExlZnQnKVxyXG4gIH1cclxuXHJcbiAgZGVjSG9yaXooKVxyXG4gIHVwZGF0ZUNhcm91c2VsU3RhdGUoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmlnaHQoKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IGNhcm91c2VsVmlzaWJsZUl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjYXJvdXNlbFZpc2libGVJdGVtc1tpXS5jbGFzc0xpc3QuYWRkKCdtb3ZlZFJpZ2h0JylcclxuICB9XHJcblxyXG4gIGluY0hvcml6KClcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHVwKCkge1xyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBjYXJvdXNlbEVsZW1lbnRzW0NFTlRFUl9DT0xdLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjYXJvdXNlbEVsZW1lbnRzW0NFTlRFUl9DT0xdW2ldLmNsYXNzTGlzdC5hZGQoJ21vdmVkVXAnKVxyXG4gIH1cclxuXHJcbiAgaW5jVmVydCgpXHJcbiAgdXBkYXRlQ2Fyb3VzZWxTdGF0ZSgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBkb3duKCkge1xyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBjYXJvdXNlbEVsZW1lbnRzW0NFTlRFUl9DT0xdLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjYXJvdXNlbEVsZW1lbnRzW0NFTlRFUl9DT0xdW2ldLmNsYXNzTGlzdC5hZGQoJ21vdmVkRG93bicpXHJcbiAgfVxyXG5cclxuICBkZWNWZXJ0KClcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1IRUxQRVJTXHJcbmZ1bmN0aW9uIHJlbW92ZUNhcm91c2VsQ29sdW1ucygpIHtcclxuICB3aGlsZShjYXJvdXNlbENvbnRhaW5lci5maXJzdENoaWxkKSB7XHJcbiAgICBjYXJvdXNlbENvbnRhaW5lci5yZW1vdmVDaGlsZChjYXJvdXNlbENvbnRhaW5lci5maXJzdENoaWxkKVxyXG4gIH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlbW92ZUNhcm91c2VsQ2VsbHMoKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IGNhcm91c2VsVmlzaWJsZUl0ZW1zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICB3aGlsZShjYXJvdXNlbFZpc2libGVJdGVtc1tpXS5maXJzdENoaWxkKSB7XHJcbiAgICAgIGNhcm91c2VsVmlzaWJsZUl0ZW1zW2ldLnJlbW92ZUNoaWxkKGNhcm91c2VsVmlzaWJsZUl0ZW1zW2ldLmZpcnN0Q2hpbGQpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gbWFrZUNhcm91c2VsQ29sdW1ucygpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgQ0FST1VTRUxfQ09MUzsgaSsrKSB7XHJcbiAgICBsZXQgbmV3RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICBuZXdFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2Nhcm91c2VsSXRlbScpXHJcbiAgICBuZXdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCByZW5kZXIpXHJcbiAgICBjYXJvdXNlbENvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdFbGVtZW50KVxyXG4gIH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIG1ha2VDYXJvdXNlbENlbGxzKCkge1xyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBDQVJPVVNFTF9DT0xTOyBpKyspIHtcclxuICAgIGZvcihsZXQgaiA9IDA7IGogPCBDQVJPVVNFTF9ST1dTOyBqKyspIHtcclxuICAgICAgbGV0IG5ld0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICBuZXdFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ25hdkl0ZW0nKVxyXG4gICAgICBuZXdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCByZW5kZXIpXHJcbiAgICAgIGNhcm91c2VsVmlzaWJsZUl0ZW1zW2pdLmFwcGVuZENoaWxkKG5ld0VsZW1lbnQpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQ2Fyb3VzZWxTdGF0ZSgpIHtcclxuICBjYXJvdXNlbFZpc2libGVJdGVtcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsSXRlbScpXHJcblxyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBDQVJPVVNFTF9DT0xTOyBpKyspIHtcclxuICAgIGZvcihsZXQgaiA9IDA7IGogPCBDQVJPVVNFTF9ST1dTOyBqKyspIHtcclxuICAgICAgY2Fyb3VzZWxFbGVtZW50c1tpXVtqXSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC5jYXJvdXNlbEl0ZW06bnRoLW9mLXR5cGUoJHsxICsgaX1uKSAubmF2SXRlbWApW2pdXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gaW5jSG9yaXooKSB7XHJcbiAgc2VsZWN0ZWRDb2wgPSBzZWxlY3RlZENvbCA9PT0gQ0FST1VTRUxfREFUQS5sZW5ndGggLSAxID8gMCA6IHNlbGVjdGVkQ29sICsgMVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZGVjSG9yaXooKSB7XHJcbiAgc2VsZWN0ZWRDb2wgPSBzZWxlY3RlZENvbCA9PT0gMCA/IENBUk9VU0VMX0RBVEEubGVuZ3RoIC0gMSA6IHNlbGVjdGVkQ29sIC0gMVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gaW5jVmVydCgpIHtcclxuICBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gPSBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gPT09IENBUk9VU0VMX0RBVEFbc2VsZWN0ZWRDb2xdLm5hdkl0ZW1zLmxlbmd0aCAtIDEgPyAwIDogc2VsZWN0ZWRSb3dJbkNvbHNbc2VsZWN0ZWRDb2xdICsgMVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZGVjVmVydCgpIHtcclxuICBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gPSBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gPT09IDAgPyBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS5uYXZJdGVtcy5sZW5ndGggLSAxIDogc2VsZWN0ZWRSb3dJbkNvbHNbc2VsZWN0ZWRDb2xdIC0gMVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcG9wdWxhdGVDYXJvdXNlbENvbHVtbnMoKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IENBUk9VU0VMX0NPTFM7IGkrKykge1xyXG4gICAgbGV0IHggPSBzZWxlY3RlZENvbCArIGkgKyBDQVJPVVNFTF9EQVRBLmxlbmd0aCAtIDJcclxuICAgIHdoaWxlKHggPj0gQ0FST1VTRUxfREFUQS5sZW5ndGgpIHt4ID0geCAtIENBUk9VU0VMX0RBVEEubGVuZ3RofVxyXG5cclxuICAgIC8vY2Fyb3VzZWxWaXNpYmxlSXRlbXNbQ0FST1VTRUxfQ09MUyAtIDEgLSBpXS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBDQVJPVVNFTF9EQVRBW3hdLmJnQ29sb3JcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBvcHVsYXRlQ2Fyb3VzZWxDZWxscygpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgQ0FST1VTRUxfQ09MUzsgaSsrKSB7XHJcbiAgICBsZXQgeCA9IHNlbGVjdGVkQ29sICsgaSArIENBUk9VU0VMX0RBVEEubGVuZ3RoIC0gMlxyXG4gICAgd2hpbGUoeCA+PSBDQVJPVVNFTF9EQVRBLmxlbmd0aCkge3ggPSB4IC0gQ0FST1VTRUxfREFUQS5sZW5ndGh9XHJcblxyXG4gICAgZm9yKGxldCBqID0gMDsgaiA8IENBUk9VU0VMX1JPV1M7IGorKykge1xyXG4gICAgICBsZXQgeSA9IHNlbGVjdGVkUm93SW5Db2xzW3hdICsgalxyXG4gICAgICB3aGlsZSh5ID49IENBUk9VU0VMX0RBVEFbeF0ubmF2SXRlbXMubGVuZ3RoKSB7eSA9IHkgLSBDQVJPVVNFTF9EQVRBW3hdLm5hdkl0ZW1zLmxlbmd0aH1cclxuXHJcbiAgICAgIC8vY2Fyb3VzZWxFbGVtZW50c1tDQVJPVVNFTF9DT0xTIC0gMSAtIGldW2pdLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IENBUk9VU0VMX0RBVEFbeF0ubmF2SXRlbXNbeV0uYmdDb2xvclxyXG4gICAgICBjYXJvdXNlbEVsZW1lbnRzW0NBUk9VU0VMX0NPTFMgLSAxIC0gaV1bal0uaW5uZXJIVE1MID0gQ0FST1VTRUxfREFUQVt4XS5uYXZJdGVtc1t5XS50ZXh0XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0TmF2VG9waWNUZXh0KCkge1xyXG4gIHJldHVybiBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS50ZXh0XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBnZXROYXZJdGVtVGV4dCgpIHtcclxuICBsZXQgeSA9IFtzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gKyBDRU5URVJfUk9XXVxyXG4gIHdoaWxlKHkgPj0gQ0FST1VTRUxfREFUQVtzZWxlY3RlZENvbF0ubmF2SXRlbXMubGVuZ3RoKSB7eSA9IHkgLSBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS5uYXZJdGVtcy5sZW5ndGh9XHJcblxyXG4gIHJldHVybiBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS5uYXZJdGVtc1t5XS50ZXh0LnRvVXBwZXJDYXNlKClcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVYUE9SVFNcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgdXAsXHJcbiAgZG93bixcclxuICBsZWZ0LFxyXG4gIHJpZ2h0LFxyXG4gIGdldE5hdlRvcGljVGV4dCxcclxuICBnZXROYXZJdGVtVGV4dFxyXG59XHJcbiIsIi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQ09PUkRTIEFTIFJBVElPIEFORCBWRUNUT1IgUE9JTlQgQVRTXHJcbmxldCBsZXR0ZXJzQ29vcmRzID0ge1xyXG4gIEE6IFtcclxuICAgIHt4OiAwLjEyNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAgLy8xXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0sICAgLy80XHJcbiAgICB7eDogMC44NzUsIHk6IDAuODc1fSAvLzVcclxuICBdLFxyXG4gIEI6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjI1fSwgLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC43NX0gIC8vNFxyXG4gIF0sXHJcbiAgQzogW1xyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjYyNX0sLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4zNzV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSAvLzNcclxuICBdLFxyXG4gIEQ6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sIC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1IH0sLy8xXHJcbiAgICB7eDogMC43NSwgeTogMC4zNzV9LCAvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjYyNX0gIC8vM1xyXG4gIF0sXHJcbiAgRTogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjV9LCAgLy80XHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9IC8vNVxyXG4gIF0sXHJcbiAgRjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjV9ICAgLy80XHJcbiAgXSxcclxuICBHOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNjI1fSwvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjM3NX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNjI1LCB5OiAwLjV9LCAvLzRcclxuICAgIHt4OiAwLjg3NSwgeTogMC41fSAgLy81XHJcbiAgXSxcclxuICBIOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0sICAvLzRcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0gLy81XHJcbiAgXSxcclxuICBJOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuNSwgeTogMC44NzV9LCAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8yXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNSwgeTogMC4xMjV9LCAvLzRcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0gLy81XHJcbiAgXSxcclxuICBKOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC43NX0sXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjUsIHk6IDAuNzV9LFxyXG4gICAge3g6IDAuNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIEs6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9XHJcbiAgXSxcclxuICBMOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIE06IFtcclxuICAgIHt4OiAwLjEyNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjUsIHk6IDAuNzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjg3NSwgeTogMC44NzV9XHJcbiAgXSxcclxuICBOOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9XHJcbiAgXSxcclxuICBPOiBbXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjEyNSwgeTogMC42MjV9LFxyXG4gICAge3g6IDAuMTI1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuNjI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC44NzV9XHJcbiAgXSxcclxuICBQOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4yNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4zNzV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjV9XHJcbiAgXSxcclxuICBROiBbXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjEyNSwgeTogMC42MjV9LFxyXG4gICAge3g6IDAuMTI1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuNjI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjYyNX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuODc1fVxyXG4gIF0sXHJcbiAgUjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMzc1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC41fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX1cclxuICBdLFxyXG4gIFM6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjc1fSwgIC8vMFxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjg3NX0sLy8xXHJcbiAgICB7eDogMC42MjUsIHk6IDAuODc1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjc1fSwgIC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNjI1fSwgLy80XHJcbiAgICB7eDogMC42MjUsIHk6IDAuNX0sICAvLzVcclxuICAgIHt4OiAwLjM3NSwgeTogMC41fSwgIC8vNlxyXG4gICAge3g6IDAuMjUsIHk6IDAuMzc1fSwgLy83XHJcbiAgICB7eDogMC4yNSwgeTogMC4yNX0sICAvLzhcclxuICAgIHt4OiAwLjM3NSwgeTogMC4xMjV9LC8vOVxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sLy8xMFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9ICAgLy8xMVxyXG4gIF0sXHJcbiAgVDogW1xyXG4gICAge3g6IDAuNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIFU6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC43NX0sXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuNzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTIyNX1cclxuICBdLFxyXG4gIFY6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC41LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9XHJcbiAgXSxcclxuICBXOiBbXHJcbiAgICB7eDogMC4xMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjM3NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNSwgeTogMC4yNX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjg3NSwgeTogMC4xMjV9XHJcbiAgXSxcclxuICBYOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9XHJcbiAgXSxcclxuICBZOiBbXHJcbiAgICB7eDogMC41LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC41LCB5OiAwLjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIFo6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX1cclxuICBdLFxyXG4gIFwiIFwiOiBbXS8vZW5hYmxlcyBoYXZpbmcgc3BhY2VzIGJldHdlZW4gbGV0dGVyc1xyXG59XHJcblxyXG5cclxubGV0IGxldHRlcnNWZWN0b3JzID0ge1xyXG4gIEE6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgQjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0yfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtNH1cclxuICBdLFxyXG4gIEM6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgRDogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0zfVxyXG4gIF0sXHJcbiAgRTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC01fVxyXG4gIF0sXHJcbiAgRjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBHOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTV9XHJcbiAgXSxcclxuICBIOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIEk6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgSjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBLOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTN9XHJcbiAgXSxcclxuICBMOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIE06IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgTjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBPOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTd9XHJcbiAgXSxcclxuICBQOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTV9XHJcbiAgXSxcclxuICBROiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTd9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBSOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTV9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0xfVxyXG4gIF0sXHJcbiAgUzogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBUOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIFU6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgVjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBXOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIFg6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgWTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC0yfVxyXG4gIF0sXHJcbiAgWjogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXVxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FWFBPUlRFRCBGVU5DVElPTlNcclxuZnVuY3Rpb24gdG90YWxSZXF1aXJlZFBhcnRpY2xlcyhzdHIpIHtcclxuICBsZXQgcmVxdWlyZWRQYXJ0aWNsZXMgPSAwXHJcblxyXG4gIGZvcihpIGluIHN0cikge1xyXG4gICAgcmVxdWlyZWRQYXJ0aWNsZXMgKz0gbGV0dGVyc0Nvb3Jkc1tzdHIuY2hhckF0KGkpXS5sZW5ndGhcclxuICB9XHJcblxyXG4gIGNvbnNvbGUubG9nKFwidG90YWwgcmVxdWlyZWRQYXJ0aWNsZXM6IFwiICsgcmVxdWlyZWRQYXJ0aWNsZXMpXHJcbiAgcmV0dXJuIHJlcXVpcmVkUGFydGljbGVzXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBwbGFjZVdvcmRzSW5Sb3dzKHN0ciwgbWF4Q2hhcnNJblJvdykge1xyXG4gIGxldCB3b3JkcyA9IHN0ci5zcGxpdChcIiBcIilcclxuICBsZXQgcm93cyA9IFtcIlwiXVxyXG4gIGxldCByb3dzSW5kZXggPSAwXHJcblxyXG4gIHdvcmRzLmZvckVhY2goKHdvcmQsIGluZGV4KSA9PiB7XHJcbiAgICBpZihyb3dzW3Jvd3NJbmRleF0ubGVuZ3RoICsgd29yZC5sZW5ndGggKyAxIDw9IG1heENoYXJzSW5Sb3cpIHtcclxuICAgICAgcm93c1tyb3dzSW5kZXhdID0gaW5kZXggPT09IDAgPyByb3dzW3Jvd3NJbmRleF0gKyB3b3JkIDogcm93c1tyb3dzSW5kZXhdICsgXCIgXCIgKyB3b3JkXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByb3dzLnB1c2god29yZClcclxuICAgICAgcm93c0luZGV4KytcclxuICAgIH1cclxuICB9KVxyXG5cclxuICByZXR1cm4gcm93c1xyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY2FsY0xldHRlclBhcnRpY2xlc0Rlc3RBbmRUYXJnZXRzKHdvcmRzSW5Sb3dzLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KSB7XHJcbiAgbGV0IGNoYXJXaWR0aCA9IE1hdGgucm91bmQoIGNhbnZhc1dpZHRoIC8gKGxvbmdlc3RFbGVtZW50TGVuZ3RoKHdvcmRzSW5Sb3dzKSArIDIpIClcclxuICBsZXQgY2hhckhlaWdodCA9IE1hdGgucm91bmQoY2hhcldpZHRoICogMS4yKVxyXG4gIGxldCB0b3RhbFJvd3NIZWlnaHQgPSBjaGFySGVpZ2h0ICogKHdvcmRzSW5Sb3dzLmxlbmd0aCArIDEpXHJcbiAgbGV0IGZpbmFsQ29vcmRzQW5kUG9pbnRzQXRzID0gW11cclxuXHJcbiAgZm9yKGxldCByb3cgaW4gd29yZHNJblJvd3MpIHtcclxuICAgIGxldCByb3dTdGFydFggPSAoY2FudmFzV2lkdGggLyAyKSAtICh3b3Jkc0luUm93c1tyb3ddLmxlbmd0aCAqIGNoYXJXaWR0aCAvIDIpXHJcbiAgICBsZXQgcm93U3RhcnRZID0gKGNhbnZhc0hlaWdodCAvIDIpIC0gKHRvdGFsUm93c0hlaWdodCAvIDIpICsgKHJvdyAqIGNoYXJIZWlnaHQpXHJcblxyXG4gICAgZm9yKGxldCBsZXR0ZXJQb3MgPSAwOyBsZXR0ZXJQb3MgPCB3b3Jkc0luUm93c1tyb3ddLmxlbmd0aDsgbGV0dGVyUG9zKyspIHtcclxuICAgICAgbGV0IGNoYXJIZXJlID0gd29yZHNJblJvd3Nbcm93XS5jaGFyQXQobGV0dGVyUG9zKVxyXG4gICAgICBsZXQgbkNoYXJQYXJ0aWNsZXMgPSBsZXR0ZXJzQ29vcmRzW2NoYXJIZXJlXS5sZW5ndGhcclxuXHJcbiAgICAgIGZvcihsZXQgcG9zSW5DaGFyID0gMDsgcG9zSW5DaGFyIDwgbkNoYXJQYXJ0aWNsZXM7IHBvc0luQ2hhcisrKSB7XHJcbiAgICAgICAgbGV0IHgxID0gcm93U3RhcnRYICsgKGxldHRlclBvcyAqIGNoYXJXaWR0aCkgKyAoY2hhcldpZHRoICogbGV0dGVyc0Nvb3Jkc1tjaGFySGVyZV1bcG9zSW5DaGFyXS54KVxyXG4gICAgICAgIGxldCB5MSA9IHJvd1N0YXJ0WSArIChjaGFySGVpZ2h0ICogbGV0dGVyc0Nvb3Jkc1tjaGFySGVyZV1bcG9zSW5DaGFyXS55KVxyXG4gICAgICAgIGxldCBwb2ludHNBdCA9IGZhbHNlXHJcblxyXG4gICAgICAgIGlmKGxldHRlcnNWZWN0b3JzW2NoYXJIZXJlXVtwb3NJbkNoYXJdLmhhc1ZlY3RvciA9PT0gdHJ1ZSkge1xyXG4gICAgICAgICAgcG9pbnRzQXQgPSBsZXR0ZXJzVmVjdG9yc1tjaGFySGVyZV1bcG9zSW5DaGFyXS5pbmRleE9mZnNldFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZmluYWxDb29yZHNBbmRQb2ludHNBdHMucHVzaCh7eDE6IHgxLCB5MTogeTEsIHBvaW50c0F0OiBwb2ludHNBdH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBmaW5hbENvb3Jkc0FuZFBvaW50c0F0c1xyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1JTlRFUk5BTCBGVU5DVElPTlNcclxuZnVuY3Rpb24gbG9uZ2VzdEVsZW1lbnRMZW5ndGgoYXJyKSB7XHJcbiAgbGV0IGxlbmd0aCA9IDBcclxuICBhcnIuZm9yRWFjaChlbCA9PiB7XHJcbiAgICBsZW5ndGggPSBlbC5sZW5ndGggPj0gbGVuZ3RoID8gZWwubGVuZ3RoIDogbGVuZ3RoXHJcbiAgfSlcclxuICByZXR1cm4gbGVuZ3RoXHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVhQT1JUU1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBwbGFjZVdvcmRzSW5Sb3dzLFxyXG4gIHRvdGFsUmVxdWlyZWRQYXJ0aWNsZXMsXHJcbiAgY2FsY0xldHRlclBhcnRpY2xlc0Rlc3RBbmRUYXJnZXRzXHJcbn1cclxuIl19
