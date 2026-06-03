'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isIntranet = pathname?.startsWith('/intranet') ?? false;

  if (!isMounted) return <main>{children}</main>;

  return (
    <>
      {!isIntranet && <Navbar />}
      <main className={isIntranet ? 'min-h-screen' : ''}>{children}</main>
      {!isIntranet && <Footer />}
    </>
  );
}
