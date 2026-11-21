import { smoothstep, reducedMotion, rafThrottle } from "../lib/motion.js";

const OFFSET_X = [10, -8, 8, -6];
const TILT = [-2, 2, -1.5, 2];
const pinned = window.matchMedia("(min-width: 861px) and (min-height: 441px) and (prefers-reduced-motion: no-preference)");

function createPlayer() {
  const playing = new WeakMap();
  return (video, on) => {
    if (playing.get(video) === on) return;
    playing.set(video, on);
    if (!on) {
      video.pause();
      return;
    }
    if (!video.getAttribute("src")) video.src = video.dataset.src;
    video.play().catch(() => {});
  };
}

function tileStyle(index, step, isLast) {
  const enter = smoothstep(step + 1);
  const exit = isLast ? 0 : smoothstep(step);
  const scale = (0.16 + 0.84 * enter) * (1 - 0.5 * exit);
  const y = 48 * (1 - enter) - 42 * exit;
  const opacity = Math.min(1, enter * 1.6) * (1 - Math.min(1, exit * 1.3));
  return {
    transform:
      `translate(-50%, -50%) translate3d(${(OFFSET_X[index] * enter).toFixed(2)}vw, ${y.toFixed(2)}vh, 0) ` +
      `perspective(1200px) rotateX(${(38 * (1 - enter)).toFixed(2)}deg) ` +
      `rotateZ(${(TILT[index] * enter - 7 * exit).toFixed(2)}deg) scale(${scale.toFixed(3)})`,
    opacity,
    veil: 1 - smoothstep((enter - 0.35) / 0.65),
  };
}

// Desktop: the section pins and scroll drives each tile in from below, wearing
// the loader's gradient, then lifts it away as the next one rises. Small or
// short screens and reduced motion get plain stacked tiles instead.
export function initServicesStage() {
  const stage = document.getElementById("svcStage");
  if (!stage) return;

  const tiles = [...stage.querySelectorAll(".svc-tile")];
  const labels = [...stage.querySelectorAll(".svc-label")];
  const videos = [...stage.querySelectorAll(".svc-video")];
  const play = createPlayer();

  const render = () => {
    if (!pinned.matches) {
      tiles.forEach((tile) => tile.removeAttribute("style"));
      labels.forEach((label) => label.removeAttribute("style"));
      return;
    }
    const progress = -stage.getBoundingClientRect().top / (window.innerHeight * 0.8) + 0.9;
    tiles.forEach((tile, i) => {
      const step = progress - i;
      const { transform, opacity, veil } = tileStyle(i, step, i === tiles.length - 1);
      tile.style.transform = transform;
      tile.style.opacity = opacity.toFixed(3);
      tile.style.visibility = opacity < 0.01 ? "hidden" : "visible";
      tile.style.zIndex = i;
      tile.style.setProperty("--veil", veil.toFixed(3));
      play(videos[i], step > -1 && step < 1);

      const labelOpacity = Math.max(0, 1 - Math.abs(step) * 2.2);
      labels[i].style.opacity = labelOpacity.toFixed(3);
      labels[i].style.transform = `translateY(${(-step * 24).toFixed(1)}px)`;
    });
  };

  const queue = rafThrottle(render);
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  render();

  if (!("IntersectionObserver" in window) || reducedMotion.matches) return;
  const observer = new IntersectionObserver((entries) => {
    if (pinned.matches) return;
    entries.forEach((entry) => play(entry.target, entry.isIntersecting));
  }, { threshold: 0.35 });
  videos.forEach((video) => observer.observe(video));
}
