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

// Update UI based on user role
async function updateUIBasedOnRole(isReliefAgency, roleId) {
    try {
        if (!window.app.userAccount) return;

        // Set defaults for elements that might not exist
        const safeSetDisplay = (elementId, displayValue) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.display = displayValue;
            }
        };

        // Show/hide tabs based on role
        // Only Relief Agency can access certain tabs
        const tabVisibility = {
            'contracts-tab': true, // Contract Setup - Show tab but hide content if not Relief Agency
            'registration-tab': true, // DID Registration - Show tab but hide content if not Relief Agency
            'donation-tab': true, // Donation - Everyone can access
            'assignment-tab': true, // Token Assignment - Show tab but hide content if not Relief Agency
            'tracking-tab': true, // Aid Tracking - Everyone can access
            'status-tab': true // System Status - Everyone can access
        };

        // Apply tab visibility
        for (const [tabId, isVisible] of Object.entries(tabVisibility)) {
            const tab = document.getElementById(tabId);
            if (tab) {
                tab.style.display = isVisible ? 'block' : 'none';
            }
        }

        // Show/hide content sections for Relief Agency role-specific tabs
        // Contract setup tab
        safeSetDisplay('contracts-content', isReliefAgency ? 'block' : 'none');
        safeSetDisplay('contracts-role-alert', isReliefAgency ? 'none' : 'block');

        // Registration tab
        safeSetDisplay('registration-controls', isReliefAgency ? 'block' : 'none');
        safeSetDisplay('registration-agency-notice', isReliefAgency ? 'none' : 'block');
        safeSetDisplay('registration-role-alert', isReliefAgency ? 'none' : 'block');

        // Assignment tab
        safeSetDisplay('assignment-controls', isReliefAgency ? 'block' : 'none');
        safeSetDisplay('assignment-notice', isReliefAgency ? 'none' : 'block');
        safeSetDisplay('assignment-role-alert', isReliefAgency ? 'none' : 'block');

        // Tracking tab - show appropriate buttons based on role
        safeSetDisplay('markInTransit', (roleId === 1) ? 'block' : 'none'); // Transporter
        safeSetDisplay('markDelivered', (roleId === 2) ? 'block' : 'none'); // Ground Relief
        safeSetDisplay('markClaimed', (roleId === 3) ? 'block' : 'none'); // Recipient

    } catch (error) {
        console.error('Error updating UI based on role:', error);
        // Don't show a notification here as it's not critical for user experience
        // and could be distracting if there's an issue with UI updates
    }
}

// Helper function to get role text from enum value
function getRoleTextFromEnum(roleEnum) {
    switch (parseInt(roleEnum)) {
        case 0:
            return 'None';
        case 1:
            return 'Transporter';
        case 2:
            return 'Ground Relief';
        case 3:
            return 'Recipient';
        default:
            return 'Unknown';
    }
}

// Utility function to handle contract errors
function handleContractError(error) {
    if (!error) return;

    let errorMessage = 'An unknown error occurred';

    if (error.message) {
        if (error.message.includes('revert')) {
            errorMessage = 'Transaction was reverted by the contract. This may be due to failing conditions in the contract.';
        } else if (error.message.includes('gas')) {
            errorMessage = 'Transaction failed due to gas issues. Try increasing gas limit or simplifying the operation.';
        } else if (error.message.includes('Internal JSON-RPC error')) {
            errorMessage = 'Internal blockchain error. The contracts might not be deployed correctly or compatible with the current network.';
        } else {
            errorMessage = error.message;
        }
    }

    if (error.data) {
        try {
            // Some errors have more detailed information in the data field
            console.log('Additional error data:', error.data);
        } catch (e) { }
    }

    showNotification(errorMessage, 'danger');
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

// Hide token selector section
function hideTokenSelector() {
    // Hide the token selector section with a smooth fade-out effect
    const tokenSection = document.getElementById('tokenSelectorSection');
    tokenSection.style.opacity = '1';

    // Start transition
    tokenSection.style.transition = 'opacity 0.3s ease';
    tokenSection.style.opacity = '0';

    // After transition completes, hide the element
    setTimeout(() => {
        tokenSection.style.display = 'none';
        // Reset the transition so it doesn't affect future operations
        tokenSection.style.transition = '';
    }, 300);

    // Also hide the filter container
    document.getElementById('locationFilterContainer').style.display = 'none';

    // Change the Browse Tokens button text back to original
    document.getElementById('loadActiveTokens').textContent = 'Browse Tokens';

    // Show notification
    showNotification('Token display hidden successfully', 'info');
}

// Export functions for use in other modules
export {
    showNotification,
    formatAddress,
    updateUIBasedOnRole,
    getRoleTextFromEnum,
    handleContractError,
    updateAidJourney,
    hideTokenSelector
}; 