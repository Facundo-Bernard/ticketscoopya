import { useState } from 'react'

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
    
    // TODO: Definir ruta para enviar el ticket
    // Esta función debe conectarse con el backend cuando esté disponible
    console.log('Datos del ticket a enviar:', ticketData)
    
    // Limpiar formulario después del envío
    setTicketData({
      titulo: '',
      descripcion: '',
      email: '',
      asignar: '',
      imagenes: []
    })
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
    handleVolver
  }
}