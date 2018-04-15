
const path = require('path')
const express = require('express')
const pug = require('pug')
const bodyParser = require('body-parser')
const PORT = 3000
const ROUTESINDEX = require(path.join(__dirname, '/server/routes/index'))

var server = express()

server.set('view engine', 'pug')
server.set('views', path.join(__dirname, 'client/views'))
server.use(express.static(path.join(__dirname, 'client/static')))
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({extended: false}))



server.listen(PORT)
console.log(`Server started on port: ${PORT}`)
