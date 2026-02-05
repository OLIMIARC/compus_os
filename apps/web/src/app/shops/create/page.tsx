'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Lock, Store, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './shops-create.module.css';

interface EligibilityData {
    eligible: boolean;
    canCreate: boolean;
    existingShopCount: number;
    maxShops: number;
    requirements: {
        accountAge: { met: boolean; current: number; required: number };
        reputation: { met: boolean; current: number; required: number };
        completedActions: { met: boolean; current: number; required: number };
        reports: { met: boolean; current: number; max: number };
        goodStanding: { met: boolean; hasActiveBan: boolean };
    };
}

export default function CreateShopPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [shopName, setShopName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('services');

    useEffect(() => {
        fetchEligibility();
    }, []);

    const fetchEligibility = async () => {
        try {
            console.log('🔍 Fetching eligibility...');
            setLoading(true);
            const response = await api.getShopEligibility();
            console.log('📦 RAW response:', response);
            console.log('📦 Response keys:', Object.keys(response));
            console.log('📦 Response.data:', response.data);
            console.log('📦 Response type:', typeof response);
            const { data: eligibilityData } = response;
            console.log('📊 Destructured eligibilityData:', eligibilityData);
            setEligibility(eligibilityData);
            console.log('✅ Eligibility state set successfully');
        } catch (err: any) {
            console.error('❌ Eligibility fetch error:', err);
            setError(err.message || 'Failed to check eligibility');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShop = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError('');

        try {
            const response = await api.createShop({
                name: shopName,
                description,
                category,
            });

            if (response.ok) {
                // Redirect to the new shop page
                router.push(`/shops/${response.data.id}`);
            } else {
                throw new Error(response.data?.message || 'Failed to create shop');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create shop');
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading eligibility...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <AlertCircle size={24} style={{ marginBottom: '1rem' }} />
                    <p>{error}</p>
                    <Button onClick={fetchEligibility} variant="secondary" style={{ marginTop: '1rem' }}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!eligibility) {
        console.log('⚠️ Rendering fallback - eligibility is null/undefined');
        console.log('   Error state:', error);
        console.log('   Loading state:', loading);
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    Failed to load eligibility data
                    <br />
                    <small style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                        Debug: error={error || 'none'}, loading={loading ? 'true' : 'false'}, eligibility={eligibility === null ? 'null' : 'undefined'}
                    </small>
                </div>
            </div>
        );
    }

    const { requirements, canCreate, existingShopCount, maxShops } = eligibility;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Store className={styles.headerIcon} size={40} />
                <h1>Create Your Shop</h1>
                <p>Earn the privilege to run your own shop on Campus Trade</p>
            </div>

            {/* Eligibility Checklist */}
            <Card className={styles.eligibilityCard}>
                <h2>Eligibility Requirements</h2>
                <p className={styles.subtitle}>
                    {canCreate
                        ? '✅ You meet all requirements! Create your shop below.'
                        : 'Complete these requirements to unlock shop creation:'}
                </p>

                <div className={styles.requirements}>
                    {/* Account Age */}
                    <div className={`${styles.requirement} ${requirements.accountAge.met ? styles.met : styles.unmet}`}>
                        {requirements.accountAge.met ? (
                            <CheckCircle className={styles.icon} size={24} />
                        ) : (
                            <XCircle className={styles.icon} size={24} />
                        )}
                        <div className={styles.requirementContent}>
                            <div className={styles.requirementTitle}>
                                Account Age: {requirements.accountAge.current} days
                            </div>
                            <div className={styles.requirementProgress}>
                                <div
                                    className={styles.progressBar}
                                    style={{
                                        width: `${Math.min(
                                            (requirements.accountAge.current / requirements.accountAge.required) * 100,
                                            100
                                        )}%`,
                                    }}
                                />
                            </div>
                            <div className={styles.requirementMeta}>
                                Required: {requirements.accountAge.required} days
                            </div>
                        </div>
                    </div>

                    {/* Reputation */}
                    <div className={`${styles.requirement} ${requirements.reputation.met ? styles.met : styles.unmet}`}>
                        {requirements.reputation.met ? (
                            <CheckCircle className={styles.icon} size={24} />
                        ) : (
                            <XCircle className={styles.icon} size={24} />
                        )}
                        <div className={styles.requirementContent}>
                            <div className={styles.requirementTitle}>
                                Reputation: {requirements.reputation.current} points
                            </div>
                            <div className={styles.requirementProgress}>
                                <div
                                    className={styles.progressBar}
                                    style={{
                                        width: `${Math.min(
                                            (requirements.reputation.current / requirements.reputation.required) * 100,
                                            100
                                        )}%`,
                                    }}
                                />
                            </div>
                            <div className={styles.requirementMeta}>
                                Required: {requirements.reputation.required} points
                            </div>
                        </div>
                    </div>

                    {/* Completed Actions */}
                    <div
                        className={`${styles.requirement} ${requirements.completedActions.met ? styles.met : styles.unmet}`}
                    >
                        {requirements.completedActions.met ? (
                            <CheckCircle className={styles.icon} size={24} />
                        ) : (
                            <XCircle className={styles.icon} size={24} />
                        )}
                        <div className={styles.requirementContent}>
                            <div className={styles.requirementTitle}>
                                Completed Actions: {requirements.completedActions.current}
                            </div>
                            <div className={styles.requirementProgress}>
                                <div
                                    className={styles.progressBar}
                                    style={{
                                        width: `${Math.min(
                                            (requirements.completedActions.current /
                                                requirements.completedActions.required) *
                                            100,
                                            100
                                        )}%`,
                                    }}
                                />
                            </div>
                            <div className={styles.requirementMeta}>
                                Required: {requirements.completedActions.required} actions
                            </div>
                        </div>
                    </div>

                    {/* Reports */}
                    <div className={`${styles.requirement} ${requirements.reports.met ? styles.met : styles.unmet}`}>
                        {requirements.reports.met ? (
                            <CheckCircle className={styles.icon} size={24} />
                        ) : (
                            <XCircle className={styles.icon} size={24} />
                        )}
                        <div className={styles.requirementContent}>
                            <div className={styles.requirementTitle}>
                                Clean Record: {requirements.reports.current} reports
                            </div>
                            <div className={styles.requirementMeta}>
                                Maximum allowed: {requirements.reports.max} reports
                            </div>
                        </div>
                    </div>

                    {/* Good Standing */}
                    <div
                        className={`${styles.requirement} ${requirements.goodStanding.met ? styles.met : styles.unmet}`}
                    >
                        {requirements.goodStanding.met ? (
                            <CheckCircle className={styles.icon} size={24} />
                        ) : (
                            <XCircle className={styles.icon} size={24} />
                        )}
                        <div className={styles.requirementContent}>
                            <div className={styles.requirementTitle}>
                                {requirements.goodStanding.met ? 'Account in Good Standing' : 'Account Suspended/Banned'}
                            </div>
                            {requirements.goodStanding.hasActiveBan && (
                                <div className={styles.requirementMeta}>
                                    Your account has been banned. Contact support for assistance.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Shop Limit Info */}
                {existingShopCount > 0 && (
                    <div className={styles.shopLimitInfo}>
                        <AlertCircle size={20} />
                        <span>
                            You already have {existingShopCount} shop{existingShopCount > 1 ? 's' : ''}. Maximum: {maxShops}
                        </span>
                    </div>
                )}
            </Card>

            {/* Shop Creation Form (only if eligible) */}
            {canCreate && (
                <Card className={styles.formCard}>
                    <h2>Create Your Shop</h2>
                    <form onSubmit={handleCreateShop}>
                        <div className={styles.formGroup}>
                            <label htmlFor="shopName">Shop Name *</label>
                            <input
                                id="shopName"
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                placeholder="e.g., Tech Repairs Hub"
                                minLength={3}
                                maxLength={50}
                                required
                                className={styles.input}
                            />
                            <span className={styles.charCount}>{shopName.length}/50</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="description">Description *</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what your shop offers..."
                                minLength={10}
                                maxLength={500}
                                required
                                rows={4}
                                className={styles.textarea}
                            />
                            <span className={styles.charCount}>{description.length}/500</span>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="category">Category *</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className={styles.select}
                            >
                                <option value="services">Services</option>
                                <option value="electronics">Electronics</option>
                                <option value="academics">Academics</option>
                                <option value="food">Food & Beverages</option>
                                <option value="fashion">Fashion</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}

                        <Button type="submit" disabled={creating} className={styles.submitButton}>
                            {creating ? 'Creating Shop...' : 'Create Shop'}
                        </Button>
                    </form>
                </Card>
            )}

            {/* Tips for Ineligible Users */}
            {!canCreate && (
                <Card className={styles.tipsCard}>
                    <h3>How to Become Eligible</h3>
                    <ul className={styles.tipsList}>
                        {!requirements.accountAge.met && (
                            <li>
                                <strong>Account Age:</strong> Your account needs to be at least{' '}
                                {requirements.accountAge.required} days old. Keep engaging with the platform!
                            </li>
                        )}
                        {!requirements.reputation.met && (
                            <li>
                                <strong>Reputation:</strong> Earn reputation by posting helpful content, trading fairly, and
                                being an active community member.
                            </li>
                        )}
                        {!requirements.completedActions.met && (
                            <li>
                                <strong>Completed Actions:</strong> Complete at least {requirements.completedActions.required}{' '}
                                actions (posts, trades, comments, etc.) to show you're an active user.
                            </li>
                        )}
                        {!requirements.reports.met && (
                            <li>
                                <strong>Clean Record:</strong> You have too many reports against your account. Focus on
                                positive interactions and following community guidelines.
                            </li>
                        )}
                        {!requirements.goodStanding.met && (
                            <li>
                                <strong>Account Status:</strong> Your account is currently suspended or banned. Contact support
                                to resolve this issue.
                            </li>
                        )}
                    </ul>
                </Card>
            )}
        </div>
    );
}
