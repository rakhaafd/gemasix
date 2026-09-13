"use client";

import { forwardRef } from "react";
import { CardStyleProps } from "./types";

export const CardStyle3 = forwardRef<HTMLDivElement, CardStyleProps>(
  ({ message, logoSrc }, ref) => {
    const fontSize =
      message.length <= 80
        ? "text-[64px]"
        : message.length <= 180
        ? "text-[52px]"
        : "text-[42px]";

    return (
      <div
        ref={ref}
        className="relative w-[1080px] h-[1920px] overflow-hidden flex items-center justify-center bg-[#9bb0fc]"
        style={{
          fontFamily: "var(--font-display), var(--font-sans), sans-serif",
          WebkitTextSizeAdjust: "100%",
          textSizeAdjust: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Subtle Line-Art Starburst di background kanan bawah */}
        <div className="absolute bottom-36 right-16 opacity-25 pointer-events-none">
          <svg width="240" height="240" viewBox="0 0 120 120" fill="none">
            <path
              d="M 60 0 L 72 42 L 120 60 L 72 78 L 60 120 L 48 78 L 0 60 L 48 42 Z"
              stroke="#233299"
              strokeWidth="4"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Main Blue Card Container */}
        <div className="relative" style={{ width: 900 }}>
          {/* Main Card Shell */}
          <div className="relative bg-[#455fe7] rounded-[52px] px-12 py-20 flex flex-col items-center justify-center shadow-[0_30px_90px_rgba(35,50,153,0.35)] border-4 border-white/20">
            {/* Neon Lime Starburst Top-Left */}
            <div className="absolute -top-12 -left-12 z-20 pointer-events-none">
              <svg width="220" height="220" viewBox="0 0 200 200" fill="none">
                <path
                  d="M 100 0 L 122 62 L 195 28 L 148 90 L 200 140 L 132 135 L 120 200 L 88 138 L 20 160 L 58 105 L 0 70 L 68 62 Z"
                  fill="#c7fa25"
                />
              </svg>
            </div>

            {/* White Message Box */}
            <div
              className="relative z-10 bg-white rounded-[40px] px-14 py-18 flex flex-col items-center justify-center text-center shadow-[0_16px_50px_rgba(0,0,0,0.18)]"
              style={{ width: "100%", boxSizing: "border-box", minHeight: 580 }}
            >
              {/* Badge @gemasix */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white rounded-full px-8 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.15)] border border-neutral-100 flex items-center gap-3">
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt="GEMASIX"
                    width={36}
                    height={36}
                    className="w-9 h-9 object-contain flex-shrink-0"
                  />
                ) : null}
                <span className="text-[#1d2875] text-xl font-black tracking-tight whitespace-nowrap">
                  @gemasix
                </span>
              </div>

              {/* Message text */}
              <p
                className={`${fontSize} leading-[1.22] font-black text-[#1d2875] whitespace-pre-wrap break-words mt-4`}
                style={{ width: "100%", boxSizing: "border-box" }}
              >
                {message}
              </p>
            </div>

            {/* Tilted Sticker #gemasixpastiasik */}
            <div
              className="absolute -bottom-7 right-12 z-20 bg-[#c7fa25] text-[#1d2875] px-10 py-4 rounded-3xl font-black text-3xl tracking-tight shadow-[0_10px_25px_rgba(0,0,0,0.2)] border-2 border-white/60"
              style={{ transform: "rotate(-5deg)" }}
            >
              #gemasixpastiasik
            </div>
          </div>
        </div>

        {/* Floating Domain Label Bawah */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-[#c7fa25] text-[#1d2875] rounded-full px-10 py-4 shadow-xl border-2 border-white">
          <p className="text-2xl font-black tracking-wide whitespace-nowrap">
            gemasix.my.id/ngl
          </p>
        </div>
      </div>
    );
  }
);

CardStyle3.displayName = "CardStyle3";
