import { Link } from 'react-router-dom';
import { ArrowLeft, Mountain } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle, image }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 sm:p-4 md:p-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full sm:w-[95%] lg:w-[90%] xl:w-[85%] max-w-[1400px] bg-white sm:bg-white/40 backdrop-blur-2xl rounded-none sm:rounded-[40px] shadow-2xl overflow-hidden border-0 sm:border border-white/20 flex flex-col md:flex-row min-h-screen sm:min-h-[700px]">
        {/* Left Side - Image/Hero */}
        <div className="md:w-5/12 relative hidden md:block">
          <img 
            src={image || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"} 
            className="absolute inset-0 w-full h-full object-cover"
            alt="Auth Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/40 to-transparent"></div>
          <div className="absolute inset-0 p-12 flex flex-col justify-between text-white">
            <Link to="/" className="flex items-center gap-2 font-bold hover:gap-3 transition-all">
              <ArrowLeft className="w-5 h-5" /> Volver al inicio
            </Link>
            <div>
              <h1 className="text-4xl font-display font-black mb-4 leading-tight">{title}</h1>
              <p className="text-lg opacity-80 font-light leading-relaxed">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col items-center justify-center bg-white sm:bg-transparent">
          <div className="w-[100%] xl:w-[95%] mx-auto max-w-4xl">
            <div className="flex items-center gap-2 mb-8 md:hidden mt-4">
              <Mountain className="text-primary w-8 h-8" />
              <span className="text-xl font-display font-black text-primary-dark tracking-tighter">
                ISTPET <span className="text-primary">Turismo</span>
              </span>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
