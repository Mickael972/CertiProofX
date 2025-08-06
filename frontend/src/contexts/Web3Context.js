/**
 * Web3 Context for CertiProof X Frontend
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 *
 * Manages Web3 connection, wallet state, and blockchain interactions
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Contract ABI and addresses (would be imported from separate files)
const CERTIPROOF_ABI = [
  // Main contract functions
  'function mint(address to, string hash, string ipfsURI, string documentType, string title, bool locked) public returns (uint256)',
  'function verifyProofByHash(string hash) public returns (bool exists, uint256 tokenId, bool isActive)',
  'function verifyProofByTokenId(uint256 tokenId) public returns (bool isActive)',
  'function getProofByTokenId(uint256 tokenId) public view returns (tuple(string documentHash, string ipfsURI, address issuer, uint256 timestamp, string documentType, string title, bool isLocked, bool isActive))',
  'function tokenURI(uint256 tokenId) public view returns (string)',
  'function totalSupply() public view returns (uint256)',
  'function ownerOf(uint256 tokenId) public view returns (address)',
  // Events
  'event ProofMinted(uint256 indexed tokenId, string indexed documentHash, string ipfsURI, address indexed issuer, string documentType, string title)',
  'event ProofVerified(uint256 indexed tokenId, address indexed verifier, uint256 timestamp)',
];

// Contract addresses for different networks
const CONTRACT_ADDRESSES = {
  80001: process.env.REACT_APP_CONTRACT_ADDRESS_MUMBAI, // Mumbai testnet
  137: process.env.REACT_APP_CONTRACT_ADDRESS_POLYGON, // Polygon mainnet
  5: process.env.REACT_APP_CONTRACT_ADDRESS_GOERLI, // Goerli testnet
  1: process.env.REACT_APP_CONTRACT_ADDRESS_MAINNET, // Ethereum mainnet
};

// Network configurations
const NETWORKS = {
  80001: {
    name: 'Mumbai',
    displayName: 'Polygon Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    currency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    testnet: true,
  },
  137: {
    name: 'Polygon',
    displayName: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    currency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    testnet: false,
  },
  5: {
    name: 'Goerli',
    displayName: 'Ethereum Goerli Testnet',
    rpcUrl: 'https://goerli.infura.io/v3/' + process.env.REACT_APP_INFURA_ID,
    blockExplorer: 'https://goerli.etherscan.io',
    currency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    testnet: true,
  },
  1: {
    name: 'Ethereum',
    displayName: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/' + process.env.REACT_APP_INFURA_ID,
    blockExplorer: 'https://etherscan.io',
    currency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    testnet: false,
  },
};

// Initial state
const initialState = {
  // Connection state
  isConnected: false,
  isConnecting: false,

  // Wallet information
  account: null,
  balance: null,

  // Network information
  chainId: null,
  network: null,

  // Provider and contract instances
  provider: null,
  signer: null,
  contract: null,

  // Transaction state
  transactions: [],

  // Error state
  error: null,

  // Support status
  isMetaMaskInstalled: false,
  isWeb3Supported: false,
};

// Action types
const WEB3_ACTIONS = {
  SET_CONNECTING: 'SET_CONNECTING',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_DISCONNECTED: 'SET_DISCONNECTED',
  SET_ACCOUNT: 'SET_ACCOUNT',
  SET_BALANCE: 'SET_BALANCE',
  SET_NETWORK: 'SET_NETWORK',
  SET_PROVIDER: 'SET_PROVIDER',
  SET_CONTRACT: 'SET_CONTRACT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  SET_SUPPORT_STATUS: 'SET_SUPPORT_STATUS',
};

// Reducer
const web3Reducer = (state, action) => {
  switch (action.type) {
    case WEB3_ACTIONS.SET_CONNECTING:
      return { ...state, isConnecting: action.payload, error: null };

    case WEB3_ACTIONS.SET_CONNECTED:
      return { ...state, isConnected: true, isConnecting: false, error: null };

    case WEB3_ACTIONS.SET_DISCONNECTED:
      return {
        ...state,
        isConnected: false,
        isConnecting: false,
        account: null,
        balance: null,
        provider: null,
        signer: null,
        contract: null,
      };

    case WEB3_ACTIONS.SET_ACCOUNT:
      return { ...state, account: action.payload };

    case WEB3_ACTIONS.SET_BALANCE:
      return { ...state, balance: action.payload };

    case WEB3_ACTIONS.SET_NETWORK:
      return {
        ...state,
        chainId: action.payload.chainId,
        network: action.payload.network,
      };

    case WEB3_ACTIONS.SET_PROVIDER:
      return {
        ...state,
        provider: action.payload.provider,
        signer: action.payload.signer,
      };

    case WEB3_ACTIONS.SET_CONTRACT:
      return { ...state, contract: action.payload };

    case WEB3_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isConnecting: false };

    case WEB3_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case WEB3_ACTIONS.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case WEB3_ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map((tx) =>
          tx.hash === action.payload.hash ? { ...tx, ...action.payload } : tx
        ),
      };

    case WEB3_ACTIONS.SET_SUPPORT_STATUS:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

// Context
const Web3Context = createContext();

// Provider component
export const Web3Provider = ({ children }) => {
  const [state, dispatch] = useReducer(web3Reducer, initialState);

  // Check Web3 support
  const checkWeb3Support = useCallback(async () => {
    const provider = await detectEthereumProvider();
    const isMetaMaskInstalled = !!provider;
    const isWeb3Supported = typeof window.ethereum !== 'undefined';

    dispatch({
      type: WEB3_ACTIONS.SET_SUPPORT_STATUS,
      payload: { isMetaMaskInstalled, isWeb3Supported },
    });

    return { isMetaMaskInstalled, isWeb3Supported };
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      dispatch({ type: WEB3_ACTIONS.SET_CONNECTING, payload: true });

      const { isMetaMaskInstalled } = await checkWeb3Support();

      if (!isMetaMaskInstalled) {
        throw new Error(
          'MetaMask not installed. Please install MetaMask to continue.'
        );
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }

      // Create provider and signer (Ethers v6)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = accounts[0];

      // Get network information
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const networkConfig = NETWORKS[chainId];

      // Get balance
      const balance = await provider.getBalance(account);

      // Create contract instance
      const contractAddress = CONTRACT_ADDRESSES[chainId];
      let contract = null;

      if (
        contractAddress &&
        contractAddress !== '0x0000000000000000000000000000000000000000'
      ) {
        contract = new ethers.Contract(contractAddress, CERTIPROOF_ABI, signer);
      } else {
        throw new Error(
          `Contract not deployed on network ${chainId}. Please deploy the contract first.`
        );
      }

      // Update state
      dispatch({ type: WEB3_ACTIONS.SET_ACCOUNT, payload: account });
      dispatch({
        type: WEB3_ACTIONS.SET_BALANCE,
        payload: ethers.formatEther(balance),
      });
      dispatch({
        type: WEB3_ACTIONS.SET_NETWORK,
        payload: { chainId, network: networkConfig },
      });
      dispatch({
        type: WEB3_ACTIONS.SET_PROVIDER,
        payload: { provider, signer },
      });
      dispatch({ type: WEB3_ACTIONS.SET_CONTRACT, payload: contract });
      dispatch({ type: WEB3_ACTIONS.SET_CONNECTED });

      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      dispatch({ type: WEB3_ACTIONS.SET_ERROR, payload: error.message });
      toast.error(error.message);
    }
  }, [checkWeb3Support]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    dispatch({ type: WEB3_ACTIONS.SET_DISCONNECTED });
    toast.success('Wallet disconnected');
  }, []);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId) => {
    try {
      const chainIdHex = `0x${targetChainId.toString(16)}`;

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (error) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        const networkConfig = NETWORKS[targetChainId];
        if (networkConfig) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: networkConfig.displayName,
                rpcUrls: [networkConfig.rpcUrl],
                nativeCurrency: networkConfig.currency,
                blockExplorerUrls: [networkConfig.blockExplorer],
              },
            ],
          });
        }
      } else {
        throw error;
      }
    }
  }, []);

  // Add transaction
  const addTransaction = useCallback((transaction) => {
    dispatch({ type: WEB3_ACTIONS.ADD_TRANSACTION, payload: transaction });
  }, []);

  // Update transaction
  const updateTransaction = useCallback((hash, updates) => {
    dispatch({
      type: WEB3_ACTIONS.UPDATE_TRANSACTION,
      payload: { hash, ...updates },
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: WEB3_ACTIONS.CLEAR_ERROR });
  }, []);

  // Event listeners
  useEffect(() => {
    if (window.ethereum) {
      // Account changed
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== state.account) {
          // Reconnect with new account
          connectWallet();
        }
      };

      // Chain changed
      const handleChainChanged = () => {
        // Reload to avoid state inconsistencies
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [state.account, connectWallet, disconnectWallet]);

  // Check initial connection
  useEffect(() => {
    const checkConnection = async () => {
      const { isMetaMaskInstalled } = await checkWeb3Support();

      if (isMetaMaskInstalled && window.ethereum.selectedAddress) {
        connectWallet();
      }
    };

    checkConnection();
  }, [checkWeb3Support, connectWallet]);

  const value = {
    // State
    ...state,

    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    addTransaction,
    updateTransaction,
    clearError,

    // Utilities
    isWrongNetwork: state.chainId && !CONTRACT_ADDRESSES[state.chainId],
    getSupportedNetworks: () =>
      Object.keys(CONTRACT_ADDRESSES)
        .map((id) => NETWORKS[parseInt(id)])
        .filter(Boolean),
    getNetworkConfig: (chainId) => NETWORKS[chainId],
    getExplorerUrl: (hash, type = 'tx') => {
      if (!state.network) return '#';
      return `${state.network.blockExplorer}/${type}/${hash}`;
    },
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Hook to use Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export default Web3Context;
