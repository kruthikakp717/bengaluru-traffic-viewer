import React, { useState } from 'react';
import MapView from './components/MapView';
import Header from './components/Header';
import LayerPanel from './components/LayerPanel';
import InfoPanel from './components/InfoPanel';
import StatsBar from './components/StatsBar';
import './App.css';

function App() {
  const [layers, setLayers] = useState({
    osm: true,
    traffic_signals: true,
    major_roads: true,
    highways: false,
    bus_stops: false,
    hospitals: false,
  });

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [stats, setStats] = useState({ signals: 0, roads: 0, busStops: 0 });

  const toggleLayer = (layerKey) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div className="app">
      <Header />
      <div className="main-content">
        <LayerPanel layers={layers} onToggle={toggleLayer} />
        <div className="map-container">
          <MapView
            layers={layers}
            onFeatureSelect={setSelectedFeature}
            onStatsUpdate={setStats}
          />
          <StatsBar stats={stats} />
        </div>
        {selectedFeature && (
          <InfoPanel feature={selectedFeature} onClose={() => setSelectedFeature(null)} />
        )}
      </div>
    </div>
  );
}

export default App;
