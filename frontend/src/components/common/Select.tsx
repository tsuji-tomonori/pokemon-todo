import React, { useState, useRef, useEffect } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  className?: string;
  onChange: (value: string | string[]) => void;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  placeholder = 'Select an option...',
  disabled = false,
  error,
  label,
  required = false,
  searchable = false,
  multiple = false,
  className,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiple ? (Array.isArray(value) ? value : value ? [value] : []) : []
  );
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = searchable
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(option => option.value === value);
  const displayValue = multiple
    ? selectedValues.length > 0
      ? `${selectedValues.length} selected`
      : placeholder
    : selectedOption?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const newSelectedValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      setSelectedValues(newSelectedValues);
      onChange(newSelectedValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={selectRef} className={clsx('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div
        onClick={handleToggle}
        className={clsx(
          'relative w-full px-4 py-3 border rounded-xl cursor-pointer transition-all duration-200',
          'bg-white dark:bg-gray-800',
          'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent',
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900'
            : 'hover:border-gray-400 dark:hover:border-gray-500',
          error
            ? 'border-red-300 dark:border-red-600'
            : 'border-gray-300 dark:border-gray-600',
          isOpen && 'ring-2 ring-blue-500 border-transparent'
        )}
      >
        <div className="flex items-center justify-between">
          <span className={clsx(
            'text-sm truncate',
            !selectedOption && !multiple
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-gray-900 dark:text-gray-100'
          )}>
            {displayValue}
          </span>
          <CaretDown
            size={16}
            className={clsx(
              'text-gray-400 transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )}
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-hidden"
          >
            {searchable && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                />
              </div>
            )}
            
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = multiple
                    ? selectedValues.includes(option.value)
                    : value === option.value;
                    
                  return (
                    <div
                      key={option.value}
                      onClick={() => !option.disabled && handleOptionClick(option.value)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 text-sm cursor-pointer transition-colors',
                        option.disabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700',
                        isSelected && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      )}
                    >
                      {option.icon && (
                        <span className="flex-shrink-0">{option.icon}</span>
                      )}
                      <span className="flex-1 truncate">{option.label}</span>
                      {isSelected && (
                        <Check size={16} className="flex-shrink-0 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;