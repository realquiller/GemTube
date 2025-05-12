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
// Utility to fetch JSON from our API
function fetchJSON(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(url);
        if (!res.ok)
            throw new Error(`Fetch error: ${res.status}`);
        return res.json();
    });
}
// Fetch a single video by ID
function fetchVideoById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = yield fetchJSON(`/api/videos?id=${encodeURIComponent(id)}`);
        if (results.length === 0)
            throw new Error("Video not found");
        return results[0];
    });
}
// Fetch sidebar suggestions (same query)
function fetchSuggestions(query) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetchJSON(`/api/videos?query=${encodeURIComponent(query)}`);
    });
}
// Populate the main video area
function populateMain(video) {
    // 1) Show thumbnail + play overlay
    const player = document.querySelector('.video-player');
    player.innerHTML = `
    <img
      src="${video.video_thumbnail_max || video.video_thumbnail_standard}"
      alt="${video.video_title}"
      class="thumbnail-img"
    />
    <div class="play-button">▶</div>
  `;
    // 2) Wire up play → embed YouTube iframe
    const overlay = player.querySelector('.play-button');
    overlay.addEventListener('click', () => {
        player.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${video.video_id}?autoplay=1"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        style="width:100%; height:100%; border-radius:16px;"
      ></iframe>
    `;
    });
    // 3) Title
    document.querySelector('.video-title').textContent = video.video_title;
    // 4) Channel avatar + name
    const avatarImg = document.querySelector('.avatar-img');
    avatarImg.src = video.channel_avatar;
    document.querySelector('.channel-name').textContent = video.channel_name;
    // 5) Subscriber count (we don’t have it yet) – leave blank or hide
    document.querySelector('.subscribers').textContent = `${video.channel_subscribers} subscribers`;
    // 6) Views & published date
    document.querySelector('.views-date').textContent =
        `${video.video_views} views • ${new Date(video.video_published_at).toLocaleDateString()}`;
    // 7) Engagement buttons
    document.querySelector('.like-btn').textContent = `👍 ${video.video_likes}`;
    // no dislike count provided
    // 8) Share button → copy link
    const shareBtn = document.querySelector('.share-btn');
    shareBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            shareBtn.textContent = '✅ Copied';
            setTimeout(() => (shareBtn.textContent = '🔗 Share'), 2000);
        });
    });
    // 9) Description text
    document.querySelector('.desc-text').textContent = video.video_desc;
}
// Build one sidebar card
function createSuggestedVideo(video) {
    const container = document.createElement('div');
    container.className = 'suggested-video';
    container.innerHTML = `
    <div class="thumbnail-small">
      <img src="${video.video_thumbnail_standard}" alt="Thumbnail" />
    </div>
    <div>
      <p class="suggested-title">${video.video_title}</p>
      <p class="suggested-channel">${video.channel_name}</p>
      <p class="suggested-meta">${video.video_views} views • ${new Date(video.video_published_at).toLocaleDateString()}</p>
    </div>
  `;
    container.addEventListener('click', () => {
        window.location.href = `videopage.html?id=${video.video_id}`;
    });
    return container;
}
// Fill the sidebar
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
            const suggestions = yield fetchSuggestions(mainVideo.channel_name);
            populateSidebar(suggestions.filter(v => v.video_id !== videoId));
        }
        catch (err) {
            console.error(err);
            document.querySelector('main').innerHTML = `
      <p style="text-align:center; margin-top:40px;">Error loading video.</p>
    `;
            return;
        }
        // Wire up the header‐search button
        const miniBtn = document.getElementById('mini-search-btn');
        console.log('miniBtn found:', miniBtn);
        const miniInput = document.getElementById('mini-search-input');
        miniBtn.addEventListener('click', () => {
            console.log('🔍 on video page clicked, input=', miniInput.value);
            const q = miniInput.value.trim();
            if (!q)
                return;
            // point back at index.html so it loads the SPA home with ?query=
            window.location.href = `index.html?query=${encodeURIComponent(q)}`;
        });
    });
}
document.addEventListener('DOMContentLoaded', init);
