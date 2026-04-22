import React, { useEffect, useState } from 'react';
import { X, Info, CheckCircle, AlertCircle } from 'lucide-react';

const InfoModal = ({ isOpen, onClose, title, content, type = 'info' }) => {
  const [isPresented, setIsPresented] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Small delay to ensure the enter animation triggers
      const timer = setTimeout(() => setIsPresented(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsPresented(false);
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const icons = {
    info: <Info className="w-10 h-10 text-primary" />,
    success: <CheckCircle className="w-10 h-10 text-green-500" />,
    warning: <AlertCircle className="w-10 h-10 text-amber-500" />
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 transition-opacity duration-500 ease-in-out ${
        isPresented ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop with enhanced blur */}
      <div 
        className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-500 ${
          isPresented ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal Content with spring-like transform */}
      <div 
        className={`relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
          isPresented ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 translate-y-20 opacity-0'
        }`}
      >
        {/* Close Button UI */}
        <div className="absolute top-6 right-6 z-10">
          <button 
            onClick={onClose}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-800 hover:rotate-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col h-full max-h-[85vh]">
          {/* Header */}
          <div className="p-8 pb-4 flex flex-col items-center text-center">
            <div className="mb-6 p-5 bg-primary/5 rounded-[2rem] shadow-inner">
              {icons[type]}
            </div>
            <h3 className="text-3xl md:text-4xl font-display font-black text-slate-900 leading-tight">
              {title}
            </h3>
          </div>
          
          {/* Scrollable Content Body */}
          <div className="px-8 pb-4 overflow-y-auto no-scrollbar flex-grow">
            <div className="text-slate-600 text-lg leading-relaxed space-y-4 text-center md:text-left">
              {content}
            </div>
          </div>


        </div>

        {/* Dynamic bottom gradient accent */}
        <div className="h-2.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
      </div>
    </div>
  );
};

export default InfoModal;
