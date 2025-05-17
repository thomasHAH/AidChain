// Import JSDOM to simulate browser environment
const { JSDOM } = require('jsdom');
const { expect } = require("chai");

// Set up the DOM environment before running tests
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost/',
  referrer: 'http://localhost/',
  contentType: 'text/html',
  includeNodeLocations: true,
  storageQuota: 10000000
});

// Define global browser objects
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.mockStorage = {};

// Mock localStorage
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, value) => { mockStorage[key] = value; }
};

// Mocking jasmine's spyOn function for Mocha/Chai environment
global.spyOn = (obj, method) => {
  const original = obj[method];
  return {
    and: {
      callFake: fn => {
        obj[method] = fn;
        return { original };
      }
    }
  };
};

// Mocking Web3 and Ethereum
class MockWeb3 {
  constructor() {
    this.eth = {
      getAccounts: async () => ['0x1234567890123456789012345678901234567890'],
      getChainId: async () => '0x1'
    };
    this.utils = {
      fromWei: (val, unit) => parseFloat(val) / 1e18,
      toWei: (val, unit) => parseFloat(val) * 1e18
    };
  }
}

class MockContract {
  constructor(abi, address) {
    this.abi = abi;
    this.address = address;
    this.methods = {};
    
    // Default methods for testing
    this.methods.reliefAgency = () => ({
      call: async () => '0x1234567890123456789012345678901234567890'
    });
    
    this.methods.tokenIdCounter = () => ({
      call: async () => '5'
    });
    
    this.methods.minDonation = () => ({
      call: async () => '13000000000000000' // 0.013 ETH
    });
    
    this.methods.donationThreshold = () => ({
      call: async () => '320000000000000000' // 0.32 ETH
    });
    
    this.methods.currentTokenBalance = () => ({
      call: async () => '160000000000000000' // 0.16 ETH
    });
    
    this.methods.isTokenIssued = (tokenId) => ({
      call: async () => tokenId < 5 // Tokens 0-4 are issued
    });
    
    this.methods.getTransferTeam = (tokenId) => ({
      call: async () => tokenId < 3 ? '0x2222222222222222222222222222222222222222' : '0x0000000000000000000000000000000000000000'
    });
    
    this.methods.getGroundRelief = (tokenId) => ({
      call: async () => tokenId < 3 ? '0x3333333333333333333333333333333333333333' : '0x0000000000000000000000000000000000000000'
    });
    
    this.methods.getRecipient = (tokenId) => ({
      call: async () => tokenId < 3 ? '0x4444444444444444444444444444444444444444' : '0x0000000000000000000000000000000000000000'
    });
    
    this.methods.getAidStatusString = (tokenId) => ({
      call: async () => {
        if (tokenId === '0') return 'Claimed';
        if (tokenId === '1') return 'Delivered';
        if (tokenId === '2') return 'InTransit';
        return 'Issued';
      }
    });
    
    this.methods.getLocation = (address) => ({
      call: async () => {
        if (address === '0x4444444444444444444444444444444444444444') return 'FIJI';
        if (address === '0x5555555555555555555555555555555555555555') return 'SAMOA';
        if (address === '0x6666666666666666666666666666666666666666') return 'VANUATU';
        return '';
      }
    });
    
    this.methods.getAllTransporters = () => ({
      call: async () => ['0x2222222222222222222222222222222222222222', '0x7777777777777777777777777777777777777777']
    });
    
    this.methods.getAllGroundRelief = () => ({
      call: async () => ['0x3333333333333333333333333333333333333333', '0x8888888888888888888888888888888888888888']
    });
    
    this.methods.getAllRecipients = () => ({
      call: async () => ['0x4444444444444444444444444444444444444444', '0x9999999999999999999999999999999999999999']
    });
    
    this.methods.getRole = (address) => ({
      call: async () => {
        if (address === '0x2222222222222222222222222222222222222222') return '1'; // Transporter
        if (address === '0x3333333333333333333333333333333333333333') return '2'; // Ground Relief
        if (address === '0x4444444444444444444444444444444444444444') return '3'; // Recipient
        return '0'; // None
      }
    });
    
    // Add getPastEvents method
    this.getPastEvents = async (eventName, options) => {
      if (eventName === 'AidTokenIssued') {
        return [
          { returnValues: { tokenId: '4', donors: ['0xaaaa'] }, blockNumber: 100 },
          { returnValues: { tokenId: '3', donors: ['0xbbbb', '0xcccc'] }, blockNumber: 90 }
        ];
      }
      else if (eventName === 'Donation') {
        return [
          { returnValues: { tokenId: '4', donor: '0xaaaa', amount: '320000000000000000' }, blockNumber: 100 },
          { returnValues: { tokenId: '3', donor: '0xbbbb', amount: '160000000000000000' }, blockNumber: 90 },
          { returnValues: { tokenId: '3', donor: '0xcccc', amount: '160000000000000000' }, blockNumber: 85 }
        ];
      }
      return [];
    };
  }
}

// Mock window.ethereum for MetaMask
const mockEthereum = {
  isMetaMask: true,
  request: async (params) => {
    if (params.method === 'eth_accounts') {
      return ['0x1234567890123456789012345678901234567890'];
    }
    if (params.method === 'eth_chainId') {
      return '0x1';
    }
    return null;
  },
  on: (event, callback) => { /* Event listeners */ }
};

// Set up the mocks
function setupMocks() {
  // Mock Web3 and Ethereum
  global.Web3 = MockWeb3;
  global.ethereum = mockEthereum;
  
  // Mock DOM elements
  document.body.innerHTML = `
    <div id="userAccount">Not connected</div>
    <div id="currentAccountDisplay">Not connected</div>
    <div id="networkName">Not detected</div>
    <div id="chainId">-</div>
    <div id="connectWallet" style="display: block;"></div>
    <div id="disconnectWallet" style="display: none;"></div>
    <div id="tokenIdCounter">-</div>
    <div id="currentTokenBalance">-</div>
    <div id="notificationContainer"></div>
  `;
  
  // Create app object
  global.app = {
    web3: new MockWeb3(),
    userAccount: null,
    didRegistryContract: null,
    aidTokenContract: null,
    aidTokenHandlerContract: null,
    tokenLocations: new Map(),
    allTokenData: [],
    allAssignmentTokens: [],
    visibleTokenCount: 8,
    visibleAssignmentTokenCount: 8,
    currentLocationFilter: '',
    currentAssignmentFilter: 'unassigned'
  };
  // Make app available in window context too
  window.app = global.app;
}

