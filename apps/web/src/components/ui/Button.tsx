import { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    className,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                styles.button,
                styles[variant],
                styles[size],
                fullWidth && styles.fullWidth,
                (disabled || isLoading) && styles.disabled,
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className={styles.spinner}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
                            <animate attributeName="stroke-dashoffset" values="32;0" dur="1s" repeatCount="indefinite" />
                        </circle>
                    </svg>
                </span>
            ) : null}
            {children}
        </button>
    );
}
