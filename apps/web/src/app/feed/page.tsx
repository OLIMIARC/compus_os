'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FeedPost } from '@/components/feed/FeedPost';
import { CreatePostForm } from '@/components/feed/CreatePostForm';
import { Card } from '@/components/ui/Card';
import styles from './feed.module.css';

export default function FeedPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadFeed();
    }, [user]);

    async function loadFeed() {
        try {
            setIsLoading(true);
            const result = await api.getFeed({ campus_id: user?.campus_id });
            setPosts(result.data || []);
        } catch (error) {
            console.error('Failed to load feed:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handlePostCreated() {
        await loadFeed();
    }

    async function handleToggleLike(postId: string) {
        try {
            await api.toggleReaction(postId);
            // Refresh feed to see updated likes
            await loadFeed();
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>Campus Feed</h1>
                    <p className={styles.subtitle}>What's happening on campus</p>
                </div>

                <CreatePostForm onPostCreated={handlePostCreated} />

                <div className={styles.feed}>
                    {isLoading ? (
                        <div>
                            {[1, 2, 3].map(i => (
                                <Card key={i}>
                                    <div className="skeleton" style={{ height: '120px', marginBottom: 'var(--space-4)' }} />
                                    <div className="skeleton" style={{ height: '20px', width: '60%' }} />
                                </Card>
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                        <Card>
                            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--gray-500)' }}>
                                <p style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
                                    No posts yet
                                </p>
                                <p>Be the first to share something with your campus!</p>
                            </div>
                        </Card>
                    ) : (
                        posts.map(post => (
                            <FeedPost
                                key={post.id}
                                post={post}
                                onToggleLike={handleToggleLike}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
