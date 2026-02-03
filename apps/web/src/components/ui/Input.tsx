import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className, ...props }, ref) => {
        return (
            <div className={styles.wrapper}>
                {label && (
                    <label className={styles.label} htmlFor={props.id}>
                        {label}
                        {props.required && <span className={styles.required}>*</span>}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        styles.input,
                        error && styles.error,
                        className
                    )}
                    {...props}
                />
                {error && <p className={styles.errorText}>{error}</p>}
                {helperText && !error && <p className={styles.helperText}>{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
