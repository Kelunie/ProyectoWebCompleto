# Virus Game Spectator

Frontend web para ver partidas de Virus Game en tiempo real sin entrar como jugador.

La idea es simple: abres la lista de salas, eliges una partida y ves el estado, chat y acciones desde modo espectador.

## Qué hace esta web

- Lista salas abiertas y en vivo.
- Permite filtrar por tipo de sala (todas, en vivo, pendientes).
- Abre una vista detallada por sala.
- Carga snapshot inicial por HTTP.
- Se suscribe por WebSocket con evento watch_room para recibir actualizaciones en vivo.
- Combina historial de chat por HTTP con chat en tiempo real para no perder mensajes.
- Muestra historial de acciones, estado de fase/ronda, jugadores vivos, progreso de cura y cierre de partida.
- Incluye reconexión automática si el socket se cae.

## Lo que no hace (a propósito)

- No hace join como jugador.
- No envía acciones de juego (votar, infectar, investigar, avanzar fase, etc.).

Este cliente está pensado para observar, no para jugar.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS

## Estructura rápida

- [src/App.tsx](src/App.tsx): rutas principales.
- [src/components/LiveRoomsList.tsx](src/components/LiveRoomsList.tsx): listado de salas.
- [src/components/SpectatorRoom.tsx](src/components/SpectatorRoom.tsx): vista detallada de la sala.
- [src/hooks/useSpectatorRoom.ts](src/hooks/useSpectatorRoom.ts): lógica de snapshot + websocket + reconexión.
- [src/hooks/useGameSocket.ts](src/hooks/useGameSocket.ts): normalización compartida del estado entrante.
- [src/services/api.ts](src/services/api.ts): llamadas HTTP.
- [src/config.ts](src/config.ts): URLs base de API y WebSocket.

## Flujo de datos

1. Entras a la raíz y se piden salas por HTTP.
2. Al abrir una sala, el cliente carga:
   - estado actual,
   - acciones,
   - chat.
3. Luego abre WebSocket y envía:

```json
{ "type": "watch_room", "room_id": "..." }
```

4. Cada public_state recibido actualiza la UI.
5. Si se pierde conexión, intenta reconectar con backoff exponencial.

## Endpoints esperados del backend

- GET /rooms/live
- GET /rooms/open
- GET /rooms/:room_id/state
- GET /rooms/:room_id/actions
- GET /rooms/:room_id/chat
- WS /ws

Nota: el cliente tolera respuestas envueltas (por ejemplo con items o state), para adaptarse a variaciones del backend.

## Configuración

Las URLs están en [src/config.ts](src/config.ts):

- API_BASE_URL
- WS_URL

Si usas otro backend o entorno local, cámbialas ahí.

## Levantar el proyecto

### 1) Instalar dependencias

```bash
npm install
```

### 2) Desarrollo

```bash
npm run dev
```

### 3) Build de producción

```bash
npm run build
```

### 4) Vista previa del build

```bash
npm run preview
```

## Scripts

- npm run dev: entorno de desarrollo con recarga en caliente.
- npm run build: compila TypeScript y genera build.
- npm run preview: sirve el build generado.
- npm run lint: ejecuta ESLint.

## Rutas de la app

- /: listado de salas.
- /room/:roomId: detalle de una sala en modo espectador.

## Detalles útiles para pruebas

- Si no hay salas, la vista principal muestra estado vacío con mensaje claro.
- Si el socket falla, la pantalla sigue mostrando lo último conocido y marca error/sincronización.
- El estado mostrado depende de lo que el backend exponga como PublicState.

---
