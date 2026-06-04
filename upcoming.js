/* ============================================================
   Luka Jozic — Upcoming shows, driven by Airtable
   ------------------------------------------------------------
   Edit your shows in Airtable; the site updates on its own.
   No code or GitHub changes needed once this is set up.

   ┌─────────────────────────────────────────────────────────┐
   │  ONLY EDIT THE THREE VALUES IN THE CONFIG BLOCK BELOW.    │
   └─────────────────────────────────────────────────────────┘

   How it behaves (as requested):
   • Shows are sorted by date, soonest first.
   • A show disappears automatically once its date has passed.
   • If there are no upcoming shows, the whole section is hidden.
   • If Airtable can't be reached, the section is hidden quietly.

   Airtable table columns it expects (create these once):
     Date        (Date)            — required, e.g. 2026-06-15
     Time        (Single line)     — optional, e.g. 20:30
     TitleEN / TitleSR      (Single line) — required
     ComposerEN / ComposerSR (Single line) — optional
     VenueEN / VenueSR      (Single line) — required
     DirectorEN / DirectorSR (Single line) — optional
     RoleEN / RoleSR        (Single line) — optional
     Published   (Checkbox)        — optional; if present, only
                                      checked rows are shown.
   ============================================================ */
(function () {
  "use strict";

  /* ======================= CONFIG ======================= */
  var CONFIG = {
    BASE_ID: "appIUeJxec2E7lLJ1",          // Luka's "Upcoming" base
    TABLE:   "tblYwqXwUz2XAAll3",           // table id (rename-proof)
    TOKEN:   "patBMFANCOEfSAfWc.41609466560b277cb962c68542f9604fbcf2bd1f19929490962b5a932882874c" // read-only, Upcoming base
  };
  /* ===================================================== */

  var section = document.getElementById("upcoming");
  if (!section) return;
  var grid = section.querySelector(".up-grid");
  if (!grid) return;

  // Behaviour when there are no upcoming shows (or Airtable is unreachable):
  //   data-on-empty="message"  → show a friendly "more dates coming soon" note
  //                              (used on the dedicated Upcoming page)
  //   otherwise                → keep the whole section hidden (homepage)
  var EMPTY_MESSAGE = (section.getAttribute("data-on-empty") === "message");

  // If the config hasn't been filled in yet, leave the page as-is
  // (the section starts hidden, so nothing breaks).
  if (/PASTE_YOUR/.test(CONFIG.BASE_ID) || /PASTE_YOUR/.test(CONFIG.TOKEN)) {
    console.warn("[upcoming] Airtable not configured yet — fill in BASE_ID and TOKEN in upcoming.js.");
    return;
  }

  /* ---------------- locale ---------------- */
  var isSR = (document.documentElement.lang || "").toLowerCase().indexOf("sr") === 0;
  var L = isSR
    ? { director: "Režija", role: "Uloga",
        months: ["januar","februar","mart","april","maj","jun","jul","avgust","septembar","oktobar","novembar","decembar"] }
    : { director: "Director", role: "Role",
        months: ["January","February","March","April","May","June","July","August","September","October","November","December"] };

  function pick(fields, base) {
    // prefer the locale-specific column, fall back to the other, then plain
    var sr = fields[base + "SR"], en = fields[base + "EN"], plain = fields[base];
    var v = isSR ? (sr || en) : (en || sr);
    v = v || plain || "";
    return String(v).trim();
  }

  // Accept any of several column-name spellings (first non-empty wins).
  function pickAny(fields /* , base1, base2, ... */) {
    for (var i = 1; i < arguments.length; i++) {
      var v = pick(fields, arguments[i]);
      if (v) return v;
    }
    return "";
  }

  // Publish flag: honour "Published" or "Checkbox"; if neither column
  // exists, show the row by default.
  function isPublished(f) {
    if ("Published" in f) return !!f.Published;
    if ("Checkbox" in f) return !!f.Checkbox;
    return true;
  }

  function parseDate(s) {
    if (!s) return null;
    // Airtable date-only values arrive as "2026-06-15"; pin to local midnight.
    var iso = /^\d{4}-\d{2}-\d{2}$/.test(s) ? s + "T00:00:00" : s;
    var d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  }

  function formatDate(d, time) {
    var day = d.getDate(), mon = L.months[d.getMonth()], yr = d.getFullYear();
    var str = isSR ? (day + ". " + mon + " " + yr + ".") : (day + " " + mon + " " + yr);
    if (time) str += " · " + time;
    return str;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function render(events) {
    var html = events.map(function (e) {
      var rows = "";
      rows += '<p class="up-venue">' + esc(e.venue) + "</p>";
      if (e.director) {
        rows += '<p class="up-line"><span class="up-lbl">' + esc(L.director) + "</span><span>" + esc(e.director) + "</span></p>";
      }
      if (e.role) {
        rows += '<p class="up-line"><span class="up-lbl">' + esc(L.role) + "</span><span>" + esc(e.role) + "</span></p>";
      }
      return '<article class="up-item fade in">' +
               '<div class="up-date">' + esc(e.dateLabel) + "</div>" +
               (e.composer ? '<div class="up-composer">' + esc(e.composer) + "</div>" : "") +
               '<h3 class="up-title">' + esc(e.title) + "</h3>" +
               '<div class="up-meta">' + rows + "</div>" +
             "</article>";
    }).join("");

    grid.innerHTML = html;
    section.hidden = false;            // reveal only now that we have events
    section.removeAttribute("hidden");
    refit();
  }

  // Re-fit the giant heading now the section is visible (it was skipped at
  // page load while still hidden, which left it overflowing on narrow phones).
  // Must measure with SETTLED web-font metrics, so wait for fonts + two frames;
  // a single rAF fires before the display font swaps in and over-sizes the title.
  function refit() {
    if (typeof window.fitDisplays !== "function") return;
    var run = window.fitDisplays;
    requestAnimationFrame(function () { requestAnimationFrame(run); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(run);
    }
  }

  function reveal() {
    section.hidden = false;
    section.removeAttribute("hidden");
    refit();
  }

  // No upcoming shows, or Airtable unreachable.
  function showEmpty() {
    if (!EMPTY_MESSAGE) return;        // homepage: stay hidden, quietly
    grid.innerHTML = '<p class="up-empty">' +
      (isSR ? "Uskoro novi termini." : "More dates coming soon.") + "</p>";
    reveal();
  }

  /* ---------------- fetch from Airtable ---------------- */
  var url = "https://api.airtable.com/v0/" +
            encodeURIComponent(CONFIG.BASE_ID) + "/" +
            encodeURIComponent(CONFIG.TABLE) +
            "?pageSize=100";

  fetch(url, { headers: { Authorization: "Bearer " + CONFIG.TOKEN } })
    .then(function (res) {
      if (!res.ok) throw new Error("Airtable responded " + res.status);
      return res.json();
    })
    .then(function (data) {
      var today = new Date();
      today.setHours(0, 0, 0, 0);

      var events = (data.records || [])
        .map(function (rec) {
          var f = rec.fields || {};
          var d = parseDate(f.Date);
          return {
            date: d,
            dateLabel: d ? formatDate(d, (f.Time || "").trim()) : "",
            published: isPublished(f),
            title: pick(f, "Title"),
            composer: pick(f, "Composer"),
            venue: pick(f, "Venue"),
            director: pickAny(f, "Director", "Direction"),
            role: pick(f, "Role")
          };
        })
        .filter(function (e) {
          return e.published && e.date && e.title && e.date >= today;
        })
        .sort(function (a, b) { return a.date - b.date; });

      if (!events.length) { showEmpty(); return; }  // nothing upcoming
      render(events);
    })
    .catch(function (err) {
      // Unreachable / misconfigured.
      //   dedicated page → show “more dates coming soon”
      //   homepage      → leave the section hidden, quietly
      console.warn("[upcoming] Could not load shows from Airtable:", err.message);
      showEmpty();
    });
})();
