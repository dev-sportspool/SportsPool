const express = require('express');
const app = express();
const path = require('path');
const volleyball = require('volleyball');
const DBReader = require('./db_reader');
const DBWriter = require('./db_writer');
const bodyParser = require('body-parser')
const CONST = require('./db_constants');


app.use(volleyball);

//serve up static files
app.use(express.static(path.resolve(__dirname, '..', 'client')));
app.use(express.static(path.resolve(__dirname, '..', 'node_modules')));

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

app.get('/tournament', function(request, response) {
    var id = parseInt(request.query.id);
    console.log("id=" + id);
    response.setHeader('Content-Type', 'application/json');
    (new DBReader()).getTournament(id, function(result) {
            console.log("tournament success:" + result);
            response.write(JSON.stringify(result));
            response.end();
        },
        function(error) {
            addErrorData(response, CONST.ERROR_CODES.DATABASE_ERROR, error);
            console.log("tournaments error:" + error);
            response.end();
        });

});

app.get('/tournaments', function(request, response) {
    response.setHeader('Content-Type', 'application/json');
    (new DBReader()).getTournaments(function(result) {
            console.log("tournaments success:" + result);
            response.write(JSON.stringify(result));
            response.end();
        },
        function(error) {
            addErrorData(response, CONST.ERROR_CODES.DATABASE_ERROR, error);
            console.log("tournaments error:" + error);
            response.end();
        });

});

app.get('/matches', function(request, response) {
    var tournament_id = parseInt(request.query.tournament_id);
    console.log("tournament_id=" + tournament_id);
    response.setHeader('Content-Type', 'application/json');
    (new DBReader()).getMatches(tournament_id, function(result) {
            console.log("matches success:" + result);
            response.write(JSON.stringify(result));
            response.end();
        },
        function(error) {
            addErrorData(response, CONST.ERROR_CODES.DATABASE_ERROR, error);
            console.log("matches error:" + error);
            response.end();
        });

});

app.get('/match', function(request, response) {
    var id = parseInt(request.query.id);
    console.log("id=" + id);
    response.setHeader('Content-Type', 'application/json');
    (new DBReader()).getMatch(id, function(result) {
            console.log("match success:" + result);
            response.write(JSON.stringify(result));
            response.end();
        },
        function(error) {
            addErrorData(response, CONST.ERROR_CODES.DATABASE_ERROR, error);
            console.log("match error:" + error);
            response.end();
        });

});

app.get('/teams', function(request, response) {
    response.setHeader('Content-Type', 'application/json');
    (new DBReader()).getTeams(function(result) {
            console.log("teams success:" + result);
            response.write(JSON.stringify(result));
            response.end();
        },
        function(error) {
            addErrorData(response, CONST.ERROR_CODES.DATABASE_ERROR, error);
            console.log("tournaments error:" + error);
            response.end();
        });

});

app.post('/tournament', function(request, response) {
    var obj = request.body
    console.log("obj=" + JSON.stringify(obj));
    response.setHeader('Content-Type', 'application/json');
    (new DBWriter()).addTournament(obj.username, obj.password, parseInt(obj.id), obj.name, obj.description, obj.icon, obj.banner, function(result) {
            console.log("added tournament success:" + result);
            response.write(JSON.stringify(result));
            response.end();
        },
        function(error) {
            addErrorData(response, CONST.ERROR_CODES.DATABASE_ERROR, error);
            console.log("add tournament error:" + error);
            response.end();
        });

});

app.post('/match', function(request, response) {
    var obj = request.body
    console.log("obj=" + JSON.stringify(obj));
    response.setHeader('Content-Type', 'application/json');
    (new DBWriter()).addMatch(obj.username, obj.password, parseInt(obj.id), parseInt(obj.tournament_id), obj.date_str, parseInt(obj.bet_cutoff_minutes), parseInt(obj.state), parseInt(obj.team_a_id), parseInt(obj.team_b_id), function(result) {
            console.log("added match success:" + result);
            response.write(JSON.stringify(result));
            response.end();
        },
        function(error) {
            addErrorData(response, CONST.ERROR_CODES.DATABASE_ERROR, error);
            console.log("add match error:" + error);
            response.end();
        });

});

app.post('/matchScore', function(request, response) {
    var obj = request.body
    console.log("obj=" + JSON.stringify(obj));
    response.setHeader('Content-Type', 'application/json');
    (new DBWriter()).setMatchScore(obj.username, obj.password, parseInt(obj.id), parseInt(obj.score_team_a), parseInt(obj.score_team_b), function(result) {
            console.log("added match scores success:" + result);
            response.write(JSON.stringify(result));
            response.end();
        },
        function(error) {
            addErrorData(response, CONST.ERROR_CODES.DATABASE_ERROR, error);
            console.log("add match scores error:" + error);
            response.end();
        });

});

app.post('/team', function(request, response) {
    var obj = request.body
    console.log("obj=" + JSON.stringify(obj));
    response.setHeader('Content-Type', 'application/json');
    (new DBWriter()).addTeam(obj.username, obj.password, parseInt(obj.id), obj.name, obj.country, obj.icon, obj.banner, function(result) {
            console.log("added team success:" + result);
            response.write(JSON.stringify(result));
            response.end();
        },
        function(error) {
            addErrorData(response, CONST.ERROR_CODES.DATABASE_ERROR, error);
            console.log("add team error:" + error);
            response.end();
        });

});

//custom error handling
function addErrorData(response, code, error) {
    response.status(400);
    var err = CONST.ERROR_RESPONSE;
    err.status_code = code;
    err.status_message = error;
    response.write(JSON.stringify(err));
}

//general error handling
app.use(function(err, req, res, next) {
    console.error(err);
    console.error(err.stack);
    res.status(err.status || 500).send(err.message || 'Internal server error :( ');
});

//redirect home if paths are unknown
/* app.get('/', function (request, response) {
  response.sendFile(path.resolve(__dirname, '..', 'client', 'index.html'))
}); */

app.get('/admin', function(request, response) {
    var p = path.resolve(__dirname, '../client', 'admin', 'admin.html');
    console.log("serving " + p);
    response.sendFile(p);
});

app.get('/index', function(request, response) {
    var p = path.resolve(__dirname, '../client', 'home', 'index.html');
    console.log("serving " + p);
    response.sendFile(p);
});

app.get('/terms', function(request, response) {
    var p = path.resolve(__dirname, '../client', 'terms', 'terms.html');
    console.log("serving " + p);
    response.sendFile(p);
});

app.get('/', function(request, response) {
    var p = path.resolve(__dirname, '../client', 'home', 'index.html');
    console.log("serving " + p);
    response.sendFile(p);
});

//listen on port 3000
app.listen(process.env.PORT || 3000, function() {
    console.log("Blasting on port 3000 fam");
});