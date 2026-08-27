
import RUTASNAV from './COMPONENTES/RUTASNAV'
import TicketCreatorUser from './COMPONENTES/CREATEMODALUSER/TicketCreatorUser'
import M3TestEnvironment from './COMPONENTES/EDITMODAL/TESTING/M3TestEnvironment'


function App() {

  return (
    <>
      <RUTASNAV />
      <TicketCreatorUser />
      <hr className="my-5" />
      <M3TestEnvironment />
    </>
  )
}

export default App
