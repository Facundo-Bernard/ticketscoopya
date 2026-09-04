import { Button, Form, Dropdown, Alert, Spinner } from 'react-bootstrap';
import { useTicketForm } from './useTicketForm';
import { useCatalogs } from '../../COMPOSABLES/useCatalogs';

function TicketCreator() {
  const {
    ticketData,
    isSubmitting,
    errorMessage,
    successMessage,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleAsignarChange,
    handlePrioridadChange,
    handleSubmit,
    handleVolver
  } = useTicketForm();

  const { asignables, prioridades, isLoading: isLoadingCatalogs } = useCatalogs();
  const safeAsignables = Array.isArray(asignables) ? asignables : [];
  const safePrioridades = Array.isArray(prioridades) ? prioridades : [];

  // Obtener el label legible de la prioridad actual desde el catálogo del backend
  const prioridadActual = safePrioridades.find((p) => p.value === ticketData.prioridad);
  const labelPrioridadActual = prioridadActual ? prioridadActual.label : (ticketData.prioridad || 'Seleccionar Prioridad');

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Nuevo Ticket (Interno)</h4>
          <Button variant="danger" size="sm">
            TAREAS PERIODICAS
          </Button>
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

            {/* Fila con Asignar y Prioridad */}
            <div className="row mb-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Asignar Técnico</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle 
                      variant="outline-secondary" 
                      id="dropdown-asignar"
                      className="w-100 text-start d-flex justify-content-between align-items-center"
                      disabled={isSubmitting || isLoadingCatalogs}
                    >
                      {isLoadingCatalogs ? (
                        <span><Spinner size="sm" animation="border" className="me-2" />Cargando técnicos...</span>
                      ) : (
                        ticketData.asignar || 'Seleccionar Técnico'
                      )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                      <Dropdown.Item onClick={() => handleAsignarChange('')}>
                        <em>Sin asignar</em>
                      </Dropdown.Item>
                      {safeAsignables.map((item) => (
                        <Dropdown.Item 
                          key={item.value} 
                          onClick={() => handleAsignarChange(item.label || item.value)}
                        >
                          {item.label}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Prioridad</Form.Label>
                  <Dropdown>
                    <Dropdown.Toggle 
                      variant="outline-secondary" 
                      id="dropdown-prioridad"
                      className="w-100 text-start d-flex justify-content-between align-items-center"
                      disabled={isSubmitting || isLoadingCatalogs}
                    >
                      {isLoadingCatalogs ? (
                        <span><Spinner size="sm" animation="border" className="me-2" />Cargando prioridades...</span>
                      ) : (
                        labelPrioridadActual
                      )}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="w-100">
                      {safePrioridades.map((item) => (
                        <Dropdown.Item 
                          key={item.value} 
                          onClick={() => handlePrioridadChange(item.value)}
                        >
                          {item.label}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </div>
            </div>

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
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Enviando ticket...
                  </>
                ) : (
                  'Enviar Ticket'
                )}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default TicketCreator;
