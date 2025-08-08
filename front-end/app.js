// -- Contract Configuration

const contractAddress = "0xe63667252fbF4DE5F18b953e19B00CD12c8E002A";

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

let currentAccount = null;
let voltorbFlipContract = null;

// Dom elements reference

const walletConnectionDiv = document.getElementById('wallet-connection');
const gameContainer = document.getElementById('game-container');

// -- Core web3 functions

const connectWallet = async () => {

    try {
        if(!window.ethereum){
            alert("Please install MetaMask to use this Dapp");
            return;
        }

        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        handleAccountsChanged(accounts);

    } catch (error) {
        console.log("Error connecting wallet:", error);
        alert("An error occured while connecting your wallet. Please try again");
    }

};

const startGame = async () => {
    if (!currentAccount) {
        alert("Please connect your wallet first.");
        return;
    }

    // NEW CHECK: Make sure the ethers library is loaded
    if (typeof window.ethers === 'undefined') {
        alert('Ethers.js library not loaded. Please refresh the page.');
        console.error('Ethers.js is not found on the window object');
        return;
    }

    console.log("Starting a new game...");
    try {
        // Use window.ethers to be explicit
        const provider = new window.ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new window.ethers.Contract(contractAddress, contractABI, signer);

        const tx = await contract.startGame();

        gameContainer.innerHTML = `<p class="placeholder-text">Shuffling the board on the blockchain... please wait.</p>`;

        await tx.wait();
        
        console.log("Game started! Transaction hash:", tx.hash);
        alert("New game started! The board is ready.");

        renderBoard();
    
    } catch (error) {
        console.error("Error starting game:", error);
        alert("An error occurred while starting a new game.");
        updateUI(); // Reset UI in case of error
    }

};
/**
 * Handles what happens when accounts change in MetaMask (connect, disconnect, switch).
 * @param {string[]} accounts - An array of account addresses provided by MetaMask.
 */

const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
        console.log('User disconnected.');
        currentAccount = null;
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        console.log('Wallet connected:', currentAccount);
    }
    updateUI(); // Just update the UI
};

/**
 * Initializes the Ethers.js provider, signer, and contract objects.
 */

/**
 * Checks if a wallet is already connected when the page loads.
 */

const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
        try {
            // this method returns accoutns if the site is already authorzed. No popup.
            const accounts = await window.ethereum.request({
                method : 'eth_accounts'
            });
            handleAccountsChanged(accounts);
        } catch (error) {
            console.error("Error checking for connected wallet:", error);
        }
    }
}

// --- UPDATE UI FUNCTION ---

const updateUI = () => {
    if (currentAccount) {
        // --- USER CONNECTED ---
        // format the address for display
        const formattedAddress = `${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`;

        // update the wallet connection div with address.
        walletConnectionDiv.innerHTML = `
         <div class="wallet-info">
            <p> Connected </p>
            <p class="address">${formattedAddress}</p>
         </div>
        `;

        // update the game container
         gameContainer.innerHTML = `
             <div id="game-controls">
            <button id="startGameBtn">
                New Game
            </button>
            </div>
             <div class="" id="game-board-container">
            <!-- the board will be rendered later-->
            <p class="placeholder-text">Click "New Game" to Start!</p>
             </div>
             <div id="game-info">
            <!-- Score and other infor wil go here-->
        </div>
        `;
        // add event listener for the new button.
        document.getElementById('startGameBtn').addEventListener('click', startGame);
        
    } else {
        // USER IS NOT CONNECTED 
        // Update the wallet connection div to show the "Connect Wallet" button
        walletConnectionDiv.innerHTML =`
            <button id="connectWalletBtn">Connect Wallet</button>
        `;
        gameContainer.innerHTML = `
            <p class="placeholder-text"> Please Connect your wallet to begin </p>
        `
        ;
        document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
    }
};

const renderBoard = () => {
    const boardContainer = document.getElementById('game-board-container');
    if (!boardContainer) return;

    let boardHTML = '<div class="game-board">';

    for (let i = 0; i < 25; i++){
        boardHTML += `
            <div class="tile hidden" data-index="${i}">
                ?
            </div>
        `;
    }

    boardHTML += '</div>';
    boardContainer.innerHTML = boardHTML;


    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.addEventListener('click', handleTileClick);
    });
};

const handleTileClick = (event) => {
    const tileIndex = event.target.dataset.index;
    console.log(`Player clicked tile index: ${tileIndex}`);
};

// INIT

const initialize = () => {
    // Set up the listener for account changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    // Set the initial UI to disconnected state
    updateUI();
    // Check if a wallet is already connected and update the UI if it is
    checkIfWalletIsConnected();
};

// Run the app!
initialize();


