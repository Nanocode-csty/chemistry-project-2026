'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/intranet/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Ocurrió un fallo de conexión. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray/30">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-brand-border border-t-brand-navy rounded-full"></div>
          </div>
          <p className="mt-4 text-[#002b45] font-bold animate-pulse tracking-widest uppercase text-xs">
            Cargando INVENTA...
          </p>
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#002b45] via-brand-teal to-[#002b49] px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Card principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white rounded-lg shadow-premium p-12 border-t-4 border-[#9ABE00]"
        >
          {/* Header con Logo de roo Soluciones Digitales + INVENTA */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-slate-50 px-6 py-4 rounded-sm border border-slate-200/80 shadow-sm flex items-center justify-center"
              >
                <img
                  src="/roo-logo.png"
                  alt="roo Soluciones Digitales"
                  className="h-12 md:h-14 w-auto object-contain"
                />
              </motion.div>
            </div>
            <h1 className="font-display font-black text-4xl text-[#002b45] tracking-tight mb-2">
              INVENTA
            </h1>
            <p className="text-brand-teal font-bold text-xs tracking-[0.25em] uppercase">
              Sistema de Gestión de Inventarios y Laboratorios
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8 bg-brand-red/10 border-l-4 border-brand-red p-6 rounded-sm"
            >
              <div className="flex items-center gap-4">
                <AlertCircle className="w-6 h-6 text-brand-red" />
                <p className="text-brand-red font-bold">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block font-display font-bold text-sm text-[#002b45] tracking-widest mb-3"
              >
                CORREO ELECTRÓNICO
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 border-2 border-brand-border rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-[#9ABE00] bg-brand-gray/30 transition-all font-sans"
                placeholder="admin@escuela-iq.edu"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-display font-bold text-sm text-[#002b45] tracking-widest mb-3"
              >
                CONTRASEÑA
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 border-2 border-brand-border rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-[#9ABE00] bg-brand-gray/30 transition-all font-sans"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#002b45] hover:bg-brand-teal text-white font-display font-black text-sm tracking-widest py-5 px-8 rounded-sm shadow-lg hover:shadow-premium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#002b45] disabled:hover:shadow-lg disabled:hover:y-0"
            >
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-5 h-5 text-[#9ABE00]" />
                {isLoading ? 'INGRESANDO...' : 'INGRESAR A INVENTA'}
              </div>
            </motion.button>
          </form>

          {/* Footer info */}
          <div className="mt-10 pt-6 border-t border-brand-border flex flex-col items-center gap-2">
            <p className="text-center font-display font-bold text-[11px] text-gray-500 tracking-widest uppercase">
              Credenciales de acceso: admin@escuela-iq.edu / admin123
            </p>
            <span className="text-[10px] font-bold text-[#002b45]/60 tracking-widest uppercase">
              Desarrollado por roo Soluciones Digitales
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
