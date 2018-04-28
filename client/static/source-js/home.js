const canvasHelpers = require('./utils/canvas-helpers.js')
const lettersLib = require('./utils/letters-lib.js')

let body = document.getElementsByTagName('body')[0]
let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')
let navGoToButton = document.getElementById('navigatorDesc')//dev
let frameId
let canvasWidth
let canvasHeight

document.addEventListener("DOMContentLoaded", init)
window.addEventListener('resize', init)

//hold pattern WP coords as ratio of canvas size
let holdPatternWaypoints = [
  {x: 0.125, y: 0.5},//0
  {x: 0.25, y: 0.125},//1
  {x: 0.75, y: 0.125},//2
  {x: 0.875, y: 0.5},//3
  {x: 0.75, y: 0.875},//4
  {x: 0.25, y: 0.875}//5
]
let holdPatternWaypointsActual = []//hold pattern WP coords in pixels, recalcumalated on resize
let holdPatternParticles = []

let navTargetOrigin = {x: 30, y: 30}
let navTargetSize = {width: 300, height: 60}
let navTargetParticles = []

//array for spawning pool particles
//array for wormhole leaving particles
//array for particles transitioning between main arrays???

//----------------------------------------------------------------------MANAGERS
//possibly split this into a function that fires just once on dom load,
//then another manager that runs on resizing?
function init() {
  reset()
  setLayout()
  initHoldPatternWaypointsActual()
  initHoldPatternParticles(22)
  initNavTargetParticles()//dev
  animate()
}

function reset() {
  cancelAnimationFrame(frameId)
  holdPatternWaypointsActual.length = 0
  holdPatternParticles.length = 0
  navTargetLettersParticles = 0//dev
}

function initHoldPatternWaypointsActual() {
  holdPatternWaypointsActual = holdPatternWaypoints.map(el => {
    let x = el.x * canvasWidth
    let y = el.y * canvasHeight
    return {x: x, y: y}
  })
}
//coords, age, speed, distMoved, nextWP
function initHoldPatternParticles(nParticles) {
  for(let i = 0; i < nParticles; i++) {
    let fromWP = Math.floor(Math.random() * 6)
    let nextWP = fromWP + 1
    if(nextWP === holdPatternWaypoints.length) {nextWP = 0}
    let age = 0
    let speed = 0.005
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

    let particle = new holdPatternParticle(coords, age, speed, distMoved, nextWP)

    holdPatternParticles.push(particle)
  }
}

function initNavTargetParticles() {
  navTargetParticles.push({ char: 'A', posInChar: 0, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: 2 })
  navTargetParticles.push({ char: 'A', posInChar: 1, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: 4 })
  navTargetParticles.push({ char: 'A', posInChar: 2, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: 3 })
  navTargetParticles.push({ char: 'A', posInChar: 3, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: 5 })
  navTargetParticles.push({ char: 'A', posInChar: 4, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: null })
  navTargetParticles.push({ char: 'A', posInChar: 5, placeInStr: 0, distMoved: 0, coords: {x: 0, y: 0, x0: 0, y0: 0, x1: null, y1: null}, pointsAt: null })

  //calc x1 & y1 from navTargetOrigin, navTargetSize, letters in navTarget, char number, particle number
}

//--------------------------------------------UPDATE PARTICLE POSITIONS & RENDER
function animate() {
  frameId = requestAnimationFrame(animate)
  ctx1.clearRect(0, 0, canvasWidth, canvasHeight)
  canvasHelpers.renderBoundingCircle(ctx1, canvasWidth, canvasHeight)//dev
  canvasHelpers.renderHoldPatternWPs(ctx1, holdPatternWaypointsActual)//dev
  canvasHelpers.renderHoldPatternParticlePaths(ctx1, holdPatternParticles)//dev
  updateHoldPatternParticles()
  updateNavTargetLettersParticles()
}

function updateHoldPatternParticles() {
  holdPatternParticles.forEach(particle => {//think this should be moved to a method on holdParticle class??
    particle.distMoved = particle.distMoved + particle.speed

    if(particle.distMoved >= 1) {
      particle.distMoved = 0
      particle.nextWP = particle.nextWP === holdPatternWaypoints.length - 1 ? 0 : particle.nextWP + 1

      particle.coords.x0 = particle.coords.x1
      particle.coords.y0 = particle.coords.y1
      particle.coords.x1 = canvasHelpers.randPointNearPoint(holdPatternWaypointsActual[particle.nextWP]).x
      particle.coords.y1 = canvasHelpers.randPointNearPoint(holdPatternWaypointsActual[particle.nextWP]).y

      particle.coords.cp1x = canvasHelpers.randPointBetweenTwoPoints({x: particle.coords.x0, y: particle.coords.y0}, {x: particle.coords.x1, y: particle.coords.y1}).x
      particle.coords.cp1y = canvasHelpers.randPointBetweenTwoPoints({x: particle.coords.x0, y: particle.coords.y0}, {x: particle.coords.x1, y: particle.coords.y1}).y
      particle.coords.cp2x = canvasHelpers.randPointBetweenTwoPoints({x: particle.coords.x0, y: particle.coords.y0}, {x: particle.coords.x1, y: particle.coords.y1}).x
      particle.coords.cp2y = canvasHelpers.randPointBetweenTwoPoints({x: particle.coords.x0, y: particle.coords.y0}, {x: particle.coords.x1, y: particle.coords.y1}).y
    }

    particle.coords.x = canvasHelpers.coordsOnCubicBezier(particle.distMoved, particle.coords.x0, particle.coords.cp1x, particle.coords.cp2x, particle.coords.x1)
    particle.coords.y = canvasHelpers.coordsOnCubicBezier(particle.distMoved, particle.coords.y0, particle.coords.cp1y, particle.coords.cp2y, particle.coords.y1)

    particle.draw()
  })
}

function updateNavTargetLettersParticles() {
  navTargetParticles.forEach((particle, index) => {
    //if distMoved < 1.0 then update pos
    //if distMoved > threshold then render vector
    //render self
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
navGoToButton.addEventListener('click', particleLettersTest, false)

function particleLettersTest() {
  console.log(lettersLib.letterACoords)
  console.log(lettersLib.letterAVectors)
}

//--------------------------------------------------------------PARTICLE CLASSES
//coords {x: number, y: number, x0: number, y0: number, x1: number, y1: number, cp1x: number, cp1y: number, cp2x: number, cp2y: number}
//age number
//speed number
//distMoved number (% along path as decimal)
//nextWP number(index)

//think idea might be to stick nearly all the props on th Particle parent, scrap the intermediate class and concentrate on the methods in individual
//particle classes.

class Particle {
  constructor(coords, age, speed, distMoved) {
    this.coords = coords
    this.age = age
    this.speed = speed
    this.distMoved = distMoved
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

class holdPatternParticle extends Particle {
  constructor(coords, age, speed, distMoved, nextWP) {
    super(coords, age, speed, distMoved)
    this.nextWP = nextWP
  }
}
/*
class holdPatternParticle extends Particle {
  constructor(startCoords, endCoords, coords, age, speed, distMoved, cp1Coords, cp2Coords, nextWP) {
    super(coords, age, speed, distMoved, startCoords, endCoords)
    this.cp1Coords = cp1Coords
    this.cp2Coords = cp2Coords
    this.nextWP = nextWP
  }
}
*/
