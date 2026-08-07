import React, { useState, useEffect, useRef } from "react";
import { addFinanceTransaction, updateFinanceTransaction, uploadFinanceImage, FinanceTransaction } from "@/lib/finance";
import { Button, ModalWrapper, FormLabel, FormInput, FormTextarea } from "@/components/ui";
import { X, Image as ImageIcon } from "lucide-react";
import { showSuccess, showError } from "@/lib/swal";

interface TambahPengeluaranModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: FinanceTransaction | null;
}

export default function TambahPengeluaranModal({ isOpen, onClose, initialData }: TambahPengeluaranModalProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (initialData && isOpen) {
      setTitle(initialData.title);
      setAmount(initialData.amount.toString());
      setQuantity(initialData.quantity ? initialData.quantity.toString() : "");
      setDescription(initialData.description || "");
      setExistingImageUrl(initialData.imageUrl || "");
    } else if (!isOpen) {
      setTitle("");
      setAmount("");
      setQuantity("");
      setDescription("");
      setExistingImageUrl("");
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    setIsLoading(true);
    try {
      let imageUrl = existingImageUrl;
      if (imageFile) {
        imageUrl = await uploadFinanceImage(imageFile);
      }

      if (initialData?.id) {
        await updateFinanceTransaction(initialData.id, {
          title,
          amount: Number(amount),
          ...(quantity ? { quantity: Number(quantity) } : { quantity: undefined }),
          description,
          imageUrl,
        });
      } else {
        await addFinanceTransaction({
          type: "expense",
          title,
          amount: Number(amount),
          ...(quantity && { quantity: Number(quantity) }),
          description,
          imageUrl,
        });
      }
      
      showSuccess("Berhasil!", initialData?.id ? "Pengeluaran berhasil diperbarui." : "Pengeluaran baru berhasil ditambahkan.");
      onClose();
    } catch (error) {
      console.error("Failed to save expense", error);
      showError("Gagal!", "Gagal menyimpan pengeluaran. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 10 * 1024 * 1024) { // 10MB
      showError("Ukuran Gambar Terlalu Besar!", "Ukuran gambar terlalu besar! Maksimal 10MB sebelum dikompres.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const removeFile = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Pengeluaran" : "Tambah Pengeluaran"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <FormLabel htmlFor="expense-title" required>Judul Pengeluaran</FormLabel>
          <FormInput
            id="expense-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Beli Konsumsi Rapat"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <FormLabel htmlFor="expense-amount" required>Nominal (Rp)</FormLabel>
            <FormInput
              id="expense-amount"
              type="number"
              required
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 150000"
            />
          </div>
          <div>
            <FormLabel htmlFor="expense-quantity">Jumlah (Opsional)</FormLabel>
            <FormInput
              id="expense-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Contoh: 30"
            />
          </div>
        </div>

        <div>
          <FormLabel htmlFor="expense-description">Deskripsi (Opsional)</FormLabel>
          <FormTextarea
            id="expense-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tambahkan detail pengeluaran jika diperlukan..."
          />
        </div>

        <div>
          <FormLabel htmlFor="expense-image">Gambar / Bukti (Opsional)</FormLabel>
          
          <div className="flex flex-wrap gap-3 mb-3">
            {existingImageUrl && !imageFile && (
              <div className="relative w-32 h-24 rounded-xl border-2 border-primary-900 shadow-[2px_2px_0_var(--color-primary-900)] overflow-hidden">
                <img src={existingImageUrl} alt="Preview Bukti" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setExistingImageUrl("")}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center m-2 shadow-md transition-colors z-20"
                  title="Hapus gambar ini"
                >
                  <X className="text-white" size={14} strokeWidth={3} />
                </button>
              </div>
            )}
            
            {imagePreview && (
              <div className="relative w-32 h-24 rounded-xl border-2 border-accent-green-600 shadow-[2px_2px_0_var(--color-accent-green-600)] overflow-hidden">
                <img src={imagePreview} alt="Preview Baru" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full w-6 h-6 flex items-center justify-center m-2 shadow-md transition-colors z-20"
                  title="Batal upload gambar ini"
                >
                  <X className="text-white" size={14} strokeWidth={3} />
                </button>
              </div>
            )}
            
            {!existingImageUrl && !imagePreview && (
              <label className="w-32 h-24 rounded-xl border-2 border-dashed border-primary-500 bg-primary-50 flex flex-col items-center justify-center cursor-pointer hover:bg-primary-100 hover:border-primary-600 transition-colors">
                <ImageIcon className="text-primary-500 mb-1" size={24} />
                <span className="text-[10px] font-bold text-primary-700">Pilih Bukti</span>
                <input
                  id="expense-image"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
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
            variant="danger"
            disabled={isLoading || !title || !amount}
          >
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
