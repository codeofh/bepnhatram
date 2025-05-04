import React from "react";

interface BuildInfoProps {
  className?: string;
}

export function BuildInfo({ className }: BuildInfoProps) {
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || "Unknown";
  const buildMode = process.env.NODE_ENV || "development";
  
  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      <p>Build: {new Date(buildTime).toLocaleString()}</p>
      <p>Mode: {buildMode}</p>
      <p>Version: 1.0.0</p>
    </div>
  );
}