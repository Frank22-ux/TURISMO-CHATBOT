import { useState, useEffect } from 'react';
import { Search, Check, X, Clock, Calendar, User, DollarSign, Eye, Shield, Users, Wallet, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';

const HostBookingsSection = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [guestQrCode, setGuestQrCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [hostSecretCode, setHostSecretCode] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!selectedBooking) {
      setGuestQrCode('');
      setHostSecretCode(null);
    }
  }, [selectedBooking]);

  const handleValidateQR = async () => {
    if (guestQrCode.length !== 10) return showToast('El código debe tener 10 caracteres.', 'warning');
    setIsValidating(true);
    setHostSecretCode(null);
    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/host/reservations/validate-qr', {
          method: 'POST',
          headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ codigo_qr_turista: guestQrCode })
        });
        const data = await response.json();
        if (response.ok) {
            setHostSecretCode(data.codigo_verificacion_anfitrion);
            showToast('¡Código validado exitosamente!', 'success');
            fetchBookings(); // Actualizar listado
        } else {
            showToast(data.message || 'Error al validar el código QR', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión al validar.', 'error');
    } finally {
        setIsValidating(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return showToast('Por favor selecciona una puntuación.', 'warning');
    setIsSubmittingReview(true);
    try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/reviews', {
          method: 'POST',
          headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              id_reserva: reviewBooking.id_reserva,
              puntuacion: rating,
              comentario: comment
          })
        });
        const data = await response.json();
        if (response.ok) {
            showToast('¡Calificación enviada con éxito!', 'success');
            setReviewBooking(null);
            setRating(0);
            setComment('');
        } else {
            showToast(data.message || 'Error al enviar reseña', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al enviar la reseña', 'error');
    } finally {
        setIsSubmittingReview(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/host/reservations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching host bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/host/reservations/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: newStatus })
      });
      if (response.ok) {
        showToast(`Reserva ${newStatus.toLowerCase()} con éxito`, 'success');
        fetchBookings();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('Error al cambiar el estado', 'error');
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-bold">Cargando gestión de reservas...</div>;

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-800">Reservas Recibidas</h2>
          <p className="text-slate-500 mt-1">Gestiona las solicitudes de los viajeros y confirma tus próximas aventuras.</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="py-6 px-10">Turista</th>
                <th className="py-6 px-10">Experiencia</th>
                <th className="py-6 px-10">Fecha</th>
                <th className="py-6 px-10">Total</th>
                <th className="py-6 px-10">Estado</th>
                <th className="py-6 px-10 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-slate-300">
                    <p className="font-bold">No has recibido reservas todavía.</p>
                  </td>
                </tr>
              ) : (
                bookings.map((res, i) => (
                  <motion.tr 
                    key={res.id_reserva}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {res.turista_nombre[0]}
                        </div>
                        <span className="text-sm font-bold text-slate-600">{res.turista_nombre}</span>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                      <p className="font-bold text-slate-800 text-sm">{res.actividad_titulo}</p>
                    </td>
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(res.fecha_experiencia).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-6 px-10 font-display font-black text-slate-800">
                      ${parseFloat(res.total).toFixed(2)}
                    </td>
                    <td className="py-6 px-10">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        res.estado === 'APROBADA' ? 'bg-green-50 text-green-600' :
                        res.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {res.estado}
                      </span>
                    </td>
                    <td className="py-6 px-10 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button 
                          onClick={() => setSelectedBooking(res)}
                          className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"
                          title="Ver Detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {['APROBADA', 'COMPLETADA'].includes(res.estado) && new Date(res.fecha_experiencia).getTime() + 24*60*60*1000 < new Date().getTime() && (
                          <button onClick={() => setReviewBooking(res)} className="p-2.5 rounded-xl bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white transition-all shadow-sm" title="Calificar Turista">
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        
                        {res.estado === 'PENDIENTE' && (
                          <>
                            <button 
                              onClick={() => handleStatusUpdate(res.id_reserva, 'APROBADA')}
                              className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                              title="Aprobar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleStatusUpdate(res.id_reserva, 'RECHAZADA')}
                              className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                              title="Rechazar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col md:flex-row animate-scale-up">
            
            {/* Left Side: Summary Visual */}
            <div className="bg-primary-dark p-8 md:w-5/12 flex flex-col items-center justify-center text-center text-white relative">
              <div className="w-20 h-20 rounded-[1.5rem] bg-white/10 flex items-center justify-center mb-6 shadow-lg">
                <User className="w-10 h-10 text-white" />
              </div>
              <h3 className="font-display font-black text-xl mb-1">{selectedBooking.turista_nombre}</h3>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest leading-relaxed mt-2 bg-white/10 px-3 py-1 rounded-full border border-white/5">
                ID Reserva: #{selectedBooking.id_reserva.toString().padStart(6, '0')}
              </p>
            </div>
            
            {/* Right Side: Details */}
            <div className="p-8 md:w-7/12 flex flex-col bg-white">
              <div className="flex justify-between items-start mb-6">
                <div className="pr-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Actividad Solicitada</p>
                  <h2 className="text-xl font-black text-slate-800 leading-tight">{selectedBooking.actividad_titulo}</h2>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-colors shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha Experiencia</p>
                    <p className="text-sm font-black text-slate-700">
                      {new Date(selectedBooking.fecha_experiencia).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">
                      Hora: {new Date(selectedBooking.fecha_experiencia).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 flex-col sm:flex-row">
                  <div className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <Users className="w-5 h-5 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pasajeros</p>
                      <p className="text-sm font-black text-slate-700">{selectedBooking.cantidad_personas} Pax</p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <Wallet className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div className="w-full">
                      <div className="flex justify-between items-center w-full mb-1">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Estado: {selectedBooking.estado}</p>
                      </div>
                      <p className="text-xl font-black text-emerald-700 font-display leading-none">${parseFloat(selectedBooking.total).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.estado === 'APROBADA' && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-8 flex flex-col items-center">
                  <h4 className="font-bold text-primary mb-2 flex items-center gap-2"><Shield className="w-5 h-5"/> Verificación de Seguridad</h4>
                  <p className="text-xs text-slate-500 text-center mb-4">Ingresa el código alfanumérico que aparece en el Boleto Digital del Turista para validar la reserva.</p>
                  
                  {!hostSecretCode ? (
                    <div className="flex gap-2 w-full max-w-sm">
                      <input 
                        type="text"
                        value={guestQrCode}
                        onChange={(e) => setGuestQrCode(e.target.value.toUpperCase())}
                        placeholder="Código QR"
                        maxLength={10}
                        className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none font-mono font-bold text-center uppercase tracking-widest text-sm"
                      />
                      <button 
                        onClick={handleValidateQR}
                        disabled={isValidating || guestQrCode.length !== 10}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isValidating ? 'Validando...' : 'Validar'}
                      </button>
                    </div>
                  ) : (
                    <div className="w-full text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200 animate-fade-in">
                      <p className="text-emerald-700 font-bold mb-1"><Check className="w-5 h-5 inline-block mr-1"/> ¡Turista Validado!</p>
                      <p className="text-xs text-emerald-600/80 mb-3">Notifica este código al turista para la verificación bidireccional:</p>
                      <div className="bg-white rounded-lg py-3 border-2 border-dashed border-emerald-300">
                        <span className="font-mono text-xl font-black text-emerald-600 tracking-[0.2em]">{hostSecretCode}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedBooking.estado === 'PENDIENTE' && (
                <div className="flex gap-3 mt-auto">
                  <button onClick={() => { handleStatusUpdate(selectedBooking.id_reserva, 'RECHAZADA'); setSelectedBooking(null); }} className="flex-1 py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all active:scale-95">
                    Rechazar
                  </button>
                  <button onClick={() => { handleStatusUpdate(selectedBooking.id_reserva, 'APROBADA'); setSelectedBooking(null); }} className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-bold text-sm hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-500/20">
                    Aprobar
                  </button>
                </div>
              )}
              {['APROBADA', 'COMPLETADA', 'RECHAZADA', 'CANCELADA'].includes(selectedBooking.estado) && (
                <div className="flex gap-3 mt-auto">
                  <button onClick={() => setSelectedBooking(null)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95">
                    Cerrar Detalles
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal for Host */}
      {reviewBooking && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReviewBooking(null)}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-scale-up p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800">Califica al Turista</h2>
              <button onClick={() => setReviewBooking(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-500 mb-6 text-sm">¿Cómo fue tu experiencia guiando a <span className="font-bold text-slate-800">{reviewBooking.turista_nombre}</span> en {reviewBooking.actividad_titulo}?</p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((s) => (
                <button 
                  key={s} 
                  onClick={() => setRating(s)}
                  className={`transition-all ${rating >= s ? 'text-orange-400 scale-110' : 'text-slate-200 hover:text-orange-200'}`}
                >
                  <Star className="w-10 h-10" fill={rating >= s ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>

            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe tu calificación sobre el viajero... (opcional)"
              className="w-full h-32 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none text-sm mb-6"
            ></textarea>

            <button 
              onClick={handleSubmitReview}
              disabled={isSubmittingReview || rating === 0}
              className={`w-full py-4 rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${rating === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark hover:shadow-xl active:scale-95'}`}
            >
              {isSubmittingReview ? <Clock className="w-5 h-5 animate-spin" /> : 'Enviar Calificación'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostBookingsSection;
