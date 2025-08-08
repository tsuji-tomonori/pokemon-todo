import React, { forwardRef, useState, useEffect } from 'react';
import { clsx } from 'clsx';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  autoResize?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  variant?: 'default' | 'outlined' | 'filled';
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      hint,
      required = false,
      autoResize = false,
      maxLength,
      showCounter = false,
      variant = 'default',
      className,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(value || '');
    const textareaValue = value !== undefined ? value : internalValue;
    const characterCount = String(textareaValue).length;

    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      
      if (maxLength && newValue.length > maxLength) {
        return;
      }

      if (value === undefined) {
        setInternalValue(newValue);
      }
      
      onChange?.(event);
    };

    const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        const textarea = event.currentTarget;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    };

    const baseClasses = clsx(
      'w-full px-4 py-3 text-sm rounded-xl transition-all duration-200',
      'placeholder-gray-500 dark:placeholder-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'resize-none'
    );

    const variantClasses = {
      default: clsx(
        'bg-white dark:bg-gray-800 border',
        error
          ? 'border-red-300 dark:border-red-600'
          : 'border-gray-300 dark:border-gray-600',
        'hover:border-gray-400 dark:hover:border-gray-500'
      ),
      outlined: clsx(
        'bg-transparent border-2',
        error
          ? 'border-red-300 dark:border-red-600'
          : 'border-gray-300 dark:border-gray-600',
        'hover:border-gray-400 dark:hover:border-gray-500'
      ),
      filled: clsx(
        'bg-gray-50 dark:bg-gray-700 border border-transparent',
        error && 'border-red-300 dark:border-red-600',
        'hover:bg-gray-100 dark:hover:bg-gray-600'
      ),
    };

    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <textarea
            ref={ref}
            value={textareaValue}
            onChange={handleChange}
            onInput={handleInput}
            className={clsx(
              baseClasses,
              variantClasses[variant],
              autoResize ? 'min-h-[120px]' : 'h-32',
              (showCounter || maxLength) && 'pb-8'
            )}
            {...props}
          />
          
          {(showCounter || maxLength) && (
            <div className="absolute bottom-2 right-3 text-xs text-gray-500 dark:text-gray-400">
              {characterCount}
              {maxLength && (
                <>
                  <span className="mx-1">/</span>
                  <span className={characterCount > maxLength * 0.9 ? 'text-red-500' : ''}>
                    {maxLength}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;