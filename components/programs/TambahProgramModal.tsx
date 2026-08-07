import React, { useState, useEffect, useRef } from "react";
import { addProgram, updateProgram, uploadMultipleProgramImages, Program } from "@/lib/programs";
import { Button, ModalWrapper, FormLabel, FormInput, FormTextarea } from "@/components/ui";
import { X, Image as ImageIcon } from "lucide-react";
import { showSuccess, showError } from "@/lib/swal";

interface TambahProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Program | null;
}

export default function TambahProgramModal({ isOpen, onClose, initialData }: TambahProgramModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  
  // For new files to be uploaded
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // For previewing new files
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  // Existing image URLs from Firestore
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || "");
        setDate(initialData.date || "");
        setCategory(initialData.category || "");
        setDescription(initialData.description || "");
        setExistingImageUrls(initialData.imageUrls || []);
      } else {
        setTitle("");
        setDate("");
        setCategory("");
        setDescription("");
        setExistingImageUrls([]);
      }
      setImageFiles([]);
      setPreviewUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !category || !description) return;

    setIsLoading(true);
    try {
      let newUploadedUrls: string[] = [];
      if (imageFiles.length > 0) {
        newUploadedUrls = await uploadMultipleProgramImages(imageFiles);
      }
      
      const finalImageUrls = [...existingImageUrls, ...newUploadedUrls];

      if (initialData?.id) {
        await updateProgram(initialData.id, {
          title,
          date,
          category,
          description,
          imageUrls: finalImageUrls,
        });
      } else {
        await addProgram({
          title,
          date,
          category,
          description,
          imageUrls: finalImageUrls,
        });
      }
      
      showSuccess("Berhasil!", initialData?.id ? "Program kerja berhasil diperbarui." : "Program kerja baru berhasil ditambahkan.");
      onClose();
    } catch (error) {
      console.error("Failed to save program", error);
      showError("Gagal!", "Gagal menyimpan program kerja. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Check total size
    const invalidFiles = files.filter(f => f.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      showError("Ukuran Gambar Terlalu Besar!", "Ada gambar yang ukurannya terlalu besar! Maksimal 10MB per gambar.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    
    // Reset input so same files can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeExistingImage = (index: number) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Clean up object URLs when modal unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Program Kerja" : "Tambah Program Kerja"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <FormLabel htmlFor="title" required>Judul Program</FormLabel>
          <FormInput
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Bakti Sosial Bersih Lingkungan"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <FormLabel htmlFor="date" required>Tanggal Pelaksanaan</FormLabel>
            <FormInput
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <FormLabel htmlFor="category" required>Kategori</FormLabel>
            <FormInput
              id="category"
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Contoh: Sosial, Olahraga, Pendidikan"
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              <option value="Sosial" />
              <option value="Olahraga" />
              <option value="Pendidikan" />
              <option value="Budaya" />
              <option value="Hiburan" />
            </datalist>
          </div>
        </div>

        <div>
          <FormLabel htmlFor="description" required>Deskripsi Lengkap</FormLabel>
          <FormTextarea
            id="description"
            required
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan secara detail mengenai program kerja ini..."
          />
        </div>

        <div>
          <FormLabel htmlFor="images">Galeri Dokumentasi (Foto)</FormLabel>
          
          <div className="flex flex-wrap gap-3 mb-3">
            {/* Existing Images */}
            {existingImageUrls.map((url, index) => (
              <div key={`existing-${index}`} className="relative w-24 h-24 rounded-xl border-2 border-primary-900 shadow-[2px_2px_0_var(--color-primary-900)] overflow-hidden">
                <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center m-2 shadow-md transition-colors z-20"
                  title="Hapus gambar ini"
                >
                  <X className="text-white" size={14} strokeWidth={3} />
                </button>
              </div>
            ))}
            
            {/* New Images Preview */}
            {previewUrls.map((url, index) => (
              <div key={`new-${index}`} className="relative w-24 h-24 rounded-xl border-2 border-accent-green-600 shadow-[2px_2px_0_var(--color-accent-green-600)] overflow-hidden">
                <img src={url} alt={`New Preview ${index}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center m-2 shadow-md transition-colors z-20"
                  title="Batal upload gambar ini"
                >
                  <X className="text-white" size={14} strokeWidth={3} />
                </button>
              </div>
            ))}
            
            {/* Add More Button */}
            <label className="w-24 h-24 rounded-xl border-2 border-dashed border-primary-500 bg-primary-50 flex flex-col items-center justify-center cursor-pointer hover:bg-primary-100 hover:border-primary-600 transition-colors">
              <ImageIcon className="text-primary-500 mb-1" size={24} />
              <span className="text-[10px] font-bold text-primary-700">Tambah</span>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          <span className="text-xs font-semibold text-neutral-500 block">Anda dapat mengunggah lebih dari 1 gambar sekaligus (max 10MB per gambar).</span>
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
            disabled={isLoading || !title || !date || !category || !description}
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
