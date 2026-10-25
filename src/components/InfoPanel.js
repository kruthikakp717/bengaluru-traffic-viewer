import React from 'react';
import './InfoPanel.css';

const TYPE_COLORS = {
  'Traffic Signal': '#22c55e',
  'Bus Stop': '#a78bfa',
  'Hospital': '#f87171',
  'Clinic': '#f87171',
  'Primary Road': '#f59e0b',
  'Secondary Road': '#f59e0b',
  'Highway': '#ef4444',
};

const TYPE_ICONS = {
  'Traffic Signal': '🚦',
  'Bus Stop': '🚌',
  'Hospital': '🏥',
  'Clinic': '🏥',
  'Primary Road': '🛣️',
  'Secondary Road': '🛣️',
  'Highway': '🚗',
};

function InfoPanel({ feature, onClose }) {
  const color = TYPE_COLORS[feature.type] || '#8899aa';
  const icon = TYPE_ICONS[feature.type] || '📍';

  const tagEntries = Object.entries(feature.tags || {}).filter(
    ([k]) => !['created_by', 'source'].includes(k)
  );

  return (
    <div className="info-panel">
      <div className="info-header" style={{ borderLeftColor: color }}>
        <div className="info-type">
          <span className="info-icon">{icon}</span>
          <div>
            <div className="info-type-label" style={{ color }}>{feature.type}</div>
            {feature.tags?.name && (
              <div className="info-name">{feature.tags.name}</div>
            )}
          </div>
        </div>
        <button className="info-close" onClick={onClose}>✕</button>
      </div>

      <div className="info-body">
        <div className="info-section">
          <div className="info-section-title">Location</div>
          {feature.lat && (
            <div className="info-row">
              <span className="info-key">Latitude</span>
              <span className="info-val">{Number(feature.lat).toFixed(6)}°N</span>
            </div>
          )}
          {feature.lon && (
            <div className="info-row">
              <span className="info-key">Longitude</span>
              <span className="info-val">{Number(feature.lon).toFixed(6)}°E</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-key">OSM ID</span>
            <span className="info-val">
              <a
                href={`https://www.openstreetmap.org/${feature.lat ? 'node' : 'way'}/${feature.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="osm-link"
              >
                {feature.id} ↗
              </a>
            </span>
          </div>
        </div>

        {tagEntries.length > 0 && (
          <div className="info-section">
            <div className="info-section-title">OSM Tags</div>
            {tagEntries.map(([k, v]) => (
              <div className="info-row" key={k}>
                <span className="info-key">{k}</span>
                <span className="info-val">{v}</span>
              </div>
            ))}
          </div>
        )}

        <div className="info-section">
          <div className="info-section-title">Data Source</div>
          <div className="info-source">
            <span>📡</span>
            <span>OpenStreetMap via Overpass API</span>
          </div>
          <div className="info-source" style={{ marginTop: 4 }}>
            <span>⚠️</span>
            <span style={{ color: '#5a6878' }}>Data may not reflect current conditions</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoPanel;
