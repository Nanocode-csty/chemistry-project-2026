'use client';

import { usePathname } from 'next/navigation';
import IntranetLayout from '@/components/intranet/Layout';

export default function IntranetRootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/intranet/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <IntranetLayout>{children}</IntranetLayout>;
}
