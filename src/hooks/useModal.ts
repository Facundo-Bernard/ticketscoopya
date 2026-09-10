import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseModalReturn<T> {
  isOpen: boolean;
  isClosing: boolean;
  selectedData: T | null;
  openModal: (data?: T | null) => void;
  closeModal: () => void;
}

export const useModal = <T = unknown>(
  initialState: boolean = false,
  closeDelayMs: number = 200
): UseModalReturn<T> => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<T | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isClosingRef = useRef<boolean>(false);

  const openModal = useCallback((data: T | null = null): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isClosingRef.current = false;
    setIsClosing(false);
    setSelectedData(data);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback((): void => {
    if (isClosingRef.current) return;
    setIsOpen((prevOpen) => {
      if (!prevOpen) return false;
      isClosingRef.current = true;
      setIsClosing(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        isClosingRef.current = false;
        setIsOpen(false);
        setIsClosing(false);
        setSelectedData(null);
        timeoutRef.current = null;
      }, closeDelayMs);
      return true;
    });
  }, [closeDelayMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isOpen,
    isClosing,
    selectedData,
    openModal,
    closeModal,
  };
};

export default useModal;

