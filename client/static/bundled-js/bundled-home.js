(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')

let CANVAS1_TOP = 0
let CANVAS1_LEFT = 0
let CANVAS1_BOTTOM
let CANVAS1_RIGHT

/*----------------------------------------------------------------BREAK POINTS*/
function setLayout() {
  console.log(`window.innerWidth: ${window.innerWidth}, window.innerHeight: ${window.innerHeight}`)

  //-------------------------------------------------------------SMALL SCREENS
  //small width in portrait
  if (window.innerHeight > window.innerWidth && window.innerWidth <= 480) {
    console.log('SCREEN: small width in portrait')
    CANVAS1_RIGHT = window.innerWidth
    CANVAS1_BOTTOM = window.innerHeight * 0.5
  }
  //small height in landscape
  if (window.innerHeight < window.innerWidth && window.innerHeight <= 480) {
    console.log('SCREEN: small height in landscape')
    CANVAS1_RIGHT = window.innerWidth * 0.5
    CANVAS1_BOTTOM = window.innerHeight
  }

  //------------------------------------------------------------MEDIUM SCREENS
  //medium width in portrait
  if (window.innerHeight > window.innerWidth && window.innerWidth <= 1024 && window.innerWidth > 480) {
    console.log('SCREEN: medium width in portrait')
    CANVAS1_RIGHT = window.innerWidth
    CANVAS1_BOTTOM = window.innerHeight * 0.7
  }
  //medium height in landscape
  if (window.innerHeight < window.innerWidth && window.innerHeight <= 1024 && window.innerHeight > 480) {
    console.log('SCREEN: medium height in landscape')
    CANVAS1_RIGHT = window.innerWidth * 0.65
    CANVAS1_BOTTOM = window.innerHeight
  }

  //------------------------------------------------------------LARGE SCREENS
  //large widtht in portrait
  if (window.innerHeight > window.innerWidth && window.innerWidth > 1024) {
    console.log('SCREEN: large width in portrait')
    CANVAS1_RIGHT = window.innerWidth
    CANVAS1_BOTTOM = window.innerHeight * 0.65
  }
  //large height in landscape
  if (window.innerHeight < window.innerWidth && window.innerHeight > 1024) {
    console.log('SCREEN: large height in landscape')
    CANVAS1_RIGHT = window.innerWidth * 0.65
    CANVAS1_BOTTOM = window.innerHeight
  }

  canvas1.width = CANVAS1_RIGHT
  canvas1.height = CANVAS1_BOTTOM

  drawTempShape()
}

function drawTempShape() {
  console.log('clearing canvas...')
  ctx1.fillStyle = 'transparent'
  ctx1.fillRect(CANVAS1_LEFT, CANVAS1_TOP, CANVAS1_RIGHT, CANVAS1_BOTTOM)

  console.log('drawing...')
  ctx1.strokeStyle = 'white'
  ctx1.lineWidth = 8
  ctx1.beginPath()
  let x = CANVAS1_RIGHT / 2
  let y = CANVAS1_BOTTOM / 2
  let radius = y > x ? x - 8 : y - 8
  startAngle = 0
  endAngle = 2 * Math.PI
  ctx1.arc(x, y, radius, startAngle, endAngle)
  ctx1.stroke()
}

document.addEventListener("DOMContentLoaded", setLayout)
window.addEventListener('resize', setLayout)

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwibGV0IGNhbnZhczEgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY2FudmFzJylbMF1cclxubGV0IGN0eDEgPSBjYW52YXMxLmdldENvbnRleHQoJzJkJylcclxuXHJcbmxldCBDQU5WQVMxX1RPUCA9IDBcclxubGV0IENBTlZBUzFfTEVGVCA9IDBcclxubGV0IENBTlZBUzFfQk9UVE9NXHJcbmxldCBDQU5WQVMxX1JJR0hUXHJcblxyXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1CUkVBSyBQT0lOVFMqL1xyXG5mdW5jdGlvbiBzZXRMYXlvdXQoKSB7XHJcbiAgY29uc29sZS5sb2coYHdpbmRvdy5pbm5lcldpZHRoOiAke3dpbmRvdy5pbm5lcldpZHRofSwgd2luZG93LmlubmVySGVpZ2h0OiAke3dpbmRvdy5pbm5lckhlaWdodH1gKVxyXG5cclxuICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1TTUFMTCBTQ1JFRU5TXHJcbiAgLy9zbWFsbCB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmICh3aW5kb3cuaW5uZXJIZWlnaHQgPiB3aW5kb3cuaW5uZXJXaWR0aCAmJiB3aW5kb3cuaW5uZXJXaWR0aCA8PSA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IHNtYWxsIHdpZHRoIGluIHBvcnRyYWl0JylcclxuICAgIENBTlZBUzFfUklHSFQgPSB3aW5kb3cuaW5uZXJXaWR0aFxyXG4gICAgQ0FOVkFTMV9CT1RUT00gPSB3aW5kb3cuaW5uZXJIZWlnaHQgKiAwLjVcclxuICB9XHJcbiAgLy9zbWFsbCBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKHdpbmRvdy5pbm5lckhlaWdodCA8IHdpbmRvdy5pbm5lcldpZHRoICYmIHdpbmRvdy5pbm5lckhlaWdodCA8PSA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IHNtYWxsIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgQ0FOVkFTMV9SSUdIVCA9IHdpbmRvdy5pbm5lcldpZHRoICogMC41XHJcbiAgICBDQU5WQVMxX0JPVFRPTSA9IHdpbmRvdy5pbm5lckhlaWdodFxyXG4gIH1cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1NRURJVU0gU0NSRUVOU1xyXG4gIC8vbWVkaXVtIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKHdpbmRvdy5pbm5lckhlaWdodCA+IHdpbmRvdy5pbm5lcldpZHRoICYmIHdpbmRvdy5pbm5lcldpZHRoIDw9IDEwMjQgJiYgd2luZG93LmlubmVyV2lkdGggPiA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IG1lZGl1bSB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBDQU5WQVMxX1JJR0hUID0gd2luZG93LmlubmVyV2lkdGhcclxuICAgIENBTlZBUzFfQk9UVE9NID0gd2luZG93LmlubmVySGVpZ2h0ICogMC43XHJcbiAgfVxyXG4gIC8vbWVkaXVtIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAod2luZG93LmlubmVySGVpZ2h0IDwgd2luZG93LmlubmVyV2lkdGggJiYgd2luZG93LmlubmVySGVpZ2h0IDw9IDEwMjQgJiYgd2luZG93LmlubmVySGVpZ2h0ID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBDQU5WQVMxX1JJR0hUID0gd2luZG93LmlubmVyV2lkdGggKiAwLjY1XHJcbiAgICBDQU5WQVMxX0JPVFRPTSA9IHdpbmRvdy5pbm5lckhlaWdodFxyXG4gIH1cclxuXHJcbiAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1MQVJHRSBTQ1JFRU5TXHJcbiAgLy9sYXJnZSB3aWR0aHQgaW4gcG9ydHJhaXRcclxuICBpZiAod2luZG93LmlubmVySGVpZ2h0ID4gd2luZG93LmlubmVyV2lkdGggJiYgd2luZG93LmlubmVyV2lkdGggPiAxMDI0KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBsYXJnZSB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBDQU5WQVMxX1JJR0hUID0gd2luZG93LmlubmVyV2lkdGhcclxuICAgIENBTlZBUzFfQk9UVE9NID0gd2luZG93LmlubmVySGVpZ2h0ICogMC42NVxyXG4gIH1cclxuICAvL2xhcmdlIGhlaWdodCBpbiBsYW5kc2NhcGVcclxuICBpZiAod2luZG93LmlubmVySGVpZ2h0IDwgd2luZG93LmlubmVyV2lkdGggJiYgd2luZG93LmlubmVySGVpZ2h0ID4gMTAyNCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogbGFyZ2UgaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBDQU5WQVMxX1JJR0hUID0gd2luZG93LmlubmVyV2lkdGggKiAwLjY1XHJcbiAgICBDQU5WQVMxX0JPVFRPTSA9IHdpbmRvdy5pbm5lckhlaWdodFxyXG4gIH1cclxuXHJcbiAgY2FudmFzMS53aWR0aCA9IENBTlZBUzFfUklHSFRcclxuICBjYW52YXMxLmhlaWdodCA9IENBTlZBUzFfQk9UVE9NXHJcblxyXG4gIGRyYXdUZW1wU2hhcGUoKVxyXG59XHJcblxyXG5mdW5jdGlvbiBkcmF3VGVtcFNoYXBlKCkge1xyXG4gIGNvbnNvbGUubG9nKCdjbGVhcmluZyBjYW52YXMuLi4nKVxyXG4gIGN0eDEuZmlsbFN0eWxlID0gJ3RyYW5zcGFyZW50J1xyXG4gIGN0eDEuZmlsbFJlY3QoQ0FOVkFTMV9MRUZULCBDQU5WQVMxX1RPUCwgQ0FOVkFTMV9SSUdIVCwgQ0FOVkFTMV9CT1RUT00pXHJcblxyXG4gIGNvbnNvbGUubG9nKCdkcmF3aW5nLi4uJylcclxuICBjdHgxLnN0cm9rZVN0eWxlID0gJ3doaXRlJ1xyXG4gIGN0eDEubGluZVdpZHRoID0gOFxyXG4gIGN0eDEuYmVnaW5QYXRoKClcclxuICBsZXQgeCA9IENBTlZBUzFfUklHSFQgLyAyXHJcbiAgbGV0IHkgPSBDQU5WQVMxX0JPVFRPTSAvIDJcclxuICBsZXQgcmFkaXVzID0geSA+IHggPyB4IC0gOCA6IHkgLSA4XHJcbiAgc3RhcnRBbmdsZSA9IDBcclxuICBlbmRBbmdsZSA9IDIgKiBNYXRoLlBJXHJcbiAgY3R4MS5hcmMoeCwgeSwgcmFkaXVzLCBzdGFydEFuZ2xlLCBlbmRBbmdsZSlcclxuICBjdHgxLnN0cm9rZSgpXHJcbn1cclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIHNldExheW91dClcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHNldExheW91dClcclxuIl19
