"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#tentang", label: "Tentang Kami" },
  { href: "#organisasi", label: "Organisasi" },
  { href: "#program", label: "Program Kerja" },
  { href: "#ngl", label: "NGL" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-900/90 backdrop-blur-md shadow-lg shadow-primary-900/20 border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/images/logos.png"
                alt="Logo GEMASIX"
                fill
                className="object-contain"
              />
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-semibold text-primary-200 hover:text-white hover:bg-primary-800 rounded-lg transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <Button
              href="#ngl"
              variant="primary"
              size="sm"
              className="hidden lg:inline-flex"
            >
              Kirim Pesan
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-white rounded-lg hover:bg-primary-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-white/5"
            >
              <nav className="flex flex-col gap-1 pb-4 pt-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 text-sm font-semibold text-primary-200 hover:text-white hover:bg-primary-800 rounded-lg transition-all duration-200"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-2 mx-4 flex">
                  <Button
                    href="#ngl"
                    onClick={() => setIsOpen(false)}
                    variant="primary"
                    className="w-full justify-center py-3"
                  >
                    Kirim Pesan Anonim
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
