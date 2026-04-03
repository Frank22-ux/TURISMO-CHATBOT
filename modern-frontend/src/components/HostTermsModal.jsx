import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, Users, Scale, ArrowRight, Mountain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HostTermsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleAccept = () => {
    onClose();
    navigate('/register-host');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-start shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Mountain className="w-6 h-6" />
                <span className="font-display font-black tracking-tight">ISTPET Turismo</span>
              </div>
              <h2 className="text-2xl font-display font-black text-slate-800">Términos y Condiciones para Anfitriones</h2>
              <p className="text-sm text-slate-500 mt-1">Por favor lee estas políticas antes de registrarte.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 md:p-8 overflow-y-auto overflow-x-hidden flex-1 space-y-8 custom-scrollbar">
            
            {/* Sec 1 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">1. Seguridad y Calidad de la Experiencia</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Como anfitrión, te comprometes a proveer servicios turísticos o experiencias que cumplan con todos los estándares legales y de seguridad de la normativa ecuatoriana. Eres el responsable directo de la integridad física y moral de los turistas durante tus actividades.
                </p>
              </div>
            </div>

            {/* Sec 2 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">2. Política de Pagos y Comisiones</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  La plataforma procesará los pagos mediante métodos seguros. De cada reserva exitosa, se retendrá un pequeño porcentaje por gastos operativos de pasarela. Los desembolsos se realizarán periódicamente a la cuenta bancaria que asocies.
                </p>
              </div>
            </div>

            {/* Sec 3 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">3. Política de Cancelaciones</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Los anfitriones que cancelen reservas confirmadas están sujetos a penalizaciones en su visibilidad. Tras una cancelación por parte del turista, se aplicará un reembolso fijo del 30% del total de la experiencia.
                </p>
              </div>
            </div>

            {/* Sec 4 */}
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-2">4. Veracidad de la Información</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Cualquier intento de suplantación de identidad o engaño a través de fotos falsas resultará en la expulsión permanente de la plataforma ISTPET Turismo, con reserva de notificación legal.
                </p>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row justify-end gap-3 shrink-0">
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors w-full sm:w-auto"
            >
              No, cancelar
            </button>
            <button 
              onClick={handleAccept}
              className="px-6 py-3 rounded-xl font-bold bg-primary hover:bg-primary-dark text-white shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95"
            >
              De acuerdo, registrarme <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
      
    </AnimatePresence>
  );
};

export default HostTermsModal;
