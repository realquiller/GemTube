// public/scripts/videopage.ts
// ---- GemTube Video Page ----
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
console.log("💎 [VideoPage] script loaded");
// Utility to fetch JSON
function fetchJSON(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(url);
        if (!res.ok)
            throw new Error(`Fetch error: ${res.status}`);
        return res.json();
    });
}
// Fetch a single video by ID (assumes backend supports id query)
function fetchVideoById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield fetchJSON(`/api/videos?id=${encodeURIComponent(id)}`);
        if (data.length === 0)
            throw new Error("Video not found");
        return data[0];
    });
}
// Fetch suggested videos (e.g. same query or related)
function fetchSuggestions(query) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetchJSON(`/api/videos?query=${encodeURIComponent(query)}`);
    });
}
// Populate the main video section
function populateMain(video) {
    // Video player
    const player = document.querySelector('.video-player');
    player.innerHTML = `<img src="${video.video_thumbnail_max || video.video_thumbnail_standard}" alt="${video.video_title}" style="width:100%; height:auto; border-radius:16px;" />`;
    // Title
    document.querySelector('.video-title').textContent = video.video_title;
    // Channel info
    document.querySelector('.channel-name').textContent = video.channel_name;
    document.querySelector('.subscribers').textContent = `${video.video_views} views`;
    // Engagement buttons
    document.querySelector('.like-btn').textContent = `👍 ${video.video_likes}`;
    // no dislike count
    // Description
    document.querySelector('.description p').textContent = `${video.video_views} views • ${new Date(video.video_published_at).toLocaleDateString()}`;
    document.querySelector('.desc-text').textContent = video.video_title; // or actual description
}
// Create a suggested video card element
function createSuggestedVideo(video) {
    const container = document.createElement('div');
    container.className = 'suggested-video';
    container.innerHTML = `
    <div class="thumbnail-small">
      <img src="${video.video_thumbnail_standard}" alt="Thumbnail" style="width:100%; border-radius:8px;" />
    </div>
    <div>
      <p class="suggested-title">${video.video_title}</p>
      <p class="suggested-meta">${video.channel_name}<br>${video.video_views} views • ${new Date(video.video_published_at).toLocaleDateString()}</p>
    </div>
  `;
    container.addEventListener('click', () => {
        window.location.href = `videopage.html?id=${video.video_id}`;
    });
    return container;
}
// Populate sidebar suggestions
function populateSidebar(videos) {
    const sidebar = document.querySelector('.suggested-sidebar');
    sidebar.innerHTML = '';
    videos.forEach(v => sidebar.append(createSuggestedVideo(v)));
}
// Initialization
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const params = new URLSearchParams(window.location.search);
        const videoId = params.get('id');
        if (!videoId)
            return;
        try {
            const mainVideo = yield fetchVideoById(videoId);
            populateMain(mainVideo);
            // Fetch suggestions with same channel or keyword
            const suggestions = yield fetchSuggestions(mainVideo.channel_name);
            populateSidebar(suggestions.filter(v => v.video_id !== videoId));
        }
        catch (err) {
            console.error(err);
            // Show error message in main
            document.querySelector('main').innerHTML = `<p style="text-align:center; margin-top:40px;">Error loading video.</p>`;
        }
    });
}
document.addEventListener('DOMContentLoaded', init);
