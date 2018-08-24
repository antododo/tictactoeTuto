pragma solidity ^0.4.0;
contract Winner {
    
    string winner = "no winner yet";
    string betWinner = "no bet";
    uint numberOfPlayers = 0;
    mapping(address => bool) isPlayer;
    address[] PlayerAddresses; 
    string boardState = "---------";
    uint256 gameIndex;
    
    constructor() public payable{
    }
    
    event BoardChange(
        address indexed _xPlayerAddress,
        address indexed _oPlayerAddress,
        uint256 indexed _gameIndex,
        string _boardState
    );
    
    modifier checkIfPlayer(){
        require(isPlayer[msg.sender]);
        _;
    }
    
    modifier cost(uint value){
        if(msg.value == value){
            _;
        }
        else{
            msg.sender.transfer(msg.value);    
        }
    }
    
    function SetBoardState(string _boardState) checkIfPlayer() public {
        if(numberOfPlayers == 2){
            boardState = _boardState;
            emit BoardChange(
                PlayerAddresses[0], 
                PlayerAddresses[1],
                gameIndex,
                boardState
                );
        }

    }
    
    function GetBoardState() public view returns(string){
        return boardState;
    }
    

    function BuyIn() public payable cost(3 ether) {
        if(numberOfPlayers < 2){
            isPlayer[msg.sender] = true;
            PlayerAddresses.push(msg.sender);
            numberOfPlayers += 1;
        }
        else{
            msg.sender.transfer(msg.value);    
        }
    }

    function GetBet() public view returns(uint256){
        return address(this).balance;
    }
    
    function RecoverBet() public checkIfPlayer() {
        isPlayer[msg.sender] = false;
        msg.sender.transfer(3 ether);
        numberOfPlayers -= 1;
        if(numberOfPlayers == 0){
            gameIndex += 1;
            delete PlayerAddresses;
        }
    } 
    
    function ClaimBet() public checkIfPlayer() {
        msg.sender.transfer(address(this).balance);
        numberOfPlayers = 0;
        delete PlayerAddresses;
        gameIndex += 1;
    }
}