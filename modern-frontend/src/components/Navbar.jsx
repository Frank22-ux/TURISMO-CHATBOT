import { Link, useNavigate } from 'react-router-dom';
import { UserCircle, LayoutDashboard, LogOut, Menu, Mountain, Utensils, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import HostTermsModal from './HostTermsModal';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Check session
    const userData = sessionStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    setUser(null);
    navigate('/login');
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container-wide flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <Mountain className="text-white w-6 h-6" />
          </div>
          <span className={`text-xl font-display font-black tracking-tighter transition-colors ${
            isScrolled || isMobileMenuOpen ? 'text-primary-dark' : 'text-white'
          }`}>
            ISTPET <span className="text-primary">Turismo</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/?category=experiencias" className={`text-sm font-bold transition-colors ${
            isScrolled || isMobileMenuOpen ? 'text-slate-600 hover:text-primary' : 'text-white/80 hover:text-white'
          }`}>Experiencias</Link>
          
          <Link to="/?category=servicios" className={`text-sm font-bold transition-colors ${
            isScrolled || isMobileMenuOpen ? 'text-slate-600 hover:text-primary' : 'text-white/80 hover:text-white'
          }`}>Servicios</Link>

          {!user ? (
            <>
              <button 
                onClick={() => setIsTermsModalOpen(true)}
                className="bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2 rounded-xl text-sm font-bold transition-all"
              >
                Hazte Anfitrión
              </button>
              <Link to="/login" className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                isScrolled || isMobileMenuOpen ? 'text-slate-700' : 'text-white'
              }`}>
                <UserCircle className="w-5 h-5" /> Ingresar
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <Link to={user.rol === 'ANFITRION' ? '/dashboard-host' : '/dashboard-tourist'} 
                    className="flex items-center gap-2 text-primary font-bold text-sm">
                <LayoutDashboard className="w-4 h-4" /> Mi Panel
              </Link>
              <button onClick={handleLogout} className={`flex items-center gap-2 text-sm font-bold p-2 rounded-lg transition-colors ${
                isScrolled || isMobileMenuOpen ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-white'
              }`}>
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </div>
          )}
        </nav>

        <button 
          className="md:hidden text-primary p-2 -mr-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white shadow-2xl transition-all duration-300 ease-in-out border-t border-slate-100 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col p-6 gap-4">
          <Link 
            to="/?category=experiencias" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-700 font-bold text-lg border-b border-slate-50 pb-3 hover:text-primary transition-colors"
          >
            Experiencias
          </Link>
          
          <Link 
            to="/?category=servicios" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-700 font-bold text-lg border-b border-slate-50 pb-3 hover:text-primary transition-colors"
          >
            Servicios
          </Link>

          {!user ? (
            <div className="flex flex-col gap-3 pt-2">
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsTermsModalOpen(true);
                }}
                className="bg-primary/10 hover:bg-primary/20 text-primary px-5 py-3.5 rounded-xl font-bold w-full text-center transition-colors"
              >
                Hazte Anfitrión
              </button>
              <Link 
                to="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-primary hover:bg-primary-dark text-white flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold w-full transition-colors shadow-lg shadow-primary/20"
              >
                <UserCircle className="w-5 h-5" /> Ingresar
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link 
                to={user.rol === 'ANFITRION' ? '/dashboard-host' : '/dashboard-tourist'} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold w-full transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" /> Mi Panel
              </Link>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }} 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold w-full transition-colors"
              >
                <LogOut className="w-5 h-5" /> Salir
              </button>
            </div>
          )}
        </nav>
      </div>

      <HostTermsModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />
    </header>
  );
};

export default Navbar;
