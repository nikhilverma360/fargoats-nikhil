use actix_web::{web, App, HttpResponse, HttpServer, Responder, post, get};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::sync::{Arc, Mutex};

// ======================================
// ======== Struct Definitions ==========
// ======================================

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Founder {
    contracts: Vec<String>,
    allocated_points: u64,
    distributed_points: u64,
    earned_rewards: u64,
    api_key: Option<String>,
    is_active: bool,
    founder_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ContractInfo {
    name: String,
    contract_address: String,
    abi_hash: String,
    current_points: u64,
    pending_rewards: u64,
    claimed_rewards: u64,
    category: String,
    is_verified: bool,
}

// ======================================
// ======== State Management ============
// ======================================

struct State {
    founders: Mutex<HashMap<String, Founder>>,
    api_key_to_founder: Mutex<HashMap<String, String>>,
    registered_contracts: Mutex<HashMap<String, ContractInfo>>,
    category_contracts: Mutex<HashMap<String, HashSet<String>>>,
    active_founders: Mutex<HashSet<String>>,
}

type SharedState = Arc<State>;

// ======================================
// ======== Request Structs =============
// ======================================

#[derive(Debug, Deserialize)]
struct AllocatePointsRequest {
    founder_address: String,
    points: u64,
}

#[derive(Debug, Deserialize)]
struct DistributePointsRequest {
    founder_address: String,
    contract_address: String,
    points: u64,
}

#[derive(Debug, Deserialize)]
struct ConvertPointsRequest {
    founder_address: String,
    contract_address: String,
    points_to_convert: u64,
}

#[derive(Debug, Deserialize)]
struct ClaimRewardsRequest {
    founder_address: String,
    contract_address: String,
}

#[derive(Debug, Deserialize)]
struct FounderCreationRequest {
    founder_name: String,
    allocated_points: u64,
    api_key: Option<String>, // Optional API key
    is_active: bool,
}

// ======================================
// ======== API Endpoints ===============
// ======================================

#[post("/create_founder")]
async fn create_founder(
    state: web::Data<SharedState>,
    req: web::Json<FounderCreationRequest>,
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

    HttpResponse::Ok().json("Founder created successfully.")
}

#[post("/allocate_points")]
async fn allocate_points_to_founder(state: web::Data<SharedState>, req: web::Json<AllocatePointsRequest>) -> impl Responder {
    let mut founders = state.founders.lock().unwrap();
    if let Some(founder) = founders.get_mut(&req.founder_address) {
        if founder.is_active {
            founder.allocated_points += req.points;
            return HttpResponse::Ok().json("Points allocated successfully.");
        } else {
            return HttpResponse::BadRequest().json("Founder is not active.");
        }
    }
    HttpResponse::BadRequest().json("Founder not found.")
}

#[post("/distribute_points")]
async fn distribute_points_to_contract(
    state: web::Data<SharedState>,
    req: web::Json<DistributePointsRequest>,
) -> impl Responder {
    // Lock founders and registered_contracts separately
    let mut founders = state.founders.lock().unwrap();
    if let Some(founder) = founders.get_mut(&req.founder_address) {
        if !founder.is_active {
            return HttpResponse::BadRequest().json("Founder is not active.");
        }
        let available_points = founder.allocated_points - founder.distributed_points;
        if req.points > available_points {
            return HttpResponse::BadRequest().json("Insufficient allocated points.");
        }

        // Lock registered_contracts separately
        let mut contracts = state.registered_contracts.lock().unwrap();
        if let Some(contract) = contracts.get_mut(&req.contract_address) {
            founder.distributed_points += req.points;
            contract.current_points += req.points;
            return HttpResponse::Ok().json("Points distributed successfully.");
        } else {
            return HttpResponse::BadRequest().json("Contract not registered.");
        }
    }
    HttpResponse::BadRequest().json("Founder not found.")
}

#[post("/convert_points")]
async fn convert_points_to_rewards(state: web::Data<SharedState>, req: web::Json<ConvertPointsRequest>) -> impl Responder {
    let mut contracts = state.registered_contracts.lock().unwrap();
    if let Some(contract) = contracts.get_mut(&req.contract_address) {
        if req.points_to_convert > contract.current_points {
            return HttpResponse::BadRequest().json("Insufficient points to convert.");
        }
        let rewards_generated = req.points_to_convert / 100; // Assuming 100 points = 1 reward
        contract.current_points -= req.points_to_convert;
        contract.pending_rewards += rewards_generated;
        return HttpResponse::Ok().json("Points converted to rewards successfully.");
    }
    HttpResponse::BadRequest().json("Contract not found.")
}

#[post("/claim_rewards")]
async fn claim_rewards(state: web::Data<SharedState>, req: web::Json<ClaimRewardsRequest>) -> impl Responder {
    // Lock founders and registered_contracts separately
    let mut founders = state.founders.lock().unwrap();
    if let Some(founder) = founders.get_mut(&req.founder_address) {
        if !founder.is_active {
            return HttpResponse::BadRequest().json("Founder is not active.");
        }

        // Lock registered_contracts separately
        let mut contracts = state.registered_contracts.lock().unwrap();
        if let Some(contract) = contracts.get_mut(&req.contract_address) {
            if contract.pending_rewards == 0 {
                return HttpResponse::BadRequest().json("No rewards to claim.");
            }
            founder.earned_rewards += contract.pending_rewards;
            contract.claimed_rewards += contract.pending_rewards;
            contract.pending_rewards = 0;
            return HttpResponse::Ok().json("Rewards claimed successfully.");
        } else {
            return HttpResponse::BadRequest().json("Contract not found.");
        }
    }
    HttpResponse::BadRequest().json("Founder not found.")
}

// ======================================
// ======== GET Endpoint ===============
// ======================================

#[get("/get_founder/{founder_name}")]
async fn get_founder(state: web::Data<SharedState>, path: web::Path<String>) -> impl Responder {
    let founder_name = path.into_inner();
    let founders = state.founders.lock().unwrap();
    if let Some(founder) = founders.get(&founder_name) {
        HttpResponse::Ok().json(founder)
    } else {
        HttpResponse::BadRequest().json("Founder not found.")
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
        contracts: Vec::new(),
        allocated_points: 1000,           // Assign desired default points
        distributed_points: 0,
        earned_rewards: 0,
        api_key: Some("default_api_key_123".to_string()), // Assign desired API key
        is_active: true,
        founder_name: "founder1".to_string(),
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

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize the shared state
    let state = web::Data::new(SharedState::new(State {
        founders: Mutex::new(HashMap::new()),
        api_key_to_founder: Mutex::new(HashMap::new()),
        registered_contracts: Mutex::new(HashMap::new()),
        category_contracts: Mutex::new(HashMap::new()),
        active_founders: Mutex::new(HashSet::new()),
    }));

    // Add the default founder `founder1`
    add_default_founder(&state);

    // Start the HTTP server
    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .service(create_founder) // Register the new endpoint
            .service(allocate_points_to_founder)
            .service(distribute_points_to_contract)
            .service(convert_points_to_rewards)
            .service(claim_rewards)
            .service(get_founder) // Register the GET endpoint
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}