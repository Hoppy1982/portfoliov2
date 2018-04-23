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
