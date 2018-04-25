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
  renderBoundingCircle,
  renderHoldPatternWPs,
  renderChosenHoldPatternParticlePath
}
