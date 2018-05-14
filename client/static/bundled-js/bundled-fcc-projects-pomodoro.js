(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
//portfolio
//fcc-projects-pomodoro


var mh_fcc_pomodoro = require('./utils/fcc-pomodoro-utils');

toggleCountdown = function() {
  mh_fcc_pomodoro.toggleCountdown();
}

changeTime = function(brkOrSess, inOrDec) {
  mh_fcc_pomodoro.changeTime(brkOrSess, inOrDec);
}

},{"./utils/fcc-pomodoro-utils":2}],2:[function(require,module,exports){
var pomodoroData = {
  modes: [
    {mode: 'SESSION', duration: 2, color: '#34495e'},
    {mode: 'BREAK', duration: 2, color: '#16a085'}
  ],
  currentMode: 0,
  isPaused: false,
  remainingSeconds: 120,

  //isPaused getters & setters
  toggleIsPaused: function() {this.isPaused = !this.isPaused;},

  //mode getters & setters
  setMode: function() {
    this.currentMode++;
    if(this.currentMode > this.modes.length - 1) {
      this.currentMode = 0;
    }
    document.getElementById('msg').innerHTML = this.modes[this.currentMode].mode;
  },

  checkMode: function() {
    if(this.remainingSeconds < 1) {
      playSound();
      this.setMode();
      this.remainingSeconds = this.modes[this.currentMode].duration * 60;
    }
  },

  //remaining time getters & setters
  setRemainingSeconds: function(s) {this.remainingSeconds += s;},

  getMinutes: function() {return Math.floor(this.remainingSeconds / 60);},

  getSeconds: function() {return this.remainingSeconds % 60;},

  //break getters & setters
  setSession: function(m) {
    if (this.modes[0].duration + m > 0) {
      this.modes[0].duration += m;
    }
  },

  //session getters & setters
  setBreak: function(m) {
    if (this.modes[1].duration + m > 0) {
      this.modes[1].duration += m;
    }
  }

}//end obj lit pomodoroData

function toggleCountdown() {
  pomodoroData.toggleIsPaused();
  document.getElementById('minsLeft').innerHTML ='';
  document.getElementById('minsLeft').classList.add('minsLeftPosSize');
  document.getElementById('minsLeft').classList.remove('minsLeftPosSizeInitial');
  if (pomodoroData.isPaused === true) {countdown();}
}

//RECURSIVE FUNCTION
function countdown() {
  if (pomodoroData.isPaused === false) {
    return;
  }

  setTimeout(decTime, 1000);

  function decTime() {
    var mins = 'mm';
    var secs = 'ss';
    var shouldPulseTime = false;

    pomodoroData.setRemainingSeconds(-1);
    pomodoroData.checkMode();

    secs = pomodoroData.getSeconds();
    mins = pomodoroData.getMinutes();

    if (mins < 1) {pulseTime(secs);}
    if (mins<10) {mins = '0' + mins;}
    if (secs<10) {secs = '0' + secs;}

    animateTimer();
    document.getElementById('minsLeft').innerHTML = mins;
    document.getElementById('secsLeft').innerHTML = '.' + secs;
    countdown();
  }
}

function changeTime(brkOrSess, inOrDec) {
  if (brkOrSess === 'brk') {
    pomodoroData.setBreak(inOrDec);
    document.getElementById('breakTime').innerHTML = pomodoroData.modes[1].duration;
  }
  if (brkOrSess === 'sess') {
    pomodoroData.setSession(inOrDec);
    document.getElementById('sessionTime').innerHTML = pomodoroData.modes[0].duration;
  }
}

function animateTimer() {
  var canvas = document.getElementById('fillAnimation');
  var ctx = canvas.getContext('2d');
  var grd = ctx.createLinearGradient(60, 60, 200, 200);
  grd.addColorStop(0, pomodoroData.modes[0].color);
  grd.addColorStop(1, pomodoroData.modes[1].color);
  var percentSize = pomodoroData.remainingSeconds / (pomodoroData.modes[pomodoroData.currentMode].duration * 60);
  //because circle radius is 93px***careful of changing this mark you tit!
  var pxToChopOff = 200 * percentSize;
  var pxToChopOffRev = 200 - pxToChopOff;

  if (ctx != null) {
      ctx.beginPath();
      //x, y, radius, startAngle, endAngle, anticlockwise
      ctx.arc(100, 100, 100, 0, 2*Math.PI, false);
      ctx.fillStyle=grd;
      ctx.fill();
      ctx.globalCompositeOperation = 'destination-out';
      if(pomodoroData.currentMode === 0) {
         ctx.fillRect(0, 0, 200, pxToChopOffRev);
      }
      if(pomodoroData.currentMode === 1) {
         ctx.fillRect(0, 0, 200, pxToChopOff);
      }
      ctx.globalCompositeOperation = "source-over";

  } else {
    console.log('piss knows why but ctx is null instead of an element');
  }
}

function playSound() {
  var wav = 'http://www.freesfx.co.uk/rx2/mp3s/6/18625_1464805220.mp3';
  var audio = new Audio(wav);
  audio.play();
}

function pulseTime(s) {
  if (s % 10 === 0) {
    document.getElementById('minsLeft').classList.add('minsLeftPulse');
    document.getElementById('minsLeft').classList.remove('minsLeftNoPulse');
    setTimeout(pulseOff, 400);
  }

  if (s < 10) {
    document.getElementById('minsLeft').classList.add('minsLeftPulse');
    document.getElementById('minsLeft').classList.remove('minsLeftNoPulse');
    setTimeout(pulseOff, 400);
  }

  function pulseOff() {
    document.getElementById('minsLeft').classList.add('minsLeftNoPulse');
    document.getElementById('minsLeft').classList.remove('minsLeftPulse');
  }
}

module.exports = {
  toggleCountdown: toggleCountdown,
  changeTime: changeTime
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9mY2MtcHJvamVjdHMtcG9tb2Rvcm8uanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy91dGlscy9mY2MtcG9tb2Rvcm8tdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8vcG9ydGZvbGlvXHJcbi8vZmNjLXByb2plY3RzLXBvbW9kb3JvXHJcblxyXG5cclxudmFyIG1oX2ZjY19wb21vZG9ybyA9IHJlcXVpcmUoJy4vdXRpbHMvZmNjLXBvbW9kb3JvLXV0aWxzJyk7XHJcblxyXG50b2dnbGVDb3VudGRvd24gPSBmdW5jdGlvbigpIHtcclxuICBtaF9mY2NfcG9tb2Rvcm8udG9nZ2xlQ291bnRkb3duKCk7XHJcbn1cclxuXHJcbmNoYW5nZVRpbWUgPSBmdW5jdGlvbihicmtPclNlc3MsIGluT3JEZWMpIHtcclxuICBtaF9mY2NfcG9tb2Rvcm8uY2hhbmdlVGltZShicmtPclNlc3MsIGluT3JEZWMpO1xyXG59XHJcbiIsInZhciBwb21vZG9yb0RhdGEgPSB7XHJcbiAgbW9kZXM6IFtcclxuICAgIHttb2RlOiAnU0VTU0lPTicsIGR1cmF0aW9uOiAyLCBjb2xvcjogJyMzNDQ5NWUnfSxcclxuICAgIHttb2RlOiAnQlJFQUsnLCBkdXJhdGlvbjogMiwgY29sb3I6ICcjMTZhMDg1J31cclxuICBdLFxyXG4gIGN1cnJlbnRNb2RlOiAwLFxyXG4gIGlzUGF1c2VkOiBmYWxzZSxcclxuICByZW1haW5pbmdTZWNvbmRzOiAxMjAsXHJcblxyXG4gIC8vaXNQYXVzZWQgZ2V0dGVycyAmIHNldHRlcnNcclxuICB0b2dnbGVJc1BhdXNlZDogZnVuY3Rpb24oKSB7dGhpcy5pc1BhdXNlZCA9ICF0aGlzLmlzUGF1c2VkO30sXHJcblxyXG4gIC8vbW9kZSBnZXR0ZXJzICYgc2V0dGVyc1xyXG4gIHNldE1vZGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5jdXJyZW50TW9kZSsrO1xyXG4gICAgaWYodGhpcy5jdXJyZW50TW9kZSA+IHRoaXMubW9kZXMubGVuZ3RoIC0gMSkge1xyXG4gICAgICB0aGlzLmN1cnJlbnRNb2RlID0gMDtcclxuICAgIH1cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtc2cnKS5pbm5lckhUTUwgPSB0aGlzLm1vZGVzW3RoaXMuY3VycmVudE1vZGVdLm1vZGU7XHJcbiAgfSxcclxuXHJcbiAgY2hlY2tNb2RlOiBmdW5jdGlvbigpIHtcclxuICAgIGlmKHRoaXMucmVtYWluaW5nU2Vjb25kcyA8IDEpIHtcclxuICAgICAgcGxheVNvdW5kKCk7XHJcbiAgICAgIHRoaXMuc2V0TW9kZSgpO1xyXG4gICAgICB0aGlzLnJlbWFpbmluZ1NlY29uZHMgPSB0aGlzLm1vZGVzW3RoaXMuY3VycmVudE1vZGVdLmR1cmF0aW9uICogNjA7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLy9yZW1haW5pbmcgdGltZSBnZXR0ZXJzICYgc2V0dGVyc1xyXG4gIHNldFJlbWFpbmluZ1NlY29uZHM6IGZ1bmN0aW9uKHMpIHt0aGlzLnJlbWFpbmluZ1NlY29uZHMgKz0gczt9LFxyXG5cclxuICBnZXRNaW51dGVzOiBmdW5jdGlvbigpIHtyZXR1cm4gTWF0aC5mbG9vcih0aGlzLnJlbWFpbmluZ1NlY29uZHMgLyA2MCk7fSxcclxuXHJcbiAgZ2V0U2Vjb25kczogZnVuY3Rpb24oKSB7cmV0dXJuIHRoaXMucmVtYWluaW5nU2Vjb25kcyAlIDYwO30sXHJcblxyXG4gIC8vYnJlYWsgZ2V0dGVycyAmIHNldHRlcnNcclxuICBzZXRTZXNzaW9uOiBmdW5jdGlvbihtKSB7XHJcbiAgICBpZiAodGhpcy5tb2Rlc1swXS5kdXJhdGlvbiArIG0gPiAwKSB7XHJcbiAgICAgIHRoaXMubW9kZXNbMF0uZHVyYXRpb24gKz0gbTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvL3Nlc3Npb24gZ2V0dGVycyAmIHNldHRlcnNcclxuICBzZXRCcmVhazogZnVuY3Rpb24obSkge1xyXG4gICAgaWYgKHRoaXMubW9kZXNbMV0uZHVyYXRpb24gKyBtID4gMCkge1xyXG4gICAgICB0aGlzLm1vZGVzWzFdLmR1cmF0aW9uICs9IG07XHJcbiAgICB9XHJcbiAgfVxyXG5cclxufS8vZW5kIG9iaiBsaXQgcG9tb2Rvcm9EYXRhXHJcblxyXG5mdW5jdGlvbiB0b2dnbGVDb3VudGRvd24oKSB7XHJcbiAgcG9tb2Rvcm9EYXRhLnRvZ2dsZUlzUGF1c2VkKCk7XHJcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pbnNMZWZ0JykuaW5uZXJIVE1MID0nJztcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWluc0xlZnQnKS5jbGFzc0xpc3QuYWRkKCdtaW5zTGVmdFBvc1NpemUnKTtcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWluc0xlZnQnKS5jbGFzc0xpc3QucmVtb3ZlKCdtaW5zTGVmdFBvc1NpemVJbml0aWFsJyk7XHJcbiAgaWYgKHBvbW9kb3JvRGF0YS5pc1BhdXNlZCA9PT0gdHJ1ZSkge2NvdW50ZG93bigpO31cclxufVxyXG5cclxuLy9SRUNVUlNJVkUgRlVOQ1RJT05cclxuZnVuY3Rpb24gY291bnRkb3duKCkge1xyXG4gIGlmIChwb21vZG9yb0RhdGEuaXNQYXVzZWQgPT09IGZhbHNlKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBzZXRUaW1lb3V0KGRlY1RpbWUsIDEwMDApO1xyXG5cclxuICBmdW5jdGlvbiBkZWNUaW1lKCkge1xyXG4gICAgdmFyIG1pbnMgPSAnbW0nO1xyXG4gICAgdmFyIHNlY3MgPSAnc3MnO1xyXG4gICAgdmFyIHNob3VsZFB1bHNlVGltZSA9IGZhbHNlO1xyXG5cclxuICAgIHBvbW9kb3JvRGF0YS5zZXRSZW1haW5pbmdTZWNvbmRzKC0xKTtcclxuICAgIHBvbW9kb3JvRGF0YS5jaGVja01vZGUoKTtcclxuXHJcbiAgICBzZWNzID0gcG9tb2Rvcm9EYXRhLmdldFNlY29uZHMoKTtcclxuICAgIG1pbnMgPSBwb21vZG9yb0RhdGEuZ2V0TWludXRlcygpO1xyXG5cclxuICAgIGlmIChtaW5zIDwgMSkge3B1bHNlVGltZShzZWNzKTt9XHJcbiAgICBpZiAobWluczwxMCkge21pbnMgPSAnMCcgKyBtaW5zO31cclxuICAgIGlmIChzZWNzPDEwKSB7c2VjcyA9ICcwJyArIHNlY3M7fVxyXG5cclxuICAgIGFuaW1hdGVUaW1lcigpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pbnNMZWZ0JykuaW5uZXJIVE1MID0gbWlucztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWNzTGVmdCcpLmlubmVySFRNTCA9ICcuJyArIHNlY3M7XHJcbiAgICBjb3VudGRvd24oKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGNoYW5nZVRpbWUoYnJrT3JTZXNzLCBpbk9yRGVjKSB7XHJcbiAgaWYgKGJya09yU2VzcyA9PT0gJ2JyaycpIHtcclxuICAgIHBvbW9kb3JvRGF0YS5zZXRCcmVhayhpbk9yRGVjKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdicmVha1RpbWUnKS5pbm5lckhUTUwgPSBwb21vZG9yb0RhdGEubW9kZXNbMV0uZHVyYXRpb247XHJcbiAgfVxyXG4gIGlmIChicmtPclNlc3MgPT09ICdzZXNzJykge1xyXG4gICAgcG9tb2Rvcm9EYXRhLnNldFNlc3Npb24oaW5PckRlYyk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2Vzc2lvblRpbWUnKS5pbm5lckhUTUwgPSBwb21vZG9yb0RhdGEubW9kZXNbMF0uZHVyYXRpb247XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhbmltYXRlVGltZXIoKSB7XHJcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmaWxsQW5pbWF0aW9uJyk7XHJcbiAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gIHZhciBncmQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoNjAsIDYwLCAyMDAsIDIwMCk7XHJcbiAgZ3JkLmFkZENvbG9yU3RvcCgwLCBwb21vZG9yb0RhdGEubW9kZXNbMF0uY29sb3IpO1xyXG4gIGdyZC5hZGRDb2xvclN0b3AoMSwgcG9tb2Rvcm9EYXRhLm1vZGVzWzFdLmNvbG9yKTtcclxuICB2YXIgcGVyY2VudFNpemUgPSBwb21vZG9yb0RhdGEucmVtYWluaW5nU2Vjb25kcyAvIChwb21vZG9yb0RhdGEubW9kZXNbcG9tb2Rvcm9EYXRhLmN1cnJlbnRNb2RlXS5kdXJhdGlvbiAqIDYwKTtcclxuICAvL2JlY2F1c2UgY2lyY2xlIHJhZGl1cyBpcyA5M3B4KioqY2FyZWZ1bCBvZiBjaGFuZ2luZyB0aGlzIG1hcmsgeW91IHRpdCFcclxuICB2YXIgcHhUb0Nob3BPZmYgPSAyMDAgKiBwZXJjZW50U2l6ZTtcclxuICB2YXIgcHhUb0Nob3BPZmZSZXYgPSAyMDAgLSBweFRvQ2hvcE9mZjtcclxuXHJcbiAgaWYgKGN0eCAhPSBudWxsKSB7XHJcbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgLy94LCB5LCByYWRpdXMsIHN0YXJ0QW5nbGUsIGVuZEFuZ2xlLCBhbnRpY2xvY2t3aXNlXHJcbiAgICAgIGN0eC5hcmMoMTAwLCAxMDAsIDEwMCwgMCwgMipNYXRoLlBJLCBmYWxzZSk7XHJcbiAgICAgIGN0eC5maWxsU3R5bGU9Z3JkO1xyXG4gICAgICBjdHguZmlsbCgpO1xyXG4gICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLW91dCc7XHJcbiAgICAgIGlmKHBvbW9kb3JvRGF0YS5jdXJyZW50TW9kZSA9PT0gMCkge1xyXG4gICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgMjAwLCBweFRvQ2hvcE9mZlJldik7XHJcbiAgICAgIH1cclxuICAgICAgaWYocG9tb2Rvcm9EYXRhLmN1cnJlbnRNb2RlID09PSAxKSB7XHJcbiAgICAgICAgIGN0eC5maWxsUmVjdCgwLCAwLCAyMDAsIHB4VG9DaG9wT2ZmKTtcclxuICAgICAgfVxyXG4gICAgICBjdHguZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gXCJzb3VyY2Utb3ZlclwiO1xyXG5cclxuICB9IGVsc2Uge1xyXG4gICAgY29uc29sZS5sb2coJ3Bpc3Mga25vd3Mgd2h5IGJ1dCBjdHggaXMgbnVsbCBpbnN0ZWFkIG9mIGFuIGVsZW1lbnQnKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBsYXlTb3VuZCgpIHtcclxuICB2YXIgd2F2ID0gJ2h0dHA6Ly93d3cuZnJlZXNmeC5jby51ay9yeDIvbXAzcy82LzE4NjI1XzE0NjQ4MDUyMjAubXAzJztcclxuICB2YXIgYXVkaW8gPSBuZXcgQXVkaW8od2F2KTtcclxuICBhdWRpby5wbGF5KCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHB1bHNlVGltZShzKSB7XHJcbiAgaWYgKHMgJSAxMCA9PT0gMCkge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pbnNMZWZ0JykuY2xhc3NMaXN0LmFkZCgnbWluc0xlZnRQdWxzZScpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pbnNMZWZ0JykuY2xhc3NMaXN0LnJlbW92ZSgnbWluc0xlZnROb1B1bHNlJyk7XHJcbiAgICBzZXRUaW1lb3V0KHB1bHNlT2ZmLCA0MDApO1xyXG4gIH1cclxuXHJcbiAgaWYgKHMgPCAxMCkge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pbnNMZWZ0JykuY2xhc3NMaXN0LmFkZCgnbWluc0xlZnRQdWxzZScpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pbnNMZWZ0JykuY2xhc3NMaXN0LnJlbW92ZSgnbWluc0xlZnROb1B1bHNlJyk7XHJcbiAgICBzZXRUaW1lb3V0KHB1bHNlT2ZmLCA0MDApO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcHVsc2VPZmYoKSB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWluc0xlZnQnKS5jbGFzc0xpc3QuYWRkKCdtaW5zTGVmdE5vUHVsc2UnKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaW5zTGVmdCcpLmNsYXNzTGlzdC5yZW1vdmUoJ21pbnNMZWZ0UHVsc2UnKTtcclxuICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIHRvZ2dsZUNvdW50ZG93bjogdG9nZ2xlQ291bnRkb3duLFxyXG4gIGNoYW5nZVRpbWU6IGNoYW5nZVRpbWVcclxufVxyXG4iXX0=
