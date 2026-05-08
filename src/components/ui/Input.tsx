import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-terracotta-900">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm text-terracotta-900 placeholder:text-sand-400 transition-colors',
          'focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-200',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';
