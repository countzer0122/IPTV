import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ChannelCard } from '@/components/ChannelCard';
import { CategoryBar } from '@/components/CategoryBar';
import { LoadingList } from '@/components/LoadingGrid';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { xtreamService } from '@/services/xtream';
import type { LiveCategory, LiveStream } from '@/types/xtream';

export default function LiveScreen() {
  const colors = useColors();
  const { isFavorite, toggleFavorite, addRecentlyWatched } = useApp();

  const [categories, setCategories] = useState<LiveCategory[]>([]);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const [cats, strs] = await Promise.all([
        xtreamService.getLiveCategories(),
        xtreamService.getLiveStreams(),
      ]);
      setCategories(cats);
      setStreams(strs);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load channels');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = selectedCategoryId
      ? streams.filter(s => s.category_id === selectedCategoryId)
      : streams;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [streams, selectedCategoryId, search]);

  const handlePlay = useCallback(
    async (stream: LiveStream) => {
      await Haptics.selectionAsync();
      const url = xtreamService.getLiveStreamUrl(stream.stream_id);
      await addRecentlyWatched({
        id: `live_${stream.stream_id}`,
        type: 'live',
        name: stream.name,
        icon: stream.stream_icon,
        streamId: stream.stream_id,
        watchedAt: Date.now(),
      });
      router.push({
        pathname: '/player',
        params: { url, title: stream.name, type: 'live', icon: stream.stream_icon },
      });
    },
    [addRecentlyWatched]
  );

  const handleFavorite = useCallback(
    async (stream: LiveStream) => {
      await toggleFavorite({
        id: `live_${stream.stream_id}`,
        type: 'live',
        name: stream.name,
        icon: stream.stream_icon,
        streamId: stream.stream_id,
        categoryId: stream.category_id,
      });
    },
    [toggleFavorite]
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Live TV" showBack />
      <CategoryBar
        categories={categories.map(c => ({ id: c.category_id, name: c.category_name }))}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />
      <View style={[styles.searchWrap, { borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search channels..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading ? (
        <LoadingList count={8} />
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="wifi-outline" size={40} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>{error}</Text>
          <Pressable onPress={load} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="tv-outline" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No channels found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.stream_id)}
          renderItem={({ item }) => (
            <ChannelCard
              name={item.name}
              icon={item.stream_icon}
              isLive
              isFavorite={isFavorite(`live_${item.stream_id}`)}
              onPress={() => handlePlay(item)}
              onLongPress={() => handleFavorite(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.primary}
            />
          }
          getItemLayout={(_, index) => ({ length: 92, offset: 92 * index, index })}
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
    paddingHorizontal: 12, height: 40, borderRadius: 20,
    borderWidth: 1, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  list: { paddingVertical: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  errorText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
