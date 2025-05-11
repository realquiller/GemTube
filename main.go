package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
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
	flag.IntVar(&maxResults, "maxResults", 50, "Maximum number of results to fetch (max 500)")
	flag.IntVar(&targetResults, "targetResults", 20, "Target number of results to show")
	flag.Parse()
	return query
}

func main() {
	createLogFile()

	mode := os.Getenv("MODE")
	mode = strings.ToUpper(mode)

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

	log.Printf("Filtering complete. %d videos ready.\n", len(filteredResults))
	return filteredResults
}

func videosHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*") // CORS for frontend

	query := r.URL.Query().Get("query")
	if query == "" {
		http.Error(w, "Missing 'query' parameter", http.StatusBadRequest)
		return
	}

	results := runFiltering(query) // Pass the query explicitly

	if len(results) == 0 {
		http.Error(w, "No videos found for the given query.", http.StatusNotFound)
		return
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		http.Error(w, "Failed to encode videos", http.StatusInternalServerError)
	}
}
