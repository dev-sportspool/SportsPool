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
        uint[] winners;
        
    }
    
    struct Tournament{
        uint id;
        uint lastMatchId;
        mapping (uint => Match) matches;
        uint lastUserId;
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
    uint lastTournamentId = INITIAL_ID;

    /**
     *  Events
     **/

    event TournamentJoined(address indexed _from, uint _value);
    event MatchAdded(uint tournamentId, uint matchId); //FIX ALL: must use address indexed _from, as first value
    event MatchEdited(uint tournamentId, uint matchId);
    event MatchEnded(uint tournamentId, uint matchId);
    event BetAdded(uint tournamentId, uint matchId);
    event BetEdited(uint tournamentId, uint matchId);


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
        tournaments[lastTournamentId] = Tournament({id:lastTournamentId, lastMatchId:INITIAL_ID, lastUserId:INITIAL_ID});
        lastTournamentId++;
    }
    
    //Add match to a tournament
    function addMatch(uint tournamentId, uint teamAId, uint teamBId, uint priceWei, uint devFeeWei) public onlyOwner {
        require(tournamentId>0 && tournamentId<lastTournamentId && priceWei>devFeeWei && teamAId != teamBId);
        // Data Modification
        Tournament storage t = tournaments[tournamentId];
        t.matches[t.lastMatchId] = Match({id:t.lastMatchId, priceWei:priceWei, players:0, cancelled:false, idTeamA:teamAId, idTeamB:teamBId, scoreTeamA:-1, scoreTeamB:-1, devFeeWei:devFeeWei,winners:new uint[](0)});
        t.lastMatchId++;

        // Event
        MatchAdded(tournamentId, t.lastMatchId);
    }
    
    // Edits an existing match
    function editMatch(uint tournamentId, uint matchId, uint teamAId, uint teamBId, bool cancelled) public onlyOwner {
        require( teamAId != teamBId);
        // Data Modification
        var (,m) = getTournamentMatch(tournamentId, matchId);
        require(m.scoreTeamA==-10&&m.scoreTeamB==-1);
        
        m.idTeamA = teamAId;
        m.idTeamB = teamBId;
        m.cancelled = cancelled;

        // Event
        MatchEdited(tournamentId, matchId);
    }
    
    //Set final match scores
    function setMatchScores(uint tournamentId , uint matchId, int scoreTeamA, int scoreTeamB) public onlyOwner{
        // Data Modification
        var (,m) = getTournamentMatch(tournamentId, matchId);
        require(m.scoreTeamA==-1&&m.scoreTeamB==-1);
        
        m.scoreTeamA = scoreTeamA;
        m.scoreTeamB = scoreTeamB;

        // Event
        MatchEnded(tournamentId, matchId);
    }
    
    /**
    *  Player Functions
    *  Data Write (gas fees apply, enusre efficency and validity of data) 
    **/
    // Lets users join tournaments match pool
    function joinTournamentMatch(uint tournamentId, uint matchId) public payable costs(tournaments[tournamentId].matches[matchId].priceWei) {
        var (t,m) = getTournamentMatch(tournamentId,matchId);
        t.userIds[msg.sender] = t.lastUserId;
        ++t.lastUserId;
        m.players++;
        TournamentJoined(msg.sender, msg.value);
    }
    
    //Variation of joinTournamentMatch() with addBet() to save on gas
    function joinTournamentMatchWithBet( uint tournamentId, uint matchId, int scoreTeamA, int scoreTeamB) public payable costs(tournaments[tournamentId].matches[matchId].priceWei){
        require(scoreTeamA>=0 && scoreTeamB>=0);
        
        //todo stop if time is too close to match
        //consider block.timestamp
        var (t,m) = getTournamentMatch(tournamentId,matchId);
        t.userIds[msg.sender] = t.lastUserId;
        m.players++;
        ++t.lastUserId;
        // Event
        TournamentJoined(msg.sender, msg.value);
        
        m.bets[t.lastUserId-1] = Bet({scoreTeamA:scoreTeamA,scoreTeamB:scoreTeamB});
        // Event
        BetAdded(tournamentId, matchId);
    }
    
    //possibly not needed anymore
    // Add Bet to an existing match
    function addBet(uint tournamentId, uint matchId, int scoreTeamA, int scoreTeamB) public {
        require(scoreTeamA>=0 && scoreTeamB>=0);
        //todo stop if time is too close to match
        //consider block.timestamp
        // Data Modification
        var (t,m) = getTournamentMatch(tournamentId,matchId);
        require(m.scoreTeamA>-1&&m.scoreTeamB>-1);//match closed
        m.bets[t.lastUserId] = Bet({scoreTeamA:scoreTeamA,scoreTeamB:scoreTeamB});
        ++t.lastUserId;
        // Event
        BetAdded(tournamentId, matchId);
    }

    // Edit an existing Bet for a given Match
    function editBet(uint tournamentId, uint matchId, int scoreTeamA, int scoreTeamB) public {
        require(scoreTeamA>=0 && scoreTeamB>=0);
        //todo stop if time is too close to match or passed
        //consider block.timestamp
        //todo consider batching externally or consider limiting number of allowed changes
        // Data Modification
        var (,m,b) = getTournamentMatchBet(tournamentId,matchId);
        require(m.scoreTeamA>-1&&m.scoreTeamB>-1);//match closed
        b.scoreTeamA = scoreTeamA;
        b.scoreTeamB = scoreTeamB;

        // Event
        BetEdited(tournamentId, matchId);
    }
    
    //user request for payout
    function getPayout(uint tournamentId, uint matchId) public {
        if(isWinner(tournamentId, matchId)){
            require(sendTo(msg.sender,getMatchPrize(tournamentId,matchId)/getWinners(tournamentId,matchId).length));
        }
    }
    
    //returns array of winners userIds
    function getWinners(uint tournamentId, uint matchId) public returns(uint[] ){ //todo investigate more efficient ways
        var (t,m) = getTournamentMatch(tournamentId, matchId);
        require(m.scoreTeamA>=0&&m.scoreTeamB>=0);
        if(m.winners.length>0)
            return m.winners;
        for (uint userId= INITIAL_ID; userId < t.lastUserId; userId++) {
            if(isWinner(tournamentId, matchId, userId)){
                m.winners.push(userId);
            }
        }
        return m.winners;
    }

    /**
    *  Player Functions
    *  Data read (no gas fees)
    **/

    //Returns Tournament by id
    function getTournament(uint tournamentId) public view returns(uint id,uint lastMatchId, uint lastUserId){
        Tournament storage t = tournaments[tournamentId];
        require(t.id>0 && t.id<lastTournamentId);
        return (t.id,t.lastMatchId-1,t.lastUserId-1);
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

    // Get developer developer fee
    function getDeveloperFee(uint tournamentId, uint matchId)public view returns(uint){
        var (,m) = getTournamentMatch(tournamentId, matchId);
        return m.devFeeWei;
    }
    
    // Gets winner status depending on users bets
    function isWinner(uint tournamentId, uint matchId) public view returns(bool){
        var (,m,b) = getTournamentMatchBet(tournamentId,matchId);
        if(b.scoreTeamA==m.scoreTeamA && b.scoreTeamB==m.scoreTeamB){
            return true;
        }
        return false;
    }
    
    /**
     *  Private Functions
     **/
     
     //get tournament and match touple
     function getTournamentMatch(uint tournamentId, uint matchId)private view returns(Tournament storage, Match storage){
        Tournament storage t = tournaments[tournamentId];
        Match storage m = t.matches[matchId];
        require(t.id>0 && t.id<lastTournamentId && m.id>0 && m.id<t.lastMatchId );
        return (t,m);
     }
     
     //get tournament and match touple
     function getTournamentMatchBet(uint tournamentId, uint matchId, uint userId)private view returns(Tournament storage, Match storage, Bet storage){
        var (t,m) = getTournamentMatch(tournamentId,matchId);
        require( userId>0 && userId<t.lastUserId);
        return (t,m,m.bets[userId]);
     }
     
     //get tournament and match touple
     function getTournamentMatchBet(uint tournamentId, uint matchId)private view returns(Tournament storage, Match storage, Bet storage){
        var (t,m) = getTournamentMatch(tournamentId,matchId);
        uint userId = t.userIds[msg.sender];
        require( userId>0 && userId<t.lastUserId);
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
    
    function sendTo(address receiver, uint amount) private returns(bool){
        if (amount == 0  ){ // TODO: for production add: || receiver == address(this)
            return false;
        }else{
            return receiver.send(amount);
        }
    }

}