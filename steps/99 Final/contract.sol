pragma solidity ^0.4.24;

/// @title A (very) simple betting contract for a Tictactoe game
/// @author P2PMTL
/// @notice This contract is for demo only
/// @dev This contract is not really safe - lot of flaws 
contract Winner {
    
    // The current bet amount
    uint256 betAmount= 0;
    // The number of players
    uint256 numberOfPlayers = 0;
    // The mapping to know if an user (address) is a player
    mapping(address => bool) isPlayer;
       

    /// @notice Enable a player to Buy In the Tictactoe game
    /// @dev String comparison may be inefficient
    function BuyIn() public payable {
        // A user need to send 3 ETH to Buy In
        require(msg.value == 3000000000000000000, "Need 3ETH");
        // A user can Buy In only if there is less then 2 players
        require(numberOfPlayers < 2, "Need 2 players");

        // Adding the user to Player
        isPlayer[msg.sender] = true;
        // Increase the bet amount with the value sent
        betAmount = betAmount + msg.value;
        // Increase the number of player by 1
        numberOfPlayers = numberOfPlayers + 1;
    }

    /// @notice Getter for betAmount
    /// @return the current bet amount
    function GetBet() public view returns(uint256){
        return betAmount;
    }
    
    /// @notice Transfer bet amount to the winner
    function IfWinner() public {
        // A very basic control: to check if the user is a player
        require(isPlayer[msg.sender] == true, "Sender need to be a player");
        // Transfer to the user (sender) the current bet amount
        msg.sender.transfer(betAmount);
        // Reset the bet amount
        betAmount = 0;
        // Reset the number of player
        numberOfPlayers = 0;
    }
}