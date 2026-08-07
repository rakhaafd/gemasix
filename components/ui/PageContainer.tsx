import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`bg-white rounded-[2rem] border border-neutral-200 shadow-sm overflow-hidden p-6 sm:p-8 mt-6 ${className}`}>
      {children}
    </div>
  );
}
