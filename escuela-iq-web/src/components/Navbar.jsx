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
      {/* Top Bar - Ultra Professional */}
      <div className={`bg-brand-navy text-white transition-all duration-700 ${scrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-auto py-2 opacity-100'}`}>
        <div className="max-w-7xl mx-auto px-4 flex justify-end items-center space-x-8 text-[10px] font-black tracking-[0.2em] pointer-events-auto">
          <Link href="#" className="hover:text-brand-accent transition-colors flex items-center gap-2 group">
            <Globe size={12} className="group-hover:rotate-12 transition-transform" /> RED GLOBAL
          </Link>
          <Link href="/intranet/login" className="hover:text-brand-accent transition-colors flex items-center gap-2 group">
            <LogIn size={12} className="group-hover:translate-x-1 transition-transform" /> PORTAL INTRANET
          </Link>
          <button className="hover:text-brand-accent transition-colors">
            <Search size={14} />
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <nav
        className={`w-full transition-all duration-700 border-b pointer-events-auto ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-premium py-2 border-transparent' : 'bg-white py-4 border-brand-border'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-4 group">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-brand-navy p-2.5 rounded-sm shadow-premium relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-white font-display font-black text-2xl italic tracking-tighter block relative z-10">EIQ</span>
              </motion.div>
              <div className="flex flex-col border-l-2 border-brand-border pl-4">
                <span className="text-brand-navy font-display font-black text-xl leading-none tracking-tighter uppercase group-hover:text-brand-teal transition-colors">
                  INGENIERÍA QUÍMICA
                </span>
                <span className="text-brand-muted font-display font-extrabold text-[10px] tracking-[0.3em] uppercase mt-1">
                  Innovación & Excelencia
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center h-full">
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
                      pathname === item.href ? 'text-brand-teal' : 'text-brand-navy hover:text-brand-teal'
                    }`}
                  >
                    {item.title}
                    <motion.span 
                      initial={false}
                      animate={{ scaleX: pathname === item.href ? 1 : 0 }}
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-teal origin-left"
                    />
                  </Link>

                  <AnimatePresence>
                    {item.submenu && activeDropdown === item.title && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute top-full left-0 w-72 bg-brand-navy shadow-premium mt-0 py-6"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-teal to-brand-accent" />
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block px-10 py-3 text-[12px] font-bold text-white/70 hover:text-brand-accent hover:bg-white/5 transition-all border-l-4 border-transparent hover:border-brand-teal"
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
                    href="#contacto"
                    className="bg-brand-navy text-white font-display font-black text-[11px] tracking-[0.2em] px-8 py-4 hover:bg-brand-teal transition-all shadow-xl uppercase flex items-center gap-2"
                  >
                    <Sparkles size={14} className="text-brand-accent" />
                    CONTACTO
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setOpen(!open)}
                className="bg-brand-navy text-white p-3 rounded-sm shadow-lg active:scale-90 transition-transform"
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
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 lg:hidden bg-white z-[110]"
          >
            <div className="flex flex-col h-full pt-24">
              <div className="flex justify-between items-center px-8 py-4 border-b border-brand-navy/5">
                <span className="font-display font-black text-xl text-brand-navy tracking-tighter italic">MENÚ INSTITUCIONAL</span>
                <button onClick={() => setOpen(false)} className="p-2 bg-brand-navy text-white rounded-full shadow-lg"><X size={24} /></button>
              </div>
              <div className="flex-grow overflow-y-auto px-8 py-10 space-y-10">
                {menuItems.map((item) => (
                  <div key={item.title} className="space-y-4">
                    <Link
                      href={item.href}
                      className="block text-4xl font-display font-black text-brand-navy hover:text-brand-teal"
                      onClick={() => setOpen(false)}
                    >
                      {item.title}
                    </Link>
                    {item.submenu && (
                      <div className="pl-6 space-y-4 border-l-4 border-brand-teal/20">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block text-xl font-sans font-bold text-gray-500 hover:text-brand-navy"
                            onClick={() => setOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-8 flex justify-center bg-brand-gray border-t border-brand-navy/5">
                <Link href="#contacto" className="w-full bg-brand-navy text-white py-5 text-center font-display font-black tracking-widest text-[12px] shadow-xl">CONTACTO</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
