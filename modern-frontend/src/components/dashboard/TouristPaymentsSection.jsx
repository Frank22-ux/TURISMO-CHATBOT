import { useState, useEffect, useMemo } from 'react';
import { API_BASE } from '../../config/api';
import { History, Clock, RefreshCcw, CheckCircle, Filter } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const TouristPaymentsSection = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate constraints
  const today = new Date();
  const maxDateStr = today.toISOString().split('T')[0];
  
  const minDate = new Date();
  minDate.setMonth(minDate.getMonth() - 4);
  const minDateStr = minDate.toISOString().split('T')[0];

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      if (!startDate && !endDate) return true;
      const pDate = new Date(payment.fecha_pago);
      const start = startDate ? new Date(startDate + 'T00:00:00') : new Date('1900-01-01');
      const end = endDate ? new Date(endDate + 'T23:59:59') : new Date('2100-01-01');
      return pDate >= start && pDate <= end;
    });
  }, [payments, startDate, endDate]);

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400"/> Historial de Transacciones
          </h3>
          
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400 mx-2" />
            <input 
              type="date"
              value={startDate}
              min={minDateStr}
              max={maxDateStr}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              title="Fecha inicial (máximo 4 meses atrás)"
            />
            <span className="text-slate-300 font-bold">-</span>
            <input 
              type="date"
              value={endDate}
              min={startDate || minDateStr}
              max={maxDateStr}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold text-slate-600 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-xs font-bold text-slate-400 hover:text-danger px-2 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <div className="p-10 text-center text-slate-400 bg-slate-50 rounded-2xl">
                {payments.length === 0 ? 'No tienes transacciones registradas.' : 'No hay transacciones en este rango de fechas.'}
            </div>
          ) : (
            filteredPayments.map(payment => (
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
