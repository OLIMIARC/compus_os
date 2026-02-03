'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { Book, Eye } from 'lucide-react';

export default function ArticlesPage() {
    const { user } = useAuth();
    const [articles, setArticles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadArticles();
    }, [user]);

    async function loadArticles() {
        try {
            setIsLoading(true);
            const result = await api.getArticles({ campus_id: user?.campus_id });
            setArticles(result.data || []);
        } catch (error) {
            console.error('Failed to load articles:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                    Articles
                </h1>
                <p style={{ color: 'var(--gray-600)' }}>Long-form content from your campus community</p>
            </div>

            {isLoading ? (
                <div>
                    {[1, 2, 3].map(i => (
                        <Card key={i} style={{ marginBottom: 'var(--space-4)' }}>
                            <div className="skeleton" style={{ height: '100px' }} />
                        </Card>
                    ))}
                </div>
            ) : articles.length === 0 ? (
                <Card>
                    <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--gray-500)' }}>
                        <Book size={48} style={{ margin: '0 auto var(--space-4)' }} />
                        <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
                            No articles yet
                        </p>
                        <p>Be the first to share your knowledge!</p>
                    </div>
                </Card>
            ) : (
                <div>
                    {articles.map(article => (
                        <Card key={article.id} hover style={{ marginBottom: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                                {article.tier === 'featured' && (
                                    <span className="badge badge-warning">Featured</span>
                                )}
                                <span className="badge">{article.tier}</span>
                            </div>

                            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--gray-900)' }}>
                                {article.title}
                            </h2>

                            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>
                                {article.summary}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-sm)', color: 'var(--gray-500)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--gray-100)' }}>
                                <div>
                                    By <strong>{article.author?.full_name || 'Unknown'}</strong>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                                        <Eye size={14} /> {article.reads_count}
                                    </span>
                                    <span>{formatDate(article.created_at)}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
