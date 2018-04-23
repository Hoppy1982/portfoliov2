(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let body = document.getElementsByTagName('body')[0]
let canvas1 = document.getElementsByTagName('canvas')[0]
let ctx1 = canvas1.getContext('2d')

let CANVAS1_TOP = 0
let CANVAS1_LEFT = 0
let CANVAS1_BOTTOM
let CANVAS1_RIGHT

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

  drawTempShape()
}

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

document.addEventListener("DOMContentLoaded", setLayout)
window.addEventListener('resize', setLayout)

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9ob21lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJsZXQgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF1cclxubGV0IGNhbnZhczEgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnY2FudmFzJylbMF1cclxubGV0IGN0eDEgPSBjYW52YXMxLmdldENvbnRleHQoJzJkJylcclxuXHJcbmxldCBDQU5WQVMxX1RPUCA9IDBcclxubGV0IENBTlZBUzFfTEVGVCA9IDBcclxubGV0IENBTlZBUzFfQk9UVE9NXHJcbmxldCBDQU5WQVMxX1JJR0hUXHJcblxyXG4vKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1CUkVBSyBQT0lOVFMqL1xyXG5mdW5jdGlvbiBzZXRMYXlvdXQoKSB7XHJcbiAgY29uc29sZS5sb2coYGJvZHkuY2xpZW50V2lkdGg6ICR7Ym9keS5jbGllbnRXaWR0aH0sIGJvZHkuY2xpZW50SGVpZ2h0OiAke2JvZHkuY2xpZW50SGVpZ2h0fWApXHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVNNQUxMIFNDUkVFTlNcclxuICAvL3NtYWxsIHdpZHRoIGluIHBvcnRyYWl0XHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0ID4gYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudFdpZHRoIDw9IDQ4MCkge1xyXG4gICAgY29uc29sZS5sb2coJ1NDUkVFTjogc21hbGwgd2lkdGggaW4gcG9ydHJhaXQnKVxyXG4gICAgQ0FOVkFTMV9SSUdIVCA9IGJvZHkuY2xpZW50V2lkdGhcclxuICAgIENBTlZBUzFfQk9UVE9NID0gYm9keS5jbGllbnRIZWlnaHQgKiAwLjVcclxuICB9XHJcbiAgLy9zbWFsbCBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA8PSA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IHNtYWxsIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgQ0FOVkFTMV9SSUdIVCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjVcclxuICAgIENBTlZBUzFfQk9UVE9NID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTUVESVVNIFNDUkVFTlNcclxuICAvL21lZGl1bSB3aWR0aCBpbiBwb3J0cmFpdFxyXG4gIGlmIChib2R5LmNsaWVudEhlaWdodCA+IGJvZHkuY2xpZW50V2lkdGggJiYgYm9keS5jbGllbnRXaWR0aCA8PSAxMDI0ICYmIGJvZHkuY2xpZW50V2lkdGggPiA0ODApIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IG1lZGl1bSB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBDQU5WQVMxX1JJR0hUID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgQ0FOVkFTMV9CT1RUT00gPSBib2R5LmNsaWVudEhlaWdodCAqIDAuN1xyXG4gIH1cclxuICAvL21lZGl1bSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA8PSAxMDI0ICYmIGJvZHkuY2xpZW50SGVpZ2h0ID4gNDgwKSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBtZWRpdW0gaGVpZ2h0IGluIGxhbmRzY2FwZScpXHJcbiAgICBDQU5WQVMxX1JJR0hUID0gYm9keS5jbGllbnRXaWR0aCAqIDAuNjVcclxuICAgIENBTlZBUzFfQk9UVE9NID0gYm9keS5jbGllbnRIZWlnaHRcclxuICB9XHJcblxyXG4gIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tTEFSR0UgU0NSRUVOU1xyXG4gIC8vbGFyZ2Ugd2lkdGggaW4gcG9ydHJhaXRcclxuICBpZiAoYm9keS5jbGllbnRIZWlnaHQgPiBib2R5LmNsaWVudFdpZHRoICYmIGJvZHkuY2xpZW50V2lkdGggPiAxMDI0KSB7XHJcbiAgICBjb25zb2xlLmxvZygnU0NSRUVOOiBsYXJnZSB3aWR0aCBpbiBwb3J0cmFpdCcpXHJcbiAgICBDQU5WQVMxX1JJR0hUID0gYm9keS5jbGllbnRXaWR0aFxyXG4gICAgQ0FOVkFTMV9CT1RUT00gPSBib2R5LmNsaWVudEhlaWdodCAqIDAuNjVcclxuICB9XHJcbiAgLy9sYXJnZSBoZWlnaHQgaW4gbGFuZHNjYXBlXHJcbiAgaWYgKGJvZHkuY2xpZW50SGVpZ2h0IDwgYm9keS5jbGllbnRXaWR0aCAmJiBib2R5LmNsaWVudEhlaWdodCA+IDEwMjQpIHtcclxuICAgIGNvbnNvbGUubG9nKCdTQ1JFRU46IGxhcmdlIGhlaWdodCBpbiBsYW5kc2NhcGUnKVxyXG4gICAgQ0FOVkFTMV9SSUdIVCA9IGJvZHkuY2xpZW50V2lkdGggKiAwLjY1XHJcbiAgICBDQU5WQVMxX0JPVFRPTSA9IGJvZHkuY2xpZW50SGVpZ2h0XHJcbiAgfVxyXG5cclxuICBjYW52YXMxLndpZHRoID0gQ0FOVkFTMV9SSUdIVFxyXG4gIGNhbnZhczEuaGVpZ2h0ID0gQ0FOVkFTMV9CT1RUT01cclxuXHJcbiAgZHJhd1RlbXBTaGFwZSgpXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRyYXdUZW1wU2hhcGUoKSB7XHJcbiAgY29uc29sZS5sb2coJ2NsZWFyaW5nIGNhbnZhcy4uLicpXHJcbiAgY3R4MS5maWxsU3R5bGUgPSAndHJhbnNwYXJlbnQnXHJcbiAgY3R4MS5maWxsUmVjdChDQU5WQVMxX0xFRlQsIENBTlZBUzFfVE9QLCBDQU5WQVMxX1JJR0hULCBDQU5WQVMxX0JPVFRPTSlcclxuXHJcbiAgY29uc29sZS5sb2coJ2RyYXdpbmcuLi4nKVxyXG4gIGN0eDEuc3Ryb2tlU3R5bGUgPSAnd2hpdGUnXHJcbiAgY3R4MS5saW5lV2lkdGggPSA0XHJcbiAgY3R4MS5iZWdpblBhdGgoKVxyXG4gIGxldCB4ID0gQ0FOVkFTMV9SSUdIVCAvIDJcclxuICBsZXQgeSA9IENBTlZBUzFfQk9UVE9NIC8gMlxyXG4gIGxldCByYWRpdXMgPSB5ID4geCA/IHggLSA4IDogeSAtIDhcclxuICBzdGFydEFuZ2xlID0gMFxyXG4gIGVuZEFuZ2xlID0gMiAqIE1hdGguUElcclxuICBjdHgxLmFyYyh4LCB5LCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlKVxyXG4gIGN0eDEuc3Ryb2tlKClcclxufVxyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgc2V0TGF5b3V0KVxyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgc2V0TGF5b3V0KVxyXG4iXX0=
