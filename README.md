# Sverige: a simple offline Sweden guide for iPhone

A Progressive Web App. Once installed to your Home Screen, it works with no internet at all:
the itinerary, places, phrases, notes, journal and packing list are all stored on the phone.

## Install on your iPhone (about 5 minutes, once)

A PWA needs to be served over HTTPS once, so iOS can install and cache it. Pick one:

**Netlify Drop (easiest)**
1. Go to https://app.netlify.com/drop on a computer.
2. Drag this whole `sverige` folder onto the page. You get an https://….netlify.app link.

**GitHub Pages**
1. Push this folder to a repo.
2. Settings → Pages → Deploy from branch → `main` / root.

Then, on the iPhone:
1. Open the link in **Safari** (not Chrome) while you have internet.
2. Wait until the header says "Saved for offline".
3. Tap **Share → Add to Home Screen**.
4. Open it from the Home Screen icon. Done: airplane mode works from now on.

Tip: also download Sweden in **Apple Maps → Offline Maps** so the "Open in Maps" buttons work offline.
The "Near" button on the Places tab uses GPS, which works without internet.

## Editing
- All content is in `data.js` (itinerary days, places with coordinates, fika, phrases, packing list).
- After changing anything, bump `VERSION` in `sw.js` and redeploy. The app updates the next time it opens with internet.

## Your data
Ticks, notes, favourites and journal live in the app's local storage on the phone.
Use **Notes → Copy backup** now and then and paste it into Apple Notes.

## Using it
- **Plan:** tap + on the day ideas you want; they move into "Our trip". Reorder with the arrows. Open a day to tick off stops, add your own stops, or "Edit day" to hide suggestions you don't want. "New day" creates a blank day of your own.
- **Places:** grouped by region, filter by type or Saved, search, or sort by distance. "Add a place" saves your own spots (optionally with your current GPS location). Any place can be added to a day.
- **Map:** offline street map with all places as pins (All / Our trip / Saved) and your live location. Tap the download button on the map to save regions for offline use (once per phone, on Wi-Fi). "On map" on a place or day jumps there.
- **Guide:** essentials, fika, phrases and words, seasons.
- **My trip:** start date, saved and added places, journal, packing list, backup.
- The search button in the top corner searches everything at once.

## Offline maps
Map files are built by the **Build offline maps** GitHub Action from [Protomaps](https://protomaps.com) / OpenStreetMap data.
Edit `maps/regions.txt` (id | label | bbox | max zoom) and push to rebuild them, or run the action manually.
Map data © OpenStreetMap contributors. Rendering: MapLibre GL JS (BSD-3) and PMTiles.
