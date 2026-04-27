import { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { X, MapPin, Clock, Users, Signal, Tag, Calendar, Star, Info, Image as ImageIcon, Plus, CheckCircle2, MessageSquare, User, Flag } from 'lucide-react';
import MapboxMap, { Marker, Source } from 'react-map-gl/mapbox';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const Map = MAPBOX_TOKEN ? MapboxMap : ({ children, style, className }) => (
    <div style={style} className={`bg-slate-100 border border-danger/20 flex flex-col items-center justify-center p-6 text-center text-danger rounded-[2rem] ${className || ''}`}>
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
          className="bg-white w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-[40px] shadow-2xl relative flex flex-col overflow-hidden"
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
                <div className={`shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 backdrop-blur-md border ${toast.type === 'success' ? 'bg-success/90 border-success text-white shadow-success/30' : 'bg-danger/90 border-danger text-white shadow-danger/30'}`}>
                   {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <X className="w-6 h-6" />}
                   <p className="font-bold text-sm tracking-wide">{toast.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 sm:p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white hover:text-primary-dark transition-all shadow-xl border border-white/20"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="flex-1 overflow-auto">
            {/* Image Section */}
            <div className="relative w-full bg-slate-100 group">
              {/* Mobile Slider: Visible only on mobile */}
              <div className="sm:hidden w-full h-80 overflow-x-auto snap-x snap-mandatory flex no-scrollbar bg-slate-200">
                {finalGallery.map((img, i) => (
                  <div key={i} className="snap-start min-w-full h-full relative">
                    <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                    <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full">
                      {i + 1} / {finalGallery.length}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View: Visible only on sm and up */}
              <div className="hidden sm:block relative h-[450px] w-full overflow-visible">
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
                
                {/* Gallery Thumbnails Overlay (Desktop) */}
                {hasGallery && (
                  <div className="absolute bottom-32 left-10 right-10 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
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
              </div>
              
              {/* Info Container: Relative on mobile, Absolute on desktop */}
              <div className="relative sm:absolute sm:bottom-8 sm:left-10 sm:right-10 px-6 py-8 sm:p-0 sm:drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] bg-white sm:bg-transparent">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-4 flex-wrap">
                  <span className={`px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg ${
                    isActive ? 'bg-success text-white' : 'bg-warning text-white'
                  }`}>
                    {activity.estado}
                  </span>
                  <span className="px-3 sm:px-4 py-1.5 rounded-full bg-slate-100 sm:bg-white/90 sm:backdrop-blur-md text-primary-dark text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {activity.id_categoria === '1' ? 'Aventura' : 'Cultura'}
                  </span>
                  {activity.nombre_anfitrion && (
                    <span className="px-3 sm:px-4 py-1.5 rounded-full bg-warning text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      Por: {activity.nombre_anfitrion}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl sm:text-5xl font-display font-black text-slate-900 sm:text-white sm:drop-shadow-lg tracking-tight leading-tight">
                  {activity.title || activity.titulo}
                </h2>
              </div>
            </div>

            {/* Content Grid */}
            <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 border-t border-slate-50 sm:border-0">
              {/* Left Column: Details */}
              <div className="lg:col-span-2 space-y-8 sm:space-y-10">
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-[10px] sm:text-sm font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                    <Info className="w-4 h-4" /> Descripción de la Experiencia
                  </h3>
                  <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                    {activity.descripcion || 'Sin descripción disponible.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-2">
                    <Clock className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Duración</p>
                    <p className="font-bold text-sm sm:text-base text-slate-800">{activity.duracion_horas} Horas</p>
                  </div>
                  <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-2">
                    <Signal className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Dificultad</p>
                    <p className="font-bold text-sm sm:text-base text-slate-800">{activity.nivel_dificultad}</p>
                  </div>
                  <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-2">
                    <Users className="w-5 sm:w-6 h-5 sm:h-6 text-primary" />
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Capacidad</p>
                    <p className="font-bold text-sm sm:text-base text-slate-800">{activity.capacidad} Pers.</p>
                  </div>
                  <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-2">
                    <Star className="w-5 sm:w-6 h-5 sm:h-6 text-warning" />
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</p>
                    <p className="font-bold text-sm sm:text-base text-slate-800">
                      {activity.avg_rating && parseFloat(activity.avg_rating) > 0 
                        ? `${parseFloat(activity.avg_rating).toFixed(1)}/5` 
                        : 'Nuevo'}
                    </p>
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
                      className="p-8 bg-warning-light rounded-[32px] border-2 border-warning shadow-xl shadow-warning/5 space-y-6"
                    >
                      <h4 className="text-sm font-black text-warning uppercase tracking-[0.2em] flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-warning" /> Punto de Encuentro Confirmado
                      </h4>
                      
                      {activity.latitud_encuentro && activity.longitud_encuentro && (
                        <div className="h-48 rounded-[24px] overflow-hidden border-2 border-warning-light shadow-inner z-0">
                          <Map
                            {...meetingViewState}
                            onMove={evt => setMeetingViewState(evt.viewState)}
                            mapStyle="mapbox://styles/mapbox/streets-v12"
                            mapboxAccessToken={MAPBOX_TOKEN}
                            style={{ width: '100%', height: '100%' }}
                          >
                            <Marker latitude={parseFloat(activity.latitud_encuentro)} longitude={parseFloat(activity.longitud_encuentro)} anchor="bottom">
                               <div className="w-8 h-8 bg-warning rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-bounce">
                                  <Flag className="w-4 h-4 text-white" />
                               </div>
                            </Marker>
                          </Map>
                        </div>
                      )}

                      {activity.direccion_encuentro && (
                        <div className="flex items-center gap-4 text-warning font-bold bg-warning-light p-4 rounded-2xl border border-warning mt-4 mb-2">
                           <MapPin className="w-5 h-5 flex-shrink-0 text-warning" />
                           <span className="text-sm">{activity.direccion_encuentro}</span>
                        </div>
                      )}

                      {activity.punto_encuentro && (
                        <div className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-warning-light">
                          <p className="text-warning font-bold leading-relaxed">
                            {activity.punto_encuentro}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-[10px] font-black text-warning/60 uppercase tracking-widest text-center italic">
                        Solo tú y el anfitrión pueden ver esta información
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Right Column: Pricing & Quick Actions */}
              <div className="space-y-6">
                <div className="bg-primary-dark p-6 sm:p-8 rounded-3xl sm:rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                  <Tag className="absolute -top-10 -right-10 w-32 sm:w-40 h-32 sm:h-40 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Precio por persona</p>
                  <div className="flex items-baseline gap-1 mb-6 sm:mb-8">
                    <span className="text-3xl sm:text-4xl font-display font-black">${activity.price || activity.precio}</span>
                    <span className="text-[10px] sm:text-sm opacity-60 font-bold uppercase tracking-widest">USD</span>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Días Disponibles */}
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Días Disponibles</p>
                        <p className="text-sm font-bold text-slate-700">
                          {activity.dias_disponibles?.split(',').length === 7 ? 'Lunes a Domingo' : (activity.dias_disponibles || 'Todo el año')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Horario */}
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Horario de Servicio</p>
                        <p className="text-sm font-bold text-slate-700">
                          {activity.hora_inicio?.substring(0, 5) || '08:00'} - {activity.hora_fin?.substring(0, 5) || '18:00'}
                        </p>
                      </div>
                    </div>

                    {/* Aviso */}
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-3">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] font-bold text-amber-800 leading-snug">
                        Horarios referenciales. Coordina la hora exacta con tu anfitrión por mensaje tras reservar.
                      </p>
                    </div>

                    {/* Tipo de Grupo */}
                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Tipo de Grupo</p>
                        <p className="text-sm font-bold text-slate-700">Familiar / Individual</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3">
                    <button 
                      onClick={handleAddToCart}
                      disabled={added}
                      className={`w-full py-4 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-3 border ${
                        added || isAlreadyInCart
                        ? 'bg-success text-white border-success' 
                        : 'bg-primary text-white border-primary-light hover:bg-white hover:text-primary-dark hover:scale-[1.02] active:scale-95'
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
                      className="w-full py-4 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-3 border bg-white/10 border-white/20 hover:bg-white hover:text-primary-dark text-white hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                       <MessageSquare className="w-5 h-5" /> 
                       {isSendingMessage ? 'Enviando...' : 'Consultar Anfitrión'}
                    </button>
                  </div>
                </div>

                <div className="p-6 sm:p-8 bg-slate-50 rounded-2xl sm:rounded-[40px] border border-slate-100">
                  <h4 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Lo que incluye</h4>
                  <ul className="space-y-2 sm:space-y-3">
                    {['Guía profesional', 'Equipo de seguridad', 'Transporte local', 'Snacks y agua'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-slate-600">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary" />
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
