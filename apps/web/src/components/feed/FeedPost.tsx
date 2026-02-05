import { Card } from '@/components/ui/Card';
import { formatDate, generateAnonymousColor } from '@/lib/utils';
import { Heart, MessageCircle } from 'lucide-react';
import styles from './FeedPost.module.css';

interface FeedPostProps {
    post: any;
    onToggleLike: (postId: string) => void;
}

export function FeedPost({ post, onToggleLike }: FeedPostProps) {
    const isAnonymous = post.is_anonymous;
    const authorName = isAnonymous ? post.anonymous_handle : post.author?.full_name || 'Unknown';
    const avatarColor = isAnonymous ? generateAnonymousColor(post.anonymous_handle) : 'var(--primary)';

    return (
        <Card hover className={styles.post}>
            <div className={styles.header}>
                <div
                    className={styles.avatar}
                    style={{ background: avatarColor }}
                >
                    {authorName.charAt(0).toUpperCase()}
                </div>

                <div className={styles.authorInfo}>
                    <div className={styles.authorName}>
                        {authorName}
                        {isAnonymous && (
                            <span className={styles.anonBadge}>Anonymous</span>
                        )}
                    </div>
                    <div className={styles.timestamp}>
                        {formatDate(post.created_at)}
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                {post.title && (
                    <h3 className={styles.title}>{post.title}</h3>
                )}
                <p className={styles.body}>{post.body}</p>
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.actionBtn}
                    onClick={() => onToggleLike(post.id)}
                >
                    <Heart size={18} />
                    <span>{post.stats?.likes || 0}</span>
                </button>

                <button className={styles.actionBtn}>
                    <MessageCircle size={18} />
                    <span>{post.stats?.comments || 0}</span>
                </button>
            </div>
        </Card>
    );
}
