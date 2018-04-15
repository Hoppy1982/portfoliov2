
const express = require('express')
const PORT = 3000

var server = express();

server.listen(PORT);
console.log(`Server started on port: ${PORT}`);
