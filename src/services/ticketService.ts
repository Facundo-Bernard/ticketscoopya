export interface TicketSubmission {
  titulo: string
  descripcion: string
  email: string
  asignar?: string
  imagenes: File[]
}

interface TicketSubmissionResponse {
  emailSent: boolean
  awsCleaned: boolean
  message?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

/**
 * El backend debe enviar el mail y eliminar los adjuntos de AWS en la misma
 * operación. Las credenciales y las claves de S3 nunca deben llegar al navegador.
 */
export async function submitTicket(ticket: TicketSubmission): Promise<void> {
  const formData = new FormData()
  formData.append('titulo', ticket.titulo)
  formData.append('descripcion', ticket.descripcion)
  formData.append('email', ticket.email)

  if (ticket.asignar) {
    formData.append('asignar', ticket.asignar)
  }

  ticket.imagenes.forEach((imagen) => {
    formData.append('imagenes', imagen, imagen.name)
  })

  const response = await fetch(`${API_BASE_URL}/tickets/send-and-cleanup`, {
    method: 'POST',
    body: formData,
  })

  let result: TicketSubmissionResponse | null = null
  try {
    result = (await response.json()) as TicketSubmissionResponse
  } catch {
    // La respuesta puede no tener JSON cuando el servidor devuelve un error.
  }

  if (!response.ok || !result?.emailSent || !result.awsCleaned) {
    throw new Error(
      result?.message || 'No se pudo confirmar el envío y la limpieza de AWS.',
    )
  }
}
