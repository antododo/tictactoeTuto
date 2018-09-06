pragma solidity ^0.4.0;
contract Winner {
    
    uint256 betAmount= 0;
    int numberOfPlayers = 0;
    mapping(address => bool) isPlayer;
    
    constructor() public payable{
    }    
    
    function BuyIn() public payable {
        require(msg.value == 3000000000000000000, "Need 3ETH");
        require(numberOfPlayers < 2, "Need 2 players");

        isPlayer[msg.sender] = true;
        betAmount = betAmount + msg.value;
        numberOfPlayers = numberOfPlayers + 1;
    }

    function GetBet() public view returns(uint256){
        return betAmount;
    }
    
    function BettingResult() public {
        require(isPlayer[msg.sender] == true, "Sender need to be a player");
        msg.sender.transfer(betAmount);
        betAmount = 0;
        numberOfPlayers = 0;
        

    }
}