'use client';

import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getInitials } from '@/lib/utils';
import { Mail, Phone, Award, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuth();

    function handleLogout() {
        logout();
        router.push('/login');
    }

    if (!user) return null;

    return (
        <div style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                    Profile
                </h1>
                <p style={{ color: 'var(--gray-600)' }}>Manage your account and preferences</p>
            </div>

            <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
                    <div style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: 'var(--radius-full)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--text-3xl)',
                        fontWeight: 700,
                    }}>
                        {getInitials(user.full_name)}
                    </div>

                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                            {user.full_name}
                        </h2>
                        {user.username && (
                            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-3)' }}>
                                @{user.username}
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                            <span className="badge badge-primary">
                                <Award size={14} />
                                {user.reputation_score} Reputation
                            </span>
                            <span className="badge">
                                {user.roles}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    {user.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <Mail size={20} style={{ color: 'var(--gray-400)' }} />
                            <span>{user.email}</span>
                        </div>
                    )}
                    {user.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <Phone size={20} style={{ color: 'var(--gray-400)' }} />
                            <span>{user.phone}</span>
                        </div>
                    )}
                </div>

                <div style={{ paddingTop: 'var(--space-6)', borderTop: '1px solid var(--gray-200)' }}>
                    <Button variant="danger" onClick={handleLogout}>
                        <LogOut size={18} />
                        Logout
                    </Button>
                </div>
            </Card>
        </div>
    );
}
