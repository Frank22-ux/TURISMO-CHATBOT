import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Minus, Plus, CreditCard, ChevronRight, Clock, Shield, Star, CheckCircle2, ChevronLeft, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomCalendar from './CustomCalendar';

const BookingSidebar = ({ isOpen, onClose, activity }) => {
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const priceDetails = useMemo(() => {
    if (!activity) return { subtotal: 0, iva: 0, total: 0 };
    const price = parseFloat(activity.price) || 0;
    const subtotal = (price * adults) + (price * 0.5 * children);
    const iva = subtotal * 0.15;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  }, [activity, adults, children]);

  const handleBooking = async (token) => {
    setIsProcessing(true);
    setError(null);
    try {
      const tokenAuth = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenAuth}`
        },
        body: JSON.stringify({
          token,
          reservationData: {
            id_actividad: activity.id,
            fecha_experiencia: date,
            cantidad_personas: adults + children,
            total: priceDetails.total
          }
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

  const handlePaymentSubmit = () => {
    if (!date) {
      setError('Por favor selecciona una fecha primero.');
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
    }
  }, [isOpen]);

  const highlights = useMemo(() => {
    if (!activity) return [];
    const items = [];
    if (activity.duracion_horas) items.push({ icon: Clock, label: `${activity.duracion_horas} horas`, color: 'text-blue-500 bg-blue-50' });
    if (activity.nivel_dificultad) items.push({ icon: Shield, label: activity.nivel_dificultad, color: 'text-orange-500 bg-orange-50' });
    if (activity.capacidad) items.push({ icon: Users, label: `Cupos p/día: ${activity.capacidad}`, color: 'text-purple-500 bg-purple-50' });
    return items;
  }, [activity]);

  const inclusions = useMemo(() => {
    if (!activity) return [];
    const items = [];
    
    // Common
    if (activity.wifi) items.push({ label: 'WiFi Grátis', icon: CheckCircle2 });
    if (activity.estacionamiento) items.push({ label: 'Estacionamiento', icon: CheckCircle2 });
    if (activity.permite_mascotas) items.push({ label: 'Pet Friendly', icon: CheckCircle2 });

    if (activity.tipo === 'TURISTICA') {
      if (activity.incluye_recorrido) items.push({ label: 'Recorrido guiado', icon: CheckCircle2 });
      if (activity.incluye_transporte) items.push({ label: 'Transporte incluido', icon: CheckCircle2 });
      if (activity.requiere_equipo) items.push({ label: 'Equipo especializado', icon: CheckCircle2 });
    } else {
      if (activity.menu_vegano) items.push({ label: 'Opción Vegana', icon: CheckCircle2 });
      if (activity.menu_vegetariano) items.push({ label: 'Opción Vegetariana', icon: CheckCircle2 });
      if (activity.menu_sin_gluten) items.push({ label: 'Sin Gluten', icon: CheckCircle2 });
      if (activity.musica_en_vivo) items.push({ label: 'Música en vivo', icon: CheckCircle2 });
      if (activity.zona_infantil) items.push({ label: 'Zona infantil', icon: CheckCircle2 });
      if (activity.servicio_local) items.push({ label: 'Servicio en local', icon: CheckCircle2 });
    }
    return items;
  }, [activity]);

  if (!activity) return null;

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
                        <ul className="space-y-3 font-bold text-slate-700">
                          <li className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <span>Más de 2 días de antelación: <span className="text-emerald-600">75% de reembolso</span></span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <span>De 1 a 2 días de antelación: <span className="text-orange-500">50% de reembolso</span></span>
                          </li>
                          <li className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <span>Mismo día de la reserva: <span className="text-red-600">Sin reembolso</span></span>
                          </li>
                        </ul>
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
                  <h2 className="text-3xl font-display font-black text-primary-dark leading-none pb-2 tracking-tight">Personaliza tu Viaje</h2>
                  <div className="h-1.5 w-12 bg-primary rounded-full"></div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Activity Header Card */}
              <div className="relative rounded-[2.5rem] overflow-hidden mb-8 shadow-sm border border-slate-100">
                <img src={activity.portada || activity.image} alt={activity.title} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-xl font-bold text-white mb-2 leading-tight">{activity.title}</h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-secondary fill-current" />
                    <span className="text-white text-xs font-bold">4.9 (124 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Highlights */}
               <div className="grid grid-cols-2 gap-4 mb-10">
                {highlights.map((h) => (
                  <div key={`${activity.id}-${h.label}`} className={`flex items-center gap-3 p-4 rounded-2xl border border-slate-50 ${h.color} bg-opacity-40`}>
                    <h.icon className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-tight">{h.label}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="mb-10 text-slate-600">
                <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mb-4">
                  Sobre esta Experiencia
                </h4>
                <p className="text-sm leading-relaxed mb-6">
                  {activity.descripcion || 'Embárcate en una aventura inolvidable en el corazón del Ecuador. Esta experiencia está diseñada para sumergirte en la cultura local y la naturaleza impresionante de la región.'}
                </p>

                <button
                  onClick={() => {
                    console.log('Navigating to messages with host:', activity.id_anfitrion, activity.nombre_anfitrion);
                    navigate(`/dashboard-tourist?section=messages&hostId=${activity.id_anfitrion}&hostName=${encodeURIComponent(activity.nombre_anfitrion || 'Anfitrión Local')}`);
                    onClose();
                  }}
                  className="w-full mb-6 py-4 rounded-2xl bg-primary/10 text-primary font-black text-sm flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all group"
                >
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Contactar Anfitrión
                </button>

                {/* Inclusions */}
                {inclusions.length > 0 && (
                  <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Qué incluye:</h5>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      {inclusions.map((item) => (
                        <div key={`${activity.id}-${item.label}`} className="flex items-center gap-2 text-slate-500">
                          <item.icon className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-10">
                {/* Custom Calendar Section */}
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    <Calendar className="w-3.5 h-3.5" /> 1. Elige tu fecha ideal
                  </label>
                  <CustomCalendar selectedDate={date} onSelect={setDate} />
                  {date && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-emerald-100"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Seleccionado: {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </motion.div>
                  )}
                </div>

                {/* Guests */}
                <div className="space-y-6">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    <Users className="w-3.5 h-3.5" /> 2. ¿Cuántas personas viajan?
                  </label>
                  
                  <div className="space-y-4">
                    {/* Adults */}
                    <div className="flex justify-between items-center p-6 bg-slate-50/50 border border-slate-100 rounded-3xl group hover:border-primary/20 transition-all">
                      <div>
                        <p className="font-bold text-slate-800">Adultos</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Precio: ${activity.price}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setAdults(Math.max(1, adults - 1))}
                          className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-white transition-all text-slate-400 hover:text-primary active:scale-90"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-display font-black text-2xl w-6 text-center">{adults}</span>
                        <button 
                          onClick={() => setAdults(adults + 1)}
                          className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex justify-between items-center p-6 bg-slate-50/50 border border-slate-100 rounded-3xl group hover:border-primary/20 transition-all">
                      <div>
                        <p className="font-bold text-slate-800">Niños (2-12 años)</p>
                        <p className="text-[10px] text-emerald-600 uppercase font-black tracking-tighter">50% DESCUENTO</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setChildren(Math.max(0, children - 1))}
                          className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center hover:bg-white transition-all text-slate-400 hover:text-primary active:scale-90"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-display font-black text-2xl w-6 text-center">{children}</span>
                        <button 
                          onClick={() => setChildren(children + 1)}
                          className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Card */}
              <div className="mt-16 bg-primary-dark rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <CreditCard className="w-5 h-5 opacity-40" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Resumen Financiero</span>
                  </div>
                  
                  <div className="space-y-4 mb-10">
                    <div className="flex justify-between text-sm items-center">
                        <span className="opacity-50">Subtotal ({adults} adu. + {children} niñ.)</span>
                        <div className="h-px flex-grow mx-4 bg-white/5" />
                        <span className="font-bold">${priceDetails.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                        <span className="opacity-50">IVA (15%)</span>
                        <div className="h-px flex-grow mx-4 bg-white/5" />
                        <span className="font-bold">${priceDetails.iva.toFixed(2)}</span>
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
                      {/* Nombre en la Tarjeta */}
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

                      {/* Número de Tarjeta */}
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
                        {/* Expiración */}
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
                        {/* CVV */}
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

                  {/* Términos y Condiciones */}
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
                      disabled={!date || isProcessing || success || !acceptedTerms}
                      className={`
                        w-full sm:w-auto px-8 py-5 rounded-[2rem] font-black text-sm transition-all shadow-2xl flex justify-center items-center gap-3
                        ${date && !isProcessing && !success && acceptedTerms
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
                
                {/* Backdrop Pattern */}
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
