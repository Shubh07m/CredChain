// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VeriCred
 * @author Your Name
 * @notice A smart contract for universities to issue and manage academic
 * credentials for students on the blockchain.
The contract owner manages a
 * list of approved universities, which can then issue, revoke, and verify
 * credentials.
Credential documents are stored on IPFS, and their hashes
 * are recorded on-chain.
*/
contract VeriCred {
    // --- STATE VARIABLES ---

    /// @notice The address of the contract owner, who has administrative privileges.
address public owner;

    // --- REMOVED ---
    // uint256 private _nextCredentialId; 
    // We no longer need a sequential counter

// --- STRUCTS ---

    /// @notice Represents a single academic credential.
struct Credential {
        uint256 id;
// Unique ID (now a hash)
        address studentAddress;
// The student who received the credential
        address universityAddress;
// The university that issued it
        string credentialType;
// e.g., "Bachelor of Science in Computer Science"
        string ipfsHash;
// The IPFS hash of the credential document (e.g., PDF)
        uint256 issueDate;
// Timestamp of when it was issued
        bool isValid;
// Flag to allow for credential revocation
    }

    // --- MAPPINGS ---

    /// @notice A mapping to track which addresses are approved universities.
/// @dev address => bool (true if it's an approved university)
    mapping(address => bool) public isUniversity;
/// @notice A mapping to retrieve a credential's full details by its unique ID.
/// @dev credentialId (hash) => Credential struct
    mapping(uint256 => Credential) public credentials;
/// @notice A mapping to find all credential IDs issued to a specific student.
/// @dev studentAddress => array of credential IDs (hashes)
    mapping(address => uint256[]) public studentCredentials;
// --- EVENTS ---

    event UniversityAdded(address indexed universityAddress);
    event UniversityRemoved(address indexed universityAddress);
event CredentialIssued(uint256 indexed credentialId, address indexed studentAddress, address indexed universityAddress);
    event CredentialRevoked(uint256 indexed credentialId, address indexed universityAddress);
// --- MODIFIERS ---

    /// @notice Restricts a function's access to only the contract owner.
modifier onlyOwner() {
        require(msg.sender == owner, "VeriCred: Caller is not the owner");
        _;
}

    /// @notice Restricts a function's access to only approved university addresses.
modifier onlyUniversity() {
        require(isUniversity[msg.sender], "VeriCred: Caller is not an approved university");
        _;
}

    // --- CONSTRUCTOR ---

    /// @notice Sets the contract deployer as the owner upon creation.
constructor() {
        owner = msg.sender;
}

    // --- ADMINISTRATIVE FUNCTIONS (Owner Only) ---

    /**
     * @notice Adds a new address to the list of approved universities.
* @param _universityAddress The Ethereum address of the university to add.
*/
    function addUniversity(address _universityAddress) external onlyOwner {
        require(_universityAddress != address(0), "VeriCred: Cannot add the zero address");
isUniversity[_universityAddress] = true;
        emit UniversityAdded(_universityAddress);
    }

    /**
     * @notice Removes an address from the list of approved universities.
* @param _universityAddress The Ethereum address of the university to remove.
*/
    function removeUniversity(address _universityAddress) external onlyOwner {
        isUniversity[_universityAddress] = false;
emit UniversityRemoved(_universityAddress);
    }

    // --- CORE FUNCTIONS (University Only) ---

    /**
     * @notice Issues a new credential to a student.
* @dev Can only be called by an approved university.
* @param _studentAddress The address of the student receiving the credential.
* @param _credentialType A description of the credential (e.g., degree name).
* @param _ipfsHash The IPFS hash of the associated document.
*/
    function issueCredential(address _studentAddress, string memory _credentialType, string memory _ipfsHash) external onlyUniversity {
        require(_studentAddress != address(0), "VeriCred: Student address cannot be the zero address");

        // --- MODIFIED LOGIC ---
        // Generate a unique ID by hashing key credential details
        uint256 credentialId = uint256(keccak256(abi.encodePacked(
            msg.sender,       // University address
            _studentAddress,  // Student address
            _ipfsHash         // Unique document hash
        )));

        // Check for collisions or duplicate issuance
        require(credentials[credentialId].issueDate == 0, "VeriCred: Credential already exists");
        // --- END MODIFIED LOGIC ---

        credentials[credentialId] = Credential({
            id: credentialId,
            studentAddress: _studentAddress,
            universityAddress: msg.sender,
            credentialType: _credentialType,
            ipfsHash: _ipfsHash,
            issueDate: block.timestamp,
            isValid: true
   
     });

        studentCredentials[_studentAddress].push(credentialId);

        emit CredentialIssued(credentialId, _studentAddress, msg.sender);

        // --- REMOVED ---
        // _nextCredentialId++; 
        // No longer needed
}

    /**
     * @notice Revokes an existing credential.
* @dev Can only be called by the same university that originally issued the credential.
* @param _credentialId The unique ID of the credential to revoke.
*/
    function revokeCredential(uint256 _credentialId) external {
        Credential storage credential = credentials[_credentialId];
require(credential.issueDate != 0, "VeriCred: Credential does not exist");
        // require(credential.universityAddress == msg.sender, "VeriCred: Not the issuing university"); // This line is duplicated
require(msg.sender == credential.universityAddress, "VeriCred: Only the issuing university can revoke");
        
        credential.isValid = false;

        emit CredentialRevoked(_credentialId, msg.sender);
}

    // --- PUBLIC VIEW FUNCTIONS (For Frontend and Verifiers) ---

    /**
     * @notice Retrieves the full details of a specific credential.
* @param _credentialId The unique ID of the credential.
     * @return The Credential struct.
*/
    function getCredentialDetails(uint256 _credentialId) external view returns (Credential memory) {
        return credentials[_credentialId];
}

    /**
     * @notice Retrieves an array of all credential IDs belonging to a student.
* @param _studentAddress The address of the student.
     * @return An array of uint256 credential IDs.
*/
    function getStudentCredentialIds(address _studentAddress) external view returns (uint256[] memory) {
        return studentCredentials[_studentAddress];
}
}