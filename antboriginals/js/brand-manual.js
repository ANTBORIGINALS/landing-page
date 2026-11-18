/* Brand manual page: progress bar, hero spotlight, word-by-word reveal,
   index highlighting, click-to-copy colours, type tester. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* reading progress */
  var bar = $("#bmProgress"), ticking = false;
  var progress = function () {
    ticking = false;
    var h = document.documentElement;
    var p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(4));
  };
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });
  progress();

  /* hero light follows the pointer */
  var hero = $(".bm-hero");
  if (hero && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
      hero.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
    });
  }

  /* split statements into words so they can reveal one by one */
  $$(".bm-split").forEach(function (el) {
    var i = 0;
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(" ")); return; }
            var s = document.createElement("span");
            s.className = "w"; s.style.setProperty("--w", i++); s.textContent = t;
            frag.appendChild(s);
          });
          node.replaceChild(frag, c);
        } else if (c.nodeType === 1) { walk(c); }
      });
    })(el);
  });

  /* index: highlight the section being read */
  var links = {};
  $$(".bm-toc a[href^='#']").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.toggle("is-active", k === e.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    $$(".bm-sec").forEach(function (s) { io.observe(s); });
  }

  /* colours: click to copy HEX */
  var toast = $("#bmToast"), toastTimer;
  var say = function (msg) {
    toast.textContent = msg; toast.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 1800);
  };
  $$(".bm-swatch").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".bm-swatch").forEach(function (x) { x.classList.remove("is-open"); });
      b.classList.add("is-open");
      var hex = b.getAttribute("data-hex");
      var done = function () { say("Copiado " + hex); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(hex).then(done, done); else done();
    });
  });

  /* type tester */
  var input = $("#bmTest"), out = $("#bmOut");
  if (input && out) {
    input.addEventListener("input", function () { out.textContent = input.value || "\u00a0"; });
    $$(".bm-tester__btns button").forEach(function (b) {
      b.addEventListener("click", function () {
        out.style.fontWeight = b.getAttribute("data-w");
        $$(".bm-tester__btns button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      });
    });
  }
})();
