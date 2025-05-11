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
	ID          string    `json:"video_id"`
	Title       string    `json:"video_title"`
	Description string    `json:"video_desc"`
	Tags        []string  `json:"video_tags"`
	PublishedAt time.Time `json:"video_published_at"`
	CategoryID  string    `json:"video_category_id"`

	// Channel Info
	ChannelID            string `json:"channel_id"`
	ChannelTitle         string `json:"channel_name"`
	ChannelAvatarURL     string `json:"channel_avatar"`
	DefaultLanguage      string `json:"channel_default_language"`
	DefaultAudioLanguage string `json:"channel_default_audio_language"`

	// Engagement Metrics
	ViewCount    string `json:"video_views"`
	LikeCount    string `json:"video_likes"`
	CommentCount string `json:"video_comments"`

	// Visual Info
	ThumbnailURL_Standard string `json:"video_thumbnail_standard"`
	ThumbnailURL_Max      string `json:"video_thumbnail_max"`
	HasCustomThumbnail    bool   `json:"has_custom_thumbnail"`
	Embeddable            bool   `json:"embeddable"`

	// Video Format / Meta
	Duration    string `json:"video_duration"`
	Definition  string `json:"video_definition"`
	MadeForKids bool   `json:"video_made_for_kids"`

	// Region / Legal / Distribution
	RegionRestriction       []string `json:"region_restriction"`
	HasPaidProductPlacement bool     `json:"has_paid_product_placement"`

	// Topics / Categorization
	TopicIds         []string `json:"topic_ids"`
	RelevantTopicIds []string `json:"relevant_topic_ids"`
	TopicCategories  []string `json:"topic_categories"`

	// Score
	Score float64 `json:"video_score"`
}

type VideoScore struct {
	VideoID string
	Score   float64
}
