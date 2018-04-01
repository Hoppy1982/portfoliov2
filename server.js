var port = 3000;

const express = require('express');

var server = express();

server.listen(port);
console.log('Server listening on port: ' + port);
