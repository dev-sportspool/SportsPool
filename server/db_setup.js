var MongoClient = require('mongodb').MongoClient;
const CONST = require('./db_constants');
console.log(CONST)
MongoClient.connect("mongodb://"+CONST.DB_ADDRESS+":"+CONST.DB_PORT+"/", function(err, db) {
    if (err) throw err;
	  var database = db.db(CONST.DB_NAME);
	  console.log("Connected to db :"+db);
	  database.dropDatabase().then(function(result){
		  database.removeUser(CONST.DB_ADMIN_USERNAME, function(result, error){
			  database.removeUser(CONST.DB_GUEST_USERNAME, function(result, error){
			  database.createCollection(CONST.TOURNAMENT).then(function(result) {
		  console.log("Created "+CONST.TOURNAMENT+" collection:"+result);
		  database.createCollection(CONST.MATCH)
		  .then(function(result) {
			  console.log("Created "+CONST.MATCH+" collection:"+result);
			  database.createCollection(CONST.TEAM)
				  .then(function(result) {
				  console.log("Created "+CONST.TEAM+" collection:"+result);
				  database.addUser (CONST.DB_ADMIN_USERNAME,CONST.DB_ADMIN_PASSWORD, {roles:[{ role: "dbAdminAnyDatabase", db: "admin" },{ role: "userAdminAnyDatabase", db: "admin" },{ role: "readWriteAnyDatabase", db: "admin" }]} ,
					  function(err, result) {
						if (err){
						  return console.log('Error: could not add admin user'+err)
						}
						database.addUser (CONST.DB_GUEST_USERNAME,CONST.DB_GUEST_PASSWORD, {roles:[{ role: "read", db: CONST.DB_NAME }]} ,
						  function(err, result) {
							if (err){
							  return console.log('Error: could not add guest user'+err)
							}
							db.close();
					  }
					);
					  }
					);
				  
				})
			})
		});
		});
		  });
	  });
	  
	  
	  
});