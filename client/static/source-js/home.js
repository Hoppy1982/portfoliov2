const canvasHelpers = require('./utils/canvas-helpers.js')
const lettersLib = require('./utils/letters-lib.js')

let body = document.getElementsByTagName('body')[0]
let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')
let navGoToButton = document.getElementById('navigatorDesc')//dev
let frameId
let canvasWidth
let canvasHeight

//as percent of canvas size
let holdPatternWaypoints = [
  {x: 0.125, y: 0.5},//0
  {x: 0.25, y: 0.125},//1
  {x: 0.75, y: 0.125},//2
  {x: 0.875, y: 0.5},//3
  {x: 0.75, y: 0.875},//4
  {x: 0.25, y: 0.875}//5
]
let holdPatternWaypointsActual = []//hold pattern WP coords in pixels, recalcumalated on resize
let navTargetOrigin = {x: null, y: null}
let navTargetCharSize = {width: null, height: null}

let holdPatternParticles = []
let navTargetParticles = []

let navTargetWord = 'BAD BAD GIBED BEEBEEBAA'//dev temp

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
  initHoldPatternParticles(120)
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
    particle.drawToPointsAt(index, '#1f2633', '#ff0000')
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
      let age = transferringParticle.age
      let speed = transferringParticle.speed
      let distMoved = 0
      let pointsAt = destinationsAndTargets[i].pointsAt
      navTargetParticles.push(new CharPatternParticle(coords, age, speed, distMoved, pointsAt))
    }

  }
}


//--------------------------------------------------------------PARTICLE CLASSES
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
        let pointsAtX = navTargetParticles[index + this.pointsAt].coords.x//these two lines are fucking things somehow deleting the last particle in the char I think
        let pointsAtY = navTargetParticles[index + this.pointsAt].coords.y
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
