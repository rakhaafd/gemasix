import { forwardRef } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonElement = HTMLAnchorElement | HTMLButtonElement;
type ButtonProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  as?: "a" | "button";
};

const variantClasses: Record<Variant, string> = {
  // Kuning — CTA utama
  primary:
    "bg-accent-yellow-500 text-primary-900 border border-transparent shadow-md hover:shadow-lg hover:-translate-y-0.5",
  // Biru — CTA sekunder
  secondary:
    "bg-primary-500 text-white border border-transparent shadow-md hover:shadow-lg hover:-translate-y-0.5",
  // Outline netral
  outline:
    "bg-transparent text-white border border-primary-700 hover:border-primary-500 hover:bg-primary-800",
  // Tanpa border/bg
  ghost:
    "bg-transparent text-white/60 hover:text-white",
  // Merah — Aksi Destruktif
  danger:
    "bg-accent-red-500 text-white border border-transparent shadow-md hover:shadow-lg hover:-translate-y-0.5",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-xs gap-1.5",
  md: "px-6 py-3 text-sm gap-2",
  lg: "px-8 py-4 text-base gap-3",
};

const Button = forwardRef<ButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      icon: Icon,
      iconPosition = "right",
      className,
      children,
      as: Tag = "a",
      ...props
    },
    ref
  ) => {
    const classes = cn(
      "inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 whitespace-nowrap",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (Tag === "button") {
      return (
        <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
          {Icon && iconPosition === "left" && <Icon size={size === "lg" ? 18 : size === "sm" ? 12 : 15} />}
          {children}
          {Icon && iconPosition === "right" && <Icon size={size === "lg" ? 18 : size === "sm" ? 12 : 15} />}
        </button>
      );
    }

    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} className={classes} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {Icon && iconPosition === "left" && <Icon size={size === "lg" ? 18 : size === "sm" ? 12 : 15} />}
        {children}
        {Icon && iconPosition === "right" && <Icon size={size === "lg" ? 18 : size === "sm" ? 12 : 15} />}
      </a>
    );
  }
);

Button.displayName = "Button";
export { Button };
