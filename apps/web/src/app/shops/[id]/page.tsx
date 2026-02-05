'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import { ListingCard } from '@/components/marketplace/ListingCard'; // Assuming ListingCard is exported
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Store, User, Star, Calendar, MapPin, Tag, ShieldCheck, AlertCircle } from 'lucide-react';
import { getInitials, formatPrice } from '@/lib/utils';
import styles from './shop-detail.module.css';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function ShopDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const { user } = useAuth(); // Use auth context
    const router = useRouter(); // Use router
    const [shop, setShop] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Only load shop if user is available (for campus_id) or if we decide to allow public access differently
        // But api.getShop requires campusId.
        // If user is not logged in, we might need a default campus or redirect.
        // For now, assume user is logged in or we wait for user.
        if (user) {
            loadShop();
        }
    }, [id, user]);

    async function loadShop() {
        try {
            setLoading(true);
            const response = await api.getShop(id, user!.campus_id); // Use user's campus_id
            setShop(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load shop');
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className="skeleton" style={{ height: '200px', marginBottom: '1rem' }} />
                <div className="skeleton" style={{ height: '40px', width: '50%', marginBottom: '2rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '300px' }} />)}
                </div>
            </div>
        );
    }

    if (error || !shop) {
        return (
            <div className={styles.container}>
                <div className={styles.errorContainer}>
                    <Store size={48} className={styles.errorIcon} />
                    <h2>Shop Not Found</h2>
                    <p>{error || "This shop doesn't exist or has been closed."}</p>
                    <Button onClick={() => router.push('/marketplace')} variant="secondary">
                        Back to Marketplace
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Shop Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.shopIcon}>
                        <Store size={32} />
                    </div>
                    <div className={styles.shopInfo}>
                        <h1>{shop.name}</h1>
                        <div className={styles.meta}>
                            <span className={styles.badge}>{shop.category}</span>
                            <span className={styles.status} data-status={shop.status}>{shop.status}</span>
                            <span className={styles.date}>
                                <Calendar size={14} />
                                Est. {new Date(shop.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
                <p className={styles.description}>{shop.description}</p>
            </div>

            <div className={styles.grid}>
                {/* Main Content: Listings */}
                <div className={styles.mainColumn}>
                    <div className={styles.sectionHeader}>
                        <h2>Active Listings</h2>
                        <span className={styles.count}>{shop.listings?.length || 0} items</span>
                    </div>

                    {shop.listings && shop.listings.length > 0 ? (
                        <div className={styles.listingsGrid}>
                            {shop.listings.map((listing: any) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>
                    ) : (
                        <Card className={styles.emptyState}>
                            <Store size={40} />
                            <h3>No active listings</h3>
                            <p>This shop hasn't listed any items yet.</p>
                        </Card>
                    )}
                </div>

                {/* Sidebar: Owner Info */}
                <div className={styles.sidebar}>
                    <Card className={styles.ownerCard}>
                        <h3>Shop Owner</h3>
                        <div className={styles.ownerProfile}>
                            <div className={styles.avatar}>
                                {getInitials(shop.owner.fullName)}
                            </div>
                            <div className={styles.ownerDetails}>
                                <div className={styles.ownerName}>{shop.owner.fullName}</div>
                                <div className={styles.reputation}>
                                    <Star size={14} fill="var(--color-warning)" stroke="var(--color-warning)" />
                                    <span>{shop.reputationSnapshot} Rep Score</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.trustIndicators}>
                            <div className={styles.trustItem}>
                                <ShieldCheck size={16} />
                                <span>Verified Member</span>
                            </div>
                            <div className={styles.trustItem}>
                                <User size={16} />
                                <span>@{shop.owner.username}</span>
                            </div>
                        </div>

                        <Button fullWidth variant="secondary" className={styles.contactButton}>
                            Contact Owner
                        </Button>
                    </Card>

                    {/* Shop Stats (Future) */}
                    <Card className={styles.statsCard}>
                        <h3>Shop Stats</h3>
                        <div className={styles.statRow}>
                            <span>Total Sales</span>
                            <strong>--</strong>
                        </div>
                        <div className={styles.statRow}>
                            <span>Member Since</span>
                            <strong>{new Date(shop.createdAt).getFullYear()}</strong>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
