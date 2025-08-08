import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type ModalType = 'createPokemon' | 'createMove' | 'editPokemon' | 'editMove' | 'confirmDelete' | null;

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  createdAt: number;
}

interface UIStore {
  // Modal state
  modalType: ModalType;
  modalData: Record<string, unknown>;
  
  // Toast notifications
  toasts: Toast[];
  
  // Loading states
  globalLoading: boolean;
  loadingTasks: Map<string, boolean>;
  
  // Form states
  formErrors: Map<string, string>;
  
  // Sidebar & Navigation
  sidebarOpen: boolean;
  activeTab: string;
  
  // Theme
  darkMode: boolean;
  
  // Actions - Modal
  openModal: (type: ModalType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
  
  // Actions - Toast
  showToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Actions - Loading
  setGlobalLoading: (loading: boolean) => void;
  setTaskLoading: (taskId: string, loading: boolean) => void;
  clearTaskLoading: (taskId: string) => void;
  
  // Actions - Form
  setFormError: (field: string, error: string) => void;
  clearFormError: (field: string) => void;
  clearAllFormErrors: () => void;
  
  // Actions - UI
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  
  // Selectors
  isLoading: (taskId?: string) => boolean;
  hasFormErrors: () => boolean;
  getFormError: (field: string) => string | undefined;
}

// Toast ID generator
let toastIdCounter = 0;
const generateToastId = () => `toast-${Date.now()}-${++toastIdCounter}`;

// Default toast durations (ms)
const TOAST_DURATIONS = {
  success: 3000,
  error: 5000,
  warning: 4000,
  info: 3000,
};

export const useUIStore = create<UIStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      modalType: null,
      modalData: null,
      toasts: [],
      globalLoading: false,
      loadingTasks: new Map(),
      formErrors: new Map(),
      sidebarOpen: true,
      activeTab: 'pokemon',
      darkMode: false,
      
      // Modal actions
      openModal: (type, data = null) => {
        set((state) => {
          state.modalType = type;
          state.modalData = data;
        });
      },
      
      closeModal: () => {
        set((state) => {
          state.modalType = null;
          state.modalData = null;
        });
      },
      
      // Toast actions
      showToast: (type, message, duration) => {
        const id = generateToastId();
        const toast: Toast = {
          id,
          type,
          message,
          duration: duration || TOAST_DURATIONS[type],
          createdAt: Date.now(),
        };
        
        set((state) => {
          state.toasts.push(toast);
        });
        
        // Auto-remove toast after duration
        if (toast.duration) {
          setTimeout(() => {
            get().removeToast(id);
          }, toast.duration);
        }
      },
      
      removeToast: (id) => {
        set((state) => {
          state.toasts = state.toasts.filter(t => t.id !== id);
        });
      },
      
      clearToasts: () => {
        set((state) => {
          state.toasts = [];
        });
      },
      
      // Loading actions
      setGlobalLoading: (loading) => {
        set((state) => {
          state.globalLoading = loading;
        });
      },
      
      setTaskLoading: (taskId, loading) => {
        set((state) => {
          state.loadingTasks.set(taskId, loading);
        });
      },
      
      clearTaskLoading: (taskId) => {
        set((state) => {
          state.loadingTasks.delete(taskId);
        });
      },
      
      // Form actions
      setFormError: (field, error) => {
        set((state) => {
          state.formErrors.set(field, error);
        });
      },
      
      clearFormError: (field) => {
        set((state) => {
          state.formErrors.delete(field);
        });
      },
      
      clearAllFormErrors: () => {
        set((state) => {
          state.formErrors.clear();
        });
      },
      
      // UI actions
      toggleSidebar: () => {
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        });
      },
      
      setSidebarOpen: (open) => {
        set((state) => {
          state.sidebarOpen = open;
        });
      },
      
      setActiveTab: (tab) => {
        set((state) => {
          state.activeTab = tab;
        });
      },
      
      toggleDarkMode: () => {
        const newDarkMode = !get().darkMode;
        set((state) => {
          state.darkMode = newDarkMode;
        });
        
        // Apply to document
        if (newDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Save preference
        localStorage.setItem('darkMode', newDarkMode.toString());
      },
      
      setDarkMode: (dark) => {
        set((state) => {
          state.darkMode = dark;
        });
        
        // Apply to document
        if (dark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Save preference
        localStorage.setItem('darkMode', dark.toString());
      },
      
      // Selectors
      isLoading: (taskId) => {
        if (taskId) {
          return get().loadingTasks.get(taskId) || false;
        }
        return get().globalLoading;
      },
      
      hasFormErrors: () => {
        return get().formErrors.size > 0;
      },
      
      getFormError: (field) => {
        return get().formErrors.get(field);
      },
    })),
    { name: 'UIStore' }
  )
);

// Initialize dark mode from localStorage
if (typeof window !== 'undefined') {
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  if (savedDarkMode) {
    useUIStore.getState().setDarkMode(true);
  }
}