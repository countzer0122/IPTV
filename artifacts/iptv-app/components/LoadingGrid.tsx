import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 3;
const CARD_H = CARD_W * 1.5;

function SkeletonCard() {
  const colors = useColors();
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, [anim]);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      anim.value,
      [0, 1],
      [colors.card, colors.secondary]
    ),
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        { width: CARD_W, height: CARD_H, borderRadius: colors.radius },
        animStyle,
      ]}
    />
  );
}

export function LoadingGrid({ count = 9 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

export function LoadingList({ count = 6 }: { count?: number }) {
  const colors = useColors();
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, [anim]);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      anim.value,
      [0, 1],
      [colors.card, colors.secondary]
    ),
  }));

  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.listItem,
            { borderRadius: colors.radius, borderColor: colors.border },
            animStyle,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  card: {},
  list: {
    padding: 16,
    gap: 8,
  },
  listItem: {
    height: 84,
    borderWidth: 1,
  },
});
