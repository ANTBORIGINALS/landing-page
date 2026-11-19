/* ==========================================================
    site behavior
   ========================================================== */

/* ---------- Contact form settings ----------
   GitHub Pages is static, so the form needs somewhere to send messages.
   FORM_ENDPOINT
------------------------------------------------------------------- */
const CONTACT_EMAIL = "ltinoco@antboriginals.com";
const FORM_ENDPOINT = "https://formspree.io/f/mkjgeejo";

(function () {
  "use strict";

  /* ---------- Navbar: solid background after scrolling ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");

  /* ---------- Header logo: red hand-off from the hero on scroll ----------
     As the hero's red headline ("We Build Brands.") scrolls up toward the
     header, the header logo's "ANTB" gradually turns red too (see
     --logo-progress in css/style.css). Tune HANDOFF_DISTANCE to make the
     transfer happen over a shorter or longer stretch of scrolling. */
  var heroRedEl = document.querySelector(".hero__title .text-red");
  var HANDOFF_DISTANCE = 260; // px

  function updateLogoHandoff() {
    if (!heroRedEl) return;
    var navH = nav.offsetHeight;
    var top = heroRedEl.getBoundingClientRect().top;
    var progress = (navH + HANDOFF_DISTANCE - top) / HANDOFF_DISTANCE;
    progress = Math.min(1, Math.max(0, progress));
    document.documentElement.style.setProperty("--logo-progress", progress.toFixed(3));
  }

  function onScroll() {
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
    updateLogoHandoff();
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateLogoHandoff);

  /* ---------- Hero background video: respect reduced motion ----------
     CSS swaps the <video> for its poster image, but playback itself has to
     be stopped from JS, and autoplay has to be removed so it doesn't
     silently resume (e.g. after the tab regains focus). */
  var heroVideo = document.querySelector(".hero__video");
  if (heroVideo) {
    var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var syncHeroVideoMotion = function () {
      if (reduceMotionQuery.matches) {
        heroVideo.pause();
        heroVideo.removeAttribute("autoplay");
      } else {
        heroVideo.setAttribute("autoplay", "");
        heroVideo.play().catch(function () {
          /* Autoplay can be blocked by the browser; the poster frame still shows. */
        });
      }
    };
    syncHeroVideoMotion();
    if (reduceMotionQuery.addEventListener) {
      reduceMotionQuery.addEventListener("change", syncHeroVideoMotion);
    }
  }

  /* ---------- Sticker: drag it, peel it, watch it become the cube loader ----------
     The sticker is positioned in page coordinates. Scroll sets a target
     progress (p); a small animation loop eases toward it so the peel, the
     trip down and the sticker-to-cubes morph all feel fluid. Dragging
     adds an offset that melts away as the sticker leaves the hero. */
  var sticker = document.getElementById("sticker");
  var stickerFx = document.getElementById("stickerFx");
  var stickerSlot = document.getElementById("stickerSlot");
  var loaderSlot = document.getElementById("loaderSlot");
  var heroEl = document.querySelector(".hero");
  if (sticker && stickerFx && stickerSlot && loaderSlot && heroEl) {
    var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
    var smooth = function (v) { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); };
    var lerp = function (a, b, t) { return a + (b - a) * t; };
    var noMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var st = { p: 0, peel: 0.3, peelT: 0.3, tilt: 0, tiltT: 0, press: 1, pressT: 1,
               ox: 0, oy: 0, hx: 0, hy: 0, cx: 0, cy: 0, w: 0, gx: 0, gy: 0, lastX: 0,
               drag: false, running: false };

    var tick = function () {
      var sy = window.scrollY;
      var h = stickerSlot.getBoundingClientRect(), l = loaderSlot.getBoundingClientRect();
      st.hx = h.left + h.width / 2; st.hy = h.top + sy + h.height / 2;
      var lx = l.left + l.width / 2, ly = l.top + sy + l.height / 2;
      var target = noMotion.matches ? 0 : clamp(sy / Math.max(1, ly - window.innerHeight * 0.55), 0, 1);
      st.p += (target - st.p) * 0.1;
      if (Math.abs(target - st.p) < 0.0005) st.p = target;
      st.peel += (st.peelT - st.peel) * 0.2;
      st.tilt += (st.tiltT - st.tilt) * 0.2; st.tiltT *= 0.85;
      st.press += (st.pressT - st.press) * 0.25;

      var travel = smooth((st.p - 0.28) / 0.57);
      var morph = smooth((st.p - 0.6) / 0.32);
      var peel = Math.max(lerp(0.3, 1, smooth(st.p / 0.4)), st.peel);
      var keep = 1 - travel;                       /* dragged offset fades out while travelling */
      var arc = Math.sin(travel * Math.PI);        /* gentle swoop so it doesn't move in a straight line */
      var w = lerp(h.width, l.width, travel);
      var x = lerp(st.hx + st.ox * keep, lx, travel) - arc * 50;
      var y = lerp(st.hy + st.oy * keep, ly, travel) - arc * 30;
      st.w = w; st.cx = x; st.cy = y;

      sticker.style.width = sticker.style.height = w + "px";
      sticker.style.transform = "translate3d(" + (x - w / 2) + "px," + (y - w / 2) + "px,0)";
      sticker.style.setProperty("--peel", peel.toFixed(3));
      sticker.style.setProperty("--morph", morph.toFixed(3));
      document.documentElement.style.setProperty("--morph", morph.toFixed(3)); /* drives the mirrored loader */
      sticker.style.setProperty("--rot", (st.tilt - arc * 10).toFixed(2) + "deg");
      sticker.style.setProperty("--press", st.press.toFixed(3));
      sticker.classList.toggle("is-live", travel < 0.02 && morph === 0);

      return st.drag || Math.abs(target - st.p) > 0.0005 || Math.abs(st.peel - st.peelT) > 0.003 ||
             Math.abs(st.tilt) > 0.05 || Math.abs(st.press - st.pressT) > 0.002;
    };
    var frame = function () { st.running = tick(); if (st.running) requestAnimationFrame(frame); };
    var kick = function () { if (!st.running) { st.running = true; requestAnimationFrame(frame); } };

    /* Drag: grab it and the corner lifts; let go and it sticks back down. */
    stickerFx.addEventListener("pointerdown", function (e) {
      if (!sticker.classList.contains("is-live")) return;
      e.preventDefault();
      stickerFx.setPointerCapture(e.pointerId);
      st.drag = true; st.lastX = e.clientX;
      st.gx = e.clientX - st.cx; st.gy = e.clientY + window.scrollY - st.cy;
      st.peelT = 0.9; st.pressT = 1.05;
      sticker.classList.add("is-dragging"); kick();
    });
    stickerFx.addEventListener("pointermove", function (e) {
      if (!st.drag) return;
      var r = heroEl.getBoundingClientRect(), top = r.top + window.scrollY, half = st.w * 0.35;
      var cx = clamp(e.clientX - st.gx, r.left + half, r.right - half);
      var cy = clamp(e.clientY + window.scrollY - st.gy, top + 90 + half, top + r.height - half);
      st.ox = cx - st.hx; st.oy = cy - st.hy;
      st.tiltT = clamp((e.clientX - st.lastX) * 0.6, -16, 16); st.lastX = e.clientX;
      kick();
    });
    var drop = function () {
      if (!st.drag) return;
      st.drag = false; st.peelT = 0.3; st.pressT = 0.94; st.tiltT = 0;
      sticker.classList.remove("is-dragging");
      setTimeout(function () { st.pressT = 1; kick(); }, 110);
      kick();
    };
    stickerFx.addEventListener("pointerup", drop);
    stickerFx.addEventListener("pointercancel", drop);

    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    window.addEventListener("load", kick);
    kick();
  }

  /* ---------- Services: pinned stage of video tiles (desktop) + slider ----------
     Desktop: the section pins and scroll drives each tile — it rises small
     from below (wearing the loader's cube gradient, which clears to reveal
     the video), settles, then lifts away as the next one rises. Mobile and
     "reduced motion": plain stacked tiles, videos play while visible. */
  var svcStage = document.getElementById("svcStage");
  if (svcStage) {
    var svcMQ = window.matchMedia("(min-width: 861px) and (prefers-reduced-motion: no-preference)");
    var svcStill = window.matchMedia("(prefers-reduced-motion: reduce)");
    var svcTiles = [].slice.call(svcStage.querySelectorAll(".svc-tile"));
    var svcLabels = [].slice.call(svcStage.querySelectorAll(".svc-label"));
    var svcVideos = [].slice.call(svcStage.querySelectorAll(".svc-video"));
    var OFFSET_X = [10, -8, 8, -6], TILT = [-2, 2, -1.5, 2];
    var sm = function (v) { v = Math.min(1, Math.max(0, v)); return v * v * (3 - 2 * v); };
    var playVideo = function (v, on) {
      if (v._on === on) return;
      v._on = on;
      if (on) {
        if (!v.getAttribute("src")) v.src = v.getAttribute("data-src");
        var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
      } else { v.pause(); }
    };
    var svcRender = function () {
      if (!svcMQ.matches) {
        svcTiles.forEach(function (t) { t.removeAttribute("style"); });
        svcLabels.forEach(function (l) { l.removeAttribute("style"); });
        return;
      }
      var r = svcStage.getBoundingClientRect(), D = window.innerHeight * 0.8;
      var t = -r.top / D + 0.9;
      svcTiles.forEach(function (el, i) {
        var u = t - i, last = i === svcTiles.length - 1;
        var e = sm(u + 1), x = last ? 0 : sm(u);
        var scale = (0.16 + 0.84 * e) * (1 - 0.5 * x);
        var y = 48 * (1 - e) - 42 * x;
        var op = Math.min(1, e * 1.6) * (1 - Math.min(1, x * 1.3));
        el.style.transform = "translate(-50%,-50%) translate3d(" + (OFFSET_X[i] * e).toFixed(2) + "vw," + y.toFixed(2) + "vh,0) perspective(1200px) rotateX(" + (38 * (1 - e)).toFixed(2) + "deg) rotateZ(" + (TILT[i] * e - 7 * x).toFixed(2) + "deg) scale(" + scale.toFixed(3) + ")";
        el.style.opacity = op.toFixed(3);
        el.style.visibility = op < 0.01 ? "hidden" : "visible";
        el.style.zIndex = i;
        el.style.setProperty("--veil", (1 - sm((e - 0.35) / 0.65)).toFixed(3));
        playVideo(svcVideos[i], u > -1 && u < 1);
        var la = Math.max(0, 1 - Math.abs(u) * 1.6);
        svcLabels[i].style.opacity = la.toFixed(3);
        svcLabels[i].style.transform = "translateY(" + (-u * 24).toFixed(1) + "px)";
      });
    };
    var svcFrame = 0;
    var svcQueue = function () {
      if (svcFrame) return;
      svcFrame = requestAnimationFrame(function () { svcFrame = 0; svcRender(); });
    };
    window.addEventListener("scroll", svcQueue, { passive: true });
    window.addEventListener("resize", svcQueue);
    svcRender();

    if ("IntersectionObserver" in window && !svcStill.matches) {
      var svcObserver = new IntersectionObserver(function (entries) {
        if (svcMQ.matches) return;               /* desktop stage drives playback itself */
        entries.forEach(function (en) { playVideo(en.target, en.isIntersecting); });
      }, { threshold: 0.35 });
      svcVideos.forEach(function (v) { svcObserver.observe(v); });
    }
  }

  /* ---------- Slider (services without video) ----------
     Arrows, dots, drag/swipe, arrow keys, autoplay with a progress line
     that pauses on hover/focus and is off for reduced motion. */
  var slider = document.getElementById("svcSlider");
  if (slider) {
    var sTrack = slider.querySelector(".slider__track");
    var sView = slider.querySelector(".slider__viewport");
    var sSlides = [].slice.call(slider.querySelectorAll(".slide"));
    var sDots = [].slice.call(slider.querySelectorAll(".slider__dots button"));
    var SLIDE_MS = 6500, sIdx = 0, sTimer = 0, sHold = false;
    var sStill = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    slider.style.setProperty("--slide-ms", SLIDE_MS + "ms");

    var sRestart = function () {
      clearTimeout(sTimer);
      slider.classList.remove("is-playing");
      if (sStill || sHold) return;
      void slider.offsetWidth;
      slider.classList.add("is-playing");
      sTimer = setTimeout(function () { sGo(sIdx + 1); }, SLIDE_MS);
    };
    var sGo = function (n) {
      sIdx = (n + sSlides.length) % sSlides.length;
      sTrack.style.transition = "";
      sTrack.style.transform = "translate3d(" + (-sIdx * 100) + "%,0,0)";
      sSlides.forEach(function (s, i) { s.classList.toggle("is-active", i === sIdx); s.setAttribute("aria-hidden", String(i !== sIdx)); });
      sDots.forEach(function (d, i) { d.classList.toggle("is-active", i === sIdx); });
      sRestart();
    };
    slider.querySelectorAll(".slider__btn").forEach(function (b) {
      b.addEventListener("click", function () { sGo(sIdx + Number(b.getAttribute("data-dir"))); });
    });
    sDots.forEach(function (d, i) { d.addEventListener("click", function () { sGo(i); }); });
    sView.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") sGo(sIdx - 1);
      if (e.key === "ArrowRight") sGo(sIdx + 1);
    });
    slider.addEventListener("mouseenter", function () { sHold = true; sRestart(); });
    slider.addEventListener("mouseleave", function () { sHold = false; sRestart(); });
    slider.addEventListener("focusin", function () { sHold = true; sRestart(); });
    slider.addEventListener("focusout", function () { sHold = false; sRestart(); });

    var sDrag = false, sStartX = 0, sDx = 0;
    sView.addEventListener("pointerdown", function (e) {
      sDrag = true; sStartX = e.clientX; sDx = 0;
      sTrack.style.transition = "none";
      sView.setPointerCapture(e.pointerId);
    });
    sView.addEventListener("pointermove", function (e) {
      if (!sDrag) return;
      sDx = e.clientX - sStartX;
      sTrack.style.transform = "translate3d(calc(" + (-sIdx * 100) + "% + " + sDx + "px),0,0)";
    });
    var sDrop = function () {
      if (!sDrag) return;
      sDrag = false;
      var w = sView.offsetWidth;
      sGo(Math.abs(sDx) > w * 0.15 ? sIdx + (sDx < 0 ? 1 : -1) : sIdx);
    };
    sView.addEventListener("pointerup", sDrop);
    sView.addEventListener("pointercancel", sDrop);
    sGo(0);
  }

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function () {
    setMenu(!nav.classList.contains("is-open"));
  });
  links.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 761px)").addEventListener("change", function (e) {
    if (e.matches) setMenu(false);
  });

  /* ---------- Gentle reveal on scroll ---------- */
  var items = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    items.forEach(function (el) { observer.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");

  if (form && status) {
    var formLoadedAt = Date.now();
    var MIN_FILL_TIME_MS = 2000;

    var setStatus = function (message, isError) {
      status.textContent = message;
      status.classList.toggle("is-error", Boolean(isError));
    };

    form.addEventListener("input", function (e) {
      e.target.classList.remove("is-invalid");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus("", false);

      if (Date.now() - formLoadedAt < MIN_FILL_TIME_MS) {
        setStatus("Please take a moment to fill in the form, then try again.", true);
        return;
      }

      var fields = form.querySelectorAll("input[required], textarea[required]");
      var firstInvalid = null;
      fields.forEach(function (field) {
        var ok = field.checkValidity() && field.value.trim() !== "";
        field.classList.toggle("is-invalid", !ok);
        if (!ok && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        setStatus("Please fill in your name, a valid email and a message.", true);
        firstInvalid.focus();
        return;
      }

      var data = new FormData(form);
      if (data.get("_gotcha")) return; 

      if (FORM_ENDPOINT) {
        setStatus("Sending…", false);
        fetch(FORM_ENDPOINT, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" }
        })
          .then(function (res) {
            if (!res.ok) throw new Error("Request failed");
            form.reset();
            setStatus("Message sent. We'll reply by email.", false);
          })
          .catch(function () {
            setStatus("The message could not be sent. Try again, or write to " + CONTACT_EMAIL + ".", true);
          });
        return;
      }

      var subject = "Website enquiry from " + data.get("name");
      var body = data.get("message") + "\n\n—\n" + data.get("name") + "\n" + data.get("email");
      window.location.href =
        "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
      setStatus("Opening your email app with the message ready to send.", false);
    });
  }
})();
