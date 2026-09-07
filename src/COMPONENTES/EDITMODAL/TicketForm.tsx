import React, { useState, useEffect, useReducer } from 'react';
import type { Ticket, Frecuencia } from './types';
import TicketFormCampos from './COMPONENTESFORM/TicketFormCampos';
import TicketFormImagenes from './COMPONENTESFORM/TicketFormImagenes';
import TicketFrecuencia from './COMPONENTESFORM/TicketFrecuencia';
import TicketFormFooter from './COMPONENTESFORM/TicketFormFooter';

interface TicketFormProps {
  ticket: Ticket;
  onCancel: () => void;
  onSave: (ticket: Ticket) => void;
}

interface FormData {
  titulo: string;
  descripcion: string;
  estado: string;
  colaborador: string;
  prioridad: string;
  imagenes: string[];
  frecuencia?: Frecuencia;
  columnId: number;
}

type FormAction =
  | { type: 'SET_DATA'; payload: FormData }
  | { type: 'CHANGE_FIELD'; name: keyof FormData; value: any }
  | { type: 'CHANGE_FRECUENCIA'; payload: Frecuencia | undefined }
  | { type: 'ADD_IMAGE'; payload: string }
  | { type: 'REMOVE_IMAGE'; payload: number };

function formReducer(state: FormData, action: FormAction): FormData {
  switch (action.type) {
    case 'SET_DATA':
      return action.payload;
    case 'CHANGE_FIELD':
      return { ...state, [action.name]: action.value };
    case 'CHANGE_FRECUENCIA':
      return { ...state, frecuencia: action.payload };
    case 'ADD_IMAGE':
      return { ...state, imagenes: [...state.imagenes, action.payload] };
    case 'REMOVE_IMAGE':
      return { ...state, imagenes: state.imagenes.filter((_, i) => i !== action.payload) };
    default:
      return state;
  }
}

const TicketForm: React.FC<TicketFormProps> = ({ ticket, onCancel, onSave }) => {
  const [formData, dispatch] = useReducer(formReducer, {
    titulo: '',
    descripcion: '',
    estado: 'abierto',
    colaborador: '',
    prioridad: 'media',
    imagenes: [],
    frecuencia: undefined,
    columnId: 1,
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (ticket) {
      const colVal = ticket.columnId ?? ticket.columna ?? 1;
      const colNum = typeof colVal === 'number' ? colVal : isNaN(Number(colVal)) ? 1 : Number(colVal);

      dispatch({
        type: 'SET_DATA',
        payload: {
          titulo: ticket.titulo || '',
          descripcion: ticket.descripcion || '',
          estado: ticket.estado || 'abierto',
          colaborador: ticket.colaborador || '',
          prioridad: ticket.prioridad || 'media',
          imagenes: ticket.imagenes || [],
          frecuencia: ticket.frecuencia,
          columnId: colNum,
        }
      });
    }
  }, [ticket]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const value = e.target.name === 'columnId' ? Number(e.target.value) : e.target.value;
    dispatch({ type: 'CHANGE_FIELD', name: e.target.name as keyof FormData, value });
  };

  const handleFrecuenciaChange = (frecuencia: Frecuencia | undefined): void => {
    dispatch({ type: 'CHANGE_FRECUENCIA', payload: frecuencia });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      dispatch({ type: 'ADD_IMAGE', payload: reader.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveImage = (idx: number): void => {
    dispatch({ type: 'REMOVE_IMAGE', payload: idx });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsSaving(true);
    //await new Promise((r) => setTimeout(r, 1000));
    const ahora = new Date().toISOString();
    const ticketFinal: Ticket = {
      ...ticket,
      ...formData,
      columnId: formData.columnId,
      columna: formData.columnId,
      fechaModificacion: ahora,
      fechaCierre: (formData.estado === 'cerrado' || formData.estado === 'resuelto') ? ahora : null
    };

    onSave(ticketFinal);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <h2 style={{ color: '#002B5E', fontWeight: 700, fontSize: '26px', margin: 0 }}>Edición Ticket</h2>
      <hr className="my-3" />

      <TicketFormCampos 
        formData={formData} 
        onChange={handleChange} 
        isSaving={isSaving} 
      />

      <TicketFormImagenes 
        imagenes={formData.imagenes} 
        isSaving={isSaving}
        onAdd={handleImageChange}
        onRemove={handleRemoveImage}
      />

      <div className="mb-4">
        <TicketFrecuencia 
          frecuencia={formData.frecuencia} 
          onChange={handleFrecuenciaChange} 
        />
      </div>

      <TicketFormFooter 
        creadoPor={ticket.creadoPor} 
        onCancel={onCancel} 
        isSaving={isSaving} 
      />
    </form>
  );
};

export default TicketForm;
