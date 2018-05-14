(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// portfolio
// fcc-projects-calculator.js

// File description:
//

var mh_fcc_calculator = require('./utils/fcc-calculator-utils');

buttClear = function(id) {
  mh_fcc_calculator.buttClear(id);
}

buttVal = function(id) {
  mh_fcc_calculator.buttVal(id);
}

buttEq = function() {
  mh_fcc_calculator.buttEq();
}

},{"./utils/fcc-calculator-utils":2}],2:[function(require,module,exports){
// portfolio
// fcc-calculator-utils.js

// File description:
//

//DATA
var calculation = [];

//FUNCTION
function updateScreen() {
  console.log('updateScreen()');//dev
  var c = '';
  var h = '';

  if (calculation.length > 0) {
    c = calculation[calculation.length - 1];
    calculation.forEach(function(element) {
        h += element;
    });
  } else {
      c = '0';
      h = ' ';
  }

  document.getElementById('calculation').innerHTML = c;
  document.getElementById('calcHistory').innerHTML = h;
}

//FUNCTION
function buttClear(id) {
  console.log('buttClear(): ' + id);//dev

  if (id === 'AC') {calculation = [];}
  if (id === 'CE') {calculation.pop();}

  updateScreen();
}

//FUNCTION
function buttVal(id) {
  console.log('buttVal(): ' + id);//dev

  calculation.push(document.getElementById(id).innerHTML);

  updateScreen();
}

//FUNCTION
function buttEq() {
  console.log('buttEq()');//dev
  console.log(calculation);
  var result = '';
  //var regex = /^\d+(\.\d*)?([-+\/\*]\d+)*[^-+\/\*]/;
  var regex = /^\d*(\.\d*)?([-+/*]\d+)*$/;

  calculation.forEach(function(element, index) {
    parseInt(element);
    if (element === 'x') {element = '*';}
    result += element;
  });

  if (regex.test(result)) {
    result = eval(result);
  } else {
    console.log('invalid: ' + result);
    result = 'invalid equation';
  }

  calculation = [result];
  document.getElementById('calculation').innerHTML = result;
}


module.exports = {
  buttClear,
  buttVal,
  buttEq
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9mY2MtcHJvamVjdHMtY2FsY3VsYXRvci5qcyIsImNsaWVudC9zdGF0aWMvc291cmNlLWpzL3V0aWxzL2ZjYy1jYWxjdWxhdG9yLXV0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vIHBvcnRmb2xpb1xyXG4vLyBmY2MtcHJvamVjdHMtY2FsY3VsYXRvci5qc1xyXG5cclxuLy8gRmlsZSBkZXNjcmlwdGlvbjpcclxuLy9cclxuXHJcbnZhciBtaF9mY2NfY2FsY3VsYXRvciA9IHJlcXVpcmUoJy4vdXRpbHMvZmNjLWNhbGN1bGF0b3ItdXRpbHMnKTtcclxuXHJcbmJ1dHRDbGVhciA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgbWhfZmNjX2NhbGN1bGF0b3IuYnV0dENsZWFyKGlkKTtcclxufVxyXG5cclxuYnV0dFZhbCA9IGZ1bmN0aW9uKGlkKSB7XHJcbiAgbWhfZmNjX2NhbGN1bGF0b3IuYnV0dFZhbChpZCk7XHJcbn1cclxuXHJcbmJ1dHRFcSA9IGZ1bmN0aW9uKCkge1xyXG4gIG1oX2ZjY19jYWxjdWxhdG9yLmJ1dHRFcSgpO1xyXG59XHJcbiIsIi8vIHBvcnRmb2xpb1xyXG4vLyBmY2MtY2FsY3VsYXRvci11dGlscy5qc1xyXG5cclxuLy8gRmlsZSBkZXNjcmlwdGlvbjpcclxuLy9cclxuXHJcbi8vREFUQVxyXG52YXIgY2FsY3VsYXRpb24gPSBbXTtcclxuXHJcbi8vRlVOQ1RJT05cclxuZnVuY3Rpb24gdXBkYXRlU2NyZWVuKCkge1xyXG4gIGNvbnNvbGUubG9nKCd1cGRhdGVTY3JlZW4oKScpOy8vZGV2XHJcbiAgdmFyIGMgPSAnJztcclxuICB2YXIgaCA9ICcnO1xyXG5cclxuICBpZiAoY2FsY3VsYXRpb24ubGVuZ3RoID4gMCkge1xyXG4gICAgYyA9IGNhbGN1bGF0aW9uW2NhbGN1bGF0aW9uLmxlbmd0aCAtIDFdO1xyXG4gICAgY2FsY3VsYXRpb24uZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgaCArPSBlbGVtZW50O1xyXG4gICAgfSk7XHJcbiAgfSBlbHNlIHtcclxuICAgICAgYyA9ICcwJztcclxuICAgICAgaCA9ICcgJztcclxuICB9XHJcblxyXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjYWxjdWxhdGlvbicpLmlubmVySFRNTCA9IGM7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbGNIaXN0b3J5JykuaW5uZXJIVE1MID0gaDtcclxufVxyXG5cclxuLy9GVU5DVElPTlxyXG5mdW5jdGlvbiBidXR0Q2xlYXIoaWQpIHtcclxuICBjb25zb2xlLmxvZygnYnV0dENsZWFyKCk6ICcgKyBpZCk7Ly9kZXZcclxuXHJcbiAgaWYgKGlkID09PSAnQUMnKSB7Y2FsY3VsYXRpb24gPSBbXTt9XHJcbiAgaWYgKGlkID09PSAnQ0UnKSB7Y2FsY3VsYXRpb24ucG9wKCk7fVxyXG5cclxuICB1cGRhdGVTY3JlZW4oKTtcclxufVxyXG5cclxuLy9GVU5DVElPTlxyXG5mdW5jdGlvbiBidXR0VmFsKGlkKSB7XHJcbiAgY29uc29sZS5sb2coJ2J1dHRWYWwoKTogJyArIGlkKTsvL2RldlxyXG5cclxuICBjYWxjdWxhdGlvbi5wdXNoKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKS5pbm5lckhUTUwpO1xyXG5cclxuICB1cGRhdGVTY3JlZW4oKTtcclxufVxyXG5cclxuLy9GVU5DVElPTlxyXG5mdW5jdGlvbiBidXR0RXEoKSB7XHJcbiAgY29uc29sZS5sb2coJ2J1dHRFcSgpJyk7Ly9kZXZcclxuICBjb25zb2xlLmxvZyhjYWxjdWxhdGlvbik7XHJcbiAgdmFyIHJlc3VsdCA9ICcnO1xyXG4gIC8vdmFyIHJlZ2V4ID0gL15cXGQrKFxcLlxcZCopPyhbLStcXC9cXCpdXFxkKykqW14tK1xcL1xcKl0vO1xyXG4gIHZhciByZWdleCA9IC9eXFxkKihcXC5cXGQqKT8oWy0rLypdXFxkKykqJC87XHJcblxyXG4gIGNhbGN1bGF0aW9uLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaW5kZXgpIHtcclxuICAgIHBhcnNlSW50KGVsZW1lbnQpO1xyXG4gICAgaWYgKGVsZW1lbnQgPT09ICd4Jykge2VsZW1lbnQgPSAnKic7fVxyXG4gICAgcmVzdWx0ICs9IGVsZW1lbnQ7XHJcbiAgfSk7XHJcblxyXG4gIGlmIChyZWdleC50ZXN0KHJlc3VsdCkpIHtcclxuICAgIHJlc3VsdCA9IGV2YWwocmVzdWx0KTtcclxuICB9IGVsc2Uge1xyXG4gICAgY29uc29sZS5sb2coJ2ludmFsaWQ6ICcgKyByZXN1bHQpO1xyXG4gICAgcmVzdWx0ID0gJ2ludmFsaWQgZXF1YXRpb24nO1xyXG4gIH1cclxuXHJcbiAgY2FsY3VsYXRpb24gPSBbcmVzdWx0XTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FsY3VsYXRpb24nKS5pbm5lckhUTUwgPSByZXN1bHQ7XHJcbn1cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBidXR0Q2xlYXIsXHJcbiAgYnV0dFZhbCxcclxuICBidXR0RXFcclxufVxyXG4iXX0=
