import { useState, useEffect } from 'react';
import type { Ticket, Frecuencia } from '../../../TYPES';

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
  onSave?: (updatedTicket: Ticket) => void | Promise<void>
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

  const [imagenes, setImagenes] = useState<string[]>([]);
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
      setImagenes(ticket.imagenes || []);
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
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setImagenes((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    }
  };

  const handleImageRemove = (idx: number): void => {
    setImagenes((prev) => prev.filter((_, i) => i !== idx));
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
      imagenes,
      fechaModificacion: now,
      fechaCierre: formData.estado === 'cerrado' || formData.estado === 'resuelto' ? now : null
    };

    try {
      await onSave?.(ticketModificado);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al guardar los cambios';
      setErrorMessage(msg);
      console.error('Error al editar ticket:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const creatorEmail = ticket ? ticket.correo || ticket.creadoPor : '';

  return {
    formData,
    imagenes,
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
