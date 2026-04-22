import { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { History, Clock, RefreshCcw, CheckCircle, Landmark, ShieldCheck, Save } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const TouristPaymentsSection = () => {
  const [payments, setPayments] = useState([]);
  const [bankInfo, setBankInfo] = useState({
    banco_nombre: '',
    tipo_cuenta: '',
    numero_cuenta: '',
    identificacion: '',
    banco_swift: '',
    banco_direccion: '',
    banco_pais: ''
  });
  const [isInternational, setIsInternational] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
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
        fetch(`${API_BASE}/api/tourist/payments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/tourist/profile`, { headers: { Authorization: `Bearer ${token}` } })
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
          identificacion: prData.identificacion || '',
          banco_swift: prData.banco_swift || '',
          banco_direccion: prData.banco_direccion || '',
          banco_pais: prData.banco_pais || ''
        });
        
        // Auto-detect if it's international if swift is present
        if (prData.banco_swift) setIsInternational(true);
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
      const res = await fetch(`${API_BASE}/api/tourist/profile/bank`, {
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

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-slate-400"/> Datos Bancarios
              </h3>
              <button 
                onClick={() => setShowSecurityModal(true)}
                className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                title="Seguridad de tus datos"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
                <span className="uppercase block mb-1">Aviso de Reembolsos</span>
                Las devoluciones se procesan en un plazo de <span className="underline">20 días hábiles</span> tras la cancelación.
              </p>
            </div>

            <form onSubmit={handleSaveBankInfo} className="space-y-4 flex-grow">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${isInternational ? 'bg-primary' : 'bg-slate-300'}`} onClick={() => setIsInternational(!isInternational)}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isInternational ? 'left-5' : 'left-1'}`} />
                  </div>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-tight">Cuenta Internacional</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Banco (Entidad)</label>
                <input 
                  type="text" 
                  value={bankInfo.banco_nombre}
                  onChange={(e) => setBankInfo({...bankInfo, banco_nombre: e.target.value})}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-slate-700" 
                  placeholder={isInternational ? "Nombre del banco extranjero" : "Ej: Banco Guayaquil"}
                  required
                />
              </div>

              {isInternational && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Código SWIFT / BIC</label>
                    <input 
                      type="text" 
                      value={bankInfo.banco_swift}
                      onChange={(e) => setBankInfo({...bankInfo, banco_swift: e.target.value})}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-slate-700" 
                      placeholder="8 o 11 caracteres"
                      required={isInternational}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">País del Banco</label>
                    <input 
                      type="text" 
                      value={bankInfo.banco_pais}
                      onChange={(e) => setBankInfo({...bankInfo, banco_pais: e.target.value})}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-slate-700" 
                      placeholder="Ej: Estados Unidos"
                      required={isInternational}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Dirección de la Agencia</label>
                    <input 
                      type="text" 
                      value={bankInfo.banco_direccion}
                      onChange={(e) => setBankInfo({...bankInfo, banco_direccion: e.target.value})}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-slate-700" 
                      placeholder="Calle, Ciudad, Estado"
                      required={isInternational}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Número de Identificación</label>
                <input 
                  type="text" 
                  value={bankInfo.identificacion}
                  onChange={(e) => setBankInfo({...bankInfo, identificacion: e.target.value})}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-slate-700" 
                  placeholder={isInternational ? "ID / Pasaporte del titular" : "Cédula/RUC del titular"}
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
                    <option value="AHORRO">Ahorros / Savings</option>
                    <option value="CORRIENTE">Corriente / Checking</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nº de Cuenta / IBAN</label>
                  <input 
                    type="text" 
                    value={bankInfo.numero_cuenta}
                    onChange={(e) => setBankInfo({...bankInfo, numero_cuenta: e.target.value})}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold text-slate-700" 
                    placeholder="Número de cuenta..."
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full mt-4 py-3.5 bg-slate-800 text-white rounded-2xl font-bold text-sm hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
              >
                {isSaving ? <Clock className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
                {isSaving ? 'Guardando...' : 'Guardar Datos Bancarios'}
              </button>
            </form>
          </div>
        </div>

        {/* Security Modal */}
        {showSecurityModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full" />
              <ShieldCheck className="w-16 h-16 text-emerald-500 mb-6 relative" />
              <h3 className="text-2xl font-black text-slate-800 mb-4 leading-tight">Tu seguridad es nuestra prioridad</h3>
              <div className="space-y-4 text-slate-600 font-medium leading-relaxed">
                <p>Ciframos tu información bancaria mediante protocolos de seguridad de grado bancario (AES-256).</p>
                <p>Cumplimos con los estándares internacionales PCI DSS para el manejo seguro de datos sensibles.</p>
                <p>Tu información solo se utiliza para procesar reembolsos automáticos y nunca se comparte con terceros.</p>
              </div>
              <button 
                onClick={() => setShowSecurityModal(false)}
                className="w-full mt-8 py-3 bg-slate-100 text-slate-800 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

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
