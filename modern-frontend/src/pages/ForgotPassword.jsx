import { useState } from 'react';
import { API_BASE } from '../config/api';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Mountain, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorDesc, setErrorDesc] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorDesc('');
    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
      } else {
        setErrorDesc(data.message || 'Error al solicitar el restablecimiento');
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
        title="¡Correo Enviado!" 
        subtitle="Revisa tu bandeja de entrada para continuar."
      >
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
          <h2 className="text-2xl font-black text-slate-800 text-center mb-4">Revisa tu correo electrónico</h2>
          <p className="text-slate-500 text-center mb-8">
            Hemos enviado una contraseña temporal a <strong>{email}</strong>. Por favor, usa esta contraseña para iniciar sesión y luego cámbiala en la sección de Perfil/Seguridad.
          </p>
          <div className="flex justify-center w-full">
            <Link 
              to="/login"
              className="px-10 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              Volver a Iniciar Sesión
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Recupera tu acceso" 
      subtitle="Te enviaremos una contraseña temporal a tu correo registrado."
    >
      <div className="flex items-center gap-2 mb-2 hidden md:flex text-primary">
        <Mountain className="w-8 h-8" />
        <span className="text-2xl font-display font-black text-primary-dark tracking-tighter">
          ISTPET <span className="text-primary">Turismo</span>
        </span>
      </div>
      <h2 className="text-3xl font-display font-black text-slate-800 mb-2">Restablecer Contraseña</h2>
      <p className="text-slate-500 mb-8">Ingresa el correo asociado a tu cuenta</p>

      {errorDesc && (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100">
          {errorDesc}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input 
              type="email"
              required
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            type="submit" 
            disabled={loading}
            className="px-10 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? 'Enviando...' : 'Enviar Contraseña Temporal'}
          </button>
        </div>
      </form>

      <div className="mt-12 pt-8 border-t border-slate-100 text-center">
        <p className="text-slate-500 text-sm">
          ¿Recordaste tu contraseña? <Link to="/login" className="text-primary font-black hover:underline">Vuelve a ingresar</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
