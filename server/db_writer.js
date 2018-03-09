var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
const CONST = require('./db_constants');

var DBWriter = class DBWriter{
	addTournament(username,password,id,name,description,icon,banner, success, failure){
		MongoClient.connect("mongodb://"+username+":"+password+"@"+CONST.DB_ADDRESS+":"+CONST.DB_PORT+"/?authMechanism=DEFAULT&authSource="+CONST.DB_NAME, function(err, db) {
		  if (err) throw err;
		  console.log("Connected to db :"+db);
		  var database = db.db(CONST.DB_ADDRESS);
			  database.collection(CONST.TOURNAMENT).insert({
				  _id:id,
				  name:name,
				  description:description,
				  icon:icon,
				  banner:banner
			  }).then(function(result){
				console.log("created tournament");
				success(result);
				db.close();
			  }).catch(function(ex){
				  console.log("Failed creating data:"+ex);
				  failure(ex);
				  db.close();
			  });
		});
	}
	
	addMatch(username,password,id, tournament_id, time_stamp, bet_cutoff_minutes, state, team_a_id, team_b_id, success, failure){
		MongoClient.connect("mongodb://"+username+":"+password+"@"+CONST.DB_ADDRESS+":"+CONST.DB_PORT+"/?authMechanism=DEFAULT&authSource="+CONST.DB_NAME, function(err, db) {
		  if (err) throw err;
		  console.log("Connected to db :"+db);
		  var database = db.db(CONST.DB_ADDRESS);
			  database.collection(CONST.MATCH).insert({
				  match_number:id,
				  tournament_id:tournament_id,
				  date:time_stamp,
				  bet_cutoff_minutes:bet_cutoff_minutes,
				  state:state,
				  team_a_id:team_a_id,
				  team_b_id:team_b_id,
				  score_team_a:-1,
				  score_team_b:-1
			  }).then(function(result){
				  console.log("created match");
				  success(result);
				  db.close();
			  }).catch(function(ex){
				  console.log("Failed creating data:"+ex);
				  failure(ex);
				  db.close();
			  });
		});
	}
	
	setMatchScore(username, password, match_id, tournament_id, score_team_a, score_team_b, success, failure){
		MongoClient.connect("mongodb://"+username+":"+password+"@"+CONST.DB_ADDRESS+":"+CONST.DB_PORT+"/?authMechanism=DEFAULT&authSource="+CONST.DB_NAME, function(err, db) {
		  if (err) throw err;
		  console.log("Connected to db :"+db);
		  var database = db.db(CONST.DB_ADDRESS);
		  
		  var query = { $and: [ 
							{ match_number:match_id}, 
							{ tournament_id:tournament_id} ] 
						};
		  var newValues = {$set: {score_team_a: score_team_a, score_team_b: score_team_b }};
			  database.collection(CONST.MATCH)
			  .updateOne(query,newValues)
			  .then(function(result){
				  console.log("updated match scores");
				  success(result);
				  db.close();
			  }).catch(function(ex){
				  console.log("Failed creating data:"+ex);
				  failure(ex);
				  db.close();
			  });
		});
	}
	
	addTeam(username, password, id, name, country, icon, banner, success, failure){
		MongoClient.connect("mongodb://"+username+":"+password+"@"+CONST.DB_ADDRESS+":"+CONST.DB_PORT+"/?authMechanism=DEFAULT&authSource="+CONST.DB_NAME, function(err, db) {
		  if (err) throw err;
		  console.log("Connected to db :"+db);
		  var database = db.db(CONST.DB_ADDRESS);
			  database.collection(CONST.TEAM).insert({
				  _id:id,
				  name:name,
				  country:country,
				  icon:icon,
				  banner:banner
			  }).then(function(result){
				  console.log("Created team");
				  success(result);
				  db.close();
			  }).catch(function(ex){
				  console.log("Failed creating data:"+ex);
				  failure(ex);
				  db.close();
			  });
		});
	}
}

module.exports = DBWriter;