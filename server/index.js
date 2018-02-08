const express = require('express');
const app = express();
const path = require('path');
const volleyball = require('volleyball');

app.use(volleyball);

//serve up static files
app.use(express.static(path.resolve(__dirname, '..', 'client')));
app.use(express.static(path.resolve(__dirname, '..', 'node_modules')));

app.use(function (err, req, res, next) {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});


app.get('/swag', function (request, response) {
	response.setHeader('Content-Type', 'application/json')
	response.write('{swag:"max!"}')
	response.end()
});

//redirect home if paths are unknown
app.get('/', function (request, response) {
  response.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'))
});

//listen on port 3000
app.listen(process.env.PORT || 3000, function () {
  console.log("Blasting on port 3000 fam");
});

//For Reference:
//https://expressjs.com/en/guide/routing.html
//https://cosmicjs.com/blog/how-to-build-a-todo-app-using-react-redux-and-webpack