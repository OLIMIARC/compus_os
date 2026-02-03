export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatPrice(ugx: number): string {
    if (ugx === 0) return 'FREE';
    return `UGX ${ugx.toLocaleString()}`;
}

export function generateAnonymousColor(handle: string): string {
    const colors = [
        '#4A90E2', '#48A56A', '#FF8C42', '#8B5CF6',
        '#EC4899', '#14B8A6', '#F59E0B', '#EF4444'
    ];

    const hash = handle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
}

export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
