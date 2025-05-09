package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

func init() {
	// setup env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	ytbApiKey = os.Getenv("YOUTUBE_API_KEY")

	// setup flags
	flag.StringVar(&searchQuery, "query", "oblivion+remastered+patches", "Search query for Youtube")
	flag.IntVar(&maxResults, "maxResults", 50, "Maximum number of results to fetch (max 500)")
	flag.IntVar(&targetResults, "targetResults", 20, "Target number of results to show")
	flag.Parse()

	//setup token /w page
	nextPageToken = ""
	youtubePage = 1

	// setup seen videos
	seenVideos = make(map[string]bool)

	// setup http client
	httpClient = &http.Client{
		Timeout: 10 * time.Second,
	}
}
