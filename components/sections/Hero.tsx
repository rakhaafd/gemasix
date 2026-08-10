"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button, HighlightText } from "@/components/ui";
import { useState, useEffect } from "react";

const sliderImages = [
  "/images/hero/4.jpg",
  "/images/hero/1.jpg",
  "/images/hero/2.jpg",
  "/images/hero/3.jpg"
];

export default function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
      {/* Decorative gradient blur - kita keep ini agar tetap bercahaya */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-bold text-4xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-white mb-6"
            >
              Muda{" "}
              <HighlightText color="yellow" rotate="left">Bergerak</HighlightText>
              ,{" "}
              <br />
              <span className="text-primary-300">Lingkungan</span>{" "}
              <HighlightText color="blue" rotate="right">Kuat!</HighlightText>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/70 text-base leading-relaxed max-w-lg mb-10"
            >
              Bersama menciptakan lingkungan yang lebih baik melalui semangat gotong royong, kepedulian sosial, serta berbagai kegiatan yang bermanfaat bagi masyarakat.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button href="#program" variant="primary" size="lg" icon={ArrowRight}>
                Lihat Program Kerja
              </Button>
              <Button href="#tentang" variant="secondary" size="lg">
                Tentang Kami
              </Button>
            </motion.div>
          </div>

          {/* Right — Image Slider */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative w-full aspect-[4/3] max-w-md mx-auto lg:ml-auto mt-12 lg:mt-0"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-[3rem] -z-10" />

            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-primary-800">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={sliderImages[currentImage]}
                  alt={`Kegiatan GEMASIX ${currentImage + 1}`}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Gradient overlay for better text readability and styling */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/20 to-transparent" />

              {/* Slider indicators */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                {sliderImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentImage ? "w-8 bg-accent-yellow-500" : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
