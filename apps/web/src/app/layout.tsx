import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Campus OS - Campus Social & Knowledge Platform',
    description: 'Campus-scoped social layer, student knowledge graph, and cultural memory system',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
