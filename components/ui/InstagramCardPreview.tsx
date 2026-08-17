"use client";

import { forwardRef } from "react";
import { Send } from "lucide-react";

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
      {/* Squiggle loop background — signature elemen dari referensi, warna disesuaikan palette */}
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

      {/* Kartu bertumpuk — efek stacked card ala referensi */}
      <div className="relative" style={{ width: 900 }}>
        {/* Layer belakang untuk efek tumpuk */}
        <div className="absolute inset-0 translate-x-4 translate-y-4 bg-primary-900/25 rounded-[44px]" />
        <div className="absolute inset-0 translate-x-2 translate-y-2 bg-primary-900/40 rounded-[44px]" />

        {/* Kartu utama */}
        <div
          className="relative bg-white rounded-[44px] px-16 py-20 flex flex-col items-center justify-center text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          style={{ boxSizing: "border-box", minHeight: 620 }}
        >
          {/* Badge akun di atas kartu, meniru pill "@reallygreatsite" */}
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

        {/* Pill "Kirim pesan anonim" mengikuti gaya "Swipe to check out" */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-primary-900 rounded-full px-8 py-3.5 shadow-[0_8px_20px_rgba(0,0,0,0.25)] flex items-center gap-3 whitespace-nowrap">
          <span className="text-white text-xl font-bold">Kirim pesan anonimmu</span>
          <span className="w-8 h-8 rounded-full bg-accent-yellow-500 flex items-center justify-center flex-shrink-0">
            <Send size={16} className="text-primary-900" strokeWidth={2.5} />
          </span>
        </div>
      </div>

      {/* Label bawah halaman: nama domain, konsisten posisinya seperti caption di referensi */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-primary-900/60 rounded-full px-7 py-2.5">
        <p className="text-white text-2xl font-bold tracking-wide whitespace-nowrap">gemasix.my.id/ngl</p>
      </div>
    </div>
  );
});

InstagramCardPreview.displayName = "InstagramCardPreview";