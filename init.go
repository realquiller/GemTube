package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

func init() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}
	ytbApiKey = os.Getenv("YOUTUBE_API_KEY")

	// Initialize HTTP client
	httpClient = &http.Client{
		Timeout: 10 * time.Second,
	}
}
