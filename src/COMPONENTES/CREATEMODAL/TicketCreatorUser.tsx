import { Alert } from 'react-bootstrap';
import { useTicketForm } from './useTicketForm';
import { TicketFormCampos, TicketFormImagenes, TicketFormFooter } from '../COMPONENTESFORM';

export function TicketCreatorUser() {
  const {
    ticketData,
    isSubmitting,
    errorMessage,
    successMessage,
    hasStoredEmail,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    resetForm,
    handleSubmit
  } = useTicketForm({ isUser: true });

  const trackingId = successMessage ? successMessage.split(':').pop()?.trim() : null;

  return (
    <div className="min-vh-100 d-flex flex-column">

      {/* Contenido Principal */}
      <main className="flex-grow-1 py-4 py-md-5">
        <div className="container portal-container px-3">
          {successMessage ? (
            /* Pantalla de Éxito aislada sin redirección */
            <div className="portal-success-card">
              <div className="portal-success-icon-box">✓</div>
              <h3 className="fw-bold mb-2 text-dark">¡Solicitud Enviada con Éxito!</h3>
              <p className="text-secondary mb-4">
                Hemos registrado el problema en nuestro sistema. El equipo técnico lo revisará y te contactará a la brevedad.
              </p>

              {trackingId && (
                <div className="mb-4">
                  <span className="d-block text-muted small mb-1">Identificador de seguimiento:</span>
                  <span className="portal-tracking-badge">{trackingId}</span>
                </div>
              )}

              <p className="small text-muted mb-4">
                Podrás hacer el seguimiento del estado aguardando la notificación a tu correo electrónico.
              </p>

              <div className="d-flex justify-content-center">
                <button
                  type="button"
                  className="btn btn-coopya-red px-4 py-2 fw-semibold"
                  onClick={() => resetForm()}
                >
                  + Enviar otra solicitud
                </button>
              </div>
            </div>
          ) : (
            /* Formulario de Creación */
            <div className="portal-card">
              <div className="p-4 border-bottom bg-white">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div>
                    <h4 className="mb-1 fw-bold text-dark">Nuevo Problema</h4>
                    <p className="text-secondary small mb-0">
                      Completa los siguientes campos para que el equipo técnico pueda atender tu solicitud.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {errorMessage && (
                  <Alert variant="danger" dismissible>
                    {errorMessage}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <TicketFormCampos
                    formData={ticketData}
                    onChange={handleInputChange}
                    isSaving={isSubmitting}
                    showAsignar={false}
                    showColumna={false}
                    showEstado={false}
                    showEmail={true}
                    hasStoredEmail={hasStoredEmail}
                    showPrioridad={false}
                  />

                  <TicketFormImagenes
                    imagenes={ticketData.imagenes}
                    onAdd={handleImageUpload}
                    onRemove={handleRemoveImage}
                    isSaving={isSubmitting}
                  />

                  <TicketFormFooter
                    onCancel={resetForm}
                    isSaving={isSubmitting}
                    submitLabel="Enviar Ticket"
                    cancelLabel="Limpiar campos"
                  />
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TicketCreatorUser;
