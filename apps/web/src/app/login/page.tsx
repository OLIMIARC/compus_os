'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login, isAuthenticated } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/feed');
        }
    }, [isAuthenticated, router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            router.push('/feed');
        } catch (err: any) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.logo}>🎓 Campus OS</h1>
                    <p className={styles.tagline}>Campus social + knowledge platform</p>
                </div>

                <Card className={styles.card}>
                    <h2 className={styles.title}>Welcome Back</h2>
                    <p className={styles.subtitle}>Sign in to your campus account</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <Input
                            id="email"
                            type="email"
                            label="Email or Phone"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />

                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />

                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isLoading}
                            disabled={!email || !password}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className={styles.footer}>
                        <p>
                            Don't have an account?{' '}
                            <Link href="/register" className={styles.link}>
                                Register
                            </Link>
                        </p>
                    </div>

                    <div className={styles.demo}>
                        <p className={styles.demoTitle}>Demo Account:</p>
                        <p className={styles.demoText}>Email: <code>john@example.com</code></p>
                        <p className={styles.demoText}>Password: <code>Password123</code></p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
