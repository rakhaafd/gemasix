"use client";

import { motion } from "framer-motion";
import { ArrowRight, Globe, MessageCircle } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-primary-800 relative overflow-hidden text-white z-10 pt-16 lg:pt-24 pb-8">
      {/* Background dot pattern matching other dark sections */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
      />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* CTA Content */}
        <span className="inline-block text-xs font-bold tracking-widest text-primary-400 uppercase mb-4">
          Bergabung Bersama Kami
        </span>
        <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-white leading-tight mb-4">
          Jadilah bagian dari{" "}
          <span className="inline-block bg-accent-yellow-500 text-primary-900 px-2 py-0.5 rounded-lg border-2 border-accent-yellow-400 -rotate-1">
            GEMASIX!
          </span>
        </h2>
        <p className="text-white text-sm leading-relaxed max-w-md mb-8">
          Mari bergerak bersama dan berikan dampak positif bagi masyarakat Genuk Baru RT 06 RW 07.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-16">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-yellow-500 text-primary-900 font-bold text-xs rounded-xl border-2 border-accent-yellow-400 hover:bg-accent-yellow-400 transition-all duration-200"
          >
            <Globe size={16} />
            Follow Instagram
            <ArrowRight size={14} />
          </a>
          <a
            href="#ngl"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-800 text-white font-bold text-xs rounded-xl border border-primary-700 hover:bg-primary-700 hover:border-primary-500 transition-all duration-200"
          >
            <MessageCircle size={16} />
            Kirim Pesan Anonim
          </a>
        </div>

        {/* Bottom copyright & credits */}
        <div className="w-full border-t border-primary-800/50 pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-[13px] text-white text-center">
            <span className="font-bold">© {currentYear} Gemasix. </span>
            All rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
