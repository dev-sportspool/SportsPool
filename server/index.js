const express = require('express');
const app = express();
const path = require('path');
const volleyball = require('volleyball');
const BDReader = require('./db_reader');

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
	(new BDReader()).getTournament(id,function(result){
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

app.get('/matches', function (request, response) {
	var tournament_id = parseInt(request.query.tournament_id);
	console.log("tournament_id="+tournament_id);
	response.setHeader('Content-Type', 'application/json');
	(new BDReader()).getMatches(tournament_id, function(result){
		console.log("matches success:"+result);
		response.write(JSON.stringify(result));
		response.end();
	},
	function(error){
		response.write('{"error":"Oops!"}');
		console.log("matches error:"+error);
		response.end();
	});
	
});

app.get('/match', function (request, response) {
	var id = parseInt(request.query.id);
	console.log("id="+id);
	response.setHeader('Content-Type', 'application/json');
	(new BDReader()).getMatch(id, function(result){
		console.log("match success:"+result);
		response.write(JSON.stringify(result));
		response.end();
	},
	function(error){
		response.write('{"error":"Oops!"}');
		console.log("match error:"+error);
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
