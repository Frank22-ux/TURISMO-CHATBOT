import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, CreditCard, Scale, ArrowRight, Mountain, Eye, Lock } from 'lucide-react';

const TermsModal = ({ isOpen, onClose, type = 'TURISTA', onAccept }) => {
  if (!isOpen) return null;

  const content = {
    TURISTA: [
      {
        icon: ShieldCheck,
        color: 'emerald',
        title: '1. PROTECCIÓN DE DATOS (LOPDP)',
        text: 'En cumplimiento con la LOPDP de Ecuador, ISTPET Turismo garantiza que sus datos (nombre, identificación, contacto) serán tratados con protocolos de cifrado. Su información se utiliza únicamente para: a) Gestión de reservas y pagos, b) Verificación de identidad y c) Emisión de comprobantes electrónicos.'
      },
      {
        icon: Eye,
        color: 'blue',
        title: '2. PROPIEDAD INTELECTUAL',
        text: 'Todo el contenido visual, logotipos y textos en la plataforma son propiedad exclusiva de ISTPET Turismo. El usuario se compromete a no reproducir o utilizar comercialmente la información sin autorización previa.'
      },
      {
        icon: CreditCard,
        color: 'amber',
        title: '3. SEGURIDAD EN PAGOS',
        text: 'Los pagos son procesados externamente por Kushki, cumpliendo con estándares PCI-DSS. ISTPET Turismo no almacena los números de su tarjeta de crédito o débito.'
      },
      {
        icon: Lock,
        color: 'indigo',
        title: '4. POLÍTICA DE COOKIES',
        text: 'Utilizamos cookies técnicas para mejorar su experiencia y mantener su sesión segura. Al aceptar, consiente el uso de estas tecnologías necesarias para el funcionamiento óptimo de la web.'
      },
      {
        icon: Scale,
        color: 'rose',
        title: '5. JURISDICCIÓN',
        text: 'ISTPET Turismo actúa como un conector tecnológico. En caso de controversia legal, las partes se someten a las leyes de la República del Ecuador y a los juzgados de Quito.'
      }
    ],
    ANFITRION: [
      {
        icon: ShieldCheck,
        color: 'emerald',
        title: '1. RESPONSABILIDAD LEGAL',
        text: 'El anfitrión se compromete a dar un uso ético y confidencial a los datos de los turistas. Está prohibido utilizar la información para fines ajenos a la reserva.'
      },
      {
        icon: Scale,
        color: 'blue',
        title: '2. CALIDAD Y PERMISOS',
        text: 'Es obligación del anfitrión contar con todos los permisos municipales vigentes. Para actividades de riesgo, se deben garantizar los seguros requeridos por la ley.'
      },
      {
        icon: CreditCard,
        color: 'amber',
        title: '3. TRANSPARENCIA EN PRECIOS',
        text: 'El precio debe incluir todos los impuestos (IVA). La plataforma descontará la comisión acordada por mantenimiento y pasarela de pagos.'
      },
      {
        icon: Eye,
        color: 'indigo',
        title: '4. VERACIDAD PUBLICITARIA',
        text: 'Las fotografías y descripciones deben ser reales. El uso de imágenes con derechos de autor ajenos se considera fraude y conlleva la suspensión.'
      }
    ]
  };

  const currentContent = content[type] || content.TURISTA;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative bg-white w-full max-w-3xl h-auto max-h-[85vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden border border-slate-100"
        >
          {/* Header Compacto */}
          <div className="p-8 bg-slate-50 border-b border-slate-100 shrink-0 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Mountain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-display font-black text-slate-800 leading-tight">Términos y Privacidad</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Acuerdo para {type === 'TURISTA' ? 'Turistas' : 'Anfitriones'}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 hover:bg-slate-200 rounded-full transition-all text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Compacto */}
          <div className="p-8 md:p-10 overflow-y-auto flex-1 bg-white space-y-8 scrollbar-hide">
            {currentContent.map((item, idx) => (
              <div key={idx} className="flex gap-5 items-start group">
                <div className={`shrink-0 w-12 h-12 rounded-2xl bg-${item.color}-50 flex items-center justify-center text-${item.color}-600 border border-${item.color}-100 shadow-sm group-hover:scale-105 transition-transform`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-slate-800 mb-1.5 uppercase text-[11px] tracking-widest flex items-center gap-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Compacto */}
          <div className="p-8 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
            <button 
              onClick={onClose} 
              className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all"
            >
              Cerrar
            </button>
            {onAccept && (
              <button 
                onClick={() => { onAccept(); onClose(); }}
                className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 group"
              >
                Aceptar y Continuar 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default TermsModal;
