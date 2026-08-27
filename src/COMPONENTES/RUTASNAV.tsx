import { Route, Routes } from 'react-router-dom'
import { TicketCreator } from '../COMPONENTES/CREATEMODAL'
// Aquí irán las rutas de la app

function RUTASNAV() {

  return (
    <Routes>
      <Route path="/" element={<TicketCreator />} />
    </Routes>
  )
}

export default RUTASNAV
