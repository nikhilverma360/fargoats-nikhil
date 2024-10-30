**Contract Name:** FoundersClub

**Overview:**
This smart contract manages founder points and rewards, with admin control and secure batch operations. It enables founders to allocate and distribute points, convert points into rewards, register contracts, and verify contracts, along with other administrative operations.

### 1. Structs

- **Founder**:
  - **contracts**: List of contract addresses registered by the founder.
  - **allocatedPoints**: Total points allocated by the admin.
  - **distributedPoints**: Points distributed to contracts.
  - **earnedRewards**: Claimed rewards by the founder.
  - **apiKey**: API key associated with the founder.
  - **isActive**: Status of the founder (active/inactive).
  - **founderName**: Name of the founder.

- **ContractInfo**:
  - **name**: Name of the registered contract.
  - **contractAddress**: Address of the registered contract.
  - **abiHash**: ABI hash of the contract.
  - **currentPoints**: Current active points of the contract.
  - **pendingRewards**: Unconverted rewards.
  - **claimedRewards**: Converted rewards.
  - **category**: Category of the contract.
  - **isVerified**: Verification status of the contract.

### 2. State Variables

- **founders (mapping)**: Maps founder addresses to Founder structs.
- **apiKeyToFounder (mapping)**: Maps API keys to founder addresses.
- **registeredContracts (mapping)**: Maps contract addresses to ContractInfo structs.
- **categoryContracts (mapping)**: Maps contract categories to sets of contract addresses.
- **allApiKeys (EnumerableSet)**: Set of all API keys.
- **activeFounders (EnumerableSet)**: Set of all active founder addresses.
- **MAX_CONTRACTS_PER_FOUNDER (constant)**: Maximum number of contracts allowed per founder.
- **REWARDS_CONVERSION_RATE (constant)**: Conversion rate for points to rewards (100 points = 1 reward).

### 3. Events

- **PointsAllocated**: Emitted when points are allocated to a founder.
- **PointsDistributed**: Emitted when points are distributed to a contract.
- **PointsConverted**: Emitted when points are converted to rewards.
- **RewardsClaimed**: Emitted when rewards are claimed.
- **FounderRegistered**: Emitted when a founder is registered.
- **FounderApiKeyUpdated**: Emitted when a founder's API key is updated.
- **ContractRegistered**: Emitted when a contract is registered.
- **ContractVerificationChanged**: Emitted when a contract's verification status is changed.
- **FounderStatusChanged**: Emitted when a founder's status is updated.

### 4. Errors

- **FounderAlreadyRegistered**: Thrown if a founder is already registered.
- **FounderNotRegistered**: Thrown if a founder is not registered.
- **FounderNotActive**: Thrown if a founder is inactive.
- **InvalidApiKey**: Thrown if an API key is invalid.
- **ContractAlreadyRegistered**: Thrown if a contract is already registered.
- **ContractNotRegistered**: Thrown if a contract is not registered.
- **ContractNotOwnedByFounder**: Thrown if a contract is not owned by the specified founder.
- **InsufficientAllocatedPoints**: Thrown if there are insufficient allocated points.
- **InsufficientPoints**: Thrown if there are insufficient points for a specific action.
- **NoRewardsToClaim**: Thrown if there are no rewards to claim for a contract.
- **ZeroAddressNotAllowed**: Thrown if a zero address is provided where not allowed.
- **EmptyStringNotAllowed**: Thrown if an empty string is provided where not allowed.
- **TooManyContracts**: Thrown if a founder tries to register more than the allowed number of contracts.

### 5. Modifiers

- **onlyAdminOrFounder**: Restricts function access to the admin or active founder.

### 6. Core Functions

- **validateContractOwnership**: Validates that a contract belongs to a founder.

#### 6.1 Points Management

- **allocatePointsToFounder**:
  - **Input**: `founderAddress`, `points`
  - **Description**: Allocates points to a founder's total balance.

- **distributePointsToContract**:
  - **Input**: `founderAddress`, `contractAddress`, `points`
  - **Description**: Distributes points from a founder's allocated balance to a specific contract.

- **convertPointsToRewards**:
  - **Input**: `founderAddress`, `contractAddress`, `pointsToConvert`
  - **Description**: Converts contract points to rewards.

- **claimRewards**:
  - **Input**: `founderAddress`, `contractAddress`
  - **Description**: Claims pending rewards for a contract and adds them to the founder's earned rewards.

#### 6.2 Founder and Contract Management

- **registerFounder**:
  - **Input**: `founderAddress`, `name`
  - **Description**: Registers a new founder.

- **registerContract**:
  - **Input**: `founderAddress`, `name`, `contractAddress`, `abiHash`, `category`
  - **Description**: Registers a new contract for a founder.

- **updateApiKey**:
  - **Input**: `founderAddress`, `apiKey`, `newApiKey`
  - **Description**: Updates or sets a founder's API key.

- **updateFounderStatus**:
  - **Input**: `founderAddress`, `isActive`
  - **Description**: Updates the status of a founder (active/inactive).

- **verifyContract**:
  - **Input**: `contractAddress`, `verified`
  - **Description**: Updates the verification status of a contract.

#### 6.3 Utility Functions

- **pause**: Pauses all contract operations.
- **unpause**: Resumes contract operations after a pause.

### 7. View Functions

- **getFounderStatus**:
  - **Input**: `founderAddress`
  - **Description**: Returns the complete status of a founder.

- **getContractStatus**:
  - **Input**: `contractAddress`
  - **Description**: Returns the complete status of a contract.

- **getFounderContracts**:
  - **Input**: `founderAddress`
  - **Description**: Returns all contracts registered by a founder, including current status.

- **getTotalStats**: Returns total statistics for all active founders and verified contracts.

- **getFounderByApiKey**:
  - **Input**: `apiKey`
  - **Description**: Returns founder details by their API key.

- **getActiveFounders**: Returns the list of all active founders with their basic information.

### 8. Summary of Services and Protocols

- **Access Control**: Ownership and founder verification mechanisms are managed by the **Ownable** library and custom modifiers.
- **Security Mechanisms**:
  - **Reentrancy Protection**: Enabled via the **ReentrancyGuard**.
  - **Pausable Mechanism**: Controlled via the **Pausable** library to stop operations in emergencies.
- **Point Allocation and Reward Management**: Handles founder-specific points and reward conversion using core point functions.

### 9. Enumerations

- **Founder Status**: Active or inactive state of a founder.
- **Contract Verification Status**: Verification state (verified/unverified) of a registered contract.

### 10. Static Enumerations (Constants)

- **MAX_CONTRACTS_PER_FOUNDER**: Limits the number of contracts a founder can register (value = 10).
- **REWARDS_CONVERSION_RATE**: Defines the rate of converting points to rewards (value = 100 points per reward).

