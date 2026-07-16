import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { xtreamService } from '@/services/xtream';
import type { XtreamCredentials, UserInfo } from '@/types/xtream';

const STORAGE_KEY = '@iptv:credentials';

interface AuthState {
  credentials: XtreamCredentials | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (creds: XtreamCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    credentials: null,
    userInfo: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const creds = JSON.parse(raw) as XtreamCredentials;
          xtreamService.setCredentials(creds);
          setState({
            credentials: creds,
            userInfo: null,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState(s => ({ ...s, isLoading: false }));
        }
      } catch {
        setState(s => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const login = async (creds: XtreamCredentials) => {
    // Validate connection first
    const userInfo = await xtreamService.authenticate(creds);
    xtreamService.setCredentials(creds);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
    setState({
      credentials: creds,
      userInfo,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    xtreamService.clearCredentials();
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState({
      credentials: null,
      userInfo: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
