package main

import (
	"regexp"
	"strconv"
	"time"
)

func parseDurationToSeconds(duration string) int {
	re := regexp.MustCompile(`PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?`)
	matches := re.FindStringSubmatch(duration)

	if len(matches) == 0 {
		return 0
	}

	hours, _ := strconv.Atoi(defaultToZero(matches[1]))
	minutes, _ := strconv.Atoi(defaultToZero(matches[2]))
	seconds, _ := strconv.Atoi(defaultToZero(matches[3]))

	return hours*3600 + minutes*60 + seconds
}

func defaultToZero(s string) string {
	if s == "" {
		return "0"
	}
	return s
}

func PrettyDate(t time.Time) string {
	return t.Format("02-01-2006")
}
