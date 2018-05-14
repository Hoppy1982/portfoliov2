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
