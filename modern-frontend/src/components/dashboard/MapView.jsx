import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  tooltipAnchor: [16, -28],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom component to fit map to bounds
const MapBounds = ({ activities }) => {
  const map = useMap();

  useEffect(() => {
    if (!activities || activities.length === 0) return;

    const validActivities = activities.filter(a => parseFloat(a.latitud) && parseFloat(a.longitud));
    
    if (validActivities.length > 0) {
      const bounds = L.latLngBounds(validActivities.map(a => [parseFloat(a.latitud), parseFloat(a.longitud)]));
      
      // If there's only one marker, center on it but don't zoom in too much
      if (validActivities.length === 1) {
         map.setView([parseFloat(validActivities[0].latitud), parseFloat(validActivities[0].longitud)], 13);
      } else {
         map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    } else {
       map.setView([-1.831239, -78.183406], 7); // Center of Ecuador
    }
  }, [activities, map]);

  return null;
};

const MapView = ({ activities, onOpenDetail }) => {
  return (
    <div className="w-full h-[600px] rounded-[40px] overflow-hidden border border-slate-100 shadow-sm relative z-0 bg-[#e5e5f7]">
      <MapContainer 
        center={[-1.831239, -78.183406]} 
        zoom={7} 
        minZoom={3}
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', backgroundColor: '#e5e5f7' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          noWrap={true}
        />
        <MapBounds activities={activities} />
        
        {activities.map(activity => {
          const lat = parseFloat(activity.latitud);
          const lng = parseFloat(activity.longitud);
          
          if (!lat || !lng) return null;

          return (
            <Marker 
              key={activity.id} 
              position={[lat, lng]}
              eventHandlers={{
                click: () => onOpenDetail(activity),
              }}
            >
              <Tooltip direction="top" offset={[0, -30]} opacity={1} className="custom-tooltip shadow-2xl border-0 !p-0 !bg-transparent">
                <div className="flex flex-col items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-xl">
                  <span className="font-bold text-slate-800 text-sm mb-2">{activity.title || activity.titulo}</span>
                  <span className="bg-primary hover:bg-primary-dark transition-colors text-white font-black text-xs px-3 py-1 rounded-full shadow-sm">
                    ${activity.price || activity.precio}
                  </span>
                  <span className="text-[9px] text-primary/70 mt-2 uppercase tracking-wider font-bold">Clic para Detalles</span>
                </div>
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
