import { Alert, Button, Form, Dropdown } from 'react-bootstrap'
import { useTicketForm } from './useTicketForm'

function TicketCreator() {
  const {
    ticketData,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleAsignarChange,
    handleSubmit,
    handleVolver,
    isSubmitting,
    submitError
  } = useTicketForm()

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Nuevo Ticket</h4>
          <Button variant="danger" size="sm">
            TAREAS PERIODICAS
          </Button>
        </div>
        <div className="card-body">
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          <Form onSubmit={handleSubmit}>
            {/* Campo de Título */}
            <Form.Group className="mb-3">
              <Form.Label>Título del ticket</Form.Label>
              <Form.Control
                type="text"
                name="titulo"
                value={ticketData.titulo}
                onChange={handleInputChange}
                required
                placeholder="Ingrese el título del ticket"
                disabled={isSubmitting}
              />
            </Form.Group>

            {/* Campo de Descripción */}
            <Form.Group className="mb-3">
              <Form.Label>Contanos qué pasó y/o peganos una imagen</Form.Label>
              <Form.Control
                as="textarea"
                name="descripcion"
                value={ticketData.descripcion}
                onChange={handleInputChange}
                required
                placeholder="Ingrese la descripción del ticket"
                rows={4}
                disabled={isSubmitting}
              />
            </Form.Group>

            {/* Campo de Email */}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={ticketData.email}
                onChange={handleInputChange}
                required
                placeholder="Ingrese su email"
                disabled={isSubmitting}
              />
            </Form.Group>

            {/* Dropdown de Asignar */}
            <Form.Group className="mb-3">
              <Form.Label>Asignar</Form.Label>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-asignar" disabled={isSubmitting}>
                  {ticketData.asignar || 'Seleccionar'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => handleAsignarChange('Opción 1')}>
                    Opción 1
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleAsignarChange('Opción 2')}>
                    Opción 2
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => handleAsignarChange('Opción 3')}>
                    Opción 3
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>

            {/* Sección de Imágenes */}
            <Form.Group className="mb-3">
              <Form.Label>Imágenes</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isSubmitting}
              />
              
              {ticketData.imagenes.length > 0 && (
                <div className="mt-2">
                  {ticketData.imagenes.map((imagen, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                      <span className="small">{imagen.name}</span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveImage(index)}
                        disabled={isSubmitting}
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>

            {/* Botones de acción */}
            <div className="d-flex justify-content-between mt-4">
              <Button variant="secondary" onClick={handleVolver} disabled={isSubmitting}>
                Volver
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default TicketCreator
