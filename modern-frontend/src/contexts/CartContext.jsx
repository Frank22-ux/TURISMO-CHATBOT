import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const addToCart = (activity) => {
    // 1. Same Host Check
    if (hostId && String(hostId) !== String(activity.id_anfitrion)) {
      if (window.confirm('Solo puedes reservar experiencias del mismo anfitrión en un solo paquete. ¿Deseas vaciar tu selección actual y añadir esta nueva experiencia?')) {
        setSelectedItems([activity]);
        setHostId(activity.id_anfitrion);
        return { success: true };
      }
      return { success: false, error: 'HOST_MISMATCH' };
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
    return { success: true };
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
    </CartContext.Provider>
  );
};
