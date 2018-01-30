pragma solidity ^0.4.2;

contract owned {
    function owned() public { owner = msg.sender; }
    address owner;

    // This contract only defines a modifier but does not use
    // it: it will be used in derived contracts.
    // The function body is inserted where the special symbol
    // `_;` in the definition of a modifier appears.
    // This means that if the owner calls this function, the
    // function is executed and otherwise, an exception is
    // thrown.
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
}

contract mortal is owned {
    // This contract inherits the `onlyOwner` modifier from
    // `owned` and applies it to the `close` function, which
    // causes that calls to `kill` only have an effect if
    // they are made by the stored owner.
    function kill() public onlyOwner {
        selfdestruct(owner);
    }
}

contract priced {

    // Modifiers can receive arguments:
    modifier costs(uint price) {
        require(msg.value == price);
        _;
    }
}

contract fractions {
    event PercentError(
        address indexed _from,
        uint _value
    );
    modifier percent(uint value){
        if(value <= 100){
            _;
        }else{
            PercentError(msg.sender, msg.value);
        }
    }
    uint precision;
    function fractions(uint decimalPlaces) public {
        precision = decimalPlaces;
    }
    function asFloat(uint num) public view returns(uint){
        return num*10**(precision+1);
    }
    function getPrecision() public view returns(uint){
        return precision;
    }
}

contract SportsPool is owned, mortal, priced, fractions{

    /**
     *  Structs
     **/

    struct Bet{
        int scoreTeamA;
        int scoreTeamB;
    }
    
    struct Match{
        uint id;
        uint priceWei;//must be in wei
        uint players;
        uint idTeamA;//could be string
        uint idTeamB;//could be string
        bool cancelled;
        int scoreTeamA;//initialized with -1 until final score is known
        int scoreTeamB;//initialized with -1 until final score is known
        uint devFeeWei;//value must be in wei!!!
        mapping (uint => Bet) bets; //users bets
    }
    
    struct Tournament{
        uint id;
        uint nextMatchId;
        mapping (uint => Match) matches;
        uint nextUserId;
        mapping (address => uint) userIds; //address to userId mapping
    }
    
    /**
     *  Constants
     **/
    
    uint constant INITIAL_ID = 1;
    

    /**
     *  Storage
     **/
    
    mapping (uint => Tournament) tournaments;
    uint nextTournamentId = INITIAL_ID;

    /**
     *  Events
     **/

    event TournamentJoinedWithBet(address indexed _from, uint _value, uint tournamentId, uint matchId);
    event MatchAdded(address indexed _from, uint tournamentId, uint matchId);
    event MatchEdited(address indexed _from, uint tournamentId, uint matchId);
    event MatchEnded(address indexed _from, uint tournamentId, uint matchId);
    event BetEdited(address indexed _from, uint tournamentId, uint matchId);
    event RequestedPayout(address indexed _from, uint tournamentId, uint matchId, uint prize);
	event InsufficientBalance(address indexed _from, uint tournamentId, uint matchId, uint balance);


    /**
     *  Public Functions
     **/
     
        /**
         *  Owner Functions
         **/

    function SportsPool()fractions(8) public {
        //todo: setup
    }
    
    //Creates new Tournament with entry price
    function addTournament() public onlyOwner{
        tournaments[nextTournamentId] = Tournament({id:nextTournamentId, nextMatchId:INITIAL_ID, nextUserId:INITIAL_ID});
        nextTournamentId++;
    }
    
    //Add match to a tournament
    function addMatch(uint tournamentId, uint teamAId, uint teamBId, uint priceWei, uint devFeeWei) public onlyOwner {
        require(tournamentId>0 && tournamentId<nextTournamentId && priceWei>devFeeWei && teamAId != teamBId);
        // Data Modification
        Tournament storage t = tournaments[tournamentId];
        t.matches[t.nextMatchId] = Match({id:t.nextMatchId, priceWei:priceWei, players:0, cancelled:false, idTeamA:teamAId, idTeamB:teamBId, scoreTeamA:-1, scoreTeamB:-1, devFeeWei:devFeeWei});
        t.nextMatchId++;

        // Event
        MatchAdded(msg.sender, tournamentId, t.nextMatchId);
    }
    
    // Edits an existing match
    function editMatch(uint tournamentId, uint matchId, uint teamAId, uint teamBId, bool cancelled) public onlyOwner {
        require( teamAId != teamBId);
        // Data Modification
        var (,m) = getTournamentMatch(tournamentId, matchId);
        require(m.scoreTeamA==-1&&m.scoreTeamB==-1);
        
        m.idTeamA = teamAId;
        m.idTeamB = teamBId;
        m.cancelled = cancelled;

        // Event
        MatchEdited(msg.sender, tournamentId, matchId);
    }
    
    //Set final match scores
    function setMatchScores(uint tournamentId , uint matchId, int scoreTeamA, int scoreTeamB) public onlyOwner{
        // Data Modification
        var (,m) = getTournamentMatch(tournamentId, matchId);
        require(scoreTeamA>-1&&scoreTeamB>-1); //validate new scores
        
        m.scoreTeamA = scoreTeamA;
        m.scoreTeamB = scoreTeamB;

        // Event
        MatchEnded(msg.sender, tournamentId, matchId);
    }
    
    /**
    *  Player Functions
    *  Data Write (gas fees apply, enusre efficency and validity of data) 
    **/
    
    //Variation of joinTournamentMatch() with addBet() to save on gas
    function joinTournamentMatchWithBet( uint tournamentId, uint matchId, int scoreTeamA, int scoreTeamB) public payable costs(tournaments[tournamentId].matches[matchId].priceWei){
        require(scoreTeamA>=0 && scoreTeamB>=0);
        
        //todo stop if time is too close to match
        //consider block.timestamp
        var (t,m) = getTournamentMatch(tournamentId,matchId);
        uint userId = t.userIds[msg.sender];
        if (userId == 0) {
            t.userIds[msg.sender] = t.nextUserId;
            userId = t.nextUserId;
            ++t.nextUserId;
        }
        m.players++;
        m.bets[userId] = Bet({scoreTeamA:scoreTeamA,scoreTeamB:scoreTeamB});

        // Event
        TournamentJoinedWithBet(msg.sender, msg.value, tournamentId, matchId);
    }

    // Edit an existing Bet for a given Match
    function editBet(uint tournamentId, uint matchId, int scoreTeamA, int scoreTeamB) public {
        require(scoreTeamA>=0 && scoreTeamB>=0);
        //todo stop if time is too close to match or passed
        //consider block.timestamp
        //todo consider batching externally or consider limiting number of allowed changes
        // Data Modification
        var (,m,b) = getTournamentMatchBet(tournamentId,matchId);
        require(m.scoreTeamA==-1&&m.scoreTeamB==-1);//match open
        b.scoreTeamA = scoreTeamA;
        b.scoreTeamB = scoreTeamB;

        // Event
        BetEdited(msg.sender, tournamentId, matchId);
    }

    //user request for payout
    function getPayout(uint tournamentId, uint matchId) public payable{
        // todo - figure out how to tell the back end to check
        // todo - look into breaking apart the processing on the back end
        
		//todo - validate that user can't call this multiple times
		bool winner = isWinner(tournamentId, matchId);
		require(winner);
		if(winner){
			uint prize = getMatchPrize(tournamentId, matchId);
			uint numWinners = getNumberOfWinners(tournamentId,matchId);
			uint payout = prize / numWinners;
			if(this.balance<payout){
				msg.sender.send(this.balance);	 //switch to transfer		
				InsufficientBalance(msg.sender, tournamentId, matchId, this.balance);
			}else{
				msg.sender.send(payout);  //switch to transfer	
				RequestedPayout(msg.sender, tournamentId, matchId, payout);
			}
		}
    }

    // Give a specific user the payout deserved
    // Todo - Backend will check isWinner, getMatchPrize, getNumberOfWinners based on the address, tournamedid and matchid from getPayout event
    // Todo we can even move the division outside of the blockchain and make it even more gas efficient
    function giveUserPayout(address user, uint prize, uint numWinners) public onlyOwner{
        require(sendTo(user, prize / numWinners));
    }

    /**
    *  Player Functions
    *  Data read (no gas fees)
    **/

    // Gets how many winners are available
    function getNumberOfWinners(uint tournamentId, uint matchId) public view returns(uint){
        var (t,m) = getTournamentMatch(tournamentId, matchId);
        require(m.scoreTeamA>=0&&m.scoreTeamB>=0); // match closed
        uint numWinners = 0;
        for (uint userId= INITIAL_ID; userId < t.nextUserId; userId++) {
            if(isWinner(tournamentId, matchId, userId)){
                numWinners++;
            }
        }
        return numWinners;
    }

    //returns array of winners userIds
    function getWinners(uint tournamentId, uint matchId) public view returns(uint[] ){ //todo investigate more efficient ways
        var (t,m) = getTournamentMatch(tournamentId, matchId);
        require(m.scoreTeamA>=0&&m.scoreTeamB>=0);
        uint numWinners = getNumberOfWinners(tournamentId, matchId);
        uint[] memory winners = new uint[](numWinners);
        uint index = 0;
        for (uint userId= INITIAL_ID; userId < t.nextUserId; userId++) {
            if(isWinner(tournamentId, matchId, userId)){
                winners[index++] = userId;
            }
        }
        return winners;
    }


    //Returns Tournament by id
    function getTournament(uint tournamentId) public view returns(uint id,uint nextMatchId, uint nextUserId){
        Tournament storage t = tournaments[tournamentId];
        require(t.id>0 && t.id<nextTournamentId);
        return (t.id,t.nextMatchId-1,t.nextUserId-1);
    }
    
    //Returns total Tournament prize amount
    function getMatchPrize(uint tournamentId, uint matchId) public view returns (uint prize){
        var (,m) = getTournamentMatch(tournamentId, matchId);

        if (m.cancelled)
            return 0;
        else
            return (m.priceWei - m.devFeeWei) * m.players;
    }

    // Checks the Bet status of a match for a specific user
    function getBetScores(uint tournamentId, uint matchId) public view returns (int scoreTeamA, int scoreTeamB){
        var (,,b) = getTournamentMatchBet(tournamentId,matchId);
        return (b.scoreTeamA, b.scoreTeamB);
    }
    
    // Gets winner status depending on users bets
    function isWinner(uint tournamentId, uint matchId) public view returns(bool){
        var (,m,b) = getTournamentMatchBet(tournamentId,matchId);
        if(b.scoreTeamA==m.scoreTeamA && b.scoreTeamB==m.scoreTeamB){
            return true;
        }
        return false;
    }

    // Gets a specific match for a specific tournament
    function getMatch(uint tournamentId, uint matchId) public view returns(uint, uint, uint, uint, uint, bool, int, int, uint){
        Tournament storage t = tournaments[tournamentId];
        Match storage m = t.matches[matchId];
        require(t.id>0 && t.id<nextTournamentId && m.id>0 && m.id<t.nextMatchId );
        return (m.id, m.priceWei, m.players, m.idTeamA, m.idTeamB, m.cancelled, m.scoreTeamA, m.scoreTeamB, m.devFeeWei);
    }
    
    /**
     *  Private Functions
     **/
     
     //get tournament and match touple
     function getTournamentMatch(uint tournamentId, uint matchId)private view returns(Tournament storage, Match storage){
        Tournament storage t = tournaments[tournamentId];
        Match storage m = t.matches[matchId];
        require(t.id>0 && t.id<nextTournamentId && m.id>0 && m.id<t.nextMatchId );
        return (t,m);
     }
     
     //get tournament and match touple
     function getTournamentMatchBet(uint tournamentId, uint matchId, uint userId)private view returns(Tournament storage, Match storage, Bet storage){
        var (t,m) = getTournamentMatch(tournamentId,matchId);
        require( userId>0 && userId<t.nextUserId);
        return (t,m,m.bets[userId]);
     }
     
     //get tournament and match touple
     function getTournamentMatchBet(uint tournamentId, uint matchId)private view returns(Tournament storage, Match storage, Bet storage){
        var (t,m) = getTournamentMatch(tournamentId,matchId);
        uint userId = t.userIds[msg.sender];
        require( userId>0 && userId<t.nextUserId);
        return (t,m,m.bets[userId]);
     }

    //get tournament and match touple
    function getTournamentMatchBet(uint tournamentId, uint matchId, address userAddress)private view returns(Tournament storage, Match storage, Bet storage){
        var (t,m) = getTournamentMatch(tournamentId,matchId);
        uint userId = t.userIds[userAddress];
        require( userId>0 && userId<t.nextUserId);
        return (t,m,m.bets[userId]);
    }

    // Gets winner status depending on users bets
    function isWinner(uint tournamentId, uint matchId, uint userId) private view returns(bool){
        var (,m,b) = getTournamentMatchBet(tournamentId,matchId,userId);
        if(b.scoreTeamA==m.scoreTeamA && b.scoreTeamB==m.scoreTeamB){
            return true;
        }
        return false;
    }

    // Gets winner status depending on users bets
    function isWinner(uint tournamentId, uint matchId, address userAddress) private view returns(bool){
        var (,m,b) = getTournamentMatchBet(tournamentId,matchId,userAddress);
        if(b.scoreTeamA==m.scoreTeamA && b.scoreTeamB==m.scoreTeamB){
            return true;
        }
        return false;
    }
    
    function sendTo(address receiver, uint amount) private returns(bool){
        if (amount == 0  ){ // TODO: for production add: || receiver == address(this)
            return false;
        }else{
            return receiver.send(amount);
        }
    }

}