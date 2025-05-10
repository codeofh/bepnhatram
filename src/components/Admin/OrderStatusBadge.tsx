import React from "react";
import { Clock, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/types/order";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
  className?: string;
}

export function OrderStatusBadge({
  status,
  showIcon = true,
  className = "",
}: OrderStatusBadgeProps) {
  // Status configuration
  const statusConfig: Record<
    OrderStatus,
    {
      label: string;
      icon: React.ReactNode;
      variant: "default" | "secondary" | "destructive" | "outline" | null;
      className: string;
    }
  > = {
    pending: {
      label: "Chờ xác nhận",
      icon: <Clock className="h-3.5 w-3.5 mr-1" />,
      variant: "outline",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    processing: {
      label: "Đang chuẩn bị",
      icon: <Package className="h-3.5 w-3.5 mr-1" />,
      variant: "outline",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    },
    shipping: {
      label: "Đang giao",
      icon: <Truck className="h-3.5 w-3.5 mr-1" />,
      variant: "outline",
      className: "bg-purple-100 text-purple-800 border-purple-200",
    },
    completed: {
      label: "Đã hoàn thành",
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />,
      variant: "outline",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    cancelled: {
      label: "Đã hủy",
      icon: <XCircle className="h-3.5 w-3.5 mr-1" />,
      variant: "outline",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={`flex items-center whitespace-nowrap ${config.className} ${className}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}
