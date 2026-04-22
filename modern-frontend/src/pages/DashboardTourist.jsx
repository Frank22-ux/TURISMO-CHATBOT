import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import SummarySection from '../components/dashboard/SummarySection';
import BookingsSection from '../components/dashboard/BookingsSection';
import MessagingSection from '../components/dashboard/MessagingSection';
import ProfileSection from '../components/dashboard/ProfileSection';
import MyReviewsSection from '../components/dashboard/MyReviewsSection';
import NotificationBell from '../components/ui/NotificationBell';
import TouristPaymentsSection from '../components/dashboard/TouristPaymentsSection';
import ForcePasswordChangeModal from '../components/ForcePasswordChangeModal';
import { CartProvider } from '../contexts/CartContext';

const DashboardTourist = () => {
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('summary');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleProfileUpdate = (updatedData) => {
    // Tourist data uses different keys in session (firstName, etc)
    // but the backend update returns DB field names. We sync them.
    const newUser = { 
      ...user, 
      ...updatedData,
      firstName: updatedData.nombre || user.firstName,
      url_foto_perfil: updatedData.url_foto_perfil || user.url_foto_perfil
    };
    setUser(newUser);
    sessionStorage.setItem('user', JSON.stringify(newUser));
  };

  const renderSection = () => {
    switch(activeSection) {
      case 'summary': return <SummarySection user={user} />;
      case 'bookings': return <BookingsSection />;
      case 'history': return <BookingsSection status="COMPLETADA" />; // Reuse bookings for history
      case 'payments': return <TouristPaymentsSection />;
      case 'messages': return (
        <MessagingSection 
          initialHostId={searchParams.get('hostId')} 
          initialHostName={searchParams.get('hostName')} 
        />
      );
      case 'reviews': return <MyReviewsSection />;
      case 'profile': return <ProfileSection onUpdateProfile={handleProfileUpdate} />;
      default: return <SummarySection user={user} />;
    }
  };

  if (!user) return <div className="h-screen flex items-center justify-center font-bold text-primary animate-pulse text-2xl">Cargando...</div>;

  return (
    <CartProvider>
      <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        
        <main className="flex-1 p-4 md:p-10 overflow-auto w-full">
          {/* Top Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4 md:gap-0">
            <div>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Panel de Viajero</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-500">Sistema Activo</span>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6 mt-4 md:mt-0">
              <NotificationBell role="TURISTA" onNavigate={(section) => setActiveSection(section)} />
              
              <div className="flex items-center gap-3 md:gap-4 bg-white p-2 pr-4 md:pr-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 overflow-hidden">
                  {user.url_foto_perfil ? (
                    <img src={user.url_foto_perfil} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.firstName ? user.firstName[0].toUpperCase() : 'V'
                  )}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 leading-tight">{user.firstName} {user.lastName1}</p>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{user.rol}</p>
                </div>
              </div>
            </div>
          </header>

          {renderSection()}
        </main>

        <ForcePasswordChangeModal 
          isOpen={user.requiere_cambio_clave} 
          onPasswordChanged={() => {
            const updatedUser = { ...user, requiere_cambio_clave: false };
            setUser(updatedUser);
          }}
        />
      </div>
    </CartProvider>
  );
};

export default DashboardTourist;
