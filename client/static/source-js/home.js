const canvasHelpers = require('./utils/canvasHelpers.js')

let body = document.getElementsByTagName('body')[0]
let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')

let canvasWidth
let canvasHeight

//Holding pattern WP coords as ratio of canvas size
let holdingPatternWaypoints = [
  {x: 0.125, y: 0.5},//0
  {x: 0.25, y: 0.125},//1
  {x: 0.75, y: 0.125},//2
  {x: 0.875, y: 0.5},//3
  {x: 0.75, y: 0.875},//4
  {x: 0.25, y: 0.875}//5
]

//Holding pattern WP coords in pixels, recalcumalated on resize
let holdingPatternWaypointsActual = []

//Particles move about between these arrays, changing behaviour as thy do
let holdingPatternParticles = []

//------------------------------------------------------------------BREAK POINTS
function setLayout() {
  console.log(`body.clientWidth: ${body.clientWidth}, body.clientHeight: ${body.clientHeight}`)

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

  //move this lot somewhere more betterer
  initHoldingPatternWaypointsActual()
  createRandomHoldingPatternParticle()
  canvasHelpers.renderBoundingCircle(ctx1, canvasWidth, canvasHeight)
  canvasHelpers.renderHoldPatternWPs(ctx1, holdingPatternWaypointsActual)
  canvasHelpers.renderChosenHoldPatternParticlePath(ctx1, holdingPatternParticles[0])
}

function initHoldingPatternWaypointsActual() {
  holdingPatternWaypointsActual.length = 0
  holdingPatternWaypointsActual = holdingPatternWaypoints.map(el => {
    let x = el.x * canvasWidth
    let y = el.y * canvasHeight
    return {x: x, y: y}
  })
}

//------------------------------------------------------------PARTICLE CLASSES
class Particle {
  constructor(coords, age, speed) {
    this.coords = coords
    this.age = age
    this.speed = speed
  }
  listProps() {//temp method for testing
    for (let key in this) {
      console.log(`${key}: ${this[key]}`)
    }
  }
}

class PathFollowingParticle extends Particle {
  constructor(coords, age, speed, endCoords, distMoved) {
    super(coords, age, speed)
    this.endCoords = endCoords
    this.distMoved = distMoved
  }
}

class HoldingPatternParticle extends PathFollowingParticle {
  constructor(coords, age, speed, endCoords, distMoved, cp1Coords, cp2Coords) {
    super(coords, age, speed, endCoords, distMoved)
    this.cp1Coords = cp1Coords
    this.cp2Coords = cp2Coords
  }
}

function createRandomHoldingPatternParticle() {
  let randomWP = Math.floor(Math.random() * 6)

  let age = 0
  let speed = 10
  let distMoved = 0//randomise 0-1??
  let coords = holdingPatternWaypointsActual[randomWP]
  let endCoords = randomWP === 5 ? holdingPatternWaypointsActual[0] : holdingPatternWaypointsActual[randomWP + 1]
  let cp1Coords = randControlPoint(coords, endCoords)
  let cp2Coords = randControlPoint(coords, endCoords)

  function randControlPoint(p1, p2) {
    let a = p2.x - p1.x
    let b = p2.y - p1.y
    let p1P2Dist = Math.sqrt(a*a + b*b)
    let randDist = (Math.random() * p1P2Dist * 0.5) + 40
    let p1P2Angle
    let randAngle
    let coords = {x: null, y: null}

    if(Math.random() >= 0.5) {
      tPoint = 'p2'
      p1P2Angle = Math.atan2(p2.y - p1.y, p1.x - p2.x)
    } else {
      p1P2Angle = Math.atan2(p1.y - p2.y, p2.x - p1.x)
      tPoint = 'p1'
    }

    randAngle = p1P2Angle - (Math.PI / 2) + (Math.random() * Math.PI)

    if (tPoint === 'p1') {
      coords.x = p1.x + Math.cos(randAngle) * randDist
      coords.y = p1.y - Math.sin(randAngle) * randDist
    }
    if (tPoint === 'p2') {
      coords.x = p2.x + Math.cos(randAngle) * randDist
      coords.y = p2.y - Math.sin(randAngle) * randDist
    }

    return coords
  }

  let particle = new HoldingPatternParticle(coords, age, speed, endCoords, distMoved, cp1Coords, cp2Coords)
  holdingPatternParticles.push(particle)
}

//function to goes over every holdingPatternParticle in
//holdingPatternArray and implements some behaviour

//function that populates holdingPatternWaypoints

//function that updates each particles x & y on window resize

document.addEventListener("DOMContentLoaded", setLayout)
window.addEventListener('resize', setLayout)
