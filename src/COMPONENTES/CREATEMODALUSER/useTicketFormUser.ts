import { useState } from 'react';
import { ticketService } from '../../SERVICES/ticketService';
import type { Ticket } from '../EDITMODAL/types';

export interface TicketUserData {
  titulo: string;
  descripcion: string;
  email: string;
  imagenes: File[];
}

export function useTicketFormUser(onSuccess?: (ticket: Ticket) => void) {
  const [ticketData, setTicketData] = useState<TicketUserData>({
    titulo: '',
    descripcion: '',
    email: '',
    imagenes: []
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTicketData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setTicketData((prev) => ({
        ...prev,
        imagenes: [...prev.imagenes, ...newImages]
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setTicketData((prev) => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const nuevoTicket = await ticketService.createTicket({
        titulo: ticketData.titulo,
        descripcion: ticketData.descripcion,
        correo: ticketData.email,
        prioridad: 'media',
        files: ticketData.imagenes
      });

      setSuccessMessage(`¡Ticket creado con éxito! Tu número de seguimiento es: ${nuevoTicket.identificador || nuevoTicket.id}`);

      setTicketData({
        titulo: '',
        descripcion: '',
        email: '',
        imagenes: []
      });

      if (onSuccess) {
        onSuccess(nuevoTicket);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al enviar el ticket. Por favor intentá nuevamente.';
      setErrorMessage(msg);
      console.error('Error al crear ticket de usuario:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolver = () => {
    window.history.back();
  };

  return {
    ticketData,
    isSubmitting,
    errorMessage,
    successMessage,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleSubmit,
    handleVolver
  };
}