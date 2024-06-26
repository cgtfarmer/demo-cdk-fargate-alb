var express = require('express');
var usersRouter = require('./users');
var requestLogger = require('./middleware/request-logger');

var app = express();

app.use(express.json());
app.use(requestLogger);

app.use('/users', usersRouter);

app.get('/health', async function(request, response) {
  response.json({ status: 'healthy' });
})

app.listen(80, function() {
  console.log('App listening on port 80');
})

module.exports = app;
