import { useEffect } from 'react';

/**
 * Custom hook for handling keyboard navigation
 */

interface UseKeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions) {
  const { onEscape, onEnter, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (onEscape) {
            event.preventDefault();
            onEscape();
          }
          break;
        case 'Enter':
          // Only handle enter if not in an input field
          if (onEnter && event.target && !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes((event.target as HTMLElement).tagName)) {
            event.preventDefault();
            onEnter();
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEscape, onEnter, enabled]);
}

/**
 * Hook for managing focus trap in modals
 */
interface UseFocusTrapOptions {
  enabled?: boolean;
  restoreFocus?: boolean;
}

export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, options: UseFocusTrapOptions = {}) {
  const { enabled = true, restoreFocus = true } = options;

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const focusableElements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    // Store the element that had focus before the modal opened
    const previousActiveElement = document.activeElement as HTMLElement;

    // Focus the first focusable element
    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        // Shift + Tab: move backwards
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab: move forwards
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      
      // Restore focus to the previously focused element
      if (restoreFocus && previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [enabled, restoreFocus, containerRef]);
}