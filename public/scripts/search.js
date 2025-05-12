// public/scripts/search.js

async function fetchVideos(query) {
  const url = `/api/videos?query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) {
    // YouTube/API quota limits often return 403 Forbidden or 429 Too Many Requests
    if (res.status === 429 || res.status === 403) {
      // throw a special error we can detect downstream
      throw new Error("API_QUOTA_EXCEEDED");
    }
    throw new Error(`API returned ${res.status}`);
  }
  return res.json();
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

  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  try {
    const videos = await fetchVideos(query);
    if (videos.length === 0) {
      resultsContainer.innerHTML = "<p>No gems found. Try a different query!</p>";
      return;
    }
    videos.forEach(video => {
      resultsContainer.innerHTML += createVideoCard(video);
    });
  } catch (err) {
    console.error(err);
    if (err.message === "API_QUOTA_EXCEEDED") {
      resultsContainer.innerHTML =
        "<p>You’ve reached your daily API quota. Please try again tomorrow.</p>";
    } else {
      resultsContainer.innerHTML = "<p>Uh oh—something went wrong.</p>";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");
  const resultsDiv = document.getElementById("results");

  form.addEventListener("submit", async (e) => {
    console.log("🖱️ Search button clicked");
    e.preventDefault();              // 🚨 stop the redirect
    const query = input.value.trim();
    if (!query) return;

    resultsDiv.innerHTML = "<p>Loading…</p>";
    try {
      const videos = await fetchVideos(query); // from api.js
      if (videos.length === 0) {
        resultsDiv.innerHTML = "<p>No gems found. Try another query!</p>";
      } else {
        // render cards
        resultsDiv.innerHTML = videos
          .map(createVideoCard)
          .join("");
      }
    } catch (err) {
      console.error(err);
      resultsDiv.innerHTML = "<p>Uh oh—something went wrong.</p>";
    }
  });
});
