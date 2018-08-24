pragma solidity ^0.4.0;
contract Winner {
    
    string winner = "no winner yet";
    string betWinner = "no bet";
    uint256 betAmount= 0;
    int numberOfPlayers = 0;
    mapping(address => bool) isPlayer;
    
    constructor() public payable{
    }
    
    function BuyIn() public payable {
        if(numberOfPlayers < 2){
            isPlayer[msg.sender] = true;
            betAmount = betAmount + msg.value;
            numberOfPlayers = numberOfPlayers + 1;
        }
        else{
            msg.sender.transfer(msg.value);    
        }
    }

    function GetBet() public view returns(uint256){
        return betAmount;
    }
    
    function ClaimBet() public {
        require(isPlayer[msg.sender]);
        msg.sender.transfer(betAmount);
        betAmount = 0;
        numberOfPlayers = 0;
    }
}