import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Text,
  Pressable,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ContentCard } from '@/components/ContentCard';
import { CategoryBar } from '@/components/CategoryBar';
import { LoadingGrid } from '@/components/LoadingGrid';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { xtreamService } from '@/services/xtream';
import type { VodCategory, VodStream } from '@/types/xtream';

const { width } = Dimensions.get('window');
const NUM_COLS = 3;
const CARD_W = (width - 48) / NUM_COLS;
const CARD_H = CARD_W * 1.5;

export default function MoviesScreen() {
  const colors = useColors();
  const { isFavorite } = useApp();

  const [categories, setCategories] = useState<VodCategory[]>([]);
  const [movies, setMovies] = useState<VodStream[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const [cats, vods] = await Promise.all([
        xtreamService.getVodCategories(),
        xtreamService.getVodStreams(),
      ]);
      setCategories(cats);
      setMovies(vods);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load movies');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = selectedCategoryId
      ? movies.filter(m => m.category_id === selectedCategoryId)
      : movies;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q));
    }
    return list;
  }, [movies, selectedCategoryId, search]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Movies" showBack />
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
            placeholder="Search movies..."
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
        <LoadingGrid count={9} />
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="film-outline" size={40} color={colors.mutedForeground} />
          <Text style={[styles.msg, { color: colors.mutedForeground }]}>{error}</Text>
          <Pressable onPress={load} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="film-outline" size={40} color={colors.mutedForeground} />
          <Text style={[styles.msg, { color: colors.mutedForeground }]}>No movies found</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          numColumns={NUM_COLS}
          keyExtractor={item => String(item.stream_id)}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <ContentCard
              title={item.name}
              imageUrl={item.stream_icon}
              rating={item.rating}
              isFavorite={isFavorite(`vod_${item.stream_id}`)}
              width={CARD_W}
              height={CARD_H}
              onPress={() => {
                Haptics.selectionAsync();
                router.push({
                  pathname: '/movie-detail',
                  params: {
                    id: String(item.stream_id),
                    name: item.name,
                    icon: item.stream_icon,
                    extension: item.container_extension,
                    rating: item.rating,
                  },
                });
              }}
            />
          )}
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
  grid: { padding: 12 },
  row: { gap: 12, marginBottom: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  msg: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
