import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

interface ToastContextType {
  showToast: (message: string, title?: string, variant?: ToastVariant) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showCartNotification: (action: 'development' | 'add', itemName?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastContextProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const showToast = (message: string, title?: string, variant: ToastVariant = 'default') => {
    toast({
      title: title || getDefaultTitle(variant),
      description: message,
      variant: variant,
    });
  };

  const getDefaultTitle = (variant: ToastVariant): string => {
    switch (variant) {
      case 'success': return 'Thành công';
      case 'destructive': return 'Lỗi';
      case 'warning': return 'Cảnh báo';
      case 'info': return 'Thông tin';
      default: return 'Thông báo';
    }
  };

  const showSuccess = (message: string, title?: string) => {
    showToast(message, title, 'success');
  };

  const showError = (message: string, title?: string) => {
    showToast(message, title, 'destructive');
  };

  const showWarning = (message: string, title?: string) => {
    showToast(message, title, 'warning');
  };

  const showInfo = (message: string, title?: string) => {
    showToast(message, title, 'info');
  };

  const showCartNotification = (action: 'development' | 'add', itemName?: string) => {
    switch (action) {
      case 'development':
        showWarning('Chức năng đang được phát triển. Vui lòng quay lại sau!', 'Thông báo');
        break;
      case 'add':
        if (itemName) {
          showWarning(`Chức năng đang được phát triển. Vui lòng quay lại sau!`, 'Thông báo');
        }
        break;
    }
  };

  return (
    <ToastContext.Provider value={{
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showCartNotification
    }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastContextProvider');
  }
  return context;
}