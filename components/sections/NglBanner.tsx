"use client";

import { motion } from "framer-motion";
import { MessageCircle, Send, Lock, Sparkles } from "lucide-react";
import { Button, HighlightText } from "@/components/ui";

export default function NglBanner() {
  return (
    <section
      id="ngl"
      className="py-12 md:py-16 lg:py-24 relative"
    >

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-6"
          >
            Punya{" "}
            <HighlightText color="yellow" rotate="left">saran</HighlightText>{" "}
            atau{" "}
            <HighlightText color="blue" rotate="right">kritik?</HighlightText>
            <br />
            Sampaikan secara anonim!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-base leading-relaxed mb-10 max-w-xl mx-auto"
          >
            Kami membuka ruang untuk saran, kritik, dan aspirasi dari seluruh
            anggota maupun warga. Identitasmu terjaga, suaramu terdengar.
          </motion.p>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {[
              { icon: Lock, label: "Identitas Aman" },
              { icon: MessageCircle, label: "Pesan Bebas" },
              { icon: Sparkles, label: "Anti Spam" },
            ].map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-800 text-xs font-semibold rounded-xl border border-neutral-200 shadow-sm"
              >
                <f.icon size={13} className="text-primary-500" />
                {f.label}
              </span>
            ))}
          </motion.div>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button
              href="/ngl"
              id="ngl-cta-button"
              variant="secondary"
              size="lg"
              icon={Send}
              iconPosition="left"
            >
              Kirim Pesan Sekarang
            </Button>
          </motion.div>

          {/* Floating speech bubbles (decorative) */}
          <div className="relative h-28 mt-6 hidden sm:block">
            {[
              { text: "Saran untuk kegiatan?", pos: "top-0 left-0", rotate: "-rotate-3", color: "bg-primary-500 text-white border-primary-400" },
              { text: "Kritik yang membangun", pos: "top-0 right-8", rotate: "rotate-2", color: "bg-accent-yellow-500 text-primary-900 border-accent-yellow-400" },
              { text: "Aspirasi warga", pos: "bottom-0 left-16", rotate: "rotate-3", color: "bg-accent-green-500 text-white border-accent-green-400" },
              { text: "Ide kegiatan baru", pos: "bottom-0 right-0", rotate: "-rotate-2", color: "bg-primary-300 text-primary-900 border-primary-200" },
            ].map((b) => (
              <motion.div
                key={b.text}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.random() * 0.4 + 0.3 }}
                className={`absolute px-4 py-2 rounded-2xl text-xs font-semibold border shadow-md ${b.pos} ${b.rotate} ${b.color}`}
              >
                {b.text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
