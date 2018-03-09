var MongoClient = require('mongodb').MongoClient;
const CONST = require('./db_constants');
console.log(CONST)
MongoClient.connect("mongodb://"+CONST.DB_ADDRESS+":"+CONST.DB_PORT+"/", function(err, db) {
    if (err) throw err;
	  var database = db.db(CONST.DB_NAME);
		console.log("Connected to db :"+db);
		//the calls bellow will fail on the very first run since some of the below entities might not exist.
		database.collection(CONST.TOURNAMENT).dropAllIndexes();
		database.collection(CONST.MATCH).dropAllIndexes();
		database.collection(CONST.TEAM).dropAllIndexes();
		database.removeUser(CONST.DB_ADMIN_USERNAME);
		database.removeUser(CONST.DB_GUEST_USERNAME);
		//the calls bellow should never fail
		database.createCollection(CONST.TOURNAMENT)
		.then(function(result) {
			  console.log("Created "+CONST.TOURNAMENT+" collection:"+result);
			  return database.createCollection(CONST.MATCH);
		 }).then(function(result) {
		  console.log("Created "+CONST.MATCH+" collection:"+result);
		  return database.createCollection(CONST.TEAM); 
		}).then(function(result) {
		  console.log("Created "+CONST.TEAM+" collection:"+result);
		  return database.addUser (CONST.DB_GUEST_USERNAME,CONST.DB_GUEST_PASSWORD, {roles:[{ role: "readAnyDatabase", db: "admin" }]} );
		}).then(function(result){
			console.log("Created guest user:"+JSON.stringify(result));
			return database.addUser (CONST.DB_ADMIN_USERNAME,CONST.DB_ADMIN_PASSWORD, {roles:[{ role: "dbAdminAnyDatabase", db: "admin" },{ role: "userAdminAnyDatabase", db: "admin" },{ role: "readWriteAnyDatabase", db: "admin" }]} );
		}).then(function(result){
			console.log("Created admin user:"+JSON.stringify(result));
			console.log("Setup completed successfully!");
			db.close();
		}).catch(function(ex){
			console.log("Setup failed!  Check logic!");
			console.log("Cause:"+ex);
			db.close();
		});
});