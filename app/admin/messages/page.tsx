"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { AdminPageHeader, Button, Card, CardSkeleton, Pagination, ModalWrapper } from "@/components/ui";
import { InstagramCardPreview } from "@/components/ui/InstagramCardPreview";
import { MessageCircle, Share, Loader2, Calendar, Trash2, Eye, Download, Bell, BellRing, Search, X } from "lucide-react";
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { domToPng } from "modern-screenshot";
import { confirmAlert, showSuccess, showError } from "@/lib/swal";
import {
  isPushNotificationSupported,
  checkPushSubscriptionStatus,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/lib/push-notification";

interface MessageItem {
  id: string;
  message: string;
  createdAt: Timestamp;
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("Gagal preload gambar:", url, err);
    return null;
  }
}

async function waitForRenderReady(container: HTMLElement) {
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  const imgs = Array.from(container.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    })
  );
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );
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

  // Search, Filter & Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "longest" | "shortest">("newest");

  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);

  const [selectedModalMessage, setSelectedModalMessage] = useState<MessageItem | null>(null);
  const [modalImageDataUrl, setModalImageDataUrl] = useState<string | null>(null);
  const [isGeneratingModalImage, setIsGeneratingModalImage] = useState(false);

  // State untuk Push Notification
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [isTogglingPush, setIsTogglingPush] = useState(false);

  // Cek status Push Notification
  useEffect(() => {
    setIsPushSupported(isPushNotificationSupported());
    checkPushSubscriptionStatus().then(setIsPushSubscribed);
  }, []);

  // Preload logo saat halaman pertama kali dibuka
  useEffect(() => {
    fetchAsDataUrl("/images/logos.png").then((dataUrl) => {
      if (dataUrl) setLogoDataUrl(dataUrl);
    });
  }, []);

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

  // Reset page when filter/search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, sortOption]);

  // Processed (searched, filtered, sorted) messages
  const processedMessages = useMemo(() => {
    let result = [...messages];

    // 1. Search Query Filter
    if (searchQuery.trim() !== "") {
      const queryLower = searchQuery.toLowerCase().trim();
      result = result.filter((msg) =>
        msg.message.toLowerCase().includes(queryLower)
      );
    }

    // 2. Date Filter
    if (dateFilter !== "all") {
      const now = new Date();
      result = result.filter((msg) => {
        if (!msg.createdAt) return false;
        const msgDate = msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt as any);

        if (dateFilter === "today") {
          return (
            msgDate.getDate() === now.getDate() &&
            msgDate.getMonth() === now.getMonth() &&
            msgDate.getFullYear() === now.getFullYear()
          );
        } else if (dateFilter === "week") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          return msgDate >= sevenDaysAgo;
        } else if (dateFilter === "month") {
          return (
            msgDate.getMonth() === now.getMonth() &&
            msgDate.getFullYear() === now.getFullYear()
          );
        }
        return true;
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;

      if (sortOption === "newest") {
        return timeB - timeA;
      } else if (sortOption === "oldest") {
        return timeA - timeB;
      } else if (sortOption === "longest") {
        return b.message.length - a.message.length;
      } else if (sortOption === "shortest") {
        return a.message.length - b.message.length;
      }
      return 0;
    });

    return result;
  }, [messages, searchQuery, dateFilter, sortOption]);

  const resetFilters = () => {
    setSearchQuery("");
    setDateFilter("all");
    setSortOption("newest");
  };

  const isFilterActive = searchQuery !== "" || dateFilter !== "all" || sortOption !== "newest";

  const generateCardImage = async (): Promise<string | null> => {
    if (!previewRef.current) return null;

    if (!logoDataUrl) {
      const dataUrl = await fetchAsDataUrl("/images/logos.png");
      if (dataUrl) setLogoDataUrl(dataUrl);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    await waitForRenderReady(previewRef.current);

    const dataUrl = await domToPng(previewRef.current, {
      quality: 1,
      scale: 2,
      width: 1080,
      height: 1920,
      backgroundColor: undefined,
    });

    return dataUrl;
  };

  const handleOpenPreview = async (msg: MessageItem) => {
    setSelectedModalMessage(msg);
    setPreviewMessage(msg.message);
    setIsGeneratingModalImage(true);
    setModalImageDataUrl(null);

    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const dataUrl = await generateCardImage();
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

    setPreviewMessage(msg.message);

    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const dataUrl = await generateCardImage();
      if (!dataUrl) return;

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `gemasix-ngl-${msg.id}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Balas NGL Gemasix",
          text: "Pesan Anonim GEMASIX",
        });
      } else {
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
    const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp as any);
    return dateObj.toLocaleDateString("id-ID", {
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

  const handleTogglePush = async () => {
    setIsTogglingPush(true);
    if (isPushSubscribed) {
      const confirmed = await confirmAlert({
        title: "Matikan Notifikasi?",
        text: "Anda tidak akan lagi menerima notifikasi pesan NGL baru di perangkat ini.",
        confirmText: "Ya, Matikan",
        cancelText: "Batal",
      });
      if (confirmed) {
        const res = await unsubscribeFromPushNotifications();
        if (res.success) {
          setIsPushSubscribed(false);
          showSuccess("Berhasil!", res.message);
        } else {
          showError("Gagal!", res.message);
        }
      }
    } else {
      const res = await subscribeToPushNotifications();
      if (res.success) {
        setIsPushSubscribed(true);
        showSuccess("Berhasil!", res.message);
      } else {
        showError("Gagal!", res.message);
      }
    }
    setIsTogglingPush(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <AdminPageHeader
          title="Pesan NGL (Anonim)"
          description="Saran, kritik, dan masukan anonim dari warga atau anggota."
        />
        {isPushSupported && (
          <div className="flex-shrink-0">
            <Button
              as="button"
              variant={isPushSubscribed ? "outline" : "primary"}
              size="sm"
              onClick={handleTogglePush}
              disabled={isTogglingPush}
              className={
                isPushSubscribed
                  ? "!text-accent-green-500 !border-accent-green-500 hover:!bg-accent-green-500/10 font-bold"
                  : "!bg-accent-yellow-500 !text-primary-900 font-bold"
              }
            >
              {isTogglingPush ? (
                <><Loader2 size={16} className="animate-spin mr-1.5" /> Memproses...</>
              ) : isPushSubscribed ? (
                <><BellRing size={16} className="mr-1.5" /> Notifikasi HP Aktif</>
              ) : (
                <><Bell size={16} className="mr-1.5" /> Aktifkan Notif HP</>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Off-screen Template untuk Screenshot */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          opacity: 0,
          zIndex: -1,
          pointerEvents: "none",
        }}
      >
        <InstagramCardPreview
          ref={previewRef}
          message={previewMessage}
          logoSrc={logoDataUrl}
        />
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

              <div className="flex items-center gap-2 sm:gap-3 w-full mt-4 sm:mt-6">
                <Button
                  as="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => selectedModalMessage && handleDownloadImage(selectedModalMessage.id)}
                  className="flex-1 justify-center py-2 text-xs sm:text-sm"
                >
                  <Download size={15} /> Download
                </Button>
                <Button
                  as="button"
                  variant="primary"
                  size="sm"
                  onClick={() => selectedModalMessage && handleShareToIG(selectedModalMessage)}
                  className="flex-1 justify-center py-2 text-xs sm:text-sm"
                >
                  <Share size={15} /> Share IG
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-neutral-500 py-8">Gagal menampilkan gambar.</p>
          )}
        </div>
      </ModalWrapper>

      <div className="bg-white rounded-[2rem] border border-neutral-200 shadow-sm overflow-hidden p-6 sm:p-8">

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-primary-900">Daftar Pesan Masuk</h2>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Menampilkan {processedMessages.length} dari {messages.length} pesan
            </p>
          </div>

          {messages.length > 0 && !isLoading && (
            <Button
              as="button"
              variant="outline"
              size="sm"
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="!text-red-500 hover:!bg-red-500 hover:!text-white !border-red-200 text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 h-auto shadow-none"
            >
              {isDeletingAll ? (
                <><Loader2 size={14} className="animate-spin mr-1.5" /> Menghapus...</>
              ) : (
                <><Trash2 size={14} className="mr-1.5" /> Hapus Semua</>
              )}
            </Button>
          )}
        </div>

        {/* Search, Filter, and Sort Controls (Clean & Simple) */}
        <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-2xl p-3 mb-6 flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pesan NGL..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors p-1"
                title="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter & Sort Selectors */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
            {/* Filter Waktu */}
            <div className="relative flex-1 sm:flex-initial min-w-[130px]">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all cursor-pointer"
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">Bulan Ini</option>
              </select>
            </div>

            {/* Urutkan (Sort) */}
            <div className="relative flex-1 sm:flex-initial min-w-[140px]">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all cursor-pointer"
              >
                <option value="newest">Terbaru Dulu</option>
                <option value="oldest">Terlama Dulu</option>
                <option value="longest">Pesan Terpanjang</option>
                <option value="shortest">Pesan Terpendek</option>
              </select>
            </div>

            {/* Reset Button (only if active) */}
            {isFilterActive && (
              <button
                onClick={resetFilters}
                className="px-2.5 py-2 text-xs font-semibold text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1"
                title="Reset Filter"
              >
                <X size={14} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
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
        ) : processedMessages.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center bg-neutral-50/50 rounded-2xl border-2 border-dashed border-neutral-200 p-8">
            <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-primary-900 mb-1">Pesan Tidak Ditemukan</h3>
            <p className="text-xs text-neutral-500 max-w-sm mb-4">
              Tidak ada pesan NGL yang sesuai dengan pencarian atau filter yang dipilih.
            </p>
            <Button
              as="button"
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-xs font-bold"
            >
              Reset Filter & Pencarian
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedMessages
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

                    <div className="mt-auto pt-3 sm:pt-4 flex items-center gap-2">
                      <Button
                        as="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenPreview(msg)}
                        className="flex-1 justify-center py-1.5 sm:py-2 text-xs font-semibold"
                      >
                        <Eye size={13} /> Lihat
                      </Button>
                      <Button
                        as="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleShareToIG(msg)}
                        disabled={isSharingId === msg.id}
                        className="flex-1 justify-center py-1.5 sm:py-2 text-xs font-semibold"
                      >
                        {isSharingId === msg.id ? (
                          <>
                            <Loader2 size={13} className="animate-spin" /> Load...
                          </>
                        ) : (
                          <>
                            <Share size={13} /> Share IG
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(processedMessages.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
              totalItems={processedMessages.length}
              itemsPerPage={ITEMS_PER_PAGE}
              className="p-4 border-t border-neutral-100 bg-neutral-50/30 mt-6"
            />
          </>
        )}
      </div>
    </div>
  );
}