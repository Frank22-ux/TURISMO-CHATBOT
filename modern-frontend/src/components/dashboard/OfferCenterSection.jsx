import { useState, useEffect, useRef } from 'react';
import { Ticket, Calendar, CheckCircle2, AlertCircle, Percent, Clock, Sparkles, MapPinned, Utensils, Save, X, ChevronDown } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import CustomCalendar from '../CustomCalendar';
import { motion, AnimatePresence } from 'framer-motion';

const OfferCenterSection = () => {
  const [activities, setActivities] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [discountType, setDiscountType] = useState('EXPERIENCE'); // 'EXPERIENCE' or 'SERVICE'
  const [offerData, setOfferData] = useState({
    percentage: 10,
    price: '',
    expiration: ''
  });
  const [packageDiscount, setPackageDiscount] = useState(0);
  const [isUpdatingPackage, setIsUpdatingPackage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);
  const { showToast } = useToast();

  // Feriados de Ecuador 2026 (Ejemplos para sugerencias)
  const ecuadorHolidays = [
    { name: 'Semana Santa', date: '2026-04-03', description: 'Atrae turistas religiosos y familiares.' },
    { name: 'Día del Trabajo', date: '2026-05-01', description: 'Feriado nacional de descanso.' },
    { name: 'Batalla de Pichincha', date: '2026-05-24', description: 'Temporada alta en la sierra.' },
    { name: 'Independencia de Guayaquil', date: '2026-10-09', description: 'Mucho movimiento hacia la costa.' },
    { name: 'Día de Difuntos y Cuenca', date: '2026-11-02', description: 'Uno de los feriados más largos.' },
    { name: 'Navidad y Fin de Año', date: '2026-12-25', description: 'La mayor demanda del año.' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const [actRes, serRes] = await Promise.all([
        fetch('http://localhost:3000/api/host/activities', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/host/services', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (actRes.ok) setActivities(await actRes.json());
      if (serRes.ok) setServices(await serRes.json());

      // Fetch profile to get current package discount
      const profRes = await fetch('http://localhost:3000/api/host/profile', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (profRes.ok) {
        const profData = await profRes.json();
        setPackageDiscount(profData.descuento_paquete || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleApplyOffer = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;
    if (!offerData.expiration) return;

    setIsSaving(true);
    try {
      const token = sessionStorage.getItem('token');
      
      const itemsToUpdate = (discountType === 'EXPERIENCE' ? activities : services)
        .filter(item => selectedItems.includes(item.id_actividad));

      const res = await fetch('http://localhost:3000/api/host/bulk-offers', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: selectedItems,
          type: discountType,
          offerPrice: offerData.price || null,
          percentage: offerData.percentage,
          expirationDate: offerData.expiration
        })
      });

      // Improvement: Calculate price on backend or send percentage.
      // Let's refine the backend call to use percentage if fixed price is not provided.
      
      if (res.ok) {
        setSelectedItems([]);
        fetchData();
        showToast('Ofertas aplicadas con éxito', 'success');
      } else {
        showToast('Error al aplicar las ofertas', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePackageDiscount = async () => {
    setIsUpdatingPackage(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/host/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ descuento_paquete: packageDiscount })
      });
      
      if (response.ok) {
        showToast('Descuento por combo actualizado', 'success');
      } else {
        showToast('Error al actualizar descuento', 'error');
      }
    } catch (error) {
      showToast('Error de conexión', 'error');
    } finally {
      setIsUpdatingPackage(false);
    }
  };

  const getNextHoliday = () => {
    const today = new Date();
    return ecuadorHolidays.find(h => new Date(h.date) > today);
  };

  const nextHoliday = getNextHoliday();

  if (isLoading) return <div className="h-64 flex items-center justify-center animate-pulse text-slate-400 font-bold">Analizando temporadas...</div>;

  const currentList = discountType === 'EXPERIENCE' ? activities : services;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Sparkles className="text-primary w-8 h-8" /> Centro de Ofertas
          </h2>
          <p className="text-slate-500 mt-2">Gestiona descuentos masivos y aprovecha los feriados de Ecuador.</p>
        </div>
      </div>

      {/* Holiday Suggestion Banner */}
      {nextHoliday && (
        <div className="bg-gradient-to-r from-primary/10 to-indigo-50 border-l-4 border-primary p-6 rounded-r-3xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Próxima Oportunidad</p>
              <h4 className="text-xl font-black text-slate-800">{nextHoliday.name} — <span className="text-primary">{new Date(nextHoliday.date).toLocaleDateString()}</span></h4>
              <p className="text-sm text-slate-500 mt-1">{nextHoliday.description}</p>
            </div>
          </div>
          <button 
            onClick={() => setOfferData({ ...offerData, expiration: nextHoliday.date })}
            className="px-6 py-3 bg-white text-primary border border-primary/20 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            Preparar Campaña
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Bulk Action Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 sticky top-10 z-50">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" /> Configurar Oferta
            </h3>

            <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8">
              <button 
                onClick={() => { setDiscountType('EXPERIENCE'); setSelectedItems([]); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${discountType === 'EXPERIENCE' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
              >
                Experiencias
              </button>
              <button 
                onClick={() => { setDiscountType('SERVICE'); setSelectedItems([]); }}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${discountType === 'SERVICE' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
              >
                Servicios
              </button>
            </div>

            <form onSubmit={handleApplyOffer} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descuento (%)</label>
                <div className="flex gap-2">
                   {[10, 15, 20, 30].map(p => (
                     <button 
                        key={p} type="button"
                        onClick={() => setOfferData({...offerData, percentage: p, price: ''})}
                        className={`flex-1 py-3 rounded-xl text-xs font-black border transition-all ${offerData.percentage === p && !offerData.price ? 'bg-primary border-primary text-white' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                     >
                       -{p}%
                     </button>
                   ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-black">$</span>
                </div>
                <input 
                  type="number"
                  placeholder="O fija un precio..."
                  value={offerData.price}
                  onChange={(e) => setOfferData({...offerData, price: e.target.value, percentage: 0})}
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="space-y-2 relative" ref={calendarRef}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Expiración</label>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold flex items-center justify-between hover:bg-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-4 h-4 ${offerData.expiration ? 'text-primary' : 'text-slate-300'}`} />
                    <span className={offerData.expiration ? 'text-slate-800' : 'text-slate-400'}>
                      {offerData.expiration ? new Date(offerData.expiration).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Seleccionar fecha...'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showCalendar && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 top-full mt-2 z-[100] shadow-2xl"
                    >
                      <CustomCalendar 
                        selectedDate={offerData.expiration}
                        onSelect={(date) => {
                          setOfferData({ ...offerData, expiration: date });
                          setShowCalendar(false);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-4">
                <p className="text-[10px] text-slate-400 font-bold mb-4 flex items-center gap-2">
                   {selectedItems.length} seleccionados
                </p>
                <button 
                  disabled={isSaving || selectedItems.length === 0 || !offerData.expiration}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSaving ? 'Procesando...' : 'Aplicar Oferta Ahora'}
                </button>
              </div>
            </form>
          </div>

          {/* New Package Discount Card */}
          <div className="bg-gradient-to-br from-primary-dark to-slate-900 rounded-[32px] p-8 shadow-xl text-white relative overflow-hidden">
            <Percent className="absolute -top-10 -right-10 w-40 h-40 opacity-10" />
            <h3 className="text-lg font-black mb-2 flex items-center gap-2 relative z-10">
              <Sparkles className="w-5 h-5 text-primary" /> Incentivo de Paquete
            </h3>
            <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-6 relative z-10">
              Descuento por 2+ actividades
            </p>

            <div className="space-y-6 relative z-10">
               <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-2xl font-black">{packageDiscount}%</span>
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Combo 2+</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={packageDiscount}
                    onChange={(e) => setPackageDiscount(parseInt(e.target.value))}
                    className="w-full accent-primary h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
               </div>

               <p className="text-[11px] font-medium opacity-70 leading-relaxed">
                 Este descuento se aplicará automáticamente al subtotal cuando el turista reserva 2 o más servicios de tu negocio.
               </p>

               <button 
                 onClick={handleUpdatePackageDiscount}
                 disabled={isUpdatingPackage}
                 className="w-full py-4 bg-white text-primary-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
               >
                 {isUpdatingPackage ? 'Guardando...' : 'Actualizar Descuento'}
               </button>
            </div>
          </div>
        </div>

        {/* Selection List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 min-h-full">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-lg font-black text-slate-800">Tus {discountType === 'EXPERIENCE' ? 'Rutas' : 'Locales'}</h3>
               <button 
                 onClick={() => {
                   if (selectedItems.length === currentList.length) setSelectedItems([]);
                   else setSelectedItems(currentList.map(i => i.id_actividad));
                 }}
                 className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
               >
                 {selectedItems.length === currentList.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
               </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {currentList.length === 0 ? (
                <div className="col-span-2 py-20 text-center">
                   <p className="text-slate-400 font-bold">Sin elementos.</p>
                </div>
              ) : (
                currentList.map((item) => (
                  <div 
                    key={item.id_actividad}
                    onClick={() => toggleSelection(item.id_actividad)}
                    className={`relative p-4 rounded-3xl border-2 transition-all cursor-pointer group ${selectedItems.includes(item.id_actividad) ? 'border-primary bg-primary/5' : 'border-slate-50 hover:border-slate-200'}`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0">
                        <img src={item.portada || item.image || item.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-800 text-sm truncate">{item.titulo}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           {item.precio_oferta ? (
                             <>
                               <span className="text-emerald-600 font-black text-sm">${parseFloat(item.precio_oferta).toFixed(2)}</span>
                               <span className="text-slate-400 text-[10px] line-through">${parseFloat(item.precio).toFixed(2)}</span>
                             </>
                           ) : (
                             <span className="text-slate-500 font-bold text-sm">${parseFloat(item.precio).toFixed(2)}</span>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferCenterSection;
