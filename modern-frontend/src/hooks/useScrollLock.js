import { useEffect } from 'react';

export const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      // Guardar el overflow original por si acaso, aunque por defecto suele ser 'auto' o vacío
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isLocked]);
};
