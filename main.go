package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
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

func main() {
	createLogFile()
	// var filtered_results []Video
	// var nextPageToken string // originally in config.go

	// for youtubePage <= 10 {
	// 	var data []SearchResult
	// 	var err error

	// 	data, nextPageToken, err = getSearchResults(nextPageToken)
	// 	if err != nil {
	// 		fmt.Println(err)
	// 		return
	// 	}

	// 	results, err := filterVideos(getVideoIDs(data))
	// 	if err != nil {
	// 		fmt.Println(err)
	// 		return
	// 	}

	// 	filtered_results = append(filtered_results, results...)

	// 	// 🧠 Stop only if no more pages or enough results
	// 	if len(results) < targetResults && nextPageToken != "" {
	// 		youtubePage++
	// 		continue
	// 	}

	// 	break
	// }

	// // sort by score
	// sort.Slice(filtered_results, func(i, j int) bool {
	// 	return filtered_results[i].Score > filtered_results[j].Score
	// })

	// for _, result := range filtered_results {
	// 	fmt.Println(result.Summary())
	// }

	// Serve files from the ./public folder
	fs := http.FileServer(http.Dir("./public"))
	http.Handle("/", fs)

	log.Println("Starting server on :8080...")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}
