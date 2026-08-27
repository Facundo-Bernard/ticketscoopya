# TicketCreator - Módulo de Creación de Tickets

## Descripción
Componente de React que permite a los usuarios crear tickets con información textual e imágenes. Utiliza Bootstrap y React-Bootstrap para el diseño. La lógica del formulario está separada en un custom hook para mejor organización.

## Arquitectura
- **TicketCreator.tsx**: Componente de presentación con Bootstrap
- **useTicketForm.ts**: Custom hook con la lógica del formulario
- **index.ts**: Exportaciones del módulo

## Características
- Campo de título (texto obligatorio)
- Campo de descripción (texto obligatorio)
- Campo de email (texto obligatorio)
- Dropdown de asignación
- Carga de múltiples imágenes con opción de eliminar
- Botón de "TAREAS PERIODICAS"
- Botones de "Volver" y "Enviar"
- Diseño responsive con Bootstrap
- Separación de responsabilidades (lógica vs presentación)

## Uso

```tsx
import { TicketCreator } from './COMPONENTES/CREATEMODAL'

function App() {
  return (
    <TicketCreator />
  )
}
```

## Uso del Hook

```tsx
import { useTicketForm } from './COMPONENTES/CREATEMODAL'

function MiComponente() {
  const {
    ticketData,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleAsignarChange,
    handleSubmit,
    handleVolver
  } = useTicketForm()
  
  // Usar las funciones y datos según necesidad
}
```

## Estructura de Datos

```typescript
interface TicketData {
  titulo: string
  descripcion: string
  email: string
  asignar: string
  imagenes: File[]
}
```

## Dependencias
- Bootstrap
- React-Bootstrap

## Rutas Pendientes de Definir

### 1. Envío del Ticket
**Ubicación:** Línea 55 en `useTicketForm.ts`
**Comentario:** `// TODO: Definir ruta para enviar el ticket`
**Descripción:** Se debe implementar la función que envía los datos del ticket al backend. Actualmente solo muestra los datos en consola.

### 2. Función Volver
**Ubicación:** Línea 70 en `useTicketForm.ts`
**Comentario:** `// TODO: Implementar lógica para volver atrás`
**Descripción:** Se debe implementar la navegación para volver a la página anterior.

## Notas de Implementación
- El componente usa el custom hook `useTicketForm` para la lógica
- Utiliza componentes de React-Bootstrap para la interfaz
- Se sigue la estructura de componentes del proyecto
- El componente es completamente funcional a nivel de interfaz
- Las validaciones de formulario son básicas (required)
- Las imágenes se almacenan como objetos File en el estado
- Bootstrap CSS se importa en `main.tsx`
- La lógica está completamente separada de la presentación

## Próximos Pasos
1. Definir las rutas del backend para el envío de tickets
2. Implementar la integración con axios para las peticiones HTTP
3. Agregar validaciones más robustas
4. Implementar manejo de errores
5. Agregar indicadores de carga durante el envío
6. Implementar la navegación para el botón "Volver"
7. Personalizar las opciones del dropdown de asignación