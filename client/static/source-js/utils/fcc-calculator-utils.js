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
