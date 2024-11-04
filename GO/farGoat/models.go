package main

import (
	"time"

	"gorm.io/gorm"
)

// Updated struct to match the profiles table
type Profile struct {
	ID            string `gorm:"primaryKey;type:uuid" json:"id"` // UUID as string
	UserID        string `gorm:"type:uuid;not null" json:"user_id"`
	Email         string `json:"email"`
	WalletAddress string `json:"wallet_address"`
	UniqueName    string `json:"unique_name"`
	CreatedAt     string `json:"created_at"` // Use appropriate type for timestamps
	UpdatedAt     string `json:"updated_at"` // Use appropriate type for timestamps
}

type Project struct {
	ID        string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	FounderID string         `gorm:"type:uuid;not null" json:"founder_id"`
	Title     string         `gorm:"type:varchar(255);not null" json:"title"`
	Status    string         `gorm:"type:varchar(50);not null" json:"status"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Define other models as needed
