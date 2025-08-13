// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VoltorbFlip is Ownable {
    // === Custom Types ===
    enum GameStatus {
        InProgress,
        Won,
        Lost
    }

    struct Game {
        uint8[25] board; // the hidden solution board. 0 = Voltorb, 1-3 = Coins
        bool[25] revealedTiles;
        uint256 currentScore;
        GameStatus status;
        uint8 voltorbsRemaining;
        uint8 coinsRemaining;
    }
    mapping(address => Game) public playerGames;

    // GameStart
    event GameStarted(address indexed player);
    
    // Emitted when a player successfully flips a tile with coins
    event TileFlipped(address indexed player, uint8 tileIndex, uint8 tileValue, uint256 newScore);
    
    // Emitted when a player hits a Voltorb and loses th game
    event GameOver(address indexed player, uint256 finalScore );

    // Emitted when a player finds all the coins and wins
    event GameWon(address indexed player, uint256 finalScore);

    /**
 * @notice Allows a player to flip a tile on their current game board.
 * @param _tileIndex The index of the tile to flip (0-24).
 */

    function flipTile(uint8 _tileIndex) external {
        // Get the player's current game from storage
        Game storage currentGame = playerGames[msg.sender];

        // === Input and State Validations ===
        require(_tileIndex < 25, "Tile index must be between 0 and 24.");

        require(currentGame.status == GameStatus.InProgress, "Game is not in progress.");
        require(!currentGame.revealedTiles[_tileIndex], "Tile has already been revealed.");

        // Mark the tile as revealed
        currentGame.revealedTiles[_tileIndex] = true;

        // Get the value of the tile from the solution board
        uint8 tileValue = currentGame.board[_tileIndex];

        if (tileValue == 0) {
            // Player hit a Voltorb! Game over.
            currentGame.status = GameStatus.Lost;
            currentGame.currentScore = 0; // Score resets to O on loss
            
            emit GameOver(msg.sender, 0);
        } else {
            // Player found coins!
            // Update the score by multiplying with the tile value
            currentGame.currentScore = currentGame.currentScore * tileValue;
            currentGame.coinsRemaining--; // Decrement the count of remaining coins

        // Emit an event to notify the front-end of the successful flip
        emit TileFlipped(msg.sender, _tileIndex, tileValue, currentGame.currentScore);
        
        // Check for a win condition 
        if (currentGame.coinsRemaining == 0) {
            currentGame.status = GameStatus.Won;
            emit GameWon(msg.sender, currentGame.currentScore);
        }

        }
    }

function getBoard(address _player) external view returns (uint8[25] memory) {
    return playerGames[_player].board;
}



    constructor() Ownable(msg.sender){

    }

    function startGame() external {
        Game storage currentGame = playerGames[msg.sender];

        uint8 numVoltorbs = 6;
        uint8 numTwos = 4;
        uint8 numThrees = 2;

        uint8[25] memory tempBoard;
        uint256 i = 0;
        
        // Place Voltorbs (value 0)
        for ( i = 0; i < numVoltorbs; i++){
            tempBoard[i] = 0;
        }

        // Place '2' tiles
        for ( i = numVoltorbs; i < numVoltorbs + numTwos; i++){
            tempBoard[i] = 2;
        }
        // Place '3' tiles
        for ( i = numVoltorbs + numTwos; i < numVoltorbs + numTwos + numThrees;  i++){
            tempBoard[i] = 3;
        }
        // Fill the rest with '1' tiles
        for ( i = numVoltorbs + numTwos + numThrees; i < 25; i++){
            tempBoard[i] = 1;
        }
        // Shuffle the temporary board using the Fisher-Yates algorithm
        for (i = 24; i > 0; i--) {
            uint256 j = _pseudoRandom(i + 1, i) % ( i + 1);
            (tempBoard[i], tempBoard[j]) = (tempBoard[j], tempBoard[i]);
            
        }
        // --- End of Board Generation ---
        currentGame.board = tempBoard;
        delete currentGame.revealedTiles;
        currentGame.currentScore = 1;
        currentGame.status = GameStatus.InProgress;
        currentGame.voltorbsRemaining = numVoltorbs;
        currentGame.coinsRemaining = 25 - numVoltorbs;

        emit GameStarted(msg.sender);
    }
        function _pseudoRandom(uint256 max, uint256 salt) private view returns (uint256) {
      return uint256(keccak256(abi.encodePacked(
          block.timestamp,
          block.prevrandao,
          msg.sender,
          salt 
      ))) % max;
    }


}