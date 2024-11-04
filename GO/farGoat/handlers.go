package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateProfile(c *gin.Context) {
	var input Profile
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create profile"})
		return
	}

	c.JSON(http.StatusOK, input)
}

func GetProfile(c *gin.Context) {
	var profile Profile
	id := c.Param("id")

	if err := DB.First(&profile, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// Implement other handlers as needed
