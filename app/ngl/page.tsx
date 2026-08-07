"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Lock, Sparkles, ShieldCheck } from "lucide-react";
import { Button, HighlightText, Card } from "@/components/ui";
import { motion } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { z } from "zod";

const messageSchema = z.object({
  message: z.string().min(3, "Pesan terlalu singkat").max(1000, "Pesan terlalu panjang"),
});

export default function NGLPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessage(val);
    
    if (val.length > 0 && val.length < 3) {
      setError("Pesan terlalu singkat");
    } else if (val.length > 1000) {
      setError("Pesan terlalu panjang");
    } else {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validasi ulang sebelum submit
    const validated = messageSchema.safeParse({ message });
    if (!validated.success) {
      setError(validated.error.flatten().fieldErrors.message?.[0] || "Terjadi kesalahan");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await addDoc(collection(clientDb, "messages"), {
        message: validated.data.message,
        createdAt: serverTimestamp(),
      });
      router.push("/ngl/success");
    } catch (err) {
      console.error(err);
      setError("Gagal mengirim pesan, silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* Decorative blurs matching Hero */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium">
          <ArrowLeft size={20} />
          <span>Kembali</span>
        </Link>
      </header>

      {/* Main Form Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          {/* Header Text */}
          <div className="text-center mb-10">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Kirim Pesan <HighlightText color="yellow" rotate="right">Anonim</HighlightText>
            </h1>
            <p className="text-white/70 text-sm sm:text-base px-4">
              Punya kritik, saran, atau sekadar cerita? Kirim ke kami tanpa perlu khawatir identitasmu ketahuan.
            </p>
          </div>

          {/* Main Card */}
          <Card className="p-6 sm:p-8 relative border-2 border-primary-700 shadow-[8px_8px_0_var(--color-primary-900)]">
            {/* Form */}
            <form onSubmit={handleSubmit} method="POST" className="space-y-6">
              <div className="relative">
                <textarea
                  name="message"
                  value={message}
                  onChange={handleMessageChange}
                  rows={5}
                  required
                  placeholder="Ketik pesan rahasiamu di sini..."
                  className="w-full bg-primary-900 border-2 border-primary-700 text-white placeholder:text-white/40 rounded-2xl p-5 resize-none focus:outline-none focus:ring-0 focus:border-primary-400 focus:shadow-[0_0_15px_var(--color-primary-500)] transition-all text-[15px] font-medium"
                />
                {error && (
                  <p className="text-accent-red-500 text-xs font-semibold mt-3 px-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-red-500" /> {error}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-white/50">
                <span className="flex items-center gap-1.5"><Lock size={14} className="text-accent-yellow-500" /> 100% Anonim</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-accent-green-500" /> Privasi Aman</span>
              </div>

              <Button
                as="button"
                type="submit"
                variant="primary"
                className="w-full justify-center h-14 rounded-2xl text-[15px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    Mengirim...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send size={18} /> Kirim Sekarang
                  </span>
                )}
              </Button>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
