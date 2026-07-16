import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FavoriteItem, RecentlyWatched } from '@/types/xtream';

const FAVORITES_KEY = '@iptv:favorites';
const RECENT_KEY = '@iptv:recently_watched';
const MAX_RECENT = 20;

interface AppContextValue {
  favorites: FavoriteItem[];
  recentlyWatched: RecentlyWatched[];
  isFavorite: (id: string) => boolean;
  addFavorite: (item: FavoriteItem) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  toggleFavorite: (item: FavoriteItem) => Promise<void>;
  addRecentlyWatched: (item: RecentlyWatched) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<RecentlyWatched[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [favRaw, recentRaw] = await Promise.all([
          AsyncStorage.getItem(FAVORITES_KEY),
          AsyncStorage.getItem(RECENT_KEY),
        ]);
        if (favRaw) setFavorites(JSON.parse(favRaw));
        if (recentRaw) setRecentlyWatched(JSON.parse(recentRaw));
      } catch { /* ignore */ }
    })();
  }, []);

  const saveFavorites = useCallback(async (items: FavoriteItem[]) => {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    setFavorites(items);
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.some(f => f.id === id),
    [favorites]
  );

  const addFavorite = useCallback(
    async (item: FavoriteItem) => {
      const next = [item, ...favorites.filter(f => f.id !== item.id)];
      await saveFavorites(next);
    },
    [favorites, saveFavorites]
  );

  const removeFavorite = useCallback(
    async (id: string) => {
      await saveFavorites(favorites.filter(f => f.id !== id));
    },
    [favorites, saveFavorites]
  );

  const toggleFavorite = useCallback(
    async (item: FavoriteItem) => {
      if (isFavorite(item.id)) await removeFavorite(item.id);
      else await addFavorite(item);
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  const addRecentlyWatched = useCallback(
    async (item: RecentlyWatched) => {
      const next = [item, ...recentlyWatched.filter(r => r.id !== item.id)].slice(
        0,
        MAX_RECENT
      );
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
      setRecentlyWatched(next);
    },
    [recentlyWatched]
  );

  const clearHistory = useCallback(async () => {
    await AsyncStorage.removeItem(RECENT_KEY);
    setRecentlyWatched([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        favorites,
        recentlyWatched,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        addRecentlyWatched,
        clearHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
