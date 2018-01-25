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
    
    struct Bet{
        uint scoreTeamA;
        uint scoreTeamB;
    }
    
    struct Match{
        uint id;
        uint idTeamA;//could be string
        uint idTeamB;//could be string
        int scoreTeamA;//initialized with -1 untill final score is known
        int scoreTeamB;//initialized with -1 untill final score is known
        mapping (address => Bet) bets;
    }
    
    struct Pool{
        uint id;
        uint price;
        uint players;
        mapping (address => bool) registeredAddresses;
        mapping (uint => Match) matches;
        uint lastMatchId;
    }
    
    mapping (uint => Pool) pools;
    uint lastPoolId;
    
    event Join(
        address indexed _from,
        uint _value
    );
    
    function SportsPool() public {
        //todo: setup
    }
    
    // It is important to also provide the
    // `payable` keyword here, otherwise the function will
    // automatically reject all Ether sent to it.
    function join(uint poolId) public payable costs(pools[poolId].price) {
        Pool storage pool = pools[poolId] ;
        pool.registeredAddresses[msg.sender] = true;
        pool.players++;
        Join(msg.sender, msg.value);
    }
    
    //Creates new Pool with entry price
    function addPool(uint price) public onlyOwner{
        pools[lastPoolId] = Pool(lastPoolId,price,0,0);
        lastPoolId++;
    }
    
    //Returns Pool by id
    function getPool(uint poolId) public view returns(uint id,  uint price, uint players){
        Pool storage p = pools[poolId];
        return (p.id, p.price, p.players);
    }
    
    //Returns total Pool prize ammount
    function getPoolPrize(uint poolId) public view returns( uint prize){
        Pool storage p = pools[poolId];
        return p.price* p.players;
    }
    
    //Divide pool funds amongst the winners
    function closePool(uint poolId) public onlyOwner{
        //todo delete pool and pay top players
        //todo event
    }
    
    //Add match to a pool 
    function addMatch(uint poolId, uint teamAId, uint teamBId) public onlyOwner{
        Pool storage p = pools[poolId];
        p.matches[p.lastMatchId] = Match(p.lastMatchId,teamAId,teamBId,-1,-1);
        p.lastMatchId++;
        //todo even
    }
    
    //Set final match scores
    function setMatchScores(uint poolId , uint matchId, int scoreTeamA, int scoreTeamB) public onlyOwner{
        Pool storage p = pools[poolId];
        Match storage m = p.matches[matchId];
        m.scoreTeamA = scoreTeamA;
        m.scoreTeamB = scoreTeamB;
        //what if last match? auto closePool?
        //todo even
    }
    
    function addBet(uint poolId, uint matchId, uint scoreTeamA, uint scoreTeamB)public{
        //todo stop if time is too close to match
        Pool storage p = pools[poolId];
        Match storage m = p.matches[matchId];
        m.bets[msg.sender] = Bet(scoreTeamA,scoreTeamB);
    }
}