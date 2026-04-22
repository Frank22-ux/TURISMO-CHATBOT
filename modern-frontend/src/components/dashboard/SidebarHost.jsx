import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MapPinned, Utensils, CalendarCheck, MessageSquare, User, Mountain, LogOut, Star, Wallet, Ticket } from 'lucide-react';

const SidebarHost = ({ activeSection, setActiveSection }) => {
  const navigate = useNavigate();
  const menuItems = [
    { id: 'summary', label: 'Resumen', icon: LayoutDashboard },
    { id: 'experiences', label: 'Experiencias', icon: MapPinned },
    { id: 'services', label: 'Servicios', icon: Utensils },
    { id: 'bookings', label: 'Reservas', icon: CalendarCheck },
    { id: 'offers', label: 'Centro de Ofertas', icon: Ticket },
    { id: 'payments', label: 'Mi Billetera', icon: Wallet },
    { id: 'messaging', label: 'Mensajería', icon: MessageSquare },
    { id: 'reviews', label: 'Mis Reseñas', icon: Star },
    { id: 'profile', label: 'Perfil Profesional', icon: User },
  ];

  return (
    <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-slate-100 flex flex-col h-auto md:h-screen sticky top-0 z-20 shadow-sm md:shadow-none">
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-4 md:mb-10">
          <div className="flex items-center gap-2">
            <Mountain className="text-primary w-6 h-6 md:w-8 md:h-8" />
            <span className="text-lg md:text-xl font-display font-black text-primary-dark tracking-tighter">
              ISTPET <span className="text-primary hidden md:inline">Turismo</span>
            </span>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button 
              onClick={() => {
                sessionStorage.clear();
                navigate('/login');
              }}
              className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto custom-scrollbar pb-2 md:pb-0">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex-shrink-0 flex items-center gap-2 md:gap-4 px-4 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all ${
                activeSection === item.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              <item.icon className={`w-4 h-4 md:w-5 md:h-5 ${activeSection === item.id ? 'text-white' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-slate-50 hidden md:block">
        <button 
          onClick={() => {
            sessionStorage.clear();
            navigate('/login');
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
