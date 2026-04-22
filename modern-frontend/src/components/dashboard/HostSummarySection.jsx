import { Eye, DollarSign, Star, ShoppingBag, Plus, ArrowRight, Clock, User, Calendar } from 'lucide-react';
import { API_BASE } from '../../config/api';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import ActivityModal from './ActivityModal';
import { useToast } from '../../contexts/ToastContext';

const HostSummarySection = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('EXPERIENCE');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalViews: 0,
    monthlyEarnings: 0,
    avgRating: 0,
    newBookings: 0,
    recentReservations: []
  });
  const { showToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(`${API_BASE}/api/host/dashboard-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const url = modalType === 'EXPERIENCE' 
        ? `${API_BASE}/api/host/activities`
        : `${API_BASE}/api/host/services`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setIsModalOpen(false);
        // Optionally trigger a refresh of stats or local data if relevant
        showToast(`${modalType === 'EXPERIENCE' ? 'Experiencia' : 'Servicio'} creado con éxito`, 'success');
      }
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { label: 'Vistas totales', value: dashboardData.totalViews.toString(), icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Ingresos del mes', value: `$${dashboardData.monthlyEarnings.toFixed(2)}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Valoración media', value: dashboardData.avgRating.toFixed(1), icon: Star, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Reservas nuevas', value: dashboardData.newBookings.toString(), icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary to-primary-dark rounded-[40px] p-12 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-5xl font-display font-black mb-4">
            ¡Hola, <span className="text-secondary">{user?.nombre || 'Anfitrión'}</span>!
          </h1>
          <p className="text-xl opacity-80 font-light max-w-xl">
            Tu negocio está creciendo. Mira las últimas actividades y gestiona tus servicios fácilmente.
          </p>
          <div className="flex gap-4 mt-8">
            <button 
              onClick={() => openModal('EXPERIENCE')}
              className="bg-white text-primary p-4 px-8 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-secondary hover:text-white transition-all shadow-xl"
            >
              <Plus className="w-5 h-5" /> Nueva Experiencia
            </button>
            <button 
              onClick={() => openModal('SERVICE')}
              className="bg-white/10 backdrop-blur-md text-white p-4 px-8 rounded-2xl font-black text-sm border border-white/20 hover:bg-white/20 transition-all"
            >
              <Plus className="w-5 h-5" /> Nuevo Servicio
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm hover:shadow-2xl transition-all group cursor-pointer"
          >
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-display font-black text-slate-800 mb-1">{stat.value}</p>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Reservations */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-50 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-display font-black text-slate-800">Últimas Reservas</h3>
            <button className="text-primary font-bold text-sm flex items-center gap-2">
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.recentReservations.length === 0 ? (
              <div className="py-20 text-center text-slate-300">
                <p className="font-bold">No hay reservas recientes para mostrar.</p>
              </div>
            ) : (
              dashboardData.recentReservations.map((res, i) => (
                <motion.div 
                  key={res.id_reserva}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl border border-slate-100 flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {res.turista_nombre[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{res.turista_nombre}</h4>
                      <p className="text-xs text-slate-500">{res.actividad_titulo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800">${parseFloat(res.total).toFixed(2)}</p>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      res.estado === 'APROBADA' ? 'bg-green-50 text-green-600' :
                      res.estado === 'PENDIENTE' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {res.estado}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions / Tips */}
        <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
          <Star className="absolute -bottom-10 -right-10 w-40 h-40 text-primary opacity-20 rotate-12" />
          <h3 className="text-2xl font-display font-black mb-6">Consejos pro</h3>
          <div className="space-y-6 relative z-10">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
              <p className="font-bold text-primary mb-2">Mejora tus fotos</p>
              <p className="text-sm opacity-60">Las experiencias con más de 5 fotos de alta calidad reciben un 40% más de reservas.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
              <p className="font-bold text-primary mb-2">Responde rápido</p>
              <p className="text-sm opacity-60">Los anfitriones que responden en menos de 1 hora tienen mejores puntuaciones.</p>
            </div>
          </div>
        </div>
      </div>

      <ActivityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        onSave={handleSave}
      />
    </div>
  );
};

export default HostSummarySection;
