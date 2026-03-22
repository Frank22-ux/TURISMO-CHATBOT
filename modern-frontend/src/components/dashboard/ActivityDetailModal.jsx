import { useState, useEffect } from 'react';
import { X, MapPin, Clock, Users, Signal, Tag, Calendar, Star, Info, Image as ImageIcon } from 'lucide-react';
import Map, { Marker, Source } from 'react-map-gl/mapbox';
import { motion, AnimatePresence } from 'framer-motion';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const ActivityDetailModal = ({ isOpen, onClose, activity }) => {
  const [activeImage, setActiveImage] = useState(null);
  const [position, setPosition] = useState({ lat: -0.180653, lng: -78.467834 });
  const [showTerrain, setShowTerrain] = useState(true);
  const [viewState, setViewState] = useState({
    latitude: -0.180653,
    longitude: -78.467834,
    zoom: 13,
    pitch: 50
  });

  useEffect(() => {
    if (activity) {
      setActiveImage(activity.image || activity.portada || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80");
      const newLat = parseFloat(activity.latitud) || -0.180653;
      const newLng = parseFloat(activity.longitud) || -78.467834;
      setPosition({ lat: newLat, lng: newLng });
      setViewState(prev => ({
        ...prev,
        latitude: newLat,
        longitude: newLng,
      }));
    }
  }, [activity]);

  if (!isOpen || !activity) return null;

  const gallery = Array.isArray(activity.galeria) ? activity.galeria : [];
  const hasGallery = gallery.length > 0;
  const allImages = [activity.image || activity.portada, ...gallery].filter(Boolean);

  const isActive = activity.estado === 'ACTIVA';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[40px] shadow-2xl relative flex flex-col overflow-hidden"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-50 p-3 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white hover:text-primary-dark transition-all shadow-xl border border-white/20"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex-1 overflow-auto">
            {/* Hero Image Section */}
            <div className="relative h-[450px] w-full bg-slate-100 group">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  src={activeImage} 
                  className="w-full h-full object-cover"
                  alt={activity.title || activity.titulo}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
              
              {/* Gallery Thumbnails Overlay */}
              {allImages.length > 1 && (
                <div className="absolute bottom-32 left-10 right-10 flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                  {allImages.map((img, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 shadow-lg ${
                        activeImage === img ? 'border-primary ring-4 ring-primary/20 scale-110' : 'border-white/50 hover:border-white'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                    </motion.button>
                  ))}
                </div>
              )}
              
              <div className="absolute bottom-8 left-10 right-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                    isActive ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {activity.estado}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-primary-dark text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {activity.id_categoria === '1' ? 'Aventura' : 'Cultura'}
                  </span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight">
                  {activity.title || activity.titulo}
                </h2>
              </div>
            </div>

            {/* Content Grid */}
            <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column: Details */}
              <div className="lg:col-span-2 space-y-10">
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <Info className="w-4 h-4" /> Descripción de la Experiencia
                  </h3>
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    {activity.descripcion || 'Sin descripción disponible.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-2">
                    <Clock className="w-6 h-6 text-primary" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duración</p>
                    <p className="font-bold text-slate-800">{activity.duracion_horas} Horas</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-2">
                    <Signal className="w-6 h-6 text-primary" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dificultad</p>
                    <p className="font-bold text-slate-800">{activity.nivel_dificultad}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacidad</p>
                    <p className="font-bold text-slate-800">{activity.capacidad} Pers.</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-2">
                    <Star className="w-6 h-6 text-amber-500" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</p>
                    <p className="font-bold text-slate-800">4.9/5</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Ubicación Geográfica
                  </h3>
                  <div className="h-64 rounded-[32px] overflow-hidden border-2 border-slate-50 shadow-inner z-0">
                    <Map
                      {...viewState}
                      onMove={evt => setViewState(evt.viewState)}
                      mapStyle={showTerrain ? "mapbox://styles/mapbox/outdoors-v12" : "mapbox://styles/mapbox/streets-v12"}
                      mapboxAccessToken={MAPBOX_TOKEN}
                      style={{ width: '100%', height: '100%' }}
                      terrain={showTerrain ? { source: 'mapbox-dem', exaggeration: 1.5 } : null}
                    >
                      <Source
                        id="mapbox-dem"
                        type="raster-dem"
                        url="mapbox://mapbox.mapbox-terrain-dem-v1"
                        tileSize={512}
                        maxzoom={14}
                      />
                      <Marker latitude={position.lat} longitude={position.lng} anchor="bottom">
                         <div className="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                            <MapPin className="w-3 h-3 text-white" />
                         </div>
                      </Marker>

                      {/* Botón de cambio 2D/3D */}
                      <div className="absolute top-4 right-4 z-10">
                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = !showTerrain;
                            setShowTerrain(nextVal);
                            setViewState(prev => ({ ...prev, pitch: nextVal ? 50 : 0 }));
                          }}
                          className={`w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center font-black text-[10px] transition-all hover:scale-110 active:scale-95 border border-white/50 ${showTerrain ? 'text-primary' : 'text-slate-500'}`}
                        >
                          {showTerrain ? '2D' : '3D'}
                        </button>
                      </div>
                    </Map>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 font-bold">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span>{activity.location || `${activity.direccion}, ${activity.ciudad}, ${activity.provincia}`}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Pricing & Quick Actions */}
              <div className="space-y-6">
                <div className="bg-primary-dark p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                  <Tag className="absolute -top-10 -right-10 w-40 h-40 opacity-10" />
                  <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-2">Precio por persona</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-display font-black">${activity.price || activity.precio}</span>
                    <span className="text-sm opacity-60 font-bold uppercase tracking-widest">USD</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Disponibilidad</p>
                        <p className="text-xs font-bold font-display">Todo el año</p>
                      </div>
                    </div>
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex items-center gap-4">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Tipo de Grupo</p>
                        <p className="text-xs font-bold font-display">Familiar / Individual</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-center mt-8 opacity-40 uppercase font-black tracking-widest">
                    Precios finales con impuestos incluidos
                  </p>
                </div>

                <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Lo que incluye</h4>
                  <ul className="space-y-3">
                    {['Guía profesional', 'Equipo de seguridad', 'Transporte local', 'Snacks y agua'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ActivityDetailModal;
