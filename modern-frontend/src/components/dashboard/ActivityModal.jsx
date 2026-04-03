import { useState, useEffect, useRef, useCallback } from 'react';
import { X, MapPin, Camera, Info, Save, Layers, Clock, Users, Signal, Tag, Plus } from 'lucide-react';
import Map, { Marker, NavigationControl, Source } from 'react-map-gl/mapbox';
import { motion, AnimatePresence } from 'framer-motion';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '../../contexts/ToastContext';
import CustomCalendar from '../CustomCalendar';
import { ChevronDown } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=es`);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const context = feature.context || [];
      
      const city = feature.text || '';
      const state = context.find(c => c.id.startsWith('region'))?.text || '';
      const country = context.find(c => c.id.startsWith('country'))?.text || 'Ecuador';
      const address = feature.place_name || '';

      return {
        address: {
          city,
          state,
          country,
          road: feature.text,
          full: address
        }
      };
    }
    return null;
  } catch (error) {
    console.error('Error reverse geocoding with Mapbox:', error);
    return null;
  }
};


const ActivityModal = ({ isOpen, onClose, type = 'EXPERIENCE', initialData = null, onSave }) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Location & Media
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    precio: '',
    capacidad: '',
    duracion_horas: '',
    nivel_dificultad: 'MEDIO',
    id_categoria: '1',
    id_clasificacion: '1',
    ciudad: '',
    provincia: '',
    pais: 'Ecuador',
    direccion: '',
    latitud: -0.180653,
    longitud: -78.467834,
    portada: null,
    galeria: [],
    id_ubicacion: null,
    // Tourist fields
    incluye_recorrido: true,
    incluye_transporte: false,
    requiere_equipo: false,
    // Food fields
    menu_vegano: false,
    menu_vegetariano: false,
    menu_sin_gluten: false,
    permite_mascotas: false,
    wifi: false,
    servicio_local: true,
    servicio_para_llevar: false,
    servicio_delivery: false,
    nivel_picante: 0,
    accesibilidad_silla_ruedas: false,
    accesibilidad_adultos_mayores: false,
    estacionamiento: false,
    musica_en_vivo: false,
    zona_infantil: false,
    eventos_privados: false,
    metodos_pago: '',
    descuentos_promociones: '',
    // Common
    porcentaje_ganancia: 10,
    tipo_reserva: 'INSTANTANEA',
    precio_oferta: '',
    fecha_fin_oferta: '',
    // Scheduling
    hora_inicio: '08:00',
    hora_fin: '18:00',
    dias_disponibles: [0, 1, 2, 3, 4, 5, 6]
  });

  const [position, setPosition] = useState({ lat: -0.180653, lng: -78.467834 });
  const [showTerrain, setShowTerrain] = useState(true);
  const [viewState, setViewState] = useState({
    latitude: -0.180653,
    longitude: -78.467834,
    zoom: 13,
    pitch: 60
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (initialData && isOpen) {
      const normalizedData = {
        ...formData,
        ...initialData,
        titulo: initialData.titulo || initialData.title || '',
        descripcion: initialData.descripcion || initialData.description || '',
        precio: initialData.precio || initialData.price || '',
        capacidad: initialData.capacidad || initialData.capacity || '',
        duracion_horas: initialData.duracion_horas || initialData.duration || '',
        nivel_dificultad: initialData.nivel_dificultad || initialData.difficulty || 'MEDIO',
        id_categoria: initialData.id_categoria || '1',
        id_clasificacion: initialData.id_clasificacion || '1',
        ciudad: initialData.ciudad || initialData.city || '',
        provincia: initialData.provincia || initialData.state || '',
        pais: initialData.pais || 'Ecuador',
        direccion: initialData.direccion || initialData.address || initialData.location || '',
        id_ubicacion: initialData.id_ubicacion || null,
        galeria: initialData.galeria || [],
        incluye_recorrido: initialData.incluye_recorrido ?? true,
        incluye_transporte: initialData.incluye_transporte || false,
        requiere_equipo: initialData.requiere_equipo || false,
        porcentaje_ganancia: initialData.porcentaje_ganancia || 10,
        tipo_reserva: initialData.tipo_reserva || 'INSTANTANEA',
        precio_oferta: initialData.precio_oferta || '',
        fecha_fin_oferta: initialData.fecha_fin_oferta ? new Date(initialData.fecha_fin_oferta).toISOString().split('T')[0] : '',
        hora_inicio: initialData.hora_inicio ? initialData.hora_inicio.substring(0, 5) : '08:00',
        hora_fin: initialData.hora_fin ? initialData.hora_fin.substring(0, 5) : '18:00',
        dias_disponibles: initialData.dias_disponibles 
          ? (typeof initialData.dias_disponibles === 'string' 
              ? initialData.dias_disponibles.split(',').map(Number) 
              : initialData.dias_disponibles)
          : [0, 1, 2, 3, 4, 5, 6]
      };
      
      setFormData(normalizedData);
      setPreview(normalizedData.portada || normalizedData.image || null);
      
      const lat = parseFloat(normalizedData.latitud);
      const lng = parseFloat(normalizedData.longitud);
      if (!isNaN(lat) && !isNaN(lng)) {
        setPosition({ lat, lng });
        setViewState(prev => ({ ...prev, latitude: lat, longitude: lng }));
      }
    } else if (isOpen) {
      setFormData({
        titulo: '', descripcion: '', precio: '', capacidad: '',
        duracion_horas: '', nivel_dificultad: 'MEDIO',
        id_categoria: '1', id_clasificacion: '1',
        ciudad: '', provincia: '', pais: 'Ecuador', direccion: '',
        latitud: -0.180653, longitud: -78.467834, portada: null, galeria: [], id_ubicacion: null,
        incluye_recorrido: true, incluye_transporte: false, requiere_equipo: false,
        menu_vegano: false, menu_vegetariano: false, menu_sin_gluten: false,
        permite_mascotas: false, wifi: false, servicio_local: true,
        servicio_para_llevar: false, servicio_delivery: false, nivel_picante: 0,
        accesibilidad_silla_ruedas: false, accesibilidad_adultos_mayores: false,
        estacionamiento: false, musica_en_vivo: false, zona_infantil: false,
        eventos_privados: false, metodos_pago: '', descuentos_promociones: '',
        porcentaje_ganancia: 10, tipo_reserva: 'INSTANTANEA',
        precio_oferta: '', fecha_fin_oferta: '',
        hora_inicio: '08:00', hora_fin: '18:00',
        dias_disponibles: [0, 1, 2, 3, 4, 5, 6]
      });
      setPreview(null);
      setStep(1);
    }
  }, [initialData, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData(prev => ({ ...prev, portada: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          galeria: [...prev.galeria, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLocationFound = (data) => {
    const { address } = data;
    const city = address.city || address.town || address.village || address.suburb || '';
    const state = address.state || address.county || '';
    const country = address.country || 'Ecuador';
    const road = address.road || '';
    const houseNumber = address.house_number || '';
    const fullAddress = `${road} ${houseNumber}`.trim();

    setFormData(prev => ({
      ...prev,
      ciudad: city,
      provincia: state,
      pais: country,
      direccion: fullAddress || prev.direccion
    }));
  };

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = { lat: latitude, lng: longitude };
        setPosition(newPos);
        setViewState(prev => ({ ...prev, latitude, longitude, zoom: 15 }));
        const data = await reverseGeocode(latitude, longitude);
        if (data) handleLocationFound(data);
      });
    } else {
      alert("La geolocalización no está disponible en tu navegador.");
    }
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      galeria: prev.galeria.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    const finalData = { 
      ...formData, 
      latitud: position.lat, 
      longitud: position.lng,
      url_imagen: formData.portada, // Mapping for backend
      galeria: formData.galeria,
      // Convert dias_disponibles to string for backend if needed (though repo handles it)
      dias_disponibles: formData.dias_disponibles.join(',')
    };
    await onSave(finalData);
    setLoading(false);
    showToast('Actividad guardada correctamente', 'success');
  };

  const steps = [
    { id: 1, label: 'Detalles', icon: Info },
    { id: 2, label: 'Ubicación', icon: MapPin },
  ];

  // Database Categories
  const touristCategories = [
    'Aventura', 'Cultural', 'Naturaleza', 'Relajación', 'Familiar',
    'Deportiva', 'Nocturna', 'Educativa', 'Fotográfica', 'Exploración'
  ];

  const foodCategories = [
    'Restaurante típico/local', 'Marisquería', 'Parrillada / Asados', 
    'Cafetería', 'Comida rápida', 'Cocina internacional', 
    'Panadería / Pastelería', 'Buffet', 'Comida saludable / Vegana', 
    'Food Truck / Comida callejera'
  ];

  const classifications = [
    'FRIENDLY', 'RELAX', 'MODERADA', 'AVENTURA', 'PELIGROSA', 
    'EXTREMA', 'INFANTIL', 'PAREJAS', 'GRUPOS', 'EXCLUSIVA'
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-6xl max-h-[95vh] rounded-[48px] shadow-2xl relative flex flex-col overflow-hidden border border-white/20"
      >
        {/* Progress Header */}
        <div className="bg-slate-50/50 border-b border-slate-100 p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {steps.map((s) => (
                <div 
                  key={s.id}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl transition-all ${
                    step >= s.id ? 'bg-primary text-white scale-110 z-10' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <s.icon className="w-5 h-5" />
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-slate-800">
                {initialData ? 'Editar' : 'Nueva'} {type === 'EXPERIENCE' ? 'Experiencia' : 'Servicio'}
              </h2>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Paso {step} de 2: {steps[step-1].label}</p>
            </div>
          </div>
          
          <button onClick={onClose} className="p-4 bg-white text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm border border-slate-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-auto p-8 sm:p-12 text-slate-700">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* Left Column: Basic Info */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título de la propuesta</label>
                      <div className="relative group">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text" required value={formData.titulo || ''}
                          onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                          placeholder="Ej: Caminata por el bosque nublado"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción detallada</label>
                      <textarea 
                        rows="4" required value={formData.descripcion || ''}
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                        placeholder="Explica qué harás, qué incluye y qué deben traer los viajeros..."
                        className="w-full p-6 rounded-3xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none leading-relaxed font-medium placeholder:text-slate-300"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                        <select 
                          value={formData.id_categoria || '1'}
                          onChange={(e) => setFormData({...formData, id_categoria: e.target.value})}
                          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 appearance-none outline-none font-bold text-sm cursor-pointer focus:border-primary"
                        >
                          {(type === 'EXPERIENCE' ? touristCategories : foodCategories).map((cat, idx) => (
                            <option key={idx} value={idx + 1}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      
                      {type === 'EXPERIENCE' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clasificación</label>
                          <select 
                            value={formData.id_clasificacion || '1'}
                            onChange={(e) => setFormData({...formData, id_clasificacion: e.target.value})}
                            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 appearance-none outline-none font-bold text-sm cursor-pointer focus:border-primary"
                          >
                            {classifications.map((clas, idx) => (
                              <option key={idx} value={idx + 1}>{clas}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Checkboxes Area */}
                    <div className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Servicios Incluidos & Características</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {type === 'EXPERIENCE' ? (
                          <>
                            <label className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:border-primary transition-colors">
                              <input type="checkbox" checked={formData.incluye_recorrido} onChange={(e) => setFormData({...formData, incluye_recorrido: e.target.checked})} className="w-5 h-5 accent-primary" />
                              <span className="text-xs font-bold text-slate-600">Recorrido</span>
                            </label>
                            <label className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:border-primary transition-colors">
                              <input type="checkbox" checked={formData.incluye_transporte} onChange={(e) => setFormData({...formData, incluye_transporte: e.target.checked})} className="w-5 h-5 accent-primary" />
                              <span className="text-xs font-bold text-slate-600">Transporte</span>
                            </label>
                            <label className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:border-primary transition-colors">
                              <input type="checkbox" checked={formData.requiere_equipo} onChange={(e) => setFormData({...formData, requiere_equipo: e.target.checked})} className="w-5 h-5 accent-primary" />
                              <span className="text-xs font-bold text-slate-600">Equipo</span>
                            </label>
                          </>
                        ) : (
                          <>
                            {[
                              { label: 'Vegano', key: 'menu_vegano' },
                              { label: 'Vegetariano', key: 'menu_vegetariano' },
                              { label: 'Sin Gluten', key: 'menu_sin_gluten' },
                              { label: 'Mascotas', key: 'permite_mascotas' },
                              { label: 'WiFi', key: 'wifi' },
                              { label: 'En Local', key: 'servicio_local' },
                              { label: 'Para Llevar', key: 'servicio_para_llevar' },
                              { label: 'Delivery', key: 'servicio_delivery' },
                              { label: 'Silla Ruedas', key: 'accesibilidad_silla_ruedas' },
                              { label: 'Estacionam.', key: 'estacionamiento' },
                              { label: 'Música Vivo', key: 'musica_en_vivo' },
                              { label: 'Zona Infantil', key: 'zona_infantil' }
                            ].map((item) => (
                              <label key={item.key} className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:border-primary transition-colors">
                                <input type="checkbox" checked={formData[item.key]} onChange={(e) => setFormData({...formData, [item.key]: e.target.checked})} className="w-4 h-4 accent-primary" />
                                <span className="text-[11px] font-bold text-slate-600">{item.label}</span>
                              </label>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Scheduling Section */}
                    <div className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Horarios y Disponibilidad Semanal</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Time pickers */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora Inicio</label>
                            <input 
                              type="time"
                              value={formData.hora_inicio}
                              onChange={(e) => setFormData({...formData, hora_inicio: e.target.value})}
                              className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora Fin</label>
                            <input 
                              type="time"
                              value={formData.hora_fin}
                              onChange={(e) => setFormData({...formData, hora_fin: e.target.value})}
                              className="w-full px-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Day selector */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Días Disponibles</label>
                          <div className="flex justify-between gap-1">
                            {[
                              { label: 'D', value: 0 },
                              { label: 'L', value: 1 },
                              { label: 'M', value: 2 },
                              { label: 'M', value: 3 },
                              { label: 'J', value: 4 },
                              { label: 'V', value: 5 },
                              { label: 'S', value: 6 }
                            ].map((day) => {
                              const isSelected = formData.dias_disponibles.includes(day.value);
                              return (
                                <button
                                  key={day.value}
                                  type="button"
                                  onClick={() => {
                                    const newDays = isSelected
                                      ? formData.dias_disponibles.filter(d => d !== day.value)
                                      : [...formData.dias_disponibles, day.value].sort();
                                    setFormData({...formData, dias_disponibles: newDays});
                                  }}
                                  className={`w-9 h-9 rounded-xl font-black text-xs transition-all ${
                                    isSelected 
                                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                                      : 'bg-white text-slate-300 border border-slate-100 hover:border-primary/30'
                                  }`}
                                >
                                  {day.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Pricing & Specs */}
                  <div className="space-y-8 bg-slate-50/50 p-8 rounded-[40px] border border-slate-100 flex flex-col justify-between">
                    <div className="space-y-8">
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Resumen Comercial</h3>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2 text-center">
                          <span className="p-3 bg-white rounded-2xl shadow-sm inline-block mb-2">
                            <Tag className="w-5 h-5 text-primary" />
                          </span>
                          <label className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">Precio (USD)</label>
                          <input 
                            type="number" required value={formData.precio || ''}
                            onChange={(e) => setFormData({...formData, precio: e.target.value})}
                            className="w-full bg-transparent text-center text-3xl font-display font-black text-primary outline-none"
                          />
                        </div>
                        <div className="space-y-2 text-center border-l border-slate-100">
                          <span className="p-3 bg-white rounded-2xl shadow-sm inline-block mb-2">
                            <Users className="w-5 h-5 text-primary" />
                          </span>
                          <label className="text-[10px] font-black text-slate-400 uppercase block tracking-widest">Capacidad</label>
                          <input 
                            type="number" required value={formData.capacidad || ''}
                            onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                            className="w-full bg-transparent text-center text-3xl font-display font-black text-slate-800 outline-none"
                          />
                        </div>
                      </div>

                      {/* Offer Fields */}
                      <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="w-4 h-4 text-emerald-600" />
                          <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Oferta Especial</h4>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest ml-1">Precio Rebajado</label>
                            <input 
                              type="number"
                              placeholder="Ej: 29.99"
                              value={formData.precio_oferta || ''}
                              onChange={(e) => setFormData({...formData, precio_oferta: e.target.value})}
                              className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1 relative">
                            <label className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest ml-1">Fecha de Fin</label>
                            <button 
                              type="button"
                              onClick={() => setShowCalendar(!showCalendar)}
                              className="w-full px-4 py-3 bg-white border border-emerald-100 rounded-2xl text-sm font-bold flex items-center justify-between outline-none"
                            >
                              <span className={formData.fecha_fin_offer ? "text-slate-800" : "text-slate-300"}>
                                {formData.fecha_fin_oferta ? formData.fecha_fin_oferta : "Seleccionar..."}
                              </span>
                              <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {showCalendar && (
                                <div className="absolute left-0 top-full mt-2 z-[100] shadow-2xl">
                                  <CustomCalendar 
                                    selectedDate={formData.fecha_fin_oferta}
                                    onSelect={(date) => {
                                      setFormData({ ...formData, fecha_fin_oferta: date });
                                      setShowCalendar(false);
                                    }}
                                  />
                                </div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-slate-400" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duración (H)</span>
                          </div>
                          <input 
                            type="number" value={formData.duracion_horas || ''}
                            onChange={(e) => setFormData({...formData, duracion_horas: e.target.value})}
                            className="w-16 bg-white p-2 rounded-xl text-center font-black border border-slate-100 focus:border-primary transition-all outline-none"
                          />
                        </div>

                        {type === 'EXPERIENCE' ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Signal className="w-5 h-5 text-slate-400" />
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Dificultad</span>
                            </div>
                            <select 
                              value={formData.nivel_dificultad || 'MEDIO'}
                              onChange={(e) => setFormData({...formData, nivel_dificultad: e.target.value})}
                              className="bg-white p-2 px-4 rounded-xl font-black border border-slate-100 focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                            >
                              <option value="BAJO">Bajo</option>
                              <option value="MEDIO">Medio</option>
                              <option value="ALTO">Alto</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 flex items-center justify-center text-orange-500 font-black">🔥</div>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Picante (0-5)</span>
                            </div>
                            <input 
                              type="number" min="0" max="5" value={formData.nivel_picante || 0}
                              onChange={(e) => setFormData({...formData, nivel_picante: e.target.value})}
                              className="w-16 bg-white p-2 rounded-xl text-center font-black border border-slate-100 focus:border-primary transition-all outline-none"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 flex items-center justify-center text-primary font-black">⚡</div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reserva</span>
                          </div>
                          <select 
                            value={formData.tipo_reserva || 'INSTANTANEA'}
                            onChange={(e) => setFormData({...formData, tipo_reserva: e.target.value})}
                            className="bg-white p-2 px-4 rounded-xl font-black border border-slate-100 focus:border-primary transition-all outline-none appearance-none cursor-pointer"
                          >
                            <option value="INSTANTANEA">Auto</option>
                            <option value="MANUAL">Manual</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                       <label className="text-[10px] font-black text-slate-400 uppercase block tracking-widest mb-3">Comisión Plataforma (%)</label>
                       <input 
                          type="range" min="1" max="30" value={formData.porcentaje_ganancia || 10}
                          onChange={(e) => setFormData({...formData, porcentaje_ganancia: e.target.value})}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="text-right text-xs font-black text-primary mt-2">{formData.porcentaje_ganancia}%</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Ubicación del Proyecto
                      </h3>
                      <div className="h-72 rounded-[40px] overflow-hidden border-4 border-slate-50 shadow-2xl z-0 relative group">
                        <Map
                          {...viewState}
                          onMove={evt => setViewState(evt.viewState)}
                          onClick={async (e) => {
                            const { lng, lat } = e.lngLat;
                            const newPos = { lat, lng };
                            setPosition(newPos);
                            const data = await reverseGeocode(lat, lng);
                            if (data) handleLocationFound(data);
                          }}
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
                          <NavigationControl position="top-right" />
                          
                          {/* Toggle 2D/3D Button - Movido a la izquierda */}
                          <div className="absolute top-4 left-4 z-10">
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = !showTerrain;
                                setShowTerrain(nextVal);
                                setViewState(prev => ({ ...prev, pitch: nextVal ? 60 : 0 }));
                              }}
                              className={`px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 flex items-center justify-center font-black text-[10px] transition-all hover:scale-105 active:scale-95 ${showTerrain ? 'text-primary' : 'text-slate-500'}`}
                            >
                              {showTerrain ? '2D' : '3D'}
                            </button>
                          </div>
                          {position && (
                            <Marker latitude={position.lat} longitude={position.lng} anchor="bottom">
                              <div className="w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg animate-bounce flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-white" />
                              </div>
                            </Marker>
                          )}
                        </Map>
                        <div className="absolute top-4 right-14 z-[50]">
                          <button
                            type="button"
                            onClick={handleGetCurrentLocation}
                            className="bg-white/90 backdrop-blur-md p-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase text-primary shadow-xl hover:scale-105 transition-all border border-primary/20"
                          >
                            <MapPin className="w-3 h-3" /> Mi Ubicación
                          </button>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl text-[10px] font-black uppercase text-center text-slate-500 shadow-lg pointer-events-none">
                          Haz clic en el mapa para marcar el punto exacto
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <input 
                          type="text" placeholder="Ciudad" required value={formData.ciudad || ''}
                          onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all shadow-sm"
                        />
                        <input 
                          type="text" placeholder="Provincia" required value={formData.provincia || ''}
                          onChange={(e) => setFormData({...formData, provincia: e.target.value})}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all shadow-sm"
                        />
                        <input 
                          type="text" placeholder="País" required value={formData.pais || 'Ecuador'}
                          onChange={(e) => setFormData({...formData, pais: e.target.value})}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all shadow-sm"
                        />
                      </div>
                      <input 
                        type="text" placeholder="Dirección Exacta (Puntos de referencia)" required value={formData.direccion || ''}
                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-sm focus:bg-white transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                      <Camera className="w-4 h-4" /> Imagen de Portada
                    </h3>
                    
                    <div 
                      className="h-80 rounded-[40px] border-4 border-dashed border-slate-200 bg-slate-50 overflow-hidden relative group hover:border-primary/50 transition-all cursor-pointer shadow-inner"
                      onClick={() => document.getElementById('portada-upload').click()}
                    >
                      {preview ? (
                        <img src={preview} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Preview" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-4">
                          <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center text-slate-200 group-hover:text-primary transition-colors">
                            <Camera className="w-10 h-10" />
                          </div>
                          <p className="font-black text-xs uppercase tracking-widest text-center">Subir foto de impacto</p>
                        </div>
                      )}
                      {preview && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-black text-xs uppercase tracking-widest bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">Cambiar Imagen</p>
                        </div>
                      )}
                      <input id="portada-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Métodos de Pago</label>
                        <input 
                          type="text" value={formData.metodos_pago || ''}
                          onChange={(e) => setFormData({...formData, metodos_pago: e.target.value})}
                          placeholder="Efectivo, Tarjeta, etc..."
                          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Promociones/Descuentos</label>
                        <input 
                          type="text" value={formData.descuentos_promociones || ''}
                          onChange={(e) => setFormData({...formData, descuentos_promociones: e.target.value})}
                          placeholder="Ej: 2x1 los Martes"
                          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 outline-none font-bold text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Galería de Imágenes (Máx 10)
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        {formData.galeria.map((img, idx) => (
                          <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden group border border-slate-100">
                            <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                            <button 
                              onClick={() => removeGalleryImage(idx)}
                              className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        {formData.galeria.length < 10 && (
                          <button 
                            onClick={() => document.getElementById('gallery-upload').click()}
                            className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-all bg-slate-50"
                          >
                            <Plus className="w-6 h-6" />
                          </button>
                        )}
                        <input id="gallery-upload" type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryChange} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-10 sm:p-12 border-t border-slate-100 flex justify-between items-center bg-slate-50/30 backdrop-blur-md">
          <button 
            type="button"
            onClick={() => step === 2 ? setStep(1) : onClose()}
            className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all flex items-center gap-2"
          >
            {step === 2 ? 'Anterior' : 'Salir'}
          </button>
          
          <div className="flex gap-4">
            {step === 1 ? (
              <button 
                type="button" 
                onClick={() => setStep(2)}
                className="bg-primary-dark text-white px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
              >
                Continuar <Layers className="w-4 h-4" />
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary hover:bg-primary-dark text-white px-12 py-4 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Guardando...' : <><Save className="w-4 h-4" /> Finalizar y Publicar</>}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ActivityModal;
