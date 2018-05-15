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

let body = document.getElementsByTagName('body')[0]
let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')
const NAV_TOPIC_ELEMENT = document.getElementById('navigatorNavTopics')
let navItemDescription = document.getElementById('navigatorDesc')
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
  navItemDescription.innerHTML = carousel2d.getNavItemDesc()
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
  navItemDescription.innerHTML = carousel2d.getNavItemDesc()
  formNewParticleWord()
}


function carouselDown() {
  carousel2d.down()
  CHAR_PATTERN_WORDS = carousel2d.getNavItemText()
  NAV_TOPIC_ELEMENT.innerHTML = carousel2d.getNavTopicText()
  navItemDescription.innerHTML = carousel2d.getNavItemDesc()
  formNewParticleWord()
}


function carouselLeft() {
  carousel2d.left()
  CHAR_PATTERN_WORDS = carousel2d.getNavItemText()
  NAV_TOPIC_ELEMENT.innerHTML = carousel2d.getNavTopicText()
  navItemDescription.innerHTML = carousel2d.getNavItemDesc()
  formNewParticleWord()
}


function carouselRight() {
  carousel2d.right()
  CHAR_PATTERN_WORDS = carousel2d.getNavItemText()
  NAV_TOPIC_ELEMENT.innerHTML = carousel2d.getNavTopicText()
  navItemDescription.innerHTML = carousel2d.getNavItemDesc()
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
    canvasHeight = body.clientHeight * 0.6
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
  {text: 'Free Code Camp Projects', navItems: [
    {text: 'FCC Projects Page', desc: 'A possibly redundant page with links to each FCC project', link: '/fcc-projects'},
    {text: 'Calculator', desc: 'Tesco Calculator lookalikey, for this I mainly concentrated on seeing how close I could it looking to someone elses design.', link: '/fcc-projects-calculator'},
    {text: 'Pomodoro Timer', desc: 'Pretty sure this used to sort of work', link: '/fcc-projects-pomodoro'},
    {text: 'Simon Game', desc: 'Works....ish', link: '/fcc-projects-simon'},
    {text: 'Noughts And Crosses', desc: '...meh', link: '/fcc-projects-tictactoe'}
  ]},
  {text: 'Misc', navItems: [
    {text: 'Widgetrons', desc: 'Half finished gubbins and ideasa', link: '/widgetrons'},
    {text: 'Van', desc: 'Why I am poor', link: '/campervan'}
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
  addClickableNav()
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
      newElement.classList.add('centered')
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


function populateCarouselColumns() {//doesn't do anything at present but leave in for later
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

      carouselElements[CAROUSEL_COLS - 1 - i][j].innerHTML = CAROUSEL_DATA[x].navItems[y].text
    }
  }
}


function addClickableNav() {
  carouselElements[CENTER_COL][CENTER_ROW].classList.add('centerClickableCell')

  let y = [selectedRowInCols[selectedCol] + CENTER_ROW]
  while(y >= CAROUSEL_DATA[selectedCol].navItems.length) {y = y - CAROUSEL_DATA[selectedCol].navItems.length}

  carouselElements[CENTER_COL][CENTER_ROW].addEventListener('click', function(){
    location.href = CAROUSEL_DATA[selectedCol].navItems[y].link
  }, false)
}


function getNavTopicText() {
  return CAROUSEL_DATA[selectedCol].text
}


function getNavItemText() {
  let y = [selectedRowInCols[selectedCol] + CENTER_ROW]
  while(y >= CAROUSEL_DATA[selectedCol].navItems.length) {y = y - CAROUSEL_DATA[selectedCol].navItems.length}

  return CAROUSEL_DATA[selectedCol].navItems[y].text.toUpperCase()
}


function getNavItemDesc() {
  let y = [selectedRowInCols[selectedCol] + CENTER_ROW]
  while(y >= CAROUSEL_DATA[selectedCol].navItems.length) {y = y - CAROUSEL_DATA[selectedCol].navItems.length}

  return CAROUSEL_DATA[selectedCol].navItems[y].desc
}
//-----------------------------------------------------------------------EXPORTS
module.exports = {
  up,
  down,
  left,
  right,
  getNavTopicText,
  getNavItemText,
  getNavItemDesc
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9jbGFzc2VzL0NoYXJQYXR0ZXJuUGFydGljbGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9jbGFzc2VzL0hvbGRQYXR0ZXJuUGFydGljbGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9jbGFzc2VzL1BhcnRpY2xlLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvaG9tZS5qcyIsImNsaWVudC9zdGF0aWMvc291cmNlLWpzL3V0aWxzL2NhbnZhcy1oZWxwZXJzLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2Fyb3VzZWwtMmQuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9sZXR0ZXJzLWxpYi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBjYW52YXNIZWxwZXJzID0gcmVxdWlyZSgnLi4vdXRpbHMvY2FudmFzLWhlbHBlcnMnKVxyXG5jb25zdCBQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vUGFydGljbGUnKVxyXG5cclxuY2xhc3MgQ2hhclBhdHRlcm5QYXJ0aWNsZSBleHRlbmRzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQsIHBvaW50c0F0KSB7XHJcbiAgICBzdXBlcihjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQpXHJcbiAgICB0aGlzLnBvaW50c0F0ID0gcG9pbnRzQXRcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvcygpIHtcclxuICAgIHRoaXMuZGlzdE1vdmVkICs9IHRoaXMuc3BlZWRcclxuICAgIGlmICh0aGlzLmRpc3RNb3ZlZCA+IDEpIHt0aGlzLmRpc3RNb3ZlZCA9IDF9Ly9wcmV2ZW50IG92ZXJzaG9vdFxyXG5cclxuICAgIGxldCBuZXdQb3MgPSBjYW52YXNIZWxwZXJzLmNvb3Jkc09uU3RyYWlnaHRMaW5lKHRoaXMuZGlzdE1vdmVkLCB7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pXHJcbiAgICB0aGlzLmNvb3Jkcy54ID0gbmV3UG9zLnhcclxuICAgIHRoaXMuY29vcmRzLnkgPSBuZXdQb3MueVxyXG4gIH1cclxuXHJcbiAgZHJhdyhjdHgsIGNvbG9yRnJvbSwgY29sb3JUbykge1xyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHgubGluZVdpZHRoID0gM1xyXG4gICAgbGV0IHJnYiA9IGNhbnZhc0hlbHBlcnMuY29sb3JCZXR3ZWVuVHdvQ29sb3JzKHRoaXMuZGlzdE1vdmVkLCAnI2ZmZmZmZicsICcjZmYwMDAwJykvL2RldlxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gYHJnYigke3JnYi5yfSwgJHtyZ2IuZ30sICR7cmdiLmJ9KWBcclxuICAgIC8vY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5kaXN0TW92ZWQgPCAxID8gY29sb3JGcm9tIDogY29sb3JUby8vd3JpdGUgZnVuY3Rpb24gdG8gdHJhbnNpdGlvbiBiZXR3ZWVuIDIgY29sb3VycyB0aGF0IHRha2VzICUgYXMgYW4gYXJnXHJcbiAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJ1xyXG4gICAgY3R4LmFyYyh0aGlzLmNvb3Jkcy54LCB0aGlzLmNvb3Jkcy55LCAzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIGN0eC5maWxsKClcclxuICB9XHJcblxyXG4gIGRyYXdUb1BvaW50c0F0KGN0eCwgY2hhclBhdHRlcm5QYXJ0aWNsZXMsIGluZGV4LCBjb2xvckZyb20sIGNvbG9yVG8pIHtcclxuICAgIGlmKHRoaXMuZGlzdE1vdmVkID4gMC4xKSB7XHJcbiAgICAgIGlmKHRoaXMucG9pbnRzQXQgIT09IGZhbHNlKSB7XHJcbiAgICAgICAgbGV0IHBvaW50c0F0WCA9IGNoYXJQYXR0ZXJuUGFydGljbGVzW2luZGV4ICsgdGhpcy5wb2ludHNBdF0uY29vcmRzLngvL3RoZXNlIHR3byBsaW5lcyBhcmUgZnVja2luZyB0aGluZ3Mgc29tZWhvdyBkZWxldGluZyB0aGUgbGFzdCBwYXJ0aWNsZSBpbiB0aGUgY2hhciBJIHRoaW5rXHJcbiAgICAgICAgbGV0IHBvaW50c0F0WSA9IGNoYXJQYXR0ZXJuUGFydGljbGVzW2luZGV4ICsgdGhpcy5wb2ludHNBdF0uY29vcmRzLnlcclxuICAgICAgICBjdHguYmVnaW5QYXRoKClcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gMlxyXG4gICAgICAgIGxldCByZ2IgPSBjYW52YXNIZWxwZXJzLmNvbG9yQmV0d2VlblR3b0NvbG9ycyh0aGlzLmRpc3RNb3ZlZCwgJyMxZjI2MzMnLCAnI2ZmMDAwMCcpXHJcbiAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gYHJnYigke3JnYi5yfSwgJHtyZ2IuZ30sICR7cmdiLmJ9KWBcclxuICAgICAgICAvL2N0eC5zdHJva2VTdHlsZSA9IHRoaXMuZGlzdE1vdmVkIDwgMSA/IGNvbG9yRnJvbSA6IGNvbG9yVG9cclxuICAgICAgICBjdHgubW92ZVRvKHRoaXMuY29vcmRzLngsIHRoaXMuY29vcmRzLnkpXHJcbiAgICAgICAgY3R4LmxpbmVUbyhwb2ludHNBdFgsIHBvaW50c0F0WSlcclxuICAgICAgICBjdHguc3Ryb2tlKClcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDaGFyUGF0dGVyblBhcnRpY2xlXHJcbiIsIlxyXG5jb25zdCBjYW52YXNIZWxwZXJzID0gcmVxdWlyZSgnLi4vdXRpbHMvY2FudmFzLWhlbHBlcnMnKVxyXG5jb25zdCBQYXJ0aWNsZSA9IHJlcXVpcmUoJy4vUGFydGljbGUuanMnKVxyXG5cclxuY2xhc3MgSG9sZFBhdHRlcm5QYXJ0aWNsZSBleHRlbmRzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIHNwZWVkLCBkaXN0TW92ZWQsIG5leHRXUCkge1xyXG4gICAgc3VwZXIoY29vcmRzLCBzcGVlZCwgZGlzdE1vdmVkKVxyXG4gICAgdGhpcy5uZXh0V1AgPSBuZXh0V1BcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvcyhIT0xEX1BBVFRFUk5fV0FZUE9JTlRTLCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCwgSE9MRF9TUEVFRCkge1xyXG4gICAgdGhpcy5kaXN0TW92ZWQgKz0gdGhpcy5zcGVlZFxyXG4gICAgaWYodGhpcy5kaXN0TW92ZWQgPj0gMSkge1xyXG4gICAgICB0aGlzLmRpc3RNb3ZlZCA9IDBcclxuICAgICAgdGhpcy5zcGVlZCA9IEhPTERfU1BFRURcclxuICAgICAgdGhpcy5uZXh0V1AgPSB0aGlzLm5leHRXUCA9PT0gSE9MRF9QQVRURVJOX1dBWVBPSU5UUy5sZW5ndGggLSAxID8gMCA6IHRoaXMubmV4dFdQICsgMVxyXG4gICAgICB0aGlzLmNvb3Jkcy54MCA9IHRoaXMuY29vcmRzLngxXHJcbiAgICAgIHRoaXMuY29vcmRzLnkwID0gdGhpcy5jb29yZHMueTFcclxuICAgICAgdGhpcy5jb29yZHMueDEgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFt0aGlzLm5leHRXUF0pLnhcclxuICAgICAgdGhpcy5jb29yZHMueTEgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFt0aGlzLm5leHRXUF0pLnlcclxuICAgICAgdGhpcy5jb29yZHMuY3AxeCA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnhcclxuICAgICAgdGhpcy5jb29yZHMuY3AxeSA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnlcclxuICAgICAgdGhpcy5jb29yZHMuY3AyeCA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnhcclxuICAgICAgdGhpcy5jb29yZHMuY3AyeSA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyh7eDogdGhpcy5jb29yZHMueDAsIHk6IHRoaXMuY29vcmRzLnkwfSwge3g6IHRoaXMuY29vcmRzLngxLCB5OiB0aGlzLmNvb3Jkcy55MX0pLnlcclxuICAgIH1cclxuICAgIHRoaXMuY29vcmRzLnggPSBjYW52YXNIZWxwZXJzLmNvb3Jkc09uQ3ViaWNCZXppZXIodGhpcy5kaXN0TW92ZWQsIHRoaXMuY29vcmRzLngwLCB0aGlzLmNvb3Jkcy5jcDF4LCB0aGlzLmNvb3Jkcy5jcDJ4LCB0aGlzLmNvb3Jkcy54MSlcclxuICAgIHRoaXMuY29vcmRzLnkgPSBjYW52YXNIZWxwZXJzLmNvb3Jkc09uQ3ViaWNCZXppZXIodGhpcy5kaXN0TW92ZWQsIHRoaXMuY29vcmRzLnkwLCB0aGlzLmNvb3Jkcy5jcDF5LCB0aGlzLmNvb3Jkcy5jcDJ5LCB0aGlzLmNvb3Jkcy55MSlcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSG9sZFBhdHRlcm5QYXJ0aWNsZVxyXG4iLCJcclxuY2xhc3MgUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZCkge1xyXG4gICAgdGhpcy5jb29yZHMgPSBjb29yZHNcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZFxyXG4gICAgdGhpcy5kaXN0TW92ZWQgPSBkaXN0TW92ZWRcclxuICB9XHJcblxyXG4gIGRyYXcoY3R4LCBjb2xvcikgey8vZGVmYXVsdCBzZWxmIHJlbmRlciBmb3IgcGFydGljbGVzLCBtYXliZSBjaGFuZ2UgbGF0ZXJcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LmxpbmVXaWR0aCA9IDNcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yXHJcbiAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJ1xyXG4gICAgY3R4LmFyYyh0aGlzLmNvb3Jkcy54LCB0aGlzLmNvb3Jkcy55LCAzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIGN0eC5maWxsKClcclxuICB9XHJcblxyXG4gIHVwZGF0ZVBvcygpIHtcclxuICAgIHRoaXMuY29vcmRzLnggKz0gdGhpcy5zcGVlZFxyXG4gICAgdGhpcy5jb29yZHMueSArPSB0aGlzLnNwZWVkXHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBhcnRpY2xlXHJcbiIsIlxyXG5jb25zdCBjYW52YXNIZWxwZXJzID0gcmVxdWlyZSgnLi91dGlscy9jYW52YXMtaGVscGVycy5qcycpXHJcbmNvbnN0IGxldHRlcnNMaWIgPSByZXF1aXJlKCcuL3V0aWxzL2xldHRlcnMtbGliLmpzJylcclxuY29uc3QgSG9sZFBhdHRlcm5QYXJ0aWNsZSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9Ib2xkUGF0dGVyblBhcnRpY2xlJylcclxuY29uc3QgQ2hhclBhdHRlcm5QYXJ0aWNsZSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9DaGFyUGF0dGVyblBhcnRpY2xlJylcclxuY29uc3QgY2Fyb3VzZWwyZCA9IHJlcXVpcmUoJy4vdXRpbHMvY2Fyb3VzZWwtMmQnKVxyXG5cclxubGV0IENIQVJfUEFUVEVSTl9XT1JEUyA9ICdZQVkgQU5PVEhFUiBORVcgQlVHJy8vZm9yIG5vdyBkZWZpbmVkICBoZXJlLCBsYXRlciB3aWxsIGNvbWUgZnJvbSBjYXVyb3NlbFxyXG5jb25zdCBNQVhfQ0hBUlNfUEVSX1JPVyA9IDEyXHJcbmNvbnN0IFRPVEFMX1BBUlRJQ0xFUyA9IDIwMFxyXG5jb25zdCBIT0xEX1BBVFRFUk5fV0FZUE9JTlRTID0gWy8vY29vcmRzIGFzICUgb2YgY2FudmFzIHNpemVcclxuICB7eDogMC4xMjUsIHk6IDAuNX0sXHJcbiAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICB7eDogMC43NSwgeTogMC4xMjV9LFxyXG4gIHt4OiAwLjg3NSwgeTogMC41fSxcclxuICB7eDogMC43NSwgeTogMC44NzV9LFxyXG4gIHt4OiAwLjI1LCB5OiAwLjg3NX1cclxuXVxyXG5jb25zdCBIT0xEX1NQRUVEID0gMC4wMDI1XHJcblxyXG5sZXQgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF1cclxubGV0IGNhbnZhczEgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY2FudmFzJylbMF1cclxubGV0IGN0eDEgPSBjYW52YXMxLmdldENvbnRleHQoJzJkJylcclxuY29uc3QgTkFWX1RPUElDX0VMRU1FTlQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yTmF2VG9waWNzJylcclxubGV0IG5hdkl0ZW1EZXNjcmlwdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYXZpZ2F0b3JEZXNjJylcclxubGV0IG5hdkdvVG9CdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yRGVzYycpLy9kZXZcclxubGV0IGZyYW1lSWRcclxubGV0IGNhbnZhc1dpZHRoXHJcbmxldCBjYW52YXNIZWlnaHRcclxubGV0IGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsID0gW10vL2Nvb3JkcyBpbiBwaXhlbHMsIHJlY2FsY3VsYXRlZCBvbiByZXNpemVcclxubGV0IGhvbGRQYXR0ZXJuUGFydGljbGVzID0gW11cclxubGV0IGNoYXJQYXR0ZXJuUGFydGljbGVzID0gW11cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVWRU5UU1xyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBpbml0KVxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaW5pdClcclxuLy9uYXZHb1RvQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZm9ybU5ld1BhcnRpY2xlV29yZCwgZmFsc2UpLy9kZXZcclxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdmlnYXRvclVwJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjYXJvdXNlbFVwKVxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yRG93bicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2Fyb3VzZWxEb3duKVxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yTGVmdCcpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2Fyb3VzZWxMZWZ0KVxyXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmF2aWdhdG9yUmlnaHQnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhcm91c2VsUmlnaHQpXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUZMT1cgQ09OVFJPTCAmIElOSVRJQUxJWkVSU1xyXG5mdW5jdGlvbiBpbml0KCkge1xyXG4gIHJlc2V0KClcclxuICBzZXRMYXlvdXQoKVxyXG4gIE5BVl9UT1BJQ19FTEVNRU5ULmlubmVySFRNTCA9IGNhcm91c2VsMmQuZ2V0TmF2VG9waWNUZXh0KClcclxuICBuYXZJdGVtRGVzY3JpcHRpb24uaW5uZXJIVE1MID0gY2Fyb3VzZWwyZC5nZXROYXZJdGVtRGVzYygpXHJcbiAgY2FsY0hvbGRQYXR0ZXJuV2F5cG9pbnRDb29yZHMoKVxyXG4gIGluaXRIb2xkUGF0dGVyblBhcnRpY2xlcyhUT1RBTF9QQVJUSUNMRVMpXHJcbiAgYW5pbWF0ZSgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiByZXNldCgpIHtcclxuICBjYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZUlkKVxyXG4gIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsLmxlbmd0aCA9IDBcclxuICBob2xkUGF0dGVyblBhcnRpY2xlcy5sZW5ndGggPSAwXHJcbiAgY2hhclBhdHRlcm5QYXJ0aWNsZXMubGVuZ3RoID0gMFxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY2FsY0hvbGRQYXR0ZXJuV2F5cG9pbnRDb29yZHMoKSB7XHJcbiAgaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWwgPSBIT0xEX1BBVFRFUk5fV0FZUE9JTlRTLm1hcChlbCA9PiB7XHJcbiAgICByZXR1cm4ge3g6IGVsLnggKiBjYW52YXNXaWR0aCwgeTogZWwueSAqIGNhbnZhc0hlaWdodH1cclxuICB9KVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gaW5pdEhvbGRQYXR0ZXJuUGFydGljbGVzKG5QYXJ0aWNsZXMpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgblBhcnRpY2xlczsgaSsrKSB7XHJcbiAgICBsZXQgZnJvbVdQID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNilcclxuICAgIGxldCBuZXh0V1AgPSBmcm9tV1AgKyAxID09PSBIT0xEX1BBVFRFUk5fV0FZUE9JTlRTLmxlbmd0aCA/IDAgOiBmcm9tV1AgKyAxXHJcbiAgICBsZXQgZGlzdE1vdmVkID0gTWF0aC5yb3VuZCggTWF0aC5yYW5kb20oKSAqIDEwICkgLyAxMFxyXG4gICAgbGV0IHN0YXJ0Q29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnROZWFyUG9pbnQoaG9sZFBhdHRlcm5XYXlwb2ludHNBY3R1YWxbZnJvbVdQXSlcclxuICAgIGxldCBlbmRDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFtuZXh0V1BdKVxyXG4gICAgbGV0IGNwMUNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhzdGFydENvb3JkcywgZW5kQ29vcmRzKVxyXG4gICAgbGV0IGNwMkNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhzdGFydENvb3JkcywgZW5kQ29vcmRzKVxyXG4gICAgbGV0IGNvb3JkcyA9IHtcclxuICAgICAgeDogc3RhcnRDb29yZHMueCwgeTogc3RhcnRDb29yZHMueSxcclxuICAgICAgeDA6IHN0YXJ0Q29vcmRzLngsIHkwOiBzdGFydENvb3Jkcy55LFxyXG4gICAgICB4MTogZW5kQ29vcmRzLngsIHkxOiBlbmRDb29yZHMueSxcclxuICAgICAgY3AxeDogY3AxQ29vcmRzLngsIGNwMXk6IGNwMUNvb3Jkcy55LFxyXG4gICAgICBjcDJ4OiBjcDJDb29yZHMueCwgY3AyeTogY3AyQ29vcmRzLnlcclxuICAgIH1cclxuXHJcbiAgICBob2xkUGF0dGVyblBhcnRpY2xlcy5wdXNoKCBuZXcgSG9sZFBhdHRlcm5QYXJ0aWNsZShjb29yZHMsIEhPTERfU1BFRUQsIGRpc3RNb3ZlZCwgbmV4dFdQKSApXHJcbiAgfVxyXG4gIGNvbnNvbGUubG9nKGhvbGRQYXR0ZXJuUGFydGljbGVzWzBdKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZm9ybU5ld1BhcnRpY2xlV29yZCgpIHtcclxuICBjYW5jZWxBbmltYXRpb25GcmFtZShmcmFtZUlkKS8vbm90IHN1cmUgaWYgbmVlZGVkXHJcbiAgY2hhclRvSG9sZFRyYW5zaXRpb24oKVxyXG4gIGhvbGRUb0NoYXJUcmFuc2l0aW9uKClcclxuICBhbmltYXRlKCkvL25vdCBzdXJlIGlmIG5lZWRlZFxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQ0FST1VTRUwgQ09OVFJPTFNcclxuZnVuY3Rpb24gY2Fyb3VzZWxVcCgpIHtcclxuICBjYXJvdXNlbDJkLnVwKClcclxuICBDSEFSX1BBVFRFUk5fV09SRFMgPSBjYXJvdXNlbDJkLmdldE5hdkl0ZW1UZXh0KClcclxuICBOQVZfVE9QSUNfRUxFTUVOVC5pbm5lckhUTUwgPSBjYXJvdXNlbDJkLmdldE5hdlRvcGljVGV4dCgpXHJcbiAgbmF2SXRlbURlc2NyaXB0aW9uLmlubmVySFRNTCA9IGNhcm91c2VsMmQuZ2V0TmF2SXRlbURlc2MoKVxyXG4gIGZvcm1OZXdQYXJ0aWNsZVdvcmQoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gY2Fyb3VzZWxEb3duKCkge1xyXG4gIGNhcm91c2VsMmQuZG93bigpXHJcbiAgQ0hBUl9QQVRURVJOX1dPUkRTID0gY2Fyb3VzZWwyZC5nZXROYXZJdGVtVGV4dCgpXHJcbiAgTkFWX1RPUElDX0VMRU1FTlQuaW5uZXJIVE1MID0gY2Fyb3VzZWwyZC5nZXROYXZUb3BpY1RleHQoKVxyXG4gIG5hdkl0ZW1EZXNjcmlwdGlvbi5pbm5lckhUTUwgPSBjYXJvdXNlbDJkLmdldE5hdkl0ZW1EZXNjKClcclxuICBmb3JtTmV3UGFydGljbGVXb3JkKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNhcm91c2VsTGVmdCgpIHtcclxuICBjYXJvdXNlbDJkLmxlZnQoKVxyXG4gIENIQVJfUEFUVEVSTl9XT1JEUyA9IGNhcm91c2VsMmQuZ2V0TmF2SXRlbVRleHQoKVxyXG4gIE5BVl9UT1BJQ19FTEVNRU5ULmlubmVySFRNTCA9IGNhcm91c2VsMmQuZ2V0TmF2VG9waWNUZXh0KClcclxuICBuYXZJdGVtRGVzY3JpcHRpb24uaW5uZXJIVE1MID0gY2Fyb3VzZWwyZC5nZXROYXZJdGVtRGVzYygpXHJcbiAgZm9ybU5ld1BhcnRpY2xlV29yZCgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjYXJvdXNlbFJpZ2h0KCkge1xyXG4gIGNhcm91c2VsMmQucmlnaHQoKVxyXG4gIENIQVJfUEFUVEVSTl9XT1JEUyA9IGNhcm91c2VsMmQuZ2V0TmF2SXRlbVRleHQoKVxyXG4gIE5BVl9UT1BJQ19FTEVNRU5ULmlubmVySFRNTCA9IGNhcm91c2VsMmQuZ2V0TmF2VG9waWNUZXh0KClcclxuICBuYXZJdGVtRGVzY3JpcHRpb24uaW5uZXJIVE1MID0gY2Fyb3VzZWwyZC5nZXROYXZJdGVtRGVzYygpXHJcbiAgZm9ybU5ld1BhcnRpY2xlV29yZCgpXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVRSQU5TSVRJT04gUEFSVElDTEVTIEJFVFdFRU4gQkVIQVZJT1VSIFRZUEVTXHJcbmZ1bmN0aW9uIGhvbGRUb0NoYXJUcmFuc2l0aW9uKCkge1xyXG4gIGxldCByZXF1aXJlZFBhcnRpY2xlcyA9IGxldHRlcnNMaWIudG90YWxSZXF1aXJlZFBhcnRpY2xlcyhDSEFSX1BBVFRFUk5fV09SRFMpXHJcbiAgbGV0IHdvcmRzSW5Sb3dzID0gbGV0dGVyc0xpYi5wbGFjZVdvcmRzSW5Sb3dzKENIQVJfUEFUVEVSTl9XT1JEUywgTUFYX0NIQVJTX1BFUl9ST1cpXHJcbiAgbGV0IGRlc3RpbmF0aW9uc0FuZFRhcmdldHMgPSBsZXR0ZXJzTGliLmNhbGNMZXR0ZXJQYXJ0aWNsZXNEZXN0QW5kVGFyZ2V0cyh3b3Jkc0luUm93cywgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodClcclxuXHJcbiAgaWYgKGhvbGRQYXR0ZXJuUGFydGljbGVzLmxlbmd0aCA+IHJlcXVpcmVkUGFydGljbGVzKSB7XHJcbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgcmVxdWlyZWRQYXJ0aWNsZXM7IGkrKykge1xyXG4gICAgICBsZXQgdHJhbnNmZXJyaW5nUGFydGljbGUgPSBob2xkUGF0dGVyblBhcnRpY2xlcy5wb3AoKVxyXG4gICAgICBsZXQgY29vcmRzID0ge1xyXG4gICAgICAgIHg6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy54LFxyXG4gICAgICAgIHk6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy55LFxyXG4gICAgICAgIHgwOiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueCxcclxuICAgICAgICB5MDogdHJhbnNmZXJyaW5nUGFydGljbGUuY29vcmRzLnksXHJcbiAgICAgICAgeDE6IGRlc3RpbmF0aW9uc0FuZFRhcmdldHNbaV0ueDEsXHJcbiAgICAgICAgeTE6IGRlc3RpbmF0aW9uc0FuZFRhcmdldHNbaV0ueTFcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IHNwZWVkID0gSE9MRF9TUEVFRCAqIDRcclxuICAgICAgbGV0IGRpc3RNb3ZlZCA9IDBcclxuICAgICAgbGV0IHBvaW50c0F0ID0gZGVzdGluYXRpb25zQW5kVGFyZ2V0c1tpXS5wb2ludHNBdFxyXG4gICAgICBjaGFyUGF0dGVyblBhcnRpY2xlcy5wdXNoKG5ldyBDaGFyUGF0dGVyblBhcnRpY2xlKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZCwgcG9pbnRzQXQpKVxyXG4gICAgfVxyXG5cclxuICB9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjaGFyVG9Ib2xkVHJhbnNpdGlvbigpIHtcclxuICB3aGlsZShjaGFyUGF0dGVyblBhcnRpY2xlcy5sZW5ndGggPiAwKSB7XHJcbiAgICBsZXQgdHJhbnNmZXJyaW5nUGFydGljbGUgPSBjaGFyUGF0dGVyblBhcnRpY2xlcy5wb3AoKVxyXG4gICAgbGV0IGRpc3RNb3ZlZCA9IDBcclxuICAgIGxldCBzcGVlZCA9ICBNYXRoLnJvdW5kKCAoTWF0aC5yYW5kb20oKSAqIChIT0xEX1NQRUVEICogMTAgLSBIT0xEX1NQRUVEKSArIEhPTERfU1BFRUQpICogMTAwMCApIC8gMTAwMFxyXG4gICAgbGV0IGZyb21XUCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDYpXHJcbiAgICBsZXQgbmV4dFdQID0gZnJvbVdQICsgMSA9PT0gSE9MRF9QQVRURVJOX1dBWVBPSU5UUy5sZW5ndGggPyAwIDogZnJvbVdQICsgMVxyXG4gICAgbGV0IHN0YXJ0Q29vcmRzID0ge3g6IHRyYW5zZmVycmluZ1BhcnRpY2xlLmNvb3Jkcy54LCB5OiB0cmFuc2ZlcnJpbmdQYXJ0aWNsZS5jb29yZHMueX1cclxuICAgIGxldCBlbmRDb29yZHMgPSBjYW52YXNIZWxwZXJzLnJhbmRQb2ludE5lYXJQb2ludChob2xkUGF0dGVybldheXBvaW50c0FjdHVhbFtuZXh0V1BdKVxyXG4gICAgbGV0IGNwMUNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhzdGFydENvb3JkcywgZW5kQ29vcmRzKVxyXG4gICAgbGV0IGNwMkNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhzdGFydENvb3JkcywgZW5kQ29vcmRzKVxyXG4gICAgbGV0IGNvb3JkcyA9IHtcclxuICAgICAgeDogc3RhcnRDb29yZHMueCxcclxuICAgICAgeTogc3RhcnRDb29yZHMueSxcclxuICAgICAgeDA6IHN0YXJ0Q29vcmRzLngsXHJcbiAgICAgIHkwOiBzdGFydENvb3Jkcy55LFxyXG4gICAgICB4MTogZW5kQ29vcmRzLngsXHJcbiAgICAgIHkxOiBlbmRDb29yZHMueSxcclxuICAgICAgY3AxeDogY3AxQ29vcmRzLngsXHJcbiAgICAgIGNwMXk6IGNwMUNvb3Jkcy55LFxyXG4gICAgICBjcDJ4OiBjcDJDb29yZHMueCxcclxuICAgICAgY3AyeTogY3AyQ29vcmRzLnlcclxuICAgIH1cclxuXHJcbiAgICBob2xkUGF0dGVyblBhcnRpY2xlcy51bnNoaWZ0KG5ldyBIb2xkUGF0dGVyblBhcnRpY2xlKGNvb3Jkcywgc3BlZWQsIGRpc3RNb3ZlZCwgbmV4dFdQKSlcclxuICB9XHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tVVBEQVRFIFBBUlRJQ0xFIFBPU0lUSU9OUyAmIFJFTkRFUlxyXG5mdW5jdGlvbiBhbmltYXRlKCkge1xyXG4gIGZyYW1lSWQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoYW5pbWF0ZSlcclxuICBjdHgxLmNsZWFyUmVjdCgwLCAwLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KVxyXG4gIC8vY2FudmFzSGVscGVycy5yZW5kZXJCb3VuZGluZ0NpcmNsZShjdHgxLCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KS8vZGV2XHJcbiAgLy9jYW52YXNIZWxwZXJzLnJlbmRlckhvbGRQYXR0ZXJuV1BzKGN0eDEsIGhvbGRQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKS8vZGV2XHJcbiAgLy9jYW52YXNIZWxwZXJzLnJlbmRlckhvbGRQYXR0ZXJuUGFydGljbGVQYXRocyhjdHgxLCBob2xkUGF0dGVyblBhcnRpY2xlcykvL2RldlxyXG4gIHVwZGF0ZUhvbGRQYXR0ZXJuUGFydGljbGVzKClcclxuICB1cGRhdGVDaGFyUGF0dGVyblBhcnRpY2xlcygpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiB1cGRhdGVIb2xkUGF0dGVyblBhcnRpY2xlcygpIHtcclxuICBob2xkUGF0dGVyblBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcclxuICAgIHBhcnRpY2xlLnVwZGF0ZVBvcyhIT0xEX1BBVFRFUk5fV0FZUE9JTlRTLCBob2xkUGF0dGVybldheXBvaW50c0FjdHVhbCwgSE9MRF9TUEVFRClcclxuICAgIHBhcnRpY2xlLmRyYXcoY3R4MSwgJ3doaXRlJylcclxuICB9KVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQ2hhclBhdHRlcm5QYXJ0aWNsZXMoKSB7XHJcbiAgY2hhclBhdHRlcm5QYXJ0aWNsZXMuZm9yRWFjaCgocGFydGljbGUsIGluZGV4KSA9PiB7XHJcbiAgICBwYXJ0aWNsZS51cGRhdGVQb3MoKVxyXG4gICAgcGFydGljbGUuZHJhdyhjdHgxLCAnd2hpdGUnLCAncmVkJylcclxuICAgIHBhcnRpY2xlLmRyYXdUb1BvaW50c0F0KGN0eDEsIGNoYXJQYXR0ZXJuUGFydGljbGVzLCBpbmRleCwgJyMxZjI2MzMnLCAnI2ZmMDAwMCcpXHJcbiAgfSlcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1MQVlPVVQgQlJFQUsgUE9JTlRTXHJcbmZ1bmN0aW9uIHNldExheW91dCgpIHtcclxuICAvL3NtYWxsIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNlxyXG4gIH1cclxuICAvL3NtYWxsIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0IDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG4gIC8vbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDEwMjQgJiYgYm9keS5jbGllbnRXaWR0aCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjdcclxuICB9XHJcbiAgLy9tZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gMTAyNCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcbiAgLy9sYXJnZSB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjY1XHJcbiAgfVxyXG4gIC8vbGFyZ2UgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPiAxMDI0KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBsYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG5cclxuICBjYW52YXMxLndpZHRoID0gY2FudmFzV2lkdGhcclxuICBjYW52YXMxLmhlaWdodCA9IGNhbnZhc0hlaWdodFxyXG59XHJcbiIsIi8vIERhbGUncyB1c2VybmFtZTogZGFrZWJsXHJcblxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTUlTQyBIRUxQRVJTXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLU1BVEggSEVMUEVSU1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUdFT01FVFJZIEhFTFBFUlNcclxuZnVuY3Rpb24gcmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhwMSwgcDIpIHtcclxuICBjb25zdCBNSU5fRElTVCA9IDQwXHJcbiAgY29uc3QgRElTVF9NT0QgPSAwLjVcclxuICBjb25zdCBBTkdMRV9XSVRISU4gPSBNYXRoLlBJXHJcbiAgbGV0IGEgPSBwMi54IC0gcDEueFxyXG4gIGxldCBiID0gcDIueSAtIHAxLnlcclxuICBsZXQgcDFQMkRpc3QgPSBNYXRoLnNxcnQoYSphICsgYipiKVxyXG4gIGxldCByYW5kRGlzdCA9IChNYXRoLnJhbmRvbSgpICogcDFQMkRpc3QgKiBESVNUX01PRCkgKyBNSU5fRElTVFxyXG4gIGxldCBhbmdsZU1vZCA9IChNYXRoLnJhbmRvbSgpICogQU5HTEVfV0lUSElOKSAtIChBTkdMRV9XSVRISU4gLyAyKVxyXG4gIGxldCByYW5kQW5nbGVcclxuICBsZXQgY29vcmRzID0ge3g6IG51bGwsIHk6IG51bGx9XHJcblxyXG4gIGlmKE1hdGgucmFuZG9tKCkgPj0gMC41KSB7XHJcbiAgICByYW5kQW5nbGUgPSBNYXRoLmF0YW4yKHAyLnkgLSBwMS55LCBwMS54IC0gcDIueCkgKyBhbmdsZU1vZFxyXG4gICAgY29vcmRzLnggPSBwMi54ICsgTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgICBjb29yZHMueSA9IHAyLnkgLSBNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICB9IGVsc2Uge1xyXG4gICAgcmFuZEFuZ2xlID0gTWF0aC5hdGFuMihwMS55IC0gcDIueSwgcDIueCAtIHAxLngpICsgYW5nbGVNb2RcclxuICAgIGNvb3Jkcy54ID0gcDEueCArIE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gICAgY29vcmRzLnkgPSBwMS55IC0gTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgfVxyXG5cclxuICByZXR1cm4gY29vcmRzXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiByYW5kUG9pbnROZWFyUG9pbnQocHQpIHtcclxuICBjb25zdCBNQVhfRlJPTSA9IDQwXHJcbiAgbGV0IHJhbmREaXN0ID0gTWF0aC5yYW5kb20oKSAqIE1BWF9GUk9NXHJcbiAgbGV0IHJhbmRBbmdsZSA9IE1hdGgucmFuZG9tKCkgKiBNYXRoLlBJICogMlxyXG4gIGxldCB4ID0gcHQueCArIE1hdGgucm91bmQoTWF0aC5jb3MocmFuZEFuZ2xlKSAqIHJhbmREaXN0KVxyXG4gIGxldCB5ID0gcHQueSArIE1hdGgucm91bmQoTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0KVxyXG5cclxuICByZXR1cm4ge3g6IHgsIHk6IHl9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjb29yZHNPblN0cmFpZ2h0TGluZShwZXJjZW50LCBzdGFydFB0LCBlbmRQdCkge1xyXG4gIGxldCB4VG90YWwgPSBlbmRQdC54IC0gc3RhcnRQdC54XHJcbiAgbGV0IHlUb3RhbCA9IGVuZFB0LnkgLSBzdGFydFB0LnlcclxuICBsZXQgeERpc3QgPSBwZXJjZW50ICogeFRvdGFsXHJcbiAgbGV0IHlEaXN0ID0gcGVyY2VudCAqIHlUb3RhbFxyXG5cclxuICByZXR1cm4ge3g6IHN0YXJ0UHQueCArIHhEaXN0LCB5OiBzdGFydFB0LnkgKyB5RGlzdH1cclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGNvb3Jkc09uQ3ViaWNCZXppZXIocGVyY2VudCwgc3RhcnRQdCwgY3AxLCBjcDIsIGVuZFB0KSB7Ly9zdG9sZW4gZnJvbSBzdGFja292ZXJmbG93XHJcbiAgbGV0IHQyID0gcGVyY2VudCAqIHBlcmNlbnRcclxuICBsZXQgdDMgPSB0MiAqIHBlcmNlbnRcclxuXHJcbiAgcmV0dXJuIHN0YXJ0UHQgKyAoLXN0YXJ0UHQgKiAzICsgcGVyY2VudCAqICgzICogc3RhcnRQdCAtIHN0YXJ0UHQgKiBwZXJjZW50KSkgKiBwZXJjZW50XHJcbiAgKyAoMyAqIGNwMSArIHBlcmNlbnQgKiAoLTYgKiBjcDEgKyBjcDEgKiAzICogcGVyY2VudCkpICogcGVyY2VudFxyXG4gICsgKGNwMiAqIDMgLSBjcDIgKiAzICogcGVyY2VudCkgKiB0MlxyXG4gICsgZW5kUHQgKiB0M1xyXG59XHJcblxyXG5cclxuLy8tLUZVTkNUSU9OUyBUTyBSRU5ERVIgV0FZUE9JTlRTLCBDT05UUk9MIFBPSU5UUywgRVRDIFVTRUQgSU4gUEFSVElDTEUgQ1JFQVRJT05cclxuLy9OT1QgTkVDRVNTQVJJTFkgVVNFRCBCVVQgVVNFRlVMIEZPUiBERUJVR0dJTkdcclxuZnVuY3Rpb24gcmVuZGVyQm91bmRpbmdDaXJjbGUoY3R4LCBjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KSB7XHJcbiAgbGV0IGNlbnRlclggPSBjYW52YXNXaWR0aCAvIDJcclxuICBsZXQgY2VudGVyWSA9IGNhbnZhc0hlaWdodCAvIDJcclxuICBsZXQgcmFkaXVzID0gY2VudGVyWSA+IGNlbnRlclggPyBjZW50ZXJYIC0gMiA6IGNlbnRlclkgLSAyXHJcbiAgbGV0IHN0YXJ0QW5nbGUgPSAwXHJcbiAgbGV0IGVuZEFuZ2xlID0gMiAqIE1hdGguUElcclxuICBjdHgubGluZVdpZHRoID0gMVxyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICdncmV5J1xyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5hcmMoY2VudGVyWCwgY2VudGVyWSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSlcclxuICBjdHguc3Ryb2tlKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckhvbGRQYXR0ZXJuV1BzKGN0eCwgd2F5cG9pbnRzKSB7XHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LmZpbGxTdHlsZSA9ICdibHVlJ1xyXG4gIHdheXBvaW50cy5mb3JFYWNoKHdwID0+IHtcclxuICAgIGN0eC5maWxsUmVjdCh3cC54IC0gNCwgd3AueSAtIDQsIDgsIDgpXHJcbiAgfSlcclxuICBjdHguc3Ryb2tlKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckhvbGRQYXR0ZXJuUGFydGljbGVQYXRocyhjdHgsIHBhcnRpY2xlcykge1xyXG4gIHBhcnRpY2xlcy5mb3JFYWNoKHBhcnRpY2xlID0+IHtcclxuICAgIGxldCBjcDFYID0gcGFydGljbGUuY29vcmRzLmNwMXhcclxuICAgIGxldCBjcDFZID0gcGFydGljbGUuY29vcmRzLmNwMXlcclxuICAgIGxldCBjcDJYID0gcGFydGljbGUuY29vcmRzLmNwMnhcclxuICAgIGxldCBjcDJZID0gcGFydGljbGUuY29vcmRzLmNwMnlcclxuICAgIGxldCBzdGFydFggPSBwYXJ0aWNsZS5jb29yZHMueDBcclxuICAgIGxldCBzdGFydFkgPSBwYXJ0aWNsZS5jb29yZHMueTBcclxuICAgIGxldCBlbmRYID0gcGFydGljbGUuY29vcmRzLngxXHJcbiAgICBsZXQgZW5kWSA9IHBhcnRpY2xlLmNvb3Jkcy55MVxyXG4gICAgY3R4LmxpbmVXaWR0aCA9IDFcclxuICAgIC8vcmVuZGVyIHN0YXJ0IHBvaW50XHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmVlbidcclxuICAgIGN0eC5yZWN0KHN0YXJ0WCAtIDIsIHN0YXJ0WSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIGVuZCBwb2ludFxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3JlZCdcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnJlY3QoZW5kWCAtIDIsIGVuZFkgLSAyLCA0LCA0KVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgICAvL3JlbmRlciBjb250cm9sIHBvaW50IDFcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3llbGxvdydcclxuICAgIGN0eC5yZWN0KGNwMVggLSAyLCBjcDFZIC0gMiwgNCwgNClcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gICAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAyXHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdvcmFuZ2UnXHJcbiAgICBjdHgucmVjdChjcDJYIC0gMiwgY3AyWSAtIDIsIDQsIDQpXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICAgIC8vcmVuZGVyIHBhdGhcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZXknXHJcbiAgICBjdHgubW92ZVRvKHN0YXJ0WCwgc3RhcnRZKVxyXG4gICAgY3R4LmJlemllckN1cnZlVG8oY3AxWCwgY3AxWSwgY3AyWCwgY3AyWSwgZW5kWCwgZW5kWSlcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gIH0pXHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQ09MT1IgSEVMUEVSU1xyXG4vL3dvdWxkIGJlIG1vcmUgZWZmaWNpZW50IHRvIHRha2UgYXJncyBhcyB7cjogMC0yNTUsIGc6IDAtMjU1LCBiOjAtMjU1fVxyXG4vL3NvIG5vIG5lZWQgdGhlIGhleCBhcnJheSBzdHVmZiBidXQgb2sgZm9yIG5vdyBhcyBkcmF3aW5nXHJcbi8vYSBmZXcgaHVuZHJlZCBwYXJ0aWNsZXMgd2l0aG91dCBsYWdcclxuZnVuY3Rpb24gY29sb3JCZXR3ZWVuVHdvQ29sb3JzKHBlcmNlbnQsIGNvbG9yT25lLCBjb2xvclR3bykge1xyXG4gIGxldCBoZXggPSBbJzAnLCAnMScsICcyJywgJzMnLCAnNCcsICc1JywgJzYnLCAnNycsICc4JywgJzknLCAnYScsICdiJywgJ2MnLCAnZCcsICdlJywgJ2YnXVxyXG5cclxuICAvL2NvbG9yT25lXHJcbiAgbGV0IGMxUmVkSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCgxKSApXHJcbiAgbGV0IGMxUmVkSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCgyKSApXHJcbiAgbGV0IGMxUmVkQmFzZVRlbiA9IChjMVJlZEluZGV4MCAqIDE2KSArIChjMVJlZEluZGV4MSlcclxuXHJcbiAgbGV0IGMxR3JlZW5JbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JPbmUuY2hhckF0KDMpIClcclxuICBsZXQgYzFHcmVlbkluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoNCkgKVxyXG4gIGxldCBjMUdyZWVuZEJhc2VUZW4gPSAoYzFHcmVlbkluZGV4MCAqIDE2KSArIChjMUdyZWVuSW5kZXgxKVxyXG5cclxuICBsZXQgYzFCbHVlSW5kZXgwID0gaGV4LmluZGV4T2YoIGNvbG9yT25lLmNoYXJBdCg1KSApXHJcbiAgbGV0IGMxQmx1ZUluZGV4MSA9IGhleC5pbmRleE9mKCBjb2xvck9uZS5jaGFyQXQoNikgKVxyXG4gIGxldCBjMUJsdWVCYXNlVGVuID0gKGMxQmx1ZUluZGV4MCAqIDE2KSArIChjMUJsdWVJbmRleDEpXHJcblxyXG4gIC8vY29sb3JUd29cclxuICBsZXQgYzJSZWRJbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDEpIClcclxuICBsZXQgYzJSZWRJbmRleDEgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDIpIClcclxuICBsZXQgYzJSZWRCYXNlVGVuID0gKGMyUmVkSW5kZXgwICogMTYpICsgKGMyUmVkSW5kZXgxKVxyXG5cclxuICBsZXQgYzJHcmVlbkluZGV4MCA9IGhleC5pbmRleE9mKCBjb2xvclR3by5jaGFyQXQoMykgKVxyXG4gIGxldCBjMkdyZWVuSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCg0KSApXHJcbiAgbGV0IGMyR3JlZW5kQmFzZVRlbiA9IChjMkdyZWVuSW5kZXgwICogMTYpICsgKGMyR3JlZW5JbmRleDEpXHJcblxyXG4gIGxldCBjMkJsdWVJbmRleDAgPSBoZXguaW5kZXhPZiggY29sb3JUd28uY2hhckF0KDUpIClcclxuICBsZXQgYzJCbHVlSW5kZXgxID0gaGV4LmluZGV4T2YoIGNvbG9yVHdvLmNoYXJBdCg2KSApXHJcbiAgbGV0IGMyQmx1ZUJhc2VUZW4gPSAoYzJCbHVlSW5kZXgwICogMTYpICsgKGMyQmx1ZUluZGV4MSlcclxuXHJcbiAgbGV0IHJlZERlbHRhID0gYzJSZWRCYXNlVGVuIC0gYzFSZWRCYXNlVGVuXHJcbiAgbGV0IGdyZWVuRGVsdGEgPSBjMkdyZWVuZEJhc2VUZW4gLSBjMUdyZWVuZEJhc2VUZW5cclxuICBsZXQgYmx1ZURlbHRhID0gYzJCbHVlQmFzZVRlbiAtIGMxQmx1ZUJhc2VUZW5cclxuXHJcbiAgbGV0IHJlZE5vdyA9IE1hdGgucm91bmQoIGMxUmVkQmFzZVRlbiArIChyZWREZWx0YSAqIHBlcmNlbnQpIClcclxuICBsZXQgZ3JlZW5Ob3cgPSBNYXRoLnJvdW5kKCBjMUdyZWVuZEJhc2VUZW4gKyAoZ3JlZW5EZWx0YSAqIHBlcmNlbnQpIClcclxuICBsZXQgYmx1ZU5vdyA9IE1hdGgucm91bmQoIGMxQmx1ZUJhc2VUZW4gKyAoYmx1ZURlbHRhICogcGVyY2VudCkgKVxyXG5cclxuICByZXR1cm4ge3I6IHJlZE5vdywgZzogZ3JlZW5Ob3csIGI6IGJsdWVOb3d9Ly90ZW1wXHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVhQT1JUU1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICByYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzLFxyXG4gIHJhbmRQb2ludE5lYXJQb2ludCxcclxuICBjb29yZHNPblN0cmFpZ2h0TGluZSxcclxuICBjb29yZHNPbkN1YmljQmV6aWVyLFxyXG4gIGNvbG9yQmV0d2VlblR3b0NvbG9ycyxcclxuICAvL2RldlxyXG4gIHJlbmRlckJvdW5kaW5nQ2lyY2xlLFxyXG4gIHJlbmRlckhvbGRQYXR0ZXJuV1BzLFxyXG4gIHJlbmRlckhvbGRQYXR0ZXJuUGFydGljbGVQYXRoc1xyXG59XHJcbiIsImNvbnN0IENBUk9VU0VMX0RBVEEgPSBbXHJcbiAge3RleHQ6ICdGcmVlIENvZGUgQ2FtcCBQcm9qZWN0cycsIG5hdkl0ZW1zOiBbXHJcbiAgICB7dGV4dDogJ0ZDQyBQcm9qZWN0cyBQYWdlJywgZGVzYzogJ0EgcG9zc2libHkgcmVkdW5kYW50IHBhZ2Ugd2l0aCBsaW5rcyB0byBlYWNoIEZDQyBwcm9qZWN0JywgbGluazogJy9mY2MtcHJvamVjdHMnfSxcclxuICAgIHt0ZXh0OiAnQ2FsY3VsYXRvcicsIGRlc2M6ICdUZXNjbyBDYWxjdWxhdG9yIGxvb2thbGlrZXksIGZvciB0aGlzIEkgbWFpbmx5IGNvbmNlbnRyYXRlZCBvbiBzZWVpbmcgaG93IGNsb3NlIEkgY291bGQgaXQgbG9va2luZyB0byBzb21lb25lIGVsc2VzIGRlc2lnbi4nLCBsaW5rOiAnL2ZjYy1wcm9qZWN0cy1jYWxjdWxhdG9yJ30sXHJcbiAgICB7dGV4dDogJ1BvbW9kb3JvIFRpbWVyJywgZGVzYzogJ1ByZXR0eSBzdXJlIHRoaXMgdXNlZCB0byBzb3J0IG9mIHdvcmsnLCBsaW5rOiAnL2ZjYy1wcm9qZWN0cy1wb21vZG9ybyd9LFxyXG4gICAge3RleHQ6ICdTaW1vbiBHYW1lJywgZGVzYzogJ1dvcmtzLi4uLmlzaCcsIGxpbms6ICcvZmNjLXByb2plY3RzLXNpbW9uJ30sXHJcbiAgICB7dGV4dDogJ05vdWdodHMgQW5kIENyb3NzZXMnLCBkZXNjOiAnLi4ubWVoJywgbGluazogJy9mY2MtcHJvamVjdHMtdGljdGFjdG9lJ31cclxuICBdfSxcclxuICB7dGV4dDogJ01pc2MnLCBuYXZJdGVtczogW1xyXG4gICAge3RleHQ6ICdXaWRnZXRyb25zJywgZGVzYzogJ0hhbGYgZmluaXNoZWQgZ3ViYmlucyBhbmQgaWRlYXNhJywgbGluazogJy93aWRnZXRyb25zJ30sXHJcbiAgICB7dGV4dDogJ1ZhbicsIGRlc2M6ICdXaHkgSSBhbSBwb29yJywgbGluazogJy9jYW1wZXJ2YW4nfVxyXG4gIF19XHJcbl1cclxuY29uc3QgQ0FST1VTRUxfQ09MUyA9IDVcclxuY29uc3QgQ0FST1VTRUxfUk9XUyA9IDVcclxuY29uc3QgQ0VOVEVSX0NPTCA9IDJcclxuY29uc3QgQ0VOVEVSX1JPVyA9IDJcclxuXHJcbmxldCBjYXJvdXNlbENvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYXZpZ2F0b3JOYXZJdGVtcycpLy9tdXN0IGJlIG1hdGNoZWQgdG8gY2Fyb3VzZWwgY29udGFpbmVyIGVsZW1lbnRcclxubGV0IGNhcm91c2VsVmlzaWJsZUl0ZW1zXHJcbmxldCBzZWxlY3RlZENvbCA9IDBcclxubGV0IHNlbGVjdGVkUm93SW5Db2xzID0gW11cclxubGV0IGNhcm91c2VsRWxlbWVudHMgPSBbXVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLU1BTkFHRVJTXHJcbi8vaW5pdGlhbGl6ZVxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oZXZlbnQpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgQ0FST1VTRUxfREFUQS5sZW5ndGg7IGkrKykge1xyXG4gICAgc2VsZWN0ZWRSb3dJbkNvbHMucHVzaCgwKVxyXG4gIH1cclxuXHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IENBUk9VU0VMX0NPTFM7IGkrKykge1xyXG4gICAgY2Fyb3VzZWxFbGVtZW50cy5wdXNoKFtdKVxyXG4gICAgZm9yKGxldCBqID0gMDsgaiA8IENBUk9VU0VMX1JPV1M7IGorKykge1xyXG4gICAgICBjYXJvdXNlbEVsZW1lbnRzW2ldLnB1c2goZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgLmNhcm91c2VsSXRlbTpudGgtb2YtdHlwZSgkezEgKyBpfW4pIC5uYXZJdGVtYClbal0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZW5kZXIoKVxyXG59KVxyXG5cclxuXHJcbmZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxuICByZW1vdmVDYXJvdXNlbENlbGxzKClcclxuICByZW1vdmVDYXJvdXNlbENvbHVtbnMoKVxyXG4gIG1ha2VDYXJvdXNlbENvbHVtbnMoKVxyXG4gIG1ha2VDYXJvdXNlbENlbGxzKClcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxuICBwb3B1bGF0ZUNhcm91c2VsQ29sdW1ucygpXHJcbiAgcG9wdWxhdGVDYXJvdXNlbENlbGxzKClcclxuICBhZGRDbGlja2FibGVOYXYoKVxyXG4gIHVwZGF0ZUNhcm91c2VsU3RhdGUoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gbGVmdCgpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgY2Fyb3VzZWxWaXNpYmxlSXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGNhcm91c2VsVmlzaWJsZUl0ZW1zW2ldLmNsYXNzTGlzdC5hZGQoJ21vdmVkTGVmdCcpXHJcbiAgfVxyXG5cclxuICBkZWNIb3JpeigpXHJcbiAgdXBkYXRlQ2Fyb3VzZWxTdGF0ZSgpXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiByaWdodCgpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgY2Fyb3VzZWxWaXNpYmxlSXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGNhcm91c2VsVmlzaWJsZUl0ZW1zW2ldLmNsYXNzTGlzdC5hZGQoJ21vdmVkUmlnaHQnKVxyXG4gIH1cclxuXHJcbiAgaW5jSG9yaXooKVxyXG4gIHVwZGF0ZUNhcm91c2VsU3RhdGUoKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gdXAoKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IGNhcm91c2VsRWxlbWVudHNbQ0VOVEVSX0NPTF0ubGVuZ3RoOyBpKyspIHtcclxuICAgIGNhcm91c2VsRWxlbWVudHNbQ0VOVEVSX0NPTF1baV0uY2xhc3NMaXN0LmFkZCgnbW92ZWRVcCcpXHJcbiAgfVxyXG5cclxuICBpbmNWZXJ0KClcclxuICB1cGRhdGVDYXJvdXNlbFN0YXRlKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGRvd24oKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IGNhcm91c2VsRWxlbWVudHNbQ0VOVEVSX0NPTF0ubGVuZ3RoOyBpKyspIHtcclxuICAgIGNhcm91c2VsRWxlbWVudHNbQ0VOVEVSX0NPTF1baV0uY2xhc3NMaXN0LmFkZCgnbW92ZWREb3duJylcclxuICB9XHJcblxyXG4gIGRlY1ZlcnQoKVxyXG4gIHVwZGF0ZUNhcm91c2VsU3RhdGUoKVxyXG59XHJcblxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUhFTFBFUlNcclxuZnVuY3Rpb24gcmVtb3ZlQ2Fyb3VzZWxDb2x1bW5zKCkge1xyXG4gIHdoaWxlKGNhcm91c2VsQ29udGFpbmVyLmZpcnN0Q2hpbGQpIHtcclxuICAgIGNhcm91c2VsQ29udGFpbmVyLnJlbW92ZUNoaWxkKGNhcm91c2VsQ29udGFpbmVyLmZpcnN0Q2hpbGQpXHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcmVtb3ZlQ2Fyb3VzZWxDZWxscygpIHtcclxuICBmb3IobGV0IGkgPSAwOyBpIDwgY2Fyb3VzZWxWaXNpYmxlSXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgIHdoaWxlKGNhcm91c2VsVmlzaWJsZUl0ZW1zW2ldLmZpcnN0Q2hpbGQpIHtcclxuICAgICAgY2Fyb3VzZWxWaXNpYmxlSXRlbXNbaV0ucmVtb3ZlQ2hpbGQoY2Fyb3VzZWxWaXNpYmxlSXRlbXNbaV0uZmlyc3RDaGlsZClcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBtYWtlQ2Fyb3VzZWxDb2x1bW5zKCkge1xyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBDQVJPVVNFTF9DT0xTOyBpKyspIHtcclxuICAgIGxldCBuZXdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgIG5ld0VsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2Fyb3VzZWxJdGVtJylcclxuICAgIG5ld0VsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIHJlbmRlcilcclxuICAgIGNhcm91c2VsQ29udGFpbmVyLmFwcGVuZENoaWxkKG5ld0VsZW1lbnQpXHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gbWFrZUNhcm91c2VsQ2VsbHMoKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IENBUk9VU0VMX0NPTFM7IGkrKykge1xyXG4gICAgZm9yKGxldCBqID0gMDsgaiA8IENBUk9VU0VMX1JPV1M7IGorKykge1xyXG4gICAgICBsZXQgbmV3RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgIG5ld0VsZW1lbnQuY2xhc3NMaXN0LmFkZCgnbmF2SXRlbScpXHJcbiAgICAgIG5ld0VsZW1lbnQuY2xhc3NMaXN0LmFkZCgnY2VudGVyZWQnKVxyXG4gICAgICBuZXdFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCByZW5kZXIpXHJcbiAgICAgIGNhcm91c2VsVmlzaWJsZUl0ZW1zW2pdLmFwcGVuZENoaWxkKG5ld0VsZW1lbnQpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gdXBkYXRlQ2Fyb3VzZWxTdGF0ZSgpIHtcclxuICBjYXJvdXNlbFZpc2libGVJdGVtcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2Nhcm91c2VsSXRlbScpXHJcblxyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBDQVJPVVNFTF9DT0xTOyBpKyspIHtcclxuICAgIGZvcihsZXQgaiA9IDA7IGogPCBDQVJPVVNFTF9ST1dTOyBqKyspIHtcclxuICAgICAgY2Fyb3VzZWxFbGVtZW50c1tpXVtqXSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYC5jYXJvdXNlbEl0ZW06bnRoLW9mLXR5cGUoJHsxICsgaX1uKSAubmF2SXRlbWApW2pdXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gaW5jSG9yaXooKSB7XHJcbiAgc2VsZWN0ZWRDb2wgPSBzZWxlY3RlZENvbCA9PT0gQ0FST1VTRUxfREFUQS5sZW5ndGggLSAxID8gMCA6IHNlbGVjdGVkQ29sICsgMVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZGVjSG9yaXooKSB7XHJcbiAgc2VsZWN0ZWRDb2wgPSBzZWxlY3RlZENvbCA9PT0gMCA/IENBUk9VU0VMX0RBVEEubGVuZ3RoIC0gMSA6IHNlbGVjdGVkQ29sIC0gMVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gaW5jVmVydCgpIHtcclxuICBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gPSBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gPT09IENBUk9VU0VMX0RBVEFbc2VsZWN0ZWRDb2xdLm5hdkl0ZW1zLmxlbmd0aCAtIDEgPyAwIDogc2VsZWN0ZWRSb3dJbkNvbHNbc2VsZWN0ZWRDb2xdICsgMVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZGVjVmVydCgpIHtcclxuICBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gPSBzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gPT09IDAgPyBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS5uYXZJdGVtcy5sZW5ndGggLSAxIDogc2VsZWN0ZWRSb3dJbkNvbHNbc2VsZWN0ZWRDb2xdIC0gMVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gcG9wdWxhdGVDYXJvdXNlbENvbHVtbnMoKSB7Ly9kb2Vzbid0IGRvIGFueXRoaW5nIGF0IHByZXNlbnQgYnV0IGxlYXZlIGluIGZvciBsYXRlclxyXG4gIGZvcihsZXQgaSA9IDA7IGkgPCBDQVJPVVNFTF9DT0xTOyBpKyspIHtcclxuICAgIGxldCB4ID0gc2VsZWN0ZWRDb2wgKyBpICsgQ0FST1VTRUxfREFUQS5sZW5ndGggLSAyXHJcbiAgICB3aGlsZSh4ID49IENBUk9VU0VMX0RBVEEubGVuZ3RoKSB7eCA9IHggLSBDQVJPVVNFTF9EQVRBLmxlbmd0aH1cclxuXHJcbiAgICAvL2Nhcm91c2VsVmlzaWJsZUl0ZW1zW0NBUk9VU0VMX0NPTFMgLSAxIC0gaV0uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gQ0FST1VTRUxfREFUQVt4XS5iZ0NvbG9yXHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBwb3B1bGF0ZUNhcm91c2VsQ2VsbHMoKSB7XHJcbiAgZm9yKGxldCBpID0gMDsgaSA8IENBUk9VU0VMX0NPTFM7IGkrKykge1xyXG4gICAgbGV0IHggPSBzZWxlY3RlZENvbCArIGkgKyBDQVJPVVNFTF9EQVRBLmxlbmd0aCAtIDJcclxuICAgIHdoaWxlKHggPj0gQ0FST1VTRUxfREFUQS5sZW5ndGgpIHt4ID0geCAtIENBUk9VU0VMX0RBVEEubGVuZ3RofVxyXG5cclxuICAgIGZvcihsZXQgaiA9IDA7IGogPCBDQVJPVVNFTF9ST1dTOyBqKyspIHtcclxuICAgICAgbGV0IHkgPSBzZWxlY3RlZFJvd0luQ29sc1t4XSArIGpcclxuICAgICAgd2hpbGUoeSA+PSBDQVJPVVNFTF9EQVRBW3hdLm5hdkl0ZW1zLmxlbmd0aCkge3kgPSB5IC0gQ0FST1VTRUxfREFUQVt4XS5uYXZJdGVtcy5sZW5ndGh9XHJcblxyXG4gICAgICBjYXJvdXNlbEVsZW1lbnRzW0NBUk9VU0VMX0NPTFMgLSAxIC0gaV1bal0uaW5uZXJIVE1MID0gQ0FST1VTRUxfREFUQVt4XS5uYXZJdGVtc1t5XS50ZXh0XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gYWRkQ2xpY2thYmxlTmF2KCkge1xyXG4gIGNhcm91c2VsRWxlbWVudHNbQ0VOVEVSX0NPTF1bQ0VOVEVSX1JPV10uY2xhc3NMaXN0LmFkZCgnY2VudGVyQ2xpY2thYmxlQ2VsbCcpXHJcblxyXG4gIGxldCB5ID0gW3NlbGVjdGVkUm93SW5Db2xzW3NlbGVjdGVkQ29sXSArIENFTlRFUl9ST1ddXHJcbiAgd2hpbGUoeSA+PSBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS5uYXZJdGVtcy5sZW5ndGgpIHt5ID0geSAtIENBUk9VU0VMX0RBVEFbc2VsZWN0ZWRDb2xdLm5hdkl0ZW1zLmxlbmd0aH1cclxuXHJcbiAgY2Fyb3VzZWxFbGVtZW50c1tDRU5URVJfQ09MXVtDRU5URVJfUk9XXS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XHJcbiAgICBsb2NhdGlvbi5ocmVmID0gQ0FST1VTRUxfREFUQVtzZWxlY3RlZENvbF0ubmF2SXRlbXNbeV0ubGlua1xyXG4gIH0sIGZhbHNlKVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gZ2V0TmF2VG9waWNUZXh0KCkge1xyXG4gIHJldHVybiBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS50ZXh0XHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBnZXROYXZJdGVtVGV4dCgpIHtcclxuICBsZXQgeSA9IFtzZWxlY3RlZFJvd0luQ29sc1tzZWxlY3RlZENvbF0gKyBDRU5URVJfUk9XXVxyXG4gIHdoaWxlKHkgPj0gQ0FST1VTRUxfREFUQVtzZWxlY3RlZENvbF0ubmF2SXRlbXMubGVuZ3RoKSB7eSA9IHkgLSBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS5uYXZJdGVtcy5sZW5ndGh9XHJcblxyXG4gIHJldHVybiBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS5uYXZJdGVtc1t5XS50ZXh0LnRvVXBwZXJDYXNlKClcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGdldE5hdkl0ZW1EZXNjKCkge1xyXG4gIGxldCB5ID0gW3NlbGVjdGVkUm93SW5Db2xzW3NlbGVjdGVkQ29sXSArIENFTlRFUl9ST1ddXHJcbiAgd2hpbGUoeSA+PSBDQVJPVVNFTF9EQVRBW3NlbGVjdGVkQ29sXS5uYXZJdGVtcy5sZW5ndGgpIHt5ID0geSAtIENBUk9VU0VMX0RBVEFbc2VsZWN0ZWRDb2xdLm5hdkl0ZW1zLmxlbmd0aH1cclxuXHJcbiAgcmV0dXJuIENBUk9VU0VMX0RBVEFbc2VsZWN0ZWRDb2xdLm5hdkl0ZW1zW3ldLmRlc2NcclxufVxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tRVhQT1JUU1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICB1cCxcclxuICBkb3duLFxyXG4gIGxlZnQsXHJcbiAgcmlnaHQsXHJcbiAgZ2V0TmF2VG9waWNUZXh0LFxyXG4gIGdldE5hdkl0ZW1UZXh0LFxyXG4gIGdldE5hdkl0ZW1EZXNjXHJcbn1cclxuIiwiLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1DT09SRFMgQVMgUkFUSU8gQU5EIFZFQ1RPUiBQT0lOVCBBVFNcclxubGV0IGxldHRlcnNDb29yZHMgPSB7XHJcbiAgQTogW1xyXG4gICAge3g6IDAuMTI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgICAvLzFcclxuICAgIHt4OiAwLjM3NSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC41fSwgICAvLzRcclxuICAgIHt4OiAwLjg3NSwgeTogMC44NzV9IC8vNVxyXG4gIF0sXHJcbiAgQjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzBcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LCAgLy8xXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuMjV9LCAvLzNcclxuICAgIHt4OiAwLjc1LCB5OiAwLjc1fSAgLy80XHJcbiAgXSxcclxuICBDOiBbXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNjI1fSwvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjM3NX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9IC8vM1xyXG4gIF0sXHJcbiAgRDogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwgLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjUgfSwvLzFcclxuICAgIHt4OiAwLjc1LCB5OiAwLjM3NX0sIC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuNjI1fSAgLy8zXHJcbiAgXSxcclxuICBFOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0sICAvLzRcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0gLy81XHJcbiAgXSxcclxuICBGOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LC8vMFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sICAvLzFcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8yXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LC8vM1xyXG4gICAge3g6IDAuNzUsIHk6IDAuNX0gICAvLzRcclxuICBdLFxyXG4gIEc6IFtcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC42MjV9LC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMzc1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC42MjUsIHk6IDAuNX0sIC8vNFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjV9ICAvLzVcclxuICBdLFxyXG4gIEg6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSwgIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSwvLzJcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC41fSwgIC8vNFxyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSAvLzVcclxuICBdLFxyXG4gIEk6IFtcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sLy8wXHJcbiAgICB7eDogMC41LCB5OiAwLjg3NX0sIC8vMVxyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSwvLzJcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8zXHJcbiAgICB7eDogMC41LCB5OiAwLjEyNX0sIC8vNFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSAvLzVcclxuICBdLFxyXG4gIEo6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjc1fSxcclxuICAgIHt4OiAwLjM3NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNSwgeTogMC43NX0sXHJcbiAgICB7eDogMC41LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fVxyXG4gIF0sXHJcbiAgSzogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4yNX1cclxuICBdLFxyXG4gIEw6IFtcclxuICAgIHt4OiAwLjc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fVxyXG4gIF0sXHJcbiAgTTogW1xyXG4gICAge3g6IDAuMTI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNSwgeTogMC43NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjg3NX1cclxuICBdLFxyXG4gIE46IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIE86IFtcclxuICAgIHt4OiAwLjM3NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMTI1LCB5OiAwLjYyNX0sXHJcbiAgICB7eDogMC4xMjUsIHk6IDAuMzc1fSxcclxuICAgIHt4OiAwLjM3NSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuMzc1fSxcclxuICAgIHt4OiAwLjg3NSwgeTogMC42MjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjg3NX1cclxuICBdLFxyXG4gIFA6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC41fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjM3NX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuNX1cclxuICBdLFxyXG4gIFE6IFtcclxuICAgIHt4OiAwLjM3NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMTI1LCB5OiAwLjYyNX0sXHJcbiAgICB7eDogMC4xMjUsIHk6IDAuMzc1fSxcclxuICAgIHt4OiAwLjM3NSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC44NzUsIHk6IDAuMzc1fSxcclxuICAgIHt4OiAwLjg3NSwgeTogMC42MjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC42MjUsIHk6IDAuNjI1fSxcclxuICAgIHt4OiAwLjg3NSwgeTogMC44NzV9XHJcbiAgXSxcclxuICBSOiBbXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuMjUsIHk6IDAuNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4yNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4zNzV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fVxyXG4gIF0sXHJcbiAgUzogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuNzV9LCAgLy8wXHJcbiAgICB7eDogMC4zNzUsIHk6IDAuODc1fSwvLzFcclxuICAgIHt4OiAwLjYyNSwgeTogMC44NzV9LC8vMlxyXG4gICAge3g6IDAuNzUsIHk6IDAuNzV9LCAgLy8zXHJcbiAgICB7eDogMC43NSwgeTogMC42MjV9LCAvLzRcclxuICAgIHt4OiAwLjYyNSwgeTogMC41fSwgIC8vNVxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjV9LCAgLy82XHJcbiAgICB7eDogMC4yNSwgeTogMC4zNzV9LCAvLzdcclxuICAgIHt4OiAwLjI1LCB5OiAwLjI1fSwgIC8vOFxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjEyNX0sLy85XHJcbiAgICB7eDogMC42MjUsIHk6IDAuMTI1fSwvLzEwXHJcbiAgICB7eDogMC43NSwgeTogMC4yNX0gICAvLzExXHJcbiAgXSxcclxuICBUOiBbXHJcbiAgICB7eDogMC41LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC41LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fVxyXG4gIF0sXHJcbiAgVTogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjc1fSxcclxuICAgIHt4OiAwLjM3NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNjI1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC43NX0sXHJcbiAgICB7eDogMC43NSwgeTogMC4xMjI1fVxyXG4gIF0sXHJcbiAgVjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIFc6IFtcclxuICAgIHt4OiAwLjEyNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuMzc1LCB5OiAwLjg3NX0sXHJcbiAgICB7eDogMC41LCB5OiAwLjI1fSxcclxuICAgIHt4OiAwLjYyNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuODc1LCB5OiAwLjEyNX1cclxuICBdLFxyXG4gIFg6IFtcclxuICAgIHt4OiAwLjI1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC43NSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjI1LCB5OiAwLjg3NX1cclxuICBdLFxyXG4gIFk6IFtcclxuICAgIHt4OiAwLjUsIHk6IDAuODc1fSxcclxuICAgIHt4OiAwLjUsIHk6IDAuNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC4xMjV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuMTI1fVxyXG4gIF0sXHJcbiAgWjogW1xyXG4gICAge3g6IDAuMjUsIHk6IDAuMTI1fSxcclxuICAgIHt4OiAwLjc1LCB5OiAwLjEyNX0sXHJcbiAgICB7eDogMC4yNSwgeTogMC44NzV9LFxyXG4gICAge3g6IDAuNzUsIHk6IDAuODc1fVxyXG4gIF0sXHJcbiAgXCIgXCI6IFtdLy9lbmFibGVzIGhhdmluZyBzcGFjZXMgYmV0d2VlbiBsZXR0ZXJzXHJcbn1cclxuXHJcblxyXG5sZXQgbGV0dGVyc1ZlY3RvcnMgPSB7XHJcbiAgQTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBCOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IC00fVxyXG4gIF0sXHJcbiAgQzogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBEOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTN9XHJcbiAgXSxcclxuICBFOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTV9XHJcbiAgXSxcclxuICBGOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMn0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogM30sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIEc6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtNX1cclxuICBdLFxyXG4gIEg6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAzfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgSTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDN9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDJ9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBKOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIEs6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtM31cclxuICBdLFxyXG4gIEw6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgTTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBOOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIE86IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtN31cclxuICBdLFxyXG4gIFA6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtNX1cclxuICBdLFxyXG4gIFE6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtN30sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIFI6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAyfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAtNX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTF9XHJcbiAgXSxcclxuICBTOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIFQ6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgVTogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBWOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdLFxyXG4gIFc6IFtcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IHRydWUsIGluZGV4T2Zmc2V0OiAxfSxcclxuICAgIHtoYXNWZWN0b3I6IGZhbHNlfVxyXG4gIF0sXHJcbiAgWDogW1xyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9LFxyXG4gICAge2hhc1ZlY3RvcjogdHJ1ZSwgaW5kZXhPZmZzZXQ6IDF9LFxyXG4gICAge2hhc1ZlY3RvcjogZmFsc2V9XHJcbiAgXSxcclxuICBZOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogLTJ9XHJcbiAgXSxcclxuICBaOiBbXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiB0cnVlLCBpbmRleE9mZnNldDogMX0sXHJcbiAgICB7aGFzVmVjdG9yOiBmYWxzZX1cclxuICBdXHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUVYUE9SVEVEIEZVTkNUSU9OU1xyXG5mdW5jdGlvbiB0b3RhbFJlcXVpcmVkUGFydGljbGVzKHN0cikge1xyXG4gIGxldCByZXF1aXJlZFBhcnRpY2xlcyA9IDBcclxuXHJcbiAgZm9yKGkgaW4gc3RyKSB7XHJcbiAgICByZXF1aXJlZFBhcnRpY2xlcyArPSBsZXR0ZXJzQ29vcmRzW3N0ci5jaGFyQXQoaSldLmxlbmd0aFxyXG4gIH1cclxuXHJcbiAgY29uc29sZS5sb2coXCJ0b3RhbCByZXF1aXJlZFBhcnRpY2xlczogXCIgKyByZXF1aXJlZFBhcnRpY2xlcylcclxuICByZXR1cm4gcmVxdWlyZWRQYXJ0aWNsZXNcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIHBsYWNlV29yZHNJblJvd3Moc3RyLCBtYXhDaGFyc0luUm93KSB7XHJcbiAgbGV0IHdvcmRzID0gc3RyLnNwbGl0KFwiIFwiKVxyXG4gIGxldCByb3dzID0gW1wiXCJdXHJcbiAgbGV0IHJvd3NJbmRleCA9IDBcclxuXHJcbiAgd29yZHMuZm9yRWFjaCgod29yZCwgaW5kZXgpID0+IHtcclxuICAgIGlmKHJvd3Nbcm93c0luZGV4XS5sZW5ndGggKyB3b3JkLmxlbmd0aCArIDEgPD0gbWF4Q2hhcnNJblJvdykge1xyXG4gICAgICByb3dzW3Jvd3NJbmRleF0gPSBpbmRleCA9PT0gMCA/IHJvd3Nbcm93c0luZGV4XSArIHdvcmQgOiByb3dzW3Jvd3NJbmRleF0gKyBcIiBcIiArIHdvcmRcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJvd3MucHVzaCh3b3JkKVxyXG4gICAgICByb3dzSW5kZXgrK1xyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIHJldHVybiByb3dzXHJcbn1cclxuXHJcblxyXG5mdW5jdGlvbiBjYWxjTGV0dGVyUGFydGljbGVzRGVzdEFuZFRhcmdldHMod29yZHNJblJvd3MsIGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpIHtcclxuICBsZXQgY2hhcldpZHRoID0gTWF0aC5yb3VuZCggY2FudmFzV2lkdGggLyAobG9uZ2VzdEVsZW1lbnRMZW5ndGgod29yZHNJblJvd3MpICsgMikgKVxyXG4gIGxldCBjaGFySGVpZ2h0ID0gTWF0aC5yb3VuZChjaGFyV2lkdGggKiAxLjIpXHJcbiAgbGV0IHRvdGFsUm93c0hlaWdodCA9IGNoYXJIZWlnaHQgKiAod29yZHNJblJvd3MubGVuZ3RoICsgMSlcclxuICBsZXQgZmluYWxDb29yZHNBbmRQb2ludHNBdHMgPSBbXVxyXG5cclxuICBmb3IobGV0IHJvdyBpbiB3b3Jkc0luUm93cykge1xyXG4gICAgbGV0IHJvd1N0YXJ0WCA9IChjYW52YXNXaWR0aCAvIDIpIC0gKHdvcmRzSW5Sb3dzW3Jvd10ubGVuZ3RoICogY2hhcldpZHRoIC8gMilcclxuICAgIGxldCByb3dTdGFydFkgPSAoY2FudmFzSGVpZ2h0IC8gMikgLSAodG90YWxSb3dzSGVpZ2h0IC8gMikgKyAocm93ICogY2hhckhlaWdodClcclxuXHJcbiAgICBmb3IobGV0IGxldHRlclBvcyA9IDA7IGxldHRlclBvcyA8IHdvcmRzSW5Sb3dzW3Jvd10ubGVuZ3RoOyBsZXR0ZXJQb3MrKykge1xyXG4gICAgICBsZXQgY2hhckhlcmUgPSB3b3Jkc0luUm93c1tyb3ddLmNoYXJBdChsZXR0ZXJQb3MpXHJcbiAgICAgIGxldCBuQ2hhclBhcnRpY2xlcyA9IGxldHRlcnNDb29yZHNbY2hhckhlcmVdLmxlbmd0aFxyXG5cclxuICAgICAgZm9yKGxldCBwb3NJbkNoYXIgPSAwOyBwb3NJbkNoYXIgPCBuQ2hhclBhcnRpY2xlczsgcG9zSW5DaGFyKyspIHtcclxuICAgICAgICBsZXQgeDEgPSByb3dTdGFydFggKyAobGV0dGVyUG9zICogY2hhcldpZHRoKSArIChjaGFyV2lkdGggKiBsZXR0ZXJzQ29vcmRzW2NoYXJIZXJlXVtwb3NJbkNoYXJdLngpXHJcbiAgICAgICAgbGV0IHkxID0gcm93U3RhcnRZICsgKGNoYXJIZWlnaHQgKiBsZXR0ZXJzQ29vcmRzW2NoYXJIZXJlXVtwb3NJbkNoYXJdLnkpXHJcbiAgICAgICAgbGV0IHBvaW50c0F0ID0gZmFsc2VcclxuXHJcbiAgICAgICAgaWYobGV0dGVyc1ZlY3RvcnNbY2hhckhlcmVdW3Bvc0luQ2hhcl0uaGFzVmVjdG9yID09PSB0cnVlKSB7XHJcbiAgICAgICAgICBwb2ludHNBdCA9IGxldHRlcnNWZWN0b3JzW2NoYXJIZXJlXVtwb3NJbkNoYXJdLmluZGV4T2Zmc2V0XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmaW5hbENvb3Jkc0FuZFBvaW50c0F0cy5wdXNoKHt4MTogeDEsIHkxOiB5MSwgcG9pbnRzQXQ6IHBvaW50c0F0fSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGZpbmFsQ29vcmRzQW5kUG9pbnRzQXRzXHJcbn1cclxuXHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUlOVEVSTkFMIEZVTkNUSU9OU1xyXG5mdW5jdGlvbiBsb25nZXN0RWxlbWVudExlbmd0aChhcnIpIHtcclxuICBsZXQgbGVuZ3RoID0gMFxyXG4gIGFyci5mb3JFYWNoKGVsID0+IHtcclxuICAgIGxlbmd0aCA9IGVsLmxlbmd0aCA+PSBsZW5ndGggPyBlbC5sZW5ndGggOiBsZW5ndGhcclxuICB9KVxyXG4gIHJldHVybiBsZW5ndGhcclxufVxyXG5cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1FWFBPUlRTXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHBsYWNlV29yZHNJblJvd3MsXHJcbiAgdG90YWxSZXF1aXJlZFBhcnRpY2xlcyxcclxuICBjYWxjTGV0dGVyUGFydGljbGVzRGVzdEFuZFRhcmdldHNcclxufVxyXG4iXX0=
