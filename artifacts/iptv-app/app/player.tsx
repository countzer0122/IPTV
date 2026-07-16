import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useCast, useCurrentCastState } from '@/hooks/useCast';

// react-native-google-cast CastButton — safe import for Expo Go
let CastButton: React.ComponentType<{ style?: any; tintColor?: string }> | null = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    CastButton = require('react-native-google-cast').CastButton;
  } catch {
    // Expo Go — no cast button
  }
}

// We use a WebView-based player as a reliable fallback that works in Expo Go
// for all stream types (HLS, MPEG-TS, DASH).
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

// ─── Cast banner ──────────────────────────────────────────────────────────────
function CastingBanner({ title, onStop }: { title: string; onStop: () => void }) {
  return (
    <View style={styles.castBanner}>
      <Ionicons name="tv" size={18} color="#fff" style={{ marginRight: 8 }} />
      <Text style={styles.castBannerText} numberOfLines={1}>
        Casting: {title}
      </Text>
      <TouchableOpacity onPress={onStop} style={styles.castStopBtn}>
        <Ionicons name="close-circle" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Video player (local WebView) ─────────────────────────────────────────────
function VideoPlayer({
  url,
  title,
  thumbnail,
}: {
  url: string;
  title: string;
  thumbnail?: string;
}) {
  const [showControls, setShowControls] = useState(true);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const controlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isAvailable, isConnected, castMedia, stopCast } = useCast(url, title, thumbnail);
  const castState = useCurrentCastState();

  // Auto-hide controls after 4 s
  useEffect(() => {
    if (showControls) {
      if (controlTimer.current) clearTimeout(controlTimer.current);
      controlTimer.current = setTimeout(() => setShowControls(false), 4000);
    }
    return () => {
      if (controlTimer.current) clearTimeout(controlTimer.current);
    };
  }, [showControls]);

  const isHls = url.includes('.m3u8');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
video { width: 100vw; height: 100vh; object-fit: contain; }
</style>
${isHls ? `<script src="https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js"></script>` : ''}
</head>
<body>
<video id="v" autoplay controls playsinline></video>
<script>
const v = document.getElementById('v');
const src = "${url.replace(/"/g, '\\"')}";
if (${isHls ? 'true' : 'false'} && typeof Hls !== 'undefined' && Hls.isSupported()) {
  const hls = new Hls({ enableWorker: false });
  hls.loadSource(src);
  hls.attachMedia(v);
  hls.on(Hls.Events.MANIFEST_PARSED, () => v.play());
} else {
  v.src = src;
  v.play().catch(() => {});
}
</script>
</body>
</html>`;

  return (
    <View style={styles.playerRoot}>
      <StatusBar hidden />

      {/* If connected to Chromecast show the banner, otherwise show the WebView */}
      {isConnected ? (
        <View style={styles.castingScreen}>
          <Ionicons name="tv" size={64} color="#6366F1" />
          <Text style={styles.castingTitle}>{title}</Text>
          <Text style={styles.castingSubtitle}>Playing on your TV</Text>
          <TouchableOpacity style={styles.castingStopBtn} onPress={stopCast}>
            <Ionicons name="stop-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.castingStopText}>Stop casting</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          source={{ html }}
          style={styles.webview}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo
          javaScriptEnabled
          originWhitelist={['*']}
        />
      )}

      {/* Tap anywhere to toggle controls */}
      <Pressable
        onPress={() => setShowControls(v => !v)}
        style={StyleSheet.absoluteFill}
        pointerEvents="box-none"
      />

      {/* Overlay controls */}
      {showControls && (
        <View style={[styles.overlay, { paddingTop: topPad }]}>
          <View style={styles.topBar}>
            {/* Back */}
            <Pressable onPress={() => router.back()} style={styles.overlayBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>

            {/* Title */}
            <Text style={styles.overlayTitle} numberOfLines={1}>{title}</Text>

            {/* Cast button — only shown in EAS/native build */}
            {isAvailable && CastButton ? (
              <View style={styles.castBtnWrapper}>
                <CastButton style={styles.castBtnIcon} tintColor="#fff" />
              </View>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>

          {/* Cast-to-TV row when cast SDK is present but not yet connected */}
          {isAvailable && !isConnected && (
            <View style={styles.castRow}>
              <TouchableOpacity style={styles.castTvBtn} onPress={castMedia}>
                <Ionicons name="tv-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.castTvText}>Cast to TV</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function PlayerScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{
    url: string;
    title: string;
    type: string;
    icon: string;
    thumbnail?: string;
  }>();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  if (!params.url) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: topPad + 8 }]}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.foreground }]}>No stream URL provided</Text>
          <Pressable onPress={() => router.back()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.retryText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: topPad + 8 }]}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.center}>
          <Ionicons name="tv-outline" size={56} color={colors.primary} />
          <Text style={[styles.webTitle, { color: colors.foreground }]}>{params.title}</Text>
          <Text style={[styles.webDesc, { color: colors.mutedForeground }]}>
            Stream: {params.url.length > 60 ? params.url.slice(0, 57) + '...' : params.url}
          </Text>
          <Pressable onPress={() => router.back()} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.retryText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <VideoPlayer
      url={params.url}
      title={params.title ?? ''}
      thumbnail={params.thumbnail}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  playerRoot: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: '#000' },

  // Controls overlay
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  overlayBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  overlayTitle: { flex: 1, color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },

  // Cast button wrapper
  castBtnWrapper: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  castBtnIcon: { width: 24, height: 24 },

  // "Cast to TV" quick-tap row
  castRow: { marginTop: 8, flexDirection: 'row' },
  castTvBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(99,102,241,0.85)',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
  },
  castTvText: { color: '#fff', fontSize: 13, fontFamily: 'Inter_600SemiBold' },

  // Casting full-screen state (TV is playing)
  castingScreen: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 16, padding: 32,
  },
  castingTitle: {
    color: '#fff', fontSize: 22, fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  castingSubtitle: {
    color: 'rgba(255,255,255,0.6)', fontSize: 14, fontFamily: 'Inter_400Regular',
  },
  castingStopBtn: {
    marginTop: 8, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.85)',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 24,
  },
  castingStopText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' },

  // Cast banner (not currently used but available)
  castBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  castBannerText: { flex: 1, color: '#fff', fontSize: 14, fontFamily: 'Inter_500Medium' },
  castStopBtn: { padding: 4 },

  // Error / fallback
  backBtn: {
    position: 'absolute', left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  errorText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', textAlign: 'center' },
  webTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  webDesc: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
  retryText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
