'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import styles from '../login/login.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const { register: registerUser, isAuthenticated } = useAuth();

    const [campuses, setCampuses] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        campus_id: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/feed');
        }
        loadCampuses();
    }, [isAuthenticated, router]);

    async function loadCampuses() {
        try {
            const data = await api.getCampuses();
            setCampuses(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, campus_id: data[0].id }));
            }
        } catch (err) {
            console.error('Failed to load campuses', err);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await registerUser(formData);
            router.push('/feed');
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.logo}>🎓 Campus OS</h1>
                    <p className={styles.tagline}>Join your campus community</p>
                </div>

                <Card className={styles.card}>
                    <h2 className={styles.title}>Create Account</h2>
                    <p className={styles.subtitle}>Get started with Campus OS</p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <Input
                            id="full_name"
                            type="text"
                            label="Full Name"
                            placeholder="John Doe"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                        />

                        <Input
                            id="email"
                            type="email"
                            label="Email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            helperText="Minimum 8 characters"
                        />

                        <div>
                            <label htmlFor="campus_id" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)', display: 'block' }}>
                                Campus <span style={{ color: 'var(--error)' }}>*</span>
                            </label>
                            <select
                                id="campus_id"
                                value={formData.campus_id}
                                onChange={(e) => setFormData({ ...formData, campus_id: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3) var(--space-4)',
                                    fontSize: 'var(--text-base)',
                                    border: '1px solid var(--gray-300)',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'white',
                                }}
                            >
                                {campuses.map(campus => (
                                    <option key={campus.id} value={campus.id}>
                                        {campus.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            isLoading={isLoading}
                        >
                            Create Account
                        </Button>
                    </form>

                    <div className={styles.footer}>
                        <p>
                            Already have an account?{' '}
                            <Link href="/login" className={styles.link}>
                                Sign In
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
