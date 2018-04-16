const express = require('express')

function redirect(req, res, next) {
  let homeRegex = /(?=.*h)(?=.*o)(?=.*m)(?=.*e)/

  if (homeRegex.test(req.url) && req.url.length == 5) {
    res.redirect('/home')
  }

  res.redirect('/404')

  next()
}

module.exports = {
  redirect
}
