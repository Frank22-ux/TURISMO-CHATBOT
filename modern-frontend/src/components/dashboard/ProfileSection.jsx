import { useState, useEffect } from 'react';
import { Camera, Pencil, Save, User, Mail, Phone, Calendar, Globe, Shield, Activity, Plus, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOP_LANGUAGES = [
  'Español', 'Inglés', 'Chino Mandarín', 'Francés', 'Árabe', 
  'Bengalí', 'Portugués', 'Ruso', 'Urdu', 'Indonesio'
];

const Toast = ({ message, type = 'success', onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.9 }}
    className={`fixed bottom-10 right-10 z-[100] flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl backdrop-blur-xl border ${
      type === 'success' 
        ? 'bg-green-500/90 border-green-400 text-white' 
        : 'bg-red-500/90 border-red-400 text-white'
    }`}
  >
    {type === 'success' ? <Check className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
    <p className="font-bold text-sm tracking-tight">{message}</p>
    <button onClick={onClose} className="ml-4 hover:scale-110 transition-transform">
      <X className="w-4 h-4 opacity-60" />
    </button>
  </motion.div>
);

const ProfileSection = ({ isHost = false, onUpdateProfile }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previews, setPreviews] = useState({ avatar: null, cover: null });
  const [notification, setNotification] = useState(null);
  
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const endpoint = isHost ? '/api/host/profile' : '/api/tourist/profile';
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        // Map DB names to frontend names for consistent state
        const mappedData = {
          ...data,
          avatar: data.url_foto_perfil || '',
          cover_photo: data.url_foto_portada || '',
          anios_viajando: data.experiencia_anios || 0,
          experiencia_anios: data.experiencia_anios || 0,
          idiomas: data.idiomas || '',
          nombre: data.nombre || ''
        };
        setProfile(mappedData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isHost]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result }));
        setProfile(prev => ({ ...prev, [type === 'avatar' ? 'avatar' : 'cover_photo']: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleLanguage = (lang) => {
    const currentLanguages = profile.idiomas ? profile.idiomas.split(',').map(l => l.trim()).filter(l => l) : [];
    let updated;
    if (currentLanguages.includes(lang)) {
      updated = currentLanguages.filter(l => l !== lang);
    } else {
      updated = [...currentLanguages, lang];
    }
    setProfile({ ...profile, idiomas: updated.join(', ') });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = sessionStorage.getItem('token');
      const endpoint = isHost ? '/api/host/profile' : '/api/tourist/profile';
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(profile)
      });
      if (response.ok) {
        const updatedData = await response.json();
        setNotification({ message: '¡Perfil actualizado con éxito!', type: 'success' });
        setPreviews({ avatar: null, cover: null });
        
        // Notify parent dashboard and update session
        if (onUpdateProfile) {
          onUpdateProfile(updatedData);
        }
      } else {
        const errorData = await response.json();
        setNotification({ message: `Error: ${errorData.message}`, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Error de conexión con el servidor', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setNotification({ message: 'Por favor, completa ambos campos de contraseña', type: 'error' });
      return;
    }
    setSavingPassword(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/change-password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(passwordData)
      });
      const data = await response.json();
      if (response.ok) {
        setNotification({ message: '¡Contraseña actualizada con éxito!', type: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '' });
      } else {
        setNotification({ message: `Error: ${data.message}`, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: 'Error de conexión con el servidor', type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-primary font-bold">Cargando perfil...</div>;

  const currentLangs = profile?.idiomas ? profile.idiomas.split(',').map(l => l.trim()) : [];

  return (
    <div className="space-y-8 animate-fade-in relative">
      <AnimatePresence>
        {notification && <Toast {...notification} onClose={() => setNotification(null)} />}
      </AnimatePresence>

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-black text-slate-800">Mi Perfil</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2 group disabled:opacity-50"
        >
          {saving ? 'Guardando...' : <><Save className="w-5 h-5 group-hover:scale-110 transition-transform" /> Guardar Cambios</>}
        </button>
      </div>

      <div className="relative group">
        {/* Cover Photo */}
        <div className="h-64 rounded-[40px] bg-slate-200 overflow-hidden relative border-4 border-white shadow-sm transition-all group-hover:shadow-xl">
          <img 
            src={previews.cover || profile?.cover_photo || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"} 
            className="w-full h-full object-cover"
            alt="Cover"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <label className="bg-white/90 backdrop-blur-md p-3 rounded-full cursor-pointer hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-primary-dark" />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
            </label>
          </div>
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-16 left-12 w-32 h-32 rounded-3xl bg-white p-1.5 shadow-2xl relative">
          <div className="w-full h-full rounded-[22px] bg-primary flex items-center justify-center text-white text-4xl font-black overflow-hidden group/avatar">
            {previews.avatar || profile?.avatar ? (
              <img src={previews.avatar || profile.avatar} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              profile?.nombre ? profile.nombre[0].toUpperCase() : 'V'
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
              <label className="cursor-pointer">
                <Pencil className="w-6 h-6" />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-10">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-slate-50 shadow-sm space-y-8">
            <h3 className="text-xl font-display font-black text-slate-800 flex items-center gap-3">
              <User className="text-primary w-6 h-6" /> Información General
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={profile?.nombre || ''}
                  onChange={(e) => setProfile({...profile, nombre: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="email" 
                    value={profile?.email || ''} 
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="tel" 
                    value={profile?.telefono || ''} 
                    onChange={(e) => setProfile({...profile, telefono: e.target.value})}
                    className="w-full pl-10 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Nacimiento</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="date" 
                    value={profile?.fecha_nacimiento?.split('T')[0] || ''} 
                    onChange={(e) => setProfile({...profile, fecha_nacimiento: e.target.value})}
                    className="w-full pl-10 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{isHost ? 'Años Experiencia' : 'Años Viajando'}</label>
                <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100">
                  <Activity className="text-primary w-5 h-5" />
                  <input 
                    type="number" 
                    value={isHost ? (profile?.experiencia_anios || 0) : (profile?.anios_viajando || 0)} 
                    onChange={(e) => setProfile(isHost ? {...profile, experiencia_anios: e.target.value} : {...profile, anios_viajando: e.target.value})}
                    className="bg-transparent font-bold text-slate-700 outline-none w-12"
                  />
                  <span className="text-sm font-bold text-slate-400">años {isHost ? 'profesionales' : 'de aventura'}</span>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 block">Idiomas (Tus habilidades lingüísticas)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {TOP_LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => toggleLanguage(lang)}
                      className={`text-[9px] font-black uppercase py-2 px-1 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                        currentLangs.includes(lang) 
                          ? 'bg-primary text-white border-primary shadow-lg scale-105' 
                          : 'bg-white text-slate-400 border-slate-100 hover:border-primary/30 hover:bg-primary/5'
                      }`}
                    >
                      {lang.split(' ')[0]}
                      {currentLangs.includes(lang) && <Check className="w-2 h-2" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-slate-50 shadow-sm space-y-6">
            <h3 className="text-xl font-display font-black text-slate-800 flex items-center gap-3">
              <Globe className="text-primary w-6 h-6" /> Sobre mí
            </h3>
            <textarea 
              rows="6"
              value={profile?.biografia || ''}
              onChange={(e) => setProfile({...profile, biografia: e.target.value})}
              placeholder="Cuéntanos sobre tus aventuras favoritas..."
              className="w-full p-6 rounded-3xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none resize-none leading-relaxed text-slate-600"
            ></textarea>
          </div>

          {/* Change Password Section */}
          <div className="bg-white p-10 rounded-[40px] border border-slate-50 shadow-sm space-y-6">
            <h3 className="text-xl font-display font-black text-slate-800 flex items-center gap-3">
              <Shield className="text-primary w-6 h-6" /> Seguridad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña Actual (o Temporal)</label>
                <input 
                  type="password" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-4 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button 
              onClick={handlePasswordChange}
              disabled={savingPassword}
              className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg flex items-center gap-2 group disabled:opacity-50 mt-4"
            >
              {savingPassword ? 'Actualizando...' : <><Shield className="w-5 h-5 group-hover:scale-110 transition-transform" /> Actualizar Contraseña</>}
            </button>
          </div>
        </div>

        {/* Verification */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-primary-dark to-slate-900 p-10 rounded-[40px] text-white shadow-xl relative overflow-hidden">
            <Shield className="absolute -top-10 -right-10 w-40 h-40 opacity-10" />
            <h3 className="text-xl font-display font-black mb-6 relative z-10">{isHost ? 'Credenciales' : 'Verificación'}</h3>
            <div className="space-y-6 relative z-10">
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col items-center gap-4 group cursor-pointer hover:bg-white/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-black text-sm uppercase tracking-widest">{isHost ? 'Licencia Turística' : 'Documento Frontal'}</p>
                  <p className="text-[10px] opacity-60">{isHost ? 'Frontal' : 'Cédula o Pasaporte'}</p>
                </div>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 flex flex-col items-center gap-4 group cursor-pointer hover:bg-white/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-black text-sm uppercase tracking-widest">Documento Posterior</p>
                  <p className="text-[10px] opacity-60">Parte trasera</p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-center mt-8 opacity-40 uppercase font-black tracking-widest">
              Tu información está cifrada y segura
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ProfileSection;
