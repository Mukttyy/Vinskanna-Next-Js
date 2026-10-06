import type { Metadata } from 'next';
import { Suspense } from 'react';
import '@/public/bootstrap-5.0.2-dist/css/bootstrap.min.css';
import '@/css/main.css';
import '@/css/typography.css';
import '@/app/tailwind.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { StatusToast } from '@/components/StatusToast';

export const metadata: Metadata = {
  title: 'Vinskanna Home',
  description: 'Buket bunga untuk hadiah, perayaan, dan momen kecil yang berarti. Temukan rangkaian pilihan untuk orang tersayang.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <Suspense fallback={<nav className="navbar navbar-expand-lg navbar-light bg-white py-4 fixed-top" />}>
          <Navbar />
        </Suspense>
        {children}
        <Footer />
        <StatusToast />
      </body>
    </html>
  );
}
