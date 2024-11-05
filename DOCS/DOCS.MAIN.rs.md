

## 1. Running the Application

To **run** your Actix-web server, you can use the `cargo run` command. This command builds your project (if necessary) and then runs the resulting executable.

### **Command:**

```bash
cargo run
```

### **What Happens:**

- **Builds** the project (if not already built or if there are changes).
- **Runs** the resulting binary, starting your Actix-web server.

### **Alternative: Running the Built Binary Directly**

If you've already built the project using `cargo build`, you can run the binary directly:

```bash
./target/debug/farGoat
```

*Note: Replace `debug` with `release` if you've built the project in release mode using `cargo build --release`.*

---

## 2. Accessing the Server

Once the server is running, it listens on the specified address and port. Based on your `main.rs`, the server binds to `127.0.0.1:8080`.

### **Server Address:**

```
http://127.0.0.1:8080/
```

---

## 3. Testing the API Endpoints

You can interact with your API endpoints using tools like `curl`, [Postman](https://www.postman.com/), or any other API client. Below are examples using `curl`.

### **1. Allocate Points to Founder**

**Endpoint:**

```
POST /allocate_points
```

**Request Body:**

```json
{
  "founder_address": "founder1",
  "points": 1000
}
```

**`curl` Command:**

```bash
curl -X POST \
  http://127.0.0.1:8080/allocate_points \
  -H 'Content-Type: application/json' \
  -d '{
        "founder_address": "founder1",
        "points": 1000
      }'
```

### **2. Distribute Points to Contract**

**Endpoint:**

```
POST /distribute_points
```

**Request Body:**

```json
{
  "founder_address": "founder1",
  "contract_address": "contract1",
  "points": 500
}
```

**`curl` Command:**

```bash
curl -X POST \
  http://127.0.0.1:8080/distribute_points \
  -H 'Content-Type: application/json' \
  -d '{
        "founder_address": "founder1",
        "contract_address": "contract1",
        "points": 500
      }'
```

### **3. Convert Points to Rewards**

**Endpoint:**

```
POST /convert_points
```

**Request Body:**

```json
{
  "founder_address": "founder1",
  "contract_address": "contract1",
  "points_to_convert": 300
}
```

**`curl` Command:**

```bash
curl -X POST \
  http://127.0.0.1:8080/convert_points \
  -H 'Content-Type: application/json' \
  -d '{
        "founder_address": "founder1",
        "contract_address": "contract1",
        "points_to_convert": 300
      }'
```

### **4. Claim Rewards**

**Endpoint:**

```
POST /claim_rewards
```

**Request Body:**

```json
{
  "founder_address": "founder1",
  "contract_address": "contract1"
}
```

**`curl` Command:**

```bash
curl -X POST \
  http://127.0.0.1:8080/claim_rewards \
  -H 'Content-Type: application/json' \
  -d '{
        "founder_address": "founder1",
        "contract_address": "contract1"
      }'
```

---

## 4. Verifying Server Logs

As your server handles requests, you can monitor the **terminal** where `cargo run` is executing to see log outputs, which can help in debugging and verifying that your endpoints are functioning correctly.

---

## 5. Building for Production

If you're preparing your application for a **production** environment, it's recommended to build it in **release** mode for optimized performance.

### **Build Command:**

```bash
cargo build --release
```

### **Run the Release Binary:**

```bash
./target/release/farGoat
```

*Note: Ensure that your production environment has the necessary configurations and security measures in place.*

---

## 6. Additional Recommendations

### **1. Environment Configuration**

Consider using environment variables or configuration files to manage settings like the server address and port. This enhances flexibility and security.

### **2. Logging Enhancements**

Implement comprehensive logging using crates like [`env_logger`](https://crates.io/crates/env_logger) or [`log`](https://crates.io/crates/log) to capture detailed information about server operations.

### **3. Error Handling**

Enhance error handling to provide more informative responses and handle unexpected scenarios gracefully.

### **4. Documentation**

Use tools like [Swagger](https://swagger.io/) or [OpenAPI](https://www.openapis.org/) to document your API endpoints, making it easier for others to understand and interact with your API.

### **5. Testing**

Implement unit and integration tests to ensure the reliability and correctness of your application.

---

## 7. Example: Running and Testing the Server

Here's a complete workflow example:

### **1. Start the Server**

```bash
cargo run
```

**Output:**

```
    Finished dev [unoptimized + debuginfo] target(s) in 0.XXs
     Running `target/debug/farGoat`
Server running at http://127.0.0.1:8080/
```

### **2. Allocate Points**

```bash
curl -X POST \
  http://127.0.0.1:8080/allocate_points \
  -H 'Content-Type: application/json' \
  -d '{
        "founder_address": "founder1",
        "points": 1000
      }'
```

**Expected Response:**

```
"Points allocated successfully."
```

### **3. Distribute Points**

```bash
curl -X POST \
  http://127.0.0.1:8080/distribute_points \
  -H 'Content-Type: application/json' \
  -d '{
        "founder_address": "founder1",
        "contract_address": "contract1",
        "points": 500
      }'
```

**Expected Response:**

```
"Points distributed successfully."
```

---

## 8. Troubleshooting

### **1. Server Not Starting**

- **Check for Errors**: Ensure there are no runtime errors in the terminal.
- **Port Availability**: Verify that port `8080` is not occupied by another application.

### **2. API Requests Failing**

- **Endpoint URLs**: Ensure you're using the correct URLs and HTTP methods.
- **Request Body**: Validate the JSON structure in your requests.
- **Server Logs**: Examine server logs for detailed error messages.

### **3. Handling CORS (Cross-Origin Resource Sharing)**

If you plan to interact with the API from a web browser or a different domain, consider configuring CORS.

**Example with `actix-cors`:**

```rust:farGoat/src/main.rs
use actix_cors::Cors;

HttpServer::new(move || {
    App::new()
        .wrap(
            Cors::default()
                .allow_any_origin()
                .allow_any_method()
                .allow_any_header()
        )
        .app_data(state.clone())
        .service(allocate_points_to_founder)
        .service(distribute_points_to_contract)
        .service(convert_points_to_rewards)
        .service(claim_rewards)
})
.bind("127.0.0.1:8080")?
.run()
.await
```

*Ensure you add `actix-cors` to your `Cargo.toml`:*

```toml
[dependencies]
actix-web = "4"
actix-cors = "0.6"
serde = { version = "1.0", features = ["derive"] }
```

---

## 9. Conclusion

By following the steps outlined above, you can effectively **run** and **use** your `farGoat` Rust application after building it. Ensure that you:

- **Run** the server using `cargo run` or the built binary.
- **Interact** with the API endpoints using tools like `curl` or Postman.
- **Monitor** server logs for real-time feedback and debugging.
- **Optimize** and **secure** your application for production environments.

