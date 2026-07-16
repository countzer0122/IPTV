import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface ChannelCardProps {
  name: string;
  icon?: string;
  currentProgram?: string;
  nextProgram?: string;
  isLive?: boolean;
  isFavorite?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

export function ChannelCard({
  name,
  icon,
  currentProgram,
  nextProgram,
  isLive = true,
  isFavorite,
  onPress,
  onLongPress,
}: ChannelCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.logoContainer, { backgroundColor: colors.secondary }]}>
        {icon ? (
          <Image
            source={{ uri: icon }}
            style={styles.logo}
            contentFit="contain"
            transition={200}
          />
        ) : (
          <Ionicons name="tv-outline" size={28} color={colors.mutedForeground} />
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {name}
          </Text>
          {isLive && (
            <View style={[styles.liveBadge, { backgroundColor: colors.live }]}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          {isFavorite && (
            <Ionicons name="heart" size={12} color={colors.primary} />
          )}
        </View>
        {currentProgram ? (
          <Text style={[styles.program, { color: colors.foreground }]} numberOfLines={1}>
            {currentProgram}
          </Text>
        ) : null}
        {nextProgram ? (
          <Text style={[styles.nextProgram, { color: colors.mutedForeground }]} numberOfLines={1}>
            Up next: {nextProgram}
          </Text>
        ) : null}
      </View>
      <Ionicons name="play-circle-outline" size={24} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderWidth: 1,
    gap: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  logo: {
    width: 56,
    height: 56,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
  },
  liveBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  liveText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  program: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  nextProgram: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
});
