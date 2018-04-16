const path = require('path')
const express = require('express')
const SERVERCONFIG= require(path.join(__dirname, '../../server-config'))

function logReq(req, res, next) {
  console.log(`${req.method} Request to ${SERVERCONFIG.ROOTURL}${req.url}:${SERVERCONFIG.PORT} from ${req.headers['x-forwarded-for']}`)
  next()
}

module.exports = {
  logReq
}
