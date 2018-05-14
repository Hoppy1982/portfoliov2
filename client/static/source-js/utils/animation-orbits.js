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
