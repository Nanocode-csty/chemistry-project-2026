'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function IntranetPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/intranet/login');
      } else {
        router.push('/intranet/dashboard');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin mb-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
        </div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  );
} 
