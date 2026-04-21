import React, { useState, useEffect } from 'react';
import { X, FileText, Download, AlertCircle, CheckCircle, ShieldCheck, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const DocumentViewerModal = ({ isOpen, onClose, hostId, hostName, onVerify }) => {
    const [documents, setDocuments] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && hostId) {
            fetchDocuments();
        }
    }, [isOpen, hostId]);

    const fetchDocuments = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`http://localhost:3000/api/admin/hosts/${hostId}/documents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(response.data);
        } catch (error) {
            setError('Error al cargar los documentos del anfitrión');
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = () => {
        if (onVerify) {
            onVerify(hostId);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Documentos de Verificación</h2>
                                <p className="text-blue-100 text-sm">Anfitrión: {hostName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-500 font-medium">Cargando documentos...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                                <p className="text-red-500 font-medium">{error}</p>
                            </div>
                        ) : documents ? (
                            <div className="space-y-6">
                                {/* Información del Anfitrión */}
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                        Información del Anfitrión
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Nombre</p>
                                            <p className="font-medium text-gray-800">{documents.nombre}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium text-gray-800">{documents.email}</p>
                                        </div>
                                        {documents.identificacion && (
                                            <div>
                                                <p className="text-sm text-gray-500">Identificación</p>
                                                <p className="font-medium text-gray-800">{documents.identificacion}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Documentos Legales */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-indigo-600" />
                                        Documentos Legales
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Documento Frontal */}
                                        {documents.url_documento_legal_frontal ? (
                                            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-indigo-300 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-gray-800">Documento Frontal</h4>
                                                    <div className="flex gap-2">
                                                        <a
                                                            href={documents.url_documento_legal_frontal}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-100 transition-colors"
                                                            title="Ver documento"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                        <a
                                                            href={documents.url_documento_legal_frontal}
                                                            download={`documento_frontal_${hostName}.jpg`}
                                                            className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-100 transition-colors"
                                                            title="Descargar documento"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden">
                                                    <img
                                                        src={documents.url_documento_legal_frontal}
                                                        alt="Documento frontal"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12">No disponible</text></svg>';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-4">
                                                <div className="text-center py-8">
                                                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-gray-500 text-sm">Documento frontal no disponible</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Documento Posterior */}
                                        {documents.url_documento_legal_posterior ? (
                                            <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-indigo-300 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-medium text-gray-800">Documento Posterior</h4>
                                                    <div className="flex gap-2">
                                                        <a
                                                            href={documents.url_documento_legal_posterior}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-100 transition-colors"
                                                            title="Ver documento"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </a>
                                                        <a
                                                            href={documents.url_documento_legal_posterior}
                                                            download={`documento_posterior_${hostName}.jpg`}
                                                            className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-100 transition-colors"
                                                            title="Descargar documento"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden">
                                                    <img
                                                        src={documents.url_documento_legal_posterior}
                                                        alt="Documento posterior"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="12">No disponible</text></svg>';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-4">
                                                <div className="text-center py-8">
                                                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-gray-500 text-sm">Documento posterior no disponible</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Alerta de verificación */}
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-amber-800">Importante:</p>
                                            <p className="text-sm text-amber-700 mt-1">
                                                Revise cuidadosamente los documentos antes de verificar al anfitrión. 
                                                Una vez verificado, el anfitrión podrá acceder a todas las funcionalidades de la plataforma.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                            >
                                Cerrar
                            </button>
                            <button
                                onClick={handleVerify}
                                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg"
                            >
                                <CheckCircle className="w-5 h-5" />
                                {documents && (documents.url_documento_legal_frontal || documents.url_documento_legal_posterior) 
                                    ? 'Verificar Anfitrión' 
                                    : 'Verificar sin Documentos'
                                }
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DocumentViewerModal;
