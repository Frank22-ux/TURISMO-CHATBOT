import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Eye, Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const BookingsSection = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/tourist/reservations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'APROBADA': return <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase border border-green-100"><CheckCircle className="w-3 h-3" /> Aprobada</div>;
      case 'PENDIENTE': return <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase border border-amber-100"><Clock className="w-3 h-3" /> Pendiente</div>;
      case 'RECHAZADA': return <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase border border-red-100"><AlertCircle className="w-3 h-3" /> Rechazada</div>;
      default: return <div className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase border border-slate-100 text-center">{status}</div>;
    }
  };

  const filteredBookings = bookings.filter(b => filter === 'ALL' || b.estado === filter);

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-bold">Cargando tus aventuras...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-800">Mis Reservas</h2>
          <p className="text-slate-500 mt-1">Gestiona tus planes y revive tus mejores viajes.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-50 shadow-sm self-stretch md:self-auto">
          {['ALL', 'PENDIENTE', 'APROBADA', 'RECHAZADA'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                filter === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-primary hover:bg-primary/5'
              }`}
            >
              {s === 'ALL' ? 'Todos' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-wrap justify-between items-center gap-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Buscar por experiencia o anfitrión..." 
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-50 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm"
            />
          </div>
          <button className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-primary transition-all">
            <Filter className="w-4 h-4" /> Filtros Avanzados
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="py-6 px-10">Experiencia</th>
                <th className="py-6 px-10">Anfitrión</th>
                <th className="py-6 px-10">Fecha</th>
                <th className="py-6 px-10">Total</th>
                <th className="py-6 px-10">Estado</th>
                <th className="py-6 px-10 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <Calendar className="w-12 h-12 opacity-20" />
                      <p className="font-bold">No se encontraron reservas con este filtro.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((res) => (
                  <tr key={res.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          {/* We could add activity thumbnail here if API provided it */}
                          <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary">
                            <MapPin className="w-5 h-5" />
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors">{res.actividad_titulo}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{res.actividad_tipo || 'Experiencia'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                        <span className="text-sm font-bold text-slate-600">{res.anfitrion_nombre}</span>
                      </div>
                    </td>
                    <td className="py-6 px-10">
                      <p className="text-sm font-bold text-slate-600">{new Date(res.fecha_experiencia).toLocaleDateString()}</p>
                      <p className="text-[10px] font-bold text-slate-400">{new Date(res.fecha_experiencia).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </td>
                    <td className="py-6 px-10">
                      <p className="text-lg font-display font-black text-slate-800">${parseFloat(res.total).toFixed(2)}</p>
                    </td>
                    <td className="py-6 px-10">
                      {getStatusBadge(res.estado)}
                    </td>
                    <td className="py-6 px-10 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm" title="Ver detalles">
                          <Eye className="w-4 h-4" />
                        </button>
                        {res.estado === 'APROBADA' && new Date(res.fecha_experiencia) < new Date() && (
                          <button className="p-2.5 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all shadow-sm" title="Dejar reseña">
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingsSection;
