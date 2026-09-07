import { useState } from 'react';
import { ticketService } from '../../SERVICES/ticketService';
import type { Ticket } from '../EDITMODAL/types';

export interface TicketData {
  titulo: string;
  descripcion: string;
  email: string;
  asignar: string;
  prioridad: string;
  imagenes: File[];
  columna: number;
}

export function useTicketForm(initialColumna?: number, onSuccess?: (ticket: Ticket) => void) {
  const [ticketData, setTicketData] = useState<TicketData>({
    titulo: '',
    descripcion: '',
    email: '',
    asignar: '',
    prioridad: 'media',
    imagenes: [],
    columna: initialColumna || 1
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

  const handleAsignarChange = (value: string) => {
    setTicketData((prev) => ({
      ...prev,
      asignar: value
    }));
  };

  const handlePrioridadChange = (value: string) => {
    setTicketData((prev) => ({
      ...prev,
      prioridad: value
    }));
  };

  const handleColumnaChange = (value: number) => {
    setTicketData((prev) => ({
      ...prev,
      columna: value
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
        prioridad: ticketData.prioridad,
        asignar: ticketData.asignar || undefined,
        files: ticketData.imagenes,
        columnId: ticketData.columna,
        columna: ticketData.columna,
      });

      setSuccessMessage(`¡Ticket creado con éxito! Identificador: ${nuevoTicket.identificador || nuevoTicket.id}`);
      
      // Limpiar formulario después del envío exitoso
      setTicketData({
        titulo: '',
        descripcion: '',
        email: '',
        asignar: '',
        prioridad: 'media',
        imagenes: [],
        columna: initialColumna || 1
      });

      if (onSuccess) {
        onSuccess(nuevoTicket);
      }
    } catch (err: any) {
      let msg = err.response?.data?.message || err.message || 'Error al conectar con el servidor para crear el ticket';
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          msg = detail;
        } else if (Array.isArray(detail)) {
          msg = detail
            .map((item: any) => {
              const field = item.loc ? item.loc[item.loc.length - 1] : '';
              return `${field ? field + ': ' : ''}${item.msg}`;
            })
            .join(' | ');
        }
      }

      setErrorMessage(msg);
      console.error('Error al crear ticket:', err);
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
    handleAsignarChange,
    handlePrioridadChange,
    handleColumnaChange,
    handleSubmit,
    handleVolver
  };
}