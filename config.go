package main

import "net/http"

const (
	defaultMaxResults    = 50
	defaultTargetResults = 21
)

var (
	ytbApiKey     string
	maxResults    int
	targetResults int
	httpClient    *http.Client
)
