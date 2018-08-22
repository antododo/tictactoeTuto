pragma solidity ^0.4.0;
contract Winner {
    
    string winner = "no winner yet";
    string betWinner = "no bet";
    int numberOfPlayers = 0;
    mapping(address => bool) isPlayer;
    string boardState = "---------";
    
    constructor() public payable{
    }
    
    event BoardChange(
        address indexed _by
    );
    
    modifier checkIfPlayer(address _sender){
        require(isPlayer[_sender]);
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
    
    function SetBoardState(string _boardState) public checkIfPlayer(msg.sender){
        boardState = _boardState;
        emit BoardChange(msg.sender);
    }
    
    function GetBoardState() public view returns(string){
        return boardState;
    }
    

    function BuyIn() public payable cost(3 ether) {
        if(numberOfPlayers < 2){
            isPlayer[msg.sender] = true;
            numberOfPlayers += 1;
        }
        else{
            msg.sender.transfer(msg.value);    
        }
    }

    function GetBet() public view returns(uint256){
        return address(this).balance;
    }
    
    function RecoverBet() public checkIfPlayer(msg.sender){
        isPlayer[msg.sender] = false;
        msg.sender.transfer(3 ether);
        numberOfPlayers -= 1;
    } 
    
    function ClaimBet() public checkIfPlayer(msg.sender){
        msg.sender.transfer(address(this).balance);
        numberOfPlayers = 0;

    }
}