import { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { Search, Plus, MapPinned } from 'lucide-react';
import ActivityCard from './ActivityCard';
import ActivityModal from './ActivityModal';
import ActivityDetailModal from './ActivityDetailModal';
import ConfirmModal from './ConfirmModal';
import { motion } from 'framer-motion';

const ExperiencesSection = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchActivities = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/host/activities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setActivities(data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSave = async (data) => {
    try {
      const token = sessionStorage.getItem('token');
      const method = selectedActivity ? 'PUT' : 'POST';
      const url = selectedActivity 
        ? `${API_BASE}/api/host/activities/${selectedActivity.id}`
        : `${API_BASE}/api/host/activities`;

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
        fetchActivities();
      }
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleToggleStatus = async (activity) => {
    const newStatus = activity.estado === 'ACTIVA' ? 'PAUSADA' : 'ACTIVA';
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/host/activities/${activity.id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ estado: newStatus })
      });
      if (response.ok) fetchActivities();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDelete = (activity) => {
    setSelectedActivity(activity);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedActivity) return;
    setIsDeleting(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/host/activities/${selectedActivity.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setIsConfirmOpen(false);
        fetchActivities();
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
    } finally {
      setIsDeleting(false);
      setSelectedActivity(null);
    }
  };

  const filtered = activities.filter(a => 
    (a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-bold">Cargando tus aventuras...</div>;

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-black text-slate-800">Mis Experiencias</h2>
          <p className="text-slate-500 mt-1">Gestiona tus rutas, tours y aventuras activas en el sistema.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Buscar experiencias..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-100 focus:ring-4 focus:ring-primary/10 shadow-sm transition-all outline-none text-sm font-bold"
            />
          </div>
          <button 
            onClick={() => { setSelectedActivity(null); setIsModalOpen(true); }}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-2xl font-black transition-all shadow-lg flex items-center gap-2 shrink-0 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Nueva
          </button>
        </div>
      </div>

      <ActivityModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="EXPERIENCE"
        initialData={selectedActivity}
        onSave={handleSave}
      />

      <ActivityDetailModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        activity={selectedActivity}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => { setIsConfirmOpen(false); setSelectedActivity(null); }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Eliminar Experiencia"
        message={`¿Estás seguro de que deseas eliminar "${selectedActivity?.title || selectedActivity?.titulo}"? Esta acción no se puede deshacer.`}
      />

      {filtered.length === 0 ? (
        <div className="bg-white rounded-[40px] p-20 text-center border border-slate-50 shadow-sm space-y-6">
          <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-3xl flex items-center justify-center mx-auto">
            <MapPinned className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-display font-black text-slate-800">No hay experiencias todavía</h3>
            <p className="text-slate-400 mt-2">Empieza creando tu primera experiencia para que los viajeros puedan conocerte.</p>
          </div>
          <button 
            onClick={() => { setSelectedActivity(null); setIsModalOpen(true); }}
            className="text-primary font-black uppercase tracking-widest text-xs hover:underline flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" /> Crear mi primera experiencia
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filtered.map((activity, i) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ActivityCard 
                activity={activity} 
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onView={async (a) => { 
                  try {
                    const token = sessionStorage.getItem('token');
                    const response = await fetch(`${API_BASE}/api/host/activities/${a.id}`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                      const fullData = await response.json();
                      setSelectedActivity(fullData);
                      setIsDetailOpen(true);
                    }
                  } catch (error) {
                    console.error('Error fetching activity details:', error);
                    // Fallback to basic data if fetch fails
                    setSelectedActivity(a);
                    setIsDetailOpen(true);
                  }
                }}
                onEdit={(a) => { setSelectedActivity(a); setIsModalOpen(true); }}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperiencesSection;
