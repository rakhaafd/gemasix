import { cn } from "@/lib/utils";

type Color = "yellow" | "blue";

interface HighlightTextProps {
  children: React.ReactNode;
  color?: Color;
  rotate?: "left" | "right" | "none";
  className?: string;
}

/**
 * Inline text highlight yang dipakai di heading-heading utama.
 * Konsisten dengan gaya visual GEMASIX (kotak highlight miring).
 *
 * Contoh:
 * <h2>Apa itu <HighlightText>GEMASIX?</HighlightText></h2>
 */
export function HighlightText({
  children,
  color = "yellow",
  rotate = "left",
  className,
}: HighlightTextProps) {
  const colorClasses: Record<Color, string> = {
    yellow: "bg-accent-yellow-500 text-primary-900 border-2 border-accent-yellow-400",
    blue: "bg-primary-500 text-white border-2 border-primary-300/40",
  };

  const rotateClasses: Record<"left" | "right" | "none", string> = {
    left: "-rotate-1",
    right: "rotate-1",
    none: "",
  };

  return (
    <span
      className={cn(
        "inline-block px-3 py-1 rounded-xl shadow-[3px_3px_0_rgba(0,0,0,0.3)]",
        colorClasses[color],
        rotateClasses[rotate],
        className
      )}
    >
      {children}
    </span>
  );
}
