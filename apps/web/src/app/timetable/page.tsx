'use client';

import { Card } from '@/components/ui/Card';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

export default function TimetablePage() {
    return (
        <div style={{ padding: 'var(--space-6) var(--space-4)', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: 'var(--space-8)' }}>
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                    My Timetable
                </h1>
                <p style={{ color: 'var(--gray-600)' }}>Your class schedule at a glance</p>
            </div>

            <Card>
                <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--gray-500)' }}>
                    <CalendarIcon size={64} style={{ margin: '0 auto var(--space-4)' }} />
                    <p style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                        Timetable Coming Soon
                    </p>
                    <p>
                        Add your classes and view your weekly schedule here
                    </p>
                </div>
            </Card>
        </div>
    );
}
