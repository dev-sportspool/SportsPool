var MongoClient = require('mongodb').MongoClient;
const CONST = require('./db_constants');

MongoClient.connect("mongodb://"+CONST.DB_ADMIN_USERNAME+":"+CONST.DB_ADMIN_PASSWORD+"@"+CONST.DB_ADDRESS+":"+CONST.DB_PORT+"/?authMechanism=DEFAULT&authSource="+CONST.DB_NAME, function(err, db) {
    if (err) throw err;
	  console.log("Connected to db :"+db);
	  var database = db.db(CONST.DB_ADDRESS);
	  database.collection(CONST.TOURNAMENT).insert({_id:1,
	  name:"FIFA",
	  description:"Best tournament ever!",
	  icon:"",
	  banner:""}).then(function(result){
		  console.log("created tournament");
		  db.close();
	  }).catch(function(ex){
		  console.log("failed creating tournament"+ex);
		  db.close();
	  });
});