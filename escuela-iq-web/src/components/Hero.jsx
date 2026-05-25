'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Beaker, ChevronRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';

const Hero = () => {
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
      <div className="absolute top-0 right-0 w-full lg:w-[45%] h-full bg-brand-navy hidden lg:block z-0" />
      
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
                <div className="w-12 h-1 bg-brand-teal" />
                <span className="text-brand-navy font-display font-black text-[11px] tracking-[0.4em] uppercase flex items-center gap-2">
                  <Sparkles size={14} className="text-brand-teal" /> INNOVACIÓN QUÍMICA 2026
                </span>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="text-5xl md:text-8xl font-display font-black text-brand-navy leading-[0.9] mb-8 tracking-tighter uppercase"
              >
                CIENCIA <br />
                QUE <span className="text-brand-teal italic">TRANSFORMA</span> <br />
                EL FUTURO.
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-lg md:text-xl text-gray-500 mb-10 max-w-xl font-sans leading-relaxed border-l-4 border-brand-teal pl-8"
              >
                Impulsamos la vanguardia científica con soluciones de ingeniería química 
                que redefinen la sostenibilidad industrial a nivel global.
              </motion.p>

              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-5"
              >
                <CTAButton href="/investigaciones" primary>
                  PROGRAMA CIENTÍFICO
                </CTAButton>
                <CTAButton href="/proyectos">
                  CASOS DE ÉXITO
                </CTAButton>
              </motion.div>

              {/* Dynamic Stats Section */}
              <motion.div 
                variants={itemVariants}
                className="mt-12 grid grid-cols-3 gap-6"
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
              <div className="relative overflow-hidden shadow-premium aspect-[4/5] lg:aspect-[3/4] lg:h-[650px] group border-b-8 border-brand-teal bg-brand-gray">
                <img 
                  src="https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=1200" 
                  alt="Ingeniería Química Avanzada" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3000ms] ease-out relative z-10"
                />
                <div className="absolute inset-0 bg-brand-navy/20 z-20 pointer-events-none" />
                
                {/* Floating News Card */}
                <motion.div 
                  variants={floatVariants}
                  animate="animate"
                  className="absolute bottom-6 left-0 right-0 px-6 z-30"
                >
                  <div className="bg-brand-navy p-8 text-white shadow-2xl relative overflow-hidden group/card border-t-4 border-brand-teal">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/20 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="flex items-center gap-2 text-brand-teal text-[10px] font-black tracking-[0.3em] uppercase mb-4">
                      <Zap size={14} /> NOVEDAD TECNOLÓGICA
                    </div>
                    <h3 className="text-xl font-display font-black uppercase mb-3 relative z-10 leading-tight">Síntesis de <br />Hidrógeno Verde</h3>
                    <p className="text-xs text-white/60 mb-6 relative z-10 font-sans">Nuevo proceso catalítico optimizado para la industria energética.</p>
                    <Link href="/investigaciones" className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase relative z-10 text-brand-teal hover:text-white transition-colors">
                      VER DETALLES <ChevronRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Decorative Elements */}
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-6 -right-6 w-32 h-32 border-2 border-brand-teal/20 rounded-full z-0 hidden lg:block" 
            />
            <div className="absolute top-1/2 -left-20 w-64 h-64 bg-brand-teal/10 rounded-full blur-[120px] z-0" />
          </div>

        </div>
      </div>

      {/* Vertical Label */}
      <div className="absolute left-10 bottom-24 hidden xl:block origin-left -rotate-90">
        <span className="text-[10px] font-black tracking-[0.6em] text-gray-300 uppercase">
          SCIENTIFIC EXCELLENCE • INDUSTRIAL INNOVATION • 2026
        </span>
      </div>
    </section>
  );
};

const StatItem = ({ value, label }) => (
  <div className="group cursor-pointer">
    <motion.div 
      whileHover={{ y: -5 }}
      className="text-4xl md:text-5xl font-display font-black text-brand-navy group-hover:text-brand-teal transition-colors italic tracking-tighter"
    >
      {value}
    </motion.div>
    <div className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-2">{label}</div>
    <div className="w-0 group-hover:w-full h-0.5 bg-brand-teal transition-all duration-500 mt-2" />
  </div>
);

const CTAButton = ({ href, children, primary }) => (
  <motion.div whileHover={{ y: -5, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Link 
      href={href}
      className={`
        inline-block px-12 py-6 font-display font-black text-[11px] tracking-[0.3em] transition-all duration-500 text-center w-full sm:w-auto uppercase shadow-premium
        ${primary 
          ? 'bg-brand-navy text-white hover:bg-brand-teal' 
          : 'bg-white text-brand-navy hover:bg-brand-navy hover:text-white border border-brand-border'}
      `}
    >
      {children}
    </Link>
  </motion.div>
);

export default Hero;
