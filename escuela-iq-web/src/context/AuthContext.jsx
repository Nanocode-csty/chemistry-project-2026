'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dbOperations } from '@/lib/supabase';

const AuthContext = createContext();

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos de inactividad

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Función de cierre de sesión segura
  const logout = useCallback(async () => {
    try {
      console.log('Logging out...');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('iq_token');
        localStorage.removeItem('iq_user');
        localStorage.removeItem('iq_last_activity');
      }
      await dbOperations.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  // Verificar sesión y tiempo de inactividad
  const checkSession = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('iq_token');
    const lastActivity = localStorage.getItem('iq_last_activity');
    const now = Date.now();

    if (token && lastActivity) {
      const inactiveTime = now - parseInt(lastActivity);
      if (inactiveTime > SESSION_TIMEOUT) {
        console.warn(`Sesión expirada por inactividad: ${Math.round(inactiveTime / 1000)}s`);
        logout();
        return false;
      }
      // Actualizar última actividad
      localStorage.setItem('iq_last_activity', now.toString());
      return true;
    }
    return false;
  }, [logout]);

  useEffect(() => {
    setIsMounted(true);
    
    const initAuth = async () => {
      if (typeof window === 'undefined') return;

      console.log('AuthContext: Initializing...');
      try {
        const savedUser = localStorage.getItem('iq_user');
        const token = localStorage.getItem('iq_token');

        if (savedUser && token) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            console.log('AuthContext: Restored from localStorage:', parsedUser.email);
            
            // Validar sesión
            checkSession();
          } catch (e) {
            console.error('AuthContext: Error parsing saved user:', e);
            localStorage.removeItem('iq_user');
            localStorage.removeItem('iq_token');
          }
        } else {
          console.log('AuthContext: No saved session found');
        }
      } catch (err) {
        console.error('AuthContext: Init error:', err);
      } finally {
        console.log('AuthContext: Initialization complete');
        setLoading(false);
      }
    };

    initAuth();

    // Eventos para detectar actividad
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    const handleActivity = () => {
      if (typeof window !== 'undefined' && localStorage.getItem('iq_token')) {
        localStorage.setItem('iq_last_activity', Date.now().toString());
      }
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    // Intervalo para verificar expiración cada minuto
    const interval = setInterval(() => {
      checkSession();
    }, 60000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(interval);
    };
  }, [checkSession]);

  const login = async (email, password) => {
    setIsLoggingIn(true);
    try {
      console.log('Attempting login for:', email);
      const response = await dbOperations.login(email, password);
      
      if (response.error) {
        return { 
          success: false, 
          error: typeof response.error === 'string' ? response.error : (response.error.message || 'Credenciales inválidas') 
        };
      }

      const { data } = response;
      
      // Manejar respuesta de backend local o Supabase
      const token = data?.token || data?.session?.access_token;
      const userData = data?.user;

      if (typeof window !== 'undefined' && token && userData) {
        console.log('Storing token and user data...');
        localStorage.setItem('iq_token', token);
        localStorage.setItem('iq_user', JSON.stringify(userData));
        localStorage.setItem('iq_last_activity', Date.now().toString());
      }
      
      setUser(userData || null);
      console.log('User state updated:', data?.user?.email);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'Error inesperado en el servidor' };
    } finally {
      setIsLoggingIn(false);
    }
  };

  const value = {
    user,
    loading: !isMounted || loading || isLoggingIn,
    login,
    logout,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
