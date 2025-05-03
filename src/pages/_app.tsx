import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ToastContextProvider } from "@/contexts/ToastContext";
import { Toaster } from "@/components/ui/toaster";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastContextProvider>
      <Component {...pageProps} />
      <Toaster />
    </ToastContextProvider>
  );
}
