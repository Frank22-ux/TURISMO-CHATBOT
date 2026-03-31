import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, Image as ImageIcon, Users, Calendar, Navigation, RefreshCw, LayoutGrid, Map } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ActivityDetailModal from '../components/dashboard/ActivityDetailModal';
import InfoModal from '../components/InfoModal';
import BookingSidebar from '../components/BookingSidebar';
import CustomCalendar from '../components/CustomCalendar';
import MapView from '../components/dashboard/MapView';
import { ecuadorData, provinces, countries } from '../data/ecuadorData';

const ActivityCard = ({ activity, onOpenDetail, onOpenBooking }) => (
  <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-50 relative flex flex-col h-full">
    <div className="relative h-60 overflow-hidden">
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
      <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-primary-dark shadow-sm z-10">
        {activity.tipo === 'TURISTICA' ? 'Experiencia' : 'Servicio'}
      </span>
      {activity.precio_oferta && (
        <span className="absolute top-4 left-4 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg z-10 animate-pulse">
          OFERTA -{Math.round((1 - (activity.precio_oferta / activity.original_price)) * 100)}%
        </span>
      )}
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="flex items-center gap-2 text-primary text-xs font-bold mb-3 uppercase tracking-wider">
        <MapPin className="w-3 h-3" /> {activity.location}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-6 group-hover:text-primary transition-colors leading-snug">
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
            <span className="text-[9px] font-black uppercase text-emerald-600 tracking-tighter mt-[-2px]">15% IVA Incluido</span>
          </div>
          <button 
            onClick={async () => {
              try {
                const response = await fetch(`http://localhost:3000/api/activities/${activity.id}`);
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
            }}
            className="text-primary font-bold text-sm hover:text-primary-dark flex items-center gap-2 transition-all p-2"
          >
            Ver más <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <button 
          onClick={() => onOpenBooking(activity)}
          className="w-full py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black text-sm transition-all shadow-lg shadow-primary/10 hover:shadow-primary/30 flex items-center justify-center gap-2 active:scale-95"
        >
          Reservar Ahora
        </button>
      </div>
    </div>
  </div>
);


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
  const [date, setDate] = useState('');
  const [infoModal, setInfoModal] = useState({ isOpen: false, title: '', content: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const datePickerRef = useRef(null);
  const locationDropdownRef = useRef(null);
  const navigate = useNavigate();

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
              className="px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg text-sm w-3/4"
            >
              Ingresar / Registrarse
            </button>
          </div>
        )
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/activities/${act.id}`);
      if (response.ok) {
        const fullData = await response.json();
        setActivityToBook(fullData);
      } else {
        setActivityToBook(act);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setActivityToBook(act);
    }
    setIsBookingOpen(true);
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
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredActivities = useMemo(() => {
    if (activeCategory === 'todas') return activities;
    const typeToFilter = activeCategory === 'experiencias' ? 'TURISTICA' : 'ALIMENTARIA';
    return activities.filter(activity => activity.tipo === typeToFilter);
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
  const serviciosData = useMemo(() => activities.filter(a => a.tipo === 'ALIMENTARIA'), [activities]);

  const fetchActivities = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.province) params.append('province', filters.province);
      if (filters.country) params.append('country', filters.country);
      
      if (filters.lat && filters.lng) {
        params.append('lat', filters.lat);
        params.append('lng', filters.lng);
        params.append('radius', filters.radius || 10);
      }
      
      const guestsTotal = (filters.adults || 1) + (filters.childrenCount || 0);
      if (guestsTotal > 1) {
        params.append('guests', guestsTotal);
      }
      if (filters.date) {
        params.append('startDate', filters.date);
        params.append('endDate', filters.date);
      }
      // Set to 10 for the homepage recommendations
      if (filters.limit !== undefined) {
         if (filters.limit) params.append('limit', filters.limit);
         // If filters.limit is null/false, we append nothing (meaning fetch all)
      } else {
         params.append('limit', 10);
      }

      const response = await fetch(`http://localhost:3000/api/activities?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
        
        // Custom notification for empty location results
        if (data.length === 0 && filters.lat && filters.lng) {
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
                         <button onClick={() => {
                             setInfoModal({ isOpen: false, title: '', content: '' });
                             setRadius(20);
                             fetchActivities({ ...filters, radius: 20 });
                         }} className="px-5 py-2.5 bg-secondary/10 text-secondary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm text-sm">20 km</button>
                       )}
                       {currentRadius < 30 && (
                         <button onClick={() => {
                             setInfoModal({ isOpen: false, title: '', content: '' });
                             setRadius(30);
                             fetchActivities({ ...filters, radius: 30 });
                         }} className="px-5 py-2.5 bg-secondary/10 text-secondary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm text-sm">30 km</button>
                       )}
                       {currentRadius < 50 && (
                         <button onClick={() => {
                             setInfoModal({ isOpen: false, title: '', content: '' });
                             setRadius(50);
                             fetchActivities({ ...filters, radius: 50 });
                         }} className="px-5 py-2.5 bg-secondary/10 text-secondary font-bold rounded-xl hover:bg-secondary hover:text-white transition-all shadow-sm text-sm">50 km</button>
                       )}
                       <button onClick={() => {
                           setInfoModal({ isOpen: false, title: '', content: '' });
                           setSearchQuery('');
                           setLat(null);
                           setLng(null);
                           fetchActivities({ ...filters, lat: null, lng: null, searchQuery: '', limit: null });
                       }} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm text-sm">Ver todas</button>
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
                    <button onClick={() => {
                        setInfoModal({ isOpen: false, title: '', content: '' });
                        setSearchQuery('');
                        fetchActivities({ ...filters, searchQuery: '' });
                    }} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-sm text-sm">Explora otras opciones</button>
                 </div>
              )
           });
        }

      } else {
        console.error('Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchActivities({
      city, province, country, lat, lng, radius, adults, childrenCount, date
    });
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
            if (response.ok) {
              const data = await response.json();
              const addr = data.address;
              const foundCity = addr.city || addr.town || addr.village || addr.suburb || '';
              const foundProvince = addr.state || '';
              const foundCountry = addr.country || '';

              setCity(foundCity);
              setProvince(foundProvince);
              setCountry(foundCountry);
              setSearchQuery('Mi Ubicación Actual');
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
    fetchActivities({});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-primary-dark">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover opacity-60"
            alt="Hero Background"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-display font-black mb-6 animate-fade-in-up">
            Encuentra actividades únicas en el <span className="text-secondary">Ecuador</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 font-light">
            Explora experiencias auténticas diseñadas para aventureros y buscadores de serenidad.
          </p>
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
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-white'
                    }`}
                    title="Usar mi ubicación actual"
                  >
                    {isLocating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                  </button>
                  
                  <select
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="py-3 px-2 rounded-xl border border-slate-100 bg-slate-50 outline-none text-slate-700 text-xs font-bold shrink-0 no-appearance"
                    title="Radio de búsqueda"
                  >
                    <option value={10}>10 km</option>
                    <option value={30}>30 km</option>
                    <option value={50}>50 km</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="w-full xl:w-56 shrink-0 relative" ref={datePickerRef}>
               <label className="block text-xs font-bold text-primary mb-2 tracking-widest uppercase">Fecha</label>
               <div 
                 className="relative cursor-pointer"
                 onClick={() => setShowDatePicker(!showDatePicker)}
               >
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   readOnly
                   value={date ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date + 'T12:00:00')) : ''}
                   placeholder="Añadir fecha"
                   className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-white focus:ring-2 focus:ring-primary outline-none transition-all text-slate-700 font-medium cursor-pointer" 
                 />
               </div>
               {showDatePicker && (
                 <div className="absolute top-full left-0 mt-2 z-50">
                    <CustomCalendar 
                       selectedDate={date} 
                       onSelect={(d) => {
                          setDate(d);
                          setShowDatePicker(false);
                       }} 
                    />
                 </div>
               )}
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
                   setDate('');
                   setSearchParams({});
                   fetchActivities({ city: '', province: '', country: '', lat: null, lng: null, radius: 10, adults: 1, childrenCount: 0, date: '' });
                 }}
                 className="w-1/3 xl:w-auto bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-200"
                 title="Limpiar filtros"
               >
                 <RefreshCw className="w-4 h-4" />
              </button>
              <button 
                 onClick={handleSearch}
                 className="flex-1 xl:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 border border-primary/20 hover:border-primary/50"
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
                        fetchActivities({ ...{searchQuery, lat, lng, radius, adults, childrenCount, date}, limit: null });
                      }}
                      className="px-8 py-3 bg-secondary/10 text-secondary font-bold rounded-2xl hover:bg-secondary hover:text-white transition-all shadow-sm flex items-center gap-2"
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
                        fetchActivities({ ...{searchQuery, lat, lng, radius, adults, childrenCount, date}, limit: null });
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

      <BookingSidebar 
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        activity={activityToBook}
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


export default Home;
