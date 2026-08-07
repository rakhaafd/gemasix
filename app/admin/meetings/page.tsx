"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader, Button, PageContainer, EmptyState, IconButton, TableSkeleton, Pagination } from "@/components/ui";
import { FileText, Plus, Edit2, Trash2, Calendar, Users, Image as ImageIcon, Eye } from "lucide-react";
import TambahRapatModal from "@/components/meetings/TambahRapatModal";
import { useRouter } from "next/navigation";
import { Meeting, deleteMeeting } from "@/lib/meetings";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { confirmAlert, showSuccess, showError } from "@/lib/swal";

export default function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [meetingToEdit, setMeetingToEdit] = useState<Meeting | null>(null);

  useEffect(() => {
    const q = query(
      collection(clientDb, "meetings"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Meeting[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Meeting);
      });
      setMeetings(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching meetings:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, meetingImageUrl?: string, attendanceImageUrl?: string) => {
    const isConfirmed = await confirmAlert({
      title: "Hapus Dokumentasi Rapat?",
      text: "Apakah Anda yakin ingin menghapus dokumentasi rapat ini? Aksi ini tidak dapat dibatalkan.",
      confirmText: "Ya, Hapus",
    });

    if (isConfirmed) {
      try {
        await deleteMeeting(id, meetingImageUrl, attendanceImageUrl);
        showSuccess("Berhasil!", "Dokumentasi rapat telah berhasil dihapus.");
      } catch (error) {
        showError("Gagal!", "Gagal menghapus dokumentasi rapat.");
      }
    }
  };

  const handleEdit = (meeting: Meeting) => {
    setMeetingToEdit(meeting);
    setIsModalOpen(true);
  };

  const handleView = (meeting: Meeting) => {
    if (meeting.id) {
      router.push(`/admin/meetings/${meeting.id}/details`);
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
        title="Dokumentasi Rapat" 
        description="Arsip notulensi dan daftar hadir rapat Karang Taruna." 
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
              onClick={() => { setMeetingToEdit(null); setIsModalOpen(true); }}
            >
              Tambah Rapat
            </Button>
          </div>

          {/* Meetings Table */}
          <div className="border border-neutral-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50/50">
              <h2 className="font-bold text-primary-900 font-display">Riwayat Rapat</h2>
            </div>
        
            {isLoading ? (
              <TableSkeleton />
            ) : meetings.length === 0 ? (
              <EmptyState 
                icon={FileText}
                title="Belum ada dokumentasi rapat"
                description="Catat notulensi dan daftar hadir setiap pertemuan Karang Taruna."
              />
            ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-500 bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-6 py-4 font-medium whitespace-nowrap">Tanggal</th>
                    <th className="px-6 py-4 font-medium">Judul Rapat</th>
                    <th className="px-6 py-4 font-medium">Dokumentasi</th>
                    <th className="px-6 py-4 font-medium text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((meeting) => (
                    <tr key={meeting.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-neutral-500 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-primary-500" />
                          {formatDate(meeting.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-sm">
                        <p className="font-bold text-primary-900">{meeting.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {meeting.meetingImageUrl ? (
                            <a href={meeting.meetingImageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 text-xs font-semibold">
                              <ImageIcon size={14} /> Foto Rapat
                            </a>
                          ) : (
                            <span className="text-xs text-neutral-400 flex items-center gap-1.5"><ImageIcon size={14} /> Foto Rapat (-)</span>
                          )}
                          
                          {meeting.attendanceImageUrl ? (
                            <a href={meeting.attendanceImageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-accent-green-600 hover:text-accent-green-700 text-xs font-semibold">
                              <Users size={14} /> Daftar Hadir
                            </a>
                          ) : (
                            <span className="text-xs text-neutral-400 flex items-center gap-1.5"><Users size={14} /> Daftar Hadir (-)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                          <IconButton icon={Eye} variant="ghost" onClick={() => handleView(meeting)} label="Lihat Detail" className="mr-1" />
                          <IconButton icon={Edit2} variant="warning" onClick={() => handleEdit(meeting)} label="Edit" className="mr-1" />
                          <IconButton icon={Trash2} variant="danger" onClick={() => meeting.id && handleDelete(meeting.id, meeting.meetingImageUrl, meeting.attendanceImageUrl)} label="Hapus" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile List View */}
            <div className="md:hidden flex flex-col divide-y divide-neutral-100">
              {meetings
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                .map((meeting) => (
                <div key={meeting.id} className="p-5 flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-primary-900 leading-tight">{meeting.title}</span>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 mt-0.5">
                      <Calendar size={14} className="text-primary-500" />
                      {formatDate(meeting.date)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 py-1.5">
                    {meeting.meetingImageUrl ? (
                      <a href={meeting.meetingImageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors">
                        <ImageIcon size={14} /> Foto Rapat
                      </a>
                    ) : (
                      <span className="text-xs font-medium text-neutral-400 px-1 inline-flex items-center gap-1.5"><ImageIcon size={14} /> Foto Rapat (-)</span>
                    )}
                    
                    {meeting.attendanceImageUrl ? (
                      <a href={meeting.attendanceImageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-green-600 hover:text-accent-green-700 bg-accent-green-50 hover:bg-accent-green-100 px-3 py-1.5 rounded-lg transition-colors">
                        <Users size={14} /> Daftar Hadir
                      </a>
                    ) : (
                      <span className="text-xs font-medium text-neutral-400 px-1 inline-flex items-center gap-1.5"><Users size={14} /> Daftar Hadir (-)</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-neutral-100">
                    <Button 
                      as="button"
                      variant="primary"
                      onClick={() => handleView(meeting)}
                      className="flex-1 flex justify-center items-center gap-2 font-bold text-sm mr-3 !py-2"
                    >
                      <Eye size={16} /> Lihat Notulen
                    </Button>
                    <div className="flex gap-2">
                      <IconButton icon={Edit2} variant="warning" onClick={() => handleEdit(meeting)} label="Edit" />
                      <IconButton icon={Trash2} variant="danger" onClick={() => meeting.id && handleDelete(meeting.id, meeting.meetingImageUrl, meeting.attendanceImageUrl)} label="Hapus" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(meetings.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
              totalItems={meetings.length}
              itemsPerPage={ITEMS_PER_PAGE}
              className="p-4 border-t border-neutral-100 bg-neutral-50/30"
            />
          </>
            )}
          </div>
        </div>
      </PageContainer>

      <TambahRapatModal 
        key={isModalOpen ? meetingToEdit?.id || 'new' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={meetingToEdit}
      />
    </div>
  );
}
