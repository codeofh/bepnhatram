import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AdminCardStatsProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function AdminCardStats({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: AdminCardStatsProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h4 className="text-2xl font-bold mt-1">{value}</h4>

            {trend && (
              <div className="flex items-center mt-1">
                {trend.isPositive ? (
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-xs ${trend.isPositive ? "text-green-500" : "text-red-500"}`}
                >
                  {trend.value}%
                </span>
                {description && (
                  <span className="text-xs text-gray-500 ml-1.5">
                    {description}
                  </span>
                )}
              </div>
            )}

            {!trend && description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>

          {icon && <div className="p-2 bg-primary/10 rounded-full">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
