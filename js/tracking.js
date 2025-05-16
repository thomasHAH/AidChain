import { autoInitializeTokenStatus, getStatusText } from './contracts.js';

// Check aid status
async function checkAidStatus() {
    try {
        if (!window.app.aidTokenHandlerContract) {
            window.app.ui.showNotification('Please deploy or connect to AidTokenHandler contract first', 'warning');
            return;
        }

        // Get token ID from the current token info element (rather than input field)
        const tokenId = document.getElementById('currentTokenId').textContent;

        if (!tokenId || tokenId === '-') {
            window.app.ui.showNotification('Please select a token first', 'warning');
            return;
        }

        // First check if token is issued
        const isIssued = await window.app.aidTokenContract.methods.isTokenIssued(tokenId).call();
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
            window.app.ui.updateAidJourney(-1);
            return;
        }

        try {
            // Try to get status string - if this fails, token might need initialization
            const statusString = await window.app.aidTokenHandlerContract.methods.getAidStatusString(tokenId).call();

            // If status is empty or undefined, or status is "0", initialize it automatically
            if (!statusString || statusString === "" || statusString === "0") {
                await autoInitializeTokenStatus(tokenId);
                window.app.ui.showNotification(`Token ID ${tokenId} status was automatically initialized`, 'success');
            }
        } catch (error) {
            // If error occurs while getting status, try to initialize token automatically
            console.log("Error getting token status, attempting to initialize:", error);
            await autoInitializeTokenStatus(tokenId);
            window.app.ui.showNotification(`Token ID ${tokenId} status was automatically initialized`, 'success');
        }

        // Get status after initialization (or if it was already initialized)
        const statusString = await window.app.aidTokenHandlerContract.methods.getAidStatusString(tokenId).call();
        const statusEnum = await window.app.aidTokenHandlerContract.methods.aidStatus(tokenId).call();

        // Get assignment info
        const transferTeam = await window.app.aidTokenContract.methods.getTransferTeam(tokenId).call();
        const groundRelief = await window.app.aidTokenContract.methods.getGroundRelief(tokenId).call();
        const recipient = await window.app.aidTokenContract.methods.getRecipient(tokenId).call();

        const zeroAddress = '0x0000000000000000000000000000000000000000';
        let isAssigned = !(transferTeam === zeroAddress && groundRelief === zeroAddress && recipient === zeroAddress);

        let statusMessage;
        let assignmentInfo = '';

        // Check if token is assigned
        if (!isAssigned) {
            statusMessage = `Token ID ${tokenId} has been issued but has not been assigned recipients yet.`;
        } else {
            // User role indicators
            let userTransporter = transferTeam.toLowerCase() === window.app.userAccount.toLowerCase();
            let userGroundRelief = groundRelief.toLowerCase() === window.app.userAccount.toLowerCase();
            let userRecipient = recipient.toLowerCase() === window.app.userAccount.toLowerCase();

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
        window.app.ui.updateAidJourney(parseInt(statusEnum));
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to check aid status: ' + error.message, 'danger');
    }
}

// Mark token as in transit
async function markInTransit() {
    try {
        if (!window.app.aidTokenHandlerContract) {
            window.app.ui.showNotification('Please deploy or connect to AidTokenHandler contract first', 'warning');
            return;
        }

        // Get token ID from the current token info element
        const tokenId = document.getElementById('currentTokenId').textContent;

        if (!tokenId || tokenId === '-') {
            window.app.ui.showNotification('Please select a token first', 'warning');
            return;
        }

        // Check if user is the assigned transporter
        const transferTeam = await window.app.aidTokenContract.methods.getTransferTeam(tokenId).call();
        if (transferTeam.toLowerCase() !== window.app.userAccount.toLowerCase()) {
            window.app.ui.showNotification('Only the assigned Transfer Team can mark this token as In Transit', 'warning');
            return;
        }

        window.app.ui.showNotification(`Authenticating as transfer team for token ID ${tokenId}...`, 'info');

        const method = window.app.aidTokenHandlerContract.methods.authenticateTransferTeam(tokenId);
        const gas = await method.estimateGas({ from: window.app.userAccount });
        await method.send({ from: window.app.userAccount, gas: Math.round(gas * 1.2) });

        window.app.ui.showNotification(`Successfully marked token ID ${tokenId} as in transit!`, 'success');

        // Refresh aid status
        checkAidStatus();
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to authenticate as transfer team: ' + error.message, 'danger');
    }
}

// Mark token as delivered
async function markDelivered() {
    try {
        if (!window.app.aidTokenHandlerContract) {
            window.app.ui.showNotification('Please deploy or connect to AidTokenHandler contract first', 'warning');
            return;
        }

        // Get token ID from the current token info element
        const tokenId = document.getElementById('currentTokenId').textContent;

        if (!tokenId || tokenId === '-') {
            window.app.ui.showNotification('Please select a token first', 'warning');
            return;
        }

        // Check if user is the assigned ground relief
        const groundRelief = await window.app.aidTokenContract.methods.getGroundRelief(tokenId).call();
        if (groundRelief.toLowerCase() !== window.app.userAccount.toLowerCase()) {
            window.app.ui.showNotification('Only the assigned Ground Relief team can mark this token as Delivered', 'warning');
            return;
        }

        window.app.ui.showNotification(`Authenticating as ground relief for token ID ${tokenId}...`, 'info');

        const method = window.app.aidTokenHandlerContract.methods.authenticateGroundRelief(tokenId);
        const gas = await method.estimateGas({ from: window.app.userAccount });
        await method.send({ from: window.app.userAccount, gas: Math.round(gas * 1.2) });

        window.app.ui.showNotification(`Successfully marked token ID ${tokenId} as delivered!`, 'success');

        // Refresh aid status
        checkAidStatus();
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to authenticate as ground relief: ' + error.message, 'danger');
    }
}

// Mark token as claimed
async function markClaimed() {
    try {
        if (!window.app.aidTokenHandlerContract) {
            window.app.ui.showNotification('Please deploy or connect to AidTokenHandler contract first', 'warning');
            return;
        }

        // Get token ID from the current token info element
        const tokenId = document.getElementById('currentTokenId').textContent;

        if (!tokenId || tokenId === '-') {
            window.app.ui.showNotification('Please select a token first', 'warning');
            return;
        }

        // Check if user is the assigned recipient
        const recipient = await window.app.aidTokenContract.methods.getRecipient(tokenId).call();
        if (recipient.toLowerCase() !== window.app.userAccount.toLowerCase()) {
            window.app.ui.showNotification('Only the assigned Recipient can claim this token', 'warning');
            return;
        }

        window.app.ui.showNotification(`Claiming aid for token ID ${tokenId}...`, 'info');

        const method = window.app.aidTokenHandlerContract.methods.claimAid(tokenId);
        const gas = await method.estimateGas({ from: window.app.userAccount });
        await method.send({ from: window.app.userAccount, gas: Math.round(gas * 1.2) });

        window.app.ui.showNotification(`Successfully claimed token ID ${tokenId}!`, 'success');

        // Refresh aid status
        checkAidStatus();
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to claim aid: ' + error.message, 'danger');
    }
}

// Fetch events
async function fetchEvents() {
    try {
        if (!window.app.aidTokenContract || !window.app.aidTokenHandlerContract || !window.app.didRegistryContract) {
            window.app.ui.showNotification('Please deploy or connect to contracts first', 'warning');
            return;
        }

        window.app.ui.showNotification('Fetching events...', 'info');

        // Get DIDRegistry events
        const roleRegistered = await window.app.didRegistryContract.getPastEvents('RoleRegistered', {
            fromBlock: 0,
            toBlock: 'latest'
        });

        // Get AidToken events
        const aidTokenIssued = await window.app.aidTokenContract.getPastEvents('AidTokenIssued', {
            fromBlock: 0,
            toBlock: 'latest'
        });

        const donations = await window.app.aidTokenContract.getPastEvents('Donation', {
            fromBlock: 0,
            toBlock: 'latest'
        });

        const aidTokenAssigned = await window.app.aidTokenContract.getPastEvents('AidTokenAssigned', {
            fromBlock: 0,
            toBlock: 'latest'
        });

        // Get AidTokenHandler events
        const aidTransferred = await window.app.aidTokenHandlerContract.getPastEvents('AidTransferred', {
            fromBlock: 0,
            toBlock: 'latest'
        });

        const tokenStatusInitialized = await window.app.aidTokenHandlerContract.getPastEvents('TokenStatusInitialized', {
            fromBlock: 0,
            toBlock: 'latest'
        });

        // Combine and sort events
        const events = [
            ...roleRegistered.map(event => ({
                type: 'RoleRegistered',
                tokenId: '-',
                actor: event.returnValues.user,
                details: `Role: ${window.app.ui.getRoleTextFromEnum(event.returnValues.role)}, Location: ${event.returnValues.location}`,
                blockNumber: event.blockNumber
            })),
            ...aidTokenIssued.map(event => ({
                type: 'AidTokenIssued',
                tokenId: event.returnValues.tokenId,
                actor: 'System',
                details: `Donors: ${event.returnValues.donors.length}`,
                blockNumber: event.blockNumber
            })),
            ...donations.map(event => ({
                type: 'Donation',
                tokenId: event.returnValues.tokenId,
                actor: event.returnValues.donor,
                details: `Amount: ${window.app.web3.utils.fromWei(event.returnValues.amount, 'ether')} ETH`,
                blockNumber: event.blockNumber
            })),
            ...aidTokenAssigned.map(event => ({
                type: 'AidTokenAssigned',
                tokenId: event.returnValues.tokenId,
                actor: 'Relief Agency',
                details: `Assigned team and recipient`,
                blockNumber: event.blockNumber
            })),
            ...aidTransferred.map(event => ({
                type: 'AidTransferred',
                tokenId: event.returnValues.tokenId,
                actor: event.returnValues.actor,
                details: `New Status: ${getStatusText(event.returnValues.newStatus)}`,
                blockNumber: event.blockNumber
            })),
            ...tokenStatusInitialized.map(event => ({
                type: 'TokenStatusInitialized',
                tokenId: event.returnValues.tokenId,
                actor: 'System',
                details: `Token status initialized`,
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

            window.app.ui.showNotification('No events found', 'warning');
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
            let eventBadge;
            switch (event.type) {
                case 'AidTokenIssued':
                    eventBadge = 'bg-success';
                    break;
                case 'AidTransferred':
                    eventBadge = 'bg-info';
                    break;
                case 'Donation':
                    eventBadge = 'bg-primary';
                    break;
                case 'RoleRegistered':
                    eventBadge = 'bg-warning';
                    break;
                case 'AidTokenAssigned':
                    eventBadge = 'bg-dark';
                    break;
                case 'TokenStatusInitialized':
                    eventBadge = 'bg-secondary';
                    break;
                default:
                    eventBadge = 'bg-light';
            }

            typeCell.innerHTML = `<span class="badge ${eventBadge}">${event.type}</span>`;

            tokenIdCell.textContent = event.tokenId;

            // Show if actor is current user
            if (event.actor === 'System' || event.actor === 'Relief Agency') {
                actorCell.textContent = event.actor;
            } else {
                let isSelf = event.actor.toLowerCase() === window.app.userAccount.toLowerCase();
                actorCell.innerHTML = `<span class="address-display">${event.actor}</span> ${isSelf ? '<span class="badge bg-success">You</span>' : ''}`;
            }

            detailsCell.textContent = event.details;
            blockCell.textContent = event.blockNumber;
        }

        window.app.ui.showNotification(`Found ${events.length} events`, 'success');
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to fetch events: ' + error.message, 'danger');
    }
}

// Function to load active tokens for selection
async function loadActiveTokensForSelection() {
    try {
        if (!window.app.aidTokenContract) {
            window.app.ui.showNotification('Please deploy or connect to contracts first', 'warning');
            return;
        }

        const tokenIdCounter = await window.app.aidTokenContract.methods.tokenIdCounter().call();
        if (parseInt(tokenIdCounter) === 0) {
            window.app.ui.showNotification('No tokens issued yet', 'warning');
            return;
        }

        window.app.ui.showNotification('Loading active tokens...', 'info');

        // Create array of token IDs [0, 1, ..., tokenIdCounter-1]
        const tokenIds = Array.from({ length: parseInt(tokenIdCounter) }, (_, i) => i.toString());

        // Get all statuses at once if the batch function is available
        let statuses = [];
        try {
            statuses = await window.app.aidTokenHandlerContract.methods.getTokenStatusBatch(tokenIds).call();
        } catch (error) {
            // If batch function fails, we'll set empty statuses
            statuses = Array(tokenIds.length).fill("");
        }

        // Reset token data arrays
        window.app.allTokenData = [];
        window.app.tokenLocations = new Map();

        // Collect all token data
        for (let i = 0; i < tokenIds.length; i++) {
            try {
                // Check if token is issued before adding to list
                const isIssued = await window.app.aidTokenContract.methods.isTokenIssued(tokenIds[i]).call();
                if (!isIssued) continue;

                // Get location for this token
                let location = '';
                try {
                    const recipient = await window.app.aidTokenContract.methods.getRecipient(tokenIds[i]).call();
                    if (recipient && recipient !== '0x0000000000000000000000000000000000000000') {
                        location = await window.app.didRegistryContract.methods.getLocation(recipient).call();
                    }
                } catch (err) {
                    console.log(`Could not get location for token ${tokenIds[i]}:`, err);
                }

                // Get status class based on status string
                let statusClass = 'badge bg-secondary';
                let statusText = statuses[i] || 'Not initialized';
                if (statuses[i]) {
                    switch (statuses[i]) {
                        case 'Issued':
                            statusClass = 'badge bg-primary';
                            break;
                        case 'InTransit':
                            statusClass = 'badge bg-info';
                            break;
                        case 'Delivered':
                            statusClass = 'badge bg-warning';
                            break;
                        case 'Claimed':
                            statusClass = 'badge bg-success';
                            break;
                    }
                }

                // Add to token data array
                window.app.allTokenData.push({
                    id: tokenIds[i],
                    status: statusText,
                    statusClass: statusClass,
                    location: location
                });

                // Add location to set if it exists
                if (location && location !== '') {
                    if (!window.app.tokenLocations.has(location)) {
                        window.app.tokenLocations.set(location, 1);
                    } else {
                        window.app.tokenLocations.set(location, window.app.tokenLocations.get(location) + 1);
                    }
                }
            } catch (error) {
                console.error(`Error loading token ${tokenIds[i]}:`, error);
            }
        }

        // Update location filter dropdown
        updateLocationFilter();

        // Display tokens with current filter
        displayFilteredTokens();

        // Show the token selector section with fade-in animation
        const tokenSection = document.getElementById('tokenSelectorSection');
        tokenSection.style.opacity = '0';
        tokenSection.style.display = 'block';

        // Trigger reflow for animation to work properly
        void tokenSection.offsetWidth;

        // Apply smooth fade-in effect
        tokenSection.style.transition = 'opacity 0.4s ease';
        tokenSection.style.opacity = '1';

        // Show the Hide button
        document.getElementById('hideTokens').style.display = 'inline-block';

        // Change the Browse Tokens button text when tokens are displayed
        document.getElementById('loadActiveTokens').textContent = 'Refresh Tokens';

        // Show notification when everything is loaded
        if (window.app.allTokenData.length > 0) {
            window.app.ui.showNotification(`Loaded ${window.app.allTokenData.length} active tokens`, 'success');
        } else {
            window.app.ui.showNotification('No active tokens found', 'warning');
        }

    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to load tokens: ' + error.message, 'danger');
    }
}

// Update location filter dropdown
function updateLocationFilter() {
    const locationFilter = document.getElementById('locationFilter');

    // Clear existing options except the first one
    while (locationFilter.options.length > 1) {
        locationFilter.remove(1);
    }

    // Add locations to dropdown (sorted alphabetically)
    const sortedLocations = Array.from(window.app.tokenLocations.entries())
        .sort((a, b) => a[0].localeCompare(b[0]));

    sortedLocations.forEach(([location, count]) => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = `${location} (${count})`;
        locationFilter.appendChild(option);
    });

    // Show filter container with fade-in effect
    const filterContainer = document.getElementById('locationFilterContainer');
    filterContainer.style.opacity = '0';
    filterContainer.style.display = 'flex';

    // Trigger reflow for CSS transition
    void filterContainer.offsetWidth;

    // Start transition
    filterContainer.style.transition = 'opacity 0.3s ease';
    filterContainer.style.opacity = '1';
}

// Display filtered tokens
function displayFilteredTokens() {
    const tokenList = document.getElementById('tokenSelectorList');
    tokenList.innerHTML = '';

    // Apply location filter
    let filteredTokens = window.app.allTokenData;
    if (window.app.currentLocationFilter !== '') {
        filteredTokens = window.app.allTokenData.filter(token => token.location === window.app.currentLocationFilter);
    }

    // No results message
    if (filteredTokens.length === 0) {
        tokenList.innerHTML = '<div class="col-12 text-center p-4"><h5>No tokens found with the selected filter</h5></div>';
        document.getElementById('loadMoreContainer').style.display = 'none';
        return;
    }

    // Determine how many tokens to show
    const tokensToShow = Math.min(window.app.visibleTokenCount, filteredTokens.length);

    // Create token cards
    for (let i = 0; i < tokensToShow; i++) {
        createTokenCard(filteredTokens[i], tokenList);
    }

    // Show/hide load more button
    if (filteredTokens.length > window.app.visibleTokenCount) {
        document.getElementById('loadMoreContainer').style.display = 'block';
    } else {
        document.getElementById('loadMoreContainer').style.display = 'none';
    }
}

// Create a token card
function createTokenCard(tokenData, container) {
    const tokenCard = document.createElement('div');
    tokenCard.className = 'col-md-3 mb-3';
    tokenCard.innerHTML = `
        <div class="card h-100" data-token-id="${tokenData.id}">
            <div class="card-body position-relative">
                <h5 class="card-title">Token #${tokenData.id}</h5>
                ${tokenData.location ? `<span class="location-badge">${tokenData.location}</span>` : ''}
                <p class="card-text">
                    Status: <span class="${tokenData.statusClass}">${tokenData.status}</span>
                </p>
                <button class="btn btn-sm btn-primary select-token" data-token-id="${tokenData.id}">
                    Select Token
                </button>
            </div>
        </div>
    `;
    container.appendChild(tokenCard);
}

// Load more tokens
function loadMoreTokens() {
    window.app.visibleTokenCount += 8;
    displayFilteredTokens();
}

// Select token and apply highlight effect
function selectTokenWithEffect(tokenId) {
    // Remove selected class from all tokens
    const allTokenCards = document.querySelectorAll('#tokenSelectorList .card');
    allTokenCards.forEach(card => {
        card.classList.remove('selected');
        card.classList.remove('token-highlight');
    });

    // Add selected class to the clicked token
    const selectedCard = document.querySelector(`.card[data-token-id="${tokenId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        selectedCard.classList.add('token-highlight');
    }

    // Set the token ID in the current token info
    document.getElementById('currentTokenId').textContent = tokenId;
    document.getElementById('currentTokenInfo').style.display = 'block';

    // Run the check status function
    checkAidStatus();

    // Scroll to aid status result
    setTimeout(() => {
        document.getElementById('tokenStatusSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// Export functions for use in other modules
export {
    checkAidStatus,
    markInTransit,
    markDelivered,
    markClaimed,
    fetchEvents,
    loadActiveTokensForSelection,
    updateLocationFilter,
    displayFilteredTokens,
    createTokenCard,
    loadMoreTokens,
    selectTokenWithEffect
}; 