import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    hover?: boolean;
}

export function Card({ children, hover = false, className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                styles.card,
                hover && styles.hover,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
