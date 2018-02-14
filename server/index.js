const express = require('express');
const app = express();
const path = require('path');
const volleyball = require('volleyball');
const reader = require('./db_reader');

app.use(volleyball);

//serve up static files
app.use(express.static(path.resolve(__dirname, '..', 'client')));
app.use(express.static(path.resolve(__dirname, '..', 'node_modules')));

app.use(function (err, req, res, next) {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

app.get('/tournament', function (request, response) {
	var id = parseInt(request.query.id);
	console.log("id="+id);
	response.setHeader('Content-Type', 'application/json');
	reader.getTournament(id,function(result){
		console.log("tournaments success:"+result);
		response.write(JSON.stringify(result));
		response.end();
	},
	function(error){
		response.write('{"error":"Oops!"}');
		console.log("tournaments error:"+error);
		response.end();
	});
	
});

//redirect home if paths are unknown
app.get('/', function (request, response) {
  response.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'))
});

//listen on port 3000
app.listen(process.env.PORT || 3000, function () {
  console.log("Blasting on port 3000 fam");
});
