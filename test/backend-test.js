const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AidChain Contracts", function () {
  let didRegistry;
  let aidToken;
  let aidTokenHandler;
  let reliefAgency;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let addr5;
  let addr6;

  beforeEach(async function () {
    // Get signers for testing
    [owner, reliefAgency, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();
    
    // Deploy DIDRegistry with relief agency address
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    didRegistry = await DIDRegistry.deploy(reliefAgency.address);
    await didRegistry.deployed();
    
    // Deploy AidToken with relief agency address and DIDRegistry address
    const AidToken = await ethers.getContractFactory("AidToken");
    aidToken = await AidToken.deploy(reliefAgency.address, didRegistry.address);
    await aidToken.deployed();
    
    // Deploy AidTokenHandler with AidToken address
    const AidTokenHandler = await ethers.getContractFactory("AidTokenHandler");
    aidTokenHandler = await AidTokenHandler.deploy(aidToken.address);
    await aidTokenHandler.deployed();
  });

  describe("DIDRegistry", function () {
    it("Relief agency should be set correctly", async function () {
      expect(await didRegistry.reliefAgency()).to.equal(reliefAgency.address);
    });

    it("Should register a transporter correctly", async function () {
      await didRegistry.connect(reliefAgency).registerTransporterDID(addr1.address, "FIJI");
      expect(await didRegistry.getRole(addr1.address)).to.equal(1); // 1 = Transporter role
      expect(await didRegistry.getLocation(addr1.address)).to.equal("FIJI");
    });
    
    it("Should register a ground relief correctly", async function () {
      await didRegistry.connect(reliefAgency).registerGroundReliefDID(addr2.address, "FIJI");
      expect(await didRegistry.getRole(addr2.address)).to.equal(2); // 2 = GroundRelief role
      expect(await didRegistry.getLocation(addr2.address)).to.equal("FIJI");
    });
    
    it("Should register a recipient correctly", async function () {
      await didRegistry.connect(reliefAgency).registerRecipientDID(addr3.address, "FIJI");
      expect(await didRegistry.getRole(addr3.address)).to.equal(3); // 3 = Recipient role
      expect(await didRegistry.getLocation(addr3.address)).to.equal("FIJI");
    });

    it("Should emit RoleRegistered event when registering a role", async function () {
      await expect(didRegistry.connect(reliefAgency).registerTransporterDID(addr1.address, "FIJI"))
        .to.emit(didRegistry, "RoleRegistered")
        .withArgs(addr1.address, 1, "FIJI"); // address, Role.Transporter, location
    });

    it("Should return empty arrays when no users are registered", async function () {
      expect(await didRegistry.getAllTransporters()).to.be.an('array').that.is.empty;
      expect(await didRegistry.getAllGroundRelief()).to.be.an('array').that.is.empty;
      expect(await didRegistry.getAllRecipients()).to.be.an('array').that.is.empty;
    });

    it("Should correctly add and retrieve multiple registered users", async function () {
      // Register multiple users of each type
      await didRegistry.connect(reliefAgency).registerTransporterDID(addr1.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerTransporterDID(addr4.address, "PNG");
      
      await didRegistry.connect(reliefAgency).registerGroundReliefDID(addr2.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerGroundReliefDID(addr5.address, "SAMOA");
      
      await didRegistry.connect(reliefAgency).registerRecipientDID(addr3.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerRecipientDID(addr6.address, "VANUATU");
      
      // Check getAllTransporters
      const transporters = await didRegistry.getAllTransporters();
      expect(transporters).to.have.lengthOf(2);
      expect(transporters).to.include(addr1.address);
      expect(transporters).to.include(addr4.address);
      
      // Check getAllGroundRelief
      const groundRelief = await didRegistry.getAllGroundRelief();
      expect(groundRelief).to.have.lengthOf(2);
      expect(groundRelief).to.include(addr2.address);
      expect(groundRelief).to.include(addr5.address);
      
      // Check getAllRecipients
      const recipients = await didRegistry.getAllRecipients();
      expect(recipients).to.have.lengthOf(2);
      expect(recipients).to.include(addr3.address);
      expect(recipients).to.include(addr6.address);
    });

    it("Should not allow non-relief agency to register users", async function () {
      // Try to register as non-relief agency
      await expect(
        didRegistry.connect(addr1).registerTransporterDID(addr1.address, "FIJI")
      ).to.be.revertedWith("Only relief agency can call this function");
      
      await expect(
        didRegistry.connect(addr1).registerGroundReliefDID(addr2.address, "FIJI")
      ).to.be.revertedWith("Only relief agency can call this function");
      
      await expect(
        didRegistry.connect(addr1).registerRecipientDID(addr3.address, "FIJI")
      ).to.be.revertedWith("Only relief agency can call this function");
    });

    it("Should allow relief agency to transfer its role", async function () {
      // Transfer relief agency role to addr1
      await didRegistry.connect(reliefAgency).transferReliefAgency(addr1.address);
      expect(await didRegistry.reliefAgency()).to.equal(addr1.address);
      
      // Old relief agency should no longer have permission
      await expect(
        didRegistry.connect(reliefAgency).registerTransporterDID(addr2.address, "FIJI")
      ).to.be.revertedWith("Only relief agency can call this function");
      
      // New relief agency should have permission
      await expect(
        didRegistry.connect(addr1).registerTransporterDID(addr2.address, "FIJI")
      ).to.not.be.reverted;
    });
  });

  describe("AidToken", function () {
    it("Should accept donations and issue tokens when threshold is met", async function () {
      // Send a donation that exceeds the threshold
      const donationAmount = ethers.utils.parseEther("0.4"); // Above threshold of 0.32 ETH
      await aidToken.connect(addr1).donate({ value: donationAmount });
      
      // Check if token is issued
      expect(await aidToken.tokenIdCounter()).to.equal(1);
      expect(await aidToken.isTokenIssued(0)).to.equal(true);
    });

    it("Should emit Donation event when receiving donations", async function () {
      const donationAmount = ethers.utils.parseEther("0.4");
      await expect(
        aidToken.connect(addr1).donate({ value: donationAmount })
      ).to.emit(aidToken, "Donation");
    });

    it("Should track donor balances correctly", async function () {
      const donationAmount1 = ethers.utils.parseEther("0.2");
      const donationAmount2 = ethers.utils.parseEther("0.1");
      
      // Donate from addr1
      await aidToken.connect(addr1).donate({ value: donationAmount1 });
      expect(await aidToken.donorBalances(addr1.address)).to.equal(donationAmount1);
      
      // Donate again from addr1
      await aidToken.connect(addr1).donate({ value: donationAmount2 });
      expect(await aidToken.donorBalances(addr1.address)).to.equal(
        donationAmount1.add(donationAmount2)
      );
      
      // Donate from addr2
      await aidToken.connect(addr2).donate({ value: donationAmount2 });
      expect(await aidToken.donorBalances(addr2.address)).to.equal(donationAmount2);
    });

    it("Should track current token balance correctly", async function () {
      const donationAmount = ethers.utils.parseEther("0.2"); // Below threshold
      
      // Initial balance should be zero
      expect(await aidToken.currentTokenBalance()).to.equal(0);
      
      // After donation
      await aidToken.connect(addr1).donate({ value: donationAmount });
      expect(await aidToken.currentTokenBalance()).to.equal(donationAmount);
    });

    it("Should reject donations below minimum", async function () {
      const minDonation = await aidToken.minDonation();
      const lowDonation = minDonation.sub(1); // 1 wei below minimum
      
      await expect(
        aidToken.connect(addr1).donate({ value: lowDonation })
      ).to.be.revertedWith("Donation must be at least $20");
    });

    it("Should emit AidTokenIssued event when threshold is met", async function () {
      const donationAmount = ethers.utils.parseEther("0.4"); // Above threshold
      
      await expect(aidToken.connect(addr1).donate({ value: donationAmount }))
        .to.emit(aidToken, "AidTokenIssued")
        .withArgs(0, [addr1.address]); // First token ID is 0
    });

    it("Should limit the number of tokens created in one transaction", async function () {
      // Donate enough to create MAX_TOKENS_PER_TRANSACTION tokens (5) 
      const donationAmount = ethers.utils.parseEther("1.6"); // 5 * 0.32 = 1.6
      await aidToken.connect(addr1).donate({ value: donationAmount });
      
      // Should have created 5 tokens
      expect(await aidToken.tokenIdCounter()).to.equal(5);
    });

    it("Should only allow relief agency to assign recipients", async function () {
      // Create a token first
      const donationAmount = ethers.utils.parseEther("0.4");
      await aidToken.connect(addr1).donate({ value: donationAmount });
      
      // Register necessary roles with same location
      await didRegistry.connect(reliefAgency).registerTransporterDID(addr1.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerGroundReliefDID(addr2.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerRecipientDID(addr3.address, "FIJI");
      
      // Non-relief agency trying to assign (should fail)
      await expect(
        aidToken.connect(addr1).assignAidRecipients(
          0,
          addr1.address,
          addr2.address,
          addr3.address,
          "FIJI"
        )
      ).to.be.revertedWith("Only relief agency can call this function");
      
      // Relief agency assigning (should succeed)
      await expect(
        aidToken.connect(reliefAgency).assignAidRecipients(
          0,
          addr1.address,
          addr2.address,
          addr3.address,
          "FIJI"
        )
      ).to.not.be.reverted;
    });

    it("Should emit AidTokenAssigned event when recipients are assigned", async function () {
      // Create a token first
      const donationAmount = ethers.utils.parseEther("0.4");
      await aidToken.connect(addr1).donate({ value: donationAmount });
      
      // Register necessary roles
      await didRegistry.connect(reliefAgency).registerTransporterDID(addr1.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerGroundReliefDID(addr2.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerRecipientDID(addr3.address, "FIJI");
      
      // Check event emission
      await expect(
        aidToken.connect(reliefAgency).assignAidRecipients(
          0,
          addr1.address,
          addr2.address,
          addr3.address,
          "FIJI"
        )
      ).to.emit(aidToken, "AidTokenAssigned")
       .withArgs(0, addr1.address, addr2.address, addr3.address);
    });

    it("Should validate roles when assigning recipients", async function () {
      // Create a token first
      const donationAmount = ethers.utils.parseEther("0.4");
      await aidToken.connect(addr1).donate({ value: donationAmount });
      
      // Only register some roles (missing recipient)
      await didRegistry.connect(reliefAgency).registerTransporterDID(addr1.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerGroundReliefDID(addr2.address, "FIJI");
      // addr3 not registered as recipient
      
      // Should fail due to missing recipient role
      await expect(
        aidToken.connect(reliefAgency).assignAidRecipients(
          0,
          addr1.address,
          addr2.address,
          addr3.address,
          "FIJI"
        )
      ).to.be.revertedWith("Invalid recipient");
    });

    it("Should validate location matches when assigning recipients", async function () {
      // Create a token first
      const donationAmount = ethers.utils.parseEther("0.4");
      await aidToken.connect(addr1).donate({ value: donationAmount });
      
      // Register roles with different locations
      await didRegistry.connect(reliefAgency).registerTransporterDID(addr1.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerGroundReliefDID(addr2.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerRecipientDID(addr3.address, "SAMOA"); // Different location
      
      // Should fail due to location mismatch
      await expect(
        aidToken.connect(reliefAgency).assignAidRecipients(
          0,
          addr1.address,
          addr2.address,
          addr3.address,
          "FIJI"
        )
      ).to.be.revertedWith("Recipient location mismatch");
    });
  });

  describe("AidTokenHandler", function () {
    beforeEach(async function () {
      // Setup a token with assigned recipients for testing
      const donationAmount = ethers.utils.parseEther("0.4");
      await aidToken.connect(addr1).donate({ value: donationAmount });
      
      // Register roles
      await didRegistry.connect(reliefAgency).registerTransporterDID(addr1.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerGroundReliefDID(addr2.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerRecipientDID(addr3.address, "FIJI");
      
      // Assign recipients to token
      await aidToken.connect(reliefAgency).assignAidRecipients(
        0,
        addr1.address,
        addr2.address,
        addr3.address,
        "FIJI"
      );
      
      // Initialize token status
      await aidTokenHandler.initializeTokenStatus(0);
    });

    it("Should emit TokenStatusInitialized event when initializing status", async function () {
      // Create a new token
      const donationAmount = ethers.utils.parseEther("0.4");
      await aidToken.connect(addr4).donate({ value: donationAmount });
      
      // Initialize token status and check event
      await expect(aidTokenHandler.initializeTokenStatus(1))
        .to.emit(aidTokenHandler, "TokenStatusInitialized")
        .withArgs(1);
    });

    it("Should start with Issued status", async function () {
      expect(await aidTokenHandler.aidStatus(0)).to.equal(0); // 0 = Issued
      expect(await aidTokenHandler.getAidStatusString(0)).to.equal("Issued");
    });

    it("Should allow transporter to mark as InTransit", async function () {
      await aidTokenHandler.connect(addr1).authenticateTransferTeam(0);
      expect(await aidTokenHandler.aidStatus(0)).to.equal(1); // 1 = InTransit
      expect(await aidTokenHandler.getAidStatusString(0)).to.equal("InTransit");
    });

    it("Should not allow non-transporter to mark as InTransit", async function () {
      await expect(
        aidTokenHandler.connect(addr2).authenticateTransferTeam(0)
      ).to.be.revertedWith("Only transfer team can mark InTransit");
    });

    it("Should allow ground relief to mark as Delivered", async function () {
      // First mark as InTransit
      await aidTokenHandler.connect(addr1).authenticateTransferTeam(0);
      
      // Then mark as Delivered
      await aidTokenHandler.connect(addr2).authenticateGroundRelief(0);
      expect(await aidTokenHandler.aidStatus(0)).to.equal(2); // 2 = Delivered
      expect(await aidTokenHandler.getAidStatusString(0)).to.equal("Delivered");
    });

    it("Should not allow ground relief to mark as Delivered before InTransit", async function () {
      await expect(
        aidTokenHandler.connect(addr2).authenticateGroundRelief(0)
      ).to.be.revertedWith("Aid must be in 'InTransit' status, or you have already claimed");
    });

    it("Should allow recipient to claim aid", async function () {
      // First mark as InTransit
      await aidTokenHandler.connect(addr1).authenticateTransferTeam(0);
      
      // Then mark as Delivered
      await aidTokenHandler.connect(addr2).authenticateGroundRelief(0);
      
      // Finally claim aid
      await aidTokenHandler.connect(addr3).claimAid(0);
      expect(await aidTokenHandler.aidStatus(0)).to.equal(3); // 3 = Claimed
      expect(await aidTokenHandler.getAidStatusString(0)).to.equal("Claimed");
    });

    it("Should not allow recipient to claim aid before Delivered", async function () {
      // Mark as InTransit
      await aidTokenHandler.connect(addr1).authenticateTransferTeam(0);
      
      // Try to claim before Delivered
      await expect(
        aidTokenHandler.connect(addr3).claimAid(0)
      ).to.be.revertedWith("Aid must be in 'Delivered' status");
    });

    it("Should emit AidTransferred event on status change", async function () {
      // Check event when marking as InTransit
      await expect(aidTokenHandler.connect(addr1).authenticateTransferTeam(0))
        .to.emit(aidTokenHandler, "AidTransferred")
        .withArgs(0, addr1.address, 1); // tokenId, actor, new status
      
      // Check event when marking as Delivered
      await expect(aidTokenHandler.connect(addr2).authenticateGroundRelief(0))
        .to.emit(aidTokenHandler, "AidTransferred")
        .withArgs(0, addr2.address, 2);
      
      // Check event when marking as Claimed
      await expect(aidTokenHandler.connect(addr3).claimAid(0))
        .to.emit(aidTokenHandler, "AidTransferred")
        .withArgs(0, addr3.address, 3);
    });

    it("Should not allow re-claiming of already claimed aid", async function () {
      // Progress through full workflow
      await aidTokenHandler.connect(addr1).authenticateTransferTeam(0);
      await aidTokenHandler.connect(addr2).authenticateGroundRelief(0);
      await aidTokenHandler.connect(addr3).claimAid(0);
      
      // Try to claim again
      await expect(
        aidTokenHandler.connect(addr3).claimAid(0)
      ).to.be.revertedWith("Already claimed");
    });

    it("Should support batch status queries", async function () {
      // Create a second token
      const donationAmount = ethers.utils.parseEther("0.4");
      await aidToken.connect(addr4).donate({ value: donationAmount });
      
      // Register roles for second token
      await didRegistry.connect(reliefAgency).registerTransporterDID(addr4.address, "PNG");
      await didRegistry.connect(reliefAgency).registerGroundReliefDID(addr5.address, "PNG");
      await didRegistry.connect(reliefAgency).registerRecipientDID(addr6.address, "PNG");
      
      // Assign recipients to second token
      await aidToken.connect(reliefAgency).assignAidRecipients(
        1,
        addr4.address,
        addr5.address,
        addr6.address,
        "PNG"
      );
      
      // Initialize second token status
      await aidTokenHandler.initializeTokenStatus(1);
      
      // Progress first token to Delivered
      await aidTokenHandler.connect(addr1).authenticateTransferTeam(0);
      await aidTokenHandler.connect(addr2).authenticateGroundRelief(0);
      
      // Query batch status
      const statuses = await aidTokenHandler.getTokenStatusBatch([0, 1]);
      expect(statuses[0]).to.equal("Delivered");
      expect(statuses[1]).to.equal("Issued");
    });
  });

  describe("End-to-end workflow", function () {
    it("Should handle the complete aid distribution workflow", async function () {
      // 1. Register stakeholders
      await didRegistry.connect(reliefAgency).registerTransporterDID(addr1.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerGroundReliefDID(addr2.address, "FIJI");
      await didRegistry.connect(reliefAgency).registerRecipientDID(addr3.address, "FIJI");
      
      // 2. Make donations and issue token
      const donationAmount1 = ethers.utils.parseEther("0.2");
      const donationAmount2 = ethers.utils.parseEther("0.2");
      await aidToken.connect(addr4).donate({ value: donationAmount1 });
      await aidToken.connect(addr5).donate({ value: donationAmount2 });
      
      // Check token issuance
      expect(await aidToken.tokenIdCounter()).to.equal(1);
      expect(await aidToken.isTokenIssued(0)).to.equal(true);
      expect(await aidToken.currentTokenBalance()).to.equal(ethers.utils.parseEther("0.08"));
      
      // 3. Relief agency assigns recipients
      await aidToken.connect(reliefAgency).assignAidRecipients(
        0,
        addr1.address,
        addr2.address,
        addr3.address,
        "FIJI"
      );
      
      // Check assignments
      expect(await aidToken.getTransferTeam(0)).to.equal(addr1.address);
      expect(await aidToken.getGroundRelief(0)).to.equal(addr2.address);
      expect(await aidToken.getRecipient(0)).to.equal(addr3.address);
      
      // 4. Initialize token status
      await aidTokenHandler.initializeTokenStatus(0);
      expect(await aidTokenHandler.aidStatus(0)).to.equal(0); // Issued
      
      // 5. Update status through the chain
      await aidTokenHandler.connect(addr1).authenticateTransferTeam(0);
      expect(await aidTokenHandler.aidStatus(0)).to.equal(1); // InTransit
      
      await aidTokenHandler.connect(addr2).authenticateGroundRelief(0);
      expect(await aidTokenHandler.aidStatus(0)).to.equal(2); // Delivered
      
      await aidTokenHandler.connect(addr3).claimAid(0);
      expect(await aidTokenHandler.aidStatus(0)).to.equal(3); // Claimed
      
      // 6. Make more donations for a second token
      const donationAmount3 = ethers.utils.parseEther("0.4");
      await aidToken.connect(addr6).donate({ value: donationAmount3 });
      
      // Check second token
      expect(await aidToken.tokenIdCounter()).to.equal(2);
      expect(await aidToken.isTokenIssued(1)).to.equal(true);
    });
  });
});