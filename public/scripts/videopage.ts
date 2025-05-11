// public/scripts/videopage.ts
// ---- GemTube Video Page ----

console.log("💎 [VideoPage] script loaded");

interface APIVideo {
  video_id: string;
  video_title: string;
  channel_name: string;
  channel_avatar: string;
  video_views: string;
  video_likes: string;
  video_comments: string;
  video_published_at: string;
  video_duration: string;
  video_thumbnail_standard: string;
  video_thumbnail_max: string;
  video_score: number;
}

// Utility to fetch JSON
async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
  return res.json();
}

// Fetch a single video by ID (assumes backend supports id query)
async function fetchVideoById(id: string): Promise<APIVideo> {
  const data = await fetchJSON<APIVideo[]>(`/api/videos?id=${encodeURIComponent(id)}`);
  if (data.length === 0) throw new Error("Video not found");
  return data[0];
}

// Fetch suggested videos (e.g. same query or related)
async function fetchSuggestions(query: string): Promise<APIVideo[]> {
  return fetchJSON<APIVideo[]>(`/api/videos?query=${encodeURIComponent(query)}`);
}

// Populate the main video section
function populateMain(video: APIVideo) {
  // Video player
  const player = document.querySelector('.video-player')!;
  player.innerHTML = `<img src="${video.video_thumbnail_max || video.video_thumbnail_standard}" alt="${video.video_title}" style="width:100%; height:auto; border-radius:16px;" />`;

  // Title
  (document.querySelector('.video-title')! as HTMLElement).textContent = video.video_title;

  // Channel info
  (document.querySelector('.channel-name')! as HTMLElement).textContent = video.channel_name;
  (document.querySelector('.subscribers')! as HTMLElement).textContent = `${video.video_views} views`;
  
  // Engagement buttons
  (document.querySelector('.like-btn')! as HTMLButtonElement).textContent = `👍 ${video.video_likes}`;
  // no dislike count
  
  // Description
  (document.querySelector('.description p')! as HTMLElement).textContent = `${video.video_views} views • ${new Date(video.video_published_at).toLocaleDateString()}`;
  (document.querySelector('.desc-text')! as HTMLElement).textContent = video.video_title; // or actual description
}

// Create a suggested video card element
function createSuggestedVideo(video: APIVideo): HTMLElement {
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
    // Fetch suggestions with same channel or keyword
    const suggestions = await fetchSuggestions(mainVideo.channel_name);
    populateSidebar(suggestions.filter(v => v.video_id !== videoId));
  } catch (err) {
    console.error(err);
    // Show error message in main
    (document.querySelector('main')! as HTMLElement).innerHTML = `<p style="text-align:center; margin-top:40px;">Error loading video.</p>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
