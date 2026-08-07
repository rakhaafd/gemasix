"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { motion } from "framer-motion";

export default function NGLSuccessPage() {
  return (
    <div className="min-h-screen bg-primary-900 flex flex-col relative overflow-hidden">
      
      {/* Background dot pattern matching landing page */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #64b5f6 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-green-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium">
          <ArrowLeft size={20} />
          <span>Kembali ke Beranda</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <Card className="p-8 flex flex-col items-center relative overflow-hidden border-2 border-accent-green-500 shadow-[8px_8px_0_var(--color-primary-900)]">
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
              className="w-20 h-20 bg-accent-green-500 rounded-full flex items-center justify-center mb-6 text-primary-900 shadow-[4px_4px_0_white]"
            >
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </motion.div>

            <h1 className="font-display font-bold text-2xl text-white mb-3">
              Terkirim!
            </h1>
            <p className="text-white/70 text-sm leading-relaxed mb-8">
              Pesan kamu berhasil dikirim secara rahasia ke pengurus GEMASIX. Terima kasih atas masukannya!
            </p>

            <div className="w-full space-y-3">
              <Button href="/ngl" variant="secondary" className="w-full justify-center rounded-2xl shadow-sm border-2 border-primary-900">
                Kirim Pesan Lain
              </Button>
              <Button href="/" variant="outline" className="w-full justify-center rounded-2xl text-white border-2 hover:bg-primary-800">
                Kembali ke Web
              </Button>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
