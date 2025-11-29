
import React from 'react';

interface MapProps {
  lat: number;
  lon: number;
  zoom?: number;
}

const Map: React.FC<MapProps> = ({ lat, lon, zoom = 16 }) => {
  // Create a bounding box for a consistent zoom level
  const bbox = [
    lon - 0.005,
    lat - 0.005,
    lon + 0.005,
    lat + 0.005,
  ].join(',');

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  
  return (
    <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={mapUrl}
        style={{ border: 'none' }}
        title="Live Map"
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default Map;
