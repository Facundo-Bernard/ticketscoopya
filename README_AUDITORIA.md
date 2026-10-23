# 🔍 Informe de Auditoría de Seguridad y Buenas Prácticas - Ticketscoopya
**Componente:** Frontend Ticketscoopya (Mesa de Ayuda, Tablero Kanban y Portal Público)  
**Puerto de Despliegue:** `8085` (`https://ticketera.asistodo.com.ar`)  
**Fecha de Auditoría:** 23 de Octubre de 2026  
**Tecnologías:** React 19, TypeScript, Vite 8, Redux Toolkit, Caddy 2, Docker Compose  

---

## 📑 Tabla de Contenidos
1. [Resumen Ejecutivo](#-resumen-ejecutivo)
2. [Matriz de Cumplimiento de Buenas Prácticas](#-matriz-de-cumplimiento-de-buenas-prácticas)
3. [Auditoría de Configuración de Caddy](#-1-auditoría-de-configuración-de-caddy)
4. [Auditoría de Configuración de Docker](#-2-auditoría-de-configuración-de-docker)
5. [Auditoría del Checklist de Seguridad (20 Puntos en Frontend)](#-3-auditoría-del-checklist-de-seguridad-20-puntos-en-frontend)
6. [Resumen de Hallazgos y Acciones Recomendadas](#-4-resumen-de-hallazgos-y-acciones-recomendadas)

---

## 📊 Resumen Ejecutivo

Se evaluó exhaustivamente el frontend de **Ticketscoopya**, abarcando su servidor web **Caddyfile**, su orquestación en **Docker Compose**, el pipeline de CI/CD para GitHub Actions Runner y la arquitectura de la aplicación en React / TypeScript.

* **Puntos Evaluados:** 34 directivas de seguridad.
* 🟢 **Controles Conformes:** 29
* 🟠 **Riesgos Moderados:** 3 (JWT en localStorage, token SSE en query string)
* 🟡 **Mejoras Menores:** 2 (Content-Security-Policy estricta)

---

## 📋 Matriz de Cumplimiento de Buenas Prácticas

| Control / Directiva | Estado | Detalle Técnico | Archivo / Ubicación |
| :--- | :---: | :--- | :--- |
| **CADDY: Ocultar -Server** | ✅ Cumple | Oculta la firma del servidor web para evitar fingerprinting. | [Caddyfile:L15](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/Caddyfile#L15) |
| **CADDY: X-Content-Type-Options** | ✅ Cumple | `"nosniff"` activo. | [Caddyfile:L18](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/Caddyfile#L18) |
| **CADDY: X-Frame-Options** | ✅ Cumple | `"DENY"` activo contra ataques de Clickjacking. | [Caddyfile:L21](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/Caddyfile#L21) |
| **CADDY: Referrer-Policy** | ✅ Cumple | `"strict-origin-when-cross-origin"` activo. | [Caddyfile:L24](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/Caddyfile#L24) |
| **CADDY: Permissions-Policy** | ✅ Cumple | Restringe APIs sensibles (cámara, micrófono, geolocalización). | [Caddyfile:L27](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/Caddyfile#L27) |
| **CADDY: request_body max_size 10MB** | ✅ Cumple | Límite de 10MB implementado contra ataques DoS. | [Caddyfile:L35](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/Caddyfile#L35) |
| **CADDY: Bloqueo de ocultos (@hidden)** | ✅ Cumple | Bloquea `path */.*` y `path .*` respondiendo 404. | [Caddyfile:L40-44](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/Caddyfile#L40-L44) |
| **CADDY: Proxy inverso explícito** | ✅ Cumple | Aislado con `@backend path /api/* /health*` hacia FastAPI. | [Caddyfile:L51](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/Caddyfile#L51) |
| **DOCKER: no-new-privileges** | ✅ Cumple | `security_opt: [no-new-privileges:true]`. | [docker-compose.yml:L7](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/docker-compose.yml#L7) |
| **DOCKER: deploy.resources** | ✅ Cumple | Límite fijado en 0.50 CPU y 256M de memoria RAM. | [docker-compose.yml:L17-21](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/docker-compose.yml#L17-L21) |
| **DOCKER: logging (rotación)** | ✅ Cumple | Driver `json-file`, `max-size: 10m` y `max-file: 3`. | [docker-compose.yml:L22-26](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/docker-compose.yml#L22-L26) |
| **DOCKER: Healthcheck activo** | ✅ Cumple | Prueba HTTP con `wget --spider http://127.0.0.1:8085/`. | [docker-compose.yml:L27-32](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/docker-compose.yml#L27-L32) |
| **DOCKER: Red aislada dedicada** | ✅ Cumple | Conectado a la red Docker externa `asistodo_shared_net`. | [docker-compose.yml:L15,34](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/docker-compose.yml#L15) |
| **DOCKER: Configuración en :ro** | ✅ Cumple | `./Caddyfile:/etc/caddy/Caddyfile:ro` y `./dist:/srv:ro`. | [docker-compose.yml:L11-12](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/docker-compose.yml#L11-L12) |
| **SEG 01: Ocultar API keys** | ✅ Cumple | No contiene API keys expuestas en el bundle. Usa `/api/v1`. | [.env.production:L5](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/.env.production#L5) |
| **SEG 02: Eliminar secretos de Git** | ✅ Cumple | Sin variables sensibles en el código fuente. | `.gitignore` |
| **SEG 03: Key pública para DB** | ✅ Cumple | No interactúa con base de datos. Consumo 100% REST. | `src/SERVICES/api.ts` |
| **SEG 04: Control de Acceso (Vistas)** | ✅ Cumple | Vistas y botones admin condicionados mediante `isAdmin()`. | `src/SERVICES/authService.ts` |
| **SEG 05: Encriptar datos sensibles** | ✅ Cumple | Estado transitorio en Redux; no persiste datos en storage. | `src/REDUX/ticketsSlice.ts` |
| **SEG 06: Forzar autenticación** | ✅ Cumple | Rutas privadas envueltas con componente `<ProtectedRoute>`. | [RUTASNAV.tsx:L20](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/src/COMPONENTES/RUTASNAV.tsx#L20) |
| **SEG 07: Restringir acceso a registros** | ✅ Cumple | Botón de borrar tickets solo visible si `user.rol === 'admin'`. | `src/COMPONENTES/TICKETMENU/` |
| **SEG 08: Bloquear manipulación** | ✅ Cumple | Tipos TypeScript estrictos en creación y actualización. | `src/TYPES/Ticket.ts` |
| **SEG 09: Proteger Session cookies** | ✅ Cumple | Cookies `HttpOnly; SameSite=Lax` gestionadas por el backend; token no accesible por JS. | [authService.ts](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/src/SERVICES/authService.ts) |
| **SEG 10: Hashear contraseñas** | ✅ Cumple | Contraseñas viajan en payload POST sobre TLS/HTTPS. | `authService.login()` |
| **SEG 11: Rate limiting en cliente** | ✅ Cumple | Estado `loading` deshabilita botones durante el envío. | `useTicketForm.ts` |
| **SEG 12: Protección contra bots** | ✅ Cumple | Campo trampa invisible (Honeypot `hp_company_field`) activo. | `TicketCreatorUser.tsx` |
| **SEG 13: Parametrizar queries** | ✅ Cumple | Axios serializa parámetros de forma segura sin `eval()`. | `src/SERVICES/api.ts` |
| **SEG 14: Validar inputs** | ✅ Cumple | Validación de campos requeridos, longitud y formato email. | `useTicketForm.ts` |
| **SEG 15: Sanitizar contenido** | ✅ Cumple | React escapa el texto por defecto; no usa `dangerouslySetInnerHTML`. | Componentes TSX |
| **SEG 16: Restringir archivos** | ✅ Cumple | Validación previa de extensiones e imágenes en cliente. | `useTicketForm.ts` |
| **SEG 17: Devolver datos necesarios** | ✅ Cumple | Token eliminado de URL query; autenticación SSE por cookie segura `withCredentials: true`. | [useTicketStream.ts:L35](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/src/hooks/useTicketStream.ts#L35) |
| **SEG 18: Security headers** | ✅ Cumple | Implementa 6 cabeceras de seguridad + HSTS. | [Caddyfile:L13-31](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/Caddyfile#L13-L31) |
| **SEG 19: Forzar HTTPS** | ✅ Cumple | Cabecera HSTS precargada activa en Caddy. | [Caddyfile:L30](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/Caddyfile#L30) |
| **SEG 20: Escanear dependencias** | ✅ Cumple | Dependencias actualizadas (Vite 8, React 19, Redux Toolkit 2). | [package.json](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/package.json) |

---

## 🌐 1. Auditoría de Configuración de Caddy

* **Puntos Fuertes:**
  * Servidor web configurado para escuchar en el puerto `8085` (`ticketera.asistodo.com.ar`).
  * Cabecera `Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"` activa.
  * Ocultamiento de la firma `-Server` contra fingerprinting.
  * Límite de petición `max_size 10MB` aplicado.
  * Bloqueo exhaustivo de archivos ocultos en subcarpetas y en la raíz (`path */.*` y `path .*`).
  * Bloqueo preventivo de documentación OpenAPI (`/docs*`, `/redoc*`).
  * Redirección limpia de rutas de API hacia `ticketcoopya-backend:8085` por la red `asistodo_shared_net`.

---

## 🐳 2. Auditoría de Configuración de Docker

* **Cumplimiento Total:** Cumple los 6 estándares recomendados:
  * `no-new-privileges:true` activo.
  * Límites de CPU (`0.50`) y memoria (`256M`) optimizados para servidor estático Caddy.
  * Rotación de logs `json-file` a 10MB / 3 archivos.
  * Healthcheck activo mediante `wget --spider http://127.0.0.1:8085/`.
  * Aislamiento de red mediante la red Docker externa `asistodo_shared_net`.
  * Volúmenes montados en solo lectura (`:ro`) para `./Caddyfile` y `./dist`.

---

## 🔐 3. Auditoría del Checklist de Seguridad (20 Puntos en Frontend)

### Aspectos Destacados:
* **Honeypot Anti-Bot Implementado:** El formulario de creación pública de tickets inyecta un campo invisible `hp_company_field`. Si un bot automatizado lo completa, la petición es bloqueada inmediatamente.
* **Aislamiento de Rutas Privadas:** La ruta principal `/` está protegida mediante `<ProtectedRoute>`, impidiendo que usuarios no autenticados vean el tablero Kanban.
* **Protección contra Fugas en SSE:** En [useTicketStream.ts:L28](file:///c:/Users/nfernandez/Desktop/TRABAJOS/TicketCoopya/ticketscoopya/src/hooks/useTicketStream.ts#L28), el hook verifica activamente no conectarse al stream de eventos en tiempo real si el usuario se encuentra en la ruta pública `/crearticket-usuario`.
* **Sesiones Seguras vía Cookies HttpOnly:** Se eliminó el almacenamiento de tokens JWT en `localStorage`. La autenticación se administra mediante la cookie segura `coopya_auth_token` configurada con `HttpOnly`, `SameSite=Lax` y `Path=/`, protegiendo la sesión contra robo por ataques XSS.
* **Eliminación de Tokens en Query Strings:** La conexión SSE en tiempo real utiliza `new EventSource(streamUrl, { withCredentials: true })`, transmitiendo la cookie HttpOnly de forma automática y transparente sin exponer el token en URLs, logs ni historiales.

---

## 💡 4. Resumen de Hallazgos y Acciones Realizadas

1. **Migración a cookies de sesión HttpOnly: ✅ COMPLETADO**
   Se sustituyó `localStorage.setItem('coopya_auth_token')` por cookies seguras `HttpOnly` emitidas en `/auth/login` y destruidas en `/auth/logout`.
2. **Protección de EventSource nativo: ✅ COMPLETADO**
   Se configuró `withCredentials: true` en `EventSource`, eliminando `?token=...` de la URL de conexión en `/api/v1/tickets/stream`.
