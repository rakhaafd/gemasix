"use client";

import { forwardRef } from "react";
import { Sparkles, Quote } from "lucide-react";

interface InstagramCardPreviewProps {
  message: string;
}

export const InstagramCardPreview = forwardRef<
  HTMLDivElement,
  InstagramCardPreviewProps
>(({ message }, ref) => {
  const fontSize =
    message.length <= 80
      ? "text-[72px]"
      : message.length <= 180
      ? "text-[60px]"
      : "text-[50px]";

  return (
    <div
      ref={ref}
      className="relative w-[1080px] h-[1920px] overflow-hidden flex items-center justify-center bg-primary-900"
      style={{
        fontFamily: "var(--font-display), var(--font-sans), sans-serif",
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900" />

      {/* Glow */}
      <div className="absolute -top-56 -left-56 w-[700px] h-[700px] rounded-full bg-primary-500 opacity-30 blur-[220px]" />
      <div className="absolute -bottom-56 -right-56 w-[700px] h-[700px] rounded-full bg-accent-yellow-500 opacity-20 blur-[220px]" />

      {/* Card - Glass effect */}
      <div
        className="relative w-[860px] rounded-[56px] px-20 py-24 backdrop-blur-2xl border"
        style={{
          backgroundColor: "rgba(255,255,255,0.08)",
          borderColor: "rgba(255,255,255,0.18)",
          boxShadow:
            "0 50px 120px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.25)",
        }}
      >
        {/* subtle inner glass sheen */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[56px] opacity-60"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 40%)",
          }}
        />

        {/* Header */}
        <div className="relative flex items-center gap-6">
          <img
            src="/images/logos.png"
            alt="GEMASIX"
            className="w-24 h-24 object-contain"
          />
          <div>
            <h1 className="text-white text-4xl font-black tracking-tight">
              GEMASIX
            </h1>
            <p className="text-white/60 text-2xl font-medium">
              Anonymous Message
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="relative mt-20 min-h-[760px] flex items-center">
          <Quote
            size={140}
            className="absolute -top-10 left-0 text-white/10"
            strokeWidth={1.5}
          />
          <p
            className={`${fontSize} relative z-10 leading-[1.2] font-bold text-white whitespace-pre-wrap break-words`}
          >
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="relative mt-16 border-t border-white/15 pt-10 flex justify-between items-center">
          <div>
            <p className="text-white/60 text-2xl">
              Kirim pesan anonim kamu di
            </p>
            <p className="text-accent-yellow-500 text-3xl font-bold">
              gemasix.vercel.app
            </p>
          </div>
          <div
            className="rounded-full px-7 py-4 border"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              borderColor: "rgba(255,255,255,0.2)",
            }}
          >
            <span className="text-white text-xl font-semibold tracking-wider">
              #NGL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

InstagramCardPreview.displayName = "InstagramCardPreview";