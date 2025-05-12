package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
)

func (v *Video) String() string {
	return fmt.Sprintf(
		"Title: %s\nViews: %s\nComments: %s\nLikes: %s\nDuration: %s\nChannel: %s\nChannel ID: %s\nPublished At: %s\nScore: %.3f\n---\n",
		v.Title, v.ViewCount, v.CommentCount, v.LikeCount, v.Duration,
		v.ChannelTitle, v.ChannelID, PrettyDate(v.PublishedAt), v.Score,
	)
}

func (v *Video) Summary() string {
	return fmt.Sprintf("Title: %s\nViews: %s\nComments: %s\nLikes: %s\nDuration: %s\nChannel: %s\nChannel ID: %s\nPublished At: %s\nScore: %.3f\n",
		v.Title, v.ViewCount, v.CommentCount, v.LikeCount, v.Duration,
		v.ChannelTitle, v.ChannelID, PrettyDate(v.PublishedAt), v.Score)
}

func createLogFile() {
	// create a log file if there is none
	logFile, err := os.Create("run.log") // os.Create truncates if file exists
	if err != nil {
		log.Fatalf("Failed to create log file: %v", err)
	}
	defer logFile.Close()
	// Step 2: Set standard logger to write to the file
	log.SetOutput(logFile)
}

func checkGems(results []Video, mode string) {
	if len(results) == 0 {
		log.Println("No gems found after filtering.")
		if mode == "CLI" {
			os.Exit(0) // Properly exit CLI mode if no results
		}
	}
}

func setupFlags() string {
	var query string
	flag.StringVar(&query, "query", "oblivion+remastered+patches", "Search query for Youtube")
	flag.IntVar(&maxResults, "maxResults", defaultMaxResults,
		"max videos per YouTube search (max 50)")
	flag.IntVar(&targetResults, "targetResults", defaultTargetResults,
		"how many “gems” you’ll keep/display")
	flag.Parse()
	return query
}

func main() {
	createLogFile()

	mode := strings.ToUpper(os.Getenv("MODE"))

	if mode == "API" {
		maxResults = defaultMaxResults
		targetResults = defaultTargetResults
	}

	// log.Printf("Starting in %s mode – maxResults=%d, targetResults=%d\n",
	// 	mode, maxResults, targetResults)

	if mode == "CLI" {
		query := setupFlags()
		log.Println("Running in CLI Mode...")

		results := runFiltering(query)
		checkGems(results, mode)

		for _, result := range results {
			fmt.Println(result.Summary())
		}
	} else if mode == "API" {
		log.Println("Running in API Mode...")

		http.HandleFunc("/api/videos", videosHandler)
		fs := http.FileServer(http.Dir("./public"))
		http.Handle("/", fs)

		log.Println("Starting server on :8080...")
		err := http.ListenAndServe(":8080", nil)
		if err != nil {
			log.Fatal(err)
		}
	} else {
		log.Fatalf("Invalid MODE. Set MODE=CLI or MODE=API in your environment.")
	}
}

func runFiltering(query string) []Video {
	youtubePage := 1
	nextPageToken := ""
	seenVideos := make(map[string]bool)
	var filteredResults []Video

	for youtubePage <= 10 {
		data, token, err := getSearchResults(query, nextPageToken, seenVideos)
		if err != nil {
			log.Println(err)
			return nil
		}

		results, err := filterVideos(getVideoIDs(data))
		if err != nil {
			log.Println(err)
			return nil
		}

		filteredResults = append(filteredResults, results...)
		nextPageToken = token

		if len(results) < targetResults && nextPageToken != "" {
			youtubePage++
			continue
		}
		break
	}

	// sort filteredREsults by score from highest to lowest
	sort.SliceStable(filteredResults, func(i, j int) bool {
		return filteredResults[i].Score > filteredResults[j].Score
	})

	log.Printf("Filtering complete. %d videos ready.\n", len(filteredResults))
	fmt.Printf("Filtering complete. %d videos ready.\n", len(filteredResults))
	return filteredResults
}

func videosHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// 1) If there's an "id" param, return that one video
	if id := r.URL.Query().Get("id"); id != "" {
		vids, err := filterVideos(id)
		if err != nil {
			if errors.Is(err, ErrQuotaExceeded) {
				http.Error(w, "quotaExceeded", http.StatusForbidden)
				return
			}
			http.Error(w, "Video not found", http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(vids)
		return
	}

	// 2) Fall back to search-by-query
	query := r.URL.Query().Get("query")
	if query == "" {
		http.Error(w, "Missing 'query' parameter", http.StatusBadRequest)
		return
	}

	results, err := filterVideos(query)
	if err != nil {
		if errors.Is(err, ErrQuotaExceeded) {
			http.Error(w, "quotaExceeded", http.StatusForbidden)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	if len(results) == 0 {
		http.Error(w, "No videos found for the given query.", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(results)
}
