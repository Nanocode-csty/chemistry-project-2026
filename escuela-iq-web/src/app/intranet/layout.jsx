'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import IntranetLayout from '@/components/intranet/Layout';
import ErrorBoundary from '@/components/intranet/ErrorBoundary';

export default function IntranetRootLayout({ children }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isLoginPage = pathname === '/intranet/login' || pathname?.endsWith('/login');

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray/30">
        <div className="w-12 h-12 border-4 border-brand-border border-t-brand-navy rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isLoginPage) {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  return (
    <ErrorBoundary>
      <IntranetLayout>{children}</IntranetLayout>
    </ErrorBoundary>
  );
}
