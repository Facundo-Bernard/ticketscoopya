import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

const defaultProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Candado cerrado (Lock) */
export const LockIcon: React.FC<IconProps> = ({ size = 14, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/** Candado abierto (Unlock) */
export const UnlockIcon: React.FC<IconProps> = ({ size = 14, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

/** Lápiz de edición (Edit) */
export const EditIcon: React.FC<IconProps> = ({ size = 14, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

/** Tacho de basura (Trash / Delete) */
export const TrashIcon: React.FC<IconProps> = ({ size = 14, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

/** Chincheta / Pin (Columna / Posición) */
export const PinIcon: React.FC<IconProps> = ({ size = 13, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
  </svg>
);

/** Usuario / Colaborador (User) */
export const UserIcon: React.FC<IconProps> = ({ size = 14, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

/** Usuario verificado / Solicitante (UserCheck) */
export const UserCheckIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);

/** Calendario (Calendar / Fecha) */
export const CalendarIcon: React.FC<IconProps> = ({ size = 13, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/** Recurrencia / Repetición (Repeat) */
export const RepeatIcon: React.FC<IconProps> = ({ size = 13, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

/** Bandera / Prioridad (Flag) */
export const FlagIcon: React.FC<IconProps> = ({ size = 13, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

/** Lupa / Ampliar (ZoomIn) */
export const ZoomInIcon: React.FC<IconProps> = ({ size = 12, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

/** Reactivar / Play / Refresh */
export const ReactivateIcon: React.FC<IconProps> = ({ size = 14, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

/** Alerta triangular (AlertTriangle) */
export const AlertTriangleIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/** Clip / Adjunto (Paperclip / Attachment) */
export const PaperclipIcon: React.FC<IconProps> = ({ size = 13, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

/** Icono de archivo PDF */
export const PdfIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 15v-4h2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9z" />
  </svg>
);

/** Icono de archivo Excel / Hoja de cálculo */
export const ExcelIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 13l4 4m0-4l-4 4" />
  </svg>
);

/** Icono de archivo CSV / Tabla */
export const CsvIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);

/** Icono de archivo de texto plano (TXT) */
export const TextFileIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

/** Icono genérico de archivo */
export const FileGenericIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

/** Icono de Descarga (Download) */
export const DownloadIcon: React.FC<IconProps> = ({ size = 14, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/** Icono de Enlace Externo (External Link / Abrir en pestaña) */
export const ExternalLinkIcon: React.FC<IconProps> = ({ size = 13, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

/** Icono de Chispas / Novedad sutil (Sparkles) */
export const SparklesIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    strokeWidth={1.8}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    <path d="m19 5 .5 1.5a1 1 0 0 0 .6.6L21.5 7.5l-1.4.4a1 1 0 0 0-.6.6L19 10l-.5-1.5a1 1 0 0 0-.6-.6l-1.4-.4 1.4-.4a1 1 0 0 0 .6-.6L19 5Z" />
  </svg>
);

/** Icono de Información / Alerta en Círculo (AlertCircle con signo !) */
export const AlertCircleIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/** Icono de Flecha Derecha / Chevron Right */
export const ChevronRightIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/** Icono de Envío / Send */
export const SendIcon: React.FC<IconProps> = ({ size = 14, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

/** Icono de Comentario / Mensaje */
export const MessageSquareIcon: React.FC<IconProps> = ({ size = 16, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    {...defaultProps}
    className={`icon-svg flex-shrink-0 ${className}`}
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
