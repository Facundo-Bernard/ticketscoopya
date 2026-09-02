import { useState } from 'react'
import { submitTicket } from '../../services/ticketService'

interface TicketData {
  titulo: string 
  descripcion: string
  email: string
  asignar: string
  imagenes: File[]
}

export function useTicketForm() {
  const [ticketData, setTicketData] = useState<TicketData>({
    titulo: '',
    descripcion: '',
    email: '',
    asignar: '',
    imagenes: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTicketData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      setTicketData(prev => ({
        ...prev,
        imagenes: [...prev.imagenes, ...newImages]
      }))
    }
  }

  const handleRemoveImage = (index: number) => {
    setTicketData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, i) => i !== index)
    }))
  }

  const handleAsignarChange = (value: string) => {
    setTicketData(prev => ({
      ...prev,
      asignar: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // El backend confirma el mail y recién después elimina los archivos de AWS.
      await submitTicket(ticketData)
      setTicketData({ titulo: '', descripcion: '', email: '', asignar: '', imagenes: [] })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo enviar el ticket.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVolver = () => {
    // TODO: Implementar lógica para volver atrás
    console.log('Volver')
  }

  return {
    ticketData,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleAsignarChange,
    handleSubmit,
    handleVolver,
    isSubmitting,
    submitError
  }
}
