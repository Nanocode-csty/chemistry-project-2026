'use client';

import { useState } from 'react';
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
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(email, password);
    if (result.success) {
      router.push('/intranet/dashboard');
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-navy via-brand-teal to-brand-accent px-4 py-12">
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
                className="bg-brand-navy p-4 rounded-sm shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Lock className="w-10 h-10 text-white relative z-10" />
              </motion.div>
            </div>
            <h1 className="font-display font-black text-4xl text-brand-navy tracking-tight mb-2">INTRANET IQ</h1>
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
              <label htmlFor="email" className="block font-display font-bold text-sm text-brand-navy tracking-widest mb-3">
                CORREO ELECTRÓNICO
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 border-2 border-brand-border rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent bg-brand-gray/30 transition-all font-sans"
                placeholder="admin@escuela-iq.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-display font-bold text-sm text-brand-navy tracking-widest mb-3">
                CONTRASEÑA
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 border-2 border-brand-border rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent bg-brand-gray/30 transition-all font-sans"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-navy hover:bg-brand-teal text-white font-display font-black text-sm tracking-widest py-5 px-8 rounded-sm shadow-lg hover:shadow-premium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-navy disabled:hover:shadow-lg disabled:hover:y-0"
            >
              <div className="flex items-center justify-center gap-3">
                <Sparkles className="w-5 h-5 text-brand-accent" />
                {isLoading ? 'INGRESANDO...' : 'INGRESAR'}
              </div>
            </motion.button>
          </form>

          {/* Footer info */}
          <div className="mt-10 pt-8 border-t-2 border-brand-border">
            <p className="text-center font-display font-bold text-xs text-gray-500 tracking-widest uppercase">
              Credenciales de prueba: admin@escuela-iq.edu / Admin@123!
            </p>
          </div>
        </motion.div>

        {/* Texto adicional */}
        <p className="text-center text-white/70 font-display font-bold text-xs tracking-[0.3em] uppercase mt-8">
          Sistema de gestión de inventarios para la Escuela de Ingeniería Química
        </p>
      </div>
    </div>
  );
}
