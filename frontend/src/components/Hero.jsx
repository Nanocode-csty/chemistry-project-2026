'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Beaker, ChevronRight, Sparkles, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import { dbOperations } from '@/lib/supabase';

const Hero = () => {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const { data, error } = await dbOperations.getHero();
        if (data) setHero(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHero();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-brand-navy animate-spin" />
      </div>
    );
  }

  if (!hero) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
    },
  };

  const floatVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Background Layer for Split Design */}
      <div className="absolute top-0 right-0 w-full lg:w-[45%] h-full bg-[#002b45] hidden lg:block z-0" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Content Block */}
          <div className="lg:col-span-7 py-12 lg:py-20 lg:pr-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-4 mb-6"
              >
                <div className="w-12 h-1.5 bg-[#98C560]" />
                <span className="text-[#002b45] font-display font-black text-[12px] tracking-[0.4em] uppercase flex items-center gap-2">
                  <Sparkles size={16} className="text-[#98C560]" /> INNOVACIÓN QUÍMICA 2026
                </span>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="text-5xl md:text-8xl font-display font-black text-[#002b45] leading-[0.9] mb-8 tracking-tighter uppercase"
              >
                {hero.titulo_linea1} <br />
                {(hero.titulo_linea2 || '').split(' ')[0]} <span className="text-[#98C560] italic">{(hero.titulo_linea2 || '').split(' ').slice(1).join(' ')}</span> <br />
                {hero.titulo_linea3}
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-lg md:text-xl text-slate-500 mb-10 max-w-xl font-sans font-medium leading-relaxed border-l-4 border-[#002b45] pl-8"
              >
                {hero.descripcion}
              </motion.p>

              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-6"
              >
                <CTAButton href={hero.cta_primario_link} primary>
                  {hero.cta_primario_texto}
                </CTAButton>
                <CTAButton href={hero.cta_secundario_link}>
                  {hero.cta_secundario_texto}
                </CTAButton>
              </motion.div>

              {/* Dynamic Stats Section */}
              <motion.div 
                variants={itemVariants}
                className="mt-16 grid grid-cols-3 gap-10"
              >
                <StatItem value="45+" label="Patentes" />
                <StatItem value="120+" label="Proyectos" />
                <StatItem value="15" label="Laboratorios" />
              </motion.div>
            </motion.div>
          </div>

          {/* Right Visual Block */}
          <div className="lg:col-span-5 relative h-full min-h-[500px] lg:min-h-0">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
              className="relative z-10 h-full"
            >
              <div className="relative overflow-hidden shadow-2xl aspect-[4/5] lg:aspect-[3/4] lg:h-[650px] group border-b-[10px] border-[#98C560] bg-slate-50">
                <img 
                  src={hero.imagen_url || "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=1200"} 
                  alt="Ingeniería Química Avanzada" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms] ease-out relative z-10"
                />
                <div className="absolute inset-0 bg-[#002b45]/10 z-20 pointer-events-none" />
                
                {/* Floating News Card */}
                <motion.div 
                  variants={floatVariants}
                  animate="animate"
                  className="absolute bottom-8 left-0 right-0 px-8 z-30"
                >
                  <div className="bg-[#002b45] p-8 text-white shadow-2xl relative overflow-hidden group/card border-t-4 border-[#98C560]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="flex items-center gap-2 text-[#98C560] text-[11px] font-black tracking-[0.3em] uppercase mb-4">
                      <Zap size={16} /> NOVEDAD TECNOLÓGICA
                    </div>
                    <h3 className="text-2xl font-display font-black uppercase mb-3 relative z-10 leading-tight tracking-tight">Síntesis de <br />Hidrógeno Verde</h3>
                    <p className="text-sm text-slate-300 mb-6 relative z-10 font-sans font-medium">Nuevo proceso catalítico optimizado para la industria energética.</p>
                    <Link href="/investigaciones" className="flex items-center gap-2 text-[11px] font-black tracking-[0.25em] uppercase relative z-10 text-[#98C560] hover:text-white transition-colors">
                      VER DETALLES <ChevronRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Decorative Elements */}
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-10 -right-10 w-40 h-40 border-2 border-[#002b45]/5 rounded-full z-0 hidden lg:block" 
            />
            <div className="absolute top-1/2 -left-20 w-80 h-80 bg-[#002b45]/5 rounded-full blur-[150px] z-0" />
          </div>
        </div>
      </div>
    </section>
  );
};

const StatItem = ({ value, label }) => (
  <div className="group cursor-pointer">
    <motion.div 
      whileHover={{ y: -5 }}
      className="text-5xl md:text-6xl font-display font-black text-[#002b45] group-hover:text-[#98C560] transition-colors italic tracking-tighter"
    >
      {value}
    </motion.div>
    <div className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 mt-2">{label}</div>
    <div className="w-0 group-hover:w-full h-1 bg-[#98C560] transition-all duration-500 mt-3" />
  </div>
);

const CTAButton = ({ href, children, primary }) => (
  <Link 
    href={href || '#'}
    className={`inline-flex items-center justify-center gap-4 px-10 py-5 font-display font-black text-[12px] tracking-[0.25em] uppercase transition-all duration-300 rounded-sm shadow-xl group ${
      primary 
        ? 'bg-[#002b45] text-white hover:bg-[#98C560] hover:text-[#002b45]' 
        : 'bg-white text-[#002b45] border-2 border-[#002b45] hover:bg-[#002b45] hover:text-white'
    }`}
  >
    {children}
    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
  </Link>
);

export default Hero;
