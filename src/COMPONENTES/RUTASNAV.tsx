import { Route, Routes, Navigate } from 'react-router-dom';
import { TicketCreatorUser } from '../COMPONENTES/CREATEMODAL';
import TicketMenu from '../COMPONENTES/TICKETMENU/MENU';
import Login from './AUTH/Login';
import ProtectedRoute from './AUTH/ProtectedRoute';

function RUTASNAV() {
  return (
    <Routes>
      {/* Vista de autenticación para operadores y administradores */}
      <Route path="/login" element={<Login />} />

      {/* Vista pública blindada para que los usuarios creen tickets */}
      <Route path="/crearticket-usuario" element={<TicketCreatorUser />} />

      {/* Tablero administrativo y de gestión de tickets protegido */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <TicketMenu />
          </ProtectedRoute>
        }
      />

      <Route path="/crearticket" element={<Navigate to="/" replace />} />
      <Route path="/editar-ticket/:ticketId" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default RUTASNAV;
