(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// portfolio
// site-layout.js

// File description:
//

const animationsUtils = require('./utils/animation-utils')
const animationsOrbits = require('./utils/animation-orbits');
const animationsLogo = require('./utils/animation-logo');



//start logo animation
window.onload = function() {
  randomAni1Colors();
  animationsLogo.init('canvasLogo');
}


//change orbity colors on header click
randomAni1Colors = function() {
  var colors = animationsUtils.randomColors(4);
  animationsOrbits.animationOne('canvas1', colors[0], colors[1], colors[2], colors[3]);
}

//
reposNav = function() {
  var scrollPos = window.scrollY;
  var nav = document.getElementById('nav');
  var antiNav = document.getElementById('antiNav');

  if (scrollPos < 140) {
    nav.classList.remove('scrollOffTopNav');
    nav.classList.add('scrollTopNav');
    antiNav.classList.remove('antiNavHere');
    antiNav.classList.add('antiNavGone');
  } else {
    nav.classList.remove('scrollTopNav');
    nav.classList.add('scrollOffTopNav');
    antiNav.classList.remove('antiNavGone');
    antiNav.classList.add('antiNavHere');
  }
}

expandNav = function() {
  console.log('Expanding navbar');
  var navButts = document.getElementsByClassName('navButtBigScreen');

  Array.prototype.forEach.call(navButts, function(element) {
    element.classList.toggle('showNavButts');
  });
}

},{"./utils/animation-logo":2,"./utils/animation-orbits":3,"./utils/animation-utils":4}],2:[function(require,module,exports){
// portfolio
// animation-logo.js

// File description:
//

// **canvas is 140 wide & 140 high**
function init() {
  console.log("placeholder for animationsLogo init()");
}


module.exports = {
  init
};

},{}],3:[function(require,module,exports){
// portfolio
// animation-orbits.js

// File description:
//

module.exports.animationOne = function(el, color1, color2, color3, color4) {

  window.requestAnimationFrame(draw);

  function draw() {
    var time = new Date();
    var ctx = document.getElementById(el).getContext('2d');
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, 140, 140);

    ctx.save();
    ctx.translate(70, 70);

    ctx.rotate(((2 * Math.PI) / 4) * time.getSeconds() + ((2 * Math.PI) / 4000) * time.getMilliseconds());
    ctx.translate(4, 6);
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2, false);
    ctx.lineWidth = 4;
    ctx.strokeStyle = color1;
    ctx.stroke();

    ctx.rotate(((2 * Math.PI) / 12) * time.getSeconds() + ((2 * Math.PI) / 12000) * time.getMilliseconds());
    ctx.translate(0, 26);
    ctx.beginPath();
    ctx.arc(0, 13, 4, 0, Math.PI * 2, false);
    ctx.lineWidth = 3;
    ctx.strokeStyle = color2;
    ctx.stroke();

    ctx.translate(0, 13);
    ctx.rotate(((2 * Math.PI) / 3) * time.getSeconds() + ((2 * Math.PI) / 3000) * time.getMilliseconds());
    ctx.beginPath();
    ctx.arc(0, 14, 3, 0, Math.PI * 2, false);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color3;
    ctx.stroke();

    ctx.translate(0, 14);
    //ctx.rotate(((2 * Math.PI) / 1) * time.getSeconds() + ((2 * Math.PI) / 1000) * time.getMilliseconds());
    ctx.rotate( ((2 * Math.PI)) - (((2 * Math.PI) / 0.6) * time.getSeconds() + ((2 * Math.PI) / 600) * time.getMilliseconds())  );
    ctx.beginPath();
    ctx.arc(0, 7, 1, 0, Math.PI * 2, false);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color4;
    ctx.stroke();

    ctx.restore();

    window.requestAnimationFrame(draw);
  }

}

},{}],4:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9zaXRlLWxheW91dC5qcyIsImNsaWVudC9zdGF0aWMvc291cmNlLWpzL3V0aWxzL2FuaW1hdGlvbi1sb2dvLmpzIiwiY2xpZW50L3N0YXRpYy9zb3VyY2UtanMvdXRpbHMvYW5pbWF0aW9uLW9yYml0cy5qcyIsImNsaWVudC9zdGF0aWMvc291cmNlLWpzL3V0aWxzL2FuaW1hdGlvbi11dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBwb3J0Zm9saW9cclxuLy8gc2l0ZS1sYXlvdXQuanNcclxuXHJcbi8vIEZpbGUgZGVzY3JpcHRpb246XHJcbi8vXHJcblxyXG5jb25zdCBhbmltYXRpb25zVXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzL2FuaW1hdGlvbi11dGlscycpXHJcbmNvbnN0IGFuaW1hdGlvbnNPcmJpdHMgPSByZXF1aXJlKCcuL3V0aWxzL2FuaW1hdGlvbi1vcmJpdHMnKTtcclxuY29uc3QgYW5pbWF0aW9uc0xvZ28gPSByZXF1aXJlKCcuL3V0aWxzL2FuaW1hdGlvbi1sb2dvJyk7XHJcblxyXG5cclxuXHJcbi8vc3RhcnQgbG9nbyBhbmltYXRpb25cclxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJhbmRvbUFuaTFDb2xvcnMoKTtcclxuICBhbmltYXRpb25zTG9nby5pbml0KCdjYW52YXNMb2dvJyk7XHJcbn1cclxuXHJcblxyXG4vL2NoYW5nZSBvcmJpdHkgY29sb3JzIG9uIGhlYWRlciBjbGlja1xyXG5yYW5kb21BbmkxQ29sb3JzID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGNvbG9ycyA9IGFuaW1hdGlvbnNVdGlscy5yYW5kb21Db2xvcnMoNCk7XHJcbiAgYW5pbWF0aW9uc09yYml0cy5hbmltYXRpb25PbmUoJ2NhbnZhczEnLCBjb2xvcnNbMF0sIGNvbG9yc1sxXSwgY29sb3JzWzJdLCBjb2xvcnNbM10pO1xyXG59XHJcblxyXG4vL1xyXG5yZXBvc05hdiA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBzY3JvbGxQb3MgPSB3aW5kb3cuc2Nyb2xsWTtcclxuICB2YXIgbmF2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hdicpO1xyXG4gIHZhciBhbnRpTmF2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FudGlOYXYnKTtcclxuXHJcbiAgaWYgKHNjcm9sbFBvcyA8IDE0MCkge1xyXG4gICAgbmF2LmNsYXNzTGlzdC5yZW1vdmUoJ3Njcm9sbE9mZlRvcE5hdicpO1xyXG4gICAgbmF2LmNsYXNzTGlzdC5hZGQoJ3Njcm9sbFRvcE5hdicpO1xyXG4gICAgYW50aU5hdi5jbGFzc0xpc3QucmVtb3ZlKCdhbnRpTmF2SGVyZScpO1xyXG4gICAgYW50aU5hdi5jbGFzc0xpc3QuYWRkKCdhbnRpTmF2R29uZScpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBuYXYuY2xhc3NMaXN0LnJlbW92ZSgnc2Nyb2xsVG9wTmF2Jyk7XHJcbiAgICBuYXYuY2xhc3NMaXN0LmFkZCgnc2Nyb2xsT2ZmVG9wTmF2Jyk7XHJcbiAgICBhbnRpTmF2LmNsYXNzTGlzdC5yZW1vdmUoJ2FudGlOYXZHb25lJyk7XHJcbiAgICBhbnRpTmF2LmNsYXNzTGlzdC5hZGQoJ2FudGlOYXZIZXJlJyk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBhbmROYXYgPSBmdW5jdGlvbigpIHtcclxuICBjb25zb2xlLmxvZygnRXhwYW5kaW5nIG5hdmJhcicpO1xyXG4gIHZhciBuYXZCdXR0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ25hdkJ1dHRCaWdTY3JlZW4nKTtcclxuXHJcbiAgQXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChuYXZCdXR0cywgZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdzaG93TmF2QnV0dHMnKTtcclxuICB9KTtcclxufVxyXG4iLCIvLyBwb3J0Zm9saW9cclxuLy8gYW5pbWF0aW9uLWxvZ28uanNcclxuXHJcbi8vIEZpbGUgZGVzY3JpcHRpb246XHJcbi8vXHJcblxyXG4vLyAqKmNhbnZhcyBpcyAxNDAgd2lkZSAmIDE0MCBoaWdoKipcclxuZnVuY3Rpb24gaW5pdCgpIHtcclxuICBjb25zb2xlLmxvZyhcInBsYWNlaG9sZGVyIGZvciBhbmltYXRpb25zTG9nbyBpbml0KClcIik7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBpbml0XHJcbn07XHJcbiIsIi8vIHBvcnRmb2xpb1xyXG4vLyBhbmltYXRpb24tb3JiaXRzLmpzXHJcblxyXG4vLyBGaWxlIGRlc2NyaXB0aW9uOlxyXG4vL1xyXG5cclxubW9kdWxlLmV4cG9ydHMuYW5pbWF0aW9uT25lID0gZnVuY3Rpb24oZWwsIGNvbG9yMSwgY29sb3IyLCBjb2xvcjMsIGNvbG9yNCkge1xyXG5cclxuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGRyYXcpO1xyXG5cclxuICBmdW5jdGlvbiBkcmF3KCkge1xyXG4gICAgdmFyIHRpbWUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgdmFyIGN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsKS5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdzb3VyY2Utb3Zlcic7XHJcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIDE0MCwgMTQwKTtcclxuXHJcbiAgICBjdHguc2F2ZSgpO1xyXG4gICAgY3R4LnRyYW5zbGF0ZSg3MCwgNzApO1xyXG5cclxuICAgIGN0eC5yb3RhdGUoKCgyICogTWF0aC5QSSkgLyA0KSAqIHRpbWUuZ2V0U2Vjb25kcygpICsgKCgyICogTWF0aC5QSSkgLyA0MDAwKSAqIHRpbWUuZ2V0TWlsbGlzZWNvbmRzKCkpO1xyXG4gICAgY3R4LnRyYW5zbGF0ZSg0LCA2KTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmMoMCwgMCwgMTIsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcbiAgICBjdHgubGluZVdpZHRoID0gNDtcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yMTtcclxuICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICBjdHgucm90YXRlKCgoMiAqIE1hdGguUEkpIC8gMTIpICogdGltZS5nZXRTZWNvbmRzKCkgKyAoKDIgKiBNYXRoLlBJKSAvIDEyMDAwKSAqIHRpbWUuZ2V0TWlsbGlzZWNvbmRzKCkpO1xyXG4gICAgY3R4LnRyYW5zbGF0ZSgwLCAyNik7XHJcbiAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICBjdHguYXJjKDAsIDEzLCA0LCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xyXG4gICAgY3R4LmxpbmVXaWR0aCA9IDM7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcjI7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgY3R4LnRyYW5zbGF0ZSgwLCAxMyk7XHJcbiAgICBjdHgucm90YXRlKCgoMiAqIE1hdGguUEkpIC8gMykgKiB0aW1lLmdldFNlY29uZHMoKSArICgoMiAqIE1hdGguUEkpIC8gMzAwMCkgKiB0aW1lLmdldE1pbGxpc2Vjb25kcygpKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmMoMCwgMTQsIDMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XHJcbiAgICBjdHgubGluZVdpZHRoID0gMjtcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IGNvbG9yMztcclxuICAgIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgICBjdHgudHJhbnNsYXRlKDAsIDE0KTtcclxuICAgIC8vY3R4LnJvdGF0ZSgoKDIgKiBNYXRoLlBJKSAvIDEpICogdGltZS5nZXRTZWNvbmRzKCkgKyAoKDIgKiBNYXRoLlBJKSAvIDEwMDApICogdGltZS5nZXRNaWxsaXNlY29uZHMoKSk7XHJcbiAgICBjdHgucm90YXRlKCAoKDIgKiBNYXRoLlBJKSkgLSAoKCgyICogTWF0aC5QSSkgLyAwLjYpICogdGltZS5nZXRTZWNvbmRzKCkgKyAoKDIgKiBNYXRoLlBJKSAvIDYwMCkgKiB0aW1lLmdldE1pbGxpc2Vjb25kcygpKSAgKTtcclxuICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgIGN0eC5hcmMoMCwgNywgMSwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcclxuICAgIGN0eC5saW5lV2lkdGggPSAyO1xyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3I0O1xyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICAgIGN0eC5yZXN0b3JlKCk7XHJcblxyXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KTtcclxuICB9XHJcblxyXG59XHJcbiIsIi8vIHBvcnRmb2xpb1xyXG4vLyBhbmltYXRpb24tdXRpbHMuanNcclxuXHJcbi8vdG8gd3J0aXRlXHJcbmZ1bmN0aW9uIHJhbmRvbUNvbG9ySW5SYW5nZShyZWRMb3csIHJlZFVwLCBncmVlbkxvdywgZ3JlZW5VcCwgYmx1ZUxvdywgYmx1ZVVwKSB7XHJcblxyXG59XHJcblxyXG5mdW5jdGlvbiByYW5kb21Db2xvcnMobnVtKSB7XHJcbiAgdmFyIGNoYXJzID0gJzAxMjM0NTY3ODlBQkNERUYnO1xyXG4gIHZhciBoZXg7XHJcbiAgdmFyIGNvbG9ycyA9IFtdO1xyXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcclxuICAgIGhleCA9ICcjJztcclxuICAgIGZvciAobGV0IGogPSAwOyBqIDwgNjsgaisrKSB7XHJcbiAgICAgIGhleCArPSBjaGFyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNildO1xyXG4gICAgfVxyXG4gICAgY29sb3JzLnB1c2goaGV4KTtcclxuICB9XHJcbiAgcmV0dXJuIGNvbG9ycztcclxufVxyXG5cclxuZnVuY3Rpb24gZHJhd0xvemVuZ2UoY3R4LCB4MSwgeTEsIHgyLCB5MiwgcmFkaXVzKSB7XHJcbiAgbGV0IHRhbmdlbnRBbmdsZSA9IE1hdGguYXRhbiggKHkyIC0geTEpIC8gKHgyIC0geDEpICk7XHJcbiAgbGV0IHByZUNhbGNEeCA9IChNYXRoLnNpbih0YW5nZW50QW5nbGUpICogcmFkaXVzKTtcclxuICBsZXQgcHJlQ2FsY0R5ID0gKE1hdGguY29zKHRhbmdlbnRBbmdsZSkgKiByYWRpdXMpO1xyXG4gIGxldCBjb3JuZXIxID0geyB4OiB4MSArIHByZUNhbGNEeCwgeTogeTEgLSBwcmVDYWxjRHkgfTtcclxuICBsZXQgY29ybmVyMiA9IHsgeDogeDEgLSBwcmVDYWxjRHgsIHk6IHkxICsgcHJlQ2FsY0R5IH07XHJcbiAgbGV0IGNvcm5lcjMgPSB7IHg6IHgyIC0gcHJlQ2FsY0R4LCB5OiB5MiArIHByZUNhbGNEeSB9O1xyXG4gIGxldCBjb3JuZXI0ID0geyB4OiB4MiArIHByZUNhbGNEeCwgeTogeTIgLSBwcmVDYWxjRHkgfTtcclxuICBsZXQgYXBleDEgPSB7IHg6IHgxIC0gcHJlQ2FsY0R5LCB5OiB5MSAtIHByZUNhbGNEeCB9O1xyXG4gIGxldCBhcGV4MiA9IHsgeDogeDIgKyBwcmVDYWxjRHksIHk6IHkyICsgcHJlQ2FsY0R4IH07XHJcbiAgbGV0IGV4dENvcm5lcjEgPSB7IHg6IGNvcm5lcjEueCArIHByZUNhbGNEeSwgeTogY29ybmVyMS55ICsgcHJlQ2FsY0R4IH07XHJcbiAgbGV0IGV4dENvcm5lcjIgPSB7IHg6IGNvcm5lcjIueCArIHByZUNhbGNEeSwgeTogY29ybmVyMi55ICsgcHJlQ2FsY0R4IH07XHJcbiAgbGV0IGV4dENvcm5lcjMgPSB7IHg6IGNvcm5lcjMueCAtIHByZUNhbGNEeSwgeTogY29ybmVyMy55IC0gcHJlQ2FsY0R4IH07XHJcbiAgbGV0IGV4dENvcm5lcjQgPSB7IHg6IGNvcm5lcjQueCAtIHByZUNhbGNEeSwgeTogY29ybmVyNC55IC0gcHJlQ2FsY0R4IH07XHJcbiAgaWYgKHgxID4geDIpIHtcclxuICAgIGFwZXgxID0geyB4OiB4MSArIHByZUNhbGNEeSwgeTogeTEgKyBwcmVDYWxjRHggfTtcclxuICAgIGFwZXgyID0geyB4OiB4MiAtIHByZUNhbGNEeSwgeTogeTIgLSBwcmVDYWxjRHggfTtcclxuICB9XHJcbiAgaWYgKHgxIDw9IHgyKSB7XHJcbiAgICBleHRDb3JuZXIxID0geyB4OiBjb3JuZXIxLnggLSBwcmVDYWxjRHksIHk6IGNvcm5lcjEueSAtIHByZUNhbGNEeCB9O1xyXG4gICAgZXh0Q29ybmVyMiA9IHsgeDogY29ybmVyMi54IC0gcHJlQ2FsY0R5LCB5OiBjb3JuZXIyLnkgLSBwcmVDYWxjRHggfTtcclxuICAgIGV4dENvcm5lcjMgPSB7IHg6IGNvcm5lcjMueCArIHByZUNhbGNEeSwgeTogY29ybmVyMy55ICsgcHJlQ2FsY0R4IH07XHJcbiAgICBleHRDb3JuZXI0ID0geyB4OiBjb3JuZXI0LnggKyBwcmVDYWxjRHksIHk6IGNvcm5lcjQueSArIHByZUNhbGNEeCB9O1xyXG4gIH1cclxuXHJcbiAgY3R4Lm1vdmVUbyhjb3JuZXIyLngsIGNvcm5lcjIueSk7XHJcbiAgY3R4LmxpbmVUbyhjb3JuZXIzLngsIGNvcm5lcjMueSk7XHJcbiAgY3R4LmFyY1RvKGV4dENvcm5lcjMueCwgZXh0Q29ybmVyMy55LCBhcGV4Mi54LCBhcGV4Mi55LCByYWRpdXMpO1xyXG4gIGN0eC5hcmNUbyhleHRDb3JuZXI0LngsIGV4dENvcm5lcjQueSwgY29ybmVyNC54LCBjb3JuZXI0LnksIHJhZGl1cyk7XHJcbiAgY3R4LmxpbmVUbyhjb3JuZXIxLngsIGNvcm5lcjEueSk7XHJcbiAgY3R4LmFyY1RvKGV4dENvcm5lcjEueCwgZXh0Q29ybmVyMS55LCBhcGV4MS54LCBhcGV4MS55LCByYWRpdXMpO1xyXG4gIGN0eC5hcmNUbyhleHRDb3JuZXIyLngsIGV4dENvcm5lcjIueSwgY29ybmVyMi54LCBjb3JuZXIyLnksIHJhZGl1cyk7XHJcblxyXG4vKmRlYnVnZ2luZyBzdHVmZiwgbGVhdmUgY29tbWVudGVkIG91dCovXHJcbi8qXHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5saW5lV2lkdGggPSAyO1xyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICcjMDAwMGZmJztcclxuICBjdHgubW92ZVRvKHgxLCB5MSk7XHJcbiAgY3R4LmxpbmVUbyh4MiwgeTIpO1xyXG4gIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5saW5lV2lkdGggPSAxO1xyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICcjZmYwMGZmJztcclxuICBjdHgubW92ZVRvKGFwZXgxLngsIGFwZXgxLnkpO1xyXG4gIGN0eC5saW5lVG8oYXBleDIueCwgYXBleDIueSk7XHJcbiAgY3R4LnN0cm9rZSgpO1xyXG5cclxuICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgY3R4LmxpbmVXaWR0aCA9IDE7XHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gJyNmZjAwMDAnO1xyXG4gIGN0eC5tb3ZlVG8oY29ybmVyMS54LCBjb3JuZXIxLnkpO1xyXG4gIGN0eC5saW5lVG8oY29ybmVyMi54LCBjb3JuZXIyLnkpO1xyXG4gIGN0eC5saW5lVG8oY29ybmVyMy54LCBjb3JuZXIzLnkpO1xyXG4gIGN0eC5saW5lVG8oY29ybmVyNC54LCBjb3JuZXI0LnkpO1xyXG4gIGN0eC5saW5lVG8oY29ybmVyMS54LCBjb3JuZXIxLnkpO1xyXG4gIGN0eC5zdHJva2UoKTtcclxuXHJcbiAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gIGN0eC5saW5lV2lkdGggPSAyO1xyXG4gIGN0eC5zdHJva2VTdHlsZSA9ICcjMDBmZjAwJztcclxuICBjdHgubW92ZVRvKGV4dENvcm5lcjEueCwgZXh0Q29ybmVyMS55KTtcclxuICBjdHgubGluZVRvKGV4dENvcm5lcjIueCwgZXh0Q29ybmVyMi55KTtcclxuICBjdHgubGluZVRvKGV4dENvcm5lcjMueCwgZXh0Q29ybmVyMy55KTtcclxuICBjdHgubGluZVRvKGV4dENvcm5lcjQueCwgZXh0Q29ybmVyNC55KTtcclxuICBjdHgubGluZVRvKGV4dENvcm5lcjEueCwgZXh0Q29ybmVyMS55KTtcclxuICBjdHguc3Ryb2tlKCk7XHJcbiAgKi9cclxuICAvKmVuZCBvZiBkZWJ1Z2dpbmcgc3R1ZmYqL1xyXG59XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tZXhwb3J0c1xyXG5leHBvcnRzLnJhbmRvbUNvbG9ycyA9IHJhbmRvbUNvbG9ycztcclxuZXhwb3J0cy5kcmF3TG96ZW5nZSA9IGRyYXdMb3plbmdlO1xyXG4iXX0=
