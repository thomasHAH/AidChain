// Make a donation
async function makeDonation() {
    try {
        if (!window.app.aidTokenContract) {
            window.app.ui.showNotification('Please deploy or connect to AidToken contract first', 'warning');
            return;
        }

        const donationAmount = document.getElementById('donationAmount').value;

        if (!donationAmount || parseFloat(donationAmount) <= 0) {
            window.app.ui.showNotification('Please enter a valid donation amount', 'warning');
            return;
        }

        // Check minimum donation amount
        const minDonation = await window.app.aidTokenContract.methods.minDonation().call();
        const minDonationEth = window.app.web3.utils.fromWei(minDonation, 'ether');

        if (parseFloat(donationAmount) < parseFloat(minDonationEth)) {
            window.app.ui.showNotification(`Donation must be at least ${minDonationEth} ETH`, 'warning');
            return;
        }

        // Check maximum donation amount based on MAX_TOKENS_PER_TRANSACTION
        const maxTokensPerTx = await window.app.aidTokenContract.methods.MAX_TOKENS_PER_TRANSACTION().call();
        const donationThreshold = await window.app.aidTokenContract.methods.donationThreshold().call();
        const maxDonationWei = BigInt(maxTokensPerTx) * BigInt(donationThreshold);
        const maxDonationEth = window.app.web3.utils.fromWei(maxDonationWei.toString(), 'ether');

        if (parseFloat(donationAmount) > parseFloat(maxDonationEth)) {
            window.app.ui.showNotification(`Maximum donation per transaction is ${maxDonationEth} ETH due to gas limitations. For larger amounts, please make multiple donations.`, 'warning');
            return;
        }

        window.app.ui.showNotification(`Processing donation of ${donationAmount} ETH...`, 'info');

        const donationWei = window.app.web3.utils.toWei(donationAmount, 'ether');
        await window.app.aidTokenContract.methods.donate().send({
            from: window.app.userAccount,
            value: donationWei
        });

        window.app.ui.showNotification('Donation processed successfully!', 'success');

        // Update token status and account balance
        checkTokenStatus();
        window.app.wallet.updateAccountBalance();
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to make donation: ' + error.message, 'danger');
    }
}

// Check donor balance
async function checkDonorBalance() {
    try {
        if (!window.app.aidTokenContract) {
            window.app.ui.showNotification('Please deploy or connect to AidToken contract first', 'warning');
            return;
        }

        const balance = await window.app.aidTokenContract.methods.donorBalances(window.app.userAccount).call();
        const balanceEth = window.app.web3.utils.fromWei(balance, 'ether');

        const balanceElement = document.getElementById('donorBalance');
        balanceElement.innerHTML = `Your total donation balance is <strong>${balanceEth} ETH</strong>`;
        balanceElement.style.display = 'block';
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to check balance: ' + error.message, 'danger');
    }
}

// Check token status
async function checkTokenStatus() {
    try {
        if (!window.app.aidTokenContract) {
            window.app.ui.showNotification('Please deploy or connect to AidToken contract first', 'warning');
            return;
        }

        const tokenIdCounter = await window.app.aidTokenContract.methods.tokenIdCounter().call();
        const currentTokenBalance = await window.app.aidTokenContract.methods.currentTokenBalance().call();
        const donationThreshold = await window.app.aidTokenContract.methods.donationThreshold().call();
        const maxTokensPerTx = await window.app.aidTokenContract.methods.MAX_TOKENS_PER_TRANSACTION().call();

        const currentTokenBalanceEth = window.app.web3.utils.fromWei(currentTokenBalance, 'ether');
        const donationThresholdEth = window.app.web3.utils.fromWei(donationThreshold, 'ether');

        // Calculate maximum donation per transaction
        const maxDonationWei = BigInt(maxTokensPerTx) * BigInt(donationThreshold);
        const maxDonationEth = window.app.web3.utils.fromWei(maxDonationWei.toString(), 'ether');

        // Update UI
        document.getElementById('tokenIdCounter').textContent = tokenIdCounter;
        document.getElementById('currentTokenBalance').textContent = `${currentTokenBalanceEth} ETH / ${donationThresholdEth} ETH`;

        // Calculate progress percentage
        const progressPercentage = (parseFloat(currentTokenBalance) / parseFloat(donationThreshold)) * 100;
        const progressBar = document.getElementById('tokenProgress');
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.textContent = `${progressPercentage.toFixed(2)}%`;

        // Update donation threshold displays
        document.getElementById('minDonation').textContent = `${window.app.web3.utils.fromWei(await window.app.aidTokenContract.methods.minDonation().call(), 'ether')} ETH`;
        document.getElementById('donationThreshold').textContent = `${donationThresholdEth} ETH`;
        
        // Update max donation info
        const maxDonationInfo = document.getElementById('maxDonationInfo');
        if (maxDonationInfo) {
            maxDonationInfo.innerHTML = `
                <div class="alert alert-info">
                    <strong>Maximum Donation Limit:</strong> ${maxDonationEth} ETH per transaction.
                    <br>
                    <small>This limit exists to prevent transaction gas limits from being exceeded. 
                    For larger donations, please make multiple smaller transactions.</small>
                </div>
            `;
        }
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to check token status: ' + error.message, 'danger');
    }
}

// Initialize donation UI components
function initDonationUI() {
    // Create max donation info element if it doesn't exist
    if (!document.getElementById('maxDonationInfo')) {
        const donationForm = document.getElementById('donationForm') || document.querySelector('form');
        if (donationForm) {
            const infoDiv = document.createElement('div');
            infoDiv.id = 'maxDonationInfo';
            donationForm.appendChild(infoDiv);
        }
    }
    
    // Initial check of token status and max donation
    checkTokenStatus();
}

// Export functions for use in other modules
export {
    makeDonation,
    checkDonorBalance,
    checkTokenStatus,
    initDonationUI
}; 