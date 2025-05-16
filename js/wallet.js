import { STORAGE_KEYS } from './contracts.js';

// Setup MetaMask event listeners
function setupMetaMaskEventListeners() {
    // Listen for account changes
    window.ethereum.on('accountsChanged', async function (accounts) {
        if (accounts.length === 0) {
            // User disconnected all accounts
            resetUI();
            window.app.ui.showNotification('Wallet disconnected', 'warning');

            // Update button visibility
            document.getElementById('connectWallet').style.display = 'inline-block';
            document.getElementById('disconnectWallet').style.display = 'none';
        } else {
            // New account selected
            window.app.userAccount = accounts[0];

            // Update UI elements
            document.getElementById('userAccount').textContent = window.app.userAccount;
            document.getElementById('currentAccountDisplay').textContent = window.app.userAccount;

            // Save to localStorage
            localStorage.setItem(STORAGE_KEYS.LAST_ACCOUNT, window.app.userAccount);

            // Update account information
            await updateAccountBalance();
            await updateAccountRole();

            // Update button visibility
            document.getElementById('connectWallet').style.display = 'none';
            document.getElementById('disconnectWallet').style.display = 'inline-block';

            window.app.ui.showNotification('Account changed to ' + window.app.ui.formatAddress(window.app.userAccount), 'info');
        }
    });

    // Listen for chain changes
    window.ethereum.on('chainChanged', async function (chainId) {
        // Handle network change - reload page as recommended by MetaMask
        window.app.ui.showNotification('Network changed. Reloading application...', 'info');
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
        window.app.ui.showNotification('Wallet disconnected from network', 'warning');

        // Update button visibility
        document.getElementById('connectWallet').style.display = 'inline-block';
        document.getElementById('disconnectWallet').style.display = 'none';
    });
}

// Update network information
async function updateNetworkInfo() {
    try {
        window.app.currentChainId = await window.app.web3.eth.getChainId();

        // Get network name
        let networkName;
        switch (window.app.currentChainId) {
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

        window.app.currentNetworkName = networkName;

        // Update UI
        document.getElementById('networkName').textContent = networkName;
        document.getElementById('chainId').textContent = window.app.currentChainId;

        // Add network badge
        let networkBadgeClass = 'network-unknown';
        if (window.app.currentChainId === 1) {
            networkBadgeClass = 'network-mainnet';
        } else if ([5, 11155111].includes(window.app.currentChainId)) {
            networkBadgeClass = 'network-testnet';
        } else if (window.app.currentChainId === 1337) {
            networkBadgeClass = 'network-local';
        }

        document.getElementById('networkName').innerHTML = `${networkName} <span class="network-badge ${networkBadgeClass}">${window.app.currentChainId}</span>`;

    } catch (error) {
        console.error('Error updating network info:', error);
    }
}

// Update account balance
async function updateAccountBalance() {
    try {
        if (!window.app.web3 || !window.app.userAccount) return;

        const balance = await window.app.web3.eth.getBalance(window.app.userAccount);
        const balanceEth = window.app.web3.utils.fromWei(balance, 'ether');

        document.getElementById('accountBalance').textContent = `${parseFloat(balanceEth).toFixed(4)} ETH`;
    } catch (error) {
        console.error('Error updating account balance:', error);
        document.getElementById('accountBalance').textContent = 'Error fetching balance';
    }
}

// Update account role
async function updateAccountRole() {
    try {
        if (!window.app.web3 || !window.app.userAccount || !window.app.didRegistryContract) {
            document.getElementById('accountRole').textContent = 'Not registered';
            return;
        }

        try {
            // Get the role ID
            const roleId = await window.app.didRegistryContract.methods.getRole(window.app.userAccount).call();
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
            let isReliefAgency = false;
            if (window.app.didRegistryContract) {
                try {
                    const reliefAgency = await window.app.didRegistryContract.methods.reliefAgency().call();
                    if (window.app.userAccount.toLowerCase() === reliefAgency.toLowerCase()) {
                        roleText = 'Relief Agency';
                        roleBadgeClass = 'role-reliefagency';
                        isReliefAgency = true;
                    }
                } catch (reliefAgencyError) {
                    console.warn('Could not check if user is relief agency:', reliefAgencyError);
                    // Continue without marking as relief agency
                }
            }

            document.getElementById('accountRole').innerHTML = `${roleText} <span class="role-badge ${roleBadgeClass}">${roleText}</span>`;

            // Update UI based on role
            await window.app.ui.updateUIBasedOnRole(isReliefAgency, parseInt(roleId));

        } catch (roleError) {
            console.error('Error getting user role:', roleError);
            window.app.ui.showNotification('Error fetching role information. The contract might not be deployed correctly.', 'warning');
            document.getElementById('accountRole').textContent = 'Error fetching role';
            window.app.ui.handleContractError(roleError);
        }
    } catch (error) {
        console.error('Error updating account role:', error);
        document.getElementById('accountRole').textContent = 'Error fetching role';
        window.app.ui.handleContractError(error);
    }
}

// Reset UI when disconnected
function resetUI() {
    window.app.userAccount = null;
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

// Connect to MetaMask wallet
async function connectWallet() {
    try {
        // Check if MetaMask is installed
        if (window.ethereum) {
            window.app.web3 = new Web3(window.ethereum);

            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            window.app.userAccount = accounts[0];

            // Update UI
            document.getElementById('userAccount').textContent = window.app.userAccount;
            document.getElementById('currentAccountDisplay').textContent = window.app.userAccount;

            // Save to localStorage
            localStorage.setItem(STORAGE_KEYS.LAST_ACCOUNT, window.app.userAccount);

            // Get network info
            await updateNetworkInfo();

            // Check account balance
            await updateAccountBalance();

            // Update account role
            await updateAccountRole();

            // Show notification
            window.app.ui.showNotification('Wallet connected successfully!', 'success');

            // Load saved contract addresses
            window.app.contracts.loadContractAddresses();

            // Setup event listeners for MetaMask events
            setupMetaMaskEventListeners();

            // Show disconnect button, hide connect button
            document.getElementById('connectWallet').style.display = 'none';
            document.getElementById('disconnectWallet').style.display = 'inline-block';

            return accounts;
        } else {
            window.app.ui.showNotification('Please install MetaMask to use this dApp', 'danger');
            return null;
        }
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to connect wallet: ' + error.message, 'danger');
        return null;
    }
}

// Disconnect wallet function
async function disconnectWallet() {
    try {
        // Reset user account and UI
        window.app.userAccount = null;
        window.app.web3 = null;

        // Clear localStorage items related to current session (except contract addresses)
        localStorage.removeItem(STORAGE_KEYS.LAST_ACCOUNT);

        // Reset UI
        resetUI();

        // Show notification
        window.app.ui.showNotification('Wallet disconnected successfully!', 'success');

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
        window.app.ui.showNotification('Failed to disconnect wallet: ' + error.message, 'danger');
        return false;
    }
}

// Check if current user is Relief Agency
async function checkIsReliefAgency() {
    try {
        if (!window.app.didRegistryContract || !window.app.userAccount) return false;

        const reliefAgency = await window.app.didRegistryContract.methods.reliefAgency().call();
        return reliefAgency.toLowerCase() === window.app.userAccount.toLowerCase();
    } catch (error) {
        console.error('Error checking relief agency:', error);
        return false;
    }
}

// Export functions for use in other modules
export {
    setupMetaMaskEventListeners,
    updateNetworkInfo,
    updateAccountBalance,
    updateAccountRole,
    resetUI,
    connectWallet,
    disconnectWallet,
    checkIsReliefAgency
}; 