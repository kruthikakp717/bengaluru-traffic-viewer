# 🗺️ Bengaluru Traffic & Road Network Viewer

An interactive GIS web application for visualizing Bengaluru's road infrastructure, traffic signals, and transit network using live OpenStreetMap data.

**Live Demo:** https://kruthikakp717.github.io/bengaluru-traffic-viewer

---

## Features

- **Live OSM Data** — Fetches real-time data via the Overpass API
- **Layer Toggles** — Switch on/off traffic signals, roads, highways, bus stops, hospitals
- **Feature Popups** — Click any feature to see its OSM tags and coordinates
- **Info Panel** — Detailed sidebar view for selected features with direct OSM links
- **Stats Bar** — Live count of loaded features
- **Dark UI** — Clean, professional dark theme optimised for map readability

## Layers Available

| Layer | Description | Color |
|---|---|---|
| 🗺️ Base Map | OpenStreetMap tiles | — |
| 🚦 Traffic Signals | All signalised intersections | Green |
| 🛣️ Major Roads | Primary & secondary roads | Amber |
| 🚗 Highways | Motorways & trunk roads | Red |
| 🚌 Bus Stops | BMTC & city bus stops | Purple |
| 🏥 Hospitals | Hospitals & clinics | Pink |

## Tech Stack

- **React 18** — UI framework
- **Leaflet.js** — Interactive map rendering
- **Overpass API** — Live OpenStreetMap data queries
- **GitHub Pages** — Free deployment

## Run Locally

```bash
git clone https://github.com/kruthikakp717/bengaluru-traffic-viewer.git
cd bengaluru-traffic-viewer
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to GitHub Pages

```bash
npm run deploy
```

## Data Sources

- © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) (ODbL licence)
- Spatial queries via [Overpass API](https://overpass-api.de/)

## About

Built as a personal GIS portfolio project demonstrating:
- Web GIS development with React + Leaflet
- Spatial data querying using the Overpass API
- OpenStreetMap integration and feature rendering
- Interactive layer management and feature inspection

Extends work done on urban traffic signal coordination and road network analysis during professional GIS engineering projects.

---

**Author:** Kruthika K P — [LinkedIn](https://www.linkedin.com/in/kruthika-k-p)
