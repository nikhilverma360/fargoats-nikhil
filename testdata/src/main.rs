use actix_web::{web, HttpResponse};
use serde::{Serialize, Deserialize};
use rand::Rng;
use std::time::Duration;
use tokio::time::interval;
use std::sync::{Arc, Mutex};

use serde_json::json;
use vercel_runtime::{Body, Error, Request, Response, StatusCode};

use actix_cors::Cors;
use actix_web::http;

#[derive(Serialize, Deserialize, Clone, Debug)]
struct ChartData {
    timestamp: i64,
    values: Vec<f64>,
    labels: Vec<String>
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct TableData {
    id: i32,
    name: String,
    value: f64,
    status: String
}

#[derive(Clone)]
struct AppState {
    chart_data: Arc<Mutex<ChartData>>,
    table_data: Arc<Mutex<Vec<TableData>>>
}

async fn get_chart_data(data: web::Data<AppState>) -> HttpResponse {
    let chart_data = data.chart_data.lock().unwrap();
    let response = HttpResponse::Ok().json(&*chart_data);
    
    println!("GET /api/chart - Response: {:?}", &*chart_data);
    response
}

async fn get_table_data(data: web::Data<AppState>) -> HttpResponse {
    let table_data = data.table_data.lock().unwrap();
    let response = HttpResponse::Ok().json(&*table_data);
    
    println!("GET /api/table - Response: {:?}", &*table_data);
    response
}


#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let chart_data = Arc::new(Mutex::new(ChartData {
        timestamp: 0,
        values: vec![],
        labels: vec![]
    }));

    let table_data = Arc::new(Mutex::new(Vec::new()));
    
    let chart_data_clone = chart_data.clone();
    let table_data_clone = table_data.clone();

    // Construct AppState
    let app_state = AppState {
        chart_data: chart_data_clone.clone(),
        table_data: table_data_clone.clone(),
    };

    // Background task to update data every 5 seconds
    tokio::spawn(async move {
        let mut interval = interval(Duration::from_secs(5));
        loop {
            interval.tick().await;
            let mut rng = rand::thread_rng();
            
            // Update chart data
            let mut chart = chart_data_clone.lock().unwrap();
            *chart = ChartData {
                timestamp: chrono::Utc::now().timestamp(),
                values: (0..5).map(|_| rng.gen_range(-100.0..100.0)).collect(),
                labels: (0..5).map(|i| format!("Series {}", i)).collect()
            };

            // Update table data
            let mut table = table_data_clone.lock().unwrap();
            *table = (0..10).map(|i| TableData {
                id: i,
                name: format!("Item {}", i),
                value: rng.gen_range(0.0..1000.0),
                status: ["Active", "Pending", "Inactive"][rng.gen_range(0..3)].to_string()
            }).collect();
        }
    });

    // Start the Actix web server
    actix_web::HttpServer::new(move || {
        let app_state = web::Data::new(app_state.clone());
        configure_routes(app_state)
    })
    .bind("127.0.0.1:8080")? // Specify the address and port
    .run()
    .await?; // Await the server run

    Ok(()) // Ensure to return Ok(())
}

pub async fn handler(_req: Request, _data: web::Data<AppState>) -> Result<Response<Body>, Error> {
    let response = json!({
        "message": "你好，世界"
    });

    Ok(Response::builder()
        .status(StatusCode::OK)
        .header("Content-Type", "application/json")
        .body(response.to_string().into())?)
}

// Add routes to use the functions
fn configure_routes(app_state: web::Data<AppState>) -> actix_web::App<
    impl actix_web::dev::ServiceFactory<
        actix_web::dev::ServiceRequest,
        Config = (),
        Error = actix_web::Error,
        InitError = (),
        Response = actix_web::dev::ServiceResponse<actix_web::body::EitherBody<actix_web::body::BoxBody>>,
    >
> {
    actix_web::App::new()
        .wrap(
            Cors::default()
                .allowed_origin("http://localhost:3001")
                .allowed_methods(vec!["GET", "POST"])
                .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
                .allowed_header(http::header::CONTENT_TYPE)
                .max_age(3600)
        )
        .app_data(app_state)
        .service(
            web::scope("/api")
                .route("/chart", web::get().to(get_chart_data))
                .route("/table", web::get().to(get_table_data))
        )
}