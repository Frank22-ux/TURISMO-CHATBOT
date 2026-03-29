import { useState, useEffect } from 'react';
import { History, Clock, RefreshCcw, CheckCircle, Landmark, ShieldCheck, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const TouristPaymentsSection = () => {
  const [payments, setPayments] = useState([]);
  const [bankInfo, setBankInfo] = useState({
    banco_nombre: '',
    tipo_cuenta: '',
    numero_cuenta: '',
    identificacion: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      
      const [paymentsRes, profileRes] = await Promise.all([
        fetch('http://localhost:3000/api/tourist/payments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/tourist/profile', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (paymentsRes.ok) {
        const pData = await paymentsRes.json();
        setPayments(pData);
      }
      
      if (profileRes.ok) {
        const prData = await profileRes.json();
        setBankInfo({
          banco_nombre: prData.banco_nombre || '',
          tipo_cuenta: prData.tipo_cuenta || '',
          numero_cuenta: prData.numero_cuenta || '',
          identificacion: prData.identificacion || ''
        });
      }
    } catch (err) {
      showToast('Error de red al cargar datos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBankInfo = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/tourist/profile/bank', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bankInfo)
      });
      
      if (res.ok) {
        showToast('Datos bancarios guardados exitosamente', 'success');
      } else {
        showToast('No se pudieron guardar los datos', 'error');
      }
    } catch (error) {
      showToast('Error de conexión', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="h-64 flex items-center justify-center animate-pulse text-slate-400 font-bold">Cargando pagos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 font-display tracking-tight">Mis Pagos</h2>
          <p className="text-slate-500 mt-2">Gestiona tu método de reembolso y revisa tu historial de transacciones.</p>
        </div>
        <button onClick={fetchData} className="p-3 text-slate-400 hover:text-primary transition-colors bg-white rounded-xl shadow-sm border border-slate-100">
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Bank Setup */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-primary rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Landmark className="w-40 h-40" />
            </div>
            <p className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-2">Cuenta de Reembolso Activa</p>
            <h3 className="text-lg font-black font-display tracking-tight leading-tight">
              {bankInfo.banco_nombre ? bankInfo.banco_nombre : 'Sin banco configurado'}
            </h3>
            {bankInfo.numero_cuenta && (
              <p className="text-sm font-mono mt-1 opacity-80">**** {bankInfo.numero_cuenta.slice(-4)}</p>
            )}
            <div className="mt-8 pt-4 border-t border-white/20">
               <p className="text-xs text-white/80 leading-relaxed"><ShieldCheck className="w-4 h-4 inline-block mr-1"/> Utilizada para devoluciones por cancelación.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-slate-400"/> Datos para Reembolsos
            </h3>
            
            <form onSubmit={handleSaveBankInfo} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Banco (Entidad)</label>
                <input 
                  type="text" 
                  value={bankInfo.banco_nombre}
                  onChange={(e) => setBankInfo({...bankInfo, banco_nombre: e.target.value})}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-slate-700" 
                  placeholder="Ej: Banco Guayaquil"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Número de Identificación</label>
                <input 
                  type="text" 
                  value={bankInfo.identificacion}
                  onChange={(e) => setBankInfo({...bankInfo, identificacion: e.target.value})}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-slate-700" 
                  placeholder="Cédula/RUC del titular"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tipo Cta.</label>
                  <select 
                    value={bankInfo.tipo_cuenta}
                    onChange={(e) => setBankInfo({...bankInfo, tipo_cuenta: e.target.value})}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-slate-700"
                    required
                  >
                    <option value="">Seleccionar</option>
                    <option value="AHORRO">Ahorros</option>
                    <option value="CORRIENTE">Corriente</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nº de Cuenta</label>
                  <input 
                    type="text" 
                    value={bankInfo.numero_cuenta}
                    onChange={(e) => setBankInfo({...bankInfo, numero_cuenta: e.target.value})}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-slate-700" 
                    placeholder="2200..."
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full mt-2 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? <Clock className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
                {isSaving ? 'Guardando...' : 'Guardar Cuenta'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Ledger */}
        <div className="lg:col-span-2">
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
      </div>
    </div>
  );
};

export default TouristPaymentsSection;
