// public/scripts/api.js

async function fetchVideos(query) {
    const url = `/api/videos?query=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch videos.");
        const videos = await response.json();
        return videos;
    } catch (error) {
        console.error("Error fetching videos:", error);
        return [];
    }
}

function createVideoCard(video) {
    return `
    <div class="suggested-video">
        <div class="thumbnail-small">
            <img src="${video.video_thumbnail_standard}" alt="Thumbnail" style="width: 100%; border-radius: 8px;">
        </div>
        <div>
            <p class="suggested-title">${video.video_title}</p>
            <p class="suggested-meta">${video.channel_name} • ${video.video_views} views • ${new Date(video.video_published_at).toLocaleDateString()}</p>
        </div>
    </div>`;
}

async function handleSearch() {
    const searchInput = document.getElementById("search-input");
    const query = searchInput.value.trim();
    if (!query) return;

    const videos = await fetchVideos(query);
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    if (videos.length === 0) {
        resultsContainer.innerHTML = "<p>No gems found. Try a different query!</p>";
        return;
    }

    videos.forEach(video => {
        resultsContainer.innerHTML += createVideoCard(video);
    });
}
