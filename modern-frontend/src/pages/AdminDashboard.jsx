import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Activity, 
    DollarSign, 
    TrendingUp, 
    ShieldCheck, 
    AlertCircle, 
    ChevronRight, 
    Search, 
    Filter, 
    Download, 
    MoreVertical,
    Calendar,
    Clock,
    Award,
    Map as MapIcon,
    ArrowUpRight,
    Package,
    Power,
    FileText,
    Eye,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as XLSX from 'xlsx';
import DocumentViewerModal from '../components/DocumentViewerModal';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [allActivities, setAllActivities] = useState([]);
    const [financialReport, setFinancialReport] = useState([]);
    const [allReviews, setAllReviews] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [documentModal, setDocumentModal] = useState({
        isOpen: false,
        hostId: null,
        hostName: ''
    });

    // Filtros de usuario
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('TODOS');
    const [userVerifFilter, setUserVerifFilter] = useState('TODOS');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const [statsRes, usersRes, activitiesRes, financeRes, moderationRes] = await Promise.all([
                axios.get('http://localhost:3000/api/admin/stats', config),
                axios.get('http://localhost:3000/api/admin/users', config),
                axios.get('http://localhost:3000/api/admin/activities', config),
                axios.get('http://localhost:3000/api/admin/financial-report', config),
                axios.get('http://localhost:3000/api/admin/reviews', config)
            ]);
            
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setAllActivities(activitiesRes.data);
            setFinancialReport(financeRes.data);
            setAllReviews(moderationRes.data);
            
            // Reconstruct recent activity from various sources
            const activities = [
                ...(usersRes.data.slice(0, 5).map(u => ({ tipo: 'USER_REG', detalle: `Nuevo usuario: ${u.nombre}`, fecha: new Date() }))),
                ...(financeRes.data.slice(0, 5).map(p => ({ tipo: 'PAYMENT', detalle: `Pago recibido: $${p.monto_total}`, fecha: new Date() })))
            ].sort((a, b) => b.fecha - a.fecha);
            
            setRecentActivity(activities);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };



    const openDocumentModal = (userId, userName) => {
        setDocumentModal({
            isOpen: true,
            hostId: userId,
            hostName: userName
        });
    };

    const closeDocumentModal = () => {
        setDocumentModal({
            isOpen: false,
            hostId: null,
            hostName: ''
        });
    };

    const handleVerifyFromModal = async (userId) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.patch(`http://localhost:3000/api/admin/users/${userId}/verification`, { verificado: true }, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(users.map(u => u.id_usuario === userId ? { ...u, verificado: true } : u));
        } catch (error) {
            alert("Error al actualizar verificación");
        }
    };

    const toggleVerification = async (userId, currentVerif) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.patch(`http://localhost:3000/api/admin/users/${userId}/verification`, { verificado: !currentVerif }, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(users.map(u => u.id_usuario === userId ? { ...u, verificado: !currentVerif } : u));
        } catch (error) {
            alert("Error al actualizar verificación");
        }
    };

    const toggleActivityStatus = async (id, tipo, currentEstado) => {
        try {
            const token = sessionStorage.getItem('token');
            const newEstado = currentEstado === 'ACTIVA' ? 'PAUSADA' : 'ACTIVA';
            await axios.patch(`http://localhost:3000/api/admin/activities/${tipo}/${id}/status`, { estado: newEstado }, { headers: { Authorization: `Bearer ${token}` } });
            setAllActivities(allActivities.map(a => (a.id_actividad === id && a.tipo === tipo) ? { ...a, estado: newEstado } : a));
        } catch (error) {
            alert("Error al actualizar estado de la actividad");
        }
    };

    const toggleReviewVisibility = async (reviewId, tipo, currentVisible) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.patch(`http://localhost:3000/api/admin/reviews/${tipo}/${reviewId}/visibility`, { visible: !currentVisible }, { headers: { Authorization: `Bearer ${token}` } });
            setAllReviews(allReviews.map(r => r.id === reviewId ? { ...r, visible: !currentVisible } : r));
        } catch (error) {
            alert("Error al actualizar visibilidad de la reseña");
        }
    };

    const downloadFinancialReport = () => {
        // Formato estructurado de plantilla
        const wsData = [
            ["SISTEMA CENTRAL DE TURISMO INTELIGENTE"],
            ["REPORTE FINANCIERO OFICIAL"],
            [`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}`],
            [],
            ["ID Transacción", "Fecha Pago", "Monto Total ($)", "Comisión Plataforma ($)", "Cliente Turista", "Socio Anfitrión", "Detalle de Actividad", "Estado Operativo"]
        ];

        financialReport.forEach(p => {
            wsData.push([
                `TRX-${p.id_pago.toString().padStart(4, '0')}`,
                new Date().toLocaleDateString(),
                Number(parseFloat(p.monto_total).toFixed(2)),
                Number(parseFloat(p.monto_plataforma).toFixed(2)),
                p.turista,
                p.anfitrion,
                p.actividad,
                p.estado || 'COMPLETADO'
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Ajuste de ancho de columnas para máxima legibilidad
        const wscols = [
            { wch: 18 }, // ID Pago
            { wch: 15 }, // Fecha
            { wch: 15 }, // Monto
            { wch: 22 }, // Comisión
            { wch: 25 }, // Turista
            { wch: 25 }, // Anfitrión
            { wch: 40 }, // Actividad
            { wch: 18 }  // Estado
        ];
        ws['!cols'] = wscols;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte Financiero");

        XLSX.writeFile(wb, `Reporte_Oficial_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const downloadUsersReport = () => {
        const wsData = [
            ["SISTEMA CENTRAL DE TURISMO INTELIGENTE"],
            ["REPORTE DE USUARIOS REGISTRADOS"],
            [`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}`],
            [],
            ["ID Usuario", "Nombre", "Email", "Rol", "Verificado", "Estado"]
        ];

        users.forEach(u => {
            wsData.push([
                u.id_usuario,
                u.nombre,
                u.email,
                u.rol,
                u.verificado ? 'SÍ' : 'NO',
                u.estado
            ]);
        });
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Usuarios");
        XLSX.writeFile(wb, `Reporte_Usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const downloadCatalogReport = () => {
        const wsData = [
            ["SISTEMA CENTRAL DE TURISMO INTELIGENTE"],
            ["REPORTE DEL CATÁLOGO DE ACTIVIDADES"],
            [`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}`],
            [],
            ["ID Actividad", "Título", "Tipo", "Anfitrión", "Precio ($)", "Estado"]
        ];

        allActivities.forEach(act => {
            wsData.push([
                act.id_actividad,
                act.titulo,
                act.tipo === 'TURISTICA' ? 'Experiencia' : 'Servicio',
                act.anfitrion,
                Number(parseFloat(act.precio_cero || act.precio || 0).toFixed(2)),
                act.estado
            ]);
        });
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 15 }, { wch: 45 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 15 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Catálogo");
        XLSX.writeFile(wb, `Reporte_Catalogo_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const downloadOverviewReport = () => {
        const wb = XLSX.utils.book_new();

        // Sheet 1: KPIs & Summary
        const kpiData = [
            ["SISTEMA CENTRAL DE TURISMO INTELIGENTE"],
            ["ANÁLISIS GENERAL (OVERVIEW)"],
            [`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES', { dateStyle: 'long' })}`],
            [],
            ["Métrica", "Valor", "Detalle"]
        ];
        
        const localGetCount = (role) => stats?.users.find(u => u.rol === role)?.count || 0;
        const totalUsers = stats?.users.reduce((acc, curr) => acc + parseInt(curr.count), 0) || 0;
        kpiData.push(["Total Usuarios", totalUsers, `${localGetCount('TURISTA')} Turistas / ${localGetCount('ANFITRION')} Anfitriones`]);
        kpiData.push(["Ganancias Plataforma", `$${parseFloat(stats?.earnings?.total_plataforma || 0).toFixed(2)}`, `De un total de $${parseFloat(stats?.earnings?.total_bruto || 0).toFixed(2)}`]);
        kpiData.push(["Experiencias Activas", stats?.activities.find(a => a.tipo === 'Experiencias' && a.estado === 'ACTIVA')?.count || 0, "Servicios de turismo"]);
        kpiData.push(["Servicios Activos", stats?.activities.find(a => a.tipo === 'Servicios' && a.estado === 'ACTIVA')?.count || 0, "Alimentación y más"]);
        kpiData.push([]);
        kpiData.push(["Mejor Anfitrión", stats?.bestHost?.nombre || 'Ninguno', `Total generado: $${parseFloat(stats?.bestHost?.total_generado || 0).toFixed(2)}`]);

        const ws1 = XLSX.utils.aoa_to_sheet(kpiData);
        ws1['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(wb, ws1, "Resumen Global");

        // Sheet 2: Tendencias Mensuales
        const trendData = [
            ["Mes", "Nuevos Usuarios", "Nuevas Reservas"]
        ];
        
        const months = new Set([
            ...(stats?.registrationTrend?.map(t => t.mes) || []),
            ...(stats?.bookingTrend?.map(t => t.mes) || [])
        ]);

        Array.from(months).sort().forEach(mes => {
            const users = stats?.registrationTrend?.find(t => t.mes === mes)?.count || 0;
            const bookings = stats?.bookingTrend?.find(t => t.mes === mes)?.count || 0;
            trendData.push([mes, Number(users), Number(bookings)]);
        });

        const ws2 = XLSX.utils.aoa_to_sheet(trendData);
        ws2['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(wb, ws2, "Tendencias Mensuales");

        XLSX.writeFile(wb, `Analisis_General_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleLogout = () => {
        sessionStorage.clear();
        window.location.href = '/login';
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.nombre.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
                              u.email.toLowerCase().includes(userSearchTerm.toLowerCase());
        const matchesRole = userRoleFilter === 'TODOS' || u.rol === userRoleFilter;
        
        let matchesVerif = true;
        if (userVerifFilter === 'VERIFICADOS') matchesVerif = u.verificado === true;
        if (userVerifFilter === 'NO_VERIFICADOS') matchesVerif = u.verificado === false || u.verificado === null;

        return matchesSearch && matchesRole && matchesVerif;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold animate-pulse">Cargando panel de control...</p>
            </div>
        </div>
    );

    const getCount = (role) => stats?.users.find(u => u.rol === role)?.count || 0;

    const kpis = [
        { 
            label: 'Total Usuarios', 
            value: stats?.users.reduce((acc, curr) => acc + parseInt(curr.count), 0) || 0, 
            icon: Users, color: 'bg-blue-500', 
            detail: `${getCount('TURISTA')} Turistas / ${getCount('ANFITRION')} Anfitriones` 
        },
        { 
            label: 'Ganancias Plataforma', 
            value: `$${parseFloat(stats?.earnings?.total_plataforma || 0).toFixed(2)}`, 
            icon: DollarSign, color: 'bg-emerald-500', 
            detail: `De un total de $${parseFloat(stats?.earnings?.total_bruto || 0).toFixed(2)}` 
        },
        { 
            label: 'Experiencias Activas', 
            value: stats?.activities.find(a => a.tipo === 'Experiencias' && a.estado === 'ACTIVA')?.count || 0, 
            icon: Activity, color: 'bg-orange-500', 
            detail: 'Servicios de turismo' 
        },
        { 
            label: 'Servicios Activos', 
            value: stats?.activities.find(a => a.tipo === 'Servicios' && a.estado === 'ACTIVA')?.count || 0, 
            icon: Package, color: 'bg-purple-500', 
            detail: 'Alimentación y más' 
        },
    ];

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Sidebar Navigation */}
            <aside className="w-80 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen">
                <div className="p-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <ShieldCheck className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-800 leading-none">Admin Panel</h1>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 text-primary">Sistema Central</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: 'overview', label: 'Vista General', icon: TrendingUp },
                            { id: 'users', label: 'Gestión Usuarios', icon: Users },
                            { id: 'activities', label: 'Catálogo', icon: Activity },
                            { id: 'finance', label: 'Finanzas', icon: DollarSign },
                            { id: 'moderation', label: 'Moderación', icon: Award },
                            { id: 'map', label: 'Mapa Global', icon: MapIcon }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-brand transition-all duration-300 ${
                                    activeTab === item.id 
                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-2' 
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                }`}
                            >
                                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-primary' : ''}`} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-slate-50">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 text-red-500 rounded-2xl text-[11px] font-black uppercase hover:bg-red-500 hover:text-white transition-all group"
                    >
                        <Power className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                            {activeTab === 'overview' ? 'Dashboard de Control' : 
                             activeTab === 'users' ? 'Gestión de Usuarios' :
                             activeTab === 'activities' ? 'Catálogo de Actividades' :
                             activeTab === 'finance' ? 'Ganancias y Reportes' :
                             activeTab === 'moderation' ? 'Centro de Moderación' : 'Visualización Territorial'}
                        </h2>
                        <p className="text-slate-400 font-bold text-sm mt-1">Bienvenido de nuevo Administrador</p>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <div className="space-y-8">
                        {activeTab === 'overview' && (
                            <motion.div 
                                key="overview"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-end -mt-4 mb-2">
                                    <button 
                                        onClick={downloadOverviewReport} 
                                        className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <Download className="w-4 h-4" /> Exportar Análisis General
                                    </button>
                                </div>
                                {/* KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {kpis.map((kpi, idx) => (
                                        <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                                            <div className={`absolute top-0 right-0 w-32 h-32 ${kpi.color} opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
                                            <div className={`${kpi.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-${kpi.color.split('-')[1]}-200`}>
                                                <kpi.icon className="w-6 h-6" />
                                            </div>
                                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{kpi.label}</p>
                                            <h3 className="text-3xl font-black text-slate-800 mb-2">{kpi.value}</h3>
                                            <p className="text-slate-500 text-[10px] font-bold tracking-brand">{kpi.detail}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                                    {/* Monthly Trends Table */}
                                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-white to-slate-50/30">
                                            <div>
                                                <h3 className="text-xl font-black text-slate-800">Tendencia de Actividad</h3>
                                                <p className="text-slate-400 text-[11px] font-black tracking-widest uppercase mt-1">Registros y Reservas por Mes</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase"> Usuarios</div>
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase"> Reservas</div>
                                            </div>
                                        </div>
                                        <div className="p-4 flex-1 h-[300px] flex items-end justify-around gap-2 px-8 pb-8">
                                            {(() => {
                                                const maxVal = Math.max(...(stats?.registrationTrend.map(t => parseInt(t.count)) || [1]), ...(stats?.bookingTrend.map(t => parseInt(t.count)) || [1]), 5);
                                                return stats?.registrationTrend.slice(-6).map((item, idx) => {
                                                    const bookings = stats.bookingTrend.find(b => b.mes === item.mes)?.count || 0;
                                                    return (
                                                        <div key={idx} className="flex flex-col items-center gap-3 w-full group">
                                                            <div className="flex items-end gap-1.5 h-48 w-full justify-center">
                                                                <motion.div 
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: `${(item.count / maxVal) * 100}%` }}
                                                                    className="w-4 bg-blue-500 rounded-t-lg relative"
                                                                >
                                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.count} u.</div>
                                                                </motion.div>
                                                                <motion.div 
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: `${(bookings / maxVal) * 100}%` }}
                                                                    className="w-4 bg-emerald-500 rounded-t-lg relative"
                                                                >
                                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{bookings} r.</div>
                                                                </motion.div>
                                                            </div>
                                                            <div className="text-[10px] font-black text-slate-400 uppercase rotate-45 mt-2 origin-left">{new Date(item.mes + '-01').toLocaleDateString('es-ES', { month: 'short' })}</div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>

                                    {/* Sidebar: Recent Activity & Best Host */}
                                    <div className="space-y-8">
                                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                                Actividad <Clock className="w-5 h-5 text-primary" />
                                            </h3>
                                            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {recentActivity.map((act, idx) => (
                                                    <div key={idx} className="flex items-start gap-4">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                            act.tipo === 'USER_REG' ? 'bg-blue-50 text-blue-500' :
                                                            act.tipo === 'PAYMENT' ? 'bg-emerald-50 text-emerald-500' :
                                                            act.tipo === 'BOOKING' ? 'bg-orange-50 text-orange-500' :
                                                            'bg-purple-50 text-purple-500'
                                                        }`}>
                                                            {act.tipo === 'USER_REG' ? <Users className="w-4 h-4" /> : 
                                                             act.tipo === 'PAYMENT' ? <DollarSign className="w-4 h-4" /> : 
                                                             act.tipo === 'BOOKING' ? <Calendar className="w-4 h-4" /> : 
                                                             <Award className="w-4 h-4" />}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <p className="text-xs font-black text-slate-800 leading-tight mb-1 truncate">{act.detalle}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                                {new Date(act.fecha).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-indigo-600 to-primary rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                                            <Users className="absolute bottom-4 right-4 w-24 h-24 text-white/10 -rotate-12" />
                                            <div className="relative z-10">
                                                <div className="bg-white/20 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Mejor Anfitrión</div>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center font-black">
                                                        {stats?.bestHost?.nombre?.charAt(0) || '👑'}
                                                    </div>
                                                    <h4 className="text-lg font-black">{stats?.bestHost?.nombre || 'Ninguno'}</h4>
                                                </div>
                                                <p className="text-2xl font-black">${parseFloat(stats?.bestHost?.total_generado || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'users' && (
                            <motion.div 
                                key="users"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
                            >
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">Gestión de Usuarios</h3>
                                        <p className="text-slate-400 text-[11px] font-black tracking-widest uppercase mt-1">Control de acceso y perfiles</p>
                                    </div>
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <select 
                                            value={userRoleFilter} 
                                            onChange={(e) => setUserRoleFilter(e.target.value)}
                                            className="px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 focus:ring-2 ring-primary/20 cursor-pointer"
                                        >
                                            <option value="TODOS">Todos los roles</option>
                                            <option value="TURISTA">Turistas</option>
                                            <option value="ANFITRION">Anfitriones</option>
                                            <option value="ADMIN">Administradores</option>
                                        </select>
                                        <select 
                                            value={userVerifFilter} 
                                            onChange={(e) => setUserVerifFilter(e.target.value)}
                                            className="px-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 focus:ring-2 ring-primary/20 cursor-pointer"
                                        >
                                            <option value="TODOS">Todas las verificaciones</option>
                                            <option value="VERIFICADOS">Verificados</option>
                                            <option value="NO_VERIFICADOS">No Verificados</option>
                                        </select>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="text" 
                                                placeholder="Buscar usuario (nombre, email)..." 
                                                value={userSearchTerm}
                                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 ring-primary/20 w-80" 
                                            />
                                        </div>
                                        <button 
                                            onClick={downloadUsersReport} 
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            <Download className="w-4 h-4" /> EXCEL
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Verif.</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredUsers.length === 0 ? (
                                                <tr><td colSpan="5" className="text-center py-8 text-slate-400 font-bold">No se encontraron usuarios</td></tr>
                                            ) : filteredUsers.map((u) => (
                                                <tr key={u.id_usuario} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                                                                {u.nombre.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-slate-800">{u.nombre}</p>
                                                                <p className="text-xs text-slate-400 font-bold">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-sm font-black text-slate-600">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase ${u.rol === 'ANFITRION' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                            {u.rol}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {u.rol === 'ANFITRION' ? (
                                                            <div className="flex items-center gap-2">
                                                                {u.verificado ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="px-3 py-1.5 bg-emerald-50 text-emerald-500 rounded-lg flex items-center gap-2 shadow-md shadow-emerald-200">
                                                                            <ShieldCheck className="w-4 h-4" />
                                                                            <span className="text-[10px] font-black uppercase">Verificado</span>
                                                                        </div>
                                                                        <button 
                                                                            onClick={() => toggleVerification(u.id_usuario, u.verificado)}
                                                                            title="Quitar verificación"
                                                                            className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                                        >
                                                                            <X className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button 
                                                                        onClick={() => openDocumentModal(u.id_usuario, u.nombre)}
                                                                        title="Ver Documentos para Verificar"
                                                                        className="w-auto px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all bg-indigo-50 text-indigo-500 hover:bg-indigo-500 hover:text-white border border-indigo-200"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        <span className="text-[10px] font-black uppercase">Verificar</span>
                                                                    </button>
                                                                )}
                                                                
                                                                {u.url_documento_legal_frontal && (
                                                                    <a 
                                                                        href={u.url_documento_legal_frontal} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        title="Ver Documento Legal"
                                                                        className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                                                                    >
                                                                        <FileText className="w-4 h-4" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ) : <span className="text-slate-200 font-black">-</span>}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${u.estado === 'ACTIVO' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${u.estado === 'ACTIVO' ? 'bg-emerald-500 animate-pulse' : 'bg-red-50'}`}></div>
                                                            {u.estado}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'activities' && (
                            <motion.div 
                                key="activities"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
                            >
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">Catálogo de Actividades</h3>
                                        <p className="text-slate-400 text-[11px] font-black tracking-widest uppercase mt-1">Control de calidad y disponibilidad</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={downloadCatalogReport} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-orange-200 hover:scale-105 active:scale-95 transition-all">
                                            <Download className="w-4 h-4" /> EXCEL
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase">
                                            <Filter className="w-4 h-4" /> Tipo
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Actividad</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Anfitrión</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {allActivities.map((act) => (
                                                <tr key={`${act.tipo}-${act.id_actividad}`} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-8 py-5">
                                                        <div>
                                                            <p className="text-sm font-black text-slate-800">{act.titulo}</p>
                                                            <p className="text-xs text-slate-400 font-bold">ID: #{act.id_actividad}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${act.tipo === 'TURISTICA' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}`}>
                                                            {act.tipo === 'TURISTICA' ? 'Experiencia' : 'Servicio'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-sm font-bold text-slate-600">
                                                        {act.anfitrion}
                                                    </td>
                                                    <td className="px-6 py-5 text-sm font-black text-slate-800">
                                                        ${parseFloat(act.precio_cero || act.precio || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase ${act.estado === 'ACTIVA' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                            {act.estado}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <button 
                                                            onClick={() => toggleActivityStatus(act.id_actividad, act.tipo, act.estado)}
                                                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                                                act.estado === 'ACTIVA' ? 'bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                                            }`}
                                                        >
                                                            {act.estado === 'ACTIVA' ? 'Pausar' : 'Activar'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'finance' && (
                            <motion.div 
                                key="finance"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
                            >
                                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">Reporte Financiero Detallado</h3>
                                        <p className="text-slate-400 text-[11px] font-black tracking-widest uppercase mt-1">Historial de transacciones y comisiones</p>
                                    </div>
                                    <button 
                                        onClick={downloadFinancialReport}
                                        className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <ArrowUpRight className="w-4 h-4" /> Exportar a EXCEL
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/50">
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Pago</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto Total</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Comisión</th>
                                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Terceros / Detalle</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {Array.isArray(financialReport) && financialReport.length > 0 ? financialReport.map((p) => (
                                                <tr key={p.id_pago} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5 text-sm font-black text-slate-400">#{p.id_pago}</td>
                                                    <td className="px-6 py-5 text-sm font-black text-slate-800">${parseFloat(p.monto_total).toFixed(2)}</td>
                                                    <td className="px-6 py-5 text-sm font-black text-emerald-500">${parseFloat(p.monto_plataforma).toFixed(2)}</td>
                                                    <td className="px-6 py-5">
                                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">{p.estado}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <p className="text-xs font-black text-slate-800">{p.turista}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[200px]">{p.actividad}</p>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="py-20 text-center text-slate-400 font-bold">No hay transacciones financieras registradas.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'moderation' && (
                            <motion.div 
                                key="moderation"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
                            >
                                <div className="p-8 border-b border-slate-50">
                                    <h3 className="text-xl font-black text-slate-800">Moderación de Calificaciones</h3>
                                    <p className="text-slate-400 text-[11px] font-black tracking-widest uppercase mt-1">Gestión de reseñas y reputación</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                                    {Array.isArray(allReviews) && allReviews.length > 0 ? allReviews.map((rev) => (
                                        <div key={rev.id} className={`p-6 rounded-3xl border transition-all ${rev.visible ? 'bg-white border-slate-100' : 'bg-slate-50 border-slate-200'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Award key={i} className={`w-3 h-3 ${i < rev.puntuacion ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                                    ))}
                                                </div>
                                                <button 
                                                    onClick={() => toggleReviewVisibility(rev.id, rev.tipo, rev.visible)}
                                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${rev.visible ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                                >
                                                    {rev.visible ? 'Ocultar' : 'Mostrar'}
                                                </button>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700 italic mb-4">"{rev.comentario}"</p>
                                            <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500">{rev.autor.charAt(0)}</div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 leading-none mb-1">{rev.autor}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">Destino: {rev.destino}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-20 text-center">
                                            <p className="text-slate-400 font-bold">No hay reseñas para moderar en este momento.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'map' && (
                            <motion.div 
                                key="map"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-6"
                            >
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex justify-between items-center bg-gradient-to-r from-white to-slate-50/50">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-800">Mapa de Alcance Territorial</h3>
                                        <p className="text-slate-400 text-[11px] font-black tracking-widest uppercase mt-1">Ubicación de todas las experiencias y servicios</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase">
                                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div> En Vivo
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[600px] rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 border-8 border-white relative">
                                    <Map
                                        initialViewState={{
                                            longitude: -78.5249,
                                            latitude: -0.2295,
                                            zoom: 10
                                        }}
                                        style={{ width: '100%', height: '100%' }}
                                        mapStyle="mapbox://styles/mapbox/streets-v12"
                                        mapboxAccessToken={MAPBOX_TOKEN}
                                    >
                                        <NavigationControl position="top-right" />
                                        <FullscreenControl position="top-right" />

                                        {allActivities.map((act) => {
                                            // Generar un pequeño desplazamiento determinista para que no se superpongan exactamente
                                            const indexOffset = act.id_actividad + (act.tipo === 'TURISTICA' ? 10 : 0);
                                            const jitterLng = (indexOffset % 5) * 0.02 * (indexOffset % 2 === 0 ? 1 : -1);
                                            const jitterLat = (indexOffset % 3) * 0.02 * (indexOffset % 4 === 0 ? 1 : -1);
                                            
                                            return (
                                            <Marker
                                                key={act.id_actividad}
                                                longitude={parseFloat(act.longitud) + jitterLng}
                                                latitude={parseFloat(act.latitud) + jitterLat}
                                                anchor="bottom"
                                                onClick={e => {
                                                    e.originalEvent.stopPropagation();
                                                    setSelectedLocation(act);
                                                }}
                                            >
                                                <div className={`p-2 rounded-xl shadow-lg cursor-pointer transform hover:scale-110 transition-transform ${act.tipo === 'TURISTICA' ? 'bg-orange-500 text-white' : 'bg-purple-500 text-white'}`}>
                                                    {act.tipo === 'TURISTICA' ? <Activity className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                                </div>
                                            </Marker>
                                        )})}

                                        {selectedLocation && (
                                            <Popup
                                                longitude={parseFloat(selectedLocation.longitud)}
                                                latitude={parseFloat(selectedLocation.latitud)}
                                                anchor="top"
                                                onClose={() => setSelectedLocation(null)}
                                                closeButton={false}
                                                className="rounded-2xl overflow-hidden"
                                            >
                                                <div className="p-4 min-w-[200px]">
                                                    <p className="text-[10px] font-black text-primary uppercase mb-1">{selectedLocation.tipo}</p>
                                                    <h4 className="font-black text-slate-800 mb-2">{selectedLocation.titulo}</h4>
                                                    <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                                                        <span className="text-xs font-bold text-slate-500">{selectedLocation.anfitrion}</span>
                                                        <span className="text-sm font-black text-slate-800">${parseFloat(selectedLocation.precio || selectedLocation.precio_cero || 0).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </Popup>
                                        )}
                                    </Map>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </AnimatePresence>
            </main>

            {/* Modal de Visualización de Documentos */}
            <DocumentViewerModal
                isOpen={documentModal.isOpen}
                onClose={closeDocumentModal}
                hostId={documentModal.hostId}
                hostName={documentModal.hostName}
                onVerify={handleVerifyFromModal}
            />
        </div>
    );
};

export default AdminDashboard;
