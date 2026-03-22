import React, { useState, useEffect, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapView = ({ activities, onOpenDetail }) => {
  const mapRef = useRef();
  const [popupInfo, setPopupInfo] = useState(null);
  
  const [viewState, setViewState] = useState({
    latitude: -1.831239,
    longitude: -78.183406,
    zoom: 6,
    pitch: 45, // Inclinación para efecto 3D
    bearing: 0
  });

  useEffect(() => {
    if (!activities || activities.length === 0 || !mapRef.current) return;

    const validActivities = activities.filter(a => parseFloat(a.latitud) && parseFloat(a.longitud));
    
    if (validActivities.length > 0) {
      const lats = validActivities.map(a => parseFloat(a.latitud));
      const lngs = validActivities.map(a => parseFloat(a.longitud));
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      // Usar timeout para asegurar que el mapa está cargado
      const timeout = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.fitBounds(
            [[minLng, minLat], [maxLng, maxLat]],
            { padding: 100, duration: 2000 }
          );
        }
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [activities]);

  return (
    <div className="w-full h-[600px] rounded-[40px] overflow-hidden border border-slate-100 shadow-sm relative z-0 bg-slate-50">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {activities.map(activity => {
          const lat = parseFloat(activity.latitud);
          const lng = parseFloat(activity.longitud);
          
          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker 
              key={activity.id} 
              latitude={lat} 
              longitude={lng} 
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setPopupInfo(activity);
              }}
            >
              <div className="cursor-pointer group">
                <div className="flex flex-col items-center bg-white p-2 rounded-2xl border-2 border-primary shadow-lg transform group-hover:scale-110 transition-all duration-300">
                   <div className="bg-primary w-2 h-2 rounded-full animate-ping absolute -top-1"></div>
                   <span className="bg-primary text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                      ${activity.price || activity.precio}
                   </span>
                   {/* Flecha pequeña hacia abajo */}
                   <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-primary mt-0.5"></div>
                </div>
              </div>
            </Marker>
          );
        })}

        {popupInfo && (
          <Popup
            anchor="top"
            latitude={parseFloat(popupInfo.latitud)}
            longitude={parseFloat(popupInfo.longitud)}
            onClose={() => setPopupInfo(null)}
            closeButton={false}
            className="z-50"
            offset={15}
          >
            <div 
              className="flex flex-col items-center p-2 cursor-pointer bg-white rounded-lg"
              onClick={() => onOpenDetail(popupInfo)}
            >
              <span className="font-bold text-slate-800 text-sm mb-1">{popupInfo.titulo || popupInfo.title}</span>
              <span className="bg-primary/10 text-primary text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Ver Detalles
              </span>
            </div>
          </Popup>
        )}
      </Map>
      
      {/* Overlay de ayuda */}
      <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-slate-100 pointer-events-none z-10">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Map Engine</p>
         <p className="text-sm font-black text-primary italic">Mapbox Premium</p>
      </div>
    </div>
  );
};

export default MapView;
