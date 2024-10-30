use actix_web::{web, App, HttpResponse, HttpServer, Responder, post, get}; // Import Actix Web components for building the web server
use serde::{Deserialize, Serialize}; // Import Serde for serialization and deserialization
use std::collections::{HashMap, HashSet}; // Import HashMap and HashSet from the standard collections
use std::sync::{Arc, Mutex}; // Import Arc and Mutex for thread-safe shared state

// ======================================
// ======== Struct Definitions here ==========
// ======================================

#[derive(Debug, Clone, Serialize, Deserialize)] // Derive traits for debugging, cloning, serialization, and deserialization
struct Founder {
    contracts: Vec<String>, // List of contract addresses associated with the founder
    allocated_points: u64, // Total points allocated to the founder
    distributed_points: u64, // Points that have been distributed from the allocated pool
    earned_rewards: u64, // Rewards earned by the founder
    api_key: Option<String>, // Optional API key for the founder
    is_active: bool, // Status indicating if the founder is active
    founder_name: String, // Name of the founder
}

#[derive(Debug, Clone, Serialize, Deserialize)] // Derive traits for debugging, cloning, serialization, and deserialization
struct ContractInfo {
    name: String, // Name of the contract
    contract_address: String, // Address of the contract
    abi_hash: String, // ABI hash of the contract
    current_points: u64, // Current points allocated to the contract
    pending_rewards: u64, // Rewards pending for the contract
    claimed_rewards: u64, // Rewards that have been claimed from the contract
    category: String, // Category of the contract
    is_verified: bool, // Status indicating if the contract is verified
}

// ======================================
// ======== State Management ============
// ======================================

struct State {
    founders: Mutex<HashMap<String, Founder>>, // Mutex-protected HashMap of founders keyed by founder name
    api_key_to_founder: Mutex<HashMap<String, String>>, // Mutex-protected HashMap mapping API keys to founder names
    registered_contracts: Mutex<HashMap<String, ContractInfo>>, // Mutex-protected HashMap of contracts keyed by contract address
    category_contracts: Mutex<HashMap<String, HashSet<String>>>, // Mutex-protected HashMap mapping categories to sets of contract addresses
    active_founders: Mutex<HashSet<String>>, // Mutex-protected HashSet of active founder names
}

type SharedState = Arc<State>; // Define SharedState as an atomic reference-counted pointer to State

// ======================================
// ======== Request Structs =============
// ======================================

#[derive(Debug, Deserialize)] // Derive traits for debugging and deserialization
struct AllocatePointsRequest {
    founder_address: String, // Address of the founder to allocate points to
    points: u64, // Number of points to allocate
}

#[derive(Debug, Deserialize)] // Derive traits for debugging and deserialization
struct DistributePointsRequest {
    founder_address: String, // Address of the founder distributing points
    contract_address: String, // Address of the contract receiving points
    points: u64, // Number of points to distribute
}

#[derive(Debug, Deserialize)] // Derive traits for debugging and deserialization
struct ConvertPointsRequest {
    founder_address: String, // Address of the founder converting points
    contract_address: String, // Address of the contract involved in conversion
    points_to_convert: u64, // Number of points to convert to rewards
}

#[derive(Debug, Deserialize)] // Derive traits for debugging and deserialization
struct ClaimRewardsRequest {
    founder_address: String, // Address of the founder claiming rewards
    contract_address: String, // Address of the contract from which to claim rewards
}

#[derive(Debug, Deserialize)] // Derive traits for debugging and deserialization
struct FounderCreationRequest {
    founder_name: String, // Name of the founder to create
    allocated_points: u64, // Points to allocate to the new founder
    api_key: Option<String>, // Optional API key for the new founder
    is_active: bool, // Status indicating if the new founder is active
}

// ======================================
// ======== API Endpoints ===============
// ======================================

#[post("/create_founder")] // Define POST endpoint for creating a founder
async fn create_founder(
    state: web::Data<SharedState>, // Shared application state
    req: web::Json<FounderCreationRequest>, // JSON payload for founder creation
) -> impl Responder {
    // Lock the founders mutex to get mutable access
    let mut founders = state.founders.lock().unwrap();

    // Check if the founder already exists
    if founders.contains_key(&req.founder_name) {
        return HttpResponse::BadRequest().json("Founder already exists.");
    }

    // Create a new Founder instance
    let new_founder = Founder {
        contracts: Vec::new(),
        allocated_points: req.allocated_points,
        distributed_points: 0,
        earned_rewards: 0,
        api_key: req.api_key.clone(), // Clone the API key if provided
        is_active: req.is_active,
        founder_name: req.founder_name.clone(),
    };

    // Insert the new founder into the HashMap
    founders.insert(req.founder_name.clone(), new_founder);

    // Optionally, handle API key mapping if an API key is provided
    if let Some(api_key) = &req.api_key {
        let mut api_key_map = state.api_key_to_founder.lock().unwrap();
        api_key_map.insert(api_key.clone(), req.founder_name.clone());
    }

    // Add to active_founders if the founder is active
    if req.is_active {
        let mut active_founders = state.active_founders.lock().unwrap();
        active_founders.insert(req.founder_name.clone());
    }

    HttpResponse::Ok().json("Founder created successfully.") // Return success response
}

#[post("/allocate_points")] // Define POST endpoint for allocating points to a founder
async fn allocate_points_to_founder(state: web::Data<SharedState>, req: web::Json<AllocatePointsRequest>) -> impl Responder {
    let mut founders = state.founders.lock().unwrap(); // Lock founders for mutable access
    if let Some(founder) = founders.get_mut(&req.founder_address) { // Retrieve founder by address
        if founder.is_active { // Check if founder is active
            founder.allocated_points += req.points; // Allocate points
            return HttpResponse::Ok().json("Points allocated successfully."); // Return success
        } else {
            return HttpResponse::BadRequest().json("Founder is not active."); // Return error if inactive
        }
    }
    HttpResponse::BadRequest().json("Founder not found.") // Return error if founder doesn't exist
}

#[post("/distribute_points")] // Define POST endpoint for distributing points to a contract
async fn distribute_points_to_contract(
    state: web::Data<SharedState>, // Shared application state
    req: web::Json<DistributePointsRequest>, // JSON payload for distributing points
) -> impl Responder {
    // Lock founders and registered_contracts separately
    let mut founders = state.founders.lock().unwrap();
    if let Some(founder) = founders.get_mut(&req.founder_address) { // Retrieve founder by address
        if !founder.is_active { // Check if founder is active
            return HttpResponse::BadRequest().json("Founder is not active."); // Return error if inactive
        }
        let available_points = founder.allocated_points - founder.distributed_points; // Calculate available points
        if req.points > available_points { // Check if sufficient points are available
            return HttpResponse::BadRequest().json("Insufficient allocated points."); // Return error if not enough points
        }

        // Lock registered_contracts separately
        let mut contracts = state.registered_contracts.lock().unwrap();
        if let Some(contract) = contracts.get_mut(&req.contract_address) { // Retrieve contract by address
            founder.distributed_points += req.points; // Update distributed points
            contract.current_points += req.points; // Update contract's current points
            return HttpResponse::Ok().json("Points distributed successfully."); // Return success
        } else {
            return HttpResponse::BadRequest().json("Contract not registered."); // Return error if contract not found
        }
    }
    HttpResponse::BadRequest().json("Founder not found.") // Return error if founder doesn't exist
}

#[post("/convert_points")] // Define POST endpoint for converting points to rewards
async fn convert_points_to_rewards(state: web::Data<SharedState>, req: web::Json<ConvertPointsRequest>) -> impl Responder {
    let mut contracts = state.registered_contracts.lock().unwrap(); // Lock contracts for mutable access
    if let Some(contract) = contracts.get_mut(&req.contract_address) { // Retrieve contract by address
        if req.points_to_convert > contract.current_points { // Check if sufficient points to convert
            return HttpResponse::BadRequest().json("Insufficient points to convert."); // Return error if not enough points
        }
        let rewards_generated = req.points_to_convert / 100; // Calculate rewards, assuming 100 points = 1 reward
        contract.current_points -= req.points_to_convert; // Deduct converted points from contract
        contract.pending_rewards += rewards_generated; // Add generated rewards to pending rewards
        return HttpResponse::Ok().json("Points converted to rewards successfully."); // Return success
    }
    HttpResponse::BadRequest().json("Contract not found.") // Return error if contract doesn't exist
}

#[post("/claim_rewards")] // Define POST endpoint for claiming rewards
async fn claim_rewards(state: web::Data<SharedState>, req: web::Json<ClaimRewardsRequest>) -> impl Responder {
    // Lock founders and registered_contracts separately
    let mut founders = state.founders.lock().unwrap();
    if let Some(founder) = founders.get_mut(&req.founder_address) { // Retrieve founder by address
        if !founder.is_active { // Check if founder is active
            return HttpResponse::BadRequest().json("Founder is not active."); // Return error if inactive
        }

        // Lock registered_contracts separately
        let mut contracts = state.registered_contracts.lock().unwrap();
        if let Some(contract) = contracts.get_mut(&req.contract_address) { // Retrieve contract by address
            if contract.pending_rewards == 0 { // Check if there are pending rewards
                return HttpResponse::BadRequest().json("No rewards to claim."); // Return error if no rewards
            }
            founder.earned_rewards += contract.pending_rewards; // Add pending rewards to founder's earned rewards
            contract.claimed_rewards += contract.pending_rewards; // Update contract's claimed rewards
            contract.pending_rewards = 0; // Reset pending rewards
            return HttpResponse::Ok().json("Rewards claimed successfully."); // Return success
        } else {
            return HttpResponse::BadRequest().json("Contract not found."); // Return error if contract doesn't exist
        }
    }
    HttpResponse::BadRequest().json("Founder not found.") // Return error if founder doesn't exist
}

// ======================================
// ======== GET Endpoint ===============
// ======================================

#[get("/get_founder/{founder_name}")] // Define GET endpoint to retrieve founder information
async fn get_founder(state: web::Data<SharedState>, path: web::Path<String>) -> impl Responder {
    let founder_name = path.into_inner(); // Extract founder name from the path
    let founders = state.founders.lock().unwrap(); // Lock founders for read access
    if let Some(founder) = founders.get(&founder_name) { // Retrieve founder by name
        HttpResponse::Ok().json(founder) // Return founder information as JSON
    } else {
        HttpResponse::BadRequest().json("Founder not found.") // Return error if founder doesn't exist
    }
}

// ======================================
// ======== Utility Functions ===========
// ======================================

/// Adds a default founder named `founder1` to the system.
///
/// # Arguments
///
/// * `state` - An `Arc` pointing to the shared application state.
///
/// # Example
///
/// ```rust
/// add_default_founder(&state);
/// ```
fn add_default_founder(state: &SharedState) {
    // Lock the mutexes to gain mutable access to the state
    let mut founders = state.founders.lock().unwrap();
    let mut api_key_map = state.api_key_to_founder.lock().unwrap();
    let mut active_founders = state.active_founders.lock().unwrap();

    // Define the default founder
    let default_founder = Founder {
        contracts: Vec::new(), // Initialize with no contracts
        allocated_points: 1000, // Assign desired default points
        distributed_points: 0, // No points distributed initially
        earned_rewards: 0, // No rewards earned initially
        api_key: Some("default_api_key_123".to_string()), // Assign desired API key
        is_active: true, // Set founder as active
        founder_name: "founder1".to_string(), // Name the founder as 'founder1'
    };

    // Insert the default founder into the `founders` HashMap
    founders.insert(default_founder.founder_name.clone(), default_founder.clone());

    // Map the API key to the founder if an API key is provided
    if let Some(api_key) = &default_founder.api_key {
        api_key_map.insert(api_key.clone(), default_founder.founder_name.clone());
    }

    // Add the founder to the `active_founders` HashSet
    active_founders.insert(default_founder.founder_name.clone());
}

// ======================================
// ======== Main Function ===============
// ======================================

#[actix_web::main] // Attribute to designate the main function for Actix Web
async fn main() -> std::io::Result<()> {
    // Initialize the shared state
    let state = web::Data::new(SharedState::new(State {
        founders: Mutex::new(HashMap::new()), // Initialize empty HashMap for founders
        api_key_to_founder: Mutex::new(HashMap::new()), // Initialize empty HashMap for API keys
        registered_contracts: Mutex::new(HashMap::new()), // Initialize empty HashMap for contracts
        category_contracts: Mutex::new(HashMap::new()), // Initialize empty HashMap for category contracts
        active_founders: Mutex::new(HashSet::new()), // Initialize empty HashSet for active founders
    }));

    // Add the default founder `founder1`
    add_default_founder(&state);

    // Start the HTTP server
    HttpServer::new(move || { // Create a new instance of the HTTP server
        App::new()
            .app_data(state.clone()) // Share the application state with all routes
            .service(create_founder) // Register the create_founder endpoint
            .service(allocate_points_to_founder) // Register the allocate_points_to_founder endpoint
            .service(distribute_points_to_contract) // Register the distribute_points_to_contract endpoint
            .service(convert_points_to_rewards) // Register the convert_points_to_rewards endpoint
            .service(claim_rewards) // Register the claim_rewards endpoint
            .service(get_founder) // Register the get_founder GET endpoint
    })
    .bind("127.0.0.1:8080")? // Bind the server to localhost on port 8080
    .run() // Run the server
    .await // Await the server's future
}