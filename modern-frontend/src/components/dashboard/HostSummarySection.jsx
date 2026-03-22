import { Eye, DollarSign, Star, ShoppingBag, Plus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ActivityModal from './ActivityModal';

const HostSummarySection = ({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('EXPERIENCE');
  const [isLoading, setIsLoading] = useState(false);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const url = modalType === 'EXPERIENCE' 
        ? 'http://localhost:3000/api/host/activities'
        : 'http://localhost:3000/api/host/services';

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
        alert(`${modalType === 'EXPERIENCE' ? 'Experiencia' : 'Servicio'} creado con éxito`);
      }
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { label: 'Vistas totales', value: '0', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Ingresos del mes', value: '$0.00', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Valoración media', value: '0.0', icon: Star, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Reservas nuevas', value: '0', icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-50' },
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
            <div className="py-20 text-center text-slate-300">
              <p className="font-bold">No hay reservas recientes para mostrar.</p>
            </div>
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
