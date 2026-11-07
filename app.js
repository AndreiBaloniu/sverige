(function () {
  "use strict";
  const D = window.SV_DATA;
  const KEY = "mysig-sverige-v1";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const placeById = Object.fromEntries(D.places.map((p) => [p.id, p]));
  const CAT_ICON = { Sight: "🏰", Museum: "🖼️", Fika: "☕", Nature: "🌲", Village: "🏡", Experience: "✨" };

  // ---------- state ----------
  const defaults = { tab: "trip", day: 1, done: {}, notes: {}, favs: {}, start: "", theme: "", pack: D.packing.map((t) => ({ t, d: false })), journal: [], region: "All", cat: "All", onlyFav: false, q: "" };
  let S = Object.assign({}, defaults);
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign({}, defaults, JSON.parse(raw)); } catch (e) {}
  let saveT;
  const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }, 150); };
  let here = null; // {lat, lon} once the user asks for "near me"

  // ---------- helpers ----------
  const toast = (msg) => { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 2000); };
  const startDate = () => (S.start ? new Date(S.start + "T00:00:00") : null);
  const dateFor = (n) => { const s = startDate(); if (!s) return null; const d = new Date(s); d.setDate(d.getDate() + n - 1); return d; };
  const fmt = (d, o) => d.toLocaleDateString("en-GB", o || { weekday: "short", day: "numeric", month: "short" });
  const todayIndex = () => { const s = startDate(); if (!s) return 0; const t = new Date(); t.setHours(0, 0, 0, 0); const i = Math.round((t - s) / 864e5) + 1; return i >= 1 && i <= D.itinerary.length ? i : 0; };
  const isWinter = (d) => { const m = (d || new Date()).getMonth(); return m >= 9 || m <= 2; }; // Oct–Mar
  const km = (a, b) => { const R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lon - a.lon) * r; const x = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
  const kmTxt = (k) => (k < 1 ? Math.round(k * 1000) + " m" : k < 10 ? k.toFixed(1) + " km" : Math.round(k) + " km");
  const mapsUrl = (p) => `https://maps.apple.com/?ll=${p.lat},${p.lon}&q=${encodeURIComponent(p.name)}`;
  const dayDone = (day) => day.stops.filter((_, i) => S.done[day.day + ":" + i]).length;

  // ---------- theme ----------
  function applyTheme() {
    const h = new Date().getHours();
    const auto = (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) || h >= 18 || h < 7 ? "evening" : "day";
    const th = S.theme || auto;
    document.documentElement.dataset.theme = th;
    $("#themeBtn").textContent = th === "evening" ? "☀️" : "🕯️";
    $("#subtitle").textContent = th === "evening" ? "god kväll, light a candle" : "a cozy guide to Sweden";
  }
  $("#themeBtn").onclick = () => { S.theme = document.documentElement.dataset.theme === "evening" ? "day" : "evening"; save(); applyTheme(); };

  // ---------- tabs ----------
  function setTab(t) {
    S.tab = t; save();
    document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("on", b.dataset.tab === t));
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("on", v.id === "v-" + t));
    render[t]();
    window.scrollTo(0, 0);
  }
  document.querySelectorAll("nav button").forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));

  // ---------- sheet ----------
  function openSheet(html) { $("#sheet").innerHTML = '<div class="grab"></div>' + html; $("#sheetBg").classList.add("on"); }
  function closeSheet() { $("#sheetBg").classList.remove("on"); }
  $("#sheetBg").onclick = (e) => { if (e.target.id === "sheetBg" || e.target.closest("[data-close]")) closeSheet(); };

  function placeSheet(id) {
    const p = placeById[id]; if (!p) return;
    const dist = here ? `<span class="pill">${kmTxt(km(here, p))} away</span>` : "";
    const days = D.itinerary.filter((d) => d.stops.some((s) => s.place === id)).map((d) => "Day " + d.day);
    openSheet(`
      <div class="place"><div class="badge">${CAT_ICON[p.cat] || "📍"}</div>
        <div style="flex:1"><h2 style="font-size:24px">${esc(p.name)}</h2>
        <div class="meta"><span class="pill">${esc(p.region)}</span><span class="pill">${esc(p.cat)}</span>${dist}${days.length ? `<span class="pill red">${days.join(", ")}</span>` : ""}</div></div>
        <button class="heart ${S.favs[id] ? "on" : ""}" data-fav="${id}" aria-label="Favourite">${S.favs[id] ? "♥" : "♡"}</button></div>
      <p class="serif" style="font-size:18px;margin:12px 0">${esc(p.blurb)}</p>
      <div class="tip"><div class="ic">💡</div><div><b>Local tip</b>${esc(p.tip)}</div></div>
      <div class="row" style="margin-top:18px"><a class="btn" style="flex:1;text-align:center;text-decoration:none" href="${mapsUrl(p)}" target="_blank" rel="noopener">Open in Maps</a><button class="btn ghost" data-close>Close</button></div>
      <p class="muted" style="font-size:12px;margin-top:10px">Maps works offline if you've downloaded Sweden in Apple Maps.</p>`);
  }
  document.addEventListener("click", (e) => {
    const f = e.target.closest("[data-fav]");
    if (f) { const id = f.dataset.fav; S.favs[id] = !S.favs[id]; if (!S.favs[id]) delete S.favs[id]; save(); f.classList.toggle("on", !!S.favs[id]); f.textContent = S.favs[id] ? "♥" : "♡"; if (S.tab === "explore" && (S.onlyFav || f.closest(".sheet"))) render.explore(); else if (S.tab === "explore") { const c = $("#favF"); if (c) c.textContent = "♥ Saved (" + Object.keys(S.favs).length + ")"; } return; }
    const pl = e.target.closest("[data-place]");
    if (pl) placeSheet(pl.dataset.place);
  });

  // ---------- render: trip ----------
  const render = {};
  render.trip = function () {
    const ti = todayIndex();
    const day = D.itinerary.find((d) => d.day === S.day) || D.itinerary[0];
    const dDate = dateFor(day.day);
    const winter = isWinter(dDate || undefined);
    const n = dayDone(day), pct = Math.round((n / day.stops.length) * 100);
    const totalStops = D.itinerary.reduce((a, d) => a + d.stops.length, 0);
    const totalDone = D.itinerary.reduce((a, d) => a + dayDone(d), 0);

    const strip = D.itinerary.map((d) => {
      const dd = dateFor(d.day);
      const cls = ["dchip", d.day === day.day ? "on" : "", dayDone(d) === d.stops.length ? "done" : "", ti === d.day ? "today" : ""].join(" ");
      return `<button class="${cls}" data-day="${d.day}"><span>${dd ? fmt(dd, { weekday: "short" }) : "Day"}</span><b>${dd ? dd.getDate() : d.day}</b><span>${esc(d.region.split(" ")[0])}</span></button>`;
    }).join("");

    const stops = day.stops.map((s, i) => {
      const k = day.day + ":" + i, on = !!S.done[k];
      return `<div class="stop ${on ? "done" : ""}"><button class="chk ${on ? "on" : ""}" data-stop="${k}" aria-label="Mark done">${on ? "✓" : ""}</button>
        <div><div class="time">${esc(s.t)}</div><h3>${esc(s.name)}</h3><p>${esc(s.blurb)}</p>${s.place ? `<button class="linkbtn" data-place="${s.place}">Details & map →</button>` : ""}</div></div>`;
    }).join("");

    $("#v-trip").innerHTML = `
      ${!S.start ? `<div class="card" style="display:flex;gap:12px;align-items:center"><div style="font-size:26px">🗓️</div><div style="flex:1"><b class="serif" style="font-size:17px">When do you arrive?</b><div class="muted" style="font-size:14px">Set your start date to see real dates and today's plan.</div></div><button class="btn" id="setDate">Set</button></div>` : ""}
      <div class="daystrip" id="strip">${strip}</div>
      <div class="card dayhead">
        <div class="eyebrow">Day ${day.day} · ${esc(day.region)}${dDate ? " · " + fmt(dDate, { weekday: "long", day: "numeric", month: "long" }) : ""}${ti === day.day ? " · <span style='color:var(--amber)'>today</span>" : ""}</div>
        <h2>${esc(day.title)}</h2>
        <p class="serif muted" style="font-style:italic;margin:0 0 8px">${esc(day.sw)}</p>
        <p style="margin:0">${esc(day.summary)}</p>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <div class="muted" style="font-size:12px">${n} of ${day.stops.length} done · whole trip ${totalDone}/${totalStops}</div>
      </div>
      <div class="card"><div class="tl">${stops}</div></div>
      <div class="card tips">
        <div class="tip"><div class="ic">☕</div><div><b>Fika stop</b>${esc(day.fika)}</div></div>
        <div class="tip"><div class="ic">🕯️</div><div><b>Cozy moment</b>${esc(day.cozy)}</div></div>
        <div class="tip"><div class="ic">🚆</div><div><b>Getting around</b>${esc(day.transport)}</div></div>
        <div class="tip"><div class="ic">${winter ? "❄️" : "🌿"}</div><div><b>${winter ? "Winter" : "Summer"} note</b>${esc(winter ? day.winter : day.summer)}</div></div>
        <div class="tip"><div class="ic">${winter ? "🌿" : "❄️"}</div><div class="muted" style="font-size:14px"><b>${winter ? "In summer" : "In winter"}</b>${esc(winter ? day.summer : day.winter)}</div></div>
      </div>
      <div class="card"><div class="eyebrow" style="margin-bottom:8px">My notes for day ${day.day}</div>
        <textarea id="dayNote" placeholder="Bookings, a café someone recommended, what you want to remember…">${esc(S.notes[day.day] || "")}</textarea></div>
      <div class="row" style="margin-bottom:22px">
        <button class="btn ghost" style="flex:1" id="prevDay" ${day.day === 1 ? "disabled" : ""}>← Day ${day.day - 1 || ""}</button>
        <button class="btn ghost" style="flex:1" id="nextDay" ${day.day === D.itinerary.length ? "disabled" : ""}>Day ${day.day < D.itinerary.length ? day.day + 1 : ""} →</button>
      </div>
      <h2 style="font-size:22px;margin:4px 4px 10px">Add-on journeys</h2>
      ${D.extensions.map((x) => `<div class="card ext"><h3 style="font-size:19px">${esc(x.name)}</h3><p class="muted" style="margin:6px 0 8px;font-size:15px">${esc(x.blurb)}</p><div class="meta" style="display:flex;gap:6px;flex-wrap:wrap">${x.places.map((id) => `<button class="pill" data-place="${id}">${esc(placeById[id].name)}</button>`).join("")}</div></div>`).join("")}
    `;
    $("#strip").onclick = (e) => { const b = e.target.closest("[data-day]"); if (b) { S.day = +b.dataset.day; save(); render.trip(); } };
    const active = $("#strip .on"); if (active) active.scrollIntoView({ inline: "center", block: "nearest" });
    $("#v-trip").querySelectorAll("[data-stop]").forEach((b) => (b.onclick = () => { const k = b.dataset.stop; S.done[k] = !S.done[k]; if (!S.done[k]) delete S.done[k]; else if (navigator.vibrate) navigator.vibrate(8); save(); const y = window.scrollY; render.trip(); window.scrollTo(0, y); }));
    $("#dayNote").oninput = (e) => { S.notes[day.day] = e.target.value; save(); };
    const go = (d) => { S.day = d; save(); render.trip(); window.scrollTo(0, 0); };
    $("#prevDay").onclick = () => day.day > 1 && go(day.day - 1);
    $("#nextDay").onclick = () => day.day < D.itinerary.length && go(day.day + 1);
    const sd = $("#setDate"); if (sd) sd.onclick = () => { setTab("notes"); setTimeout(() => $("#startInput") && $("#startInput").focus(), 50); };
  };

  // ---------- render: explore ----------
  render.explore = function () {
    const q = S.q.trim().toLowerCase();
    let list = D.places.filter((p) =>
      (S.region === "All" || p.region === S.region) &&
      (S.cat === "All" || p.cat === S.cat) &&
      (!S.onlyFav || S.favs[p.id]) &&
      (!q || (p.name + " " + p.blurb + " " + p.region + " " + p.cat).toLowerCase().includes(q)));
    if (here) list = list.slice().sort((a, b) => km(here, a) - km(here, b));
    const favCount = Object.keys(S.favs).length;
    const chips = (arr, cur, key) => ["All"].concat(arr).map((v) => `<button class="fbtn ${cur === v ? "on" : ""}" data-${key}="${esc(v)}">${key === "cat" && v !== "All" ? CAT_ICON[v] + " " : ""}${esc(v)}</button>`).join("");

    $("#v-explore").innerHTML = `
      <div class="row"><input type="search" id="q" placeholder="Search castles, cafés, islands…" value="${esc(S.q)}"><button class="btn ghost" id="near" aria-label="Sort by distance" style="white-space:nowrap">${here ? "📍 Near" : "📍"}</button></div>
      <div class="filters">${chips(D.regions, S.region, "region")}</div>
      <div class="filters">${chips(D.categories, S.cat, "cat")}<button class="fbtn ${S.onlyFav ? "on" : ""}" id="favF">♥ Saved (${favCount})</button></div>
      <div class="muted" style="font-size:13px;margin:4px 4px 10px">${list.length} place${list.length === 1 ? "" : "s"}${here ? " · sorted by distance from you" : ""}</div>
      ${list.length ? list.map((p) => `
        <div class="card place"><div class="badge">${CAT_ICON[p.cat] || "📍"}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:flex-start"><h3 style="flex:1">${esc(p.name)}</h3><button class="heart ${S.favs[p.id] ? "on" : ""}" data-fav="${p.id}" aria-label="Favourite">${S.favs[p.id] ? "♥" : "♡"}</button></div>
            <div class="meta"><span class="pill">${esc(p.region)}</span>${here ? `<span class="pill">${kmTxt(km(here, p))}</span>` : ""}</div>
            <p>${esc(p.blurb)}</p>
            <div class="actions"><button class="linkbtn" data-place="${p.id}">Details</button><a class="linkbtn" style="text-decoration:none" href="${mapsUrl(p)}" target="_blank" rel="noopener">Open in Maps</a></div>
          </div></div>`).join("") : `<div class="empty">Nothing here yet. Try another filter.</div>`}
    `;
    const v = $("#v-explore");
    const q$ = $("#q"); q$.oninput = () => { S.q = q$.value; save(); clearTimeout(q$._t); q$._t = setTimeout(() => { const pos = q$.selectionStart; render.explore(); const n = $("#q"); n.focus(); n.setSelectionRange(pos, pos); }, 250); };
    v.querySelectorAll("[data-region]").forEach((b) => (b.onclick = () => { S.region = b.dataset.region; save(); render.explore(); }));
    v.querySelectorAll("[data-cat]").forEach((b) => (b.onclick = () => { S.cat = b.dataset.cat; save(); render.explore(); }));
    $("#favF").onclick = () => { S.onlyFav = !S.onlyFav; save(); render.explore(); };
    $("#near").onclick = () => {
      if (here) { here = null; render.explore(); return; }
      if (!navigator.geolocation) return toast("Location isn't available here");
      toast("Finding you… (GPS works offline)");
      navigator.geolocation.getCurrentPosition(
        (p) => { here = { lat: p.coords.latitude, lon: p.coords.longitude }; render.explore(); },
        () => toast("Couldn't get your location"),
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
    };
  };

  // ---------- render: cozy ----------
  render.cozy = function () {
    const dayNum = Math.floor(Date.now() / 864e5);
    const word = D.words[dayNum % D.words.length];
    $("#v-cozy").innerHTML = `
      <div class="card" style="background:linear-gradient(160deg,var(--card),var(--card2))">
        <div class="eyebrow">Word of the day</div>
        <h2 style="font-size:32px;margin:4px 0;color:var(--red)">${esc(word.w)}</h2>
        <p class="bigquote" style="margin:0">${esc(word.d)}</p>
      </div>
      <h2 style="font-size:22px;margin:18px 4px 10px">What to order at fika</h2>
      <div class="grid2" style="margin-bottom:14px">${D.fika.map((f) => `<div class="mini"><h3>${esc(f.name)}</h3><div class="say">${esc(f.sw)}</div><p>${esc(f.note)}</p></div>`).join("")}</div>
      <div class="card"><div class="eyebrow" style="margin-bottom:6px">Fika etiquette</div>
        <p style="margin:0 0 6px">Fika is a pause, not a takeaway. Sit down, put the phone away, and stay a while.</p>
        <p class="muted" style="margin:0;font-size:15px">Filter coffee (bryggkaffe) often comes with a free refill (påtår). Many workplaces stop for fika mid-morning and mid-afternoon.</p></div>
      <h2 style="font-size:22px;margin:18px 4px 10px">Little phrases</h2>
      <div class="card">${D.phrases.map((p) => `<div class="phrase"><div><b>${esc(p.sv)}</b><i>${esc(p.say)}</i></div><span>${esc(p.en)}</span></div>`).join("")}</div>
      <h2 style="font-size:22px;margin:18px 4px 10px">Cozy words</h2>
      <div class="card">${D.words.map((w) => `<div class="phrase"><b>${esc(w.w)}</b><span>${esc(w.d)}</span></div>`).join("")}</div>
      <h2 style="font-size:22px;margin:18px 4px 10px">Through the Swedish year</h2>
      <div class="card">${D.traditions.map((t) => `<div class="trad"><b>${esc(t.when)}</b><span>${esc(t.what)}</span></div>`).join("")}</div>
    `;
  };

  // ---------- render: notes ----------
  render.notes = function () {
    const done = S.pack.filter((p) => p.d).length;
    $("#v-notes").innerHTML = `
      <div class="card"><div class="eyebrow" style="margin-bottom:8px">Trip start date</div>
        <input type="date" id="startInput" value="${esc(S.start)}">
        <p class="muted" style="font-size:13px;margin:8px 0 0">Day 1 of the itinerary falls on this date. Leave empty if you haven't booked yet.</p></div>

      <div class="card"><div class="eyebrow" style="margin-bottom:8px">Travel journal</div>
        <textarea id="jText" placeholder="Today I…"></textarea>
        <div class="row" style="margin-top:8px"><button class="btn" id="jAdd" style="flex:1">Save entry</button></div>
        ${S.journal.length ? S.journal.slice().reverse().map((j, i) => `<div class="entry"><div style="display:flex"><span class="when" style="flex:1">${esc(fmt(new Date(j.at), { weekday: "long", day: "numeric", month: "long" }))}</span><button class="linkbtn" data-jdel="${S.journal.length - 1 - i}" style="padding:0;color:var(--ink2)">Delete</button></div><p>${esc(j.text)}</p></div>`).join("") : `<div class="empty">Your first entry will appear here.</div>`}
      </div>

      <div class="card"><div style="display:flex;align-items:baseline"><div class="eyebrow" style="flex:1">Packing list</div><span class="muted" style="font-size:13px">${done}/${S.pack.length}</span></div>
        ${S.pack.map((p, i) => `<div class="packitem ${p.d ? "done" : ""}"><button class="chk ${p.d ? "on" : ""}" data-pack="${i}">${p.d ? "✓" : ""}</button><span>${esc(p.t)}</span><button class="x" data-pdel="${i}" aria-label="Remove">×</button></div>`).join("")}
        <div class="row" style="margin-top:10px"><input type="text" id="packNew" placeholder="Add an item"><button class="btn" id="packAdd">Add</button></div></div>

      <h2 style="font-size:22px;margin:18px 4px 10px">Good to know</h2>
      <div class="card tips">${D.practical.map((p) => `<div class="tip"><div class="ic">•</div><div><b>${esc(p.h)}</b>${esc(p.d)}</div></div>`).join("")}</div>

      <div class="card"><div class="eyebrow" style="margin-bottom:8px">Backup</div>
        <p class="muted" style="font-size:14px;margin:0 0 10px">Your ticks, notes and journal are stored only on this phone. Copy a backup now and then and paste it into your Notes app.</p>
        <div class="row"><button class="btn ghost" style="flex:1" id="bkCopy">Copy backup</button><button class="btn ghost" style="flex:1" id="bkRestore">Restore…</button></div></div>
      <p class="muted" style="text-align:center;font-size:12px;margin:18px 0">Opening hours and timetables change by season. Double-check the day before.</p>
    `;
    $("#startInput").onchange = (e) => { S.start = e.target.value; const t = todayIndex(); if (t) S.day = t; save(); toast(S.start ? "Dates set ✓" : "Dates cleared"); };
    $("#jAdd").onclick = () => { const t = $("#jText").value.trim(); if (!t) return; S.journal.push({ at: Date.now(), text: t }); save(); render.notes(); toast("Saved to your journal"); };
    $("#v-notes").querySelectorAll("[data-jdel]").forEach((b) => (b.onclick = () => {
      openSheet(`<h2 style="font-size:22px">Delete this entry?</h2><p class="muted">This can't be undone.</p><div class="row"><button class="btn" id="cfDel" style="flex:1">Delete</button><button class="btn ghost" style="flex:1" data-close>Keep</button></div>`);
      $("#cfDel").onclick = () => { S.journal.splice(+b.dataset.jdel, 1); save(); closeSheet(); render.notes(); };
    }));
    $("#v-notes").querySelectorAll("[data-pack]").forEach((b) => (b.onclick = () => { const p = S.pack[+b.dataset.pack]; p.d = !p.d; save(); render.notes(); }));
    $("#v-notes").querySelectorAll("[data-pdel]").forEach((b) => (b.onclick = () => { S.pack.splice(+b.dataset.pdel, 1); save(); render.notes(); }));
    const addPack = () => { const t = $("#packNew").value.trim(); if (!t) return; S.pack.push({ t, d: false }); save(); render.notes(); };
    $("#packAdd").onclick = addPack; $("#packNew").onkeydown = (e) => e.key === "Enter" && addPack();
    $("#bkCopy").onclick = async () => { try { await navigator.clipboard.writeText(JSON.stringify(S)); toast("Backup copied ✓"); } catch (e) { openSheet(`<h2 style="font-size:20px">Copy this text</h2><textarea style="min-height:200px;font-family:monospace;font-size:12px" readonly>${esc(JSON.stringify(S))}</textarea><button class="btn ghost" data-close style="width:100%;margin-top:10px">Done</button>`); } };
    $("#bkRestore").onclick = () => {
      openSheet(`<h2 style="font-size:20px">Restore a backup</h2><p class="muted">Paste the text you copied earlier. This replaces what's on this phone.</p><textarea id="bkIn" style="min-height:160px;font-family:monospace;font-size:12px"></textarea><div class="row" style="margin-top:10px"><button class="btn" id="bkGo" style="flex:1">Restore</button><button class="btn ghost" data-close style="flex:1">Cancel</button></div>`);
      $("#bkGo").onclick = () => { try { const o = JSON.parse($("#bkIn").value); if (typeof o !== "object" || !o) throw 0; S = Object.assign({}, defaults, o); save(); closeSheet(); applyTheme(); setTab("notes"); toast("Restored ✓"); } catch (e) { toast("That doesn't look like a backup"); } };
    };
  };

  // ---------- offline ----------
  function offline(ok, msg) { $("#offDot").classList.toggle("ok", ok); $("#offTxt").textContent = msg; }
  function setupOffline() {
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    if (!("serviceWorker" in navigator)) return offline(false, "Preview mode: add to Home Screen from the hosted app for offline use");
    navigator.serviceWorker.register("sw.js").then((reg) => {
      const ready = () => offline(true, standalone ? "Saved on this iPhone · works offline" : "Saved for offline · tap Share → Add to Home Screen");
      if (reg.active) ready();
      navigator.serviceWorker.ready.then(ready);
    }).catch(() => offline(false, "Preview mode: offline works once installed from the hosted app"));
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  }

  // ---------- boot ----------
  applyTheme();
  const t = todayIndex(); if (t && !sessionStorageSafe()) S.day = t;
  function sessionStorageSafe() { try { const k = "sv-seen"; const seen = sessionStorage.getItem(k); sessionStorage.setItem(k, "1"); return !!seen; } catch (e) { return true; } }
  setTab(S.tab || "trip");
  setupOffline();
})();
