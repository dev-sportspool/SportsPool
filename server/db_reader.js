var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
const CONST = require('./db_constants');
module.exports =
{
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
}