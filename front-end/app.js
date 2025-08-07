let currentAccount = null;

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

/**
 * Handles what happens when accounts change in MetaMask (connect, disconnect, switch).
 * @param {string[]} accounts - An array of account addresses provided by MetaMask.
 */

const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
        // user disconnected their account
        console.log('Please connect to MetaMask.');
        currentAccount = null;
        updateUI();
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        console.log('Wallet connected: ', currentAccount);
        updateUI(); // Update the UI to show the address and game board.
    }
};

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
            <p class="placeholder-text">Game board will appear here!</p>
        `;

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
