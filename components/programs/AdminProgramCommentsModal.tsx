import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { Program } from "@/lib/programs";
import {
  ProgramComment,
  replyProgramComment,
  deleteProgramComment,
  deleteAdminReply,
} from "@/lib/program-comments";
import { ModalWrapper, Button, IconButton } from "@/components/ui";
import { MessageSquare, Trash2, Edit2, CornerDownRight, Loader2, Check } from "lucide-react";
import { showSuccess, showError, confirmAlert } from "@/lib/swal";

interface AdminProgramCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program | null;
}

export default function AdminProgramCommentsModal({
  isOpen,
  onClose,
  program,
}: AdminProgramCommentsModalProps) {
  const [comments, setComments] = useState<ProgramComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !program?.id) {
      setComments([]);
      setIsLoading(true);
      return;
    }

    const q = query(
      collection(clientDb, "program_comments"),
      where("programId", "==", program.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: ProgramComment[] = [];
        snapshot.forEach((docSnap) => {
          data.push({ id: docSnap.id, ...docSnap.data() } as ProgramComment);
        });

        data.sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
          return timeB - timeA;
        });

        setComments(data);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching comments in admin modal:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, program?.id]);

  const formatDate = (dateObj: any) => {
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

  const handleStartReply = (comment: ProgramComment) => {
    setActiveReplyId(comment.id!);
    if (comment.reply) {
      setIsEditing(true);
      setReplyText(comment.reply.content);
    } else {
      setIsEditing(false);
      setReplyText("");
    }
  };

  const handleSendReply = async (commentId: string) => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await replyProgramComment(commentId, replyText);
      setActiveReplyId(null);
      setReplyText("");
      setIsEditing(false);
      showSuccess("Berhasil!", isEditing ? "Balasan admin telah diperbarui." : "Balasan admin telah dikirim.");
    } catch (error) {
      console.error("Failed to send admin reply:", error);
      showError("Gagal!", "Gagal menyimpan balasan admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const isConfirmed = await confirmAlert({
      title: "Hapus Komentar?",
      text: "Apakah Anda yakin ingin menghapus komentar ini?",
      confirmText: "Ya, Hapus",
    });

    if (isConfirmed) {
      try {
        await deleteProgramComment(commentId);
        showSuccess("Berhasil!", "Komentar telah dihapus.");
      } catch (error) {
        showError("Gagal!", "Gagal menghapus komentar.");
      }
    }
  };

  const handleDeleteReply = async (commentId: string) => {
    const isConfirmed = await confirmAlert({
      title: "Hapus Balasan Admin?",
      text: "Apakah Anda yakin ingin menghapus balasan ini?",
      confirmText: "Ya, Hapus",
    });

    if (isConfirmed) {
      try {
        await deleteAdminReply(commentId);
        showSuccess("Berhasil!", "Balasan berhasil dihapus.");
      } catch (error) {
        showError("Gagal!", "Gagal menghapus balasan.");
      }
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`Komentar: ${program?.title || ""}`}
    >
      <div className="flex flex-col gap-3.5 max-h-[70vh] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center text-primary-500 gap-2">
            <Loader2 size={24} className="animate-spin" />
            <p className="text-xs font-semibold text-neutral-500">Memuat komentar...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center gap-1.5">
            <MessageSquare size={32} className="text-neutral-300" />
            <p className="text-sm font-bold text-neutral-700">Belum Ada Komentar</p>
            <p className="text-xs text-neutral-400">
              Belum ada komentar dari pengunjung untuk program kerja ini.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/80 flex flex-col gap-2.5 shadow-sm"
            >
              {/* Header: Author + Date + Actions */}
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-neutral-200/50">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-primary-900">
                    {comment.authorName || "Anonim"}
                  </span>
                  <span className="text-neutral-400 font-medium">
                    • {formatDate(comment.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {!comment.reply && (
                    <button
                      onClick={() => handleStartReply(comment)}
                      className="text-xs font-semibold text-primary-700 hover:text-primary-900 px-2.5 py-1 rounded-md hover:bg-primary-100/60 transition-colors flex items-center gap-1"
                    >
                      <CornerDownRight size={12} /> Balas
                    </button>
                  )}
                  <IconButton
                    icon={Trash2}
                    variant="danger"
                    size={14}
                    onClick={() => comment.id && handleDeleteComment(comment.id)}
                    label="Hapus Komentar"
                    className="!p-1.5"
                  />
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap font-medium px-0.5 py-0.5">
                {comment.content}
              </p>

              {/* Admin Reply (Simple Sleek Indented Block) */}
              {comment.reply && (
                <div className="mt-1 pl-3.5 py-1.5 border-l-2 border-accent-yellow-500 bg-white/70 rounded-r-lg flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-primary-900">
                        Admin GEMASIX
                      </span>
                      <span className="text-neutral-400 text-[11px]">
                        • {formatDate(comment.reply.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <IconButton
                        icon={Edit2}
                        variant="warning"
                        size={13}
                        onClick={() => handleStartReply(comment)}
                        label="Edit Balasan Admin"
                        className="!p-1.5"
                      />
                      <IconButton
                        icon={Trash2}
                        variant="danger"
                        size={13}
                        onClick={() => comment.id && handleDeleteReply(comment.id)}
                        label="Hapus Balasan Admin"
                        className="!p-1.5"
                      />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {comment.reply.content}
                  </p>
                </div>
              )}

              {/* Reply Form (Create or Edit) */}
              {activeReplyId === comment.id && (
                <div className="mt-2.5 p-3.5 bg-white border border-neutral-200 rounded-xl flex flex-col gap-2.5 shadow-sm">
                  <span className="text-xs font-semibold text-primary-900 flex items-center gap-1">
                    <CornerDownRight size={12} className="text-primary-600" />
                    {isEditing ? "Update Balasan Admin" : "Tulis Balasan Admin"}
                  </span>
                  <textarea
                    rows={2.5}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tulis respon resmi admin..."
                    className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-medium text-neutral-800 focus:outline-none focus:border-primary-500 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveReplyId(null);
                        setIsEditing(false);
                      }}
                      className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 font-medium"
                    >
                      Batal
                    </button>
                    <Button
                      as="button"
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => comment.id && handleSendReply(comment.id)}
                      disabled={isSubmitting || !replyText.trim()}
                      className="!py-1.5 text-xs"
                    >
                      {isSubmitting ? "Menyimpan..." : isEditing ? "Update" : "Kirim"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </ModalWrapper>
  );
}
