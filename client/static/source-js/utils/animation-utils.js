// portfolio
// animation-utils.js

//to wrtite
function randomColorInRange(redLow, redUp, greenLow, greenUp, blueLow, blueUp) {

}

function randomColors(num) {
  var chars = '0123456789ABCDEF';
  var hex;
  var colors = [];
  for (let i = 0; i < num; i++) {
    hex = '#';
    for (let j = 0; j < 6; j++) {
      hex += chars[Math.floor(Math.random() * 16)];
    }
    colors.push(hex);
  }
  return colors;
}

function drawLozenge(ctx, x1, y1, x2, y2, radius) {
  let tangentAngle = Math.atan( (y2 - y1) / (x2 - x1) );
  let preCalcDx = (Math.sin(tangentAngle) * radius);
  let preCalcDy = (Math.cos(tangentAngle) * radius);
  let corner1 = { x: x1 + preCalcDx, y: y1 - preCalcDy };
  let corner2 = { x: x1 - preCalcDx, y: y1 + preCalcDy };
  let corner3 = { x: x2 - preCalcDx, y: y2 + preCalcDy };
  let corner4 = { x: x2 + preCalcDx, y: y2 - preCalcDy };
  let apex1 = { x: x1 - preCalcDy, y: y1 - preCalcDx };
  let apex2 = { x: x2 + preCalcDy, y: y2 + preCalcDx };
  let extCorner1 = { x: corner1.x + preCalcDy, y: corner1.y + preCalcDx };
  let extCorner2 = { x: corner2.x + preCalcDy, y: corner2.y + preCalcDx };
  let extCorner3 = { x: corner3.x - preCalcDy, y: corner3.y - preCalcDx };
  let extCorner4 = { x: corner4.x - preCalcDy, y: corner4.y - preCalcDx };
  if (x1 > x2) {
    apex1 = { x: x1 + preCalcDy, y: y1 + preCalcDx };
    apex2 = { x: x2 - preCalcDy, y: y2 - preCalcDx };
  }
  if (x1 <= x2) {
    extCorner1 = { x: corner1.x - preCalcDy, y: corner1.y - preCalcDx };
    extCorner2 = { x: corner2.x - preCalcDy, y: corner2.y - preCalcDx };
    extCorner3 = { x: corner3.x + preCalcDy, y: corner3.y + preCalcDx };
    extCorner4 = { x: corner4.x + preCalcDy, y: corner4.y + preCalcDx };
  }

  ctx.moveTo(corner2.x, corner2.y);
  ctx.lineTo(corner3.x, corner3.y);
  ctx.arcTo(extCorner3.x, extCorner3.y, apex2.x, apex2.y, radius);
  ctx.arcTo(extCorner4.x, extCorner4.y, corner4.x, corner4.y, radius);
  ctx.lineTo(corner1.x, corner1.y);
  ctx.arcTo(extCorner1.x, extCorner1.y, apex1.x, apex1.y, radius);
  ctx.arcTo(extCorner2.x, extCorner2.y, corner2.x, corner2.y, radius);

/*debugging stuff, leave commented out*/
/*
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#0000ff';
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ff00ff';
  ctx.moveTo(apex1.x, apex1.y);
  ctx.lineTo(apex2.x, apex2.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ff0000';
  ctx.moveTo(corner1.x, corner1.y);
  ctx.lineTo(corner2.x, corner2.y);
  ctx.lineTo(corner3.x, corner3.y);
  ctx.lineTo(corner4.x, corner4.y);
  ctx.lineTo(corner1.x, corner1.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#00ff00';
  ctx.moveTo(extCorner1.x, extCorner1.y);
  ctx.lineTo(extCorner2.x, extCorner2.y);
  ctx.lineTo(extCorner3.x, extCorner3.y);
  ctx.lineTo(extCorner4.x, extCorner4.y);
  ctx.lineTo(extCorner1.x, extCorner1.y);
  ctx.stroke();
  */
  /*end of debugging stuff*/
}

//-----------------------------------------------------------------------exports
exports.randomColors = randomColors;
exports.drawLozenge = drawLozenge;
