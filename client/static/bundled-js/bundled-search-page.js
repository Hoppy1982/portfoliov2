(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// portfolio
// search-page.js

// File description:
// Script file linked to search-page.pug

submitSearch = function() {
  var searchParams = {
    id: document.getElementById('inputId').value,
    complete: document.getElementById('completedYes').checked,
    outstanding: document.getElementById('outstandingYes').checked
  };

  var headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8'
  });

  fetch('/search-page', {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(searchParams)
  }).then(function(res) {
    return res.json();
  }).then(function(resJson) {
    document.getElementById('searchOutput').innerHTML = JSON.stringify(resJson[0]);
  }).catch(function(err) {
    throw err;
  })

}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvc3RhdGljL3NvdXJjZS1qcy9zZWFyY2gtcGFnZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gcG9ydGZvbGlvXHJcbi8vIHNlYXJjaC1wYWdlLmpzXHJcblxyXG4vLyBGaWxlIGRlc2NyaXB0aW9uOlxyXG4vLyBTY3JpcHQgZmlsZSBsaW5rZWQgdG8gc2VhcmNoLXBhZ2UucHVnXHJcblxyXG5zdWJtaXRTZWFyY2ggPSBmdW5jdGlvbigpIHtcclxuICB2YXIgc2VhcmNoUGFyYW1zID0ge1xyXG4gICAgaWQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dElkJykudmFsdWUsXHJcbiAgICBjb21wbGV0ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbXBsZXRlZFllcycpLmNoZWNrZWQsXHJcbiAgICBvdXRzdGFuZGluZzogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ291dHN0YW5kaW5nWWVzJykuY2hlY2tlZFxyXG4gIH07XHJcblxyXG4gIHZhciBoZWFkZXJzID0gbmV3IEhlYWRlcnMoe1xyXG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PXV0Zi04J1xyXG4gIH0pO1xyXG5cclxuICBmZXRjaCgnL3NlYXJjaC1wYWdlJywge1xyXG4gICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICBoZWFkZXJzOiBoZWFkZXJzLFxyXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoc2VhcmNoUGFyYW1zKVxyXG4gIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICByZXR1cm4gcmVzLmpzb24oKTtcclxuICB9KS50aGVuKGZ1bmN0aW9uKHJlc0pzb24pIHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWFyY2hPdXRwdXQnKS5pbm5lckhUTUwgPSBKU09OLnN0cmluZ2lmeShyZXNKc29uWzBdKTtcclxuICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgIHRocm93IGVycjtcclxuICB9KVxyXG5cclxufVxyXG4iXX0=
