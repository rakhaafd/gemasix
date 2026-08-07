import React, { useState, useEffect, useRef } from "react";
import { addMeeting, updateMeeting, uploadMeetingImage, Meeting } from "@/lib/meetings";
import { Button, ModalWrapper, FormLabel, FormInput, FormTextarea } from "@/components/ui";
import { X, Image as ImageIcon } from "lucide-react";
import { showSuccess, showError } from "@/lib/swal";

interface TambahRapatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Meeting | null;
}

export default function TambahRapatModal({ isOpen, onClose, initialData }: TambahRapatModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [minutes, setMinutes] = useState("");
  const [meetingImageFile, setMeetingImageFile] = useState<File | null>(null);
  const [attendanceImageFile, setAttendanceImageFile] = useState<File | null>(null);
  
  const [existingMeetingImageUrl, setExistingMeetingImageUrl] = useState<string>("");
  const [existingAttendanceImageUrl, setExistingAttendanceImageUrl] = useState<string>("");

  const [meetingImagePreview, setMeetingImagePreview] = useState<string | null>(null);
  const [attendanceImagePreview, setAttendanceImagePreview] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const meetingFileInputRef = useRef<HTMLInputElement>(null);
  const attendanceFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (meetingImagePreview) URL.revokeObjectURL(meetingImagePreview);
      if (attendanceImagePreview) URL.revokeObjectURL(attendanceImagePreview);
    };
  }, [meetingImagePreview, attendanceImagePreview]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || "");
        setDate(initialData.date || "");
        setMinutes(initialData.minutes || "");
        setExistingMeetingImageUrl(initialData.meetingImageUrl || "");
        setExistingAttendanceImageUrl(initialData.attendanceImageUrl || "");
      } else {
        setTitle("");
        setDate("");
        setMinutes("");
        setExistingMeetingImageUrl("");
        setExistingAttendanceImageUrl("");
      }
      setMeetingImageFile(null);
      setAttendanceImageFile(null);
      setMeetingImagePreview(null);
      setAttendanceImagePreview(null);
      if (meetingFileInputRef.current) meetingFileInputRef.current.value = "";
      if (attendanceFileInputRef.current) attendanceFileInputRef.current.value = "";
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !minutes) return;

    setIsLoading(true);
    try {
      let meetingImageUrl = existingMeetingImageUrl;
      if (meetingImageFile) {
        meetingImageUrl = await uploadMeetingImage(meetingImageFile);
      }
      
      let attendanceImageUrl = existingAttendanceImageUrl;
      if (attendanceImageFile) {
        attendanceImageUrl = await uploadMeetingImage(attendanceImageFile);
      }

      if (initialData?.id) {
        await updateMeeting(initialData.id, {
          title,
          date,
          minutes,
          meetingImageUrl,
          attendanceImageUrl,
        });
      } else {
        await addMeeting({
          title,
          date,
          minutes,
          meetingImageUrl,
          attendanceImageUrl,
        });
      }
      
      showSuccess("Berhasil!", initialData?.id ? "Dokumentasi rapat berhasil diperbarui." : "Dokumentasi rapat baru berhasil ditambahkan.");
      onClose();
    } catch (error) {
      console.error("Failed to save meeting", error);
      showError("Gagal!", "Gagal menyimpan dokumentasi rapat. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setFile: React.Dispatch<React.SetStateAction<File | null>>, 
    ref: React.RefObject<HTMLInputElement | null>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) { // 10MB
      showError("Ukuran File Terlalu Besar!", "Ukuran gambar terlalu besar! Maksimal 10MB sebelum dikompres.");
      if (ref.current) ref.current.value = "";
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const removeFile = (
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    previewUrl: string | null,
    ref: React.RefObject<HTMLInputElement | null>
  ) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreview(null);
    if (ref.current) ref.current.value = "";
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Dokumentasi Rapat" : "Tambah Dokumentasi Rapat"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <FormLabel htmlFor="title" required>Judul Rapat</FormLabel>
          <FormInput
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Rapat Koordinasi Agustusan"
          />
        </div>

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
          <FormLabel htmlFor="minutes" required>Deskripsi Notulen</FormLabel>
          <FormTextarea
            id="minutes"
            required
            rows={8}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="Tulis ringkasan atau hasil rapat di sini..."
          />
        </div>

        <div>
          <FormLabel htmlFor="meeting-image">Dokumentasi Rapat (Foto)</FormLabel>
          
          <div className="flex flex-wrap gap-3 mb-3">
            {existingMeetingImageUrl && !meetingImageFile && (
              <div className="relative w-32 h-24 rounded-xl border-2 border-primary-900 shadow-[2px_2px_0_var(--color-primary-900)] overflow-hidden">
                <img src={existingMeetingImageUrl} alt="Preview Rapat" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setExistingMeetingImageUrl("")}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center m-2 shadow-md transition-colors z-20"
                  title="Hapus gambar ini"
                >
                  <X className="text-white" size={14} strokeWidth={3} />
                </button>
              </div>
            )}
            
            {meetingImagePreview && (
              <div className="relative w-32 h-24 rounded-xl border-2 border-accent-green-600 shadow-[2px_2px_0_var(--color-accent-green-600)] overflow-hidden">
                <img src={meetingImagePreview} alt="Preview Baru" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(setMeetingImageFile, setMeetingImagePreview, meetingImagePreview, meetingFileInputRef)}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center m-2 shadow-md transition-colors z-20"
                  title="Batal upload gambar ini"
                >
                  <X className="text-white" size={14} strokeWidth={3} />
                </button>
              </div>
            )}
            
            {!existingMeetingImageUrl && !meetingImagePreview && (
              <label className="w-32 h-24 rounded-xl border-2 border-dashed border-primary-500 bg-primary-50 flex flex-col items-center justify-center cursor-pointer hover:bg-primary-100 hover:border-primary-600 transition-colors">
                <ImageIcon className="text-primary-500 mb-1" size={24} />
                <span className="text-[10px] font-bold text-primary-700">Pilih Foto</span>
                <input
                  id="meeting-image"
                  type="file"
                  accept="image/*"
                  ref={meetingFileInputRef}
                  onChange={(e) => handleFileChange(e, setMeetingImageFile, meetingFileInputRef, setMeetingImagePreview)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div>
          <FormLabel htmlFor="attendance-image">Dokumentasi Absen (Foto)</FormLabel>
          
          <div className="flex flex-wrap gap-3 mb-3">
            {existingAttendanceImageUrl && !attendanceImageFile && (
              <div className="relative w-32 h-24 rounded-xl border-2 border-primary-900 shadow-[2px_2px_0_var(--color-primary-900)] overflow-hidden">
                <img src={existingAttendanceImageUrl} alt="Preview Absen" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setExistingAttendanceImageUrl("")}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center m-2 shadow-md transition-colors z-20"
                  title="Hapus gambar ini"
                >
                  <X className="text-white" size={14} strokeWidth={3} />
                </button>
              </div>
            )}
            
            {attendanceImagePreview && (
              <div className="relative w-32 h-24 rounded-xl border-2 border-accent-green-600 shadow-[2px_2px_0_var(--color-accent-green-600)] overflow-hidden">
                <div className="absolute top-0 left-0 bg-accent-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-md z-10">Baru</div>
                <img src={attendanceImagePreview} alt="Preview Baru" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(setAttendanceImageFile, setAttendanceImagePreview, attendanceImagePreview, attendanceFileInputRef)}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center m-2 shadow-md transition-colors z-20"
                  title="Batal upload gambar ini"
                >
                  <X className="text-white" size={14} strokeWidth={3} />
                </button>
              </div>
            )}
            
            {!existingAttendanceImageUrl && !attendanceImagePreview && (
              <label className="w-32 h-24 rounded-xl border-2 border-dashed border-primary-500 bg-primary-50 flex flex-col items-center justify-center cursor-pointer hover:bg-primary-100 hover:border-primary-600 transition-colors">
                <ImageIcon className="text-primary-500 mb-1" size={24} />
                <span className="text-[10px] font-bold text-primary-700">Pilih Foto</span>
                <input
                  id="attendance-image"
                  type="file"
                  accept="image/*"
                  ref={attendanceFileInputRef}
                  onChange={(e) => handleFileChange(e, setAttendanceImageFile, attendanceFileInputRef, setAttendanceImagePreview)}
                  className="hidden"
                />
              </label>
            )}
          </div>
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
            disabled={isLoading || !title || !date || !minutes}
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
