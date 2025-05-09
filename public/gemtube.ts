// GemTube.ts

// Entry point for dynamic UI rendering without a framework.
// Uses TypeScript for type safety and better learning experience.

type Video = {
  id: number;
  title: string;
  channel: string;
  views: string;
  score: number;
  thumbnail: string;
  channelThumbnail: string;
};

const videosMock: Video[] = [
  {
    id: 1,
    title: "Oblivion: Best Hidden Quests!",
    channel: "SmallRPGGems",
    views: "12.5K",
    score: 4.2,
    thumbnail: "https://via.placeholder.com/300x180",
    channelThumbnail: "https://via.placeholder.com/40",
  },
];

const app = document.getElementById("app") as HTMLDivElement;

function createLogo(): HTMLElement {
  const logo = document.createElement("div");
  logo.innerHTML = `<div style="display: flex; align-items: center; gap: 8px; font-size: 32px; font-weight: bold; margin-bottom: 40px;">
    <span style="color: #60a5fa;">💎</span>
    <span>GemTube</span>
  </div>`;
  return logo;
}

function createSearchSection(): HTMLElement {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.gap = "16px";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Search gaming gems...";
  input.style.width = "400px";
  input.style.padding = "8px";

  const button = document.createElement("button");
  button.innerText = "Search";
  button.style.padding = "8px 16px";

  button.onclick = () => handleSearch(input.value);

  container.appendChild(input);
  container.appendChild(button);

  return container;
}

function createVideoCard(video: Video): HTMLElement {
  const card = document.createElement("div");
  card.style.border = "1px solid #ccc";
  card.style.borderRadius = "8px";
  card.style.overflow = "hidden";
  card.style.cursor = "pointer";
  card.style.width = "300px";

  card.innerHTML = `
    <img src="${video.thumbnail}" alt="Thumbnail" style="width: 100%; height: auto;">
    <div style="padding: 16px;">
      <div style="font-weight: bold; font-size: 18px; margin-bottom: 8px;">${video.title}</div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <img src="${video.channelThumbnail}" alt="Channel" style="border-radius: 50%; width: 24px; height: 24px;">
        <span style="color: #555;">${video.channel}</span>
      </div>
      <div style="display: flex; justify-content: space-between; color: #777; font-size: 14px;">
        <span>${video.views} views</span>
        <span>⭐ ${video.score}</span>
      </div>
    </div>
  `;

  card.onclick = () => alert(`Navigate to video ${video.title}`); // Replace with actual navigation

  return card;
}

function handleSearch(query: string): void {
  // Simulate API call with mock data
  renderVideoGrid(videosMock);
}

function renderVideoGrid(videos: Video[]): void {
  app.innerHTML = "";
  app.appendChild(createLogo());

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(300px, 1fr))";
  grid.style.gap = "24px";
  grid.style.marginTop = "24px";

  videos.forEach((video) => {
    grid.appendChild(createVideoCard(video));
  });

  app.appendChild(grid);
}

// Initial Render
app.appendChild(createLogo());
app.appendChild(createSearchSection());
