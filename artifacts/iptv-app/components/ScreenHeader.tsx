import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  rightIcon2?: keyof typeof Ionicons.glyphMap;
  onRightPress2?: () => void;
}

export function ScreenHeader({
  title,
  showBack = true,
  rightIcon,
  onRightPress,
  rightIcon2,
  onRightPress2,
}: ScreenHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: topPad + 8,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.inner}>
        {showBack ? (
          <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.right}>
          {rightIcon2 && onRightPress2 && (
            <Pressable onPress={onRightPress2} style={styles.iconBtn} hitSlop={12}>
              <Ionicons name={rightIcon2} size={22} color={colors.foreground} />
            </Pressable>
          )}
          {rightIcon && onRightPress ? (
            <Pressable onPress={onRightPress} style={styles.iconBtn} hitSlop={12}>
              <Ionicons name={rightIcon} size={22} color={colors.foreground} />
            </Pressable>
          ) : (
            <View style={styles.iconBtn} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
