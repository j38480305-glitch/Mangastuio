import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'bg-terracotta-600 text-white hover:bg-terracotta-700 shadow-sm',
  secondary: 'bg-sand-100 text-terracotta-800 hover:bg-sand-200 border border-sand-300',
  ghost: 'text-terracotta-700 hover:bg-terracotta-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-terracotta-300 text-terracotta-700 hover:bg-terracotta-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
);

Button.displayName = 'Button';
