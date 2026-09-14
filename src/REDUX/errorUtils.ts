import axios from 'axios';

export const messageFromError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data) {
      if (typeof data === 'string') return data;
      if (typeof data.detail === 'string') return data.detail;
      if (Array.isArray(data.detail)) {
        return data.detail
          .map((d: any) => d.msg || (typeof d === 'string' ? d : JSON.stringify(d)))
          .join(', ');
      }
      if (typeof data.message === 'string') return data.message;
    }
    return error.message;
  }
  return error instanceof Error ? error.message : 'No se pudo completar la solicitud.';
};
