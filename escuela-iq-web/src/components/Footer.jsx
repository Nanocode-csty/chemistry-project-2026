import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, ArrowRight, Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-navy text-white pt-24 pb-12 overflow-hidden relative border-t-8 border-brand-teal">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(0,163,163,0.1),transparent)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-white/5 skew-x-12 -translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Footer Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center space-x-4 mb-10 group">
              <div className="bg-white p-2.5 rounded-sm shadow-premium group-hover:rotate-3 transition-transform duration-500">
                <span className="text-brand-navy font-display font-black text-2xl italic tracking-tighter">EIQ</span>
              </div>
              <div className="flex flex-col border-l-2 border-brand-teal/30 pl-4">
                <span className="text-white font-display font-black text-xl leading-none tracking-tighter uppercase">INGENIERÍA QUÍMICA</span>
                <span className="text-brand-accent font-display font-extrabold text-[10px] tracking-[0.3em] uppercase mt-1">Innovación & Excelencia</span>
              </div>
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed mb-10 max-w-sm font-sans">
              Liderando la innovación científica y tecnológica desde el corazón de la academia 
              para el progreso del sector industrial global. Transformamos investigación en soluciones.
            </p>
            <div className="flex space-x-4">
              <SocialLink icon={<Facebook size={18} />} />
              <SocialLink icon={<Linkedin size={18} />} />
              <SocialLink icon={<Instagram size={18} />} />
              <SocialLink icon={<Twitter size={18} />} />
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="lg:col-span-2 lg:ml-auto">
            <h4 className="text-brand-teal font-display font-black text-[11px] tracking-[0.3em] uppercase mb-10 border-b border-white/10 pb-4 inline-block">ACADEMIA</h4>
            <ul className="space-y-5">
              <FooterLink href="/investigaciones">Investigación</FooterLink>
              <FooterLink href="/papers">Publicaciones</FooterLink>
              <FooterLink href="/patentes">Patentes</FooterLink>
              <FooterLink href="/concursos">Concursos</FooterLink>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="lg:col-span-2">
            <h4 className="text-brand-teal font-display font-black text-[11px] tracking-[0.3em] uppercase mb-10 border-b border-white/10 pb-4 inline-block">INDUSTRIA</h4>
            <ul className="space-y-5">
              <FooterLink href="/proyectos">Proyectos</FooterLink>
              <FooterLink href="/servicios">Servicios Técnicos</FooterLink>
              <FooterLink href="/transferencia">Transferencia</FooterLink>
              <FooterLink href="/noticias">Noticias</FooterLink>
              <FooterLink href="/intranet/login">Portal Intranet</FooterLink>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-4">
            <h4 className="text-brand-accent font-display font-black text-[11px] tracking-[0.3em] uppercase mb-10 border-b border-white/10 pb-4 inline-block">CONTACTO DIRECTO</h4>
            <div className="space-y-6">
              <ContactItem icon={<Mail size={18} />} text="contacto@escuelaiq.edu" />
              <ContactItem icon={<Phone size={18} />} text="+51 (1) 456-7890" />
              <ContactItem icon={<MapPin size={18} />} text="Av. Universitaria 1234, Lima, Perú" />
              <div className="pt-6">
                <Link 
                  href="#contacto" 
                  className="inline-flex items-center gap-4 bg-brand-teal text-brand-navy px-10 py-5 font-display font-black text-[11px] tracking-[0.3em] hover:bg-white transition-all uppercase shadow-premium rounded-sm group"
                >
                  SOLICITAR INFORMACIÓN <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-4">
            <span>&copy; {new Date().getFullYear()} ESCUELA IQ. TODOS LOS DERECHOS RESERVADOS.</span>
            <span className="hidden md:block w-1 h-1 bg-brand-teal rounded-full" />
            <span className="hidden md:block">CERTIFICACIÓN ISO 9001:2015</span>
          </div>
          <div className="flex gap-10 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <Link href="#" className="hover:text-brand-teal transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-brand-teal transition-colors">Términos Legales</Link>
            <Link href="#" className="hover:text-brand-teal transition-colors">Mapa del Sitio</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

const SocialLink = ({ icon }) => (
  <a href="#" className="w-11 h-11 bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-brand-teal hover:text-brand-navy hover:border-brand-teal transition-all duration-500 rounded-sm">
    {icon}
  </a>
);

const FooterLink = ({ href, children }) => (
  <li>
    <Link href={href} className="text-[13px] font-bold text-slate-400 hover:text-white transition-all flex items-center gap-3 group">
      <span className="w-2 h-[2px] bg-brand-teal scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
      {children}
    </Link>
  </li>
);

const ContactItem = ({ icon, text }) => (
  <div className="flex items-center gap-4 group cursor-default">
    <div className="w-12 h-12 bg-white/5 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-brand-navy transition-all duration-500 rounded-sm shadow-inner">
      {icon}
    </div>
    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{text}</span>
  </div>
);

export default Footer;
