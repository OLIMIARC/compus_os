'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice, getInitials } from '@/lib/utils';
import { ChevronLeft, MessageCircle, MapPin, Calendar, LayoutGrid, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';
import styles from '../marketplace.module.css';

export default function ListingDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;
    const { user } = useAuth();
    const [listing, setListing] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && id) {
            loadListing();
        }
    }, [user, id]);

    async function loadListing() {
        try {
            setIsLoading(true);
            const data = await api.getListing(id, user!.campus_id);
            setListing(data);
        } catch (err: any) {
            console.error('Failed to load listing:', err);
            setError(err.message || 'Listing not found');
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: '1000px', margin: '0 auto' }}>
                <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: 'var(--space-6)' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-8)' }}>
                    <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-xl)' }} />
                    <div>
                        <div className="skeleton" style={{ height: '32px', width: '80%', marginBottom: 'var(--space-4)' }} />
                        <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: 'var(--space-8)' }} />
                        <div className="skeleton" style={{ height: '100px', marginBottom: 'var(--space-4)' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div style={{ padding: 'var(--space-12) var(--space-4)', textAlign: 'center' }}>
                <AlertTriangle size={48} style={{ color: 'var(--color-error)', margin: '0 auto var(--space-4)' }} />
                <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Listing Not Found</h2>
                <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-8)' }}>{error || 'The listing you are looking for does not exist or has been removed.'}</p>
                <Button onClick={() => router.push('/marketplace')}>Back to Marketplace</Button>
            </div>
        );
    }

    return (
        <div style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: '1000px', margin: '0 auto' }}>
            <Button
                variant="secondary"
                onClick={() => router.push('/marketplace')}
                style={{ marginBottom: 'var(--space-6)' }}
            >
                <ChevronLeft size={18} style={{ marginRight: '8px' }} />
                Back to Marketplace
            </Button>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-8)' }}>
                {/* Left Column: Visuals & Description */}
                <div>
                    {listing.images?.length > 0 ? (
                        <img
                            src={listing.images[0]}
                            alt={listing.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 'var(--radius-xl)'
                            }}
                        />
                    ) : (
                        <LayoutGrid size={80} />
                    )}
                </div>

                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>Description</h2>
                <p style={{ color: 'var(--gray-700)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: 'var(--text-md)' }}>
                    {listing.description}
                </p>

                <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-6)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray-900)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                        <ShieldCheck size={20} style={{ color: 'var(--color-primary)' }} />
                        <span>Safety Tips</span>
                    </div>
                    <ul style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', paddingLeft: 'var(--space-4)', margin: 0 }}>
                        <li>Meet in a public, well-lit campus location.</li>
                        <li>Inspect the item thoroughly before paying.</li>
                        <li>Avoid sharing personal contact info immediately.</li>
                        <li>If a deal seems too good to be true, it probably is.</li>
                    </ul>
                </div>
            </div>

            {/* Right Column: Key Details & Actions */}
            <div>
                <div className={styles.categoryBadge + ' ' + styles.badge} style={{ marginBottom: 'var(--space-2)' }}>
                    {listing.category}
                </div>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)', color: 'var(--gray-900)' }}>
                    {listing.title}
                </h1>

                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 'var(--space-6)' }}>
                    {listing.priceUgx ? formatPrice(listing.priceUgx) : 'FREE'}
                    {listing.isNegotiable && (
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', fontWeight: 600, marginLeft: '8px' }}>
                            (Negotiable)
                        </span>
                    )}
                </div>

                <Card style={{ marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', padding: '8px', borderRadius: '8px' }}>
                                <MapPin size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>LOCATION</div>
                                <div style={{ fontWeight: 600 }}>{listing.meetsLocation || 'Campus Wide'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', padding: '8px', borderRadius: '8px' }}>
                                <Tag size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>CONDITION</div>
                                <div style={{ fontWeight: 600 }}>{listing.condition?.replace('_', ' ').toUpperCase() || 'N/A'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ background: 'var(--gray-100)', color: 'var(--gray-600)', padding: '8px', borderRadius: '8px' }}>
                                <Calendar size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600 }}>POSTED</div>
                                <div style={{ fontWeight: 600 }}>{new Date(listing.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </Card>

                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Seller Details</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-8)' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 'var(--text-lg)'
                    }}>
                        {getInitials(listing.seller.fullName)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700 }}>{listing.seller.fullName}</div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                            Rep Score: ⭐ {listing.seller.reputationScore}
                        </div>
                    </div>
                </div>

                <Button fullWidth size="lg">
                    <MessageCircle size={20} style={{ marginRight: '8px' }} />
                    Contact Seller
                </Button>
            </div>
        </div>
        </div >
    );
}
