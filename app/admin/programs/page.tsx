"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader, Button, PageContainer, EmptyState, IconButton, Badge, TableSkeleton, Pagination } from "@/components/ui";
import { FolderOpen, Plus, Edit2, Trash2, Calendar, Image as ImageIcon, Eye, Tag } from "lucide-react";
import TambahProgramModal from "@/components/programs/TambahProgramModal";
import { Program, deleteProgram } from "@/lib/programs";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";
import { confirmAlert, showSuccess, showError } from "@/lib/swal";

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<Program | null>(null);
  const router = useRouter();

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
      setPrograms(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching programs:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, imageUrls: string[]) => {
    const isConfirmed = await confirmAlert({
      title: "Hapus Program Kerja?",
      text: "Apakah Anda yakin ingin menghapus program kerja ini? Aksi ini tidak dapat dibatalkan.",
      confirmText: "Ya, Hapus",
    });

    if (isConfirmed) {
      try {
        await deleteProgram(id, imageUrls);
        showSuccess("Berhasil!", "Program kerja telah berhasil dihapus.");
      } catch (error) {
        showError("Gagal!", "Gagal menghapus program kerja.");
      }
    }
  };

  const handleEdit = (program: Program) => {
    setProgramToEdit(program);
    setIsModalOpen(true);
  };
  
  const handleView = (program: Program) => {
    if (program.id) {
      router.push(`/proker/${program.id}/details`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div>
      <AdminPageHeader 
        title="Program Kerja" 
        description="Kelola program kerja dan dokumentasi kegiatan GEMASIX." 
      />
      
      <PageContainer>
        <div className="flex flex-col gap-8">
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <Button 
              as="button"
              variant="primary"
              size="md"
              icon={Plus}
              iconPosition="left"
              onClick={() => { setProgramToEdit(null); setIsModalOpen(true); }}
            >
              Tambah Program
            </Button>
          </div>

          {/* Programs List */}
          <div className="border border-neutral-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
              <h2 className="font-bold text-primary-900 font-display">Daftar Program Kerja</h2>
            </div>
        
            {isLoading ? (
              <TableSkeleton />
            ) : programs.length === 0 ? (
              <EmptyState 
                icon={FolderOpen}
                title="Belum ada program kerja"
                description="Mulai tambahkan program kerja dan galeri dokumentasi kegiatan di sini."
              />
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-neutral-500 bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-6 py-4 font-medium whitespace-nowrap w-40">Tanggal</th>
                        <th className="px-6 py-4 font-medium">Program Kerja</th>
                        <th className="px-6 py-4 font-medium">Galeri</th>
                        <th className="px-6 py-4 font-medium text-right w-24">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {programs
                        .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                        .map((program) => (
                        <tr key={program.id} className="hover:bg-neutral-50/50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap text-neutral-500 font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-primary-500" />
                              {formatDate(program.date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-sm">
                            <div className="flex flex-col items-start gap-1">
                              <Badge variant="primary" className="mb-1">{program.category}</Badge>
                              <p className="font-bold text-primary-900">{program.title}</p>
                              <p className="text-xs text-neutral-500 line-clamp-1">{program.description}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex -space-x-2">
                              {program.imageUrls && program.imageUrls.length > 0 ? (
                                <>
                                  {program.imageUrls.slice(0, 3).map((url, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-neutral-100 overflow-hidden relative z-10">
                                      <img src={url} alt={`Galeri ${i+1}`} className="w-full h-full object-cover" />
                                    </div>
                                  ))}
                                  {program.imageUrls.length > 3 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-primary-100 text-primary-700 text-[10px] font-bold flex items-center justify-center relative z-20">
                                      +{program.imageUrls.length - 3}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1"><ImageIcon size={14} /> 0 Foto</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 transition-opacity">
                              <IconButton icon={Eye} variant="ghost" onClick={() => handleView(program)} label="Lihat Landing" className="mr-1" />
                              <IconButton icon={Edit2} variant="warning" onClick={() => handleEdit(program)} label="Edit" className="mr-1" />
                              <IconButton icon={Trash2} variant="danger" onClick={() => program.id && handleDelete(program.id, program.imageUrls)} label="Hapus" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Mobile List View */}
                <div className="md:hidden flex flex-col divide-y divide-neutral-100">
                  {programs
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((program) => (
                    <div key={program.id} className="p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="primary">{program.category}</Badge>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500">
                          <Calendar size={12} className="text-primary-500" />
                          {formatDate(program.date)}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="font-bold text-primary-900 leading-tight text-lg">{program.title}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {program.imageUrls && program.imageUrls.length > 0 ? (
                          <div className="flex items-center gap-2">
                            <ImageIcon size={14} className="text-primary-500" />
                            <span className="text-xs font-bold text-primary-700">{program.imageUrls.length} Foto</span>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-neutral-400 px-1 inline-flex items-center gap-1.5"><ImageIcon size={14} /> 0 Foto</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 pt-3 border-t border-neutral-100">
                        <Button 
                          as="button"
                          variant="primary"
                          onClick={() => handleView(program)}
                          className="flex-1 flex justify-center items-center gap-2 font-bold text-sm mr-3 !py-2"
                        >
                          <Eye size={16} /> Lihat
                        </Button>
                        <div className="flex gap-2">
                          <IconButton icon={Edit2} variant="warning" onClick={() => handleEdit(program)} label="Edit" />
                          <IconButton icon={Trash2} variant="danger" onClick={() => program.id && handleDelete(program.id, program.imageUrls)} label="Hapus" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(programs.length / ITEMS_PER_PAGE)}
                  onPageChange={setCurrentPage}
                  totalItems={programs.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  className="p-4 border-t border-neutral-100 bg-neutral-50/30"
                />
              </>
            )}
          </div>
        </div>
      </PageContainer>

      <TambahProgramModal 
        key={isModalOpen ? programToEdit?.id || 'new' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={programToEdit}
      />
    </div>
  );
}
