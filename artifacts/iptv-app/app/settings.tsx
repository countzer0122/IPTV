import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

const APP_VERSION = '1.0.0';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  iconColor?: string;
}

function SettingsRow({ icon, label, value, onPress, destructive, iconColor }: SettingsRowProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border },
        pressed && onPress && { backgroundColor: colors.secondary },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: (iconColor ?? colors.primary) + '22' }]}>
        <Ionicons name={icon} size={18} color={iconColor ?? colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: destructive ? colors.destructive : colors.foreground }]}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value ? <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text> : null}
        {onPress && !destructive ? (
          <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
        ) : null}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { credentials, userInfo, logout } = useAuth();
  const { recentlyWatched, clearHistory } = useApp();
  const [clearing, setClearing] = useState(false);

  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleLogout = () => {
    Alert.alert(
      'Disconnect',
      'This will remove your server connection and credentials.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Remove all recently watched history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            await clearHistory();
            setClearing(false);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Settings" showBack />
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Account</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingsRow
              icon="person-circle-outline"
              label="Username"
              value={credentials?.username}
              iconColor="#6366F1"
            />
            <SettingsRow
              icon="server-outline"
              label="Server"
              value={credentials?.serverUrl?.replace(/https?:\/\//, '').split(':')[0]}
              iconColor="#0EA5E9"
            />
            {userInfo?.status && (
              <SettingsRow
                icon="checkmark-circle-outline"
                label="Status"
                value={userInfo.status}
                iconColor="#22C55E"
              />
            )}
            {userInfo?.exp_date && userInfo.exp_date !== '0' && (
              <SettingsRow
                icon="calendar-outline"
                label="Expires"
                value={new Date(parseInt(userInfo.exp_date) * 1000).toLocaleDateString()}
                iconColor="#F59E0B"
              />
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Content</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingsRow
              icon="time-outline"
              label="Watch History"
              value={`${recentlyWatched.length} items`}
              onPress={recentlyWatched.length > 0 ? handleClearHistory : undefined}
              iconColor="#8B5CF6"
            />
          </View>
        </View>

        {/* Connection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Connection</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingsRow
              icon="swap-horizontal-outline"
              label="Change Server"
              onPress={() => router.push('/login')}
              iconColor="#6366F1"
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>About</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingsRow icon="apps-outline" label="IPTV Stream" value={`v${APP_VERSION}`} iconColor="#6366F1" />
            <SettingsRow icon="code-outline" label="Xtream Codes API" value="Supported" iconColor="#22C55E" />
            <SettingsRow icon="videocam-outline" label="HLS / MPEG-TS / DASH" value="Supported" iconColor="#0EA5E9" />
          </View>
        </View>

        {/* Danger */}
        <View style={[styles.section, { marginTop: 8 }]}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingsRow
              icon="log-out-outline"
              label="Disconnect from Server"
              onPress={handleLogout}
              destructive
              iconColor={colors.destructive}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  rowIcon: {
    width: 32, height: 32,
    borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 13, fontFamily: 'Inter_400Regular' },
});
