import { useState, useEffect } from 'react';
import { Search, Check, X, Clock, Calendar, User, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const HostBookingsSection = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

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
                    key={res.id}
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
                      {res.estado === 'PENDIENTE' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(res.id, 'APROBADA')}
                            className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                            title="Aprobar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(res.id, 'RECHAZADA')}
                            className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            title="Rechazar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin acciones</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HostBookingsSection;
