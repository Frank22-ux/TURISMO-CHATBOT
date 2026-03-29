import { useState, useEffect } from 'react';
import { Wallet, Landmark, ArrowRightLeft, ShieldCheck, Save, Clock } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const HostPaymentsSection = () => {
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
        fetch('http://localhost:3000/api/host/payments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:3000/api/host/profile', { headers: { Authorization: `Bearer ${token}` } })
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
      showToast('Error al cargar datos de pago', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBankInfo = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch('http://localhost:3000/api/host/profile/bank', {
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

  if (isLoading) return <div className="h-64 flex items-center justify-center animate-pulse text-slate-400 font-bold">Cargando billetera...</div>;

  const totalEarnings = payments
    .reduce((acc, curr) => {
      if (curr.estado === 'CONFIRMADO') return acc + parseFloat(curr.monto_anfitrion || 0);
      if (curr.estado === 'DEVUELTO') {
         const retained = parseFloat(curr.monto_anfitrion || 0) - parseFloat(curr.monto_reembolsado || 0);
         return acc + (retained > 0 ? retained : 0);
      }
      return acc;
    }, 0);

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800 font-display tracking-tight">Mi Billetera</h2>
        <p className="text-slate-500 mt-2">Gestiona tus cuentas de retiro y revisa tus ingresos mensuales.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Side: Bank Setup */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Landmark className="w-40 h-40" />
            </div>
            <p className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-1">Balance Disponible</p>
            <h3 className="text-4xl font-black font-display tracking-tight">${totalEarnings.toFixed(2)}</h3>
            <div className="mt-8 pt-4 border-t border-white/20">
               <p className="text-xs text-white/80"><ShieldCheck className="w-4 h-4 inline-block mr-1"/> Retiros automáticos cada fin de mes</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-slate-400"/> Datos Bancarios
            </h3>
            
            <form onSubmit={handleSaveBankInfo} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Banco (Entidad)</label>
                <input 
                  type="text" 
                  value={bankInfo.banco_nombre}
                  onChange={(e) => setBankInfo({...bankInfo, banco_nombre: e.target.value})}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-slate-700" 
                  placeholder="Ej: Banco Pichincha"
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
                {isSaving ? 'Guardando...' : 'Guardar Datos'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Ledger */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 min-h-full">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><ArrowRightLeft className="w-5 h-5 text-slate-400"/> Libro Mayor de Ingresos</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="pb-4">Fecha & Ref</th>
                    <th className="pb-4">Concepto (Experiencia)</th>
                    <th className="pb-4">Turista</th>
                    <th className="pb-4 text-right">Monto Bruto</th>
                    <th className="pb-4 text-right">Ganancia Neta</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-slate-400">No hay ventas registradas aún.</td>
                    </tr>
                  ) : (
                    payments.map(payment => {
                      const isRefunded = payment.estado === 'DEVUELTO';
                      let netEarnings = parseFloat(payment.monto_anfitrion);
                      if (isRefunded) {
                        netEarnings = Math.max(0, netEarnings - parseFloat(payment.monto_reembolsado));
                      }
                      
                      return (
                      <tr key={payment.id_pago} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="py-4">
                          <p className={`font-bold ${isRefunded ? 'text-orange-500' : 'text-slate-700'}`}>
                            {new Date(payment.fecha_pago).toLocaleDateString()}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">#{payment.id_pago.toString().padStart(5, '0')}</p>
                        </td>
                        <td className="py-4">
                           <p className="font-bold text-slate-700">{payment.actividad_titulo}</p>
                           {isRefunded && <p className="text-[10px] font-black text-orange-500 uppercase bg-orange-100 px-1 inline-block mt-1 rounded">Cancelación (Retención)</p>}
                        </td>
                        <td className="py-4 text-slate-500">{payment.turista_nombre}</td>
                        <td className="py-4 text-right text-slate-500">
                           {isRefunded ? (
                             <>
                               <span className="line-through text-slate-300 mr-2">${parseFloat(payment.monto_total).toFixed(2)}</span>
                               <span className="text-orange-600">${parseFloat(payment.monto_total - payment.monto_reembolsado).toFixed(2)}</span>
                             </>
                           ) : (
                             `$${parseFloat(payment.monto_total).toFixed(2)}`
                           )}
                        </td>
                        <td className="py-4 text-right">
                          <span className={`font-black font-display ${isRefunded ? 'text-orange-500' : 'text-emerald-600'}`}>${netEarnings.toFixed(2)}</span>
                        </td>
                      </tr>
                    )})
                  )}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostPaymentsSection;
