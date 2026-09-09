import { useState, useEffect, useCallback } from 'react';
import { catalogService } from '../SERVICES/catalogService';
import type { OptionItem } from '../TYPES';

export function useCatalogs(autoLoad: boolean = true) {
  const [estados, setEstados] = useState<OptionItem[]>([]);
  const [prioridades, setPrioridades] = useState<OptionItem[]>([]);
  const [asignables, setAsignables] = useState<OptionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [resEstados, resPrioridades, resAsignables] = await Promise.all([
        catalogService.getEstados(),
        catalogService.getPrioridades(),
        catalogService.getAsignables()
      ]);
      setEstados(resEstados);
      setPrioridades(resPrioridades);
      setAsignables(resAsignables);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al cargar catálogos';
      setError(msg);
      console.error('Error loading catalogs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadCatalogs();
    }
  }, [autoLoad, loadCatalogs]);

  return {
    estados,
    prioridades,
    asignables,
    isLoading,
    error,
    reloadCatalogs: loadCatalogs
  };
}
