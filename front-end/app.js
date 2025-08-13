

// =============================================================================
//  Web3 Voltorb Flip - app.js
// =============================================================================

// This is the main entry point. It waits for the HTML to be fully loaded before running any code.
let currentAccount = null;
let isGameOver = false;


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
    
    // --- WEB3 & CONTRACT INTERACTION ---

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

            const tx = await contract.startGame();
            isGameOver = false;
            
            boardContainer.innerHTML = `<p class="placeholder-text">Shuffling the board on the blockchain... please wait.</p>`;
            gameInfo.innerHTML = '';
            
            await tx.wait();
            
            console.log("Game started! Transaction hash:", tx.hash);
            alert("New game started! The board is ready.");
            renderBoard();
        } catch (error) {
            console.error("Error starting game:", error);
            alert("An error occurred while starting a new game.");
            updateUI();
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
            
            boardContainer.innerHTML = `<p class="placeholder-text">Click "New Game" to start!</p>`;
            gameInfo.innerHTML = '';
            isGameOver = false;
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

const handleTileClick = async (event) => {
    
    if (isGameOver) {
        console.log("Game is Over. Please start a new game");
        return;
    }
    
    const tileIndex = event.target.dataset.index;
    if (!tileIndex) return; // Exit if the click is not on a valid tile

    console.log(`Attempting to flip tile index: ${tileIndex}`);

    // Prevent user from clicking again while a transaction is in progress
    const tile = event.target;
    tile.style.pointerEvents = 'none'; // Disable clicks on this tile
    tile.innerHTML = '...'; // Show a loading indicator

    try {
        // We need a contract instance with a signer to send a transaction
        const provider = new window.ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new window.ethers.Contract(contractAddress, contractABI, signer);

        // Call the flipTile function on the smart contract
        const tx = await contract.flipTile(tileIndex);
        
        console.log(`Flipping tile ${tileIndex}... Transaction hash: ${tx.hash}`);
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
  
        console.log("Transaction confirmed:", receipt);

        // The smart contract will emit an event (TileFlipped, GameOver, or GameWon).
        // We need to find that event in the transaction receipt to get the result.
        let flippedEvent = receipt.events?.find(e => e.event === 'TileFlipped');
        let gameOverEvent = receipt.events?.find(e => e.event === 'GameOver');
        let gameWonEvent = receipt.events?.find(e => e.event === 'GameWon');

        if (flippedEvent) {
            const { tileValue, newScore } = flippedEvent.args;
            console.log(`Success! Flipped tile was: ${tileValue}, New score: ${newScore}`);
            // Update the tile UI
            tile.classList.remove('hidden');
            tile.classList.add(`value-${tileValue}`);
            tile.innerHTML = tileValue;
            // Update score display (we'll add this UI element next)
            updateScore(newScore);

        } else if (gameOverEvent) {
            const { finalScore } = gameOverEvent.args;
            console.log(`Game Over! Final score: ${finalScore}`);
            // Update the tile UI to show the Voltorb
            tile.classList.remove('hidden');
            tile.classList.add('voltorb');
            tile.innerHTML = '💣'; // or a Voltorb emoji/image
            isGameOver = true;
            alert("Boom! You hit a Voltorb. Game Over!");
            // We should now reveal the whole board
            revealBoard(); // We will create this function

        } else if (gameWonEvent) {
            const { finalScore } = gameWonEvent.args;
            console.log(`You Won! Final score: ${finalScore}`);
            isGameOver = true;
            alert("Congratulations, you found all the coins!");
            revealBoard(); // We will create this function
        }

    } catch (error) {
        console.error(`Error flipping tile ${tileIndex}:`, error);
        alert(`Error: ${error.reason || "An error occurred."}`);
        tile.style.pointerEvents = 'auto'; // Re-enable click on error
        tile.innerHTML = '?'; // Reset tile
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
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.innerText = newScore.toString();
    }
    };
    

});



const revealBoard = async () => {
    console.log("Revealing the rest of the board...");
    if (!currentAccount || typeof window.ethers === 'undefined') return;

    try {
        // We need a provider for read-only calls.
        const provider = new window.ethers.providers.Web3Provider(window.ethereum);
        const contract = new window.ethers.Contract(contractAddress, contractABI, provider);

        // Call the getBoard view function from our smart contract.
        const solutionBoard = await contract.getBoard(currentAccount);
        
        console.log("Solution board fetched:", solutionBoard);

        // Now, update the UI for all tiles.
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach((tile, index) => {
            // Get the value for this specific tile from the solution array
            const tileValue = solutionBoard[index];
            
            // Remove the click listener to make the board inactive.
            tile.removeEventListener('click', handleTileClick);
            tile.style.cursor = 'default';
            tile.style.pointerEvents = 'none'; // Also disable pointer events

            // Update the tile's appearance based on its value.
            // We only update tiles that haven't already been revealed.
            if (tile.classList.contains('hidden')) {
                tile.classList.remove('hidden');
                if (tileValue === 0) {
                    tile.classList.add('voltorb');
                    tile.innerHTML = '💣';
                } else {
                    tile.classList.add(`value-${tileValue}`);
                    tile.innerHTML = tileValue;
                }
            }
        });
    } catch (error) {
        console.error("Error revealing board:", error);
        alert("Could not fetch the final board state.");
    }
};