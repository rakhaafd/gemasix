"use client";

import { forwardRef } from "react";
import { Quote } from "lucide-react";

interface InstagramCardPreviewProps {
  message: string;
  logoSrc?: string;
}

export const InstagramCardPreview = forwardRef<
  HTMLDivElement,
  InstagramCardPreviewProps
>(({ message, logoSrc }, ref) => {
  const fontSize =
    message.length <= 80
      ? "text-[72px]"
      : message.length <= 180
      ? "text-[60px]"
      : "text-[50px]";

  return (
    <div
      ref={ref}
      className="relative w-[1080px] h-[1920px] overflow-hidden flex items-center justify-center bg-primary-900 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900"
      style={{
        fontFamily: "var(--font-display), var(--font-sans), sans-serif",
        WebkitTextSizeAdjust: "100%",
        textSizeAdjust: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        className="absolute -top-[150px] -left-[150px] w-[700px] h-[700px] rounded-full"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0) 70%)",
        }}
      />
      <div
        className="absolute -bottom-[150px] -right-[150px] w-[700px] h-[700px] rounded-full"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(234,179,8,0.25) 0%, rgba(234,179,8,0) 70%)",
        }}
      />

      {/* Card - solid background, TANPA backdrop-blur */}
      <div
        className="relative w-[860px] rounded-[56px] px-20 py-24 bg-primary-900/90 border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.4)] flex flex-col"
        style={{ boxSizing: "border-box" }}
      >
        {/* Header */}
        <div className="flex items-center gap-6" style={{ width: "700px" }}>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="GEMASIX"
              width={96}
              height={96}
              className="w-24 h-24 object-contain"
              style={{ flexShrink: 0 }}
            />
          ) : (
            <div className="w-24 h-24" style={{ flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <h1 className="text-white text-4xl font-black tracking-tight whitespace-nowrap">
              GEMASIX
            </h1>
            <p className="text-white/60 text-2xl font-medium whitespace-nowrap">
              Anonymous Message
            </p>
          </div>
        </div>

        {/* Message */}
        <div
          className="relative mt-20 min-h-[760px] flex items-center"
          style={{ width: "700px" }}
        >
          <Quote
            size={140}
            strokeWidth={1.5}
            className="absolute -top-10 left-0 text-white/10"
          />
          <p
            className={`${fontSize} relative z-10 leading-[1.2] font-bold text-white whitespace-pre-wrap break-words`}
            style={{ width: "700px", boxSizing: "border-box" }}
          >
            {message}
          </p>
        </div>

        {/* Footer */}
        <div
          className="relative mt-16 pt-10 border-t border-white/15 flex justify-between items-center"
          style={{ width: "700px" }}
        >
          <div style={{ minWidth: 0 }}>
            <p className="text-white/60 text-2xl whitespace-nowrap">
              Kirim pesan anonim kamu di
            </p>
            <p className="text-accent-yellow-500 text-3xl font-bold whitespace-nowrap">
              gemasix.my.id/ngl
            </p>
          </div>
          <div
            className="rounded-full px-7 py-4 bg-white/10 border border-white/20"
            style={{ flexShrink: 0 }}
          >
            <span className="text-white text-xl font-semibold tracking-wider whitespace-nowrap">
              #NGL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

InstagramCardPreview.displayName = "InstagramCardPreview";