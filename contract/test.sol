// use actix_web::{web, App, HttpResponse, HttpServer, Responder, post, get, put};
// use serde::{Deserialize, Serialize};
// use std::collections::{HashMap, HashSet};
// use std::sync::{Arc, Mutex};

// // ======================================
// // ======== Struct Definitions ==========
// // ======================================

// #[derive(Debug, Clone, Serialize, Deserialize)]
// struct Founder {
//     contracts: Vec<String>,
//     allocated_points: u64,
//     distributed_points: u64,
//     earned_rewards: u64,
//     api_key: Option<String>,
//     is_active: bool,
//     founder_name: String,
// }

// #[derive(Debug, Clone, Serialize, Deserialize)]
// struct ContractInfo {
//     name: String,
//     contract_address: String,
//     abi_hash: String,
//     current_points: u64,
//     pending_rewards: u64,
//     claimed_rewards: u64,
//     category: String,
//     is_verified: bool,
// }

// // ======================================
// // ======== State Management ============
// // ======================================

// type SharedState = Arc<Mutex<State>>;

// struct State {
//     founders: HashMap<String, Founder>,
//     api_key_to_founder: HashMap<String, String>,
//     registered_contracts: HashMap<String, ContractInfo>,
//     category_contracts: HashMap<String, HashSet<String>>,
//     active_founders: HashSet<String>,
// }

// // ======================================
// // ======== API Endpoints ===============
// // ======================================

// #[post("/allocate_points")]
// async fn allocate_points_to_founder(state: web::Data<SharedState>, req: web::Json<AllocatePointsRequest>) -> impl Responder {
//     let mut state = state.lock().unwrap();
//     if let Some(founder) = state.founders.get_mut(&req.founder_address) {
//         if founder.is_active {
//             founder.allocated_points += req.points;
//             return HttpResponse::Ok().json("Points allocated successfully.");
//         } else {
//             return HttpResponse::BadRequest().json("Founder is not active.");
//         }
//     }
//     HttpResponse::BadRequest().json("Founder not found.")
// }

// #[post("/distribute_points")]
// async fn distribute_points_to_contract(state: web::Data<SharedState>, req: web::Json<DistributePointsRequest>) -> impl Responder {
//     let mut state = state.lock().unwrap();
//     if let Some(founder) = state.founders.get_mut(&req.founder_address) {
//         if !founder.is_active {
//             return HttpResponse::BadRequest().json("Founder is not active.");
//         }
//         let available_points = founder.allocated_points - founder.distributed_points;
//         if req.points > available_points {
//             return HttpResponse::BadRequest().json("Insufficient allocated points.");
//         }
//         if let Some(contract) = state.registered_contracts.get_mut(&req.contract_address) {
//             founder.distributed_points += req.points;
//             contract.current_points += req.points;
//             return HttpResponse::Ok().json("Points distributed successfully.");
//         }
//         return HttpResponse::BadRequest().json("Contract not registered.");
//     }
//     HttpResponse::BadRequest().json("Founder not found.")
// }

// #[post("/convert_points")]
// async fn convert_points_to_rewards(state: web::Data<SharedState>, req: web::Json<ConvertPointsRequest>) -> impl Responder {
//     let mut state = state.lock().unwrap();
//     if let Some(contract) = state.registered_contracts.get_mut(&req.contract_address) {
//         if req.points_to_convert > contract.current_points {
//             return HttpResponse::BadRequest().json("Insufficient points to convert.");
//         }
//         let rewards_generated = req.points_to_convert / 100; // Assuming 100 points = 1 reward
//         contract.current_points -= req.points_to_convert;
//         contract.pending_rewards += rewards_generated;
//         return HttpResponse::Ok().json("Points converted to rewards successfully.");
//     }
//     HttpResponse::BadRequest().json("Contract not found.")
// }

// #[post("/claim_rewards")]
// async fn claim_rewards(state: web::Data<SharedState>, req: web::Json<ClaimRewardsRequest>) -> impl Responder {
//     let mut state = state.lock().unwrap();
//     if let Some(founder) = state.founders.get_mut(&req.founder_address) {
//         if !founder.is_active {
//             return HttpResponse::BadRequest().json("Founder is not active.");
//         }
//         if let Some(contract) = state.registered_contracts.get_mut(&req.contract_address) {
//             if contract.pending_rewards == 0 {
//                 return HttpResponse::BadRequest().json("No rewards to claim.");
//             }
//             founder.earned_rewards += contract.pending_rewards;
//             contract.claimed_rewards += contract.pending_rewards;
//             contract.pending_rewards = 0;
//             return HttpResponse::Ok().json("Rewards claimed successfully.");
//         }
//         return HttpResponse::BadRequest().json("Contract not found.");
//     }
//     HttpResponse::BadRequest().json("Founder not found.")
// }

// // ======================================
// // ======== Request Structs =============
// // ======================================

// #[derive(Debug, Deserialize)]
// struct AllocatePointsRequest {
//     founder_address: String,
//     points: u64,
// }

// #[derive(Debug, Deserialize)]
// struct DistributePointsRequest {
//     founder_address: String,
//     contract_address: String,
//     points: u64,
// }

// #[derive(Debug, Deserialize)]
// struct ConvertPointsRequest {
//     founder_address: String,
//     contract_address: String,
//     points_to_convert: u64,
// }

// #[derive(Debug, Deserialize)]
// struct ClaimRewardsRequest {
//     founder_address: String,
//     contract_address: String,
// }

// // ======================================
// // ======== Main Function ===============
// // ======================================

// #[actix_web::main]
// async fn main() -> std::io::Result<()> {
//     let state = web::Data::new(SharedState::new(Mutex::new(State {
//         founders: HashMap::new(),
//         api_key_to_founder: HashMap::new(),
//         registered_contracts: HashMap::new(),
//         category_contracts: HashMap::new(),
//         active_founders: HashSet::new(),
//     })));

//     HttpServer::new(move || {
//         App::new()
//             .app_data(state.clone())
//             .service(allocate_points_to_founder)
//             .service(distribute_points_to_contract)
//             .service(convert_points_to_rewards)
//             .service(claim_rewards)
//     })
//     .bind("127.0.0.1:8080")?
//     .run()
//     .await
// }
