import type { Metadata } from 'next';
import './globals.css';
import SupabaseProvider from './providers';

export const metadata: Metadata = {
  title: 'PlantMate',
  description: 'Plant community and growth log platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="break-keep">
        <SupabaseProvider>
          <div className="min-h-screen bg-slate-50 text-slate-900">{children}</div>
        </SupabaseProvider>
      </body>
    </html>
  );
}
