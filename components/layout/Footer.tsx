"use client";

import { motion } from "framer-motion";
import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappNumber = "62895339023888";
  const whatsappMessage = encodeURIComponent("Halo min Gemasix!");

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
          Mari bergerak bersama dan berikan dampak positif bagi masyarakat <span className="font-bold"> Genuk Baru RT 06 RW 07.</span>
        </p>

        {/* Social icons */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <a
            href="https://instagram.com/gemasix_"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Gemasix"
            className="inline-flex items-center justify-center w-12 h-12 bg-primary-800 text-white rounded-full border border-primary-700 hover:bg-accent-yellow-500 hover:text-primary-900 hover:border-accent-yellow-400 transition-all duration-200"
          >
            <FaInstagram size={20} />
          </a>

          <a
            href="https://www.tiktok.com/@karang.taruna_gemasix"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok Gemasix"
            className="inline-flex items-center justify-center w-12 h-12 bg-primary-800 text-white rounded-full border border-primary-700 hover:bg-accent-yellow-500 hover:text-primary-900 hover:border-accent-yellow-400 transition-all duration-200"
          >
            <FaTiktok size={20} />
          </a>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat WhatsApp Gemasix"
            className="inline-flex items-center justify-center w-12 h-12 bg-primary-800 text-white rounded-full border border-primary-700 hover:bg-accent-yellow-500 hover:text-primary-900 hover:border-accent-yellow-400 transition-all duration-200"
          >
            <FaWhatsapp size={22} />
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