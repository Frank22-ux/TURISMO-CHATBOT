import { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { Bell, MessageSquare, CalendarClock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const NotificationBell = ({ role, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState({ 
    unreadMessages: 0, 
    pendingReservations: 0, 
    total: 0,
    messageDetails: [],
    reservationDetails: []
  });
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const route = role.toLowerCase() === 'turista' ? 'tourist' : 'host';
        const token = sessionStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${API_BASE}/api/${route}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling every 10s para ser más rápido
    return () => clearInterval(interval);
  }, [role]);

  const handleMessageClick = (msg) => {
    // Si somos Turista, quien nos escribió es un Anfitrión
    // Si somos Anfitrión, quien nos escribió es un Turista
    const navSection = role === 'TURISTA' ? 'messages' : 'messaging';
    
    if (role === 'TURISTA') {
      searchParams.set('hostId', msg.id_emisor);
      searchParams.set('hostName', msg.emisor_nombre);
    } else {
      searchParams.set('touristId', msg.id_emisor);
      searchParams.set('touristName', msg.emisor_nombre);
    }
    
    setSearchParams(searchParams);
    setIsOpen(false);
    if (onNavigate) onNavigate(navSection);
  };

  const handleReservationClick = () => {
     setIsOpen(false);
     if (onNavigate) onNavigate('bookings');
  };

  if (notifications.total === 0) {
    return (
      <button className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-400 hover:text-primary relative transition-colors">
        <Bell className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-800 hover:text-primary relative transition-colors focus:ring-2 focus:ring-primary/20"
      >
        <Bell className="w-5 h-5 animate-wiggle" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg ring-4 ring-white">
          {notifications.total}
        </span>
      </button>

      {/* Invisible backdrop for click-outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown avanzado */}
      <div 
        className={`absolute right-0 top-full mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 py-4 transition-all z-50 overflow-hidden ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="px-5 mb-3 border-b border-slate-50 pb-3 flex justify-between items-center">
          <h4 className="font-black text-slate-800">Notificaciones</h4>
          <span className="text-[10px] bg-red-100 text-red-600 font-black px-2 py-0.5 rounded-full">{notifications.total} Nuevas</span>
        </div>
        
        <div className="max-h-96 overflow-y-auto px-3 space-y-1">
          {/* Mensajes Detallados */}
          {notifications.messageDetails?.map((msg, i) => (
            <button 
              key={msg.id_mensaje || `msg-${i}`}
              onClick={() => handleMessageClick(msg)}
              className="w-full flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left"
            >
               <div className="mt-1 w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                 <MessageSquare className="w-4 h-4" />
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-bold text-slate-800 truncate">{msg.emisor_nombre}</p>
                 <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{msg.contenido}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                   {new Date(msg.fecha_envio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                 </p>
               </div>
            </button>
          ))}

          {/* Fallback si hay mensajes pero no details (muy raro) */}
          {notifications.unreadMessages > 0 && (!notifications.messageDetails || notifications.messageDetails.length === 0) && (
            <button onClick={() => onNavigate && onNavigate(role === 'TURISTA' ? 'messages' : 'messaging')} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-blue-50/50 hover:bg-blue-50 transition-colors text-left">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="font-bold text-slate-700 text-sm">Tienes {notifications.unreadMessages} mensaje{notifications.unreadMessages !== 1 ? 's' : ''} sin leer.</p>
            </button>
          )}

          {/* Reservas Pendientes Detalladas (Anfitrión) */}
          {notifications.reservationDetails?.map((res, i) => (
            <button 
              key={res.id_reserva || `res-${i}`}
              onClick={handleReservationClick}
              className="w-full flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left"
            >
               <div className="mt-1 w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                 <CalendarClock className="w-4 h-4" />
               </div>
               <div className="overflow-hidden">
                 <p className="text-sm font-bold text-slate-800 truncate">Nueva Reserva</p>
                 <p className="text-xs text-slate-500 line-clamp-1 mt-0.5"><span className="font-bold">{res.turista_nombre}</span> • {res.actividad_titulo}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                   Pendiente de confirmación
                 </p>
               </div>
            </button>
          ))}

          {/* Fallback si hay reservas pero no details */}
          {notifications.pendingReservations > 0 && (!notifications.reservationDetails || notifications.reservationDetails.length === 0) && (
            <button onClick={handleReservationClick} className="w-full flex items-center gap-3 p-3 rounded-2xl bg-orange-50/50 hover:bg-orange-50 transition-colors text-left">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <p className="font-bold text-slate-700 text-sm">{notifications.pendingReservations} reserva{notifications.pendingReservations !== 1 ? 's' : ''} pendiente{notifications.pendingReservations !== 1 ? 's' : ''}.</p>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;
