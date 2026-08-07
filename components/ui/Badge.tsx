import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "yellow" | "ghost";

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  // Biru gelap — dipakai di card program kerja
  default: "bg-primary-600 text-primary-300",
  // Biru solid — untuk highlight aktif
  primary: "bg-primary-500/20 text-primary-300 border border-primary-500/30",
  // Kuning — untuk label spesial / featured
  yellow: "bg-accent-yellow-500 text-primary-900",
  // Transparan — label eyebrow section
  ghost: "text-primary-400 tracking-[0.2em] uppercase",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-md",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
