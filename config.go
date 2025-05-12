package main

import "net/http"

const (
	defaultMaxResults    = 50
	defaultTargetResults = 2
)

var (
	ytbApiKey     string
	maxResults    int
	targetResults int
	httpClient    *http.Client
)
