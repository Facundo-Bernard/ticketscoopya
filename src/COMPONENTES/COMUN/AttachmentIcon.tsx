import React from 'react';
import type { AttachmentCategory } from '../../UTILS/attachmentUtils';
import {
  PdfIcon,
  ExcelIcon,
  CsvIcon,
  TextFileIcon,
  FileGenericIcon,
  ZoomInIcon,
} from './Icons';

interface AttachmentIconProps {
  category: AttachmentCategory;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AttachmentIcon: React.FC<AttachmentIconProps> = ({
  category,
  size = 18,
  className = '',
  style,
}) => {
  switch (category) {
    case 'pdf':
      // Rojito para PDFs
      return (
        <PdfIcon
          size={size}
          className={`text-danger ${className}`}
          style={{ color: '#dc2626', ...style }}
        />
      );
    case 'excel':
      // Verde clásico de hojas de cálculo Excel
      return (
        <ExcelIcon
          size={size}
          className={`text-success ${className}`}
          style={{ color: '#16a34a', ...style }}
        />
      );
    case 'csv':
      // Verde para planillas CSV
      return (
        <CsvIcon
          size={size}
          className={`text-success ${className}`}
          style={{ color: '#10b981', ...style }}
        />
      );
    case 'text':
      // Azul para archivos de texto plano
      return (
        <TextFileIcon
          size={size}
          className={`text-primary ${className}`}
          style={{ color: '#2563eb', ...style }}
        />
      );
    case 'image':
      return (
        <ZoomInIcon
          size={size}
          className={`text-danger ${className}`}
          style={{ color: '#e11d48', ...style }}
        />
      );
    default:
      return (
        <FileGenericIcon
          size={size}
          className={`text-secondary ${className}`}
          style={{ color: '#64748b', ...style }}
        />
      );
  }
};

export default AttachmentIcon;
