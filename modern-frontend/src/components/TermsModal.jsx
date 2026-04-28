import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, Users, Scale, ArrowRight, Mountain, Eye, Lock } from 'lucide-react';

const TermsModal = ({ isOpen, onClose, type = 'TURISTA', onAccept }) => {
  if (!isOpen) return null;

  const content = {
    TURISTA: [
      {
        icon: ShieldCheck,
        color: 'emerald',
        title: '1. Protección de Datos Personales',
        text: 'En cumplimiento con la LOPDP, tus datos personales (nombre, correo, teléfono) serán tratados exclusivamente para gestionar tus reservas, garantizar tu seguridad y enviarte comprobantes de tus transacciones. No compartiremos tu información con terceros sin tu consentimiento.'
      },
      {
        icon: Eye,
        color: 'blue',
        title: '2. Uso de la Plataforma',
        text: 'Como turista, te comprometes a proporcionar información verídica y a utilizar los servicios de ISTPET Turismo de buena fe, respetando las normativas locales y las reglas de cada anfitrión.'
      },
      {
        icon: CreditCard,
        color: 'amber',
        title: '3. Reservas y Pagos',
        text: 'Al realizar un pago, tu reserva se confirma automáticamente. Eres responsable de presentarte en el lugar y hora acordados. Las cancelaciones están sujetas a las políticas de cada experiencia.'
      },
      {
        icon: Users,
        color: 'purple',
        title: '4. Responsabilidad',
        text: 'ISTPET Turismo actúa como intermediario. Aunque validamos a nuestros anfitriones, la ejecución de la actividad es responsabilidad del proveedor del servicio.'
      }
    ],
    ANFITRION: [
      {
        icon: Lock,
        color: 'emerald',
        title: '1. Seguridad y Datos',
        text: 'Tus datos profesionales y los de tu negocio serán protegidos bajo estándares de seguridad. Te comprometes a manejar con absoluta confidencialidad los datos de los turistas que recibas.'
      },
      {
        icon: Scale,
        color: 'blue',
        title: '2. Calidad del Servicio',
        text: 'Eres responsable de la seguridad y calidad de las experiencias. Debes cumplir con los permisos legales vigentes en Ecuador para operar servicios turísticos o alimentarios.'
      },
      {
        icon: CreditCard,
        color: 'amber',
        title: '3. Pagos y Comisiones',
        text: 'La plataforma retendrá un porcentaje por gestión operativa y pasarela de pagos. Los desembolsos se realizarán tras la validación exitosa de la actividad mediante el código QR.'
      },
      {
        icon: ShieldCheck,
        color: 'purple',
        title: '4. Veracidad Informativa',
        text: 'Cualquier contenido falso o engañoso resultará en la baja inmediata del sistema y posibles acciones legales por parte de los usuarios afectados.'
      }
    ]
  };

  const currentContent = content[type] || content.TURISTA;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Mountain className="w-6 h-6" />
                <span className="font-display font-black tracking-tight">ISTPET Turismo</span>
              </div>
              <h2 className="text-2xl font-display font-black text-slate-800">Términos y Privacidad</h2>
              <p className="text-sm text-slate-500 mt-1">Acuerdo para {type === 'TURISTA' ? 'Turistas' : 'Anfitriones'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
            {currentContent.map((item, idx) => (
              <div key={idx} className="flex gap-5">
                <div className={`shrink-0 w-12 h-12 rounded-2xl bg-${item.color}-50 flex items-center justify-center text-${item.color}-600 border border-${item.color}-100`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 mb-2 uppercase text-xs tracking-widest">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-8 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-end gap-3 shrink-0">
            <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors">
              Cerrar
            </button>
            {onAccept && (
              <button 
                onClick={() => { onAccept(); onClose(); }}
                className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary hover:bg-primary-dark text-white shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                Aceptar y Continuar <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TermsModal;
