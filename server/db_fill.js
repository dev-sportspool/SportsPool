var MongoClient = require('mongodb').MongoClient;
const CONST = require('./db_constants');

MongoClient.connect("mongodb://"+CONST.DB_ADMIN_USERNAME+":"+CONST.DB_ADMIN_PASSWORD+"@"+CONST.DB_ADDRESS+":"+CONST.DB_PORT+"/?authMechanism=DEFAULT&authSource="+CONST.DB_NAME, function(err, db) {
    if (err) throw err;
	  console.log("Connected to db :"+db);
	  var database = db.db(CONST.DB_ADDRESS);
		  database.collection(CONST.TOURNAMENT).insert({
			  _id:1,
			  name:"FIFA",
		      description:"Best tournament ever!",
		      icon:"",
		      banner:""
		  }).then(function(result){
		  console.log("created tournament");
		  return database.collection(CONST.MATCH).insert({
			  _id:1,
			  tournament_id:1,
			  date:new Date("2018-06-14T00:00:00.000Z"),
			  bet_cutoff_minutes:60,
			  state:0,
			  team_a_id:1,
			  team_b_id:2,
			  score_team_a:-1,
			  score_team_b:-1
		  });
		  }).then(function(result){
			  console.log("created match");
			  return database.collection(CONST.TEAM).insertMany([{
				  _id:1,
				  name:"Ukrainian National Team",
				  country:"Ukraine",
				  icon:"",
				  banner:""
			  },{
				  _id:2,
				  name:"Spanish National Team",
				  country:"Spain",
				  icon:"",
				  banner:""
			  }]);
		  }).then(function(result){
			  console.log("Created team");
			  db.close();
		  }).catch(function(ex){
			  console.log("Failed creating data:"+ex);
			  db.close();
		  });
});