import { reducedMotion } from "../lib/motion.js";

const SLIDE_MS = 6500;
const SWIPE_THRESHOLD = 0.15;

export function initSlider() {
  const slider = document.getElementById("svcSlider");
  if (!slider) return;

  const track = slider.querySelector(".slider__track");
  const viewport = slider.querySelector(".slider__viewport");
  const slides = [...slider.querySelectorAll(".slide")];
  const dots = [...slider.querySelectorAll(".slider__dots button")];
  let index = 0;
  let timer = 0;
  let held = false;

  slider.style.setProperty("--slide-ms", `${SLIDE_MS}ms`);

  const restartAutoplay = () => {
    clearTimeout(timer);
    slider.classList.remove("is-playing");
    if (reducedMotion.matches || held) return;
    // Force a reflow so the progress bar animation starts over.
    void slider.offsetWidth;
    slider.classList.add("is-playing");
    timer = setTimeout(() => goTo(index + 1), SLIDE_MS);
  };

  const goTo = (n) => {
    index = (n + slides.length) % slides.length;
    track.style.transition = "";
    track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
      slide.setAttribute("aria-hidden", String(i !== index));
    });
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    restartAutoplay();
  };

  const hold = (value) => () => {
    held = value;
    restartAutoplay();
  };

  slider.querySelectorAll(".slider__btn").forEach((button) => {
    button.addEventListener("click", () => goTo(index + Number(button.dataset.dir)));
  });
  dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));
  viewport.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goTo(index - 1);
    if (e.key === "ArrowRight") goTo(index + 1);
  });
  slider.addEventListener("mouseenter", hold(true));
  slider.addEventListener("mouseleave", hold(false));
  slider.addEventListener("focusin", hold(true));
  slider.addEventListener("focusout", hold(false));

  let dragging = false;
  let startX = 0;
  let deltaX = 0;
  viewport.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    deltaX = 0;
    track.style.transition = "none";
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    deltaX = e.clientX - startX;
    track.style.transform = `translate3d(calc(${-index * 100}% + ${deltaX}px), 0, 0)`;
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    const swiped = Math.abs(deltaX) > viewport.offsetWidth * SWIPE_THRESHOLD;
    goTo(swiped ? index + (deltaX < 0 ? 1 : -1) : index);
  };
  viewport.addEventListener("pointerup", release);
  viewport.addEventListener("pointercancel", release);

  goTo(0);
}
