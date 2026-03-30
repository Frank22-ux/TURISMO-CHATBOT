import { useState } from 'react';
import { Shield, Lock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ForcePasswordChangeModal = ({ isOpen, onPasswordChanged }) => {
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errorDesc, setErrorDesc] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorDesc('');

    if (passwords.new !== passwords.confirm) {
      setErrorDesc('Las nuevas contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          currentPassword: passwords.current, 
          newPassword: passwords.new 
        })
      });

      const data = await response.json();
      if (response.ok) {
        // Update user session locally
        const userData = JSON.parse(sessionStorage.getItem('user'));
        userData.requiere_cambio_clave = false;
        sessionStorage.setItem('user', JSON.stringify(userData));
        
        onPasswordChanged();
      } else {
        setErrorDesc(data.message || 'Error al actualizar contraseña. Verifica tu clave temporal.');
      }
    } catch (error) {
      setErrorDesc('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[999] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl relative"
        >
          {/* Header */}
          <div className="bg-primary p-8 text-center relative overflow-hidden">
            <Shield className="absolute -top-10 -right-10 w-40 h-40 text-white/10" />
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-display font-black text-white mb-2">Seguridad Requerida</h2>
            <p className="text-white/80 text-sm">Debes establecer una contraseña permanente para continuar usando tu cuenta.</p>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {errorDesc && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-red-600">{errorDesc}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contraseña Temporal <span className="text-red-500">*</span></label>
                <input 
                  type="password"
                  required
                  placeholder="La que recibiste por correo"
                  value={passwords.current}
                  onChange={e => setPasswords({...passwords, current: e.target.value})}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nueva Contraseña <span className="text-red-500">*</span></label>
                <input 
                  type="password"
                  required
                  placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 símbolo"
                  value={passwords.new}
                  onChange={e => setPasswords({...passwords, new: e.target.value})}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirmar Nueva Contraseña <span className="text-red-500">*</span></label>
                <input 
                  type="password"
                  required
                  placeholder="Repite la nueva contraseña"
                  value={passwords.confirm}
                  onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black shadow-xl shadow-primary/20 transform active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Guardando...</>
              ) : (
                <>Establecer Contraseña y Continuar <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ForcePasswordChangeModal;
