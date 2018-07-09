pragma solidity ^0.4.0;
contract Winner {

    string winner = "no winner yet";
    
    function ChangeWinner(string _newWinner) public {
        winner = _newWinner;
    }
    
    function GetWinner() public view returns(string){
        return winner;
    }
}