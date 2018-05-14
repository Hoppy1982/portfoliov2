const path = require('path')
const express = require('express')
const requestLogger = require(path.join(__dirname, '../utils/route-middleware/request-logger'))
const requestRedirects = require(path.join(__dirname, '../utils/route-middleware/request-redirects'))
const ROUTER = express.Router()

ROUTER.use(requestLogger.logReq)

//All routes in this file for no but will move to separate files if it gets too big

ROUTER.route('/home')
  .get((req, res, next) => {
    res.render('home')
  })

ROUTER.route('/campervan')
  .get(function(req, res, next) {
    console.log("GET request to '/campervan': Rendering campervan.pug");
    res.render( 'campervan', {title: "Campervan"} );
  })

ROUTER.route('/widgetrons')
  .get(function(req, res, next) {
    console.log("GET request to '/widgetrons': Rendering widgetrons.pug");
    res.render( 'widgetrons', {title: "Widgetrons"} );
  });

ROUTER.route('/fcc-projects')
  .get(function(req, res, next) {
    console.log("GET request to '/fcc-projects': Rendering fcc-projects.pug");
    res.render( 'fcc-projects', {title: "FCC Projects"} );
  })

ROUTER.route('/fcc-projects-calculator')
  .get(function(req, res, next) {
    console.log("GET request to '/fcc-projects-calculator': Rendering fcc-projects-calculator.pug");
    res.render( 'fcc-projects-calculator', {title: "FCC calculator"} );
  })

ROUTER.route('/fcc-projects-pomodoro')
  .get(function(req, res, next) {
    console.log("GET request to '/fcc-projects-pomodoro': Rendering fcc-projects-pomodoro.pug");
    res.render( 'fcc-projects-pomodoro', {title: "FCC Pomodoro"} );
  })

ROUTER.route('/fcc-projects-simon')
  .get(function(req, res, next) {
    console.log("GET request to '/fcc-projects-simon': Rendering fcc-projects-simon.pug");
    res.render( 'fcc-projects-simon', {title: "FCC Simon"} );
  })

ROUTER.route('/fcc-projects-tictactoe')
  .get(function(req, res, next) {
    console.log("GET request to '/fcc-projects-tictactoe': Rendering fcc-projects-tictactoe.pug");
    res.render( 'fcc-projects-tictactoe', {title: "FCC Tic Tac Toe"} );
  })

ROUTER.get('/404', (req, res, next) => {
    res.render('404')
  })

ROUTER.all('*', requestRedirects.redirect)

module.exports = ROUTER
