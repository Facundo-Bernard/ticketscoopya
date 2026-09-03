import { api } from './api';
import type { OptionItem } from '../COMPONENTES/EDITMODAL/types';

export const catalogService = {
  // Obtener catálogo de estados disponibles
  async getEstados(): Promise<OptionItem[]> {
    const response = await api.get<OptionItem[]>('/catalogs/estados');
    return response.data;
  },

  // Obtener catálogo de prioridades
  async getPrioridades(): Promise<OptionItem[]> {
    const response = await api.get<OptionItem[]>('/catalogs/prioridades');
    return response.data;
  },

  // Obtener catálogo de técnicos asignables
  async getAsignables(): Promise<OptionItem[]> {
    const response = await api.get<OptionItem[]>('/catalogs/asignables');
    return response.data;
  }
};
