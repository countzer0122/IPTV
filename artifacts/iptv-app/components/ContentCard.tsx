import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface ContentCardProps {
  title: string;
  imageUrl?: string;
  rating?: string;
  genre?: string;
  isFavorite?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  width?: number;
  height?: number;
  showTitle?: boolean;
}

export function ContentCard({
  title,
  imageUrl,
  rating,
  genre,
  isFavorite,
  onPress,
  onLongPress,
  width: w = CARD_WIDTH,
  height: h = CARD_HEIGHT,
  showTitle = true,
}: ContentCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        { width: w, height: h, borderRadius: colors.radius, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, { borderRadius: colors.radius }]}
          contentFit="cover"
          transition={300}
        />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: colors.card, borderRadius: colors.radius }]}>
          <Ionicons name="film-outline" size={32} color={colors.mutedForeground} />
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(10,10,15,0.95)']}
        style={[styles.gradient, { borderRadius: colors.radius }]}
      />
      {isFavorite && (
        <View style={styles.favBadge}>
          <Ionicons name="heart" size={12} color={colors.primary} />
        </View>
      )}
      {rating && (
        <View style={[styles.ratingBadge, { backgroundColor: 'rgba(10,10,15,0.85)' }]}>
          <Ionicons name="star" size={9} color="#FBBF24" />
          <Text style={styles.ratingText}>{parseFloat(rating).toFixed(1)}</Text>
        </View>
      )}
      {showTitle && (
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {genre ? (
            <Text style={styles.genre} numberOfLines={1}>{genre}</Text>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  favBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  ratingBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  ratingText: {
    color: '#FBBF24',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  title: {
    color: '#F0F0F5',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 14,
  },
  genre: {
    color: '#8888A0',
    fontSize: 9,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
});
