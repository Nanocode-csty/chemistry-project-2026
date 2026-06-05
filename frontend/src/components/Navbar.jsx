'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Search, LogIn, Globe, Sparkles } from 'lucide-react';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  const menuItems = [
    {
      title: 'ESTUDIANTES',
      href: '/#estudiantes',
      submenu: [
        { name: 'Investigación Académica', href: '/investigaciones' },
        { name: 'Papers Científicos', href: '/papers' },
        { name: 'Patentes Académicas', href: '/patentes' },
      ]
    },
    {
      title: 'PROFESIONALES',
      href: '/#profesionales',
      submenu: [
        { name: 'Proyectos Industriales', href: '/proyectos' },
        { name: 'Servicios Técnicos', href: '/servicios' },
        { name: 'Concursos y Premios', href: '/concursos' },
        { name: 'Transferencia Tecnológica', href: '/transferencia' },
      ]
    },
    { title: 'NOSOTROS', href: '/#nosotros' },
    { title: 'NOTICIAS', href: '/noticias' },
  ];

  return (
    <header className="fixed top-0 w-full z-[100] pointer-events-none">
      {/* Top Bar - Matching Footer Style */}
      <div className={`bg-white text-[#002b45] border-b border-slate-100 transition-all duration-700 ${scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-auto py-2.5 opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-end items-center space-x-8 text-[10px] font-black tracking-[0.25em] pointer-events-auto">
          <Link href="#" className="hover:text-[#98C560] transition-colors flex items-center gap-2 group">
            <Globe size={12} className="group-hover:rotate-12 transition-transform text-[#98C560]" /> RED GLOBAL
          </Link>
          <Link href="/intranet/login" className="hover:text-[#98C560] transition-colors flex items-center gap-2 group">
            <LogIn size={12} className="group-hover:translate-x-1 transition-transform text-[#98C560]" /> PORTAL INTRANET
          </Link>
        </div>
      </div>

      {/* Main Nav - Navy Background like Footer */}
      <nav
        className={`w-full transition-all duration-700 border-b pointer-events-auto ${
          scrolled ? 'bg-[#002b45]/95 backdrop-blur-md shadow-2xl py-2 border-white/5' : 'bg-[#002b45] py-5 border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo - White version */}
            <Link href="/" className="flex items-center group py-2">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative h-14 w-auto flex items-center"
              >
                {/* Logo Escritorio Blanco */}
                <img 
                  src="/img-logo-labcam-completo-blanco.png" 
                  alt="LABCAM Logo" 
                  className="hidden md:block h-full w-auto object-contain"
                />
                {/* Logo Móvil Blanco */}
                <img 
                  src="/img-logo-labcam-completo-movil-nuevo.png" 
                  alt="LABCAM Logo" 
                  className="block md:hidden h-12 w-auto object-contain brightness-0 invert"
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center h-full ml-12">
              {menuItems.map((item) => (
                <div
                  key={item.title}
                  className="relative h-full flex items-center group mx-1"
                  onMouseEnter={() => setActiveDropdown(item.title)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`px-4 py-2 font-display font-black text-[12px] tracking-widest transition-all relative overflow-hidden ${
                      pathname === item.href ? 'text-[#98C560]' : 'text-white hover:text-[#98C560]'
                    }`}
                  >
                    {item.title}
                    <motion.span 
                      initial={false}
                      animate={{ scaleX: pathname === item.href ? 1 : 0 }}
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-[#98C560] origin-left"
                    />
                  </Link>

                  <AnimatePresence>
                    {item.submenu && activeDropdown === item.title && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute top-full left-0 w-72 bg-white shadow-2xl mt-0 py-8 rounded-sm overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#98C560]" />
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block px-10 py-3.5 text-[12px] font-bold text-[#002b45]/70 hover:text-[#002b45] hover:bg-slate-50 transition-all border-l-4 border-transparent hover:border-[#98C560]"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div className="ml-8 flex items-center space-x-4">
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/#contacto"
                    className="bg-[#98C560] text-[#002b45] font-display font-black text-[11px] tracking-[0.25em] px-10 py-5 hover:bg-white transition-all duration-300 shadow-xl uppercase flex items-center gap-3 rounded-sm"
                  >
                    <Sparkles size={16} className="text-[#002b45]" />
                    CONTACTO
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="bg-[#98C560] text-[#002b45] p-3.5 rounded-sm shadow-xl active:scale-90 transition-transform"
              >
                {open ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Background Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[110] lg:hidden"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 bg-[#002b45] z-[120] lg:hidden shadow-2xl flex flex-col pointer-events-auto"
            >
              <div className="flex justify-between items-center px-8 py-8 border-b border-white/5">
                <img 
                  src="/img-logo-labcam-completo-movil-nuevo.png" 
                  alt="LABCAM" 
                  className="h-12 w-auto object-contain"
                />
                <button 
                  onClick={() => setOpen(false)} 
                  className="p-3 bg-brand-navy text-white rounded-full shadow-lg active:scale-90 transition-transform"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto px-8 py-12">
                <nav className="space-y-10">
                  {menuItems.map((item, idx) => (
                    <motion.div 
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + idx * 0.1 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between group">
                        <Link
                          href={item.href}
                          className="text-4xl font-display font-black text-white hover:text-[#98C560] transition-colors uppercase tracking-tighter"
                          onClick={() => setOpen(false)}
                        >
                          {item.title}
                        </Link>
                      </div>
                      
                      {item.submenu && (
                        <div className="pl-6 space-y-6 border-l-4 border-[#98C560]/20 ml-1">
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              className="block text-xl font-sans font-extrabold text-white/40 hover:text-[#98C560] transition-colors flex items-center gap-3"
                              onClick={() => setOpen(false)}
                            >
                              <div className="w-2 h-2 rounded-full bg-[#98C560]" />
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </nav>
              </div>

              <div className="p-10 bg-white/5 border-t border-white/5">
                <Link 
                  href="/#contacto" 
                  onClick={() => setOpen(false)}
                  className="w-full bg-[#98C560] text-[#002b45] py-6 flex items-center justify-center gap-4 font-display font-black tracking-[0.25em] text-[14px] shadow-2xl hover:bg-white transition-all rounded-sm"
                >
                  <Sparkles size={20} className="text-[#002b45]" />
                  SOLICITAR INFORMACIÓN
                </Link>
                
                <div className="mt-10 flex justify-center gap-10 text-white/20">
                  <Link href="#" onClick={() => setOpen(false)} className="hover:text-[#98C560] transition-colors"><Globe size={24} /></Link>
                  <Link href="/intranet/login" onClick={() => setOpen(false)} className="hover:text-[#98C560] transition-colors"><LogIn size={24} /></Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
