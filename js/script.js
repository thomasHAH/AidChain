// Contract ABIs
const didRegistryABI = [
    {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"string","name":"location","type":"string"}],"name":"registerTransporterDID","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"string","name":"location","type":"string"}],"name":"registerGroundReliefDID","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"string","name":"location","type":"string"}],"name":"registerRecipientDID","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getRole","outputs":[{"internalType":"enum DIDRegistry.Role","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getLocation","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"getAllTransporters","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"getAllGroundRelief","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"getAllRecipients","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"dids","outputs":[{"internalType":"string","name":"did","type":"string"},{"internalType":"enum DIDRegistry.Role","name":"role","type":"uint8"},{"internalType":"string","name":"location","type":"string"}],"stateMutability":"view","type":"function"}
];

const aidTokenABI = [
    {"inputs":[{"internalType":"address","name":"_reliefAgency","type":"address"},{"internalType":"address","name":"_didRegistry","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
    {"inputs":[],"name":"donate","outputs":[],"stateMutability":"payable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"transferAddress","type":"address"},{"internalType":"address","name":"groundAddress","type":"address"},{"internalType":"address","name":"recipientAddress","type":"address"},{"internalType":"string","name":"location","type":"string"}],"name":"assignAidRecipients","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"currentTokenBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"donationThreshold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"donorBalances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getTransferTeam","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getGroundRelief","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getRecipient","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"isTokenIssued","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"minDonation","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"reliefAgency","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"tokenIdCounter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address[]","name":"donors","type":"address[]"}],"name":"AidTokenIssued","type":"event"}
];

const aidTokenHandlerABI = [
    {"inputs":[{"internalType":"address","name":"_aidTokenAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
    {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"authenticateTransferTeam","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"authenticateGroundRelief","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"claimAid","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getAidStatusString","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"aidStatus","outputs":[{"internalType":"enum AidTokenHandler.AidStatus","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"address","name":"actor","type":"address"},{"indexed":false,"internalType":"enum AidTokenHandler.AidStatus","name":"newStatus","type":"uint8"}],"name":"AidTransferred","type":"event"}
];

// Global variables
let web3;
let userAccount;
let didRegistryContract;
let aidTokenContract;
let aidTokenHandlerContract;
let didRegistryAddress;
let aidTokenAddress;
let aidTokenHandlerAddress;
let selectionModalTarget;
let currentChainId;
let currentNetworkName;
let accountList = [];

// LocalStorage keys
const STORAGE_KEYS = {
    DID_REGISTRY_ADDRESS: 'blockchain_aid_didRegistryAddress',
    AID_TOKEN_ADDRESS: 'blockchain_aid_aidTokenAddress',
    AID_TOKEN_HANDLER_ADDRESS: 'blockchain_aid_aidTokenHandlerAddress',
    NETWORK_ID: 'blockchain_aid_networkId',
    LAST_ACCOUNT: 'blockchain_aid_lastAccount'
};

// Setup MetaMask event listeners
function setupMetaMaskEventListeners() {
    // Listen for account changes
    window.ethereum.on('accountsChanged', async function (accounts) {
        if (accounts.length === 0) {
            // User disconnected all accounts
            resetUI();
            showNotification('Wallet disconnected', 'warning');
            
            // Update button visibility
            document.getElementById('connectWallet').style.display = 'inline-block';
            document.getElementById('disconnectWallet').style.display = 'none';
        } else {
            // New account selected
            userAccount = accounts[0];
            
            // Update UI elements
            document.getElementById('userAccount').textContent = userAccount;
            document.getElementById('currentAccountDisplay').textContent = userAccount;
            
            // Save to localStorage
            localStorage.setItem(STORAGE_KEYS.LAST_ACCOUNT, userAccount);
            
            // Update account information
            await updateAccountBalance();
            await updateAccountRole();
            
            // Update button visibility
            document.getElementById('connectWallet').style.display = 'none';
            document.getElementById('disconnectWallet').style.display = 'inline-block';
            
            showNotification('Account changed to ' + formatAddress(userAccount), 'info');
        }
    });
    
    // Listen for chain changes
    window.ethereum.on('chainChanged', async function (chainId) {
        // Handle network change - reload page as recommended by MetaMask
        showNotification('Network changed. Reloading application...', 'info');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    });
    
    // Handle connection events 
    window.ethereum.on('connect', (connectInfo) => {
        console.log('Connected to MetaMask', connectInfo);
    });
    
    // Handle disconnect events
    window.ethereum.on('disconnect', (error) => {
        console.log('Disconnected from MetaMask', error);
        resetUI();
        showNotification('Wallet disconnected from network', 'warning');
        
        // Update button visibility
        document.getElementById('connectWallet').style.display = 'inline-block';
        document.getElementById('disconnectWallet').style.display = 'none';
    });
}

// Update network information
async function updateNetworkInfo() {
    try {
        currentChainId = await web3.eth.getChainId();
        
        // Get network name
        let networkName;
        switch (currentChainId) {
            case 1:
                networkName = 'Ethereum Mainnet';
                break;
            case 5:
                networkName = 'Goerli Testnet';
                break;
            case 11155111:
                networkName = 'Sepolia Testnet';
                break;
            case 1337:
                networkName = 'Local Ganache';
                break;
            default:
                networkName = 'Unknown Network';
        }
        
        currentNetworkName = networkName;
        
        // Update UI
        document.getElementById('networkName').textContent = networkName;
        document.getElementById('chainId').textContent = currentChainId;
        
        // Add network badge
        let networkBadgeClass = 'network-unknown';
        if (currentChainId === 1) {
            networkBadgeClass = 'network-mainnet';
        } else if ([5, 11155111].includes(currentChainId)) {
            networkBadgeClass = 'network-testnet';
        } else if (currentChainId === 1337) {
            networkBadgeClass = 'network-local';
        }
        
        document.getElementById('networkName').innerHTML = `${networkName} <span class="network-badge ${networkBadgeClass}">${currentChainId}</span>`;
        
    } catch (error) {
        console.error('Error updating network info:', error);
    }
}

// Update account balance
async function updateAccountBalance() {
    try {
        if (!web3 || !userAccount) return;
        
        const balance = await web3.eth.getBalance(userAccount);
        const balanceEth = web3.utils.fromWei(balance, 'ether');
        
        document.getElementById('accountBalance').textContent = `${parseFloat(balanceEth).toFixed(4)} ETH`;
    } catch (error) {
        console.error('Error updating account balance:', error);
        document.getElementById('accountBalance').textContent = 'Error fetching balance';
    }
}

// Update account role
async function updateAccountRole() {
    try {
        if (!web3 || !userAccount || !didRegistryContract) {
            document.getElementById('accountRole').textContent = 'Not registered';
            return;
        }
        
        const roleId = await didRegistryContract.methods.getRole(userAccount).call();
        let roleText = 'Not registered';
        let roleBadgeClass = 'role-none';
        
        switch (parseInt(roleId)) {
            case 0:
                roleText = 'None';
                roleBadgeClass = 'role-none';
                break;
            case 1:
                roleText = 'Transporter';
                roleBadgeClass = 'role-transporter';
                break;
            case 2:
                roleText = 'Ground Relief';
                roleBadgeClass = 'role-groundrelief';
                break;
            case 3:
                roleText = 'Recipient';
                roleBadgeClass = 'role-recipient';
                break;
        }
        
        // Check if user is relief agency
        if (aidTokenContract) {
            const reliefAgency = await aidTokenContract.methods.reliefAgency().call();
            if (userAccount.toLowerCase() === reliefAgency.toLowerCase()) {
                roleText = 'Relief Agency';
                roleBadgeClass = 'role-reliefagency';
            }
        }
        
        document.getElementById('accountRole').innerHTML = `${roleText} <span class="role-badge ${roleBadgeClass}">${roleText}</span>`;
    } catch (error) {
        console.error('Error updating account role:', error);
        document.getElementById('accountRole').textContent = 'Error fetching role';
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
        if (savedNetworkId && parseInt(savedNetworkId) === currentChainId) {
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
                showNotification('Loaded saved contract addresses', 'info');
                
                // Connect to contracts
                connectToContracts();
            }
        } else if (savedNetworkId) {
            showNotification('Network changed. Saved contracts may not be valid.', 'warning');
        }
    } catch (error) {
        console.error('Error loading contract addresses:', error);
    }
}

// Save contract addresses to localStorage
function saveContractAddresses() {
    try {
        if (currentChainId && didRegistryAddress && aidTokenAddress && aidTokenHandlerAddress) {
            localStorage.setItem(STORAGE_KEYS.DID_REGISTRY_ADDRESS, didRegistryAddress);
            localStorage.setItem(STORAGE_KEYS.AID_TOKEN_ADDRESS, aidTokenAddress);
            localStorage.setItem(STORAGE_KEYS.AID_TOKEN_HANDLER_ADDRESS, aidTokenHandlerAddress);
            localStorage.setItem(STORAGE_KEYS.NETWORK_ID, currentChainId.toString());
            
            showNotification('Contract addresses saved to browser storage', 'success');
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
        didRegistryAddress = null;
        aidTokenAddress = null;
        aidTokenHandlerAddress = null;
        didRegistryContract = null;
        aidTokenContract = null;
        aidTokenHandlerContract = null;
        
        showNotification('Contract data cleared', 'success');
    } catch (error) {
        console.error('Error clearing contract data:', error);
    }
}

// Connect to existing contracts
async function connectToContracts() {
    try {
        if (!web3) {
            const accounts = await connectWallet();
            if (!accounts || accounts.length === 0) {
                showNotification('Please connect your wallet first', 'warning');
                return;
            }
        }
        
        const existingDIDRegistry = document.getElementById('existingDIDRegistry').value;
        const existingAidToken = document.getElementById('existingAidToken').value;
        const existingAidTokenHandler = document.getElementById('existingAidTokenHandler').value;
        
        if (!existingDIDRegistry || !existingAidToken || !existingAidTokenHandler) {
            showNotification('Please enter all contract addresses', 'warning');
            return;
        }
        
        // Connect to DIDRegistry
        didRegistryAddress = existingDIDRegistry;
        didRegistryContract = new web3.eth.Contract(didRegistryABI, didRegistryAddress);
        
        // Connect to AidToken
        aidTokenAddress = existingAidToken;
        aidTokenContract = new web3.eth.Contract(aidTokenABI, aidTokenAddress);
        
        // Connect to AidTokenHandler
        aidTokenHandlerAddress = existingAidTokenHandler;
        aidTokenHandlerContract = new web3.eth.Contract(aidTokenHandlerABI, aidTokenHandlerAddress);
        
        // Update UI elements
        document.getElementById('statusDIDRegistry').textContent = didRegistryAddress;
        document.getElementById('statusAidToken').textContent = aidTokenAddress;
        document.getElementById('statusAidTokenHandler').textContent = aidTokenHandlerAddress;
        
        // Save contract addresses to localStorage
        saveContractAddresses();
        
        // Update token info
        refreshContractInfo();
        
        // Update account role
        await updateAccountRole();
        
        showNotification('Connected to existing contracts successfully!', 'success');
    } catch (error) {
        console.error(error);
        showNotification('Failed to connect to contracts: ' + error.message, 'danger');
    }
}

// Register DID functions
async function registerDID(roleType) {
    try {
        if (!didRegistryContract) {
            showNotification('Please deploy or connect to DIDRegistry contract first', 'warning');
            return;
        }
        
        const address = document.getElementById('didAddress').value || userAccount;
        const location = document.getElementById('didLocation').value;
        
        if (!location) {
            showNotification('Please enter a location', 'warning');
            return;
        }
        
        let method;
        let roleText;
        
        switch (roleType) {
            case 'transporter':
                method = didRegistryContract.methods.registerTransporterDID(address, location);
                roleText = 'Transporter';
                break;
            case 'groundRelief':
                method = didRegistryContract.methods.registerGroundReliefDID(address, location);
                roleText = 'Ground Relief';
                break;
            case 'recipient':
                method = didRegistryContract.methods.registerRecipientDID(address, location);
                roleText = 'Recipient';
                break;
        }
        
        showNotification(`Registering ${formatAddress(address)} as ${roleText}...`, 'info');
        
        // Estimate gas
        const gas = await method.estimateGas({ from: userAccount });
        await method.send({ from: userAccount, gas: Math.round(gas * 1.2) });
        
        // If registering the current user, update role display
        if (address.toLowerCase() === userAccount.toLowerCase()) {
            await updateAccountRole();
        }
        
        showNotification(`Successfully registered ${formatAddress(address)} as ${roleText}!`, 'success');
    } catch (error) {
        console.error(error);
        showNotification('Failed to register DID: ' + error.message, 'danger');
    }
}

// Check role of an address
async function checkRole() {
    try {
        if (!didRegistryContract) {
            showNotification('Please deploy or connect to DIDRegistry contract first', 'warning');
            return;
        }
        
        const address = document.getElementById('checkAddressRole').value || userAccount;
        
        if (!address) {
            showNotification('Please enter an address to check', 'warning');
            return;
        }
        
        const roleId = await didRegistryContract.methods.getRole(address).call();
        const location = await didRegistryContract.methods.getLocation(address).call();
        const didInfo = await didRegistryContract.methods.dids(address).call();
        
        let roleText;
        let roleBadgeClass;
        
        switch (parseInt(roleId)) {
            case 0:
                roleText = 'None';
                roleBadgeClass = 'role-none';
                break;
            case 1:
                roleText = 'Transporter';
                roleBadgeClass = 'role-transporter';
                break;
            case 2:
                roleText = 'Ground Relief';
                roleBadgeClass = 'role-groundrelief';
                break;
            case 3:
                roleText = 'Recipient';
                roleBadgeClass = 'role-recipient';
                break;
        }
        
        // Check if user is relief agency
        let isReliefAgency = false;
        if (aidTokenContract) {
            const reliefAgency = await aidTokenContract.methods.reliefAgency().call();
            if (address.toLowerCase() === reliefAgency.toLowerCase()) {
                isReliefAgency = true;
            }
        }
        
        const resultElement = document.getElementById('roleResult');
        resultElement.innerHTML = `
            <strong>Address:</strong> <span class="address-display">${address}</span><br>
            <strong>Role:</strong> ${roleText} <span class="role-badge ${roleBadgeClass}">${roleText}</span><br>
            ${isReliefAgency ? '<strong>Special Role:</strong> <span class="role-badge role-reliefagency">Relief Agency</span><br>' : ''}
            <strong>Location:</strong> ${location || 'Not specified'}<br>
            <strong>DID:</strong> ${didInfo.did || 'Not assigned'}
        `;
        resultElement.style.display = 'block';
    } catch (error) {
        console.error(error);
        showNotification('Failed to check role: ' + error.message, 'danger');
    }
}

// View registered users by role
async function viewRegisteredUsers(roleType) {
    try {
        if (!didRegistryContract) {
            showNotification('Please deploy or connect to DIDRegistry contract first', 'warning');
            return;
        }
        
        let method;
        let roleText;
        
        switch (roleType) {
            case 'transporter':
                method = didRegistryContract.methods.getAllTransporters();
                roleText = 'Transporter';
                break;
            case 'groundRelief':
                method = didRegistryContract.methods.getAllGroundRelief();
                roleText = 'Ground Relief';
                break;
            case 'recipient':
                method = didRegistryContract.methods.getAllRecipients();
                roleText = 'Recipient';
                break;
        }
        
        const addresses = await method.call();
        const tableBody = document.getElementById('registeredUsersTable').getElementsByTagName('tbody')[0];
        
        // Clear table
        tableBody.innerHTML = '';
        
        if (addresses.length === 0) {
            // Add a row showing no results
            const row = tableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 3;
            cell.textContent = `No ${roleText} addresses registered`;
            cell.className = 'text-center';
            
            showNotification(`No ${roleText} addresses registered`, 'warning');
            return;
        }
        
        // Populate table
        for (const address of addresses) {
            try {
                const location = await didRegistryContract.methods.getLocation(address).call();
                
                const row = tableBody.insertRow();
                const typeCell = row.insertCell(0);
                const addressCell = row.insertCell(1);
                const locationCell = row.insertCell(2);
                
                typeCell.innerHTML = `<span class="role-badge ${getRoleBadgeClass(roleType)}">${roleText}</span>`;
                addressCell.innerHTML = `<span class="address-display">${address}</span>`;
                locationCell.textContent = location;
            } catch (error) {
                console.error(`Error fetching info for address ${address}:`, error);
            }
        }
        
        showNotification(`Found ${addresses.length} registered ${roleText} addresses`, 'success');
    } catch (error) {
        console.error(error);
        showNotification('Failed to fetch registered users: ' + error.message, 'danger');
    }
}

// Get role badge class
function getRoleBadgeClass(roleType) {
    switch (roleType) {
        case 'transporter':
            return 'role-transporter';
        case 'groundRelief':
            return 'role-groundrelief';
        case 'recipient':
            return 'role-recipient';
        default:
            return 'role-none';
    }
}

// Make a donation
async function makeDonation() {
    try {
        if (!aidTokenContract) {
            showNotification('Please deploy or connect to AidToken contract first', 'warning');
            return;
        }
        
        const donationAmount = document.getElementById('donationAmount').value;
        
        if (!donationAmount || parseFloat(donationAmount) <= 0) {
            showNotification('Please enter a valid donation amount', 'warning');
            return;
        }
        
        const minDonation = await aidTokenContract.methods.minDonation().call();
        const minDonationEth = web3.utils.fromWei(minDonation, 'ether');
        
        if (parseFloat(donationAmount) < parseFloat(minDonationEth)) {
            showNotification(`Donation must be at least ${minDonationEth} ETH`, 'warning');
            return;
        }
        
        showNotification(`Processing donation of ${donationAmount} ETH...`, 'info');
        
        const donationWei = web3.utils.toWei(donationAmount, 'ether');
        await aidTokenContract.methods.donate().send({
            from: userAccount,
            value: donationWei
        });
        
        showNotification('Donation processed successfully!', 'success');
        
        // Update token status and account balance
        checkTokenStatus();
        updateAccountBalance();
    } catch (error) {
        console.error(error);
        showNotification('Failed to make donation: ' + error.message, 'danger');
    }
}

// Check donor balance
async function checkDonorBalance() {
    try {
        if (!aidTokenContract) {
            showNotification('Please deploy or connect to AidToken contract first', 'warning');
            return;
        }
        
        const balance = await aidTokenContract.methods.donorBalances(userAccount).call();
        const balanceEth = web3.utils.fromWei(balance, 'ether');
        
        const balanceElement = document.getElementById('donorBalance');
        balanceElement.innerHTML = `Your total donation balance is <strong>${balanceEth} ETH</strong>`;
        balanceElement.style.display = 'block';
    } catch (error) {
        console.error(error);
        showNotification('Failed to check balance: ' + error.message, 'danger');
    }
}

// Check token status
async function checkTokenStatus() {
    try {
        if (!aidTokenContract) {
            showNotification('Please deploy or connect to AidToken contract first', 'warning');
            return;
        }
        
        const tokenIdCounter = await aidTokenContract.methods.tokenIdCounter().call();
        const currentTokenBalance = await aidTokenContract.methods.currentTokenBalance().call();
        const donationThreshold = await aidTokenContract.methods.donationThreshold().call();
        
        const currentTokenBalanceEth = web3.utils.fromWei(currentTokenBalance, 'ether');
        const donationThresholdEth = web3.utils.fromWei(donationThreshold, 'ether');
        
        // Update UI
        document.getElementById('tokenIdCounter').textContent = tokenIdCounter;
        document.getElementById('currentTokenBalance').textContent = `${currentTokenBalanceEth} ETH / ${donationThresholdEth} ETH`;
        
        // Calculate progress percentage
        const progressPercentage = (parseFloat(currentTokenBalance) / parseFloat(donationThreshold)) * 100;
        const progressBar = document.getElementById('tokenProgress');
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.textContent = `${progressPercentage.toFixed(2)}%`;
        
        // Update donation threshold displays
        document.getElementById('minDonation').textContent = `${web3.utils.fromWei(await aidTokenContract.methods.minDonation().call(), 'ether')} ETH`;
        document.getElementById('donationThreshold').textContent = `${donationThresholdEth} ETH`;
    } catch (error) {
        console.error(error);
        showNotification('Failed to check token status: ' + error.message, 'danger');
   }
}

// Assign recipients to token
async function assignRecipients() {
   try {
       if (!aidTokenContract) {
           showNotification('Please deploy or connect to AidToken contract first', 'warning');
           return;
       }
       
       const tokenId = document.getElementById('tokenIdAssign').value;
       const transferTeamAddress = document.getElementById('transferTeamAddress').value;
       const groundReliefAddress = document.getElementById('groundReliefAddress').value;
       const recipientAddress = document.getElementById('recipientAddress').value;
       const location = document.getElementById('locationAssign').value;
       
       if (!tokenId || !transferTeamAddress || !groundReliefAddress || !recipientAddress || !location) {
           showNotification('Please fill all required fields', 'warning');
           return;
       }
       
       // Get relief agency address
       const reliefAgency = await aidTokenContract.methods.reliefAgency().call();
       
       if (userAccount.toLowerCase() !== reliefAgency.toLowerCase()) {
           showNotification('Only the relief agency can assign recipients', 'warning');
           return;
       }
       
       showNotification(`Assigning recipients to token ID ${tokenId}...`, 'info');
       
       const method = aidTokenContract.methods.assignAidRecipients(
           tokenId,
           transferTeamAddress,
           groundReliefAddress,
           recipientAddress,
           location
       );
       
       // Estimate gas with a buffer
       const gas = await method.estimateGas({ from: userAccount });
       await method.send({ from: userAccount, gas: Math.round(gas * 1.2) });
       
       showNotification(`Successfully assigned recipients to token ID ${tokenId}!`, 'success');
   } catch (error) {
       console.error(error);
       showNotification('Failed to assign recipients: ' + error.message, 'danger');
   }
}

// Check assignment status
async function checkAssignment() {
   try {
       if (!aidTokenContract) {
           showNotification('Please deploy or connect to AidToken contract first', 'warning');
           return;
       }
       
       const tokenId = document.getElementById('tokenIdCheck').value;
       
       if (!tokenId) {
           showNotification('Please enter a token ID', 'warning');
           return;
       }
       
       const isIssued = await aidTokenContract.methods.isTokenIssued(tokenId).call();
       
       if (!isIssued) {
           const assignmentStatus = `<div class="alert alert-warning">Token ID ${tokenId} has not been issued yet</div>`;
           document.getElementById('assignmentStatus').innerHTML = assignmentStatus;
           document.getElementById('assignmentStatus').style.display = 'block';
           return;
       }
       
       const transferTeam = await aidTokenContract.methods.getTransferTeam(tokenId).call();
       const groundRelief = await aidTokenContract.methods.getGroundRelief(tokenId).call();
       const recipient = await aidTokenContract.methods.getRecipient(tokenId).call();
       
       const zeroAddress = '0x0000000000000000000000000000000000000000';
       let assignmentStatus;
       
       if (transferTeam === zeroAddress && groundRelief === zeroAddress && recipient === zeroAddress) {
           assignmentStatus = `<div class="alert alert-warning">Token ID ${tokenId} has not been assigned recipients yet</div>`;
       } else {
           let transferTeamRole = '';
           let groundReliefRole = '';
           let recipientRole = '';
           
           // Check if current user matches any role
           if (transferTeam.toLowerCase() === userAccount.toLowerCase()) {
               transferTeamRole = ' <span class="badge bg-success">You</span>';
           }
           if (groundRelief.toLowerCase() === userAccount.toLowerCase()) {
               groundReliefRole = ' <span class="badge bg-success">You</span>';
           }
           if (recipient.toLowerCase() === userAccount.toLowerCase()) {
               recipientRole = ' <span class="badge bg-success">You</span>';
           }
           
           assignmentStatus = `
               <div class="alert alert-success">
                   <h5>Token ID ${tokenId} Assignment:</h5>
                   <strong>Transfer Team:</strong> <span class="address-display">${transferTeam}</span>${transferTeamRole}<br>
                   <strong>Ground Relief:</strong> <span class="address-display">${groundRelief}</span>${groundReliefRole}<br>
                   <strong>Recipient:</strong> <span class="address-display">${recipient}</span>${recipientRole}
               </div>
           `;
       }
       
       document.getElementById('assignmentStatus').innerHTML = assignmentStatus;
       document.getElementById('assignmentStatus').style.display = 'block';
   } catch (error) {
       console.error(error);
       showNotification('Failed to check assignment: ' + error.message, 'danger');
   }
}

// Check aid status
async function checkAidStatus() {
   try {
       if (!aidTokenHandlerContract) {
           showNotification('Please deploy or connect to AidTokenHandler contract first', 'warning');
           return;
       }
       
       const tokenId = document.getElementById('tokenIdTracking').value;
       
       if (!tokenId) {
           showNotification('Please enter a token ID', 'warning');
           return;
       }
       
       // First check if token is issued
       const isIssued = await aidTokenContract.methods.isTokenIssued(tokenId).call();
       if (!isIssued) {
           const statusResult = `
               <div class="alert alert-warning">
                   <strong>Status:</strong> Not Issued<br>
                   <p>Token ID ${tokenId} has not been issued yet. Tokens are issued when donations reach the threshold.</p>
               </div>
           `;
           document.getElementById('aidStatusResult').innerHTML = statusResult;
           document.getElementById('aidStatusResult').style.display = 'block';
           
           // Update journey visualization with all steps inactive
           updateAidJourney(-1);
           return;
       }
       
       const statusString = await aidTokenHandlerContract.methods.getAidStatusString(tokenId).call();
       const statusEnum = await aidTokenHandlerContract.methods.aidStatus(tokenId).call();
       
       // Get assignment info
       const transferTeam = await aidTokenContract.methods.getTransferTeam(tokenId).call();
       const groundRelief = await aidTokenContract.methods.getGroundRelief(tokenId).call();
       const recipient = await aidTokenContract.methods.getRecipient(tokenId).call();
       
       const zeroAddress = '0x0000000000000000000000000000000000000000';
       let isAssigned = !(transferTeam === zeroAddress && groundRelief === zeroAddress && recipient === zeroAddress);
       
       let statusMessage;
       let assignmentInfo = '';
       
       // Check if token is assigned
       if (!isAssigned) {
           statusMessage = `Token ID ${tokenId} has been issued but has not been assigned recipients yet.`;
       } else {
           // User role indicators
           let userTransporter = transferTeam.toLowerCase() === userAccount.toLowerCase();
           let userGroundRelief = groundRelief.toLowerCase() === userAccount.toLowerCase();
           let userRecipient = recipient.toLowerCase() === userAccount.toLowerCase();
           
           // Assignment info with role badges
           assignmentInfo = `
               <div class="mt-3">
                   <strong>Assigned Roles:</strong><br>
                   <div class="mt-1"><strong>Transfer Team:</strong> <span class="address-display">${transferTeam}</span> ${userTransporter ? '<span class="badge bg-success">You</span>' : ''}</div>
                   <div class="mt-1"><strong>Ground Relief:</strong> <span class="address-display">${groundRelief}</span> ${userGroundRelief ? '<span class="badge bg-success">You</span>' : ''}</div>
                   <div class="mt-1"><strong>Recipient:</strong> <span class="address-display">${recipient}</span> ${userRecipient ? '<span class="badge bg-success">You</span>' : ''}</div>
               </div>
           `;
           
           // Status specific messages
           switch (statusString) {
               case 'Issued':
                   statusMessage = `Token ID ${tokenId} has been issued and is ready for transportation.`;
                   if (userTransporter) {
                       statusMessage += ` As the assigned Transfer Team, you can mark this token as "In Transit".`;
                   }
                   break;
               case 'InTransit':
                   statusMessage = `Token ID ${tokenId} is currently in transit.`;
                   if (userGroundRelief) {
                       statusMessage += ` As the assigned Ground Relief team, you can mark this token as "Delivered" once you receive it.`;
                   }
                   break;
               case 'Delivered':
                   statusMessage = `Token ID ${tokenId} has been delivered to the ground relief team.`;
                   if (userRecipient) {
                       statusMessage += ` As the assigned Recipient, you can mark this token as "Claimed" once you receive the aid.`;
                   }
                   break;
               case 'Claimed':
                   statusMessage = `Token ID ${tokenId} has been claimed by the recipient. The aid delivery process is complete.`;
                   break;
               default:
                   statusMessage = `Token ID ${tokenId} has an unknown status.`;
           }
       }
       
       document.getElementById('aidStatusResult').innerHTML = `
           <strong>Status:</strong> ${statusString}<br>
           <p>${statusMessage}</p>
           ${assignmentInfo}
       `;
       document.getElementById('aidStatusResult').style.display = 'block';
       
       // Update journey visualization
       updateAidJourney(parseInt(statusEnum));
   } catch (error) {
       console.error(error);
       showNotification('Failed to check aid status: ' + error.message, 'danger');
   }
}

// Update aid journey visualization
function updateAidJourney(status) {
   // Reset all steps to default
   document.getElementById('issuedStep').className = 'rounded-circle bg-secondary text-white';
   document.getElementById('inTransitStep').className = 'rounded-circle bg-secondary text-white';
   document.getElementById('deliveredStep').className = 'rounded-circle bg-secondary text-white';
   document.getElementById('claimedStep').className = 'rounded-circle bg-secondary text-white';
   
   // If status is -1, keep all steps inactive (not issued)
   if (status === -1) return;
   
   switch (status) {
       case 0: // Issued
           document.getElementById('issuedStep').className = 'rounded-circle bg-success text-white';
           break;
       case 1: // InTransit
           document.getElementById('issuedStep').className = 'rounded-circle bg-success text-white';
           document.getElementById('inTransitStep').className = 'rounded-circle bg-success text-white';
           break;
       case 2: // Delivered
           document.getElementById('issuedStep').className = 'rounded-circle bg-success text-white';
           document.getElementById('inTransitStep').className = 'rounded-circle bg-success text-white';
           document.getElementById('deliveredStep').className = 'rounded-circle bg-success text-white';
           break;
       case 3: // Claimed
           document.getElementById('issuedStep').className = 'rounded-circle bg-success text-white';
           document.getElementById('inTransitStep').className = 'rounded-circle bg-success text-white';
           document.getElementById('deliveredStep').className = 'rounded-circle bg-success text-white';
           document.getElementById('claimedStep').className = 'rounded-circle bg-success text-white';
           break;
   }
}

// Mark token as in transit
async function markInTransit() {
   try {
       if (!aidTokenHandlerContract) {
           showNotification('Please deploy or connect to AidTokenHandler contract first', 'warning');
           return;
       }
       
       const tokenId = document.getElementById('tokenIdTracking').value;
       
       if (!tokenId) {
           showNotification('Please enter a token ID', 'warning');
           return;
       }
       
       // Check if user is the assigned transporter
       const transferTeam = await aidTokenContract.methods.getTransferTeam(tokenId).call();
       if (transferTeam.toLowerCase() !== userAccount.toLowerCase()) {
           showNotification('Only the assigned Transfer Team can mark this token as In Transit', 'warning');
           return;
       }
       
       showNotification(`Authenticating as transfer team for token ID ${tokenId}...`, 'info');
       
       const method = aidTokenHandlerContract.methods.authenticateTransferTeam(tokenId);
       const gas = await method.estimateGas({ from: userAccount });
       await method.send({ from: userAccount, gas: Math.round(gas * 1.2) });
       
       showNotification(`Successfully marked token ID ${tokenId} as in transit!`, 'success');
       
       // Refresh aid status
       checkAidStatus();
   } catch (error) {
       console.error(error);
       showNotification('Failed to authenticate as transfer team: ' + error.message, 'danger');
   }
}

// Mark token as delivered
async function markDelivered() {
   try {
       if (!aidTokenHandlerContract) {
           showNotification('Please deploy or connect to AidTokenHandler contract first', 'warning');
           return;
       }
       
       const tokenId = document.getElementById('tokenIdTracking').value;
       
       if (!tokenId) {
           showNotification('Please enter a token ID', 'warning');
           return;
       }
       
       // Check if user is the assigned ground relief
       const groundRelief = await aidTokenContract.methods.getGroundRelief(tokenId).call();
       if (groundRelief.toLowerCase() !== userAccount.toLowerCase()) {
           showNotification('Only the assigned Ground Relief team can mark this token as Delivered', 'warning');
           return;
       }
       
       showNotification(`Authenticating as ground relief for token ID ${tokenId}...`, 'info');
       
       const method = aidTokenHandlerContract.methods.authenticateGroundRelief(tokenId);
       const gas = await method.estimateGas({ from: userAccount });
       await method.send({ from: userAccount, gas: Math.round(gas * 1.2) });
       
       showNotification(`Successfully marked token ID ${tokenId} as delivered!`, 'success');
       
       // Refresh aid status
       checkAidStatus();
   } catch (error) {
       console.error(error);
       showNotification('Failed to authenticate as ground relief: ' + error.message, 'danger');
   }
}

// Mark token as claimed
async function markClaimed() {
   try {
       if (!aidTokenHandlerContract) {
           showNotification('Please deploy or connect to AidTokenHandler contract first', 'warning');
           return;
       }
       
       const tokenId = document.getElementById('tokenIdTracking').value;
       
       if (!tokenId) {
           showNotification('Please enter a token ID', 'warning');
           return;
       }
       
       // Check if user is the assigned recipient
       const recipient = await aidTokenContract.methods.getRecipient(tokenId).call();
       if (recipient.toLowerCase() !== userAccount.toLowerCase()) {
           showNotification('Only the assigned Recipient can claim this token', 'warning');
           return;
       }
       
       showNotification(`Claiming aid for token ID ${tokenId}...`, 'info');
       
       const method = aidTokenHandlerContract.methods.claimAid(tokenId);
       const gas = await method.estimateGas({ from: userAccount });
       await method.send({ from: userAccount, gas: Math.round(gas * 1.2) });
       
       showNotification(`Successfully claimed token ID ${tokenId}!`, 'success');
       
       // Refresh aid status
       checkAidStatus();
   } catch (error) {
       console.error(error);
       showNotification('Failed to claim aid: ' + error.message, 'danger');
   }
}

// Refresh contract information
async function refreshContractInfo() {
    try {
        if (!aidTokenContract) {
            showNotification('Please deploy or connect to contracts first', 'warning');
            return;
        }
        
        // Get AidToken contract information
        const reliefAgency = await aidTokenContract.methods.reliefAgency().call();
        const donationThreshold = await aidTokenContract.methods.donationThreshold().call();
        const minDonation = await aidTokenContract.methods.minDonation().call();
        const tokenIdCounter = await aidTokenContract.methods.tokenIdCounter().call();
        
        // Update UI
        document.getElementById('reliefAgency').textContent = reliefAgency;
        document.getElementById('statusDonationThreshold').textContent = web3.utils.fromWei(donationThreshold, 'ether') + ' ETH';
        document.getElementById('statusMinDonation').textContent = web3.utils.fromWei(minDonation, 'ether') + ' ETH';
        document.getElementById('statusTokenCounter').textContent = tokenIdCounter;
        
        // Update account information
        await updateAccountBalance();
        await updateAccountRole();
        
        showNotification('Contract information refreshed', 'success');
    } catch (error) {
        console.error(error);
        showNotification('Failed to refresh contract information: ' + error.message, 'danger');
    }
}

// Fetch events
async function fetchEvents() {
    try {
        if (!aidTokenContract || !aidTokenHandlerContract) {
            showNotification('Please deploy or connect to contracts first', 'warning');
            return;
        }
        
        showNotification('Fetching events...', 'info');
        
        // Get AidToken events
        const aidTokenIssued = await aidTokenContract.getPastEvents('AidTokenIssued', {
            fromBlock: 0,
            toBlock: 'latest'
        });
        
        // Get AidTokenHandler events
        const aidTransferred = await aidTokenHandlerContract.getPastEvents('AidTransferred', {
            fromBlock: 0,
            toBlock: 'latest'
        });
        
        // Combine and sort events
        const events = [
            ...aidTokenIssued.map(event => ({
                type: 'AidTokenIssued',
                tokenId: event.returnValues.tokenId,
                actor: 'System',
                details: `Donors: ${event.returnValues.donors.length}`,
                blockNumber: event.blockNumber
            })),
            ...aidTransferred.map(event => ({
                type: 'AidTransferred',
                tokenId: event.returnValues.tokenId,
                actor: event.returnValues.actor,
                details: `New Status: ${getStatusText(event.returnValues.newStatus)}`,
                blockNumber: event.blockNumber
            }))
        ].sort((a, b) => b.blockNumber - a.blockNumber);
        
        // Update table
        const tableBody = document.getElementById('eventsTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
        
        if (events.length === 0) {
            // Add a row showing no results
            const row = tableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 5;
            cell.textContent = 'No events found';
            cell.className = 'text-center';
            
            showNotification('No events found', 'warning');
            return;
        }
        
        // Populate table
        for (const event of events) {
            const row = tableBody.insertRow();
            
            const typeCell = row.insertCell(0);
            const tokenIdCell = row.insertCell(1);
            const actorCell = row.insertCell(2);
            const detailsCell = row.insertCell(3);
            const blockCell = row.insertCell(4);
            
            // Add event type with badge
            let eventBadge = event.type === 'AidTokenIssued' ? 'bg-success' : 'bg-info';
            typeCell.innerHTML = `<span class="badge ${eventBadge}">${event.type}</span>`;
            
            tokenIdCell.textContent = event.tokenId;
            
            // Show if actor is current user
            if (event.actor === 'System') {
                actorCell.textContent = 'System';
            } else {
                let isSelf = event.actor.toLowerCase() === userAccount.toLowerCase();
                actorCell.innerHTML = `<span class="address-display">${event.actor}</span> ${isSelf ? '<span class="badge bg-success">You</span>' : ''}`;
            }
            
            detailsCell.textContent = event.details;
            blockCell.textContent = event.blockNumber;
        }
        
        showNotification(`Found ${events.length} events`, 'success');
    } catch (error) {
        console.error(error);
        showNotification('Failed to fetch events: ' + error.message, 'danger');
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

// Show addresses in selection modal
async function showSelectionModal(roleType) {
    try {
        if (!didRegistryContract) {
            showNotification('Please deploy or connect to DIDRegistry contract first', 'warning');
            return;
        }
        
        let method;
        let roleText;
        
        switch (roleType) {
            case 'transporter':
                method = didRegistryContract.methods.getAllTransporters();
                roleText = 'Transporters';
                selectionModalTarget = 'transferTeamAddress';
                break;
            case 'groundRelief':
                method = didRegistryContract.methods.getAllGroundRelief();
                roleText = 'Ground Relief';
                selectionModalTarget = 'groundReliefAddress';
                break;
            case 'recipient':
                method = didRegistryContract.methods.getAllRecipients();
                roleText = 'Recipients';
                selectionModalTarget = 'recipientAddress';
                break;
        }
        
        const addresses = await method.call();
        
        // Update modal title
        document.getElementById('selectionModalLabel').textContent = `Select ${roleText} Address`;
        
        // Clear table
        const tableBody = document.getElementById('modalSelectionTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
        
        if (addresses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="3" class="text-center">No ${roleText} addresses registered</td></tr>`;
        } else {
            // Populate table
            for (const address of addresses) {
                try {
                    const location = await didRegistryContract.methods.getLocation(address).call();
                    
                    const row = tableBody.insertRow();
                    const addressCell = row.insertCell(0);
                    const locationCell = row.insertCell(1);
                    const actionCell = row.insertCell(2);
                    
                    // Check if this is the current user
                    const isSelf = address.toLowerCase() === userAccount.toLowerCase();
                    
                    addressCell.innerHTML = `<span class="address-display">${address}</span> ${isSelf ? '<span class="badge bg-success">You</span>' : ''}`;
                    locationCell.textContent = location;
                    actionCell.innerHTML = `<button class="btn btn-sm btn-primary select-address" data-address="${address}" data-location="${location}">Select</button>`;
                } catch (error) {
                    console.error(`Error fetching info for address ${address}:`, error);
                }
            }
        }
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('selectionModal'));
        modal.show();
    } catch (error) {
        console.error(error);
        showNotification('Failed to fetch addresses: ' + error.message, 'danger');
    }
}

// Select address from modal
function selectAddress(address, location) {
    document.getElementById(selectionModalTarget).value = address;
    if (selectionModalTarget === 'transferTeamAddress' || selectionModalTarget === 'groundReliefAddress' || selectionModalTarget === 'recipientAddress') {
        document.getElementById('locationAssign').value = location;
    }
}

// Disconnect wallet function
async function disconnectWallet() {
    try {
        // Reset user account and UI
        userAccount = null;
        web3 = null;
        
        // Clear localStorage items related to current session (except contract addresses)
        localStorage.removeItem(STORAGE_KEYS.LAST_ACCOUNT);
        
        // Reset UI
        resetUI();
        
        // Show notification
        showNotification('Wallet disconnected successfully!', 'success');
        
        // Additional UI updates for disconnected state
        document.getElementById('connectWallet').style.display = 'inline-block';
        document.getElementById('disconnectWallet').style.display = 'none';
        
        // This is the best we can do to "disconnect" from MetaMask
        // We can't programmatically disconnect completely due to MetaMask limitations
        // But we can clear any site permissions using wallet_revokePermissions if available
        if (window.ethereum && window.ethereum.request) {
            try {
                // This is an experimental feature and may not work in all versions
                await window.ethereum.request({
                    method: 'wallet_revokePermissions',
                    params: [{ eth_accounts: {} }]
                });
                console.log('Permissions revoked successfully');
            } catch (permissionError) {
                console.log('Could not revoke permissions: ', permissionError);
                // This is expected in many cases as the method is not widely supported
            }
        }
        
        // Force page reload to completely reset the connection state
        // This is the most reliable way to disconnect currently
        if (confirm('This will reset the connection and refresh the app to disconnect the wallet. Continue?')) {
            window.location.reload();
        }
        
        return true;
    } catch (error) {
        console.error(error);
        showNotification('Failed to disconnect wallet: ' + error.message, 'danger');
        return false;
    }
}

// Reset UI when disconnected - updated function
function resetUI() {
    userAccount = null;
    document.getElementById('userAccount').textContent = 'Not connected';
    document.getElementById('currentAccountDisplay').textContent = 'Not connected';
    document.getElementById('accountBalance').textContent = '-';
    document.getElementById('accountRole').textContent = '-';
    document.getElementById('networkName').textContent = 'Not detected';
    document.getElementById('chainId').textContent = '-';
    
    // Hide disconnect button, show connect button
    document.getElementById('connectWallet').style.display = 'inline-block';
    document.getElementById('disconnectWallet').style.display = 'none';
}

// Connect to MetaMask wallet - update to show/hide appropriate buttons
async function connectWallet() {
    try {
        // Check if MetaMask is installed
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0];
            
            // Update UI
            document.getElementById('userAccount').textContent = userAccount;
            document.getElementById('currentAccountDisplay').textContent = userAccount;
            
            // Save to localStorage
            localStorage.setItem(STORAGE_KEYS.LAST_ACCOUNT, userAccount);
            
            // Get network info
            await updateNetworkInfo();
            
            // Check account balance
            await updateAccountBalance();
            
            // Update account role
            await updateAccountRole();
            
            // Show notification
            showNotification('Wallet connected successfully!', 'success');
            
            // Load saved contract addresses
            loadContractAddresses();
            
            // Setup event listeners for MetaMask events
            setupMetaMaskEventListeners();
            
            // Show disconnect button, hide connect button
            document.getElementById('connectWallet').style.display = 'none';
            document.getElementById('disconnectWallet').style.display = 'inline-block';
            
            return accounts;
        } else {
            showNotification('Please install MetaMask to use this dApp', 'danger');
            return null;
        }
    } catch (error) {
        console.error(error);
        showNotification('Failed to connect wallet: ' + error.message, 'danger');
        return null;
    }
}

// Show notification
function showNotification(message, type) {
    const notificationId = 'notification-' + Date.now();
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show notification`;
    notification.setAttribute('role', 'alert');
    notification.id = notificationId;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.getElementById('notificationContainer').appendChild(notification);
    
    // Create Bootstrap Alert instance
    const alertInstance = new bootstrap.Alert(notification);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        try {
            const alertElement = document.getElementById(notificationId);
            if (alertElement) {
                // Use the Bootstrap Alert instance to close
                alertInstance.close();
            }
        } catch (error) {
            console.error('Error closing alert:', error);
            // Fallback: try to remove manually if there's an error
            try {
                const alertElement = document.getElementById(notificationId);
                if (alertElement && alertElement.parentNode) {
                    alertElement.parentNode.removeChild(alertElement);
                }
            } catch (removeError) {
                console.error('Error manually removing alert:', removeError);
            }
        }
    }, 5000);
}

// Format address for display
function formatAddress(address) {
    if (!address) return '';
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Connect wallet
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    
    // Disconnect wallet
    document.getElementById('disconnectWallet').addEventListener('click', disconnectWallet);
    
    // Contract setup
    document.getElementById('connectToContracts').addEventListener('click', connectToContracts);
    document.getElementById('clearContractData').addEventListener('click', clearContractData);
    
    // DID Registration
    document.getElementById('registerTransporter').addEventListener('click', () => registerDID('transporter'));
    document.getElementById('registerGroundRelief').addEventListener('click', () => registerDID('groundRelief'));
    document.getElementById('registerRecipient').addEventListener('click', () => registerDID('recipient'));
    document.getElementById('checkRole').addEventListener('click', checkRole);
    document.getElementById('viewTransporters').addEventListener('click', () => viewRegisteredUsers('transporter'));
    document.getElementById('viewGroundRelief').addEventListener('click', () => viewRegisteredUsers('groundRelief'));
    document.getElementById('viewRecipients').addEventListener('click', () => viewRegisteredUsers('recipient'));
    
    // Donation
    document.getElementById('makeDonation').addEventListener('click', makeDonation);
    document.getElementById('checkBalance').addEventListener('click', checkDonorBalance);
    document.getElementById('checkTokenStatus').addEventListener('click', checkTokenStatus);
    
    // Token Assignment
    document.getElementById('selectTransporterBtn').addEventListener('click', () => showSelectionModal('transporter'));
    document.getElementById('selectGroundReliefBtn').addEventListener('click', () => showSelectionModal('groundRelief'));
    document.getElementById('selectRecipientBtn').addEventListener('click', () => showSelectionModal('recipient'));
    document.getElementById('assignRecipients').addEventListener('click', assignRecipients);
    document.getElementById('checkAssignment').addEventListener('click', checkAssignment);
    
    // Aid Tracking
    document.getElementById('checkAidStatus').addEventListener('click', checkAidStatus);
    document.getElementById('markInTransit').addEventListener('click', markInTransit);
    document.getElementById('markDelivered').addEventListener('click', markDelivered);
    document.getElementById('markClaimed').addEventListener('click', markClaimed);
    
    // System Status
    document.getElementById('refreshStatus').addEventListener('click', refreshContractInfo);
    document.getElementById('fetchEvents').addEventListener('click', fetchEvents);
    
    // Modal selection
    document.addEventListener('click', function(event) {
        // Handle address selection in the modal
        if (event.target.classList.contains('select-address')) {
            const address = event.target.getAttribute('data-address');
            const location = event.target.getAttribute('data-location');
            selectAddress(address, location);
        }
    });
    
    // Check if MetaMask is installed
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        // Check if already connected
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length > 0) {
                    userAccount = accounts[0];
                    document.getElementById('userAccount').textContent = userAccount;
                    document.getElementById('currentAccountDisplay').textContent = userAccount;
                    
                    // display/hide setting based on current status
                    document.getElementById('connectWallet').style.display = 'none';
                    document.getElementById('disconnectWallet').style.display = 'inline-block';
                    
                    // Initialize the app
                    updateNetworkInfo().then(() => {
                        // Load saved account
                        const savedAccount = localStorage.getItem(STORAGE_KEYS.LAST_ACCOUNT);
                        if (savedAccount && savedAccount.toLowerCase() !== userAccount.toLowerCase()) {
                            showNotification('Connected with a different account than last session', 'info');
                        }
                        
                        // Save current account
                        localStorage.setItem(STORAGE_KEYS.LAST_ACCOUNT, userAccount);
                        
                        // Load saved contract addresses
                        loadContractAddresses();
                    });
                    
                    // Setup MetaMask event listeners
                    setupMetaMaskEventListeners();
                }
            })
            .catch(console.error);
    }
});