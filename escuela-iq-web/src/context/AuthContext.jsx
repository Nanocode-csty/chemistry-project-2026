'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, dbOperations } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener usuario actual al cargar
    const checkUser = async () => {
      try {
        const userData = await dbOperations.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Error checking user:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Escuchar cambios en autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await dbOperations.login(email, password);
      if (error) throw error;
      setUser(data.user);
      return { success: true };
    } catch (err) {
      const message = err.message || 'Error al iniciar sesión';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await dbOperations.logout();
      setUser(null);
      return { success: true };
    } catch (err) {
      const message = err.message || 'Error al cerrar sesión';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
