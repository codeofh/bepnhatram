import React, { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { cn } from "@/lib/utils";

interface OfflineWarningProps {
  className?: string;
}

export function OfflineWarning({ className }: OfflineWarningProps) {
  const { isOnline } = useNetworkStatus();
  const [showWarning, setShowWarning] = useState(false);
  
  // When going offline, show the warning immediately
  // When going back online, wait a moment to ensure stable connection
  useEffect(() => {
    if (!isOnline) {
      setShowWarning(true);
    } else {
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline]);
  
  if (!showWarning) return null;
  
  return (
    <div 
      className={cn(
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 p-3 rounded-md shadow-lg z-50 max-w-xs w-full transition-all duration-300",
        isOnline 
          ? "bg-green-500 text-white" 
          : "bg-red-500 text-white",
        className
      )}
    >
      <div className="flex items-center">
        {isOnline ? (
          <Wifi className="mr-2 h-5 w-5" />
        ) : (
          <WifiOff className="mr-2 h-5 w-5" />
        )}
        <div>
          <p className="font-medium">
            {isOnline 
              ? 'Kết nối đã được khôi phục' 
              : 'Mất kết nối mạng'
            }
          </p>
          <p className="text-sm opacity-90">
            {isOnline
              ? 'Đang tải lại dữ liệu...'
              : 'Ứng dụng đang chạy ở chế độ ngoại tuyến'
            }
          </p>
        </div>
      </div>
    </div>
  );
}