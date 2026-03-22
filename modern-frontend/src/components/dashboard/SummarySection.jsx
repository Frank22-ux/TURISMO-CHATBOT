import { Plane, CheckCircle, Star, Wallet, ArrowRight } from 'lucide-react';

const SummarySection = ({ user }) => {
  const stats = [
    { label: 'Viajes activos', value: '0', icon: Plane, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Viajes completados', value: '0', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Reseñas pendientes', value: '0', icon: Star, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Inversión total', value: '$0.00', icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-primary-dark rounded-[40px] p-12 text-white">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-display font-black mb-4">
            ¡Hola, <span className="text-primary">{user?.firstName || 'Viajero'}</span>!
          </h1>
          <p className="text-xl opacity-70 font-light leading-relaxed">
            Es un buen día para descubrir nuevas aventuras en el corazón del Ecuador. ¿A dónde iremos hoy?
          </p>
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-10">
          <Plane className="w-80 h-80 rotate-12" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-50 shadow-sm hover:shadow-xl transition-all group">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-3xl font-display font-black text-slate-800 mb-1">{stat.value}</p>
            <p className="text-sm font-bold text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tables/Lists Section */}
      <div className="bg-white rounded-[40px] p-10 border border-slate-50 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-display font-black text-slate-800">Próximas Reservas</h3>
          <button className="flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all">
            Ver todas <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="pb-6 px-4">Experiencia</th>
                <th className="pb-6 px-4">Anfitrión</th>
                <th className="pb-6 px-4">Fecha</th>
                <th className="pb-6 px-4">Total</th>
                <th className="pb-6 px-4">Estado</th>
                <th className="pb-6 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="6" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4 text-slate-300">
                    <Plane className="w-12 h-12 opacity-20" />
                    <p className="font-bold">No tienes reservas próximas...</p>
                    <button className="text-primary text-xs font-black uppercase tracking-widest hover:underline">¡Explora ahora!</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SummarySection;
