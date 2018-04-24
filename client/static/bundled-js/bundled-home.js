(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
  createRandomHoldingPatternParticle()
  console.log(holdingPatternParticles[0].coords)
  console.log(holdingPatternParticles[0].endCoords)
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

function createRandomHoldingPatternParticle() {
  let randomWP = Math.floor(Math.random() * 6)

  let age = 0
  let speed = 10
  let distMoved = 0//random 0-1??
  let coords = holdingPatternWaypointsActual[randomWP]
  let endCoords = randomWP === 5 ? holdingPatternWaypointsActual[0] : holdingPatternWaypointsActual[randomWP + 1]
  let coordsToEndCoordsTheta = Math.atan2(endCoords.y - coords.y, endCoords.x - coords.x)
  let thetaDegs = coordsToEndCoordsTheta * 180 / Math.PI
  console.log(`theta: ${thetaDegs}`)
  let cp1Coords = () => {
    let x = 'maths shit'
    let y = 'maths shit'
    return {x: x, y: y}
  }
  let cp2Coords = () => {
    let x = 'maths shit'
    let y = 'maths shit'
    return {x: x, y: y}
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJsZXQgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF1cclxubGV0IGNhbnZhczEgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY2FudmFzJylbMF1cclxubGV0IGN0eDEgPSBjYW52YXMxLmdldENvbnRleHQoJzJkJylcclxuXHJcbmxldCBDQU5WQVMxX1RPUCA9IDBcclxubGV0IENBTlZBUzFfTEVGVCA9IDBcclxubGV0IENBTlZBUzFfQk9UVE9NXHJcbmxldCBDQU5WQVMxX1JJR0hUXHJcblxyXG5sZXQgaG9sZGluZ1BhdHRlcm5XYXlwb2ludHMgPSBbLy9hcyByYXRpbyBvZiBjYW52YXMgc2l6ZVxyXG4gIHt4OiAwLjEyNSwgeTogMC41fSwvLzBcclxuICB7eDogMC4yNSwgeTogMC4xMjV9LC8vMVxyXG4gIHt4OiAwLjc1LCB5OiAwLjEyNX0sLy8yXHJcbiAge3g6IDAuODc1LCB5OiAwLjV9LC8vM1xyXG4gIHt4OiAwLjc1LCB5OiAwLjg3NX0sLy80XHJcbiAge3g6IDAuMjUsIHk6IDAuODc1fS8vNVxyXG5dXHJcblxyXG5sZXQgaG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWwgPSBbXVxyXG5cclxuLy9QYXJ0aWNsZXNcclxubGV0IGhvbGRpbmdQYXR0ZXJuUGFydGljbGVzID0gW11cclxuXHJcbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUJSRUFLIFBPSU5UUyovXHJcbmZ1bmN0aW9uIHNldExheW91dCgpIHtcclxuICBjb25zb2xlLmxvZyhgYm9keS5jbGllbnRXaWR0aDogJHtib2R5LmNsaWVudFdpZHRofSwgYm9keS5jbGllbnRIZWlnaHQ6ICR7Ym9keS5jbGllbnRIZWlnaHR9YClcclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tU01BTEwgU0NSRUVOU1xyXG4gIC8vc21hbGwgd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBDQU5WQVMxX1JJR0hUID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgQ0FOVkFTMV9CT1RUT00gPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNVxyXG4gIH1cclxuICAvL3NtYWxsIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0IDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBDQU5WQVMxX1JJR0hUID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNVxyXG4gICAgQ0FOVkFTMV9CT1RUT00gPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1NRURJVU0gU0NSRUVOU1xyXG4gIC8vbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDEwMjQgJiYgYm9keS5jbGllbnRXaWR0aCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIENBTlZBUzFfUklHSFQgPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBDQU5WQVMxX0JPVFRPTSA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC43XHJcbiAgfVxyXG4gIC8vbWVkaXVtIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0IDw9IDEwMjQgJiYgYm9keS5jbGllbnRIZWlnaHQgPiA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IG1lZGl1bSBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIENBTlZBUzFfUklHSFQgPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgQ0FOVkFTMV9CT1RUT00gPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1MQVJHRSBTQ1JFRU5TXHJcbiAgLy9sYXJnZSB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIENBTlZBUzFfUklHSFQgPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBDQU5WQVMxX0JPVFRPTSA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC42NVxyXG4gIH1cclxuICAvL2xhcmdlIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPCBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50SGVpZ2h0ID4gMTAyNCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbGFyZ2UgaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBDQU5WQVMxX1JJR0hUID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNjVcclxuICAgIENBTlZBUzFfQk9UVE9NID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcblxyXG4gIGNhbnZhczEud2lkdGggPSBDQU5WQVMxX1JJR0hUXHJcbiAgY2FudmFzMS5oZWlnaHQgPSBDQU5WQVMxX0JPVFRPTVxyXG5cclxuICBpbml0SG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWwoKVxyXG4gIGNvbnNvbGUubG9nKC4uLmhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKVxyXG4gIGRyYXdIb2xkaW5nUGF0dGVybldheXBvaW50cygpXHJcbiAgZHJhd1RlbXBTaGFwZSgpXHJcbiAgY3JlYXRlUmFuZG9tSG9sZGluZ1BhdHRlcm5QYXJ0aWNsZSgpXHJcbiAgY29uc29sZS5sb2coaG9sZGluZ1BhdHRlcm5QYXJ0aWNsZXNbMF0uY29vcmRzKVxyXG4gIGNvbnNvbGUubG9nKGhvbGRpbmdQYXR0ZXJuUGFydGljbGVzWzBdLmVuZENvb3JkcylcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKCkge1xyXG4gIGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsLmxlbmd0aCA9IDBcclxuICBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbCA9IGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzLm1hcChlbCA9PiB7XHJcbiAgICBsZXQgeCA9IGVsLnggKiBDQU5WQVMxX1JJR0hUXHJcbiAgICBsZXQgeSA9IGVsLnkgKiBDQU5WQVMxX0JPVFRPTVxyXG4gICAgcmV0dXJuIHt4OiB4LCB5OiB5fVxyXG4gIH0pXHJcbn1cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tdGVtcG9yYXJ5IHRvIHNlZSBpZiB3cCdzIGNvcnJlY3RcclxuZnVuY3Rpb24gZHJhd0hvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzKCkge1xyXG4gIGN0eDEuZmlsbFN0eWxlID0gJ3JlZCdcclxuICBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbC5mb3JFYWNoKHdwID0+IHtcclxuICAgIGN0eDEuZmlsbFJlY3Qod3AueCwgd3AueSwgOCwgOClcclxuICB9KVxyXG59XHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS10ZW1wb3JhcnkgdG8gdGVzdCBjYW52YXMgbGF5b3V0XHJcbmZ1bmN0aW9uIGRyYXdUZW1wU2hhcGUoKSB7XHJcbiAgY29uc29sZS5sb2coJ2NsZWFyaW5nIGNhbnZhcy4uLicpXHJcbiAgY3R4MS5maWxsU3R5bGUgPSAndHJhbnNwYXJlbnQnXHJcbiAgY3R4MS5maWxsUmVjdChDQU5WQVMxX0xFRlQsIENBTlZBUzFfVE9QLCBDQU5WQVMxX1JJR0hULCBDQU5WQVMxX0JPVFRPTSlcclxuXHJcbiAgY29uc29sZS5sb2coJ2RyYXdpbmcuLi4nKVxyXG4gIGN0eDEuc3Ryb2tlU3R5bGUgPSAnd2hpdGUnXHJcbiAgY3R4MS5saW5lV2lkdGggPSA0XHJcbiAgY3R4MS5iZWdpblBhdGgoKVxyXG4gIGxldCB4ID0gQ0FOVkFTMV9SSUdIVCAvIDJcclxuICBsZXQgeSA9IENBTlZBUzFfQk9UVE9NIC8gMlxyXG4gIGxldCByYWRpdXMgPSB5ID4geCA/IHggLSA4IDogeSAtIDhcclxuICBzdGFydEFuZ2xlID0gMFxyXG4gIGVuZEFuZ2xlID0gMiAqIE1hdGguUElcclxuICBjdHgxLmFyYyh4LCB5LCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKVxyXG4gIGN0eDEuc3Ryb2tlKClcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1QQVJUSUNMRSBDTEFTU0VTXHJcbmNsYXNzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIGFnZSwgc3BlZWQpIHtcclxuICAgIHRoaXMuY29vcmRzID0gY29vcmRzXHJcbiAgICB0aGlzLmFnZSA9IGFnZVxyXG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkXHJcbiAgfVxyXG4gIGxpc3RQcm9wcygpIHsvL3RlbXAgbWV0aG9kIGZvciB0ZXN0aW5nXHJcbiAgICBmb3IgKGxldCBrZXkgaW4gdGhpcykge1xyXG4gICAgICBjb25zb2xlLmxvZyhgJHtrZXl9OiAke3RoaXNba2V5XX1gKVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgUGF0aEZvbGxvd2luZ1BhcnRpY2xlIGV4dGVuZHMgUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3JkcywgYWdlLCBzcGVlZCwgZW5kQ29vcmRzLCBkaXN0TW92ZWQpIHtcclxuICAgIHN1cGVyKGNvb3JkcywgYWdlLCBzcGVlZClcclxuICAgIHRoaXMuZW5kQ29vcmRzID0gZW5kQ29vcmRzXHJcbiAgICB0aGlzLmRpc3RNb3ZlZCA9IGRpc3RNb3ZlZFxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgSG9sZGluZ1BhdHRlcm5QYXJ0aWNsZSBleHRlbmRzIFBhdGhGb2xsb3dpbmdQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBhZ2UsIHNwZWVkLCBlbmRDb29yZHMsIGRpc3RNb3ZlZCwgY3AxQ29vcmRzLCBjcDJDb29yZHMpIHtcclxuICAgIHN1cGVyKGNvb3JkcywgYWdlLCBzcGVlZCwgZW5kQ29vcmRzLCBkaXN0TW92ZWQpXHJcbiAgICB0aGlzLmNwMUNvb3JkcyA9IGNwMUNvb3Jkc1xyXG4gICAgdGhpcy5jcDJDb29yZHMgPSBjcDJDb29yZHNcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVJhbmRvbUhvbGRpbmdQYXR0ZXJuUGFydGljbGUoKSB7XHJcbiAgbGV0IHJhbmRvbVdQID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogNilcclxuXHJcbiAgbGV0IGFnZSA9IDBcclxuICBsZXQgc3BlZWQgPSAxMFxyXG4gIGxldCBkaXN0TW92ZWQgPSAwLy9yYW5kb20gMC0xPz9cclxuICBsZXQgY29vcmRzID0gaG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWxbcmFuZG9tV1BdXHJcbiAgbGV0IGVuZENvb3JkcyA9IHJhbmRvbVdQID09PSA1ID8gaG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWxbMF0gOiBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbFtyYW5kb21XUCArIDFdXHJcbiAgbGV0IGNvb3Jkc1RvRW5kQ29vcmRzVGhldGEgPSBNYXRoLmF0YW4yKGVuZENvb3Jkcy55IC0gY29vcmRzLnksIGVuZENvb3Jkcy54IC0gY29vcmRzLngpXHJcbiAgbGV0IHRoZXRhRGVncyA9IGNvb3Jkc1RvRW5kQ29vcmRzVGhldGEgKiAxODAgLyBNYXRoLlBJXHJcbiAgY29uc29sZS5sb2coYHRoZXRhOiAke3RoZXRhRGVnc31gKVxyXG4gIGxldCBjcDFDb29yZHMgPSAoKSA9PiB7XHJcbiAgICBsZXQgeCA9ICdtYXRocyBzaGl0J1xyXG4gICAgbGV0IHkgPSAnbWF0aHMgc2hpdCdcclxuICAgIHJldHVybiB7eDogeCwgeTogeX1cclxuICB9XHJcbiAgbGV0IGNwMkNvb3JkcyA9ICgpID0+IHtcclxuICAgIGxldCB4ID0gJ21hdGhzIHNoaXQnXHJcbiAgICBsZXQgeSA9ICdtYXRocyBzaGl0J1xyXG4gICAgcmV0dXJuIHt4OiB4LCB5OiB5fVxyXG4gIH1cclxuXHJcbiAgbGV0IHBhcnRpY2xlID0gbmV3IEhvbGRpbmdQYXR0ZXJuUGFydGljbGUoY29vcmRzLCBhZ2UsIHNwZWVkLCBlbmRDb29yZHMsIGRpc3RNb3ZlZCwgY3AxQ29vcmRzLCBjcDJDb29yZHMpXHJcbiAgaG9sZGluZ1BhdHRlcm5QYXJ0aWNsZXMucHVzaChwYXJ0aWNsZSlcclxufVxyXG5cclxuLy9mdW5jdGlvbiB0byBnb2VzIG92ZXIgZXZlcnkgaG9sZGluZ1BhdHRlcm5QYXJ0aWNsZSBpblxyXG4vL2hvbGRpbmdQYXR0ZXJuQXJyYXkgYW5kIGltcGxlbWVudHMgc29tZSBiZWhhdmlvdXJcclxuXHJcbi8vZnVuY3Rpb24gdGhhdCBwb3B1bGF0ZXMgaG9sZGluZ1BhdHRlcm5XYXlwb2ludHNcclxuXHJcbi8vZnVuY3Rpb24gdGhhdCB1cGRhdGVzIGVhY2ggcGFydGljbGVzIHggJiB5IG9uIHdpbmRvdyByZXNpemVcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHNldExheW91dClcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNldExheW91dClcclxuIl19
