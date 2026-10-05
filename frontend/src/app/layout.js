import './globals.css';
import MainLayout from '@/components/MainLayout';

export const metadata = {
  title: 'MyShop - Cửa Hàng Trực Tuyến',
  description: 'Dự án Thương mại điện tử Fullstack Laravel & Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="antialiased text-gray-800">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}