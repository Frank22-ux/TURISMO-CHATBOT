import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, Users, Scale, ArrowRight, Mountain, Eye, Lock } from 'lucide-react';

const TermsModal = ({ isOpen, onClose, type = 'TURISTA', onAccept }) => {
  if (!isOpen) return null;

  const content = {
    TURISTA: [
      {
        icon: ShieldCheck,
        color: 'emerald',
        title: '1. PROTECCIÓN DE DATOS Y PRIVACIDAD (LOPDP)',
        text: 'En estricto cumplimiento con la Ley Orgánica de Protección de Datos Personales (LOPDP) de Ecuador, ISTPET Turismo garantiza que sus datos (nombre, identificación, contacto) serán tratados con protocolos de cifrado. Su información se utiliza únicamente para: a) Gestión de reservas y pagos, b) Verificación de identidad por seguridad del anfitrión, c) Emisión de comprobantes electrónicos. Usted conserva sus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) en todo momento a través de nuestro soporte técnico.'
      },
      {
        icon: Eye,
        color: 'blue',
        title: '2. PROPIEDAD INTELECTUAL Y USO DE CONTENIDOS',
        text: 'Todo el contenido visual, logotipos, algoritmos y textos presentes en la plataforma son propiedad exclusiva de ISTPET Turismo o sus licenciantes. El usuario se compromete a no reproducir, extraer o utilizar comercialmente la información de las experiencias sin autorización previa. Cualquier uso indebido de la marca resultará en acciones legales bajo la normativa de propiedad intelectual vigente.'
      },
      {
        icon: CreditCard,
        color: 'amber',
        title: '3. SEGURIDAD EN TRANSACCIONES Y PAGOS',
        text: 'Los pagos son procesados externamente por Kushki, cumpliendo con los estándares PCI-DSS de seguridad bancaria. ISTPET Turismo no almacena los números de su tarjeta de crédito o débito. Al confirmar el pago, la reserva se genera automáticamente; es responsabilidad del turista verificar que la fecha y el número de personas sean correctos antes de finalizar la transacción.'
      },
      {
        icon: Lock,
        color: 'indigo',
        title: '4. POLÍTICA DE COOKIES Y RASTREO',
        text: 'Utilizamos cookies técnicas y de sesión para mejorar su experiencia de navegación, recordar sus preferencias de búsqueda y mantener la seguridad de su sesión activa. Al aceptar estos términos, usted consiente el uso de estas tecnologías necesarias para el funcionamiento óptimo de la aplicación web.'
      },
      {
        icon: Scale,
        color: 'rose',
        title: '5. LIMITACIÓN DE RESPONSABILIDAD Y JURISDICCIÓN',
        text: 'ISTPET Turismo actúa como un conector tecnológico entre turistas y proveedores. No somos responsables por eventos de fuerza mayor, accidentes o imprevistos climáticos durante la actividad. En caso de controversia legal, las partes se someten a las leyes de la República del Ecuador y a los juzgados competentes de la ciudad de Quito.'
      }
    ],
    ANFITRION: [
      {
        icon: ShieldCheck,
        color: 'emerald',
        title: '1. RESPONSABILIDAD LEGAL Y PROTECCIÓN DE DATOS',
        text: 'El anfitrión se compromete a dar un uso ético y confidencial a los datos de los turistas recibidos. Está prohibido utilizar la información de contacto de los clientes para fines ajenos a la reserva o para marketing no autorizado. El incumplimiento de la LOPDP conlleva sanciones administrativas y la expulsión inmediata de la plataforma.'
      },
      {
        icon: Scale,
        color: 'blue',
        title: '2. CALIDAD, PERMISOS Y SEGUROS',
        text: 'Es obligación irrenunciable del anfitrión contar con todos los permisos municipales y de turismo vigentes (LUAF, RUC/RIMPE). Para actividades de aventura o riesgo, el anfitrión debe garantizar que cuenta con los seguros de accidentes y guías especializados requeridos por la ley ecuatoriana. El sistema se reserva el derecho de auditar esta documentación en cualquier momento.'
      },
      {
        icon: CreditCard,
        color: 'amber',
        title: '3. TRANSPARENCIA EN PRECIOS Y COMISIONES',
        text: 'El precio publicado debe ser final e incluir todos los impuestos de ley (IVA). La plataforma descontará automáticamente el porcentaje de comisión acordado por mantenimiento de infraestructura y pasarela de pagos. Los fondos serán liberados una vez que el turista valide su asistencia mediante el escaneo del código QR generado por el sistema.'
      },
      {
        icon: Eye,
        color: 'indigo',
        title: '4. VERACIDAD PUBLICITARIA',
        text: 'Las fotografías y descripciones de los servicios deben ser reales y actuales. El uso de imágenes con derechos de autor ajenos o que no correspondan a la experiencia ofrecida se considera fraude. Los anfitriones con bajas calificaciones persistentes o reportes de engaño serán suspendidos de forma permanente.'
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
