import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
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
import type { VodInfo } from '@/types/xtream';

const { width, height } = Dimensions.get('window');
const HERO_H = height * 0.45;

export default function MovieDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string; name: string; icon: string; extension: string; rating: string }>();
  const { isFavorite, toggleFavorite, addRecentlyWatched } = useApp();

  const [info, setInfo] = useState<VodInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const favId = `vod_${params.id}`;
  const fav = isFavorite(favId);

  useEffect(() => {
    (async () => {
      try {
        const data = await xtreamService.getVodInfo(parseInt(params.id));
        setInfo(data);
      } catch {
        // use params as fallback
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const heroImage = info?.info?.cover_big || info?.info?.movie_image || params.icon;
  const title = info?.info?.name || params.name;
  const plot = info?.info?.plot || info?.info?.description || '';
  const rating = info?.info?.rating || params.rating || '';
  const genre = info?.info?.genre || '';
  const releaseDate = info?.info?.release_date || info?.info?.releaseDate || '';
  const cast = info?.info?.cast || '';
  const director = info?.info?.director || '';
  const runtime = info?.info?.episode_run_time || '';
  const ext = info?.movie_data?.container_extension || params.extension || 'mp4';

  const handlePlay = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const url = xtreamService.getVodStreamUrl(parseInt(params.id), ext);
    await addRecentlyWatched({
      id: favId,
      type: 'vod',
      name: title,
      icon: heroImage,
      streamId: parseInt(params.id),
      containerExtension: ext,
      watchedAt: Date.now(),
    });
    router.push({ pathname: '/player', params: { url, title, type: 'vod', icon: heroImage } });
  };

  const handleFavorite = async () => {
    await Haptics.selectionAsync();
    await toggleFavorite({
      id: favId,
      type: 'vod',
      name: title,
      icon: heroImage,
      streamId: parseInt(params.id),
      containerExtension: ext,
    });
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={{ height: HERO_H }}>
          {heroImage ? (
            <Image source={{ uri: heroImage }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="film" size={60} color={colors.mutedForeground} />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'transparent', colors.background]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { top: topPad + 8 }]}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>

          {/* Meta row */}
          <View style={styles.metaRow}>
            {rating ? (
              <View style={styles.metaChip}>
                <Ionicons name="star" size={12} color="#FBBF24" />
                <Text style={[styles.metaText, { color: '#FBBF24' }]}>{parseFloat(rating).toFixed(1)}</Text>
              </View>
            ) : null}
            {releaseDate ? (
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {releaseDate.slice(0, 4)}
              </Text>
            ) : null}
            {runtime ? (
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{runtime} min</Text>
            ) : null}
            {genre ? (
              <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
                {genre.split(',')[0]}
              </Text>
            ) : null}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              onPress={handlePlay}
              style={({ pressed }) => [
                styles.playBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.playText}>Play</Text>
            </Pressable>
            <Pressable
              onPress={handleFavorite}
              style={[styles.favBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            >
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? '#EC4899' : colors.foreground} />
            </Pressable>
          </View>

          {/* Plot */}
          {plot ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
              <Text style={[styles.plot, { color: colors.mutedForeground }]}>{plot}</Text>
            </View>
          ) : null}

          {/* Details */}
          {(cast || director) ? (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Details</Text>
              {director ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Director</Text>
                  <Text style={[styles.detailValue, { color: colors.foreground }]} numberOfLines={2}>{director}</Text>
                </View>
              ) : null}
              {cast ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Cast</Text>
                  <Text style={[styles.detailValue, { color: colors.foreground }]} numberOfLines={3}>{cast}</Text>
                </View>
              ) : null}
              {genre ? (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Genre</Text>
                  <Text style={[styles.detailValue, { color: colors.foreground }]}>{genre}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: 20, marginTop: -20 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', lineHeight: 30 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16, alignItems: 'center' },
  playBtn: {
    flex: 1, height: 48, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  playText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  favBtn: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  plot: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  detailRow: { flexDirection: 'row', marginBottom: 8, gap: 12 },
  detailLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', width: 64, flexShrink: 0 },
  detailValue: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular' },
});
