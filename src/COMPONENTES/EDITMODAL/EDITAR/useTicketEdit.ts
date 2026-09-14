import { useState, useEffect } from 'react';
import type { Ticket, Frecuencia } from '../../../TYPES';
import type { TicketImageChanges } from '../../../SERVICES/ticketService';

export interface TicketEditFormData {
  titulo: string;
  descripcion: string;
  estado: string;
  colaborador: string;
  prioridad: string;
  columnId: number;
  frecuencia?: Frecuencia | null;
}

export function useTicketEdit(
  ticket: Ticket | null,
  onSave?: (updatedTicket: Ticket, imageChanges: TicketImageChanges) => void | Promise<void>
) {
  const [formData, setFormData] = useState<TicketEditFormData>({
    titulo: '',
    descripcion: '',
    estado: 'abierto',
    colaborador: '',
    prioridad: 'media',
    columnId: 1,
    frecuencia: undefined
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (ticket) {
      const colVal = ticket.columnId ?? ticket.columna ?? 1;
      const colNum = typeof colVal === 'number' ? colVal : isNaN(Number(colVal)) ? 1 : Number(colVal);

      setFormData({
        titulo: ticket.titulo || '',
        descripcion: ticket.descripcion || '',
        estado: ticket.estado || 'abierto',
        colaborador: ticket.colaborador || '',
        prioridad: ticket.prioridad || 'media',
        columnId: colNum,
        frecuencia: ticket.frecuencia || undefined
      });
      setExistingImages(ticket.imagenes || []);
      setNewImages([]);
      setRemovedImageIds([]);
      setErrorMessage(null);
    }
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

    const ticketModificado: Ticket = {
      ...ticket,
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      estado: formData.estado,
      prioridad: formData.prioridad,
      colaborador: formData.colaborador,
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
    } catch (err: any) {
      const msg =
        typeof err === 'string'
          ? err
          : err.response?.data?.detail
            ? (Array.isArray(err.response.data.detail)
                ? err.response.data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
                : String(err.response.data.detail))
            : err.response?.data?.message || err.message || 'Error al guardar los cambios';
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
    handleInputChange,
    handleFrecuenciaChange,
    handleImageAdd,
    handleImageRemove,
    handleSubmit
  };
}

export default useTicketEdit;
