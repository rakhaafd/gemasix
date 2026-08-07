"use client";

import { useEffect, useState, useRef } from "react";
import { AdminPageHeader, Button, Card, CardSkeleton, Pagination, ModalWrapper } from "@/components/ui";
import { InstagramCardPreview } from "@/components/ui/InstagramCardPreview";
import { MessageCircle, Share, Loader2, Calendar, Trash2, Eye, Download } from "lucide-react";
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { toPng } from "html-to-image";
import { confirmAlert, showSuccess, showError } from "@/lib/swal";

interface MessageItem {
  id: string;
  message: string;
  createdAt: Timestamp;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharingId, setIsSharingId] = useState<string | null>(null);
  const [previewMessage, setPreviewMessage] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // State untuk Modal Lihat Gambar
  const [selectedModalMessage, setSelectedModalMessage] = useState<MessageItem | null>(null);
  const [modalImageDataUrl, setModalImageDataUrl] = useState<string | null>(null);
  const [isGeneratingModalImage, setIsGeneratingModalImage] = useState(false);

  // Fetch data real-time
  useEffect(() => {
    const q = query(collection(clientDb, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: MessageItem[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as MessageItem);
      });
      setMessages(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching messages:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenPreview = async (msg: MessageItem) => {
    setSelectedModalMessage(msg);
    setPreviewMessage(msg.message);
    setIsGeneratingModalImage(true);
    setModalImageDataUrl(null);

    // Beri waktu render state ke DOM
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (!previewRef.current) {
      setIsGeneratingModalImage(false);
      return;
    }

    try {
      const dataUrl = await toPng(previewRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });
      setModalImageDataUrl(dataUrl);
    } catch (err) {
      console.error("Gagal membuat preview gambar:", err);
      showError("Gagal!", "Gagal memuat pratinjau gambar.");
    } finally {
      setIsGeneratingModalImage(false);
    }
  };

  const handleDownloadImage = (msgId: string) => {
    if (!modalImageDataUrl) return;
    const link = document.createElement("a");
    link.download = `gemasix-ngl-${msgId}.png`;
    link.href = modalImageDataUrl;
    link.click();
  };

  const handleShareToIG = async (msg: MessageItem) => {
    if (!previewRef.current) return;
    
    setIsSharingId(msg.id);
    
    // Set pesan ke template preview off-screen
    setPreviewMessage(msg.message);
    
    // Beri waktu sejenak agar React selesai render state baru ke DOM
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const dataUrl = await toPng(previewRef.current, {
        quality: 1,
        pixelRatio: 2, // Biar tidak pecah
        cacheBust: true,
      });

      // Convert dataUrl to Blob & File for Web Share API
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `gemasix-ngl-${msg.id}.png`, { type: "image/png" });

      // Jika browser mendukung Web Share API (misal di Smartphone/HP)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Balas NGL Gemasix",
          text: "Pesan Anonim GEMASIX",
        });
      } else {
        // Fallback untuk Desktop: download otomatis
        const link = document.createElement("a");
        link.download = `gemasix-ngl-${msg.id}.png`;
        link.href = dataUrl;
        link.click();
      }

    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Gagal share gambar:", err);
        showError("Gagal!", "Gagal membuat gambar untuk Instagram.");
      }
    } finally {
      setIsSharingId(null);
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "Baru saja";
    return timestamp.toDate().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirmAlert({
      title: "Hapus Pesan NGL?",
      text: "Apakah Anda yakin ingin menghapus pesan anonim ini?",
      confirmText: "Ya, Hapus",
    });

    if (!isConfirmed) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(clientDb, "messages", id));
      showSuccess("Berhasil!", "Pesan telah berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus pesan:", error);
      showError("Gagal!", "Gagal menghapus pesan.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (messages.length === 0) return;
    const isConfirmed = await confirmAlert({
      title: "Hapus Semua Pesan?",
      text: "PERINGATAN: Yakin ingin menghapus SEMUA pesan NGL? Tindakan ini tidak dapat dibatalkan!",
      confirmText: "Ya, Hapus Semua",
      icon: "error",
    });

    if (!isConfirmed) return;
    
    setIsDeletingAll(true);
    try {
      const batch = writeBatch(clientDb);
      messages.forEach((msg) => {
        const docRef = doc(clientDb, "messages", msg.id);
        batch.delete(docRef);
      });
      await batch.commit();
      showSuccess("Berhasil!", "Semua pesan NGL telah berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus semua pesan:", error);
      showError("Gagal!", "Gagal menghapus semua pesan.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div>
      <AdminPageHeader 
        title="Pesan NGL (Anonim)" 
        description="Saran, kritik, dan masukan anonim dari warga atau anggota." 
      />
      
      {/* Off-screen Template untuk HTML-to-Image */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <InstagramCardPreview ref={previewRef} message={previewMessage} />
      </div>

      {/* Modal Lihat Gambar */}
      <ModalWrapper
        isOpen={!!selectedModalMessage}
        onClose={() => {
          setSelectedModalMessage(null);
          setModalImageDataUrl(null);
        }}
        title="Pratinjau Story NGL"
      >
        <div className="flex flex-col items-center">
          {isGeneratingModalImage ? (
            <div className="py-24 flex flex-col items-center justify-center text-primary-500 gap-3">
              <Loader2 size={36} className="animate-spin" />
              <p className="text-sm font-semibold text-neutral-600">Membuat gambar Story...</p>
            </div>
          ) : modalImageDataUrl ? (
            <div className="w-full flex flex-col items-center">
              <div className="relative max-w-[280px] sm:max-w-[320px] rounded-3xl overflow-hidden shadow-2xl border-4 border-primary-900">
                <img
                  src={modalImageDataUrl}
                  alt="Pratinjau NGL Story"
                  className="w-full h-auto object-contain block"
                />
              </div>

              <div className="flex items-center gap-3 w-full mt-6">
                <Button
                  as="button"
                  variant="secondary"
                  onClick={() => selectedModalMessage && handleDownloadImage(selectedModalMessage.id)}
                  className="flex-1 justify-center py-2.5 text-sm"
                >
                  <Download size={16} /> Download
                </Button>
                <Button
                  as="button"
                  variant="primary"
                  onClick={() => selectedModalMessage && handleShareToIG(selectedModalMessage)}
                  className="flex-1 justify-center py-2.5 text-sm"
                >
                  <Share size={16} /> Share IG
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-neutral-500 py-8">Gagal menampilkan gambar.</p>
          )}
        </div>
      </ModalWrapper>
      
      <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm overflow-hidden p-6 sm:p-8">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-primary-900">Daftar Pesan Masuk</h2>
          {messages.length > 0 && !isLoading && (
            <Button 
              as="button"
              variant="outline" 
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="!text-red-500 hover:!bg-red-500 hover:!text-white !border-red-200 text-sm py-2 px-4 h-auto shadow-none"
            >
              {isDeletingAll ? (
                <><Loader2 size={16} className="animate-spin mr-2" /> Menghapus...</>
              ) : (
                <><Trash2 size={16} className="mr-2" /> Hapus Semua</>
              )}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border rounded-[2rem] border-neutral-200 p-6">
                <CardSkeleton />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mb-6 text-primary-400">
              <MessageCircle size={40} />
            </div>
            <h3 className="text-xl font-display font-bold text-primary-900 mb-2">Kotak masuk masih kosong</h3>
            <p className="text-neutral-500 max-w-sm">
              Saat ini belum ada pesan anonim yang masuk. Sebarkan link NGL GEMASIX ke sosial media kalian!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {messages
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((msg) => (
              <div 
                key={msg.id} 
                className="flex flex-col h-full bg-white border-2 border-primary-900 rounded-2xl p-6 shadow-[4px_4px_0_var(--color-primary-900)] hover:shadow-[6px_6px_0_var(--color-primary-900)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-primary-900 mb-4 pb-3 border-b-2 border-primary-100">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-primary-500" />
                    {formatDate(msg.createdAt)}
                  </div>
                  <button 
                    onClick={() => handleDelete(msg.id)}
                    disabled={deletingId === msg.id}
                    className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                    title="Hapus Pesan"
                  >
                    {deletingId === msg.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
                
                <div className="flex-1 mb-6">
                  <p className="text-primary-900 font-medium leading-relaxed whitespace-pre-wrap line-clamp-6">
                    "{msg.message}"
                  </p>
                </div>
                
                <div className="mt-auto pt-4 flex items-center gap-2">
                  <Button 
                    as="button"
                    variant="secondary"
                    onClick={() => handleOpenPreview(msg)}
                    className="flex-1 justify-center py-2 text-xs font-bold"
                  >
                    <Eye size={14} /> Lihat
                  </Button>
                  <Button 
                    as="button"
                    variant="primary"
                    onClick={() => handleShareToIG(msg)}
                    disabled={isSharingId === msg.id}
                    className="flex-1 justify-center py-2 text-xs font-bold"
                  >
                    {isSharingId === msg.id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Load...
                      </>
                    ) : (
                      <>
                        <Share size={14} /> Share IG
                      </>
                    )}
                  </Button>
                </div>
              </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(messages.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
              totalItems={messages.length}
              itemsPerPage={ITEMS_PER_PAGE}
              className="p-4 border-t border-neutral-100 bg-neutral-50/30 mt-6"
            />
          </>
        )}
      </div>
    </div>
  );
}
