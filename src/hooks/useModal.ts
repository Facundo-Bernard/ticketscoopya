import { useState } from 'react';

export interface UseModalReturn<T> {
  isOpen: boolean;
  selectedData: T | null;
  openModal: (data?: T | null) => void;
  closeModal: () => void;
}

export const useModal = <T = unknown>(initialState: boolean = false): UseModalReturn<T> => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);
  const [selectedData, setSelectedData] = useState<T | null>(null);

  const openModal = (data: T | null = null): void => {
    setSelectedData(data);
    setIsOpen(true);
  };

  const closeModal = (): void => {
    setIsOpen(false);
    setSelectedData(null);
  };

  return {
    isOpen,
    selectedData,
    openModal,
    closeModal,
  };
};

export default useModal;
