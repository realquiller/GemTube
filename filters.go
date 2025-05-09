package main

import (
	"strconv"
	"time"
)

func (video *Video) computeScore() float64 {
	// convert everything first
	views, err := strconv.ParseFloat(video.ViewCount, 64)
	if err != nil {
		return 0
	}

	likes, err := strconv.ParseFloat(video.LikeCount, 64)
	if err != nil {
		return 0
	}

	age := video.PublishedAt

	// yeet videos with less than 50 views
	if views < 50 {
		return 0
	}

	// calculate engagementRatio = likes / views
	engagementRatio := likes / views

	// determine age multiplier
	ageMultiplier := ageMultiplier(age)

	// determine confidence multiplier
	confidenceMultiplier := confidenceMultiplier(views)

	// calculate, save and return score
	score := (engagementRatio * ageMultiplier * confidenceMultiplier) * 100
	video.Score = score
	return score
}

func ageMultiplier(publishedAt time.Time) float64 {
	// multipliers, 0-30 days: 0.4, 31-180 days: 0.7, 181-365 days: 0.9, 1-2 years: 1.0, 2+ years: 1.1
	switch {
	case publishedAt.After(time.Now().Add(-30 * 24 * time.Hour)):
		return 0.4
	case publishedAt.After(time.Now().Add(-180 * 24 * time.Hour)):
		return 0.7
	case publishedAt.After(time.Now().Add(-365 * 24 * time.Hour)):
		return 0.9
	case publishedAt.After(time.Now().Add(-2 * 365 * 24 * time.Hour)):
		return 1.0
	default:
		return 1.1
	}
}

func confidenceMultiplier(viewCount float64) float64 {
	// multipliers, views: 50-199: 0.3, 200-499: 0.5, 500-999: 0.7, 1000-4999: 0.85, 5000+: 1.0
	switch {
	case viewCount < 200:
		return 0.3
	case viewCount < 500:
		return 0.5
	case viewCount < 1000:
		return 0.7
	case viewCount < 5000:
		return 0.85
	default:
		return 1.0
	}
}
