package main

import (
	"errors"
	"net/http"
)

const (
	defaultMaxResults    = 50 // the more the better, 50 is max
	defaultTargetResults = 21 // this value is typical for current Youtube home feed, tweak it however you want
)

var (
	ytbApiKey        string
	maxResults       int
	targetResults    int
	httpClient       *http.Client
	ErrQuotaExceeded = errors.New("quota exceeded")
)
