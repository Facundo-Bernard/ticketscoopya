import { Button, Form, Alert } from 'react-bootstrap';
import { useTicketFormUser } from './useTicketFormUser';

function TicketCreatorUser() {
  const {
    ticketData,
    isSubmitting,
    errorMessage,
    successMessage,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleSubmit,
    handleVolver
  } = useTicketFormUser();

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-white">
          <h4 className="mb-0">Nuevo Ticket de Soporte</h4>
        </div>
        <div className="card-body">
          {errorMessage && (
            <Alert variant="danger" dismissible>
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success">
              {successMessage}
            </Alert>
          )}

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
                disabled={isSubmitting}
                placeholder="Ingrese el título del ticket"
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
                disabled={isSubmitting}
                placeholder="Ingrese la descripción del ticket"
                rows={4}
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
                disabled={isSubmitting}
                placeholder="Ingrese su email"
              />
            </Form.Group>

            {/* Sección de Imágenes */}
            <Form.Group className="mb-3">
              <Form.Label>Imágenes</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                disabled={isSubmitting}
                onChange={handleImageUpload}
              />
              
              {ticketData.imagenes.length > 0 && (
                <div className="mt-2">
                  {ticketData.imagenes.map((imagen, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                      <span className="small text-truncate" style={{ maxWidth: '80%' }}>{imagen.name}</span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={isSubmitting}
                        onClick={() => handleRemoveImage(index)}
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
                {isSubmitting ? 'Enviando ticket...' : 'Enviar Ticket'}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default TicketCreatorUser;