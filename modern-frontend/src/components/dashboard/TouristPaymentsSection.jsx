import { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { History, Clock, RefreshCcw, CheckCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const TouristPaymentsSection = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      
      const paymentsRes = await fetch(`${API_BASE}/api/tourist/payments`, { headers: { Authorization: `Bearer ${token}` } });

      if (paymentsRes.ok) {
        const pData = await paymentsRes.json();
        setPayments(pData);
      }
    } catch (err) {
      showToast('Error de red al cargar pagos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center animate-pulse text-slate-400 font-bold">Cargando pagos...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 font-display tracking-tight">Mis Pagos</h2>
          <p className="text-slate-500 mt-2">Revisa tu historial de transacciones realizadas en la plataforma.</p>
        </div>
        <button onClick={fetchData} className="p-3 text-slate-400 hover:text-primary transition-colors bg-white rounded-xl shadow-sm border border-slate-100">
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-full">
        <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2"><History className="w-5 h-5 text-slate-400"/> Historial de Transacciones</h3>
        <div className="space-y-4">
          {payments.length === 0 ? (
            <div className="p-10 text-center text-slate-400 bg-slate-50 rounded-2xl">
                No tienes transacciones registradas.
            </div>
          ) : (
            payments.map(payment => (
              <div key={payment.id_pago} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${payment.estado === 'DEVUELTO' ? 'bg-orange-100 text-orange-500' : 'bg-green-100 text-green-500'}`}>
                    {payment.estado === 'DEVUELTO' ? <Clock className="w-6 h-6"/> : <CheckCircle className="w-6 h-6"/>}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg leading-tight">{payment.actividad_titulo}</p>
                    <p className="text-sm font-bold text-slate-400 mt-0.5">Anfitrión: {payment.anfitrion_nombre}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: #{payment.id_pago.toString().padStart(5, '0')} • {new Date(payment.fecha_pago).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="text-right">
                  {payment.estado === 'DEVUELTO' ? (
                    <div className="flex flex-col items-end">
                      <p className="text-sm font-bold text-slate-400 line-through">${parseFloat(payment.monto_total).toFixed(2)}</p>
                      <p className="text-xl font-black text-orange-500 leading-none mt-1">+${parseFloat(payment.monto_reembolsado).toFixed(2)}</p>
                      <p className="text-[10px] font-black uppercase text-orange-400 mt-1 bg-orange-100 px-2 py-0.5 rounded">Reembolsado</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl font-black text-emerald-600 font-display leading-none">${parseFloat(payment.monto_total).toFixed(2)}</p>
                      <p className="text-[10px] font-black uppercase text-emerald-500 mt-2 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">Confirmado</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TouristPaymentsSection;
