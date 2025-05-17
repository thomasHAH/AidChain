const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AidChain Contracts", function () {
  let didRegistry;
  let aidToken;
  let aidTokenHandler;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    // Get signers for testing
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    
    // Deploy DIDRegistry
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    didRegistry = await DIDRegistry.deploy();
    await didRegistry.deployed();
    
    // Deploy AidToken with DIDRegistry address
    const AidToken = await ethers.getContractFactory("AidToken");
    aidToken = await AidToken.deploy(owner.address, didRegistry.address);
    await aidToken.deployed();
    
    // Deploy AidTokenHandler with AidToken address
    const AidTokenHandler = await ethers.getContractFactory("AidTokenHandler");
    aidTokenHandler = await AidTokenHandler.deploy(aidToken.address);
    await aidTokenHandler.deployed();
  });

  describe("DIDRegistry", function () {
    it("Should register a transporter correctly", async function () {
      await didRegistry.registerTransporterDID(addr1.address, "FIJI");
      expect(await didRegistry.getRole(addr1.address)).to.equal(1); // 1 = Transporter role
      expect(await didRegistry.getLocation(addr1.address)).to.equal("FIJI");
    });
    
    it("Should register a ground relief correctly", async function () {
      await didRegistry.registerGroundReliefDID(addr2.address, "FIJI");
      expect(await didRegistry.getRole(addr2.address)).to.equal(2); // 2 = GroundRelief role
    });
    
    it("Should register a recipient correctly", async function () {
      await didRegistry.registerRecipientDID(addr3.address, "FIJI");
      expect(await didRegistry.getRole(addr3.address)).to.equal(3); // 3 = Recipient role
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
  });

  // Additional tests would be added for AidTokenHandler and more complex scenarios
}); 