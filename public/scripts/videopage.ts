// public/scripts/videopage.ts
// ---- GemTube Video Page ----

console.log("💎 [VideoPage] script loaded");

interface APIVideo {
  video_id: string;
  video_title: string;
  video_desc: string;             // now used for real description
  channel_name: string;
  channel_avatar: string;
  channel_subscribers: string;
  video_views: string;
  video_likes: string;
  video_comments: string;
  video_published_at: string;
  video_duration: string;
  video_thumbnail_standard: string;
  video_thumbnail_max: string;
  video_score: number;
}

// Utility to fetch JSON from our API
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
  return res.json();
}

// Fetch a single video by ID
async function fetchVideoById(id: string): Promise<APIVideo> {
  const results = await fetchJSON<APIVideo[]>(`/api/videos?id=${encodeURIComponent(id)}`);
  if (results.length === 0) throw new Error("Video not found");
  return results[0];
}

// Fetch sidebar suggestions (same query)
async function fetchSuggestions(query: string): Promise<APIVideo[]> {
  return fetchJSON<APIVideo[]>(`/api/videos?query=${encodeURIComponent(query)}`);
}

// Populate the main video area
function populateMain(video: APIVideo) {
  // identify yourself!
  console.log("🔍 full video payload:", video)
  // 1) Show thumbnail + play overlay
  const player = document.querySelector('.video-player')!;
  player.innerHTML = `
    <img
      src="${video.video_thumbnail_max || video.video_thumbnail_standard}"
      alt="${video.video_title}"
      class="thumbnail-img"
    />
    <div class="play-button">▶</div>
  `;

  // 2) Wire up play → embed YouTube iframe
  const overlay = player.querySelector('.play-button') as HTMLElement;
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
  (document.querySelector('.video-title')! as HTMLElement).textContent = video.video_title;

  // 4) Channel avatar + name
  const avatarImg = document.querySelector('.avatar-img') as HTMLImageElement;
  avatarImg.src = video.channel_avatar;
  (document.querySelector('.channel-name')! as HTMLElement).textContent = video.channel_name;

  // 5) Subscriber count (we don’t have it yet) – leave blank or hide
  (document.querySelector('.subscribers')! as HTMLElement).textContent = `${video.channel_subscribers} subscribers`;

  // 6) Views & published date
  (document.querySelector('.views-date')! as HTMLElement).textContent =
    `${video.video_views} views • ${new Date(video.video_published_at).toLocaleDateString()}`;

  // 7) Engagement buttons
  (document.querySelector('.like-btn')! as HTMLButtonElement).textContent = `👍 ${video.video_likes}`;
  // no dislike count provided

  // 8) Share button → copy link
  const shareBtn = document.querySelector('.share-btn') as HTMLButtonElement;
  shareBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      shareBtn.textContent = '✅ Copied';
      setTimeout(() => (shareBtn.textContent = '🔗 Share'), 2000);
    });
  });

  // 9) Description text
  (document.querySelector('.desc-text')! as HTMLElement).textContent = video.video_desc;
}

// Build one sidebar card
function createSuggestedVideo(video: APIVideo): HTMLElement {
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
function populateSidebar(videos: APIVideo[]) {
  const sidebar = document.querySelector('.suggested-sidebar')!;
  sidebar.innerHTML = '';
  videos.forEach(v => sidebar.append(createSuggestedVideo(v)));
}

// Initialization
async function init() {
  const params = new URLSearchParams(window.location.search);
  const videoId = params.get('id');
  if (!videoId) return;

  try {
    const mainVideo = await fetchVideoById(videoId);
    populateMain(mainVideo);

    const suggestions = await fetchSuggestions(mainVideo.channel_name);
    populateSidebar(suggestions.filter(v => v.video_id !== videoId));
  } catch (err) {
    console.error(err);
    document.querySelector('main')!.innerHTML = `
      <p style="text-align:center; margin-top:40px;">Error loading video.</p>
    `;
    return;
  }

  // Wire up the header‐search button
  const miniBtn = document.getElementById('mini-search-btn')!;
  console.log('miniBtn found:', miniBtn);
  const miniInput = document.getElementById('mini-search-input') as HTMLInputElement;

  miniBtn.addEventListener('click', () => {
    console.log('🔍 on video page clicked, input=', miniInput.value);
    const q = miniInput.value.trim();
    if (!q) return;
    // point back at index.html so it loads the SPA home with ?query=
    window.location.href = `index.html?query=${encodeURIComponent(q)}`;
  });

  miniInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      miniBtn.click();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
