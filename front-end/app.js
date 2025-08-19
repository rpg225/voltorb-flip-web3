// =============================================================================
//  Web3 Voltorb Flip - app.js (Client-side gameplay)
// =============================================================================

// This is the main entry point. It waits for the HTML to be fully loaded before running any code.
let currentAccount = null;
let isGameOver = false;
let gameBoard = []; // Client-side game board
let currentScore = 1;

window.addEventListener('DOMContentLoaded', () => {
    
    // --- CONTRACT CONFIGURATION ---
    const contractAddress = "0xB68698d6821C53b9174967Da22b7d3986476CE47";
    const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "finalScore",
          "type": "uint256"
        }
      ],
      "name": "GameOver",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "GameStarted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "finalScore",
          "type": "uint256"
        }
      ],
      "name": "GameWon",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "tileIndex",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "tileValue",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newScore",
          "type": "uint256"
        }
      ],
      "name": "TileFlipped",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint8",
          "name": "_tileIndex",
          "type": "uint8"
        }
      ],
      "name": "flipTile",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_player",
          "type": "address"
        }
      ],
      "name": "getBoard",
      "outputs": [
        {
          "internalType": "uint8[25]",
          "name": "",
          "type": "uint8[25]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "playerGames",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "currentScore",
          "type": "uint256"
        },
        {
          "internalType": "enum VoltorbFlip.GameStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "voltorbsRemaining",
          "type": "uint8"
        },
        {
          "internalType": "uint8",
          "name": "coinsRemaining",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "startGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

    // --- GLOBAL STATE ---
    let currentAccount = null;
    let isGameOver = false;

    // --- DOM ELEMENT REFERENCES ---
    const walletConnectionDiv = document.getElementById('wallet-connection');
    const gameControls = document.getElementById('game-controls');
    const boardContainer = document.getElementById('game-board-container');
    const gameInfo = document.getElementById('game-info');
    
    // --- GAME LOGIC FUNCTIONS ---
    
    const generateGameBoard = () => {
        // Create a 5x5 board (25 tiles)
        const board = new Array(25).fill(0);
        
        // Place 5 Voltorbs (value 0) randomly
        const voltorbPositions = [];
        while (voltorbPositions.length < 5) {
            const pos = Math.floor(Math.random() * 25);
            if (!voltorbPositions.includes(pos)) {
                voltorbPositions.push(pos);
                board[pos] = 0; // 0 represents Voltorb
            }
        }
        
        // Fill remaining positions with coins (1, 2, or 3)
        for (let i = 0; i < 25; i++) {
            if (!voltorbPositions.includes(i)) {
                // Weight the distribution: more 1s, fewer 2s and 3s
                const rand = Math.random();
                if (rand < 0.6) board[i] = 1;
                else if (rand < 0.85) board[i] = 2;
                else board[i] = 3;
            }
        }
        
        return board;
    };
    
    const checkWinCondition = () => {
        // Check if all non-Voltorb tiles have been revealed
        const tiles = document.querySelectorAll('.tile');
        let allCoinsRevealed = true;
        
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            const boardValue = gameBoard[i];
            
            if (boardValue !== 0 && tile.classList.contains('hidden')) {
                allCoinsRevealed = false;
                break;
            }
        }
        
        return allCoinsRevealed;
    };

    // --- WEB3 & CONTRACT INTERACTION (Only for game start/end) ---

    const connectWallet = async () => {
        try {
            if (!window.ethereum) return alert("Please install MetaMask.");
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            handleAccountsChanged(accounts);
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Error connecting wallet.");
        }
    };

    const startGame = async () => {
        if (!currentAccount) return alert("Please connect your wallet first.");
        if (typeof window.ethers === 'undefined') return alert('Ethers.js not loaded. Please refresh.');

        isGameOver = false;
        console.log("Starting a new game...");
        try {
            const provider = new window.ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new window.ethers.Contract(contractAddress, contractABI, signer);

            // Send blockchain transaction to start game
            const tx = await contract.startGame();
            isGameOver = false;
            
            boardContainer.innerHTML = `<p class="placeholder-text">Starting new game on blockchain... please wait.</p>`;
            
            await tx.wait();
            
            // Generate client-side game board
            gameBoard = generateGameBoard();
            currentScore = 1;
            updateScore(currentScore);
            
            console.log("Game started! Transaction hash:", tx.hash);
            console.log("Generated board:", gameBoard);
            alert("New game started! Start flipping tiles.");
            renderBoard();
        } catch (error) {
            console.error("Error starting game:", error);
            alert("An error occurred while starting a new game.");
            updateUI();
        }
    };

    const endGame = async (won, finalScore) => {
        if (!currentAccount || typeof window.ethers === 'undefined') return;
        
        try {
            const provider = new window.ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new window.ethers.Contract(contractAddress, contractABI, signer);

            console.log(`Game ended. Won: ${won}, Final Score: ${finalScore}`);
            
            // If player won, show prize claim option
            if (won) {
                showPrizeClaimUI(finalScore);
            }
            
        } catch (error) {
            console.error("Error ending game on blockchain:", error);
        }
    };

    const showPrizeClaimUI = (finalScore) => {
        // Calculate prize based on score (you can adjust this formula)
        const prizeAmount = calculatePrize(finalScore);
        
        // Show claim button in game controls
        gameControls.innerHTML = `
            <div class="prize-claim">
                <h3>🎉 Congratulations! You Won!</h3>
                <p>Final Score: ${finalScore}</p>
                <p>Prize: ${prizeAmount} ETH</p>
                <button id="claimPrizeBtn">Claim Prize</button>
                <button id="playAgainBtn">Play Again</button>
            </div>
        `;
        
        document.getElementById('claimPrizeBtn').addEventListener('click', () => claimPrize(finalScore));
        document.getElementById('playAgainBtn').addEventListener('click', startGame);
    };

    const calculatePrize = (score) => {
        // Simple prize calculation - you can make this more sophisticated
        // For testing on Sepolia, using small amounts
        if (score >= 1000) return "0.001"; // High score bonus
        if (score >= 500) return "0.0005";
        if (score >= 100) return "0.0002";
        return "0.0001"; // Minimum prize for completing the board
    };

    const claimPrize = async (finalScore) => {
        if (!currentAccount || typeof window.ethers === 'undefined') return;
        
        try {
            const provider = new window.ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new window.ethers.Contract(contractAddress, contractABI, signer);

            // Disable the claim button to prevent double-clicking
            const claimBtn = document.getElementById('claimPrizeBtn');
            claimBtn.disabled = true;
            claimBtn.innerHTML = 'Claiming...';

            // Call smart contract method to claim prize
            // This assumes your contract has a claimPrize(uint256 score) function
            const tx = await contract.claimPrize(finalScore);
            
            console.log("Prize claim transaction sent:", tx.hash);
            alert(`Prize claim submitted! Transaction: ${tx.hash.substring(0, 10)}...`);
            
            // Wait for confirmation
            await tx.wait();
            
            console.log("Prize claimed successfully!");
            alert("🎉 Prize claimed successfully! Check your wallet.");
            
            // Reset UI for new game
            gameControls.innerHTML = `<button id="startGameBtn">New Game</button>`;
            document.getElementById('startGameBtn').addEventListener('click', startGame);
            
        } catch (error) {
            console.error("Error claiming prize:", error);
            alert(`Error claiming prize: ${error.reason || error.message}`);
            
            // Re-enable the claim button on error
            const claimBtn = document.getElementById('claimPrizeBtn');
            if (claimBtn) {
                claimBtn.disabled = false;
                claimBtn.innerHTML = 'Claim Prize';
            }
        }
    };

    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            currentAccount = null;
        } else if (accounts[0] !== currentAccount) {
            currentAccount = accounts[0];
        }
        updateUI();
    };

    const checkIfWalletIsConnected = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                handleAccountsChanged(accounts);
            } catch (error) {
                console.error("Error checking for connected wallet:", error);
            }
        }
    };

    // --- UI RENDERING ---

    const updateUI = () => {
        if (currentAccount) {
            const formattedAddress = `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;
            walletConnectionDiv.innerHTML = `
                <div class="wallet-info">
                    <p>Connected</p>
                    <p class="address">${formattedAddress}</p>
                </div>`;
            
            gameControls.innerHTML = `<button id="startGameBtn">New Game</button>`;
            document.getElementById('startGameBtn').addEventListener('click', startGame);
            
            gameInfo.innerHTML = `<p class="score-display">Score: <span id="score">0</span></p>`;

            boardContainer.innerHTML = `<p class="placeholder-text">Click "New Game" to start!</p>`;
            
        } else {
            walletConnectionDiv.innerHTML = `<button id="connectWalletBtn">Connect Wallet</button>`;
            document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
            gameControls.innerHTML = '';
            boardContainer.innerHTML = `<p class="placeholder-text">Please connect your wallet to begin.</p>`;
            gameInfo.innerHTML = '';
        }
    };

    const renderBoard = () => {
        if (!boardContainer) return;
        let boardHTML = '<div class="game-board">';
        for (let i = 0; i < 25; i++) {
            boardHTML += `<div class="tile hidden" data-index="${i}">?</div>`;
        }
        boardHTML += '</div>';
        boardContainer.innerHTML = boardHTML;

        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.addEventListener('click', handleTileClick);
        });
    };

    // --- CLIENT-SIDE TILE CLICKING (No blockchain interaction) ---
    const handleTileClick = async (event) => {
        
        if (isGameOver) {
            console.log("Game is Over. Please start a new game");
            return;
        }
        
        const tileIndex = parseInt(event.target.dataset.index);
        if (isNaN(tileIndex) || tileIndex < 0 || tileIndex >= 25) return;

        console.log(`Flipping tile index: ${tileIndex}`);

        const tile = event.target;
        
        // Prevent double-clicking the same tile
        if (!tile.classList.contains('hidden')) return;
        
        // Get the value from our client-side board
        const tileValue = gameBoard[tileIndex];
        
        // Update the tile UI immediately (no blockchain delay!)
        tile.classList.remove('hidden');
        
        if (tileValue === 0) {
            // Hit a Voltorb - game over!
            tile.classList.add('voltorb');
            tile.innerHTML = `<img src="img/voltorb.png" alt="Voltorb" style="width: 60px; height: 60px;">`;
            isGameOver = true;
            
            console.log(`Game Over! Hit Voltorb at position ${tileIndex}`);
            alert("Boom! You hit a Voltorb. Game Over!");
            
            // Record game end on blockchain
            endGame(false, currentScore);
            
            // Reveal the whole board
            revealBoard();
            
        } else {
            // Hit a coin!
            tile.classList.add(`value-${tileValue}`);
            tile.innerHTML = tileValue;
            
            // Update score (multiply by coin value)
            currentScore *= tileValue;
            updateScore(currentScore);
            
            console.log(`Success! Flipped coin value: ${tileValue}, New score: ${currentScore}`);
            
            // Check if player won (all coins revealed)
            if (checkWinCondition()) {
                isGameOver = true;
                console.log(`You Won! Final score: ${currentScore}`);
                alert("Congratulations! You found all the coins!");
                
                // Record game win on blockchain
                endGame(true, currentScore);
                
                revealBoard();
            }
        }
    };

    // --- INITIALIZATION ---
    function initialize() {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
        }
        updateUI();
        checkIfWalletIsConnected();
    }

    initialize();

    const updateScore = (newScore) => {
        console.log("Updating score display to:", newScore.toString());
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.innerText = newScore.toString();
        } else {
            console.error("Could not find score element");
        }
    };
    
});

// --- CLIENT-SIDE BOARD REVEAL ---
const revealBoard = () => {
    console.log("Revealing the rest of the board...");
    
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach((tile, index) => {
        // Remove click listeners and disable interaction
        tile.removeEventListener('click', handleTileClick);
        tile.style.cursor = 'default';
        tile.style.pointerEvents = 'none';

        // Reveal hidden tiles
        if (tile.classList.contains('hidden')) {
            tile.classList.remove('hidden');
            const tileValue = gameBoard[index];
            
            if (tileValue === 0) {
                tile.classList.add('voltorb');
                tile.innerHTML = `<img src="img/voltorb.png" alt="Voltorb">`;
            } else {
                tile.classList.add(`value-${tileValue}`);
                tile.innerHTML = tileValue;
            }
        }
    });
};