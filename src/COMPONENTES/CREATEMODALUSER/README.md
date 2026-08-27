# TicketCreatorUser - Módulo de Creación de Tickets para Usuarios

## Descripción
Componente de React simplificado que permite a los usuarios crear tickets con información textual e imágenes. Es una versión del módulo CREATEMODAL diseñada específicamente para usuarios regulares, sin funcionalidades administrativas como asignación de tareas o tareas periódicas.

## Arquitectura
- **TicketCreatorUser.tsx**: Componente de presentación con Bootstrap
- **useTicketFormUser.ts**: Custom hook con la lógica del formulario
- **index.ts**: Exportaciones del módulo

## Características
- Campo de título (texto obligatorio)
- Campo de descripción (texto obligatorio)
- Campo de email (texto obligatorio)
- Carga de múltiples imágenes con opción de eliminar
- Botones de "Volver" y "Enviar"
- Diseño responsive con Bootstrap
- Separación de responsabilidades (lógica vs presentación)
- **Sin funcionalidad de asignación**
- **Sin botón de TAREAS PERIODICAS**

## Diferencias con CREATEMODAL
- No tiene dropdown de asignación
- No tiene botón de "TAREAS PERIODICAS"
- No tiene campo de asignación en la interfaz
- No tiene función `handleAsignarChange` en el hook
- Interfaz más simplificada para usuarios finales

## Uso

```tsx
import { TicketCreatorUser } from './COMPONENTES/CREATEMODALUSER'

function App() {
  return (
    <TicketCreatorUser />
  )
}
```

## Uso del Hook

```tsx
import { useTicketFormUser } from './COMPONENTES/CREATEMODALUSER'

function MiComponente() {
  const {
    ticketData,
    handleInputChange,
    handleImageUpload,
    handleRemoveImage,
    handleSubmit,
    handleVolver
  } = useTicketFormUser()
  
  // Usar las funciones y datos según necesidad
}
```

## Estructura de Datos

```typescript
interface TicketData {
  titulo: string
  descripcion: string
  email: string
  imagenes: File[]
}
```

## Dependencias
- Bootstrap
- React-Bootstrap

## Rutas Pendientes de Definir

### 1. Envío del Ticket
**Ubicación:** Línea 46 en `useTicketFormUser.ts`
**Comentario:** `// TODO: Definir ruta para enviar el ticket`
**Descripción:** Se debe implementar la función que envía los datos del ticket al backend. Actualmente solo muestra los datos en consola.

### 2. Función Volver
**Ubicación:** Línea 60 en `useTicketFormUser.ts`
**Comentario:** `// TODO: Implementar lógica para volver atrás`
**Descripción:** Se debe implementar la navegación para volver a la página anterior.

## Notas de Implementación
- El componente usa el custom hook `useTicketFormUser` para la lógica
- Utiliza componentes de React-Bootstrap para la interfaz
- Se sigue la estructura de componentes del proyecto
- El componente es completamente funcional a nivel de interfaz
- Las validaciones de formulario son básicas (required)
- Las imágenes se almacenan como objetos File en el estado
- Bootstrap CSS se importa en `main.tsx`
- La lógica está completamente separada de la presentación
- Diseñado específicamente para usuarios sin privilegios administrativos

## Próximos Pasos
1. Definir las rutas del backend para el envío de tickets
2. Implementar la integración con axios para las peticiones HTTP
3. Agregar validaciones más robustas
4. Implementar manejo de errores
5. Agregar indicadores de carga durante el envío
6. Implementar la navegación para el botón "Volver"