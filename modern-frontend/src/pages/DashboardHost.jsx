import { useState, useEffect } from 'react';
import SidebarHost from '../components/dashboard/SidebarHost';
import HostSummarySection from '../components/dashboard/HostSummarySection';
import ExperiencesSection from '../components/dashboard/ExperiencesSection';
import ServicesSection from '../components/dashboard/ServicesSection';
import HostBookingsSection from '../components/dashboard/HostBookingsSection';
import MessagingSection from '../components/dashboard/MessagingSection';
import ProfileSection from '../components/dashboard/ProfileSection';
import MyReviewsSection from '../components/dashboard/MyReviewsSection';

const DashboardHost = () => {
  const [activeSection, setActiveSection] = useState('summary');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = sessionStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleProfileUpdate = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    sessionStorage.setItem('user', JSON.stringify(newUser));
  };

  const renderSection = () => {
    switch(activeSection) {
      case 'summary': return <HostSummarySection user={user} />;
      case 'experiences': return <ExperiencesSection />;
      case 'services': return <ServicesSection />;
      case 'bookings': return <HostBookingsSection />;
      case 'messaging': return <MessagingSection />;
      case 'reviews': return <MyReviewsSection />;
      case 'profile': return <ProfileSection isHost={true} onUpdateProfile={handleProfileUpdate} />;
      default: return <HostSummarySection user={user} />;
    }
  };

  if (!user) return <div className="h-screen flex items-center justify-center font-bold text-primary animate-pulse text-2xl">Cargando...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <SidebarHost activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="flex-1 p-10 overflow-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Panel de Anfitrión</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-bold text-slate-500">Modo Profesional</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-primary-dark flex items-center justify-center text-white font-black text-xl shadow-lg overflow-hidden">
              {user.url_foto_perfil ? (
                <img src={user.url_foto_perfil} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.nombre ? user.nombre[0].toUpperCase() : 'A'
              )}
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 leading-tight">{user.nombre}</p>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Anfitrión Verificado</p>
            </div>
          </div>
        </header>

        {renderSection()}
      </main>
    </div>
  );
};

export default DashboardHost;
