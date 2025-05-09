package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/nleeper/goment"
	"github.com/pemistahl/lingua-go"
)

var languageDetector = lingua.NewLanguageDetectorBuilder().
	FromLanguages(
		lingua.English,
		lingua.Spanish,
		lingua.French,
		lingua.Portuguese,
		lingua.Dutch,
		lingua.German,
		lingua.Italian,
	).
	Build()

func getSearchResults(nextPageToken string) ([]SearchResult, string, error) {
	baseURL := fmt.Sprintf("https://www.googleapis.com/youtube/v3/search?part=snippet&q=%s&type=video&maxResults=%d&key=%s",
		strings.ReplaceAll(searchQuery, " ", "+"),
		maxResults,
		ytbApiKey,
	)

	if nextPageToken != "" {
		baseURL += fmt.Sprintf("&pageToken=%s", nextPageToken)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var ytResp YouTubeAPIResponse_Search
	if err := fetchJSON(ctx, baseURL, &ytResp); err != nil {
		return nil, "", err
	}

	nextPageToken = ytResp.NextPageToken

	fmt.Printf("YouTube API returned %d search items\n", len(ytResp.Items))

	var results []SearchResult
	for _, item := range ytResp.Items {
		g, err := goment.New(item.Snippet.PublishedAt)
		if err != nil {
			return nil, "", fmt.Errorf("error parsing date: %w", err)
		}

		if item.Snippet.LiveBroadcastContent != "none" {
			log.Printf("video: %s skipped (%s)", item.ID.VideoID, item.Snippet.VideoTitle)
			fmt.Println("skipping - live broadcast")
			continue
		}

		if g.ToTime().After(time.Now().Add(-7 * 24 * time.Hour)) {
			fmt.Println("skipping - newer than 7 days")
			continue
		}

		if seenVideos[item.ID.VideoID] {
			log.Printf("video %s already seen, skipping", item.ID.VideoID)
			fmt.Println("skipping - already seen")
			continue
		}

		seenVideos[item.ID.VideoID] = true

		results = append(results, SearchResult{
			FromResultsPerPage: ytResp.PageInfo.ResultsPerPage,
			VideoID:            item.ID.VideoID,
			PublishedAt:        g.ToTime(),
			ChannelID:          item.Snippet.ChannelID,
			ChannelTitle:       item.Snippet.ChannelTitle,
			VideoTitle:         item.Snippet.VideoTitle,
			VideoDescription:   item.Snippet.VideoDescription,
		})
	}

	fmt.Printf("Found %d search results\n", len(results))

	return results, nextPageToken, nil
}

func filterVideos(videoIDs string) ([]Video, error) {
	ytbQuery := fmt.Sprintf("https://www.googleapis.com/youtube/v3/videos?part=snippet,status,statistics,paidProductPlacementDetails,topicDetails,contentDetails,localizations&id=%s&key=%s", videoIDs, ytbApiKey)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var ytResp YoutubeAPIResponse_Videos
	if err := fetchJSON(ctx, ytbQuery, &ytResp); err != nil {
		return nil, err
	}

	fmt.Printf("YouTube API returned %d video items\n", len(ytResp.Items))

	var results []Video
	for _, item := range ytResp.Items {
		g, err := goment.New(item.Snippet.PublishedAt)
		if err != nil {
			return nil, fmt.Errorf("error parsing date: %w", err)
		}

		video := Video{
			ID:                      item.ID,
			PublishedAt:             g.ToTime(),
			ChannelID:               item.Snippet.ChannelID,
			Title:                   item.Snippet.Title,
			Description:             item.Snippet.Description,
			ThumbnailURL_Standard:   item.Snippet.Thumbnails.Standard.URL,
			ThumbnailURL_Max:        item.Snippet.Thumbnails.Maxres.URL,
			ChannelTitle:            item.Snippet.ChannelTitle,
			Tags:                    item.Snippet.Tags,
			CategoryID:              item.Snippet.CategoryID,
			DefaultLanguage:         item.Snippet.DefaultLanguage,
			DefaultAudioLanguage:    item.Snippet.DefaultAudioLanguage,
			Duration:                item.ContentDetails.Duration,
			Definition:              item.ContentDetails.Definition,
			RegionRestriction:       item.ContentDetails.RegionRestriction.Blocked,
			HasCustomThumbnail:      item.ContentDetails.HasCustomThumbnail,
			MadeForKids:             item.Status.MadeForKids,
			ViewCount:               item.Statistics.ViewCount,
			LikeCount:               item.Statistics.LikeCount,
			CommentCount:            item.Statistics.CommentCount,
			HasPaidProductPlacement: item.PaidProductPlacementDetails.HasPaidProductPlacement,
			TopicIds:                item.TopicDetails.TopicIds,
			RelevantTopicIds:        item.TopicDetails.RelevantTopicIds,
			TopicCategories:         item.TopicDetails.TopicCategories,
		}

		// skip MadeForKids videos
		if video.MadeForKids {
			log.Printf("video: %s skipped (%s)", video.ID, video.Title)
			fmt.Println("skipping - for kids")
			continue
		}

		titleLang, titleOk := languageDetector.DetectLanguageOf(video.Title)
		descLang, descOk := languageDetector.DetectLanguageOf(video.Description)

		// Skip only if Title is confidently non-English AND (Description is confidently non-English OR empty)
		if titleOk && titleLang != lingua.English && (!descOk || (descOk && descLang != lingua.English)) {
			log.Printf("video: %s skipped (%s) - detected non-English language", video.ID, video.Title)
			fmt.Println("skipping - detected non-English language in title and unclear/foreign description")
			continue
		}

		// skip if video is paid
		if video.HasPaidProductPlacement {
			log.Printf("video: %s skipped (%s)", video.ID, video.Title)
			fmt.Println("skipping - paid")
			continue
		}

		// skip if video isn't in gaming category
		if video.CategoryID != "20" {
			log.Printf("video: %s skipped (%s)", video.ID, video.Title)
			fmt.Println("skipping - not gaming")
			continue
		}

		duration := parseDurationToSeconds(video.Duration)

		if duration < 60*4 || duration > 60*50 {
			log.Printf("video: %s skipped (%s)", video.ID, video.Title)
			fmt.Println("skipping - too long or too short")
			continue
		}

		video.computeScore() // compute before appending

		if video.Score < 3.0 {
			log.Printf("video: %s skipped (%s)", video.ID, video.Title)
			fmt.Println("skipping - low score")
			continue
		}

		results = append(results, video)

	}

	fmt.Printf("Total videos before filtering big boys: %d\n", len(results))

	// filter bigger channels

	results, err := filterBigBoys(results)

	if err != nil {
		return nil, fmt.Errorf("error filtering big boys: %w", err)
	}

	fmt.Printf("Total videos after filtering: %d\n", len(results))

	return results, nil

}

func filterBigBoys(results []Video) ([]Video, error) {
	// Create set of unique channel IDs
	channelIDSet := make(map[string]struct{})
	for _, video := range results {
		channelIDSet[video.ChannelID] = struct{}{}
	}

	var channelIDs []string
	for id := range channelIDSet {
		channelIDs = append(channelIDs, id)
	}

	queryString := strings.Join(channelIDs, ",")

	ytbQuery := fmt.Sprintf("https://www.googleapis.com/youtube/v3/channels?part=statistics&id=%s&key=%s", queryString, ytbApiKey)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	type youtubeAPIResponse_Channels struct {
		Items []struct {
			Id         string `json:"id"`
			Statistics struct {
				SubscriberCount string `json:"subscriberCount"`
			} `json:"statistics"`
		} `json:"items"`
	}

	var ytResp youtubeAPIResponse_Channels
	if err := fetchJSON(ctx, ytbQuery, &ytResp); err != nil {
		return nil, err
	}

	fmt.Printf("YouTube API returned %d channels\n", len(ytResp.Items))

	// Map channelID -> subscriber count
	subscribersMap := make(map[string]uint64)
	for _, item := range ytResp.Items {
		subs, err := strconv.ParseUint(item.Statistics.SubscriberCount, 10, 64)
		if err != nil {
			log.Printf("Error parsing subs for channel %s: %v", item.Id, err)
			continue
		}
		subscribersMap[item.Id] = subs
	}

	var filtered []Video
	for _, video := range results {
		subs := subscribersMap[video.ChannelID]
		if subs <= 20000 {
			filtered = append(filtered, video)
		} else {
			fmt.Printf("skipping video because channel %s has %d subscribers\n", video.ChannelTitle, subs)
		}
	}

	return filtered, nil
}

func getVideoIDs(results []SearchResult) string {
	var videoIDs []string
	for _, result := range results {
		videoIDs = append(videoIDs, result.VideoID)
	}

	joined := strings.Join(videoIDs, ",")
	return joined
}

func fetchJSON(ctx context.Context, url string, target any) error {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("error creating request: %w", err)
	}

	res, err := httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("error making request: %w", err)
	}
	defer res.Body.Close()

	data, err := io.ReadAll(res.Body)
	if err != nil {
		return fmt.Errorf("error reading response: %w", err)
	}

	if res.StatusCode != 200 {
		return fmt.Errorf("non-200 response: %d\n%s", res.StatusCode, string(data))
	}

	if err := json.Unmarshal(data, target); err != nil {
		return fmt.Errorf("error unmarshalling: %w", err)
	}

	return nil
}
