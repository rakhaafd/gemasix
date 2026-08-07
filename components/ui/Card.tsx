import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  as?: React.ElementType;
}

/**
 * Base card dengan border dan bg yang konsisten.
 * Gunakan `hover` untuk mengaktifkan efek hover glow biru.
 */
export function Card({ children, className, hover = false, as: Tag = "div" }: CardProps) {
  return (
    <Tag
      className={cn(
        "bg-primary-800 border border-primary-700 rounded-2xl",
        hover &&
          "hover:border-primary-500 hover:shadow-[0_0_20px_rgba(25,118,210,0.15)] transition-all duration-200",
        className
      )}
    >
      {children}
    </Tag>
  );
}
