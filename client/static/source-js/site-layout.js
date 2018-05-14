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
