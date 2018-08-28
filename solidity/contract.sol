pragma solidity ^0.4.0;
contract Winner {
    
    uint256 betAmount= 0;
    uint256 numberOfPlayers = 0;
    mapping(address => bool) isPlayer;
    address[] public playerAddresses; 
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
        //if(playerAddresses.length < 2){
        if(numberOfPlayers < 2){
            isPlayer[msg.sender] = true;
            playerAddresses.push(msg.sender);
            betAmount += msg.value;
            numberOfPlayers += 1;
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
            //playerAddresses[_isX ? 1 : 0], 
            //playerAddresses[!_isX ? 1 : 0],
            playerAddresses[0],
            playerAddresses[1],
            gameIndex, 
            betAmount
            );
        
        msg.sender.transfer(betAmount);
        betAmount = 0;
        delete playerAddresses;
        numberOfPlayers = 0;
        gameIndex += 1;
    }
}