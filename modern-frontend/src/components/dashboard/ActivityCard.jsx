import { MapPin, Eye, Pencil, Trash2, Play, Pause } from 'lucide-react';

const ActivityCard = ({ activity, onView, onEdit, onDelete, onToggleStatus }) => {
  const isActive = activity.estado === 'ACTIVA';

  return (
    <div className="bg-white rounded-[32px] overflow-hidden border border-slate-50 shadow-sm hover:shadow-2xl transition-all group">
      <div className="relative h-56">
        <img 
          src={activity.image || activity.portada || "https://via.placeholder.com/400x300?text=Sin+Imagen"} 
          alt={activity.title || activity.titulo} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
            isActive ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
          }`}>
            {activity.estado}
          </span>
        </div>
        
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button onClick={() => onView(activity)} title="Ver" className="p-3 bg-white text-slate-800 rounded-2xl hover:bg-primary hover:text-white transition-all scale-90 group-hover:scale-100">
            <Eye className="w-5 h-5" />
          </button>
          <button onClick={() => onEdit(activity)} title="Editar" className="p-3 bg-white text-slate-800 rounded-2xl hover:bg-blue-500 hover:text-white transition-all scale-90 delay-75 group-hover:scale-100">
            <Pencil className="w-5 h-5" />
          </button>
          <button onClick={() => onDelete(activity)} title="Eliminar" className="p-3 bg-white text-slate-800 rounded-2xl hover:bg-red-500 hover:text-white transition-all scale-90 delay-150 group-hover:scale-100">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-8">
        <h3 className="text-xl font-display font-black text-slate-800 mb-2 line-clamp-1">{activity.title || activity.titulo}</h3>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-6">
          <MapPin className="w-4 h-4 text-primary" />
          {activity.location || `${activity.ciudad}, ${activity.provincia}`}
        </div>
        
        <div className="flex justify-between items-center pt-6 border-t border-slate-50">
          <div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Desde</p>
            <p className="text-2xl font-display font-black text-primary">${activity.price || activity.precio}</p>
          </div>
          <button 
            onClick={() => onToggleStatus(activity)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black transition-all ${
              isActive 
              ? 'bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white' 
              : 'bg-green-50 text-green-600 hover:bg-green-500 hover:text-white'
            }`}
          >
            {isActive ? <><Pause className="w-4 h-4" /> Pausar</> : <><Play className="w-4 h-4" /> Activar</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
