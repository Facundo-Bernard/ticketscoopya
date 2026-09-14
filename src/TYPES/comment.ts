export interface TicketComment {
  id: string;              // Identificador único del comentario (MongoDB ObjectId)
  ticket_id: string;       // ID del ticket padre
  autor: string;           // Nombre o correo del autor
  mensaje: string;         // Contenido del comentario
  fecha_creacion: string;  // Formato ISO 8601 UTC
}

export interface CommentCreatePayload {
  autor: string;
  mensaje: string;
}

export interface CommentCountResponse {
  ticket_id: string;
  total: number;
}

export interface CommentFilters {
  autor?: string;
  fecha_desde?: string;   // Formato YYYY-MM-DD o ISO
  fecha_hasta?: string;   // Formato YYYY-MM-DD o ISO
  skip?: number;          // Cantidad a omitir para paginación (0, 10, 20...)
  limit?: number;         // Tamaño de página (por defecto: 10)
}
