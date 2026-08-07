import React from "react";
import { LucideIcon } from "lucide-react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  variant?: "primary" | "warning" | "danger" | "ghost" | "success";
  size?: number;
  label?: string; // used for title
  children?: React.ReactNode;
}

export function IconButton({ icon: Icon, variant = "primary", size = 16, label, children, className = "", ...props }: IconButtonProps) {
  
  const variants = {
    primary: "text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100",
    warning: "text-accent-yellow-600 hover:text-accent-yellow-700 bg-accent-yellow-50 hover:bg-accent-yellow-100",
    danger: "text-accent-red-600 hover:text-accent-red-700 bg-accent-red-50 hover:bg-accent-red-100",
    success: "text-accent-green-600 hover:text-accent-green-700 bg-accent-green-50 hover:bg-accent-green-100",
    ghost: "text-neutral-400 hover:text-primary-600 hover:bg-primary-50"
  };

  const selectedVariant = variants[variant] || variants.primary;

  return (
    <button 
      title={label}
      className={`p-2 rounded-lg transition-colors flex items-center justify-center ${selectedVariant} ${className}`}
      {...props}
    >
      <Icon size={size} />
      {children && <span>{children}</span>}
    </button>
  );
}
