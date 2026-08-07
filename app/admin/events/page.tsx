"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader, Button, PageContainer, EmptyState, IconButton, TableSkeleton, Pagination } from "@/components/ui";
import { Calendar, Plus, Edit2, Trash2, Clock } from "lucide-react";
import TambahAgendaModal from "@/components/events/TambahAgendaModal";
import { AgendaEvent, deleteEvent, updateEvent, EventStatus } from "@/lib/events";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { clientDb } from "@/lib/firebase-client";
import { confirmAlert, showSuccess, showError } from "@/lib/swal";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<AgendaEvent | null>(null);

  useEffect(() => {
    const q = query(
      collection(clientDb, "events"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: AgendaEvent[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as AgendaEvent);
      });
      setEvents(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching events:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirmAlert({
      title: "Hapus Agenda?",
      text: "Apakah Anda yakin ingin menghapus agenda ini? Aksi ini tidak dapat dibatalkan.",
      confirmText: "Ya, Hapus",
    });

    if (isConfirmed) {
      try {
        await deleteEvent(id);
        showSuccess("Berhasil!", "Agenda telah berhasil dihapus.");
      } catch (error) {
        showError("Gagal!", "Gagal menghapus agenda.");
      }
    }
  };

  const handleEdit = (event: AgendaEvent) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const handleStatusChange = async (id: string, newStatus: EventStatus) => {
    try {
      await updateEvent(id, { status: newStatus });
      showSuccess("Berhasil!", `Status agenda diperbarui menjadi "${newStatus}".`);
    } catch (error) {
      showError("Gagal!", "Gagal memperbarui status.");
    }
  };

  const getStatusDropdown = (event: AgendaEvent) => {
    if (event.status === "Selesai") {
      return (
        <span className="inline-block text-[10px] px-3 py-1.5 rounded-lg border border-accent-green-500 bg-accent-green-100 text-accent-green-500 font-bold uppercase tracking-wider">
          Selesai
        </span>
      );
    }

    let colorClass = "";
    if (event.status === "Direncanakan") {
      colorClass = "bg-accent-yellow-100 text-accent-yellow-500 border-accent-yellow-500";
    } else if (event.status === "Dilaksanakan") {
      colorClass = "bg-primary-100 text-primary-600 border-primary-500";
    }

    return (
      <select
        value={event.status}
        onChange={async (e) => {
          const selectedStatus = e.target.value as EventStatus;
          if (selectedStatus === "Selesai") {
            const isConfirmed = await confirmAlert({
              title: "Selesaikan Agenda?",
              text: "Yakin ingin menyelesaikan agenda? Agenda yang selesai tidak dapat diedit atau dihapus lagi.",
              confirmText: "Ya, Selesaikan",
            });
            if (!isConfirmed) return;
          }
          event.id && handleStatusChange(event.id, selectedStatus);
        }}
        className={`text-[10px] pl-3 pr-8 py-1.5 rounded-lg border font-bold uppercase tracking-wider outline-none cursor-pointer appearance-none bg-no-repeat transition-all ${colorClass}`}
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22171717%22%20stroke%3D%22currentColor%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
          backgroundPosition: 'right 8px center',
          backgroundSize: '10px'
        }}
      >
        <option value="Direncanakan" className="text-neutral-900 bg-white font-bold">Direncanakan</option>
        <option value="Dilaksanakan" className="text-neutral-900 bg-white font-bold">Dilaksanakan</option>
        <option value="Selesai" className="text-neutral-900 bg-white font-bold">Selesai</option>
      </select>
    );
  };

  const EventGroup = ({ title, groupEvents, isSelesai = false }: { title: string; groupEvents: AgendaEvent[]; isSelesai?: boolean }) => {
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    if (groupEvents.length === 0) return null;

    const paginatedEvents = groupEvents.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
      <div className="mb-10 last:mb-0">
        <div className="flex items-center gap-4 mb-4">
          <h3 className="font-display font-bold text-lg text-primary-900 whitespace-nowrap">{title}</h3>
          <div className="h-[2px] w-full bg-neutral-200"></div>
        </div>
        
        <div className="border border-neutral-200 rounded-2xl overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 bg-neutral-50 border-b border-neutral-200 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium whitespace-nowrap w-48">Waktu</th>
                  <th className="px-6 py-4 font-medium">Agenda</th>
                  <th className="px-6 py-4 font-medium text-center w-40">Status</th>
                  {!isSelesai && <th className="px-6 py-4 font-medium text-right w-24">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {paginatedEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-primary-900 flex items-center gap-1.5"><Calendar size={14} className="text-primary-500" /> {formatDate(event.date)}</span>
                        <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5"><Clock size={14} /> Pukul {event.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <p className="font-bold text-primary-900 mb-1">{event.title}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusDropdown(event)}
                    </td>
                    {!isSelesai && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 transition-opacity">
                          <IconButton icon={Edit2} variant="warning" onClick={() => handleEdit(event)} label="Edit" className="mr-1" />
                          <IconButton icon={Trash2} variant="danger" onClick={() => event.id && handleDelete(event.id)} label="Hapus" />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile List View */}
          <div className="md:hidden flex flex-col divide-y divide-neutral-100">
            {paginatedEvents.map((event) => (
              <div key={event.id} className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="font-bold text-primary-900 leading-tight">{event.title}</span>
                    <div className="flex items-center gap-3 mt-0.5">
                      <div className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
                        <Calendar size={12} className="text-primary-500" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
                        <Clock size={12} />
                        {event.time}
                      </div>
                    </div>
                  </div>
                  <div>
                    {getStatusDropdown(event)}
                  </div>
                </div>
                
                {!isSelesai && (
                  <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-neutral-100">
                    <IconButton icon={Edit2} variant="warning" onClick={() => handleEdit(event)} label="Edit" className="px-4 text-sm font-bold w-full max-w-[120px] gap-2">Edit</IconButton>
                    <IconButton icon={Trash2} variant="danger" onClick={() => event.id && handleDelete(event.id)} label="Hapus" className="px-4 text-sm font-bold w-full max-w-[120px] gap-2">Hapus</IconButton>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={Math.ceil(groupEvents.length / ITEMS_PER_PAGE)}
            onPageChange={setPage}
            totalItems={groupEvents.length}
            itemsPerPage={ITEMS_PER_PAGE}
            className="p-3 border-t border-neutral-100 bg-neutral-50/30"
          />
        </div>
      </div>
    );
  };

  const direncanakanEvents = events.filter(e => e.status === "Direncanakan");
  const dilaksanakanEvents = events.filter(e => e.status === "Dilaksanakan");
  const selesaiEvents = events.filter(e => e.status === "Selesai");

  return (
    <div>
      <AdminPageHeader 
        title="Agenda & Event" 
        description="Jadwal kegiatan yang akan datang di lingkungan RT 06 RW 07." 
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
              onClick={() => { setEventToEdit(null); setIsModalOpen(true); }}
            >
              Tambah Agenda
            </Button>
          </div>

          {/* Events List Container */}
          <div>
            {isLoading ? (
              <TableSkeleton />
            ) : events.length === 0 ? (
              <EmptyState 
                icon={Calendar}
                title="Belum ada agenda"
                description="Jadwalkan rapat rutin, kerja bakti, atau event lainnya."
              />
            ) : (
              <>
                <EventGroup title="Direncanakan" groupEvents={direncanakanEvents} />
                <EventGroup title="Dilaksanakan" groupEvents={dilaksanakanEvents} />
                <EventGroup title="Selesai" groupEvents={selesaiEvents} isSelesai={true} />
              </>
            )}
          </div>
        </div>
      </PageContainer>

      <TambahAgendaModal 
        key={isModalOpen ? eventToEdit?.id || 'new' : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={eventToEdit}
      />
    </div>
  );
}
