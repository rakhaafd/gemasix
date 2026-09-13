"use client";

import { forwardRef } from "react";
import { Send, Quote } from "lucide-react";

export type CardStyleVariant = "style1" | "style2";

interface InstagramCardPreviewProps {
  message: string;
  logoSrc?: string;
  variant?: CardStyleVariant;
}

export const InstagramCardPreview = forwardRef<
  HTMLDivElement,
  InstagramCardPreviewProps
>(({ message, logoSrc, variant = "style2" }, ref) => {
  if (variant === "style1") {
    // Style 1: Dark Elegant Theme (pre-70a1e10)
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

        {/* Card */}
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
  }

  // Style 2: Vibrant Yellow & White Pill Theme (Commit 70a1e10)
  const fontSize =
    message.length <= 80
      ? "text-[68px]"
      : message.length <= 180
        ? "text-[56px]"
        : "text-[46px]";

  return (
    <div
      ref={ref}
      className="relative w-[1080px] h-[1920px] overflow-hidden bg-primary-500 flex items-center justify-center"
      style={{
        fontFamily: "var(--font-display), var(--font-sans), sans-serif",
        WebkitTextSizeAdjust: "100%",
        textSizeAdjust: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Squiggle loop background */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1080 1920"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M -100 250 C 100 100, 250 100, 300 250 C 350 400, 200 450, 150 350 C 100 250, 250 150, 400 250 C 550 350, 500 550, 350 550"
          stroke="var(--color-accent-yellow-500)"
          strokeWidth="34"
          strokeLinecap="round"
        />
        <path
          d="M 1180 1650 C 980 1500, 830 1500, 780 1650 C 730 1800, 880 1850, 930 1750 C 980 1650, 830 1550, 680 1650 C 530 1750, 580 1950, 730 1950"
          stroke="var(--color-accent-yellow-500)"
          strokeWidth="34"
          strokeLinecap="round"
        />
      </svg>

      {/* Kartu bertumpuk */}
      <div className="relative" style={{ width: 900 }}>
        {/* Layer belakang */}
        <div className="absolute inset-0 translate-x-4 translate-y-4 bg-primary-900/25 rounded-[44px]" />
        <div className="absolute inset-0 translate-x-2 translate-y-2 bg-primary-900/40 rounded-[44px]" />

        {/* Kartu utama */}
        <div
          className="relative bg-white rounded-[44px] px-16 py-20 flex flex-col items-center justify-center text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          style={{ boxSizing: "border-box", minHeight: 620 }}
        >
          {/* Badge akun di atas kartu */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white rounded-full px-8 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.2)] flex items-center gap-3">
            {logoSrc ? (
              <img src={logoSrc} alt="GEMASIX" width={36} height={36} className="w-9 h-9 object-contain flex-shrink-0" />
            ) : null}
            <span className="text-primary-900 text-xl font-bold tracking-tight whitespace-nowrap">
              @gemasix
            </span>
          </div>

          <p
            className={`${fontSize} leading-[1.22] font-black text-primary-900 whitespace-pre-wrap break-words`}
            style={{ width: 740, boxSizing: "border-box" }}
          >
            {message}
          </p>
        </div>

        {/* Pill bottom */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-primary-900 rounded-full px-8 py-3.5 shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex items-center gap-3 whitespace-nowrap">
          <span className="text-white text-xl font-bold">Kirim pesan anonimmu</span>
          <span className="w-8 h-8 rounded-full bg-accent-yellow-500 flex items-center justify-center flex-shrink-0">
            <Send size={16} className="text-primary-900" strokeWidth={2.5} />
          </span>
        </div>
      </div>

      {/* Label bawah halaman */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-primary-900/60 rounded-full px-7 py-2.5">
        <p className="text-white text-2xl font-bold tracking-wide whitespace-nowrap">gemasix.my.id/ngl</p>
      </div>
    </div>
  );
});

InstagramCardPreview.displayName = "InstagramCardPreview";