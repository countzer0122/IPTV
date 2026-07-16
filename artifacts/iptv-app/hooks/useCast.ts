/**
 * useCast — safe wrapper around react-native-google-cast.
 *
 * react-native-google-cast requires a custom/EAS build and is NOT available
 * in Expo Go. All imports are guarded with try/catch so the app loads fine
 * in Expo Go; cast features simply become no-ops.
 */
import { Platform } from 'react-native';

// ─── safe dynamic require ────────────────────────────────────────────────────
type CastLib = typeof import('react-native-google-cast');

let castLib: CastLib | null = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    castLib = require('react-native-google-cast') as CastLib;
  } catch {
    // Running in Expo Go — Cast SDK not available
  }
}

// Re-export CastState enum so callers don't import the lib directly
export const CastState = castLib?.CastState ?? null;

// ─── useCastState ─────────────────────────────────────────────────────────────
/**
 * Returns the current CastState value (CONNECTED, CONNECTING, etc.).
 * Returns null when cast is unavailable (Expo Go).
 */
export function useCurrentCastState(): string | null {
  const hook = castLib?.useCastState;
  // Hooks must be called unconditionally — we call the real hook if available,
  // otherwise we return a stable null via a tiny inline hook shim.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const state = hook ? hook() : null;
  return state ?? null;
}

// ─── useCast ──────────────────────────────────────────────────────────────────
export interface UseCastResult {
  /** Whether the Cast SDK is loaded (always false in Expo Go) */
  isAvailable: boolean;
  /** True when a Chromecast/Google TV is connected */
  isConnected: boolean;
  /** Send the stream to the TV */
  castMedia: () => Promise<void>;
  /** Stop casting */
  stopCast: () => Promise<void>;
  /** Pause remote playback */
  pause: () => Promise<void>;
  /** Resume remote playback */
  play: () => Promise<void>;
}

export function useCast(
  url: string,
  title: string,
  thumbnail?: string,
): UseCastResult {
  const client = castLib?.useRemoteMediaClient
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      castLib.useRemoteMediaClient()
    : null;

  const castState = useCurrentCastState();
  const isConnected =
    castState === castLib?.CastState?.CONNECTED ||
    castState === castLib?.CastState?.CONNECTING;

  const castMedia = async () => {
    if (!client) return;
    const contentType = url.includes('.m3u8')
      ? 'application/x-mpegURL'
      : url.includes('.mpd')
      ? 'application/dash+xml'
      : 'video/mp4';

    await client.loadMedia({
      mediaInfo: {
        contentUrl: url,
        contentType,
        metadata: {
          type: 0, // MOVIE
          title,
          images: thumbnail ? [{ url: thumbnail }] : [],
        },
      },
    });
  };

  const stopCast = async () => {
    if (!client) return;
    await client.stop();
  };

  const pause = async () => {
    if (!client) return;
    await client.pause();
  };

  const play = async () => {
    if (!client) return;
    await client.play();
  };

  return {
    isAvailable: !!castLib,
    isConnected,
    castMedia,
    stopCast,
    pause,
    play,
  };
}
