// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title FoundersClub
 * @dev Manages founder points and rewards with admin control and secure batch operations.
 * @custom:security-contact security@foundersclub.network
 */
contract FoundersClub is Ownable, ReentrancyGuard, Pausable {
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;

    // ================================
    // ========== Structs =============
    // ================================

    /**
     * @notice Represents a founder in the FoundersClub.
     * @dev Contains information about the founder's contracts, points, rewards, and status.
     */
    struct Founder {
        address[] contracts;        // List of contract addresses associated with the founder
        uint256 allocatedPoints;    // Total points allocated by admin
        uint256 distributedPoints;  // Points distributed to contracts
        uint256 earnedRewards;      // Rewards claimed by the founder
        bytes32 apiKey;             // API key for the founder
        bool isActive;              // Status indicating if the founder is active
        string founderName;         // Name of the founder
    }

    /**
     * @notice Represents a contract registered under a founder.
     * @dev Contains information about the contract's details, points, rewards, and verification status.
     */
    struct ContractInfo {
        string name;                // Name of the contract
        address contractAddress;    // Address of the contract
        bytes32 abiHash;            // ABI hash of the contract
        uint256 currentPoints;      // Current active points assigned to the contract
        uint256 pendingRewards;     // Rewards pending conversion
        uint256 claimedRewards;     // Rewards that have been claimed
        string category;            // Category of the contract
        bool isVerified;            // Verification status of the contract
    }

    // ================================
    // ========== State Variables =====
    // ================================

    /**
     * @notice Modifier to restrict functions to only the owner or active founders.
     * @dev Checks if the caller is the contract owner or an active founder with a valid address.
     */
    modifier onlyAdminOrFounder() {
        require(
            msg.sender == owner() || 
            (founders[msg.sender].isActive && msg.sender != address(0)),
            "Not authorized: Neither admin nor active founder"
        );
        _;
    }

    mapping(address => Founder) private founders;               // Maps founder addresses to their Founder struct
    mapping(bytes32 => address) private apiKeyToFounder;        // Maps API keys to founder addresses
    mapping(address => ContractInfo) private registeredContracts; // Maps contract addresses to their ContractInfo
    mapping(string => EnumerableSet.AddressSet) private categoryContracts; // Maps categories to sets of contract addresses

    EnumerableSet.Bytes32Set private allApiKeys;                 // Set of all API keys
    EnumerableSet.AddressSet private activeFounders;            // Set of active founder addresses

    // Constants
    uint256 public constant MAX_CONTRACTS_PER_FOUNDER = 10;      // Maximum number of contracts per founder
    uint256 public constant REWARDS_CONVERSION_RATE = 100;       // Conversion rate: 100 points = 1 reward

    // ================================
    // ========== Events ==============
    // ================================

    // Core Points Flow Events

    /**
     * @notice Emitted when points are allocated to a founder.
     * @param founder Address of the founder receiving points
     * @param amount Number of points allocated
     */
    event PointsAllocated(address indexed founder, uint256 amount);

    /**
     * @notice Emitted when points are distributed from a founder to a contract.
     * @param founder Address of the founder distributing points
     * @param contractAddress Address of the contract receiving points
     * @param amount Number of points distributed
     */
    event PointsDistributed(address indexed founder, address indexed contractAddress, uint256 amount);

    /**
     * @notice Emitted when points are converted to rewards for a contract.
     * @param contractAddress Address of the contract converting points
     * @param pointsConverted Number of points converted
     * @param rewardsGenerated Number of rewards generated from conversion
     */
    event PointsConverted(address indexed contractAddress, uint256 pointsConverted, uint256 rewardsGenerated);

    /**
     * @notice Emitted when rewards are claimed by a founder for a contract.
     * @param founder Address of the founder claiming rewards
     * @param contractAddress Address of the contract for which rewards are claimed
     * @param amount Number of rewards claimed
     */
    event RewardsClaimed(address indexed founder, address indexed contractAddress, uint256 amount);
    
    // Admin Management Events

    /**
     * @notice Emitted when a new founder is registered.
     * @param founder Address of the newly registered founder
     * @param apiKey API key assigned to the founder
     * @param name Name of the founder
     */
    event FounderRegistered(address indexed founder, bytes32 apiKey, string name);

    /**
     * @notice Emitted when a founder's API key is updated.
     * @param founder Address of the founder whose API key was updated
     * @param newApiKey The new API key assigned to the founder
     */
    event FounderApiKeyUpdated(address indexed founder, bytes32 newApiKey);

    /**
     * @notice Emitted when a new contract is registered under a founder.
     * @param founder Address of the founder registering the contract
     * @param contractAddress Address of the newly registered contract
     * @param name Name of the contract
     * @param category Category of the contract
     */
    event ContractRegistered(address indexed founder, address indexed contractAddress, string name, string category);

    /**
     * @notice Emitted when a contract's verification status changes.
     * @param contractAddress Address of the contract whose verification status changed
     * @param verified New verification status of the contract
     */
    event ContractVerificationChanged(address indexed contractAddress, bool verified);

    /**
     * @notice Emitted when a founder's active status changes.
     * @param founder Address of the founder whose status changed
     * @param isActive New active status of the founder
     */
    event FounderStatusChanged(address indexed founder, bool isActive);

    // ================================
    // ========== Errors ==============
    // ================================

    /**
     * @notice Error thrown when attempting to register an already registered founder.
     * @param founder Address of the founder already registered
     */
    error FounderAlreadyRegistered(address founder);

    /**
     * @notice Error thrown when a founder is not registered.
     * @param founder Address of the unregistered founder
     */
    error FounderNotRegistered(address founder);

    /**
     * @notice Error thrown when a founder is not active.
     * @param founder Address of the inactive founder
     */
    error FounderNotActive(address founder);

    /**
     * @notice Error thrown when an invalid API key is provided.
     * @param apiKey The invalid API key
     */
    error InvalidApiKey(bytes32 apiKey);

    /**
     * @notice Error thrown when attempting to register an already registered contract.
     * @param contractAddress Address of the contract already registered
     */
    error ContractAlreadyRegistered(address contractAddress);

    /**
     * @notice Error thrown when a contract is not registered.
     * @param contractAddress Address of the unregistered contract
     */
    error ContractNotRegistered(address contractAddress);

    /**
     * @notice Error thrown when a contract is not owned by the specified founder.
     * @param founder Address of the founder
     * @param contractAddress Address of the contract not owned by the founder
     */
    error ContractNotOwnedByFounder(address founder, address contractAddress);

    /**
     * @notice Error thrown when there are insufficient allocated points for an operation.
     * @param requested Number of points requested
     * @param available Number of points available
     */
    error InsufficientAllocatedPoints(uint256 requested, uint256 available);

    /**
     * @notice Error thrown when there are insufficient points for an operation.
     * @param requested Number of points requested
     * @param available Number of points available
     */
    error InsufficientPoints(uint256 requested, uint256 available);

    /**
     * @notice Error thrown when there are no rewards to claim.
     * @param contractAddress Address of the contract with no rewards to claim
     */
    error NoRewardsToClaim(address contractAddress);

    /**
     * @notice Error thrown when a zero address is provided where it's not allowed.
     */
    error ZeroAddressNotAllowed();

    /**
     * @notice Error thrown when an empty string is provided where it's not allowed.
     */
    error EmptyStringNotAllowed();

    /**
     * @notice Error thrown when a founder has too many contracts registered.
     * @param founder Address of the founder with too many contracts
     */
    error TooManyContracts(address founder);

    // ================================
    // ========== Constructor =========
    // ================================

    /**
     * @notice Initializes the FoundersClub contract by setting the initial owner and pausing the contract.
     * @param initialOwner Address of the initial owner of the contract
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        _pause(); // Start paused for safety
    }

    /**
     * @notice Validates if a contract is owned by a specific founder.
     * @param founderAddress Address of the founder
     * @param contractAddress Address of the contract to validate
     * @return bool indicating whether the contract is owned by the founder
     */
    function validateContractOwnership(
        address founderAddress,
        address contractAddress
    ) internal view returns (bool) {
        Founder storage founder = founders[founderAddress];
        for (uint256 i = 0; i < founder.contracts.length; i++) {
            if (founder.contracts[i] == contractAddress) {
                return true;
            }
        }
        return false;
    }

    // ==================================
    // ======== Core Points Flow ========
    // ==================================

    /**
     * @notice Allocates points to a founder's total balance.
     * @dev Only callable by the contract owner and when not paused.
     * @param founderAddress Address of the founder.
     * @param points Number of points to allocate.
     */
    function allocatePointsToFounder(
        address founderAddress,
        uint256 points
    ) external onlyOwner whenNotPaused {
        if (points == 0) return; // No action if points to allocate is zero
        if (!founders[founderAddress].isActive) 
            revert FounderNotActive(founderAddress);

        founders[founderAddress].allocatedPoints += points; // Increment allocated points
        emit PointsAllocated(founderAddress, points); // Emit event for allocation
    }

    /**
     * @notice Distributes points from founder's allocated balance to a specific contract.
     * @dev Only callable by the contract owner and when not paused.
     * @param founderAddress Address of the founder.
     * @param contractAddress Address of the contract.
     * @param points Number of points to distribute to the contract.
     */
    function distributePointsToContract(
        address founderAddress,
        address contractAddress,
        uint256 points
    ) external onlyOwner whenNotPaused {
        if (points == 0) return; // No action if points to distribute is zero
        
        Founder storage founder = founders[founderAddress];
        if (!founder.isActive) revert FounderNotActive(founderAddress);
        
        uint256 availablePoints = founder.allocatedPoints - founder.distributedPoints;
        if (points > availablePoints)
            revert InsufficientAllocatedPoints(points, availablePoints);

        ContractInfo storage contract_ = registeredContracts[contractAddress];
        if (contract_.contractAddress == address(0))
            revert ContractNotRegistered(contractAddress);

        founder.distributedPoints += points;          // Increment distributed points
        contract_.currentPoints += points;            // Assign points to contract
       
        emit PointsDistributed(founderAddress, contractAddress, points); // Emit distribution event
    }

    /**
     * @notice Converts contract points to rewards.
     * @dev Only callable by the contract owner and when not paused.
     * @param founderAddress Address of the founder.
     * @param contractAddress Address of the contract.
     * @param pointsToConvert Number of points to convert to rewards.
     */
    function convertPointsToRewards(
        address founderAddress,
        address contractAddress,
        uint256 pointsToConvert
    ) external onlyOwner whenNotPaused {
        require(validateContractOwnership(founderAddress, contractAddress), "Not owner");
        if (pointsToConvert == 0) return; // No action if points to convert is zero
        
        ContractInfo storage contract_ = registeredContracts[contractAddress];
        if (contract_.contractAddress == address(0))
            revert ContractNotRegistered(contractAddress);
            
        if (pointsToConvert > contract_.currentPoints)
            revert InsufficientPoints(pointsToConvert, contract_.currentPoints);
            
        uint256 rewardsToAdd = pointsToConvert / REWARDS_CONVERSION_RATE; // Calculate rewards
        
        contract_.currentPoints -= pointsToConvert;    // Deduct points from contract
        contract_.pendingRewards += rewardsToAdd;      // Add to pending rewards
        
        emit PointsConverted(contractAddress, pointsToConvert, rewardsToAdd); // Emit conversion event
    }

    /**
     * @notice Claims pending rewards for a contract and adds them to founder's earned rewards.
     * @dev Only callable by the contract owner and when not paused.
     * @param founderAddress Address of the founder.
     * @param contractAddress Address of the contract.
     */
    function claimRewards(
        address founderAddress,
        address contractAddress
    ) external onlyOwner whenNotPaused {
        require(validateContractOwnership(founderAddress, contractAddress), "Not owner");

        Founder storage founder = founders[founderAddress];
        if (!founder.isActive) revert FounderNotActive(founderAddress);

        ContractInfo storage contract_ = registeredContracts[contractAddress];
        if (contract_.pendingRewards == 0) 
            revert NoRewardsToClaim(contractAddress);
        
        uint256 rewardsToClaim = contract_.pendingRewards; // Get pending rewards
        contract_.pendingRewards = 0;                        // Reset pending rewards
        contract_.claimedRewards += rewardsToClaim;           // Increment claimed rewards
        founder.earnedRewards += rewardsToClaim;             // Increment founder's earned rewards
        
        emit RewardsClaimed(founderAddress, contractAddress, rewardsToClaim); // Emit claim event
    }

    // ==================================
    // ======= Admin Management =========
    // ==================================

    /**
     * @notice Registers a new founder.
     * @dev Only callable by the contract owner and when not paused.
     * @param founderAddress Address of the founder to register.
     * @param name Name of the founder.
     */
    function registerFounder(
        address founderAddress,
        string memory name
    ) external onlyOwner whenNotPaused {
        if (founderAddress == address(0)) revert ZeroAddressNotAllowed();
        if (bytes(name).length == 0) revert EmptyStringNotAllowed();
        if (founders[founderAddress].isActive)
            revert FounderAlreadyRegistered(founderAddress);

        founders[founderAddress] = Founder({
            contracts: new address[](0),
            allocatedPoints: 0,
            distributedPoints: 0,
            earnedRewards: 0,
            apiKey: bytes32(0),
            isActive: true,
            founderName: name
        });

        activeFounders.add(founderAddress); // Add to active founders set
        emit FounderRegistered(founderAddress, bytes32(0), name); // Emit registration event
    }
    
    /**
     * @notice Registers a new contract for a founder.
     * @dev Only callable by the contract owner and when not paused.
     * @param founderAddress Address of the founder.
     * @param name Name of the contract.
     * @param contractAddress Address of the contract.
     * @param abiHash ABI hash of the contract.
     * @param category Category of the contract.
     */
    function registerContract(
        address founderAddress,
        string memory name,
        address contractAddress,
        bytes32 abiHash,
        string memory category
    ) external onlyOwner whenNotPaused {
        if (contractAddress == address(0)) revert ZeroAddressNotAllowed();
        if (bytes(name).length == 0) revert EmptyStringNotAllowed();
        if (!founders[founderAddress].isActive) 
            revert FounderNotActive(founderAddress);
        if (registeredContracts[contractAddress].contractAddress != address(0))
            revert ContractAlreadyRegistered(contractAddress);
        if (founders[founderAddress].contracts.length >= MAX_CONTRACTS_PER_FOUNDER)
            revert TooManyContracts(founderAddress);

        // Check for duplicate contracts across all founders
        uint256 activeFoundersCount = activeFounders.length();
        for (uint256 i = 0; i < activeFoundersCount; i++) {
            address currentFounder = activeFounders.at(i);
            Founder storage founder = founders[currentFounder];
            
            for (uint256 j = 0; j < founder.contracts.length; j++) {
                if (founder.contracts[j] == contractAddress) {
                    revert ContractAlreadyRegistered(contractAddress);
                }
            }
        }

        registeredContracts[contractAddress] = ContractInfo({
            name: name,
            contractAddress: contractAddress,
            abiHash: abiHash,
            currentPoints: 0,
            pendingRewards: 0,
            claimedRewards: 0,
            category: category,
            isVerified: false
        });

        founders[founderAddress].contracts.push(contractAddress); // Add contract to founder's list
        if (bytes(category).length > 0) {
            categoryContracts[category].add(contractAddress);       // Add contract to category
        }

        emit ContractRegistered(founderAddress, contractAddress, name, category); // Emit registration event
    }
    
    /**
     * @notice Updates or sets a founder's API key.
     * @dev Only callable by the contract owner and when not paused.
     * @param founderAddress Address of the founder.
     * @param apiKey Existing API key of the founder.
     * @param newApiKey New API key to set.
     */
    function updateApiKey(
        address founderAddress,
        bytes32 apiKey,
        bytes32 newApiKey
    ) external onlyOwner whenNotPaused {
        if (!founders[founderAddress].isActive) 
            revert FounderNotActive(founderAddress);
        if (apiKey == bytes32(0) && newApiKey == bytes32(0)) revert InvalidApiKey(apiKey);


        Founder storage founder = founders[founderAddress];

        if (founder.apiKey == bytes32(0)) {
            founder.apiKey = apiKey;                         // Set initial API key
            apiKeyToFounder[apiKey] = founderAddress;        // Map API key to founder
            allApiKeys.add(apiKey);                           // Add to all API keys set
        } else {
            delete apiKeyToFounder[apiKey];                   // Remove old API key mapping
            allApiKeys.remove(apiKey);                        // Remove old API key from set
            
            founder.apiKey = newApiKey;                       // Update to new API key
            apiKeyToFounder[newApiKey] = founderAddress;      // Map new API key to founder
            allApiKeys.add(newApiKey);                         // Add new API key to set
        }

        emit FounderApiKeyUpdated(founderAddress, founder.apiKey); // Emit API key update event
    }
    
    // ==================================
    // ========= View Functions =========
    // ==================================

    /**
     * @notice Get founder's complete status.
     * @dev Only callable by the admin or the founder themselves.
     * @param founderAddress Address of the founder.
     * @return founderName Name of the founder.
     * @return allocatedPoints Total points allocated to the founder.
     * @return distributedPoints Total points distributed by the founder.
     * @return availablePoints Points available for distribution.
     * @return earnedRewards Total rewards earned by the founder.
     * @return contractCount Number of contracts registered under the founder.
     * @return isActive Active status of the founder.
     */
    function getFounderStatus(
        address founderAddress
    ) external view onlyAdminOrFounder returns (
        string memory founderName,
        uint256 allocatedPoints,
        uint256 distributedPoints,
        uint256 availablePoints,
        uint256 earnedRewards,
        uint256 contractCount,
        bool isActive
    ) {
        Founder storage founder = founders[founderAddress];
        return (
            founder.founderName,
            founder.allocatedPoints,
            founder.distributedPoints,
            founder.allocatedPoints - founder.distributedPoints,
            founder.earnedRewards,
            founder.contracts.length,
            founder.isActive
        );
    }

    /**
     * @notice Get contract's complete status.
     * @dev Only callable by the admin or associated founder.
     * @param contractAddress Address of the contract.
     * @return name Name of the contract.
     * @return category Category of the contract.
     * @return currentPoints Current active points of the contract.
     * @return pendingRewards Pending rewards for the contract.
     * @return claimedRewards Claimed rewards by the contract.
     * @return isVerified Verification status of the contract.
     */
    function getContractStatus(
        address contractAddress
    ) external view onlyAdminOrFounder returns (
        string memory name,
        string memory category,
        uint256 currentPoints,
        uint256 pendingRewards,
        uint256 claimedRewards,
        bool isVerified
    ) {
        ContractInfo storage contract_ = registeredContracts[contractAddress];
        return (
            contract_.name,
            contract_.category,
            contract_.currentPoints,
            contract_.pendingRewards,
            contract_.claimedRewards,
            contract_.isVerified
        );
    }

    /**
     * @notice Get all contracts for a founder with their current status.
     * @dev Only callable by the admin or associated founder.
     * @param founderAddress Address of the founder.
     * @return contractAddresses Array of contract addresses.
     * @return names Array of contract names.
     * @return points Array of current points for each contract.
     * @return pendingRewards Array of pending rewards for each contract.
     * @return verificationStatus Array of verification statuses for each contract.
     */
    function getFounderContracts(
        address founderAddress
    ) external view onlyAdminOrFounder returns (
        address[] memory contractAddresses,
        string[] memory names,
        uint256[] memory points,
        uint256[] memory pendingRewards,
        bool[] memory verificationStatus
    ) {
        Founder storage founder = founders[founderAddress];
        uint256 length = founder.contracts.length;
        
        contractAddresses = new address[](length);
        names = new string[](length);
        points = new uint256[](length);
        pendingRewards = new uint256[](length);
        verificationStatus = new bool[](length);
        
        for (uint256 i = 0; i < length; i++) {
            address contractAddr = founder.contracts[i];
            ContractInfo storage contractInfo = registeredContracts[contractAddr];
            
            contractAddresses[i] = contractAddr;
            names[i] = contractInfo.name;
            points[i] = contractInfo.currentPoints;
            pendingRewards[i] = contractInfo.pendingRewards;
            verificationStatus[i] = contractInfo.isVerified;
        }
    }

    /**
     * @notice Get total statistics for all active founders and verified contracts.
     * @dev Only callable by the admin or any active founder.
     * @return totalFounders Total number of active founders.
     * @return totalContracts Total number of contracts registered.
     * @return totalActiveFounders Total number of active founders.
     * @return totalVerifiedContracts Total number of verified contracts.
     */
    function getTotalStats() external view onlyAdminOrFounder returns (
        uint256 totalFounders,
        uint256 totalContracts,
        uint256 totalActiveFounders,
        uint256 totalVerifiedContracts
    ) {
        totalActiveFounders = activeFounders.length();
        uint256 verifiedCount = 0;
        uint256 contractCount = 0;

        for (uint256 i = 0; i < activeFounders.length(); i++) {
            address founderAddr = activeFounders.at(i);
            contractCount += founders[founderAddr].contracts.length;

            for (uint256 j = 0; j < founders[founderAddr].contracts.length; j++) {
                address contractAddr = founders[founderAddr].contracts[j];
                if (registeredContracts[contractAddr].isVerified) {
                    verifiedCount++;
                }
            }
        }

        return (
            activeFounders.length(),
            contractCount,
            totalActiveFounders,
            verifiedCount
        );
    }

    // ==================================
    // ======= Utility Functions ========
    // ==================================

    /**
     * @notice Update founder status (active/inactive).
     * @dev Only callable by the contract owner and when not paused.
     * @param founderAddress Address of the founder.
     * @param isActive Boolean indicating whether the founder is active.
     */
    function updateFounderStatus(
        address founderAddress,
        bool isActive
    ) external onlyOwner whenNotPaused {
        if (founders[founderAddress].apiKey == bytes32(0))
            revert FounderNotRegistered(founderAddress);

        founders[founderAddress].isActive = isActive; // Update active status
        
        if (isActive) {
            activeFounders.add(founderAddress);      // Add to active founders set
        } else {
            activeFounders.remove(founderAddress);   // Remove from active founders set
        }
        
        emit FounderStatusChanged(founderAddress, isActive); // Emit status change event
    }

    /**
     * @notice Verify or unverify a contract.
     * @dev Only callable by the contract owner and when not paused.
     * @param contractAddress Address of the contract.
     * @param verified Boolean indicating verification status.
     */
    function verifyContract(
        address contractAddress,
        bool verified
    ) external onlyOwner whenNotPaused {
        ContractInfo storage contract_ = registeredContracts[contractAddress];
        if (contract_.contractAddress == address(0))
            revert ContractNotRegistered(contractAddress);

        contract_.isVerified = verified; // Update verification status
        emit ContractVerificationChanged(contractAddress, verified); // Emit verification change event
    }

    /**
     * @notice Emergency pause function to halt operations.
     * @dev Only callable by the contract owner.
     */
    function pause() external onlyOwner {
        _pause(); // Pause the contract
    }

    /**
     * @notice Resume contract operations after pause.
     * @dev Only callable by the contract owner.
     */
    function unpause() external onlyOwner {
        _unpause(); // Unpause the contract
    }

    // ==================================
    // ===== Additional Utility Functions =====
    // ==================================

    /**
     * @notice Retrieve a founder's details by their API key.
     * @dev Only callable by the admin or associated founder.
     * @param apiKey The API key associated with the founder.
     * @return founderAddress The address of the founder.
     * @return founderName The name of the founder.
     * @return allocatedPoints The total points allocated to the founder.
     * @return availablePoints The available points for the founder.
     * @return earnedRewards The total rewards the founder has earned.
     * @return isActive Boolean indicating if the founder is active.
     */
    function getFounderByApiKey(
        bytes32 apiKey
    ) external view onlyAdminOrFounder returns (
        address founderAddress,
        string memory founderName,
        uint256 allocatedPoints,
        uint256 availablePoints,
        uint256 earnedRewards,
        bool isActive
    ) {
        founderAddress = apiKeyToFounder[apiKey];
        if (founderAddress == address(0)) revert InvalidApiKey(apiKey);

        Founder storage founder = founders[founderAddress];
        return (
            founderAddress,
            founder.founderName,
            founder.allocatedPoints,
            founder.allocatedPoints - founder.distributedPoints,
            founder.earnedRewards,
            founder.isActive
        );
    }

    /**
     * @notice Retrieve the list of all active founders with their basic info.
     * @dev Only callable by the admin or any active founder.
     * @return addresses Array of addresses for each active founder.
     * @return names Array of names for each active founder.
     * @return allocatedPoints Array of allocated points for each active founder.
     * @return earnedRewards Array of earned rewards for each active founder.
     */
    function getActiveFounders() external view onlyAdminOrFounder returns (
        // Array to store addresses of active founders
        address[] memory addresses,
        // Array to store names of active founders
        string[] memory names,
        // Array to store allocated points for each active founder
        uint256[] memory allocatedPoints,
        // Array to store earned rewards for each active founder
        uint256[] memory earnedRewards
    ) {
        // Get the total number of active founders from the set
        uint256 count = activeFounders.length();

        // Initialize a new array to store founder addresses with size equal to count
        addresses = new address[](count);
        // Initialize a new array to store founder names with size equal to count
        names = new string[](count);
        // Initialize a new array to store allocated points with size equal to count
        allocatedPoints = new uint256[](count);
        // Initialize a new array to store earned rewards with size equal to count
        earnedRewards = new uint256[](count);

        // Loop through each active founder
        for (uint256 i = 0; i < count; i++) {
            // Get the address of the current founder from the active founders set
            address founderAddr = activeFounders.at(i);
            // Get the founder struct from storage using the founder's address
            Founder storage founder = founders[founderAddr];
            
            // Store the founder's address in the addresses array
            addresses[i] = founderAddr;
            // Store the founder's name in the names array
            names[i] = founder.founderName;
            // Store the founder's allocated points in the allocatedPoints array
            allocatedPoints[i] = founder.allocatedPoints;
            // Store the founder's earned rewards in the earnedRewards array
            earnedRewards[i] = founder.earnedRewards;
        }
    }
}