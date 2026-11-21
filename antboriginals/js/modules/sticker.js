import { clamp, lerp, smoothstep, reducedMotion } from "../lib/motion.js";

const SETTLE = 0.0005;

// The sticker lives in page coordinates. Scroll sets a target progress and the
// loop eases toward it, so the peel, the trip down to the loader slot and the
// sticker-to-cubes morph stay fluid. A drag offset melts away while it travels.
export function initSticker() {
  const sticker = document.getElementById("sticker");
  const fx = document.getElementById("stickerFx");
  const heroSlot = document.getElementById("stickerSlot");
  const loaderSlot = document.getElementById("loaderSlot");
  const hero = document.querySelector(".hero");
  if (!sticker || !fx || !heroSlot || !loaderSlot || !hero) return;

  const root = document.documentElement;
  const state = {
    progress: 0,
    peel: 0.3, peelTarget: 0.3,
    tilt: 0, tiltTarget: 0,
    press: 1, pressTarget: 1,
    offsetX: 0, offsetY: 0,
    homeX: 0, homeY: 0,
    x: 0, y: 0, size: 0,
    grabX: 0, grabY: 0, lastPointerX: 0,
    dragging: false, running: false,
  };

  const render = () => {
    const scrollY = window.scrollY;
    const home = heroSlot.getBoundingClientRect();
    const dest = loaderSlot.getBoundingClientRect();
    state.homeX = home.left + home.width / 2;
    state.homeY = home.top + scrollY + home.height / 2;
    const destX = dest.left + dest.width / 2;
    const destY = dest.top + scrollY + dest.height / 2;

    const target = reducedMotion.matches ? 0 : clamp(scrollY / Math.max(1, destY - window.innerHeight * 0.55), 0, 1);
    state.progress += (target - state.progress) * 0.1;
    if (Math.abs(target - state.progress) < SETTLE) state.progress = target;
    state.peel += (state.peelTarget - state.peel) * 0.2;
    state.tilt += (state.tiltTarget - state.tilt) * 0.2;
    state.tiltTarget *= 0.85;
    state.press += (state.pressTarget - state.press) * 0.25;

    const travel = smoothstep((state.progress - 0.28) / 0.57);
    const morph = smoothstep((state.progress - 0.6) / 0.32);
    const peel = Math.max(lerp(0.3, 1, smoothstep(state.progress / 0.4)), state.peel);
    const keep = 1 - travel;
    const arc = Math.sin(travel * Math.PI);
    const size = lerp(home.width, dest.width, travel);
    const x = lerp(state.homeX + state.offsetX * keep, destX, travel) - arc * 50;
    const y = lerp(state.homeY + state.offsetY * keep, destY, travel) - arc * 30;
    state.size = size;
    state.x = x;
    state.y = y;

    sticker.style.width = sticker.style.height = `${size}px`;
    sticker.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
    sticker.style.setProperty("--peel", peel.toFixed(3));
    sticker.style.setProperty("--morph", morph.toFixed(3));
    root.style.setProperty("--morph", morph.toFixed(3));
    sticker.style.setProperty("--rot", `${(state.tilt - arc * 10).toFixed(2)}deg`);
    sticker.style.setProperty("--press", state.press.toFixed(3));
    sticker.classList.toggle("is-live", travel < 0.02 && morph === 0);

    return state.dragging ||
      Math.abs(target - state.progress) > SETTLE ||
      Math.abs(state.peel - state.peelTarget) > 0.003 ||
      Math.abs(state.tilt) > 0.05 ||
      Math.abs(state.press - state.pressTarget) > 0.002;
  };

  const frame = () => {
    state.running = render();
    if (state.running) requestAnimationFrame(frame);
  };
  const kick = () => {
    if (state.running) return;
    state.running = true;
    requestAnimationFrame(frame);
  };

  fx.addEventListener("pointerdown", (e) => {
    if (!sticker.classList.contains("is-live")) return;
    e.preventDefault();
    fx.setPointerCapture(e.pointerId);
    state.dragging = true;
    state.lastPointerX = e.clientX;
    state.grabX = e.clientX - state.x;
    state.grabY = e.clientY + window.scrollY - state.y;
    state.peelTarget = 0.9;
    state.pressTarget = 1.05;
    sticker.classList.add("is-dragging");
    kick();
  });

  fx.addEventListener("pointermove", (e) => {
    if (!state.dragging) return;
    const bounds = hero.getBoundingClientRect();
    const top = bounds.top + window.scrollY;
    const half = state.size * 0.35;
    const x = clamp(e.clientX - state.grabX, bounds.left + half, bounds.right - half);
    const y = clamp(e.clientY + window.scrollY - state.grabY, top + 90 + half, top + bounds.height - half);
    state.offsetX = x - state.homeX;
    state.offsetY = y - state.homeY;
    state.tiltTarget = clamp((e.clientX - state.lastPointerX) * 0.6, -16, 16);
    state.lastPointerX = e.clientX;
    kick();
  });

  const drop = () => {
    if (!state.dragging) return;
    state.dragging = false;
    state.peelTarget = 0.3;
    state.pressTarget = 0.94;
    state.tiltTarget = 0;
    sticker.classList.remove("is-dragging");
    setTimeout(() => {
      state.pressTarget = 1;
      kick();
    }, 110);
    kick();
  };
  fx.addEventListener("pointerup", drop);
  fx.addEventListener("pointercancel", drop);

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);
  window.addEventListener("load", kick);
  kick();
}
