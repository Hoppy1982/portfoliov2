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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImxldCBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXVxyXG5sZXQgY2FudmFzMSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdjYW52YXMnKVswXVxyXG5sZXQgY3R4MSA9IGNhbnZhczEuZ2V0Q29udGV4dCgnMmQnKVxyXG5cclxubGV0IENBTlZBUzFfVE9QID0gMFxyXG5sZXQgQ0FOVkFTMV9MRUZUID0gMFxyXG5sZXQgQ0FOVkFTMV9CT1RUT01cclxubGV0IENBTlZBUzFfUklHSFRcclxuXHJcbmxldCBob2xkaW5nUGF0dGVybldheXBvaW50cyA9IFsvL2FzIHJhdGlvIG9mIGNhbnZhcyBzaXplXHJcbiAge3g6IDAuMTI1LCB5OiAwLjV9LC8vMFxyXG4gIHt4OiAwLjI1LCB5OiAwLjEyNX0sLy8xXHJcbiAge3g6IDAuNzUsIHk6IDAuMTI1fSwvLzJcclxuICB7eDogMC44NzUsIHk6IDAuNX0sLy8zXHJcbiAge3g6IDAuNzUsIHk6IDAuODc1fSwvLzRcclxuICB7eDogMC4yNSwgeTogMC44NzV9Ly81XHJcbl1cclxuXHJcbmxldCBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbCA9IFtdXHJcblxyXG4vL1BhcnRpY2xlc1xyXG5sZXQgaG9sZGluZ1BhdHRlcm5QYXJ0aWNsZXMgPSBbXVxyXG5cclxuLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tQlJFQUsgUE9JTlRTKi9cclxuZnVuY3Rpb24gc2V0TGF5b3V0KCkge1xyXG4gIGNvbnNvbGUubG9nKGBib2R5LmNsaWVudFdpZHRoOiAke2JvZHkuY2xpZW50V2lkdGh9LCBib2R5LmNsaWVudEhlaWdodDogJHtib2R5LmNsaWVudEhlaWdodH1gKVxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1TTUFMTCBTQ1JFRU5TXHJcbiAgLy9zbWFsbCB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA8PSA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IHNtYWxsIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIENBTlZBUzFfUklHSFQgPSBib2R5LmNsaWVudFdpZHRoXHJcbiAgICBDQU5WQVMxX0JPVFRPTSA9IGJvZHkuY2xpZW50SGVpZ2h0ICogMC41XHJcbiAgfVxyXG4gIC8vc21hbGwgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBzbWFsbCBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIENBTlZBUzFfUklHSFQgPSBib2R5LmNsaWVudFdpZHRoICogMC41XHJcbiAgICBDQU5WQVMxX0JPVFRPTSA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLU1FRElVTSBTQ1JFRU5TXHJcbiAgLy9tZWRpdW0gd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPD0gMTAyNCAmJiBib2R5LmNsaWVudFdpZHRoID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgQ0FOVkFTMV9SSUdIVCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIENBTlZBUzFfQk9UVE9NID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjdcclxuICB9XHJcbiAgLy9tZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPD0gMTAyNCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbWVkaXVtIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgQ0FOVkFTMV9SSUdIVCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjY1XHJcbiAgICBDQU5WQVMxX0JPVFRPTSA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLUxBUkdFIFNDUkVFTlNcclxuICAvL2xhcmdlIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoID4gMTAyNCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbGFyZ2Ugd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgQ0FOVkFTMV9SSUdIVCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIENBTlZBUzFfQk9UVE9NID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjY1XHJcbiAgfVxyXG4gIC8vbGFyZ2UgaGVpZ2h0IGluIGxhbmRzY2FwZVxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA8IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRIZWlnaHQgPiAxMDI0KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBsYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlJylcclxuICAgIENBTlZBUzFfUklHSFQgPSBib2R5LmNsaWVudFdpZHRoICogMC42NVxyXG4gICAgQ0FOVkFTMV9CT1RUT00gPSBib2R5LmNsaWVudEhlaWdodFxyXG4gIH1cclxuXHJcbiAgY2FudmFzMS53aWR0aCA9IENBTlZBUzFfUklHSFRcclxuICBjYW52YXMxLmhlaWdodCA9IENBTlZBUzFfQk9UVE9NXHJcblxyXG4gIGluaXRIb2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbCgpXHJcbiAgY29uc29sZS5sb2coLi4uaG9sZGluZ1BhdHRlcm5XYXlwb2ludHNBY3R1YWwpXHJcbiAgZHJhd0hvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzKClcclxuICBkcmF3VGVtcFNoYXBlKClcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdEhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsKCkge1xyXG4gIGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzQWN0dWFsLmxlbmd0aCA9IDBcclxuICBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbCA9IGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzLm1hcChlbCA9PiB7XHJcbiAgICBsZXQgeCA9IGVsLnggKiBDQU5WQVMxX1JJR0hUXHJcbiAgICBsZXQgeSA9IGVsLnkgKiBDQU5WQVMxX0JPVFRPTVxyXG4gICAgcmV0dXJuIHt4OiB4LCB5OiB5fVxyXG4gIH0pXHJcbn1cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tdGVtcG9yYXJ5IHRvIHNlZSBpZiB3cCdzIGNvcnJlY3RcclxuZnVuY3Rpb24gZHJhd0hvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzKCkge1xyXG4gIGN0eDEuZmlsbFN0eWxlID0gJ3JlZCdcclxuICBob2xkaW5nUGF0dGVybldheXBvaW50c0FjdHVhbC5mb3JFYWNoKHdwID0+IHtcclxuICAgIGN0eDEuZmlsbFJlY3Qod3AueCwgd3AueSwgOCwgOClcclxuICB9KVxyXG59XHJcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS10ZW1wb3JhcnkgdG8gdGVzdCBjYW52YXMgbGF5b3V0XHJcbmZ1bmN0aW9uIGRyYXdUZW1wU2hhcGUoKSB7XHJcbiAgY29uc29sZS5sb2coJ2NsZWFyaW5nIGNhbnZhcy4uLicpXHJcbiAgY3R4MS5maWxsU3R5bGUgPSAndHJhbnNwYXJlbnQnXHJcbiAgY3R4MS5maWxsUmVjdChDQU5WQVMxX0xFRlQsIENBTlZBUzFfVE9QLCBDQU5WQVMxX1JJR0hULCBDQU5WQVMxX0JPVFRPTSlcclxuXHJcbiAgY29uc29sZS5sb2coJ2RyYXdpbmcuLi4nKVxyXG4gIGN0eDEuc3Ryb2tlU3R5bGUgPSAnd2hpdGUnXHJcbiAgY3R4MS5saW5lV2lkdGggPSA0XHJcbiAgY3R4MS5iZWdpblBhdGgoKVxyXG4gIGxldCB4ID0gQ0FOVkFTMV9SSUdIVCAvIDJcclxuICBsZXQgeSA9IENBTlZBUzFfQk9UVE9NIC8gMlxyXG4gIGxldCByYWRpdXMgPSB5ID4geCA/IHggLSA4IDogeSAtIDhcclxuICBzdGFydEFuZ2xlID0gMFxyXG4gIGVuZEFuZ2xlID0gMiAqIE1hdGguUElcclxuICBjdHgxLmFyYyh4LCB5LCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKVxyXG4gIGN0eDEuc3Ryb2tlKClcclxufVxyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1QQVJUSUNMRSBDTEFTU0VTXHJcbmNsYXNzIFBhcnRpY2xlIHtcclxuICBjb25zdHJ1Y3Rvcihjb29yZHMsIGFnZSwgc3BlZWQpIHtcclxuICAgIHRoaXMuY29vcmRzID0gY29vcmRzXHJcbiAgICB0aGlzLmFnZSA9IGFnZVxyXG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkXHJcbiAgfVxyXG4gIGxpc3RQcm9wcygpIHsvL3RlbXAgbWV0aG9kIGZvciB0ZXN0aW5nXHJcbiAgICBmb3IgKGxldCBrZXkgaW4gdGhpcykge1xyXG4gICAgICBjb25zb2xlLmxvZyhgJHtrZXl9OiAke3RoaXNba2V5XX1gKVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgUGF0aEZvbGxvd2luZ1BhcnRpY2xlIGV4dGVuZHMgUGFydGljbGUge1xyXG4gIGNvbnN0cnVjdG9yKGNvb3JkcywgYWdlLCBzcGVlZCwgZW5kQ29vcmRzLCBkaXN0TW92ZWQpIHtcclxuICAgIHN1cGVyKGNvb3JkcywgYWdlLCBzcGVlZClcclxuICAgIHRoaXMuZW5kQ29vcmRzID0gZW5kQ29vcmRzXHJcbiAgICB0aGlzLmRpc3RNb3ZlZCA9IGRpc3RNb3ZlZFxyXG4gIH1cclxufVxyXG5cclxuY2xhc3MgSG9sZGluZ1BhdHRlcm5QYXJ0aWNsZSBleHRlbmRzIFBhdGhGb2xsb3dpbmdQYXJ0aWNsZSB7XHJcbiAgY29uc3RydWN0b3IoY29vcmRzLCBhZ2UsIHNwZWVkLCBlbmRDb29yZHMsIGRpc3RNb3ZlZCwgY3AxQ29vcmRzLCBjcDJDb29yZHMpIHtcclxuICAgIHN1cGVyKGNvb3JkcywgYWdlLCBzcGVlZCwgZW5kQ29vcmRzLCBkaXN0TW92ZWQpXHJcbiAgICB0aGlzLmNwMUNvb3JkcyA9IGNwMUNvb3Jkc1xyXG4gICAgdGhpcy5jcDJDb29yZHMgPSBjcDJDb29yZHNcclxuICB9XHJcbn1cclxuXHJcbi8vZnVuY3Rpb24gdG8gZ29lcyBvdmVyIGV2ZXJ5IGhvbGRpbmdQYXR0ZXJuUGFydGljbGUgaW5cclxuLy9ob2xkaW5nUGF0dGVybkFycmF5IGFuZCBpbXBsZW1lbnRzIHNvbWUgYmVoYXZpb3VyXHJcblxyXG4vL2Z1bmN0aW9uIHRoYXQgcG9wdWxhdGVzIGhvbGRpbmdQYXR0ZXJuV2F5cG9pbnRzXHJcblxyXG4vL2Z1bmN0aW9uIHRoYXQgdXBkYXRlcyBlYWNoIHBhcnRpY2xlcyB4ICYgeSBvbiB3aW5kb3cgcmVzaXplXHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBzZXRMYXlvdXQpXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBzZXRMYXlvdXQpXHJcbiJdfQ==
