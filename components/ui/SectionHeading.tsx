import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  heading: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/**
 * Reusable section heading dengan eyebrow (label kecil atas),
 * heading utama, dan deskripsi opsional.
 *
 * Contoh:
 * <SectionHeading
 *   eyebrow="Program Kerja"
 *   heading={<>Apa yang sudah <HighlightText>kami lakukan?</HighlightText></>}
 *   description="Deskripsi opsional di sini."
 * />
 */
export function SectionHeading({
  eyebrow,
  heading,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow && (
        <span className="inline-block text-xs font-bold tracking-[0.2em] text-primary-400 uppercase mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
        {heading}
      </h2>
      {description && (
        <p className={cn("mt-4 text-white/70 text-base leading-relaxed", align === "center" && "max-w-xl mx-auto")}>
          {description}
        </p>
      )}
    </div>
  );
}
