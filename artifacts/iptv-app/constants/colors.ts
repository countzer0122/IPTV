// Premium dark streaming palette — deep space aesthetic
const colors = {
  dark: {
    text: '#F0F0F5',
    tint: '#6366F1',

    background: '#0A0A0F',
    foreground: '#F0F0F5',

    card: '#13131A',
    cardForeground: '#F0F0F5',

    primary: '#6366F1',       // Electric indigo
    primaryForeground: '#FFFFFF',

    secondary: '#1C1C27',
    secondaryForeground: '#C8C8D8',

    muted: '#1C1C27',
    mutedForeground: '#8888A0',

    accent: '#8B5CF6',        // Purple accent
    accentForeground: '#FFFFFF',

    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',

    border: '#242433',
    input: '#1C1C27',

    // Custom tokens for streaming UI
    overlay: 'rgba(10,10,15,0.85)',
    gradientStart: 'transparent',
    gradientEnd: '#0A0A0F',
    success: '#22C55E',
    live: '#EF4444',
  },

  // Keep a light theme for compatibility
  light: {
    text: '#0A0A0F',
    tint: '#6366F1',
    background: '#F8F8FF',
    foreground: '#0A0A0F',
    card: '#FFFFFF',
    cardForeground: '#0A0A0F',
    primary: '#6366F1',
    primaryForeground: '#FFFFFF',
    secondary: '#F0F0F8',
    secondaryForeground: '#1C1C27',
    muted: '#F0F0F8',
    mutedForeground: '#6B6B80',
    accent: '#8B5CF6',
    accentForeground: '#FFFFFF',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    border: '#E5E5F0',
    input: '#E5E5F0',
    overlay: 'rgba(10,10,15,0.5)',
    gradientStart: 'transparent',
    gradientEnd: '#F8F8FF',
    success: '#22C55E',
    live: '#EF4444',
  },

  radius: 10,
};

export default colors;
