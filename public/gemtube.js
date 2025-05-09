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
    const scoreBadge = document.createElement("span");
    scoreBadge.style.display = "inline-flex";
    scoreBadge.style.alignItems = "center";
    scoreBadge.style.justifyContent = "center";
    scoreBadge.style.gap = "4px";
    scoreBadge.style.background = "#e0e0e0";
    scoreBadge.style.borderRadius = "9999px";
    scoreBadge.style.padding = "4px 6px";
    scoreBadge.style.lineHeight = "1";
    scoreBadge.style.fontSize = "12px";
    scoreBadge.style.marginLeft = "8px";
    scoreBadge.style.transform = "translateY(-2px)"; // Gentle lift
    scoreBadge.innerHTML = `
    ${video.score.toFixed(2)}
    <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" viewBox="0 0 9 8" fill="none">
      <path d="M4.49978 6.70199L2.31845 7.92498C2.22209 7.98206 2.12134 8.00652 2.01622 7.99836C1.91109 7.99021 1.81911 7.9576 1.74027 7.90052C1.66142 7.84345 1.6001 7.77219 1.5563 7.68675C1.5125 7.6013 1.50374 7.50542 1.53002 7.3991L2.1082 5.08764L0.176543 3.53445C0.0889399 3.46107 0.0342753 3.37741 0.0125496 3.28349C-0.00917605 3.18956 -0.00269342 3.09792 0.0319976 3.00856C0.0666886 2.9192 0.119251 2.84582 0.189684 2.78842C0.260117 2.73102 0.356481 2.69433 0.478775 2.67835L3.02804 2.47044L4.01358 0.293518C4.05738 0.195679 4.12536 0.122299 4.21752 0.0733794C4.30968 0.0244598 4.40376 0 4.49978 0C4.59579 0 4.68988 0.0244598 4.78203 0.0733794C4.87419 0.122299 4.94217 0.195679 4.98598 0.293518L5.97152 2.47044L8.52078 2.67835C8.64342 2.69466 8.73979 2.73135 8.80987 2.78842C8.87995 2.84549 8.93251 2.91887 8.96755 3.00856C9.0026 3.09825 9.00925 3.19005 8.98753 3.28398C8.9658 3.3779 8.91096 3.46139 8.82301 3.53445L6.89135 5.08764L7.46953 7.3991C7.49582 7.50509 7.48706 7.60097 7.44325 7.68675C7.39945 7.77252 7.33813 7.84378 7.25929 7.90052C7.18044 7.95727 7.08846 7.98988 6.98334 7.99836C6.87821 8.00684 6.77747 7.98238 6.6811 7.92498L4.49978 6.70199Z" 
        fill="rgba(38, 183, 255, 0.92)" />
    </svg>
  `;
    card.innerHTML = `
    <div style="width: 100%; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 16px;">
      <img src="${video.thumbnail}" alt="Thumbnail" style="width: 100%; height: 100%; object-fit: cover;">
    </div>
    <div style="display: flex; align-items: flex-start; gap: 16px; margin-top: 16px;">
      <img src="${video.channelThumbnail}" alt="Channel" style="border-radius: 50%; width: 60px; height: 60px;">
      <div>
        <div style="font-weight: bold; font-size: 24px; line-height: 1.4;">${video.title}</div>
        <div style="color: #777; font-size: 18px;">${video.channel}</div>
        <div style="color: #555; font-size: 18px; margin-top: 4px; display: flex; align-items: center;">
          ${video.views} views · ${timeSince(video.publishedAt)} 
        </div>
      </div>
    </div>
  `;
    const infoSection = card.querySelector("div > div > div:nth-child(3)");
    if (infoSection) {
        infoSection.appendChild(scoreBadge);
    }
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
    thumbnail: "https://placehold.co/480x270?text=Thumbnail",
    channelThumbnail: "https://placehold.co/60x60?text=Avatar&font=roboto",
    publishedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365), // Random past date up to 1 year ago
}));
function timeSince(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals = [
        { label: 'year', value: 31536000 },
        { label: 'month', value: 2592000 },
        { label: 'day', value: 86400 },
        { label: 'hour', value: 3600 },
        { label: 'minute', value: 60 },
        { label: 'second', value: 1 }
    ];
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.value);
        if (count > 0)
            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
    return 'just now';
}
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
