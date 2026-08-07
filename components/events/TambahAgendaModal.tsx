import React, { useState, useEffect } from "react";
import { addEvent, updateEvent, AgendaEvent, EventStatus } from "@/lib/events";
import { Button, ModalWrapper, FormLabel, FormInput, FormSelect } from "@/components/ui";
import { showSuccess, showError } from "@/lib/swal";

interface TambahAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AgendaEvent | null;
}

export default function TambahAgendaModal({ isOpen, onClose, initialData }: TambahAgendaModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [status, setStatus] = useState<EventStatus>("Direncanakan");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || "");
        setDate(initialData.date || "");
        setTime(initialData.time || "");
        setStatus(initialData.status || "Direncanakan");
      } else {
        setTitle("");
        setDate("");
        setTime("");
        setStatus("Direncanakan");
      }
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    setIsLoading(true);
    try {
      const eventData = { title, date, time, status };

      if (initialData?.id) {
        await updateEvent(initialData.id, eventData);
      } else {
        await addEvent(eventData);
      }
      showSuccess("Berhasil!", initialData?.id ? "Agenda berhasil diperbarui." : "Agenda baru berhasil ditambahkan.");
      onClose();
    } catch (error) {
      console.error("Failed to save event", error);
      showError("Gagal!", "Gagal menyimpan agenda. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Agenda" : "Tambah Agenda Baru"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <FormLabel htmlFor="title" required>Nama Agenda</FormLabel>
          <FormInput
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Rapat Koordinasi Agustusan"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormLabel htmlFor="date" required>Tanggal</FormLabel>
            <FormInput
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <FormLabel htmlFor="time" required>Jam</FormLabel>
            <FormInput
              id="time"
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <FormLabel htmlFor="status" required>Status</FormLabel>
          <FormSelect
            id="status"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value as EventStatus)}
          >
            <option value="Direncanakan">Direncanakan</option>
            <option value="Dilaksanakan">Dilaksanakan</option>
            <option value="Selesai">Selesai</option>
          </FormSelect>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            as="button"
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="!text-neutral-500 hover:!text-primary-900"
          >
            Batal
          </Button>
          <Button
            as="button"
            type="submit"
            variant="primary"
            disabled={isLoading || !title || !date || !time}
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
