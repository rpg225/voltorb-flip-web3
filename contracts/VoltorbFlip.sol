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

    constructor() Ownable(msg.sender){
        
    }

}