import React, { useState, useEffect } from 'react';
import { X, User, MapPin, Calendar, Star, DollarSign, AlertTriangle, ShieldCheck, Clock, CheckCircle, Search, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '../../config/api';
import axios from 'axios';

const AdminUserDetailsModal = ({ isOpen, userId, onClose }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('reservations');
    const [error, setError] = useState('');
    const [reservationSearchTerm, setReservationSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen && userId) {
            fetchUserDetails();
        } else {
            setDetails(null);
        }
    }, [isOpen, userId]);

    const fetchUserDetails = async () => {
        setLoading(true);
        setError('');
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.get(`${API_BASE}/api/admin/users/${userId}/details`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDetails(res.data);
            if (res.data.user.rol === 'ANFITRION') {
                setActiveTab('activities');
            } else {
                setActiveTab('reservations');
            }
        } catch (err) {
            console.error(err);
            setError('No se pudieron cargar los detalles del usuario.');
        } finally {
            setLoading(false);
        }
    };

    const handleFreezePayment = async (paymentId, currentIsFrozen) => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.patch(`${API_BASE}/api/admin/payments/${paymentId}/freeze`, 
                { freeze: !currentIsFrozen },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            // Actualizar el estado local
            setDetails(prev => ({
                ...prev,
                reservations: prev.reservations.map(r => 
                    r.id_pago === paymentId ? { ...r, estado_pago: res.data.estado } : r
                )
            }));
            
            alert(`Pago ${!currentIsFrozen ? 'Congelado' : 'Descongelado'} exitosamente.`);
        } catch (err) {
            console.error(err);
            alert('Error al intentar actualizar el estado del pago.');
        }
    };

    const filteredReservations = details?.reservations?.filter(res => {
        if (!reservationSearchTerm) return true;
        const term = reservationSearchTerm.toLowerCase();
        const matchesActivity = res.actividad_titulo?.toLowerCase().includes(term) || false;
        const matchesTourist = res.turista?.toLowerCase().includes(term) || false;
        const matchesHost = res.anfitrion?.toLowerCase().includes(term) || false;
        const matchesQR = res.codigo_qr_turista?.toLowerCase().includes(term) || false;
        
        return matchesActivity || matchesTourist || matchesHost || matchesQR;
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                    onClick={onClose}
                ></motion.div>
                
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl h-[85vh] relative z-10 flex flex-col overflow-hidden"
                >
                    {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-bold mt-4 animate-pulse">Cargando detalles de usuario...</p>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12">
                            <AlertTriangle className="w-12 h-12 text-danger mb-4" />
                            <p className="text-slate-600 font-bold">{error}</p>
                            <button onClick={onClose} className="mt-4 px-6 py-2 bg-slate-100 rounded-xl font-bold">Cerrar</button>
                        </div>
                    ) : details ? (
                        <>
                            {/* Header Panel */}
                            <div className="bg-slate-900 text-white p-8 flex justify-between items-start shrink-0 relative overflow-hidden">
                                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-3xl font-black shadow-inner">
                                        {details.user.nombre.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-3xl font-black tracking-tight">{details.user.nombre}</h2>
                                            {details.user.verificado && <ShieldCheck className="w-6 h-6 text-success" title="Usuario Verificado" />}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-300">
                                            <span className="flex items-center gap-1.5"><User className="w-4 h-4"/> {details.user.email}</span>
                                            {details.user.telefono && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {details.user.telefono}</span>}
                                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest text-white ${details.user.rol === 'ANFITRION' ? 'bg-secondary/50' : 'bg-primary/50'}`}>
                                                {details.user.rol}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors relative z-10">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="flex gap-2 px-8 pt-6 border-b border-slate-100 shrink-0">
                                {details.user.rol === 'ANFITRION' && (
                                    <button 
                                        onClick={() => setActiveTab('activities')}
                                        className={`px-6 py-3 font-black text-sm uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'activities' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Actividades ({details.activities?.length || 0})
                                    </button>
                                )}
                                <button 
                                    onClick={() => setActiveTab('reservations')}
                                    className={`px-6 py-3 font-black text-sm uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'reservations' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                >
                                    Reservas ({details.reservations?.length || 0})
                                </button>
                                {details.user.rol === 'TURISTA' && (
                                    <button 
                                        onClick={() => setActiveTab('reviews')}
                                        className={`px-6 py-3 font-black text-sm uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Reseñas ({details.reviews?.length || 0})
                                    </button>
                                )}
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                                {activeTab === 'activities' && details.activities && (
                                    <div className="grid grid-cols-1 gap-4">
                                        {details.activities.length === 0 ? <p className="text-slate-500 font-bold">No tiene actividades registradas.</p> : null}
                                        {details.activities.map(act => (
                                            <div key={act.id_actividad} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
                                                <div>
                                                    <h4 className="font-black text-lg text-slate-800">{act.titulo}</h4>
                                                    <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-500">
                                                        <span className={`px-2 py-1 rounded bg-slate-100 uppercase tracking-widest`}>{act.tipo}</span>
                                                        <span>${parseFloat(act.precio).toFixed(2)} USD</span>
                                                        <span>{act.vistas} Vistas</span>
                                                    </div>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase ${act.estado === 'ACTIVA' ? 'bg-success-light text-success' : 'bg-slate-100 text-slate-500'}`}>
                                                    {act.estado}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'reservations' && details.reservations && (
                                    <div className="flex flex-col gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input 
                                                type="text" 
                                                placeholder="Buscar por código QR, nombre del turista, o actividad..." 
                                                value={reservationSearchTerm}
                                                onChange={(e) => setReservationSearchTerm(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {filteredReservations.length === 0 ? <p className="text-slate-500 font-bold mt-4">No se encontraron reservaciones que coincidan con la búsqueda.</p> : null}
                                            {filteredReservations.map(res => {
                                                const isFrozen = res.estado_pago === 'CONGELADO';
                                                return (
                                                    <div key={res.id_reserva} className={`bg-white p-6 rounded-2xl border flex flex-col gap-4 shadow-sm transition-all ${isFrozen ? 'border-blue-300 bg-blue-50/30' : 'border-slate-100'}`}>
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-black text-lg text-slate-800">{res.actividad_titulo}</h4>
                                                                    {isFrozen && <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-black uppercase flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> PAGO CONGELADO</span>}
                                                                </div>
                                                                <p className="text-sm font-bold text-slate-500">
                                                                    {details.user.rol === 'ANFITRION' ? `Turista: ${res.turista}` : `Anfitrión: ${res.anfitrion}`}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xl font-black text-slate-800">${parseFloat(res.total).toFixed(2)}</p>
                                                                <span className={`text-[10px] font-black uppercase ${res.estado === 'APROBADA' || res.estado === 'COMPLETADA' ? 'text-success' : 'text-warning'}`}>
                                                                    Reserva {res.estado}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                                            <div className="flex gap-4 text-xs font-bold text-slate-400">
                                                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {new Date(res.fecha_experiencia).toLocaleDateString()}</span>
                                                                <span className="flex items-center gap-1"><User className="w-4 h-4"/> {res.cantidad_personas} Pax</span>
                                                                {res.codigo_qr_turista && <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded"><QrCode className="w-4 h-4"/> {res.codigo_qr_turista}</span>}
                                                            </div>

                                                            {/* Action to freeze payment only if it has an id_pago and user is host (admin viewing host's incoming reservations) or if admin wants to freeze it from tourist's view */}
                                                            {res.id_pago && (
                                                                <button 
                                                                    onClick={() => handleFreezePayment(res.id_pago, isFrozen)}
                                                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                                                                        isFrozen 
                                                                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                                                        : 'bg-slate-100 text-slate-500 hover:bg-danger hover:text-white'
                                                                    }`}
                                                                >
                                                                    {isFrozen ? <CheckCircle className="w-4 h-4"/> : <AlertTriangle className="w-4 h-4"/>}
                                                                    {isFrozen ? 'Descongelar Pago' : 'Congelar Pago'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && details.reviews && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {details.reviews.length === 0 ? <p className="text-slate-500 font-bold">No ha escrito reseñas.</p> : null}
                                        {details.reviews.map(rev => (
                                            <div key={`${rev.tipo}-${rev.id}`} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">
                                                            {rev.tipo === 'ACTIVITY' ? 'Hacia Actividad' : 'Hacia Anfitrión'}
                                                        </span>
                                                        <p className="font-bold text-slate-700 mt-2">{rev.destino}</p>
                                                    </div>
                                                    <div className="flex text-warning">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`w-4 h-4 ${i < rev.puntuacion ? 'fill-current' : 'text-slate-200'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-slate-500 text-sm italic line-clamp-3">"{rev.comentario}"</p>
                                                <p className="text-xs font-bold text-slate-400 mt-auto pt-4">{new Date(rev.fecha).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AdminUserDetailsModal;
