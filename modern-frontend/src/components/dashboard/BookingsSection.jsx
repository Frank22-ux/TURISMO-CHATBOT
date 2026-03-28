import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Calendar, MapPin, Eye, Star, Clock, CheckCircle, AlertCircle, X, Shield, Users, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';

const BookingsSection = ({ status: initialStatusFilter }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const ticketRef = useRef(null);

  const handleDownloadTicket = async () => {
    if (!ticketRef.current || !selectedBooking) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        filter: (node) => {
          return node.getAttribute ? node.getAttribute('data-html2canvas-ignore') !== 'true' : true;
        }
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Boleto_ISTPET_${selectedBooking.id_reserva.toString().padStart(6, '0')}.png`;
      link.click();
    } catch (error) {
      console.error('Error al descargar el boleto:', error);
    } finally {
      setIsDownloading(false);
    }
  };

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

  const filterTabs = initialStatusFilter === 'COMPLETADA' 
    ? ['ALL', 'COMPLETADA', 'RECHAZADA', 'CANCELADA']
    : ['ALL', 'PENDIENTE', 'APROBADA'];

  const filteredBookings = bookings.filter(b => {
    if (initialStatusFilter === 'COMPLETADA') {
      return b.estado === 'COMPLETADA' || b.estado === 'RECHAZADA' || b.estado === 'CANCELADA' || new Date(b.fecha_experiencia) < new Date();
    }
    return (b.estado === 'PENDIENTE' || b.estado === 'APROBADA') && new Date(b.fecha_experiencia) >= new Date();
  }).filter(b => filter === 'ALL' || b.estado === filter);

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-bold">Cargando tus aventuras...</div>;

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-800">
            {initialStatusFilter === 'COMPLETADA' ? 'Historial de Viajes' : 'Mis Reservas'}
          </h2>
          <p className="text-slate-500 mt-1">
            {initialStatusFilter === 'COMPLETADA' ? 'Revive los recuerdos de tus mejores aventuras pasadas.' : 'Gestiona tus planes y prepárate para tu próxima aventura.'}
          </p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-50 shadow-sm self-stretch md:self-auto overflow-x-auto">
          {filterTabs.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
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
                  <tr key={res.id_reserva} className="group hover:bg-slate-50/50 transition-colors">
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
                        <button 
                          onClick={() => setSelectedBooking(res)}
                          className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm" 
                          title="Ver detalles"
                        >
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

      {/* Booking Details / Digital Ticket Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}></div>
          <div ref={ticketRef} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col md:flex-row animate-scale-up">
            {/* Left Side: Ticket Visual */}
            <div className="bg-primary-dark p-8 md:w-5/12 flex flex-col items-center justify-center text-center text-white relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Star className="w-24 h-24" />
              </div>
              <div className="bg-white p-4 rounded-[1.5rem] mb-6 shadow-xl w-fit">
                <QRCode 
                  value={`BOLETO DIGITAL - ISTPET\n\nID: #${selectedBooking.id_reserva.toString().padStart(6, '0')}\nActividad: ${selectedBooking.actividad_titulo}\nAnfitrion: ${selectedBooking.anfitrion_nombre || 'No asignado'}\nFecha: ${new Date(selectedBooking.fecha_experiencia).toLocaleDateString('es-ES')} a las ${new Date(selectedBooking.fecha_experiencia).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}\nAforo: ${selectedBooking.cantidad_personas} Pax\nPago: $${parseFloat(selectedBooking.total).toFixed(2)} (${selectedBooking.estado})\n\nDisfruta tu aventura!`} 
                  size={140} 
                  level="L"
                />
              </div>
              <h3 className="font-display font-black text-xl mb-1 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400"/> Boleto Digital
              </h3>
              <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest leading-relaxed mt-2">
                ID: #{selectedBooking.id_reserva.toString().padStart(6, '0')}
              </p>
            </div>
            
            {/* Right Side: Details */}
            <div className="p-8 md:w-7/12 flex flex-col bg-white">
              <div className="flex justify-between items-start mb-6">
                <div className="pr-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Detalles de Reserva</p>
                  <h2 className="text-xl font-black text-slate-800 leading-tight">{selectedBooking.actividad_titulo}</h2>
                  <p className="text-sm font-bold text-slate-500 mt-1">Anfitrión: <span className="text-slate-700">{selectedBooking.anfitrion_nombre || 'No asignado'}</span></p>
                </div>
                <button onClick={() => setSelectedBooking(null)} data-html2canvas-ignore="true" className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-colors shrink-0">
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aforo</p>
                      <p className="text-sm font-black text-slate-700">{selectedBooking.cantidad_personas} Pax</p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div className="w-full">
                      <div className="flex justify-between items-center w-full mb-1">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Pago Seguro</p>
                        <span className="text-[9px] font-black uppercase bg-emerald-200/50 text-emerald-700 px-1.5 py-0.5 rounded">{selectedBooking.estado}</span>
                      </div>
                      <p className="text-xl font-black text-emerald-700 font-display leading-none">${parseFloat(selectedBooking.total).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-auto pt-6" data-html2canvas-ignore="true">
                <button 
                  onClick={handleDownloadTicket}
                  disabled={isDownloading}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-sm hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  {isDownloading ? <Clock className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                  {isDownloading ? 'Generando...' : 'Descargar Boleto'}
                </button>
                <button 
                  onClick={() => setSelectedBooking(null)} 
                  className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsSection;
