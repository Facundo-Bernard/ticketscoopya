
import { Toaster } from 'sonner';
import RUTASNAV from './COMPONENTES/RUTASNAV';

function App() {
  return (
    <>
      <RUTASNAV />
      <Toaster 
        richColors 
        position="bottom-right" 
        closeButton 
        toastOptions={{
          style: {
            fontFamily: 'inherit',
          },
        }}
      />
    </>
  );
}

export default App;
