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

ROUTER.get('/404', (req, res, next) => {
  res.render('404')
})

ROUTER.all('*', requestRedirects.redirect)

module.exports = ROUTER
