import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, ArrowRight, Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#002b45] text-white pt-24 pb-12 overflow-hidden relative border-t-[6px] border-[#98C560]">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(152,197,96,0.08),transparent)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-white/[0.02] skew-x-12 -translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Footer Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center mb-10 group max-w-[280px]">
              <div className="relative h-16 w-auto transition-transform duration-500 group-hover:scale-105 origin-left">
                <img 
                  src="/img-logo-labcam-completo.png" 
                  alt="LABCAM Logo" 
                  className="h-full w-auto object-contain brightness-0 invert" 
                />
              </div>
            </Link>
            <p className="text-slate-400 text-[15px] leading-relaxed mb-10 max-w-sm font-sans font-medium">
              Liderando la investigación en catálisis, adsorbentes y nuevos materiales. 
              Transformamos la ciencia básica en soluciones tecnológicas para el desarrollo industrial sostenible.
            </p>
            <div className="flex space-x-5">
              <SocialLink icon={<Facebook size={20} />} label="Facebook" />
              <SocialLink icon={<Linkedin size={20} />} label="LinkedIn" />
              <SocialLink icon={<Instagram size={20} />} label="Instagram" />
              <SocialLink icon={<Youtube size={20} />} label="YouTube" />
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="lg:col-span-2 lg:ml-auto">
            <h4 className="text-[#98C560] font-display font-black text-[12px] tracking-[0.2em] uppercase mb-10 border-b border-white/10 pb-4 inline-block">ACADEMIA</h4>
            <ul className="space-y-4">
              <FooterLink href="/investigaciones">Investigación</FooterLink>
              <FooterLink href="/papers">Publicaciones</FooterLink>
              <FooterLink href="/patentes">Patentes</FooterLink>
              <FooterLink href="/concursos">Concursos</FooterLink>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="lg:col-span-2">
            <h4 className="text-[#98C560] font-display font-black text-[12px] tracking-[0.2em] uppercase mb-10 border-b border-white/10 pb-4 inline-block">INDUSTRIA</h4>
            <ul className="space-y-4">
              <FooterLink href="/proyectos">Proyectos</FooterLink>
              <FooterLink href="/servicios">Servicios Técnicos</FooterLink>
              <FooterLink href="/transferencia">Transferencia</FooterLink>
              <FooterLink href="/noticias">Noticias</FooterLink>
              <FooterLink href="/intranet/login">Portal Intranet</FooterLink>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-4">
            <h4 className="text-[#98C560] font-display font-black text-[12px] tracking-[0.2em] uppercase mb-10 border-b border-white/10 pb-4 inline-block">CONTACTO DIRECTO</h4>
            <div className="space-y-6">
              <ContactItem icon={<Mail size={20} />} text="contacto@labcam.edu.pe" />
              <ContactItem icon={<Phone size={20} />} text="+51 (1) 456-7890" />
              <ContactItem icon={<MapPin size={20} />} text="Av. Juan Pablo II, Ciudad Universitaria, Trujillo - Perú" />
              <div className="pt-6">
                <Link 
                  href="#contacto" 
                  className="inline-flex items-center gap-4 bg-[#98C560] text-[#002b45] px-10 py-5 font-display font-black text-[11px] tracking-[0.25em] hover:bg-white transition-all duration-300 uppercase shadow-[0_10px_30px_-10px_rgba(152,197,96,0.3)] rounded-sm group"
                >
                  SOLICITAR INFORMACIÓN <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] flex items-center gap-4">
            <span>&copy; {new Date().getFullYear()} LABCAM. TODOS LOS DERECHOS RESERVADOS.</span>
            <span className="hidden md:block w-1.5 h-1.5 bg-[#98C560] rounded-full" />
            <span className="hidden md:block">EXCELENCIA EN INVESTIGACIÓN</span>
          </div>
          <div className="flex gap-10 text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">
            <Link href="#" className="hover:text-[#98C560] transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-[#98C560] transition-colors">Términos Legales</Link>
          </div>
        </div>

        {/* Developer Credit - Sutil pero visible */}
        <div className="mt-12 text-center">
          <p className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-[0.4em] transition-all duration-500 cursor-default flex items-center justify-center gap-2">
            <span className="opacity-50">Powered by</span> 
            <span className="text-[#98C560] font-black border-b border-[#98C560]/30 pb-0.5">ROO</span> 
            <span className="text-white/20">|</span> 
            <span className="opacity-80">Soluciones Digitales</span>
          </p>
        </div>

      </div>
    </footer>
  );
};

const SocialLink = ({ icon, label }) => (
  <a 
    href="#" 
    aria-label={label}
    className="w-12 h-12 bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#98C560] hover:text-[#002b45] hover:border-[#98C560] transition-all duration-300 rounded-sm group shadow-lg"
  >
    <div className="transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>
  </a>
);

const FooterLink = ({ href, children }) => (
  <li>
    <Link href={href} className="text-[14px] font-semibold text-slate-400 hover:text-white transition-all flex items-center gap-3 group">
      <span className="w-2.5 h-[2px] bg-[#98C560] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
      {children}
    </Link>
  </li>
);

const ContactItem = ({ icon, text }) => (
  <div className="flex items-center gap-5 group cursor-default">
    <div className="w-12 h-12 bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#98C560] group-hover:bg-[#98C560] group-hover:text-[#002b45] transition-all duration-300 rounded-sm shadow-md">
      {icon}
    </div>
    <span className="text-[14px] font-semibold text-slate-400 group-hover:text-white transition-colors">{text}</span>
  </div>
);

export default Footer;
