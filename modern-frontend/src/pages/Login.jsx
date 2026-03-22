import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, ArrowRight, Mountain } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const [method, setMethod] = useState('email');
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [method]: formData.identifier,
          password: formData.password
        })
      });
      const data = await response.json();
      if (data.token) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        navigate(data.user.rol === 'ANFITRION' ? '/dashboard-host' : '/dashboard-tourist');
      } else {
        alert(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      alert('Error de conexión');
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
      <p className="text-slate-500 mb-8">Ingresa tus datos para acceder a tu perfil</p>

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
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            ) : (
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            )}
            <input 
              type={method === 'email' ? 'email' : 'tel'}
              required
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
              placeholder={method === 'email' ? 'tu@correo.com' : '+593...'}
              onChange={(e) => setFormData({...formData, identifier: e.target.value})}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 ml-1">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
            <a href="#" className="text-xs font-bold text-primary hover:underline">¿Olvidaste tu contraseña?</a>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input 
              type="password"
              required
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 group"
        >
          {loading ? 'Ingresando...' : <>Ingresar <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
        </button>
      </form>

      <div className="mt-12 pt-8 border-t border-slate-100 text-center">
        <p className="text-slate-500 text-sm">
          ¿No tienes una cuenta? <Link to="/register" className="text-primary font-black hover:underline">Regístrate gratis</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
