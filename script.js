const cursorGlow = document.querySelector(".cursor-glow");
if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
} else if (cursorGlow) {
  cursorGlow.remove();
}

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
menuToggle?.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

const siteHeader = document.querySelector(".site-header");
const themedSections = [
  { element: document.querySelector(".hero"), theme: "dark" },
  { element: document.querySelector(".work"), theme: "light" },
  { element: document.querySelector(".about"), theme: "mid" },
  { element: document.querySelector(".contact"), theme: "dark" },
].filter(({ element }) => element);

let themeUpdatePending = false;
const updateHeaderTheme = () => {
  themeUpdatePending = false;
  const themeMarker = Math.min(window.innerHeight * 0.3, 240);
  const activeSection = themedSections.reduce((active, section) => (
    section.element.getBoundingClientRect().top <= themeMarker ? section : active
  ), themedSections[0]);
  siteHeader.dataset.theme = activeSection.theme;
};

window.addEventListener("scroll", () => {
  if (!themeUpdatePending) {
    themeUpdatePending = true;
    window.requestAnimationFrame(updateHeaderTheme);
  }
}, { passive: true });
window.addEventListener("resize", updateHeaderTheme);
updateHeaderTheme();

document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const slides = [...track.children];
  let current = 0;
  const move = (step) => {
    current = (current + step + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    const counter = carousel.closest(".project-image")?.querySelector(".image-counter");
    if (counter) counter.innerHTML = `${String(current + 1).padStart(2, "0")} <span>/ ${String(slides.length).padStart(2, "0")}</span>`;
  };
  carousel.querySelector(".prev")?.addEventListener("click", () => move(-1));
  carousel.querySelector(".next")?.addEventListener("click", () => move(1));
});

const projectList = document.querySelector(".project-list");
if (projectList) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "timeline-line");
  svg.setAttribute("aria-hidden", "true");
  const basePath = document.createElementNS(svgNS, "path");
  basePath.setAttribute("class", "timeline-base");
  const progressPath = document.createElementNS(svgNS, "path");
  progressPath.setAttribute("class", "timeline-progress");
  const dot = document.createElementNS(svgNS, "circle");
  dot.setAttribute("class", "timeline-dot");
  dot.setAttribute("r", "7");
  svg.append(basePath, progressPath, dot);
  projectList.prepend(svg);

  let pathLength = 0;

  const buildPath = () => {
    const listRect = projectList.getBoundingClientRect();
    const isNarrow = window.innerWidth <= 760;
    const centerX = isNarrow ? 8 : listRect.width / 2;
    const swing = isNarrow ? 0 : listRect.width * 0.035;
    const points = [[centerX - swing, 0]];
    projectList.querySelectorAll(".project-card").forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const y = rect.top - listRect.top + rect.height / 2;
      points.push([centerX + (i % 2 === 0 ? swing : -swing), y]);
    });
    points.push([centerX - swing * (points.length % 2 ? 1 : -1), listRect.height]);
    const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    svg.setAttribute("viewBox", `0 0 ${listRect.width} ${listRect.height}`);
    basePath.setAttribute("d", d);
    progressPath.setAttribute("d", d);
    pathLength = progressPath.getTotalLength();
    progressPath.style.strokeDasharray = pathLength;
    updateTimeline();
  };

  function updateTimeline() {
    const listRect = projectList.getBoundingClientRect();
    const anchor = window.innerHeight * 0.55;
    const progress = Math.min(Math.max((anchor - listRect.top) / listRect.height, 0), 1);
    progressPath.style.strokeDashoffset = pathLength * (1 - progress);
    const point = progressPath.getPointAtLength(pathLength * progress);
    dot.setAttribute("cx", point.x);
    dot.setAttribute("cy", point.y);
  }

  window.addEventListener("scroll", updateTimeline, { passive: true });
  new ResizeObserver(buildPath).observe(projectList);
  window.addEventListener("load", buildPath);
  buildPath();
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
