import { api } from './api';
import type { OptionItem } from '../COMPONENTES/EDITMODAL/types';

type CatalogPayload =
  | OptionItem[]
  | {
      data?: OptionItem[];
      items?: OptionItem[];
      results?: OptionItem[];
      detail?: string;
    };

const getOptionList = (payload: CatalogPayload): OptionItem[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const options = payload.data ?? payload.items ?? payload.results;

  if (Array.isArray(options)) {
    return options;
  }

  throw new Error(payload.detail || 'El catálogo devolvió un formato inesperado.');
};

const fetchCatalog = async (path: string): Promise<OptionItem[]> => {
  const response = await api.get<CatalogPayload>(path);
  return getOptionList(response.data);
};

export const catalogService = {
  // Obtener catálogo de estados disponibles
  async getEstados(): Promise<OptionItem[]> {
    return fetchCatalog('/catalogs/estados');
  },

  // Obtener catálogo de prioridades
  async getPrioridades(): Promise<OptionItem[]> {
    return fetchCatalog('/catalogs/prioridades');
  },

  // Obtener catálogo de técnicos asignables
  async getAsignables(): Promise<OptionItem[]> {
    return fetchCatalog('/catalogs/asignables');
  }
};
