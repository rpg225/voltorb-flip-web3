// frontend/src/components/WalletConnect.js
'use client';

import { useState, useEffect } from 'react';
// 1. Import Chakra UI components (AlertIcon is REMOVED)
import { Box, Button, Text, Alert } from '@chakra-ui/react';

export default function WalletConnect({ currentAccount, setCurrentAccount }) {
  const [errorMessage, setErrorMessage] = useState(null);

  // Core logic for connecting to wallet (no changes needed here)
  const connectWalletHandler = async () => {
    setErrorMessage(null);
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setCurrentAccount(accounts[0]);
      } catch (error) {
        console.error(error);
        setErrorMessage('Error connecting to MetaMask. Please try again.');
      }
    } else {
      setErrorMessage('Please install MetaMask browser extension to use this DApp.');
    }
  };

  // Core logic for checking connection and handling account changes (no changes needed here)
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setCurrentAccount(accounts[0]);
          }
        } catch (error) {
          console.error('Error checking for connected wallet:', error);
          setErrorMessage('Could not check for connected wallet.');
        }
      }
    };

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
      } else {
        setCurrentAccount(null);
      }
    };

    checkIfWalletIsConnected();
    window.ethereum?.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [setCurrentAccount]);

  // JSX using Chakra UI components
  return (
    <Box textAlign="center" p={4}>
      {currentAccount ? (
        <Box 
          bg="gray.700" 
          borderWidth="1px" 
          borderColor="gray.600" 
          borderRadius="lg" 
          p={3} 
          display="inline-block"
        >
          <Text fontSize="sm" color="gray.400">Connected Account:</Text>
          <Text 
            fontSize="lg" 
            fontFamily="monospace" 
            fontWeight="bold" 
            color="green.300"
          >
            {`${currentAccount.substring(0, 6)}...${currentAccount.substring(currentAccount.length - 4)}`}
          </Text>
        </Box>
      ) : (
        <Button
          onClick={connectWalletHandler}
          colorScheme="blue"
          size="lg"
          _hover={{ transform: 'scale(1.05)' }}
          transition="transform 0.2s"
        >
          Connect Wallet
        </Button>
      )}
      {errorMessage && (
        // 2. The <AlertIcon /> component is REMOVED from here.
        // Chakra's <Alert> component automatically adds an icon based on the 'status' prop.
        <Alert status="error" mt={4} borderRadius="md" variant="subtle">
          {errorMessage}
        </Alert>
      )}
    </Box>
  );
}