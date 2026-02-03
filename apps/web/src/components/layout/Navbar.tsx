'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Home, ShoppingBag, BookOpen, Calendar, User, LogOut } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import styles from './Navbar.module.css';

export function Navbar() {
    const router = useRouter();
    const { user, logout } = useAuth();

    function handleLogout() {
        logout();
        router.push('/login');
    }

    if (!user) return null;

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/feed" className={styles.logo}>
                    🎓 <span>Campus OS</span>
                </Link>

                <div className={styles.nav}>
                    <Link href="/feed" className={styles.navLink}>
                        <Home size={20} />
                        <span>Feed</span>
                    </Link>

                    <Link href="/marketplace" className={styles.navLink}>
                        <ShoppingBag size={20} />
                        <span>Trade</span>
                    </Link>

                    <Link href="/articles" className={styles.navLink}>
                        <BookOpen size={20} />
                        <span>Articles</span>
                    </Link>

                    <Link href="/timetable" className={styles.navLink}>
                        <Calendar size={20} />
                        <span>Timetable</span>
                    </Link>
                </div>

                <div className={styles.user}>
                    <span className={styles.reputation}>
                        ⭐ {user.reputation_score}
                    </span>

                    <Link href="/profile" className={styles.avatar}>
                        {getInitials(user.full_name)}
                    </Link>

                    <button onClick={handleLogout} className={styles.logoutBtn} title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
