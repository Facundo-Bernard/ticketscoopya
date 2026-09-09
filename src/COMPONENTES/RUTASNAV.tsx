import { Route, Routes, Navigate } from 'react-router-dom'
import { TicketCreatorUser } from '../COMPONENTES/CREATEMODAL'
import TicketMenu from '../COMPONENTES/TICKETMENU/MENU'
// Aquí irán las rutas de la app

function RUTASNAV() {

  return (
    <Routes>
      <Route path="/" element={<TicketMenu />} />
      <Route path="/crearticket" element={<Navigate to="/" replace />} />
      <Route path="/crearticket-usuario" element={<TicketCreatorUser />} />
      <Route path="/editar-ticket/:ticketId" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default RUTASNAV
