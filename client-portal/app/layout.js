import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'NoirFlow Client Portal',
  description: 'Manage your account, view your automation, and reach NoirFlow support.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
