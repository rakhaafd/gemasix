import React, { useState, useEffect, useRef } from "react";
import { uploadHeroImages, uploadSingleHeroImage, addHeroImages, updateHeroImage, HeroImage } from "@/lib/hero";
import { Button, ModalWrapper, FormLabel, FormInput } from "@/components/ui";
import { X, Image as ImageIcon } from "lucide-react";
import { showSuccess, showError } from "@/lib/swal";

interface TambahHeroModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: HeroImage | null;
  nextOrder?: number;
}

export default function TambahHeroModal({
  isOpen,
  onClose,
  initialData,
  nextOrder = 1,
}: TambahHeroModalProps) {
  const [order, setOrder] = useState<number>(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setOrder(initialData.order || 1);
        setExistingImageUrl(initialData.imageUrl || "");
      } else {
        setOrder(nextOrder);
        setExistingImageUrl("");
      }
      setImageFiles([]);
      setPreviewUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [initialData, isOpen, nextOrder]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const invalidFiles = files.filter((f) => f.size > 10 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      showError("Ukuran Gambar Terlalu Besar!", "Ada gambar yang ukurannya terlalu besar! Maksimal 10MB per gambar.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (isEditMode) {
      // In edit mode, only 1 new image is selected to replace the existing image
      const singleFile = files[0];
      const url = URL.createObjectURL(singleFile);
      setImageFiles([singleFile]);
      setPreviewUrls([url]);
    } else {
      const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
      setImageFiles((prev) => [...prev, ...files]);
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEditMode && imageFiles.length === 0) {
      showError("Belum ada gambar!", "Pilih minimal 1 gambar untuk diunggah.");
      return;
    }

    setIsLoading(true);
    try {
      if (isEditMode && initialData?.id) {
        let newImageUrl: string | undefined = undefined;
        if (imageFiles.length > 0) {
          newImageUrl = await uploadSingleHeroImage(imageFiles[0]);
        }

        await updateHeroImage(initialData.id, {
          order,
          imageUrl: newImageUrl,
          oldImageUrl: newImageUrl ? initialData.imageUrl : undefined,
        });

        showSuccess("Berhasil!", "Gambar hero berhasil diperbarui.");
      } else {
        const uploadedUrls = await uploadHeroImages(imageFiles);
        if (uploadedUrls.length === 0) {
          throw new Error("Gagal mengunggah gambar");
        }

        await addHeroImages(uploadedUrls, order);
        showSuccess("Berhasil!", "Gambar hero baru berhasil ditambahkan.");
      }

      onClose();
    } catch (error) {
      console.error("Failed to save hero image", error);
      showError("Gagal!", "Gagal menyimpan gambar hero. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Gambar Hero" : "Tambah Gambar Hero"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <FormLabel htmlFor="hero-order" required>
            Urutan Tampil (Urutan ke-)
          </FormLabel>
          <FormInput
            id="hero-order"
            type="number"
            min={1}
            required
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
            placeholder="Contoh: 1, 2, 3..."
          />
        </div>

        <div>
          <FormLabel htmlFor="hero-images" required={!isEditMode}>
            {isEditMode ? "Ganti Gambar Hero (Opsional)" : "Pilih Gambar Hero"}
          </FormLabel>

          <div className="flex flex-wrap gap-3 mb-3">
            {/* Existing Image (Edit Mode) */}
            {isEditMode && existingImageUrl && previewUrls.length === 0 && (
              <div className="relative w-28 h-28 rounded-xl border-2 border-primary-900 shadow-md overflow-hidden bg-neutral-900">
                <img src={existingImageUrl} alt="Current Hero" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-primary-900/80 text-white text-[10px] font-bold text-center py-0.5">
                  Gambar Saat Ini
                </span>
              </div>
            )}

            {/* New Preview Images */}
            {previewUrls.map((url, index) => (
              <div
                key={`preview-${index}`}
                className="relative w-28 h-28 rounded-xl border-2 border-accent-yellow-500 shadow-md overflow-hidden bg-neutral-900 group"
              >
                <img src={url} alt={`Preview Hero ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-colors z-20"
                  title="Batal pilih gambar ini"
                >
                  <X className="text-white" size={14} strokeWidth={3} />
                </button>
              </div>
            ))}

            <label className="w-28 h-28 rounded-xl border-2 border-dashed border-primary-400 bg-primary-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-primary-100/50 hover:border-primary-600 transition-colors">
              <ImageIcon className="text-primary-600 mb-1" size={24} />
              <span className="text-xs font-bold text-primary-800">
                {isEditMode ? "Ganti Foto" : "Pilih Foto"}
              </span>
              <input
                id="hero-images"
                type="file"
                accept="image/*"
                multiple={!isEditMode}
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
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
            disabled={isLoading || (!isEditMode && imageFiles.length === 0)}
          >
            {isLoading ? "Menyimpan..." : "Simpan Gambar"}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
