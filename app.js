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

  /* Language is now per-URL (EN at root, Serbian under /sr/) — no client-side swapping. */

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

  /* ---------------- CONTACT FORM ---------------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var success = form.parentNode.querySelector(".form-success");
    var errorEl = form.parentNode.querySelector(".form-error");

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

      if (!ok) return;

      var btn = form.querySelector(".btn-send");
      var endpoint = form.getAttribute("action") || "";
      if (errorEl) errorEl.classList.remove("show");

      // Endpoint not configured yet — fail loudly in the console, show the user the fallback.
      if (!endpoint || /REPLACE_WITH_YOUR_FORM_ID/.test(endpoint)) {
        if (errorEl) errorEl.classList.add("show");
        console.warn("Contact form: set the <form action> to your Formspree (or other) endpoint to enable sending.");
        return;
      }

      if (btn) btn.disabled = true;
      form.classList.add("sending");

      fetch(endpoint, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      }).then(function (res) {
        if (!res.ok) throw new Error("Request failed: " + res.status);
        form.style.display = "none";
        if (success) success.classList.add("show");
      }).catch(function () {
        if (btn) btn.disabled = false;
        form.classList.remove("sending");
        if (errorEl) errorEl.classList.add("show");
      });
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
  window.fitDisplays = fitDisplays;   // expose so dynamically-revealed sections can re-fit
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitDisplays);
  }

  /* ---------------- MEDIA STRIP (desktop: 3-up, arrows shift by 3) ---------------- */
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
    if (sPrev) sPrev.addEventListener("click", function () { stripGo(si - perView); });
    if (sNext) sNext.addEventListener("click", function () { stripGo(si + perView); });
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
    if (dotsBox && slides.length > 9) { dotsBox.style.display = "none"; }
    if (dotsBox && slides.length <= 9) {
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
  fitDisplays();
})();
