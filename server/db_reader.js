var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
const CONST = require('./db_constants');

var DBReader = class DBReader{
	getTournament(id, success, failure){
		MongoClient.connect("mongodb://"+CONST.DB_GUEST_USERNAME+":"+CONST.DB_GUEST_PASSWORD+"@"+CONST.DB_ADDRESS+":"+CONST.DB_PORT+"/?authMechanism=DEFAULT&authSource="+CONST.DB_NAME, function(err, db) {
		  if (err) failure(err);
		  var database = db.db(CONST.DB_ADDRESS);
		  var query = { _id:id };
			database.collection(CONST.TOURNAMENT).findOne(query)
			.then(function(result){
				success(result);
				db.close();
			})
			.catch(function(err){
				failure(err);
				db.close();
			});
		});
	}
	
	getMatches(t_id, success, failure){
		MongoClient.connect("mongodb://"+CONST.DB_GUEST_USERNAME+":"+CONST.DB_GUEST_PASSWORD+"@"+CONST.DB_ADDRESS+":"+CONST.DB_PORT+"/?authMechanism=DEFAULT&authSource="+CONST.DB_NAME, function(err, db) {
		  if (err) failure(err);
		  var database = db.db(CONST.DB_ADDRESS);
		  var query = { tournament_id:t_id };
			database.collection(CONST.MATCH)
			.find(query)
			.toArray()
			.then(function(result){
				success(result);
				db.close();
			})
			.catch(function(err){
				failure(err);
				db.close();
			});
		});
	}
	
	getMatch(id, success, failure){
		MongoClient.connect("mongodb://"+CONST.DB_GUEST_USERNAME+":"+CONST.DB_GUEST_PASSWORD+"@"+CONST.DB_ADDRESS+":"+CONST.DB_PORT+"/?authMechanism=DEFAULT&authSource="+CONST.DB_NAME, function(err, db) {
		  if (err) failure(err);
		  var database = db.db(CONST.DB_ADDRESS);
		  var match;
		  var query = {_id:id };
			database.collection(CONST.MATCH)
			.findOne(query)
			.then(function(result){
				match = result;
				return database.collection(CONST.TEAM)
				.find(
						{ $or: [ 
							{ _id: result.team_a_id}, 
							{ _id: result.team_b_id} ] 
						}
					)
				.toArray();
			})
			.then(function(result){
				console.log("teams:"+JSON.stringify(result));
				match.team_a = match.team_a_id===result[0]._id?result[0]:result[1];
				match.team_b = match.team_b_id===result[0]._id?result[0]:result[1];
				success(match);
				db.close();
			})
			.catch(function(err){
				failure(err);
				db.close();
			});
		});
	}
}
module.exports =DBReader;