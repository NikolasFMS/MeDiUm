import { useEffect } from 'react';

let openModalCount = 0;
let savedBodyOverflow = '';

/**
 * Locks background body scroll while modal is open and optionally closes on Escape.
 */
export function useModalEffects(isOpen: boolean, onClose?: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    if (openModalCount === 0) {
      savedBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    openModalCount += 1;

    return () => {
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) {
        document.body.style.overflow = savedBodyOverflow;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}
