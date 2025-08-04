const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

/**
 * Test suite for CertiProofNFT contract
 * Author: Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 * 
 * Comprehensive tests covering all contract functionality
 */

describe("CertiProofNFT", function () {
  // Test constants
  const TOKEN_NAME = "CertiProof X";
  const TOKEN_SYMBOL = "CERTX";
  const DOCUMENT_HASH = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const IPFS_URI = "ipfs://QmTestHash123456789";
  const DOCUMENT_TYPE = "diploma";
  const TITLE = "Computer Science Degree";
  
  // Deploy contract fixture
  async function deployContractFixture() {
    const [owner, issuer1, issuer2, user1, user2] = await ethers.getSigners();
    
    const CertiProofNFT = await ethers.getContractFactory("CertiProofNFT");
    const contract = await CertiProofNFT.deploy(TOKEN_NAME, TOKEN_SYMBOL);
    await contract.deployed();
    
    return { contract, owner, issuer1, issuer2, user1, user2 };
  }
  
  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      
      expect(await contract.name()).to.equal(TOKEN_NAME);
      expect(await contract.symbol()).to.equal(TOKEN_SYMBOL);
    });
    
    it("Should set the correct author information", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      
      expect(await contract.VERSION()).to.equal("1.0.0");
      expect(await contract.AUTHOR()).to.equal("Kai Zenjiro (0xGenesis)");
      expect(await contract.CONTACT()).to.equal("certiproofx@protonmail.me");
      expect(await contract.WALLET()).to.equal("0x1E274F39A44f1561b3Bb21148B9881075575676D");
    });
    
    it("Should set the deployer as owner", async function () {
      const { contract, owner } = await loadFixture(deployContractFixture);
      
      expect(await contract.owner()).to.equal(owner.address);
    });
    
    it("Should start with zero total supply", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      
      expect(await contract.totalSupply()).to.equal(0);
    });
  });
  
  describe("Minting", function () {
    it("Should mint a proof successfully", async function () {
      const { contract, issuer1, user1 } = await loadFixture(deployContractFixture);
      
      await expect(
        contract.connect(issuer1).mint(
          user1.address,
          DOCUMENT_HASH,
          IPFS_URI,
          DOCUMENT_TYPE,
          TITLE,
          false
        )
      ).to.emit(contract, "ProofMinted")
        .withArgs(1, DOCUMENT_HASH, IPFS_URI, issuer1.address, DOCUMENT_TYPE, TITLE);
      
      expect(await contract.totalSupply()).to.equal(1);
      expect(await contract.ownerOf(1)).to.equal(user1.address);
    });
    
    it("Should store proof data correctly", async function () {
      const { contract, issuer1, user1 } = await loadFixture(deployContractFixture);
      
      await contract.connect(issuer1).mint(
        user1.address,
        DOCUMENT_HASH,
        IPFS_URI,
        DOCUMENT_TYPE,
        TITLE,
        false
      );
      
      const proof = await contract.getProofByTokenId(1);
      
      expect(proof.documentHash).to.equal(DOCUMENT_HASH);
      expect(proof.ipfsURI).to.equal(IPFS_URI);
      expect(proof.issuer).to.equal(issuer1.address);
      expect(proof.documentType).to.equal(DOCUMENT_TYPE);
      expect(proof.title).to.equal(TITLE);
      expect(proof.isLocked).to.equal(false);
      expect(proof.isActive).to.equal(true);
    });
    
    it("Should set token URI correctly", async function () {
      const { contract, issuer1, user1 } = await loadFixture(deployContractFixture);
      
      await contract.connect(issuer1).mint(
        user1.address,
        DOCUMENT_HASH,
        IPFS_URI,
        DOCUMENT_TYPE,
        TITLE,
        false
      );
      
      expect(await contract.tokenURI(1)).to.equal(IPFS_URI);
    });
    
    it("Should track issuer tokens", async function () {
      const { contract, issuer1, user1 } = await loadFixture(deployContractFixture);
      
      await contract.connect(issuer1).mint(
        user1.address,
        DOCUMENT_HASH,
        IPFS_URI,
        DOCUMENT_TYPE,
        TITLE,
        false
      );
      
      const issuerTokens = await contract.getIssuerTokens(issuer1.address);
      expect(issuerTokens).to.deep.equal([ethers.BigNumber.from(1)]);
    });
    
    it("Should map hash to token ID", async function () {
      const { contract, issuer1, user1 } = await loadFixture(deployContractFixture);
      
      await contract.connect(issuer1).mint(
        user1.address,
        DOCUMENT_HASH,
        IPFS_URI,
        DOCUMENT_TYPE,
        TITLE,
        false
      );
      
      expect(await contract.hashToTokenId(DOCUMENT_HASH)).to.equal(1);
    });
    
    it("Should mint locked proof when specified", async function () {
      const { contract, issuer1, user1 } = await loadFixture(deployContractFixture);
      
      await expect(
        contract.connect(issuer1).mint(
          user1.address,
          DOCUMENT_HASH,
          IPFS_URI,
          DOCUMENT_TYPE,
          TITLE,
          true
        )
      ).to.emit(contract, "ProofLocked")
        .withArgs(1, issuer1.address);
      
      const proof = await contract.getProofByTokenId(1);
      expect(proof.isLocked).to.equal(true);
    });
    
    it("Should reject minting to zero address", async function () {
      const { contract, issuer1 } = await loadFixture(deployContractFixture);
      
      await expect(
        contract.connect(issuer1).mint(
          ethers.constants.AddressZero,
          DOCUMENT_HASH,
          IPFS_URI,
          DOCUMENT_TYPE,
          TITLE,
          false
        )
      ).to.be.revertedWith("CertiProofNFT: Cannot mint to zero address");
    });
    
    it("Should reject empty document hash", async function () {
      const { contract, issuer1, user1 } = await loadFixture(deployContractFixture);
      
      await expect(
        contract.connect(issuer1).mint(
          user1.address,
          "",
          IPFS_URI,
          DOCUMENT_TYPE,
          TITLE,
          false
        )
      ).to.be.revertedWith("CertiProofNFT: Document hash required");
    });
    
    it("Should reject duplicate document hash", async function () {
      const { contract, issuer1, user1, user2 } = await loadFixture(deployContractFixture);
      
      await contract.connect(issuer1).mint(
        user1.address,
        DOCUMENT_HASH,
        IPFS_URI,
        DOCUMENT_TYPE,
        TITLE,
        false
      );
      
      await expect(
        contract.connect(issuer1).mint(
          user2.address,
          DOCUMENT_HASH,
          "ipfs://different",
          DOCUMENT_TYPE,
          "Different Title",
          false
        )
      ).to.be.revertedWith("CertiProofNFT: Document hash already used");
    });
  });
  
  describe("Verification", function () {
    beforeEach(async function () {
      const { contract, issuer1, user1 } = await loadFixture(deployContractFixture);
      
      await contract.connect(issuer1).mint(
        user1.address,
        DOCUMENT_HASH,
        IPFS_URI,
        DOCUMENT_TYPE,
        TITLE,
        false
      );
      
      this.contract = contract;
      this.issuer1 = issuer1;
      this.user1 = user1;
    });
    
    it("Should verify proof by hash", async function () {
      const { user2 } = await loadFixture(deployContractFixture);
      
      await expect(
        this.contract.connect(user2).verifyProofByHash(DOCUMENT_HASH)
      ).to.emit(this.contract, "ProofVerified")
        .withArgs(1, user2.address, await ethers.provider.getBlockNumber() + 1);
      
      const [exists, tokenId, isActive] = await this.contract.verifyProofByHash(DOCUMENT_HASH);
      expect(exists).to.equal(true);
      expect(tokenId).to.equal(1);
      expect(isActive).to.equal(true);
    });
    
    it("Should verify proof by token ID", async function () {
      const { user2 } = await loadFixture(deployContractFixture);
      
      await expect(
        this.contract.connect(user2).verifyProofByTokenId(1)
      ).to.emit(this.contract, "ProofVerified")
        .withArgs(1, user2.address, await ethers.provider.getBlockNumber() + 1);
      
      const isActive = await this.contract.verifyProofByTokenId(1);
      expect(isActive).to.equal(true);
    });
    
    it("Should return false for non-existent hash", async function () {
      const nonExistentHash = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";
      
      const [exists, tokenId, isActive] = await this.contract.verifyProofByHash(nonExistentHash);
      expect(exists).to.equal(false);
      expect(tokenId).to.equal(0);
      expect(isActive).to.equal(false);
    });
    
    it("Should reject verification of non-existent token ID", async function () {
      await expect(
        this.contract.verifyProofByTokenId(999)
      ).to.be.revertedWith("CertiProofNFT: Token does not exist");
    });
  });
  
  describe("Proof Management", function () {
    beforeEach(async function () {
      const { contract, issuer1, user1 } = await loadFixture(deployContractFixture);
      
      await contract.connect(issuer1).mint(
        user1.address,
        DOCUMENT_HASH,
        IPFS_URI,
        DOCUMENT_TYPE,
        TITLE,
        false
      );
      
      this.contract = contract;
      this.issuer1 = issuer1;
      this.user1 = user1;
    });
    
    it("Should lock proof", async function () {
      await expect(
        this.contract.connect(this.issuer1).lockProof(1)
      ).to.emit(this.contract, "ProofLocked")
        .withArgs(1, this.issuer1.address);
      
      expect(await this.contract.isProofLocked(1)).to.equal(true);
    });
    
    it("Should revoke proof", async function () {
      const reason = "Document was found to be fraudulent";
      
      await expect(
        this.contract.connect(this.issuer1).revokeProof(1, reason)
      ).to.emit(this.contract, "ProofRevoked")
        .withArgs(1, this.issuer1.address, reason);
      
      expect(await this.contract.isProofActive(1)).to.equal(false);
    });
    
    it("Should restore revoked proof", async function () {
      await this.contract.connect(this.issuer1).revokeProof(1, "Test revocation");
      
      await expect(
        this.contract.connect(this.issuer1).restoreProof(1)
      ).to.emit(this.contract, "ProofRestored")
        .withArgs(1, this.issuer1.address);
      
      expect(await this.contract.isProofActive(1)).to.equal(true);
    });
    
    it("Should update IPFS URI", async function () {
      const newIpfsURI = "ipfs://QmNewHash987654321";
      
      await this.contract.connect(this.issuer1).updateIpfsURI(1, newIpfsURI);
      
      const proof = await this.contract.getProofByTokenId(1);
      expect(proof.ipfsURI).to.equal(newIpfsURI);
      expect(await this.contract.tokenURI(1)).to.equal(newIpfsURI);
    });
    
    it("Should reject operations on locked proofs", async function () {
      await this.contract.connect(this.issuer1).lockProof(1);
      
      await expect(
        this.contract.connect(this.issuer1).revokeProof(1, "Test")
      ).to.be.revertedWith("CertiProofNFT: Proof is locked");
      
      await expect(
        this.contract.connect(this.issuer1).updateIpfsURI(1, "ipfs://new")
      ).to.be.revertedWith("CertiProofNFT: Proof is locked");
    });
    
    it("Should reject unauthorized operations", async function () {
      const { user2 } = await loadFixture(deployContractFixture);
      
      await expect(
        this.contract.connect(user2).lockProof(1)
      ).to.be.revertedWith("CertiProofNFT: Not authorized");
      
      await expect(
        this.contract.connect(user2).revokeProof(1, "Test")
      ).to.be.revertedWith("CertiProofNFT: Not authorized");
    });
  });
  
  describe("Querying", function () {
    beforeEach(async function () {
      const { contract, issuer1, issuer2, user1, user2 } = await loadFixture(deployContractFixture);
      
      // Mint multiple proofs
      await contract.connect(issuer1).mint(
        user1.address,
        DOCUMENT_HASH,
        IPFS_URI,
        DOCUMENT_TYPE,
        TITLE,
        false
      );
      
      const hash2 = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef";
      await contract.connect(issuer1).mint(
        user2.address,
        hash2,
        "ipfs://QmSecondHash",
        "certificate",
        "Professional Certificate",
        false
      );
      
      const hash3 = "0x9876543210987654321098765432109876543210987654321098765432109876";
      await contract.connect(issuer2).mint(
        user1.address,
        hash3,
        "ipfs://QmThirdHash",
        "license",
        "Driver License",
        true
      );
      
      this.contract = contract;
      this.issuer1 = issuer1;
      this.issuer2 = issuer2;
    });
    
    it("Should return correct total supply", async function () {
      expect(await this.contract.totalSupply()).to.equal(3);
    });
    
    it("Should return issuer tokens correctly", async function () {
      const issuer1Tokens = await this.contract.getIssuerTokens(this.issuer1.address);
      const issuer2Tokens = await this.contract.getIssuerTokens(this.issuer2.address);
      
      expect(issuer1Tokens.length).to.equal(2);
      expect(issuer2Tokens.length).to.equal(1);
    });
    
    it("Should get proof by hash", async function () {
      const [exists, proof] = await this.contract.getProofByHash(DOCUMENT_HASH);
      
      expect(exists).to.equal(true);
      expect(proof.documentHash).to.equal(DOCUMENT_HASH);
      expect(proof.title).to.equal(TITLE);
    });
    
    it("Should return false for non-existent hash", async function () {
      const [exists, proof] = await this.contract.getProofByHash("0x1111111111111111111111111111111111111111111111111111111111111111");
      
      expect(exists).to.equal(false);
      expect(proof.documentHash).to.equal("");
    });
  });
  
  describe("Access Control", function () {
    beforeEach(async function () {
      const { contract, owner, issuer1, user1 } = await loadFixture(deployContractFixture);
      
      await contract.connect(issuer1).mint(
        user1.address,
        DOCUMENT_HASH,
        IPFS_URI,
        DOCUMENT_TYPE,
        TITLE,
        false
      );
      
      this.contract = contract;
      this.owner = owner;
      this.issuer1 = issuer1;
      this.user1 = user1;
    });
    
    it("Should allow owner to manage any proof", async function () {
      await expect(
        this.contract.connect(this.owner).lockProof(1)
      ).to.emit(this.contract, "ProofLocked");
    });
    
    it("Should allow issuer to manage their own proof", async function () {
      await expect(
        this.contract.connect(this.issuer1).lockProof(1)
      ).to.emit(this.contract, "ProofLocked");
    });
    
    it("Should reject token holder managing proof (only issuer or owner)", async function () {
      await expect(
        this.contract.connect(this.user1).lockProof(1)
      ).to.be.revertedWith("CertiProofNFT: Not authorized");
    });
  });
  
  describe("Edge Cases", function () {
    it("Should handle multiple proofs with same IPFS URI", async function () {
      const { contract, issuer1, user1, user2 } = await loadFixture(deployContractFixture);
      
      const hash1 = "0x1111111111111111111111111111111111111111111111111111111111111111";
      const hash2 = "0x2222222222222222222222222222222222222222222222222222222222222222";
      
      await contract.connect(issuer1).mint(user1.address, hash1, IPFS_URI, DOCUMENT_TYPE, TITLE, false);
      await contract.connect(issuer1).mint(user2.address, hash2, IPFS_URI, DOCUMENT_TYPE, TITLE, false);
      
      expect(await contract.totalSupply()).to.equal(2);
    });
    
    it("Should handle restoration of already active proof", async function () {
      const { contract, issuer1, user1 } = await loadFixture(deployContractFixture);
      
      await contract.connect(issuer1).mint(user1.address, DOCUMENT_HASH, IPFS_URI, DOCUMENT_TYPE, TITLE, false);
      
      await expect(
        contract.connect(issuer1).restoreProof(1)
      ).to.be.revertedWith("CertiProofNFT: Proof already active");
    });
    
    it("Should handle revocation of already revoked proof", async function () {
      const { contract, issuer1, user1 } = await loadFixture(deployContractFixture);
      
      await contract.connect(issuer1).mint(user1.address, DOCUMENT_HASH, IPFS_URI, DOCUMENT_TYPE, TITLE, false);
      await contract.connect(issuer1).revokeProof(1, "First revocation");
      
      await expect(
        contract.connect(issuer1).revokeProof(1, "Second revocation")
      ).to.be.revertedWith("CertiProofNFT: Proof already revoked");
    });
  });
});