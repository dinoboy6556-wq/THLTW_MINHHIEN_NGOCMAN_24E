'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  // Nếu là trang Admin, không render Header/Footer chung
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
}