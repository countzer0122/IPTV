import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  SectionList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { xtreamService } from '@/services/xtream';
import { Image } from 'expo-image';
import type { LiveStream, VodStream, Series } from '@/types/xtream';

interface AllContent {
  live: LiveStream[];
  movies: VodStream[];
  series: Series[];
}

export default function SearchScreen() {
  const colors = useColors();
  const { addRecentlyWatched } = useApp();
  const [query, setQuery] = useState('');
  const [allContent, setAllContent] = useState<AllContent>({ live: [], movies: [], series: [] });
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    (async () => {
      try {
        const [live, movies, series] = await Promise.all([
          xtreamService.getLiveStreams(),
          xtreamService.getVodStreams(),
          xtreamService.getSeries(),
        ]);
        setAllContent({ live, movies, series });
      } catch {
        // content may partially load
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 300);
      }
    })();
  }, []);

  const sections = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const liveRes = allContent.live.filter(s => s.name.toLowerCase().includes(q)).slice(0, 10);
    const movieRes = allContent.movies.filter(m => m.name.toLowerCase().includes(q)).slice(0, 10);
    const seriesRes = allContent.series.filter(s => s.name.toLowerCase().includes(q)).slice(0, 10);

    return [
      liveRes.length > 0 && { title: 'Live TV', data: liveRes, type: 'live' as const },
      movieRes.length > 0 && { title: 'Movies', data: movieRes, type: 'vod' as const },
      seriesRes.length > 0 && { title: 'Series', data: seriesRes, type: 'series' as const },
    ].filter(Boolean) as Array<{ title: string; data: (LiveStream | VodStream | Series)[]; type: 'live' | 'vod' | 'series' }>;
  }, [query, allContent]);

  const totalCount = sections.reduce((acc, s) => acc + s.data.length, 0);

  const handleItemPress = async (item: LiveStream | VodStream | Series, type: 'live' | 'vod' | 'series') => {
    await Haptics.selectionAsync();
    if (type === 'live') {
      const s = item as LiveStream;
      const url = xtreamService.getLiveStreamUrl(s.stream_id);
      await addRecentlyWatched({ id: `live_${s.stream_id}`, type: 'live', name: s.name, icon: s.stream_icon, streamId: s.stream_id, watchedAt: Date.now() });
      router.push({ pathname: '/player', params: { url, title: s.name, type: 'live', icon: s.stream_icon } });
    } else if (type === 'vod') {
      const m = item as VodStream;
      router.push({ pathname: '/movie-detail', params: { id: String(m.stream_id), name: m.name, icon: m.stream_icon, extension: m.container_extension, rating: m.rating } });
    } else {
      const s = item as Series;
      router.push({ pathname: '/series-detail', params: { id: String(s.series_id), name: s.name, cover: s.cover, rating: s.rating, genre: s.genre, plot: s.plot } });
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Search" showBack={false} />
      <View style={[styles.searchWrap, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search channels, movies, series..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Loading content...</Text>
        </View>
      ) : !query.trim() ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Search across {allContent.live.length + allContent.movies.length + allContent.series.length} items
          </Text>
        </View>
      ) : sections.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="sad-outline" size={48} color={colors.mutedForeground} />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>No results for "{query}"</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, idx) => `${'stream_id' in item ? item.stream_id : 'series_id' in item ? (item as Series).series_id : idx}-${idx}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
              <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>{section.data.length} results</Text>
            </View>
          )}
          renderItem={({ item, section }) => {
            const name = 'name' in item ? item.name : '';
            const icon = 'stream_icon' in item ? item.stream_icon : 'cover' in item ? (item as Series).cover : '';
            return (
              <Pressable
                onPress={() => handleItemPress(item, section.type)}
                style={({ pressed }) => [
                  styles.resultItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                {icon ? (
                  <Image source={{ uri: icon }} style={[styles.resultIcon, { borderRadius: 8 }]} contentFit="cover" />
                ) : (
                  <View style={[styles.resultIcon, { backgroundColor: colors.secondary, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="film-outline" size={20} color={colors.mutedForeground} />
                  </View>
                )}
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: colors.foreground }]} numberOfLines={2}>{name}</Text>
                  <View style={[styles.resultBadge, { backgroundColor: section.type === 'live' ? '#EF4444' : colors.primary }]}>
                    <Text style={styles.resultBadgeText}>
                      {section.type === 'live' ? 'LIVE' : section.type === 'vod' ? 'MOVIE' : 'SERIES'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, height: 48, borderRadius: 12, borderWidth: 1, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  loadingText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  hint: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  list: { paddingBottom: 24 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  sectionCount: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  resultItem: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 10, borderWidth: 1, padding: 10, gap: 12,
  },
  resultIcon: { width: 52, height: 52, flexShrink: 0 },
  resultInfo: { flex: 1, gap: 4 },
  resultName: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  resultBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  resultBadgeText: { color: '#fff', fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
});
