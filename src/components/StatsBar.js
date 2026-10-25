import React from 'react';
import './StatsBar.css';

function StatsBar({ stats }) {
  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span className="stat-icon">🚦</span>
        <div className="stat-info">
          <span className="stat-value">{stats.signals || '–'}</span>
          <span className="stat-label">Traffic Signals</span>
        </div>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-icon">🛣️</span>
        <div className="stat-info">
          <span className="stat-value">{stats.roads || '–'}</span>
          <span className="stat-label">Road Segments</span>
        </div>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-icon">🚌</span>
        <div className="stat-info">
          <span className="stat-value">{stats.busStops || '–'}</span>
          <span className="stat-label">Bus Stops</span>
        </div>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-icon">📍</span>
        <div className="stat-info">
          <span className="stat-value">Bengaluru</span>
          <span className="stat-label">Karnataka, India</span>
        </div>
      </div>
      <div className="stat-right">
        <span className="live-badge">● LIVE OSM DATA</span>
      </div>
    </div>
  );
}

export default StatsBar;
