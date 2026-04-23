import { useState, useEffect, useMemo, useRef } from 'react';
import { API_BASE } from '../config/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Image as ImageIcon, Users, Navigation, RefreshCw, LayoutGrid, Map, ShoppingBag, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ActivityDetailModal from '../components/dashboard/ActivityDetailModal';
import InfoModal from '../components/InfoModal';
import BookingSidebar from '../components/BookingSidebar';
import MapView from '../components/dashboard/MapView';
import { ecuadorData, provinces, countries } from '../data/ecuadorData';
import { useCart, CartProvider } from '../contexts/CartContext';
import hero1 from '../assets/carousel/hero1.png';
import hero2 from '../assets/carousel/hero2.png';
import hero3 from '../assets/carousel/hero3.png';

const ActivityCard = ({ activity, onOpenDetail, onOpenBooking }) => {
  const handleViewMore = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/activities/${activity.id}`);
      if (response.ok) {
        const fullData = await response.json();
        onOpenDetail(fullData);
      } else {
        onOpenDetail(activity);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      onOpenDetail(activity);
    }
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-50 relative flex flex-col h-full">
      <div 
        className="relative h-60 overflow-hidden cursor-pointer"
        onClick={handleViewMore}
      >
        <img 
          src={activity.image} 
          alt={activity.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="hidden absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex-col items-center justify-center text-primary gap-2">
          <ImageIcon className="w-12 h-12 opacity-50" />
          <span className="text-xs font-bold uppercase text-center px-4">{activity.title}</span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-primary-dark shadow-sm z-10">
          {activity.tipo === 'TURISTICA' ? 'Experiencia' : 'Servicio'}
        </span>
        {activity.precio_oferta && (
          <span className="absolute top-4 left-4 bg-success text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-10 animate-pulse">
            OFERTA -{Math.round((1 - (activity.precio_oferta / activity.original_price)) * 100)}%
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex flex-col gap-1.5 mb-3">
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3 h-3" /> {activity.location}
          </div>
          {activity.nombre_anfitrion && (
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest pl-[1px]">
              <User className="w-3.5 h-3.5 text-secondary" />
              <span className="opacity-70">POR:</span> <span className="text-secondary">{activity.nombre_anfitrion}</span>
            </div>
          )}
        </div>
        <h3 
          className="text-lg font-bold text-slate-800 mb-6 group-hover:text-primary transition-colors cursor-pointer leading-snug"
          onClick={handleViewMore}
        >
          {activity.title}
        </h3>
        <div className="flex flex-col gap-4 pt-5 border-t border-slate-50 mt-auto">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="font-display font-black text-xl text-primary-dark">
                  ${activity.price}
                </div>
                {activity.precio_oferta && (
                  <div className="text-xs font-bold text-slate-400 line-through">
                    ${activity.original_price}
                  </div>
                )}
                <span className="text-xs font-normal text-slate-400">/ pers</span>
              </div>
              <span className="text-[9px] font-black uppercase text-success tracking-tighter mt-[-2px]">15% IVA Incluido</span>
            </div>
            <button 
              onClick={handleViewMore}
              className="text-primary font-bold text-sm hover:text-primary-dark flex items-center gap-2 transition-all p-2"
            >
              Ver más <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={() => onOpenBooking(activity)}
            className="w-full px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-lg shadow-primary/10 hover:shadow-primary/30 flex items-center justify-center gap-2 active:scale-95"
          >
            Reservar Ahora
          </button>
        </div>
      </div>
    </div>
  );
};


const HERO_IMAGES = [hero1, hero2, hero3];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'todas';
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityToBook, setActivityToBook] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [radius, setRadius] = useState(10);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infoModal, setInfoModal] = useState({ isOpen: false, title: '', content: '' });
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const locationDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart, selectedItems } = useCart();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenBookingRequest = async (act) => {
    const userData = sessionStorage.getItem('user');
    if (!userData) {
      setInfoModal({
        isOpen: true,
        title: 'Inicia sesión para reservar',
        content: (
          <div className="flex flex-col gap-6 items-center justify-center py-4 text-center">
            <p className="text-slate-600 px-4">Necesitas una cuenta para poder reservar esta actividad de forma <strong>segura</strong>.</p>
            <button 
              onClick={() => {
                setInfoModal({ isOpen: false, title: '', content: '' });
                navigate('/login');
              }}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg text-sm w-full sm:w-auto"
            >
              Ingresar / Registrarse
            </button>
          </div>
        )
      });
      return;
    }

    const handleSuccess = () => setIsBookingOpen(true);

    try {
      const response = await fetch(`${API_BASE}/api/activities/${act.id}`);
      if (response.ok) {
        const fullData = await response.json();
        const result = addToCart(fullData, handleSuccess);
        if (result.success || result.error === 'DUPLICATE') {
           setIsBookingOpen(true);
        }
      } else {
        const result = addToCart(act, handleSuccess);
        if (result.success || result.error === 'DUPLICATE') {
           setIsBookingOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      const result = addToCart(act, handleSuccess);
      if (result.success || result.error === 'DUPLICATE') {
         setIsBookingOpen(true);
      }
    }
  };
  
  const [nominatimLocations, setNominatimLocations] = useState([]);
  const [isSearchingAutocomplete, setIsSearchingAutocomplete] = useState(false);

  // Map of common country codes to Spanish names used in the DB
  const countryCodeMap = {
    'EC': 'Ecuador',
    'US': 'United States of America',
    'ES': 'Spain',
    'MX': 'Mexico',
    'CO': 'Colombia',
    'PE': 'Peru',
    'AR': 'Argentina',
    'CL': 'Chile',
    'BR': 'Brazil',
    'FR': 'France',
    'IT': 'Italy',
    'DE': 'Germany',
    'GB': 'United Kingdom',
    'JP': 'Japan',
    'CN': 'China',
    'IN': 'India',
    'AU': 'Australia',
    'CA': 'Canada',
    'RU': 'Russia',
    'ZA': 'South Africa',
    'EG': 'Egypt',
    'NG': 'Nigeria',
    'KR': 'South Korea',
    'TR': 'Turkey',
    'CH': 'Switzerland',
    'SE': 'Sweden',
    'NO': 'Norway',
    'FI': 'Finland',
    'DK': 'Denmark',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'PT': 'Portugal',
    'GR': 'Greece',
    'AT': 'Austria',
    'IE': 'Ireland',
    'NZ': 'New Zealand',
    // We can add more, but this covers major queries or users can just type the country name
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredActivities = useMemo(() => {
    if (activeCategory === 'todas') return activities;
    return activities.filter(activity => 
      activeCategory === 'experiencias' 
        ? activity.tipo === 'TURISTICA' 
        : activity.tipo !== 'TURISTICA'
    );
  }, [activities, activeCategory]);

  const uniqueLocations = useMemo(() => {
    if (!activities.length) return [];
    const locations = activities.map(a => a.location);
    return [...new Set(locations)].sort();
  }, [activities]);

  useEffect(() => {
    if (!searchQuery || searchQuery === 'Mi Ubicación Actual' || searchQuery.length < 3) {
      setNominatimLocations([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingAutocomplete(true);
      try {
        // Removed countrycodes=ec and featuretype=city to allow global search of any place type
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=6`, {
          headers: {
            'Accept-Language': 'es',
            'User-Agent': 'TurismoApp/1.0'
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Use display_name instead of just name to show full context (province, country, etc.)
          const names = data.map(item => item.display_name || item.name);
          setNominatimLocations([...new Set(names)]);
        }
      } catch (error) {
        console.error("Nominatim fetch error:", error);
      } finally {
        setIsSearchingAutocomplete(false);
      }
    }, 300); // Reduced delay for faster results

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const allPossibleLocations = useMemo(() => {
    const combined = [...nominatimLocations, ...uniqueLocations];
    return [...new Set(combined)].sort();
  }, [nominatimLocations, uniqueLocations]);

  const filteredLocations = useMemo(() => {
    if (!searchQuery) return uniqueLocations; // when empty, only show DB locs
    if (searchQuery === 'Mi Ubicación Actual') return [];
    
    // Normalize string to remove accents/diacritics for better matching
    const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    const lowerQuery = normalize(searchQuery);
    return allPossibleLocations.filter(loc => normalize(loc).includes(lowerQuery));
  }, [allPossibleLocations, uniqueLocations, searchQuery]);

  const mapCountryCodeToName = (query) => {
    const code = query.trim().toUpperCase();
    if (countryCodeMap[code]) {
      return countryCodeMap[code];
    }
    return query;
  };

  const experienciasData = useMemo(() => activities.filter(a => a.tipo === 'TURISTICA'), [activities]);
  const serviciosData = useMemo(() => activities.filter(a => a.tipo === 'ALIMENTARIA'), [activities]);  // Función de fetch base (no maneja loading state cuando se llama por tipo)
  const fetchActivities = async (filters = {}, skipModal = false) => {
    const isCategoryFetch = !!filters.type; // Si viene con tipo, es una sub-fetch
    if (!isCategoryFetch) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.province) params.append('province', filters.province);
      if (filters.country) params.append('country', filters.country);
      if (filters.type) params.append('type', filters.type);
      
      if (filters.lat && filters.lng) {
        params.append('lat', filters.lat);
        params.append('lng', filters.lng);
        params.append('radius', filters.radius || 10);
      }
      
      const guestsTotal = (filters.adults || 1) + (filters.childrenCount || 0);
      if (guestsTotal > 1) params.append('guests', guestsTotal);
      
      // Limit: si se pasa explicitamente null/false, no limitar
      if (filters.limit !== undefined) {
         if (filters.limit) params.append('limit', filters.limit);
      } else {
         params.append('limit', 10);
      }

      console.log(`[Frontend-Fetch] URL: ${API_BASE}/api/activities?${params.toString()}`);

      const response = await fetch(`${API_BASE}/api/activities?${params.toString()}`);
      if (!response.ok) {
        console.error('[Frontend-Fetch] Error de respuesta:', response.status);
        return [];
      }
      const data = await response.json();
      console.log(`[Frontend-Fetch] Recibidos ${data.length} resultados (type=${filters.type || 'ALL'})`);
      
      // Solo actualiza el estado global si es una búsqueda unificada (no por tipo)
      if (!isCategoryFetch) {
         setActivities(data);
      }
      
      // Modales de sin resultados (solo para búsquedas con coordenadas)
      if (data.length === 0 && filters.lat && filters.lng && !skipModal) {
         const currentRadius = filters.radius || 10;
         setInfoModal({
            isOpen: true,
            title: 'Sin resultados cercanos',
            content: (
               <div className="flex flex-col gap-6 items-center justify-center py-2 text-center">
                  <p className="text-slate-600">No encontramos experiencias o servicios a menos de <span className="font-bold text-slate-800">{currentRadius} km</span> de tu ubicación.</p>
                  <p className="text-slate-800 font-bold mb-2">¿Deseas ampliar el radio de búsqueda o ver todas las opciones?</p>
                  <div className="flex flex-wrap gap-3 justify-center w-full">
                     {currentRadius < 20 && (
                       <button onClick={() => { setInfoModal({ isOpen: false, title: '', content: '' }); setRadius(20); fetchActivities({ ...filters, radius: 20 }); }} className="px-6 py-3 bg-secondary/10 text-primary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm text-sm">20 km</button>
                     )}
                     {currentRadius < 30 && (
                       <button onClick={() => { setInfoModal({ isOpen: false, title: '', content: '' }); setRadius(30); fetchActivities({ ...filters, radius: 30 }); }} className="px-6 py-3 bg-secondary/10 text-primary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm text-sm">30 km</button>
                     )}
                     {currentRadius < 50 && (
                       <button onClick={() => { setInfoModal({ isOpen: false, title: '', content: '' }); setRadius(50); fetchActivities({ ...filters, radius: 50 }); }} className="px-6 py-3 bg-secondary/10 text-primary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm text-sm">50 km</button>
                     )}
                     <button onClick={() => { setInfoModal({ isOpen: false, title: '', content: '' }); setSearchQuery(''); setLat(null); setLng(null); fetchActivities({ ...filters, lat: null, lng: null, searchQuery: '', limit: null }); }} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm text-sm">Ver todas</button>
                  </div>
               </div>
            )
         });
      } else if (data.length === 0 && filters.searchQuery && filters.searchQuery !== 'Mi Ubicación Actual') {
         setInfoModal({
            isOpen: true,
            title: 'Aún no llegamos aquí',
            content: (
               <div className="flex flex-col gap-6 items-center justify-center py-2 text-center">
                  <p className="text-slate-600">Actualmente no contamos con experiencias o servicios registrados en <span className="font-bold text-slate-800">{filters.searchQuery}</span>.</p>
                  <p className="text-slate-800 font-bold mb-2">¡Pronto expandiremos nuestros destinos! Mientras tanto...</p>
                  <button onClick={() => { setInfoModal({ isOpen: false, title: '', content: '' }); setSearchQuery(''); fetchActivities({ ...filters, searchQuery: '' }); }} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm text-sm">Explora otras opciones</button>
               </div>
            )
         });
      }
      return data;
    } catch (error) {
      console.error('[Frontend-Fetch] Error:', error);
      return [];
    } finally {
      if (!isCategoryFetch) setLoading(false);
    }
  };

  // Función unificada para cargar datos balanceados (10 de cada categoría)
  const loadBalancedActivities = async () => {
    setLoading(true);
    try {
      console.log('[Frontend-Load] Iniciando carga balanceada...');
      const [exp, ser] = await Promise.all([
        fetchActivities({ type: 'TURISTICA', limit: 10 }, true),
        fetchActivities({ type: 'ALIMENTARIA', limit: 10 }, true)
      ]);
      const combined = [...(exp || []), ...(ser || [])];
      console.log(`[Frontend-Load] Finalizado. Exp: ${(exp || []).length}, Ser: ${(ser || []).length}, Total: ${combined.length}`);
      setActivities(combined);
    } catch (e) {
      console.error('[Frontend-Load] Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    // Si la categoría es "todas", hacemos una carga balanceada con los filtros actuales
    if (activeCategory === 'todas') {
      setLoading(true);
      try {
        const [exp, ser] = await Promise.all([
          fetchActivities({ city, province, country, lat, lng, radius, adults, childrenCount, type: 'TURISTICA', limit: 10 }, true),
          fetchActivities({ city, province, country, lat, lng, radius, adults, childrenCount, type: 'ALIMENTARIA', limit: 10 }, true)
        ]);
        setActivities([...(exp || []), ...(ser || [])]);
      } catch (e) {
        console.error('[Frontend-Search] Error en búsqueda balanceada:', e);
      } finally {
        setLoading(false);
      }
    } else {
      // Búsqueda específica por categoría
      fetchActivities({
        city, province, country, lat, lng, radius, adults, childrenCount,
        type: activeCategory === 'experiencias' ? 'TURISTICA' : 'ALIMENTARIA'
      });
    }
  };

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLng(longitude);
          
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`, {
              headers: { 'Accept-Language': 'es', 'User-Agent': 'TurismoApp/1.0' }
            });
            let foundCity = city;
            let foundProvince = province;
            let foundCountry = country;
            if (response.ok) {
              const data = await response.json();
              const addr = data.address;
              foundCity = addr.city || addr.town || addr.village || addr.suburb || '';
              foundProvince = addr.state || '';
              foundCountry = addr.country || '';

              setCity(foundCity);
              setProvince(foundProvince);
              setCountry(foundCountry);
              setSearchQuery('Mi Ubicación Actual');
            }

            // Búsqueda secuencial
            const radii = [10, 30, 50];
            let resultsFound = false;

            for (const r of radii) {
              const results = await fetchActivities({
                 city: foundCity,
                 province: foundProvince,
                 country: foundCountry,
                 lat: latitude, 
                 lng: longitude, 
                 radius: r, 
                 adults, 
                 childrenCount
              }, true); // skipModal = true

              if (results && results.length > 0) {
                setRadius(r);
                handleSearch();
                setInfoModal({
                  isOpen: true,
                  title: '¡Resultados encontrados!',
                  content: (
                    <div className="flex flex-col gap-4 items-center justify-center py-2 text-center">
                      <p className="text-slate-600">Se encontraron experiencias o servicios a <span className="font-bold text-slate-800">{r} km</span> de tu ubicación.</p>
                      <button onClick={() => setInfoModal({ isOpen: false, title: '', content: '' })} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm text-sm">Explorar</button>
                    </div>
                  )
                });
                resultsFound = true;
                break;
              }
            }

            if (!resultsFound) {
              setInfoModal({
                isOpen: true,
                title: 'Sin resultados',
                content: (
                   <div className="flex flex-col gap-4 items-center justify-center py-2 text-center">
                      <p className="text-slate-600">No hay resultados disponibles en el área (hasta 50 km).</p>
                   </div>
                )
              });
            }

          } catch (err) {
            console.error("Reverse geocoding error:", err);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error(error);
          setIsLocating(false);
          setInfoModal({ isOpen: true, title: 'Error', content: 'No se pudo obtener la ubicación.' });
        }
      );
    } else {
      setInfoModal({ isOpen: true, title: 'Error', content: 'Geolocalización no soportada.' });
    }
  };

  useEffect(() => {
    loadBalancedActivities();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      {/* Hero Section with Carousel */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={HERO_IMAGES[currentImageIndex]}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full h-full object-cover"
              alt={`Hero Background ${currentImageIndex}`}
            />
          </AnimatePresence>
          {/* Subtle dark overlay for contrast without blue tint */}
          <div className="absolute inset-0 bg-black/30 z-10"></div>
        </div>
        
        <div className="relative z-20 text-center text-white px-4 max-w-4xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
          <h1 className="text-5xl md:text-7xl font-display font-black mb-6 animate-fade-in-up">
            Encuentra actividades únicas en el <span className="text-secondary">Ecuador</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-95 mb-8 font-light">
            Explora experiencias auténticas diseñadas para aventureros y buscadores de serenidad.
          </p>
          
          {/* Carousel Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {HERO_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentImageIndex === idx ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container-wide -mt-20 relative z-40 pb-20">
        {/* Search Bar */}
        <div className="relative z-50 bg-white p-6 md:p-8 rounded-3xl shadow-2xl mb-16 flex flex-col gap-6 border border-slate-100 backdrop-blur-sm bg-white/90">
          
          {/* Main Search Row */}
          <div className="flex flex-col xl:flex-row gap-6 items-end">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* País */}
              <div className="relative group">
                <label className="block text-[10px] font-black text-primary mb-2 tracking-widest uppercase ml-1">País</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <select 
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      if (e.target.value !== 'Ecuador') {
                        setProvince('');
                        setCity('');
                      }
                    }}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-700 font-medium appearance-none"
                  >
                    <option value="">Seleccionar País</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="OTRO">Otro (Escribir...)</option>
                  </select>
                </div>
              </div>

              {/* Provincia */}
              <div className="relative group">
                <label className="block text-[10px] font-black text-primary mb-2 tracking-widest uppercase ml-1">Provincia</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  {country === 'Ecuador' ? (
                    <select 
                      value={province}
                      onChange={(e) => {
                        setProvince(e.target.value);
                        setCity('');
                      }}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-700 font-medium appearance-none"
                    >
                      <option value="">Seleccionar Provincia</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  ) : (
                    <input 
                      type="text"
                      placeholder="Provincia/Estado"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-700 font-medium"
                    />
                  )}
                </div>
              </div>

              {/* Ciudad */}
              <div className="relative group">
                <label className="block text-[10px] font-black text-primary mb-2 tracking-widest uppercase ml-1">Ciudad</label>
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    {country === 'Ecuador' && province ? (
                      <select 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-700 font-medium appearance-none"
                      >
                        <option value="">Seleccionar Ciudad</option>
                        {ecuadorData[province]?.sort().map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <input 
                        type="text"
                        placeholder="Ciudad"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-700 font-medium"
                      />
                    )}
                  </div>

                  <button 
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center relative ${
                      searchQuery === 'Mi Ubicación Actual' 
                        ? 'bg-success-light text-success' 
                        : 'bg-secondary/10 text-primary hover:bg-secondary hover:text-white'
                    }`}
                    title="Usar mi ubicación actual"
                  >
                    {isLocating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>


            <div className="w-full xl:w-[280px] shrink-0 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-primary mb-2 tracking-widest uppercase">Adultos</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="number" 
                    min="1"
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full pl-9 pr-2 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-700 font-medium" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-primary mb-2 tracking-widest uppercase">Niños</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 scale-90" />
                  <input 
                    type="number" 
                    min="0"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(Number(e.target.value))}
                    className="w-full pl-9 pr-2 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-primary outline-none transition-all text-slate-700 font-medium" 
                  />
                </div>
              </div>
            </div>

            <div className="flex w-full xl:w-auto gap-2 shrink-0">
              <button 
                 onClick={() => {
                   setCity('');
                   setProvince('');
                   setCountry('');
                   setLat(null);
                   setLng(null);
                   setRadius(10);
                   setAdults(1);
                   setChildrenCount(0);
                   
                   setSearchParams({});
                    loadBalancedActivities();
                 }}
                 className="w-1/3 xl:w-auto bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-200"
                 title="Limpiar filtros"
               >
                 <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                 onClick={handleSearch}
                 className="flex-1 xl:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 border border-primary/20 hover:border-primary/50"
               >
                 <Search className="w-4 h-4" /> Buscar
              </button>
            </div>
          </div>
        </div>

        {/* Activities Grid Header & Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-display font-black text-slate-800">Nuestras Recomendaciones</h2>
            <div className="h-1.5 w-20 bg-primary mt-2 rounded-full"></div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 shadow-inner">
               <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                  title="Vista de Cuadrícula"
               >
                  <LayoutGrid className="w-5 h-5" />
               </button>
               <button 
                  onClick={() => setViewMode('map')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'map' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                  title="Vista de Mapa"
               >
                  <Map className="w-5 h-5" />
               </button>
            </div>

            <div className="flex p-1.5 bg-slate-100/50 backdrop-blur-sm rounded-2xl border border-slate-100 gap-1">
              {['todas', 'experiencias', 'servicios'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSearchParams({ category: cat })}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                    activeCategory === cat
                      ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/50'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Activities Sections */}
        {loading ? (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse h-96">
                <div className="h-60 bg-slate-200" />
                <div className="p-6">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-20 mb-20">
            {viewMode === 'map' ? (
              <div className="animate-fade-in-up">
                <MapView 
                  activities={filteredActivities} 
                  onOpenDetail={(full) => {
                    setSelectedActivity(full);
                    setIsDetailOpen(true);
                  }}
                />
              </div>
            ) : (
              <>
                {/* Experiencias Section */}
                {(activeCategory === 'todas' || activeCategory === 'experiencias') && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Experiencias Destacadas</h3>
                  <div className="h-px flex-grow bg-slate-200"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {activities.filter(a => a.tipo === 'TURISTICA').map((activity) => (
                    <ActivityCard 
                      key={activity.id} 
                      activity={activity} 
                      onOpenDetail={(full) => {
                        setSelectedActivity(full);
                        setIsDetailOpen(true);
                      }} 
                      onOpenBooking={handleOpenBookingRequest}
                    />
                  ))}
                  {activities.filter(a => a.tipo === 'TURISTICA').length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                      No hay experiencias disponibles en este momento.
                    </div>
                  )}
                </div>
                {activities.filter(a => a.tipo === 'TURISTICA').length > 0 && (
                  <div className="mt-10 flex justify-center">
                    <button 
                      onClick={() => {
                        setSearchParams({ category: 'experiencias' });
                        fetchActivities({ ...{searchQuery, lat, lng, radius, adults, childrenCount}, limit: null });
                      }}
                      className="px-6 py-3 bg-secondary/10 text-primary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm flex items-center gap-2"
                    >
                      Ver todas las Experiencias <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Servicios Section */}
            {(activeCategory === 'todas' || activeCategory === 'servicios') && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-xl font-bold text-slate-800 uppercase tracking-wider">Servicios y Alimentación</h3>
                  <div className="h-px flex-grow bg-slate-200"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {activities.filter(a => a.tipo === 'ALIMENTARIA').map((activity) => (
                    <ActivityCard 
                      key={activity.id} 
                      activity={activity} 
                      onOpenDetail={(full) => {
                        setSelectedActivity(full);
                        setIsDetailOpen(true);
                      }} 
                      onOpenBooking={handleOpenBookingRequest}
                    />
                  ))}
                  {activities.filter(a => a.tipo === 'ALIMENTARIA').length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                      No hay servicios disponibles en este momento.
                    </div>
                  )}
                </div>
                {activities.filter(a => a.tipo === 'ALIMENTARIA').length > 0 && (
                  <div className="mt-10 flex justify-center">
                    <button 
                      onClick={() => {
                        setSearchParams({ category: 'servicios' });
                        fetchActivities({ ...{searchQuery, lat, lng, radius, adults, childrenCount}, limit: null });
                      }}
                      className="px-8 py-3 bg-primary/10 text-primary font-bold rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm flex items-center gap-2"
                    >
                      Ver todos los Servicios <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
            </>
          )}
          </div>
        )}
      </main>

      <ActivityDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        activity={selectedActivity}
      />

      <AnimatePresence>
        {!isBookingOpen && selectedItems?.length > 0 && (
          <motion.div 
             initial={{ scale: 0, opacity: 0, y: 50 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             exit={{ scale: 0, opacity: 0, y: 50 }}
             className="fixed bottom-8 right-8 z-[100]"
          >
             <button 
                onClick={() => setIsBookingOpen(true)}
                className="bg-primary hover:bg-primary-dark text-white rounded-[2rem] p-4 pr-6 flex items-center gap-4 shadow-2xl shadow-primary/40 hover:-translate-y-1 transition-all group"
             >
                <div className="relative">
                   <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-6 h-6" />
                   </div>
                   <span className="absolute -top-2 -right-2 bg-secondary text-primary-dark w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shadow-md border-2 border-primary">
                      {selectedItems.length}
                   </span>
                </div>
                <div className="flex flex-col items-start pr-2">
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Tu Paquete</span>
                   <span className="font-bold text-sm">Ver actividades</span>
                </div>
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <BookingSidebar 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

      <Footer />

      <InfoModal 
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal(prev => ({ ...prev, isOpen: false }))}
        title={infoModal.title}
        content={infoModal.content}
      />
    </div>
  );
};


const HomeWrapper = () => (
  <CartProvider>
    <Home />
  </CartProvider>
);

export default HomeWrapper;
