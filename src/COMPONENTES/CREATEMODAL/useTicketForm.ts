import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getClientEmail, setClientEmail } from '../../UTILS/storageUtils';
import {
  loadCreateTicketDraft,
  saveCreateTicketDraft,
  clearCreateTicketDraft,
} from '../../UTILS/ticketDraftStorage';
import type { CreateTicketInput, Ticket, Frecuencia } from '../../TYPES';
import type { AppDispatch } from '../../REDUX/store';
import { createTicket } from '../../REDUX/ticketThunks';

export interface TicketData {
  titulo: string;
  descripcion: string;
  email: string;
  asignar: string;
  prioridad: string;
  imagenes: File[];
  columna: number;
  frecuencia?: Frecuencia;
  hp_company_field?: string;
}

export interface UseTicketFormOptions {
  initialColumna?: number;
  isUser?: boolean;
  isOpen?: boolean;
  lockedEmail?: string | null;
  onSuccess?: (ticket: Ticket) => void;
}

function buildEmptyTicketData(columna: number, email: string): TicketData {
  return {
    titulo: '',
    descripcion: '',
    email,
    asignar: '',
    prioridad: 'media',
    imagenes: [],
    columna,
    frecuencia: undefined,
    hp_company_field: '',
  };
}

function hasTextDraftContent(
  data: Pick<TicketData, 'titulo' | 'descripcion' | 'email' | 'asignar' | 'prioridad' | 'columna' | 'frecuencia'>,
  baselineEmail: string,
  baselineColumna?: number,
): boolean {
  if (data.titulo.trim().length > 0) return true;
  if (data.descripcion.trim().length > 0) return true;
  if (data.asignar.trim().length > 0) return true;
  if (data.prioridad !== 'media') return true;
  if (data.frecuencia !== undefined) return true;
  if (data.email.trim() !== baselineEmail.trim()) return true;
  if (baselineColumna !== undefined && Number(data.columna) !== Number(baselineColumna)) return true;
  return false;
}

export function useTicketForm(
  options?: number | UseTicketFormOptions,
  onSuccessCallback?: (ticket: Ticket) => void
) {
  const isUser = typeof options === 'object' && options !== null ? !!options.isUser : false;
  const isOpen = typeof options === 'object' && options !== null ? options.isOpen : true;
  const lockedEmail = typeof options === 'object' && options !== null ? (options.lockedEmail?.trim() || null) : null;
  const initialCol = typeof options === 'number' ? options : (options?.initialColumna || 1);
  const onSuccess = typeof options === 'object' && options !== null ? options.onSuccess : onSuccessCallback;
  const dispatch = useDispatch<AppDispatch>();

  const [baseline, setBaseline] = useState<{ email: string; columna: number }>(() => ({
    email: getClientEmail() || '',
    columna: isUser ? 1 : (initialCol || 1),
  }));

  const [ticketData, setTicketData] = useState<TicketData>(() =>
    buildEmptyTicketData(isUser ? 1 : (initialCol || 1), getClientEmail() || '')
  );

  const [hasRecoveredDraft, setHasRecoveredDraft] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const hasUnsavedData =
    ticketData.imagenes.length > 0 ||
    hasTextDraftContent(
      ticketData,
      baseline.email,
      isUser ? undefined : baseline.columna
    );

  useEffect(() => {
    if (isUser || !isOpen || isSubmitting) return;

    const hasPersistableData = hasTextDraftContent(
      ticketData,
      baseline.email,
      hasRecoveredDraft ? undefined : baseline.columna
    );

    if (hasPersistableData) {
      saveCreateTicketDraft({
        titulo: ticketData.titulo,
        descripcion: ticketData.descripcion,
        email: ticketData.email,
        asignar: ticketData.asignar,
        prioridad: ticketData.prioridad,
        columna: ticketData.columna,
        frecuencia: ticketData.frecuencia,
      });
    } else {
      clearCreateTicketDraft();
    }
  }, [isUser, isOpen, isSubmitting, ticketData, hasRecoveredDraft, baseline]);

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

  const resetForm = useCallback((newColumna?: number) => {
    const storedEmail = getClientEmail() || '';
    const nextColumna = isUser ? 1 : (newColumna ?? (initialCol || 1));
    setBaseline({ email: storedEmail, columna: nextColumna });
    setTicketData(buildEmptyTicketData(nextColumna, storedEmail));
    setHasRecoveredDraft(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [isUser, initialCol]);

  const initSession = useCallback((newColumna?: number) => {
    const storedEmail = getClientEmail() || '';
    const nextColumna = isUser ? 1 : (newColumna ?? (initialCol || 1));
    setBaseline({ email: storedEmail, columna: nextColumna });

    if (!isUser) {
      const savedDraft = loadCreateTicketDraft();
      if (savedDraft && hasTextDraftContent(savedDraft, storedEmail)) {
        setTicketData({
          ...savedDraft,
          imagenes: [],
          hp_company_field: '',
        });
        setHasRecoveredDraft(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        return;
      }
    }

    setTicketData(buildEmptyTicketData(nextColumna, storedEmail));
    setHasRecoveredDraft(false);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [isUser, initialCol]);

  const discardDraft = useCallback((newColumna?: number) => {
    if (!isUser) {
      clearCreateTicketDraft();
    }
    resetForm(newColumna);
  }, [isUser, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const effectiveEmail = lockedEmail || ticketData.email;

    try {
      const ticketInput: CreateTicketInput = {
        titulo: ticketData.titulo,
        descripcion: ticketData.descripcion,
        correo: effectiveEmail,
        prioridad: isUser ? 'media' : ticketData.prioridad,
        asignar: isUser ? undefined : (ticketData.asignar || undefined),
        files: ticketData.imagenes,
        columnId: isUser ? 1 : ticketData.columna,
        columna: isUser ? 1 : ticketData.columna,
        frecuencia: isUser ? undefined : ticketData.frecuencia,
        hp_company_field: ticketData.hp_company_field || undefined,
        registrarSeguimiento: isUser,
      };
      const nuevoTicket = await dispatch(createTicket(ticketInput)).unwrap();

      // Persistir el email en LocalStorage para futuras creaciones (tanto usuario como panel central)
      if (effectiveEmail) {
        setClientEmail(effectiveEmail);
      }
      if (!isUser) {
        clearCreateTicketDraft();
      }

      setSuccessMessage(
        isUser
          ? `¡Ticket creado con éxito! Tu número de seguimiento es: ${nuevoTicket.identificador || nuevoTicket.id}`
          : `¡Ticket creado con éxito! Identificador: ${nuevoTicket.identificador || nuevoTicket.id}`
      );
      
      // Limpiar formulario después del envío exitoso (manteniendo el email persistido)
      const nextEmail = lockedEmail || getClientEmail() || effectiveEmail || '';
      const nextColumna = isUser ? 1 : (initialCol || 1);
      setBaseline({ email: nextEmail, columna: nextColumna });
      setTicketData(buildEmptyTicketData(nextColumna, nextEmail));
      setHasRecoveredDraft(false);

      if (onSuccess) {
        onSuccess(nuevoTicket);
      }
    } catch (err: unknown) {
      const msg = typeof err === 'string'
        ? err
        : err instanceof Error
          ? err.message
          : 'Error al conectar con el servidor para crear el ticket';
      setErrorMessage(msg);
      console.error('Error al crear ticket:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVolver = () => {
    window.history.back();
  };

  const exposedTicketData = lockedEmail
    ? { ...ticketData, email: lockedEmail }
    : ticketData;

  return {
    ticketData: exposedTicketData,
    isSubmitting,
    errorMessage,
    successMessage,
    hasStoredEmail: isUser && Boolean(lockedEmail || getClientEmail()),
    hasUnsavedData,
    hasRecoveredDraft,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleAsignarChange,
    handlePrioridadChange,
    handleColumnaChange,
    handleFrecuenciaChange,
    resetForm,
    initSession,
    discardDraft,
    handleSubmit,
    handleVolver
  };
}
