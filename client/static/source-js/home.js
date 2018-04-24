let body = document.getElementsByTagName('body')[0]
let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')

let CANVAS1_TOP = 0
let CANVAS1_LEFT = 0
let CANVAS1_BOTTOM
let CANVAS1_RIGHT

let holdingPatternWaypoints = [//as ratio of canvas size
  {x: 0.125, y: 0.5},//0
  {x: 0.25, y: 0.125},//1
  {x: 0.75, y: 0.125},//2
  {x: 0.875, y: 0.5},//3
  {x: 0.75, y: 0.875},//4
  {x: 0.25, y: 0.875}//5
]

let holdingPatternWaypointsActual = []

//Particles
let holdingPatternParticles = []

/*----------------------------------------------------------------BREAK POINTS*/
function setLayout() {
  console.log(`body.clientWidth: ${body.clientWidth}, body.clientHeight: ${body.clientHeight}`)

  //-------------------------------------------------------------SMALL SCREENS
  //small width in portrait
  if (body.clientHeight > body.clientWidth && body.clientWidth <= 480) {
    console.log('SCREEN: small width in portrait')
    CANVAS1_RIGHT = body.clientWidth
    CANVAS1_BOTTOM = body.clientHeight * 0.5
  }
  //small height in landscape
  if (body.clientHeight < body.clientWidth && body.clientHeight <= 480) {
    console.log('SCREEN: small height in landscape')
    CANVAS1_RIGHT = body.clientWidth * 0.5
    CANVAS1_BOTTOM = body.clientHeight
  }

  //------------------------------------------------------------MEDIUM SCREENS
  //medium width in portrait
  if (body.clientHeight > body.clientWidth && body.clientWidth <= 1024 && body.clientWidth > 480) {
    console.log('SCREEN: medium width in portrait')
    CANVAS1_RIGHT = body.clientWidth
    CANVAS1_BOTTOM = body.clientHeight * 0.7
  }
  //medium height in landscape
  if (body.clientHeight < body.clientWidth && body.clientHeight <= 1024 && body.clientHeight > 480) {
    console.log('SCREEN: medium height in landscape')
    CANVAS1_RIGHT = body.clientWidth * 0.65
    CANVAS1_BOTTOM = body.clientHeight
  }

  //------------------------------------------------------------LARGE SCREENS
  //large width in portrait
  if (body.clientHeight > body.clientWidth && body.clientWidth > 1024) {
    console.log('SCREEN: large width in portrait')
    CANVAS1_RIGHT = body.clientWidth
    CANVAS1_BOTTOM = body.clientHeight * 0.65
  }
  //large height in landscape
  if (body.clientHeight < body.clientWidth && body.clientHeight > 1024) {
    console.log('SCREEN: large height in landscape')
    CANVAS1_RIGHT = body.clientWidth * 0.65
    CANVAS1_BOTTOM = body.clientHeight
  }

  canvas1.width = CANVAS1_RIGHT
  canvas1.height = CANVAS1_BOTTOM

  initHoldingPatternWaypointsActual()
  console.log(...holdingPatternWaypointsActual)
  drawHoldingPatternWaypoints()
  drawTempShape()
}

function initHoldingPatternWaypointsActual() {
  holdingPatternWaypointsActual.length = 0
  holdingPatternWaypointsActual = holdingPatternWaypoints.map(el => {
    let x = el.x * CANVAS1_RIGHT
    let y = el.y * CANVAS1_BOTTOM
    return {x: x, y: y}
  })
}
//----------------------------------------------temporary to see if wp's correct
function drawHoldingPatternWaypoints() {
  ctx1.fillStyle = 'red'
  holdingPatternWaypointsActual.forEach(wp => {
    ctx1.fillRect(wp.x, wp.y, 8, 8)
  })
}
//-----------------------------------------------temporary to test canvas layout
function drawTempShape() {
  console.log('clearing canvas...')
  ctx1.fillStyle = 'transparent'
  ctx1.fillRect(CANVAS1_LEFT, CANVAS1_TOP, CANVAS1_RIGHT, CANVAS1_BOTTOM)

  console.log('drawing...')
  ctx1.strokeStyle = 'white'
  ctx1.lineWidth = 4
  ctx1.beginPath()
  let x = CANVAS1_RIGHT / 2
  let y = CANVAS1_BOTTOM / 2
  let radius = y > x ? x - 8 : y - 8
  startAngle = 0
  endAngle = 2 * Math.PI
  ctx1.arc(x, y, radius, startAngle, endAngle)
  ctx1.stroke()
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

//function to goes over every holdingPatternParticle in
//holdingPatternArray and implements some behaviour

//function that populates holdingPatternWaypoints

//function that updates each particles x & y on window resize

document.addEventListener("DOMContentLoaded", setLayout)
window.addEventListener('resize', setLayout)
