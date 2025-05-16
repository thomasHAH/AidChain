// Contract ABIs
const didRegistryABI = [
    { "inputs": [{ "internalType": "address", "name": "_reliefAgency", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" },
    { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }, { "internalType": "string", "name": "location", "type": "string" }], "name": "registerTransporterDID", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }, { "internalType": "string", "name": "location", "type": "string" }], "name": "registerGroundReliefDID", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }, { "internalType": "string", "name": "location", "type": "string" }], "name": "registerRecipientDID", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getRole", "outputs": [{ "internalType": "enum DIDRegistry.Role", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getLocation", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getAllTransporters", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getAllGroundRelief", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getAllRecipients", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "dids", "outputs": [{ "internalType": "string", "name": "did", "type": "string" }, { "internalType": "enum DIDRegistry.Role", "name": "role", "type": "uint8" }, { "internalType": "string", "name": "location", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "reliefAgency", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "newReliefAgency", "type": "address" }], "name": "transferReliefAgency", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "enum DIDRegistry.Role", "name": "role", "type": "uint8" }, { "indexed": false, "internalType": "string", "name": "location", "type": "string" }], "name": "RoleRegistered", "type": "event" }
];

const aidTokenABI = [
    { "inputs": [{ "internalType": "address", "name": "_reliefAgency", "type": "address" }, { "internalType": "address", "name": "_didRegistry", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" },
    { "inputs": [], "name": "donate", "outputs": [], "stateMutability": "payable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "address", "name": "transferAddress", "type": "address" }, { "internalType": "address", "name": "groundAddress", "type": "address" }, { "internalType": "address", "name": "recipientAddress", "type": "address" }, { "internalType": "string", "name": "location", "type": "string" }], "name": "assignAidRecipients", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "currentTokenBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "donationThreshold", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "donorBalances", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getTransferTeam", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getGroundRelief", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getRecipient", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "isTokenIssued", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "minDonation", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "reliefAgency", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "tokenIdCounter", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "MAX_TOKENS_PER_TRANSACTION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "indexed": false, "internalType": "address[]", "name": "donors", "type": "address[]" }], "name": "AidTokenIssued", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "donor", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Donation", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "transferTeam", "type": "address" }, { "indexed": false, "internalType": "address", "name": "groundRelief", "type": "address" }, { "indexed": false, "internalType": "address", "name": "recipient", "type": "address" }], "name": "AidTokenAssigned", "type": "event" }
];

const aidTokenHandlerABI = [
    { "inputs": [{ "internalType": "address", "name": "_aidTokenAddress", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" },
    { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "authenticateTransferTeam", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "authenticateGroundRelief", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "claimAid", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getAidStatusString", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]" }], "name": "getTokenStatusBatch", "outputs": [{ "internalType": "string[]", "name": "", "type": "string[]" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "initializeTokenStatus", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "aidStatus", "outputs": [{ "internalType": "enum AidTokenHandler.AidStatus", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "actor", "type": "address" }, { "indexed": false, "internalType": "enum AidTokenHandler.AidStatus", "name": "newStatus", "type": "uint8" }], "name": "AidTransferred", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "TokenStatusInitialized", "type": "event" }
];

// LocalStorage keys
const STORAGE_KEYS = {
    DID_REGISTRY_ADDRESS: 'blockchain_aid_didRegistryAddress',
    AID_TOKEN_ADDRESS: 'blockchain_aid_aidTokenAddress',
    AID_TOKEN_HANDLER_ADDRESS: 'blockchain_aid_aidTokenHandlerAddress',
    NETWORK_ID: 'blockchain_aid_networkId',
    LAST_ACCOUNT: 'blockchain_aid_lastAccount'
};

// Connect to existing contracts
async function connectToContracts() {
    try {
        if (!window.app.web3) {
            const accounts = await window.app.wallet.connectWallet();
            if (!accounts || accounts.length === 0) {
                window.app.ui.showNotification('Please connect your wallet first', 'warning');
                return;
            }
        }

        const existingDIDRegistry = document.getElementById('existingDIDRegistry').value;
        const existingAidToken = document.getElementById('existingAidToken').value;
        const existingAidTokenHandler = document.getElementById('existingAidTokenHandler').value;

        if (!existingDIDRegistry || !existingAidToken || !existingAidTokenHandler) {
            window.app.ui.showNotification('Please enter all contract addresses', 'warning');
            return;
        }

        window.app.ui.showNotification('Connecting to contracts...', 'info');

        try {
            // Connect to DIDRegistry
            window.app.didRegistryAddress = existingDIDRegistry;
            window.app.didRegistryContract = new window.app.web3.eth.Contract(didRegistryABI, window.app.didRegistryAddress);

            // Verify contract is accessible
            await window.app.didRegistryContract.methods.reliefAgency().call();

            // Connect to AidToken
            window.app.aidTokenAddress = existingAidToken;
            window.app.aidTokenContract = new window.app.web3.eth.Contract(aidTokenABI, window.app.aidTokenAddress);

            // Verify contract is accessible
            await window.app.aidTokenContract.methods.reliefAgency().call();

            // Connect to AidTokenHandler
            window.app.aidTokenHandlerAddress = existingAidTokenHandler;
            window.app.aidTokenHandlerContract = new window.app.web3.eth.Contract(aidTokenHandlerABI, window.app.aidTokenHandlerAddress);

            // Update UI elements
            document.getElementById('statusDIDRegistry').textContent = window.app.didRegistryAddress;
            document.getElementById('statusAidToken').textContent = window.app.aidTokenAddress;
            document.getElementById('statusAidTokenHandler').textContent = window.app.aidTokenHandlerAddress;

            // Save contract addresses to localStorage
            saveContractAddresses();

            // Update token info
            refreshContractInfo();

            // Update account role
            await window.app.wallet.updateAccountRole();

            window.app.ui.showNotification('Connected to existing contracts successfully!', 'success');
        } catch (connectionError) {
            console.error('Contract connection error:', connectionError);
            window.app.ui.handleContractError(connectionError);

            // Clear contract references to avoid using partially connected contracts
            window.app.didRegistryContract = null;
            window.app.aidTokenContract = null;
            window.app.aidTokenHandlerContract = null;

            // Provide specific guidance based on the error
            if (connectionError.message && connectionError.message.includes('invalid address')) {
                window.app.ui.showNotification('Invalid contract address provided. Please check the addresses and try again.', 'danger');
            } else {
                window.app.ui.showNotification('Failed to connect to contracts. Check that the addresses are correct and contracts are deployed on this network.', 'danger');
            }
        }
    } catch (error) {
        console.error('Contract connection error:', error);
        window.app.ui.handleContractError(error);
        window.app.ui.showNotification('Failed to connect to contracts: ' + error.message, 'danger');
    }
}

// Load contract addresses from localStorage
function loadContractAddresses() {
    try {
        // Check if we have stored data
        const savedDIDRegistry = localStorage.getItem(STORAGE_KEYS.DID_REGISTRY_ADDRESS);
        const savedAidToken = localStorage.getItem(STORAGE_KEYS.AID_TOKEN_ADDRESS);
        const savedAidTokenHandler = localStorage.getItem(STORAGE_KEYS.AID_TOKEN_HANDLER_ADDRESS);
        const savedNetworkId = localStorage.getItem(STORAGE_KEYS.NETWORK_ID);

        // Only restore if on the same network
        if (savedNetworkId && parseInt(savedNetworkId) === window.app.currentChainId) {
            if (savedDIDRegistry && savedAidToken && savedAidTokenHandler) {
                // Populate input fields
                document.getElementById('existingDIDRegistry').value = savedDIDRegistry;
                document.getElementById('existingAidToken').value = savedAidToken;
                document.getElementById('existingAidTokenHandler').value = savedAidTokenHandler;

                // Set status display
                document.getElementById('statusDIDRegistry').textContent = savedDIDRegistry;
                document.getElementById('statusAidToken').textContent = savedAidToken;
                document.getElementById('statusAidTokenHandler').textContent = savedAidTokenHandler;

                // Show notification
                window.app.ui.showNotification('Loaded saved contract addresses', 'info');

                // Connect to contracts
                connectToContracts();
            }
        } else if (savedNetworkId) {
            window.app.ui.showNotification('Network changed. Saved contracts may not be valid.', 'warning');
        }
    } catch (error) {
        console.error('Error loading contract addresses:', error);
    }
}

// Save contract addresses to localStorage
function saveContractAddresses() {
    try {
        if (window.app.currentChainId && window.app.didRegistryAddress && window.app.aidTokenAddress && window.app.aidTokenHandlerAddress) {
            localStorage.setItem(STORAGE_KEYS.DID_REGISTRY_ADDRESS, window.app.didRegistryAddress);
            localStorage.setItem(STORAGE_KEYS.AID_TOKEN_ADDRESS, window.app.aidTokenAddress);
            localStorage.setItem(STORAGE_KEYS.AID_TOKEN_HANDLER_ADDRESS, window.app.aidTokenHandlerAddress);
            localStorage.setItem(STORAGE_KEYS.NETWORK_ID, window.app.currentChainId.toString());

            window.app.ui.showNotification('Contract addresses saved to browser storage', 'success');
        }
    } catch (error) {
        console.error('Error saving contract addresses:', error);
    }
}

// Clear contract data from localStorage
function clearContractData() {
    try {
        localStorage.removeItem(STORAGE_KEYS.DID_REGISTRY_ADDRESS);
        localStorage.removeItem(STORAGE_KEYS.AID_TOKEN_ADDRESS);
        localStorage.removeItem(STORAGE_KEYS.AID_TOKEN_HANDLER_ADDRESS);
        localStorage.removeItem(STORAGE_KEYS.NETWORK_ID);

        // Clear input fields
        document.getElementById('existingDIDRegistry').value = '';
        document.getElementById('existingAidToken').value = '';
        document.getElementById('existingAidTokenHandler').value = '';

        // Clear status display
        document.getElementById('statusDIDRegistry').textContent = 'Not connected';
        document.getElementById('statusAidToken').textContent = 'Not connected';
        document.getElementById('statusAidTokenHandler').textContent = 'Not connected';

        // Reset contract variables
        window.app.didRegistryAddress = null;
        window.app.aidTokenAddress = null;
        window.app.aidTokenHandlerAddress = null;
        window.app.didRegistryContract = null;
        window.app.aidTokenContract = null;
        window.app.aidTokenHandlerContract = null;

        window.app.ui.showNotification('Contract data cleared', 'success');
    } catch (error) {
        console.error('Error clearing contract data:', error);
    }
}

// Refresh contract information
async function refreshContractInfo() {
    try {
        if (!window.app.aidTokenContract) {
            window.app.ui.showNotification('Please deploy or connect to contracts first', 'warning');
            return;
        }

        // Get AidToken contract information
        const reliefAgency = await window.app.aidTokenContract.methods.reliefAgency().call();
        const donationThreshold = await window.app.aidTokenContract.methods.donationThreshold().call();
        const minDonation = await window.app.aidTokenContract.methods.minDonation().call();
        const tokenIdCounter = await window.app.aidTokenContract.methods.tokenIdCounter().call();
        const maxTokensPerTx = await window.app.aidTokenContract.methods.MAX_TOKENS_PER_TRANSACTION().call();

        // Update UI
        document.getElementById('reliefAgency').textContent = reliefAgency;
        document.getElementById('statusDonationThreshold').textContent = window.app.web3.utils.fromWei(donationThreshold, 'ether') + ' ETH';
        document.getElementById('statusMinDonation').textContent = window.app.web3.utils.fromWei(minDonation, 'ether') + ' ETH';
        document.getElementById('statusTokenCounter').textContent = tokenIdCounter;
        document.getElementById('statusMaxTokensPerTx').textContent = maxTokensPerTx;
        document.getElementById('maxTokensPerTx').textContent = maxTokensPerTx;

        // Update account information
        await window.app.wallet.updateAccountBalance();
        await window.app.wallet.updateAccountRole();

        window.app.ui.showNotification('Contract information refreshed', 'success');
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to refresh contract information: ' + error.message, 'danger');
    }
}

// Get status text from enum value
function getStatusText(statusEnum) {
    switch (parseInt(statusEnum)) {
        case 0:
            return 'Issued';
        case 1:
            return 'InTransit';
        case 2:
            return 'Delivered';
        case 3:
            return 'Claimed';
        default:
            return 'Unknown';
    }
}

// Helper function to auto-initialize token status
async function autoInitializeTokenStatus(tokenId) {
    try {
        const method = window.app.aidTokenHandlerContract.methods.initializeTokenStatus(tokenId);
        const gas = await method.estimateGas({ from: window.app.userAccount });
        await method.send({ from: window.app.userAccount, gas: Math.round(gas * 1.2) });
        return true;
    } catch (error) {
        console.error('Error auto-initializing token status:', error);
        return false;
    }
}

// Export functions for use in other modules
export {
    didRegistryABI,
    aidTokenABI,
    aidTokenHandlerABI,
    STORAGE_KEYS,
    connectToContracts,
    loadContractAddresses,
    saveContractAddresses,
    clearContractData,
    refreshContractInfo,
    getStatusText,
    autoInitializeTokenStatus
}; 