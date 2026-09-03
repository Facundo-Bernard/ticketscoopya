import { Route, Routes } from 'react-router-dom'
import { TicketCreator } from '../COMPONENTES/CREATEMODAL'
import TicketMenu from '../COMPONENTES/TICKETMENU/MENU'
import EditarTicket from '../COMPONENTES/TICKETMENU/EditarTicket'
// Aquí irán las rutas de la app

function RUTASNAV() {

  return (
    <Routes>
      <Route path="/crearticket" element={<TicketCreator />} />
      <Route path="/" element={<TicketMenu />} />
      <Route path="/editar-ticket/:ticketId" element={<EditarTicket />} />
    </Routes>
  )
}

export default RUTASNAV
