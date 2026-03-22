import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Calendar, ArrowRight, Mountain } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    lastName1: '',
    lastName2: '',
    dob: '',
    email: '',
    phone: '',
    password: '',
    role: 'TURISTA'
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.token) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard-tourist');
      } else {
        alert(data.message || 'Error al registrarse');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AuthLayout 
      title="Únete a la mayor comunidad turística" 
      subtitle="Crea tu cuenta hoy y comienza a explorar o a ofrecer tus mejores experiencias en el Ecuador."
      image="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
    >
      <div className="flex items-center gap-2 mb-2 hidden md:flex text-primary">
        <Mountain className="w-8 h-8" />
        <span className="text-2xl font-display font-black text-primary-dark tracking-tighter">
          ISTPET <span className="text-primary">Turismo</span>
        </span>
      </div>
      <h2 className="text-3xl font-display font-black text-slate-800 mb-2">Crea tu cuenta</h2>
      <p className="text-slate-500 mb-8">Regístrate para comenzar tu aventura</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Primer Nombre</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" name="firstName" required className="auth-input pl-10" placeholder="Juan" onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Segundo Nombre</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" name="secondName" className="auth-input pl-10" placeholder="Andrés" onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Primer Apellido</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" name="lastName1" required className="auth-input pl-10" placeholder="Pérez" onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Segundo Apellido</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" name="lastName2" className="auth-input pl-10" placeholder="Sánchez" onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fecha Nacimiento</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="date" name="dob" required className="auth-input pl-10" onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Teléfono Móvil</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="tel" name="phone" required className="auth-input pl-10" placeholder="+593..." onChange={handleChange} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input type="email" name="email" required className="auth-input pl-12" placeholder="tu@correo.com" onChange={handleChange} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input type="password" name="password" required className="auth-input pl-12" placeholder="••••••••" onChange={handleChange} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 group"
        >
          {loading ? 'Creando cuenta...' : <>Crear cuenta <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-slate-500 text-sm">
          ¿Ya tienes una cuenta? <Link to="/login" className="text-primary font-black hover:underline">Inicia sesión</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-input {
          @apply w-full pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all;
        }
      `}</style>
    </AuthLayout>
  );
};

export default Register;
