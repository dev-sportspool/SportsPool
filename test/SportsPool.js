var SportsPool = artifacts.require("SportsPool");
var ETH_PRICE = 1121.17;

contract('SportsPool', function(accounts){
	var owner = accounts[0]; //is owner of contract by default in truffle
	var player = accounts[1];
	//'it' defines a test case
	it("Add tournament", function(){
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.addTournament({from: owner});
		}).then(function(result){
			logGasCost("Adding Tournament gas cost",result);
			return meta.getTournament.call(1,{from: player});
		}).then(function(result){
			logResponse("Get first Tournament",result);
			assert.equal(1,result[0],"First tournament id should be 1");
		});
	});
	it("Add match", function(){
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.addMatch(1,33,44,855431,171000,{from: owner}); //~ $20 price, ~$4 fee
		}).then(function(result){
			logGasCost("Adding match gas cost",result);
			return meta.getMatch.call(1,1,{from: player});
		}).then(function(result){
			logResponse("Get Match #1",result);
			assert.equal(1,result[0],"First match id should be 1");
		});
	});
	it("Join match and make bet", function(){
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.joinTournamentMatchWithBet(1,1,2,3,{from: player, value: 855431});
		}).then(function(result){
			logGasCost("Joining match and making bet gas cost",result);
			return meta.getBetScores.call(1,1,{from: player});
		}).then(function(result){
			logResponse("Get bet scores", result);
			assert.equal(2,result[0],"First score should be 2");
			assert.equal(3,result[1],"Second score should be 3");
		});
	});
	it("Set match scores", function(){
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.setMatchScores(1,1,2,3,{from: owner});
		}).then(function(result){
			logGasCost("Setting match scores gas cost",result);
			return meta.getMatch.call(1,1,{from: player});
		}).then(function(result){
			logResponse("Get Match #1",result);
			assert.equal(2,result[6],"First score should be 2");
			assert.equal(3,result[7],"Second score should be 3");
		});
	});
	it("Checking winner", function(){
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.isWinner.call(1,1,{from: player});
		}).then(function(result){
			logResponse("Is Winner",result);
			assert.equal(true,result,"This account should be winner");
		});
	});
	it("Get payout ", function(){
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.getPayout(1,1,{from: player});
		}).then(function(error,result){
			if(!error){
				logGasCost("Payout gas cost",result);
				logResponse("Got payout",result);
				assert.ifError(0);
			}else{
				logGasCost("Payout error gas cost",error);
				logResponse("Get payout error",error);
				assert.ifError(1);
			}
		});
	});
	
	
});

function logResponse(tag, resp){
	console.log(tag+":"+JSON.stringify(resp));
}

function logNumber(tag,num){
	console.log(tag+":"+num);
}

function logGasCost(tag,data){
	var gasUsed = data.receipt.gasUsed;
	var dollarCost = 0.00000002 * ETH_PRICE * gasUsed;
	console.log(tag+":$"+dollarCost.toFixed(2));
}