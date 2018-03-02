var SportsPool = artifacts.require("SportsPool");
var ETH_PRICE = 1182.50;
var GAS_PRICE = 20000000000; // more or less constant. can be checked via SportsPool.web3.eth.getGasPrice(function(error, result){});

contract('SportsPool', function(accounts){
	var owner = accounts[0]; //is owner of contract by default in truffle
	const COST = dollarToWei(20.00);
	const DEV_FEE = dollarToWei(4.00);
	const BET_END_TIME = 25175475600; // Future timestamp to allow bets (bet cutoff tested in BetCutoff.js)
	const TEAM_A_ID = 111;
	const TEAM_B_ID = 200;
	const tournamentId = 1;
	const matchId = 1;
	
	//TODO: make for loop for testing multiple tournaments
	testTournament(owner,tournamentId);
	//TODO: make for loop for testing multiple matches
	testMatch(owner,player,tournamentId, matchId,TEAM_A_ID,TEAM_B_ID,COST,DEV_FEE,BET_END_TIME);

	// Match 2
	testMatch(owner,player,tournamentId, 2,TEAM_A_ID,TEAM_B_ID,COST,DEV_FEE,BET_END_TIME);
	testMatchSetScores(owner, player,tournamentId,2,0,0);
	
	// Circuit Breaker (Change to false for halting usage)
	testCircuitBreaker(owner, true);

	console.log("================FOR EACH PLAYER================");
	for(var i=1; i<9; i++){ //starting from 1 as 0 is owner of contract, 8 players total
	
		var player = accounts[i];
		var isWinner = i % 2 == 0; //odd players are winner , odd are losers
		const TEAM_A_FINAL_SCORE = 2;
		const TEAM_B_FINAL_SCORE = 3;
		var playerTeamAPrediction = isWinner?TEAM_A_FINAL_SCORE:1;
		var playerTeamBPrediction = isWinner?TEAM_B_FINAL_SCORE:2;
		console.log(accounts[i]);
		console.log("Will "+(isWinner?"":"not ")+"be a winner");
		
		testJoinBet(owner,player,tournamentId,matchId,playerTeamAPrediction,playerTeamBPrediction,COST);
		testMatchSetScores(owner, player,tournamentId,matchId,TEAM_A_FINAL_SCORE,TEAM_B_FINAL_SCORE);
		testWinner(owner, player, tournamentId,matchId,isWinner);
		testPaid(owner, player, tournamentId,matchId,isWinner,false); // Check if it ever got paid 
		testPayout(owner, player, tournamentId,matchId,isWinner); // Pay the user
		testPaid(owner, player, tournamentId,matchId,isWinner,isWinner); // Check if it got paid after the payout process
		testPayout(owner, player, tournamentId,matchId,isWinner); // Try to pay again same user
		testWinner(owner, player, tournamentId, 2, false); // Should pass as not winner, as this user never bet on that match
	}

	// Print Match bets
	printMatchBets(owner, player, tournamentId, matchId);
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

function testMatchSetScores(owner, player, tournamentId,matchId,TEAM_A_FINAL_SCORE,TEAM_B_FINAL_SCORE){
	it("Set match scores", function(){
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.setMatchScores(tournamentId,matchId,TEAM_A_FINAL_SCORE,TEAM_B_FINAL_SCORE,{from: owner});
		}).then(function(result){
			logGasCost("Setting match scores gas cost",result);
			return meta.getMatch.call(tournamentId,matchId,{from: player});
		}).then(function(result){
			logResponse("Get Match #1",result);
			assert.equal(TEAM_A_FINAL_SCORE,result[6],"Final score for Team A should be "+TEAM_A_FINAL_SCORE);
			assert.equal(TEAM_B_FINAL_SCORE,result[7],"Final score for Team B should be "+TEAM_B_FINAL_SCORE);
		});
	});
}

function testWinner(owner, player, tournamentId,matchId,isWinner){
	it("Checking winner", function(){
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.isWinnerAndPaid.call(tournamentId,matchId,{from: player});
		}).then(function(result){
			logResponse("Is Winner: ",result[0]);
			assert.equal(isWinner,result[0],"This account should "+(result[0]?"be":"not be")+" winner");				
		});
	});
}

function testPaid(owner, player, tournamentId,matchId,isWinner,gotPaid){
	it("Checking paid payout", function(){
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.isWinnerAndPaid.call(tournamentId,matchId,{from: player});
		}).then(function(result){
			logResponse("Received Payout: ",result[1]);
			assert.equal(gotPaid,result[1],"This account should have "+(gotPaid?"received":"not received")+" the money");				
		});
	});
}

function testPayout(owner, player, tournamentId,matchId,isWinner){
	if(!isWinner) //figure out how to test if loser tries to claim payout
		return;
	it("Get payout ", function(){
			var meta ;
			var initialBalance ;
			 return SportsPool.deployed().then(function(instance) {
				meta = instance;
				return SportsPool.web3.eth.getBalance(player);
			}).then(function(result){
				console.log("Initial player balance:"+result);
				initialBalance = result;
				return meta.getMatchPrize.call(tournamentId,matchId,{from: player});
			}).then(function(result){
				return meta.getPayout(tournamentId,matchId,{from: player});
			}).then(function(error,result){
				console.log("Paid out player...");
				//figure out loser case
				if(error){ //truffle y u fail?
					logGasCost("Payout error gas cost",error);
					//logResponse("Get payout error",error);
				}else{
					logGasCost("Payout gas cost",result);
					logResponse("Got payout",result);
				}
				return SportsPool.web3.eth.getBalance(player);
					
			}).then(function(result){
				console.log("Balance after payout:"+result);
				var balChange =  result - initialBalance;
				if(balChange<=0){ 
					assert.ifError(1,"PLayers balance should have increased!");
				}//TODO: check !isWInner
				return SportsPool.web3.eth.getBalance(owner);
			}).then(function(result){
				logWeiCost("Contract balance after payout",result); //lol wtf? is it initialized with 100 eth?
				//check contract's balance?
			}); 
		});
}

function testCircuitBreaker(owner, enable){
	it("Applying Circuit Breaker", function(){
		var meta ;
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.setEnabled(enable,{from: owner});
		}).then(function(result){
			logResponse("Circuit Breaker ",enable?"enabled":"disabled");			
		});
	});
}

function printMatchBets(owner, player, tournamentId,matchId){
	var meta ;
	it("Match bets", function(){
		return SportsPool.deployed().then(function(instance) {
			meta = instance;
			return meta.getMatchAllBets.call(tournamentId,matchId,{from: player});
		}).then(function(result){
			logResponse("Scores Team A: ",result[0]);
			logResponse("Scores Team B: ",result[1]);				
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
	