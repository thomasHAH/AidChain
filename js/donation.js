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

        const minDonation = await window.app.aidTokenContract.methods.minDonation().call();
        const minDonationEth = window.app.web3.utils.fromWei(minDonation, 'ether');

        if (parseFloat(donationAmount) < parseFloat(minDonationEth)) {
            window.app.ui.showNotification(`Donation must be at least ${minDonationEth} ETH`, 'warning');
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

        const currentTokenBalanceEth = window.app.web3.utils.fromWei(currentTokenBalance, 'ether');
        const donationThresholdEth = window.app.web3.utils.fromWei(donationThreshold, 'ether');

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
    } catch (error) {
        console.error(error);
        window.app.ui.showNotification('Failed to check token status: ' + error.message, 'danger');
    }
}

// Export functions for use in other modules
export {
    makeDonation,
    checkDonorBalance,
    checkTokenStatus
}; 