import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix Leaflet default icon path issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Bengaluru bounds
const BENGALURU_CENTER = [12.9716, 77.5946];
const BENGALURU_BOUNDS = [[12.834, 77.461], [13.144, 77.784]];

// Overpass API query builder
function buildOverpassQuery(type, extraFilter = '') {
  const bbox = '12.834,77.461,13.144,77.784';
  return `https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(${type}[${extraFilter}](${bbox}););out body;>;out skel qt;`;
}

// Custom marker icons
function createCircleIcon(color, size = 10) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid rgba(255,255,255,0.8);
      border-radius:50%;
      box-shadow:0 0 6px ${color}88;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapView({ layers, onFeatureSelect, onStatsUpdate }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerRefs = useRef({});
  const tileLayerRef = useRef(null);
  const loadingRef = useRef({});

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: BENGALURU_CENTER,
      zoom: 12,
      maxBounds: L.latLngBounds(
        [BENGALURU_BOUNDS[0][0] - 0.1, BENGALURU_BOUNDS[0][1] - 0.1],
        [BENGALURU_BOUNDS[1][0] + 0.1, BENGALURU_BOUNDS[1][1] + 0.1]
      ),
      maxZoom: 18,
      minZoom: 10,
    });

    // OSM tile layer
    tileLayerRef.current = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(map);

    // Dark tile alternative for when OSM is off
    mapInstanceRef.current = map;

    // Add scale control
    L.control.scale({ imperial: false, metric: true, position: 'bottomright' }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Toggle OSM base layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    if (layers.osm) {
      if (!mapInstanceRef.current.hasLayer(tileLayerRef.current)) {
        tileLayerRef.current.addTo(mapInstanceRef.current);
      }
    } else {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
  }, [layers.osm]);

  const fetchAndRender = useCallback(async (layerKey, query, renderFn) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing layer
    if (layerRefs.current[layerKey]) {
      map.removeLayer(layerRefs.current[layerKey]);
      layerRefs.current[layerKey] = null;
    }

    if (!layers[layerKey] || loadingRef.current[layerKey]) return;
    loadingRef.current[layerKey] = true;

    try {
      const res = await fetch(query);
      const data = await res.json();
      const layer = renderFn(data.elements || []);
      if (layer && layers[layerKey] && mapInstanceRef.current) {
        layer.addTo(mapInstanceRef.current);
        layerRefs.current[layerKey] = layer;
      }
    } catch (e) {
      console.warn(`Failed to load ${layerKey}:`, e);
    } finally {
      loadingRef.current[layerKey] = false;
    }
  }, [layers]);

  // Traffic signals
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!layers.traffic_signals) {
      if (layerRefs.current.traffic_signals) {
        map.removeLayer(layerRefs.current.traffic_signals);
        layerRefs.current.traffic_signals = null;
      }
      return;
    }

    if (layerRefs.current.traffic_signals) return; // already loaded

    const url = buildOverpassQuery('node', '"highway"="traffic_signals"');
    fetchAndRender('traffic_signals', url, (elements) => {
      const group = L.layerGroup();
      let count = 0;
      elements.forEach(el => {
        if (el.type !== 'node') return;
        const marker = L.marker([el.lat, el.lon], {
          icon: createCircleIcon('#22c55e', 10)
        });
        marker.bindPopup(`
          <div class="popup-content">
            <div class="popup-type signal">🚦 Traffic Signal</div>
            <div class="popup-row"><b>OSM ID:</b> ${el.id}</div>
            <div class="popup-row"><b>Coordinates:</b> ${el.lat.toFixed(5)}, ${el.lon.toFixed(5)}</div>
            ${el.tags?.name ? `<div class="popup-row"><b>Name:</b> ${el.tags.name}</div>` : ''}
            ${el.tags?.crossing ? `<div class="popup-row"><b>Crossing:</b> ${el.tags.crossing}</div>` : ''}
          </div>
        `);
        marker.on('click', () => onFeatureSelect({ type: 'Traffic Signal', id: el.id, lat: el.lat, lon: el.lon, tags: el.tags || {} }));
        group.addLayer(marker);
        count++;
      });
      onStatsUpdate(prev => ({ ...prev, signals: count }));
      return group;
    });
  }, [layers.traffic_signals, fetchAndRender, onFeatureSelect, onStatsUpdate]);

  // Bus stops
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!layers.bus_stops) {
      if (layerRefs.current.bus_stops) {
        map.removeLayer(layerRefs.current.bus_stops);
        layerRefs.current.bus_stops = null;
      }
      return;
    }

    if (layerRefs.current.bus_stops) return;

    const url = buildOverpassQuery('node', '"highway"="bus_stop"');
    fetchAndRender('bus_stops', url, (elements) => {
      const group = L.layerGroup();
      let count = 0;
      elements.forEach(el => {
        if (el.type !== 'node') return;
        const marker = L.marker([el.lat, el.lon], {
          icon: createCircleIcon('#a78bfa', 8)
        });
        marker.bindPopup(`
          <div class="popup-content">
            <div class="popup-type bus">🚌 Bus Stop</div>
            <div class="popup-row"><b>Name:</b> ${el.tags?.name || 'Unknown Stop'}</div>
            <div class="popup-row"><b>OSM ID:</b> ${el.id}</div>
            <div class="popup-row"><b>Coordinates:</b> ${el.lat.toFixed(5)}, ${el.lon.toFixed(5)}</div>
            ${el.tags?.network ? `<div class="popup-row"><b>Network:</b> ${el.tags.network}</div>` : ''}
          </div>
        `);
        marker.on('click', () => onFeatureSelect({ type: 'Bus Stop', id: el.id, lat: el.lat, lon: el.lon, tags: el.tags || {} }));
        group.addLayer(marker);
        count++;
      });
      onStatsUpdate(prev => ({ ...prev, busStops: count }));
      return group;
    });
  }, [layers.bus_stops, fetchAndRender, onFeatureSelect, onStatsUpdate]);

  // Hospitals
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!layers.hospitals) {
      if (layerRefs.current.hospitals) {
        map.removeLayer(layerRefs.current.hospitals);
        layerRefs.current.hospitals = null;
      }
      return;
    }

    if (layerRefs.current.hospitals) return;

    const url = buildOverpassQuery('node', '"amenity"~"hospital|clinic"');
    fetchAndRender('hospitals', url, (elements) => {
      const group = L.layerGroup();
      elements.forEach(el => {
        if (el.type !== 'node') return;
        const marker = L.marker([el.lat, el.lon], {
          icon: createCircleIcon('#f87171', 9)
        });
        marker.bindPopup(`
          <div class="popup-content">
            <div class="popup-type hospital">🏥 ${el.tags?.amenity === 'hospital' ? 'Hospital' : 'Clinic'}</div>
            <div class="popup-row"><b>Name:</b> ${el.tags?.name || 'Unknown'}</div>
            <div class="popup-row"><b>Coordinates:</b> ${el.lat.toFixed(5)}, ${el.lon.toFixed(5)}</div>
          </div>
        `);
        marker.on('click', () => onFeatureSelect({ type: el.tags?.amenity === 'hospital' ? 'Hospital' : 'Clinic', id: el.id, lat: el.lat, lon: el.lon, tags: el.tags || {} }));
        group.addLayer(marker);
      });
      return group;
    });
  }, [layers.hospitals, fetchAndRender, onFeatureSelect, onStatsUpdate]);

  // Major roads
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!layers.major_roads) {
      if (layerRefs.current.major_roads) {
        map.removeLayer(layerRefs.current.major_roads);
        layerRefs.current.major_roads = null;
      }
      return;
    }

    if (layerRefs.current.major_roads) return;

    const url = buildOverpassQuery('way', '"highway"~"primary|secondary"');
    fetchAndRender('major_roads', url, (elements) => {
      const nodeMap = {};
      elements.forEach(el => { if (el.type === 'node') nodeMap[el.id] = [el.lat, el.lon]; });
      const group = L.layerGroup();
      let count = 0;
      elements.forEach(el => {
        if (el.type !== 'way') return;
        const coords = (el.nodes || []).map(id => nodeMap[id]).filter(Boolean);
        if (coords.length < 2) return;
        const line = L.polyline(coords, {
          color: '#f59e0b',
          weight: el.tags?.highway === 'primary' ? 3 : 2,
          opacity: 0.8,
        });
        line.bindPopup(`
          <div class="popup-content">
            <div class="popup-type road">🛣️ ${el.tags?.highway === 'primary' ? 'Primary Road' : 'Secondary Road'}</div>
            ${el.tags?.name ? `<div class="popup-row"><b>Name:</b> ${el.tags.name}</div>` : ''}
            ${el.tags?.ref ? `<div class="popup-row"><b>Ref:</b> ${el.tags.ref}</div>` : ''}
            ${el.tags?.lanes ? `<div class="popup-row"><b>Lanes:</b> ${el.tags.lanes}</div>` : ''}
            ${el.tags?.maxspeed ? `<div class="popup-row"><b>Max Speed:</b> ${el.tags.maxspeed}</div>` : ''}
          </div>
        `);
        line.on('click', () => onFeatureSelect({ type: el.tags?.highway === 'primary' ? 'Primary Road' : 'Secondary Road', id: el.id, tags: el.tags || {} }));
        group.addLayer(line);
        count++;
      });
      onStatsUpdate(prev => ({ ...prev, roads: count }));
      return group;
    });
  }, [layers.major_roads, fetchAndRender, onFeatureSelect, onStatsUpdate]);

  // Highways
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!layers.highways) {
      if (layerRefs.current.highways) {
        map.removeLayer(layerRefs.current.highways);
        layerRefs.current.highways = null;
      }
      return;
    }

    if (layerRefs.current.highways) return;

    const url = buildOverpassQuery('way', '"highway"~"motorway|trunk"');
    fetchAndRender('highways', url, (elements) => {
      const nodeMap = {};
      elements.forEach(el => { if (el.type === 'node') nodeMap[el.id] = [el.lat, el.lon]; });
      const group = L.layerGroup();
      elements.forEach(el => {
        if (el.type !== 'way') return;
        const coords = (el.nodes || []).map(id => nodeMap[id]).filter(Boolean);
        if (coords.length < 2) return;
        const line = L.polyline(coords, {
          color: '#ef4444',
          weight: 4,
          opacity: 0.9,
        });
        line.bindPopup(`
          <div class="popup-content">
            <div class="popup-type highway">🚗 ${el.tags?.highway === 'motorway' ? 'Motorway' : 'Trunk Road'}</div>
            ${el.tags?.name ? `<div class="popup-row"><b>Name:</b> ${el.tags.name}</div>` : ''}
            ${el.tags?.ref ? `<div class="popup-row"><b>Ref:</b> ${el.tags.ref}</div>` : ''}
            ${el.tags?.lanes ? `<div class="popup-row"><b>Lanes:</b> ${el.tags.lanes}</div>` : ''}
          </div>
        `);
        line.on('click', () => onFeatureSelect({ type: 'Highway', id: el.id, tags: el.tags || {} }));
        group.addLayer(line);
      });
      return group;
    });
  }, [layers.highways, fetchAndRender, onFeatureSelect, onStatsUpdate]);

  return (
    <div ref={mapRef} className="map-view">
      <style>{`
        .popup-content { font-family: 'Segoe UI', Arial, sans-serif; min-width: 180px; }
        .popup-type { font-size: 13px; font-weight: 700; margin-bottom: 8px; padding: 4px 8px; border-radius: 4px; }
        .popup-type.signal { background: #dcfce7; color: #166534; }
        .popup-type.bus { background: #ede9fe; color: #4c1d95; }
        .popup-type.hospital { background: #fee2e2; color: #7f1d1d; }
        .popup-type.road { background: #fef3c7; color: #78350f; }
        .popup-type.highway { background: #fee2e2; color: #7f1d1d; }
        .popup-row { font-size: 11px; color: #374151; margin: 3px 0; }
        .popup-row b { color: #111827; }
        .leaflet-popup-content-wrapper { border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
      `}</style>
    </div>
  );
}

export default MapView;
