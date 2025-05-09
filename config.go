package main

import "net/http"

var (
	ytbApiKey     string
	searchQuery   string
	maxResults    int
	targetResults int
	youtubePage   int
	seenVideos    map[string]bool
	httpClient    *http.Client
	nextPageToken string
)
