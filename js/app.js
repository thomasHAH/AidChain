import * as contracts from './contracts.js';
import * as wallet from './wallet.js';
import * as registration from './registration.js';
import * as donation from './donation.js';
import * as assignment from './assignment.js';
import * as tracking from './tracking.js';
import * as ui from './ui.js';

// Create app namespace to avoid polluting global namespace
window.app = {
    // References to modules
    contracts,
    wallet,
    registration,
    donation,
    assignment,
    tracking,
    ui,

    // Global variables
    web3: null,
    userAccount: null,
    didRegistryContract: null,
    aidTokenContract: null,
    aidTokenHandlerContract: null,
    didRegistryAddress: null,
    aidTokenAddress: null,
    aidTokenHandlerAddress: null,
    selectionModalTarget: null,
    currentChainId: null,
    currentNetworkName: null,
    accountList: [],
    tokenLocations: new Map(), // Map to store token locations
    allTokenData: [], // Array to store all token data
    allAssignmentTokens: [], // Array to store all assignment tokens data
    visibleTokenCount: 8, // Number of tokens to display initially
    visibleAssignmentTokenCount: 8, // Number of assignment tokens to display initially
    currentLocationFilter: '', // Current location filter
    currentAssignmentFilter: 'unassigned' // Current assignment filter
};

/**
 * Initialize application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function () {
    // Initially hide Hide Tokens button (it will be shown when tokens are loaded)
    document.getElementById('hideTokens').style.display = 'none';

    // Connect wallet
    document.getElementById('connectWallet').addEventListener('click', window.app.wallet.connectWallet);

    // Disconnect wallet
    document.getElementById('disconnectWallet').addEventListener('click', window.app.wallet.disconnectWallet);

    // Contract setup
    document.getElementById('connectToContracts').addEventListener('click', window.app.contracts.connectToContracts);
    document.getElementById('clearContractData').addEventListener('click', window.app.contracts.clearContractData);

    // DID Registration
    document.getElementById('registerTransporter').addEventListener('click', () => window.app.registration.registerDID('transporter'));
    document.getElementById('registerGroundRelief').addEventListener('click', () => window.app.registration.registerDID('groundRelief'));
    document.getElementById('registerRecipient').addEventListener('click', () => window.app.registration.registerDID('recipient'));
    document.getElementById('checkRole').addEventListener('click', window.app.registration.checkRole);
    document.getElementById('viewTransporters').addEventListener('click', () => window.app.registration.viewRegisteredUsers('transporter'));
    document.getElementById('viewGroundRelief').addEventListener('click', () => window.app.registration.viewRegisteredUsers('groundRelief'));
    document.getElementById('viewRecipients').addEventListener('click', () => window.app.registration.viewRegisteredUsers('recipient'));

    // Donation
    document.getElementById('makeDonation').addEventListener('click', window.app.donation.makeDonation);
    document.getElementById('checkBalance').addEventListener('click', window.app.donation.checkDonorBalance);
    document.getElementById('checkTokenStatus').addEventListener('click', window.app.donation.checkTokenStatus);

    // Token Assignment
    document.getElementById('selectTransporterBtn').addEventListener('click', () => window.app.registration.showSelectionModal('transporter'));
    document.getElementById('selectGroundReliefBtn').addEventListener('click', () => window.app.registration.showSelectionModal('groundRelief'));
    document.getElementById('selectRecipientBtn').addEventListener('click', () => window.app.registration.showSelectionModal('recipient'));
    document.getElementById('assignRecipients').addEventListener('click', window.app.assignment.assignRecipients);
    document.getElementById('checkAssignment').addEventListener('click', window.app.assignment.checkAssignment);

    // Aid Tracking
    document.getElementById('checkAidStatus').addEventListener('click', window.app.tracking.checkAidStatus);
    document.getElementById('markInTransit').addEventListener('click', window.app.tracking.markInTransit);
    document.getElementById('markDelivered').addEventListener('click', window.app.tracking.markDelivered);
    document.getElementById('markClaimed').addEventListener('click', window.app.tracking.markClaimed);
    document.getElementById('loadActiveTokens').addEventListener('click', window.app.tracking.loadActiveTokensForSelection);
    document.getElementById('hideTokens').addEventListener('click', window.app.ui.hideTokenSelector);

    // System Status
    document.getElementById('refreshStatus').addEventListener('click', window.app.contracts.refreshContractInfo);
    document.getElementById('fetchEvents').addEventListener('click', window.app.tracking.fetchEvents);

    // Load More Tokens
    document.getElementById('loadMoreTokens').addEventListener('click', window.app.tracking.loadMoreTokens);

    // Location Filter
    document.getElementById('locationFilter').addEventListener('change', function () {
        window.app.currentLocationFilter = this.value;
        window.app.visibleTokenCount = 8; // Reset visible count when changing filter
        window.app.tracking.displayFilteredTokens();
    });

    // Add listener for role-based view updates
    document.addEventListener('click', function (event) {
        // Handle viewing token details from batch view
        if (event.target.classList.contains('view-token-details')) {
            const tokenId = event.target.getAttribute('data-token-id');
            window.app.tracking.selectTokenWithEffect(tokenId);
        }

        // Handle token selection from token cards
        if (event.target.classList.contains('select-token')) {
            const tokenId = event.target.getAttribute('data-token-id');
            window.app.tracking.selectTokenWithEffect(tokenId);
        }

        // Handle clicking on the whole card
        if (event.target.closest('.card') && event.target.closest('#tokenSelectorList')) {
            const card = event.target.closest('.card');
            const tokenId = card.getAttribute('data-token-id');
            if (tokenId) {
                window.app.tracking.selectTokenWithEffect(tokenId);
            }
        }

        // Handle address selection in the modal
        if (event.target.classList.contains('select-address')) {
            const address = event.target.getAttribute('data-address');
            const location = event.target.getAttribute('data-location');
            window.app.registration.selectAddress(address, location);
        }

        // Handle token selection for assignment
        if (event.target.classList.contains('select-assignment-token')) {
            const tokenId = event.target.getAttribute('data-token-id');
            window.app.assignment.selectAssignmentToken(tokenId);
        }

        // Handle clicking on the assignment token card
        if (event.target.closest('.card') && event.target.closest('#assignmentTokenList')) {
            const card = event.target.closest('.card');
            const tokenId = card.getAttribute('data-token-id');
            if (tokenId) {
                window.app.assignment.selectAssignmentToken(tokenId);
            }
        }
    });

    // Check if MetaMask is installed
    if (window.ethereum) {
        window.app.web3 = new Web3(window.ethereum);
        // Check if already connected
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length > 0) {
                    window.app.userAccount = accounts[0];
                    document.getElementById('userAccount').textContent = window.app.userAccount;
                    document.getElementById('currentAccountDisplay').textContent = window.app.userAccount;

                    // display/hide setting based on current status
                    document.getElementById('connectWallet').style.display = 'none';
                    document.getElementById('disconnectWallet').style.display = 'inline-block';

                    // Initialize the app
                    window.app.wallet.updateNetworkInfo().then(() => {
                        // Load saved account
                        const savedAccount = localStorage.getItem(window.app.contracts.STORAGE_KEYS.LAST_ACCOUNT);
                        if (savedAccount && savedAccount.toLowerCase() !== window.app.userAccount.toLowerCase()) {
                            window.app.ui.showNotification('Connected with a different account than last session', 'info');
                        }

                        // Save current account
                        localStorage.setItem(window.app.contracts.STORAGE_KEYS.LAST_ACCOUNT, window.app.userAccount);

                        // Load saved contract addresses
                        window.app.contracts.loadContractAddresses();
                    });

                    // Setup MetaMask event listeners
                    window.app.wallet.setupMetaMaskEventListeners();
                }
            })
            .catch(console.error);
    }

    // Assignment Tab
    document.getElementById('browsePendingTokens').addEventListener('click', window.app.assignment.loadPendingAssignmentTokens);
    document.getElementById('assignmentTokenFilter').addEventListener('change', function () {
        window.app.currentAssignmentFilter = this.value;
        window.app.visibleAssignmentTokenCount = 8; // Reset visible count when changing filter
        window.app.assignment.displayFilteredAssignmentTokens();
    });
    document.getElementById('loadMoreAssignmentTokens').addEventListener('click', window.app.assignment.loadMoreAssignmentTokens);
    document.getElementById('cancelAssignment').addEventListener('click', window.app.assignment.cancelAssignment);
}); 