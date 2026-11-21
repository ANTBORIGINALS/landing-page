import { reducedMotion, onMediaChange } from "../lib/motion.js";

export function initHeroVideo() {
  const video = document.querySelector(".hero__video");
  if (!video) return;

  // CSS hides the video for reduced motion, but only JS can stop playback and
  // keep autoplay from resuming it when the tab regains focus.
  const sync = () => {
    if (reducedMotion.matches) {
      video.pause();
      video.removeAttribute("autoplay");
      return;
    }
    video.setAttribute("autoplay", "");
    video.play().catch(() => {});
  };

  sync();
  onMediaChange(reducedMotion, sync);
}
