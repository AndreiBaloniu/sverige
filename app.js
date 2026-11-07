(function () {
  "use strict";
  const D = window.SV_DATA;
  const KEY = "sverige-v2";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // ---------- icons ----------
  const P = {
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.2 6.2C3.6 8 2 12 2 12s3.6 7 10 7a9.7 9.7 0 0 0 4.4-1"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    nav: '<path d="M3 11 21 3l-8 18-2-8z"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'
  };
  const I = (n, cls = "") => `<svg class="i ${cls}" viewBox="0 0 24 24"${n === "bookmark-fill" ? ' style="fill:currentColor"' : ""}>${P[n === "bookmark-fill" ? "bookmark" : n]}</svg>`;

  // ---------- state ----------
  const defaults = {
    tab: "plan", trip: [], done: {}, hidden: {}, notes: {}, favs: {}, start: "",
    customStops: {}, customPlaces: [], customDays: [],
    pack: D.packing.map((t) => ({ t, d: false })), journal: [],
    q: "", region: "All", cat: "All", onlyFav: false, guide: "essentials", mapFilter: "all"
  };
  let S = Object.assign({}, defaults);
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign({}, defaults, JSON.parse(raw)); } catch (e) {}
  let saveT;
  const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }, 120); };

  let route = { day: null };
  let editMode = false;
  let here = null;

  // ---------- data helpers ----------
  const REGION_COLOR = { Stockholm: "blue", Archipelago: "sage", Uppsala: "lav", Dalarna: "peach", Gothenburg: "butter", "West Coast": "pink", Lapland: "blue", Gotland: "pink", "Skåne": "butter", "Småland": "sage", North: "lav" };
  const rc = (region) => REGION_COLOR[region] || "soft";
  const rcStyle = (region) => { const c = rc(region); return c === "soft" ? "background:var(--soft);color:var(--ink2)" : `background:var(--${c});color:var(--${c}-t)`; };

  const builtinDays = D.itinerary.map((d) => ({
    id: "d" + d.day, builtin: true, num: d.day, title: d.title, region: d.region, sw: d.sw, summary: d.summary,
    stops: d.stops.map((s, i) => Object.assign({ id: "b" + i, builtin: true }, s)),
    info: { "Fika": d.fika, "Cozy moment": d.cozy, "Getting around": d.transport, "Winter": d.winter, "Summer": d.summer }
  }));
  const allDays = () => builtinDays.concat(S.customDays.map((c) => ({ id: c.id, builtin: false, title: c.title, region: c.region || "Other", summary: c.summary || "", stops: [], info: {} })));
  const dayById = (id) => allDays().find((d) => d.id === id);
  const stopsFor = (day, includeHidden) => day.stops.concat(S.customStops[day.id] || [])
    .filter((s) => includeHidden || !S.hidden[day.id + ":" + s.id]);
  const allPlaces = () => D.places.concat(S.customPlaces);
  const placeById = (id) => allPlaces().find((p) => p.id === id);
  const regionsAll = () => Array.from(new Set(D.regions.concat(S.customPlaces.map((p) => p.region)).concat(["Other"])));

  const inTrip = (id) => S.trip.includes(id);
  const startDate = () => (S.start ? new Date(S.start + "T00:00:00") : null);
  const dateFor = (id) => { const s = startDate(), i = S.trip.indexOf(id); if (!s || i < 0) return null; const d = new Date(s); d.setDate(d.getDate() + i); return d; };
  const fmt = (d, o) => d.toLocaleDateString("en-GB", o || { weekday: "short", day: "numeric", month: "short" });
  const isToday = (d) => d && new Date().toDateString() === d.toDateString();
  const isWinter = (d) => { const m = (d || new Date()).getMonth(); return m >= 9 || m <= 2; };
  const doneCount = (day) => { const st = stopsFor(day); return [st.filter((s) => S.done[day.id + ":" + s.id]).length, st.length]; };
  const km = (a, b) => { const R = 6371, r = Math.PI / 180, dLa = (b.lat - a.lat) * r, dLo = (b.lon - a.lon) * r; const x = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
  const kmTxt = (k) => (k < 1 ? Math.round(k * 1000) + " m" : k < 10 ? k.toFixed(1) + " km" : Math.round(k) + " km");
  const hasGeo = (p) => typeof p.lat === "number" && typeof p.lon === "number";
  const mapsUrl = (p) => hasGeo(p) ? `https://maps.apple.com/?ll=${p.lat},${p.lon}&q=${encodeURIComponent(p.name)}` : `https://maps.apple.com/?q=${encodeURIComponent(p.name + ", Sweden")}`;

  // ---------- ui helpers ----------
  const toast = (msg) => { const t = $("#toast"); t.textContent = msg; t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 1800); };
  function openSheet(html, after) { $("#sheet").innerHTML = '<div class="grab"></div>' + html; $("#sheetBg").classList.add("on"); $("#sheet").scrollTop = 0; if (after) after($("#sheet")); }
  function closeSheet() { $("#sheetBg").classList.remove("on"); }
  $("#sheetBg").addEventListener("click", (e) => { if (e.target.id === "sheetBg" || e.target.closest("[data-close]")) closeSheet(); });
  function confirmSheet(title, body, yes, onYes) {
    openSheet(`<h2>${esc(title)}</h2><p class="muted">${esc(body)}</p><div class="btnrow" style="margin-top:14px"><button class="btn plain" data-close>Cancel</button><button class="btn" id="cfYes" style="background:var(--danger)">${esc(yes)}</button></div>`,
      (s) => { $("#cfYes", s).onclick = () => { closeSheet(); onYes(); }; });
  }
  const hl = (text, q) => { const t = esc(text); if (!q) return t; const re = new RegExp("(" + esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"); return t.replace(re, "<mark>$1</mark>"); };
  const catTag = (c) => `<span class="tag c-${esc(c)}">${esc(c)}</span>`;
  const swatchFor = (p) => `<div class="swatch c-${p.custom ? "Mine" : esc(p.cat)}">${esc((p.cat || "?").charAt(0))}</div>`;

  window.addEventListener("scroll", () => $("#hdr").classList.toggle("scrolled", window.scrollY > 4), { passive: true });

  // ---------- navigation ----------
  const TITLES = { plan: "Plan", map: "Map", places: "Places", guide: "Guide", mine: "My trip" };
  function go(tab, opts = {}) {
    if (tab) S.tab = tab;
    route = { day: opts.day || null };
    if (!opts.keepEdit) editMode = false;
    save(); draw();
    if (!opts.keepScroll) window.scrollTo(0, 0);
  }
  $$("nav button").forEach((b) => (b.onclick = () => go(b.dataset.tab)));
  $("#backBtn").onclick = () => go(S.tab);
  function draw() {
    $$("nav button").forEach((b) => b.classList.toggle("on", b.dataset.tab === S.tab));
    const sub = !!route.day;
    $("#backBtn").classList.toggle("on", sub);
    $("#backTxt").textContent = TITLES[S.tab];
    $("#title").textContent = sub ? "" : TITLES[S.tab];
    const m = $("#main");
    if (S.tab === "map") { m.innerHTML = ""; m.style.display = "none"; renderMap(); return; }
    m.style.display = ""; $("#mapWrap").hidden = true;
    m.innerHTML = '<div class="view"></div>';
    const v = m.firstChild;
    if (S.tab === "plan" && route.day) renderDay(v, route.day);
    else ({ plan: renderPlan, places: renderPlaces, guide: renderGuide, mine: renderMine })[S.tab](v);
  }
  const redraw = () => { const y = window.scrollY; draw(); window.scrollTo(0, y); };

  // ---------- PLAN ----------
  function dayRow(day, opts = {}) {
    const [n, t] = doneCount(day);
    const d = dateFor(day.id);
    const idx = S.trip.indexOf(day.id);
    const badge = d ? `<b>${d.getDate()}</b><span>${fmt(d, { month: "short" })}</span>` : idx >= 0 ? `<b>${idx + 1}</b><span>day</span>` : day.builtin ? `<b>${day.num}</b><span>idea</span>` : `<b>+</b><span>mine</span>`;
    const sub = [day.region, d ? fmt(d, { weekday: "long" }) + (isToday(d) ? " (today)" : "") : "", t ? `${n}/${t} done` : ""].filter(Boolean).join(" · ");
    return `<div style="display:flex;align-items:center;border-bottom:1px solid var(--line)">
      ${opts.order ? `<div class="order" style="padding-left:10px"><button data-mv="${day.id}" data-dir="-1" ${idx === 0 ? "disabled" : ""} aria-label="Move up">${I("up", "sm")}</button><button data-mv="${day.id}" data-dir="1" ${idx === S.trip.length - 1 ? "disabled" : ""} aria-label="Move down">${I("down", "sm")}</button></div>` : ""}
      <button class="row" data-open="${day.id}" style="border:0;${opts.order ? "padding-left:8px" : ""}">
        <div class="daynum" style="${rcStyle(day.region)}">${badge}</div>
        <div class="main"><div class="t">${esc(day.title)}</div><div class="s">${esc(sub)}</div>${opts.order && t ? `<div class="bar"><i style="width:${Math.round((n / t) * 100)}%"></i></div>` : ""}</div>
        ${opts.add ? "" : `<span class="chev">${I("right", "sm")}</span>`}
      </button>
      ${opts.add ? `<button class="iconbtn" style="margin-right:12px;background:var(--accent-bg);color:var(--accent)" data-addtrip="${day.id}" aria-label="Add to trip">${I("plus", "sm")}</button>` : ""}
    </div>`;
  }

  function renderPlan(v) {
    const trip = S.trip.map(dayById).filter(Boolean);
    const others = allDays().filter((d) => !inTrip(d.id));
    const s = startDate();
    const range = s && trip.length ? `${fmt(s, { day: "numeric", month: "short" })} – ${fmt(dateFor(trip[trip.length - 1].id), { day: "numeric", month: "short" })}` : "";
    const today = trip.find((d) => isToday(dateFor(d.id)));
    v.innerHTML = `
      ${today ? `<button class="hint" data-open="${today.id}" style="width:100%;border:0;text-align:left"><div style="flex:1"><b>Today</b><br>${esc(today.title)}</div>${I("right")}</button>` : ""}
      ${!trip.length ? `<div class="hint"><div>Pick the days you want: tap <b>+</b> next to a day, or open it and choose <b>Add to our trip</b>. You can also create your own days.</div></div>` : ""}
      <div class="section-t"><span class="grow">Our trip${trip.length ? ` · ${trip.length} day${trip.length > 1 ? "s" : ""}` : ""}</span>${range ? `<span style="text-transform:none;letter-spacing:0">${range}</span>` : `<button class="textbtn" id="setDates">Set dates</button>`}</div>
      ${trip.length ? `<div class="list">${trip.map((d) => dayRow(d, { order: true })).join("")}</div>` : `<div class="card empty">No days added yet</div>`}
      <div class="section-t"><span class="grow">Day ideas</span><button class="textbtn" id="newDay">${I("plus", "sm")}New day</button></div>
      <div class="list">${others.length ? others.map((d) => dayRow(d, { add: true })).join("") : `<div class="empty">Every day is in your trip</div>`}</div>
      <div class="section-t">Longer add-ons</div>
      <div class="list">${D.extensions.map((x) => `<button class="row" data-ext="${x.id}"><div class="main"><div class="t">${esc(x.name)}</div><div class="s">${esc(x.blurb)}</div></div><span class="chev">${I("right", "sm")}</span></button>`).join("")}</div>`;
    $$("[data-open]", v).forEach((b) => (b.onclick = () => go("plan", { day: b.dataset.open })));
    $$("[data-addtrip]", v).forEach((b) => (b.onclick = () => { S.trip.push(b.dataset.addtrip); save(); redraw(); toast("Added to your trip"); }));
    $$("[data-mv]", v).forEach((b) => (b.onclick = () => { const i = S.trip.indexOf(b.dataset.mv), j = i + +b.dataset.dir; if (j < 0 || j >= S.trip.length) return; [S.trip[i], S.trip[j]] = [S.trip[j], S.trip[i]]; save(); redraw(); }));
    $$("[data-ext]", v).forEach((b) => (b.onclick = () => extSheet(b.dataset.ext)));
    const sd = $("#setDates", v); if (sd) sd.onclick = () => go("mine");
    $("#newDay", v).onclick = () => dayForm();
  }

  function extSheet(id) {
    const x = D.extensions.find((e) => e.id === id);
    openSheet(`<h2>${esc(x.name)}</h2><p class="muted" style="margin:4px 0 12px">${esc(x.blurb)}</p>
      <div class="list">${x.places.map((pid) => { const p = placeById(pid); return `<button class="row" data-place="${pid}">${swatchFor(p)}<div class="main"><div class="t">${esc(p.name)}</div><div class="s">${esc(p.blurb)}</div></div></button>`; }).join("")}</div>
      <button class="btn plain full" data-close>Close</button>`);
  }

  function renderDay(v, id) {
    const day = dayById(id);
    if (!day) return go("plan");
    const d = dateFor(id), idx = S.trip.indexOf(id);
    const stops = stopsFor(day, editMode);
    const [n, t] = doneCount(day);
    const winter = isWinter(d || undefined);
    const now = winter ? "Winter" : "Summer", other = winter ? "Summer" : "Winter";
    const orderInfo = [["Fika", day.info["Fika"]], ["Cozy moment", day.info["Cozy moment"]], ["Getting around", day.info["Getting around"]], [now, day.info[now]], ["In " + other.toLowerCase(), day.info[other]]].filter(([, val]) => val);
    const eyebrow = idx >= 0 ? `Day ${idx + 1} of your trip${d ? " · " + fmt(d, { weekday: "long", day: "numeric", month: "long" }) : ""}` : `Day idea · ${day.region}`;

    v.innerHTML = `
      <div class="hero" style="${rcStyle(day.region)}">
        <div class="eyebrow">${esc(eyebrow)}</div>
        <h2>${esc(day.title)}</h2>
        ${day.summary ? `<p>${esc(day.summary)}</p>` : ""}
        ${t ? `<div class="small" style="margin-top:10px;opacity:.85">${n} of ${t} done</div>` : ""}
      </div>
      <div class="btnrow" style="margin-bottom:6px">
        ${idx >= 0 ? `<button class="btn plain" id="tripToggle">Remove from trip</button>` : `<button class="btn" id="tripToggle">${I("plus", "sm")}Add to our trip</button>`}
        <button class="btn ${editMode ? "" : "soft"}" id="editToggle">${editMode ? "Done editing" : "Edit day"}</button>
      </div>
      <div class="section-t"><span class="grow">Schedule</span>${stops.some((x) => x.place && placeById(x.place) && hasGeo(placeById(x.place))) ? `<button class="textbtn" id="dayMap" style="margin-right:12px">${I("map", "sm")}Map</button>` : ""}<button class="textbtn" id="addStop">${I("plus", "sm")}Add stop</button></div>
      <div class="list">${stops.length ? stops.map((s) => stopRow(day, s)).join("") : `<div class="empty">No stops yet. Add your first one.</div>`}</div>
      ${editMode ? `<p class="muted small" style="margin:0 4px">Hide suggestions you don't want; edit or delete the stops you added.</p>` : ""}
      ${orderInfo.length ? `<div class="section-t">Good to know</div><div class="card"><dl class="kv" style="margin:0">${orderInfo.map(([k, val]) => `<dt>${esc(k)}</dt><dd>${esc(val)}</dd>`).join("")}</dl></div>` : ""}
      <div class="section-t">Notes</div>
      <textarea id="dayNote" placeholder="Bookings, opening times, ideas...">${esc(S.notes[id] || "")}</textarea>
      ${!day.builtin && editMode ? `<div class="btnrow" style="margin-top:16px"><button class="btn plain" id="renameDay">Rename day</button><button class="btn danger" id="delDay">${I("trash", "sm")}Delete day</button></div>` : ""}`;

    $("#tripToggle", v).onclick = () => { if (idx >= 0) S.trip.splice(idx, 1); else S.trip.push(id); save(); redraw(); toast(idx >= 0 ? "Removed from your trip" : "Added to your trip"); };
    $("#editToggle", v).onclick = () => { editMode = !editMode; redraw(); };
    $("#addStop", v).onclick = () => stopForm(day);
    const dm = $("#dayMap", v); if (dm) dm.onclick = () => showOnMap(stopsFor(day).map((x) => x.place).filter(Boolean));
    $("#dayNote", v).oninput = (e) => { S.notes[id] = e.target.value; save(); };
    $$("[data-chk]", v).forEach((b) => (b.onclick = () => { const k = b.dataset.chk; S.done[k] = !S.done[k]; if (!S.done[k]) delete S.done[k]; save(); redraw(); }));
    $$("[data-hide]", v).forEach((b) => (b.onclick = () => { const k = b.dataset.hide; S.hidden[k] = !S.hidden[k]; if (!S.hidden[k]) delete S.hidden[k]; save(); redraw(); }));
    $$("[data-editstop]", v).forEach((b) => (b.onclick = () => stopForm(day, (S.customStops[id] || []).find((s) => s.id === b.dataset.editstop))));
    $$("[data-place]", v).forEach((b) => (b.onclick = () => placeSheet(b.dataset.place)));
    const rn = $("#renameDay", v); if (rn) rn.onclick = () => dayForm(S.customDays.find((c) => c.id === id));
    const dl = $("#delDay", v); if (dl) dl.onclick = () => confirmSheet("Delete this day?", "Its stops and notes will be removed.", "Delete", () => {
      S.customDays = S.customDays.filter((c) => c.id !== id); S.trip = S.trip.filter((x) => x !== id); delete S.customStops[id]; delete S.notes[id]; save(); go("plan"); toast("Day deleted");
    });
  }

  function stopRow(day, s) {
    const k = day.id + ":" + s.id, on = !!S.done[k], hid = !!S.hidden[k];
    const p = s.place ? placeById(s.place) : null;
    let ctl = "";
    if (editMode) ctl = s.builtin
      ? `<button class="btn plain sm" data-hide="${k}">${hid ? I("eye", "sm") + "Show" : I("eyeoff", "sm") + "Hide"}</button>`
      : `<button class="btn soft sm" data-editstop="${s.id}">${I("edit", "sm")}Edit</button>`;
    return `<div class="stop ${on ? "done" : ""} ${hid ? "hidden" : ""}">
      ${editMode ? "" : `<button class="chk ${on ? "on" : ""}" data-chk="${k}" aria-label="Mark done">${on ? I("check", "sm") : ""}</button>`}
      <div style="flex:1;min-width:0">
        ${s.t ? `<div class="time">${esc(s.t)}${s.builtin ? "" : ' · <span style="color:var(--ink2)">added by you</span>'}</div>` : s.builtin ? "" : '<div class="time" style="color:var(--ink2)">added by you</div>'}
        <div class="t">${esc(s.name)}</div>
        ${s.blurb ? `<div class="d">${esc(s.blurb)}</div>` : ""}
        ${p && !editMode ? `<button class="textbtn small" data-place="${p.id}">${I("pin", "sm")}${esc(p.name)}</button>` : ""}
      </div>${ctl}</div>`;
  }

  function placeOptions(sel) {
    return `<option value="">None</option>` + allPlaces().slice().sort((a, b) => a.name.localeCompare(b.name)).map((p) => `<option value="${p.id}" ${p.id === sel ? "selected" : ""}>${esc(p.name)}</option>`).join("");
  }
  function stopForm(day, existing) {
    const e = existing || {};
    openSheet(`<h2>${existing ? "Edit stop" : "Add a stop"}</h2><p class="muted small">${esc(day.title)}</p>
      <label class="f">What</label><input type="text" id="fName" placeholder="e.g. Dinner at Pelikan" value="${esc(e.name || "")}">
      <label class="f">When (optional)</label><input type="text" id="fTime" placeholder="e.g. 19:00 or Afternoon" value="${esc(e.t || "")}">
      <label class="f">Notes (optional)</label><textarea id="fNote" placeholder="Booking number, address, why it's worth it...">${esc(e.blurb || "")}</textarea>
      <label class="f">Link a place (optional)</label><select id="fPlace">${placeOptions(e.place)}</select>
      <div class="btnrow" style="margin-top:16px">${existing ? `<button class="btn danger" id="fDel">${I("trash", "sm")}Delete</button>` : `<button class="btn plain" data-close>Cancel</button>`}<button class="btn" id="fSave">Save</button></div>`,
      (s) => {
        if (!existing) setTimeout(() => $("#fName", s).focus(), 60);
        $("#fSave", s).onclick = () => {
          const name = $("#fName", s).value.trim(); if (!name) return toast("Give the stop a name");
          const list = (S.customStops[day.id] = S.customStops[day.id] || []);
          const obj = { id: e.id || uid(), t: $("#fTime", s).value.trim(), name, blurb: $("#fNote", s).value.trim(), place: $("#fPlace", s).value || null };
          if (existing) list[list.findIndex((x) => x.id === e.id)] = obj; else list.push(obj);
          save(); closeSheet(); redraw(); toast(existing ? "Stop updated" : "Stop added");
        };
        const del = $("#fDel", s); if (del) del.onclick = () => { S.customStops[day.id] = S.customStops[day.id].filter((x) => x.id !== e.id); save(); closeSheet(); redraw(); toast("Stop deleted"); };
      });
  }

  function regionOptions(sel) { return regionsAll().map((r) => `<option ${r === sel ? "selected" : ""}>${esc(r)}</option>`).join(""); }
  function dayForm(existing) {
    const e = existing || {};
    openSheet(`<h2>${existing ? "Rename day" : "Create a day"}</h2>
      <label class="f">Title</label><input type="text" id="dTitle" placeholder="e.g. Shopping & spa day" value="${esc(e.title || "")}">
      <label class="f">Region</label><select id="dRegion">${regionOptions(e.region || "Stockholm")}</select>
      <label class="f">Short description (optional)</label><textarea id="dSum" style="min-height:64px">${esc(e.summary || "")}</textarea>
      ${existing ? "" : `<label style="display:flex;gap:10px;align-items:center;margin-top:14px"><input type="checkbox" id="dTrip" checked style="width:20px;height:20px"> Add it to our trip</label>`}
      <div class="btnrow" style="margin-top:16px"><button class="btn plain" data-close>Cancel</button><button class="btn" id="dSave">Save</button></div>`,
      (s) => {
        if (!existing) setTimeout(() => $("#dTitle", s).focus(), 60);
        $("#dSave", s).onclick = () => {
          const title = $("#dTitle", s).value.trim(); if (!title) return toast("Give the day a title");
          const obj = { id: e.id || uid(), title, region: $("#dRegion", s).value, summary: $("#dSum", s).value.trim() };
          if (existing) { Object.assign(existing, obj); save(); closeSheet(); redraw(); return; }
          S.customDays.push(obj); if ($("#dTrip", s).checked) S.trip.push(obj.id);
          save(); closeSheet(); go("plan", { day: obj.id }); toast("Day created");
        };
      });
  }

  // ---------- PLACES ----------
  function placeRow(p, q) {
    const dist = here && hasGeo(p) ? " · " + kmTxt(km(here, p)) : "";
    return `<button class="row" data-place="${p.id}">${swatchFor(p)}
      <div class="main"><div class="t">${hl(p.name, q)}</div><div class="s">${esc(p.cat)}${S.region === "All" || here ? " · " + esc(p.region) : ""}${dist}${p.custom ? " · added by you" : ""}</div></div>
      ${S.favs[p.id] ? `<span style="color:var(--accent)">${I("bookmark-fill", "sm")}</span>` : ""}<span class="chev">${I("right", "sm")}</span></button>`;
  }
  function renderPlaces(v) {
    const q = S.q.trim().toLowerCase();
    let list = allPlaces().filter((p) =>
      (S.region === "All" || p.region === S.region) && (S.cat === "All" || p.cat === S.cat) && (!S.onlyFav || S.favs[p.id]) &&
      (!q || [p.name, p.blurb, p.tip, p.region, p.cat].join(" ").toLowerCase().includes(q)));
    let body;
    if (!list.length) body = `<div class="card empty">Nothing matches. Try another filter, or add the place yourself.</div>`;
    else if (here) {
      list = list.slice().sort((a, b) => (hasGeo(a) ? km(here, a) : 1e9) - (hasGeo(b) ? km(here, b) : 1e9));
      body = `<div class="list">${list.map((p) => placeRow(p, q)).join("")}</div>`;
    } else {
      const groups = {}; list.forEach((p) => (groups[p.region] = groups[p.region] || []).push(p));
      body = Object.keys(groups).sort((a, b) => regionsAll().indexOf(a) - regionsAll().indexOf(b)).map((r) =>
        `<div class="section-t"><span style="width:8px;height:8px;border-radius:50%;${rcStyle(r).split(";")[0]}"></span><span class="grow">${esc(r)}</span><span style="text-transform:none">${groups[r].length}</span></div><div class="list">${groups[r].map((p) => placeRow(p, q)).join("")}</div>`).join("");
    }
    const favN = Object.keys(S.favs).filter((id) => placeById(id)).length;
    v.innerHTML = `
      <div style="display:flex;gap:8px"><div class="searchbox" style="flex:1"><svg class="i sm" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" id="q" placeholder="Search places" value="${esc(S.q)}"></div>
        <button class="btn ${here ? "" : "plain"} sm" id="near" style="padding:0 12px">${I("nav", "sm")}${here ? "Near me" : "Near"}</button></div>
      <div class="chips">
        <select id="region" class="chip" style="width:auto;padding:6px 28px 6px 12px;background:var(--card) url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23888%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>') no-repeat right 8px center/14px">
          <option value="All">All regions</option>${regionsAll().map((r) => `<option ${r === S.region ? "selected" : ""}>${esc(r)}</option>`).join("")}</select>
        <button class="chip ${S.onlyFav ? "on" : ""}" id="favF">Saved (${favN})</button>
        ${["All"].concat(D.categories).map((c) => `<button class="chip ${S.cat === c ? "on" : ""}" data-cat="${c}">${c === "All" ? "All types" : c}</button>`).join("")}
      </div>
      <div class="section-t" style="margin-top:12px"><span class="grow" style="text-transform:none;letter-spacing:0;font-weight:500">${list.length} place${list.length === 1 ? "" : "s"}${here ? ", nearest first" : ""}</span><button class="textbtn" id="addPlace">${I("plus", "sm")}Add a place</button></div>
      ${body}`;
    const q$ = $("#q", v);
    q$.oninput = () => { S.q = q$.value; save(); clearTimeout(q$._t); q$._t = setTimeout(() => { const pos = q$.selectionStart; redraw(); const n = $("#q"); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} }, 220); };
    $("#region", v).onchange = (e) => { S.region = e.target.value; save(); redraw(); };
    $$("[data-cat]", v).forEach((b) => (b.onclick = () => { S.cat = b.dataset.cat; save(); redraw(); }));
    $("#favF", v).onclick = () => { S.onlyFav = !S.onlyFav; save(); redraw(); };
    $("#addPlace", v).onclick = () => placeForm();
    $$("[data-place]", v).forEach((b) => (b.onclick = () => placeSheet(b.dataset.place)));
    $("#near", v).onclick = () => {
      if (here) { here = null; return redraw(); }
      if (!navigator.geolocation) return toast("Location isn't available here");
      toast("Finding you (GPS works offline)");
      navigator.geolocation.getCurrentPosition((p) => { here = { lat: p.coords.latitude, lon: p.coords.longitude }; if (S.tab === "places") redraw(); },
        () => toast("Couldn't get your location"), { timeout: 15000, maximumAge: 300000 });
    };
  }

  function placeSheet(id) {
    const p = placeById(id); if (!p) return;
    const days = allDays().filter((d) => stopsFor(d).some((s) => s.place === id));
    const dayOpts = S.trip.map(dayById).filter(Boolean).map((d, i) => `<option value="${d.id}">Trip day ${i + 1}: ${esc(d.title)}</option>`).join("")
      + allDays().filter((d) => !inTrip(d.id)).map((d) => `<option value="${d.id}">Idea: ${esc(d.title)}</option>`).join("");
    openSheet(`
      <div style="display:flex;gap:12px;align-items:flex-start">${swatchFor(p)}<div style="flex:1"><h2>${esc(p.name)}</h2>
        <div class="tags">${catTag(p.cat)}<span class="tag">${esc(p.region)}</span>${here && hasGeo(p) ? `<span class="tag">${kmTxt(km(here, p))} away</span>` : ""}${p.custom ? '<span class="tag c-Mine">Added by you</span>' : ""}</div></div></div>
      ${p.blurb ? `<p style="font-size:16px;margin:14px 0 6px">${esc(p.blurb)}</p>` : ""}
      ${p.tip ? `<p class="muted" style="margin:0 0 6px"><b>Tip:</b> ${esc(p.tip)}</p>` : ""}
      ${days.length ? `<p class="muted small" style="margin:6px 0 0">In: ${days.map((d) => esc(d.title)).join(", ")}</p>` : ""}
      <div class="btnrow" style="margin-top:16px">
        <button class="btn ${S.favs[id] ? "plain" : "soft"}" id="pFav">${I(S.favs[id] ? "bookmark-fill" : "bookmark", "sm")}${S.favs[id] ? "Saved" : "Save"}</button>
        ${hasGeo(p) ? `<button class="btn soft" id="pShow">${I("pin", "sm")}On map</button>` : ""}
      </div>
      <a class="textbtn small" href="${mapsUrl(p)}" target="_blank" rel="noopener" style="text-decoration:none;margin-top:10px">${I("nav", "sm")}Directions in Apple Maps</a>
      <label class="f" style="margin-top:16px">Add to a day</label>
      <div style="display:flex;gap:8px"><select id="pDay" style="flex:1">${dayOpts}</select><button class="btn" id="pAdd">Add</button></div>
      ${p.custom ? `<div class="btnrow" style="margin-top:16px"><button class="btn plain" id="pEdit">${I("edit", "sm")}Edit</button><button class="btn danger" id="pDel">${I("trash", "sm")}Delete</button></div>` : ""}
      <button class="btn plain full" data-close style="margin-top:10px">Close</button>`,
      (s) => {
        $("#pFav", s).onclick = () => { S.favs[id] = !S.favs[id]; if (!S.favs[id]) delete S.favs[id]; save(); placeSheet(id); redraw(); };
        const sh = $("#pShow", s); if (sh) sh.onclick = () => showOnMap([id]);
        $("#pAdd", s).onclick = () => {
          const dId = $("#pDay", s).value; (S.customStops[dId] = S.customStops[dId] || []).push({ id: uid(), t: "", name: p.name, blurb: p.blurb || "", place: id });
          save(); closeSheet(); redraw(); toast("Added to " + dayById(dId).title);
        };
        const ed = $("#pEdit", s); if (ed) ed.onclick = () => placeForm(p);
        const dl = $("#pDel", s); if (dl) dl.onclick = () => confirmSheet("Delete this place?", "Stops linked to it will stay, without the link.", "Delete", () => {
          S.customPlaces = S.customPlaces.filter((x) => x.id !== id); delete S.favs[id];
          Object.values(S.customStops).forEach((l) => l.forEach((st) => { if (st.place === id) st.place = null; }));
          save(); redraw(); toast("Place deleted");
        });
      });
  }

  function placeForm(existing) {
    const e = existing || {};
    let geo = hasGeo(e) ? { lat: e.lat, lon: e.lon } : null;
    const geoTxt = () => (geo ? `Location saved (${geo.lat.toFixed(4)}, ${geo.lon.toFixed(4)})` : "No location saved. Maps will search by name.");
    openSheet(`<h2>${existing ? "Edit place" : "Add a place"}</h2>
      <label class="f">Name</label><input type="text" id="pName" placeholder="e.g. Café Pascal" value="${esc(e.name || "")}">
      <div style="display:flex;gap:8px"><div style="flex:1"><label class="f">Type</label><select id="pCat">${D.categories.map((c) => `<option ${c === (e.cat || "Fika") ? "selected" : ""}>${c}</option>`).join("")}</select></div>
      <div style="flex:1"><label class="f">Region</label><select id="pRegion">${regionOptions(e.region || S.region !== "All" ? e.region || S.region : "Stockholm")}</select></div></div>
      <label class="f">Notes (optional)</label><textarea id="pNote" placeholder="Why go, what to order, opening times...">${esc(e.blurb || "")}</textarea>
      <label class="f">Location</label><div class="muted small" id="geoTxt">${geoTxt()}</div>
      <div class="btnrow" style="margin-top:8px"><button class="btn soft sm" id="pGeo">${I("nav", "sm")}Use where I am now</button>${geo ? `<button class="btn plain sm" id="pGeoClr">Clear</button>` : ""}</div>
      <div class="btnrow" style="margin-top:18px"><button class="btn plain" data-close>Cancel</button><button class="btn" id="pSave">Save</button></div>`,
      (s) => {
        if (!existing) setTimeout(() => $("#pName", s).focus(), 60);
        $("#pGeo", s).onclick = () => {
          if (!navigator.geolocation) return toast("Location isn't available here");
          navigator.geolocation.getCurrentPosition((p) => { geo = { lat: p.coords.latitude, lon: p.coords.longitude }; $("#geoTxt", s).textContent = geoTxt(); toast("Location saved"); },
            () => toast("Couldn't get your location"), { timeout: 15000 });
        };
        const clr = $("#pGeoClr", s); if (clr) clr.onclick = () => { geo = null; $("#geoTxt", s).textContent = geoTxt(); clr.remove(); };
        $("#pSave", s).onclick = () => {
          const name = $("#pName", s).value.trim(); if (!name) return toast("Give the place a name");
          const obj = { id: e.id || uid(), custom: true, name, cat: $("#pCat", s).value, region: $("#pRegion", s).value, blurb: $("#pNote", s).value.trim(), tip: "" };
          if (geo) { obj.lat = geo.lat; obj.lon = geo.lon; }
          if (existing) S.customPlaces[S.customPlaces.findIndex((x) => x.id === e.id)] = obj; else S.customPlaces.push(obj);
          save(); redraw(); placeSheet(obj.id); toast(existing ? "Place updated" : "Place added");
        };
      });
  }

  // ---------- GUIDE ----------
  const GUIDE_TABS = [["essentials", "Essentials"], ["fika", "Fika"], ["phrases", "Words"], ["seasons", "Seasons"]];
  function renderGuide(v) {
    const g = S.guide;
    let body = "";
    if (g === "essentials") body = `<div class="list">${D.practical.map((p) => `<div class="row" style="align-items:flex-start;display:block"><div class="t">${esc(p.h)}</div><div class="muted" style="font-size:15px;margin-top:2px">${esc(p.d)}</div></div>`).join("")}</div>`;
    if (g === "fika") body = `<div class="card"><div class="t" style="font-weight:600">How fika works</div><p class="muted" style="margin:4px 0 0;font-size:15px">A sit-down coffee break with something sweet, ideally with someone. Filter coffee (bryggkaffe) often comes with a free refill (påtår).</p></div>
      <div class="section-t">What to order</div>
      <div class="list">${D.fika.map((f) => `<div class="row" style="display:block"><div style="display:flex;justify-content:space-between;gap:8px"><span class="t">${esc(f.name)}</span><span class="muted small">${esc(f.sw)}</span></div><div class="muted" style="font-size:15px;margin-top:2px">${esc(f.note)}</div></div>`).join("")}</div>
      <div class="section-t">Fika places in the app</div>
      <div class="list">${allPlaces().filter((p) => p.cat === "Fika").map((p) => placeRow(p, "")).join("")}</div>`;
    if (g === "phrases") body = `<div class="section-t" style="margin-top:12px">Useful phrases</div>
      <div class="list">${D.phrases.map((p) => `<div class="phrase"><div><div class="t" style="font-weight:600">${esc(p.sv)}</div><div class="say">${esc(p.say)}</div></div><div class="en">${esc(p.en)}</div></div>`).join("")}</div>
      <div class="section-t">Swedish words worth knowing</div>
      <div class="list">${D.words.map((w) => `<div class="row" style="display:block"><div class="t">${esc(w.w)}</div><div class="muted" style="font-size:15px">${esc(w.d)}</div></div>`).join("")}</div>`;
    if (g === "seasons") body = `<div class="list">${D.traditions.map((t) => `<div class="row" style="display:block"><div class="t">${esc(t.when)}</div><div class="muted" style="font-size:15px">${esc(t.what)}</div></div>`).join("")}</div>`;
    v.innerHTML = `<div class="seg">${GUIDE_TABS.map(([k, l]) => `<button data-g="${k}" class="${g === k ? "on" : ""}">${l}</button>`).join("")}</div><div style="margin-top:10px">${body}</div>`;
    $$("[data-g]", v).forEach((b) => (b.onclick = () => { S.guide = b.dataset.g; save(); draw(); }));
    $$("[data-place]", v).forEach((b) => (b.onclick = () => placeSheet(b.dataset.place)));
  }

  // ---------- MY TRIP ----------
  function renderMine(v) {
    const saved = Object.keys(S.favs).map(placeById).filter(Boolean);
    const mine = S.customPlaces;
    const packDone = S.pack.filter((p) => p.d).length;
    v.innerHTML = `
      <div class="section-t" style="margin-top:8px">Trip dates</div>
      <div class="card"><label class="f" style="margin-top:0">First day of the trip</label><input type="date" id="startInput" value="${esc(S.start)}">
        <p class="muted small" style="margin:8px 0 0">${S.trip.length ? `Your ${S.trip.length} trip day${S.trip.length > 1 ? "s" : ""} get dates in the order shown on the Plan tab.` : "Add days to your trip on the Plan tab, then they'll get dates."}</p></div>

      <div class="section-t"><span class="grow">Saved places · ${saved.length}</span></div>
      <div class="list">${saved.length ? saved.map((p) => placeRow(p, "")).join("") : `<div class="empty">Tap Save on any place to keep it here</div>`}</div>

      <div class="section-t"><span class="grow">Places you added · ${mine.length}</span><button class="textbtn" id="addPlace2">${I("plus", "sm")}Add</button></div>
      <div class="list">${mine.length ? mine.map((p) => placeRow(p, "")).join("") : `<div class="empty">Restaurants, shops, a friend's address...</div>`}</div>

      <div class="section-t">Journal</div>
      <div class="card"><textarea id="jText" placeholder="What happened today?"></textarea><button class="btn full" id="jAdd" style="margin-top:8px">Save entry</button></div>
      ${S.journal.length ? `<div class="list">${S.journal.map((j, i) => [j, i]).reverse().map(([j, i]) => `<div class="row" style="display:block"><div style="display:flex;align-items:center"><span class="small" style="flex:1;color:var(--accent);font-weight:600">${esc(fmt(new Date(j.at), { weekday: "long", day: "numeric", month: "long" }))}</span><button class="textbtn small" style="color:var(--ink2)" data-jdel="${i}">Delete</button></div><div style="white-space:pre-wrap;margin-top:2px">${esc(j.text)}</div></div>`).join("")}</div>` : ""}

      <div class="section-t"><span class="grow">Packing list</span><span style="text-transform:none">${packDone}/${S.pack.length}</span></div>
      <div class="list">${S.pack.map((p, i) => `<div class="stop ${p.d ? "done" : ""}" style="align-items:center;padding:10px 16px"><button class="chk ${p.d ? "on" : ""}" data-pack="${i}">${p.d ? I("check", "sm") : ""}</button><span class="t" style="flex:1;font-weight:400">${esc(p.t)}</span><button class="textbtn" style="color:var(--ink2)" data-pdel="${i}" aria-label="Remove">${I("x", "sm")}</button></div>`).join("")}</div>
      <div style="display:flex;gap:8px"><input type="text" id="packNew" placeholder="Add an item"><button class="btn" id="packAdd">Add</button></div>

      <div class="section-t">Backup</div>
      <div class="card"><p class="muted small" style="margin:0 0 10px">Everything you add is stored only on this phone. Copy a backup now and then and keep it in Notes.</p>
        <div class="btnrow"><button class="btn plain" id="bkCopy">Copy backup</button><button class="btn plain" id="bkRestore">Restore</button></div></div>
      <p class="muted small" style="text-align:center;margin:18px 0 4px">Opening hours and timetables change by season. Check the day before.</p>`;
    $("#startInput", v).onchange = (e) => { S.start = e.target.value; save(); toast(S.start ? "Dates set" : "Dates cleared"); };
    $$("[data-place]", v).forEach((b) => (b.onclick = () => placeSheet(b.dataset.place)));
    $("#addPlace2", v).onclick = () => placeForm();
    $("#jAdd", v).onclick = () => { const t = $("#jText", v).value.trim(); if (!t) return; S.journal.push({ at: Date.now(), text: t }); save(); redraw(); toast("Entry saved"); };
    $$("[data-jdel]", v).forEach((b) => (b.onclick = () => confirmSheet("Delete this entry?", "This can't be undone.", "Delete", () => { S.journal.splice(+b.dataset.jdel, 1); save(); redraw(); })));
    $$("[data-pack]", v).forEach((b) => (b.onclick = () => { const p = S.pack[+b.dataset.pack]; p.d = !p.d; save(); redraw(); }));
    $$("[data-pdel]", v).forEach((b) => (b.onclick = () => { S.pack.splice(+b.dataset.pdel, 1); save(); redraw(); }));
    const addPack = () => { const t = $("#packNew").value.trim(); if (!t) return; S.pack.push({ t, d: false }); save(); redraw(); };
    $("#packAdd", v).onclick = addPack; $("#packNew", v).onkeydown = (e) => e.key === "Enter" && addPack();
    $("#bkCopy", v).onclick = async () => {
      try { await navigator.clipboard.writeText(JSON.stringify(S)); toast("Backup copied"); }
      catch (e) { openSheet(`<h2>Copy this text</h2><textarea readonly style="min-height:200px;font-family:ui-monospace,monospace;font-size:12px">${esc(JSON.stringify(S))}</textarea><button class="btn plain full" data-close style="margin-top:10px">Done</button>`); }
    };
    $("#bkRestore", v).onclick = () => openSheet(`<h2>Restore a backup</h2><p class="muted">Paste a backup. It replaces what's on this phone.</p><textarea id="bkIn" style="min-height:160px;font-family:ui-monospace,monospace;font-size:12px"></textarea><div class="btnrow" style="margin-top:10px"><button class="btn plain" data-close>Cancel</button><button class="btn" id="bkGo">Restore</button></div>`,
      (s) => { $("#bkGo", s).onclick = () => { try { const o = JSON.parse($("#bkIn", s).value); if (!o || typeof o !== "object") throw 0; S = Object.assign({}, defaults, o); save(); closeSheet(); go("mine"); toast("Restored"); } catch (e) { toast("That doesn't look like a backup"); } }; });
  }

  // ---------- GLOBAL SEARCH ----------
  $("#searchBtn").onclick = () => {
    openSheet(`<div class="searchbox"><svg class="i sm" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" id="gq" placeholder="Search days, places, phrases, tips"></div><div id="gres" style="margin-top:6px"><div class="empty">Try "bun", "ferry", "castle" or "thank you"</div></div>`,
      (s) => {
        const inp = $("#gq", s); setTimeout(() => inp.focus(), 60);
        inp.oninput = () => {
          const q = inp.value.trim().toLowerCase(); const out = $("#gres", s);
          if (q.length < 2) { out.innerHTML = `<div class="empty">Type at least 2 letters</div>`; return; }
          const has = (...xs) => xs.join(" ").toLowerCase().includes(q);
          const days = allDays().map((d) => { const st = stopsFor(d).find((x) => has(x.name, x.blurb || "")); return has(d.title, d.region, d.summary, Object.values(d.info).join(" ")) || st ? [d, st] : null; }).filter(Boolean);
          const places = allPlaces().filter((p) => has(p.name, p.blurb || "", p.tip || "", p.region, p.cat));
          const guide = [].concat(
            D.practical.filter((p) => has(p.h, p.d)).map((p) => ["essentials", p.h, p.d]),
            D.fika.filter((f) => has(f.name, f.note)).map((f) => ["fika", f.name, f.note]),
            D.phrases.filter((p) => has(p.sv, p.en)).map((p) => ["phrases", p.sv, p.en]),
            D.words.filter((w) => has(w.w, w.d)).map((w) => ["phrases", w.w, w.d]),
            D.traditions.filter((t) => has(t.when, t.what)).map((t) => ["seasons", t.when, t.what]));
          const sec = (t, items) => items.length ? `<div class="section-t">${t} · ${items.length}</div><div class="list">${items.join("")}</div>` : "";
          out.innerHTML = (sec("Days", days.map(([d, st]) => `<button class="row" data-gday="${d.id}"><div class="main"><div class="t">${hl(d.title, q)}</div><div class="s">${st ? hl(st.name, q) : esc(d.region)}${inTrip(d.id) ? " · in your trip" : ""}</div></div></button>`))
            + sec("Places", places.map((p) => `<button class="row" data-gplace="${p.id}">${swatchFor(p)}<div class="main"><div class="t">${hl(p.name, q)}</div><div class="s">${esc(p.cat)} · ${esc(p.region)}</div></div></button>`))
            + sec("Guide", guide.map(([g, a, b]) => `<button class="row" data-gguide="${g}" style="display:block"><div class="t">${hl(a, q)}</div><div class="s" style="white-space:normal">${hl(b, q)}</div></button>`)))
            || `<div class="empty">Nothing found for "${esc(inp.value)}"</div>`;
          $$("[data-gday]", out).forEach((b) => (b.onclick = () => { closeSheet(); go("plan", { day: b.dataset.gday }); }));
          $$("[data-gplace]", out).forEach((b) => (b.onclick = () => placeSheet(b.dataset.gplace)));
          $$("[data-gguide]", out).forEach((b) => (b.onclick = () => { closeSheet(); S.guide = b.dataset.gguide; go("guide"); }));
        };
      });
  };

  // ---------- MAP ----------
  const MAP_CACHE = "sverige-maps";
  const CAT_PIN = { Sight: "#5C7FA8", Museum: "#7D6FB5", Fika: "#C98260", Nature: "#5E9470", Village: "#B39A3E", Experience: "#B86A85" };
  const abs = (p) => new URL(p, location.href).href;
  let map = null, mapIndex = null, focusIds = null, watchId = null, meFirst = true;

  async function loadMapIndex() {
    try { const r = await fetch("maps/index.json", { cache: "no-cache" }); if (r.ok) mapIndex = await r.json(); } catch (e) {}
    if (!mapIndex) { try { const c = await caches.match(abs("maps/index.json")); if (c) mapIndex = await c.json(); } catch (e) {} }
    return mapIndex;
  }
  async function isDownloaded(r) { try { const c = await caches.open(MAP_CACHE); return !!(await c.match(abs(r.file))); } catch (e) { return false; } }

  async function buildStyle() {
    const dark = matchMedia("(prefers-color-scheme: dark)").matches;
    const T = await (await fetch(`maps/layers-${dark ? "dark" : "light"}.json`)).json();
    const idx = mapIndex || { regions: [] };
    const clone = (o) => JSON.parse(JSON.stringify(o));
    const src = (r) => ({ type: "vector", url: "pmtiles://" + abs(r.file), attribution: '<a href="https://openstreetmap.org/copyright">© OpenStreetMap</a> · <a href="https://protomaps.com">Protomaps</a>' });
    const sources = {}, layers = [clone(T.find((l) => l.id === "background"))];
    const rest = T.filter((l) => l.id !== "background");
    const over = idx.regions.find((r) => r.id === "sweden");
    if (over) {
      sources.sweden = src(over);
      rest.forEach((l) => { const c = clone(l); c.id = "sweden-" + l.id; c.source = "sweden"; if (c.type === "symbol") c.maxzoom = Math.min(c.maxzoom ?? 24, 10); layers.push(c); });
    }
    idx.regions.filter((r) => r.id !== "sweden").forEach((r) => {
      sources[r.id] = src(r);
      rest.forEach((l) => { const c = clone(l); c.id = r.id + "-" + l.id; c.source = r.id; c.minzoom = Math.max(c.minzoom || 0, over ? 10 : 0); layers.push(c); });
    });
    return { version: 8, glyphs: abs("fonts/") + "{fontstack}/{range}.pbf", sprite: abs("maps/sprites/" + (dark ? "dark" : "light")), sources, layers };
  }

  function pinData() {
    const tripPlaces = new Set();
    S.trip.forEach((id) => { const d = dayById(id); if (d) stopsFor(d).forEach((s) => s.place && tripPlaces.add(s.place)); });
    let list = allPlaces().filter(hasGeo);
    if (focusIds) list = list.filter((p) => focusIds.includes(p.id));
    else if (S.mapFilter === "saved") list = list.filter((p) => S.favs[p.id]);
    else if (S.mapFilter === "trip") list = list.filter((p) => tripPlaces.has(p.id));
    return { type: "FeatureCollection", features: list.map((p) => ({ type: "Feature", geometry: { type: "Point", coordinates: [p.lon, p.lat] },
      properties: { id: p.id, name: p.name, color: p.custom ? "#5C7FA8" : CAT_PIN[p.cat] || "#888", saved: !!S.favs[p.id] } })) };
  }
  function updatePins() { if (map && map.getSource("pins")) map.getSource("pins").setData(pinData()); }
  function addPinLayers() {
    const dark = matchMedia("(prefers-color-scheme: dark)").matches;
    map.addSource("pins", { type: "geojson", data: pinData() });
    map.addSource("me", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    map.addLayer({ id: "pins-halo", type: "circle", source: "pins", paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 6, 12, 11], "circle-color": dark ? "#26262A" : "#ffffff" } });
    map.addLayer({ id: "pins", type: "circle", source: "pins", paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 4, 12, 8], "circle-color": ["get", "color"], "circle-stroke-width": ["case", ["get", "saved"], 2.5, 0], "circle-stroke-color": dark ? "#EDEDF0" : "#2B2B30" } });
    map.addLayer({ id: "pins-label", type: "symbol", source: "pins", minzoom: 10.5,
      layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Medium"], "text-size": 13, "text-offset": [0, 1.1], "text-anchor": "top", "text-optional": true },
      paint: { "text-color": dark ? "#EDEDF0" : "#2B2B30", "text-halo-color": dark ? "#202024" : "#ffffff", "text-halo-width": 1.6 } });
    map.addLayer({ id: "me-halo", type: "circle", source: "me", paint: { "circle-radius": 14, "circle-color": "#5C7FA8", "circle-opacity": 0.2 } });
    map.addLayer({ id: "me", type: "circle", source: "me", paint: { "circle-radius": 6, "circle-color": "#5C7FA8", "circle-stroke-width": 2.5, "circle-stroke-color": "#fff" } });
    map.on("click", "pins", (e) => { const f = e.features && e.features[0]; if (f) placeSheet(f.properties.id); });
    map.on("mouseenter", "pins", () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", "pins", () => (map.getCanvas().style.cursor = ""));
  }

  async function ensureMap() {
    if (map) return;
    if (!window.maplibregl) { $("#map").innerHTML = '<div class="empty" style="padding-top:120px">The map couldn\'t load on this device.</div>'; return; }
    if (window.pmtiles && !ensureMap.proto) { const proto = new pmtiles.Protocol(); maplibregl.addProtocol("pmtiles", proto.tile); ensureMap.proto = true; }
    await loadMapIndex();
    const style = await buildStyle();
    map = new maplibregl.Map({ container: "map", style, center: [15.5, 61.5], zoom: 3.6, minZoom: 3, maxZoom: 17.5,
      attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false });
    map.touchZoomRotate.disableRotation();
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
    map.on("load", () => { addPinLayers(); applyFocus(); });
    map.on("error", () => {}); // missing offline tiles are expected; keep quiet
    mapNote();
  }

  function layoutMap() {
    const w = $("#mapWrap"); w.style.top = $("#hdr").offsetHeight + "px"; w.style.bottom = $("nav").offsetHeight + "px";
    if (map) map.resize();
  }
  window.addEventListener("resize", () => S.tab === "map" && layoutMap());

  function renderMap() {
    $("#mapWrap").hidden = false;
    $$("#mapSeg button").forEach((b) => b.classList.toggle("on", !focusIds && b.dataset.mf === (S.mapFilter || "all")));
    layoutMap();
    ensureMap().then(() => { layoutMap(); updatePins(); applyFocus(); });
  }
  $$("#mapSeg button").forEach((b) => (b.onclick = () => {
    focusIds = null; S.mapFilter = b.dataset.mf; save(); renderMap();
    const n = pinData().features.length; if (!n) toast(S.mapFilter === "saved" ? "No saved places yet" : "No places linked to your trip days yet");
  }));

  function applyFocus() {
    if (!map || !map.loaded() || !map.getSource("pins")) return;
    updatePins();
    const pts = pinData().features.map((f) => f.geometry.coordinates);
    if (!focusIds || !pts.length) return;
    if (pts.length === 1) map.flyTo({ center: pts[0], zoom: 15, duration: 600 });
    else { const b = pts.reduce((bb, c) => bb.extend(c), new maplibregl.LngLatBounds(pts[0], pts[0])); map.fitBounds(b, { padding: 60, maxZoom: 15, duration: 600 }); }
    focusIds = null;
  }
  function showOnMap(ids) { focusIds = ids; closeSheet(); go("map"); }

  $("#locBtn").onclick = () => {
    const btn = $("#locBtn");
    if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; btn.classList.remove("on"); if (map) map.getSource("me").setData({ type: "FeatureCollection", features: [] }); return; }
    if (!navigator.geolocation) return toast("Location isn't available here");
    btn.classList.add("on"); meFirst = true; toast("Finding you (GPS works offline)");
    watchId = navigator.geolocation.watchPosition((p) => {
      here = { lat: p.coords.latitude, lon: p.coords.longitude };
      if (map && map.getSource("me")) {
        map.getSource("me").setData({ type: "Feature", geometry: { type: "Point", coordinates: [here.lon, here.lat] }, properties: {} });
        if (meFirst) { map.flyTo({ center: [here.lon, here.lat], zoom: Math.max(map.getZoom(), 14), duration: 600 }); meFirst = false; }
      }
    }, () => { toast("Couldn't get your location"); btn.classList.remove("on"); watchId = null; }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
  };

  async function mapNote() {
    const n = $("#mapNote");
    if (!mapIndex || !mapIndex.regions.length) { n.hidden = false; n.innerHTML = `<div style="flex:1">The street maps are still being prepared. The pins work already.</div>`; return; }
    const got = await Promise.all(mapIndex.regions.map(isDownloaded));
    if (got.some(Boolean)) { n.hidden = true; return; }
    n.hidden = false;
    n.innerHTML = `<div style="flex:1">Download the maps to use them without internet.</div><button class="btn sm" id="noteDl">Download</button>`;
    $("#noteDl").onclick = offlineSheet;
  }

  const MB = (b) => (b / 1048576).toFixed(b < 10485760 ? 1 : 0) + " MB";
  async function offlineSheet() {
    await loadMapIndex();
    if (!mapIndex || !mapIndex.regions.length) return openSheet(`<h2>Offline maps</h2><p class="muted">The map files aren't ready yet. Try again a bit later while online.</p><button class="btn plain full" data-close>Close</button>`);
    const states = await Promise.all(mapIndex.regions.map(isDownloaded));
    let est = ""; try { const e = await navigator.storage.estimate(); est = `Using ${MB(e.usage || 0)} on this phone.`; } catch (e) {}
    const missing = mapIndex.regions.filter((r, i) => !states[i]);
    openSheet(`<h2>Offline maps</h2><p class="muted small" style="margin:0 0 12px">Download once while online (Wi-Fi recommended). After that the map works anywhere. ${est}</p>
      <div class="list">${mapIndex.regions.map((r, i) => `<div class="row" style="display:block">
        <div style="display:flex;align-items:center;gap:10px"><div class="main"><div class="t">${esc(r.name)}</div><div class="s">${MB(r.bytes)}${states[i] ? " · downloaded" : ""}</div></div>
        ${states[i] ? `<button class="btn plain sm" data-rm="${r.id}">Remove</button>` : `<button class="btn soft sm" data-dl="${r.id}">Download</button>`}</div>
        <div class="progress" id="pg-${r.id}" hidden><i></i></div></div>`).join("")}</div>
      ${missing.length > 1 ? `<button class="btn full" id="dlAll">Download all (${MB(missing.reduce((a, r) => a + r.bytes, 0))})</button>` : ""}
      <p class="muted small" style="margin-top:12px">Map data © OpenStreetMap contributors, via Protomaps. Map built ${esc(String(mapIndex.build || "").replace(/(\d{4})(\d\d)(\d\d)/, "$1-$2-$3"))}.</p>
      <button class="btn plain full" data-close style="margin-top:6px">Close</button>`,
      (s) => {
        const dl = async (r) => {
          const pg = $("#pg-" + r.id, s), bar = pg && pg.firstElementChild; if (pg) pg.hidden = false;
          const res = await fetch(r.file, { cache: "no-store" }); if (!res.ok) throw new Error("HTTP " + res.status);
          const total = +res.headers.get("content-length") || r.bytes; const rd = res.body.getReader(); const parts = []; let got = 0;
          for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; if (bar) bar.style.width = Math.min(100, (got / total) * 100) + "%"; }
          const blob = new Blob(parts, { type: "application/octet-stream" });
          const c = await caches.open(MAP_CACHE);
          await c.put(abs(r.file), new Response(blob, { headers: { "Content-Type": "application/octet-stream", "Content-Length": String(blob.size) } }));
        };
        const run = async (list) => {
          $$("button", s).forEach((b) => (b.disabled = true));
          try { for (const r of list) await dl(r); toast("Maps saved for offline"); }
          catch (e) { toast("Download failed. Check your connection"); }
          if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
          offlineSheet(); mapNote(); if (map) { map.remove(); map = null; if (S.tab === "map") renderMap(); }
        };
        $$("[data-dl]", s).forEach((b) => (b.onclick = () => run([mapIndex.regions.find((r) => r.id === b.dataset.dl)])));
        const all = $("#dlAll", s); if (all) all.onclick = () => run(missing);
        $$("[data-rm]", s).forEach((b) => (b.onclick = async () => { const r = mapIndex.regions.find((x) => x.id === b.dataset.rm); const c = await caches.open(MAP_CACHE); await c.delete(abs(r.file)); toast("Removed"); offlineSheet(); mapNote(); }));
      });
  }
  $("#dlBtn").onclick = offlineSheet;

  // ---------- offline ----------
  function offline(ok, msg) { $("#offDot").classList.toggle("ok", ok); $("#offTxt").textContent = msg; }
  function setupOffline() {
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
    if (!("serviceWorker" in navigator)) return offline(false, "Preview only. Install from the hosted app for offline use");
    navigator.serviceWorker.register("sw.js").then(() => {
      navigator.serviceWorker.ready.then(() => offline(true, standalone ? "Works offline" : "Saved for offline · Share, then Add to Home Screen"));
    }).catch(() => offline(false, "Preview only. Install from the hosted app for offline use"));
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  }

  // ---------- boot ----------
  // Migrate from the first version if present.
  try {
    if (!localStorage.getItem(KEY)) {
      const old = JSON.parse(localStorage.getItem("mysig-sverige-v1") || "null");
      if (old) { S.favs = old.favs || {}; S.start = old.start || ""; S.journal = old.journal || []; if (old.pack) S.pack = old.pack; Object.entries(old.notes || {}).forEach(([k, val]) => (S.notes["d" + k] = val)); save(); }
    }
  } catch (e) {}
  go(S.tab || "plan");
  setupOffline();
})();
