var SportsPool = artifacts.require("SportsPool");
var ETH_PRICE = 1182.50;
var GAS_PRICE = 20000000000; // more or less constant. can be checked via SportsPool.web3.eth.getGasPrice(function(error, result){});

contract('SportsPool', function(accounts){
	var owner = accounts[0]; //is owner of contract by default in truffle
	const COST = dollarToWei(20.00);
	const DEV_FEE = dollarToWei(4.00);
	const BET_END_TIME = 1517551190; //  Modify this before running the test (https://www.epochconverter.com/)
	const TEAM_A_ID = 111;
	const TEAM_B_ID = 200;
	const tournamentId = 1;
	const matchId = 1;
	
	// Create tournament
	testTournament(owner,tournamentId);

	// Create Match
	// Using real time epoch should fail even addMatch (we have require check to avoid adding passed time matches)
	// To just test join match + bet + edit, use epoch >15min than now/real time
	testMatch(owner,player,tournamentId, matchId,TEAM_A_ID,TEAM_B_ID,COST,DEV_FEE,BET_END_TIME);

	//Set user
	var player = accounts[1];

	// User joins and places a bet
	testJoinBet(owner,player,tournamentId,matchId,1,2,COST);

	// User edits a bet
	testEditBet(owner,player,tournamentId,matchId,4,7);

	// Check Block time
	testBlockTime(player);
});

function testTournament(owner,tournamentId){
	//'it' defines a test case
	it("Add tournament", function(){
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.addTournament({from: owner});
		}).then(function(result){
			logGasCost("Adding Tournament gas cost",result);
			return meta.getTournament.call(tournamentId,{from: owner});
		}).then(function(result){
			logResponse("Get Tournament#"+tournamentId,result);
			assert.equal(tournamentId,result[0],"Id of Tournament#"+tournamentId+" should be " +tournamentId);
		});
	});
}

function testMatch(owner,player,tournamentId,matchId,TEAM_A_ID,TEAM_B_ID,COST,DEV_FEE,BET_END_TIME){
	it("Add match", function(){
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.addMatch(tournamentId,TEAM_A_ID,TEAM_B_ID,COST,DEV_FEE,BET_END_TIME,{from: owner});
		}).then(function(result){
			logGasCost("Adding match gas cost",result);
			return meta.getMatch.call(tournamentId,matchId,{from: player});
		}).then(function(result){
			logResponse("Get Match #"+matchId,result);
			assert.equal(matchId,result[0],"Id of Match#"+matchId+" should be "+matchId);
		});
	});
}

function testJoinBet(owner, player, tournamentId,matchId,playerTeamAPrediction,playerTeamBPrediction,COST){
	it("Join match and make bet", function(){
		console.log("\n================PLAYER "+player+"==================");
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.joinTournamentMatchWithBet(tournamentId,matchId,playerTeamAPrediction,playerTeamBPrediction,{from: player, value: COST});
		}).then(function(result){
			logGasCost("Joining match and making bet gas cost",result);
			return meta.getBetScores.call(tournamentId,matchId,{from: player});
		}).then(function(result){
			logResponse("Get bet scores", result);
			assert.equal(playerTeamAPrediction,result[0],"Player should have "+playerTeamAPrediction +" as predicted score for team A");
			assert.equal(playerTeamBPrediction,result[1],"Player should have "+playerTeamBPrediction +" as predicted score for team B");
		});
	});
}

function testEditBet(owner, player, tournamentId,matchId,playerTeamAPrediction,playerTeamBPrediction){
	it("Edit bet", function(){
		console.log("\n================PLAYER "+player+"==================");
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.editBet(tournamentId,matchId,playerTeamAPrediction,playerTeamBPrediction,{from: player});
		}).then(function(result){
			logGasCost("Editing match bet and making bet gas cost",result);
			return meta.getBetScores.call(tournamentId,matchId,{from: player});
		}).then(function(result){
			logResponse("Get bet scores", result);
			assert.equal(playerTeamAPrediction,result[0],"Player should have "+playerTeamAPrediction +" as predicted score for team A");
			assert.equal(playerTeamBPrediction,result[1],"Player should have "+playerTeamBPrediction +" as predicted score for team B");
		});
	});
}

function testBlockTime(player){
	it("Get Block Time", function(){
		console.log("\n================BLOCK TIME==================");
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.getTime.call({from: player});
		}).then(function(result){
			logResponse("Block time is: ",result);
		});
	});
}

function logResponse(tag, resp){
	console.log(tag+":"+JSON.stringify(resp));
}

function logNumber(tag,num){
	console.log(tag+":"+num);
}

function logGasCost(tag,data){
	var gasUsed = data.receipt.gasUsed;
	var dollarCost = gasToDollar(gasUsed);
	console.log(tag+":$"+dollarCost.toFixed(2));
}

function logWeiCost(tag,wei){
	var dollarCost = weiToDollar(wei);
	console.log(tag+":$"+dollarCost.toFixed(2));
}

function gasToDollar(gasWei){
	return SportsPool.web3.fromWei((gasWei * GAS_PRICE), "ether") * ETH_PRICE;
}

function dollarToWei(dollar){
	return SportsPool.web3.toWei(dollar/ETH_PRICE, "ether");
}

function weiToDollar(wei){
	return SportsPool.web3.fromWei(wei, "ether")* ETH_PRICE ;
}