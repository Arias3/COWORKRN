import RobleConfig from "@/src/core/data/database/RobleConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from "react";
import RobleAuthLoginDataSource from "../../data/datasources/RobleAuthLoginDataSource";
import { RobleAuthLoginRepositoryImpl } from "../../data/repositories/RobleAuthLoginRepositoryImpl";
import UsuarioRepositoryRobleImpl from "../../data/repositories/UsuarioRepositoryRobleImpl";
import { Usuario } from "../../domain/entities/UserEntity";
import RobleAuthLoginRepository from "../../domain/repositories/RobleAuthLoginRepository";
import UsuarioRepository from "../../domain/repositories/UsuarioRepository";
import { RobleAuthLoginUseCase } from "../../domain/use_case/RobleAuthLoginUseCase";
import { UsuarioUseCase } from "../../domain/use_case/UsuarioUseCase";
import { RobleAuthLoginController } from "../controllers/RobleAuthLoginController";

/**
 * AuthContext
 * 
 * Authentication context for React Native.
 * Uses RobleAuthLoginController to match Flutter's implementation exactly.
 * 
 * Features:
 * - Login/Logout with Roble Auth
 * - Automatic token refresh
 * - User profile management
 * - Remember me functionality
 * - Session persistence
 */

type AuthContextType = {
  isLoggedIn: boolean;
  user: Usuario | null;
  isLoading: boolean;
  error: string | null;
  controller: RobleAuthLoginController;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [controller] = useState(() => {
    // Initialize dependencies
    const datasource = new RobleAuthLoginDataSource();
    const repository: RobleAuthLoginRepository = new RobleAuthLoginRepositoryImpl(datasource);
    const robleAuthUseCase = new RobleAuthLoginUseCase(repository);

    // Usuario repository and usecase
    const usuarioRepository: UsuarioRepository = new UsuarioRepositoryRobleImpl();
    const usuarioUseCase = new UsuarioUseCase(usuarioRepository);

    // Create controller with UsuarioUseCase injected
    const ctrl = new RobleAuthLoginController(robleAuthUseCase, usuarioUseCase);

    ctrl.init();
    return ctrl;
  });

  // Subscribe to controller changes
  useEffect(() => {
    const unsubscribe = controller.subscribe(() => {
      setUser(controller.currentUser);
      setIsLoggedIn(!!controller.currentUser && controller.accessToken.length > 0);
    });

    return () => {
      unsubscribe();
      controller.dispose();
    };
  }, [controller]);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      setIsLoading(true);

      // Check for stored access token
      const token = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');

      if (token && refreshToken) {
        // Configure Roble with existing token
        RobleConfig.setAccessToken(token);
        RobleConfig.useRoble = true;

        controller.accessToken = token;
        controller.refreshToken = refreshToken;

        // Try to refresh token to verify it's still valid
        const refreshed = await controller.refreshAccessTokenIfNeeded();

        if (refreshed) {
          // Load user from stored data or fetch from server
          // For now, we'll just mark as logged in
          // In production, you should fetch user data from server
          setIsLoggedIn(true);
          console.log('✅ Session restored successfully');
        } else {
          // Token refresh failed, clear session
          await clearSession();
        }
      }
    } catch (e) {
      console.error('Error checking existing session:', e);
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  const clearSession = async () => {
    console.log('🧹 Clearing session...');
    await AsyncStorage.removeItem('accessToken');
    console.log('🧹 accessToken removed');
    await AsyncStorage.removeItem('refreshToken');
    console.log('🧹 refreshToken removed');
    await AsyncStorage.removeItem('rememberMe');
    console.log('🧹 rememberMe removed');

    RobleConfig.clearTokens();
    console.log('🧹 RobleConfig.clearTokens() called');
    RobleConfig.useRoble = false;
    console.log('🧹 RobleConfig.useRoble set to false');

    // Clear controller state
    controller.accessToken = '';
    controller.refreshToken = '';
    controller.currentUser = null;
    console.log('🧹 Controller state cleared');

    setUser(null);
    console.log('🧹 setUser(null) called');
    setIsLoggedIn(false);
    console.log('🧹 setIsLoggedIn(false) called');
    console.log('✅ Session cleared completely');
  };

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      setError(null);
      const success = await controller.login({ email, password, rememberMe });

      if (success) {
        setUser(controller.currentUser);
        setIsLoggedIn(true);
        console.log('✅ Login successful');
        return true;
      } else {
        setError(controller.errorMessage || 'Login failed');
        console.error('❌ Login failed');
        return false;
      }
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Login error';
      setError(errorMsg);
      console.error('❌ Login error:', e);
      return false;
    }
  };

  const logout = async () => {
    console.log('🚪 === LOGOUT PROCESS STARTED ===');
    console.log('🚪 Current user:', user?.email);
    console.log('🚪 Current isLoggedIn:', isLoggedIn);

    try {
      console.log('🚪 Calling controller.logout()...');
      await controller.logout();
      console.log('🚪 controller.logout() completed');

      console.log('🚪 Calling clearSession()...');
      await clearSession();
      console.log('🚪 clearSession() completed');

      console.log('✅ Logout successful');
      console.log('🚪 New isLoggedIn state:', false);
    } catch (e) {
      console.error('❌ Logout error:', e);
      console.error('❌ Error stack:', (e as Error).stack);
      // Clear session anyway
      console.log('🚪 Clearing session despite error...');
      await clearSession();
    }
    console.log('🚪 === LOGOUT PROCESS ENDED ===');
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const success = await controller.refreshAccessTokenIfNeeded();
      return success;
    } catch (e) {
      console.error('❌ Token refresh error:', e);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn, isLoading, error, refreshToken, controller }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
