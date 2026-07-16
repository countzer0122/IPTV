import React from 'react';
import {
  View,
  Text,
  FlatList,
  SectionList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { xtreamService } from '@/services/xtream';
import type { FavoriteItem } from '@/types/xtream';

export default function FavoritesScreen() {
  const colors = useColors();
  const { favorites, removeFavorite, addRecentlyWatched } = useApp();

  const sections = [
    { title: 'Live TV', data: favorites.filter(f => f.type === 'live'), type: 'live' as const },
    { title: 'Movies', data: favorites.filter(f => f.type === 'vod'), type: 'vod' as const },
    { title: 'Series', data: favorites.filter(f => f.type === 'series'), type: 'series' as const },
  ].filter(s => s.data.length > 0);

  const handlePress = async (item: FavoriteItem) => {
    await Haptics.selectionAsync();
    if (item.type === 'live') {
      const url = xtreamService.getLiveStreamUrl(item.streamId);
      await addRecentlyWatched({ id: item.id, type: 'live', name: item.name, icon: item.icon, streamId: item.streamId, watchedAt: Date.now() });
      router.push({ pathname: '/player', params: { url, title: item.name, type: 'live', icon: item.icon } });
    } else if (item.type === 'vod') {
      router.push({ pathname: '/movie-detail', params: { id: String(item.streamId), name: item.name, icon: item.icon, extension: item.containerExtension ?? 'mp4' } });
    } else {
      router.push({ pathname: '/series-detail', params: { id: String(item.streamId), name: item.name, cover: item.icon } });
    }
  };

  const handleLongPress = async (item: FavoriteItem) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await removeFavorite(item.id);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Favorites" showBack />
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No favorites yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Long press any channel, movie, or series to add it here.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{section.title}</Text>
              <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
                {section.data.length}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handlePress(item)}
              onLongPress={() => handleLongPress(item)}
              style={({ pressed }) => [
                styles.item,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              {item.icon ? (
                <Image source={{ uri: item.icon }} style={[styles.icon, { borderRadius: 8 }]} contentFit={item.type === 'live' ? 'contain' : 'cover'} />
              ) : (
                <View style={[styles.icon, { backgroundColor: colors.secondary, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons
                    name={item.type === 'live' ? 'tv-outline' : item.type === 'vod' ? 'film-outline' : 'library-outline'}
                    size={20}
                    color={colors.mutedForeground}
                  />
                </View>
              )}
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>{item.name}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => removeFavorite(item.id)}
                  hitSlop={10}
                  style={styles.removeBtn}
                >
                  <Ionicons name="heart" size={20} color="#EC4899" />
                </Pressable>
                <Ionicons name="play-circle-outline" size={24} color={colors.primary} />
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  emptyDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  list: { paddingBottom: 24 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  sectionCount: {
    fontSize: 13, fontFamily: 'Inter_500Medium',
    paddingHorizontal: 8, paddingVertical: 2,
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 10, borderWidth: 1, padding: 10, gap: 12,
  },
  icon: { width: 56, height: 56, flexShrink: 0 },
  info: { flex: 1 },
  name: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  removeBtn: {},
});
