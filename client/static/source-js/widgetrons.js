// portfolio
// widgetrons.js

// File description:
// Script file linked to widgetrons.pug

const bouncingColoredDots = require('./utils/animation-bouncing-colored-dots');
const mechanicalLetters = require('./utils/animation-mechanical-letters');
const lozengeTester = require('./utils/animation-lozenge-tester');
const lozengeSpirrograph = require('./utils/animation-lozenge-spirrograph');
//const mechanicalLetters2 = require('./utils/animation-mechanical-letters-2');

let selectedAnimationsIndex = 0;
let animations = [
  {
    text: 'Bouncing Colored Dots',
    module: bouncingColoredDots,
    parentElementId: 'bouncingColoredDots',
    pauseButt: 'BCDTogglePause',
    reRunButt: 'BCDReRun',
    nCirclesInput: 'BCDInputNCircles',
    radiusInput: 'BCDInputRadius',
    areaOfEffectInput: 'BCDInputAoE',
    opts: {
      canvas: 'BCDCanvas',
      nCircles: 200,
      radius: 2,
      areaOfEffect: 80
    }
  },
  {
    text: 'Mechancial Letters',
    module: mechanicalLetters,
    parentElementId: 'mechanicalLetters',
    pauseButt: 'MLTogglePause',
    reRunButt: 'MLReRun',
    opts: {
      canvas: 'MLCanvas',
      str: 'hhhh'
    }
  },
  {
    text: 'Lozenge Tester',
    module: lozengeTester,
    parentElementId: 'lozengeTester',
    x1Slider: 'LTx1',
    y1Slider: 'LTy1',
    x2Slider: 'LTx2',
    y2Slider: 'LTy2',
    opts: {
      canvas: 'LTCanvas',
      x1: 200,
      y1: 200,
      x2: 250,
      y2: 250
    }
  },
  {
    text: 'Lozenge Spirrograph',
    module: lozengeSpirrograph,
    parentElementId: 'lozengeSpirrograph',
    reverseDXButt: 'LSReverseDXButt',
    reverseDYButt: 'LSReverseDYButt',
    switchXYButt: 'LSSwitchXYButt',
    opts: {
      canvas: 'LSCanvas'
    }
  }
];

//initialise after DOM loaded
document.addEventListener('DOMContentLoaded', function(event) {
  initAnimationPicker();
  bouncingColoredDots.init(animations[0]['opts']);
  addBCDEventListenerPause();
  addBCDEventListenerReRun();
  mechanicalLetters.init(animations[1]['opts']);
  addMLEventListenerPause();
  addMLEventListenerReRun();
  lozengeTester.init(animations[2]['opts']);
  addLTEventListenerX1Slider();
  addLTEventListenerY1Slider();
  addLTEventListenerX2Slider();
  addLTEventListenerY2Slider();
  lozengeSpirrograph.init(animations[3]['opts']);
  lozengeSpirrograph.animate();
  addLSEventListenerReverseDX();
  addLSEventListenerReverseDY();
  addLSEventListenerSwitchXY();
  startSelectedAnimation();
});

//-----------------------------------------------------animation picker controls
function initAnimationPicker() {
  document.getElementById('selectedAnimation').innerHTML = animations[selectedAnimationsIndex].text;
  document.getElementById('prevAnimation').addEventListener('click', selectAnimation('dec'));
  document.getElementById('nextAnimation').addEventListener('click', selectAnimation('inc'));
}

function selectAnimation(incOrDec) {
  return function() {
    if (incOrDec === 'dec') {selectedAnimationsIndex--;}
    if (incOrDec === 'inc') {selectedAnimationsIndex++;}
    if (selectedAnimationsIndex === -1) {selectedAnimationsIndex = animations.length - 1;}
    if (selectedAnimationsIndex === animations.length) { selectedAnimationsIndex = 0;}
    document.getElementById('selectedAnimation').innerHTML = animations[selectedAnimationsIndex].text;
    cancelAllAnimations();
    startSelectedAnimation();
  }
}

//-------------------------------------------generic & common animation controls
function cancelAllAnimations() {
  for (let i = 0; i < animations.length; i++) {
    if( animations[i].hasOwnProperty('pauseButt') ) {
      animations[i]['module'].cancelAnimation();
    }
    document.getElementById(animations[i]['parentElementId']).style.display = 'none';
  }
}

function startSelectedAnimation() {
  document.getElementById(animations[selectedAnimationsIndex]['parentElementId']).style.display = 'flex';
  if ( animations[selectedAnimationsIndex].hasOwnProperty('pauseButt') ) {
      animations[selectedAnimationsIndex]['module'].animate();
      stylePauseButt(animations[selectedAnimationsIndex]['pauseButt'], false);
  }
}

function stylePauseButt(pauseButt, isPaused) {
  if (isPaused === true) {
    document.getElementById(pauseButt).classList.remove('animationControlUnpaused');
    document.getElementById(pauseButt).classList.add('animationControlPaused');
  }
  if (isPaused === false) {
    document.getElementById(pauseButt).classList.remove('animationControlPaused');
    document.getElementById(pauseButt).classList.add('animationControlUnpaused');
  }
}

//-------------------------------------------------individual animation controls
//bouncing colored dots
function addBCDEventListenerPause() {
  document.getElementById(animations[0]['pauseButt']).addEventListener('click', function(event) {
    let isPaused = bouncingColoredDots.toggleRunAnimation();
    stylePauseButt(animations[0]['pauseButt'], isPaused);
  });
}

function addBCDEventListenerReRun() {
  document.getElementById(animations[0]['reRunButt']).addEventListener('click', function(event) {
    animations[0]['opts'].nCircles = parseInt(document.getElementById(animations[0]['nCirclesInput']).value);
    animations[0]['opts'].radius = parseInt(document.getElementById(animations[0]['radiusInput']).value);
    animations[0]['opts'].areaOfEffect = parseInt(document.getElementById(animations[0]['areaOfEffectInput']).value);
    bouncingColoredDots.init(animations[0]['opts']);
    bouncingColoredDots.animate();
    stylePauseButt(animations[0]['pauseButt'], false);
  });
}

//mechanical letters
function addMLEventListenerPause() {
  document.getElementById(animations[1]['pauseButt']).addEventListener('click', function(event) {
    let isPaused = mechanicalLetters.toggleRunAnimation();
    stylePauseButt(animations[1]['pauseButt'], isPaused);
  });
}

function addMLEventListenerReRun() {
  document.getElementById(animations[1]['reRunButt']).addEventListener('click', function(event) {
    mechanicalLetters.init(animations[1]['opts']);
    mechanicalLetters.animate();
    stylePauseButt(animations[1]['pauseButt'], false);
  });
}

//lozenge tester
function addLTEventListenerX1Slider() {
  let x1SliderElement = document.getElementById(animations[2]['x1Slider']);
  x1SliderElement.addEventListener('input', function(event) {
    animations[2]['opts'].x1 = parseInt(x1SliderElement.value);
    lozengeTester.init(animations[2]['opts']);
  });
}

function addLTEventListenerY1Slider() {
  let y1SliderElement = document.getElementById(animations[2]['y1Slider']);
  y1SliderElement.addEventListener('input', function(event) {
    animations[2]['opts'].y1 = parseInt(y1SliderElement.value);
    lozengeTester.init(animations[2]['opts']);
  });
}

function addLTEventListenerX2Slider() {
  let x2SliderElement = document.getElementById(animations[2]['x2Slider']);
  x2SliderElement.addEventListener('input', function(event) {
    animations[2]['opts'].x2 = parseInt(x2SliderElement.value);
    lozengeTester.init(animations[2]['opts']);
  });
}

function addLTEventListenerY2Slider() {
  let y2SliderElement = document.getElementById(animations[2]['y2Slider']);
  y2SliderElement.addEventListener('input', function(event) {
    animations[2]['opts'].y2 = parseInt(y2SliderElement.value);
    lozengeTester.init(animations[2]['opts']);
  });
}

//lozenge Spirrograph
function addLSEventListenerReverseDX() {
  document.getElementById(animations[3]['reverseDXButt']).addEventListener('click', lozengeSpirrograph.reverseDX);
}

function addLSEventListenerReverseDY() {
  document.getElementById(animations[3]['reverseDYButt']).addEventListener('click', lozengeSpirrograph.reverseDY);
}

function addLSEventListenerSwitchXY() {
  document.getElementById(animations[3]['switchXYButt']).addEventListener('click', lozengeSpirrograph.switchXY);
}
