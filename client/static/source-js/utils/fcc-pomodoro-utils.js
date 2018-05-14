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
