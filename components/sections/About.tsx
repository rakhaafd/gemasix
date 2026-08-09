"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { HighlightText } from "@/components/ui";


export default function About() {
  return (
    <section id="tentang" className="py-12 md:py-16 lg:py-24 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Two Column ── */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >

            <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] mb-6">
              Karang Taruna{" "}
              <HighlightText color="yellow" rotate="left">Genuk Baru</HighlightText>{" "}
              <br />
              RT 06 RW 07
            </h2>

            <p className="text-white/70 text-base leading-relaxed mb-4">
              <strong className="font-bold text-white">GEMASIX adalah organisasi kepemudaan</strong> yang mendorong semangat gotong royong, kreativitas, dan kepedulian sosial melalui berbagai kegiatan yang bermanfaat bagi masyarakat.
            </p>

            <p className="text-white/70 text-base leading-relaxed mb-8">
              Dengan semangat kebersamaan, GEMASIX menjadi ruang bagi para pemuda untuk berkarya, berkontribusi, dan menghadirkan berbagai kegiatan yang bermanfaat bagi lingkungan sekitar.
            </p>

          </motion.div>

          {/* Right: Logo */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative flex justify-center items-center"
          >
            <div className="absolute w-72 h-72 bg-primary-500/15 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative w-80 h-80 sm:w-96 sm:h-96">
              <Image
                src="/images/logos.png"
                alt="Logo GEMASIX"
                fill
                className="object-contain hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_40px_rgba(25,118,210,0.2)]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

