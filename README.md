# AidChain - Blockchain-based Relief Supply Management System

AidChain is a decentralized application (dApp) built on Ethereum that enables transparent, accountable, and efficient management of humanitarian aid distribution using blockchain technology.

## Overview

AidChain leverages blockchain technology to create a transparent and accountable system for managing humanitarian aid from donors to recipients. The system uses smart contracts to track donations, assign stakeholders, and monitor the aid distribution process.

## Key Features

- **Decentralized Identity (DID) Management**: Register and verify different stakeholders in the aid distribution process (transporters, ground relief teams, and recipients)
- **Donation Management**: Accept and track donations with automatic token issuance when donation thresholds are met
- **Stakeholder Assignment**: Assign appropriate stakeholders to each aid token
- **Aid Tracking**: Monitor the status of aid distribution from donation to delivery
- **Transparent Accountability**: All transactions and assignments are recorded on the blockchain for full transparency

## Smart Contracts

The project consists of three main smart contracts:

1. **DIDRegistry**: Manages decentralized identities and roles for all stakeholders
2. **AidToken**: Handles donations and token issuance
3. **AidTokenHandler**: Manages the aid distribution process and stakeholder authentication

## Technical Stack

- **Blockchain**: Ethereum
- **Smart Contract Language**: Solidity 0.8.x
- **Development Framework**: Hardhat
- **Frontend**: HTML, CSS, JavaScript
- **Web3 Integration**: Web3.js
- **Testing**: Hardhat Waffle


## Setup and Installation

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- MetaMask or another Web3-compatible wallet

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/seungjun-Lee0/aid-chain.git
   cd AidChain
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Compile the smart contracts:
   ```
   npx hardhat compile
   ```

4. Run tests:
   ```
   npm test
   ```

### Deployment

#### Local Development

1. Start a local Hardhat node:
   ```
   npx hardhat node
   ```

2. Deploy the contracts to the local network:
   ```
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. **Contract Setup**: Connect to deployed contracts or deploy new ones
2. **DID Registration**: Register stakeholders with appropriate roles
3. **Donation**: Make donations to fund aid tokens
4. **Token Assignment**: Assign stakeholders to issued aid tokens
5. **Aid Tracking**: Track the status of aid distribution

## Deployment Order

1. Deploy the DIDRegistry contract first
2. Use the DIDRegistry address when deploying the AidToken contract
3. Use the AidToken address when deploying the AidTokenHandler contract

## CI/CD Workflow

This project uses GitHub Actions for continuous integration and continuous deployment. The workflow is configured to:

1. **Run on Push and Pull Requests**: Automatically triggered when code is pushed to main/master branches or when a pull request is created
2. **Test Environment Setup**: Uses Ubuntu with Node.js 18
3. **Dependency Management**: Installs and caches npm dependencies
4. **Code Quality Checks**: Runs Solidity linting with Solhint
5. **Automated Testing**: Executes both backend (smart contract) and frontend tests
6. **Deployment**: Vercel handles the automatic deployment after tests pass

### Testing Tasks

- **All Tests**: `npm test` - Runs all backend and frontend tests
- **Backend Tests**: `npm run test:backend` - Runs only smart contract tests
  - Tests DIDRegistry functionality (role registration, permissions)
  - Tests AidToken operations (donations, token issuance)
  - Tests AidTokenHandler processes (claim, transit, delivery verification)
- **Frontend Tests**: `npm run test:frontend` - Runs frontend component tests
  - Tests UI components using mocked Web3 and Ethereum providers
  - Verifies wallet connections and contract interactions
  - Simulates user flows for donation, registration, and tracking

### Quality Assurance

- **Solidity Linting**: `npm run lint:sol` - Runs Solhint on smart contract code
- **Security Audit**: `npm run audit:fix` - Runs npm audit and fixes issues when possible

### Deployment Tasks

- **Testnet Deployment**: `npm run deploy` - Deploys contracts to the Goerli testnet

The task system is designed to support the full development lifecycle from local development through testing and deployment to production.
