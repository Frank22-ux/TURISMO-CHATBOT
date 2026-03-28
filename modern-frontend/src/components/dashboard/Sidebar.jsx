import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, History, MessageSquare, User, Mountain, LogOut, Compass, Star } from 'lucide-react';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'summary', label: 'Resumen', icon: Home },
    { id: 'bookings', label: 'Mis Reservas', icon: Calendar },
    { id: 'history', label: 'Historial', icon: History },
    { id: 'messages', label: 'Mensajería', icon: MessageSquare },
    { id: 'reviews', label: 'Mis Reseñas', icon: Star },
    { id: 'profile', label: 'Mi Perfil', icon: User },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-2 mb-10">
          <Mountain className="text-primary w-8 h-8" />
          <span className="text-xl font-display font-black text-primary-dark tracking-tighter">
            ISTPET <span className="text-primary">Turismo</span>
          </span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                activeSection === item.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-white' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-2 border-t border-slate-50">
        <Link to="/" className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold text-primary hover:bg-primary/5 transition-all">
          <Compass className="w-5 h-5" /> Explorar
        </Link>
        <button 
          onClick={() => {
            sessionStorage.clear();
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut className="w-5 h-5" /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
