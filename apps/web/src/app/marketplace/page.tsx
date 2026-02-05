'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { Search, Plus, Filter, LayoutGrid, Package } from 'lucide-react';
import Link from 'next/link';
import styles from './marketplace.module.css';

const CATEGORIES = [
    { id: 'all', label: 'All Items' },
    { id: 'academics', label: 'Academics' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'dorm', label: 'Dorm & Living' },
    { id: 'services', label: 'Services' },
    { id: 'personal', label: 'Personal' },
    { id: 'transport', label: 'Transport' },
];

export default function MarketplacePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user) {
            loadListings();
        }
    }, [user, activeCategory]);

    async function loadListings() {
        try {
            setIsLoading(true);
            const params: any = { campus_id: user?.campus_id };
            if (activeCategory !== 'all') params.category = activeCategory;
            if (searchQuery) params.search = searchQuery;

            const result = await api.getMarketplace(params);
            setListings(result.data || []);
        } catch (error) {
            console.error('Failed to load marketplace:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        loadListings();
    }

    return (
        <div style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: '1200px', margin: '0 auto' }}>
            <div className={styles.headerActions}>
                <div>
                    <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-1)', color: 'var(--gray-900)' }}>
                        Campus Trade
                    </h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: 'var(--text-md)' }}>
                        Buy, sell, or rent with students at your campus
                    </p>
                </div>
                <Link href="/marketplace/create">
                    <Button>
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        List Item
                    </Button>
                </Link>
            </div>

            <div className={styles.searchBar}>
                <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: 'var(--space-2)' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                        <input
                            type="text"
                            placeholder="What are you looking for?"
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </form>
                <Button variant="secondary">
                    <Filter size={18} style={{ marginRight: '8px' }} />
                    Filters
                </Button>
            </div>

            <div className={styles.filters}>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.filterBtnActive : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className={styles.grid}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i}>
                            <div className="skeleton" style={{ height: '180px', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }} />
                            <div className="skeleton" style={{ height: '24px', width: '80%', marginBottom: 'var(--space-2)' }} />
                            <div className="skeleton" style={{ height: '20px', width: '40%', marginBottom: 'var(--space-4)' }} />
                            <div className="skeleton" style={{ height: '32px', width: '100%' }} />
                        </Card>
                    ))}
                </div>
            ) : listings.length === 0 ? (
                <Card>
                    <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--gray-500)' }}>
                        <div style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-300)' }}>
                            <Package size={64} style={{ margin: '0 auto' }} />
                        </div>
                        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 'var(--space-2)' }}>
                            No items found
                        </h3>
                        <p style={{ marginBottom: 'var(--space-6)' }}>
                            {activeCategory === 'all'
                                ? 'Nobody has listed anything for trade yet. Be the first!'
                                : `There are no items currently listed in the ${activeCategory} category.`}
                        </p>
                        <Button variant="secondary" onClick={() => setActiveCategory('all')}>
                            View All Items
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className={styles.grid}>
                    {listings.map(listing => (
                        <Card
                            key={listing.id}
                            hover
                            onClick={() => router.push(`/marketplace/${listing.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={styles.listingCard}>
                                <div className={styles.image}>
                                    {listing.images?.[0] ? (
                                        <img
                                            src={listing.images[0]}
                                            alt={listing.title}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <LayoutGrid size={48} />
                                    )}
                                </div>
                                <div className={styles.categoryBadge + ' ' + styles.badge}>
                                    {listing.category}
                                </div>
                                <h3 className={styles.title}>{listing.title}</h3>
                                <p className={styles.description}>{listing.description}</p>

                                <div className={styles.footer}>
                                    <div className={styles.price}>
                                        {listing.priceUgx ? formatPrice(listing.priceUgx) : 'FREE'}
                                    </div>
                                    <div className={styles.typeBadge + ' ' + styles.badge}>
                                        {listing.listingType?.replace('_', ' ') || 'for sale'}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
