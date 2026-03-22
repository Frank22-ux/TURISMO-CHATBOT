import { Link, useNavigate } from 'react-router-dom';
import { UserCircle, LayoutDashboard, LogOut, Menu, Mountain, Utensils } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
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
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container-wide flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-primary p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <Mountain className="text-white w-6 h-6" />
          </div>
          <span className={`text-xl font-display font-black tracking-tighter ${
            isScrolled ? 'text-primary-dark' : 'text-white'
          }`}>
            ISTPET <span className="text-primary">Turismo</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/?category=experiencias" className={`text-sm font-bold transition-colors ${
            isScrolled ? 'text-slate-600 hover:text-primary' : 'text-white/80 hover:text-white'
          }`}>Experiencias</Link>
          
          <Link to="/?category=servicios" className={`text-sm font-bold transition-colors ${
            isScrolled ? 'text-slate-600 hover:text-primary' : 'text-white/80 hover:text-white'
          }`}>Servicios</Link>

          {!user ? (
            <>
              <a href="#" className="bg-primary/10 hover:bg-primary/20 text-primary px-5 py-2 rounded-xl text-sm font-bold transition-all">
                Hazte Anfitrión
              </a>
              <Link to="/login" className={`flex items-center gap-2 text-sm font-bold ${
                isScrolled ? 'text-slate-700' : 'text-white'
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
                isScrolled ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-white'
              }`}>
                <LogOut className="w-4 h-4" /> Salir
              </button>
            </div>
          )}
        </nav>

        <button className="md:hidden text-primary">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
