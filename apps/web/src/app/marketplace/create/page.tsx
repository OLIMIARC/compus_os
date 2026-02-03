'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, Info, AlertCircle } from 'lucide-react';
import styles from '../marketplace.module.css';

const CATEGORIES = {
    academics: ['textbooks', 'study_materials', 'past_papers', 'digital_resources'],
    electronics: ['laptops', 'phones', 'calculators', 'audio', 'gaming'],
    dorm: ['furniture', 'appliances', 'kitchen', 'decor'],
    services: ['tutoring', 'design', 'tech_support', 'photography', 'other'],
    personal: ['clothing', 'sports', 'tickets', 'art'],
    transport: ['bikes', 'scooters', 'rides', 'other'],
};

export default function CreateListingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'academics',
        subcategory: 'textbooks',
        listingType: 'for_sale',
        priceUgx: '',
        isNegotiable: false,
        condition: 'good',
        meetsLocation: '',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        // Validation
        if (formData.title.length < 5) {
            setError('Title must be at least 5 characters');
            return;
        }
        if (formData.description.length < 20) {
            setError('Description must be at least 20 characters');
            return;
        }

        const price = parseInt(formData.priceUgx);
        if ((formData.listingType === 'for_sale' || formData.listingType === 'for_rent') && (!price || price <= 0)) {
            setError('Please enter a valid price');
            return;
        }

        try {
            setIsLoading(true);
            await api.createListing({
                ...formData,
                priceUgx: price || 0,
                images: [], // For Phase 1, we'll start with empty images
            });
            router.push('/marketplace');
        } catch (err: any) {
            setError(err.message || 'Failed to create listing');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: '800px', margin: '0 auto' }}>
            <Button
                variant="secondary"
                onClick={() => router.back()}
                style={{ marginBottom: 'var(--space-6)' }}
            >
                <ChevronLeft size={18} style={{ marginRight: '8px' }} />
                Back to Marketplace
            </Button>

            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                    List an Item
                </h1>
                <p style={{ color: 'var(--gray-600)' }}>Put your items or services in front of the whole campus</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
                    <Card>
                        <div style={{ padding: 'var(--space-2)' }}>
                            <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 700 }}>Basic Information</h3>

                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. iPhone 13 Pro Max - 256GB"
                                    className={styles.searchInput}
                                    style={{ width: '100%' }}
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div style={{ marginBottom: 'var(--space-4)' }}>
                                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                    Description *
                                </label>
                                <textarea
                                    required
                                    placeholder="Describe your item in detail. Mention its condition, age, and any flaws."
                                    className={styles.searchInput}
                                    style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                        Category *
                                    </label>
                                    <select
                                        className={styles.searchInput}
                                        style={{ width: '100%' }}
                                        value={formData.category}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            category: e.target.value,
                                            subcategory: CATEGORIES[e.target.value as keyof typeof CATEGORIES][0]
                                        })}
                                    >
                                        {Object.keys(CATEGORIES).map(cat => (
                                            <option key={cat} value={cat}>
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                        Listing Type *
                                    </label>
                                    <select
                                        className={styles.searchInput}
                                        style={{ width: '100%' }}
                                        value={formData.listingType}
                                        onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                                    >
                                        <option value="for_sale">For Sale</option>
                                        <option value="for_rent">For Rent</option>
                                        <option value="service">Service</option>
                                        <option value="wanted">Wanted</option>
                                        <option value="free">Free</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div style={{ padding: 'var(--space-2)' }}>
                            <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 700 }}>Pricing & Content</h3>

                            {(formData.listingType === 'for_sale' || formData.listingType === 'for_rent' || formData.listingType === 'service') && (
                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                        Price (UGX) *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="number"
                                            required
                                            placeholder="e.g. 50000"
                                            className={styles.searchInput}
                                            style={{ width: '100%' }}
                                            value={formData.priceUgx}
                                            onChange={(e) => setFormData({ ...formData, priceUgx: e.target.value })}
                                        />
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isNegotiable}
                                            onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                                        />
                                        <span style={{ fontSize: 'var(--text-sm)' }}>Price is negotiable</span>
                                    </label>
                                </div>
                            )}

                            {formData.listingType !== 'service' && formData.category !== 'services' && (
                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                        Condition *
                                    </label>
                                    <select
                                        className={styles.searchInput}
                                        style={{ width: '100%' }}
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                    >
                                        <option value="new">New</option>
                                        <option value="like_new">Like New</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                    Prefered Meeting Location
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Main Library, Hall 5 Cafe, or Campus Security Office"
                                    className={styles.searchInput}
                                    style={{ width: '100%' }}
                                    value={formData.meetsLocation}
                                    onChange={(e) => setFormData({ ...formData, meetsLocation: e.target.value })}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', color: 'var(--gray-500)', fontSize: 'var(--text-xs)' }}>
                                    <Info size={14} />
                                    <span>Always meet in a public, well-lit place for safety.</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {error && (
                        <div style={{ padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--color-error-50)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <AlertCircle size={20} />
                            <span style={{ fontWeight: 600 }}>{error}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                        <Button
                            type="button"
                            variant="secondary"
                            style={{ flex: 1 }}
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            style={{ flex: 2 }}
                        >
                            Post Listing
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
