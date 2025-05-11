// public/scripts/gemtube.ts
// ---- GemTube SPA ----

// Log load
console.log("💎 [GemTube] script loaded");

// API response type
interface APIVideo {
  video_title: string;
  channel_name: string;
  video_views: string;
  video_score: number;
  video_thumbnail_standard: string;
  video_thumbnail_max: string;
  channel_avatar: string;
  video_published_at: string;
}

// Internal video model
type Video = {
  id: number;
  title: string;
  channel: string;
  views: string;
  score: number;
  thumbnail: string;
  channelThumbnail: string;
  publishedAt: Date;
};

// Root container
const app = document.getElementById("app");
if (!app) throw new Error("#app not found");

// Top-left logo to go back
function createTopLogo(): HTMLElement {
  const logo = document.createElement("img");
  logo.src = "./assets/gemtube.webp";
  logo.alt = "GemTube Logo";
  Object.assign(logo.style, {
    position: "fixed",
    top: "16px",
    left: "16px",
    width: "120px",
    cursor: "pointer",
    zIndex: "1000"
  });
  logo.onclick = () => location.reload();
  return logo;
}

// Search homepage section
function createSearchSection(): HTMLElement {
  const container = document.createElement("div");
  Object.assign(container.style, {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    gap: "40px"
  });

  // Big logo
  const logo = document.createElement("img");
  logo.src = "./assets/gemtube.webp";
  logo.alt = "GemTube Logo";
  logo.style.width = "600px";

  // Search bar
  const wrapper = document.createElement("div");
  Object.assign(wrapper.style, { display: "flex", gap: "12px" });

  const input = document.createElement("input");
  Object.assign(input, { type: "text", placeholder: "What would you like to watch?" });
  Object.assign(input.style, {
    width: "400px",
    padding: "12px 16px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  });

  const btn = document.createElement("button");
  btn.innerText = "Search";
  Object.assign(btn.style, {
    padding: "12px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#60a5fa",
    color: "#fff",
    cursor: "pointer"
  });
  btn.onclick = () => handleSearch(input.value);

  wrapper.append(input, btn);
  container.append(logo, wrapper);
  return container;
}

// Fetch videos from API
async function fetchVideos(q: string): Promise<APIVideo[]> {
  const res = await fetch(`/api/videos?query=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

// Map API to internal models
function mapVideos(items: APIVideo[]): Video[] {
  return items.map((v, i) => ({
    id: i + 1,
    title: v.video_title,
    channel: v.channel_name,
    views: v.video_views,
    score: v.video_score,
    thumbnail: v.video_thumbnail_max || v.video_thumbnail_standard,
    channelThumbnail: v.channel_avatar,
    publishedAt: new Date(v.video_published_at)
  }));
}

// Human-readable time since
function timeSince(d: Date): string {
  const s = Math.floor((Date.now() - d.getTime()) / 1e3);
  const intervals = [
    { label: 'year', value: 31536000 },
    { label: 'month', value: 2592000 },
    { label: 'day', value: 86400 },
    { label: 'hour', value: 3600 },
    { label: 'minute', value: 60 },
    { label: 'second', value: 1 }
  ];
  for (const i of intervals) {
    const count = Math.floor(s / i.value);
    if (count > 0) return `${count} ${i.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

// Create a video card
function createVideoCard(video: Video): HTMLElement {
  const card = document.createElement("div");
  Object.assign(card.style, { width: "100%", cursor: "pointer", fontFamily: "Arial, sans-serif" });

  // Thumbnail container
  const thumb = document.createElement("div");
  Object.assign(thumb.style, {
    width: "100%",
    aspectRatio: "16/9",
    overflow: "hidden",
    borderRadius: "12px",
    marginBottom: "12px" // breathing room below title container
  });
  const img = document.createElement("img");
  img.src = video.thumbnail;
  img.alt = video.title;
  Object.assign(img.style, { width: "100%", height: "100%", objectFit: "cover", transition: "transform .2s" });
  thumb.append(img);

  // Info section
  const info = document.createElement("div");
  info.style.fontFamily = "Arial, sans-serif";
  info.innerHTML = `
    <strong style="font-size:18px; display:block; margin-bottom:6px;">${video.title}</strong>
    <small style="color:#777">${video.channel}</small><br>
    <small style="color:#555">${video.views} views · ${timeSince(video.publishedAt)}</small>
  `;

  // Score badge with star
  const badge = document.createElement("span");
  badge.textContent = video.score.toFixed(2);
  Object.assign(badge.style, {
    marginLeft: "6px",
    background: "#e0e0e0",
    borderRadius: "9999px",
    padding: "2px 6px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center"
  });
  
  // star icon
  const star = document.createElement("img");
  star.src = "./assets/small_star.png";
  star.alt = "star";
  Object.assign(star.style, {
    width: "10px",
    height: "10px",
    marginLeft: "4px",
    verticalAlign: "middle"
  });
  badge.append(star);

  info.querySelector("small:last-child")!.appendChild(badge);

  // Hover zoom
  card.addEventListener("mouseenter", () => img.style.transform = "scale(1.05)");
  card.addEventListener("mouseleave", () => img.style.transform = "scale(1)");

  card.append(thumb, info);
  return card;
}

// Render results with top padding and mini search with top padding and mini search
function renderVideoGrid(videos: Video[]) {
  app.innerHTML = "";

  // Back logo only
  app.append(createTopLogo());

  // Mini search above grid
  const mini = document.createElement("div");
  Object.assign(mini.style, { display: "flex", justifyContent: "center", margin: "16px 80px" });
  const input = document.createElement("input");
  Object.assign(input, { type: "text", placeholder: "Search again…" });
  Object.assign(input.style, { width: "300px", padding: "8px 12px", fontSize: "14px", borderRadius: "6px", border: "1px solid #ccc" });
  const btn2 = document.createElement("button");
  btn2.innerText = "Search";
  Object.assign(btn2.style, { marginLeft: "8px", padding: "8px 12px", fontSize: "14px", borderRadius: "6px", border: "none", backgroundColor: "#60a5fa", color: "#fff", cursor: "pointer" });
  btn2.onclick = () => handleSearch(input.value);
  mini.append(input, btn2);
  app.append(mini);

  // Grid with extra top padding
  const grid = document.createElement("div");
  Object.assign(grid.style, {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "16px",
    padding: "40px 80px 24px"
  });

  let idx = 0;
  const batch = 9;
  const loadNext = () => {
    videos.slice(idx, idx + batch).forEach(v => grid.append(createVideoCard(v)));
    idx += batch;
    if (idx >= videos.length) loadBtn.style.display = "none";
  };

  const loadBtn = document.createElement("button");
  loadBtn.innerText = "Load More";
  Object.assign(loadBtn.style, {
    display: "block",
    margin: "16px auto",
    padding: "12px 24px",
    backgroundColor: "#60a5fa",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  });
  loadBtn.onclick = loadNext;

  app.append(grid, loadBtn);
  loadNext();
}

// Search handler
async function handleSearch(query: string) {
  if (!query.trim()) return;
  try {
    const data = await fetchVideos(query);
    renderVideoGrid(mapVideos(data));
  } catch (e) {
    app.innerHTML = `<p style='text-align:center;font-size:18px;'>No gems for "${query}".</p>`;
  }
}

// Mount initial homepage
app.append(createSearchSection());
