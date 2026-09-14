import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../REDUX/store';
import { fetchCatalogs } from '../REDUX/catalogThunks';

export function useCatalogs(autoLoad: boolean = true) {
  const dispatch = useDispatch<AppDispatch>();
  const { estados, prioridades, asignables, status, error } = useSelector(
    (state: RootState) => state.catalogs,
  );

  const loadCatalogs = useCallback(
    async (force: boolean = false) => {
      try {
        return await dispatch(fetchCatalogs({ force })).unwrap();
      } catch (err: any) {
        if (err?.name === 'ConditionError') {
          return;
        }
        throw err;
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (autoLoad && status === 'idle') {
      void loadCatalogs();
    }
  }, [autoLoad, loadCatalogs, status]);

  return {
    estados,
    prioridades,
    asignables,
    isLoading: status === 'loading',
    error,
    reloadCatalogs: loadCatalogs
  };
}
