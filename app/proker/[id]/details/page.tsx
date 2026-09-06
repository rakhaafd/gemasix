"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { Program } from "@/lib/programs";
import { ProgramComment, addProgramComment } from "@/lib/program-comments";
import Navbar from "@/components/layout/Navbar";
import { Calendar, ArrowLeft, Image as ImageIcon, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, Skeleton } from "@/components/ui";
import { showSuccess, showError } from "@/lib/swal";

export default function ProgramDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Comments state
  const [comments, setComments] = useState<ProgramComment[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchProgram = async () => {
      if (!id) return;
      try {
        const docRef = doc(clientDb, "programs", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProgram({ id: docSnap.id, ...docSnap.data() } as Program);
        } else {
          console.error("Program not found");
        }
      } catch (error) {
        console.error("Error fetching program details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  // Subscribe to comments for this program
  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(clientDb, "program_comments"),
      where("programId", "==", id as string)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: ProgramComment[] = [];
        snapshot.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() } as ProgramComment);
        });

        // Client-side sort by createdAt desc
        data.sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return timeB - timeA;
        });

        setComments(data);
      },
      (error) => {
        console.error("Error fetching comments:", error);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCommentDate = (dateObj: any) => {
    if (!dateObj) return "Baru saja";
    const date = dateObj.toDate ? dateObj.toDate() : (dateObj.seconds ? new Date(dateObj.seconds * 1000) : new Date(dateObj));
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (!program?.imageUrls || program.imageUrls.length <= 1) return;

    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % program.imageUrls!.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [program]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !id) return;

    setIsSubmittingComment(true);
    try {
      await addProgramComment(id as string, commentContent, authorName);
      setCommentContent("");
      setAuthorName("");
      showSuccess("Berhasil!", "Komentar Anda telah berhasil dikirim.");
    } catch (error) {
      console.error("Failed to add comment:", error);
      showError("Gagal!", "Gagal mengirim komentar. Silakan coba lagi.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-900 relative flex flex-col">
        <Navbar />
        <main className="flex-1 pt-28 pb-20 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <div className="flex gap-3 mb-6">
                <Skeleton className="h-6 w-24 bg-primary-800" />
                <Skeleton className="h-6 w-32 bg-primary-800" />
              </div>
              <Skeleton className="h-16 w-3/4 bg-primary-800 mb-2" />
              <Skeleton className="h-16 w-1/2 bg-primary-800" />
            </div>

            <div className="flex flex-col gap-12 pb-20">
              <Skeleton className="w-full h-[400px] md:h-[600px] rounded-3xl bg-primary-800" />

              <div className="flex flex-col gap-4">
                <Skeleton className="h-6 w-full bg-primary-800" />
                <Skeleton className="h-6 w-full bg-primary-800" />
                <Skeleton className="h-6 w-5/6 bg-primary-800" />
                <Skeleton className="h-6 w-full bg-primary-800" />
                <Skeleton className="h-6 w-4/5 bg-primary-800" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-primary-900 relative flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center bg-primary-800 p-8 rounded-[2rem] border border-primary-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Program Tidak Ditemukan</h2>
            <p className="text-white/70 mb-6">Maaf, program kerja yang Anda cari tidak ada atau telah dihapus.</p>
            <Button as="button" variant="primary" onClick={() => router.push("/#program")}>
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-900 relative flex flex-col">
      {/* Background dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #64b5f6 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }}
      />

      <Navbar />

      <main className="flex-1 pt-28 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary-300 hover:text-white font-bold mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Kembali
          </button>

          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="primary">{program.category}</Badge>
              <span className="flex items-center gap-1.5 text-sm font-bold text-primary-300">
                <Calendar size={16} />
                {formatDate(program.date)}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight">
              {program.title}
            </h1>
          </div>

          <div className="flex flex-col gap-12 pb-12 border-b border-primary-800">
            {/* Image Gallery */}
            {program.imageUrls && program.imageUrls.length > 0 ? (
              <div className="flex flex-col gap-4">
                <div className="w-full h-[400px] md:h-[600px] rounded-3xl border border-primary-700 bg-primary-950/50 overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImageIndex}
                      src={program.imageUrls[activeImageIndex]}
                      alt={`Dokumentasi ${activeImageIndex + 1}`}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </AnimatePresence>

                  <div className="absolute top-4 right-4 bg-primary-900/80 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-primary-700 z-10">
                    {activeImageIndex + 1} / {program.imageUrls.length}
                  </div>

                  {program.imageUrls.length > 1 && (
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                      {program.imageUrls.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            idx === activeImageIndex ? "w-8 bg-accent-yellow-500" : "w-2 bg-white/40 hover:bg-white/60"
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-64 rounded-3xl bg-primary-900/30 border-2 border-dashed border-primary-700 flex flex-col items-center justify-center text-primary-500">
                <ImageIcon size={48} className="mb-4 opacity-50" />
                <p className="font-bold">Tidak ada dokumentasi foto</p>
              </div>
            )}

            {/* Description */}
            <div className="prose prose-md prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-white text-md leading-relaxed">{program.description}</p>
            </div>
          </div>

          {/* ============================================================ */}
          {/* DISKUSI & KOMENTAR SECTION */}
          {/* ============================================================ */}
          <div className="pt-10 flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  Komentar & Diskusi
                </h2>
              </div>
            </div>

            {/* Form Tambah Komentar */}
            <form onSubmit={handleAddComment} className="bg-primary-800/80 border border-primary-700/80 rounded-2xl p-5 md:p-6 flex flex-col gap-4 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2">
                  <label htmlFor="comment-author" className="block text-xs font-bold text-white mb-1.5">
                    Nama Anda (Opsional)
                  </label>
                  <input
                    id="comment-author"
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Anonim (atau ketik nama Anda)"
                    className="w-full px-4 py-2.5 bg-primary-900/90 border border-primary-700 rounded-xl text-sm text-white placeholder:text-primary-400/60 focus:outline-none focus:border-accent-yellow-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="comment-content" className="block text-xs font-bold text-white mb-1.5">
                  Komentar <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="comment-content"
                  required
                  rows={3}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Tulis tanggapan, kesan, atau pertanyaan Anda di sini..."
                  className="w-full px-4 py-3 bg-primary-900/90 border border-primary-700 rounded-xl text-sm text-white placeholder:text-primary-400/60 focus:outline-none focus:border-accent-yellow-500 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  as="button"
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmittingComment || !commentContent.trim()}
                  className="gap-2"
                >
                  {isSubmittingComment ? (
                    <><Loader2 size={16} className="animate-spin" /> Mengirim...</>
                  ) : (
                    <><Send size={15} /> Kirim Komentar</>
                  )}
                </Button>
              </div>
            </form>

            {/* List Komentar (Clean Public View) */}
            <div className="flex flex-col gap-3.5">
              {comments.length === 0 ? (
                <div className="py-8 text-center bg-primary-800/30 rounded-2xl border border-primary-800/60 text-primary-400">
                  <p className="text-sm font-semibold">Belum ada komentar.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-primary-800/50 border border-primary-700/50 rounded-2xl p-5 flex flex-col gap-2.5 transition-colors shadow-sm"
                  >
                    {/* Header: Name + Date */}
                    <div className="flex items-center gap-2 text-xs pb-1 border-b border-primary-700/40">
                      <span className="font-bold text-white">
                        {comment.authorName || "Anonim"}
                      </span>
                      <span className="text-primary-400 font-medium">
                        • {formatCommentDate(comment.createdAt)}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap px-0.5">
                      {comment.content}
                    </p>

                    {/* Admin Reply (Sleek Indented Block) */}
                    {comment.reply && (
                      <div className="mt-2 pl-3.5 py-1.5 border-l-2 border-accent-yellow-400 bg-primary-900/40 rounded-r-lg flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-bold text-accent-yellow-400">
                            Admin GEMASIX
                          </span>
                          <span className="text-primary-400 text-[11px]">
                            • {formatCommentDate(comment.reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-white text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                          {comment.reply.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
