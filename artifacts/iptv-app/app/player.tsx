import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

const { width, height } = Dimensions.get('window');

// We use a WebView-based player as a reliable fallback that works in Expo Go
// for all stream types (HLS, MPEG-TS). When expo-av or expo-video is available
// in a custom build, you can swap this out.
import { WebView } from 'react-native-webview';

function VideoPlayer({ url, title }: { url: string; title: string }) {
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen] = useState(false);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 4000);
    return () => clearTimeout(timer);
  }, [showControls]);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
video { width: 100vw; height: 100vh; object-fit: contain; }
</style>
${url.includes('.m3u8') ? `<script src="https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js"></script>` : ''}
</head>
<body>
<video id="v" autoplay controls playsinline></video>
<script>
const v = document.getElementById('v');
const src = "${url.replace(/"/g, '\\"')}";
if (${url.includes('.m3u8') ? 'true' : 'false'} && typeof Hls !== 'undefined' && Hls.isSupported()) {
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
      <WebView
        source={{ html }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        javaScriptEnabled
        originWhitelist={['*']}
      />
      <Pressable
        onPress={() => setShowControls(v => !v)}
        style={StyleSheet.absoluteFill}
        pointerEvents="box-none"
      />
      {showControls && (
        <View style={[styles.overlay, { paddingTop: topPad }]}>
          <View style={styles.topBar}>
            <Pressable onPress={() => router.back()} style={styles.overlayBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.overlayTitle} numberOfLines={1}>{title}</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>
      )}
    </View>
  );
}

export default function PlayerScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ url: string; title: string; type: string; icon: string }>();
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

  // On web, open in new tab
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

  return <VideoPlayer url={params.url} title={params.title ?? ''} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  playerRoot: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: '#000' },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  overlayBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  overlayTitle: { flex: 1, color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
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
