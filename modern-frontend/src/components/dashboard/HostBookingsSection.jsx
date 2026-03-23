import { useState, useEffect } from 'react';
import { Search, Check, X, Clock, Calendar, User, DollarSign, Eye, Shield, Users, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const HostBookingsSection = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

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
      if (response.ok) fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
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

                        {res.estado === 'APROBADA' && (
                          <button 
                            onClick={() => handleStatusUpdate(res.id_reserva, 'COMPLETADA')}
                            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                            title="Marcar como Completada"
                          >
                            <Check className="w-4 h-4" />
                          </button>
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
              {selectedBooking.estado === 'APROBADA' && (
                <div className="flex gap-3 mt-auto">
                  <button onClick={() => { handleStatusUpdate(selectedBooking.id_reserva, 'COMPLETADA'); setSelectedBooking(null); }} className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                    Marcar como Finalizada
                  </button>
                </div>
              )}
              {['COMPLETADA', 'RECHAZADA', 'CANCELADA'].includes(selectedBooking.estado) && (
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
    </div>
  );
};

export default HostBookingsSection;
