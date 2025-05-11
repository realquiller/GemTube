package main

import "net/http"

var (
	ytbApiKey     string
	maxResults    int
	targetResults int
	httpClient    *http.Client
)
