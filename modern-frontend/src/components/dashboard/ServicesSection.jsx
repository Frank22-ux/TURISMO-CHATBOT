import { useState, useEffect } from 'react';
import { Search, Plus, Utensils } from 'lucide-react';
import ActivityCard from './ActivityCard';
import ActivityModal from './ActivityModal';
import ActivityDetailModal from './ActivityDetailModal';
import ConfirmModal from './ConfirmModal';
import { motion } from 'framer-motion';

const ServicesSection = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchServices = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/host/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSave = async (data) => {
    try {
      const token = sessionStorage.getItem('token');
      const method = selectedService ? 'PUT' : 'POST';
      const url = selectedService 
        ? `http://localhost:3000/api/host/services/${selectedService.id_actividad}`
        : 'http://localhost:3000/api/host/services';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchServices();
      }
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleToggleStatus = async (service) => {
    const newStatus = service.estado === 'ACTIVA' ? 'PAUSADA' : 'ACTIVA';
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/host/services/${service.id_actividad}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ estado: newStatus })
      });
      if (response.ok) fetchServices();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDelete = (service) => {
    setSelectedService(service);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedService) return;
    setIsDeleting(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/host/services/${selectedService.id_actividad}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setIsConfirmOpen(false);
        fetchServices();
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    } finally {
      setIsDeleting(false);
      setSelectedService(null);
    }
  };

  const filtered = services.filter(s => 
    (s.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.ciudad || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-bold">Cargando tus servicios...</div>;

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-800">Mis Servicios</h2>
          <p className="text-slate-500 mt-1">Gestiona tus establecimientos alimentarios y propuestas gastronómicas.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Buscar servicios..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-100 focus:ring-4 focus:ring-primary/10 shadow-sm transition-all outline-none text-sm font-bold"
            />
          </div>
          <button 
            onClick={() => { setSelectedService(null); setIsModalOpen(true); }}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-2xl font-black transition-all shadow-lg flex items-center gap-2 shrink-0 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Nuevo
          </button>
        </div>
      </div>

      <ActivityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="SERVICE"
        initialData={selectedService}
        onSave={handleSave}
      />

      <ActivityDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        activity={selectedService}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => { setIsConfirmOpen(false); setSelectedService(null); }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Eliminar Servicio"
        message={`¿Estás seguro de que deseas eliminar "${selectedService?.titulo || selectedService?.title || selectedService?.nombre || 'este servicio'}"? Esta acción no se puede deshacer.`}
      />

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[40px] p-20 text-center border border-slate-50 shadow-sm space-y-6">
          <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto">
            <Utensils className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-slate-800">No hay servicios todavía</h3>
            <p className="text-slate-400 mt-2">Publica tu restaurante o servicio de alimentación para los viajeros.</p>
          </div>
          <button 
            onClick={() => { setSelectedService(null); setIsModalOpen(true); }}
            className="text-primary font-black uppercase tracking-widest text-xs hover:underline flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" /> Registrar mi primer servicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((service, i) => (
            <motion.div
              key={service.id_actividad}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ActivityCard 
                activity={service} 
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onView={async (s) => { 
                  try {
                    const token = sessionStorage.getItem('token');
                    const response = await fetch(`http://localhost:3000/api/host/services/${s.id_actividad}`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                      const fullData = await response.json();
                      setSelectedService(fullData);
                      setIsDetailOpen(true);
                    }
                  } catch (error) {
                    console.error('Error fetching service details:', error);
                    // Fallback to basic data if fetch fails
                    setSelectedService(s);
                    setIsDetailOpen(true);
                  }
                }}
                onEdit={(s) => { setSelectedService(s); setIsModalOpen(true); }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesSection;
