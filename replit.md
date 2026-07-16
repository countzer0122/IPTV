# IPTV Stream

A full-featured IPTV client app built with Expo (React Native) for Android, iOS, and Android TV. Connects to any Xtream Codes compatible server.

## Run & Operate

- `pnpm --filter @workspace/iptv-app run dev` — run the Expo dev server
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Expo SDK 54, React Native 0.81, Expo Router (file-based routing)
- State: React Context + AsyncStorage (no backend required for IPTV functionality)
- API: Direct Xtream Codes API calls from the app (no proxy needed)
- Video: react-native-webview with HLS.js for stream playback
- UI: Custom dark streaming theme (indigo/purple accent)

## Where things live

- `artifacts/iptv-app/` — the Expo app
- `artifacts/iptv-app/app/` — all screens (expo-router file-based routing)
- `artifacts/iptv-app/services/xtream.ts` — Xtream Codes API service (singleton)
- `artifacts/iptv-app/context/AuthContext.tsx` — login state & credentials
- `artifacts/iptv-app/context/AppContext.tsx` — favorites & watch history
- `artifacts/iptv-app/types/xtream.ts` — all Xtream API types
- `artifacts/iptv-app/constants/colors.ts` — dark streaming palette

## Screens

- `/login` — server URL, username, password; validates before saving
- `/home` — main hub with Live TV, Movies, Series, Search, Favorites, Settings
- `/live` — live TV with category filter, channel list, EPG
- `/movies` — movie grid with category filter and search
- `/series` — series grid with category filter and search
- `/movie-detail` — movie info, plot, cast, play + favorite
- `/series-detail` — seasons, episode list, play individual episodes
- `/search` — cross-content search (live, movies, series)
- `/favorites` — favorited channels/movies/series
- `/settings` — account info, history, disconnect
- `/player` — full-screen video player (HLS/MPEG-TS/DASH via WebView+HLS.js)

## Architecture decisions

- No backend needed: all Xtream API calls go directly from the app to the user's server
- Credentials stored in AsyncStorage (cleared on logout)
- Singleton `xtreamService` holds the current session credentials
- Dark mode forced via `userInterfaceStyle: "dark"` in app.json
- WebView player with HLS.js handles HLS streams universally in Expo Go

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The xtreamService singleton must have credentials set before any API call; the AuthContext handles this on app start
- react-native-webview version pinned to 13.17.0 (SDK 54 expects 13.15.0 but 13.17.0 works)
- Scan the QR code from the Replit URL bar to test on a physical device via Expo Go
