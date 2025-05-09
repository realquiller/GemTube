// Updated for balanced layout, light/dark mode toggle, and perfect 16:9 thumbnails
const app = document.getElementById("app");
let isDarkMode = true;
function toggleTheme() {
    document.body.style.backgroundColor = isDarkMode ? "#ffffff" : "#181818";
    document.body.style.color = isDarkMode ? "#000000" : "#ffffff";
    isDarkMode = !isDarkMode;
}
function createThemeToggle() {
    const toggle = document.createElement("button");
    toggle.innerText = "Toggle Theme";
    toggle.style.position = "fixed";
    toggle.style.top = "24px";
    toggle.style.right = "24px";
    toggle.style.padding = "12px 20px";
    toggle.style.fontSize = "16px";
    toggle.style.borderRadius = "12px";
    toggle.style.border = "none";
    toggle.style.backgroundColor = "#60a5fa";
    toggle.style.color = "#fff";
    toggle.style.cursor = "pointer";
    toggle.onclick = toggleTheme;
    return toggle;
}
function createLogo() {
    const logo = document.createElement("div");
    logo.innerHTML = `<img src="./assets/gemtube.webp" alt="GemTube Logo" style="width: 600px; margin-bottom: 80px;">`;
    logo.style.textAlign = "center";
    return logo;
}
function createSearchSection() {
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.height = "100vh";
    container.style.gap = "40px";
    const searchWrapper = document.createElement("div");
    searchWrapper.style.display = "flex";
    searchWrapper.style.gap = "24px";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "What would you like to watch?";
    input.style.width = "700px";
    input.style.padding = "24px 32px";
    input.style.fontSize = "28px";
    input.style.borderRadius = "16px";
    input.style.border = "1px solid #ccc";
    const button = document.createElement("button");
    button.innerText = "Search";
    button.style.padding = "24px 36px";
    button.style.fontSize = "24px";
    button.style.borderRadius = "16px";
    button.style.border = "none";
    button.style.backgroundColor = "#60a5fa";
    button.style.color = "#fff";
    button.style.cursor = "pointer";
    button.onclick = () => handleSearch(input.value);
    searchWrapper.appendChild(input);
    searchWrapper.appendChild(button);
    container.appendChild(createLogo());
    container.appendChild(searchWrapper);
    container.appendChild(createThemeToggle());
    return container;
}
function createVideoCard(video) {
    const card = document.createElement("div");
    card.style.borderRadius = "24px";
    card.style.overflow = "hidden";
    card.style.cursor = "pointer";
    card.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
    card.style.transition = "transform 0.2s";
    card.onmouseenter = () => (card.style.transform = "scale(1.02)");
    card.onmouseleave = () => (card.style.transform = "scale(1)");
    card.style.width = "100%";
    card.innerHTML = `
    <div style="width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 16px;">
      <img src="${video.thumbnail}" alt="Thumbnail" style="width: 100%; height: 100%; object-fit: cover;">
    </div>
    <div style="display: flex; align-items: flex-start; gap: 16px; margin-top: 16px;">
      <img src="${video.channelThumbnail}" alt="Channel" style="border-radius: 50%; width: 60px; height: 60px;">
      <div>
        <div style="font-weight: bold; font-size: 24px; line-height: 1.4;">${video.title}</div>
        <div style="color: #777; font-size: 18px;">${video.channel}</div>
        <div style="color: #555; font-size: 18px; margin-top: 8px;">
          ${video.views} views • ⭐ ${video.score}
        </div>
      </div>
    </div>
  `;
    card.onclick = () => alert(`Navigate to video ${video.title}`);
    return card;
}
function renderVideoGrid(videos) {
    app.innerHTML = "";
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gridTemplateColumns = "repeat(3, 1fr)";
    grid.style.gap = "16px";
    grid.style.marginTop = "20px";
    grid.style.padding = "0 40px";
    grid.style.width = "100%";
    grid.style.maxWidth = "1600px";
    grid.style.marginLeft = "auto";
    grid.style.marginRight = "auto";
    loadNextBatch(videos, grid);
    const loadMoreButton = document.createElement("button");
    loadMoreButton.innerText = "Load More";
    loadMoreButton.style.padding = "24px 36px";
    loadMoreButton.style.fontSize = "24px";
    loadMoreButton.style.margin = "60px auto";
    loadMoreButton.style.display = "block";
    loadMoreButton.style.borderRadius = "16px";
    loadMoreButton.style.border = "none";
    loadMoreButton.style.backgroundColor = "#60a5fa";
    loadMoreButton.style.color = "#fff";
    loadMoreButton.style.cursor = "pointer";
    loadMoreButton.onclick = () => loadNextBatch(videos, grid);
    app.appendChild(grid);
    app.appendChild(loadMoreButton);
}
function createTopLogo() {
    const existingLogo = document.querySelector('img[alt="GemTube Logo"]');
    if (existingLogo)
        return; // Prevent duplicate
    const logo = document.createElement("img");
    logo.src = "./assets/gemtube.webp";
    logo.alt = "GemTube Logo";
    logo.style.position = "fixed";
    logo.style.top = "16px";
    logo.style.left = "16px";
    logo.style.width = "120px"; // This is now a king-size logo
    logo.style.zIndex = "1000";
    logo.style.cursor = "pointer";
    logo.onclick = () => {
        app.innerHTML = "";
        loadedVideos = 0;
        app.appendChild(createSearchSection());
    };
    document.body.appendChild(logo);
}
// Sample video data for testing
const videosMock = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    title: `Gem Video ${i + 1}`,
    channel: `Creator ${i + 1}`,
    views: `${(Math.random() * 100).toFixed(1)}K`,
    score: +(Math.random() * 5).toFixed(1),
    thumbnail: "https://picsum.photos/480/270",
    channelThumbnail: "https://picsum.photos/40",
}));
// Load videos progressively
let loadedVideos = 0;
function loadNextBatch(videos, grid) {
    const nextBatch = videos.slice(loadedVideos, loadedVideos + 21);
    nextBatch.forEach((video) => {
        grid.appendChild(createVideoCard(video));
    });
    loadedVideos += 21;
}
// Handle search (for now just load mock videos)
function handleSearch(query) {
    loadedVideos = 0;
    renderVideoGrid(videosMock);
    createTopLogo();
}
// Initial Render
app.appendChild(createSearchSection());
