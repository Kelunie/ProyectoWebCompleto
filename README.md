# Virus Game App

A React Native client for a multiplayer social-deduction game.

The app connects to a backend API and WebSocket game server to create rooms, join players, and render live game phases.

## What this project does

- Let players enter a display name and create a game room
- Connect to a remote WebSocket server for real-time game state updates
- Render game phases and live player data via `PhaseRenderer`
- Support host actions like starting the game, voting, and advancing phases

## Project structure

- `App.tsx` — root app navigator with Home / Rooms / Game screens
- `src/screens/HomeScreen.tsx` — player name input and room creation flow
- `src/screens/RoomsScreen.tsx` — room list placeholder and lobby navigation
- `src/screens/GameScreen.tsx` — live game UI connected through WebSockets
- `src/hooks/useGameSocket.ts` — WebSocket hook for state, chat, and game actions
- `src/services/api.ts` — backend HTTP helpers for room creation and open rooms
- `src/config.ts` — API and WS server URLs

## Setup

### Prerequisites

- Node.js 22.11.0 or newer
- React Native environment configured for Android and/or iOS
- Android Studio for Android or Xcode for iOS

### Install dependencies

```sh
npm install
```

### Start Metro

```sh
npm start
```

### Run on Android

```sh
npm run android
```

### Run on iOS

```sh
npm run ios
```

## Notes

- Backend endpoints are configured in `src/config.ts`.
- `HomeScreen` currently creates a room and navigates into the live game screen.
- `RoomsScreen` is a simple placeholder and can be expanded to show actual open rooms.
- The game state is normalized inside `src/hooks/useGameSocket.ts` from server messages.

## Development commands

- `npm start` — launch Metro bundler
- `npm run android` — build and run on Android
- `npm run ios` — build and run on iOS
- `npm test` — run Jest tests
- `npm run lint` — validate code style

## Extending the app

- Add real room discovery in `src/screens/RoomsScreen.tsx`
- Improve game phase UI in `src/components/game/`
- Add offline error handling and retry logic for WebSocket connections
- Add a join-room flow for players connecting to existing games
