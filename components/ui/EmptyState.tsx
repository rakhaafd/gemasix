import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, className = "" }: EmptyStateProps) {
  return (
    <div className={`p-12 text-center text-neutral-500 border border-neutral-200 rounded-2xl ${className}`}>
      <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4 text-primary-300">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-bold text-primary-900 mb-1">{title}</h3>
      <p className="max-w-sm mx-auto">{description}</p>
    </div>
  );
}
