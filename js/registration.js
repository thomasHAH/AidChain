// Register DID
async function registerDID(roleType) {
    try {
        if (!window.app.didRegistryContract) {
            window.app.ui.showNotification('Please deploy or connect to DIDRegistry contract first', 'warning');
            return;
        }

        const address = document.getElementById('didAddress').value || window.app.userAccount;
        const location = document.getElementById('didLocation').value;

        if (!location) {
            window.app.ui.showNotification('Please enter a location', 'warning');
            return;
        }

        // Check if the current user is reliefAgency
        const reliefAgency = await window.app.didRegistryContract.methods.reliefAgency().call();
        if (reliefAgency.toLowerCase() !== window.app.userAccount.toLowerCase()) {
            window.app.ui.showNotification('Only the Relief Agency can register DIDs', 'warning');
            return;
        }

        let method;
        let roleText;

        switch (roleType) {
            case 'transporter':
                method = window.app.didRegistryContract.methods.registerTransporterDID(address, location);
                roleText = 'Transporter';
                break;
            case 'groundRelief':
                method = window.app.didRegistryContract.methods.registerGroundReliefDID(address, location);
                roleText = 'Ground Relief';
                break;
            case 'recipient':
                method = window.app.didRegistryContract.methods.registerRecipientDID(address, location);
                roleText = 'Recipient';
                break;
        }

        window.app.ui.showNotification(`Registering ${window.app.ui.formatAddress(address)} as ${roleText}...`, 'info');

        // Estimate gas
        const gas = await method.estimateGas({ from: window.app.userAccount });
        await method.send({ from: window.app.userAccount, gas: Math.round(gas * 1.2) });

        // If registering the current user, update role display
        if (address.toLowerCase() === window.app.userAccount.toLowerCase()) {
            await window.app.wallet.updateAccountRole();
        }

        window.app.ui.showNotification(`Successfully registered ${window.app.ui.formatAddress(address)} as ${roleText}!`, 'success');
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to register DID: ' + error.message, 'danger');
    }
}

// Check role of an address
async function checkRole() {
    try {
        if (!window.app.didRegistryContract) {
            window.app.ui.showNotification('Please deploy or connect to DIDRegistry contract first', 'warning');
            return;
        }

        const address = document.getElementById('checkAddressRole').value || window.app.userAccount;

        if (!address) {
            window.app.ui.showNotification('Please enter an address to check', 'warning');
            return;
        }

        const roleId = await window.app.didRegistryContract.methods.getRole(address).call();
        const location = await window.app.didRegistryContract.methods.getLocation(address).call();
        const didInfo = await window.app.didRegistryContract.methods.dids(address).call();

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
        if (window.app.aidTokenContract) {
            const reliefAgency = await window.app.aidTokenContract.methods.reliefAgency().call();
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
        window.app.ui.showNotification('Failed to check role: ' + error.message, 'danger');
    }
}

// View registered users by role
async function viewRegisteredUsers(roleType) {
    try {
        if (!window.app.didRegistryContract) {
            window.app.ui.showNotification('Please deploy or connect to DIDRegistry contract first', 'warning');
            return;
        }

        let method;
        let roleText;

        switch (roleType) {
            case 'transporter':
                method = window.app.didRegistryContract.methods.getAllTransporters();
                roleText = 'Transporter';
                break;
            case 'groundRelief':
                method = window.app.didRegistryContract.methods.getAllGroundRelief();
                roleText = 'Ground Relief';
                break;
            case 'recipient':
                method = window.app.didRegistryContract.methods.getAllRecipients();
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

            window.app.ui.showNotification(`No ${roleText} addresses registered`, 'warning');
            return;
        }

        // Populate table
        for (const address of addresses) {
            try {
                const location = await window.app.didRegistryContract.methods.getLocation(address).call();

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

        window.app.ui.showNotification(`Found ${addresses.length} registered ${roleText} addresses`, 'success');
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to fetch registered users: ' + error.message, 'danger');
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

// Show addresses in selection modal
async function showSelectionModal(roleType) {
    try {
        if (!window.app.didRegistryContract) {
            window.app.ui.showNotification('Please deploy or connect to DIDRegistry contract first', 'warning');
            return;
        }

        let method;
        let roleText;

        switch (roleType) {
            case 'transporter':
                method = window.app.didRegistryContract.methods.getAllTransporters();
                roleText = 'Transporters';
                window.app.selectionModalTarget = 'transferTeamAddress';
                break;
            case 'groundRelief':
                method = window.app.didRegistryContract.methods.getAllGroundRelief();
                roleText = 'Ground Relief';
                window.app.selectionModalTarget = 'groundReliefAddress';
                break;
            case 'recipient':
                method = window.app.didRegistryContract.methods.getAllRecipients();
                roleText = 'Recipients';
                window.app.selectionModalTarget = 'recipientAddress';
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
                    const location = await window.app.didRegistryContract.methods.getLocation(address).call();

                    const row = tableBody.insertRow();
                    const addressCell = row.insertCell(0);
                    const locationCell = row.insertCell(1);
                    const actionCell = row.insertCell(2);

                    // Check if this is the current user
                    const isSelf = address.toLowerCase() === window.app.userAccount.toLowerCase();

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
        window.app.ui.showNotification('Failed to fetch addresses: ' + error.message, 'danger');
    }
}

// Select address from modal
function selectAddress(address, location) {
    document.getElementById(window.app.selectionModalTarget).value = address;
    if (window.app.selectionModalTarget === 'transferTeamAddress' || window.app.selectionModalTarget === 'groundReliefAddress' || window.app.selectionModalTarget === 'recipientAddress') {
        document.getElementById('locationAssign').value = location;
    }
}

// Export functions for use in other modules
export {
    registerDID,
    checkRole,
    viewRegisteredUsers,
    getRoleBadgeClass,
    showSelectionModal,
    selectAddress
}; 