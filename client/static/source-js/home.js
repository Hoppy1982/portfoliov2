const canvasHelpers = require('./utils/canvas-helpers.js')

let body = document.getElementsByTagName('body')[0]
let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')
let frameId
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

//Particles move about between these arrays, changing behaviour as they do
let holdingPatternParticles = []
//array for nav target lettering particles
//array for spawning pool particles
//array for wormhole leaving particles
//array for particles transitioning between main arrays???

//----------------------------------------------------------------------MANAGERS
//possibly split this into a function that fires just once on dom load,
//then another manager that runs on resizing?
function init() {
  setLayout()
  initHoldingPatternWaypointsActual()
  for(let i = 400; i > 0; i--) {
    createRandomHoldingPatternParticle()
  }
  animate()
}

function initHoldingPatternWaypointsActual() {
  holdingPatternWaypointsActual.length = 0
  holdingPatternWaypointsActual = holdingPatternWaypoints.map(el => {
    let x = el.x * canvasWidth
    let y = el.y * canvasHeight
    return {x: x, y: y}
  })
}

//--------------------------------------------UPDATE PARTICLE POSITIONS & RENDER
function animate() {
  let t0 = performance.now()
  frameId = requestAnimationFrame(animate)
  ctx1.clearRect(0, 0, canvasWidth, canvasHeight)

  canvasHelpers.renderBoundingCircle(ctx1, canvasWidth, canvasHeight)
  //canvasHelpers.renderHoldPatternWPs(ctx1, holdingPatternWaypointsActual)
  //canvasHelpers.renderHoldPatternParticlePaths(ctx1, holdingPatternParticles)
  updateHoldPattern()
  let t1 = performance.now()
  console.log('Performance: ' + (t1 - t0))
}

function updateHoldPattern() {
  holdingPatternParticles.forEach(particle => {
    particle.distMoved = particle.distMoved + particle.speed

    //wants moved / tidied. Maybe to holdingPatternParticle class??
    if(particle.distMoved >= 1) {
      particle.distMoved = 0
      particle.startCoords.x = particle.endCoords.x
      particle.startCoords.y = particle.endCoords.y
      particle.coords.x = particle.startCoords.x
      particle.coords.y = particle.startCoords.y

      particle.fromWP = particle.fromWP + 1
      if(particle.fromWP === holdingPatternWaypoints.length) {particle.fromWP = 0}
      particle.toWP = particle.toWP + 1
      if(particle.toWP === holdingPatternWaypoints.length) {particle.toWP = 0}
      console.log(`fromWP: ${particle.fromWP} , toWP: ${particle.toWP}`)

      particle.endCoords.x = holdingPatternWaypointsActual[particle.toWP].x
      particle.endCoords.y = holdingPatternWaypointsActual[particle.toWP].y

      particle.cp1Coords = canvasHelpers.randPointBetweenTwoPoints(particle.startCoords, particle.endCoords)
      particle.cp2Coords = canvasHelpers.randPointBetweenTwoPoints(particle.startCoords, particle.endCoords)
    }

    particle.coords.x = canvasHelpers.coordsOnCubicBezier(particle.distMoved, particle.startCoords.x, particle.cp1Coords.x, particle.cp2Coords.x, particle.endCoords.x)
    particle.coords.y = canvasHelpers.coordsOnCubicBezier(particle.distMoved, particle.startCoords.y, particle.cp1Coords.y, particle.cp2Coords.y, particle.endCoords.y)

    particle.draw()

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

//--------------------------------------------------------------PARTICLE CLASSES
class Particle {
  constructor(coords, age, speed) {
    this.coords = coords
    this.age = age
    this.speed = speed
  }

  draw() {//default self render for particles, maybe change later
    ctx1.beginPath()
    ctx1.lineWidth = 3
    ctx1.strokeStyle = 'white'
    ctx1.fillStyle = 'black'
    ctx1.arc(this.coords.x, this.coords.y, 3, 0, Math.PI * 2, false)
    ctx1.stroke()
    ctx1.fill()
  }
}

class PathFollowingParticle extends Particle {
  constructor(startCoords, endCoords, coords, age, speed, distMoved) {
    super(coords, age, speed)
    this.startCoords = startCoords
    this.endCoords = endCoords
    this.distMoved = distMoved
  }
}

class HoldingPatternParticle extends PathFollowingParticle {
  constructor(startCoords, endCoords, coords, age, speed, distMoved, cp1Coords, cp2Coords, fromWP, toWP) {
    super(startCoords, endCoords, coords, age, speed, distMoved)
    this.cp1Coords = cp1Coords
    this.cp2Coords = cp2Coords
    this.fromWP = fromWP
    this.toWP = toWP
  }
}

//not final version, not sure what logic to put in the constructor and what here
function createRandomHoldingPatternParticle() {
  let fromWP = Math.floor(Math.random() * 6)
  let toWP = fromWP + 1
  if(toWP === holdingPatternWaypoints.length) {toWP = 0}
  let age = 0
  let speed = 0.01
  //let distMoved = Number( (Math.random() ).toFixed(1) )
  let distMoved = Math.round( Math.random() * 10 ) / 10
  let startCoords = {x: null, y: null}
  startCoords.x = holdingPatternWaypointsActual[fromWP].x
  startCoords.y = holdingPatternWaypointsActual[fromWP].y
  let endCoords = {x: null, y: null}
  endCoords.x = holdingPatternWaypointsActual[toWP].x
  endCoords.y = holdingPatternWaypointsActual[toWP].y
  let coords = {x: startCoords.x, y: startCoords.y}
  let cp1Coords = canvasHelpers.randPointBetweenTwoPoints(coords, endCoords)
  let cp2Coords = canvasHelpers.randPointBetweenTwoPoints(coords, endCoords)

  let particle = new HoldingPatternParticle(startCoords, endCoords, coords, age, speed, distMoved, cp1Coords, cp2Coords, fromWP, toWP)
  holdingPatternParticles.push(particle)
}

//function to goes over every holdingPatternParticle in
//holdingPatternArray and implements some behaviour

//function that populates holdingPatternWaypoints

//function that updates each particles x & y on window resize

document.addEventListener("DOMContentLoaded", init)
window.addEventListener('resize', init)
