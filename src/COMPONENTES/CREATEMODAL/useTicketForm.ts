import { useState, useEffect } from 'react';
import { ticketService } from '../../SERVICES/ticketService';
import { getClientEmail, setClientEmail } from '../../UTILS/storageUtils';
import type { Ticket, Frecuencia } from '../../TYPES';

export interface TicketData {
  titulo: string;
  descripcion: string;
  email: string;
  asignar: string;
  prioridad: string;
  imagenes: File[];
  columna: number;
  frecuencia?: Frecuencia;
}

export interface UseTicketFormOptions {
  initialColumna?: number;
  isUser?: boolean;
  onSuccess?: (ticket: Ticket) => void;
}

export function useTicketForm(
  options?: number | UseTicketFormOptions,
  onSuccessCallback?: (ticket: Ticket) => void
) {
  const isUser = typeof options === 'object' && options !== null ? !!options.isUser : false;
  const initialCol = typeof options === 'number' ? options : (options?.initialColumna || 1);
  const onSuccess = typeof options === 'object' && options !== null ? options.onSuccess : onSuccessCallback;

  const [ticketData, setTicketData] = useState<TicketData>(() => ({
    titulo: '',
    descripcion: '',
    email: isUser ? (getClientEmail() || '') : '',
    asignar: '',
    prioridad: 'media',
    imagenes: [],
    columna: isUser ? 1 : (initialCol || 1),
    frecuencia: undefined
  }));

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sincronizar columna inicial si cambia (al abrir modal desde otra columna)
  useEffect(() => {
    if (!isUser && initialCol) {
      setTicketData((prev) => ({
        ...prev,
        columna: initialCol
      }));
    }
  }, [initialCol, isUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const targetKey = name === 'colaborador' ? 'asignar' : name === 'columnId' ? 'columna' : name;
    setTicketData((prev) => ({
      ...prev,
      [targetKey]: targetKey === 'columna' ? Number(value) : value
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

  const handleFrecuenciaChange = (frecuencia: Frecuencia | undefined) => {
    setTicketData((prev) => ({
      ...prev,
      frecuencia
    }));
  };

  const resetForm = (newColumna?: number) => {
    setTicketData({
      titulo: '',
      descripcion: '',
      email: isUser ? (getClientEmail() || '') : '',
      asignar: '',
      prioridad: 'media',
      imagenes: [],
      columna: isUser ? 1 : (newColumna ?? (initialCol || 1)),
      frecuencia: undefined
    });
    setErrorMessage(null);
    setSuccessMessage(null);
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
        prioridad: isUser ? 'media' : ticketData.prioridad,
        asignar: isUser ? undefined : (ticketData.asignar || undefined),
        files: ticketData.imagenes,
        columnId: isUser ? 1 : ticketData.columna,
        columna: isUser ? 1 : ticketData.columna,
        frecuencia: isUser ? undefined : ticketData.frecuencia,
      });

      // Si es cliente, persistir el email en LocalStorage para futuras visitas
      if (isUser && ticketData.email) {
        setClientEmail(ticketData.email);
      }

      setSuccessMessage(
        isUser
          ? `¡Ticket creado con éxito! Tu número de seguimiento es: ${nuevoTicket.identificador || nuevoTicket.id}`
          : `¡Ticket creado con éxito! Identificador: ${nuevoTicket.identificador || nuevoTicket.id}`
      );
      
      // Limpiar formulario después del envío exitoso (manteniendo el email del cliente)
      setTicketData({
        titulo: '',
        descripcion: '',
        email: isUser ? (getClientEmail() || ticketData.email || '') : '',
        asignar: '',
        prioridad: 'media',
        imagenes: [],
        columna: isUser ? 1 : (initialCol || 1),
        frecuencia: undefined
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
            .join(', ');
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
    hasStoredEmail: isUser && Boolean(getClientEmail()),
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleAsignarChange,
    handlePrioridadChange,
    handleColumnaChange,
    handleFrecuenciaChange,
    resetForm,
    handleSubmit,
    handleVolver
  };
}