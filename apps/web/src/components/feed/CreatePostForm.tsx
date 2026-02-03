import { useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send } from 'lucide-react';
import styles from './CreatePostForm.module.css';

interface CreatePostFormProps {
    onPostCreated: () => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
    const [body, setBody] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!body.trim()) return;

        setIsLoading(true);
        setError('');
        try {
            await api.createPost({
                post_type: 'text',
                body: body.trim(),
                is_anonymous: isAnonymous,
            });
            setBody('');
            setIsAnonymous(false);
            onPostCreated();
        } catch (error: any) {
            console.error('Failed to create post:', error);
            setError(error.message || 'Failed to create post. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <form onSubmit={handleSubmit} className={styles.form}>
                <textarea
                    className={styles.textarea}
                    placeholder="What's on your mind?"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={3}
                    maxLength={2000}
                />

                {error && (
                    <div style={{ color: 'var(--color-error)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                        {error}
                    </div>
                )}

                <div className={styles.footer}>
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                        />
                        <span>Post anonymously</span>
                    </label>

                    <div className={styles.actions}>
                        <span className={styles.charCount}>
                            {body.length}/2000
                        </span>
                        <Button
                            type="submit"
                            disabled={!body.trim() || isLoading}
                            isLoading={isLoading}
                        >
                            <Send size={16} />
                            Post
                        </Button>
                    </div>
                </div>
            </form>
        </Card>
    );
}
