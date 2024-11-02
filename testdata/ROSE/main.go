package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// ChartData represents the chart data
type ChartData struct {
	Timestamp int64     `json:"timestamp"`
	Values    []float64 `json:"values"`
	Labels    []string  `json:"labels"`
}

// TableData represents the table data
type TableData struct {
	ID     int     `json:"id"`
	Name   string  `json:"name"`
	Value  float64 `json:"value"`
	Status string  `json:"status"`
}

// AppState holds the shared application state
type AppState struct {
	ChartData      ChartData
	ChartDataMutex sync.Mutex
	TableData      []TableData
	TableDataMutex sync.Mutex
}

func main() {
	appState := &AppState{
		ChartData: ChartData{
			Timestamp: 0,
			Values:    []float64{},
			Labels:    []string{},
		},
		TableData: []TableData{},
	}

	// Start background goroutine to update data every 5 seconds
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			updateData(appState)
		}
	}()

	// Set up router
	router := mux.NewRouter()

	// Apply CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST"},
		AllowedHeaders:   []string{"Authorization", "Accept", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           3600,
	})

	router.HandleFunc("/api/chart", getChartData(appState)).Methods("GET")
	router.HandleFunc("/api/table", getTableData(appState)).Methods("GET")

	// Add handler for /handler
	router.HandleFunc("/handler", handler()).Methods("GET")

	// Start server
	log.Println("Starting server on :8080")
	if err := http.ListenAndServe(":8080", c.Handler(router)); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

// updateData updates the ChartData and TableData
func updateData(appState *AppState) {
	rand.Seed(time.Now().UnixNano())

	// Update chart data
	chart := ChartData{
		Timestamp: time.Now().Unix(),
		Values:    generateRandomFloats(5, -100.0, 100.0),
		Labels:    generateLabels(5),
	}

	appState.ChartDataMutex.Lock()
	appState.ChartData = chart
	appState.ChartDataMutex.Unlock()

	log.Printf("Updated ChartData: %+v\n", chart)

	// Update table data
	table := make([]TableData, 10)
	statuses := []string{"Active", "Pending", "Inactive"}
	for i := 0; i < 10; i++ {
		table[i] = TableData{
			ID:     i,
			Name:   fmt.Sprintf("Item %d", i),
			Value:  rand.Float64() * 1000.0,
			Status: statuses[rand.Intn(len(statuses))],
		}
	}

	appState.TableDataMutex.Lock()
	appState.TableData = table
	appState.TableDataMutex.Unlock()

	log.Printf("Updated TableData: %+v\n", table)
}

// generateRandomFloats generates a slice of random floats
func generateRandomFloats(n int, min, max float64) []float64 {
	floats := make([]float64, n)
	for i := 0; i < n; i++ {
		floats[i] = min + rand.Float64()*(max-min)
	}
	return floats
}

// generateLabels generates a slice of label strings
func generateLabels(n int) []string {
	labels := make([]string, n)
	for i := 0; i < n; i++ {
		labels[i] = fmt.Sprintf("Series %d", i)
	}
	return labels
}

// getChartData returns a handler for /api/chart
func getChartData(appState *AppState) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		appState.ChartDataMutex.Lock()
		defer appState.ChartDataMutex.Unlock()

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(appState.ChartData); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		log.Printf("GET /api/chart - Response: %+v\n", appState.ChartData)
	}
}

// getTableData returns a handler for /api/table
func getTableData(appState *AppState) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		appState.TableDataMutex.Lock()
		defer appState.TableDataMutex.Unlock()

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(appState.TableData); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		log.Printf("GET /api/table - Response: %+v\n", appState.TableData)
	}
}

// handler returns a handler that responds with a message
func handler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		response := map[string]string{
			"message": "你好，世界",
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(response); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}