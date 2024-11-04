package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid" // Import the UUID package
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB
var localStore = make(map[string]Profile) // Change to string for UUID

func initDB() {
	dsn := "host=your_host user=your_user password=your_password dbname=your_db port=5432 sslmode=disable"
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Println("Failed to connect to database, using local storage")
		db = nil
	} else {
		db.AutoMigrate(&Profile{}) // Migrate the Profile struct
	}
}

func main() {
	initDB()

	r := gin.Default()
	r.GET("/profiles", getProfiles)          // Updated endpoint
	r.POST("/profiles", createProfile)       // Updated endpoint
	r.PUT("/profiles/:id", updateProfile)    // Updated endpoint
	r.DELETE("/profiles/:id", deleteProfile) // Updated endpoint

	r.Run(":6666")
}

func getProfiles(c *gin.Context) {
	if db != nil {
		var profiles []Profile
		db.Find(&profiles)
		c.JSON(http.StatusOK, profiles)
	} else {
		var profiles []Profile
		for _, profile := range localStore {
			profiles = append(profiles, profile)
		}
		c.JSON(http.StatusOK, profiles)
	}
}

func createProfile(c *gin.Context) {
	var profile Profile
	if err := c.ShouldBindJSON(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate a new UUID for the profile ID
	profile.ID = uuid.New().String()

	if db != nil {
		db.Create(&profile)
	} else {
		localStore[profile.ID] = profile // Use UUID as key
	}

	c.JSON(http.StatusCreated, profile)
}

func updateProfile(c *gin.Context) {
	id := c.Param("id")
	var profile Profile
	if err := c.ShouldBindJSON(&profile); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if db != nil {
		db.Model(&Profile{}).Where("id = ?", id).Updates(profile)
	} else {
		localStore[id] = profile // Use UUID as key
	}

	c.JSON(http.StatusOK, profile)
}

func deleteProfile(c *gin.Context) {
	id := c.Param("id")

	if db != nil {
		db.Delete(&Profile{}, id)
	} else {
		delete(localStore, id) // Use UUID as key
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile deleted"})
}
