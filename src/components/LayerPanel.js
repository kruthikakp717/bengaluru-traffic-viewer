import React, { useState } from 'react';
import './LayerPanel.css';

const LAYER_CONFIG = [
  {
    key: 'osm',
    label: 'Base Map (OSM)',
    icon: '🗺️',
    color: '#4a9eff',
    description: 'OpenStreetMap tiles',
    category: 'Base'
  },
  {
    key: 'major_roads',
    label: 'Major Roads',
    icon: '🛣️',
    color: '#f59e0b',
    description: 'Primary & secondary roads',
    category: 'Transport'
  },
  {
    key: 'highways',
    label: 'Highways & Expressways',
    icon: '🚗',
    color: '#ef4444',
    description: 'National & state highways',
    category: 'Transport'
  },
  {
    key: 'traffic_signals',
    label: 'Traffic Signals',
    icon: '🚦',
    color: '#22c55e',
    description: 'Signal locations from OSM',
    category: 'Traffic'
  },
  {
    key: 'bus_stops',
    label: 'Bus Stops (BMTC)',
    icon: '🚌',
    color: '#a78bfa',
    description: 'Public transit stops',
    category: 'Transit'
  },
  {
    key: 'hospitals',
    label: 'Hospitals & Clinics',
    icon: '🏥',
    color: '#f87171',
    description: 'Medical facilities',
    category: 'POI'
  },
];

function LayerPanel({ layers, onToggle }) {
  const [collapsed, setCollapsed] = useState(false);

  const categories = [...new Set(LAYER_CONFIG.map(l => l.category))];

  return (
    <div className={`layer-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="panel-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="panel-title">
          <span className="panel-icon">⚡</span>
          Layers
        </span>
        <button className="collapse-btn">{collapsed ? '▶' : '◀'}</button>
      </div>

      {!collapsed && (
        <div className="panel-body">
          {categories.map(cat => (
            <div key={cat} className="layer-category">
              <div className="category-label">{cat}</div>
              {LAYER_CONFIG.filter(l => l.category === cat).map(layer => (
                <div
                  key={layer.key}
                  className={`layer-item ${layers[layer.key] ? 'active' : ''}`}
                  onClick={() => onToggle(layer.key)}
                >
                  <div className="layer-toggle">
                    <div
                      className={`toggle-track ${layers[layer.key] ? 'on' : 'off'}`}
                      style={layers[layer.key] ? { background: layer.color + '55', borderColor: layer.color } : {}}
                    >
                      <div className="toggle-thumb" />
                    </div>
                  </div>
                  <div className="layer-info">
                    <span className="layer-icon">{layer.icon}</span>
                    <div>
                      <div className="layer-name">{layer.label}</div>
                      <div className="layer-desc">{layer.description}</div>
                    </div>
                  </div>
                  <div
                    className="layer-color-dot"
                    style={{ background: layer.color, opacity: layers[layer.key] ? 1 : 0.3 }}
                  />
                </div>
              ))}
            </div>
          ))}

          <div className="panel-footer">
            <div className="data-source">
              <span>📡</span> Data: OpenStreetMap via Overpass API
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LayerPanel;
