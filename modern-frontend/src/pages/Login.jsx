import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, ArrowRight, Mountain, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import PhoneInputWithCountry from '../components/PhoneInputWithCountry';

const Login = () => {
  const [method, setMethod] = useState('email');
  const [formData, setFormData] = useState({ identifier: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [showReactivation, setShowReactivation] = useState(false);
  const [reactivationCode, setReactivationCode] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleReactivate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/auth/reactivate-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: method === 'phone' ? formData.phone : formData.identifier,
          codigo: reactivationCode
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert('¡Cuenta reactivada! Por favor inicia sesión nuevamente.');
        setShowReactivation(false);
        setReactivationCode('');
      } else {
        setError(data.message || 'Error al reactivar cuenta');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [method]: method === 'phone' ? formData.phone : formData.identifier,
          password: formData.password
        })
      });
      const data = await response.json();
      if (data.token) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        if (data.user.rol === 'ADMIN') {
          navigate('/admin');
        } else if (data.user.rol === 'ANFITRION') {
          navigate('/dashboard-host');
        } else {
          navigate('/dashboard-tourist');
        }
      } else if (data.message === 'SUSPENDED_INACTIVITY') {
        setShowReactivation(true);
      } else {
        setError(data.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de red al intentar conectarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="¡Bienvenido de nuevo!" 
      subtitle="Accede a las mejores experiencias diseñadas especialmente para ti."
    >
      <div className="flex items-center gap-2 mb-2 hidden md:flex text-primary">
        <Mountain className="w-8 h-8" />
        <span className="text-2xl font-display font-black text-primary-dark tracking-tighter">
          ISTPET <span className="text-primary">Turismo</span>
        </span>
      </div>
      <h2 className="text-3xl font-display font-black text-slate-800 mb-2">Ingresar</h2>
      <p className="text-slate-500 mb-6">
        {showReactivation ? 'Ingresa el código enviado a tu correo' : 'Ingresa tus datos para acceder a tu perfil'}
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-200 mb-6 flex items-center gap-3 animate-fade-in shadow-sm shadow-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showReactivation ? (
        <form onSubmit={handleReactivate} className="space-y-6">
          <div className="bg-orange-50 text-orange-600 p-4 rounded-xl text-sm font-bold border border-orange-200 mb-6">
            ⚠️ Tu cuenta fue suspendida temporalmente por más de 30 días de inactividad. Revisa tu correo, te enviamos un código de desbloqueo.
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Código de Reactivación (6 dígitos)
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                type="text"
                required
                maxLength="6"
                className="auth-input pl-12 text-center text-xl tracking-widest font-black text-primary"
                placeholder="000000"
                value={reactivationCode}
                onChange={(e) => setReactivationCode(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-4">
             <button 
                type="button"
                onClick={() => setShowReactivation(false)}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-black transition-all"
             >
                Volver
             </button>
             <button 
               type="submit" 
               disabled={loading || reactivationCode.length < 6}
               className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black shadow-xl shadow-orange-500/20 transform hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
             >
               {loading ? 'Verificando...' : 'Reactivar'}
             </button>
          </div>
        </form>
      ) : (
        <>
          {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
        <button 
          onClick={() => setMethod('email')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            method === 'email' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Mail className="w-4 h-4" /> Correo
        </button>
        <button 
          onClick={() => setMethod('phone')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            method === 'phone' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Phone className="w-4 h-4" /> Teléfono
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
            {method === 'email' ? 'Correo Electrónico' : 'Teléfono Móvil'}
          </label>
          <div className="relative">
            {method === 'email' ? (
              <>
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="email"
                  required
                  className="auth-input pl-12"
                  placeholder="tu@correo.com"
                  onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                />
              </>
            ) : (
              <PhoneInputWithCountry 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                onValidationChange={setIsPhoneValid}
              />
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 ml-1">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
            <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input 
              type="password"
              required
              className="auth-input pl-12"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || (method === 'phone' && !isPhoneValid && formData.phone.length > 0)}
          className={`w-full py-5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 group ${(method === 'phone' && !isPhoneValid && formData.phone.length > 0) ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Ingresando...' : <>Ingresar <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
        </button>
      </form>
      </>
      )}

      <div className="mt-12 pt-8 border-t border-slate-100 text-center">
        <p className="text-slate-500 text-sm">
          ¿No tienes una cuenta? <Link to="/register" className="text-primary font-black hover:underline">Regístrate gratis</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
