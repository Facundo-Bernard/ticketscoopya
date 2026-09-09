export { default as ModalTicket } from './ModalTicket';
export { default as ModalConfirmarEliminar } from './ModalConfirmarEliminar';
export { useModalTicketOperations, modalTicketOperations } from './modalTicketOperations';

// Componentes y hooks de DETALLE
export { default as TicketDetalle } from './DETALLE/TicketDetalle';
export { default as ModalTicketFooter } from './DETALLE/ModalTicketFooter';

// Componentes y hooks de EDITAR
export { default as TicketEditView } from './EDITAR/TicketEditView';
export { useTicketEdit } from './EDITAR/useTicketEdit';
export type { TicketEditViewProps } from './EDITAR/TicketEditView';
export type { TicketEditFormData } from './EDITAR/useTicketEdit';
