import { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { X, MapPin, Clock, Users, Signal, Tag, Calendar, Star, Info, Image as ImageIcon, Plus, CheckCircle2, MessageSquare, User, Flag } from 'lucide-react';
import MapboxMap, { Marker, Source } from 'react-map-gl/mapbox';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const Map = MAPBOX_TOKEN ? MapboxMap : ({ children, style, className }) => (
    <div style={style} className={`bg-slate-100 border border-red-200 flex flex-col items-center justify-center p-6 text-center text-red-500 rounded-[2rem] ${className || ''}`}>
        <span className="font-black text-lg mb-2">Error de Mapbox</span>
        <span className="text-sm font-bold text-slate-500">El token VITE_MAPBOX_ACCESS_TOKEN no está configurado.</span>
    </div>
);

const ActivityDetailModal = ({ isOpen, onClose, activity }) => {
  // Helper para asegurar que las URLs sean absolutas
  const getImageUrl = (url) => {
    if (!url) return null;
    // Si ya es una URL completa o base64, no modificar
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    
    // Usar la variable de entorno directamente como solicita el usuario
    const baseUrl = import.meta.env.VITE_API_URL || '';
    if (!baseUrl) return url;
    
    return `${baseUrl}/${url.replace(/^\//, '')}`;
  };

  const [activeImage, setActiveImage] = useState(null);
  const [position, setPosition] = useState({ lat: -0.180653, lng: -78.467834 });
  const [showTerrain, setShowTerrain] = useState(true);
  const cart = useCart();
  const { addToCart, selectedItems } = cart || { addToCart: () => {}, selectedItems: [] };
  const [added, setAdded] = useState(false);
  const isAlreadyInCart = selectedItems?.some(item => item.id === activity?.id);

  const [viewState, setViewState] = useState({
    latitude: -0.180653,
    longitude: -78.467834,
    zoom: 13,
    pitch: 50
  });

  const [meetingViewState, setMeetingViewState] = useState({
    latitude: -0.180653,
    longitude: -78.467834,
    zoom: 14,
    pitch: 0
  });

  const handleAddToCart = () => {
    const result = addToCart(activity);
    if (result.success || result.error === 'DUPLICATE') {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const [toast, setToast] = useState(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSendMessage = async () => {
    const userData = sessionStorage.getItem('user');
    if (!userData) {
      showToast('Debes iniciar sesión para contactar al anfitrión.', 'error');
      return;
    }
    
    if (!activity.id_anfitrion) {
      showToast('El anfitrión de esta actividad no está disponible.', 'error');
      return;
    }
    
    const token = sessionStorage.getItem('token');
    const mensajePlantilla = `¡Hola! Me interesa la actividad "${activity.title || activity.titulo}". ¿Me podrías dar un poco más de información sobre esta experiencia y si hay algún consejo extra?`;

    setIsSendingMessage(true);
    try {
      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_receptor: activity.id_anfitrion,
          contenido: mensajePlantilla
        })
      });
      
      if (response.ok) {
        showToast('¡Se ha enviado tu consulta al anfitrión exitosamente!', 'success');
      } else {
        showToast('No se pudo enviar el mensaje. Intenta de nuevo.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al intentar contactar al anfitrión.', 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

  useEffect(() => {
    if (activity) {
      // Tarea 3: Validar diferencias de data con logs específicos
      const isDashboard = window.location.pathname.includes('/dashboard');
      if (isDashboard) {
        console.log("ANFITRION:", activity);
      } else {
        console.log("TURISTA:", activity);
      }
      
      // Tarea 2 y 6: Unificar lógica y evitar errores de mapeo
      const cover = activity.coverImage || activity.image || activity.portada || null;
      const gallery = activity.images || activity.gallery || activity.galeria || [];
      
      console.log("COVER:", cover);
      console.log("GALLERY:", gallery);

      // Inicializar imagen activa (Tarea 2)
      const initialImg = getImageUrl(cover) || (Array.isArray(gallery) && gallery.length > 0 ? getImageUrl(gallery[0]) : "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80");
      setActiveImage(initialImg);

      const newLat = parseFloat(activity.latitud) || -0.180653;
      const newLng = parseFloat(activity.longitud) || -78.467834;
      setPosition({ lat: newLat, lng: newLng });
      setViewState(prev => ({
        ...prev,
        latitude: newLat,
        longitude: newLng,
      }));

      if (activity.latitud_encuentro && activity.longitud_encuentro) {
        setMeetingViewState(prev => ({
          ...prev,
          latitude: parseFloat(activity.latitud_encuentro),
          longitude: parseFloat(activity.longitud_encuentro)
        }));
      }
    }
  }, [activity]);

  if (!isOpen || !activity) return null;

  // Tarea 2 y 5: Unificar lógica de renderizado
  const cover = activity.coverImage || activity.image || activity.portada || null;
  const gallery = activity.images || activity.gallery || activity.galeria || [];
  
  // Construir lista para la galería (Tarea 2)
  const galleryImages = [cover, ...(Array.isArray(gallery) ? gallery : [])]
    .filter(Boolean)
    .map(getImageUrl)
    .filter(Boolean);
  
  // Eliminar duplicados de URLs completas
  const displayImages = [...new Set(galleryImages)];
  
  const placeholder = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
  
  const finalGallery = displayImages.length > 0 ? displayImages : [placeholder];
  const hasGallery = finalGallery.length > 1;

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
          {/* Custom Toast Notification */}
          <AnimatePresence>
            {toast && (
              <motion.div 
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 30, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                className="absolute top-0 left-0 right-0 z-[200] flex justify-center px-4 pointer-events-none"
              >
                <div className={`shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 backdrop-blur-md border ${toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white shadow-emerald-500/30' : 'bg-red-500/90 border-red-400 text-white shadow-red-500/30'}`}>
                   {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <X className="w-6 h-6" />}
                   <p className="font-bold text-sm tracking-wide">{toast.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                  src={activeImage || placeholder} 
                  className="w-full h-full object-cover"
                  alt={activity.title || activity.titulo}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
              
              {/* Gallery Thumbnails Overlay (Tarea 5) */}
              {hasGallery && (
                <div className="absolute bottom-32 left-10 right-10 flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                  {finalGallery.map((img, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 shadow-lg ${
                        activeImage === img ? 'border-primary ring-4 ring-primary/20 scale-110' : 'border-white/50 hover:border-white'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                    </motion.button>
                  ))}
                </div>
              )}
              
              <div className="absolute bottom-8 left-10 right-10">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                    isActive ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {activity.estado}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-primary-dark text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {activity.id_categoria === '1' ? 'Aventura' : 'Cultura'}
                  </span>
                  {activity.nombre_anfitrion && (
                    <span className="px-4 py-1.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      Por: {activity.nombre_anfitrion}
                    </span>
                  )}
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

                      {/* Botón de cambio 2D/3D - Movido a la izquierda */}
                      <div className="absolute top-4 left-4 z-10">
                        <button
                          type="button"
                          onClick={() => {
                            const nextVal = !showTerrain;
                            setShowTerrain(nextVal);
                            setViewState(prev => ({ ...prev, pitch: nextVal ? 50 : 0 }));
                          }}
                          className={`px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center font-black text-[10px] transition-all hover:scale-110 active:scale-95 border border-white/50 ${showTerrain ? 'text-primary' : 'text-slate-500'}`}
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
                    <span>{activity.location || [activity.direccion, activity.ciudad, activity.provincia].filter(Boolean).join(', ') || 'Ubicación no especificada'}</span>
                  </div>

                  {/* Meeting Point Section */}
                  {(activity.punto_encuentro || (activity.latitud_encuentro && activity.longitud_encuentro)) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-8 bg-amber-50 rounded-[32px] border-2 border-amber-200 shadow-xl shadow-amber-500/5 space-y-6"
                    >
                      <h4 className="text-sm font-black text-amber-800 uppercase tracking-[0.2em] flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-amber-600" /> Punto de Encuentro Confirmado
                      </h4>
                      
                      {activity.latitud_encuentro && activity.longitud_encuentro && (
                        <div className="h-48 rounded-[24px] overflow-hidden border-2 border-amber-100 shadow-inner z-0">
                          <Map
                            {...meetingViewState}
                            onMove={evt => setMeetingViewState(evt.viewState)}
                            mapStyle="mapbox://styles/mapbox/streets-v12"
                            mapboxAccessToken={MAPBOX_TOKEN}
                            style={{ width: '100%', height: '100%' }}
                          >
                            <Marker latitude={parseFloat(activity.latitud_encuentro)} longitude={parseFloat(activity.longitud_encuentro)} anchor="bottom">
                               <div className="w-8 h-8 bg-amber-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-bounce">
                                  <Flag className="w-4 h-4 text-white" />
                               </div>
                            </Marker>
                          </Map>
                        </div>
                      )}

                      {activity.direccion_encuentro && (
                        <div className="flex items-center gap-4 text-amber-800 font-bold bg-amber-500/10 p-4 rounded-2xl border border-amber-200 mt-4 mb-2">
                           <MapPin className="w-5 h-5 flex-shrink-0 text-amber-600" />
                           <span className="text-sm">{activity.direccion_encuentro}</span>
                        </div>
                      )}

                      {activity.punto_encuentro && (
                        <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-amber-100">
                          <p className="text-amber-900 font-bold leading-relaxed">
                            {activity.punto_encuentro}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest text-center italic">
                        Solo tú y el anfitrión pueden ver esta información
                      </p>
                    </motion.div>
                  )}
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

                  {cart && (
                    <div className="mt-6 flex flex-col gap-3">
                      <button 
                        onClick={handleAddToCart}
                        disabled={added}
                        className={`w-full py-4 rounded-2xl font-black text-xs transition-all shadow-xl flex items-center justify-center gap-3 border ${
                          added || isAlreadyInCart
                          ? 'bg-emerald-500 text-white border-emerald-400' 
                          : 'bg-primary text-white border-primary-light hover:bg-white hover:text-primary-dark hover:scale-105 active:scale-95'
                        }`}
                      >
                        {added || isAlreadyInCart ? (
                          <> <CheckCircle2 className="w-5 h-5" /> En el Paquete </>
                        ) : (
                          <> <Plus className="w-5 h-5" /> Añadir al Paquete </>
                        )}
                      </button>

                      <button 
                        onClick={handleSendMessage}
                        disabled={isSendingMessage}
                        className="w-full py-4 rounded-2xl font-black text-xs transition-all shadow-xl flex items-center justify-center gap-3 border bg-white/10 border-white/20 hover:bg-white hover:text-primary-dark text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
                      >
                         <MessageSquare className="w-5 h-5" /> 
                         {isSendingMessage ? 'Enviando...' : 'Consultar Anfitrión'}
                      </button>
                    </div>
                  )}
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
