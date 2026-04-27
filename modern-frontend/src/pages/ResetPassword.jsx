import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import { Lock, Mountain, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorDesc, setErrorDesc] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorDesc('El token de recuperación no es válido o falta.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorDesc('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setErrorDesc('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 5000);
      } else {
        setErrorDesc(data.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      setErrorDesc('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout 
        title="¡Contraseña Actualizada!" 
        subtitle="Tu seguridad es nuestra prioridad."
      >
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
          <h2 className="text-2xl font-black text-slate-800 text-center mb-4">Cambio Exitoso</h2>
          <p className="text-slate-500 text-center mb-8">
            Tu contraseña ha sido actualizada correctamente. Serás redirigido al inicio de sesión en unos segundos.
          </p>
          <div className="flex justify-center w-full">
            <Link 
              to="/login"
              className="px-10 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 group"
            >
              Ir al Login Ahora
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Crea tu nueva clave" 
      subtitle="Asegúrate de que sea una contraseña segura y difícil de adivinar."
    >
      <div className="flex items-center gap-2 mb-2 hidden md:flex text-primary">
        <Mountain className="w-8 h-8" />
        <span className="text-2xl font-display font-black text-primary-dark tracking-tighter">
          ISTPET <span className="text-primary">Turismo</span>
        </span>
      </div>
      <h2 className="text-3xl font-display font-black text-slate-800 mb-2">Nueva Contraseña</h2>
      <p className="text-slate-500 mb-8">Estás a un paso de recuperar tu cuenta</p>

      {errorDesc && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {errorDesc}
        </div>
      )}

      {!token ? (
        <div className="text-center py-10">
          <Link to="/forgot-password" className="text-primary font-black hover:underline">
            Solicitar un nuevo enlace
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Nueva Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              type="submit" 
              disabled={loading}
              className="px-10 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? 'Procesando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-12 pt-8 border-t border-slate-100 text-center">
        <p className="text-slate-500 text-sm">
          ¿Necesitas ayuda? <Link to="/support" className="text-primary font-black hover:underline">Contactar soporte</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
