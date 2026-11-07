#!/usr/bin/env python3
"""Build the offline walking graph and search index for the app from an OSM extract.

Usage: build_nav.py INPUT.osm.pbf OUT_DIR

Writes:
  OUT_DIR/stockholm-walk.bin     walking graph (see format below)
  OUT_DIR/stockholm-search.json  places, streets and addresses for offline search

Graph format (little-endian):
  4 bytes  magic "SVW1"
  uint32   nV, nE, nG, nNames
  int32    verts[2*nV]   lon*1e6, lat*1e6
  int32    edges[5*nE]   a, b, length in decimetres, geomStart, geomCount
  int32    geom[2*nG]    intermediate points, lon*1e6, lat*1e6
  uint8    edgeKind[nE]  0 street, 1 footway/path, 2 steps, 3 cycleway, 4 pedestrian street
  int32    edgeName[nE]  index into names, -1 if unnamed
  uint32   namesJsonLength, then UTF-8 JSON array of street names
"""
import json
import math
import struct
import sys
from collections import defaultdict

import osmium

WALK = {
    "footway", "path", "pedestrian", "steps", "living_street", "residential", "service", "unclassified",
    "tertiary", "tertiary_link", "secondary", "secondary_link", "primary", "primary_link", "cycleway",
    "track", "corridor", "road", "bridleway", "trunk", "trunk_link",
}
KIND = {"footway": 1, "path": 1, "track": 1, "corridor": 1, "bridleway": 1, "steps": 2, "cycleway": 3, "pedestrian": 4, "living_street": 4}

POI_TAGS = {
    "amenity": {
        "cafe": "Café", "restaurant": "Restaurant", "bar": "Bar", "pub": "Pub", "fast_food": "Fast food",
        "ice_cream": "Ice cream", "pharmacy": "Pharmacy", "toilets": "Toilets", "atm": "ATM", "bank": "Bank",
        "hospital": "Hospital", "clinic": "Clinic", "doctors": "Doctor", "police": "Police", "post_office": "Post office",
        "library": "Library", "cinema": "Cinema", "theatre": "Theatre", "place_of_worship": "Church",
        "marketplace": "Market", "ferry_terminal": "Ferry", "arts_centre": "Arts centre", "nightclub": "Club",
        "bicycle_rental": "Bike rental", "drinking_water": "Drinking water",
    },
    "tourism": {
        "attraction": "Attraction", "museum": "Museum", "gallery": "Gallery", "hotel": "Hotel", "hostel": "Hostel",
        "guest_house": "Guest house", "viewpoint": "Viewpoint", "information": "Tourist info", "zoo": "Zoo",
        "theme_park": "Theme park", "apartment": "Apartment",
    },
    "leisure": {"park": "Park", "garden": "Garden", "sauna": "Sauna", "swimming_pool": "Swimming"},
    "historic": None,  # any value -> "Historic site"
    "shop": None,      # any value -> "Shop" (with a friendlier label for common ones)
}
SHOP_LABELS = {
    "supermarket": "Supermarket", "convenience": "Convenience store", "bakery": "Bakery", "clothes": "Clothes",
    "books": "Books", "gift": "Gifts", "alcohol": "Systembolaget", "chemist": "Chemist", "department_store": "Department store",
    "mall": "Shopping centre", "confectionery": "Sweets", "coffee": "Coffee", "pastry": "Pastry", "chocolate": "Chocolate",
    "interior_decoration": "Interior", "second_hand": "Second hand", "souvenir": "Souvenirs",
}
UNNAMED_OK = {"Toilets", "ATM", "Drinking water"}


def label_for(tags):
    st = tags.get("railway") == "station" or tags.get("public_transport") == "station"
    if st:
        if tags.get("station") == "subway" or tags.get("subway") == "yes":
            return "Metro"
        if tags.get("railway") == "station":
            return "Train station"
        return "Station"
    for key, mapping in POI_TAGS.items():
        v = tags.get(key)
        if not v:
            continue
        if key == "historic":
            return "Historic site"
        if key == "shop":
            return SHOP_LABELS.get(v, "Shop")
        if v in mapping:
            return mapping[v]
    return None


def hav(lon1, lat1, lon2, lat2):
    r = math.pi / 180
    dla, dlo = (lat2 - lat1) * r, (lon2 - lon1) * r
    a = math.sin(dla / 2) ** 2 + math.cos(lat1 * r) * math.cos(lat2 * r) * math.sin(dlo / 2) ** 2
    return 2 * 6371000 * math.asin(math.sqrt(a))


class Handler(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.ways = []          # (refs, coords, kind, name)
        self.pois = []          # (name, label, lon, lat)
        self.addr = []          # (street, number, lon, lat)
        self.street_pts = defaultdict(list)

    def _poi(self, tags, lon, lat):
        lab = label_for(tags)
        name = tags.get("name")
        if lab and (name or lab in UNNAMED_OK):
            self.pois.append((name or lab, lab, lon, lat))
        st, num = tags.get("addr:street"), tags.get("addr:housenumber")
        if st and num:
            self.addr.append((st, num, lon, lat))

    def node(self, n):
        if len(n.tags) and n.location.valid():
            self._poi(n.tags, n.location.lon, n.location.lat)

    def way(self, w):
        tags = w.tags
        try:
            pts = [(n.ref, n.location.lon, n.location.lat) for n in w.nodes if n.location.valid()]
        except osmium.InvalidLocationError:
            return
        if len(pts) < 2:
            return
        # POIs / addresses mapped as areas: use the average of the outline
        if tags.get("building") or tags.get("amenity") or tags.get("tourism") or tags.get("shop") or tags.get("leisure") or tags.get("historic") or tags.get("addr:housenumber") or tags.get("railway") == "station":
            if not tags.get("highway"):
                lon = sum(p[1] for p in pts) / len(pts)
                lat = sum(p[2] for p in pts) / len(pts)
                self._poi(tags, lon, lat)
        hw = tags.get("highway")
        if hw not in WALK:
            return
        foot, access = tags.get("foot"), tags.get("access")
        if foot in ("no", "private", "use_sidepath"):
            return
        if access in ("no", "private") and foot not in ("yes", "designated", "permissive"):
            return
        if hw in ("trunk", "trunk_link") and foot not in ("yes", "designated", "permissive"):
            return
        if tags.get("area") == "yes" and hw != "pedestrian":
            return
        name = tags.get("name")
        if name:
            mid = pts[len(pts) // 2]
            self.street_pts[name].append((mid[1], mid[2], len(pts)))
        self.ways.append(([p[0] for p in pts], [(p[1], p[2]) for p in pts], KIND.get(hw, 0), name))


def main(src, out):
    h = Handler()
    h.apply_file(src, locations=True, idx="flex_mem")
    print(f"ways {len(h.ways)}, pois {len(h.pois)}, addresses {len(h.addr)}")

    use = defaultdict(int)
    for refs, _, _, _ in h.ways:
        for r in refs:
            use[r] += 1
        use[refs[0]] += 1
        use[refs[-1]] += 1

    vid = {}
    verts = []
    def vertex(ref, lon, lat):
        if ref not in vid:
            vid[ref] = len(verts)
            verts.append((lon, lat))
        return vid[ref]

    names, name_id = [], {}
    edges, geom, kinds, enames = [], [], [], []
    for refs, coords, kind, name in h.ways:
        nid = -1
        if name:
            if name not in name_id:
                name_id[name] = len(names)
                names.append(name)
            nid = name_id[name]
        start = 0
        length = 0.0
        for i in range(1, len(refs)):
            length += hav(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1])
            if use[refs[i]] > 1 or i == len(refs) - 1:
                a = vertex(refs[start], *coords[start])
                b = vertex(refs[i], *coords[i])
                mids = coords[start + 1:i]
                if a != b or mids:
                    edges.append((a, b, max(1, round(length * 10)), len(geom), len(mids)))
                    geom.extend(mids)
                    kinds.append(kind)
                    enames.append(nid)
                start, length = i, 0.0

    nV, nE, nG = len(verts), len(edges), len(geom)
    print(f"graph: {nV} vertices, {nE} edges, {nG} shape points, {len(names)} names")
    names_json = json.dumps(names, ensure_ascii=False).encode("utf-8")
    with open(f"{out}/stockholm-walk.bin", "wb") as f:
        f.write(b"SVW1")
        f.write(struct.pack("<4I", nV, nE, nG, len(names)))
        f.write(struct.pack(f"<{2 * nV}i", *[round(c * 1e6) for v in verts for c in v]))
        f.write(struct.pack(f"<{5 * nE}i", *[x for e in edges for x in e]))
        f.write(struct.pack(f"<{2 * nG}i", *[round(c * 1e6) for g in geom for c in g]))
        f.write(bytes(kinds))
        f.write(struct.pack(f"<{nE}i", *enames))
        f.write(struct.pack("<I", len(names_json)))
        f.write(names_json)

    # Search index: places, one point per street, addresses (deduplicated)
    r5 = lambda x: round(x, 5)
    seen = set()
    pois = []
    for n, lab, lon, lat in h.pois:
        k = (n, lab, round(lon, 3), round(lat, 3))
        if k in seen:
            continue
        seen.add(k)
        pois.append([n, lab, r5(lon), r5(lat)])
    streets = []
    for n, ps in h.street_pts.items():
        ps.sort(key=lambda p: -p[2])
        streets.append([n, r5(ps[0][0]), r5(ps[0][1])])
    seen = set()
    addr = []
    for st, num, lon, lat in h.addr:
        k = (st, num)
        if k in seen:
            continue
        seen.add(k)
        addr.append([st, num, r5(lon), r5(lat)])
    with open(f"{out}/stockholm-search.json", "w", encoding="utf-8") as f:
        json.dump({"pois": pois, "streets": streets, "addr": addr}, f, ensure_ascii=False, separators=(",", ":"))
    print(f"search: {len(pois)} places, {len(streets)} streets, {len(addr)} addresses")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
