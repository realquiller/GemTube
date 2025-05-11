package main

import "time"

type YouTubeAPIResponse_Search struct {
	NextPageToken string `json:"nextPageToken"`
	PageInfo      struct {
		ResultsPerPage int `json:"resultsPerPage"`
	} `json:"pageInfo"`
	Items []struct {
		ID struct {
			VideoID string `json:"videoId"`
		} `json:"id"`
		Snippet struct {
			PublishedAt          string `json:"publishedAt"`
			ChannelID            string `json:"channelId"`
			ChannelTitle         string `json:"channelTitle"`
			VideoTitle           string `json:"title"`
			VideoDescription     string `json:"description"`
			LiveBroadcastContent string `json:"liveBroadcastContent"`
		} `json:"snippet"`
	} `json:"items"`
}

type YoutubeAPIResponse_Videos struct {
	Items []struct {
		ID      string `json:"id"`
		Snippet struct {
			PublishedAt string `json:"publishedAt"`
			ChannelID   string `json:"channelId"`
			Title       string `json:"title"`
			Description string `json:"description"`
			Thumbnails  struct {
				Standard struct {
					URL string `json:"url"`
				} `json:"standard"`
				Maxres struct {
					URL string `json:"url"`
				} `json:"maxres"`
			} `json:"thumbnails"`
			ChannelTitle         string   `json:"channelTitle"`
			Tags                 []string `json:"tags"`
			CategoryID           string   `json:"categoryId"`
			DefaultLanguage      string   `json:"defaultLanguage"`
			DefaultAudioLanguage string   `json:"defaultAudioLanguage"`
		} `json:"snippet"`
		ContentDetails struct {
			Duration          string `json:"duration"`
			Definition        string `json:"definition"`
			RegionRestriction struct {
				Blocked []string `json:"blocked"`
			} `json:"regionRestriction"`
			HasCustomThumbnail bool `json:"hasCustomThumbnail"`
		} `json:"contentDetails"`
		Status struct {
			MadeForKids bool `json:"madeForKids"`
		} `json:"status"`
		Statistics struct {
			ViewCount    string `json:"viewCount"`
			LikeCount    string `json:"likeCount"`
			CommentCount string `json:"commentCount"`
		} `json:"statistics"`
		PaidProductPlacementDetails struct {
			HasPaidProductPlacement bool `json:"hasPaidProductPlacement"`
		} `json:"paidProductPlacementDetails"`
		TopicDetails struct {
			TopicIds         []string `json:"topicIds"`
			RelevantTopicIds []string `json:"relevantTopicIds"`
			TopicCategories  []string `json:"topicCategories"`
		} `json:"topicDetails"`
	} `json:"items"`
}

type SearchResult struct {
	NextPageToken        string
	FromResultsPerPage   int
	PublishedAt          time.Time
	VideoID              string
	VideoTitle           string
	VideoDescription     string
	ChannelID            string
	ChannelTitle         string
	LiveBroadcastContent string
}

type Video struct {
	// Identity
	ID          string
	Title       string
	Description string
	Tags        []string
	PublishedAt time.Time
	CategoryID  string

	// Channel Info
	ChannelID            string
	ChannelTitle         string
	ChannelAvatarURL     string
	DefaultLanguage      string
	DefaultAudioLanguage string

	// Engagement Metrics
	ViewCount    string
	LikeCount    string
	CommentCount string

	// Visual Info
	ThumbnailURL_Standard string
	ThumbnailURL_Max      string
	HasCustomThumbnail    bool
	Embeddable            bool

	// Video Format / Meta
	Duration    string
	Definition  string
	MadeForKids bool

	// Region / Legal / Distribution
	RegionRestriction       []string
	HasPaidProductPlacement bool

	// Topics / Categorization
	TopicIds         []string
	RelevantTopicIds []string
	TopicCategories  []string

	// Score
	Score float64
}

type VideoScore struct {
	VideoID string
	Score   float64
}
