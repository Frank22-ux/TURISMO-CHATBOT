import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Minus, Plus, CreditCard, ChevronRight, Clock, Shield, Star, CheckCircle2, ChevronLeft, MessageSquare, Trash2, Sparkle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CustomCalendar from './CustomCalendar';

const BookingSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { selectedItems, removeFromCart, checkConflicts, hostId } = useCart();
  const [dates, setDates] = useState({}); // { activityId: dateString }
  const [guestCounts, setGuestCounts] = useState({}); // { activityId: { adults, children, seniors } }
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hostDiscount, setHostDiscount] = useState(0);
  const [capacities, setCapacities] = useState({}); // { activityId: remaining }
  const [loadingCapacities, setLoadingCapacities] = useState({});
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const updateGuestCount = (activityId, type, delta) => {
    setGuestCounts(prev => {
      const counts = prev[activityId] || { adults: 1, children: 0, seniors: 0 };
      const newValue = Math.max(type === 'adults' ? 1 : 0, counts[type] + delta);
      return {
        ...prev,
        [activityId]: { ...counts, [type]: newValue }
      };
    });
  };

  const priceDetails = useMemo(() => {
    if (selectedItems.length === 0) return { subtotal: 0, iva: 0, discount: 0, total: 0 };
    
    let totalBase = 0;
    selectedItems.forEach(item => {
      const counts = guestCounts[item.id] || { adults: 1, children: 0, seniors: 0 };
      const p = parseFloat(item.price || item.precio) || 0;
      totalBase += (p * counts.adults) + (p * 0.5 * counts.children) + (p * 0.5 * counts.seniors);
    });

    let discountAmount = 0;
    if (selectedItems.length >= 2 && hostDiscount > 0) {
      discountAmount = (totalBase * hostDiscount) / 100;
    }

    const totalFinal = totalBase - discountAmount;
    const subtotal = totalFinal / 1.15;
    const iva = totalFinal - subtotal;
    
    return { subtotal, iva, discount: discountAmount, total: totalFinal };
  }, [selectedItems, guestCounts, hostDiscount]);

  const handleBooking = async (token) => {
    setIsProcessing(true);
    setError(null);
    try {
      const tokenAuth = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/reservations/package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAuth}`
        },
        body: JSON.stringify({
          token,
          hostId,
          discountPercentage: hostDiscount,
          items: selectedItems.map(item => {
            const counts = guestCounts[item.id] || { adults: 1, children: 0, seniors: 0 };
            const totalPeople = counts.adults + counts.children + counts.seniors;
            const itemBasePrice = parseFloat(item.price) || 0;
            const itemTotal = (itemBasePrice * counts.adults) + (itemBasePrice * 0.5 * counts.children) + (itemBasePrice * 0.5 * counts.seniors);
            const appliedDiscount = selectedItems.length >= 2 ? (itemTotal * hostDiscount / 100) : 0;

            return {
              id_actividad: item.id,
              fecha_experiencia: dates[item.id],
              cantidad_personas: totalPeople,
              cantidad_adultos: counts.adults,
              cantidad_ninos: counts.children,
              cantidad_tercera_edad: counts.seniors,
              original_price: itemBasePrice,
              final_total: itemTotal - appliedDiscount
            };
          }),
          total: priceDetails.total
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Error al procesar la reserva');

      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate('/dashboard-tourist?section=bookings');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (item) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('Debes iniciar sesión para enviar mensajes al anfitrión.');
        navigate('/login');
        return;
      }
      
      const response = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_receptor: hostId,
          contenido: `¡Hola! Estoy armando un paquete con tu actividad "${item.titulo}". ¿Me podrías dar un poco más de información sobre esta experiencia y si hay algún consejo extra?`
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
    }
  };

  const handlePaymentSubmit = () => {
    const allDatesSelected = selectedItems.every(item => dates[item.id]);
    if (!allDatesSelected) {
      setError('Por favor selecciona una fecha para todas las experiencias.');
      return;
    }

    const datesWithActs = selectedItems.map(item => ({ activity: item, date: dates[item.id] }));
    const conflictResult = checkConflicts(datesWithActs);
    if (conflictResult.conflict) {
      setError(`Conflicto de horario entre "${conflictResult.a}" y "${conflictResult.b}" el mismo día. Por favor elige horarios distintos.`);
      return;
    }

    if (!cardName || !cardNumber || !expiry || !cvv) {
      setError('Por favor completa todos los campos de la tarjeta.');
      return;
    }
    const [expiryMonth, expiryYear] = expiry.split('/');
    if (!expiryMonth || !expiryYear || expiryYear.length !== 2) {
      setError('Formato de expiración inválido. Usa MM/YY (ej. 12/26).');
      return;
    }

    const publicKey = import.meta.env.VITE_KUSHKI_PUBLIC_KEY;
    if (!publicKey) {
      setError('Error de configuración (Kushki Public Key no encontrada).');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const kushki = new window.Kushki({
        merchantId: publicKey,
        inTestEnvironment: true
      });

      kushki.requestToken({
        amount: priceDetails.total.toFixed(2),
        currency: "USD",
        card: {
          name: cardName,
          number: cardNumber.replace(/\s/g, ''),
          cvc: cvv,
          expiryMonth: expiryMonth,
          expiryYear: expiryYear
        }
      }, (response) => {
        if (!response.code) {
          handleBooking(response.token);
        } else {
          setIsProcessing(false);
          setError(response.message || 'Error al procesar la tarjeta con el banco.');
        }
      });
    } catch (err) {
      console.error('Error inicializando tokenizador:', err);
      setIsProcessing(false);
      setError('Error al inicializar el procesador de pagos.');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setCardName('');
      setCardNumber('');
      setExpiry('');
      setCvv('');
      setSuccess(false);
      setAcceptedTerms(false);
      setDates({});
      setGuestCounts({});
      setCapacities({});
    } else if (hostId) {
      const fetchHostDiscount = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/host/${hostId}/profile`);
          if (response.ok) {
            const data = await response.json();
            setHostDiscount(parseFloat(data.descuento_paquete) || 0);
          }
        } catch (err) {
          console.error('Error fetching host discount:', err);
        }
      };
      fetchHostDiscount();
    }
  }, [isOpen, hostId]);

  useEffect(() => {
    selectedItems.forEach(item => {
      const date = dates[item.id];
      if (date && !capacities[item.id] && !loadingCapacities[item.id]) {
        const fetchCap = async () => {
          setLoadingCapacities(prev => ({ ...prev, [item.id]: true }));
          try {
            const response = await fetch(`http://localhost:3000/api/activities/${item.id}/availability?date=${date}`);
            if (response.ok) {
              const data = await response.json();
              setCapacities(prev => ({ ...prev, [item.id]: data.remaining }));
            }
          } catch (err) {
            console.error('Error capacity:', err);
          } finally {
            setLoadingCapacities(prev => ({ ...prev, [item.id]: false }));
          }
        };
        fetchCap();
      }
    });
  }, [dates, selectedItems]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primary-dark/40 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-full max-w-lg bg-slate-50 shadow-2xl z-[60] overflow-y-auto"
          >
            {/* Custom Toast Notification */}
            <AnimatePresence>
              {toast && (
                <motion.div 
                  initial={{ opacity: 0, y: -50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 30, scale: 1 }}
                  exit={{ opacity: 0, y: -50, scale: 0.9 }}
                  className="fixed top-0 left-0 right-0 z-[200] flex justify-center px-4 pointer-events-none"
                >
                  <div className={`shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 backdrop-blur-md border ${toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white shadow-emerald-500/30' : 'bg-red-500/90 border-red-400 text-white shadow-red-500/30'}`}>
                     {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <X className="w-6 h-6" />}
                     <p className="font-bold text-sm tracking-wide">{toast.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* T&C MODAL */}
            <AnimatePresence>
              {showTermsModal && (
                <div className="fixed inset-0 flex items-center justify-center p-6 z-[100]">
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={() => setShowTermsModal(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                  />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-2xl font-black text-primary-dark">Términos y Condiciones</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Plataforma Turismo ISTPET</p>
                      </div>
                      <button onClick={() => setShowTermsModal(false)} className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar text-slate-700 space-y-8 text-base leading-relaxed p-2">
                      <section>
                        <h4 className="font-black text-primary-dark uppercase text-xs tracking-widest mb-3 border-b border-slate-100 pb-1">1. Reservas y Pagos</h4>
                        <p>Al confirmar tu pago, el monto total será procesado de forma segura a través de nuestra pasarela de pagos integrada (Kushki). Los fondos se mantendrán en custodia hasta que se complete satisfactoriamente la experiencia garantizando la seguridad de tu inversión.</p>
                      </section>
                      <section className="bg-red-50/50 p-6 rounded-3xl border border-red-100/50">
                        <h4 className="font-black text-red-600 uppercase text-xs tracking-widest mb-3">2. Política de Cancelación y Reembolsos</h4>
                        <p className="font-bold text-slate-700 mb-3">
                          Se devolverá únicamente el <span className="text-red-600">30% del total</span> de la experiencia en caso de cancelación por cualquier motivo.
                        </p>
                        <p className="text-sm font-medium text-slate-600">
                          Solo por factores externos comprobables se podrá solicitar una reprogramación de la fecha, sujeto a disponibilidad del anfitrión.
                        </p>
                        <p className="mt-4 text-sm font-medium text-slate-500 italic">* Las cancelaciones se procesan utilizando el código protector de tu boleto digital.</p>
                      </section>
                      <section>
                        <h4 className="font-black text-primary-dark uppercase text-xs tracking-widest mb-3 border-b border-slate-100 pb-1">3. Responsabilidad del Turista</h4>
                        <p>El turista es responsable de llegar puntualmente al punto de encuentro y seguir las normas de seguridad establecidas por el anfitrión. Nuestra plataforma actúa como mediador, pero la ejecución de la actividad es responsabilidad directa del anfitrión.</p>
                      </section>
                      <section>
                        <h4 className="font-black text-primary-dark uppercase text-xs tracking-widest mb-3 border-b border-slate-100 pb-1">4. Privacidad de Datos</h4>
                        <p>Tus datos bancarios nunca son almacenados en nuestros servidores. Todo el procesamiento de tarjetas cumple con los estándares internacionales PCI DSS a través de Kushki para tu total tranquilidad.</p>
                      </section>
                    </div>

                    <button 
                      onClick={() => {
                        setAcceptedTerms(true);
                        setShowTermsModal(false);
                      }}
                      className="w-full mt-8 bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all"
                    >
                      Aceptar y Continuar
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <div className="bg-white p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-display font-black text-primary-dark leading-none pb-2 tracking-tight">Tu Paquete</h2>
                  <div className="h-1.5 w-12 bg-primary rounded-full"></div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Discount Incentive Banner */}
              <AnimatePresence>
                {selectedItems.length > 0 && hostDiscount > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-8 p-6 rounded-[2.5rem] border-2 border-dashed flex items-center justify-between transition-all ${
                      selectedItems.length >= 2 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-2xl ${selectedItems.length >= 2 ? 'bg-emerald-500' : 'bg-amber-500'} text-white shadow-lg`}>
                          <Sparkle className="w-5 h-5" />
                       </div>
                       <div>
                          <h4 className="text-sm font-black uppercase tracking-tight">
                            {selectedItems.length >= 2 
                              ? `¡Combo Activo! Descuento ${hostDiscount}%` 
                              : `¡Casi lo logras!`}
                          </h4>
                          <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-0.5">
                            {selectedItems.length >= 2 
                              ? 'Ahorro aplicado a todas las actividades' 
                              : `Añade otra actividad y ahorra ${hostDiscount}%`}
                          </p>
                       </div>
                    </div>
                    {selectedItems.length >= 2 && (
                       <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Multi-Activity List */}
              <div className="space-y-8">
                {selectedItems.map((item) => (
                  <div key={item.id} className="relative bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm animate-fade-in group hover:border-primary/30 transition-all">
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute -top-3 -right-3 p-2 bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md z-20 hover:bg-red-500 hover:text-white"
                      title="Eliminar del paquete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex gap-6 mb-6">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                        <img src={item.portada || item.image} alt={item.titulo} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-lg font-black text-primary-dark line-clamp-1">{item.titulo}</h3>
                          {selectedItems.length >= 2 && hostDiscount > 0 && (
                             <span className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[9px] font-black uppercase tracking-tighter shadow-md animate-pulse">
                               -{hostDiscount}% Combo
                             </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                           <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest leading-none flex items-center border border-primary/20">
                              {item.tipo}
                           </span>
                           <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-500 text-[9px] font-black uppercase tracking-widest leading-none flex items-center border border-blue-100">
                              <Clock className="w-3 h-3 mr-1" /> {item.duracion_horas}H
                           </span>
                           {item.nombre_anfitrion && (
                             <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest leading-none flex items-center border border-amber-200">
                                <User className="w-3 h-3 mr-1" /> {item.nombre_anfitrion}
                             </span>
                           )}
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xl font-display font-black text-primary-dark">${item.price}</p>
                          <button 
                            onClick={() => handleSendMessage(item)}
                            className="bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                            title="Preguntar sobre esta actividad"
                          >
                            <MessageSquare className="w-4 h-4" /> Consultar
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Calendar className="w-3.5 h-3.5" /> Elige fecha para {item.titulo}
                      </label>
                      <CustomCalendar 
                        selectedDate={dates[item.id] || ''} 
                        onSelect={(d) => setDates(prev => ({ ...prev, [item.id]: d }))} 
                        availableDays={
                          item.dias_disponibles 
                            ? (typeof item.dias_disponibles === 'string' 
                                ? item.dias_disponibles.split(',').map(Number) 
                                : item.dias_disponibles)
                            : [0, 1, 2, 3, 4, 5, 6]
                        }
                      />
                      {dates[item.id] && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold border transition-all ${capacities[item.id] === 0 ? 'bg-red-50 text-red-700 border-red-100 animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                           {capacities[item.id] === 0 ? <X className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                           {loadingCapacities[item.id] ? 'Consultando...' : capacities[item.id] === 0 ? '¡Sin cupos para esta fecha!' : `${capacities[item.id] || 0} cupos disponibles`}
                        </div>
                      )}
                    </div>

                    {/* Guest Selection per activity */}
                    <div className="mt-8 space-y-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Compañeros de viaje</p>
                      
                      <div className="space-y-4">
                        {/* Adults */}
                        <div className="flex justify-between items-center group">
                          <div className="text-sm font-bold text-slate-700">Adultos</div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateGuestCount(item.id, 'adults', -1)}
                              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-white text-slate-400 hover:text-primary transition-all active:scale-90"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-display font-black text-lg w-4 text-center">
                              {guestCounts[item.id]?.adults || 1}
                            </span>
                            <button 
                              onClick={() => updateGuestCount(item.id, 'adults', 1)}
                              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/10 transition-all active:scale-90 hover:scale-105"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Children */}
                        <div className="flex justify-between items-center group">
                          <div>
                            <div className="text-sm font-bold text-slate-700">Niños</div>
                            <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">50% DESC.</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateGuestCount(item.id, 'children', -1)}
                              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-white text-slate-400 hover:text-primary transition-all active:scale-90"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-display font-black text-lg w-4 text-center">
                              {guestCounts[item.id]?.children || 0}
                            </span>
                            <button 
                              onClick={() => updateGuestCount(item.id, 'children', 1)}
                              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/10 transition-all active:scale-90 hover:scale-105"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Seniors */}
                        <div className="flex justify-between items-center group">
                          <div>
                            <div className="text-sm font-bold text-slate-700">Discapacitados</div>
                            <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter">50% DESC.</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateGuestCount(item.id, 'seniors', -1)}
                              className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-white text-slate-400 hover:text-primary transition-all active:scale-90"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-display font-black text-lg w-4 text-center">
                              {guestCounts[item.id]?.seniors || 0}
                            </span>
                            <button 
                              onClick={() => updateGuestCount(item.id, 'seniors', 1)}
                              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/10 transition-all active:scale-90 hover:scale-105"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {(guestCounts[item.id]?.seniors > 0) && (
                          <div className="pt-2">
                             <p className="text-[9px] font-bold text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-center gap-2">
                               <Shield className="w-3 h-3 shrink-0" /> Requiere acreditación
                             </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add more activities button */}
                {selectedItems.length > 0 && (
                  <div className="pt-4 pb-8 border-b border-dashed border-slate-200">
                    <button 
                      onClick={onClose}
                      className="w-full py-4 rounded-[2rem] bg-white border-2 border-dashed border-primary/30 text-primary font-black text-sm hover:bg-primary/5 hover:border-primary transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Plus className="w-5 h-5" /> 
                      Añadir más actividades del anfitrión
                    </button>
                    {selectedItems.length === 1 && hostDiscount > 0 && (
                      <p className="text-[10px] text-center mt-3 text-secondary font-black uppercase tracking-widest animate-bounce">
                        ¡Añade una más y obtén un {hostDiscount}% de descuento!
                      </p>
                    )}
                  </div>
                )}
              </div>

              {selectedItems.length === 0 && (
                <div className="py-20 text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
                    <Star className="w-10 h-10" />
                  </div>
                  <p className="text-slate-400 font-bold max-w-xs mx-auto text-sm">Tu selección está vacía. Busca experiencias y añádelas aquí.</p>
                  <button onClick={onClose} className="text-primary font-black uppercase tracking-widest text-xs">Explorar Ahora</button>
                </div>
              )}

              {/* Cleanup: Global counter removed */}

              {/* Checkout Card */}
              <div className="mt-16 bg-primary-dark rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <CreditCard className="w-5 h-5 opacity-40" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Resumen Financiero</span>
                  </div>
                  
                  <div className="space-y-4 mb-10">
                    <div className="flex justify-between text-sm items-center">
                        <span className="opacity-50">Subtotal (sin imp.)</span>
                        <div className="h-px flex-grow mx-4 bg-white/5" />
                        <span className="font-bold">${priceDetails.subtotal.toFixed(2)}</span>
                    </div>
                    
                    {priceDetails.discount > 0 && (
                      <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 my-4 flex justify-between items-center group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 to-emerald-500/5 group-hover:translate-x-full transition-transform duration-1000" />
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                              <Sparkle className="w-4 h-4" />
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Ahorro por Paquete ISTPET</p>
                              <p className="text-xs font-bold text-white">Descuento del {hostDiscount}% aplicado</p>
                           </div>
                        </div>
                        <span className="text-lg font-black text-emerald-400">-${priceDetails.discount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm items-center">
                        <span className="opacity-50 text-emerald-400">15% IVA (Incluido)</span>
                        <div className="h-px flex-grow mx-4 bg-white/5" />
                        <span className="font-bold text-emerald-400">${priceDetails.iva.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-xs font-bold">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> ¡Reserva confirmada con éxito! Redirigiendo...
                    </div>
                  )}
                  
                  {/* Native Payment Form Inputs */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Pago Seguro Kushki</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="relative group">
                        <input 
                          type="text"
                          placeholder="Nombre en la Tarjeta"
                          value={cardName}
                          onChange={e => setCardName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-secondary/50 focus:bg-white/[0.08] transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                          <Users className="w-4 h-4 text-secondary" />
                        </div>
                      </div>

                      <div className="relative group">
                        <input 
                          type="text"
                          placeholder="Número de Tarjeta"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 '))}
                          maxLength={19}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-secondary/50 focus:bg-white/[0.08] font-mono tracking-widest transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                          <CreditCard className="w-4 h-4 text-secondary" />
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="relative flex-1 group">
                          <input 
                            type="text"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={e => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2,4);
                              setExpiry(val);
                            }}
                            maxLength={5}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-secondary/50 focus:bg-white/[0.08] text-center font-mono transition-all"
                          />
                        </div>
                        <div className="relative flex-1 group">
                          <input 
                            type="password"
                            placeholder="CVV"
                            value={cvv}
                            onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                            maxLength={4}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-secondary/50 focus:bg-white/[0.08] text-center tracking-[0.4em] font-mono transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8 px-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center mt-0.5">
                        <input 
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="peer hidden"
                        />
                        <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${acceptedTerms ? 'bg-secondary border-secondary' : 'border-white/20 group-hover:border-white/40'}`}>
                          {acceptedTerms && <CheckCircle2 className="w-3.5 h-3.5 text-primary-dark" />}
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-white/50 leading-relaxed">
                        Acepto los <button type="button" onClick={() => setShowTermsModal(true)} className="text-secondary hover:underline font-black uppercase tracking-tighter">términos y condiciones</button> de reserva y cancelación.
                      </span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5 gap-4">
                    <div className="text-center sm:text-left shrink-0">
                        <p className="text-[10px] uppercase font-black tracking-widest text-secondary mb-1">Inversión Total</p>
                        <p className="text-3xl md:text-4xl font-display font-black leading-tight">${priceDetails.total.toFixed(2)}</p>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={handlePaymentSubmit}
                      disabled={selectedItems.length === 0 || isProcessing || success || !acceptedTerms}
                      className={`
                        w-full sm:w-auto px-8 py-5 rounded-[2rem] font-black text-sm transition-all shadow-2xl flex justify-center items-center gap-3
                        ${selectedItems.length > 0 && !isProcessing && !success && acceptedTerms
                          ? 'bg-secondary text-primary-dark hover:scale-105 active:scale-95 shadow-secondary/20 hover:bg-white' 
                          : 'bg-white/10 text-white/20 cursor-not-allowed border border-white/10'
                        }
                      `}
                    >
                        {isProcessing ? 'Procesando...' : success ? '¡Listo!' : 'Confirmar Pago'} 
                        {!isProcessing && !success && <ChevronRight className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Star className="w-32 h-32 rotate-12" />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookingSidebar;
