import { Link } from 'react-router-dom';
import { LayoutDashboard, MapPinned, Utensils, CalendarCheck, MessageSquare, User, Mountain, LogOut, Star, Wallet } from 'lucide-react';

const SidebarHost = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'summary', label: 'Resumen', icon: LayoutDashboard },
    { id: 'experiences', label: 'Experiencias', icon: MapPinned },
    { id: 'services', label: 'Servicios', icon: Utensils },
    { id: 'bookings', label: 'Reservas', icon: CalendarCheck },
    { id: 'payments', label: 'Mi Billetera', icon: Wallet },
    { id: 'messaging', label: 'Mensajería', icon: MessageSquare },
    { id: 'reviews', label: 'Mis Reseñas', icon: Star },
    { id: 'profile', label: 'Perfil Profesional', icon: User },
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

      <div className="mt-auto p-8 border-t border-slate-50">
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

export default SidebarHost;
