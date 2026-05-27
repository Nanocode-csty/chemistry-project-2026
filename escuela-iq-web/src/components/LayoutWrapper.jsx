'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isIntranet = pathname.startsWith('/intranet');

  return (
    <>
      {!isIntranet && <Navbar />}
      <main className={isIntranet ? 'min-h-screen' : ''}>{children}</main>
      {!isIntranet && <Footer />}
    </>
  );
}
