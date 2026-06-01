/* ============================================================
   Luka Jozic — interactions
   - EN/SRB language switch (data-en / data-sr attributes)
   - fullscreen menu overlay + smooth scroll
   - reviews slider
   - contact form validation
   - scroll fade-in
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- LANGUAGE ---------------- */
  var STORE = "luka-lang";
  var lang = localStorage.getItem(STORE) || "en";

  function applyLang(l) {
    lang = (l === "sr") ? "sr" : "en";
    localStorage.setItem(STORE, lang);
    document.documentElement.setAttribute("lang", lang === "sr" ? "sr-Latn" : "en");

    // text content
    document.querySelectorAll("[data-en]").forEach(function (el) {
      var val = el.getAttribute("data-" + lang);
      if (val !== null) el.innerHTML = val;
    });
    // placeholders
    document.querySelectorAll("[data-en-ph]").forEach(function (el) {
      var val = el.getAttribute("data-" + lang + "-ph");
      if (val !== null) el.setAttribute("placeholder", val);
    });
    // aria-labels
    document.querySelectorAll("[data-en-aria]").forEach(function (el) {
      var val = el.getAttribute("data-" + lang + "-aria");
      if (val !== null) el.setAttribute("aria-label", val);
    });

    // active state on every lang switch
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.lang === lang);
    });

    // re-fit headlines whenever the visible text changes
    if (typeof fitDisplays === "function") fitDisplays();
  }

  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.dataset.lang); });
  });

  /* ---------------- MENU OVERLAY ---------------- */
  var overlay = document.getElementById("overlay");
  var burger = document.getElementById("burger");
  var closeBtn = overlay.querySelector(".close");

  function openMenu() { overlay.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeMenu() { overlay.classList.remove("open"); document.body.style.overflow = ""; }

  burger.addEventListener("click", openMenu);
  closeBtn.addEventListener("click", closeMenu);
  overlay.querySelectorAll("nav a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------------- MEDIA GALLERY (horizontal scroll) ---------------- */
  document.querySelectorAll(".gallery-wrap").forEach(function (wrap) {
    var track = wrap.querySelector(".gallery");
    var prev = wrap.querySelector(".gal-prev");
    var next = wrap.querySelector(".gal-next");
    if (!track) return;

    function step() {
      var item = track.querySelector(".gal-item");
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "24") || 24;
      return item ? item.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.style.opacity = track.scrollLeft <= 2 ? "0.25" : "1";
      if (next) next.style.opacity = track.scrollLeft >= max ? "0.25" : "1";
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });

  /* ---------------- CONTACT FORM ---------------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var success = form.parentNode.querySelector(".form-success");

    function setInvalid(field, on) { field.classList.toggle("invalid", on); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      var name = form.querySelector('[name="name"]');
      var email = form.querySelector('[name="email"]');
      var msg = form.querySelector('[name="message"]');

      var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      [
        [name, name.value.trim().length > 0],
        [email, emailRe.test(email.value.trim())],
        [msg, msg.value.trim().length > 0]
      ].forEach(function (pair) {
        var bad = !pair[1];
        setInvalid(pair[0].closest(".field"), bad);
        if (bad) ok = false;
      });

      if (ok) {
        var to = "hello@lukajozic.com";
        var subject = "Website inquiry — " + name.value.trim();
        var body = "Name: " + name.value.trim() +
                   "\nE-mail: " + email.value.trim() +
                   "\n\n" + msg.value.trim();
        window.location.href = "mailto:" + to +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
        form.style.display = "none";
        if (success) success.classList.add("show");
      }
    });

    // clear invalid on input
    form.querySelectorAll("input, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        el.closest(".field").classList.remove("invalid");
      });
    });
  }

  /* ---------------- HEADLINE AUTO-FIT (never crop a title) ---------------- */
  function fitDisplays() {
    document.querySelectorAll(".display, .hl-line").forEach(function (el) {
      el.style.fontSize = "";                 // reset to CSS clamp base
      var wrap = el.parentElement;
      var avail = wrap.clientWidth;
      if (!avail) return;
      var natural = el.scrollWidth;
      if (natural > avail) {
        var cur = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = (avail / natural) * cur * 0.97 + "px";
      }
    });
  }
  window.addEventListener("resize", fitDisplays);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitDisplays);
  }

  /* ---------------- HERO PARALLAX (headline sinks behind the portrait) ---------------- */
  var pxEls = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  var hero = document.getElementById("hero");
  if (pxEls.length && hero) {
    var ticking = false;
    function applyParallax() {
      var s = window.scrollY || window.pageYOffset;
      hero.classList.toggle("scrolled", s > 30);
      if (s < hero.offsetHeight + 100) {
        pxEls.forEach(function (el) {
          var f = parseFloat(el.getAttribute("data-parallax")) || 0;
          el.style.setProperty("--py", (s * f).toFixed(1) + "px");
        });
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(applyParallax); ticking = true; }
    }, { passive: true });
    applyParallax();
  }

  /* ---------------- MEDIA STRIP (desktop: 3-up, arrows shift by one) ---------------- */
  var strip = document.querySelector(".media-strip");
  if (strip) {
    var track = strip.querySelector(".ms-track");
    var cells = Array.prototype.slice.call(strip.querySelectorAll(".ms-cell"));
    var sPrev = strip.querySelector(".ms-prev");
    var sNext = strip.querySelector(".ms-next");
    var perView = 3;
    var si = 0;
    function maxIndex() { return Math.max(0, cells.length - perView); }
    function stripGo(i) {
      si = Math.max(0, Math.min(i, maxIndex()));
      if (!cells.length) return;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
      var step = cells[0].getBoundingClientRect().width + gap;
      track.style.transform = "translateX(" + (-si * step) + "px)";
      if (sPrev) sPrev.disabled = (si <= 0);
      if (sNext) sNext.disabled = (si >= maxIndex());
    }
    if (sPrev) sPrev.addEventListener("click", function () { stripGo(si - 1); });
    if (sNext) sNext.addEventListener("click", function () { stripGo(si + 1); });
    window.addEventListener("resize", function () { stripGo(si); });
    stripGo(0);
  }

  /* ---------------- MEDIA CAROUSEL (single image at a time) ---------------- */
  var mc = document.querySelector(".media-carousel");
  if (mc) {
    var slides = Array.prototype.slice.call(mc.querySelectorAll(".mc-slide"));
    var dotsBox = document.querySelector(".mc-dots");
    var mi = 0;
    var dots = [];
    if (dotsBox) {
      slides.forEach(function (_, i) {
        var d = document.createElement("button");
        d.setAttribute("aria-label", "Image " + (i + 1));
        d.addEventListener("click", function () { mgo(i); });
        dotsBox.appendChild(d);
        dots.push(d);
      });
    }
    function mgo(i) {
      mi = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === mi); });
      dots.forEach(function (d, k) { d.classList.toggle("active", k === mi); });
    }
    var mp = mc.querySelector(".mc-prev");
    var mn = mc.querySelector(".mc-next");
    if (mp) mp.addEventListener("click", function () { mgo(mi - 1); });
    if (mn) mn.addEventListener("click", function () { mgo(mi + 1); });
    mgo(0);
  }

  /* ---------------- SCROLL FADE-IN ---------------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".fade, .reveal").forEach(function (el) { io.observe(el); });

  /* ---------------- LIGHTBOX (full-colour image viewer) ---------------- */
  (function () {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    var btn = document.createElement("button");
    btn.className = "lb-close";
    btn.type = "button";
    btn.setAttribute("aria-label", "Close");
    btn.innerHTML = "&times;";
    var prevBtn = document.createElement("button");
    prevBtn.className = "lb-nav lb-prev";
    prevBtn.type = "button";
    prevBtn.setAttribute("aria-label", "Previous image");
    prevBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="15.5,4 7.5,12 15.5,20"/></svg>';
    var nextBtn = document.createElement("button");
    nextBtn.className = "lb-nav lb-next";
    nextBtn.type = "button";
    nextBtn.setAttribute("aria-label", "Next image");
    nextBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="8.5,4 16.5,12 8.5,20"/></svg>';
    var big = document.createElement("img");
    big.alt = "";
    lb.appendChild(btn);
    lb.appendChild(prevBtn);
    lb.appendChild(nextBtn);
    lb.appendChild(big);
    document.body.appendChild(lb);

    var items = [];   // current list of [data-full] elements
    var idx = -1;     // index of the displayed image

    function show(i) {
      if (!items.length) return;
      idx = (i + items.length) % items.length;   // wrap around
      var el = items[idx];
      big.src = el.getAttribute("data-full");
      big.alt = el.getAttribute("alt") || "";
      var multi = items.length > 1;
      prevBtn.style.display = multi ? "" : "none";
      nextBtn.style.display = multi ? "" : "none";
    }

    function open(target) {
      // collect every openable image on the page, in document order
      items = Array.prototype.slice.call(document.querySelectorAll("[data-full]"));
      idx = items.indexOf(target);
      if (idx < 0) idx = 0;
      show(idx);
      lb.classList.add("open");
      document.documentElement.style.overflow = "hidden";
    }
    function close() {
      lb.classList.remove("open");
      document.documentElement.style.overflow = "";
    }
    function next() { show(idx + 1); }
    function prev() { show(idx - 1); }

    // delegated — any current or future element with [data-full] opens
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-full]");
      if (!t) return;
      e.preventDefault();
      open(t);
    });
    btn.addEventListener("click", close);
    nextBtn.addEventListener("click", function (e) { e.stopPropagation(); next(); });
    prevBtn.addEventListener("click", function (e) { e.stopPropagation(); prev(); });
    big.addEventListener("click", function (e) {
      e.stopPropagation();
      if (items.length < 2) return;
      var r = big.getBoundingClientRect();
      if (e.clientX < r.left + r.width / 2) prev(); else next();
    });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    });

    // swipe on touch devices
    var sx = 0, sy = 0;
    lb.addEventListener("touchstart", function (e) {
      sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next(); else prev();
      }
    }, { passive: true });
  })();

  /* ---------------- INIT ---------------- */
  applyLang(lang);
})();
