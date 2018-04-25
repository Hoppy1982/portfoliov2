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
