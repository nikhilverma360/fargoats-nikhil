```rust:farGoat/src/main.rs:add_default_founder
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
```

```rust:farGoat/src/main.rs:main_function_update
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
            .service(get_founder) // Register the GET endpoint (if implemented)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
```

```rust:farGoat/src/main.rs:get_founder
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
```

```rust:farGoat/src/main.rs:main.rs
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
```

## Explanation of Changes

### 1. **`add_default_founder` Function**

- **Location**: Added to `farGoat/src/main.rs` under the **Utility Functions** section.
- **Purpose**: Initializes and inserts a default founder (`founder1`) into the system.
- **Implementation**:
  - Locks the necessary `Mutex`es to safely modify shared state.
  - Creates a `Founder` instance with predefined values.
  - Inserts the founder into the `founders` `HashMap`.
  - Maps the `api_key` to the founder's name in `api_key_to_founder`.
  - Adds the founder to the `active_founders` `HashSet`.

### 2. **Modifications in the `main` Function**

- **Location**: Updated in `farGoat/src/main.rs` under the **Main Function** section.
- **Changes**:
  - After initializing the shared state, the `add_default_founder(&state);` function is called to ensure that `founder1` is added before the server starts handling requests.
  - Registered the new GET endpoint `get_founder` alongside existing endpoints.

### 3. **Adding the `get_founder` Endpoint**

- **Location**: Added to `farGoat/src/main.rs` under the **API Endpoints** section.
- **Endpoint**: `/get_founder/{founder_name}`
- **Purpose**: Allows retrieval of founder details by founder name.
- **Implementation**:
  - Locks the `founders` `Mutex` to access founder data.
  - Returns the founder's details in JSON format if found; otherwise, returns an error message.

### 4. **Registration of the `get_founder` Endpoint**

- **Location**: Updated in the `main` function within `farGoat/src/main.rs`.
- **Change**: Added `.service(get_founder)` to the Actix-web `App` configuration to register the new GET endpoint.

### 5. **Complete Updated `main.rs`**

- **Location**: Provided as a comprehensive code block for `farGoat/src/main.rs`.
- **Highlights**:
  - Incorporates the `add_default_founder` function.
  - Registers the new `get_founder` endpoint.
  - Ensures that `founder1` is added upon server startup.
  - Maintains existing functionalities and structures.

## Testing the Default Founder

After implementing the changes, it's crucial to verify that the default founder `founder1` has been successfully added and is functioning as expected.

### 1. **Run the Application**

Start your Actix-web server using `cargo run`:

```bash
cargo run
```

**Expected Output:**

```
    Compiling farGoat v0.1.0 (/path/to/farGoat)
    Finished dev [unoptimized + debuginfo] target(s) in 2.34s
     Running `target/debug/farGoat`
Server running at http://127.0.0.1:8080/
```

### 2. **Verify the Default Founder**

#### **a. Allocate Points to `founder1`**

Use the `/allocate_points` endpoint to allocate additional points to `founder1`:

```bash
curl -X POST \
  http://127.0.0.1:8080/allocate_points \
  -H 'Content-Type: application/json' \
  -d '{
        "founder_address": "founder1",
        "points": 500
      }'
```

**Expected Response:**

```json
"Points allocated successfully."
```

#### **b. Attempt to Create `founder1` Again**

Since `founder1` already exists, attempting to create it again should result in an error:

```bash
curl -X POST \
  http://127.0.0.1:8080/create_founder \
  -H 'Content-Type: application/json' \
  -d '{
        "founder_name": "founder1",
        "allocated_points": 1000,
        "api_key": "another_api_key",
        "is_active": true
      }'
```

**Expected Response:**

```json
"Founder already exists."
```

#### **c. Retrieve Founder Information**

Use the newly added `/get_founder/{founder_name}` endpoint to retrieve details of `founder1`:

```bash
curl -X GET http://127.0.0.1:8080/get_founder/founder1
```

**Expected Response:**

```json
{
  "contracts": [],
  "allocated_points": 1500,
  "distributed_points": 0,
  "earned_rewards": 0,
  "api_key": "default_api_key_123",
  "is_active": true,
  "founder_name": "founder1"
}
```

**Explanation:**

- **Allocated Points**: Initially `1000` points allocated during founder creation, plus `500` points allocated via the `/allocate_points` endpoint, totaling `1500` points.
- **Distributed Points**: `0` since no points have been distributed yet.
- **Earned Rewards**: `0` as no rewards have been earned.
- **API Key**: Confirms the default API key assigned.
- **Is Active**: `true`, indicating `founder1` is active.

## Additional Considerations

While adding a default founder enhances the initial state of your application, here are some additional recommendations to ensure robustness and scalability.

### 1. **Error Handling Enhancements**

- **Mutex Lock Poisoning**: Currently, the code uses `.unwrap()` on mutex locks. In a production environment, it's better to handle potential `PoisonError`s gracefully.

    ```rust
    let mut founders = match state.founders.lock() {
        Ok(lock) => lock,
        Err(_) => return HttpResponse::InternalServerError().json("Failed to acquire lock."),
    };
    ```

- **Consistent Error Responses**: Standardize your error responses using enums or a dedicated error type to provide more context.

### 2. **Security Enhancements**

- **API Key Generation**: Automatically generate unique and secure API keys for founders instead of hardcoding them.

    ```rust:farGoat/src/main.rs:api_key_generation
    use uuid::Uuid;

    // Inside `add_default_founder`
    let generated_api_key = Uuid::new_v4().to_string();
    let default_founder = Founder {
        // ... other fields ...
        api_key: Some(generated_api_key.clone()),
        // ... remaining fields ...
    };

    // Map the generated API key to the founder
    api_key_map.insert(generated_api_key, default_founder.founder_name.clone());
    ```

    **Note**: Ensure you add `uuid` to your `Cargo.toml`:

    ```toml
    [dependencies]
    uuid = { version = "1.1", features = ["v4"] }
    ```

### 3. **Persistence with a Database**

Currently, your application uses in-memory storage (`HashMap` and `HashSet`), which means all data is lost when the server restarts. Integrating a persistent database (e.g., PostgreSQL, SQLite) can help maintain data integrity across restarts.

- **Advantages**:
  - **Data Persistence**: Data remains intact across server restarts.
  - **Scalability**: Databases can handle larger datasets efficiently.
  - **Querying Capabilities**: Perform complex queries and transactions.

- **Implementation Steps**:
  1. **Choose a Database**: Select a database that fits your needs (e.g., PostgreSQL for robust features, SQLite for simplicity).
  2. **Add Dependencies**: Include ORM or database driver crates like `diesel` or `sqlx`.
  3. **Define Database Schema**: Create tables for founders, contracts, etc.
  4. **Refactor State Management**: Replace in-memory `HashMap`s with database queries.
  5. **Migrate Existing Data**: If necessary, migrate data to the new database.

### 4. **Configuration Management**

Use environment variables or configuration files to manage settings like server addresses, ports, database URLs, and other configurable parameters.

- **Crate to Use**: [`dotenv`](https://crates.io/crates/dotenv) or [`config`](https://crates.io/crates/config).

### 5. **Comprehensive Logging**

Implement structured and level-based logging to monitor application behavior and debug issues effectively.

- **Crate to Use**: [`log`](https://crates.io/crates/log) and [`env_logger`](https://crates.io/crates/env_logger).

    ```rust
    use env_logger::Env;
    use log::{info, error};

    #[actix_web::main]
    async fn main() -> std::io::Result<()> {
        // Initialize logger
        env_logger::Builder::from_env(Env::default().default_filter_or("info")).init();

        // ... existing setup ...

        info!("Server running at http://127.0.0.1:8080/");
        // ...

        HttpServer::new(move || {
            App::new()
                // ... existing services ...
        })
        .bind("127.0.0.1:8080")?
        .run()
        .await
    }
    ```

### 6. **Testing and Validation**

- **Unit Tests**: Implement unit tests for individual components and functions.
- **Integration Tests**: Test the API endpoints to ensure they behave as expected.
- **Input Validation**: Ensure that incoming data is validated to prevent malformed or malicious inputs.

### 7. **API Documentation**

Use tools like **Swagger** or **OpenAPI** to document your API endpoints, making it easier for developers to understand and interact with your API.

## Conclusion

By following the steps outline above, you've successfully added a **default founder** named `founder1` to your `farGoat` Rust application. This enhancement provides a foundational founder that exists from the start, allowing immediate interactions and testing.

Feel free to expand upon this foundation by integrating persistent storage, enhancing security measures, and implementing comprehensive logging and error handling. These additions will contribute to building a robust and scalable application.

If you encounter any issues or have further questions, don't hesitate to ask!