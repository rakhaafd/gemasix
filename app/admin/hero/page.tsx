"use client";

import { useState, useEffect } from "react";
import {
  AdminPageHeader,
  Button,
  PageContainer,
  EmptyState,
  IconButton,
  CardSkeleton,
  Pagination,
  Badge,
} from "@/components/ui";
import { Image as ImageIcon, Plus, Trash2, Edit2, Calendar, Eye } from "lucide-react";
import TambahHeroModal from "@/components/hero/TambahHeroModal";
import { HeroImage, deleteHeroImage } from "@/lib/hero";
import { collection, query, onSnapshot } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { confirmAlert, showSuccess, showError } from "@/lib/swal";

export default function AdminHeroPage() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [heroToEdit, setHeroToEdit] = useState<HeroImage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const q = query(collection(clientDb, "hero_images"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: HeroImage[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as HeroImage);
        });

        // Client-side sort by order ascending, then by createdAt ascending
        data.sort((a, b) => {
          const orderA = typeof a.order === "number" ? a.order : 999;
          const orderB = typeof b.order === "number" ? b.order : 999;
          if (orderA !== orderB) return orderA - orderB;

          const timeA = (a.createdAt as any)?.seconds || 0;
          const timeB = (b.createdAt as any)?.seconds || 0;
          return timeA - timeB;
        });

        setHeroImages(data);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching hero images:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, imageUrl: string) => {
    const isConfirmed = await confirmAlert({
      title: "Hapus Gambar Hero?",
      text: "Apakah Anda yakin ingin menghapus gambar hero ini? Gambar tidak akan ditampilkan lagi di slider halaman depan.",
      confirmText: "Ya, Hapus",
    });

    if (isConfirmed) {
      try {
        await deleteHeroImage(id, imageUrl);
        showSuccess("Berhasil!", "Gambar hero telah berhasil dihapus.");
      } catch (error) {
        showError("Gagal!", "Gagal menghapus gambar hero.");
      }
    }
  };

  const handleEdit = (hero: HeroImage) => {
    setHeroToEdit(hero);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setHeroToEdit(null);
    setIsModalOpen(true);
  };

  const formatDate = (dateObj: any) => {
    if (!dateObj) return "-";
    const date = dateObj.seconds ? new Date(dateObj.seconds * 1000) : new Date(dateObj);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const currentItems = heroImages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <AdminPageHeader
        title="Banner Hero Section"
        description="Kelola gambar slider interaktif yang tampil di Hero Section halaman depan utama GEMASIX."
      />

      <PageContainer>
        <div className="flex flex-col gap-6">
          {/* Action Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button
              as="button"
              variant="primary"
              size="md"
              icon={Plus}
              iconPosition="left"
              onClick={handleAdd}
            >
              Tambah Gambar Hero
            </Button>
          </div>

          {/* Content Section */}
          <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50 flex justify-between items-center">
              <h2 className="font-bold text-primary-900 font-display flex items-center gap-2">
                <ImageIcon size={18} className="text-primary-600" />
                Daftar Slider Gambar Hero
              </h2>
            </div>

            {isLoading ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : heroImages.length === 0 ? (
              <EmptyState
                icon={ImageIcon}
                title="Belum ada gambar hero custom"
                description="Tambah gambar hero untuk mengkustomisasi halaman depan."
              />
            ) : (
              <div className="p-6 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentItems.map((hero, idx) => {
                    const displayOrder = hero.order || (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                    return (
                      <div
                        key={hero.id}
                        className="group border border-neutral-200 rounded-2xl overflow-hidden bg-white hover:border-primary-300 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Image Banner with Order Badge */}
                          <div className="relative aspect-[4/3] w-full bg-neutral-900 overflow-hidden">
                            <img
                              src={hero.imageUrl}
                              alt={`Gambar Hero #${displayOrder}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            
                            {/* Order Badge */}
                            <div className="absolute top-3 left-3 z-10">
                              <Badge variant="primary" className="!bg-primary-900/90 !text-white backdrop-blur-sm border border-white/20 font-bold px-2.5 py-1 text-xs">
                                {displayOrder}
                              </Badge>
                            </div>

                            <a
                              href={hero.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute top-3 right-3 bg-primary-900/70 hover:bg-primary-900 text-white p-2 rounded-xl backdrop-blur-sm transition-colors"
                              title="Lihat ukuran penuh"
                            >
                              <Eye size={16} />
                            </a>
                          </div>

                          {/* Info Footer */}
                          <div className="p-4 flex items-center justify-between gap-2 border-b border-neutral-100">

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <IconButton
                                icon={Edit2}
                                variant="warning"
                                onClick={() => handleEdit(hero)}
                                label="Edit Gambar / Urutan"
                              />
                              <IconButton
                                icon={Trash2}
                                variant="danger"
                                onClick={() => hero.id && handleDelete(hero.id, hero.imageUrl)}
                                label="Hapus"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(heroImages.length / ITEMS_PER_PAGE)}
                  onPageChange={setCurrentPage}
                  totalItems={heroImages.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  className="pt-4 border-t border-neutral-100"
                />
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      <TambahHeroModal
        key={isModalOpen ? heroToEdit?.id || "new" : "closed"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={heroToEdit}
        nextOrder={heroImages.length + 1}
      />
    </div>
  );
}
