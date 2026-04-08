import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [hostId, setHostId] = useState(null);

  // Load from session storage on init
  useEffect(() => {
    const savedCart = sessionStorage.getItem('cart_selection');
    if (savedCart) {
      const { items, hId } = JSON.parse(savedCart);
      setSelectedItems(items);
      setHostId(hId);
    }
  }, []);

  // Save to session storage
  useEffect(() => {
    sessionStorage.setItem('cart_selection', JSON.stringify({ items: selectedItems, hId: hostId }));
  }, [selectedItems, hostId]);

  const [pendingActivity, setPendingActivity] = useState(null);

  const addToCart = (activity, onSuccess = null) => {
    // 1. Same Host Check
    if (hostId && String(hostId) !== String(activity.id_anfitrion)) {
      setPendingActivity({ activity, onSuccess });
      return { success: false, error: 'HOST_MISMATCH_PENDING' };
    }

    // 2. Conflict Check (Overlap)
    const hasConflict = selectedItems.some(item => {
      // Logic for overlap check (if same day)
      // Assuming activities have date and time slots
      // If we don't have the date yet, we can't fully check overlap 
      // but we can check for duplicate IDs
      return String(item.id) === String(activity.id);
    });

    if (hasConflict) {
      return { success: false, error: 'DUPLICATE' };
    }

    setSelectedItems([...selectedItems, activity]);
    if (!hostId) setHostId(activity.id_anfitrion);
    if (onSuccess) onSuccess();
    return { success: true };
  };

  const confirmHostOverride = () => {
    if (pendingActivity) {
      setSelectedItems([pendingActivity.activity]);
      setHostId(pendingActivity.activity.id_anfitrion);
      if (pendingActivity.onSuccess) pendingActivity.onSuccess();
      setPendingActivity(null);
    }
  };

  const cancelHostOverride = () => {
    setPendingActivity(null);
  };

  const removeFromCart = (activityId) => {
    const updated = selectedItems.filter(item => String(item.id) !== String(activityId));
    setSelectedItems(updated);
    if (updated.length === 0) setHostId(null);
  };

  const clearCart = () => {
    setSelectedItems([]);
    setHostId(null);
  };

  const checkConflicts = (activitiesWithDates) => {
    // activitiesWithDates is an array of { activity, date }
    for (let i = 0; i < activitiesWithDates.length; i++) {
      for (let j = i + 1; j < activitiesWithDates.length; j++) {
        const a = activitiesWithDates[i];
        const b = activitiesWithDates[j];
        
        if (a.date === b.date) {
          // Compare times
          // Assuming format "HH:MM"
          const aStart = a.activity.hora_inicio;
          const aEnd = a.activity.hora_fin;
          const bStart = b.activity.hora_inicio;
          const bEnd = b.activity.hora_fin;

          if ((aStart < bEnd) && (bStart < aEnd)) {
            return { conflict: true, a: a.activity.titulo, b: b.activity.titulo };
          }
        }
      }
    }
    return { conflict: false };
  };

  return (
    <CartContext.Provider value={{ 
      selectedItems, 
      hostId, 
      addToCart, 
      removeFromCart, 
      clearCart,
      checkConflicts 
    }}>
      {children}

      <AnimatePresence>
        {pendingActivity && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }} 
               className="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm"
               onClick={cancelHostOverride}
             />
             <motion.div
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center border-2 border-amber-100"
             >
                <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                   <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-primary-dark mb-4 leading-tight">¿Cambiar Anfitrión?</h3>
                <p className="text-slate-500 font-medium mb-8 text-sm">
                   Solo puedes separar experiencias de <span className="font-bold text-slate-700">un mismo anfitrión</span> por paquete. Si continúas, <span className="font-bold text-red-500">se vaciará tu carrito actual</span> y se añadirá esta nueva experiencia.
                </p>
                <div className="flex gap-4 w-full">
                   <button 
                     onClick={cancelHostOverride}
                     className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-95"
                   >
                     Cancelar
                   </button>
                   <button 
                     onClick={confirmHostOverride}
                     className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95"
                   >
                     Sí, Cambiar
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
};
