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
contract SportsPool is owned, mortal, priced{

    /**
     *  Structs
     **/

    struct Bet{
        uint scoreTeamA;
        uint scoreTeamB;
    }
    
    struct Match{
        uint id;
        uint price;
        uint players;
        uint idTeamA;//could be string
        uint idTeamB;//could be string
        bool cancelled;
        int scoreTeamA;//initialized with -1 until final score is known
        int scoreTeamB;//initialized with -1 until final score is known
        mapping (address => Bet) bets;
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
     *  Events
     **/

    event Join(address indexed _from, uint _value);
    event MatchAdded(uint tournamentId, uint matchId);
    event MatchEdited(uint tournamentId, uint matchId);
    event MatchEnded(uint tournamentId, uint matchId);
    event BetAdded(uint tournamentId, uint matchId);
    event BetEdited(uint tournamentId, uint matchId);


    /**
     *  Functions
     **/

    function SportsPool() public {
        //todo: setup
    }
    
    // It is important to also provide the
    // `payable` keyword here, otherwise the function will
    // automatically reject all Ether sent to it.
    function joinTournamentMatch(uint tournamentId, uint matchId) public payable costs(tournaments[tournamentId].matches[matchId].price) {
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
        Tournament storage t = tournaments[tournamentId];
        Match storage m = t.matches[matchId];

        if (m.cancelled)
            return 0;
        else
            return m.price * m.players;
    }
    
    //Divide tournament funds amongst the winners
    function closeTournament(uint tournamentId) public onlyOwner{
        //todo delete tournament or not to keep for history? and pay top players
        //todo event
    }
    
    //Add match to a tournament
    function addMatch(uint tournamentId, uint price, uint teamAId, uint teamBId) public onlyOwner{
        // Data Modification
        Tournament storage t = tournaments[tournamentId];
        t.matches[t.lastMatchId] = Match({id:t.lastMatchId, price:price, players:0, cancelled:false, idTeamA:teamAId, idTeamB:teamBId, scoreTeamA:-1, scoreTeamB:-1});
        t.lastMatchId++;

        // Event
        MatchAdded(tournamentId, t.lastMatchId);
    }

    // Edits an existing match
    function editMatch(uint tournamentId, uint matchId, uint price, uint teamAId, uint teamBId, bool cancelled) public onlyOwner {
        // Data Modification
        Tournament storage p = tournaments[tournamentId];
        Match storage m = p.matches[matchId];
        m.price = price;
        m.idTeamA = teamAId;
        m.idTeamB = teamBId;
        m.cancelled = cancelled;

        // Event
        MatchEdited(tournamentId, matchId);
    }
    
    //Set final match scores
    function setMatchScores(uint tournamentId , uint matchId, int scoreTeamA, int scoreTeamB) public onlyOwner{
        // Data Modification
        Tournament storage t = tournaments[tournamentId];
        Match storage m = t.matches[matchId];
        m.scoreTeamA = scoreTeamA;
        m.scoreTeamB = scoreTeamB;

        // todo - pay users?
        //what if last match? auto closeTournament?

        // Event
        MatchEnded(tournamentId, matchId);
    }

    // Add Bet to an existing match
    function addBet(uint tournamentId, uint matchId, uint scoreTeamA, uint scoreTeamB) public {
        //todo stop if time is too close to match
        // Data Modification
        Tournament storage p = tournaments[tournamentId];
        Match storage m = p.matches[matchId];
        m.bets[msg.sender] = Bet({scoreTeamA:scoreTeamA,scoreTeamB:scoreTeamB});

        // Event
        BetAdded(tournamentId, matchId);
    }

    // Edit an existing Bet for a given Match
    function editBet(uint tournamentId, uint matchId, uint scoreTeamA, uint scoreTeamB) public {
        //todo stop if time is too close to match or passed
        // Data Modification
        Tournament storage p = tournaments[tournamentId];
        Match storage m = p.matches[matchId];
        m.bets[msg.sender].scoreTeamA = scoreTeamA;
        m.bets[msg.sender].scoreTeamB = scoreTeamB;

        // Event
        BetEdited(tournamentId, matchId);
    }

    // Checks the Bet status of a match for a specific user
    function getBet(uint tournamentId, uint matchId) public view returns (uint scoreTeamA, uint scoreTeamB){
        Tournament storage p = tournaments[tournamentId];
        Match storage m = p.matches[matchId];
        return (m.bets[msg.sender].scoreTeamA, m.bets[msg.sender].scoreTeamB);
    }


}