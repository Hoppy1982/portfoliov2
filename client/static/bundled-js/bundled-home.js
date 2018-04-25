(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const canvasHelpers = require('./utils/canvas-helpers.js')

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

//Particles move about between these arrays, changing behaviour as they do
let holdingPatternParticles = []
//array for nav target lettering particles
//array for spawning pool particles
//array for wormhole leaving particles
//array for particles transitioning between main arrays???

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

//this currently sucks
function createRandomHoldingPatternParticle() {
  let randomWP = Math.floor(Math.random() * 6)

  let age = 0
  let speed = 10
  let distMoved = 0//randomise 0-1??
  let coords = holdingPatternWaypointsActual[randomWP]
  let endCoords = randomWP === 5 ? holdingPatternWaypointsActual[0] : holdingPatternWaypointsActual[randomWP + 1]
  let cp1Coords = canvasHelpers.randPointBetweenTwoPoints(coords, endCoords)
  let cp2Coords = canvasHelpers.randPointBetweenTwoPoints(coords, endCoords)
/*
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
*/
  let particle = new HoldingPatternParticle(coords, age, speed, endCoords, distMoved, cp1Coords, cp2Coords)
  holdingPatternParticles.push(particle)
}

//function to goes over every holdingPatternParticle in
//holdingPatternArray and implements some behaviour

//function that populates holdingPatternWaypoints

//function that updates each particles x & y on window resize

document.addEventListener("DOMContentLoaded", setLayout)
window.addEventListener('resize', setLayout)

},{"./utils/canvas-helpers.js":2}],2:[function(require,module,exports){
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
//-----------------------------DEV FUNCTIONS WOT FOR VISUALISING WHAT'S OCCURING
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

function renderHoldPatternWPs(ctx, arr) {
  ctx.beginPath()
  ctx.fillStyle = 'blue'
  arr.forEach(wp => {
    ctx.fillRect(wp.x - 6, wp.y - 6, 12, 12)
  })
  ctx.stroke()
}

function renderChosenHoldPatternParticlePath(ctx, particle) {
  let cp1X = particle.cp1Coords.x
  let cp1Y = particle.cp1Coords.y
  let cp2X = particle.cp2Coords.x
  let cp2Y = particle.cp2Coords.y
  let startX = particle.coords.x
  let startY = particle.coords.y
  let endX = particle.endCoords.x
  let endY = particle.endCoords.y
  ctx.lineWidth = 2
  //render start point
  ctx.beginPath()
  ctx.strokeStyle = 'green'
  ctx.rect(startX - 4, startY - 4, 8, 8 )
  ctx.stroke()
  //render end point
  ctx.strokeStyle = 'red'
  ctx.beginPath()
  ctx.rect(endX - 4, endY - 4, 8, 8 )
  ctx.stroke()
  //render control point 1
  ctx.beginPath()
  ctx.strokeStyle = 'yellow'
  ctx.rect(cp1X - 4, cp1Y - 4, 8, 8)
  ctx.stroke()
  //render control point 2
  ctx.beginPath()
  ctx.strokeStyle = 'orange'
  ctx.rect(cp2X - 4, cp2Y - 4, 8, 8)
  ctx.stroke()
  //render path
  ctx.beginPath()
  ctx.strokeStyle = 'white'
  ctx.moveTo(startX, startY)
  ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY)
  ctx.stroke()
}

//------------------------------------------------------------exported functions
module.exports = {
  randPointBetweenTwoPoints,
  //dev
  renderBoundingCircle,
  renderHoldPatternWPs,
  renderChosenHoldPatternParticlePath
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvY2FudmFzLWhlbHBlcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGNhbnZhc0hlbHBlcnMgPSByZXF1aXJlKCcuL3V0aWxzL2NhbnZhcy1oZWxwZXJzLmpzJylcclxuXHJcbmxldCBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXVxyXG5sZXQgY2FudmFzMSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjYW52YXMnKVswXVxyXG5sZXQgY3R4MSA9IGNhbnZhczEuZ2V0Q29udGV4dCgnMmQnKVxyXG5cclxubGV0IGNhbnZhc1dpZHRoXHJcbmxldCBjYW52YXNIZWlnaHRcclxuXHJcbi8vSG9sZGluZyBwYXR0ZXJuIFdQIGNvb3JkcyBhcyByYXRpbyBvZiBjYW52YXMgc2l6ZVxyXG5sZXQgaG9sZGluZ1BhdHRlcm5XYXlwb2ludHMgPSBbXHJcbiAge3g6IDAuMTI1LCB5OiAwLjV9LC8vMFxyXG4gIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8xXHJcbiAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzJcclxuICB7eDogMC44NzUsIHk6IDAuNX0sLy8zXHJcbiAge3g6IDAuNzUsIHk6IDAuODc1fSwvLzRcclxuICB7eDogMC4yNSwgeTogMC44NzV9Ly81XHJcbl1cclxuXHJcbi8vSG9sZGluZyBwYXR0ZXJuIFdQIGNvb3JkcyBpbiBwaXhlbHMsIHJlY2FsY3VtYWxhdGVkIG9uIHJlc2l6ZVxyXG5sZXQgaG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWwgPSBbXVxyXG5cclxuLy9QYXJ0aWNsZXMgbW92ZSBhYm91dCBiZXR3ZWVuIHRoZXNlIGFycmF5cywgY2hhbmdpbmcgYmVoYXZpb3VyIGFzIHRoZXkgZG9cclxubGV0IGhvbGRpbmdQYXR0ZXJuUGFydGljbGVzID0gW11cclxuLy9hcnJheSBmb3IgbmF2IHRhcmdldCBsZXR0ZXJpbmcgcGFydGljbGVzXHJcbi8vYXJyYXkgZm9yIHNwYXduaW5nIHBvb2wgcGFydGljbGVzXHJcbi8vYXJyYXkgZm9yIHdvcm1ob2xlIGxlYXZpbmcgcGFydGljbGVzXHJcbi8vYXJyYXkgZm9yIHBhcnRpY2xlcyB0cmFuc2l0aW9uaW5nIGJldHdlZW4gbWFpbiBhcnJheXM/Pz9cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQlJFQUsgUE9JTlRTXHJcbmZ1bmN0aW9uIHNldExheW91dCgpIHtcclxuICAvL3NtYWxsIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBjYW52YXNIZWlnaHQgPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNVxyXG4gIH1cclxuICAvL3NtYWxsIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0IDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBjYW52YXNXaWR0aCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG4gIC8vbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDEwMjQgJiYgYm9keS5jbGllbnRXaWR0aCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjdcclxuICB9XHJcbiAgLy9tZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gMTAyNCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgY2FudmFzV2lkdGggPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcbiAgLy9sYXJnZSB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgY2FudmFzSGVpZ2h0ID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjY1XHJcbiAgfVxyXG4gIC8vbGFyZ2UgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPiAxMDI0KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBsYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIGNhbnZhc1dpZHRoID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNjVcclxuICAgIGNhbnZhc0hlaWdodCA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG5cclxuICBjYW52YXMxLndpZHRoID0gY2FudmFzV2lkdGhcclxuICBjYW52YXMxLmhlaWdodCA9IGNhbnZhc0hlaWdodFxyXG5cclxuICAvL21vdmUgdGhpcyBsb3Qgc29tZXdoZXJlIG1vcmUgYmV0dGVyZXJcclxuICBpbml0SG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWwoKVxyXG4gIGNyZWF0ZVJhbmRvbUhvbGRpbmdQYXR0ZXJuUGFydGljbGUoKVxyXG4gIGNhbnZhc0hlbHBlcnMucmVuZGVyQm91bmRpbmdDaXJjbGUoY3R4MSwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodClcclxuICBjYW52YXNIZWxwZXJzLnJlbmRlckhvbGRQYXR0ZXJuV1BzKGN0eDEsIGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKVxyXG4gIGNhbnZhc0hlbHBlcnMucmVuZGVyQ2hvc2VuSG9sZFBhdHRlcm5QYXJ0aWNsZVBhdGgoY3R4MSwgaG9sZGluZ1BhdHRlcm5QYXJ0aWNsZXNbMF0pXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXRIb2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbCgpIHtcclxuICBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbC5sZW5ndGggPSAwXHJcbiAgaG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWwgPSBob2xkaW5nUGF0dGVybldheXBvaW50cy5tYXAoZWwgPT4ge1xyXG4gICAgbGV0IHggPSBlbC54ICogY2FudmFzV2lkdGhcclxuICAgIGxldCB5ID0gZWwueSAqIGNhbnZhc0hlaWdodFxyXG4gICAgcmV0dXJuIHt4OiB4LCB5OiB5fVxyXG4gIH0pXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tUEFSVElDTEUgQ0xBU1NFU1xyXG5jbGFzcyBQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBhZ2UsIHNwZWVkKSB7XHJcbiAgICB0aGlzLmNvb3JkcyA9IGNvb3Jkc1xyXG4gICAgdGhpcy5hZ2UgPSBhZ2VcclxuICAgIHRoaXMuc3BlZWQgPSBzcGVlZFxyXG4gIH1cclxuICBsaXN0UHJvcHMoKSB7Ly90ZW1wIG1ldGhvZCBmb3IgdGVzdGluZ1xyXG4gICAgZm9yIChsZXQga2V5IGluIHRoaXMpIHtcclxuICAgICAgY29uc29sZS5sb2coYCR7a2V5fTogJHt0aGlzW2tleV19YClcclxuICAgIH1cclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIFBhdGhGb2xsb3dpbmdQYXJ0aWNsZSBleHRlbmRzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIGFnZSwgc3BlZWQsIGVuZENvb3JkcywgZGlzdE1vdmVkKSB7XHJcbiAgICBzdXBlcihjb29yZHMsIGFnZSwgc3BlZWQpXHJcbiAgICB0aGlzLmVuZENvb3JkcyA9IGVuZENvb3Jkc1xyXG4gICAgdGhpcy5kaXN0TW92ZWQgPSBkaXN0TW92ZWRcclxuICB9XHJcbn1cclxuXHJcbmNsYXNzIEhvbGRpbmdQYXR0ZXJuUGFydGljbGUgZXh0ZW5kcyBQYXRoRm9sbG93aW5nUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3JkcywgYWdlLCBzcGVlZCwgZW5kQ29vcmRzLCBkaXN0TW92ZWQsIGNwMUNvb3JkcywgY3AyQ29vcmRzKSB7XHJcbiAgICBzdXBlcihjb29yZHMsIGFnZSwgc3BlZWQsIGVuZENvb3JkcywgZGlzdE1vdmVkKVxyXG4gICAgdGhpcy5jcDFDb29yZHMgPSBjcDFDb29yZHNcclxuICAgIHRoaXMuY3AyQ29vcmRzID0gY3AyQ29vcmRzXHJcbiAgfVxyXG59XHJcblxyXG4vL3RoaXMgY3VycmVudGx5IHN1Y2tzXHJcbmZ1bmN0aW9uIGNyZWF0ZVJhbmRvbUhvbGRpbmdQYXR0ZXJuUGFydGljbGUoKSB7XHJcbiAgbGV0IHJhbmRvbVdQID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNilcclxuXHJcbiAgbGV0IGFnZSA9IDBcclxuICBsZXQgc3BlZWQgPSAxMFxyXG4gIGxldCBkaXN0TW92ZWQgPSAwLy9yYW5kb21pc2UgMC0xPz9cclxuICBsZXQgY29vcmRzID0gaG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWxbcmFuZG9tV1BdXHJcbiAgbGV0IGVuZENvb3JkcyA9IHJhbmRvbVdQID09PSA1ID8gaG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWxbMF0gOiBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbFtyYW5kb21XUCArIDFdXHJcbiAgbGV0IGNwMUNvb3JkcyA9IGNhbnZhc0hlbHBlcnMucmFuZFBvaW50QmV0d2VlblR3b1BvaW50cyhjb29yZHMsIGVuZENvb3JkcylcclxuICBsZXQgY3AyQ29vcmRzID0gY2FudmFzSGVscGVycy5yYW5kUG9pbnRCZXR3ZWVuVHdvUG9pbnRzKGNvb3JkcywgZW5kQ29vcmRzKVxyXG4vKlxyXG4gIGZ1bmN0aW9uIHJhbmRDb250cm9sUG9pbnQocDEsIHAyKSB7XHJcbiAgICBsZXQgYSA9IHAyLnggLSBwMS54XHJcbiAgICBsZXQgYiA9IHAyLnkgLSBwMS55XHJcbiAgICBsZXQgcDFQMkRpc3QgPSBNYXRoLnNxcnQoYSphICsgYipiKVxyXG4gICAgbGV0IHJhbmREaXN0ID0gKE1hdGgucmFuZG9tKCkgKiBwMVAyRGlzdCAqIDAuNSkgKyA0MFxyXG4gICAgbGV0IHAxUDJBbmdsZVxyXG4gICAgbGV0IHJhbmRBbmdsZVxyXG4gICAgbGV0IGNvb3JkcyA9IHt4OiBudWxsLCB5OiBudWxsfVxyXG5cclxuICAgIGlmKE1hdGgucmFuZG9tKCkgPj0gMC41KSB7XHJcbiAgICAgIHRQb2ludCA9ICdwMidcclxuICAgICAgcDFQMkFuZ2xlID0gTWF0aC5hdGFuMihwMi55IC0gcDEueSwgcDEueCAtIHAyLngpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBwMVAyQW5nbGUgPSBNYXRoLmF0YW4yKHAxLnkgLSBwMi55LCBwMi54IC0gcDEueClcclxuICAgICAgdFBvaW50ID0gJ3AxJ1xyXG4gICAgfVxyXG5cclxuICAgIHJhbmRBbmdsZSA9IHAxUDJBbmdsZSAtIChNYXRoLlBJIC8gMikgKyAoTWF0aC5yYW5kb20oKSAqIE1hdGguUEkpXHJcblxyXG4gICAgaWYgKHRQb2ludCA9PT0gJ3AxJykge1xyXG4gICAgICBjb29yZHMueCA9IHAxLnggKyBNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICAgICAgY29vcmRzLnkgPSBwMS55IC0gTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgICB9XHJcbiAgICBpZiAodFBvaW50ID09PSAncDInKSB7XHJcbiAgICAgIGNvb3Jkcy54ID0gcDIueCArIE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gICAgICBjb29yZHMueSA9IHAyLnkgLSBNYXRoLnNpbihyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY29vcmRzXHJcbiAgfVxyXG4qL1xyXG4gIGxldCBwYXJ0aWNsZSA9IG5ldyBIb2xkaW5nUGF0dGVyblBhcnRpY2xlKGNvb3JkcywgYWdlLCBzcGVlZCwgZW5kQ29vcmRzLCBkaXN0TW92ZWQsIGNwMUNvb3JkcywgY3AyQ29vcmRzKVxyXG4gIGhvbGRpbmdQYXR0ZXJuUGFydGljbGVzLnB1c2gocGFydGljbGUpXHJcbn1cclxuXHJcbi8vZnVuY3Rpb24gdG8gZ29lcyBvdmVyIGV2ZXJ5IGhvbGRpbmdQYXR0ZXJuUGFydGljbGUgaW5cclxuLy9ob2xkaW5nUGF0dGVybkFycmF5IGFuZCBpbXBsZW1lbnRzIHNvbWUgYmVoYXZpb3VyXHJcblxyXG4vL2Z1bmN0aW9uIHRoYXQgcG9wdWxhdGVzIGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzXHJcblxyXG4vL2Z1bmN0aW9uIHRoYXQgdXBkYXRlcyBlYWNoIHBhcnRpY2xlcyB4ICYgeSBvbiB3aW5kb3cgcmVzaXplXHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzZXRMYXlvdXQpXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzZXRMYXlvdXQpXHJcbiIsIi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1HRU9NRVRSWSBIRUxQRVJTXHJcbmZ1bmN0aW9uIHJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMocDEsIHAyKSB7XHJcbiAgY29uc3QgTUlOX0RJU1QgPSA0MFxyXG4gIGNvbnN0IERJU1RfTU9EID0gMC41XHJcbiAgY29uc3QgQU5HTEVfV0lUSElOID0gTWF0aC5QSVxyXG4gIGxldCBhID0gcDIueCAtIHAxLnhcclxuICBsZXQgYiA9IHAyLnkgLSBwMS55XHJcbiAgbGV0IHAxUDJEaXN0ID0gTWF0aC5zcXJ0KGEqYSArIGIqYilcclxuICBsZXQgcmFuZERpc3QgPSAoTWF0aC5yYW5kb20oKSAqIHAxUDJEaXN0ICogRElTVF9NT0QpICsgTUlOX0RJU1RcclxuICBsZXQgYW5nbGVNb2QgPSAoTWF0aC5yYW5kb20oKSAqIEFOR0xFX1dJVEhJTikgLSAoQU5HTEVfV0lUSElOIC8gMilcclxuICBsZXQgcmFuZEFuZ2xlXHJcbiAgbGV0IGNvb3JkcyA9IHt4OiBudWxsLCB5OiBudWxsfVxyXG5cclxuICBpZihNYXRoLnJhbmRvbSgpID49IDAuNSkge1xyXG4gICAgcmFuZEFuZ2xlID0gTWF0aC5hdGFuMihwMi55IC0gcDEueSwgcDEueCAtIHAyLngpICsgYW5nbGVNb2RcclxuICAgIGNvb3Jkcy54ID0gcDIueCArIE1hdGguY29zKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gICAgY29vcmRzLnkgPSBwMi55IC0gTWF0aC5zaW4ocmFuZEFuZ2xlKSAqIHJhbmREaXN0XHJcbiAgfSBlbHNlIHtcclxuICAgIHJhbmRBbmdsZSA9IE1hdGguYXRhbjIocDEueSAtIHAyLnksIHAyLnggLSBwMS54KSArIGFuZ2xlTW9kXHJcbiAgICBjb29yZHMueCA9IHAxLnggKyBNYXRoLmNvcyhyYW5kQW5nbGUpICogcmFuZERpc3RcclxuICAgIGNvb3Jkcy55ID0gcDEueSAtIE1hdGguc2luKHJhbmRBbmdsZSkgKiByYW5kRGlzdFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIGNvb3Jkc1xyXG59XHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1ERVYgRlVOQ1RJT05TIFdPVCBGT1IgVklTVUFMSVNJTkcgV0hBVCdTIE9DQ1VSSU5HXHJcbmZ1bmN0aW9uIHJlbmRlckJvdW5kaW5nQ2lyY2xlKGN0eCwgY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCkge1xyXG4gIGxldCBjZW50ZXJYID0gY2FudmFzV2lkdGggLyAyXHJcbiAgbGV0IGNlbnRlclkgPSBjYW52YXNIZWlnaHQgLyAyXHJcbiAgbGV0IHJhZGl1cyA9IGNlbnRlclkgPiBjZW50ZXJYID8gY2VudGVyWCAtIDIgOiBjZW50ZXJZIC0gMlxyXG4gIGxldCBzdGFydEFuZ2xlID0gMFxyXG4gIGxldCBlbmRBbmdsZSA9IDIgKiBNYXRoLlBJXHJcbiAgY3R4LmxpbmVXaWR0aCA9IDFcclxuICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JleSdcclxuICBjdHguYmVnaW5QYXRoKClcclxuICBjdHguYXJjKGNlbnRlclgsIGNlbnRlclksIHJhZGl1cywgc3RhcnRBbmdsZSwgZW5kQW5nbGUpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlbmRlckhvbGRQYXR0ZXJuV1BzKGN0eCwgYXJyKSB7XHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LmZpbGxTdHlsZSA9ICdibHVlJ1xyXG4gIGFyci5mb3JFYWNoKHdwID0+IHtcclxuICAgIGN0eC5maWxsUmVjdCh3cC54IC0gNiwgd3AueSAtIDYsIDEyLCAxMilcclxuICB9KVxyXG4gIGN0eC5zdHJva2UoKVxyXG59XHJcblxyXG5mdW5jdGlvbiByZW5kZXJDaG9zZW5Ib2xkUGF0dGVyblBhcnRpY2xlUGF0aChjdHgsIHBhcnRpY2xlKSB7XHJcbiAgbGV0IGNwMVggPSBwYXJ0aWNsZS5jcDFDb29yZHMueFxyXG4gIGxldCBjcDFZID0gcGFydGljbGUuY3AxQ29vcmRzLnlcclxuICBsZXQgY3AyWCA9IHBhcnRpY2xlLmNwMkNvb3Jkcy54XHJcbiAgbGV0IGNwMlkgPSBwYXJ0aWNsZS5jcDJDb29yZHMueVxyXG4gIGxldCBzdGFydFggPSBwYXJ0aWNsZS5jb29yZHMueFxyXG4gIGxldCBzdGFydFkgPSBwYXJ0aWNsZS5jb29yZHMueVxyXG4gIGxldCBlbmRYID0gcGFydGljbGUuZW5kQ29vcmRzLnhcclxuICBsZXQgZW5kWSA9IHBhcnRpY2xlLmVuZENvb3Jkcy55XHJcbiAgY3R4LmxpbmVXaWR0aCA9IDJcclxuICAvL3JlbmRlciBzdGFydCBwb2ludFxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICdncmVlbidcclxuICBjdHgucmVjdChzdGFydFggLSA0LCBzdGFydFkgLSA0LCA4LCA4IClcclxuICBjdHguc3Ryb2tlKClcclxuICAvL3JlbmRlciBlbmQgcG9pbnRcclxuICBjdHguc3Ryb2tlU3R5bGUgPSAncmVkJ1xyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5yZWN0KGVuZFggLSA0LCBlbmRZIC0gNCwgOCwgOCApXHJcbiAgY3R4LnN0cm9rZSgpXHJcbiAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAxXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ3llbGxvdydcclxuICBjdHgucmVjdChjcDFYIC0gNCwgY3AxWSAtIDQsIDgsIDgpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbiAgLy9yZW5kZXIgY29udHJvbCBwb2ludCAyXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gJ29yYW5nZSdcclxuICBjdHgucmVjdChjcDJYIC0gNCwgY3AyWSAtIDQsIDgsIDgpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbiAgLy9yZW5kZXIgcGF0aFxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSdcclxuICBjdHgubW92ZVRvKHN0YXJ0WCwgc3RhcnRZKVxyXG4gIGN0eC5iZXppZXJDdXJ2ZVRvKGNwMVgsIGNwMVksIGNwMlgsIGNwMlksIGVuZFgsIGVuZFkpXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tZXhwb3J0ZWQgZnVuY3Rpb25zXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHJhbmRQb2ludEJldHdlZW5Ud29Qb2ludHMsXHJcbiAgLy9kZXZcclxuICByZW5kZXJCb3VuZGluZ0NpcmNsZSxcclxuICByZW5kZXJIb2xkUGF0dGVybldQcyxcclxuICByZW5kZXJDaG9zZW5Ib2xkUGF0dGVyblBhcnRpY2xlUGF0aFxyXG59XHJcbiJdfQ==
