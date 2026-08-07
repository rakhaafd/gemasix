"use client";

import { motion } from "framer-motion";
import { ImageIcon, Calendar, ArrowRight, ArrowLeft } from "lucide-react";
import { Badge, Skeleton, Button, HighlightText } from "@/components/ui";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { Program } from "@/lib/programs";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function PlaceholderPhoto({ count, imageUrl }: { count: number, imageUrl?: string }) {
  if (imageUrl) {
    return (
      <div className="w-full h-44 rounded-xl relative overflow-hidden border border-primary-600">
        <div className="absolute inset-0 flex items-end p-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-900/80 text-white text-xs font-semibold rounded-lg backdrop-blur-sm">
            <ImageIcon size={11} />
            {count} Foto
          </span>
        </div>
        <img src={imageUrl} alt="Program thumbnail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="w-full h-44 rounded-xl bg-gradient-to-br from-primary-700 to-primary-800 flex items-center justify-center relative overflow-hidden border border-primary-600">
      <div className="absolute inset-0 flex items-end p-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-900/80 text-white text-xs font-semibold rounded-lg backdrop-blur-sm">
          <ImageIcon size={11} />
          {count} Foto
        </span>
      </div>
      <ImageIcon size={36} className="text-primary-600" />
    </div>
  );
}

export default function AllProgramsPage() {
  const [programsList, setProgramsList] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(clientDb, "programs"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Program[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Program);
      });
      setProgramsList(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  return (
    <div className="bg-primary-900 min-h-screen relative flex flex-col">
      <Navbar />
      
      {/* Background dot pattern shared across all dark sections */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #64b5f6 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      <main className="flex-grow pt-32 pb-24 relative z-10 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
        
        {/* Header */}
        <div className="mb-14 relative">
          <div className="absolute left-0 top-0 hidden md:block">
            <Link href="/#program" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium mt-2">
              <ArrowLeft size={20} />
              <span>Kembali</span>
            </Link>
          </div>
          <div className="md:hidden mb-6">
            <Link href="/#program" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors font-medium">
              <ArrowLeft size={20} />
              <span>Kembali</span>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight mb-4">
              Semua <HighlightText color="blue" rotate="right">Program Kerja</HighlightText>
            </h1>
            <p className="text-white/70 text-base max-w-2xl mx-auto font-medium">
              Kumpulan seluruh kegiatan dan inisiatif yang telah kami jalankan bersama untuk memajukan lingkungan.
            </p>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-primary-900/40 rounded-2xl border border-primary-700/50 p-5 flex flex-col gap-4">
                <Skeleton className="h-44 w-full rounded-xl bg-primary-800" />
                <div className="flex justify-between items-center mt-2">
                  <Skeleton className="h-6 w-20 bg-primary-800" />
                  <Skeleton className="h-4 w-24 bg-primary-800" />
                </div>
                <Skeleton className="h-6 w-3/4 bg-primary-800 mt-2" />
                <Skeleton className="h-4 w-full bg-primary-800" />
                <Skeleton className="h-4 w-5/6 bg-primary-800" />
              </div>
            ))}
          </div>
        ) : programsList.length === 0 ? (
          <div className="text-center py-32">
            <ImageIcon className="mx-auto h-16 w-16 text-primary-600/50 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Belum ada program kerja</h3>
            <p className="text-white/70 text-base">Program kerja yang telah selesai akan ditampilkan di sini.</p>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {programsList.map((p) => (
              <motion.div
                key={p.id}
                variants={item}
                className="bg-primary-900/70 backdrop-blur-sm rounded-2xl border border-primary-700 hover:border-primary-500 hover:shadow-[0_0_20px_rgba(25,118,210,0.15)] transition-all duration-200 overflow-hidden group flex flex-col h-full"
              >
                <div className="p-4">
                  <PlaceholderPhoto count={p.imageUrls?.length || 0} imageUrl={p.imageUrls?.[0]} />
                </div>
                <div className="px-5 pb-5 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="default">{p.category}</Badge>
                    <span className="flex items-center gap-1 text-[10px] text-white/40 font-medium">
                      <Calendar size={10} />
                      {formatDate(p.date)}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base leading-snug mb-2 group-hover:text-primary-300 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-4 line-clamp-3">{p.description}</p>
                  
                  <div className="flex justify-end mt-auto pt-2">
                    <Link href={`/proker/${p.id}/details`} className="text-xs font-bold text-white/50 hover:text-white flex items-center gap-1 transition-colors">
                      Lihat Detail
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
