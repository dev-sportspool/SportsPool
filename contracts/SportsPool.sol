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
    event CostError(
        address indexed _from,
        uint _value
    );
    // Modifiers can receive arguments:
    modifier costs(uint price) {
        if (msg.value == price) {
            _;
        }else{
            CostError(msg.sender, msg.value);
        }
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
    uint percision;
    function fractions(uint decimalPlaces) public {
        percision = decimalPlaces;
    }
    function asFloat(uint num) public view returns(uint){
        return num*10**(percision+1);
    }
    function getPercision() public view returns(uint){
        return percision;
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
        uint lastUserId;
        mapping (address => uint) userIds; //address to userId mapping
        mapping (uint => Bet) bets; //users bets
        
    }
    
    struct Tournament{
        uint id;
        mapping (uint => Match) matches;
        uint lastMatchId;
    }

    /**
     *  Storage
     **/
    
    mapping (uint => Tournament) tournaments;
    uint lastTournamentId;
    
    /**
     *  Constants
     **/
     

    /**
     *  Events
     **/

    event Join(address indexed _from, uint _value);
    event MatchAdded(uint tournamentId, uint matchId);
    event MatchEdited(uint tournamentId, uint matchId);
    event MatchEnded(uint tournamentId, uint matchId);
    event BetAdded(uint tournamentId, uint matchId);
    event BetEdited(uint tournamentId, uint matchId);


    /**
     *  Public Functions
     **/

    function SportsPool()fractions(8) public {
        //todo: setup
    }
    
    // It is important to also provide the
    // `payable` keyword here, otherwise the function will
    // automatically reject all Ether sent to it.
    function joinTournamentMatch(uint tournamentId, uint matchId) public payable costs(tournaments[tournamentId].matches[matchId].priceWei) {
        Tournament storage tournament = tournaments[tournamentId];
        tournament.matches[matchId].players++;
        Join(msg.sender, msg.value);
    }
    
    //Creates new Tournament with entry price
    function addTournament() public onlyOwner{
        tournaments[lastTournamentId] = Tournament({id:lastTournamentId, lastMatchId:0});
        lastTournamentId++;
    }
    
    //figure out what data to ret here
    //Returns Tournament by id
    function getTournament(uint tournamentId) public view returns(uint id){
        Tournament storage t = tournaments[tournamentId];
        return (t.id);
    }
    
    //Returns total Tournament prize amount
    function getMatchPrize(uint tournamentId, uint matchId) public view returns (uint prize){
        Match storage m = getMatch(tournamentId, matchId);

        if (m.cancelled)
            return 0;
        else
            return (m.priceWei - m.devFeeWei) * m.players;
    }
    
    //Add match to a tournament
    function addMatch(uint tournamentId, uint priceWei, uint teamAId, uint teamBId, uint devFeeWei) public onlyOwner {
        //todo validate if devfee is less then priceWei
        //todo validate so that team ids are different?
        // Data Modification
        Tournament storage t = tournaments[tournamentId];
        t.matches[t.lastMatchId] = Match({id:t.lastMatchId, priceWei:priceWei, players:0, cancelled:false, idTeamA:teamAId, idTeamB:teamBId, scoreTeamA:-1, scoreTeamB:-1, devFeeWei:devFeeWei, lastUserId:0});
        t.lastMatchId++;

        // Event
        MatchAdded(tournamentId, t.lastMatchId);
    }

    // Edits an existing match
    function editMatch(uint tournamentId, uint matchId, uint priceWei, uint teamAId, uint teamBId, bool cancelled) public onlyOwner {
        // Data Modification
        Match storage m = getMatch(tournamentId, matchId);
        m.priceWei = priceWei;
        m.idTeamA = teamAId;
        m.idTeamB = teamBId;
        m.cancelled = cancelled;

        // Event
        MatchEdited(tournamentId, matchId);
    }
    
    //Set final match scores
    function setMatchScores(uint tournamentId , uint matchId, int scoreTeamA, int scoreTeamB) public onlyOwner{
        // Data Modification
        Match storage m = getMatch(tournamentId, matchId);
        m.scoreTeamA = scoreTeamA;
        m.scoreTeamB = scoreTeamB;

        // todo - pay users?
        //msg.sender.transfer(getMatchPrize(tournamentId,matchId)/numberOfWinners);
        //-- or maybe we need a function for user to claim their winnings as to avoid auto paying?
        
        //what if last match? auto closeTournament?

        // Event
        MatchEnded(tournamentId, matchId);
    }

    // Add Bet to an existing match
    function addBet(uint tournamentId, uint matchId, int scoreTeamA, int scoreTeamB) public {
        //todo validate scores to be >0
        //todo stop if time is too close to match
        // Data Modification
        Match storage m = getMatch(tournamentId, matchId);
        m.userIds[msg.sender];
        m.bets[m.lastUserId] = Bet({scoreTeamA:scoreTeamA,scoreTeamB:scoreTeamB});
        ++m.lastUserId;
        // Event
        BetAdded(tournamentId, matchId);
    }

    // Edit an existing Bet for a given Match
    function editBet(uint tournamentId, uint matchId, int scoreTeamA, int scoreTeamB) public {
        //todo validate scores to be >0
        //todo stop if time is too close to match or passed
        //todo consider batching externally or consider limiting number of allowed changes
        // Data Modification
        Match storage m = getMatch(tournamentId, matchId);
        uint userId = m.userIds[msg.sender];
        Bet storage b = m.bets[userId];
        b.scoreTeamA = scoreTeamA;
        b.scoreTeamB = scoreTeamB;

        // Event
        BetEdited(tournamentId, matchId);
    }

    // Checks the Bet status of a match for a specific user
    function getBetScores(uint tournamentId, uint matchId) public view returns (int scoreTeamA, int scoreTeamB){
        Bet storage b = getBet(tournamentId, matchId);
        return (b.scoreTeamA, b.scoreTeamB);
    }

    // Get developer developer fee
    function getDeveloperFee(uint tournamentId, uint matchId)public view returns(uint){
        return getMatch(tournamentId, matchId).devFeeWei;
    }
    
    // Gets points for a users bets
    function getPoints(uint tournamentId, uint matchId) public view returns(uint){
        Match storage m = getMatch(tournamentId, matchId);
        Bet storage b =m.bets[m.userIds[msg.sender]];
        uint points = 0;
        if(b.scoreTeamA==m.scoreTeamA){
            ++points;
        }
        if(b.scoreTeamB==m.scoreTeamB){
            ++points;
        }
        if(b.scoreTeamA==m.scoreTeamA && b.scoreTeamB==m.scoreTeamB){
            points+=3;
        }
        return points;
    }
    
    //gets callers rank
    function getRank(uint tournamentId, uint matchId) public view returns(uint){
        //todo: what if match not closed? validate -1 match score?
        Match storage m = getMatch(tournamentId, matchId);
        uint points =getPoints(tournamentId, matchId);
        uint userId = m.userIds[msg.sender];
        uint usersWithMorePoints =0;
        for (uint i = 0; i < m.lastUserId; i++) {
            if(i!=userId){
                uint otherUserPoints = getPoints(tournamentId, matchId, i);
                if(otherUserPoints>points){
                    ++usersWithMorePoints;
                }
            }
        }
        return usersWithMorePoints+1;
    }
    
    /**
     *  Private Functions
     **/
     
     //get match utility function, consider making public
     function getMatch(uint tournamentId, uint matchId)private view returns(Match storage){
        return tournaments[tournamentId].matches[matchId];
     }
     
     //get bet utility function, consider making public
     function getBet(uint tournamentId, uint matchId)private view returns(Bet storage){
         Match storage m = getMatch(tournamentId,matchId);
        return m.bets[m.userIds[msg.sender]];
     }
     
     //get bet utility function, consider making public
     function getBet(uint tournamentId, uint matchId, uint userId)private view returns(Bet storage){
         Match storage m = getMatch(tournamentId,matchId);
        return m.bets[userId];
     }
     
     // Gets points for a users bets
    function getPoints(uint tournamentId, uint matchId, uint userId) private view returns(uint){
        Match storage m = getMatch(tournamentId, matchId);
        Bet storage b =m.bets[userId];
        uint points = 0;
        if(b.scoreTeamA==m.scoreTeamA){ //what if match score is -1 and we cast to uint?
            ++points;
        }
        if(b.scoreTeamB==m.scoreTeamB){
            ++points;
        }
        if(b.scoreTeamA==m.scoreTeamA && b.scoreTeamB==m.scoreTeamB){
            points+=3;
        }
        return points;
    }

}