import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { xtreamService } from '@/services/xtream';

const { width } = Dimensions.get('window');

interface NavTile {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  gradient: [string, string];
  description: string;
}

const NAV_TILES: NavTile[] = [
  { id: 'live', label: 'Live TV', icon: 'tv', route: '/live', gradient: ['#EF4444', '#DC2626'], description: 'Watch live channels' },
  { id: 'movies', label: 'Movies', icon: 'film', route: '/movies', gradient: ['#6366F1', '#4F46E5'], description: 'On-demand movies' },
  { id: 'series', label: 'Series', icon: 'library', route: '/series', gradient: ['#8B5CF6', '#7C3AED'], description: 'TV shows & episodes' },
  { id: 'search', label: 'Search', icon: 'search', route: '/search', gradient: ['#0EA5E9', '#0284C7'], description: 'Find content' },
  { id: 'favorites', label: 'Favorites', icon: 'heart', route: '/favorites', gradient: ['#EC4899', '#DB2777'], description: 'Your saved content' },
  { id: 'settings', label: 'Settings', icon: 'settings', route: '/settings', gradient: ['#374151', '#1F2937'], description: 'App configuration' },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { credentials } = useAuth();
  const { recentlyWatched } = useApp();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', colors.background]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerInner}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={[styles.serverLabel, { color: colors.mutedForeground }]}>
              {credentials?.serverUrl?.replace(/https?:\/\//, '').split(':')[0] ?? 'IPTV'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => router.push('/search')} style={styles.headerBtn} hitSlop={8}>
              <Ionicons name="search" size={22} color={colors.foreground} />
            </Pressable>
            <Pressable onPress={() => router.push('/settings')} style={styles.headerBtn} hitSlop={8}>
              <Ionicons name="settings-outline" size={22} color={colors.foreground} />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
      >
        {/* Nav Grid */}
        <View style={styles.grid}>
          {NAV_TILES.map((tile, idx) => (
            <NavTileItem key={tile.id} tile={tile} idx={idx} />
          ))}
        </View>

        {/* Recently Watched */}
        {recentlyWatched.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Continue Watching
            </Text>
            <FlatList
              horizontal
              data={recentlyWatched}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.recentCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    const creds = xtreamService.getCredentials();
                    if (!creds) return;
                    let url = '';
                    if (item.type === 'live') {
                      url = xtreamService.getLiveStreamUrl(item.streamId);
                    } else if (item.type === 'vod') {
                      url = xtreamService.getVodStreamUrl(item.streamId, item.containerExtension ?? 'mp4');
                    } else {
                      url = xtreamService.getSeriesStreamUrl(String(item.streamId), item.containerExtension ?? 'mp4');
                    }
                    router.push({
                      pathname: '/player',
                      params: { url, title: item.name, type: item.type, icon: item.icon },
                    });
                  }}
                >
                  {item.icon ? (
                    <Image source={{ uri: item.icon }} style={styles.recentImg} contentFit="cover" />
                  ) : (
                    <View style={[styles.recentImg, { backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name="film-outline" size={24} color={colors.mutedForeground} />
                    </View>
                  )}
                  <LinearGradient colors={['transparent', 'rgba(10,10,15,0.95)']} style={styles.recentGradient} />
                  <Text style={styles.recentName} numberOfLines={2}>{item.name}</Text>
                  <View style={[styles.recentTypeBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.recentTypeText}>
                      {item.type === 'live' ? 'LIVE' : item.type === 'vod' ? 'MOVIE' : 'SERIES'}
                    </Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function NavTileItem({ tile, idx }: { tile: NavTile; idx: number }) {
  const tileWidth = (width - 48) / 2;
  const isTall = idx === 0; // Live TV gets a taller card

  return (
    <Pressable
      onPress={() => router.push(tile.route as any)}
      style={({ pressed }) => [
        styles.tile,
        {
          width: isTall ? width - 32 : tileWidth,
          height: isTall ? 140 : 110,
          borderRadius: 14,
          overflow: 'hidden',
          opacity: pressed ? 0.85 : 1,
          transform: pressed ? [{ scale: 0.97 }] : [],
        },
      ]}
    >
      <LinearGradient colors={tile.gradient} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      {/* subtle noise overlay */}
      <View style={styles.tileOverlay} />
      <View style={styles.tileContent}>
        <Ionicons name={tile.icon} size={isTall ? 36 : 28} color="#fff" />
        <View>
          <Text style={[styles.tileLabel, { fontSize: isTall ? 22 : 17 }]}>{tile.label}</Text>
          <Text style={styles.tileDesc}>{tile.description}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingBottom: 16 },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  greeting: { color: '#F0F0F5', fontSize: 22, fontFamily: 'Inter_700Bold' },
  serverLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 4 },
  headerBtn: {
    width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
    justifyContent: 'space-between',
  },
  tile: {},
  tileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  tileContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  tileLabel: { color: '#fff', fontFamily: 'Inter_700Bold' },
  tileDesc: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'Inter_400Regular' },
  section: { marginTop: 8 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  recentList: { paddingHorizontal: 16, gap: 12 },
  recentCard: {
    width: 140,
    height: 190,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  recentImg: { width: '100%', height: '100%', position: 'absolute' },
  recentGradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '60%',
  },
  recentName: {
    position: 'absolute',
    bottom: 26,
    left: 8, right: 8,
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 14,
  },
  recentTypeBadge: {
    position: 'absolute',
    top: 8, left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recentTypeText: { color: '#fff', fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
});
