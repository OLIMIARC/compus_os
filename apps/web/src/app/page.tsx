'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.push('/feed');
            } else {
                router.push('/login');
            }
        }
    }, [isAuthenticated, isLoading, router]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh'
        }}>
            <div style={{ fontSize: '1.25rem', color: 'var(--gray-500)' }}>
                Loading Campus OS...
            </div>
        </div>
    );
}
