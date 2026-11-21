export const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const lerp = (from, to, t) => from + (to - from) * t;

export const smoothstep = (value) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

export function onMediaChange(query, handler) {
  if (query.addEventListener) query.addEventListener("change", handler);
  else query.addListener(handler);
}

export function rafThrottle(callback) {
  let frame = 0;
  return () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      callback();
    });
  };
}
