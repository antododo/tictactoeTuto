pragma solidity ^0.4.0;
contract Winner {

    string winner = "no winner yet";
    string betWinner = "no bet";
    uint256 betAmount= 0;
    
    constructor() public payable{
    }
    
    function BetOn(string _betWinner) public payable {
        betWinner = _betWinner;
        betAmount = msg.value;
    }
    
    function SetWinner(string _newWinner) public {
        winner = _newWinner;
    }
    
    function GetWinner() public view returns(string){
        return winner;
    }
    
    function GetBet() public view returns(uint256){
        return betAmount;
    }
    
    function BettingResult() public {
        if(keccak256(winner)==keccak256(betWinner)){
            msg.sender.transfer(betAmount);
        }
        else{
            // you Lose
        }
        
    }
}