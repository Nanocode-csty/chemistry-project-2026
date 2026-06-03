'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function IntranetPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading) {
      if (user) {
        console.log('Intranet Root: User found, redirecting to dashboard');
        router.replace('/intranet/dashboard');
      } else {
        console.log('Intranet Root: No user, redirecting to login');
        router.replace('/intranet/login');
      }
    }
  }, [user, loading, router, isMounted]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray/30">
      <div className="w-12 h-12 border-4 border-brand-border border-t-brand-navy rounded-full animate-spin"></div>
    </div>
  );
}
