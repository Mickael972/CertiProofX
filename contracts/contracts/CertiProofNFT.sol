// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CertiProofNFT
 * @author Kai Zenjiro (0xGenesis) - certiproofx@protonmail.me
 * @notice NFT contract for CertiProof X - Decentralized Proof Protocol
 * @dev ERC721 token representing verified digital proofs with immutable metadata
 * 
 * Features:
 * - Mint certificates as NFTs with cryptographic proofs
 * - Store document hashes and IPFS URIs on-chain
 * - Verify proofs by hash or token ID
 * - Optional proof locking for immutability
 * - GDPR compliance with metadata management
 * - Governance controls for protocol management
 */
contract CertiProofNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    // State variables
    uint256 private _nextTokenId;
    
    // Protocol info
    string public constant VERSION = "1.0.0";
    string public constant AUTHOR = "Kai Zenjiro (0xGenesis)";
    string public constant CONTACT = "certiproofx@protonmail.me";
    string public constant WALLET = "0x1E274F39A44f1561b3Bb21148B9881075575676D";
    
    // Proof structure
    struct Proof {
        string documentHash;     // SHA-256 hash of original document
        string ipfsURI;         // IPFS URI for stored metadata
        address issuer;         // Address that minted the proof
        uint256 timestamp;      // Block timestamp when minted
        string documentType;    // Type of document (diploma, certificate, etc.)
        string title;          // Human-readable title
        bool isLocked;         // If true, proof cannot be modified
        bool isActive;         // If false, proof is considered revoked
    }
    
    // Mappings
    mapping(uint256 => Proof) public proofs;
    mapping(string => uint256) public hashToTokenId;
    mapping(address => uint256[]) public issuerTokens;
    mapping(string => bool) public usedHashes;
    
    // Events
    event ProofMinted(
        uint256 indexed tokenId,
        string indexed documentHash,
        string ipfsURI,
        address indexed issuer,
        string documentType,
        string title
    );
    
    event ProofVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        uint256 timestamp
    );
    
    event ProofLocked(
        uint256 indexed tokenId,
        address indexed locker
    );
    
    event ProofRevoked(
        uint256 indexed tokenId,
        address indexed revoker,
        string reason
    );
    
    event ProofRestored(
        uint256 indexed tokenId,
        address indexed restorer
    );
    
    // Helper function to check if token exists
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    // Modifiers
    modifier validTokenId(uint256 tokenId) {
        require(_exists(tokenId), "CertiProofNFT: Token does not exist");
        _;
    }
    
    modifier onlyIssuerOrOwner(uint256 tokenId) {
        require(
            msg.sender == proofs[tokenId].issuer || msg.sender == owner(),
            "CertiProofNFT: Not authorized"
        );
        _;
    }
    
    modifier notLocked(uint256 tokenId) {
        require(!proofs[tokenId].isLocked, "CertiProofNFT: Proof is locked");
        _;
    }
    
    /**
     * @notice Contract constructor
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _initialOwner Initial owner of the contract
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _initialOwner
    ) ERC721(_name, _symbol) Ownable(_initialOwner) {
        // Start token IDs from 1
        _nextTokenId = 1;
    }
    
    /**
     * @notice Mint a new proof certificate
     * @param to Address to mint the NFT to
     * @param documentHash SHA-256 hash of the document
     * @param ipfsURI IPFS URI containing metadata
     * @param documentType Type of document being certified
     * @param title Human-readable title for the proof
     * @param locked Whether the proof should be immediately locked
     * @return tokenId The ID of the newly minted token
     */
    function mint(
        address to,
        string memory documentHash,
        string memory ipfsURI,
        string memory documentType,
        string memory title,
        bool locked
    ) public nonReentrant returns (uint256) {
        require(to != address(0), "CertiProofNFT: Cannot mint to zero address");
        require(bytes(documentHash).length > 0, "CertiProofNFT: Document hash required");
        require(bytes(ipfsURI).length > 0, "CertiProofNFT: IPFS URI required");
        require(bytes(title).length > 0, "CertiProofNFT: Title required");
        require(!usedHashes[documentHash], "CertiProofNFT: Document hash already used");
        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        // Store proof data
        proofs[tokenId] = Proof({
            documentHash: documentHash,
            ipfsURI: ipfsURI,
            issuer: msg.sender,
            timestamp: block.timestamp,
            documentType: documentType,
            title: title,
            isLocked: locked,
            isActive: true
        });
        
        // Update mappings
        hashToTokenId[documentHash] = tokenId;
        issuerTokens[msg.sender].push(tokenId);
        usedHashes[documentHash] = true;
        
        // Mint the NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ipfsURI);
        
        emit ProofMinted(tokenId, documentHash, ipfsURI, msg.sender, documentType, title);
        
        if (locked) {
            emit ProofLocked(tokenId, msg.sender);
        }
        
        return tokenId;
    }
    
    /**
     * @notice Verify a proof by its document hash
     * @param documentHash The SHA-256 hash to verify
     * @return exists Whether a proof exists for this hash
     * @return tokenId The token ID of the proof (0 if not found)
     * @return isActive Whether the proof is currently active
     */
    function verifyProofByHash(string memory documentHash) 
        public 
        returns (bool exists, uint256 tokenId, bool isActive) 
    {
        tokenId = hashToTokenId[documentHash];
        exists = tokenId != 0 && _exists(tokenId);
        isActive = exists && proofs[tokenId].isActive;
        
        if (exists) {
            emit ProofVerified(tokenId, msg.sender, block.timestamp);
        }
        
        return (exists, tokenId, isActive);
    }
    
    /**
     * @notice Verify a proof by its token ID
     * @param tokenId The token ID to verify
     * @return isActive Whether the proof is currently active
     */
    function verifyProofByTokenId(uint256 tokenId) 
        public 
        validTokenId(tokenId) 
        returns (bool isActive) 
    {
        isActive = proofs[tokenId].isActive;
        emit ProofVerified(tokenId, msg.sender, block.timestamp);
        return isActive;
    }
    
    /**
     * @notice Get complete proof information by token ID
     * @param tokenId The token ID to query
     * @return proof The complete proof struct
     */
    function getProofByTokenId(uint256 tokenId) 
        public 
        view 
        validTokenId(tokenId) 
        returns (Proof memory proof) 
    {
        return proofs[tokenId];
    }
    
    /**
     * @notice Get proof information by document hash
     * @param documentHash The document hash to query
     * @return exists Whether a proof exists
     * @return proof The proof struct (empty if not found)
     */
    function getProofByHash(string memory documentHash) 
        public 
        view 
        returns (bool exists, Proof memory proof) 
    {
        uint256 tokenId = hashToTokenId[documentHash];
        exists = tokenId != 0 && _exists(tokenId);
        
        if (exists) {
            proof = proofs[tokenId];
        }
        
        return (exists, proof);
    }
    
    /**
     * @notice Lock a proof to make it immutable
     * @param tokenId The token ID to lock
     */
    function lockProof(uint256 tokenId) 
        public 
        validTokenId(tokenId) 
        onlyIssuerOrOwner(tokenId) 
        notLocked(tokenId) 
    {
        proofs[tokenId].isLocked = true;
        emit ProofLocked(tokenId, msg.sender);
    }
    
    /**
     * @notice Revoke a proof (makes it inactive)
     * @param tokenId The token ID to revoke
     * @param reason Reason for revocation
     */
    function revokeProof(uint256 tokenId, string memory reason) 
        public 
        validTokenId(tokenId) 
        onlyIssuerOrOwner(tokenId) 
        notLocked(tokenId) 
    {
        require(proofs[tokenId].isActive, "CertiProofNFT: Proof already revoked");
        
        proofs[tokenId].isActive = false;
        emit ProofRevoked(tokenId, msg.sender, reason);
    }
    
    /**
     * @notice Restore a revoked proof
     * @param tokenId The token ID to restore
     */
    function restoreProof(uint256 tokenId) 
        public 
        validTokenId(tokenId) 
        onlyIssuerOrOwner(tokenId) 
        notLocked(tokenId) 
    {
        require(!proofs[tokenId].isActive, "CertiProofNFT: Proof already active");
        
        proofs[tokenId].isActive = true;
        emit ProofRestored(tokenId, msg.sender);
    }
    
    /**
     * @notice Update IPFS URI for a proof (GDPR compliance)
     * @param tokenId The token ID to update
     * @param newIpfsURI The new IPFS URI
     */
    function updateIpfsURI(uint256 tokenId, string memory newIpfsURI) 
        public 
        validTokenId(tokenId) 
        onlyIssuerOrOwner(tokenId) 
        notLocked(tokenId) 
    {
        require(bytes(newIpfsURI).length > 0, "CertiProofNFT: IPFS URI required");
        
        proofs[tokenId].ipfsURI = newIpfsURI;
        _setTokenURI(tokenId, newIpfsURI);
    }
    
    /**
     * @notice Get all token IDs for an issuer
     * @param issuer The issuer address
     * @return tokenIds Array of token IDs
     */
    function getIssuerTokens(address issuer) 
        public 
        view 
        returns (uint256[] memory tokenIds) 
    {
        return issuerTokens[issuer];
    }
    
    /**
     * @notice Get total number of minted tokens
     * @return count Total supply
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    /**
     * @notice Check if a proof is locked
     * @param tokenId The token ID to check
     * @return locked Whether the proof is locked
     */
    function isProofLocked(uint256 tokenId) 
        public 
        view 
        validTokenId(tokenId) 
        returns (bool locked) 
    {
        return proofs[tokenId].isLocked;
    }
    
    /**
     * @notice Check if a proof is active
     * @param tokenId The token ID to check
     * @return active Whether the proof is active
     */
    function isProofActive(uint256 tokenId) 
        public 
        view 
        validTokenId(tokenId) 
        returns (bool active) 
    {
        return proofs[tokenId].isActive;
    }
    
    /**
     * @notice Emergency pause for governance (only owner)
     */
    function pause() public onlyOwner {
        // Implementation for emergency pause if needed
        // Could be implemented with OpenZeppelin's Pausable
    }
    
    // Override required functions
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}