import { getFileUrl } from '../SERVICES/api';

export type AttachmentCategory = 'image' | 'pdf' | 'excel' | 'csv' | 'text' | 'file';

export interface AttachmentMeta {
  url: string;
  name: string;
  ext: string;
  category: AttachmentCategory;
  size?: number;
  isLocal?: boolean;
  file?: File;
}

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'bmp']);
const EXCEL_EXTENSIONS = new Set(['xlsx', 'xls']);
const CSV_EXTENSIONS = new Set(['csv']);
const PDF_EXTENSIONS = new Set(['pdf']);
const TEXT_EXTENSIONS = new Set(['txt', 'log', 'md']);

/**
 * Determina la categoría del adjunto a partir de su extensión y/o MIME type.
 */
export function getCategoryFromExt(ext: string, mimeType?: string): AttachmentCategory {
  const cleanExt = ext.toLowerCase().replace(/^\./, '');
  const cleanMime = (mimeType || '').toLowerCase();

  if (cleanMime.startsWith('image/') || IMAGE_EXTENSIONS.has(cleanExt)) {
    return 'image';
  }
  if (cleanMime === 'application/pdf' || PDF_EXTENSIONS.has(cleanExt)) {
    return 'pdf';
  }
  if (
    cleanMime.includes('spreadsheet') ||
    cleanMime.includes('excel') ||
    EXCEL_EXTENSIONS.has(cleanExt)
  ) {
    return 'excel';
  }
  if (cleanMime === 'text/csv' || cleanMime.includes('csv') || CSV_EXTENSIONS.has(cleanExt)) {
    return 'csv';
  }
  if (cleanMime === 'text/plain' || TEXT_EXTENSIONS.has(cleanExt)) {
    return 'text';
  }
  return 'file';
}

/**
 * Extrae el nombre de archivo y su extensión a partir de una URL o path.
 */
export function extractFilenameFromUrl(url: string): { name: string; ext: string } {
  if (!url) return { name: 'archivo', ext: '' };

  try {
    const dummyBase = 'http://localhost';
    const parsed = new URL(url, dummyBase);

    // 1. Intentar obtener el nombre del query param (?filename=...)
    const queryFilename = parsed.searchParams.get('filename');
    if (queryFilename) {
      const decoded = decodeURIComponent(queryFilename);
      const extMatch = decoded.match(/\.([a-zA-Z0-9]+)$/);
      return {
        name: decoded,
        ext: extMatch ? extMatch[1].toLowerCase() : '',
      };
    }

    // 2. Extraer del path
    const pathname = parsed.pathname;
    const lastSegment = pathname.split('/').filter(Boolean).pop() || '';
    const cleanSegment = decodeURIComponent(lastSegment);

    const extMatch = cleanSegment.match(/\.([a-zA-Z0-9]+)$/);
    if (extMatch) {
      return {
        name: cleanSegment,
        ext: extMatch[1].toLowerCase(),
      };
    }

    // Si es un ID de MongoDB (24 hex chars)
    if (/^[a-fA-F0-9]{24}$/.test(cleanSegment)) {
      return {
        name: `Adjunto_${cleanSegment.slice(-4)}`,
        ext: '',
      };
    }

    return { name: cleanSegment || 'archivo', ext: '' };
  } catch {
    return { name: 'archivo', ext: '' };
  }
}

/**
 * Normaliza cualquier entrada (File de navegador o string URL) a un objeto AttachmentMeta.
 */
export function getAttachmentMeta(item: string | File): AttachmentMeta {
  if (item instanceof File) {
    const ext = (item.name.split('.').pop() || '').toLowerCase();
    const category = getCategoryFromExt(ext, item.type);
    const url = URL.createObjectURL(item);
    return {
      url,
      name: item.name,
      ext,
      category,
      size: item.size,
      isLocal: true,
      file: item,
    };
  }

  const resolvedUrl = getFileUrl(item);

  // Si ya tenemos los metadatos resueltos en caché, devolverlos de inmediato
  if (metaCache.has(resolvedUrl)) {
    return metaCache.get(resolvedUrl)!;
  }

  const { name, ext } = extractFilenameFromUrl(resolvedUrl);
  const category = getCategoryFromExt(ext);

  return {
    url: resolvedUrl,
    name,
    ext,
    category,
    isLocal: false,
  };
}

const metaCache = new Map<string, AttachmentMeta>();

/**
 * Extrae el nombre de archivo del header Content-Disposition.
 */
export function parseContentDispositionFilename(disposition?: string | null): string | null {
  if (!disposition) return null;

  // 1. Probar formato RFC 5987 (filename*=UTF-8''...)
  const utf8Match = disposition.match(/filename\*=(?:UTF-8'')?([^;]+)/i);
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return utf8Match[1].trim();
    }
  }

  // 2. Probar formato estándar filename="archivo.ext" o filename=archivo.ext
  const standardMatch = disposition.match(/filename=["']?([^"';]+)["']?/i);
  if (standardMatch) {
    try {
      return decodeURIComponent(standardMatch[1].trim());
    } catch {
      return standardMatch[1].trim();
    }
  }

  return null;
}

/**
 * Resuelve de forma asíncrona los metadatos completos consultando HEAD (o fallback GET) al backend.
 */
export async function resolveAttachmentMeta(urlOrFile: string | File): Promise<AttachmentMeta> {
  const syncMeta = getAttachmentMeta(urlOrFile);
  if (syncMeta.isLocal || syncMeta.ext) {
    return syncMeta;
  }

  if (metaCache.has(syncMeta.url)) {
    return metaCache.get(syncMeta.url)!;
  }

  try {
    let response: Response;
    try {
      response = await fetch(syncMeta.url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`HEAD returned status ${response.status}`);
      }
    } catch {
      // Fallback a GET si el servidor no admite HEAD
      const controller = new AbortController();
      response = await fetch(syncMeta.url, { method: 'GET', signal: controller.signal });
      if (response.body) {
        response.body.cancel().catch(() => {});
      }
    }

    const contentType = response.headers.get('content-type') || '';
    const disposition = response.headers.get('content-disposition') || '';
    const contentLength = response.headers.get('content-length');

    let filename = parseContentDispositionFilename(disposition) || syncMeta.name;
    let extMatch = filename.match(/\.([a-zA-Z0-9]+)$/);
    let ext = extMatch ? extMatch[1].toLowerCase() : '';
    const category = getCategoryFromExt(ext, contentType);

    // Si no había extensión en el nombre pero sí logramos deducir la categoría por MIME type
    if (!ext) {
      if (category === 'pdf') ext = 'pdf';
      else if (category === 'excel') ext = 'xlsx';
      else if (category === 'csv') ext = 'csv';
      else if (category === 'text') ext = 'txt';
      else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
      else if (contentType.includes('png')) ext = 'png';
      else if (contentType.includes('webp')) ext = 'webp';

      if (ext && !filename.includes('.')) {
        filename = `${filename}.${ext}`;
      }
    }

    const size = contentLength ? parseInt(contentLength, 10) : syncMeta.size;

    const resolved: AttachmentMeta = {
      ...syncMeta,
      name: filename,
      ext,
      category,
      size: Number.isFinite(size) ? size : undefined,
    };

    metaCache.set(syncMeta.url, resolved);
    return resolved;
  } catch {
    return syncMeta;
  }
}

/**
 * Formatea el tamaño en bytes a una representación legible (KB, MB).
 */
export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Devuelve el color y etiqueta descriptiva de cada categoría de archivo.
 */
export function getCategoryBadgeInfo(category: AttachmentCategory): {
  label: string;
  badgeClass: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
} {
  switch (category) {
    case 'pdf':
      return {
        label: 'PDF',
        badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle',
        color: '#dc2626',
        bgColor: '#fee2e2',
        borderColor: '#fca5a5',
        description: 'Documento PDF',
      };
    case 'excel':
      return {
        label: 'EXCEL',
        badgeClass: 'bg-success-subtle text-success border border-success-subtle',
        color: '#16a34a',
        bgColor: '#dcfce7',
        borderColor: '#86efac',
        description: 'Planilla de cálculo Excel',
      };
    case 'csv':
      return {
        label: 'CSV',
        badgeClass: 'bg-success-subtle text-success border border-success-subtle',
        color: '#10b981',
        bgColor: '#ecfdf5',
        borderColor: '#a7f3d0',
        description: 'Planilla de datos CSV',
      };
    case 'text':
      return {
        label: 'TXT',
        badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle',
        color: '#2563eb',
        bgColor: '#eff6ff',
        borderColor: '#bfdbfe',
        description: 'Documento de texto plano',
      };
    case 'image':
      return {
        label: 'FOTO',
        badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle',
        color: '#e11d48',
        bgColor: '#ffe4e6',
        borderColor: '#fecdd3',
        description: 'Imagen adjunta',
      };
    default:
      return {
        label: 'DOC',
        badgeClass: 'bg-secondary-subtle text-secondary border border-secondary-subtle',
        color: '#64748b',
        bgColor: '#f1f5f9',
        borderColor: '#cbd5e1',
        description: 'Archivo adjunto',
      };
  }
}

