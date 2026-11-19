import { useState, useMemo, useEffect, useCallback } from 'react';
import { normalizeColaboradores, type Ticket, type Frecuencia } from '../../../TYPES';
import type { TicketImageChanges } from '../../../SERVICES/ticketService';
import {
  loadEditTicketDraft,
  saveEditTicketDraft,
  clearEditTicketDraft,
} from '../../../UTILS/ticketDraftStorage';

export interface TicketEditFormData {
  titulo: string;
  descripcion: string;
  estado: string;
  colaborador: string;
  prioridad: string;
  columnId: number;
  frecuencia?: Frecuencia | null;
}

function buildInitialFormData(ticket: Ticket | null): TicketEditFormData {
  if (!ticket) {
    return {
      titulo: '',
      descripcion: '',
      estado: 'abierto',
      colaborador: '',
      prioridad: 'media',
      columnId: 1,
      frecuencia: undefined,
    };
  }
  const colVal = ticket.columnId ?? ticket.columna ?? 1;
  const colNum = typeof colVal === 'number' ? colVal : isNaN(Number(colVal)) ? 1 : Number(colVal);
  return {
    titulo: ticket.titulo || '',
    descripcion: ticket.descripcion || '',
    estado: ticket.estado || 'abierto',
    colaborador: (ticket.colaboradores && ticket.colaboradores.length > 0 ? ticket.colaboradores.join(', ') : ticket.colaborador) || '',
    prioridad: ticket.prioridad || 'media',
    columnId: colNum,
    frecuencia: ticket.frecuencia || undefined,
  };
}

function hasEditFormChanges(current: TicketEditFormData, initial: TicketEditFormData): boolean {
  if (current.titulo !== initial.titulo) return true;
  if (current.descripcion !== initial.descripcion) return true;
  if ((current.estado || '').toLowerCase() !== (initial.estado || '').toLowerCase()) return true;
  if ((current.prioridad || '').toLowerCase() !== (initial.prioridad || '').toLowerCase()) return true;
  if (Number(current.columnId) !== Number(initial.columnId)) return true;

  const currentCols = normalizeColaboradores(current.colaborador).join(',');
  const initialCols = normalizeColaboradores(initial.colaborador).join(',');
  if (currentCols !== initialCols) return true;

  const currentFreq = current.frecuencia ?? null;
  const initialFreq = initial.frecuencia ?? null;
  if (JSON.stringify(currentFreq) !== JSON.stringify(initialFreq)) return true;

  return false;
}

export function useTicketEdit(
  ticket: Ticket | null,
  onSave?: (updatedTicket: Ticket, imageChanges: TicketImageChanges) => void | Promise<void>
) {
  const initialData = useMemo(() => buildInitialFormData(ticket), [ticket]);

  const [initialState] = useState<{ data: TicketEditFormData; recovered: boolean }>(() => {
    const base = buildInitialFormData(ticket);
    if (!ticket?.id) {
      return { data: base, recovered: false };
    }
    const savedDraft = loadEditTicketDraft(ticket.id);
    if (savedDraft && hasEditFormChanges(savedDraft, base)) {
      return { data: savedDraft, recovered: true };
    }
    return { data: base, recovered: false };
  });

  const [formData, setFormData] = useState<TicketEditFormData>(initialState.data);
  const [hasRecoveredDraft, setHasRecoveredDraft] = useState<boolean>(initialState.recovered);
  const [existingImages, setExistingImages] = useState<string[]>(() => ticket?.imagenes || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasTextChanges = hasEditFormChanges(formData, initialData);
  const isDirty = hasTextChanges || newImages.length > 0 || removedImageIds.length > 0;

  useEffect(() => {
    if (!ticket?.id || isSaving) return;

    if (hasTextChanges) {
      saveEditTicketDraft(ticket.id, formData);
    } else {
      clearEditTicketDraft(ticket.id);
    }
  }, [ticket?.id, isSaving, hasTextChanges, formData]);

  const resetToOriginal = useCallback(() => {
    if (ticket?.id) {
      clearEditTicketDraft(ticket.id);
    }
    setFormData(buildInitialFormData(ticket));
    setExistingImages(ticket?.imagenes || []);
    setNewImages([]);
    setRemovedImageIds([]);
    setHasRecoveredDraft(false);
    setErrorMessage(null);
  }, [ticket]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'columnId' ? Number(value) : value
    }));
  };

  const handleFrecuenciaChange = (frecuencia: Frecuencia | undefined): void => {
    setFormData((prev) => ({ ...prev, frecuencia }));
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files) {
      setNewImages((current) => [...current, ...Array.from(files)]);
      e.target.value = '';
    }
  };

  const handleImageRemove = (idx: number): void => {
    if (idx >= existingImages.length) {
      const newImageIndex = idx - existingImages.length;
      setNewImages((current) => current.filter((_, index) => index !== newImageIndex));
      return;
    }

    const imageUrl = existingImages[idx];
    const fileId = imageUrl.match(/\/files\/([^/?#]+)/)?.[1] || (imageUrl.length === 24 && !imageUrl.includes('/') ? imageUrl : null);
    if (!fileId) {
      setErrorMessage('No se pudo identificar la imagen para eliminarla.');
      return;
    }

    setExistingImages((current) => current.filter((_, index) => index !== idx));
    setRemovedImageIds((current) => current.includes(fileId) ? current : [...current, fileId]);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!ticket) return;

    setIsSaving(true);
    setErrorMessage(null);
    const now = new Date().toISOString();
    const cols = normalizeColaboradores(formData.colaborador);

    const ticketModificado: Ticket = {
      ...ticket,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      estado: formData.estado,
      prioridad: formData.prioridad,
      colaborador: cols.join(', '),
      colaboradores: cols,
      columnId: formData.columnId,
      columna: formData.columnId,
      frecuencia: formData.frecuencia,
      imagenes: existingImages,
      fechaModificacion: now,
      fechaCierre: formData.estado === 'cerrado' || formData.estado === 'resuelto' ? now : null
    };

    try {
      await onSave?.(ticketModificado, {
        newFiles: newImages,
        removedFileIds: removedImageIds,
      });
      clearEditTicketDraft(ticket.id);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: unknown; message?: string } }; message?: string };
      const detail = errorObj?.response?.data?.detail;
      const msg =
        typeof err === 'string'
          ? err
          : detail
            ? (Array.isArray(detail)
                ? detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(', ')
                : String(detail))
            : errorObj?.response?.data?.message || errorObj?.message || 'Error al guardar los cambios';
      setErrorMessage(msg);
      console.error('Error al editar ticket:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const creatorEmail = ticket ? ticket.correo || ticket.creadoPor : '';

  return {
    formData,
    imagenes: [...existingImages, ...newImages],
    isSaving,
    errorMessage,
    creatorEmail,
    isDirty,
    hasRecoveredDraft,
    resetToOriginal,
    handleInputChange,
    handleFrecuenciaChange,
    handleImageAdd,
    handleImageRemove,
    handleSubmit
  };
}

export default useTicketEdit;
