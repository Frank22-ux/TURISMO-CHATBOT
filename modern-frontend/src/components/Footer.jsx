import { useState } from 'react';
import { Mountain, Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import InfoModal from './InfoModal';


const Footer = () => {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    content: '',
    type: 'info'
  });

  const openModal = (title, content, type = 'info') => {
    setModalConfig({ isOpen: true, title, content, type });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  return (

    <footer className="bg-slate-900 text-slate-400 py-20">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Mountain className="text-primary w-8 h-8" />
              <span className="text-2xl font-display font-black text-white tracking-tighter">
                ISTPET <span className="text-primary">Turismo</span>
              </span>
            </div>
            <p className="leading-relaxed">
              La plataforma líder para descubrir y ofrecer las mejores experiencias auténticas en el corazón del Ecuador.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://facebook.com/istpetturismo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-800 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary/50 hover:scale-110 transition-all active:scale-90"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/istpetturismo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-800 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary/50 hover:scale-110 transition-all active:scale-90"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com/istpetturismo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-800 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary/50 hover:scale-110 transition-all active:scale-90"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-8">Empresa</h4>
            <ul className="space-y-4">
              <li>
                <button 
                  onClick={() => openModal('Sobre Nosotros', (
                    <div className="space-y-4 text-slate-600">
                      <p><strong>ISTPET Turismo</strong> nació de la pasión por compartir la riqueza natural y cultural de nuestro hermoso país. Somos un equipo dedicado a conectar a los viajeros con las raíces más profundas del Ecuador.</p>
                      <p>Nuestra misión es empoderar a las comunidades locales mediante el turismo responsable, asegurando que cada aventura deje una huella positiva tanto en el viajero como en el destino.</p>
                      <p>Con años de experiencia en el sector, garantizamos estándares de calidad internacionales en cada una de nuestras actividades cuidadosamente seleccionadas.</p>
                    </div>
                  ))}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-800 hover:border-primary/50 hover:bg-slate-800/50 hover:text-white transition-all text-left cursor-pointer group flex items-center justify-between"
                >
                  Sobre Nosotros
                  <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('Experiencias Únicas', (
                    <div className="space-y-4 text-slate-600">
                      <p>Desde la majestuosidad de los <strong>Andes</strong> hasta la biodiversidad de las <strong>Islas Galápagos</strong>, nuestras experiencias están diseñadas para todos los gustos:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Aventuras de alta montaña y trekking.</li>
                        <li>Inmersión cultural en comunidades ancestrales.</li>
                        <li>Expediciones fotográficas en la Amazonía.</li>
                        <li>Relajación y deportes acuáticos en la Costa.</li>
                      </ul>
                      <p>Cada experiencia es validada por expertos locales para garantizar seguridad y autenticidad.</p>
                    </div>
                  ))}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-800 hover:border-primary/50 hover:bg-slate-800/50 hover:text-white transition-all text-left cursor-pointer group flex items-center justify-between"
                >
                  Experiencias
                  <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('Nuestros Servicios', (
                    <div className="space-y-4 text-slate-600">
                      <p>Ofrecemos una plataforma integral para que tu único trabajo sea disfrutar:</p>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-3 bg-slate-50 rounded-xl"><strong>Guía Profesional:</strong> Expertos bilingües certificados.</div>
                        <div className="p-3 bg-slate-50 rounded-xl"><strong>Transporte:</strong> Unidades modernas y seguras.</div>
                        <div className="p-3 bg-slate-50 rounded-xl"><strong>Logística:</strong> Reservas de alojamiento y alimentación.</div>
                        <div className="p-3 bg-slate-50 rounded-xl"><strong>Soporte 24/7:</strong> Asistencia personalizada durante todo el viaje.</div>
                      </div>
                    </div>
                  ))}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-800 hover:border-primary/50 hover:bg-slate-800/50 hover:text-white transition-all text-left cursor-pointer group flex items-center justify-between"
                >
                  Servicios
                  <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('Nuestro Blog', (
                    <div className="space-y-4 text-slate-600">
                      <p>¡El <strong>Rincón del Viajero</strong> está llegando pronto! Aquí encontrarás:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Guías detalladas de "Qué llevar a la Amazonía".</li>
                        <li>Entrevistas con guías locales destacados.</li>
                        <li>Consejos de fotografía de naturaleza.</li>
                        <li>Ofertas exclusivas para nuestros suscriptores.</li>
                      </ul>
                      <p>Suscríbete para ser el primero en recibir nuestras historias y consejos de viaje.</p>
                    </div>
                  ))}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-800 hover:border-primary/50 hover:bg-slate-800/50 hover:text-white transition-all text-left cursor-pointer group flex items-center justify-between"
                >
                  Blog
                  <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-8">Soporte</h4>
            <ul className="space-y-4">
              <li>
                <button 
                  onClick={() => openModal('Centro de Ayuda', (
                    <div className="space-y-4 text-slate-600">
                      <p>¿Tienes dudas? Estamos aquí para ayudarte en cada paso:</p>
                      <div className="space-y-3">
                        <div className="p-4 border border-slate-100 rounded-2xl text-sm">
                          <strong>¿Cómo reservo?</strong> Selecciona tu actividad, elige la fecha y sigue los pasos de pago seguro.
                        </div>
                        <div className="p-4 border border-slate-100 rounded-2xl text-sm">
                          <strong>Cancelaciones:</strong> Ofrecemos un reembolso del 30% del total por cualquier motivo de cancelación.
                        </div>
                        <div className="p-4 border border-slate-100 rounded-2xl text-sm">
                          <strong>Seguridad:</strong> Todas nuestras actividades cuentan con seguros y protocolos de emergencia actualizados.
                        </div>
                      </div>
                    </div>
                  ))}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-800 hover:border-primary/50 hover:bg-slate-800/50 hover:text-white transition-all text-left cursor-pointer group flex items-center justify-between"
                >
                  Centro de Ayuda
                  <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('Términos de Servicio', (
                    <div className="space-y-4 text-sm text-slate-600 leading-relaxed text-left h-[300px] overflow-y-auto pr-2 no-scrollbar">
                      <p>Estos términos regulan el uso de nuestra plataforma. Al acceder, aceptas estar sujeto a las siguientes condiciones:</p>
                      <p><strong>1. Registro:</strong> El usuario es responsable de la veracidad de los datos proporcionados al momento de registrarse.</p>
                      <p><strong>2. Pagos:</strong> Utilizamos pasarelas de pago seguras y encriptadas. ISTPET no almacena datos de tarjetas de crédito.</p>
                      <p><strong>3. Responsabilidad:</strong> Aunque validamos a nuestros proveedores, el usuario reconoce que las actividades al aire libre conllevan riesgos inherentes.</p>
                      <p><strong>4. Propiedad Intelectual:</strong> Todo el contenido visual y textual es propiedad de ISTPET Turismo o sus licenciatarios.</p>
                      <p>Para más detalles, descarga el PDF completo en nuestro portal de soporte.</p>
                    </div>
                  ))}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-800 hover:border-primary/50 hover:bg-slate-800/50 hover:text-white transition-all text-left cursor-pointer group flex items-center justify-between"
                >
                  Términos de Servicio
                  <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('Política de Privacidad', (
                    <div className="space-y-4 text-sm text-slate-600 leading-relaxed text-left">
                      <p>En ISTPET Turismo, valoramos tu confianza por encima de todo. Así es como tratamos tu información:</p>
                      <ul className="list-disc list-inside space-y-2">
                        <li><strong>Mínima Recolección:</strong> Solo pedimos los datos necesarios para procesar tu reserva.</li>
                        <li><strong>Seguridad:</strong> Utilizamos encriptación de grado bancario para proteger tus datos.</li>
                        <li><strong>No Spam:</strong> Solo te contactaremos por motivos de tu reserva o si te suscribes explícitamente a nuestro boletín.</li>
                        <li><strong>Control Total:</strong> Puedes solicitar la eliminación de tus datos en cualquier momento escribiéndonos.</li>
                      </ul>
                    </div>
                  ))}
                  className="w-full px-5 py-3 rounded-2xl border border-slate-800 hover:border-primary/50 hover:bg-slate-800/50 hover:text-white transition-all text-left cursor-pointer group flex items-center justify-between"
                >
                  Política de Privacidad
                  <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </li>
            </ul>
          </div>



          {/* Contact */}
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-widest mb-8">Contacto</h4>
            <ul className="space-y-4">
              <li className="w-full px-5 py-3 rounded-2xl border border-slate-800 hover:border-primary/50 hover:bg-slate-800/50 hover:text-white transition-all text-left group flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <MapPin className="text-primary w-5 h-5 shrink-0" />
                  <span className="text-sm">Quito, Ecuador - Av. Principal</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </li>
              <li>
                <a 
                  href="tel:0995988337" 
                  className="w-full px-5 py-3 rounded-2xl border border-slate-800 hover:border-primary/50 hover:bg-slate-800/50 hover:text-white transition-all text-left group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="text-primary w-5 h-5 shrink-0" />
                    <span className="text-sm font-bold">0995988337</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a 
                  href="mailto:jose22.quezada@gmail.com" 
                  className="w-full px-5 py-3 rounded-2xl border border-slate-800 hover:border-primary/50 hover:bg-slate-800/50 hover:text-white transition-all text-left group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 max-w-[85%]">
                    <Mail className="text-primary w-5 h-5 shrink-0" />
                    <span className="text-sm truncate">jose22.quezada@gmail.com</span>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>


        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-sm">
          <p>© {new Date().getFullYear()} ISTPET Turismo. Todos los derechos reservados.</p>
        </div>
      </div>

      <InfoModal 
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        content={modalConfig.content}
        type={modalConfig.type}
      />
    </footer>

  );
};

export default Footer;
