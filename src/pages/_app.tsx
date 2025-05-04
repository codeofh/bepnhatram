import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { Toaster } from "@/components/ui/toaster";
import { ToastContextProvider } from '@/contexts/ToastContext';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  // Softgen AI monitoring script
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      const script = document.createElement('script');
      script.src = 'https://cdn.softgen.ai/script.js';
      script.async = true;
      script.setAttribute('data-softgen-monitoring', 'true');
      document.head.appendChild(script);
      
      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  return (
    <ToastContextProvider>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster />
      </AuthProvider>
    </ToastContextProvider>
  );
}