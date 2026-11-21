import { clamp, onMediaChange } from "../lib/motion.js";

const SCROLLED_OFFSET = 24;
const LOGO_HANDOFF_DISTANCE = 260;
const desktop = window.matchMedia("(min-width: 761px)");

function initScrollState(nav) {
  const heroAccent = document.querySelector(".hero__title .text-red");
  const root = document.documentElement;

  const update = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > SCROLLED_OFFSET);
    if (!heroAccent) return;
    // The header logo turns red as the hero's red headline scrolls up into it.
    const distance = nav.offsetHeight + LOGO_HANDOFF_DISTANCE - heroAccent.getBoundingClientRect().top;
    root.style.setProperty("--logo-progress", clamp(distance / LOGO_HANDOFF_DISTANCE, 0, 1).toFixed(3));
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function initMobileMenu(nav) {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  const isOpen = () => nav.classList.contains("is-open");
  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  toggle.addEventListener("click", () => setOpen(!isOpen()));
  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !isOpen()) return;
    setOpen(false);
    toggle.focus();
  });
  onMediaChange(desktop, (e) => {
    if (e.matches) setOpen(false);
  });
}

function initDropdown(dropdown) {
  if (!dropdown) return;
  const button = dropdown.querySelector(".nav__dropdown-toggle");

  const isOpen = () => dropdown.classList.contains("is-open");
  const setOpen = (open) => {
    dropdown.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
  };

  button.addEventListener("click", (e) => {
    if (!desktop.matches) return;
    setOpen(e.pointerType === "mouse" ? true : !isOpen());
  });
  dropdown.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse" && desktop.matches) setOpen(true);
  });
  dropdown.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") setOpen(false);
  });
  dropdown.addEventListener("focusout", (e) => {
    if (!dropdown.contains(e.relatedTarget)) setOpen(false);
  });
  dropdown.addEventListener("click", (e) => {
    if (e.target.closest(".nav__menu a")) setOpen(false);
  });
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !isOpen()) return;
    setOpen(false);
    button.focus();
  });
  onMediaChange(desktop, () => setOpen(false));
}

export function initNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  initScrollState(nav);
  initMobileMenu(nav);
  initDropdown(nav.querySelector(".nav__dropdown"));
}
