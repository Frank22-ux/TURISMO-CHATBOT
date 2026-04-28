import { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, ArrowRight, Mountain, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../components/AuthLayout';
import PhoneInputWithCountry from '../components/PhoneInputWithCountry';
import TermsModal from '../components/TermsModal';
import { ShieldCheck as ShieldIcon } from 'lucide-react';

const Toast = ({ message, type = 'error', onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.9 }}
    className={`fixed bottom-10 right-10 z-[100] flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl backdrop-blur-xl border ${
      type === 'success' 
        ? 'bg-success/90 border-success text-white' 
        : 'bg-danger/90 border-danger text-white'
    }`}
  >
    {type === 'success' ? <Check className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
    <p className="font-bold text-sm tracking-tight">{message}</p>
    <button onClick={onClose} className="ml-4 hover:scale-110 transition-transform">
      <X className="w-4 h-4 opacity-60" />
    </button>
  </motion.div>
);

const RegisterHost = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    lastName1: '',
    lastName2: '',
    dob: '',
    email: '',
    phone: '',
    role: 'ANFITRION'
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPhoneValid) {
      setNotification({ message: 'Por favor, ingresa un número de teléfono válido antes de continuar.', type: 'error' });
      return;
    }

    if (!acceptedTerms) {
      setNotification({ message: 'Debes aceptar los términos y condiciones para registrarte como anfitrión.', type: 'error' });
      return;
    }

    setLoading(true);

    const payload = {
      nombre: `${formData.firstName} ${formData.secondName || ''} ${formData.lastName1} ${formData.lastName2 || ''}`.replace(/\s+/g, ' ').trim(),
      email: formData.email,
      telefono: formData.phone,
      fecha_nacimiento: formData.dob,
      rol: formData.role
    };

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.token) {
        setNotification({ message: '¡Registro exitoso! Revisa tu correo electrónico para obtener tu contraseña de acceso.', type: 'success' });
        setTimeout(() => navigate('/login'), 4000);
      } else {
        setNotification({ message: data.message || 'Error al registrarse', type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Error de conexión con el servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {notification && <Toast key="host-notif" {...notification} onClose={() => setNotification(null)} />}
      </AnimatePresence>
      <AuthLayout 
        title="Promueve tus servicios al mundo" 
        subtitle="Publica experiencias turísticas o servicios alimentarios en nuestra gran comunidad."
        image="https://images.unsplash.com/photo-1542259009477-d625272157b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
      >
      <div className="flex items-center gap-2 mb-2 hidden md:flex text-primary">
        <Mountain className="w-8 h-8" />
        <span className="text-2xl font-display font-black text-primary-dark tracking-tighter">
          ISTPET <span className="text-primary">Turismo</span>
        </span>
      </div>
      <h2 className="text-3xl font-display font-black text-slate-800 mb-2">Registro de Anfitrión</h2>
      <p className="text-slate-500 mb-8">Ingresa tus datos personales para crear tu perfil de anfitrión</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Primer Nombre</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" name="firstName" required className="auth-input" placeholder="Juan" onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Segundo Nombre</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" name="secondName" className="auth-input" placeholder="Andrés" onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Primer Apellido</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" name="lastName1" required className="auth-input" placeholder="Pérez" onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Segundo Apellido</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="text" name="lastName2" className="auth-input" placeholder="Sánchez" onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Fecha Nacimiento</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input type="date" name="dob" required className="auth-input" onChange={handleChange} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Teléfono Móvil</label>
            <PhoneInputWithCountry 
              value={formData.phone} 
              onChange={handleChange} 
              onValidationChange={setIsPhoneValid}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Correo Electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input type="email" name="email" required className="auth-input" placeholder="tu-empresa@correo.com" onChange={handleChange} />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 transition-all cursor-pointer group" onClick={() => setAcceptedTerms(!acceptedTerms)}>
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${acceptedTerms ? 'bg-primary border-primary' : 'bg-white border-slate-200 group-hover:border-primary/50'}`}>
            {acceptedTerms && <Check className="w-4 h-4 text-white" />}
          </div>
          <div className="flex-1">
             <p className="text-[11px] font-bold text-slate-500 leading-tight">
               Como anfitrión, acepto los <button type="button" onClick={(e) => { e.stopPropagation(); setShowTerms(true); }} className="text-primary hover:underline font-black">Términos, Condiciones</button> y la <button type="button" onClick={(e) => { e.stopPropagation(); setShowTerms(true); }} className="text-primary hover:underline font-black">Política de Protección de Datos</button> del servicio.
             </p>
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            type="submit" 
            disabled={loading || !acceptedTerms || (!isPhoneValid && formData.phone.length > 0)}
            className={`px-10 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/30 transform hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 group ${(loading || !acceptedTerms || (!isPhoneValid && formData.phone.length > 0)) ? 'opacity-70 cursor-not-allowed grayscale' : ''}`}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta de anfitrión'}
          </button>
        </div>
      </form>

      <TermsModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        type="ANFITRION" 
        onAccept={() => setAcceptedTerms(true)}
      />

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-slate-500 text-sm">
          ¿Ya tienes una cuenta? <Link to="/login" className="text-primary font-black hover:underline">Inicia sesión</Link>
        </p>
        <p className="text-slate-500 text-sm mt-3">
          ¿Solamente quieres viajar? <Link to="/register" className="text-primary font-black hover:underline">Registro de Turista</Link>
        </p>
      </div>

    </AuthLayout>
    </>
  );
};

export default RegisterHost;
