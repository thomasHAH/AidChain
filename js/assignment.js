//Assign recipients to token
async function assignRecipients() {
    try {
        if (!window.app.aidTokenContract) {
            window.app.ui.showNotification('Please deploy or connect to AidToken contract first', 'warning');
            return;
        }
        
        const tokenId = document.getElementById('selectedTokenId').textContent;
        const transferTeamAddress = document.getElementById('transferTeamAddress').value;
        const groundReliefAddress = document.getElementById('groundReliefAddress').value;
        const recipientAddress = document.getElementById('recipientAddress').value;
        const location = document.getElementById('locationAssign').value;
        
        if (!tokenId || !transferTeamAddress || !groundReliefAddress || !recipientAddress || !location) {
            window.app.ui.showNotification('Please fill all required fields', 'warning');
            return;
        }
        
        // Get relief agency address
        const reliefAgency = await window.app.aidTokenContract.methods.reliefAgency().call();
        
        if (window.app.userAccount.toLowerCase() !== reliefAgency.toLowerCase()) {
            window.app.ui.showNotification('Only the relief agency can assign recipients', 'warning');
            return;
        }
        
        // Check if token is already assigned
        const token = window.app.allAssignmentTokens.find(t => t.id === tokenId);
        if (token && token.isAssigned) {
            window.app.ui.showNotification('This token has already been assigned and cannot be modified', 'warning');
            return;
        }
        
        window.app.ui.showNotification(`Assigning recipients to token ID ${tokenId}...`, 'info');
        
        const method = window.app.aidTokenContract.methods.assignAidRecipients(
            tokenId,
            transferTeamAddress,
            groundReliefAddress,
            recipientAddress,
            location
        );
        
        // Estimate gas with a buffer
        const gas = await method.estimateGas({ from: window.app.userAccount });
        await method.send({ from: window.app.userAccount, gas: Math.round(gas * 1.2) });
        
        window.app.ui.showNotification(`Successfully assigned recipients to token ID ${tokenId}!`, 'success');
        
        // Reload the tokens to update the UI
        loadPendingAssignmentTokens();
        
        // Hide the form
        document.getElementById('assignmentFormContainer').style.display = 'none';
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to assign recipients: ' + error.message, 'danger');
    }
}

/**
 * Check assignment status
 */
async function checkAssignment() {
    try {
        if (!window.app.aidTokenContract) {
            window.app.ui.showNotification('Please deploy or connect to AidToken contract first', 'warning');
            return;
        }
        
        const tokenId = document.getElementById('tokenIdCheck').value;
        
        if (!tokenId) {
            window.app.ui.showNotification('Please enter a token ID', 'warning');
            return;
        }
        
        const isIssued = await window.app.aidTokenContract.methods.isTokenIssued(tokenId).call();
        
        if (!isIssued) {
            const assignmentStatus = `<div class="alert alert-warning">Token ID ${tokenId} has not been issued yet</div>`;
            document.getElementById('assignmentStatus').innerHTML = assignmentStatus;
            document.getElementById('assignmentStatus').style.display = 'block';
            return;
        }
        
        const transferTeam = await window.app.aidTokenContract.methods.getTransferTeam(tokenId).call();
        const groundRelief = await window.app.aidTokenContract.methods.getGroundRelief(tokenId).call();
        const recipient = await window.app.aidTokenContract.methods.getRecipient(tokenId).call();
        
        const zeroAddress = '0x0000000000000000000000000000000000000000';
        let assignmentStatus;
        
        if (transferTeam === zeroAddress && groundRelief === zeroAddress && recipient === zeroAddress) {
            assignmentStatus = `<div class="alert alert-warning">Token ID ${tokenId} has not been assigned recipients yet</div>`;
        } else {
            let transferTeamRole = '';
            let groundReliefRole = '';
            let recipientRole = '';
            
            // Check if current user matches any role
            if (transferTeam.toLowerCase() === window.app.userAccount.toLowerCase()) {
                transferTeamRole = ' <span class="badge bg-success">You</span>';
            }
            if (groundRelief.toLowerCase() === window.app.userAccount.toLowerCase()) {
                groundReliefRole = ' <span class="badge bg-success">You</span>';
            }
            if (recipient.toLowerCase() === window.app.userAccount.toLowerCase()) {
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
        window.app.ui.showNotification('Failed to check assignment: ' + error.message, 'danger');
    }
}

/**
 * Load Pending Assignment Tokens
 */
async function loadPendingAssignmentTokens() {
    try {
        if (!window.app.aidTokenContract) {
            window.app.ui.showNotification('Please deploy or connect to AidToken contract first', 'warning');
            return;
        }
        
        const tokenIdCounter = await window.app.aidTokenContract.methods.tokenIdCounter().call();
        if (parseInt(tokenIdCounter) === 0) {
            window.app.ui.showNotification('No tokens issued yet', 'warning');
            return;
        }
        
        window.app.ui.showNotification('Loading available tokens...', 'info');
        
        // Create array of token IDs [0, 1, ..., tokenIdCounter-1]
        const tokenIds = Array.from({length: parseInt(tokenIdCounter)}, (_, i) => i.toString());
        
        // Reset token data array
        window.app.allAssignmentTokens = [];
        
        // Collect all token data
        for (let i = 0; i < tokenIds.length; i++) {
            try {
                // Check if token is issued
                const isIssued = await window.app.aidTokenContract.methods.isTokenIssued(tokenIds[i]).call();
                if (!isIssued) continue;
                
                // Check assignment status
                const transferTeam = await window.app.aidTokenContract.methods.getTransferTeam(tokenIds[i]).call();
                const groundRelief = await window.app.aidTokenContract.methods.getGroundRelief(tokenIds[i]).call();
                const recipient = await window.app.aidTokenContract.methods.getRecipient(tokenIds[i]).call();
                
                const zeroAddress = '0x0000000000000000000000000000000000000000';
                const isAssigned = !(transferTeam === zeroAddress && groundRelief === zeroAddress && recipient === zeroAddress);
                
                // Add to token data array
                window.app.allAssignmentTokens.push({
                    id: tokenIds[i],
                    isAssigned: isAssigned,
                    transferTeam: transferTeam,
                    groundRelief: groundRelief,
                    recipient: recipient
                });
            } catch (error) {
                console.error(`Error loading token ${tokenIds[i]}:`, error);
            }
        }
        
        // Show the token filter
        const filterContainer = document.getElementById('tokenFilterContainer');
        filterContainer.style.opacity = '0';
        filterContainer.style.display = 'block';
        setTimeout(() => {
            filterContainer.style.opacity = '1';
        }, 50);
        
        // Display filtered tokens
        displayFilteredAssignmentTokens();
        
        // Show the token selector section
        document.getElementById('assignmentTokenSelector').style.display = 'block';
        
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to load tokens: ' + error.message, 'danger');
    }
}

/**
 * Display filtered assignment tokens
 */
function displayFilteredAssignmentTokens() {
    const tokenList = document.getElementById('assignmentTokenList');
    tokenList.innerHTML = '';
    
    // Apply filter
    let filteredTokens = [...window.app.allAssignmentTokens];
    
    if (window.app.currentAssignmentFilter === 'unassigned') {
        filteredTokens = window.app.allAssignmentTokens.filter(token => !token.isAssigned);
    } else if (window.app.currentAssignmentFilter === 'assigned') {
        filteredTokens = window.app.allAssignmentTokens.filter(token => token.isAssigned);
    }
    
    // No results message
    if (filteredTokens.length === 0) {
        tokenList.innerHTML = '<div class="col-12 text-center p-4"><h5>No tokens found with the selected filter</h5></div>';
        document.getElementById('assignmentLoadMoreContainer').style.display = 'none';
        return;
    }
    
    // Determine how many tokens to show
    const tokensToShow = Math.min(window.app.visibleAssignmentTokenCount, filteredTokens.length);
    
    // Create token cards
    for (let i = 0; i < tokensToShow; i++) {
        createAssignmentTokenCard(filteredTokens[i], tokenList);
    }
    
    // Show/hide load more button
    if (filteredTokens.length > window.app.visibleAssignmentTokenCount) {
        document.getElementById('assignmentLoadMoreContainer').style.display = 'block';
    } else {
        document.getElementById('assignmentLoadMoreContainer').style.display = 'none';
    }
}

/**
 * Create an assignment token card
 */
function createAssignmentTokenCard(tokenData, container) {
    const tokenCard = document.createElement('div');
    tokenCard.className = 'col-md-3 mb-3';
    
    const badgeText = tokenData.isAssigned ? 'Assigned' : 'Unassigned';
    const badgeClass = tokenData.isAssigned ? 'badge-assigned' : 'badge-unassigned';
    const buttonText = tokenData.isAssigned ? 'View Assignment' : 'Assign Stakeholders';
    
    tokenCard.innerHTML = `
        <div class="card h-100" data-token-id="${tokenData.id}">
            <div class="card-body position-relative">
                <h5 class="card-title">Token #${tokenData.id}</h5>
                <span class="token-badge ${badgeClass}">${badgeText}</span>
                <p class="card-text">
                    Status: ${tokenData.isAssigned ? 'Has assigned stakeholders' : 'Ready for assignment'}
                </p>
                <button class="btn btn-sm ${tokenData.isAssigned ? 'btn-info' : 'btn-primary'} select-assignment-token" data-token-id="${tokenData.id}">
                    ${buttonText}
                </button>
            </div>
        </div>
    `;
    container.appendChild(tokenCard);
}

/**
 * Load more assignment tokens
 */
function loadMoreAssignmentTokens() {
    window.app.visibleAssignmentTokenCount += 8;
    displayFilteredAssignmentTokens();
}

/**
 * Select assignment token
 */
function selectAssignmentToken(tokenId) {
    // Remove selected class from all tokens
    const allTokenCards = document.querySelectorAll('#assignmentTokenList .card');
    allTokenCards.forEach(card => {
        card.classList.remove('selected');
        card.classList.remove('token-highlight');
    });
    
    // Add selected class to the clicked token
    const selectedCard = document.querySelector(`#assignmentTokenList .card[data-token-id="${tokenId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        selectedCard.classList.add('token-highlight');
    }
    
    // Set the selected token ID
    document.getElementById('selectedTokenId').textContent = tokenId;
    
    // Show assignment form
    const formContainer = document.getElementById('assignmentFormContainer');
    formContainer.style.display = 'block';
    formContainer.classList.remove('animate');
    
    // Force reflow to restart animation
    void formContainer.offsetWidth;
    
    // Add animation class
    formContainer.classList.add('animate');
    
    // Load existing assignment if available
    loadExistingAssignment(tokenId);
}

/**
 * Load existing assignment for a token
 */
async function loadExistingAssignment(tokenId) {
    try {
        // Clear form first
        document.getElementById('transferTeamAddress').value = '';
        document.getElementById('groundReliefAddress').value = '';
        document.getElementById('recipientAddress').value = '';
        document.getElementById('locationAssign').value = '';
        
        // Remove read-only class from form container
        document.getElementById('assignmentFormContainer').classList.remove('read-only');
        
        // Find the token in our data
        const token = window.app.allAssignmentTokens.find(t => t.id === tokenId);
        
        if (token && token.isAssigned) {
            // Load assignment data
            document.getElementById('transferTeamAddress').value = token.transferTeam;
            document.getElementById('groundReliefAddress').value = token.groundRelief;
            document.getElementById('recipientAddress').value = token.recipient;
            
            // Add more details about assigned roles
            let transferTeamRole = '';
            let groundReliefRole = '';
            let recipientRole = '';
            let location = '';
            
            // Get role and location information
            try {
                if (token.transferTeam && token.transferTeam !== '0x0000000000000000000000000000000000000000') {
                    // Check if current user matches
                    if (token.transferTeam.toLowerCase() === window.app.userAccount.toLowerCase()) {
                        transferTeamRole = ' (You)';
                    }
                }
                
                if (token.groundRelief && token.groundRelief !== '0x0000000000000000000000000000000000000000') {
                    // Check if current user matches
                    if (token.groundRelief.toLowerCase() === window.app.userAccount.toLowerCase()) {
                        groundReliefRole = ' (You)';
                    }
                }
                
                if (token.recipient && token.recipient !== '0x0000000000000000000000000000000000000000') {
                    // Get location from recipient
                    location = await window.app.didRegistryContract.methods.getLocation(token.recipient).call();
                    document.getElementById('locationAssign').value = location;
                    
                    // Check if current user matches
                    if (token.recipient.toLowerCase() === window.app.userAccount.toLowerCase()) {
                        recipientRole = ' (You)';
                    }
                }
            } catch (err) {
                console.log('Could not get role information:', err);
            }
            
            // Add role information to labels
            document.querySelector('label[for="transferTeamAddress"]').innerHTML = 
                `Transfer Team Address:${transferTeamRole}`;
            document.querySelector('label[for="groundReliefAddress"]').innerHTML = 
                `Ground Relief Address:${groundReliefRole}`;
            document.querySelector('label[for="recipientAddress"]').innerHTML = 
                `Recipient Address:${recipientRole}`;
            
            // Make fields read-only for assigned tokens
            document.getElementById('transferTeamAddress').readOnly = true;
            document.getElementById('groundReliefAddress').readOnly = true;
            document.getElementById('recipientAddress').readOnly = true;
            document.getElementById('locationAssign').readOnly = true;
            
            // Disable selection buttons
            document.getElementById('selectTransporterBtn').disabled = true;
            document.getElementById('selectGroundReliefBtn').disabled = true;
            document.getElementById('selectRecipientBtn').disabled = true;
            
            // Change assign button to view-only
            const assignButton = document.getElementById('assignRecipients');
            assignButton.textContent = 'Token Already Assigned';
            assignButton.disabled = true;
            assignButton.classList.remove('btn-primary');
            assignButton.classList.add('btn-secondary');
            
            // Add read-only class to form container
            document.getElementById('assignmentFormContainer').classList.add('read-only');
            
            // Don't show notification here - rely on the CSS content property to display the message
            // This prevents duplicate notifications
        } else {
            // Enable fields for unassigned tokens
            document.getElementById('transferTeamAddress').readOnly = false;
            document.getElementById('groundReliefAddress').readOnly = false;
            document.getElementById('recipientAddress').readOnly = false;
            document.getElementById('locationAssign').readOnly = false;
            
            // Reset labels
            document.querySelector('label[for="transferTeamAddress"]').textContent = 'Transfer Team Address:';
            document.querySelector('label[for="groundReliefAddress"]').textContent = 'Ground Relief Address:';
            document.querySelector('label[for="recipientAddress"]').textContent = 'Recipient Address:';
            
            // Enable selection buttons
            document.getElementById('selectTransporterBtn').disabled = false;
            document.getElementById('selectGroundReliefBtn').disabled = false;
            document.getElementById('selectRecipientBtn').disabled = false;
            
            // Reset assign button
            const assignButton = document.getElementById('assignRecipients');
            assignButton.textContent = 'Assign Recipients';
            assignButton.disabled = false;
            assignButton.classList.remove('btn-secondary');
            assignButton.classList.add('btn-primary');
        }
    } catch (error) {
        console.error('Error loading existing assignment:', error);
    }
}

/**
 * Cancel assignment
 */
function cancelAssignment() {
    // Hide assignment form
    document.getElementById('assignmentFormContainer').style.display = 'none';
    
    // Remove selected class from tokens
    const allTokenCards = document.querySelectorAll('#assignmentTokenList .card');
    allTokenCards.forEach(card => {
        card.classList.remove('selected');
    });
}

// Export functions for use in other modules
export {
    assignRecipients,
    checkAssignment,
    loadPendingAssignmentTokens,
    displayFilteredAssignmentTokens,
    createAssignmentTokenCard,
    loadMoreAssignmentTokens,
    selectAssignmentToken,
    loadExistingAssignment,
    cancelAssignment
}; 