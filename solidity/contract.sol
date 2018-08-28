pragma solidity ^0.4.0;
contract Winner {
    
    string winner = "no winner yet";
    string betWinner = "no bet";
    uint256 betAmount= 0;
    int numberOfPlayers = 0;
    mapping(address => bool) isPlayer;
    address[] PlayerAddresses; 
    uint256 gameIndex = 0;
    
    constructor() public payable{
    }
    
    event WinnerIs(
        address indexed _winnerAddress,
        address indexed _loserAddress,
        uint256 indexed _gameIndex,
        uint256 _betAmount
        );
    
    function BuyIn() public payable {
        if(PlayerAddresses.length < 2){
            isPlayer[msg.sender] = true;
            PlayerAddresses.push(msg.sender);
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
    
    function ClaimBet(bool _isX) public {
        require(isPlayer[msg.sender]);
        emit WinnerIs(
            PlayerAddresses[_isX ? 1 : 0], 
            PlayerAddresses[!_isX ? 1 : 0], 
            gameIndex, betAmount
            );
        msg.sender.transfer(betAmount);
        betAmount = 0;
        delete PlayerAddresses;
        gameIndex += 1;
    }
}