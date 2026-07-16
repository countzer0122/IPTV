import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { xtreamService } from '@/services/xtream';
import type { SeriesInfo, SeriesEpisode } from '@/types/xtream';

const { width, height } = Dimensions.get('window');
const HERO_H = height * 0.38;

export default function SeriesDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; name: string; cover: string; rating: string; genre: string; plot: string }>();
  const { addRecentlyWatched } = useApp();

  const [info, setInfo] = useState<SeriesInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string>('1');

  useEffect(() => {
    (async () => {
      try {
        const data = await xtreamService.getSeriesInfo(parseInt(params.id));
        setInfo(data);
        const firstSeason = Object.keys(data.episodes ?? {})[0] ?? '1';
        setSelectedSeason(firstSeason);
      } catch {
        // fallback to params
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const seasons = info ? Object.keys(info.episodes ?? {}) : [];
  const episodes: SeriesEpisode[] = info?.episodes?.[selectedSeason] ?? [];

  const heroImage = info?.info?.cover || params.cover;
  const title = info?.info?.name || params.name;
  const plot = info?.info?.plot || params.plot || '';
  const rating = info?.info?.rating || params.rating || '';
  const genre = info?.info?.genre || params.genre || '';
  const cast = info?.info?.cast || '';
  const director = info?.info?.director || '';

  const handlePlayEpisode = async (ep: SeriesEpisode) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = xtreamService.getSeriesStreamUrl(ep.id, ep.container_extension || 'mp4');
    await addRecentlyWatched({
      id: `series_${ep.id}`,
      type: 'series',
      name: `${title} S${selectedSeason}E${ep.episode_num}`,
      icon: ep.info?.movie_image || heroImage,
      streamId: parseInt(ep.id),
      containerExtension: ep.container_extension || 'mp4',
      watchedAt: Date.now(),
    });
    router.push({
      pathname: '/player',
      params: { url, title: `${title} · S${selectedSeason} E${ep.episode_num}`, type: 'series', icon: ep.info?.movie_image || heroImage },
    });
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[2]}>
        {/* Hero */}
        <View style={{ height: HERO_H }}>
          {heroImage ? (
            <Image source={{ uri: heroImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="library" size={60} color={colors.mutedForeground} />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'transparent', colors.background]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Info */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          <View style={styles.metaRow}>
            {rating ? (
              <View style={styles.metaChip}>
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text style={[styles.metaText, { color: '#FBBF24' }]}>{parseFloat(rating).toFixed(1)}</Text>
              </View>
            ) : null}
            {genre ? <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{genre.split(',')[0]}</Text> : null}
            {seasons.length > 0 ? (
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {seasons.length} Season{seasons.length !== 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
          {plot ? <Text style={[styles.plot, { color: colors.mutedForeground }]} numberOfLines={3}>{plot}</Text> : null}
        </View>

        {/* Season tabs */}
        {seasons.length > 0 && (
          <View style={[styles.seasonsBar, { backgroundColor: colors.background, borderBottomColor: colors.border, borderTopColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.seasonsScroll}>
              {seasons.map(season => {
                const isActive = season === selectedSeason;
                return (
                  <Pressable
                    key={season}
                    onPress={() => setSelectedSeason(season)}
                    style={[
                      styles.seasonPill,
                      {
                        backgroundColor: isActive ? colors.primary : colors.secondary,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.seasonText, { color: isActive ? '#fff' : colors.mutedForeground }]}>
                      Season {season}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Episodes */}
        <View style={styles.episodeList}>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ margin: 24 }} />
          ) : episodes.length === 0 ? (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No episodes available</Text>
            </View>
          ) : (
            episodes.map(ep => (
              <Pressable
                key={ep.id}
                onPress={() => handlePlayEpisode(ep)}
                style={({ pressed }) => [
                  styles.epItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                {ep.info?.movie_image ? (
                  <Image source={{ uri: ep.info.movie_image }} style={[styles.epThumb, { borderRadius: 8 }]} contentFit="cover" />
                ) : (
                  <View style={[styles.epThumb, { backgroundColor: colors.secondary, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }]}>
                    <Ionicons name="play" size={20} color={colors.mutedForeground} />
                  </View>
                )}
                <View style={styles.epInfo}>
                  <Text style={[styles.epNum, { color: colors.mutedForeground }]}>
                    E{ep.episode_num}
                  </Text>
                  <Text style={[styles.epTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {ep.title || `Episode ${ep.episode_num}`}
                  </Text>
                  {ep.info?.plot ? (
                    <Text style={[styles.epPlot, { color: colors.mutedForeground }]} numberOfLines={2}>{ep.info.plot}</Text>
                  ) : null}
                  {ep.info?.duration ? (
                    <Text style={[styles.epDuration, { color: colors.mutedForeground }]}>{ep.info.duration}</Text>
                  ) : null}
                </View>
                <Ionicons name="play-circle-outline" size={26} color={colors.primary} />
              </Pressable>
            ))
          )}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Back */}
      <Pressable onPress={() => router.back()} style={[styles.backBtn, { top: topPad + 8 }]}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: {
    position: 'absolute', left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: 20, marginTop: -16, paddingBottom: 8 },
  title: { fontSize: 22, fontFamily: 'Inter_700Bold', lineHeight: 28 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, marginBottom: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  plot: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  seasonsBar: {
    borderBottomWidth: 1, borderTopWidth: 1,
    backgroundColor: '#0A0A0F',
  },
  seasonsScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  seasonPill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
  },
  seasonText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  episodeList: { paddingHorizontal: 16, paddingTop: 12 },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  epItem: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 8, gap: 12,
  },
  epThumb: { width: 96, height: 60, flexShrink: 0 },
  epInfo: { flex: 1, gap: 3 },
  epNum: { fontSize: 11, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.5 },
  epTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  epPlot: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  epDuration: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});
