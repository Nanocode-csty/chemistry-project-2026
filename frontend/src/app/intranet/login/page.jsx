'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
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
      console.log('Login Page: User already logged in, redirecting to dashboard');
      router.replace('/intranet/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        // La redirección se manejará en el useEffect para mayor seguridad
      } else {
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
          <p className="mt-4 text-[#002b45] font-bold animate-pulse tracking-widest uppercase text-xs">Cargando acceso...</p>
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#002b45] via-brand-teal to-[#002b49] px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Enlace para volver al sitio */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-3 text-white/80 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-display font-bold text-sm tracking-widest">VOLVER AL SITIO PRINCIPAL</span>
          </Link>
        </div>

        {/* Card principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white rounded-lg shadow-premium p-12"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="bg-[#002b45] p-4 rounded-sm shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Lock className="w-10 h-10 text-white relative z-10" />
              </motion.div>
            </div>
            <h1 className="font-display font-black text-4xl text-[#002b45] tracking-tight mb-2">INTRANET LABCAM</h1>
            <p className="text-brand-teal font-bold text-sm tracking-[0.3em] uppercase">Sistema de Gestión de Inventarios</p>
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
              <label htmlFor="email" className="block font-display font-bold text-sm text-[#002b45] tracking-widest mb-3">
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
              <label htmlFor="password" className="block font-display font-bold text-sm text-[#002b45] tracking-widest mb-3">
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
                {isLoading ? 'INGRESANDO...' : 'INGRESAR'}
              </div>
            </motion.button>
          </form>

          {/* Footer info */}
          <div className="mt-10 pt-8 border-t-2 border-brand-border">
            <p className="text-center font-display font-bold text-xs text-gray-500 tracking-widest uppercase">
              Credenciales de prueba: admin@escuela-iq.edu / admin123
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
