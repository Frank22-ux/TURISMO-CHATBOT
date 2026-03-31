import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 pointer-events-none z-[10000] flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ scale: 0.9, opacity: 0, x: 50, y: 0 }}
              animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, x: 50 }}
              className={`
                pointer-events-auto flex items-center gap-4 p-4 rounded-2xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.15)] 
                bg-white border w-[360px] backdrop-blur-md bg-white/95
                ${toast.type === 'success' ? 'border-emerald-500/20' : 
                  toast.type === 'error' ? 'border-red-500/20' : 'border-blue-500/20'}
              `}
            >
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                  toast.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}
              `}>
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                {toast.type === 'info' && <Info className="w-5 h-5" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-800 leading-tight truncate">{toast.message}</p>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Sistema</p>
              </div>
              
              <button 
                onClick={() => removeToast(toast.id)} 
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
