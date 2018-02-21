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

contract timed {
    // As per white-paper "Check that the timestamp of the block is greater than that of the referenced previous block and less than 15 minutes into the future"
    // We use block.timestamp and a error margin (threshold) of 15min for compare with the betting end time
    uint constant THRESHOLD = 15*60; // Epoch is in seconds

    // Reference:
    // https://github.com/ethereum/wiki/wiki/White-Paper
    // https://ethereum.stackexchange.com/questions/5924/how-do-ethereum-mining-nodes-maintain-a-time-consistent-with-the-network/5926#5926
    // https://ethereum.stackexchange.com/questions/5927/how-would-a-miner-cope-with-a-huge-block-time

    // Modifiers can receive arguments:
    modifier inTime(uint timestamp) {
        require(block.timestamp + THRESHOLD < timestamp);
        _;
    }
}


contract SportsPool is owned, mortal, priced, timed {

    /**
     *  Structs
     **/

    struct Bet{
        int scoreTeamA;
        int scoreTeamB;
        bool paid;
        bool initialized;
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
        uint betEndTime;// Last time we allow user to place a bet
        mapping (uint => Bet) bets; //users bets
    }
    
    struct Tournament{
        uint id;
        uint nextMatchId;
        bool finished;
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
    event PayoutAlreadyPaid(address indexed _from, uint tournamentId, uint matchId);


    /**
     *  Public Functions
     **/
     
        /**
         *  Owner Functions
         **/

    function SportsPool() public {
        //todo: setup
    }
    
    //Creates new Tournament with entry price
    function addTournament() public onlyOwner{
        tournaments[nextTournamentId] = Tournament({id:nextTournamentId, nextMatchId:INITIAL_ID, nextUserId:INITIAL_ID, finished:false});
        nextTournamentId++;
    }
    
    //Add match to a tournament
    function addMatch(uint tournamentId, uint teamAId, uint teamBId, uint priceWei, uint devFeeWei, uint betEndTime) public onlyOwner {
        require(tournamentId>0 && tournamentId<nextTournamentId && !tournaments[tournamentId].finished && priceWei>devFeeWei && teamAId != teamBId && betEndTime > block.timestamp);
        // Data Modification
        Tournament storage t = tournaments[tournamentId];
        t.matches[t.nextMatchId] = Match({id:t.nextMatchId, priceWei:priceWei, players:0, cancelled:false, idTeamA:teamAId, idTeamB:teamBId, scoreTeamA:-1, scoreTeamB:-1, devFeeWei:devFeeWei, betEndTime:betEndTime});
        t.nextMatchId++;

        // Event
        MatchAdded(msg.sender, tournamentId, t.nextMatchId);
    }
    
    // Edits an existing match
    function editMatch(uint tournamentId, uint matchId, uint teamAId, uint teamBId, bool cancelled, uint betEndTime) public onlyOwner {
        require(!tournaments[tournamentId].finished && teamAId != teamBId && betEndTime > block.timestamp);
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
        require(!tournaments[tournamentId].finished);
        // Data Modification
        var (,m) = getTournamentMatch(tournamentId, matchId);
        require(scoreTeamA>-1&&scoreTeamB>-1); //validate new scores
        
        m.scoreTeamA = scoreTeamA;
        m.scoreTeamB = scoreTeamB;

        // Event
        MatchEnded(msg.sender, tournamentId, matchId);
    }

    // Finishes the tournament and cashes out the remaining balance of the contract
    // after the players have received their winnings
    function finishTournament(uint tournamentId) public onlyOwner {
        require(tournamentId>0 && tournamentId<nextTournamentId && !tournaments[tournamentId].finished && this.balance > 0);
        owner.send(this.balance); //switch to transfer
    }
    
    /**
    *  Player Functions
    *  Data Write (gas fees apply, enusre efficency and validity of data) 
    **/
    
    //Variation of joinTournamentMatch() with addBet() to save on gas
    function joinTournamentMatchWithBet( uint tournamentId, uint matchId, int scoreTeamA, int scoreTeamB)
        public payable costs(tournaments[tournamentId].matches[matchId].priceWei)
                       inTime(tournaments[tournamentId].matches[matchId].betEndTime)
    {
        require(scoreTeamA>=0 && scoreTeamB>=0 && !tournaments[tournamentId].matches[matchId].cancelled);

        var (t,m) = getTournamentMatch(tournamentId,matchId);
        uint userId = t.userIds[msg.sender];
        if (userId == 0) {
            t.userIds[msg.sender] = t.nextUserId;
            userId = t.nextUserId;
            ++t.nextUserId;
        }
        m.players++;
        m.bets[userId] = Bet({scoreTeamA:scoreTeamA,scoreTeamB:scoreTeamB,paid:false,initialized:true});

        // Event
        TournamentJoinedWithBet(msg.sender, msg.value, tournamentId, matchId);
    }

    // Edit an existing Bet for a given Match
    function editBet(uint tournamentId, uint matchId, int scoreTeamA, int scoreTeamB)
        public inTime(tournaments[tournamentId].matches[matchId].betEndTime)
    {
        require(scoreTeamA>=0 && scoreTeamB>=0 && !tournaments[tournamentId].matches[matchId].cancelled);

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
        // If match is cancelled there is no payout to give
        require(!tournaments[tournamentId].matches[matchId].cancelled);

		var (winner,paid) = isWinnerAndPaid(tournamentId, matchId);
		require(winner); // If not winner, we don't continue

        // Check if user got paid already
        if (paid) {
            PayoutAlreadyPaid(msg.sender, tournamentId, matchId);
        } else {
            // Prize data
            uint prize = getMatchPrize(tournamentId, matchId);
            uint numWinners = getNumberOfWinners(tournamentId,matchId);
            uint payout = prize / numWinners;

            // Set bet as paid
            var (,,b) = getTournamentMatchBet(tournamentId, matchId);
            b.paid = true;

            // Make the payment
            if (this.balance<payout){
                msg.sender.send(this.balance);	 //switch to transfer
                InsufficientBalance(msg.sender, tournamentId, matchId, this.balance);
            } else {
                msg.sender.send(payout);  //switch to transfer
                RequestedPayout(msg.sender, tournamentId, matchId, payout);
            }
        }
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
    function getWinners(uint tournamentId, uint matchId) public view returns(uint[]) { //todo investigate more efficient ways
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

    // Gets a list of matches for a given tournament
    function getTournamentMatches(uint tournamentId) public view returns (uint[]) {
        Tournament storage t = tournaments[tournamentId];
        require(t.id>0 && t.id<nextTournamentId);
        uint[] memory matches = new uint[](t.nextMatchId-1);
        for (uint matchId = INITIAL_ID; matchId < t.nextMatchId; matchId++) {
            if (!t.matches[matchId].cancelled) {
                matches[matchId] = t.matches[matchId].id;
            }
        }
        return matches;
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
        require(b.initialized);
        return (b.scoreTeamA, b.scoreTeamB);
    }

    // Gets winner status depending on users bets and if the payout was given
    function isWinnerAndPaid(uint tournamentId, uint matchId) public view returns(bool, bool){
        var (,m,b) = getTournamentMatchBet(tournamentId,matchId);
        return (b.initialized && b.scoreTeamA==m.scoreTeamA && b.scoreTeamB==m.scoreTeamB, b.paid);
    }

    // Gets user's bet for a specific match of a specific tournament
    function getMatchBet(uint tournamentId, uint matchId) public view returns(int, int){
        Tournament storage t = tournaments[tournamentId];
        Match storage m = t.matches[matchId];
        uint userId = t.userIds[msg.sender];
        require(t.id>0 && t.id<nextTournamentId && m.id>0 && m.id<t.nextMatchId && m.bets[userId].initialized && userId>0 && userId<t.nextUserId );
        return (m.bets[userId].scoreTeamA, m.bets[userId].scoreTeamB);
    }

    // Gets a specific match of a specific tournament
    function getMatch(uint tournamentId, uint matchId) public view returns(uint, uint, uint, uint, uint, bool, int, int, uint, uint){
        Tournament storage t = tournaments[tournamentId];
        Match storage m = t.matches[matchId];
        require(t.id>0 && t.id<nextTournamentId && m.id>0 && m.id<t.nextMatchId );
        return (m.id, m.priceWei, m.players, m.idTeamA, m.idTeamB, m.cancelled, m.scoreTeamA, m.scoreTeamB, m.devFeeWei, m.betEndTime);
    }

    // Gets time of the last block mined
    // todo consider removing after testing
    function getTime() public view returns (uint) {
        return block.timestamp;
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
        require(userId>0 && userId<t.nextUserId);
        return (t,m,m.bets[userId]);
     }
     
     //get tournament and match touple
     function getTournamentMatchBet(uint tournamentId, uint matchId)private view returns(Tournament storage, Match storage, Bet storage){
        var (t,m) = getTournamentMatch(tournamentId,matchId);
        uint userId = t.userIds[msg.sender];
        require(userId>0 && userId<t.nextUserId);
        return (t,m,m.bets[userId]);
     }

    // Gets winner status depending on users bets
    function isWinner(uint tournamentId, uint matchId, uint userId) private view returns(bool){
        var (,m,b) = getTournamentMatchBet(tournamentId,matchId,userId);
        return (b.initialized && b.scoreTeamA==m.scoreTeamA && b.scoreTeamB==m.scoreTeamB);
    }
}