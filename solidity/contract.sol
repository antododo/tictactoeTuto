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
    }

    function GetBet() public view returns(uint256){
        return betAmount;
    }
    
    function BettingResult() public payable {
        if(isPlayer[msg.sender] == true){
            msg.sender.transfer(betAmount);
            betAmount = 0;
            numberOfPlayers = 0;
        }

    }
}